import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildWelcomeStartersInstructions, buildWelcomeStartersUserContent } from './promptBuilder.js'
import { WelcomeStartersSchema, type WelcomeStartersLlmOutput } from '../schemas/welcomeStartersSchema.js'
import { ExtractionError } from './errors.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'

// Same cost-optimized model tier as the router/next-step-suggestion calls
// — this proposes starting examples, it doesn't extract anything.
export async function runWelcomeStarters(domain: string, definition: ApplicationDefinition): Promise<WelcomeStartersLlmOutput> {
  const content = buildWelcomeStartersUserContent(definition)

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiRouterModel,
      input: [
        { role: 'system', content: buildWelcomeStartersInstructions(domain) },
        { role: 'user', content },
      ],
      text: { format: zodTextFormat(WelcomeStartersSchema, 'welcome_starters') },
    })
  } catch (err) {
    throw new ExtractionError(`Welcome-starters call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const parsed = response.output_parsed
  if (!parsed) {
    throw new ExtractionError('Welcome-starters returned no parsed output (refusal or empty response)')
  }
  return parsed
}
