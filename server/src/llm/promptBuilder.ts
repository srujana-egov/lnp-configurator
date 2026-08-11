import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ConversationMessage } from '../types/session.js'
import type { RoutableDomain } from '../schemas/routerSchema.js'

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

  return `You are the routing step for an AI license/permit application configurator. You do NOT extract structured data — you only decide which domain(s) a chat message or uploaded document belongs to, so the right specialist can handle it next.

## Domains available to route to
${domainList}

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
Write a short, natural reply acknowledging what you're about to do (e.g.
"Got it — updating the Fees section." or "Looking at this as an Application
Form document."). The specialist(s) you route to will produce their own,
more detailed reply about what they actually extracted; yours is just the
hand-off.`
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
  overallConfiguration: `This mirrors the real product's own step closely — ask in this order, one guided question at a time (same hard rule as every domain — never invent an answer the user didn't give), whenever nothing more urgent is pending:

1. Which modules does this service offer? Issuance is always on — only ask about Renewal. suggestedReplies: ["Just Issuance", "Issuance and Renewal"].
2. How long should the licence stay valid — a fixed number of months, until the end of the financial year, or never expiring? suggestedReplies: ["A fixed number of months", "Until the end of the financial year", "It never expires"]. If fixed, ask how many months next (don't invent 12 as a default — that's the real product's own default value, not something to silently assume here).
3. Can applicants apply for past years, not just the current one? If yes, how many past years (1-5)? suggestedReplies: ["Current year only", "Allow past years too"].
4. Only if Renewal is enabled: how many days before expiry should a reminder go out, how many days of grace period after expiry, how should renewals be approved, and should the renewal form reuse the full issuance form or have its own independent fields? suggestedReplies for approval: ["Auto-approve every renewal", "Auto-approve only if nothing changed", "Always send renewals through the approval workflow"]; suggestedReplies for the form question: ["Same as the issuance form", "A separate renewal form"].
5. How many levels does the category structure have (real range: 1 to 5)? suggestedReplies: ["Just 1 level", "2 levels", "3 levels"].
6. What should each level be called (e.g. "Category", then "Sub-category", then "Type" if more than one level)?
7. What are the real category values? Capture each as a full path from the top level down (e.g. a "Retail Shop" category with a "Grocery" sub-category is one path: ["Retail Shop", "Grocery"]) — a flat, unrelated list of names would lose which sub-category belongs under which category. Never default to a generic starter list (the real product pre-fills common examples like Retail Shop/Food & Beverage/Healthcare, but that is the real product's own behavior, not something this extraction should imitate) — only capture paths the conversation actually states.
8. What format should new-application IDs follow (e.g. "BL-YYYY-NNNNNN"), does the renewal ID format differ, should the issued licence's ID match the application's ID, and (only if Renewal is enabled) should a renewed licence keep its original License ID rather than getting a new one?

If the conversation jumps straight to a later question (e.g. describing renewal rules before saying whether Renewal is even enabled), ask #1 first — everything from #4 onward depends on it.`,
  registry: `Extract Application Form fields. Re-confirm this document is genuinely applicant-facing (see the classification rule you were routed under) — if on closer reading it's actually staff/technician-completed, extract nothing and say so in your reply instead of forcing fields. Separately, a document's own "Attached Documents" list is not more fields — it belongs in registry.documents, never as section fields. Tag a section's kind as 'address' or 'applicant' when it clearly reads as one (e.g. a block of address/locality fields, or a block of who-is-applying fields) — these are singleton kinds, so never create a second 'address' or 'applicant' section if one already exists in the current definition; add fields to the existing one instead. Use type: 'location' for a field that wants map coordinates or a location picker, not just a free-text address. Use pullFromDatabase: true (rather than a hardcoded dropdownOptions list) when the user describes options as coming from a lookup/database rather than a fixed list. Never invent a conditional or repeating (subsection.repeatable) field structure — only recognize one if it's already present in the current definition. Never emit fieldSource: 'boundary' or type: 'toggle' for a new field — only ever recognize one already present.`,
  workflow: `Extract workflow states, transitions, SLA (look for phrasing like "processing takes N days" — that's the overall workflow.slaDays; "must respond within N hours at this stage" is a per-state slaHours instead, a different real granularity, not a conflict), and renewal transitions if renewal comes up. Action and roles belong on each TRANSITION, not the state — the same state can have more than one outgoing transition with a different action each (e.g. a citizen's "Apply" and a counter employee's "Assisted Apply" can both leave the same starting state), and more than one role can be allowed to perform the same action (roles is an array, not a single value). You'll be given the current real Roles list as read-only context — prefer roles that are already in that list, but real tenant data can legitimately reference a role that isn't in the list yet (that's a real inconsistency to flag in your reply, not silently correct by inventing or dropping it). Set docUploadRequired: true on a state only if the description clearly says a document must be uploaded to reach or leave it.`,
  roles: `Extract or update the roles list. Each role has a name, and where the conversation actually describes them, a short description (what this role does) and a tag (e.g. "Public" for a citizen-facing role) — leave description/tag null rather than inventing one if it wasn't really said. Watch for near-duplicate role names describing the same real role (e.g. "Field Inspector" vs "Site Inspector") and ask rather than silently pick one if genuinely ambiguous.`,
  checklists: `Extract checklist items grouped into named checklists, each tied to a module (issuance/renewal) and a workflow stage, with an optional helpText description for the checklist as a whole. You'll be given the current real Workflow state labels as read-only context — prefer a stage that matches one of them. For a 'radio' or 'checkbox' type item, capture its real answer options (e.g. Yes/No, or Images/Video/Other) in options — never invent options that weren't actually described. If a specific answer to an item is described as leading to a whole separate checklist, set linkedChecklistName to that checklist's name — this is a real but shallow reference, don't try to resolve or expand it yourself. This domain is low priority — it's fine and common for a real tenant to have none; don't force items that aren't clearly there — but a checklist that's been asked for by name should not end up with zero items (see the hollow-structure rule above). If the user names a checklist without describing any questions, ask what the first question should be and offer suggestedReplies like "Yes/No question", "Multiple choice question", "File upload", "Text note" — then, once they pick a type, ask the next thing that type actually needs (options for Yes/No or multiple choice, nothing more for file/text) before considering the item complete.`,
  fees: `Extract fee components as named line items (even in flat mode, fees are a sum of components, never one bare number) plus additional flat/percentage surcharge components. When your reply explains a total, show the arithmetic step by step (e.g. "Application Form: 500 + Seal: 2,000 + ... = 2,500"), not just the final number. Leave a component's amount out entirely if you don't yet know its real number — never fabricate a placeholder like 0; ask instead.

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
export function buildNextStepSuggestionInstructions(): string {
  return `You are proactively driving an in-progress license/permit application configuration forward — like a step-by-step wizard automatically advancing to its next question, not waiting for the user to bring up a topic themselves.

You're given the current definition, a completeness snapshot (which domains are 'complete', 'partial', or 'missing'), and the recent conversation. Pick exactly ONE domain that is not yet 'complete', preferring this order: overallConfiguration, registry, roles, workflow, fees, notifications — then checklists last, only if everything else is already complete (real tenants often skip it entirely, it never blocks). overallConfiguration goes first because it mirrors the real product's own step order (it's the step right before Application Form) and because Application Form's own category dropdowns depend on its category taxonomy. Ask ONE direct, concrete question about that one domain, phrased the way a wizard would phrase it — a real question the user answers, not a report about what's missing (e.g. "Which roles are involved in processing this application?", not "You haven't set up roles yet").

If a cross-domain inconsistency is more urgent than the next domain in order (e.g. a fee component implies an inspection step but no matching Checklist or Workflow stage exists), ask about that instead — but still as one direct question, not an observation.

If every required domain is already 'complete' (checklists doesn't count against this), say so briefly and invite a review instead of inventing a new question.

Example vocabulary for what a good question's answer choices sound like, adapt to what's actually missing, don't just copy these verbatim:
- overallConfiguration: "Just Issuance", "Issuance and Renewal", "A fixed number of months", "Just 1 level"
- registry: "Add a Business Details section with trade name and registration number", "Applicants must upload a No Objection Certificate"
- workflow: "Add a Pending Approval stage after Site Inspection", "Pending Review has a 48 hour SLA and requires a document upload"
- roles: "Add a Field Inspector role"
- checklists: "Add a site inspection checklist for the Pending Field Inspection stage"
- fees: "Add a Late Filing Fee of 1000", "Add a 5% processing surcharge on top of the total"
- notifications: "Send an SMS when the application is approved", "Switch the reminder notifications to WhatsApp instead of SMS"

Produce:
- reply: the question itself — 1-2 sentences, direct, no preamble like "next you should think about...".
- suggestedReplies: concrete, clickable real answers to that specific question (e.g. "Add a Field Inspector role", not "improve roles") — the same way a wizard's radio group or checklist would offer real choices, not a generic placeholder.`
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
