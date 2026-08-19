import { z } from 'zod'

// Routable domains are broader than DefinitionSectionKey (completeness.ts) —
// completeness deliberately never tracks otherInformation, but the router
// still needs to be able to send content there, since it's the real catch-all
// for anything that doesn't fit a structured domain. 'settings' is excluded
// on purpose: draft/published/language is session bookkeeping, never
// something a chat message or document would route to.
export const RoutableDomainSchema = z.enum([
  'metadata',
  'overallConfiguration',
  'registry',
  'workflow',
  'roles',
  'checklists',
  'fees',
  'notifications',
  'otherInformation',
])

export type RoutableDomain = z.infer<typeof RoutableDomainSchema>

// The real, code-enforced answer to "does this domain's data ever reach the
// AI provider" — not a prompt-level request the model could get wrong.
// extractTurn.ts filters routed.domains through this before calling any
// specialist; a domain missing from this list is structurally guaranteed
// to never trigger a deep-extraction call, regardless of what the router
// itself classifies.
//
// All nine domains are in scope now — the explicit product decision is
// that the initial dump (free text + uploaded documents) should attribute
// content to whichever domain it actually belongs to (a workflow detail
// populates Workflow, a role populates Roles, and so on), not just the
// subset that used to be "deep-extraction." Checklists, Overall
// Configuration, Roles, Workflow, and Notifications all had real,
// already-written extraction rules (see DOMAIN_RULES in promptBuilder.ts)
// from before a narrower scope briefly excluded them — turning them back on
// is a routing-list change, not new extraction logic. SCREEN_NAME is now
// empty; kept as a type (rather than deleted) so a specific domain can be
// pulled back to screen-only again later without re-plumbing every call
// site that reads it.
export const DEEP_EXTRACTION_DOMAINS: RoutableDomain[] = [
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

export const SCREEN_NAME: Partial<Record<RoutableDomain, string>> = {}

// Deliberately lean, same principle as TurnResponseSchema: this is a
// classification step, not an extraction step, so its schema is small and
// its model tier is cheaper (gpt-5.6-luna, not -terra) — see llm/router.ts.
export const RouterSchema = z.object({
  reply: z.string(),
  domains: z.array(RoutableDomainSchema),
  // Feedback #1 from the Sprint 1 demo ("why assume the classification
  // logic — just ask the user"): when the router isn't confident which
  // domain(s) a document or message belongs to, it asks instead of
  // guessing. suggestedReplies gives the user one-click domain choices
  // instead of requiring a typed answer.
  clarifyingQuestion: z.string().nullable(),
  suggestedReplies: z.array(z.string()),
})

export type RouterLlmOutput = z.infer<typeof RouterSchema>
