# 06_ApplicationDefinition_Model.md

# Canonical Application Definition Specification

---

# Purpose

The Application Definition is the canonical representation of a government application.

It is the single source of truth throughout the system.

Every AI interaction, operation, preview, validation and compiler reads or updates this model.

Conversation history is never used after information has been transformed into the Application Definition.

This model is conceptually equivalent to the Intermediate Representation (IR) used inside a compiler.

---

# Architectural Principle

Natural Language

↓

Structured Understanding

↓

Structured Operations

↓

Application Definition

↓

Preview

↓

Validation

↓

Compilation

↓

DIGIT Configurations

The Application Definition is the centre of the architecture.

Nothing bypasses it.

---

# Why It Exists

Without this model

AI would directly generate Registry JSON.

AI would directly generate Workflow JSON.

AI would directly generate Notification JSON.

Those outputs would be difficult to validate.

Difficult to edit.

Impossible to replay.

Impossible to inspect.

Instead

Everything becomes

↓

Application Definition

↓

Deterministic Compilation

---

# Responsibilities

The Application Definition stores

Metadata

Registry

Workflow

Roles

Fees

Notifications

Application Settings

Relationships

Nothing else stores application knowledge.

---

# Life Cycle

Initially

{}

↓

Metadata added

↓

Workflow added

↓

Roles added

↓

Registry grows

↓

Fees added

↓

Notifications added

↓

Complete

↓

Read-only after confirmation

↓

Compilation begins

---

# Complete JSON Structure

{

metadata:{},

registry:{},

workflow:{},

roles:[],

fees:{},

notifications:{},

settings:{}

}

---

# Metadata

Purpose

Describe the application.

Example

metadata

{

name:"Birth Certificate",

description:"Birth Registration Service",

department:"Birth Registration",

applicantType:"Citizen",

version:"1.0"

}

---

# Registry

Purpose

Describe all forms.

Example

registry

{

sections:[

{

title:"Citizen Details",

fields:[

...

]

}

]

}

---

# Registry Field

{

id:"child_name",

label:"Child Name",

type:"text",

required:true

}

Another example

{

id:"dob",

label:"Date of Birth",

type:"date",

required:true

}

---

# Conditional Field

{

id:"hospital",

label:"Hospital Name",

type:"text",

visibleWhen

{

bornInHospital:true

}

}

---

# Workflow

Purpose

Describe the process.

Example

workflow

{

states:[

Submission,

Verification,

Approval

],

transitions:[

...

]

}

---

# Workflow State

{

id:"verification",

label:"Verification",

assignedRole:"Registrar"

}

---

# Workflow Transition

{

from:"Submission",

to:"Verification"

}

---

# Roles

Purpose

Define actors.

Example

roles

[

Citizen,

Registrar,

Supervisor

]

---

# Fee Rules

fees

{

rules:[

{

condition

"Within 30 Days",

amount:0

},

{

condition

"After 30 Days",

amount:100

}

]

}

---

# Notifications

notifications

{

rules:[

{

event

"Approval",

channel

"SMS",

recipient

"Citizen"

}

]

}

---

# Application Settings

settings

{

draft:true,

published:false,

language:"English"

}

---

# How Operations Modify It

Operation

CREATE_APPLICATION

Updates

metadata

---------------------------------

Operation

CREATE_ROLE

Updates

roles

---------------------------------

Operation

ADD_FIELD

Updates

registry

---------------------------------

Operation

CREATE_WORKFLOW

Updates

workflow

---------------------------------

Operation

CREATE_NOTIFICATION

Updates

notifications

---------------------------------

Operation

CREATE_FEE_RULE

Updates

fees

---------------------------------

Every operation modifies exactly one part.

No component edits multiple sections directly.

---

# Example Evolution

Initial

{

}

↓

CREATE_APPLICATION

{

metadata

{

name

Birth Certificate

}

}

↓

CREATE_ROLE

{

metadata

...

roles

Citizen

Registrar

}

↓

CREATE_WORKFLOW

{

metadata

...

roles

...

workflow

Submission

↓

Verification

↓

Approval

}

↓

ADD_FIELD

Registry appears.

↓

CREATE_NOTIFICATION

Notification appears.

↓

Application Complete.

---

# Visual Representation

Inside the prototype

The Application Definition appears as expandable cards.

Metadata

Registry

Workflow

Roles

Fees

Notifications

Settings

Each section expands.

Each update animates.

New fields glow briefly.

---

# JSON Viewer

Research Mode

Allows switching between

Card View

and

Raw JSON

Example

{

metadata:

...

workflow:

...

roles:

...

}

Syntax highlighting.

Read-only.

---

# Dependencies

Workflow references Roles.

Notifications reference Workflow.

Fees reference Registry.

Validation checks these relationships.

Example

Notification

↓

Approval

↓

Workflow

Role

↓

Registrar

↓

Roles

Fee

↓

Registration Date

↓

Registry

These relationships should be visible.

---

# Data Ownership

Conversation

Does NOT own data.

AI

Does NOT own data.

Operations

Temporary only.

Application Definition

Owns everything.

This should be highlighted.

---

# Why It Is Like A Compiler IR

Source Code

↓

Parser

↓

AST

↓

IR

↓

Compiler

↓

Machine Code

Our Architecture

Natural Language

↓

Understanding

↓

Operations

↓

Application Definition

↓

Compilers

↓

DIGIT Configurations

This comparison should be displayed in Research Mode.

---

# Research Drawer

Clicking Application Definition opens

Purpose

Single Source of Truth

Owner

Operation Executor

Consumed By

Preview

Completeness Engine

Reference Resolver

Registry Compiler

Workflow Compiler

Fee Compiler

Notification Compiler

Never Consumed By

Conversation History

Why Important

Separates AI reasoning from deterministic software engineering.

---

# Validation Indicators

Each section displays

Status

Complete

Incomplete

Missing

Example

Metadata

✓

Registry

✓

Workflow

✓

Roles

✓

Fees

⚠

Notifications

❌

Updates automatically.

---

# Editing

Every edit creates operations.

Example

Move Hospital Details

↓

MOVE_SECTION

Rename Citizen Details

↓

RENAME_SECTION

Delete Hospital Name

↓

DELETE_FIELD

Application Definition updates.

Preview updates.

Nothing edits JSON directly.

---

# Completion Criteria

The model is considered complete only when

Metadata complete

Registry complete

Workflow complete

Roles complete

Fees complete

Notifications complete

Reference validation passes

Only then

Confirm Application

becomes enabled.

---

# Key Research Principle

The Application Definition is not merely a data model.

It is the architectural boundary between AI-assisted authoring and deterministic compilation.

This separation is the fundamental design principle of the proposed architecture.

Everything before it may involve AI.

Everything after it must be deterministic.