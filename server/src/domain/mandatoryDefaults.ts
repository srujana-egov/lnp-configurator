import type { ApplicationDefinition, RegistrySection } from '../types/applicationDefinition.js'
import { freshId } from '../schemas/toCanonical.js'

const MANDATORY_APPLICANT_DETAILS_TITLE = 'Applicant Details'

// Real, code-level baseline — not something a model is asked for, and not
// something conversation can remove. Sprint 1 demo feedback (#4): compulsory
// fields need to be deterministic, not something a prompt merely tends to
// respect. See mergeDomainResults.ts for the other enforcement point.
//
// OPEN ITEM: the field list below is a placeholder built from what's been
// confirmed verbally so far (Name, Address, Mobile Number, Email) — not yet
// verified against the real Application Form screen's actual
// Mandatory-tagged fields. Confirm and correct before the next demo.
function buildMandatoryApplicantDetailsSection(): RegistrySection {
  return {
    id: freshId(),
    title: MANDATORY_APPLICANT_DETAILS_TITLE,
    system: true,
    fields: [
      { id: freshId(), label: 'Applicant Name', type: 'text', required: true, fieldSource: 'mandatory' },
      { id: freshId(), label: 'Address', type: 'text', required: true, fieldSource: 'mandatory' },
      { id: freshId(), label: 'Mobile Number', type: 'phone', required: true, fieldSource: 'mandatory' },
      { id: freshId(), label: 'Email', type: 'email', required: true, fieldSource: 'mandatory' },
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
