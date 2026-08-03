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

export type RegistryFieldType =
  | 'text'
  | 'phone'
  | 'email'
  | 'number'
  | 'year'
  | 'date'
  | 'dropdown'
  | 'checkbox'
  | 'toggle'

export type RegistryFieldSource = 'mandatory' | 'recommended' | 'custom' | 'boundary'

export interface RegistryField {
  id: string
  label: string
  type: RegistryFieldType
  required: boolean
  validationNotes?: string
  dropdownOptions?: string[]
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
