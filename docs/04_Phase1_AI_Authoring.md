# Phase 1 – AI-Assisted Application Authoring

---

# Purpose

This document specifies the behaviour of Phase 1.

Phase 1 demonstrates how natural language is transformed into a structured
Application Definition through AI-assisted authoring.

No configuration files are generated in this phase.

The objective is only to construct a complete Application Definition.

---

# Phase Overview

Administrator

↓

Conversation

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

Preview

↓

Repeat Until Complete

↓

Review

---

# Workspace Layout

---------------------------------------------------------

LEFT

Conversation

---------------------------------------------------------

CENTER

Architecture Pipeline

---------------------------------------------------------

RIGHT

Application Definition

---------------------------------------------------------

BOTTOM

Timeline

---------------------------------------------------------

All four panels remain visible throughout Phase 1.

---

# Initial State

Conversation

Empty

Architecture

Inactive

Application Definition

Empty

Preview

Empty

Timeline

Conversation highlighted.

---

# Welcome Screen

Display

---------------------------------------------

AI-Assisted DIGIT Application Configurator

Create a government application using natural language.

The AI will guide you while building a structured
Application Definition.

Press Start to begin.

---------------------------------------------

Button

Start Prototype

---

# Demo Conversation

Administrator

Create a Birth Certificate application where citizens apply online.
A registrar verifies applications before approval.

User presses Send.

---

# Step 1

Conversation Interface

Animation

Administrator message slides into chat.

Timeline

Conversation becomes green.

Conversation Interface glows.

Arrow animates.

Conversation Manager activates.

---

# Conversation Manager

Store

Conversation History

Current Step

Conversation Context

Pending Questions

Progress

Example Context

{

step:1,

application:null,

workflow:null,

registry:null,

roles:null

}

Visual

Context badge updates.

History count becomes 1.

---

# Step 2

AI Orchestrator

Activates.

Animation

Blue pulse.

Displays

Understanding Request

↓

Application Understanding Engine

---

# Step 3

Application Understanding Engine

Animation

The sentence gradually breaks apart.

Example

Create

↓

Application

Birth Certificate

Citizens

↓

Applicant

Registrar

↓

Role

Approval

↓

Workflow

Late Registration

↓

Fee Rule

Everything appears as animated chips.

---

# Extracted Knowledge

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

Confidence

98%

---

# Step 4

Structured Operations

Animate operation cards.

Operation 1

CREATE_APPLICATION

Operation 2

CREATE_ROLE

Operation 3

CREATE_WORKFLOW

Operation 4

CREATE_FEE_POLICY

Cards slide downward.

---

# Step 5

Operation Executor

Operation cards move.

Application Definition begins updating.

Metadata

Appears.

Workflow

Appears.

Roles

Appear.

Fees

Placeholder created.

Registry

Still empty.

Notifications

Still empty.

---

# Application Definition

Metadata

Application Name

Birth Certificate

Applicant

Citizen

Department

Birth Registration

Workflow

Submission

↓

Verification

↓

Approval

Roles

Citizen

Registrar

Fees

Late Registration

Notifications

Pending

Registry

Missing

---

# Preview

Form

Empty

Workflow

Visible

Fee Summary

Placeholder

Notification Summary

Empty

---

# Step 6

Completeness Engine

Runs automatically.

Checklist

Metadata

Complete

Registry

Missing

Workflow

Complete

Roles

Complete

Fees

Partial

Notifications

Missing

Overall

55%

Progress Bar

55%

Orange.

---

# Clarification

Animation

Completeness Engine glows.

AI thinks.

AI asks

What information should citizens provide when applying?

Suggested Replies

Child Name

Date of Birth

Gender

Hospital Details

Parents Information

User may

Click suggestions

OR

Type manually.

---

# User Response

Example

Child Name

Date of Birth

Gender

Hospital Name if born in hospital.

Conversation updates.

---

# Step 7

Application Understanding Engine

Extracts

Registry Fields

Field

Child Name

Type

Text

Required

True

Field

Date of Birth

Type

Date

Required

True

Field

Gender

Type

Dropdown

Required

True

Field

Hospital Name

Conditional

Yes

---

# Operations Generated

CREATE_SECTION

Citizen Details

ADD_FIELD

Child Name

ADD_FIELD

DOB

ADD_FIELD

Gender

CREATE_CONDITIONAL_SECTION

Hospital Details

---

# Application Definition Updates

Registry

Citizen Details

Child Name

DOB

Gender

Hospital Details

Hospital Name

---

# Live Preview

Form updates immediately.

Citizen Details

----------------------------

Child Name

Date of Birth

Gender

Hospital Details

Hospital Name

Only visible if

Born in Hospital

---

# Completeness Engine

Runs again.

Metadata

Complete

Registry

Complete

Workflow

Complete

Roles

Complete

Fees

Partial

Notifications

Missing

Overall

78%

Progress bar animates.

---

# Clarification 2

AI asks

How should late registration fees be calculated?

Suggested Replies

Free within 30 days

£100 after 30 days

No Fees

Custom Rule

User clicks

Free within 30 days

£100 after 30 days

---

# Operations

CREATE_FEE_RULE

FREE

CREATE_FEE_RULE

£100

---

# Fee Preview

Free

Within 30 Days

£100

After 30 Days

Animated cards.

---

# Completeness

Metadata

Complete

Registry

Complete

Workflow

Complete

Roles

Complete

Fees

Complete

Notifications

Missing

Overall

90%

---

# Clarification 3

AI asks

What notifications should be sent?

Suggestions

SMS after approval

Email after approval

SMS on rejection

None

User selects

SMS after approval

---

# Operations

CREATE_NOTIFICATION

Event

Approval

Channel

SMS

Recipient

Citizen

---

# Notification Preview

Approval

↓

Citizen

↓

SMS

---

# Final Completeness Check

Metadata

Complete

Registry

Complete

Workflow

Complete

Roles

Complete

Fees

Complete

Notifications

Complete

Overall

100%

Progress Bar

Green

Confetti is NOT required.

Professional success animation only.

---

# Review Screen

Display

Application Summary

Metadata

Registry

Workflow

Roles

Fees

Notifications

Buttons

Edit Application

Confirm Application

---

# Edit Mode

If Edit is selected

Administrator may type

Move Hospital Details above Documents.

Rename Citizen Details to Applicant Details.

Make Gender optional.

Delete Hospital Details.

Every edit creates new operations.

Application Definition updates.

Preview updates.

Architecture animates again.

---

# Confirm Application

Button

Confirm

Animation

Application Definition card glows.

Timeline advances.

Phase 2 unlocks.

---

# Timeline

Conversation

Complete

Understanding

Complete

Operations

Complete

Application Definition

Complete

Validation

Current

Compilation

Locked

Deployment

Locked

---

# AI Behaviour

No real AI required.

Use predefined conversation scripts.

Use mocked extracted data.

Use mocked operations.

The prototype demonstrates architecture rather than AI capability.

---

# Research Notes

Throughout Phase 1, continuously reinforce these ideas:

AI performs understanding only.

Operations separate reasoning from execution.

Application Definition is the canonical model.

Completeness Engine drives the conversation.

The human remains in control.

Nothing is compiled until confirmation.