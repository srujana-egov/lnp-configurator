import type { ApplicationDefinition, RegistrySection } from '../types/applicationDefinition.js'
import { freshId } from '../schemas/toCanonical.js'

const MANDATORY_APPLICANT_DETAILS_TITLE = 'Applicant Details'

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
    system: true,
    fields: [
      { id: freshId(), label: 'Full Name', type: 'text', required: true, validationNotes: 'Min 3 characters', fieldSource: 'mandatory' },
      { id: freshId(), label: 'Mobile Number', type: 'phone', required: true, validationNotes: '10-digit number', fieldSource: 'mandatory' },
      { id: freshId(), label: 'Email Address', type: 'email', required: false, fieldSource: 'mandatory' },
      {
        id: freshId(),
        label: 'ID Type',
        type: 'dropdown',
        required: true,
        dropdownOptions: ['Passport', 'Driving License', 'ID Card', 'Foreigner ID', 'Residence ID'],
        fieldSource: 'mandatory',
      },
      { id: freshId(), label: 'ID Number', type: 'text', required: true, fieldSource: 'mandatory' },
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
