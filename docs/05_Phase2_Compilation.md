# 05_Phase2_Compilation.md

# Phase 2 – Deterministic Compilation

---

# Purpose

Phase 2 begins only after the administrator confirms the Application Definition.

Unlike Phase 1, no AI is involved.

The objective of this phase is to transform the canonical Application Definition into deployable DIGIT configuration files through deterministic compilation.

The prototype must clearly communicate that this phase is entirely rule-based and reproducible.

---

# Phase Overview

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

↓

Deployment Ready

---

# Entering Phase 2

When the administrator clicks

Confirm Application

The interface transitions.

Animation

Phase 1 becomes slightly faded.

Timeline advances.

Phase 2 becomes active.

Architecture canvas changes.

The Application Definition remains visible because it is now the input to every compiler.

---

# Workspace Layout

----------------------------------------------------------

LEFT

Compilation Progress

----------------------------------------------------------

CENTER

Compilation Pipeline

----------------------------------------------------------

RIGHT

Generated Configuration Preview

----------------------------------------------------------

BOTTOM

Timeline

----------------------------------------------------------

---

# Step 1

Compilation Starts

Display message

----------------------------------------

Application confirmed.

Beginning deterministic compilation.

----------------------------------------

Animation

Application Definition glows.

Blue particles begin flowing.

---

# Component 1

Reference Resolver

Purpose

Validate the Application Definition before compilation.

No configuration is generated here.

Only validation.

---

# Responsibilities

Check role references.

Check workflow references.

Check registry field references.

Check notification references.

Check fee references.

Check mandatory metadata.

---

# Visual

Checklist.

Each validation appears one by one.

Example

✓ Registrar role exists

✓ Citizen role exists

✓ Approval workflow exists

✓ DOB field exists

✓ SMS notification references Approval

✓ Metadata complete

Animation

Checks appear every 500ms.

Progress circle fills.

---

# Success

Large green message

Reference Resolution Complete

Continue to compilation.

---

# Failure (Demo Option)

If Presentation Mode enables "Show Validation Error"

Display

Fee Rule references field

Registration Date

Status

Missing

Compilation halted.

Fix required before continuing.

---

# Step 2

Registry Compiler

Purpose

Transform Registry portion of the Application Definition into Registry JSON.

---

# Input Panel

Display

Registry

Citizen Details

Child Name

Date of Birth

Gender

Hospital Details

Hospital Name

---

# Transformation Animation

Registry card moves into compiler.

Compiler glows.

Loading animation

Generating Registry Configuration...

---

# Output

registry.json

{

"sections":[

...

],

"fields":[

...

]

}

Display only abbreviated JSON.

Button

Expand JSON

---

# Step 3

Workflow Compiler

Purpose

Generate Workflow Configuration.

---

# Input

Workflow

Submission

↓

Verification

↓

Approval

---

# Animation

Workflow flows into compiler.

Compiler processes.

Output appears.

---

# Output

workflow.json

{

"states":[

...

],

"transitions":[

...

]

}

Workflow preview remains visible beside JSON.

---

# Step 4

Fee Compiler

Purpose

Generate Calculation Configuration.

---

# Input

Free

Within 30 Days

£100

After 30 Days

---

# Animation

Fee cards combine.

Compiler activates.

---

# Output

calculation.json

{

"rules":[

...

]

}

---

# Step 5

Notification Compiler

Purpose

Generate Notification Configuration.

---

# Input

Approval

↓

Citizen

↓

SMS

---

# Output

notification.json

{

"events":[

...

]

}

---

# Parallel Compilation

Although shown sequentially for clarity,

display a note

"Compilers can execute independently because they all consume the same canonical Application Definition."

Show small parallel arrows.

This reinforces your architecture.

---

# Generated Configurations

Right Panel

Shows generated files.

registry.json

✓

workflow.json

✓

calculation.json

✓

notification.json

✓

Clicking a file

Opens preview drawer.

---

# Preview Drawer

Title

registry.json

Contains

Syntax highlighted JSON.

Sections

Purpose

Generated From

Application Definition Mapping

Example Output

---

# Compilation Timeline

Reference Resolution

✓

Registry

✓

Workflow

✓

Fee

✓

Notification

✓

Deployment

Ready

Timeline becomes completely green.

---

# Deployment Card

Final screen.

---------------------------------------

DIGIT Configuration Generated

---------------------------------------

registry.json

workflow.json

calculation.json

notification.json

---------------------------------------

Status

Ready for Deployment

---------------------------------------

Button

Restart Demo

---

# Research Drawer

Every compiler includes

Purpose

Input

Transformation

Output

Deterministic Rules

Research Contribution

Future Improvements

---

# Example

Workflow Compiler

Purpose

Transform workflow model into DIGIT workflow configuration.

Input

Workflow section of the Application Definition.

Transformation

Apply workflow compilation rules.

Generate state machine.

Output

workflow.json

Why deterministic?

Given the same Application Definition,

the compiler always produces identical output.

---

# Animation Rules

Compilation begins

↓

Application Definition glows

↓

Reference Resolver activates

↓

Green checkmarks appear

↓

Registry Compiler activates

↓

registry.json appears

↓

Workflow Compiler activates

↓

workflow.json appears

↓

Fee Compiler activates

↓

calculation.json appears

↓

Notification Compiler activates

↓

notification.json appears

↓

Deployment Ready

Each stage lasts approximately one second.

---

# Research Principles

Throughout Phase 2 continuously reinforce

• AI no longer participates.

• Application Definition is the only input.

• Every compiler is deterministic.

• Compilers are independent.

• Validation occurs before compilation.

• DIGIT receives generated configuration files.

These principles should be visually obvious without reading explanatory text.