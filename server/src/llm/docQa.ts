import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { ExtractionError } from './errors.js'

// One reference file per domain — the system's own knowledge about what
// that step's fields/buttons mean, authored once, never uploaded per
// session. Not true RAG (no chunking, no embeddings, no vector store): each
// file is short enough to hand the model directly as context. A domain
// with no file here just has no "explain this step" mode yet — real gap,
// not silently faked, until more of these get written.
const KNOWLEDGE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../knowledge')

export function hasStepKnowledge(domain: string): boolean {
  return fs.existsSync(path.join(KNOWLEDGE_DIR, `${domain}.md`))
}

const DocQaSchema = z.object({
  answer: z.string(),
})

export async function answerFromStepKnowledge(domain: string, question: string): Promise<string> {
  const doc = fs.readFileSync(path.join(KNOWLEDGE_DIR, `${domain}.md`), 'utf-8')

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiModel,
      input: [
        {
          role: 'system',
          content:
            'Answer questions about this configuration step using ONLY the reference document below. Ground every answer in its actual content — quote or closely paraphrase the relevant part. If the document does not cover the question, say so plainly rather than answering from general knowledge.\n\n## Reference document\n' +
            doc,
        },
        { role: 'user', content: [{ type: 'input_text', text: question }] },
      ],
      text: { format: zodTextFormat(DocQaSchema, 'doc_qa_response') },
    })
  } catch (err) {
    throw new ExtractionError(`Step Q&A call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const parsed = response.output_parsed
  if (!parsed) {
    throw new ExtractionError('Step Q&A returned no parsed output (refusal or empty response)')
  }
  return parsed.answer
}
