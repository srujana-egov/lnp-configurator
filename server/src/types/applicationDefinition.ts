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
  source?: string
  // 'boundary' is never emitted by extraction — only ever recognized if already present.
  fieldSource: RegistryFieldSource
}

export interface RegistrySubsection {
  title: string
  fields: RegistryField[]
}

export interface RegistrySection {
  id: string
  title: string
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
}

export interface WorkflowTransition {
  from: string
  to: string
  // Real product data (the real Bissau tenant's Workflow screen) showed role
  // and action assigned per-transition, not per-state — the same "from"
  // state can have multiple rows with different roles/actions (e.g. Start
  // has both a Citizen/Apply row and a Counter Employee/Assisted Apply
  // row). WorkflowState.assignedRole predates this finding and is now the
  // less accurate of the two; kept for now, not removed.
  role?: string
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
}

export interface ChecklistDefinition {
  id: string
  name: string
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

export type Roles = string[]

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
