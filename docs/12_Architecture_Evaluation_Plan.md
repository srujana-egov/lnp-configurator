# Architecture Evaluation Plan

# AI-Assisted DIGIT Application Configurator

Version 1.0

---

# Purpose

This document defines the evaluation methodology for the proposed AI-Assisted DIGIT Application Configurator.

The evaluation focuses on assessing whether the proposed architecture improves the application configuration process while maintaining transparency, consistency and usability.

The evaluation does **not** measure the intelligence or accuracy of Large Language Models.

Instead, it evaluates the effectiveness of the architectural design.

---

# Evaluation Objectives

The evaluation seeks to determine whether the proposed architecture:

• simplifies government application authoring

• improves understanding of generated applications

• separates AI reasoning from deterministic execution

• supports user confidence

• improves traceability

• enables validation before deployment

• is acceptable to intended users

---

# Research Questions

## RQ1

Can administrators successfully create government applications using the proposed architecture?

---

## RQ2

Does the Application Definition improve transparency compared to a conversation-only approach?

---

## RQ3

Does separating AI-assisted authoring from deterministic compilation improve user confidence?

---

## RQ4

Is the architecture understandable to software engineers and government configurators?

---

## RQ5

Can users identify and correct configuration issues before compilation?

---

# Evaluation Strategy

A mixed-method evaluation will be conducted.

The evaluation combines:

• Task-based usability study

• Observation

• Semi-structured interviews

• Questionnaire

• Architecture walkthrough

---

# Participants

Target participants

8–12 participants

Two groups are recommended.

Group A

DIGIT configurators

or

Government software practitioners

Target

4–6 participants

---

Group B

Software engineers

System architects

Graduate researchers

Target

4–6 participants

---

If access to DIGIT experts is limited, experienced software developers may participate while acknowledging this limitation in the dissertation.

---

# Participant Requirements

Participants should:

• understand basic software systems

• be familiar with forms or workflow software

Previous DIGIT experience is beneficial but not mandatory.

---

# Ethical Considerations

Participation is voluntary.

Participants may withdraw at any time.

No personal identifying information will be collected.

Responses will be anonymised.

No production government systems are used.

No real citizen data is collected.

---

# Prototype Used

Participants interact with the prototype described in this dissertation.

The prototype contains:

AI-assisted authoring

Application Definition

Completeness Engine

Preview

Compilation

Research Mode

No live LLM is used.

---

# Evaluation Procedure

Each session lasts approximately

45–60 minutes.

The session contains:

Introduction

↓

Architecture Overview

↓

Hands-on Tasks

↓

Questionnaire

↓

Interview

↓

Debrief

---

# Session Timeline

Introduction

5 minutes

Architecture explanation

10 minutes

Prototype tasks

20 minutes

Questionnaire

10 minutes

Interview

10 minutes

---

# Experimental Tasks

Participants complete realistic configuration tasks.

---

## Task 1

Create a Birth Certificate application.

Goal

Observe whether users understand AI-assisted authoring.

Expected outcome

Complete Application Definition.

---

## Task 2

Add a new registry field.

Example

Passport Number

Measure

Ease of editing.

---

## Task 3

Modify workflow.

Add

Supervisor Approval

Observe

Whether users understand workflow updates.

---

## Task 4

Add notification.

Send Email

after Approval.

Measure

Navigation and discoverability.

---

## Task 5

Run deterministic compilation.

Observe

Whether participants understand the distinction between authoring and compilation.

---

## Task 6

Resolve validation error.

Example

Notification references missing workflow state.

Measure

Whether users understand validation messages.

---

# Data Collected

Quantitative

Task completion time

Task success

Number of errors

Number of clarification requests

Navigation mistakes

Completion rate

---

Qualitative

Participant comments

Interview responses

Observational notes

Think-aloud comments

Suggestions

---

# Metrics

## M1

Task Completion Rate

Definition

Percentage of successfully completed tasks.

Target

>90%

---

## M2

Task Completion Time

Average time required.

Used to compare task complexity.

---

## M3

User Confidence

Question

"I understood what the system was doing."

Likert Scale

1–5

---

## M4

Architecture Transparency

Question

"I understood how the application was generated."

Likert

1–5

---

## M5

Trust

Question

"I would trust the generated configuration after reviewing it."

Likert

1–5

---

## M6

Perceived Explainability

Question

"The system clearly explained how information flowed."

Likert

1–5

---

## M7

Editing Confidence

Question

"I felt confident modifying the generated application."

Likert

1–5

---

# Standardised Usability Instrument

System Usability Scale (SUS)

Ten standard questions.

Score

0–100

Interpretation

Above 68

Average usability

Above 80

Excellent usability

---

# Cognitive Workload

NASA Task Load Index (NASA-TLX)

Measure

Mental demand

Effort

Frustration

Temporal demand

Physical demand

Performance

Purpose

Determine whether the architecture introduces unnecessary complexity.

---

# Semi-Structured Interview

Example Questions

---

How easy was it to create an application?

---

Which part of the architecture was easiest to understand?

---

Which part was most confusing?

---

Did the Application Definition help explain what the AI was doing?

---

How useful was the Completeness Engine?

---

Did deterministic compilation increase your confidence?

---

Would you prefer this over manually editing configuration files?

Why?

---

What improvements would you suggest?

---

# Observation Checklist

During evaluation observe whether participants:

Understand conversation flow

Understand Application Definition

Understand completeness progress

Notice architecture animation

Use preview

Understand validation

Recognise deterministic compilation

Understand generated configuration

Need assistance

Become confused

---

# Think-Aloud Protocol

Participants are encouraged to verbalise their thoughts while interacting.

Example prompts

"What are you expecting to happen?"

"What are you looking at now?"

"What does this component appear to do?"

Observations are recorded anonymously.

---

# Data Analysis

Quantitative data

Compute

Mean

Median

Standard deviation

Task completion rate

Average SUS score

Average NASA-TLX score

Likert averages

Present using tables and bar charts.

---

Qualitative analysis

Interview transcripts

↓

Open coding

↓

Theme identification

↓

Common observations

Potential themes

Transparency

Trust

Ease of learning

Architecture understanding

Suggestions

---

# Success Criteria

The proposed architecture will be considered successful if:

Task completion rate exceeds 90%.

Average SUS score exceeds 70.

Participants report understanding the role of the Application Definition.

Participants distinguish AI-assisted authoring from deterministic compilation.

Most participants report confidence in reviewing generated applications.

Research Mode improves understanding of architectural components.

---

# Threats to Validity

## Internal Validity

Participants receive a short architecture explanation before evaluation.

This may influence understanding.

Mitigation

Provide identical instructions to all participants.

---

## External Validity

Participants may not represent all government administrators.

Mitigation

Recruit participants with software configuration experience where possible.

---

## Construct Validity

The evaluation measures perceptions of the prototype rather than deployment performance.

Mitigation

Clearly define evaluation objectives as architectural rather than operational.

---

## Conclusion Validity

Small sample sizes reduce statistical power.

Mitigation

Focus primarily on qualitative insights supported by descriptive statistics.

---

# Limitations

The evaluation does not include:

Real DIGIT deployment

Real AI models

Production workloads

Large-scale performance testing

Multiple concurrent users

Long-term adoption

These limitations are acceptable because the research investigates architectural design rather than production readiness.

---

# Expected Outcomes

The evaluation is expected to demonstrate that:

• Participants can successfully author government applications.

• The Application Definition improves transparency.

• Structured operations improve traceability.

• Deterministic compilation increases confidence.

• The architecture is understandable and explainable.

• Human review before compilation is perceived as valuable.

These findings will provide evidence supporting the proposed architecture.

---

# Mapping Evaluation to Research Questions

| Research Question | Evaluation Method | Success Measure |
|-------------------|-------------------|-----------------|
| RQ1 | Task completion | ≥90% completion rate |
| RQ2 | Questionnaire + Interview | Mean ≥4/5 for transparency |
| RQ3 | Trust questionnaire | Mean ≥4/5 confidence rating |
| RQ4 | Architecture walkthrough + Interview | Participants correctly explain key components |
| RQ5 | Validation task | Participants identify and resolve validation errors |

---

# Deliverables

The evaluation will produce:

• Task completion statistics

• SUS scores

• NASA-TLX scores

• Interview transcripts

• Observation notes

• Participant suggestions

• Architecture improvement recommendations

• Evidence supporting or challenging the proposed architecture

These results will form the basis of the Evaluation chapter of the dissertation.