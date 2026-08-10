import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ValidationCheck, ValidationCheckStatus } from '../types/compilation.js'

// Adapted from the frontend prototype's own validateApplicationDefinition
// pattern (src/lib/compilers.ts) — a pure function of the whole
// ApplicationDefinition, no dependency on chat/AI mode, so it can run
// identically whether a reference was authored by a domain specialist or
// (once it exists) typed directly into a manual editing screen. Only emits a
// check when there's actually at least one reference of that kind to
// evaluate — an empty/fresh session shouldn't get a wall of vacuous passes.
//
// Deliberately not implemented here, both genuinely out of scope for what's
// modeled today: user-assigned-to-role (Users isn't a domain in
// ApplicationDefinition at all yet — AI mode never touches it, per the
// plan — so there's nothing to resolve against; this becomes a real,
// prominent check at Review & Export once Users exists) and Trade Category
// dropdown -> category hierarchy (no category hierarchy is modeled anywhere
// in this backend's types — inventing one just to satisfy this check would
// be exactly the kind of unscoped guess the plan warns against).

function check(id: string, label: string, status: ValidationCheckStatus): ValidationCheck {
  return { id, label, status }
}

function flattenRegistryFieldLabels(definition: ApplicationDefinition): Set<string> {
  const labels = new Set<string>()
  definition.registry.sections.forEach((section) => {
    (section.fields ?? []).forEach((f) => labels.add(f.label))
    ;(section.subsections ?? []).forEach((sub) => sub.fields.forEach((f) => labels.add(f.label)))
  })
  return labels
}

// Real-time, hard check — the architect's actual ask ("flag it immediately
// if they reference a role that doesn't exist"). A role either exists in the
// Roles list or it doesn't, checked fresh every turn regardless of whether
// Workflow or Roles was the domain actually touched this turn.
function checkWorkflowRoles(definition: ApplicationDefinition): ValidationCheck | null {
  const referenced = new Set<string>()
  definition.workflow.transitions.forEach((t) => (t.roles ?? []).forEach((r) => referenced.add(r)))
  definition.workflow.states.forEach((s) => {
    if (s.assignedRole) referenced.add(s.assignedRole)
  })
  if (referenced.size === 0) return null

  const roleNames = new Set(definition.roles.map((r) => r.name))
  const missing = [...referenced].filter((name) => !roleNames.has(name))
  if (missing.length > 0) {
    return check('workflow-roles-exist', `Workflow references role(s) that don't exist in Roles: ${missing.join(', ')}`, 'failed')
  }
  return check('workflow-roles-exist', 'All Workflow role references resolve to a real Role.', 'passed')
}

// Soft on purpose — Checklist is documented as genuinely optional/low-priority
// (real tenants routinely leave it empty), so a dangling stage is a warning,
// not a hard failure.
function checkChecklistStages(definition: ApplicationDefinition): ValidationCheck | null {
  const referenced = [...new Set(definition.checklists.map((c) => c.stage).filter((stage): stage is string => !!stage))]
  if (referenced.length === 0) return null

  const stateLabels = new Set(definition.workflow.states.map((s) => s.label))
  const missing = referenced.filter((stage) => !stateLabels.has(stage))
  if (missing.length > 0) {
    return check('checklist-stages-resolve', `Checklist stage(s) don't match a real Workflow state: ${missing.join(', ')}`, 'warning')
  }
  return check('checklist-stages-resolve', 'All Checklist stages resolve to a real Workflow state.', 'passed')
}

// Explicitly soft — the real Bissau tenant repurposed "Renewal Reminder" and
// "Application Submitted" for a recurring billing message with no matching
// workflow state at all. That's a legitimate real-world configuration, not a
// mistake, so this can never be a hard failure.
function checkNotificationEvents(definition: ApplicationDefinition): ValidationCheck | null {
  const referenced = [...new Set(definition.notifications.rules.map((r) => r.event).filter((event): event is string => !!event))]
  if (referenced.length === 0) return null

  const stateLabels = new Set(definition.workflow.states.map((s) => s.label))
  const missing = referenced.filter((event) => !stateLabels.has(event))
  if (missing.length > 0) {
    return check(
      'notification-events-resolve',
      `Notification event(s) don't match a Workflow state (may be intentional, e.g. a recurring reminder): ${missing.join(', ')}`,
      'warning',
    )
  }
  return check('notification-events-resolve', 'All Notification events resolve to a real Workflow state.', 'passed')
}

// Hard — this is the deterministic backstop for exactly the soft prompt-level
// nudge in domainAgents.ts's crossReferenceFor('fees', ...): the model is
// asked not to invent a field dependency, but nothing previously verified
// that after the fact, or re-checked it on a later turn where Fees itself
// wasn't the domain being touched (e.g. the dependency was real when
// authored, then the Registry field it pointed at got renamed afterward).
function checkFeesDependentFields(definition: ApplicationDefinition): ValidationCheck | null {
  const dependentFields = definition.fees.dependentFields ?? []
  if (dependentFields.length === 0) return null

  const fieldLabels = flattenRegistryFieldLabels(definition)
  const missing = dependentFields.map((d) => d.fieldLabel).filter((label) => !fieldLabels.has(label))
  if (missing.length > 0) {
    return check(
      'fees-dependent-fields-exist',
      `Fees depends on Application Form field(s) that don't exist: ${missing.join(', ')} — add them to the Form first.`,
      'failed',
    )
  }
  return check('fees-dependent-fields-exist', 'All Fees field dependencies resolve to a real Application Form field.', 'passed')
}

// Hard — a Fee Matrix row is only meaningful if its combination actually
// points at a declared dependent field and one of that field's own range
// labels; anything else is a broken lookup key, not a legitimate edge case.
function checkFeesMatrix(definition: ApplicationDefinition): ValidationCheck | null {
  const matrix = definition.fees.matrix ?? []
  const dependentFields = definition.fees.dependentFields ?? []
  if (matrix.length === 0 || dependentFields.length === 0) return null

  const rangesByField = new Map(dependentFields.map((d) => [d.fieldLabel, new Set(d.ranges.map((r) => r.label))]))
  const broken: string[] = []
  matrix.forEach((row) => {
    Object.entries(row.combination).forEach(([fieldLabel, rangeLabel]) => {
      const ranges = rangesByField.get(fieldLabel)
      if (!ranges || !ranges.has(rangeLabel)) {
        broken.push(`${fieldLabel}=${rangeLabel}`)
      }
    })
  })
  if (broken.length > 0) {
    return check('fees-matrix-resolves', `Fee Matrix row(s) reference an undeclared field/range combination: ${[...new Set(broken)].join(', ')}`, 'failed')
  }
  return check('fees-matrix-resolves', 'All Fee Matrix rows resolve to a declared field dependency and range.', 'passed')
}

export function resolveReferences(definition: ApplicationDefinition): ValidationCheck[] {
  return [
    checkWorkflowRoles(definition),
    checkChecklistStages(definition),
    checkNotificationEvents(definition),
    checkFeesDependentFields(definition),
    checkFeesMatrix(definition),
  ].filter((c): c is ValidationCheck => c !== null)
}
