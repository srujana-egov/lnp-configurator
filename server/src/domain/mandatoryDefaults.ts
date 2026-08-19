import type { ApplicationDefinition, RegistrySection } from '../types/applicationDefinition.js'
import { freshId } from '../schemas/toCanonical.js'

const MANDATORY_APPLICANT_DETAILS_TITLE = 'Applicant Details'

// Real attribution for a field that was never extracted from anything —
// "where did this come from" has an honest answer here too, not just for
// AI-authored fields.
const MANDATORY_FIELD_SOURCE = 'Standard platform requirement — not extracted from a document or message'

// Real, code-level baseline — not something a model is asked for, and not
// something conversation can remove. Sprint 1 demo feedback (#4): compulsory
// fields need to be deterministic, not something a prompt merely tends to
// respect. See mergeDomainResults.ts for the other enforcement point.
//
// Verified directly against the real Application Form screen (Camara
// Municipal de Bissau tenant) — no longer a placeholder. Note Email Address
// is genuinely Optional on the real screen, not Required — resist the urge
// to "fix" that; it's what the real product actually does.
function buildMandatoryApplicantDetailsSection(): RegistrySection {
  return {
    id: freshId(),
    title: MANDATORY_APPLICANT_DETAILS_TITLE,
    kind: 'applicant',
    system: true,
    fields: [
      { id: freshId(), label: 'Full Name', type: 'text', required: true, validationNotes: 'Min 3 characters', fieldSource: 'mandatory', source: MANDATORY_FIELD_SOURCE },
      { id: freshId(), label: 'Mobile Number', type: 'phone', required: true, validationNotes: '10-digit number', fieldSource: 'mandatory', source: MANDATORY_FIELD_SOURCE },
      { id: freshId(), label: 'Email Address', type: 'email', required: false, fieldSource: 'mandatory', source: MANDATORY_FIELD_SOURCE },
      {
        id: freshId(),
        label: 'ID Type',
        type: 'dropdown',
        required: true,
        dropdownOptions: ['Passport', 'Driving License', 'ID Card', 'Foreigner ID', 'Residence ID'],
        fieldSource: 'mandatory',
        source: MANDATORY_FIELD_SOURCE,
      },
      { id: freshId(), label: 'ID Number', type: 'text', required: true, fieldSource: 'mandatory', source: MANDATORY_FIELD_SOURCE },
    ],
  }
}

// Used by sessionStore.ts to seed a brand new session — replaces seeding
// registry.sections as fully empty.
export function buildMandatoryDefaultSections(): RegistrySection[] {
  return [buildMandatoryApplicantDetailsSection()]
}

// Re-asserts the mandatory baseline after every merge, regardless of what a
// domain specialist returned — this is what actually makes "compulsory"
// deterministic rather than a hope. Matched by title, not id (ids are
// regenerated fresh every session/turn, never stable identifiers here).
export function enforceMandatoryDefaults(definition: ApplicationDefinition): ApplicationDefinition {
  const hasApplicantDetails = definition.registry.sections.some((s) => s.title === MANDATORY_APPLICANT_DETAILS_TITLE)
  if (hasApplicantDetails) {
    return definition
  }
  return {
    ...definition,
    registry: {
      ...definition.registry,
      sections: [buildMandatoryApplicantDetailsSection(), ...definition.registry.sections],
    },
  }
}

// The discontinued form builder enforced 'address'/'applicant' as singleton
// section kinds (greying the option out once added) — a real guardrail our
// own extraction has no equivalent of yet. Keeps the first occurrence of
// each non-custom kind and drops any later duplicate, rather than silently
// allowing two "Address"-kind sections to coexist.
export function dedupeSectionsByKind(definition: ApplicationDefinition): ApplicationDefinition {
  const seenKinds = new Set<string>()
  const sections = definition.registry.sections.filter((s) => {
    if (!s.kind || s.kind === 'custom') return true
    if (seenKinds.has(s.kind)) return false
    seenKinds.add(s.kind)
    return true
  })
  if (sections.length === definition.registry.sections.length) {
    return definition
  }
  return { ...definition, registry: { ...definition.registry, sections } }
}

// Real, live-verified gap: turning Renewal off only ever edits
// overallConfiguration itself (that's the one domain the agent handling
// that message writes to) — nothing tells Workflow or Checklist their own
// renewal-specific content is now stale, so a renewal-transition graph or
// a renewal checklist can silently outlive the module that owns it.
// Fixed deterministically here for the two domains with a real, structural
// way to know which content is renewal-only (Workflow.renewalTransitions is
// its own field; ChecklistDefinition.module is explicitly tagged).
// Notifications has no equivalent tag — a NotificationRule can't
// structurally tell a renewal-flavored rule apart from an issuance one
// (the real product's own "Application Submitted" event is reused, with a
// different message, by both) — a real, currently-unclosed gap, not an
// oversight.
export function enforceRenewalModuleConsistency(definition: ApplicationDefinition): ApplicationDefinition {
  if (definition.overallConfiguration.modules.renewal) {
    return definition
  }
  let next = definition
  if (next.workflow.renewalTransitions && next.workflow.renewalTransitions.length > 0) {
    next = { ...next, workflow: { ...next.workflow, renewalTransitions: undefined } }
  }
  if (next.checklists.some((c) => c.module === 'renewal')) {
    next = { ...next, checklists: next.checklists.filter((c) => c.module !== 'renewal') }
  }
  return next
}
