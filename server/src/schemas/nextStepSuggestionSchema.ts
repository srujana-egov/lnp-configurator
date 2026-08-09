import { z } from 'zod'

// Same shape as the router/turn response on purpose — the harness renders
// this with the exact same chip mechanism (renderChips) already built for
// everything else, no new UI needed for the "clickable" part.
export const NextStepSuggestionSchema = z.object({
  reply: z.string(),
  suggestedReplies: z.array(z.string()),
})

export type NextStepSuggestionLlmOutput = z.infer<typeof NextStepSuggestionSchema>
