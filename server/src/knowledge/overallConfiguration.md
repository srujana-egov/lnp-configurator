# Overall Configuration — what each question actually means

## Modules: Issuance and Renewal
Issuance is always on — it's the citizen applying for a brand-new licence, and every
service needs it. Renewal is optional: turn it on if citizens should be able to renew
an *existing, already-issued* licence before or after it expires, without submitting a
brand-new application from scratch. Turning Renewal on is what makes the Renewal
Settings question appear at all — with it off, that question is skipped entirely.

## Licence validity
Three real modes, and they behave differently:
- **Fixed duration**: the licence is valid for N months starting from the date it was
  actually issued. Two licences issued on different dates in the same year expire on
  different dates.
- **Valid for the financial year**: the licence expires on 31 December of the year it
  was issued, no matter when in the year that was — a licence issued in January and one
  issued in November both expire on the same date. Because of this, an applicant who
  applies mid-year is effectively paying for a shorter period than one who applies in
  January — that's exactly why **fee proration** exists: the platform can charge a
  reduced fee based on the months actually remaining in the year, rather than the full
  annual fee, if that's configured on the Fees step.
- **Never expires**: issued once, valid indefinitely, no renewal ever needed — if this
  is chosen, the Renewal module doesn't make sense to enable.

## Renewal settings (only shown if Renewal is on)
- **Reminder days before expiry**: how many days ahead of expiry the citizen gets a
  renewal reminder notification.
- **Grace period (days after expiry)**: how many days past expiry a citizen can still
  submit a renewal at all before the licence is considered fully lapsed and they'd have
  to start a brand-new application instead.
- **Approval mode** — three real choices:
  - *Auto-approve all*: every renewal is approved instantly, no workflow runs. Fastest,
    but no review at all — appropriate only for low-risk, routine renewals.
  - *Auto-approve if nothing changed*: if the citizen's renewal submission is identical
    to their existing licence data, it's approved instantly; any edit routes it through
    the normal approval workflow instead. A middle ground — fast for the common case,
    still reviewed when something's actually different.
  - *Always through the approval workflow*: every renewal, changed or not, goes through
    full review. Slowest, but never skips human oversight.
- Renewal always reuses the exact same application form as a new application — there is
  no separate, shorter renewal-specific form. The form simply arrives pre-filled with
  the citizen's existing licence data, which they can review and edit before resubmitting.

## Category levels and names
This defines how many nested dropdown choices an applicant has to make to describe
their business type on the actual application form — e.g. "Category" then
"Sub-category" is 2 levels. Each level is a *separate, linked* dropdown: picking a value
at level 1 filters which values are available at level 2, and so on. More levels give
finer-grained classification but mean more required clicks for every applicant. The
"level names" question just controls what label each dropdown shows — these names also
surface later on staff dashboards, search filters, and reports, so pick wording both
citizens and internal staff will recognize, not an internal-only shorthand.

## Categories table
This is the actual list of real category → sub-category values an applicant can choose
from. A "Reset to defaults" action refills the table with a small starter list — useful
to get moving quickly, not meant to be the final real list for every tenant. Categories
can always be added, edited, or removed later; this isn't a one-time, locked-in decision.

## Application ID format
This is the reference number a citizen actually uses to track their own application
(e.g. shown on their receipt, used when they call in to check status) — it is not an
internal database ID. `YYYY` in the format means the 4-digit year gets substituted in;
`NNNNNN` means a running/sequential number gets substituted in. If Renewal is enabled, a
separate renewal ID format can optionally look different from the new-application
format, to make it visually obvious at a glance which kind of application a given ID
belongs to. "Should the Licence ID match the Application ID" decides whether the
*issued licence itself*, once approved, keeps the exact same reference number as the
application that led to it, or gets its own distinct number at issuance time.
