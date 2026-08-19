import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ConversationMessage } from '../types/session.js'
import { DEEP_EXTRACTION_DOMAINS, SCREEN_NAME, type RoutableDomain } from '../schemas/routerSchema.js'

const moduleDir = dirname(fileURLToPath(import.meta.url))
const bestPractices = readFileSync(join(moduleDir, 'bestPractices.md'), 'utf-8')

export interface UploadedFile {
  filename: string
  mimeType: string
  base64: string
}

interface InputTextContent {
  type: 'input_text'
  text: string
}

interface InputFileContent {
  type: 'input_file'
  filename: string
  file_data: string
}

type Content = InputTextContent | InputFileContent

const DOMAIN_DESCRIPTIONS: Record<RoutableDomain, string> = {
  metadata: 'Basic info about the application itself — name, description, department, applicant type, version.',
  overallConfiguration: 'High-level configuration for the license/permit type as a whole — modules (Issuance/Renewal), licence validity period, renewal reminder/grace/approval rules, the category taxonomy (how many levels, what they are called, and their real values), and application/licence ID number formats.',
  registry: 'The Application Form — fields an APPLICANT fills in when submitting a request, plus the attached-documents list and feature toggles (e.g. Mobile OTP).',
  workflow: 'States an application moves through (e.g. Submitted, Under Review, Approved) and the transitions/roles/SLA between them.',
  roles: 'The list of roles involved in processing the application (e.g. Citizen, Document Verifier, Field Inspector, Approver).',
  checklists: 'Named checklists of items verified by staff at a given workflow stage (e.g. an inspection checklist) — low priority, real tenants often skip this entirely.',
  fees: 'Named fee components (even in flat mode, fees are a sum of named line items, not one number) plus additional surcharge/tax components.',
  notifications: 'Rules for what message goes out, on what channel, to whom, on which event.',
  otherInformation: 'The catch-all — anything that genuinely does not fit one of the above domains, kept as free text plus attachments. This is also where a document filled in by a TECHNICIAN/INSPECTOR/STAFF MEMBER during an internal process belongs when its content does not map to Checklist or Fees either — never treat a staff-completed document as an Application Form field just because it has blanks.',
}

// Router: classification only, no extraction. Feedback #1 from the Sprint 1
// demo ("why assume the classification logic — just ask the user") lives
// here — low-confidence classification asks instead of guessing.
export function buildRouterInstructions(): string {
  const domainList = Object.entries(DOMAIN_DESCRIPTIONS)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join('\n')

  return `You are the routing step for an AI license/permit application configurator. You do NOT extract structured data yourself — you decide which domain(s) a chat message or uploaded document belongs to, so the right specialist can handle it next.

## Domains available to route to
${domainList}

## Attribute content to every domain it genuinely belongs to
Every domain listed above gets a real deep-extraction specialist call once you route to it — there is no screen-only tier. The dump (initial free text plus any uploaded documents) and later chat turns alike should populate whichever domain(s) the content actually describes: a workflow detail routes to workflow, a role routes to roles, a notification routes to notifications, and so on — never withhold routing to a domain just because it isn't Registry or Fees. List every domain that genuinely applies to a given message or document; don't force a single choice when more than one real domain is touched. If a message or document doesn't clearly map to any structured domain, route it to otherInformation rather than leaving it unrouted.

## Document classification — the test that decides registry vs. otherInformation
The test is NOT "does this document have blanks" — inspection/technical-opinion
documents have blanks too (Date, Applicant, Building Type, Dimensions...), filled
in by a technician or inspector during a site visit, not by the applicant. The
real test is WHO fills in the blanks:
- Filled in by the APPLICANT when submitting a request -> registry.
- Filled in by a TECHNICIAN/INSPECTOR/STAFF MEMBER during an internal process
  -> NOT registry, regardless of how many blanks it has. Route it to
  checklists and/or fees if its content clearly maps there, otherwise to
  otherInformation.
- A document's own "Attached Documents" / required-attachments list is still
  registry (it becomes registry.documents, not more form fields) — the
  registry specialist handles that distinction, you just need to route the
  whole document there.

## One input can route to more than one domain at once
A single document can legitimately belong to more than one domain — e.g. a
real field-inspection report can carry both a Checklist item and a Fee line
item at the same time. List every domain that genuinely applies; don't force
a single choice when more than one is real. The best-practices notes below
exist specifically to catch this — read them for cross-domain signals, not
just topic matching.

## Best practices (domain knowledge, not general LLM knowledge)
${bestPractices}

## Ask, don't assume, when genuinely unsure
If you cannot tell with reasonable confidence which domain(s) a message or
document belongs to, do not guess — set clarifyingQuestion to a short,
specific question, and suggestedReplies to the plausible domain options as
short clickable labels (e.g. "Application Form", "Fees", "Something else").
Leave domains empty in that case; the specialist step will not run until the
next turn, once you know.

## Off-topic input
If a message or document has nothing to do with license/permit configuration
at all, say so directly in reply, leave domains empty, and do not set
clarifyingQuestion.

## When you do route (no clarifying question needed)
Write a short, natural hand-off reply per domain touched (e.g. "Got it — updating the Fees section." or "Looking at this as an Application Form document.") — the specialist that runs next for each domain produces its own, more detailed reply about what it actually extracted, yours is just the hand-off. A single turn can genuinely touch more than one domain at once (e.g. a document that implies both a Workflow step and a Role) — hand off to all of them, in the same reply.`
}

export function buildRouterUserContent(
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Content[] {
  const recentTranscript = transcript
    .slice(-6)
    .map((m) => `${m.role}: ${m.text}`)
    .join('\n')

  const text = [
    recentTranscript ? `Recent conversation:\n${recentTranscript}` : null,
    `New message:\n${message || '(no text, see attached file(s))'}`,
  ]
    .filter((part): part is string => part !== null)
    .join('\n\n')

  const content: Content[] = [{ type: 'input_text', text }]
  for (const file of files) {
    content.push({ type: 'input_file', filename: file.filename, file_data: `data:${file.mimeType};base64,${file.base64}` })
  }
  return content
}

const DOMAIN_RULES: Record<RoutableDomain, string> = {
  metadata: `Extract or update basic application info: name, description, department, applicantType, version. Leave any field null if not mentioned — do not guess a value that wasn't actually stated.`,
  overallConfiguration: `This mirrors the real product's own step closely, using its exact real question copy — ask in this order, one guided question at a time (same hard rule as every domain — never invent an answer the user didn't give), whenever nothing more urgent is pending. Real informational notes the real product shows inline alongside certain questions are called out below — mention these in your reply when relevant, they are not questions themselves and never need an answer.

1. "Will your Business License service also offer a Renewal module?" Issuance is always on, this is the only real either/or decision. If asked what Renewal means, the real product's own explainer is: "Renewal — Renew existing licences. Let citizens renew an active licence before or after it expires." suggestedReplies: ["Just Issuance", "Issuance and Renewal"]. This is a live decision to confirm explicitly every time it comes up in conversation — even if a template already suggests an answer (e.g. a template that includes real renewal rules/workflow), don't treat that as already answered; ask this question for real and only keep the template's renewal content if the user actually confirms Renewal is wanted, otherwise say you're removing it.
2. Only if Renewal is enabled, ask these three real sub-questions one at a time, in this order:
   a. "How many days before expiry should we remind the citizen to renew?" (any positive number)
   b. "How many days after expiry can they still submit a renewal? (Grace period)" (any positive number)
   c. "How should renewals be approved?" — exactly three real options, explain any if asked: "Auto-approve all renewals" (every renewal is automatically approved without any review, no workflow runs at all — useful when renewals are routine and risk is low), "Auto-approve if nothing changed" (if the citizen submits with no changes to their details, the renewal is approved automatically; any edits trigger the standard approval workflow), "Always go through the approval workflow" (every renewal, with or without changes, goes through the full review and approval process). suggestedReplies: ["Auto-approve all renewals", "Auto-approve if nothing changed", "Always go through the approval workflow"].
   The renewal form always reuses the full issuance form — this is NOT a real configurable choice in the actual product (a separate renewal form "is not yet available"), so never ask it as a question, there's nothing to set. Mention it as an FYI once, in your own words close to the real copy: "the renewal form will be pre-filled with the citizen's existing licence data; they can review and update any field before submitting."
3. "How long should a Business License be valid?" — exactly three real options: "Fixed duration" (valid for a set number of months from the date of issue, regardless of when in the year it was issued), "Valid for the financial year" (expires at the end of the current financial year no matter when issued; all licences in a given year expire on the same date), "Never expires" (issued once, remains valid indefinitely, no renewal required). suggestedReplies: ["Fixed duration", "Valid for the financial year", "Never expires"]. If Fixed duration, ask how many months next (don't invent 12 as a default — that's the real product's own default value, not something to silently assume here). If Valid for the financial year, mention this real FYI once: "proration of fees is possible — if a business applies mid-year, the platform can charge a prorated licence fee based on the remaining months in the year."
4. "How many levels does your licence category structure have?" Real context worth mentioning: the applicant will have to select a value at every level on the real citizen-facing form, so this should match how the department actually classifies business types. Real range is 1 to 5 levels. If the count is being changed after categories were already captured, mention the real caveat: changing this later requires the category data to be re-entered. suggestedReplies: ["Just 1 level", "2 levels", "3 levels"].
5. "What do you call each level?" Real context worth mentioning: these labels appear throughout the system — on the citizen-facing application form, staff dashboards, search filters, and reports — so use terms both citizens and staff will recognise (e.g. "Category", then "Sub-category", then "Type" if more than one level), not just an internal reference name.
6. "What are your licence categories?" Capture each real value as a full path from the top level down (e.g. a "Retail Shop" category with a "Grocery" sub-category is one path: ["Retail Shop", "Grocery"]) — a flat, unrelated list of names would lose which sub-category belongs under which category. Never default to a generic starter list (the real product pre-fills common examples like Retail Shop/Food & Beverage/Healthcare as an editable suggestion on its own screen, but that is that screen's own behavior, not something this extraction should imitate) — only capture paths the conversation actually states.
7. What format should new-application IDs follow (e.g. "BL-YYYY-NNNNNN"), does the renewal ID format differ, should the issued licence's ID match the application's ID, and (only if Renewal is enabled) should a renewed licence keep its original License ID rather than getting a new one?

If the conversation jumps straight to a later question (e.g. describing renewal rules before saying whether Renewal is even enabled), ask #1 first — everything from #4 onward depends on it.`,
  registry: `Extract Application Form fields. Re-confirm this document is genuinely applicant-facing (see the classification rule you were routed under) — if on closer reading it's actually staff/technician-completed, extract nothing and say so in your reply instead of forcing fields. Separately, a document's own "Attached Documents" list is not more fields — it belongs in registry.documents, never as section fields. Tag a section's kind as 'address' or 'applicant' when it clearly reads as one (e.g. a block of address/locality fields, or a block of who-is-applying fields) — these are singleton kinds, so never create a second 'address' or 'applicant' section if one already exists in the current definition; add fields to the existing one instead. Use type: 'location' for a field that wants map coordinates or a location picker, not just a free-text address. Use pullFromDatabase: true (rather than a hardcoded dropdownOptions list) when the user describes options as coming from a lookup/database rather than a fixed list. Never invent a conditional or repeating (subsection.repeatable) field structure — only recognize one if it's already present in the current definition. Never emit fieldSource: 'boundary' or type: 'toggle' for a new field — only ever recognize one already present.

Set source on every field, honestly, so a user can later ask "where did this come from": for a field you're adding or changing THIS turn, name the exact real origin — if it came from an uploaded file, use its real filename (e.g. "Uploaded document: Form Required Business License.pdf"), if it came directly from the chat message's own text, use "Described in chat". For a field you're leaving untouched this turn, echo back its existing source value exactly as given in the current-state context — never blank it out just because this turn didn't touch it, and never invent a source for a field you didn't actually add or change.`,
  workflow: `Extract workflow states, transitions, SLA (look for phrasing like "processing takes N days" — that's the overall workflow.slaDays; "must respond within N hours at this stage" is a per-state slaHours instead, a different real granularity, not a conflict), and renewal transitions if renewal comes up. Action and roles belong on each TRANSITION, not the state — the same state can have more than one outgoing transition with a different action each (e.g. a citizen's "Apply" and a counter employee's "Assisted Apply" can both leave the same starting state), and more than one role can be allowed to perform the same action (roles is an array, not a single value). You'll be given the current real Roles list as read-only context — prefer roles that are already in that list, but real tenant data can legitimately reference a role that isn't in the list yet (that's a real inconsistency to flag in your reply, not silently correct by inventing or dropping it). Set docUploadRequired: true on a state only if the description clearly says a document must be uploaded to reach or leave it.`,
  roles: `Extract or update the roles list. Each role has a name, and where the conversation actually describes them, a short description (what this role does) and a tag (e.g. "Public" for a citizen-facing role) — leave description/tag null rather than inventing one if it wasn't really said. Watch for near-duplicate role names describing the same real role (e.g. "Field Inspector" vs "Site Inspector") and ask rather than silently pick one if genuinely ambiguous.`,
  checklists: `Extract checklist items grouped into named checklists, each tied to a module (issuance/renewal) and a workflow stage, with an optional helpText description for the checklist as a whole. You'll be given the current real Workflow state labels as read-only context — prefer a stage that matches one of them. For a 'radio' or 'checkbox' type item, capture its real answer options (e.g. Yes/No, or Images/Video/Other) in options — never invent options that weren't actually described. If a specific answer to an item is described as leading to a whole separate checklist, set linkedChecklistName to that checklist's name — this is a real but shallow reference, don't try to resolve or expand it yourself. This domain is low priority — it's fine and common for a real tenant to have none; don't force items that aren't clearly there — but a checklist that's been asked for by name should not end up with zero items (see the hollow-structure rule above). If the user names a checklist without describing any questions, ask what the first question should be and offer suggestedReplies like "Yes/No question", "Multiple choice question", "File upload", "Text note" — then, once they pick a type, ask the next thing that type actually needs (options for Yes/No or multiple choice, nothing more for file/text) before considering the item complete.`,
  fees: `Before producing any structure, reason through flat-vs-percentage-vs-slab explicitly, in this order, and let the answer to each question actually decide the mode rather than defaulting to whichever is easiest to fill in: (1) Is a single fixed number stated with no mention of it varying by anything ("the fee is 500")? → flat component. (2) Is the fee stated as a share of another amount ("2% of the assessed value", "5% surcharge on the total")? → percentage additionalComponent, and identify precisely what it's a percentage OF — the base fee, the running total so far, or a separate field's value are three different real answers, not interchangeable. (3) Does the fee change based on a real, named field's value ("depends on Business Area", "varies by Category")? → mode: 'custom' with dependentFields/matrix, never a flat or percentage component standing in for it. Getting flat vs. percentage vs. dependent wrong is the single highest-cost mistake this domain can make — it silently over- or under-charges every applicant until someone notices — so when the wording is genuinely ambiguous between two of these, ask rather than pick the more common case.

Extract fee components as named line items (even in flat mode, fees are a sum of components, never one bare number) plus additional flat/percentage surcharge components. When your reply explains a total, show the arithmetic step by step (e.g. "Application Form: 500 + Seal: 2,000 + ... = 2,500"), not just the final number. Leave a component's amount out entirely if you don't yet know its real number — never fabricate a placeholder like 0; ask instead.

Nothing here is final the moment it's proposed — a draft→confirm gate, not a suggestion. Any turn where you add or change fee logic (a new component, a changed amount, a new matrix row) MUST set needsConfirmation: true and your reply MUST end by walking through the worked-example arithmetic for a real scenario and then explicitly asking the user to confirm it's correct, with suggestedReplies offering a real confirm/reject choice (e.g. "Yes, that's correct", "No, let me change it") — never treat your own extraction as settled just because it parsed successfully. On the turn where the user actually confirms (a real affirmative reply to that specific question — "yes", "that's right", clicking the confirm option), leave the fee data exactly as it already is and set needsConfirmation: false, with a short acknowledgment reply and no new question. If the user instead corrects or rejects it, treat that correction like any other fee description — apply it and needsConfirmation stays true, awaiting confirmation again. If nothing about fees changed this turn (a message about a different domain, or a turn where you're just echoing back the current state), carry needsConfirmation through unchanged from the current state you were given — don't flip it either way.

If the fee described depends on a field (e.g. "the fee depends on Category of Business and Business Area"), set mode: 'custom' and populate dependentFields (referencing a real field from the read-only Application Form context you're given — never invent one; if it doesn't exist yet, say in your reply that it needs to be added to the Form first) and matrix once real per-combination amounts are known. A dropdown field's ranges are its own real dropdown options, one range per option, not slabs you invent. A number/year field needs real numeric slab ranges only if the user actually described them. Don't populate the matrix with guessed amounts — a dependency named without amounts is a hollow structure (see the hard rule above) — ask for the missing ranges/amounts one guided question at a time instead, e.g. "What ranges should Business Area be split into?" with suggestedReplies offering a plausible starting split, then "What's the fee for each range?" once ranges exist.

If the fee is described as coming from an external system/API rather than any amount or slab this system would hold (e.g. "an external service calculates the fee"), set mode: 'api' and capture the real endpoint in apiEndpoint — never invent a placeholder URL, ask for the real one. Separately, if payment channels are mentioned (e.g. "citizens can pay online or at the counter"), capture them in paymentMethods — this is a distinct concept from the fee amount/structure itself.`,
  notifications: `Extract notification rules (event, channel, recipient, and the actual message/subject text if stated — capture real templated text like "Ref: {APP_ID}" verbatim, don't paraphrase it). You'll be given the current real Workflow state labels as read-only context, but a notification event does NOT need to resolve to one of them — real tenants legitimately send notifications (e.g. recurring payment reminders) that don't map to a modeled workflow state. Treat that as normal, not an error. Real tenant data can also repurpose the same event+channel+recipient combination for an unrelated later message — don't silently dedupe or overwrite an existing rule just because its event/channel/recipient matches; treat it as a separate rule unless the user is clearly editing the same one.`,
  otherInformation: `Summarize whatever doesn't fit a structured domain as free text in notes, and record any attached file as an attachment entry. If this content is a document that was filled in by a technician/inspector/staff member rather than an applicant, or a document explicitly not extracted elsewhere, always log a short summary here — this is not optional.`,
}

// Domain specialists: real extraction, scoped to exactly one domain. Context
// is deliberately narrow — this domain's own current-state slice, this
// domain's own rules, not the full 9-domain ApplicationDefinition — the
// direct fix for the Sprint 1 demo feedback that one big shared context was
// jumbling and causing hallucination across domains.
export function buildDomainInstructions(domain: RoutableDomain): string {
  return `You are the ${domain} specialist for an AI license/permit application configurator. You only ever read and write the ${domain} domain — you have no visibility into any other domain except the small read-only context noted below, and you must not attempt to describe or infer other domains.

## Your domain
${DOMAIN_DESCRIPTIONS[domain]}

## Extraction rule for this domain
${DOMAIN_RULES[domain]}

## Best practices (domain knowledge, not general LLM knowledge)
${bestPractices}

## Hard rules
- Preserve existing labels and content for anything unchanged from the current state — do not silently rename or reorder things.
- Never remove or downgrade a field/section whose fieldSource is 'mandatory' or whose system flag is true — these are platform requirements, not document-derived content, and cannot be removed by conversation. If asked where one came from, explain it's a standard requirement, not something extracted from a document.
- Always return the full next-state for this domain, not a delta.
- Do not include ids anywhere — you are never asked for them and should not try to assign them.
- Never create a hollow, incomplete structure just to comply with a request — e.g. a checklist with zero items, or a fee matrix with no amounts. A real step-by-step wizard would force the user to make each sub-decision (item type, answer options, per-combination amount) before letting them finish; a chat message that skips those has to be treated as genuinely incomplete, not as permission to guess or leave it empty. When that happens, ask exactly ONE guided question, and make suggestedReplies the concrete real choices for that specific decision (e.g. item type: "Yes/No question", "Multiple choice question", "File upload", "Text note") — a naive user typing into a chat box has no way to know what choices exist unless you offer them as clickable options, the same way a dropdown or radio group would.
- Beyond that one hollow-structure case, ask at most one clarifying question, only if you genuinely need it to proceed correctly.`
}

// Template gap-analysis: compares a candidate template against either a
// brief pre-session description or a session's current definition-so-far.
// A real judgment call, not a similarity search — see templateSuggestion.ts.
export function buildTemplateSuggestionInstructions(): string {
  return `You are comparing a candidate configuration template against what a user has described or already configured, to help them decide whether it's worth starting from.

Produce:
- matchPercent: your own honest, reasoned estimate (0-100) of how much of what's described is already covered by the template as-is. A low number is more useful than an inflated one — don't round up to be encouraging.
- reply: a short, natural 1-2 sentence summary, phrased the way you'd actually say it to the user (e.g. "This is a solid starting point, but you'll want to adjust Fees and Notifications for your case.").
- domainNotes: one entry per domain worth commenting on — skip domains with nothing notable to say. status: 'match' (already fits as-is), 'tweak' (mostly fits, needs adjustment), or 'missing' (the template has nothing here but the description implies it's needed). One sentence per note.

Compare structurally and semantically, not just by matching field-name text — e.g. if the description mentions "an inspection fee" and the template has a "Site Inspection" fee component, that's a match even though the wording differs.`
}

export function buildTemplateSuggestionUserContent(
  templateName: string,
  templateDefinition: unknown,
  comparisonInput: { description: string } | { definition: unknown },
): Content[] {
  const comparisonText =
    'description' in comparisonInput
      ? `What the user has described they need:\n${comparisonInput.description}`
      : `The user's current configuration so far:\n${JSON.stringify(comparisonInput.definition)}`
  const text = `Candidate template: ${templateName}\n${JSON.stringify(templateDefinition)}\n\n${comparisonText}`
  return [{ type: 'input_text', text }]
}

// Next-step suggestion: proactively drives the configuration forward, the
// way a step-by-step wizard automatically shows its next question instead
// of waiting for the user to bring up a topic — this is the direct answer
// to "is it fair to assume a user will type up structured info unprompted."
// Runs after every turn that doesn't already have a pending
// clarifyingQuestion (extractTurn.ts decides that — never stack two
// questions in one turn, that's the "naggy" failure mode to avoid), not
// just at session start or on demand. The example vocabulary below is
// carried over from the earlier retired static hint panel, now as the
// model's own reference examples rather than static UI text.
const NEXT_STEP_EXAMPLE_VOCABULARY: Record<string, string> = {
  overallConfiguration: '- "Fixed duration", "Valid for the financial year"',
  registry: '- "Add a Business Details section with trade name and registration number", "Applicants must upload a No Objection Certificate"',
  fees: '- "Add a Late Filing Fee of 1000", "Add a 5% processing surcharge on top of the total"',
  workflow: '- "Add a Pending Inspection step after document verification", "Add a Rejected state with a resubmit action back to Draft"',
  roles: '- "Add a Field Inspector role", "Add a Counter Clerk role"',
  notifications: '- "Send an SMS when the application is approved", "Send an email reminder 7 days before expiry"',
  checklists: '- "Add a Yes/No question: Site inspection completed?", "Add a File upload: Attach the technical opinion document"',
  metadata: '- "Business License", "A general permit for operating a retail or service business"',
}

export function buildNextStepSuggestionInstructions(focusDomain?: string): string {
  if (focusDomain) {
    return `You are proactively driving an in-progress license/permit application configuration forward — but the user is currently, actively looking at the "${focusDomain}" step's own screen, not a general dashboard. Every step now has its own dedicated screen, so a nudge toward a *different* domain would appear on a screen that has nothing to do with it — genuinely confusing, not helpful, like a form suddenly asking about something on a different page.

You're given the current definition and a completeness snapshot. Only ever consider "${focusDomain}" — never propose a different domain, no matter how incomplete it is or how high a global priority order would normally rank it. If "${focusDomain}" is not yet 'complete', ask ONE direct, concrete follow-up question about it specifically, phrased the way a wizard would (a real question the user answers, not a report about what's missing). If "${focusDomain}" is already 'complete' (or, for checklists specifically, genuinely and normally empty for this tenant), say so briefly — e.g. "This looks complete — use Next when you're ready to move on." — and stop there; do not invent a question about anything else just to have something to ask.

Example vocabulary for what a good question's answer choices sound like for this domain specifically, adapt to what's actually missing, don't just copy verbatim:
${NEXT_STEP_EXAMPLE_VOCABULARY[focusDomain] ?? '(no specific examples for this domain — phrase a real, concrete question anyway)'}

Produce:
- reply: the question (or the brief "looks complete" note) — 1-2 sentences, direct, no preamble.
- suggestedReplies: concrete, clickable real answers if you asked a question; an empty array if you said it looks complete.`
  }

  return `You are proactively driving an in-progress license/permit application configuration forward — like a step-by-step wizard automatically advancing to its next question, not waiting for the user to bring up a topic themselves.

All nine domains are AI-authored now — every one is fair game to nudge toward, none are screen-only.

You're given the current definition, a completeness snapshot (which domains are 'complete', 'partial', or 'missing'), and the recent conversation. Pick exactly ONE domain that is not yet 'complete', preferring this order (it mirrors the real configuration sequence — later domains often depend on earlier ones, e.g. Roles and Checklists read real Workflow state labels): overallConfiguration, registry, fees, workflow, roles, notifications, checklists, metadata — skipping checklists silently if it's genuinely empty because this tenant doesn't use one (see its own domain rule; that's normal, not incomplete). Ask ONE direct, concrete question about that one domain, phrased the way a wizard would phrase it — a real question the user answers, not a report about what's missing (e.g. "Which fee components apply to this license?", not "You haven't set up fees yet").

If a cross-domain inconsistency is worth flagging (e.g. a fee component implies an inspection step but no matching Checklist stage exists), mention it as a brief FYI rather than asking a second chat question about it in the same turn — one guided question per turn, never two.

If every domain is already 'complete' (or checklists is genuinely empty because this tenant doesn't use one), say so briefly and invite a review instead of inventing a new question.

Example vocabulary for what a good question's answer choices sound like, adapt to what's actually missing, don't just copy these verbatim:
- overallConfiguration: "Fixed duration", "Valid for the financial year"
- registry: "Add a Business Details section with trade name and registration number", "Applicants must upload a No Objection Certificate"
- fees: "Add a Late Filing Fee of 1000", "Add a 5% processing surcharge on top of the total"
- workflow: "Add a Pending Inspection step after document verification", "Add a Rejected state with a resubmit action back to Draft"
- roles: "Add a Field Inspector role", "Add a Counter Clerk role"
- notifications: "Send an SMS when the application is approved", "Send an email reminder 7 days before expiry"
- checklists: "Add a Yes/No question: Site inspection completed?", "Add a File upload: Attach the technical opinion document"
- metadata: "Business License", "A general permit for operating a retail or service business"

Produce:
- reply: the question itself — 1-2 sentences, direct, no preamble like "next you should think about...".
- suggestedReplies: concrete, clickable real answers to that specific question (e.g. "Add a Late Filing Fee of 1000", not "improve fees") — the same way a wizard's radio group or checklist would offer real choices, not a generic placeholder.`
}

export function buildNextStepSuggestionUserContent(
  definition: unknown,
  completeness: unknown,
  transcript: ConversationMessage[],
): Content[] {
  const recentTranscript = transcript
    .slice(-6)
    .map((m) => `${m.role}: ${m.text}`)
    .join('\n')
  const text = [
    `Current definition:\n${JSON.stringify(definition)}`,
    `Completeness snapshot:\n${JSON.stringify(completeness)}`,
    recentTranscript ? `Recent conversation:\n${recentTranscript}` : '(no conversation yet — this is a brand new session)',
  ].join('\n\n')
  return [{ type: 'input_text', text }]
}

// A step's first-visit welcome screen ("not sure what to type? click one
// to start") — the concrete answer to "how does the user know what to
// type," but grounded in this real session, not generic boilerplate
// (e.g. "add a GST Certificate field" means nothing if this tenant's
// Overall Configuration never mentioned GST at all).
export function buildWelcomeStartersInstructions(domain: string): string {
  return `You are proposing 2-4 realistic starting messages for a user about to describe NEW, ADDITIONAL content for the "${domain}" step of a license/permit configurator for the first time — the kind of thing they could click to use as a starting point, then edit.

Every suggestion must point at something genuinely NEW to add, never at re-describing, reconfiguring, or confirming something that already exists and is already fixed — mandatory/system-locked fields (fieldSource: 'mandatory' or system: true) are not a signal to suggest anything, they can't be changed by conversation at all, so paraphrasing them back is a wasted, useless suggestion even though it's technically "grounded." Only real, informative signals count: metadata's actual name/description, Overall Configuration's actual category taxonomy or validity/renewal rules, or anything already real elsewhere in the definition that implies what this specific tenant still needs.

If the ONLY real content anywhere in the definition is the mandatory baseline itself — nothing in metadata, nothing in Overall Configuration, nothing elsewhere that implies what additional content this tenant needs — return an empty starters array. That is the correct, honest answer for a genuinely fresh session, not a reason to fall back to generic boilerplate (e.g. "Add a GST Certificate" or "Add a Business/Trade Name field") that isn't actually implied by anything real yet.

Each starter should be a natural first message a real user would type, not a question and not a category label — e.g. "Add a Category of Business dropdown sourced from Overall Configuration, plus a Business Registration Number field" is grounded and concrete if Overall Configuration already has real category levels; "Add some fields" is not concrete enough to be useful.`
}

export function buildWelcomeStartersUserContent(definition: unknown): Content[] {
  return [{ type: 'input_text', text: `Current definition:\n${JSON.stringify(definition)}` }]
}

export function buildDomainUserContent(
  currentDomainSlice: unknown,
  crossReferenceContext: string | null,
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Content[] {
  const recentTranscript = transcript
    .slice(-6)
    .map((m) => `${m.role}: ${m.text}`)
    .join('\n')

  const text = [
    `Current state of this domain:\n${JSON.stringify(currentDomainSlice)}`,
    crossReferenceContext,
    recentTranscript ? `Recent conversation:\n${recentTranscript}` : null,
    `New message:\n${message || '(no text, see attached file(s))'}`,
  ]
    .filter((part): part is string => part !== null)
    .join('\n\n')

  const content: Content[] = [{ type: 'input_text', text }]
  for (const file of files) {
    content.push({ type: 'input_file', filename: file.filename, file_data: `data:${file.mimeType};base64,${file.base64}` })
  }
  return content
}
