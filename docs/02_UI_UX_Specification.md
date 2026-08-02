# 02_UI_UX_Specification.md

# AI-Assisted DIGIT Application Configurator

## User Interface & Experience Specification

---

# 1. Design Philosophy

The application is an interactive architecture demonstration.

Every screen should answer three questions:

• What is happening?

• Which architectural component is active?

• What changed?

The interface should never overwhelm the user.

The focus is clarity.

---

# 2. Visual Inspiration

The application should resemble professional enterprise software.

Primary inspirations:

• Microsoft Azure Portal

• Figma

• Linear

• GitHub

• Notion

Avoid:

❌ Bright gradients

❌ Cartoon graphics

❌ Glassmorphism

❌ Gaming UI

❌ Dashboard overload

The interface should feel like software architects would actually use it.

---

# 3. Colour Palette

Background

#F8FAFC

Cards

White

Primary Accent

#2563EB

Success

#16A34A

Warning

#F59E0B

Error

#DC2626

Text

#0F172A

Secondary Text

#64748B

Borders

#E2E8F0

Active Component Glow

Blue outline

Subtle shadow

---

# 4. Typography

Font

Inter

Page Title

36px

Section Titles

24px

Card Titles

18px

Body

15px

Small Labels

13px

Everything should feel spacious.

---

# 5. Application Layout

The application uses one full-screen workspace.

------------------------------------------------------------

Header

------------------------------------------------------------

Main Workspace

------------------------------------------------------------

Footer Timeline

------------------------------------------------------------

---

# 6. Header

Height

72px

Contains

Logo

Project Name

Current Phase

Demo Controls

Research Mode Toggle

Dark Mode Toggle

Right side

Current Progress

Example

Phase 1

Building Application Definition

63% Complete

---

# 7. Main Workspace

The workspace contains three primary columns.

------------------------------------------------------------

LEFT

Conversation

25%

------------------------------------------------------------

CENTER

Architecture

45%

------------------------------------------------------------

RIGHT

Application Definition

30%

------------------------------------------------------------

Each panel has rounded corners.

Padding

24px

---

# 8. Left Panel

Conversation Interface

Purpose

Natural language interaction.

Top

Conversation Title

Middle

Chat Messages

Bottom

Input Box

Buttons

Send

Next Step

Reset

Auto Demo

---

Messages

Administrator

White bubble

AI

Blue tinted bubble

System

Grey card

---

Typing Animation

The AI should appear to type.

Words appear gradually.

Not instantly.

---

# 9. Centre Panel

Architecture Canvas

This is the most important area.

It should contain vertical architecture blocks.

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

Review

Every box should be clickable.

Every box should animate.

---

# 10. Architecture Component Cards

Each component is a rounded rectangle.

Contains

Icon

Title

One sentence description

Status indicator

Status

Inactive

Grey

Running

Blue pulse

Completed

Green

Selected

Blue border

---

Hover

Slight lift

Shadow

Cursor pointer

---

# 11. Animated Connections

Every arrow between components should animate.

When data moves

Blue line flows downward.

Small glowing particles move.

Only one active path at a time.

---

# 12. Right Panel

Application Definition

Title

Application Definition

Below

Progress Indicator

Metadata

Registry

Workflow

Roles

Fees

Notifications

Each expands independently.

Initially

Empty

As conversation progresses

Cards fill gradually.

---

# 13. Metadata Card

Contains

Application Name

Description

Applicant

Department

Status

Each field fades into view.

---

# 14. Registry Card

Shows

Sections

↓

Fields

↓

Validation

Example

Citizen Details

Child Name

DOB

Gender

---

# 15. Workflow Card

Shows a vertical workflow.

Submission

↓

Verification

↓

Approval

Each state appears when created.

---

# 16. Roles Card

Citizen

Registrar

Supervisor

Each appears as chips.

---

# 17. Fee Card

Shows rules.

Within 30 Days

Free

After 30 Days

£100

Cards appear one by one.

---

# 18. Notification Card

SMS

↓

Citizen

↓

Approval

Visual flow.

---

# 19. Bottom Timeline

Runs across the page.

Conversation

↓

Understanding

↓

Operations

↓

Definition

↓

Validation

↓

Compilation

↓

Deployment

Current stage glows.

Completed stages become green.

---

# 20. Playback Controls

Bottom right

Buttons

Play

Pause

Previous

Next

Restart

Playback Speed

1x

2x

5x

---

# 21. Research Mode

When enabled

Every architecture component becomes clickable.

Selecting one opens a floating drawer.

Drawer width

400px

Appears from right.

Contains

Purpose

Responsibilities

Inputs

Outputs

Example

Research Contribution

Future Improvements

---

# 22. Floating Drawer Example

Application Understanding Engine

Purpose

Transforms natural language into structured knowledge.

Input

Create a Birth Certificate application.

Output

Application

Roles

Workflow

Operations

Why it Exists

Separates language understanding from deterministic execution.

---

# 23. Demo Controls

Top Right

Start Demo

Pause Demo

Restart Demo

Jump to Phase 2

Presentation Mode

Presentation Mode hides buttons.

Only shows architecture.

---

# 24. Notification Toasts

Small toast appears.

Examples

Application Definition Updated

Workflow Created

Missing Information Detected

Compilation Started

Compilation Complete

Fade after three seconds.

---

# 25. Animations

Cards

Fade

Scale 0.95 → 1

Duration

300ms

Connections

Animated blue particles

Component Activation

Glow

Pulse

Timeline

Slide

Chat

Typing animation

Definition Cards

Fade upward

Compiler

Sequential highlight

---

# 26. Dark Mode

Dark Background

#0F172A

Cards

#1E293B

Accent

Blue remains.

Text

White

Borders

Grey

Everything else identical.

---

# 27. Empty States

Every panel should explain itself.

Example

No Workflow Yet

The workflow will appear after AI extracts process information.

Instead of blank panels.

---

# 28. Responsive Behaviour

Desktop

Three columns

Tablet

Architecture above

Conversation left

Definition right

Mobile

Single column

Accordion

Although the prototype is primarily designed for desktop.

---

# 29. Overall User Experience

The user should feel like they are watching an intelligent system think.

Nothing should happen instantly.

Everything should evolve.

Every interaction should reinforce the architecture proposed in the research.

The architecture itself should become the user interface.