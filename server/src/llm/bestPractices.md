# Best practices — form-configurator domain knowledge

Loaded into every extraction prompt. One rule per line. Only things specific
to *this* domain that aren't obvious from general knowledge — a general-purpose
model already knows phone numbers are numeric and emails need an `@`; that
needs no entry here. Grows over time as new non-obvious rules get discovered.

## Application Form

- A field whose label implies a document/attachment (e.g. "ID Card copy",
  "Proof of X", "Certificate") should be flagged as `type: 'file'`, not left
  as `text` — double-check this explicitly, it's an easy thing to miss.
- A mobile/phone number field should be nudged toward requiring a country
  prefix if the applicant's country isn't already fixed by context.
- Document-attachment *lists* (e.g. "Attached Documents: Copy of ID, Copy of
  NIF, Proof of deposit") are not more form fields — they belong in
  `registry.documents`, never `registry.sections`.
- A field asking for a site/location with map coordinates (not just a
  written address) should be `type: 'location'`, not `text`.
- If a dropdown's options are described as coming from a lookup or database
  rather than a fixed list, set `pullFromDatabase: true` instead of
  fabricating a hardcoded option list.

## Input relevance

- If an uploaded document or message has nothing to do with license/permit
  configuration at all, say so directly rather than force-classifying it into
  a domain or silently ignoring it.

## Fees

- A document titled or referencing "Technical Advice," "Site Location Plan,"
  or "Field Inspection" commonly carries fee information too, not just
  checklist content — check for an associated fee component before assuming
  it's checklist-only.

## Notifications

- Keep SMS to critical/time-sensitive events only; Email/USSD are cheaper
  and should be preferred for routine reminders (reused verbatim from the
  real product's own inline warning banner).

## Workflow

- Phrasing like "processing takes N days" or "response within N business
  days" maps to workflow.slaDays, not a free-text note.
- Mentions of "renewal," "recurring," or "monthly" content should be checked
  against renewalTransitions / a renewal-module checklist before defaulting
  to the issuance flow.
