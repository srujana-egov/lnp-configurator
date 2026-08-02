# AI-Assisted DIGIT Application Configurator

# Architecture Behaviour Specification

---

# Purpose

This document specifies every architectural component in the prototype.

Every component must:

• Have a clear responsibility

• Accept defined inputs

• Produce defined outputs

• Be visually represented

• Be clickable

• Explain itself

• Animate when active

The architecture itself is the primary feature of the application.

---

# Overall Architecture

Administrator

↓

Conversation Interface

↓

Conversation Manager

↓

AI Orchestrator

↓

Application Understanding Engine

↓

Structured Operations

↓

Operation Executor

↓

Application Definition

↓

Completeness Engine

↓

Review & Confirmation

===================================

PHASE 2

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

Generated DIGIT Configurations

---

# Animation Rules

Inactive

Grey

Running

Blue pulse

Completed

Green

Selected

Blue outline

Every transition animates.

No instant updates.

---

# COMPONENT 1

Administrator

Purpose

Represents the DIGIT administrator interacting with the system.

Input

Natural language.

Output

Conversation messages.

Example

"Create a Birth Certificate application where citizens apply online."

Visual

Person icon

Speech bubble

Animation

Speech bubble appears.

Conversation starts.

Click Behaviour

Explain:

• Human initiates authoring

• Human always remains in control

---

# COMPONENT 2

Conversation Interface

Purpose

Captures administrator instructions.

Responsibilities

Display messages

Collect responses

Show AI replies

Inputs

Administrator messages

Outputs

Conversation events

Example

Administrator

↓

Create Birth Certificate Application

Animation

Typing effect

Click

Purpose

Input

Output

Example

---

# COMPONENT 3

Conversation Manager

Purpose

Maintains conversation state.

Responsibilities

Conversation history

Current question

Current context

Clarification state

Progress

Inputs

Conversation events

Outputs

Context object

Visual

Stack of chat bubbles

Animation

Component glows.

History count increments.

Example Context

Conversation Step

3

Latest Intent

Create Workflow

Pending Question

Registry Fields

Click

Display Context JSON

{
  currentStep:3,
  pendingQuestion:"Registry"
}

---

# COMPONENT 4

AI Orchestrator

Purpose

Coordinates AI reasoning.

Responsibilities

Calls understanding engine

Requests clarification

Creates operations

Never edits the model.

Inputs

Conversation Context

Outputs

Structured understanding request

Visual

Brain icon

Animation

Pulse

Blue glow

Click

Explain orchestration responsibilities.

---

# COMPONENT 5

Application Understanding Engine

Purpose

Transforms natural language into structured knowledge.

Responsibilities

Intent Recognition

Entity Extraction

Relationship Extraction

Workflow Extraction

Role Extraction

Constraint Detection

Ambiguity Detection

Outputs

Structured information.

Example Input

Create a Birth Certificate application where citizens apply online.

Example Output

Application

Birth Certificate

Applicant

Citizen

Workflow

Submission

Verification

Approval

Roles

Registrar

Fees

Late Registration

Animation

Text transforms into structured cards.

Click

Show transformation animation.

---

# COMPONENT 6

Structured Operations

Purpose

Convert extracted knowledge into deterministic operations.

Operations are replayable.

Examples

CREATE_APPLICATION

CREATE_ROLE

CREATE_WORKFLOW_STATE

CREATE_SECTION

ADD_FIELD

ADD_VALIDATION

SET_REQUIRED

CREATE_NOTIFICATION

SET_FEE_RULE

MOVE_FIELD

DELETE_FIELD

Visual

Operation cards.

Animation

Cards appear one after another.

Click

Shows

Operation

Description

Target

Result

---

# COMPONENT 7

Operation Executor

Purpose

The ONLY component allowed to modify the Application Definition.

Responsibilities

Execute operations

Update model

Trigger preview refresh

Never interpret language.

Input

Operations

Output

Updated model

Animation

Operations flow into Application Definition.

Click

Explain

Deterministic execution.

---

# COMPONENT 8

Application Definition

Purpose

Canonical representation.

Single source of truth.

Contains

Metadata

Registry

Workflow

Roles

Fees

Notifications

Everything else depends on this model.

Conversation history is NEVER used after this point.

Visual

Expandable cards.

Animation

Each section fills gradually.

Click

Shows complete JSON.

Example

Application

Metadata

Registry

Workflow

Roles

Fees

Notifications

---

# COMPONENT 9

Completeness Engine

Purpose

Determine whether sufficient information exists.

Checks

Metadata

Registry

Workflow

Roles

Fees

Notifications

Produces

Completion report.

Example

Metadata

Complete

Registry

Missing

Workflow

Complete

Fees

Partial

Notifications

Missing

Animation

Checklist updates.

Click

Shows

Missing information

Reason

Suggested question

---

# COMPONENT 10

Review & Confirmation

Purpose

Human approval.

Displays

Form

Workflow

Fees

Notifications

Buttons

Edit

Confirm

Publish

Animation

Green success banner.

Click

Explain

Human validates before compilation.

===========================================

PHASE 2

===========================================

# COMPONENT 11

Reference Resolver

Purpose

Validate cross references.

Checks

Role exists

Workflow exists

Registry field exists

Fee references valid field

Notification event exists

Animation

Checklist.

Example

Registrar

✓

DOB Field

✓

Approval State

✓

---

# COMPONENT 12

Registry Compiler

Purpose

Generate Registry configuration.

Input

Application Definition

Output

Registry JSON

Animation

Application Definition

↓

Registry JSON

Click

Display

Input

Transformation

Output

---

# COMPONENT 13

Workflow Compiler

Purpose

Generate workflow configuration.

Example Output

States

Transitions

Actions

Assignments

Animation

Workflow diagram

↓

Workflow JSON

---

# COMPONENT 14

Fee Compiler

Purpose

Generate fee rules.

Example

Within 30 Days

Free

After 30 Days

£100

↓

Calculation Configuration

---

# COMPONENT 15

Notification Compiler

Purpose

Generate notification configuration.

Example

Approval

↓

Citizen

↓

SMS

↓

Notification Config

---

# COMPONENT 16

Generated DIGIT Configurations

Purpose

Final output.

Display

registry.json

workflow.json

calculation.json

notification.json

Status

Ready for Deployment

Animation

Files appear one at a time.

Green checkmarks.

---

# Research Drawer

Every architecture component opens the same drawer.

Drawer Sections

Purpose

Responsibilities

Inputs

Outputs

Example

Visual Representation

Research Contribution

Future Work

References

The drawer should help someone understand the architecture without reading the thesis.

---

# Data Flow Animation

When the user presses Next Step

Data should visibly move.

Conversation

↓

Understanding

↓

Operations

↓

Executor

↓

Application Definition

↓

Completeness Engine

↓

Preview

↓

Review

↓

Compilation

Every step should take approximately one second.

The viewer should feel like they are watching the architecture think.

---

# Key Research Principles

The interface must continuously reinforce these ideas.

AI only performs understanding.

AI never edits configuration.

Structured operations separate reasoning from execution.

Application Definition is the canonical model.

Completeness Engine drives the conversation.

Compilation is deterministic.

Human approval occurs before compilation.

DIGIT receives generated configuration files.

These principles should appear repeatedly throughout the prototype.