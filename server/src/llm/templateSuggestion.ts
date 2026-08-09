import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildTemplateSuggestionInstructions, buildTemplateSuggestionUserContent } from './promptBuilder.js'
import { TemplateSuggestionSchema, type TemplateSuggestionLlmOutput } from '../schemas/templateSuggestionSchema.js'
import { ExtractionError } from './errors.js'
import type { TemplateDefinition } from '../templates/library.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'

// Same cost-optimized model tier as the router — this is a judgment call
// about overlap, not deep extraction.
export async function runTemplateSuggestion(
  template: TemplateDefinition,
  comparisonInput: { description: string } | { definition: ApplicationDefinition },
): Promise<TemplateSuggestionLlmOutput> {
  const content = buildTemplateSuggestionUserContent(template.name, template.definition, comparisonInput)

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiRouterModel,
      input: [
        { role: 'system', content: buildTemplateSuggestionInstructions() },
        { role: 'user', content },
      ],
      text: { format: zodTextFormat(TemplateSuggestionSchema, 'template_suggestion') },
    })
  } catch (err) {
    throw new ExtractionError(`Template suggestion call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const parsed = response.output_parsed
  if (!parsed) {
    throw new ExtractionError('Template suggestion returned no parsed output (refusal or empty response)')
  }
  return parsed
}
