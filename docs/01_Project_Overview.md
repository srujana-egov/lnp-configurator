# AI-Assisted DIGIT Application Configurator
## Interactive Architecture Prototype

---

# 1. Project Objective

Develop a high-fidelity interactive prototype demonstrating an AI-assisted application configuration platform for DIGIT.

This is NOT a production system.

This is NOT connected to an LLM.

This is NOT connected to DIGIT.

The purpose is to visually demonstrate the proposed research architecture through a clickable prototype.

The application should simulate how an administrator can create a DIGIT application using natural language while visualising every architectural component involved.

The prototype should feel like a professional enterprise application similar to Microsoft Azure Portal, AWS Console, or Figma—not a student project.

---

# 2. Research Goal

Current DIGIT configuration requires administrators to manually configure multiple independent modules such as:

- Registry
- Workflow
- Notifications
- Calculation
- Roles
- Localization

This research proposes an AI-assisted authoring platform where administrators describe an application conversationally.

The AI gradually builds a structured Application Definition.

Once complete, deterministic compilers transform the Application Definition into DIGIT configuration files.

The prototype demonstrates this architecture.

---

# 3. Primary Users

### User 1

DIGIT System Administrator

Responsibilities

- Creates new applications
- Defines workflows
- Configures registry
- Creates notification rules
- Publishes applications

---

### User 2

Research Evaluator

The evaluator should understand the proposed architecture simply by interacting with the prototype.

Every component must explain itself.

---

# 4. Prototype Goals

The prototype should allow users to:

✔ Start a conversation

✔ Watch the architecture process the request

✔ See information extracted

✔ Watch structured operations generated

✔ Watch Application Definition evolve

✔ Observe completeness checking

✔ Answer clarification questions

✔ View live previews

✔ Review application

✔ Run deterministic compilation

✔ Generate DIGIT configuration files

---

# 5. Out of Scope

The prototype does NOT require:

Authentication

Databases

Real AI

Real DIGIT APIs

Saving projects

Deployment

Multi-user support

Error recovery

Backend implementation

Networking

Everything should use mocked data.

---

# 6. High-Level Architecture

The prototype demonstrates two independent phases.

---------------------------------------------

PHASE 1

AI-Assisted Application Authoring

Administrator

↓

Conversation

↓

AI Orchestrator

↓

Application Understanding

↓

Structured Operations

↓

Operation Executor

↓

Application Definition

↓

Completeness Engine

↓

Review

---------------------------------------------

PHASE 2

Deterministic Compilation

Confirmed Application Definition

↓

Reference Resolver

↓

Registry Compiler

↓

Workflow Compiler

↓

Fee Compiler

↓

Notification Compiler

↓

DIGIT Configurations

---------------------------------------------

---

# 7. Design Philosophy

The application should communicate these ideas visually.

1. AI only exists during authoring.

2. AI never directly edits configuration.

3. Structured operations modify the Application Definition.

4. Application Definition is the single source of truth.

5. Compilers never use conversation history.

6. Compilation is deterministic.

7. Human approval happens before compilation.

Every screen should reinforce these ideas.

---

# 8. Technology Stack

Framework

React 18

TypeScript

Vite

TailwindCSS

shadcn/ui

Framer Motion

React Flow

Lucide Icons

No backend.

All data stored locally.

---

# 9. Overall Navigation

Landing Page

↓

Workspace

↓

Phase 1

↓

Review

↓

Phase 2

↓

Generated Configurations

---

# 10. Main Workspace

The main workspace contains four major regions.

------------------------------------------------------------

LEFT

Conversation Panel

------------------------------------------------------------

CENTER

Interactive Architecture

------------------------------------------------------------

RIGHT

Application Definition

------------------------------------------------------------

BOTTOM

Timeline + Playback Controls

------------------------------------------------------------

Everything updates simultaneously.

---

# 11. Visual Style

The interface should feel modern and minimal.

Inspired by:

Microsoft Azure

Figma

GitHub

Linear

Notion

Use plenty of whitespace.

Rounded cards.

Subtle shadows.

Blue accent colour.

Soft animations.

No bright colours.

Professional appearance.

---

# 12. Animation Principles

Every architectural step should animate.

Data should appear to flow.

Boxes should highlight when active.

Arrows should animate.

Cards should fade smoothly.

Nothing should appear instantly.

---

# 13. Prototype Modes

### Manual Mode

User clicks "Next"

Architecture advances one step.

### Auto Demo Mode

Entire scenario plays automatically.

Ideal for thesis presentation.

### Research Mode

Clicking any architecture component opens an explanation panel showing:

Purpose

Inputs

Outputs

Example

Research rationale

Implementation responsibility

---

# 14. Example Scenario

The default demonstration uses:

Birth Certificate Application

Conversation begins with:

"Create a Birth Certificate application where citizens apply online. A registrar verifies applications before approval."

Everything in the prototype should revolve around this scenario.

---

# 15. Expected User Journey

Landing Page

↓

Start Prototype

↓

Conversation Begins

↓

Architecture Processes Input

↓

Application Definition Builds

↓

Completeness Engine Detects Missing Information

↓

User Answers

↓

Application Completes

↓

Review

↓

Compilation

↓

DIGIT Configurations Generated

↓

End Demo

---

# 16. Success Criteria

A user unfamiliar with the architecture should understand:

How natural language becomes structured information.

How structured operations update the Application Definition.

Why the Application Definition is central.

How completeness checking works.

Why compilation is deterministic.

How DIGIT configurations are generated.

Without reading any documentation.
