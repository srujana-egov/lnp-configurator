import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CompletenessSnapshot } from '../types/completeness.js'
import type { ValidationCheck } from '../types/compilation.js'
import type { RoutableDomain } from '../schemas/routerSchema.js'
import type { TemplateSuggestion } from '../types/session.js'

// Most of this signal already exists inside the turn-processing loop and was
// previously just discarded (per the original plan's own telemetry note) —
// this just writes it down instead of inventing a new design. One JSON line
// per turn, not a metrics/analytics pipeline: cheap enough to build now,
// structured enough to grep or load into a notebook later.
const LOGS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.logs')
const LOG_FILE = path.join(LOGS_DIR, 'turns.log')

export interface TurnLogEntry {
  sessionId: string
  messageLength: number
  fileCount: number
  clarifyingQuestion: boolean
  // Domains that actually changed (from diff.ts), not just the domains the
  // router picked — a more useful signal than routing intent alone.
  domainsChanged: RoutableDomain[]
  completenessBefore: CompletenessSnapshot
  completenessAfter: CompletenessSnapshot
  referenceChecks: ValidationCheck[]
  templateSuggestions: TemplateSuggestion[]
}

export function logTurn(entry: TurnLogEntry): void {
  fs.mkdirSync(LOGS_DIR, { recursive: true })
  fs.appendFileSync(LOG_FILE, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`)
}
