import { z } from 'zod'
import { RoutableDomainSchema } from './routerSchema.js'

// Real gap-analysis against one candidate template, not a similarity search
// across a library (that's still Sprint 5 — meaningless with one template
// anyway, since there's nothing to rank against). matchPercent is the
// model's own reasoned estimate, not a cosine-similarity score — worth
// being explicit about that distinction if asked.
export const TemplateSuggestionSchema = z.object({
  matchPercent: z.number().min(0).max(100),
  reply: z.string(),
  domainNotes: z.array(
    z.object({
      domain: RoutableDomainSchema,
      status: z.enum(['match', 'tweak', 'missing']),
      note: z.string(),
    }),
  ),
})

export type TemplateSuggestionLlmOutput = z.infer<typeof TemplateSuggestionSchema>
