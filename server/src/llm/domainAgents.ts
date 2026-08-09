import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import { openai } from './client.js'
import { config } from '../config.js'
import { buildDomainInstructions, buildDomainUserContent, type UploadedFile } from './promptBuilder.js'
import { buildDomainResponseSchema } from '../schemas/domainResponseSchema.js'
import {
  MetadataSchema,
  RegistrySchema,
  WorkflowSchema,
  ChecklistDefinitionSchema,
  FeeConfigSchema,
  NotificationsSchema,
  OtherInformationSchema,
  RoleSchema,
} from '../schemas/applicationDefinitionSchema.js'
import {
  metadataFromLlm,
  metadataToLlm,
  registryFromLlm,
  registryToLlm,
  workflowFromLlm,
  workflowToLlm,
  checklistsFromLlm,
  checklistsToLlm,
  feesFromLlm,
  feesToLlm,
  notificationsFromLlm,
  notificationsToLlm,
  otherInformationFromLlm,
  otherInformationToLlm,
  rolesFromLlm,
  rolesToLlm,
} from '../schemas/toCanonical.js'
import { ExtractionError } from './errors.js'
import type { RoutableDomain } from '../schemas/routerSchema.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'

export interface DomainAgentResult {
  domain: RoutableDomain
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  extractionNotes: string | null
  applyTo: (definition: ApplicationDefinition) => ApplicationDefinition
}

// Small, explicit, read-only cross-references — never full access to another
// domain's schema, just enough for a specialist not to contradict what's
// already real elsewhere (Workflow needs real Role names; Notifications and
// Checklist benefit from knowing real Workflow state labels, though neither
// is required to strictly resolve to one — see promptBuilder.ts's rules).
function crossReferenceFor(domain: RoutableDomain, definition: ApplicationDefinition): string | null {
  if (domain === 'workflow') {
    return definition.roles.length > 0
      ? `Existing roles you may assign (read-only, do not edit): ${JSON.stringify(definition.roles)}`
      : 'No roles exist yet — do not invent one; mention in your reply if a role is needed.'
  }
  if (domain === 'checklists' || domain === 'notifications') {
    const stateLabels = definition.workflow.states.map((s) => s.label)
    return stateLabels.length > 0
      ? `Existing workflow state labels (read-only, do not edit): ${JSON.stringify(stateLabels)}`
      : 'No workflow states exist yet.'
  }
  if (domain === 'fees') {
    // Real evidence: the actual product's own Custom Logic "Select Fields"
    // step pulls dependency options from the Application Form, with an
    // explicit real message when a needed field isn't there yet ("add it
    // first in Application Configuration -> Form"). Same rule here.
    const fields: { label: string; type: string; dropdownOptions?: string[] }[] = []
    definition.registry.sections.forEach((s) => {
      (s.fields ?? []).forEach((f) => fields.push({ label: f.label, type: f.type, dropdownOptions: f.dropdownOptions }))
      ;(s.subsections ?? []).forEach((sub) =>
        sub.fields.forEach((f) => fields.push({ label: f.label, type: f.type, dropdownOptions: f.dropdownOptions })),
      )
    })
    return fields.length > 0
      ? `Existing Application Form fields you may base a fee dependency on (read-only, do not edit): ${JSON.stringify(fields)}`
      : 'No Application Form fields exist yet — if a fee dependency is described, say the field needs to be added to the Form first, do not invent one.'
  }
  return null
}

interface DomainAgentResponse<T> {
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  extractionNotes: string | null
  data: T
}

async function callDomainAgent<T extends z.ZodTypeAny>(
  domain: RoutableDomain,
  domainSchema: T,
  currentSlice: unknown,
  crossReference: string | null,
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Promise<DomainAgentResponse<z.infer<T>>> {
  const content = buildDomainUserContent(currentSlice, crossReference, transcript, message, files)
  const responseSchema = buildDomainResponseSchema(domainSchema)

  let response
  try {
    response = await openai.responses.parse({
      model: config.openaiModel,
      input: [
        { role: 'system', content: buildDomainInstructions(domain) },
        { role: 'user', content },
      ],
      text: { format: zodTextFormat(responseSchema, 'domain_response') },
    })
  } catch (err) {
    throw new ExtractionError(`${domain} specialist call failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  // Cast, not a leap of faith: Zod's own validation inside responses.parse
  // already guarantees this shape at runtime (that's what zodTextFormat is
  // for) — TS just can't resolve the generic `data: T` field through its own
  // conditional-optionality machinery when T is still a type parameter here.
  const parsed = response.output_parsed as DomainAgentResponse<z.infer<T>> | null
  if (!parsed) {
    throw new ExtractionError(`${domain} specialist returned no parsed output (refusal or empty response)`)
  }
  return parsed
}

export async function runDomainAgent(
  domain: RoutableDomain,
  currentDefinition: ApplicationDefinition,
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Promise<DomainAgentResult> {
  const crossReference = crossReferenceFor(domain, currentDefinition)
  const withCommon = (parsed: { reply: string; clarifyingQuestion: string | null; suggestedReplies: string[]; extractionNotes: string | null }) => ({
    domain,
    reply: parsed.reply,
    clarifyingQuestion: parsed.clarifyingQuestion,
    suggestedReplies: parsed.suggestedReplies,
    extractionNotes: parsed.extractionNotes,
  })

  switch (domain) {
    case 'metadata': {
      const parsed = await callDomainAgent(domain, MetadataSchema, metadataToLlm(currentDefinition.metadata), crossReference, transcript, message, files)
      const slice = metadataFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, metadata: slice }) }
    }
    case 'registry': {
      const parsed = await callDomainAgent(domain, RegistrySchema, registryToLlm(currentDefinition.registry), crossReference, transcript, message, files)
      const slice = registryFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, registry: slice }) }
    }
    case 'workflow': {
      const parsed = await callDomainAgent(domain, WorkflowSchema, workflowToLlm(currentDefinition.workflow), crossReference, transcript, message, files)
      const slice = workflowFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, workflow: slice }) }
    }
    case 'roles': {
      const parsed = await callDomainAgent(domain, z.array(RoleSchema), rolesToLlm(currentDefinition.roles), crossReference, transcript, message, files)
      const slice = rolesFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, roles: slice }) }
    }
    case 'checklists': {
      const parsed = await callDomainAgent(domain, z.array(ChecklistDefinitionSchema), checklistsToLlm(currentDefinition.checklists), crossReference, transcript, message, files)
      const slice = checklistsFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, checklists: slice }) }
    }
    case 'fees': {
      const parsed = await callDomainAgent(domain, FeeConfigSchema, feesToLlm(currentDefinition.fees), crossReference, transcript, message, files)
      const slice = feesFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, fees: slice }) }
    }
    case 'notifications': {
      const parsed = await callDomainAgent(domain, NotificationsSchema, notificationsToLlm(currentDefinition.notifications), crossReference, transcript, message, files)
      const slice = notificationsFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, notifications: slice }) }
    }
    case 'otherInformation': {
      const parsed = await callDomainAgent(domain, OtherInformationSchema, otherInformationToLlm(currentDefinition.otherInformation), crossReference, transcript, message, files)
      const slice = otherInformationFromLlm(parsed.data)
      return { ...withCommon(parsed), applyTo: (d) => ({ ...d, otherInformation: slice }) }
    }
    default: {
      const _exhaustive: never = domain
      throw new Error(`Unhandled domain: ${_exhaustive}`)
    }
  }
}
