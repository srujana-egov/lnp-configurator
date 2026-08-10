import type {
  ApplicationDefinition,
  RegistryField,
  RegistrySection,
  WorkflowState,
  ChecklistDefinition,
  NotificationRule,
} from '../types/applicationDefinition.js'

// The model is never given ids to manage (see applicationDefinitionSchema.ts) —
// toCanonical.ts mints a fresh crypto.randomUUID() for every item on every
// conversion, so a domain call that only tweaks one item still regenerates
// ids for every sibling untouched item. This matches each new item back
// against the previous turn's version of the same domain by content (label,
// title, name — never a model-supplied id) and keeps the old id where it
// matches, the same idea as a database upsert keyed by a natural key instead
// of a surrogate one. Genuinely new items keep their fresh id; an old item
// with no match in the new list is simply gone.
function reconcileById<T extends { id: string }>(oldItems: T[], newItems: T[], keyOf: (item: T) => string): T[] {
  const oldIdByKey = new Map(oldItems.map((item) => [keyOf(item), item.id]))
  return newItems.map((item) => {
    const oldId = oldIdByKey.get(keyOf(item))
    return oldId ? { ...item, id: oldId } : item
  })
}

function reconcileFields(oldFields: RegistryField[], newFields: RegistryField[]): RegistryField[] {
  return reconcileById(oldFields, newFields, (f) => `${f.label}::${f.type}`)
}

function reconcileSections(oldSections: RegistrySection[], newSections: RegistrySection[]): RegistrySection[] {
  const oldByTitle = new Map(oldSections.map((s) => [s.title, s]))
  const withNestedReconciled = newSections.map((section) => {
    const oldSection = oldByTitle.get(section.title)
    return {
      ...section,
      fields: section.fields ? reconcileFields(oldSection?.fields ?? [], section.fields) : section.fields,
      subsections: section.subsections
        ? section.subsections.map((sub) => {
            const oldSub = oldSection?.subsections?.find((s) => s.title === sub.title)
            return { ...sub, fields: reconcileFields(oldSub?.fields ?? [], sub.fields) }
          })
        : section.subsections,
    }
  })
  return reconcileById(oldSections, withNestedReconciled, (s) => s.title)
}

function reconcileWorkflowStates(oldStates: WorkflowState[], newStates: WorkflowState[]): WorkflowState[] {
  return reconcileById(oldStates, newStates, (s) => s.label)
}

function reconcileChecklists(oldChecklists: ChecklistDefinition[], newChecklists: ChecklistDefinition[]): ChecklistDefinition[] {
  return reconcileById(oldChecklists, newChecklists, (c) => c.name)
}

function reconcileNotificationRules(oldRules: NotificationRule[], newRules: NotificationRule[]): NotificationRule[] {
  return reconcileById(oldRules, newRules, (r) => `${r.event}::${r.channel}`)
}

// Roles and WorkflowTransition carry no synthetic id at all — they're
// already referenced everywhere else by name (WorkflowTransition.roles,
// Checklist.stage, NotificationRule.event), so there's nothing to reconcile.
export function reconcileIds(oldDefinition: ApplicationDefinition, newDefinition: ApplicationDefinition): ApplicationDefinition {
  return {
    ...newDefinition,
    registry: {
      ...newDefinition.registry,
      sections: reconcileSections(oldDefinition.registry.sections, newDefinition.registry.sections),
    },
    workflow: {
      ...newDefinition.workflow,
      states: reconcileWorkflowStates(oldDefinition.workflow.states, newDefinition.workflow.states),
    },
    checklists: reconcileChecklists(oldDefinition.checklists, newDefinition.checklists),
    notifications: {
      ...newDefinition.notifications,
      rules: reconcileNotificationRules(oldDefinition.notifications.rules, newDefinition.notifications.rules),
    },
  }
}
