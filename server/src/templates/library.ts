import type { ApplicationDefinition, RegistrySection, WorkflowState, WorkflowTransition } from '../types/applicationDefinition.js'
import { EMPTY_APPLICATION_DEFINITION } from '../types/applicationDefinition.js'
import { buildMandatoryDefaultSections } from '../domain/mandatoryDefaults.js'
import { freshId } from '../schemas/toCanonical.js'

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  definition: ApplicationDefinition
}

// Sprint 1 demo feedback #2: people start from a template and tweak, not
// always from a blank dump — this is the plumbing for that entry point.
// Real embedding-based matching against a real library is still Sprint 5
// (templates/match.ts is a stub for now); this one seed template exists so
// the entry point is genuinely clickable and demoable already.
//
// Transcribed directly from the real product (Camara Municipal de Bissau
// tenant, datacollection.digitcertificates.online) — not approximated.
// Two real gaps this surfaced, fixed at the schema level rather than
// dropped here: WorkflowTransition gained role/action (role varies per
// transition, not per state — the real screen's "Start" state has both a
// Citizen/Apply row and a Counter Employee/Assisted Apply row), and
// NotificationRule gained message (the real screen has real templated
// message text per rule, e.g. "Ref: {APP_ID}").
//
// Not fabricated: the "If Organization / Govt Entity" tab on Owner /
// Proprietor Details exists on the real screen but its fields weren't in
// the captured screenshots — left out rather than guessed.
function buildBusinessLicenseTemplate(): ApplicationDefinition {
  const applicantDetails: RegistrySection = {
    ...buildMandatoryDefaultSections()[0]!,
    subsections: [
      {
        title: 'Applicant Address',
        fields: [
          { id: freshId(), label: 'House No / Apartment Name', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Residente', type: 'text', required: true, fieldSource: 'recommended' },
          { id: freshId(), label: 'Bairro', type: 'text', required: true, fieldSource: 'recommended' },
          { id: freshId(), label: 'Postal Code', type: 'text', required: false, validationNotes: '6-digit number', fieldSource: 'recommended' },
          { id: freshId(), label: 'City', type: 'dropdown', required: false, fieldSource: 'boundary' },
          { id: freshId(), label: 'Neighborhood', type: 'dropdown', required: true, fieldSource: 'boundary' },
        ],
      },
    ],
  }

  const ownerProprietorDetails: RegistrySection = {
    id: freshId(),
    title: 'Owner / Proprietor Details',
    system: true,
    conditional: true,
    fields: [
      {
        id: freshId(),
        label: 'Owner Type',
        type: 'dropdown',
        required: true,
        dropdownOptions: ['Individual', 'Institution'],
        fieldSource: 'mandatory',
      },
    ],
    subsections: [
      {
        title: 'If Individual',
        fields: [
          {
            id: freshId(),
            label: 'Same as Applicant',
            type: 'toggle',
            required: false,
            validationNotes: 'Pre-fills all fields below from Applicant Details; fields remain editable after toggle',
            fieldSource: 'mandatory',
          },
          { id: freshId(), label: 'Full Name', type: 'text', required: true, fieldSource: 'mandatory' },
          { id: freshId(), label: 'Mobile Number', type: 'phone', required: true, fieldSource: 'mandatory' },
          { id: freshId(), label: 'Email', type: 'email', required: false, fieldSource: 'mandatory' },
          {
            id: freshId(),
            label: 'ID Type',
            type: 'dropdown',
            required: true,
            dropdownOptions: ['Passport', 'Driving License'],
            fieldSource: 'mandatory',
          },
          { id: freshId(), label: 'ID Number', type: 'text', required: true, fieldSource: 'mandatory' },
        ],
      },
    ],
  }

  const businessDetails: RegistrySection = {
    id: freshId(),
    title: 'Business Details',
    subsections: [
      {
        title: 'General',
        fields: [
          { id: freshId(), label: 'Business / Trade Name', type: 'text', required: false, validationNotes: 'Min 3 characters', fieldSource: 'recommended' },
          { id: freshId(), label: 'Category of Business', type: 'dropdown', required: true, optionsSource: 'Overall Configuration', fieldSource: 'recommended' },
          { id: freshId(), label: 'Type of Business', type: 'dropdown', required: true, optionsSource: 'Overall Configuration', fieldSource: 'recommended' },
          { id: freshId(), label: 'Business Registration Number', type: 'text', required: false, validationNotes: '15-char alphanumeric', fieldSource: 'recommended' },
          { id: freshId(), label: 'Tax Identification Number', type: 'text', required: false, validationNotes: '10-char alphanumeric', fieldSource: 'recommended' },
          { id: freshId(), label: 'Year of Establishment', type: 'year', required: true, fieldSource: 'recommended' },
        ],
      },
      {
        title: 'Business Address',
        fields: [
          { id: freshId(), label: 'House No / Apartment Name', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Residente', type: 'text', required: true, fieldSource: 'recommended' },
          { id: freshId(), label: 'Bairro', type: 'text', required: true, fieldSource: 'recommended' },
          { id: freshId(), label: 'Postal Code', type: 'text', required: false, validationNotes: '6-digit number', fieldSource: 'recommended' },
          { id: freshId(), label: 'City', type: 'dropdown', required: false, fieldSource: 'boundary' },
          { id: freshId(), label: 'Neighborhood', type: 'dropdown', required: true, fieldSource: 'boundary' },
        ],
      },
      {
        title: 'Operations Details',
        fields: [
          { id: freshId(), label: 'Business Area', type: 'number', required: false, validationNotes: 'In sq ft, min 1', fieldSource: 'recommended' },
          { id: freshId(), label: 'Number of Employees', type: 'number', required: false, validationNotes: 'Min 1', fieldSource: 'recommended' },
          { id: freshId(), label: 'Operating Hours', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Is Business Hazardous?', type: 'dropdown', required: false, dropdownOptions: ['Yes', 'No'], fieldSource: 'recommended' },
        ],
      },
    ],
  }

  const declaration: RegistrySection = {
    id: freshId(),
    title: 'Declaration',
    fields: [
      { id: freshId(), label: 'I declare all information provided is true', type: 'checkbox', required: true, fieldSource: 'mandatory' },
      { id: freshId(), label: 'I agree to the Terms and Conditions', type: 'checkbox', required: true, fieldSource: 'mandatory' },
    ],
  }

  const states: WorkflowState[] = [
    { id: freshId(), label: 'Start' },
    { id: freshId(), label: 'Pending Document Verification' },
    { id: freshId(), label: 'Pending Payment' },
    { id: freshId(), label: 'Pending Field Inspection' },
    { id: freshId(), label: 'Pending Approval' },
    { id: freshId(), label: 'End' },
  ]

  // Note: "Counter Employee" is referenced here but is NOT in the roles
  // list below — a real inconsistency in the source tenant's own config,
  // transcribed as-is rather than silently fixed. This is exactly the kind
  // of thing the (not yet built) Reference Resolver exists to catch.
  const transitions: WorkflowTransition[] = [
    { from: 'Start', to: 'Pending Document Verification', roles: ['Citizen'], action: 'Apply' },
    { from: 'Start', to: 'Pending Document Verification', roles: ['Counter Employee'], action: 'Assisted Apply' },
    { from: 'Pending Document Verification', to: 'Pending Payment', roles: ['Document Verifier'], action: 'Verify Document' },
    { from: 'Pending Document Verification', to: 'Start', roles: ['Document Verifier'], action: 'Send Back' },
    { from: 'Pending Field Inspection', to: 'Pending Approval', roles: ['Field Inspector'], action: 'Inspection Passed' },
    { from: 'Pending Field Inspection', to: 'Pending Field Inspection', roles: ['Field Inspector'], action: 'Inspection Failed' },
    { from: 'Pending Approval', to: 'End', roles: ['Approver'] },
    { from: 'Pending Approval', to: 'Pending Document Verification', roles: ['Approver'], action: 'Reject' },
    { from: 'Pending Payment', to: 'Pending Field Inspection', roles: ['Approver'], action: 'Reject' },
  ]

  return {
    ...EMPTY_APPLICATION_DEFINITION,
    metadata: {
      name: 'Business License',
      description: 'Application for Authorization to Start Business',
    },
    registry: {
      sections: [applicantDetails, ownerProprietorDetails, businessDetails, declaration],
      documents: [
        { documentName: 'Identity Proof', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: ['Passport', 'Driving License', 'Voter ID', 'PAN Card', 'ID CARD'] },
        { documentName: 'Address Proof', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: false, docTypes: ['Voter ID', 'Utility Bill', 'Bank Statement', 'Rent Agreement'] },
        { documentName: 'Business Proof / Trade License', acceptedFormats: ['PDF'], required: false, docTypes: [] },
        { documentName: 'GST Certificate', acceptedFormats: ['PDF'], required: false, docTypes: [] },
        { documentName: 'Shop Establishment Certificate', acceptedFormats: ['PDF'], required: false, docTypes: [] },
        { documentName: 'Property / Lease Agreement', acceptedFormats: ['PDF'], required: false, docTypes: [] },
        { documentName: 'Location Picture', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
      ],
      featureToggles: [
        {
          id: freshId(),
          label: 'Mobile OTP Confirmation',
          tag: 'Identity Verification',
          description: 'When enabled, applicants must verify their identity by entering a one-time password (OTP) sent to their registered mobile number before they can submit the declaration. This ensures the person submitting the application is the same person whose mobile number is on record.',
          enabled: false,
        },
      ],
    },
    // Real evidence (the actual target product's own Roles step, Bissau
    // tenant) — descriptions and the "Public" tag transcribed directly,
    // not invented.
    roles: [
      { name: 'Citizen', description: 'Applicant applying for a Business License', tag: 'Public' },
      { name: 'Document Verifier', description: 'Reviews submitted applications and verifies documents' },
      { name: 'Field Inspector', description: 'Visits the business site and confirms compliance' },
      { name: 'Approver', description: 'Final approving authority for licence issuance' },
    ],
    workflow: { states, transitions, slaDays: 15 },
    checklists: [
      {
        id: freshId(),
        name: 'Field Inspection Provisory Installation',
        module: 'issuance',
        stage: 'Pending Field Inspection',
        items: [{ item: 'Upload Field Inspection Provisory Installation', type: 'file', required: true }],
      },
      {
        id: freshId(),
        name: 'Field Inspection Site Location',
        module: 'issuance',
        stage: 'Pending Field Inspection',
        items: [{ item: 'Upload Field Inspection Site Location Plan', type: 'file', required: true }],
      },
      {
        id: freshId(),
        name: 'Field Inspection Tech Advice',
        module: 'issuance',
        stage: 'Pending Approval',
        items: [{ item: 'Upload Field Inspection Tech Advice', type: 'file', required: true }],
      },
    ],
    fees: {
      mode: 'flat',
      feeComponents: [
        { label: 'Application Form', amount: 500 },
        { label: 'Requirement Installation', amount: 15000 },
        { label: 'Seal', amount: 2000 },
        { label: 'Recognization of Signature', amount: 250 },
        { label: 'Technical Advice & Site Location Plan (Field Inspection)', amount: 15000 },
      ],
      additionalComponents: [],
    },
    notifications: {
      rules: [
        { id: freshId(), event: 'Application Submitted', channel: 'Email', recipient: 'Applicant', message: 'Your application has been submitted successfully. Ref: {APP_ID}' },
        { id: freshId(), event: 'Application Submitted', channel: 'SMS', recipient: 'Applicant', message: 'Application submitted. Ref: {APP_ID}' },
        { id: freshId(), event: 'Application Submitted', channel: 'Email', recipient: 'Staff', message: 'New application received. Ref: {APP_ID} — please review.' },
        { id: freshId(), event: 'Pending Document Verification', channel: 'Email', recipient: 'Applicant', message: 'Your documents are under review. We will notify you once verified.' },
        { id: freshId(), event: 'Pending Document Verification', channel: 'SMS', recipient: 'Applicant', message: 'Your documents are under review. We will notify you once verified.' },
        { id: freshId(), event: 'Inspection Scheduled', channel: 'Email', recipient: 'Applicant', message: 'A field inspection has been scheduled for your business.' },
        { id: freshId(), event: 'Inspection Scheduled', channel: 'SMS', recipient: 'Applicant', message: 'Inspection scheduled. Ref: {APP_ID}' },
        { id: freshId(), event: 'Pending Resubmission', channel: 'Email', recipient: 'Applicant', message: 'Action required: please resubmit your application with the requested corrections.' },
        { id: freshId(), event: 'Pending Resubmission', channel: 'SMS', recipient: 'Applicant', message: 'Corrections needed. Log in to resubmit. Ref: {APP_ID}' },
        { id: freshId(), event: 'Pending Payment', channel: 'Email', recipient: 'Applicant', message: 'Your application is approved — please complete the licence fee payment.' },
        { id: freshId(), event: 'Pending Payment', channel: 'SMS', recipient: 'Applicant', message: 'Payment pending for licence. Ref: {APP_ID}' },
        { id: freshId(), event: 'License Issued', channel: 'Email', recipient: 'Applicant', message: 'Congratulations! Your Business Licence has been issued. Ref: {APP_ID}' },
        { id: freshId(), event: 'License Issued', channel: 'SMS', recipient: 'Applicant', message: 'Licence issued. Download from the portal. Ref: {APP_ID}' },
        { id: freshId(), event: 'Rejection', channel: 'Email', recipient: 'Applicant', message: 'Application Rejected!' },
        { id: freshId(), event: 'Rejection', channel: 'SMS', recipient: 'Applicant', message: 'Application Rejected!' },
        // Real, odd, deliberately not "fixed": the real tenant repurposed
        // Renewal Reminder AND Application Submitted/SMS for the same
        // recurring-billing message that has no real workflow-state home.
        // Matches the plan's documented soft-warning rationale exactly.
        { id: freshId(), event: 'Renewal Reminder', channel: 'Email', recipient: 'Applicant', message: 'Please Proceed Paying your Monthly Fees!' },
        { id: freshId(), event: 'Application Submitted', channel: 'SMS', recipient: 'Applicant', message: 'Please Proceed Paying your Monthly Fees!' },
        { id: freshId(), event: 'Renewal Reminder', channel: 'SMS', recipient: 'Applicant', message: 'Please Proceed Paying your Monthly Fees!' },
      ],
    },
  }
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'business-license-starter',
    name: 'Business License',
    description: 'A general business license/permit starter — applicant details, business details, standard identity documents.',
    definition: buildBusinessLicenseTemplate(),
  },
]

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
