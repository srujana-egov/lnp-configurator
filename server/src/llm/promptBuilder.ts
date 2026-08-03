import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'
import { canonicalToLlmInput } from '../schemas/toCanonical.js'

const moduleDir = dirname(fileURLToPath(import.meta.url))
const bestPractices = readFileSync(join(moduleDir, 'bestPractices.md'), 'utf-8')

export interface UploadedFile {
  filename: string
  mimeType: string
  base64: string
}

// v1, Sprint 1: cross-domain classification (light-touch) + real extraction for
// Application Form only. Widens to real extraction for every domain in Sprint 2 —
// this instructions string is exactly where that widening happens later.
export function buildInstructions(): string {
  return `You are the AI configurator for a government license/permit application system. You read free-text chat and uploaded documents, and progressively fill in a structured application configuration.

## Scope for this turn — read carefully
Only Application Form (the "registry" part of the definition) gets real structured extraction right now. If the user's message or an uploaded document is actually about Roles, Workflow, Checklist, Fees, Notifications, or Other Information: do NOT attempt structured extraction for those parts. Just acknowledge briefly in your reply (e.g. "Noted — we'll build out Workflow once we get to that step") and leave those parts of the definition exactly as they were sent to you. Anything that doesn't fit any domain at all goes into otherInformation.notes as free text instead.

## Document classification
Every uploaded document is exactly one of:
- An applicant-facing form with blanks to fill in -> every blank becomes one field in registry.sections, type inferred from context.
- A document's own "Attached Documents" / required-attachments list -> registry.documents, NOT more fields. One document can produce both at once.
- Anything else -> follow the scope rule above.

## Best practices (domain knowledge, not general LLM knowledge)
${bestPractices}

## Hard rules
- Preserve existing labels and content for anything unchanged from the current definition — do not silently rename or reorder things.
- Ask exactly one clarifying question at a time (or none, if you have enough), prioritizing Application Form since that's this sprint's focus.
- Always return the full next-state definition, not a delta.
- Never invent a conditional or repeating field structure — only recognize one if it's already present in the current definition.
- Do not include ids anywhere — you are never asked for them and should not try to assign them.`
}

interface InputTextContent {
  type: 'input_text'
  text: string
}

interface InputFileContent {
  type: 'input_file'
  filename: string
  file_data: string
}

export function buildUserContent(
  currentDefinition: ApplicationDefinition,
  transcript: ConversationMessage[],
  newMessage: string,
  files: UploadedFile[],
): (InputTextContent | InputFileContent)[] {
  const recentTranscript = transcript
    .slice(-6)
    .map((m) => `${m.role}: ${m.text}`)
    .join('\n')

  const text = [
    `Current definition:\n${JSON.stringify(canonicalToLlmInput(currentDefinition))}`,
    recentTranscript ? `Recent conversation:\n${recentTranscript}` : null,
    `New message:\n${newMessage || '(no text, see attached file(s))'}`,
  ]
    .filter((part): part is string => part !== null)
    .join('\n\n')

  const content: (InputTextContent | InputFileContent)[] = [{ type: 'input_text', text }]
  for (const file of files) {
    content.push({
      type: 'input_file',
      filename: file.filename,
      file_data: `data:${file.mimeType};base64,${file.base64}`,
    })
  }
  return content
}
