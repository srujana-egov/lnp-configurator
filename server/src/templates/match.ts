import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { TemplateSuggestion } from '../types/session.js'
import { TEMPLATES } from './library.js'

// STUB — Sprint 1 demo feedback #2's "suggest a template" button needs to be
// real and clickable now; the actual embedding-based matching against a real
// library (config.openaiEmbeddingModel, cosine similarity) is still Sprint 5.
// This returns the one seed template with a fixed similarity note so the
// affordance works end-to-end today, without pretending the matching is real.
export function suggestTemplate(_definition: ApplicationDefinition): TemplateSuggestion | null {
  const template = TEMPLATES[0]
  if (!template) {
    return null
  }
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    similarity: 0.75,
  }
}
