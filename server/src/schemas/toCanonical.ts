import type { TurnResponseLlmOutput } from './turnResponseSchema.js'
import type {
  ApplicationDefinition,
  RegistryField,
  RegistrySection,
  WorkflowState,
  ChecklistDefinition,
  FeeComponent,
  AdditionalFeeComponent,
  NotificationRule,
} from '../types/applicationDefinition.js'

function freshId(): string {
  return crypto.randomUUID()
}

function undef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

/**
 * LLM output -> canonical ApplicationDefinition. Every field the model proposes
 * fresh is tagged 'custom' and given a new id here — the model is never trusted
 * with either. Items with a genuinely unknown required value (fee amount,
 * notification event/channel/recipient) are dropped rather than fabricated.
 */
export function llmOutputToCanonical(llmOutput: TurnResponseLlmOutput['definition']): ApplicationDefinition {
  const registryFields = (fields: typeof llmOutput.registry.sections[number]['fields']): RegistryField[] =>
    (fields ?? []).map((f) => ({
      id: freshId(),
      label: f.label,
      type: f.type,
      required: f.required,
      validationNotes: undef(f.validationNotes),
      dropdownOptions: undef(f.dropdownOptions) ?? undefined,
      optionsSource: undef(f.optionsSource),
      fieldSource: 'custom',
    }))

  const sections: RegistrySection[] = llmOutput.registry.sections.map((s) => ({
    id: freshId(),
    title: s.title,
    conditional: undef(s.conditional),
    fields: s.fields ? registryFields(s.fields) : undefined,
    subsections: s.subsections
      ? s.subsections.map((sub) => ({ title: sub.title, fields: registryFields(sub.fields) }))
      : undefined,
  }))

  const states: WorkflowState[] = llmOutput.workflow.states.map((s) => ({
    id: freshId(),
    label: s.label,
    assignedRole: undef(s.assignedRole),
  }))

  const checklists: ChecklistDefinition[] = llmOutput.checklists.map((c) => ({
    id: freshId(),
    name: c.name,
    module: c.module,
    stage: c.stage,
    items: c.items,
  }))

  const feeComponents: FeeComponent[] = llmOutput.fees.feeComponents
    .filter((c): c is { label: string; amount: number } => c.amount !== null)
    .map((c) => ({ label: c.label, amount: c.amount }))

  const additionalComponents: AdditionalFeeComponent[] = llmOutput.fees.additionalComponents
    .filter((c): c is { name: string; type: 'flat' | 'percentage'; value: number } => c.value !== null)
    .map((c) => ({ name: c.name, type: c.type, value: c.value }))

  const notificationRules: NotificationRule[] = llmOutput.notifications.rules
    .filter(
      (r): r is { event: string; channel: string; recipient: string } =>
        r.event !== null && r.channel !== null && r.recipient !== null,
    )
    .map((r) => ({ id: freshId(), event: r.event, channel: r.channel, recipient: r.recipient }))

  return {
    metadata: {
      name: undef(llmOutput.metadata.name),
      description: undef(llmOutput.metadata.description),
      department: undef(llmOutput.metadata.department),
      applicantType: undef(llmOutput.metadata.applicantType),
      version: undef(llmOutput.metadata.version),
    },
    registry: {
      sections,
      documents: llmOutput.registry.documents,
      featureToggles: llmOutput.registry.featureToggles.map((t) => ({
        id: freshId(),
        label: t.label,
        tag: undef(t.tag),
        description: t.description,
        enabled: t.enabled,
      })),
    },
    workflow: {
      states,
      transitions: llmOutput.workflow.transitions,
      slaDays: undef(llmOutput.workflow.slaDays),
      renewalTransitions: undef(llmOutput.workflow.renewalTransitions),
    },
    roles: llmOutput.roles,
    checklists,
    fees: {
      mode: llmOutput.fees.mode,
      feeComponents,
      additionalComponents,
    },
    notifications: { rules: notificationRules },
    otherInformation: {
      notes: llmOutput.otherInformation.notes,
      attachments: llmOutput.otherInformation.attachments.map((a) => ({
        filename: a.filename,
        description: undef(a.description),
      })),
    },
    settings: llmOutput.settings,
  }
}

/**
 * Canonical ApplicationDefinition -> the shape re-sent into the prompt each turn,
 * so the model always sees its own prior output in the shape it emits. Strips
 * ids and fieldSource/system (not the model's business), undefined -> null.
 */
export function canonicalToLlmInput(def: ApplicationDefinition): TurnResponseLlmOutput['definition'] {
  const registryFields = (fields: RegistryField[] | undefined) =>
    (fields ?? []).map((f) => ({
      label: f.label,
      type: f.type,
      required: f.required,
      validationNotes: f.validationNotes ?? null,
      dropdownOptions: f.dropdownOptions ?? null,
      optionsSource: f.optionsSource ?? null,
    }))

  return {
    metadata: {
      name: def.metadata.name ?? null,
      description: def.metadata.description ?? null,
      department: def.metadata.department ?? null,
      applicantType: def.metadata.applicantType ?? null,
      version: def.metadata.version ?? null,
    },
    registry: {
      sections: def.registry.sections.map((s) => ({
        title: s.title,
        conditional: s.conditional ?? null,
        fields: s.fields ? registryFields(s.fields) : null,
        subsections: s.subsections
          ? s.subsections.map((sub) => ({ title: sub.title, fields: registryFields(sub.fields) }))
          : null,
      })),
      documents: def.registry.documents,
      featureToggles: def.registry.featureToggles.map((t) => ({
        label: t.label,
        tag: t.tag ?? null,
        description: t.description,
        enabled: t.enabled,
      })),
    },
    workflow: {
      states: def.workflow.states.map((s) => ({ label: s.label, assignedRole: s.assignedRole ?? null })),
      transitions: def.workflow.transitions,
      slaDays: def.workflow.slaDays ?? null,
      renewalTransitions: def.workflow.renewalTransitions ?? null,
    },
    roles: def.roles,
    checklists: def.checklists.map((c) => ({ name: c.name, module: c.module, stage: c.stage, items: c.items })),
    fees: {
      mode: def.fees.mode,
      feeComponents: def.fees.feeComponents.map((c) => ({ label: c.label, amount: c.amount })),
      additionalComponents: def.fees.additionalComponents.map((c) => ({
        name: c.name,
        type: c.type,
        value: c.value,
      })),
    },
    notifications: {
      rules: def.notifications.rules.map((r) => ({ event: r.event, channel: r.channel, recipient: r.recipient })),
    },
    otherInformation: {
      notes: def.otherInformation.notes,
      attachments: def.otherInformation.attachments.map((a) => ({
        filename: a.filename,
        description: a.description ?? null,
      })),
    },
    settings: def.settings,
  }
}
