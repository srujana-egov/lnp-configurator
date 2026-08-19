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
  // Real evidence (the real Business License template spec — Owner/Proprietor
  // Details' "Add Individual" button): a subsection can represent a
  // repeatable group, not just a fixed set of fields. Conservative on
  // purpose, matching the existing conditional/repeating-structure rule —
  // this only ever marks that a subsection repeats; it doesn't model how
  // many instances exist or their individual data (Phase 1 doesn't need to,
  // since real citizen submissions are out of scope here).
  repeatable?: boolean
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

// 'custom' mode only — real evidence from the actual product's own 5-step
// Custom Logic wizard (Select Fields -> Configure Slabs -> Fee Matrix ->
// Add-ons -> Confirm). A slab range is either numeric (Number/Year fields)
// or one range per dropdown option (Dropdown fields auto-use their real
// configured options as fee dimensions, exactly like the real wizard).
export interface FeeSlabRange {
  label: string
  from?: number
  to?: number
}

export interface FeeDependentField {
  // References a real Registry field by label — the real wizard's own
  // rule ("add it first in Application Configuration -> Form" if it
  // doesn't exist yet) applies here too; never invent a field.
  fieldLabel: string
  ranges: FeeSlabRange[]
}

export interface FeeMatrixRow {
  // fieldLabel -> range label, e.g. {"Category of Business": "Workshops", "Business Area": "0-100"}
  combination: Record<string, string>
  amount: number
}

export interface FeeConfig {
  // Real evidence (the real Business License template spec): the real
  // product calls these three "Flat Fee," "Slab Based," and "Custom
  // Calculator (API)." 'custom' here is this codebase's existing name for
  // "Slab Based" (built earlier from the real Custom Logic wizard) — kept
  // as-is rather than renamed, to avoid a disruptive rename across every
  // file that already references 'custom' mode. 'api' is the new, genuinely
  // different third mode: fee is computed by calling an external endpoint
  // at calculation time, not by any data this system holds.
  mode: 'flat' | 'custom' | 'api'
  feeComponents: FeeComponent[]
  additionalComponents: AdditionalFeeComponent[]
  dependentFields?: FeeDependentField[]
  matrix?: FeeMatrixRow[]
  // 'api' mode only — the admin-provided endpoint the real system calls
  // with the application data, displaying whatever fee it returns.
  apiEndpoint?: string
  // Real evidence (same template spec, Payment Stages): a separate concept
  // from the fee structure itself — which channels citizens can actually
  // pay through (e.g. "Online", "Counter"), not modeled anywhere before.
  paymentMethods?: string[]
  // The draft→confirm gate: true the moment the specialist proposes new or
  // changed fee logic (and its reply must ask the user to confirm it before
  // treating it as final — see the fees domain rule), cleared back to false
  // only once the user has actually confirmed. A wrong AI judgment here is a
  // real financial mistake, not a cosmetic one — nothing should be treated
  // as settled until a human has actually looked at it.
  needsConfirmation?: boolean
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

// --- Overall Configuration --------------------------------------------
// Step 5 of the real wizard, the first "APPLICATION CONFIG" sub-step —
// before Application Form. Real evidence (the real screens, reviewed
// directly): a genuinely 8-question flow, not a guess. Category values are
// deliberately NOT defaulted to the real product's own starter list (7 of a
// real 27 pre-filled entries seen, e.g. Retail Shop, Food & Beverage,
// Personal Services, Healthcare, Professional Services, Manufacturing,
// Education & Training) — same "never invent" discipline as every other
// domain here; only what the conversation actually names gets captured.

export type LicenceValidityMode = 'fixed' | 'financialYear' | 'never'
export type RenewalApprovalMode = 'autoApproveAll' | 'autoApproveIfUnchanged' | 'alwaysWorkflow'

export interface OverallConfigurationModules {
  // Always true on the real screen ("Always On" tag, locked) — extraction
  // never emits false here, only ever recognizes this default, same rule as
  // RegistryFieldSource's 'boundary'.
  issuance: true
  renewal: boolean
}

export interface LicenceValidity {
  mode: LicenceValidityMode
  months?: number // only meaningful for mode: 'fixed'
}

export interface RenewalRules {
  reminderDaysBefore: number
  graceDaysAfter: number
  approval: RenewalApprovalMode
  // Real evidence (the real Business License template spec): a genuinely
  // separate toggle from the approval mode above — whether the renewal
  // form itself reuses the full issuance form, or gets its own independent
  // sections/fields.
  renewalFormSameAsApplication?: boolean
}

// Real evidence (the real Business License template spec) corrected the
// earlier guess of 1-3 levels — the real supported range is 1 to 5.
// Category values are a real parent/child hierarchy (e.g. "Retail Shop" has
// its own real sub-categories "Grocery"/"Clothing"/"Electronics"), not a
// flat list — a flat list of bare names would lose that relationship.
// Modeled as one full path per real category value (e.g. ["Retail Shop",
// "Grocery"]) rather than a recursive tree — a flat list of paths is simple
// for the model to emit reliably and for OpenAI's structured-output schema
// to represent (no recursive $ref); grouping paths back into a tree for
// display is a cheap, pure transform whenever that's actually needed.
export interface CategoryPath {
  path: string[] // one value per level, e.g. ['Retail Shop', 'Grocery']
}

export interface CategoryLevels {
  count: number // 1-5, real evidence
  levelNames: string[] // e.g. ['Category'] or ['Category', 'Sub-category', 'Type']
  categories: CategoryPath[] // only ever what the user actually named
}

export interface ApplicationIdFormat {
  newFormat: string // e.g. 'BL-YYYY-NNNNNN'
  renewalFormat?: string
  licenseIdMatchesApplicationId?: boolean
  // Real evidence (the real Business License template spec) — renewal-only:
  // whether a renewed licence keeps its original License ID, or a new one
  // is generated on renewal. Distinct from licenseIdMatchesApplicationId
  // above, which is about the issuance-time relationship, not renewal.
  licenseIdSameAsRenewedLicenseId?: boolean
}

// Real evidence (the real Business License template spec) — a genuinely
// new concept, not covered by anything else here: whether applicants can
// only apply for the current year, or also for a configurable number of
// past financial years.
export interface ApplicationYearConfig {
  allowPastYears: boolean
  pastYearsCount?: number // 1-5, only meaningful when allowPastYears is true
}

export interface OverallConfiguration {
  modules: OverallConfigurationModules
  validity?: LicenceValidity
  renewal?: RenewalRules
  categoryLevels?: CategoryLevels
  applicationId?: ApplicationIdFormat
  applicationYear?: ApplicationYearConfig
}

// --- Root --------------------------------------------------------------

export interface ApplicationDefinition {
  metadata: Metadata
  overallConfiguration: OverallConfiguration
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
  overallConfiguration: { modules: { issuance: true, renewal: false } },
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
  | 'overallConfiguration'
  | 'registry'
  | 'workflow'
  | 'roles'
  | 'checklists'
  | 'fees'
  | 'notifications'
