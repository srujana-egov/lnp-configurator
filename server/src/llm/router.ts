import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildRouterInstructions, buildRouterUserContent, type UploadedFile } from './promptBuilder.js'
import { RouterSchema, type RouterLlmOutput } from '../schemas/routerSchema.js'
import { ExtractionError } from './errors.js'
import type { ConversationMessage } from '../types/session.js'

// Cheap classification call, run on every turn before any domain specialist.
// Uses the cost-optimized model tier (not -terra, the main extraction tier)
// since this is a simpler task than deep extraction — same Sol/Terra/Luna
// tiering logic already used to justify -terra for real extraction, applied
// in the other direction here.
export async function runRouter(
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Promise<RouterLlmOutput> {
  const content = buildRouterUserContent(transcript, message, files)

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiRouterModel,
      input: [
        { role: 'system', content: buildRouterInstructions() },
        { role: 'user', content },
      ],
      text: { format: zodTextFormat(RouterSchema, 'router_response') },
    })
  } catch (err) {
    throw new ExtractionError(`Router call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const parsed = response.output_parsed
  if (!parsed) {
    throw new ExtractionError('Router returned no parsed output (refusal or empty response)')
  }
  return parsed
}
