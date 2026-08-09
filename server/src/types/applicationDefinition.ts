// Plain TypeScript shapes for now — not Zod yet (that's Day 4). This is the data
// the backend works with internally and returns to the harness; the LLM-facing
// strict-mode schema (Day 4+) will be a stricter, nullable-heavy transform of this,
// not identical to it. Don't conflate "optional in TS" with "optional in the schema
// OpenAI sees" — those are two different layers with two different rules.

export interface Metadata {
  name?: string
  description?: string
  department?: string
  applicantType?: string
  version?: string
}

// --- Registry (Application Form, Step 6) ---------------------------------
// Target of extraction is this screen's data, not a real JSON Schema. See plan:
// "Does this work for any possible form?" Compiling to a real digit3 schema is
// Phase 2, out of scope here.

// The 10 values below 'toggle' are exactly the real "Add Custom Field" type
// dropdown, transcribed. 'toggle' is separate on purpose: it's a real type
// (Owner/Proprietor Details' "Same as Applicant" toggles use it) but it's
// never offered when creating a *custom* field — same rule as fieldSource
// 'boundary': extraction must never emit type: 'toggle' for a new field,
// only recognize one already present on a system-defined field.
export type RegistryFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'year'
  | 'dropdown'
  | 'phone'
  | 'email'
  | 'checkbox'
  | 'file'
  | 'toggle'
  // Real, evidenced gap: a separate (now-discontinued) DIGIT registry-schema
  // form builder had a "Select Location on Map" field — a geolocation
  // coordinate picker, not just a free-text address. Added here as its own
  // type rather than folded into 'text'.
  | 'location'

export type RegistryFieldSource = 'mandatory' | 'recommended' | 'custom' | 'boundary'

export interface RegistryField {
  id: string
  label: string
  type: RegistryFieldType
  required: boolean
  validationNotes?: string
  // For type: 'dropdown' — mutually exclusive. dropdownOptions is a self-contained,
  // hardcoded list (e.g. ID Type: Passport/Driving License/...). optionsSource is a
  // reference to another domain's data instead (e.g. Category of Business, which the
  // real screen literally labels "Values set in Overall Configuration") — a loose
  // descriptive string for now since Overall Configuration has no type yet (deferred
  // to Sprint 2); becomes a real typed reference once that domain exists.
  dropdownOptions?: string[]
  optionsSource?: string
  // Distinct from optionsSource: the discontinued form builder had a "Pull
  // values from Database" toggle, a different mechanism from a named
  // domain reference — this is deliberately just a boolean flag for now,
  // not a full table/field reference, since that's all the real evidence
  // (a toggle, nothing more) actually showed.
  pullFromDatabase?: boolean
  source?: string
  // 'boundary' is never emitted by extraction — only ever recognized if already present.
  fieldSource: RegistryFieldSource
}

export interface RegistrySubsection {
  title: string
  fields: RegistryField[]
}

// The discontinued form builder treated Address/Applicant/Document as fixed,
// singleton section KINDS (each greys out as "already added" once used) —
// distinct from an arbitrary custom section. Our sections previously only
// had a free-text title with no way to recognize "this fundamentally is an
// Address-kind section." Deliberately not modeling 'document' as a section
// kind here: our real target evidence (the Bissau tenant's actual screen)
// keeps document uploads in registry.documents, not as section fields —
// a conscious divergence from the discontinued tool's choice, not an
// oversight.
export type RegistrySectionKind = 'custom' | 'address' | 'applicant'

export interface RegistrySection {
  id: string
  title: string
  kind?: RegistrySectionKind
  system?: boolean
  conditional?: boolean
  fields?: RegistryField[]
  subsections?: RegistrySubsection[]
}

export interface DocumentRequirement {
  documentName: string
  acceptedFormats: string[]
  required: boolean
  docTypes: string[]
}

export interface FeatureToggle {
  id: string
  label: string
  tag?: string
  description: string
  enabled: boolean
}

export interface Registry {
  sections: RegistrySection[]
  documents: DocumentRequirement[]
  featureToggles: FeatureToggle[]
}

// --- Workflow --------------------------------------------------------------

export interface WorkflowState {
  id: string
  label: string
  assignedRole?: string
  // Real evidence (DIGIT Studio's Workflow Management tool, a different
  // real module than the Bissau tenant's screen): SLA is a per-state
  // setting there ("SLA Timer (Hours)"), not only the one workflow-level
  // number below. Both are kept — different real systems modeled this at
  // different granularities, and a per-state override doesn't conflict
  // with an overall target.
  slaHours?: number
  docUploadRequired?: boolean
}

export interface WorkflowTransition {
  from: string
  to: string
  // Real product data showed BOTH shapes for this: the Bissau tenant's
  // Workflow screen showed one role per action row, but DIGIT Studio's own
  // Workflow Management tool's real JSON export (seen directly in an "Edit
  // service configuration" panel) showed `roles` as an array — more than
  // one role can perform the same action. Generalized to an array, which
  // still represents the single-role case as one element — not a conflict,
  // a widening.
  roles?: string[]
  action?: string
}

export interface Workflow {
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  slaDays?: number
  renewalTransitions?: WorkflowTransition[]
}

// --- Checklist ---------------------------------------------------------
// Its own top-level domain, not nested under Workflow. Real tenants often
// leave this empty — see plan's completeness minimums.

export type ChecklistItemType = 'checkbox' | 'radio' | 'file' | 'text'

export interface ChecklistItem {
  item: string
  type: ChecklistItemType
  required: boolean
  // Real gap (DIGIT Studio's own Checklist Dashboard): a radio/checkbox
  // item needs its actual answer choices (e.g. Yes/No, Images/Video/Other)
  // — same concept as RegistryField.dropdownOptions, just for a checklist
  // item instead of a form field.
  options?: string[]
  // "Link Nested Checklist" in the real tool — a specific answer can route
  // to a whole separate checklist. Modeled as a shallow named reference
  // only, not a resolved/recursive structure — same conservative choice
  // already made for conditional/repeating registry fields: represent
  // that the relationship exists, don't build recursive extraction logic
  // for it in Phase 1.
  linkedChecklistName?: string
}

export interface ChecklistDefinition {
  id: string
  name: string
  helpText?: string
  module: 'issuance' | 'renewal'
  stage: string
  items: ChecklistItem[]
}

// --- Fees --------------------------------------------------------------
// Even "flat" mode is a sum of named components, not one number.

export interface FeeComponent {
  label: string
  amount: number
}

export interface AdditionalFeeComponent {
  name: string
  type: 'flat' | 'percentage'
  value: number
}

export interface FeeConfig {
  mode: 'flat' | 'custom'
  feeComponents: FeeComponent[]
  additionalComponents: AdditionalFeeComponent[]
  // 'custom' mode (slabs/fee matrix) — Sprint 6 stretch, not built in the walking skeleton.
}

// --- Roles / Notifications -----------------------------------------------
// Real evidence (the actual target product's own Roles step, Bissau
// tenant): each role has a description and a tag ("Public" for
// citizen-facing roles), not just a bare name. Upgraded from a plain
// string list. WorkflowTransition.roles stays a plain string[] on
// purpose — it references a role BY NAME, the same way Checklist.stage
// and NotificationRule.event reference a Workflow state by label, not by
// object identity.

export interface Role {
  name: string
  description?: string
  tag?: string
}

export type Roles = Role[]

export interface NotificationRule {
  id: string
  event: string
  channel: string
  recipient: string
  // Real product data (Bissau tenant's Notifications screen) shows real
  // message/subject text per rule, including {APP_ID}-style placeholders —
  // missing from this type until now, same class of gap as
  // WorkflowTransition's role/action.
  message?: string
}

export interface Notifications {
  rules: NotificationRule[]
}

// --- Other Information --------------------------------------------------
// The catch-all: anything that doesn't cleanly fit a structured domain lands
// here as free text + attachment, not forced into a bad structured guess.

export interface OtherInformationAttachment {
  filename: string
  description?: string
}

export interface OtherInformation {
  notes: string
  attachments: OtherInformationAttachment[]
}

// --- Settings --------------------------------------------------------------

export interface Settings {
  draft: boolean
  published: boolean
  language: string
}

// --- Root --------------------------------------------------------------
// Overall Configuration is intentionally NOT a field here yet — no extraction
// logic touches it until Sprint 2, so there's nothing to model until then.

export interface ApplicationDefinition {
  metadata: Metadata
  registry: Registry
  workflow: Workflow
  roles: Roles
  checklists: ChecklistDefinition[]
  fees: FeeConfig
  notifications: Notifications
  otherInformation: OtherInformation
  settings: Settings
}

export const EMPTY_APPLICATION_DEFINITION: ApplicationDefinition = {
  metadata: {},
  registry: { sections: [], documents: [], featureToggles: [] },
  workflow: { states: [], transitions: [] },
  roles: [],
  checklists: [],
  fees: { mode: 'flat', feeComponents: [], additionalComponents: [] },
  notifications: { rules: [] },
  otherInformation: { notes: '', attachments: [] },
  settings: { draft: true, published: false, language: 'English' },
}

export type DefinitionSectionKey =
  | 'metadata'
  | 'registry'
  | 'workflow'
  | 'roles'
  | 'checklists'
  | 'fees'
  | 'notifications'
