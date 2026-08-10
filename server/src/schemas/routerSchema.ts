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
