import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { RoutableDomain } from '../schemas/routerSchema.js'

// Same 8 domains the router can send content to (RoutableDomain) — 'settings'
// is excluded because nothing in this backend ever writes it, same reasoning
// routerSchema.ts already uses.
const DIFFABLE_DOMAINS: RoutableDomain[] = [
  'metadata',
  'overallConfiguration',
  'registry',
  'workflow',
  'roles',
  'checklists',
  'fees',
  'notifications',
  'otherInformation',
]

// Ids are reconciled (see reconcileIds.ts) before this ever runs, so an
// unchanged item serializes identically turn to turn — a plain JSON.stringify
// comparison is enough to tell real content changes apart from id churn,
// no diff library needed for something this shallow.
export function diffDefinitions(oldDefinition: ApplicationDefinition, newDefinition: ApplicationDefinition): RoutableDomain[] {
  return DIFFABLE_DOMAINS.filter((domain) => JSON.stringify(oldDefinition[domain]) !== JSON.stringify(newDefinition[domain]))
}
