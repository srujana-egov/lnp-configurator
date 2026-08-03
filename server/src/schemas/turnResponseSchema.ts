import { z } from 'zod'
import { ApplicationDefinitionSchema } from './applicationDefinitionSchema.js'

// The object actually passed to zodTextFormat. Deliberately lean — anything
// computable from the definition (completeness, reference checks, highlights,
// draft summary) is computed server-side, never asked of the model. Only
// genuine model judgments live here.
export const TurnResponseSchema = z.object({
  reply: z.string(),
  clarifyingQuestion: z.string().nullable(),
  suggestedReplies: z.array(z.string()),
  // Full next-state, not a delta — matches the existing frontend prototype's own
  // fold-the-whole-object precedent (DemoContext.foldDefinition).
  definition: ApplicationDefinitionSchema,
  extractionNotes: z.string().nullable(),
})

export type TurnResponseLlmOutput = z.infer<typeof TurnResponseSchema>
