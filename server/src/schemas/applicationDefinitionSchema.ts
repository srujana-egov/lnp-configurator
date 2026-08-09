import { z } from 'zod'

// LLM-facing schema — a stricter transform of src/types/applicationDefinition.ts,
// not identical to it. Strict-mode rules: every field must be listed as required
// (no native "optional"), so anything that might be "not known yet" during a
// conversation is nullable instead. No `id` fields anywhere — the model isn't
// asked to manage ids; toCanonical.ts assigns them, and Sprint 2's reconcileIds
// will later preserve them across turns by matching, not by trusting the model.

export const MetadataSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  department: z.string().nullable(),
  applicantType: z.string().nullable(),
  version: z.string().nullable(),
})

export const RegistryFieldTypeSchema = z.enum([
  'text',
  'textarea',
  'number',
  'date',
  'year',
  'dropdown',
  'phone',
  'email',
  'checkbox',
  'file',
  'toggle',
  'location',
])

export const RegistrySectionKindSchema = z.enum(['custom', 'address', 'applicant'])

// fieldSource is intentionally NOT here — the model never decides this.
// 'mandatory'/'boundary' fields are recognized elsewhere (they already exist in
// the definition sent back to the model); every field the model proposes fresh
// is 'custom' by construction, assigned in toCanonical.ts, not asked of the model.
export const RegistryFieldSchema = z.object({
  label: z.string(),
  type: RegistryFieldTypeSchema,
  required: z.boolean(),
  validationNotes: z.string().nullable(),
  dropdownOptions: z.array(z.string()).nullable(),
  optionsSource: z.string().nullable(),
  pullFromDatabase: z.boolean().nullable(),
})

export const RegistrySubsectionSchema = z.object({
  title: z.string(),
  fields: z.array(RegistryFieldSchema),
})

export const RegistrySectionSchema = z.object({
  title: z.string(),
  // Unlike fieldSource/system, kind IS something the model decides — it's a
  // content judgment (does this read like an address section, an applicant
  // section, or something bespoke), the same kind of call it already makes
  // for individual field types.
  kind: RegistrySectionKindSchema.nullable(),
  conditional: z.boolean().nullable(),
  fields: z.array(RegistryFieldSchema).nullable(),
  subsections: z.array(RegistrySubsectionSchema).nullable(),
  // 'system' is never here either — same reasoning as fieldSource. A section the
  // model proposes fresh is never system-defined; that only ever comes from a
  // recognized fixed template (Owner/Proprietor Details), never a model decision.
})

export const DocumentRequirementSchema = z.object({
  documentName: z.string(),
  acceptedFormats: z.array(z.string()),
  required: z.boolean(),
  docTypes: z.array(z.string()),
})

export const FeatureToggleSchema = z.object({
  label: z.string(),
  tag: z.string().nullable(),
  description: z.string(),
  enabled: z.boolean(),
})

export const RegistrySchema = z.object({
  sections: z.array(RegistrySectionSchema),
  documents: z.array(DocumentRequirementSchema),
  featureToggles: z.array(FeatureToggleSchema),
})

export const WorkflowStateSchema = z.object({
  label: z.string(),
  assignedRole: z.string().nullable(),
  slaHours: z.number().nonnegative().nullable(),
  docUploadRequired: z.boolean().nullable(),
})

export const WorkflowTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  roles: z.array(z.string()).nullable(),
  action: z.string().nullable(),
})

export const WorkflowSchema = z.object({
  states: z.array(WorkflowStateSchema),
  transitions: z.array(WorkflowTransitionSchema),
  slaDays: z.number().nullable(),
  renewalTransitions: z.array(WorkflowTransitionSchema).nullable(),
})

export const ChecklistItemTypeSchema = z.enum(['checkbox', 'radio', 'file', 'text'])

export const ChecklistItemSchema = z.object({
  item: z.string(),
  type: ChecklistItemTypeSchema,
  required: z.boolean(),
  options: z.array(z.string()).nullable(),
  linkedChecklistName: z.string().nullable(),
})

export const ChecklistDefinitionSchema = z.object({
  name: z.string(),
  helpText: z.string().nullable(),
  module: z.enum(['issuance', 'renewal']),
  stage: z.string(),
  items: z.array(ChecklistItemSchema),
})

// FeeComponent.amount is nullable on purpose: the model may identify that a fee
// exists (e.g. "Application Form fee") before knowing its exact number. Don't
// fabricate a 0 — drop the component while null (toCanonical.ts), surface the
// gap via clarifyingQuestion instead.
export const FeeComponentSchema = z.object({
  label: z.string(),
  amount: z.number().nonnegative().nullable(),
})

export const AdditionalFeeComponentSchema = z.object({
  name: z.string(),
  type: z.enum(['flat', 'percentage']),
  value: z.number().nonnegative().nullable(),
})

export const FeeSlabRangeSchema = z.object({
  label: z.string(),
  from: z.number().nullable(),
  to: z.number().nullable(),
})

export const FeeDependentFieldSchema = z.object({
  fieldLabel: z.string(),
  ranges: z.array(FeeSlabRangeSchema),
})

export const FeeMatrixRowSchema = z.object({
  combination: z.array(z.object({ fieldLabel: z.string(), rangeLabel: z.string() })),
  amount: z.number().nonnegative(),
})

export const FeeConfigSchema = z.object({
  mode: z.enum(['flat', 'custom']),
  feeComponents: z.array(FeeComponentSchema),
  additionalComponents: z.array(AdditionalFeeComponentSchema),
  dependentFields: z.array(FeeDependentFieldSchema).nullable(),
  matrix: z.array(FeeMatrixRowSchema).nullable(),
})

// Same partial-knowledge reasoning as FeeComponent — event/channel/recipient
// nullable; toCanonical.ts drops a rule until all three are non-null.
export const NotificationRuleSchema = z.object({
  event: z.string().nullable(),
  channel: z.string().nullable(),
  recipient: z.string().nullable(),
  message: z.string().nullable(),
})

export const NotificationsSchema = z.object({
  rules: z.array(NotificationRuleSchema),
})

export const OtherInformationAttachmentSchema = z.object({
  filename: z.string(),
  description: z.string().nullable(),
})

export const OtherInformationSchema = z.object({
  notes: z.string(),
  attachments: z.array(OtherInformationAttachmentSchema),
})

export const SettingsSchema = z.object({
  draft: z.boolean(),
  published: z.boolean(),
  language: z.string(),
})

export const RoleSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  tag: z.string().nullable(),
})

export const ApplicationDefinitionSchema = z.object({
  metadata: MetadataSchema,
  registry: RegistrySchema,
  workflow: WorkflowSchema,
  roles: z.array(RoleSchema),
  checklists: z.array(ChecklistDefinitionSchema),
  fees: FeeConfigSchema,
  notifications: NotificationsSchema,
  otherInformation: OtherInformationSchema,
  settings: SettingsSchema,
})
