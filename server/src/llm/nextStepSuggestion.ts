import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildNextStepSuggestionInstructions, buildNextStepSuggestionUserContent } from './promptBuilder.js'
import { NextStepSuggestionSchema, type NextStepSuggestionLlmOutput } from '../schemas/nextStepSuggestionSchema.js'
import { ExtractionError } from './errors.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'
import type { CompletenessSnapshot } from '../types/completeness.js'

// Same cost-optimized model tier as the router/template-suggestion calls —
// this is a nudge, not deep extraction. Called at session start (empty
// transcript), on-demand via the "What should I look at next?" button, and
// now proactively after every turn that doesn't already have a pending
// clarifyingQuestion (extractTurn.ts decides that, to avoid ever stacking
// two questions in one turn). The completeness snapshot lets it target the
// next incomplete domain directly instead of re-deriving that from raw
// JSON each time.
export async function runNextStepSuggestion(
  definition: ApplicationDefinition,
  completeness: CompletenessSnapshot,
  transcript: ConversationMessage[],
): Promise<NextStepSuggestionLlmOutput> {
  const content = buildNextStepSuggestionUserContent(definition, completeness, transcript)

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
