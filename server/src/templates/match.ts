import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { TemplateSuggestion } from '../types/session.js'
import { TEMPLATES } from './library.js'
import { runTemplateSuggestion } from '../llm/templateSuggestion.js'

// Real gap-analysis against the one seed template — matchPercent/domainNotes
// are a genuine model judgment now, not the earlier fixed 0.75 stub. Ranking
// across MULTIPLE templates is still Sprint 5 work — not meaningful to build
// against a one-template library; the natural extension once more templates
// exist is running this same call once per candidate and keeping the best
// matchPercent.
export async function suggestTemplate(
  comparisonInput: { description: string } | { definition: ApplicationDefinition },
): Promise<TemplateSuggestion | null> {
  const template = TEMPLATES[0]
  if (!template) {
    return null
  }
  const result = await runTemplateSuggestion(template, comparisonInput)
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    matchPercent: result.matchPercent,
    reply: result.reply,
    domainNotes: result.domainNotes,
  }
}
