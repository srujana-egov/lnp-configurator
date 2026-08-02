# Viva Demonstration Script

# AI-Assisted DIGIT Application Configurator

Version 1.0

---

# Purpose

This document provides a structured demonstration script for presenting the proposed AI-Assisted DIGIT Application Configurator during the dissertation viva.

The script is intended to:

- Explain the research motivation.
- Demonstrate the prototype.
- Highlight the research contributions.
- Reinforce the architectural decisions.
- Prepare for common examiner questions.

Recommended demonstration duration:

10–12 minutes

---

=============================================================================

Slide 1

Introduction

Duration

1 minute

=============================================================================

Good morning.

Today I will present my dissertation titled:

**AI-Assisted DIGIT Application Configurator: A Hybrid Architecture for AI-Assisted Government Application Authoring.**

Government application configuration on the DIGIT platform currently requires administrators to manually create and maintain several configuration files, including registry definitions, workflow configurations, notification rules and calculation logic.

Although Large Language Models are capable of generating configuration files, allowing AI to directly produce deployment-ready configurations introduces challenges including inconsistency, hallucinations, limited explainability and difficult validation.

The objective of this research is therefore **not** to replace software engineering with AI.

Instead, it is to investigate how AI can assist administrators while preserving deterministic software engineering principles.

Today's demonstration focuses on the proposed architecture rather than the intelligence of the AI itself.

---

Transition

"I'll begin by showing the overall architecture."

---

=============================================================================

Slide 2

Overall Architecture

Duration

1 minute

=============================================================================

(Open Architecture View)

The architecture consists of two clearly separated phases.

Phase 1 is **AI-Assisted Authoring**.

In this phase, natural language requirements are transformed into a structured internal model.

Phase 2 is **Deterministic Compilation**.

Here, the structured model is validated and compiled into DIGIT configuration files using deterministic software components.

The key design decision is that AI only participates during understanding.

Compilation never relies on AI.

This separation improves transparency, repeatability and trust.

---

Transition

"I'll now demonstrate Phase 1."

---

=============================================================================

Demo 1

Starting the Prototype

Duration

30 seconds

=============================================================================

(Open Landing Page)

Select:

Birth Certificate Application

Click:

Start Demo

Explain:

The prototype contains several government service scenarios.

Each scenario follows exactly the same architectural pipeline.

Only the application data changes.

---

=============================================================================

Demo 2

Conversation

Duration

1 minute

=============================================================================

The administrator begins by describing the application in natural language.

Example:

Create a Birth Certificate application where citizens apply online.

A registrar verifies applications before approval.

Notice that the interface resembles a conversation.

However, the conversation itself is **not** the system's internal representation.

It is simply the input mechanism.

The architecture immediately begins processing the request.

(Start autoplay or press Next)

---

=============================================================================

Demo 3

Architecture Execution

Duration

2 minutes

=============================================================================

Observe the architecture in the centre of the screen.

Each component activates sequentially.

The Conversation Manager stores the interaction context.

The AI Orchestrator coordinates the reasoning process.

The Application Understanding Engine extracts structured knowledge such as:

- application name
- roles
- workflow
- business rules

Rather than editing configuration directly, the AI generates **structured operations**.

Examples include:

CREATE_APPLICATION

CREATE_ROLE

CREATE_WORKFLOW

ADD_FIELD

These operations are then passed to the Operation Executor.

The Operation Executor is the only component permitted to modify the Application Definition.

This separation ensures that AI reasoning and state modification remain independent.

---

Pause animation.

Open the Research Drawer.

Explain one component.

Close drawer.

Resume playback.

---

=============================================================================

Demo 4

Application Definition

Duration

2 minutes

=============================================================================

(Open Application Definition)

This is the central contribution of the proposed architecture.

The Application Definition acts as the canonical intermediate representation.

It stores:

Metadata

Registry

Workflow

Roles

Fees

Notifications

Everything else in the system consumes this model.

Importantly:

Conversation history is no longer required once information has been transferred into the Application Definition.

This architecture is inspired by compiler design, where source code is transformed into an intermediate representation before code generation.

Switch to:

JSON View

Explain:

This JSON is not manually edited.

Every change results from deterministic operations.

Switch to:

Dependency Graph

Explain:

The graph illustrates relationships between different sections of the model.

These dependencies are later validated before compilation.

---

=============================================================================

Demo 5

Completeness Engine

Duration

1 minute

=============================================================================

Resume playback.

The Completeness Engine continuously evaluates the Application Definition.

Instead of asking a fixed sequence of questions, it identifies missing information dynamically.

For example:

Registry information is missing.

The engine therefore asks:

"What information should citizens provide?"

This means the conversation is driven by the state of the model rather than by predefined scripts.

This makes the architecture reusable across different government services.

---

=============================================================================

Demo 6

Preview

Duration

45 seconds

=============================================================================

(Open Preview)

The preview is generated directly from the Application Definition.

Not from the conversation.

Not from configuration files.

If the administrator modifies the model,

the preview updates automatically.

This provides immediate feedback before configuration generation begins.

---

=============================================================================

Demo 7

Review

Duration

30 seconds

=============================================================================

The administrator reviews the completed application.

This stage introduces an important governance mechanism.

Compilation cannot begin without explicit human approval.

This supports accountability and reduces deployment risk.

Click:

Confirm Application

---

=============================================================================

Demo 8

Deterministic Compilation

Duration

2 minutes

=============================================================================

Notice that AI is no longer active.

Compilation begins using only the confirmed Application Definition.

The Reference Resolver validates cross-module references.

For example:

Workflow references

Role references

Notification references

Registry references

Once validation succeeds,

independent compilers generate:

registry.json

workflow.json

calculation.json

notification.json

Each compiler is deterministic.

Given the same Application Definition,

the output will always be identical.

This improves reproducibility and simplifies testing.

---

=============================================================================

Demo 9

Generated Configuration

Duration

45 seconds

=============================================================================

(Open Generated Files)

These represent the deployment-ready configuration artifacts.

Each file is derived from the same canonical Application Definition.

The architecture therefore separates:

Natural language understanding

from

Configuration generation.

---

=============================================================================

Demo 10

Validation Error

Duration

1 minute

=============================================================================

Restart.

Select:

Validation Error Scenario

Run demonstration.

Observe:

Reference Resolver reports:

Notification references missing workflow state.

Compilation stops immediately.

This demonstrates another architectural advantage.

Errors are detected before deployment,

rather than after configuration generation.

---

=============================================================================

Research Contributions

Duration

1 minute

=============================================================================

The main contributions of this research are:

First,

a hybrid architecture that combines AI-assisted authoring with deterministic software engineering.

Second,

the introduction of the Application Definition as a canonical intermediate representation.

Third,

the use of structured operations to separate AI reasoning from state modification.

Fourth,

a Completeness Engine that drives adaptive conversations based on the state of the application model.

Finally,

a deterministic compilation pipeline that transforms the Application Definition into DIGIT configuration files.

---

=============================================================================

Evaluation

Duration

45 seconds

=============================================================================

The prototype is evaluated using:

Task-based usability studies.

System Usability Scale.

NASA Task Load Index.

Semi-structured interviews.

The evaluation focuses on the proposed architecture,

rather than evaluating Large Language Models.

---

=============================================================================

Conclusion

Duration

45 seconds

=============================================================================

To conclude,

this research demonstrates that AI can assist government application authoring without replacing deterministic software engineering.

The proposed architecture balances the flexibility of natural language interaction with the reliability, traceability and explainability required for government systems.

Rather than allowing AI to generate deployment-ready configuration directly,

the architecture introduces a structured intermediate representation and deterministic compilation pipeline.

This improves transparency,

supports validation,

and preserves human oversight.

Thank you.

I would be happy to answer any questions.

---

=============================================================================

Expected Examiner Questions

=============================================================================

Question

Why not generate configuration directly using GPT?

Suggested Answer

Direct generation is difficult to validate and reproduce. Introducing the Application Definition creates an explicit architectural boundary between probabilistic reasoning and deterministic compilation.

---

Question

Why use an intermediate representation?

Suggested Answer

The intermediate representation becomes the single source of truth. It supports validation, editing, preview generation and deterministic compilation.

---

Question

Why use mocked AI?

Suggested Answer

The research investigates architectural design rather than comparing language models. Mocking AI ensures repeatable demonstrations and isolates the architectural contribution.

---

Question

Could another LLM replace GPT?

Suggested Answer

Yes. The architecture is model-agnostic. Any language model capable of producing the required structured understanding could be integrated without changing the remaining architecture.

---

Question

Why separate authoring and compilation?

Suggested Answer

Government systems require deterministic behaviour. Separating these phases allows AI to assist creativity while preserving reliability during configuration generation.

---

Question

What is the main research contribution?

Suggested Answer

The primary contribution is the architectural design that combines AI-assisted authoring, a canonical intermediate representation and deterministic compilation into a transparent and explainable configuration pipeline.

---

=============================================================================

Presentation Tips

=============================================================================

Maintain a steady pace.

Do not read the script verbatim.

Pause after introducing major architectural concepts.

Allow animations to complete before speaking about the next component.

When discussing the architecture,

refer to the visual components on screen.

Emphasise the architectural decisions rather than implementation details.

If interrupted,

answer the question before continuing.

The architecture is the research contribution.

The prototype exists to communicate and evaluate that architecture.