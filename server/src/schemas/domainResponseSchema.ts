import { z } from 'zod'

// One uniform wrapper shape for every domain specialist call — only `data`'s
// inner shape changes per domain (Registry, Workflow, FeeConfig, ...). Keeping
// the wrapper identical across domains is what lets domainAgents.ts call and
// unwrap every domain the same way, regardless of which domain it dispatched to.
export function buildDomainResponseSchema<T extends z.ZodTypeAny>(domainSchema: T) {
  return z.object({
    reply: z.string(),
    clarifyingQuestion: z.string().nullable(),
    suggestedReplies: z.array(z.string()),
    extractionNotes: z.string().nullable(),
    data: domainSchema,
  })
}
