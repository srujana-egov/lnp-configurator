import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildInstructions, buildUserContent, type UploadedFile } from './promptBuilder.js'
import { TurnResponseSchema } from '../schemas/turnResponseSchema.js'
import { llmOutputToCanonical } from '../schemas/toCanonical.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'

export class ExtractionError extends Error {}

export interface RunTurnResult {
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  definition: ApplicationDefinition
  extractionNotes: string | null
}

// Stateless per call, on purpose: resend the current definition + a short
// transcript every turn rather than chaining previous_response_id, so
// everything stays locally inspectable/replayable. sessionStore is the sole
// source of truth, not OpenAI's own conversation state.
export async function runTurn(
  currentDefinition: ApplicationDefinition,
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Promise<RunTurnResult> {
  const content = buildUserContent(currentDefinition, transcript, message, files)

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiModel,
      // No top-level "instructions" param on the Responses API — verified
      // against the real docs, not assumed. System-role message in `input`
      // instead; system/developer roles take precedence over user messages.
      input: [
        { role: 'system', content: buildInstructions() },
        { role: 'user', content },
      ],
      text: { format: zodTextFormat(TurnResponseSchema, 'turn_response') },
    })
  } catch (err) {
    throw new ExtractionError(`OpenAI call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const parsed = response.output_parsed
  if (!parsed) {
    throw new ExtractionError('Model returned no parsed output (refusal or empty response)')
  }

  return {
    reply: parsed.reply,
    clarifyingQuestion: parsed.clarifyingQuestion,
    suggestedReplies: parsed.suggestedReplies,
    definition: llmOutputToCanonical(parsed.definition),
    extractionNotes: parsed.extractionNotes,
  }
}
