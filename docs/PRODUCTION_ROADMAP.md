# Production Roadmap — AI-Assisted DIGIT Application Configurator

**Meeting:** Jul 31, 2026 — alignment on plan
**Audience:** Technical Architect, Product Manager, Vendor Engineering Head
**Hard deadline:** Aug 21, 2026 (production-grade, real AI + real backend + real DIGIT integration)
**Constraint:** Srujana is solo on the AI/backend track. On leave Aug 13–14.

> This is a proposal to align on today, not a settled plan. Open questions that need a decision in this meeting are called out in Section 6 — don't skip that section.

---

## 0. Why this is not a POC plan

Every sprint below is built the same way, on purpose:

1. **Every sprint ends with an adversarial-testing day** against the slice just built — bad input, wrong tenant, malformed output — not just a happy-path demo run.
2. **Auth and tenant scoping are wired in from Sprint 1, Day 1** — not retrofitted at the end. Every API built from day one requires a real auth header and a real tenant, even while everything else around it is still rough.
3. **The Reference Resolver actively rejects inconsistent output** (Sprint 3 onward) instead of silently compiling something broken.
4. **Sprint 5 exists specifically to prove generality and audit the combined system** — a second scenario built using nothing but Sprints 1–4's existing logic, plus a full cross-slice regression pass — not to add new features under deadline pressure.

If any sprint's adversarial-testing day finds something that can't be fixed same-day, that gets flagged immediately, not smoothed over for the demo.

---

## 1. The ownership split

**Rule of thumb for the room: the vendor team builds every pixel. Srujana builds every decision and every byte that actually gets persisted.**

| Track | Owner | Includes |
|---|---|---|
| **Screens & UI** | Vendor engineering team | Every screen in the `license-certificate-ui` admin app: form builder, workflow/fee/notification config screens, review/publish screen, auth screens, error/loading/empty states, **and the chat surface's visual shell** (message list, input box, typing indicator) |
| **AI, Conversation Logic & Backend** | Srujana (solo) | LLM field extraction, the real multi-turn conversation/clarification logic, the new License Definition Service (APIs the vendor's screens call), and all real DIGIT integration (Registry, Workflow, Fee, Notification services in digit3) |

The chat *looks* like a UI component (vendor's job to render it) but *behaves* like a backend client (Srujana's job to decide what it says and what it writes) — same rule as every other screen.

---

## 2. Calendar at a glance

|  | **Sprint 1** | **Sprint 2** | **Sprint 3** | Buffer | Leave | **Sprint 4** | **Sprint 5** |
|---|---|---|---|---|---|---|---|
| **Dates** | Jul 31–Aug 3 | Aug 4–7 | Aug 8–11 | Aug 12 | Aug 13–14 | Aug 15–18 | Aug 19–21 |
| **Length** | 4 days | 4 days | 4 days | 1 day | 2 days | 4 days | 3 days |
| **Focus** | Registry slice, authenticated | Workflow slice + 1st real UI wiring | Fee + Notification + Resolver | Catch-up | *Unavailable* | Conversation loop + Publish | 2nd scenario + full audit |
| **Vendor delivers** | Admin shell scaffold | Form Builder wired live | Fee/Notification screens | — | independent backlog | Review/Publish + chat shell | Final polish |
| **What the room sees** | Real schema created in digit3 **+ a bad input rejected cleanly** | Manual + AI both write the same schema, live | All 4 config types + a broken cross-reference caught by the Resolver | — | — | Full chat → clarify → review → publish | Same flow, new domain + two isolated tenants |

Every "what the room sees" cell deliberately includes a failure case, not just a success case — that's the visible proof of Section 0's claim.

**Calendar note:** dates run 7 days a week to hit the deadline. If the vendor team is weekday-only, their boxes slide ~2 extra calendar days each — flag this today.

---

## 3. Sprint-by-sprint, day-by-day

### Sprint 1 — Jul 31 to Aug 3: Registry slice, authenticated from day one

**Goal:** Prove the real pipeline end-to-end for the simplest case — and prove it fails safely on bad input, not just succeeds on good input.

| Day | Date | Research | Build |
|---|---|---|---|
| 1 | Jul 31 | JSON Schema Draft 2020-12 spec ([json-schema.org](https://json-schema.org/draft/2020-12/release-notes) — `type`, `required`, `enum`, `format`, `$defs`); re-skim digit3's Registry service routes + auth/tenant header requirements in the repo; Anthropic's [tool-use / structured output docs](https://docs.claude.com) if using Claude for extraction | Decide backend language for the new License Definition Service (flag to architect today); scaffold the service; wire auth middleware that requires a real tenant header from the very first route, even though nothing else works yet |
| 2 | Aug 1 | Prompt design for constrained structured extraction; the `ajv` (or equivalent) JSON Schema validator library docs — this is the guardrail | Build the extraction function: sentence → candidate JSON Schema for flat fields (text/date/dropdown, required/optional); validate the LLM's own output against the Draft 2020-12 meta-schema *before* anything downstream sees it |
| 3 | Aug 2 | digit3 Registry's actual create-schema endpoint contract — request/response shape, required headers (re-read the route/Swagger in the repo) | Authenticated, tenant-scoped `POST` to the Registry sandbox; persist a `form_config` row referencing the real created schema id |
| 4 | Aug 3 | No new research — re-read your own Day 1–3 code with a "how do I break this" lens | Adversarial pass: typos, two fields in one sentence, ambiguous type, missing/wrong tenant, no auth token — confirm every one fails cleanly, not with a crash or a bad write. Write 5–10 automated tests covering these. Note anything still broken honestly, don't hide it. |

**In scope:** one tenant, one scenario, flat fields only.
**Out of scope:** conditional fields, cross-field validation, arrays, workflow/fee/notification, real frontend wiring.
**Demo:** live schema creation in digit3 — *and* a deliberately bad input rejected on stage.

---

### Sprint 2 — Aug 4 to Aug 7: Workflow slice + first real UI wiring

**Goal:** Add process/workflow definitions; connect the vendor's screens to a real backend for the first time — the first point where a mistake blocks someone else, not just you.

| Day | Date | Research | Build |
|---|---|---|---|
| 1 | Aug 4 | digit3 Workflow service's process/state/action/transition model — routes + DB schema in the repo | Freeze and share the REST contract for `form_config`/`workflow_config` CRUD with the vendor **today** — this is the hard dependency for their Sprint 2 work; scaffold `workflow_config` CRUD reusing Sprint 1's auth middleware (don't rebuild it) |
| 2 | Aug 5 | Re-read your own Sprint 1 extraction/validation code as the template — note where flat-field logic does and doesn't generalize to a graph-shaped output (states/actions/transitions) | Workflow compiler: text → candidate states/actions/transitions → structural validation (has a start state, has a terminal state, no orphan states) before it goes anywhere |
| 3 | Aug 6 | — | Authenticated `POST` to digit3 Workflow sandbox; persist `workflow_config`. In parallel: vendor wires their real Form Builder screen to your now-live `form_config` API against the Day 1 contract |
| 4 | Aug 7 | — | Adversarial pass: malformed workflow graphs (cycles, two start states, unreachable approve state), a wrong-tenant call, and a check that vendor's actual integration matches the frozen contract. Tests. Demo prep. |

**In scope:** linear workflows only (apply → review → approve/reject).
**Out of scope:** branching/parallel workflows, SLA timers, delegation.
**Demo:** an admin adds a field by hand in the vendor's UI *and* the AI adds one from a sentence — both hit the same backend, live.

---

### Sprint 3 — Aug 8 to Aug 11: Fee + Notification + Reference Resolver

**Goal:** Complete the four-compiler set, and make inconsistency between them impossible to compile silently.

| Day | Date | Research | Build |
|---|---|---|---|
| 1 | Aug 8 | digit3's billing-service/tax-head model (fixed vs. percentage fees); notification/template service API | **Design day, not a coding day.** Sketch the Reference Resolver's actual rule set on paper: what must be consistent across form/workflow/fee/notification before anything is allowed to be marked valid. Getting this wrong is expensive to unwind later. |
| 2 | Aug 9 | — | Fee compiler: text → fee structure → billing-service call |
| 3 | Aug 10 | — | Notification compiler: text → template → notification service call; wire the Reference Resolver across all four compilers using yesterday's rule set |
| 4 | Aug 11 | — | Adversarial pass: a fee rule referencing a registry field that doesn't exist, a notification referencing a workflow state that doesn't exist — confirm the Resolver actually blocks these. Tests. Demo prep. |

**In scope:** flat fee structures (fixed/percentage), single-channel notifications.
**Out of scope:** tiered/conditional fees, multi-channel orchestration.
**Demo:** all four config types manually and via AI — plus an intentionally broken cross-reference getting caught live.

---

### Buffer — Aug 12
No new scope. Absorb whatever slipped in Sprints 1–3. If nothing slipped, get a head start on Sprint 4's Day 1 research before leave.

### Leave — Aug 13–14
Srujana unavailable. Vendor works from independent backlog; no new API contract should be due on these days.

---

### Sprint 4 — Aug 15 to Aug 18: Real conversation loop + publish lifecycle

**Goal:** Move from single-shot extraction to a real multi-turn conversation, and gate publishing on the Resolver actually passing. This is the highest-risk sprint — budget it accordingly.

| Day | Date | Research | Build |
|---|---|---|---|
| 1 | Aug 15 | Multi-turn conversation state design — re-read your own original prototype's beat-folding pattern as a mental model, then check how your LLM provider's docs recommend maintaining state across turns for tool-calling agents | **Resolve the capstone `_create` orchestrator question from today's meeting before writing any code** — build-it-yourself vs. it-already-exists changes the shape of Days 2–3 entirely |
| 2 | Aug 16 | — | Real clarification loop: the model explicitly decides "I need to ask a follow-up" vs. "I have enough" — log that decision so it's testable, not just vibes |
| 3 | Aug 17 | — | Orchestrator stitching form + workflow + fee + notification into one Draft record; Publish action that only succeeds if Sprint 3's Reference Resolver passes |
| 4 | Aug 18 | — | Adversarial pass: user contradicts an earlier answer, user abandons mid-conversation and resumes later, publish attempted while the Resolver would fail — confirm each is handled explicitly. Tests. Demo prep. |

**In scope:** one clarifying question at a time, linear.
**Out of scope:** versioning/undo after publish, concurrent multi-user editing.
**Demo:** chat a complete license definition into existence across multiple turns, review it, publish it — live in digit3.

---

### Sprint 5 — Aug 19 to Aug 21: Second scenario + full audit + demo

**Goal:** Prove Sprints 1–4 generalize, not just work for one hand-tuned scenario — and prove the combined system holds up, not just each slice in isolation.

| Day | Date | Research | Build |
|---|---|---|---|
| 1 | Aug 19 | — | Second, structurally different scenario, built using **only** Sprints 1–4's existing compilers and conversation loop — no new backend logic. If it needs new logic, that's a real finding: it means the earlier sprints were more scenario-specific than intended. Say so, don't quietly patch around it. |
| 2 | Aug 20 | — | Full-stack audit: re-run every adversarial test from Sprints 1–4 together, end-to-end, to check nothing regressed when combined; verify tenant isolation across the whole stack with two real tenants; a basic secrets/injection review; a small concurrent-request burst to confirm nothing trivially falls over |
| 3 | Aug 21 | — | Morning dry run; fix anything the dry run finds; present |

**In scope:** happy path + common failure path for scenario two; cross-slice regression.
**Out of scope:** a third+ scenario, formal load testing, SSO, fine-grained per-field permissions.
**Demo:** same chat flow in a new domain; two tenants with verifiably isolated data; a live walkthrough of what breaks and how it fails safely.

---

## 4. Out of scope for the entire Aug 21 milestone

- Conditional/dependent fields and cross-field relational validation as free-generated AI output (needs a constrained pattern library or digit3 webhook validators — not scheduled)
- Repeating/array field structures
- More than two scenarios/domains
- Formal load/performance testing (Sprint 5 does a small burst check only, not real load testing)
- SSO, fine-grained per-field permissions
- Versioning or rollback of published definitions
- Any citizen-facing app changes

---

## 5. Open questions — decide these today

1. **Backend language** for the new License Definition Service — needed *before* Sprint 1 Day 1 starts. Recommend Node/TS or Python (faster solo build, mature LLM tooling) over Go (matches digit3's own stack, slower ramp-up alone).
2. **Auth provider** — is there an existing Keycloak/DIGIT auth service to integrate with? This is now needed by **Sprint 1, Day 1** (auth is threaded through from the start), not deferred to a later sprint — this is the most time-sensitive question in this list.
3. **Does the vendor team already have this scoped?** Is `license-certificate-ui`'s admin app already on their backlog, or is this split fresh today?
4. **Workflow target:** does `workflow_config` wire to digit3's new Go workflow service, or an older `egov-workflow-v2` instance? The spec references the old service by name; no implementation evidence found either way.
5. **Vendor working days:** do they work weekends? Determines whether the calendar above needs padding for their track.
6. **Capstone orchestrator endpoint:** `_create` has no implementation evidence in the repo — confirm whether Sprint 4 builds it or someone else owns it.

---

## 6. What "done" looks like on Aug 21

A logged-in admin, scoped to their own tenant, can either build a license definition by hand through the vendor's screens or describe it in plain English through the AI chat — both paths write to the same real License Definition Service, which has actually created live Registry, Workflow, Fee, and Notification configuration in digit3, for two different real scenarios, with every stage validated adversarially (not just demoed on the happy path), behind real auth and tenant isolation from day one.
