import { z } from 'zod'
import {
  MetadataSchema,
  RegistrySchema,
  WorkflowSchema,
  ChecklistDefinitionSchema,
  FeeConfigSchema,
  NotificationsSchema,
  OtherInformationSchema,
  RoleSchema,
} from './applicationDefinitionSchema.js'
import type {
  Metadata,
  RegistryField,
  RegistrySection,
  Registry,
  Workflow,
  WorkflowState,
  ChecklistDefinition,
  FeeConfig,
  FeeComponent,
  AdditionalFeeComponent,
  FeeDependentField,
  FeeMatrixRow,
  Notifications,
  NotificationRule,
  OtherInformation,
  Roles,
} from '../types/applicationDefinition.js'

export function freshId(): string {
  return crypto.randomUUID()
}

function undef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

// Per-domain LLM-facing shapes, inferred straight from the same schemas sent
// to the model — one domain agent's output is exactly one of these, never
// the whole ApplicationDefinition. Domain agents each return one of these.
export type LlmMetadata = z.infer<typeof MetadataSchema>
export type LlmRegistry = z.infer<typeof RegistrySchema>
export type LlmWorkflow = z.infer<typeof WorkflowSchema>
export type LlmChecklists = z.infer<typeof ChecklistDefinitionSchema>[]
export type LlmFees = z.infer<typeof FeeConfigSchema>
export type LlmNotifications = z.infer<typeof NotificationsSchema>
export type LlmOtherInformation = z.infer<typeof OtherInformationSchema>
export type LlmRoles = z.infer<typeof RoleSchema>[]

/**
 * Per-domain LLM output -> canonical. Every field a domain agent proposes
 * fresh is tagged 'custom' and given a new id here — the model is never
 * trusted with either, same rule as before, just scoped per domain now.
 * Items with a genuinely unknown required value (fee amount, notification
 * event/channel/recipient) are dropped rather than fabricated.
 */
export function metadataFromLlm(llm: LlmMetadata): Metadata {
  return {
    name: undef(llm.name),
    description: undef(llm.description),
    department: undef(llm.department),
    applicantType: undef(llm.applicantType),
    version: undef(llm.version),
  }
}

function registryFieldsFromLlm(fields: LlmRegistry['sections'][number]['fields']): RegistryField[] {
  return (fields ?? []).map((f) => ({
    id: freshId(),
    label: f.label,
    type: f.type,
    required: f.required,
    validationNotes: undef(f.validationNotes),
    dropdownOptions: undef(f.dropdownOptions) ?? undefined,
    optionsSource: undef(f.optionsSource),
    pullFromDatabase: undef(f.pullFromDatabase),
    fieldSource: 'custom',
  }))
}

export function registryFromLlm(llm: LlmRegistry): Registry {
  const sections: RegistrySection[] = llm.sections.map((s) => ({
    id: freshId(),
    title: s.title,
    kind: undef(s.kind),
    conditional: undef(s.conditional),
    fields: s.fields ? registryFieldsFromLlm(s.fields) : undefined,
    subsections: s.subsections
      ? s.subsections.map((sub) => ({ title: sub.title, fields: registryFieldsFromLlm(sub.fields) }))
      : undefined,
  }))
  return {
    sections,
    documents: llm.documents,
    featureToggles: llm.featureToggles.map((t) => ({
      id: freshId(),
      label: t.label,
      tag: undef(t.tag),
      description: t.description,
      enabled: t.enabled,
    })),
  }
}

export function workflowFromLlm(llm: LlmWorkflow): Workflow {
  const states: WorkflowState[] = llm.states.map((s) => ({
    id: freshId(),
    label: s.label,
    assignedRole: undef(s.assignedRole),
    slaHours: undef(s.slaHours),
    docUploadRequired: undef(s.docUploadRequired),
  }))
  const transitionFromLlm = (t: LlmWorkflow['transitions'][number]) => ({
    from: t.from,
    to: t.to,
    roles: undef(t.roles) ?? undefined,
    action: undef(t.action),
  })
  return {
    states,
    transitions: llm.transitions.map(transitionFromLlm),
    slaDays: undef(llm.slaDays),
    renewalTransitions: llm.renewalTransitions ? llm.renewalTransitions.map(transitionFromLlm) : undefined,
  }
}

export function checklistsFromLlm(llm: LlmChecklists): ChecklistDefinition[] {
  return llm.map((c) => ({
    id: freshId(),
    name: c.name,
    helpText: undef(c.helpText),
    module: c.module,
    stage: c.stage,
    items: c.items.map((it) => ({
      item: it.item,
      type: it.type,
      required: it.required,
      options: undef(it.options) ?? undefined,
      linkedChecklistName: undef(it.linkedChecklistName),
    })),
  }))
}

export function feesFromLlm(llm: LlmFees): FeeConfig {
  const feeComponents: FeeComponent[] = llm.feeComponents
    .filter((c): c is { label: string; amount: number } => c.amount !== null)
    .map((c) => ({ label: c.label, amount: c.amount }))
  const additionalComponents: AdditionalFeeComponent[] = llm.additionalComponents
    .filter((c): c is { name: string; type: 'flat' | 'percentage'; value: number } => c.value !== null)
    .map((c) => ({ name: c.name, type: c.type, value: c.value }))
  const dependentFields: FeeDependentField[] | undefined = llm.dependentFields
    ? llm.dependentFields.map((f) => ({
        fieldLabel: f.fieldLabel,
        ranges: f.ranges.map((r) => ({ label: r.label, from: undef(r.from), to: undef(r.to) })),
      }))
    : undefined
  const matrix: FeeMatrixRow[] | undefined = llm.matrix
    ? llm.matrix.map((row) => ({
        combination: Object.fromEntries(row.combination.map((c) => [c.fieldLabel, c.rangeLabel])),
        amount: row.amount,
      }))
    : undefined
  return { mode: llm.mode, feeComponents, additionalComponents, dependentFields, matrix }
}

export function notificationsFromLlm(llm: LlmNotifications): Notifications {
  const rules: NotificationRule[] = llm.rules
    .filter(
      (r): r is { event: string; channel: string; recipient: string; message: string | null } =>
        r.event !== null && r.channel !== null && r.recipient !== null,
    )
    .map((r) => ({ id: freshId(), event: r.event, channel: r.channel, recipient: r.recipient, message: undef(r.message) }))
  return { rules }
}

export function otherInformationFromLlm(llm: LlmOtherInformation): OtherInformation {
  return {
    notes: llm.notes,
    attachments: llm.attachments.map((a) => ({ filename: a.filename, description: undef(a.description) })),
  }
}

export function rolesFromLlm(llm: LlmRoles): Roles {
  return llm.map((r) => ({ name: r.name, description: undef(r.description), tag: undef(r.tag) }))
}

/**
 * Canonical -> the shape re-sent into a domain's prompt each turn, so the
 * model always sees its own prior output in the shape it emits. Strips ids
 * and fieldSource/system (not the model's business), undefined -> null.
 */
export function metadataToLlm(metadata: Metadata): LlmMetadata {
  return {
    name: metadata.name ?? null,
    description: metadata.description ?? null,
    department: metadata.department ?? null,
    applicantType: metadata.applicantType ?? null,
    version: metadata.version ?? null,
  }
}

function registryFieldsToLlm(fields: RegistryField[] | undefined) {
  return (fields ?? []).map((f) => ({
    label: f.label,
    type: f.type,
    required: f.required,
    validationNotes: f.validationNotes ?? null,
    dropdownOptions: f.dropdownOptions ?? null,
    optionsSource: f.optionsSource ?? null,
    pullFromDatabase: f.pullFromDatabase ?? null,
  }))
}

export function registryToLlm(registry: Registry): LlmRegistry {
  return {
    sections: registry.sections.map((s) => ({
      title: s.title,
      kind: s.kind ?? null,
      conditional: s.conditional ?? null,
      fields: s.fields ? registryFieldsToLlm(s.fields) : null,
      subsections: s.subsections
        ? s.subsections.map((sub) => ({ title: sub.title, fields: registryFieldsToLlm(sub.fields) }))
        : null,
    })),
    documents: registry.documents,
    featureToggles: registry.featureToggles.map((t) => ({
      label: t.label,
      tag: t.tag ?? null,
      description: t.description,
      enabled: t.enabled,
    })),
  }
}

export function workflowToLlm(workflow: Workflow): LlmWorkflow {
  const transitionsToLlm = (transitions: typeof workflow.transitions) =>
    transitions.map((t) => ({ from: t.from, to: t.to, roles: t.roles ?? null, action: t.action ?? null }))
  return {
    states: workflow.states.map((s) => ({
      label: s.label,
      assignedRole: s.assignedRole ?? null,
      slaHours: s.slaHours ?? null,
      docUploadRequired: s.docUploadRequired ?? null,
    })),
    transitions: transitionsToLlm(workflow.transitions),
    slaDays: workflow.slaDays ?? null,
    renewalTransitions: workflow.renewalTransitions ? transitionsToLlm(workflow.renewalTransitions) : null,
  }
}

export function checklistsToLlm(checklists: ChecklistDefinition[]): LlmChecklists {
  return checklists.map((c) => ({
    name: c.name,
    helpText: c.helpText ?? null,
    module: c.module,
    stage: c.stage,
    items: c.items.map((it) => ({
      item: it.item,
      type: it.type,
      required: it.required,
      options: it.options ?? null,
      linkedChecklistName: it.linkedChecklistName ?? null,
    })),
  }))
}

export function feesToLlm(fees: FeeConfig): LlmFees {
  return {
    mode: fees.mode,
    feeComponents: fees.feeComponents.map((c) => ({ label: c.label, amount: c.amount })),
    additionalComponents: fees.additionalComponents.map((c) => ({ name: c.name, type: c.type, value: c.value })),
    dependentFields: fees.dependentFields
      ? fees.dependentFields.map((f) => ({
          fieldLabel: f.fieldLabel,
          ranges: f.ranges.map((r) => ({ label: r.label, from: r.from ?? null, to: r.to ?? null })),
        }))
      : null,
    matrix: fees.matrix
      ? fees.matrix.map((row) => ({
          combination: Object.entries(row.combination).map(([fieldLabel, rangeLabel]) => ({ fieldLabel, rangeLabel })),
          amount: row.amount,
        }))
      : null,
  }
}

export function notificationsToLlm(notifications: Notifications): LlmNotifications {
  return {
    rules: notifications.rules.map((r) => ({
      event: r.event,
      channel: r.channel,
      recipient: r.recipient,
      message: r.message ?? null,
    })),
  }
}

export function otherInformationToLlm(otherInformation: OtherInformation): LlmOtherInformation {
  return {
    notes: otherInformation.notes,
    attachments: otherInformation.attachments.map((a) => ({ filename: a.filename, description: a.description ?? null })),
  }
}

export function rolesToLlm(roles: Roles): LlmRoles {
  return roles.map((r) => ({ name: r.name, description: r.description ?? null, tag: r.tag ?? null }))
}
