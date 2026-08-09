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
  registry: `Extract Application Form fields. Re-confirm this document is genuinely applicant-facing (see the classification rule you were routed under) — if on closer reading it's actually staff/technician-completed, extract nothing and say so in your reply instead of forcing fields. Separately, a document's own "Attached Documents" list is not more fields — it belongs in registry.documents, never as section fields. Tag a section's kind as 'address' or 'applicant' when it clearly reads as one (e.g. a block of address/locality fields, or a block of who-is-applying fields) — these are singleton kinds, so never create a second 'address' or 'applicant' section if one already exists in the current definition; add fields to the existing one instead. Use type: 'location' for a field that wants map coordinates or a location picker, not just a free-text address. Use pullFromDatabase: true (rather than a hardcoded dropdownOptions list) when the user describes options as coming from a lookup/database rather than a fixed list. Never invent a conditional or repeating field structure — only recognize one if it's already present in the current definition. Never emit fieldSource: 'boundary' or type: 'toggle' for a new field — only ever recognize one already present.`,
  workflow: `Extract workflow states, transitions, SLA days (look for phrasing like "processing takes N days"), and renewal transitions if renewal comes up. Role and action belong on each TRANSITION, not the state — the same state can have more than one outgoing transition with a different role/action each (e.g. a citizen's "Apply" and a counter employee's "Assisted Apply" can both leave the same starting state). You'll be given the current real Roles list as read-only context — prefer a role that's already in that list, but real tenant data can legitimately reference a role that isn't in the list yet (that's a real inconsistency to flag in your reply, not silently correct by inventing or dropping it).`,
  roles: `Extract or update the roles list. Watch for near-duplicate role names describing the same real role (e.g. "Field Inspector" vs "Site Inspector") and ask rather than silently pick one if genuinely ambiguous.`,
  checklists: `Extract checklist items grouped into named checklists, each tied to a module (issuance/renewal) and a workflow stage. You'll be given the current real Workflow state labels as read-only context — prefer a stage that matches one of them. This domain is low priority — it's fine and common for a real tenant to have none; don't force items that aren't clearly there.`,
  fees: `Extract fee components as named line items (even in flat mode, fees are a sum of components, never one bare number) plus additional flat/percentage surcharge components. When your reply explains a total, show the arithmetic step by step (e.g. "Application Form: 500 + Seal: 2,000 + ... = 2,500"), not just the final number. Leave a component's amount out entirely if you don't yet know its real number — never fabricate a placeholder like 0; ask instead.`,
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
- Ask at most one clarifying question, only if you genuinely need it to proceed correctly.`
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
