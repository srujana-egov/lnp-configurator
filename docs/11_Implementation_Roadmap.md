# 11_Implementation_Roadmap.md

# AI-Assisted DIGIT Application Configurator

Implementation Roadmap

Version 1.0

---

# Purpose

This document defines the implementation roadmap for the research prototype.

Unlike the previous documents, this is intended for the developer.

It provides

• Development order

• Time estimates

• Git commit strategy

• Milestones

• Definition of Done

• Dissertation artefacts

---

# Overall Timeline

Week 1

Architecture Foundation

Week 2

Interactive Prototype

Week 3

Polish

Week 4

Dissertation Assets

---

=============================================================================

MILESTONE 1

Project Foundation

=============================================================================

Estimated Time

3 Hours

Tasks

✓ Create React project

✓ Configure TypeScript

✓ Install Tailwind

✓ Install shadcn/ui

✓ Install Framer Motion

✓ Install React Flow

✓ Install Lucide Icons

✓ Configure folder structure

Definition of Done

Application starts successfully.

Dark mode works.

Theme configured.

Git Commit

feat: initialise project structure

---

=============================================================================

MILESTONE 2

Layout

=============================================================================

Estimated Time

5 Hours

Tasks

Landing page

Workspace

Header

Conversation panel

Architecture panel

Application Definition panel

Timeline

Definition of Done

Entire layout matches specification.

Git Commit

feat: implement workspace layout

---

=============================================================================

MILESTONE 3

Architecture Canvas

=============================================================================

Estimated Time

8 Hours

Tasks

Architecture nodes

Connections

Flow animations

Clickable nodes

Research drawer

Definition of Done

Every component is visible.

Every node clickable.

Git Commit

feat: architecture visualisation

---

=============================================================================

MILESTONE 4

Conversation

=============================================================================

Estimated Time

6 Hours

Tasks

Chat

Typing animation

Suggested replies

Conversation state

Definition of Done

Scripted conversations work.

Git Commit

feat: conversation experience

---

=============================================================================

MILESTONE 5

Application Definition

=============================================================================

Estimated Time

10 Hours

Tasks

Metadata

Registry

Workflow

Roles

Fees

Notifications

Dependency graph

JSON viewer

Definition of Done

Application Definition updates correctly.

Git Commit

feat: application definition model

---

=============================================================================

MILESTONE 6

Completeness Engine

=============================================================================

Estimated Time

5 Hours

Tasks

Checklist

Progress

Missing information

Suggested questions

Definition of Done

Completeness updates after every operation.

Git Commit

feat: completeness engine

---

=============================================================================

MILESTONE 7

Preview

=============================================================================

Estimated Time

6 Hours

Tasks

Form preview

Workflow preview

Fee preview

Notification preview

Definition of Done

Preview reflects Application Definition.

Git Commit

feat: live preview

---

=============================================================================

MILESTONE 8

Compilation

=============================================================================

Estimated Time

8 Hours

Tasks

Reference Resolver

Registry Compiler

Workflow Compiler

Fee Compiler

Notification Compiler

Generated Files

Definition of Done

Compilation animation completes.

Git Commit

feat: deterministic compilation

---

=============================================================================

MILESTONE 9

Research Mode

=============================================================================

Estimated Time

5 Hours

Tasks

Research drawer

Developer console

JSON viewer

Dependency graph

Definition of Done

Every architecture component explains itself.

Git Commit

feat: research mode

---

=============================================================================

MILESTONE 10

Polish

=============================================================================

Estimated Time

10 Hours

Tasks

Accessibility

Performance

Animation polish

Responsive layout

Dark mode

Bug fixes

Definition of Done

Prototype ready for presentation.

Git Commit

chore: final polish

---

# Dissertation Assets

Capture screenshots for

Landing Page

Conversation

Architecture

Application Definition

Completeness Engine

Review Screen

Compilation

Generated Configurations

Research Mode

Developer Console

Dependency Graph

Validation Error

Dark Mode

---

# Figures for Dissertation

Figure 1

Landing Page

Figure 2

Architecture Workspace

Figure 3

Conversation Flow

Figure 4

Application Definition

Figure 5

Completeness Engine

Figure 6

Compilation Pipeline

Figure 7

Reference Resolution

Figure 8

Generated Configuration

Figure 9

Research Mode

Figure 10

Developer Console

---

# Demo Script

Start

↓

Landing Page

↓

Select Birth Certificate

↓

Start Demo

↓

Show Conversation

↓

Show Architecture

↓

Pause

↓

Open Research Drawer

↓

Resume

↓

Application Definition Updates

↓

Dependency Graph

↓

JSON Viewer

↓

Complete Phase 1

↓

Confirm

↓

Phase 2

↓

Reference Resolver

↓

Compilation

↓

Generated Files

↓

Restart

↓

Run Invalid Scenario

↓

Validation Error

↓

End

---

# Viva Checklist

Before Presentation

□ Dark mode works

□ All scenarios load

□ Animations smooth

□ JSON viewer works

□ Dependency graph works

□ Research drawer opens

□ Developer console updates

□ Playback controls work

□ Validation scenario works

□ Reset works

---

# Stretch Goals

If time permits

□ Search inside Application Definition

□ Zoom architecture canvas

□ Export Application Definition

□ Download generated JSON

□ Mini-map for architecture

□ Keyboard shortcuts

□ Full-screen presentation mode

---

# Final Acceptance Criteria

The prototype is successful if:

✓ The architecture is understandable without reading the thesis.

✓ Every architectural component has a clear responsibility.

✓ The Application Definition acts as the canonical model.

✓ AI-assisted authoring is visually separated from deterministic compilation.

✓ The prototype is stable enough for live demonstrations.

✓ The prototype produces publication-quality screenshots.

✓ The implementation accurately reflects the proposed architecture.