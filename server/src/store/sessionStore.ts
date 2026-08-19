import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import type { ChatSession } from '../types/session.js'
import { EMPTY_APPLICATION_DEFINITION } from '../types/applicationDefinition.js'
import { buildMandatoryDefaultSections } from '../domain/mandatoryDefaults.js'
import { computeCompleteness } from '../domain/completeness.js'
import { getTemplate } from '../templates/library.js'

// SQLite, not flat JSON-per-session files — real transactional writes (no
// more temp-file-rename dance) and no data loss window between a crash and
// the next write, while still being a single file with nothing extra to run
// or deploy. Still gitignored (server/.gitignore covers .sessions/); the
// whole session stays one JSON blob per row — this data has always been
// treated as one atomic object, not a set of relational columns, and
// normalizing it further would buy nothing here.
const SESSIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.sessions')
fs.mkdirSync(SESSIONS_DIR, { recursive: true })

const db = new Database(path.join(SESSIONS_DIR, 'sessions.db'))
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

// One-time, idempotent import of sessions written by the previous
// flat-JSON-file store, run once at startup — not a separate script someone
// has to remember to run, and not something that silently drops real
// sessions just because the storage engine changed underneath them.
function importLegacyJsonSessions(): void {
  const insertIfMissing = db.prepare(
    'INSERT OR IGNORE INTO sessions (session_id, data, updated_at) VALUES (?, ?, ?)',
  )
  const files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith('.json'))
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8')
      const session = JSON.parse(raw) as ChatSession
      insertIfMissing.run(session.sessionId, raw, new Date(0).toISOString())
    } catch {
      // Not a valid legacy session file (e.g. a stray .tmp from the old
      // write path) — skip it rather than fail startup over it.
    }
  }
}
importLegacyJsonSessions()

const getStatement = db.prepare('SELECT data FROM sessions WHERE session_id = ?')
const upsertStatement = db.prepare(`
  INSERT INTO sessions (session_id, data, updated_at) VALUES (?, ?, ?)
  ON CONFLICT(session_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
`)

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

  return {
    sessionId: crypto.randomUUID(),
    definition,
    completeness: computeCompleteness(definition),
    messages: [],
    dismissedTemplateIds: [],
    feesClarifyStreak: 0,
  }
}

export function getSession(sessionId: string): ChatSession | undefined {
  const row = getStatement.get(sessionId) as { data: string } | undefined
  return row ? (JSON.parse(row.data) as ChatSession) : undefined
}

export function saveSession(session: ChatSession): void {
  upsertStatement.run(session.sessionId, JSON.stringify(session), new Date().toISOString())
}
