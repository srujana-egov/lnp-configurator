import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildNextStepSuggestionInstructions, buildNextStepSuggestionUserContent } from './promptBuilder.js'
import { NextStepSuggestionSchema, type NextStepSuggestionLlmOutput } from '../schemas/nextStepSuggestionSchema.js'
import { ExtractionError } from './errors.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'

// Same cost-optimized model tier as the router/template-suggestion calls —
// this is a nudge, not deep extraction. Called at session start (empty
// transcript) and on-demand via the "What should I look at next?" button
// (real transcript) — never automatically on every turn, that would get
// repetitive fast.
export async function runNextStepSuggestion(
  definition: ApplicationDefinition,
  transcript: ConversationMessage[],
): Promise<NextStepSuggestionLlmOutput> {
  const content = buildNextStepSuggestionUserContent(definition, transcript)

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiRouterModel,
      input: [
        { role: 'system', content: buildNextStepSuggestionInstructions() },
        { role: 'user', content },
      ],
      text: { format: zodTextFormat(NextStepSuggestionSchema, 'next_step_suggestion') },
    })
  } catch (err) {
    throw new ExtractionError(`Next-step suggestion call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const parsed = response.output_parsed
  if (!parsed) {
    throw new ExtractionError('Next-step suggestion returned no parsed output (refusal or empty response)')
  }
  return parsed
}
