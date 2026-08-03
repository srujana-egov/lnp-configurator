import type { ChatSession } from '../types/session.js'
import { EMPTY_APPLICATION_DEFINITION } from '../types/applicationDefinition.js'
import { EMPTY_COMPLETENESS } from '../types/completeness.js'

// In-memory only — deliberately. File-per-session persistence is genuinely
// Sprint 5 work (Aug 16), not pulled forward: it's not needed to run today's
// test in one sitting, and pulling it forward here would be scope creep this
// plan explicitly warns against.
const sessions = new Map<string, ChatSession>()

export function createSession(): ChatSession {
  const session: ChatSession = {
    sessionId: crypto.randomUUID(),
    definition: EMPTY_APPLICATION_DEFINITION,
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
