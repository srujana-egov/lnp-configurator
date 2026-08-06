import type { ChatSession } from '../types/session.js'
import { EMPTY_APPLICATION_DEFINITION } from '../types/applicationDefinition.js'
import { EMPTY_COMPLETENESS } from '../types/completeness.js'
import { buildMandatoryDefaultSections } from '../domain/mandatoryDefaults.js'
import { getTemplate } from '../templates/library.js'

// In-memory only — deliberately. File-per-session persistence is genuinely
// Sprint 5 work (Aug 16), not pulled forward: it's not needed to run today's
// test in one sitting, and pulling it forward here would be scope creep this
// plan explicitly warns against.
const sessions = new Map<string, ChatSession>()

// templateId is the Sprint 1 demo feedback #2 entry point ("people start from
// a template and tweak, not always from a blank dump") — when given, seeds
// definition from that template instead of the fully-empty default. Either
// way, the mandatory baseline (feedback #4) is always present from turn zero,
// never something the first AI turn has to introduce.
export function createSession(templateId?: string): ChatSession {
  const template = templateId ? getTemplate(templateId) : undefined
  const definition = template
    ? template.definition
    : {
        ...EMPTY_APPLICATION_DEFINITION,
        registry: {
          ...EMPTY_APPLICATION_DEFINITION.registry,
          sections: buildMandatoryDefaultSections(),
        },
      }

  const session: ChatSession = {
    sessionId: crypto.randomUUID(),
    definition,
    completeness: EMPTY_COMPLETENESS,
    messages: [],
    dismissedTemplateIds: [],
  }
  sessions.set(session.sessionId, session)
  return session
}

export function getSession(sessionId: string): ChatSession | undefined {
  return sessions.get(sessionId)
}

export function saveSession(session: ChatSession): void {
  sessions.set(session.sessionId, session)
}
