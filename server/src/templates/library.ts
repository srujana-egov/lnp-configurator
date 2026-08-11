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
// Rebuilt from "Template Details: Business License" (Tahera Bharmal,
// v0.2, 2026-07-07) — the official, authored template spec — superseding
// the earlier version transcribed from the Bissau tenant's live screens.
// Where the two sources genuinely conflict (e.g. exact field lists), this
// newer authored spec wins, since it's the explicit source of truth this
// template is meant to lock in. Real judgment calls made while
// transcribing, not silent fixes:
// - The Workflow table's "Performed By" column says "Citizen" throughout,
//   but the Roles table only ever defines "Applicant" — no role named
//   "Citizen" exists anywhere in the doc. Read as the same author's
//   consistent colloquial term for the same role (unlike a genuinely
//   missing role), so transitions use "Applicant" here, normalized for
//   consistency with the Roles list itself.
// - "Pending Issuance -> Issue" (Issuance) is listed with "Approver" as
//   performer in the Workflow table, but the very next line explicitly
//   says License Issued is "triggered automatically by System after
//   payment" — the prose note reads as the more deliberate statement (an
//   automatic transition immediately after payment clears), so this
//   transition has no roles here, matching the Renewal flow's own
//   "Issue Renewal / System" row, which has no such contradiction.
// - Fields/values the doc only gives as "e.g." illustrations of how a
//   config behaves (not "Default: X") are still used as this template's
//   real seed values — a template needs concrete starting values to be
//   useful, and these are presented as realistic for exactly this use
//   case. Only genuinely unstated values (validity period/months; whether
//   the licence ID matches the application ID; whether renewals allow
//   past years) are left unset rather than guessed.
function buildBusinessLicenseTemplate(): ApplicationDefinition {
  const applicantDetails: RegistrySection = {
    ...buildMandatoryDefaultSections()[0]!,
    subsections: [
      {
        title: 'Applicant Address',
        fields: [
          {
            id: freshId(),
            label: 'Boundary Hierarchy',
            type: 'dropdown',
            required: true,
            validationNotes: 'Cascading dropdowns auto-fetched from the boundary service (e.g. State -> District -> City -> Ward); each level populates based on the selection above it',
            fieldSource: 'boundary',
          },
          { id: freshId(), label: 'House No.', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Address Line 1', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Address Line 2', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Postal Code', type: 'number', required: false, fieldSource: 'recommended' },
          {
            id: freshId(),
            label: 'Map-based Address Selection',
            type: 'location',
            required: false,
            validationNotes: 'Optional — dropping a pin autopopulates the Boundary Hierarchy fields and Street Name; House No. must still be entered manually',
            fieldSource: 'recommended',
          },
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
      { id: freshId(), label: 'Owner Type', type: 'dropdown', required: true, dropdownOptions: ['Individual', 'Institution'], fieldSource: 'mandatory' },
    ],
    subsections: [
      {
        title: 'If Individual',
        repeatable: true, // real evidence: "Add Individual" button, each entry independently removable
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
          { id: freshId(), label: 'ID Type', type: 'dropdown', required: true, dropdownOptions: ['Passport', 'Driving License'], fieldSource: 'mandatory' },
          { id: freshId(), label: 'ID Number', type: 'text', required: true, validationNotes: 'Format varies by ID type (Passport: 6-12 alphanumeric; Driving License: 6-16 alphanumeric)', fieldSource: 'mandatory' },
        ],
      },
      {
        // Real evidence: the doc states Government Entity "follows the
        // same structure as Organization" — one subsection covers both
        // rather than duplicating identical fields.
        title: 'If Organization / Government Entity',
        fields: [
          { id: freshId(), label: 'Institution Type', type: 'dropdown', required: true, dropdownOptions: ['Private', 'Government'], fieldSource: 'mandatory' },
          {
            id: freshId(),
            label: 'Institution Subtype',
            type: 'dropdown',
            required: true,
            validationNotes: 'If Private: Sole Proprietorship, Partnership, Limited Liability Company (LLC), Corporation (Inc./Ltd.), Co-operatives. If Government: Local Government, Central Government.',
            dropdownOptions: ['Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation (Inc./Ltd.)', 'Co-operatives', 'Local Government', 'Central Government'],
            fieldSource: 'mandatory',
          },
          { id: freshId(), label: 'Organization Name', type: 'text', required: true, fieldSource: 'mandatory' },
          { id: freshId(), label: 'Representative Name', type: 'text', required: true, fieldSource: 'mandatory' },
          {
            id: freshId(),
            label: 'Representative same as the Applicant',
            type: 'toggle',
            required: false,
            validationNotes: 'Pre-fills Mobile Number, Email, ID Type, and ID Number from Applicant Details; fields remain editable after toggle',
            fieldSource: 'mandatory',
          },
          { id: freshId(), label: 'Mobile Number', type: 'phone', required: true, fieldSource: 'mandatory' },
          { id: freshId(), label: 'Email', type: 'email', required: false, fieldSource: 'mandatory' },
          { id: freshId(), label: 'ID Type', type: 'dropdown', required: true, dropdownOptions: ['Passport', 'Driving License'], fieldSource: 'mandatory' },
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
          { id: freshId(), label: 'Business Name', type: 'text', required: true, validationNotes: 'Min 3 characters', fieldSource: 'recommended' },
          {
            id: freshId(),
            label: 'Business Category (Level 1)',
            type: 'dropdown',
            required: true,
            validationNotes: 'Populated from Level 1 values configured in Overall Configuration\'s License Category hierarchy',
            optionsSource: 'Overall Configuration',
            fieldSource: 'recommended',
          },
          {
            id: freshId(),
            label: 'Sub-Category (Level 2+)',
            type: 'dropdown',
            required: true,
            validationNotes: 'Cascading dropdowns, one per remaining configured level, each populated dynamically based on the selection at the level above; shown only if the hierarchy has 2 or more levels',
            optionsSource: 'Overall Configuration',
            fieldSource: 'recommended',
          },
          {
            id: freshId(),
            label: 'Ownership Type',
            type: 'dropdown',
            required: true,
            dropdownOptions: ['Sole Proprietor', 'Partnership', 'Private Limited', 'Public Limited', 'LLP', 'Other'],
            fieldSource: 'recommended',
          },
          { id: freshId(), label: 'Number of Employees', type: 'number', required: false, validationNotes: 'Min value: 0', fieldSource: 'recommended' },
          { id: freshId(), label: 'Annual Turnover', type: 'number', required: false, validationNotes: 'Min value: 0', fieldSource: 'recommended' },
        ],
      },
      {
        title: 'Business Location Detail',
        fields: [
          {
            id: freshId(),
            label: 'Boundary Hierarchy',
            type: 'dropdown',
            required: true,
            validationNotes: 'Auto-fetched from boundary service; same structure as Applicant Address',
            fieldSource: 'boundary',
          },
          { id: freshId(), label: 'House No.', type: 'text', required: false, fieldSource: 'recommended' },
          { id: freshId(), label: 'Street Name', type: 'text', required: false, fieldSource: 'recommended' },
        ],
      },
      {
        title: 'Operational Details',
        fields: [
          {
            id: freshId(),
            label: 'Business Registration Date',
            type: 'date',
            required: true,
            validationNotes: 'Past dates only; earliest selectable date is determined by Overall Configuration\'s Application Year Configuration (how many past years are allowed)',
            fieldSource: 'recommended',
          },
        ],
      },
    ],
  }

  const declaration: RegistrySection = {
    id: freshId(),
    title: 'Declaration',
    fields: [
      {
        id: freshId(),
        label: 'I confirm that all the details provided are true and correct to the best of my knowledge.',
        type: 'checkbox',
        required: true,
        fieldSource: 'mandatory',
      },
    ],
  }

  // One shared state graph — Issuance and Renewal both pass through
  // "Pending Approval" / "Pending Payment" / "Pending Issuance" (identically
  // named in both real workflow tables), Renewal just skips document
  // verification and inspection entirely via its own transitions below.
  const states: WorkflowState[] = [
    { id: freshId(), label: 'Start' },
    { id: freshId(), label: 'Pending Document Verification' },
    { id: freshId(), label: 'Pending Inspection' },
    { id: freshId(), label: 'Pending Resubmission' },
    { id: freshId(), label: 'Pending Approval' },
    { id: freshId(), label: 'Pending Payment' },
    { id: freshId(), label: 'Pending Issuance' },
    { id: freshId(), label: 'License Issued' },
    { id: freshId(), label: 'License Renewed' },
    { id: freshId(), label: 'Rejected' },
  ]

  const transitions: WorkflowTransition[] = [
    { from: 'Start', to: 'Pending Document Verification', roles: ['Applicant', 'Counter Employee'], action: 'Submit Application' },
    { from: 'Pending Document Verification', to: 'Pending Inspection', roles: ['Document Verifier'], action: 'Verify Documents' },
    { from: 'Pending Document Verification', to: 'Pending Resubmission', roles: ['Document Verifier'], action: 'Send Back' },
    { from: 'Pending Inspection', to: 'Pending Approval', roles: ['Field Inspector'], action: 'Complete Inspection' },
    { from: 'Pending Inspection', to: 'Pending Resubmission', roles: ['Field Inspector'], action: 'Send Back' },
    { from: 'Pending Approval', to: 'Pending Payment', roles: ['Approver'], action: 'Issue License' },
    { from: 'Pending Approval', to: 'Rejected', roles: ['Approver'], action: 'Reject' },
    { from: 'Pending Resubmission', to: 'Pending Document Verification', roles: ['Applicant'], action: 'Resubmit' },
    { from: 'Pending Payment', to: 'Pending Issuance', roles: ['Applicant'], action: 'Pay License Fee' },
    // System-triggered automatically after payment (real, explicit doc
    // note) — no human role gates this one.
    { from: 'Pending Issuance', to: 'License Issued', action: 'Issue' },
  ]

  const renewalTransitions: WorkflowTransition[] = [
    { from: 'Start', to: 'Pending Approval', roles: ['Applicant', 'Counter Employee'], action: 'Submit Renewal Application' },
    { from: 'Pending Approval', to: 'Pending Payment', roles: ['Approver'], action: 'Approve Renewal' },
    { from: 'Pending Approval', to: 'Rejected', roles: ['Approver'], action: 'Reject Renewal' },
    { from: 'Pending Payment', to: 'Pending Issuance', roles: ['Applicant'], action: 'Pay Renewal Fee' },
    { from: 'Pending Issuance', to: 'License Renewed', action: 'Issue Renewal' },
  ]

  return {
    ...EMPTY_APPLICATION_DEFINITION,
    metadata: {
      name: 'Business License',
      description: 'Also called Single Permit Business License, Trade License, Business Registration, Business Operating Permit, or Shop License.',
    },
    overallConfiguration: {
      modules: { issuance: true, renewal: true },
      // Real "Default: 2 (Category + Sub-Category)" — an explicit stated
      // default, not an "e.g." illustration. Category values below are
      // explicitly labeled in the source doc as "pre-populated in
      // template" — real seed content, not an example to avoid copying.
      categoryLevels: {
        count: 2,
        levelNames: ['Category', 'Sub-Category'],
        categories: [
          { path: ['Retail Shop', 'Grocery'] },
          { path: ['Retail Shop', 'Clothing'] },
          { path: ['Retail Shop', 'Electronics'] },
          { path: ['Restaurant', 'Dine-in'] },
          { path: ['Restaurant', 'Takeaway'] },
          { path: ['Restaurant', 'Cloud Kitchen'] },
          { path: ['Manufacturing', 'Small Scale'] },
          { path: ['Manufacturing', 'Medium Scale'] },
          { path: ['Application Business', 'Consultancy'] },
          { path: ['Application Business', 'Repair'] },
          { path: ['Application Business', 'IT Applications'] },
        ],
      },
      renewal: {
        reminderDaysBefore: 60,
        graceDaysAfter: 30,
        // Real evidence: the real Renewal workflow always routes through
        // an explicit Pending Approval step (see renewalTransitions) —
        // matches 'alwaysWorkflow', not an auto-approve mode.
        approval: 'alwaysWorkflow',
        renewalFormSameAsApplication: true,
      },
      applicationId: {
        newFormat: 'BL-YYYY-NNNNNN',
        renewalFormat: 'RBL-YYYY-NNNNNN',
      },
      // Deliberately left unset: validity period/months, whether the
      // licence ID matches the application ID, whether the renewed licence
      // keeps its original ID, and past-years allowance are all real,
      // named configuration points in the source doc, but it states no
      // concrete value for any of them for this template specifically —
      // left unset rather than guessed, same "never invent" discipline as
      // every other domain here.
    },
    registry: {
      sections: [applicantDetails, ownerProprietorDetails, businessDetails, declaration],
      documents: [
        { documentName: 'Registration Document', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
        { documentName: 'Proof of Business Location', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
        { documentName: 'Photocopy of ID Card or Passport of Owner / Manager', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
        { documentName: 'Tax Compliance Certificate', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
      ],
      featureToggles: [
        {
          id: freshId(),
          label: 'Mobile OTP Confirmation',
          tag: 'Identity Verification',
          description: 'When enabled, the applicant must verify their registered mobile number via OTP before the application can be submitted.',
          enabled: false,
        },
      ],
    },
    // Permissions per role (e.g. Create/View/Edit Application, View
    // Dashboards) are real in the source doc but have no dedicated field
    // on Role yet — folded into description text rather than silently
    // dropped; worth a real permissions field later if this needs to be
    // queried programmatically rather than just read.
    roles: [
      { name: 'Applicant', description: 'Applies for a Business License or renewal (Create Application, View Application)', tag: 'Public' },
      { name: 'Counter Employee', description: 'Creates or manages applications on behalf of a citizen at the counter (Create Application, View Application, Edit Application)' },
      { name: 'Document Verifier', description: 'Reviews submitted applications and verifies documents (View Application, Edit Application)' },
      { name: 'Field Inspector', description: 'Visits the business site and confirms compliance (View Application, Edit Application)' },
      { name: 'Approver', description: 'Final approving authority for licence issuance and renewal (View Application, Edit Application)' },
      { name: 'Dashboard Viewer', description: 'Read-only access to operational dashboards (View Dashboards)' },
    ],
    workflow: { states, transitions, renewalTransitions },
    checklists: [
      {
        id: freshId(),
        name: 'Inspection Checklist',
        module: 'issuance',
        stage: 'Pending Inspection',
        items: [
          { item: 'Site visited', type: 'checkbox', required: true },
          { item: 'Business exists at location', type: 'radio', required: true, options: ['Yes', 'No'] },
          { item: 'Compliance verified', type: 'radio', required: true, options: ['Yes', 'No', 'Partial'] },
          { item: 'Site photos', type: 'file', required: true },
          { item: 'Inspection remarks', type: 'text', required: false },
        ],
      },
    ],
    fees: {
      // Real evidence: the source doc specifies the fee-calculation
      // FEATURE (three real modes: Flat, Slab Based ('custom' here),
      // Custom Calculator API) but gives no concrete fee amounts for this
      // template — left empty rather than inventing numbers. Payment
      // methods ARE explicitly given, independent of the fee amount.
      mode: 'flat',
      feeComponents: [],
      additionalComponents: [],
      paymentMethods: ['Online', 'Counter'],
    },
    notifications: {
      // All real, transcribed from both the Issuance and Renewal
      // Notifications tables. Several rows are genuinely identical across
      // both flows (e.g. "Payment Pending") — kept as separate entries
      // rather than deduplicated, since they come from two independently
      // configured real tables, matching the "don't silently dedupe" rule.
      rules: [
        { id: freshId(), event: 'Application Submitted', channel: 'Email', recipient: 'Applicant', message: 'Application Submitted' },
        { id: freshId(), event: 'Application Submitted', channel: 'SMS', recipient: 'Applicant', message: 'Application Submitted' },
        { id: freshId(), event: 'Application Submitted', channel: 'USSD', recipient: 'Applicant', message: 'Application Submitted' },
        { id: freshId(), event: 'Inspection Scheduled', channel: 'Email', recipient: 'Applicant', message: 'Inspection Scheduled' },
        { id: freshId(), event: 'Inspection Scheduled', channel: 'SMS', recipient: 'Applicant', message: 'Inspection Scheduled' },
        { id: freshId(), event: 'Inspection Scheduled', channel: 'USSD', recipient: 'Applicant', message: 'Inspection Scheduled' },
        { id: freshId(), event: 'Payment Pending', channel: 'Email', recipient: 'Applicant', message: 'Payment Pending' },
        { id: freshId(), event: 'Payment Pending', channel: 'SMS', recipient: 'Applicant', message: 'Payment Pending' },
        { id: freshId(), event: 'Payment Pending', channel: 'USSD', recipient: 'Applicant', message: 'Payment Pending' },
        { id: freshId(), event: 'License Ready for Download', channel: 'Email', recipient: 'Applicant', message: 'Your Business License is Ready' },
        { id: freshId(), event: 'License Ready for Download', channel: 'SMS', recipient: 'Applicant', message: 'License Ready for Download' },
        { id: freshId(), event: 'License Ready for Download', channel: 'USSD', recipient: 'Applicant', message: 'License Ready for Download' },
        { id: freshId(), event: 'Application Submitted', channel: 'Email', recipient: 'Applicant', message: 'Renewal Application Submitted' },
        { id: freshId(), event: 'Application Submitted', channel: 'SMS', recipient: 'Applicant', message: 'Renewal Application Submitted' },
        { id: freshId(), event: 'Application Submitted', channel: 'USSD', recipient: 'Applicant', message: 'Renewal Application Submitted' },
        { id: freshId(), event: 'Payment Pending', channel: 'Email', recipient: 'Applicant', message: 'Payment Pending' },
        { id: freshId(), event: 'Payment Pending', channel: 'SMS', recipient: 'Applicant', message: 'Payment Pending' },
        { id: freshId(), event: 'Payment Pending', channel: 'USSD', recipient: 'Applicant', message: 'Payment Pending' },
        { id: freshId(), event: 'License Ready for Download', channel: 'Email', recipient: 'Applicant', message: 'Your Renewed Business License is Ready' },
        { id: freshId(), event: 'License Ready for Download', channel: 'SMS', recipient: 'Applicant', message: 'License Ready for Download' },
        { id: freshId(), event: 'License Ready for Download', channel: 'USSD', recipient: 'Applicant', message: 'License Ready for Download' },
      ],
    },
  }
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'business-license-starter',
    name: 'Business License',
    description: 'The canonical Business License starting point (Tahera Bharmal\'s authored template spec, v0.2) — any Business License template starts from this.',
    definition: buildBusinessLicenseTemplate(),
  },
]

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
