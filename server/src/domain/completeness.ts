import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { CompletenessSnapshot, SectionStatus } from '../types/completeness.js'

// Real thresholds, not invented here — these are exactly what the plan
// already specified (Sprint 3 scope, never built until now). checklists is
// deliberately excluded from the overall percentage below, same as
// otherInformation is excluded from the type entirely — real tenants
// routinely skip Checklist, and the plan says so should never block
// completeness, only be tracked.

function metadataStatus(definition: ApplicationDefinition): SectionStatus {
  const { name, ...rest } = definition.metadata
  if (name) return 'complete'
  if (Object.values(rest).some((v) => v)) return 'partial'
  return 'missing'
}

// Plan's own proposed rule: complete once module selection + at least one
// category is set. modules.renewal always has a real value (true/false is
// itself a real decision once anything else here has been touched), so
// categories are the actual gating signal — easy to retune later.
function overallConfigurationStatus(definition: ApplicationDefinition): SectionStatus {
  const { validity, categoryLevels, applicationId } = definition.overallConfiguration
  if (categoryLevels && categoryLevels.categories.length > 0) return 'complete'
  if (validity || categoryLevels || applicationId) return 'partial'
  return 'missing'
}

function hasNonMandatoryField(sections: ApplicationDefinition['registry']['sections']): boolean {
  return sections.some(
    (s) =>
      (s.fields ?? []).some((f) => f.fieldSource !== 'mandatory') ||
      (s.subsections ?? []).some((sub) => sub.fields.some((f) => f.fieldSource !== 'mandatory')),
  )
}

function registryStatus(definition: ApplicationDefinition): SectionStatus {
  return hasNonMandatoryField(definition.registry.sections) ? 'complete' : 'missing'
}

function workflowStatus(definition: ApplicationDefinition): SectionStatus {
  const { states, transitions } = definition.workflow
  const hasRoleAssignedTransition = transitions.some((t) => (t.roles ?? []).length > 0)
  if (states.length >= 2 && transitions.length >= 1 && hasRoleAssignedTransition) return 'complete'
  if (states.length >= 1 || transitions.length >= 1) return 'partial'
  return 'missing'
}

function rolesStatus(definition: ApplicationDefinition): SectionStatus {
  return definition.roles.length > 0 ? 'complete' : 'missing'
}

function checklistsStatus(definition: ApplicationDefinition): SectionStatus {
  return definition.checklists.length > 0 ? 'complete' : 'missing'
}

function feesStatus(definition: ApplicationDefinition): SectionStatus {
  const { mode, feeComponents, dependentFields, matrix, apiEndpoint } = definition.fees
  if (mode === 'custom') {
    if ((dependentFields ?? []).length > 0 && (matrix ?? []).length > 0) return 'complete'
    if ((dependentFields ?? []).length > 0) return 'partial'
    return 'missing'
  }
  if (mode === 'api') {
    return apiEndpoint ? 'complete' : 'missing'
  }
  return feeComponents.length > 0 ? 'complete' : 'missing'
}

function notificationsStatus(definition: ApplicationDefinition): SectionStatus {
  return definition.notifications.rules.length > 0 ? 'complete' : 'missing'
}

// checklists tracked but never required — excluded here, matching the plan.
const REQUIRED_FOR_OVERALL = ['metadata', 'overallConfiguration', 'registry', 'workflow', 'roles', 'fees', 'notifications'] as const

export function computeCompleteness(definition: ApplicationDefinition): CompletenessSnapshot {
  const snapshot = {
    metadata: metadataStatus(definition),
    overallConfiguration: overallConfigurationStatus(definition),
    registry: registryStatus(definition),
    workflow: workflowStatus(definition),
    roles: rolesStatus(definition),
    checklists: checklistsStatus(definition),
    fees: feesStatus(definition),
    notifications: notificationsStatus(definition),
    overall: 0,
  }
  const completeCount = REQUIRED_FOR_OVERALL.filter((key) => snapshot[key] === 'complete').length
  snapshot.overall = Math.round((completeCount / REQUIRED_FOR_OVERALL.length) * 100)
  return snapshot
}
