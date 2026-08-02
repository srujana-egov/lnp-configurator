import type { ApplicationDefinition } from '@/types/applicationDefinition'
import type { ValidationCheck } from '@/types/compilation'

function toFieldCode(label: string): string {
  const words = label.trim().split(/\s+/)
  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

let checkCounter = 0
function check(label: string, passed: boolean): ValidationCheck {
  checkCounter += 1
  return { id: `check-${checkCounter}`, label, status: passed ? 'passed' : 'failed' }
}

/**
 * Cross-reference validation performed by the Reference Resolver.
 * Pure function of the Application Definition — same input always produces the same checklist.
 */
export function validateApplicationDefinition(def: ApplicationDefinition): ValidationCheck[] {
  const checks: ValidationCheck[] = []

  checks.push(check(def.metadata.name ? `Metadata complete ("${def.metadata.name}")` : 'Metadata complete', Boolean(def.metadata.name)))

  checks.push(
    check(
      def.workflow.states.length > 0 ? `Workflow defined (${def.workflow.states.length} states)` : 'Workflow defined',
      def.workflow.states.length > 0,
    ),
  )

  checks.push(
    check(
      def.registry.sections.length > 0 ? `Registry defined (${def.registry.sections.length} sections)` : 'Registry defined',
      def.registry.sections.length > 0,
    ),
  )

  const assignedRoles = Array.from(new Set(def.workflow.states.map((s) => s.assignedRole).filter((role): role is string => Boolean(role))))
  if (assignedRoles.length === 0) {
    checks.push(check('Role assignments defined', def.roles.length > 0))
  } else {
    for (const role of assignedRoles) {
      const exists = def.roles.includes(role)
      checks.push(check(exists ? `Role "${role}" exists` : `Role "${role}" is assigned but does not exist`, exists))
    }
  }

  checks.push(
    check(
      def.fees.rules.length > 0 ? `Fee rules defined (${def.fees.rules.length} rules)` : 'Fee rules defined',
      def.fees.rules.length > 0,
    ),
  )

  const stateLabels = def.workflow.states.map((s) => s.label)
  if (def.notifications.rules.length === 0) {
    checks.push(check('Notification references defined', false))
  } else {
    for (const rule of def.notifications.rules) {
      const exists = stateLabels.includes(rule.event)
      checks.push(
        check(
          exists
            ? `Notification references workflow state "${rule.event}"`
            : `Notification references missing workflow state "${rule.event}"`,
          exists,
        ),
      )
    }
  }

  return checks
}

export function isValidationSuccessful(checks: ValidationCheck[]): boolean {
  return checks.every((c) => c.status === 'passed')
}

/** Deterministic Registry compiler — Application Definition registry → registry.json */
export function compileRegistry(def: ApplicationDefinition) {
  return {
    service: def.metadata.name ?? 'Untitled Application',
    tenantId: 'default',
    sections: def.registry.sections.map((section) => ({
      name: section.title,
      conditional: Boolean(section.conditional),
      fields: section.fields.map((field) => toFieldCode(field.label)),
    })),
    fields: def.registry.sections.flatMap((section) =>
      section.fields.map((field) => ({
        code: toFieldCode(field.label),
        type: field.type,
        required: Boolean(field.required),
        ...(field.visibleWhen ? { visibleWhen: field.visibleWhen } : {}),
      })),
    ),
  }
}

/** Deterministic Workflow compiler — Application Definition workflow → workflow.json */
export function compileWorkflow(def: ApplicationDefinition) {
  const labelById = new Map(def.workflow.states.map((s) => [s.id, s.label]))
  return {
    tenantId: 'default',
    businessService: def.metadata.name ?? 'Untitled Application',
    states: def.workflow.states.map((s) => s.label),
    transitions: def.workflow.transitions.map((t) => ({
      from: labelById.get(t.from) ?? t.from,
      to: labelById.get(t.to) ?? t.to,
    })),
    roleAssignments: def.workflow.states
      .filter((s) => s.assignedRole)
      .map((s) => ({ state: s.label, role: s.assignedRole })),
  }
}

/** Deterministic Fee compiler — Application Definition fees → calculation.json */
export function compileFees(def: ApplicationDefinition) {
  return {
    tenantId: 'default',
    service: def.metadata.name ?? 'Untitled Application',
    rules: def.fees.rules.map((rule) => ({ condition: rule.condition, amount: rule.amount, currency: 'GBP' })),
  }
}

/** Deterministic Notification compiler — Application Definition notifications → notification.json */
export function compileNotifications(def: ApplicationDefinition) {
  return {
    tenantId: 'default',
    service: def.metadata.name ?? 'Untitled Application',
    events: def.notifications.rules.map((rule) => ({
      event: rule.event,
      channel: rule.channel,
      recipient: rule.recipient,
    })),
  }
}
