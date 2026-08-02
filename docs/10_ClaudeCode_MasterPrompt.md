# 10_ClaudeCode_MasterPrompt.md

# Master Implementation Prompt

---

# Objective

Build a production-quality interactive research prototype called

**AI-Assisted DIGIT Application Configurator**

This prototype demonstrates a proposed software architecture for AI-assisted government application authoring.

It is intended for a Master's dissertation and academic demonstrations.

The objective is **not** to build a working DIGIT system.

The objective is to visually demonstrate the proposed architecture through a polished, interactive user experience.

---

# Before Writing Any Code

Read every specification document in order.

01_Project_Overview.md

02_UI_UX_Specification.md

03_Architecture_Specification.md

04_Phase1_AI_Authoring.md

05_Phase2_Compilation.md

06_ApplicationDefinition_Model.md

07_Component_Behaviour.md

08_Animation_Specification.md

09_Sample_Scenarios.md

Treat those documents as the source of truth.

Do not invent behaviour that contradicts the specifications.

---

# Project Goal

Produce a modern React application that feels like professional enterprise software.

It should resemble software such as

Microsoft Azure Portal

Figma

Linear

GitHub

It must not resemble a student dashboard.

---

# Technology Stack

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Framer Motion

React Flow

Lucide Icons

No backend.

No authentication.

No database.

No API.

No real LLM.

Everything should be mocked.

---

# Architecture Principles

Always preserve these rules.

AI performs understanding only.

AI never modifies configuration.

Only the Operation Executor updates the Application Definition.

The Application Definition is the single source of truth.

Compilers never modify the Application Definition.

Compilation is deterministic.

Reference validation occurs before compilation.

These principles should be reflected in both the UI and code structure.

---

# Code Quality Requirements

Use strict TypeScript.

Prefer functional React components.

Use hooks.

Avoid prop drilling where practical.

Keep components focused on a single responsibility.

Split large files into reusable components.

Do not create monolithic components.

Organise files according to the specification.

---

# UI Expectations

The interface should feel calm and professional.

Use generous whitespace.

Use subtle shadows.

Use restrained colours.

Avoid visual clutter.

Prioritise readability over decoration.

Animations should support understanding rather than aesthetics.

---

# Animation Expectations

Implement animations using Framer Motion.

Every architecture transition should be visible.

Data flow should be animated.

Component activation should be obvious.

Application Definition updates should be highlighted.

Compilation should appear sequential.

Respect reduced-motion preferences.

---

# Demo Behaviour

The application should support

Manual interaction

Guided autoplay

Presentation mode

Research mode

X-Ray mode

Developer console

All behaviours should be deterministic.

---

# Mock Data

Do not connect to an LLM.

Use predefined scenario data.

Use predefined operations.

Use predefined completeness checks.

Use predefined compiler outputs.

The objective is to demonstrate architecture rather than AI capability.

---

# Milestone-Based Development

Implement the application in the following order.

---

## Milestone 1

Project setup

Folder structure

Theme

Routing

Header

Workspace layout

Landing page

Success criteria

The application launches with the overall layout in place.

---

## Milestone 2

Conversation panel

Chat interface

Suggested replies

Message input

Typing animation

Success criteria

The scripted conversation can be played.

---

## Milestone 3

Architecture canvas

Architecture nodes

Edges

Flow animation

Research drawer

Success criteria

Every architecture component is visible, clickable, and animated.

---

## Milestone 4

Application Definition

Definition cards

Progress indicator

Expandable sections

JSON viewer

Dependency graph

Success criteria

The Application Definition updates from mocked operations.

---

## Milestone 5

Completeness Engine

Checklist

Progress

Suggested questions

Preview panel

Success criteria

Completeness updates automatically after each operation.

---

## Milestone 6

Review screen

Edit mode

Confirm application

Timeline updates

Success criteria

Phase 1 can be completed.

---

## Milestone 7

Compilation

Reference Resolver

Registry Compiler

Workflow Compiler

Fee Compiler

Notification Compiler

Generated configuration files

Success criteria

Phase 2 executes with deterministic animations.

---

## Milestone 8

Presentation polish

Dark mode

Developer console

X-Ray mode

Playback controls

Accessibility

Performance improvements

Success criteria

Prototype is ready for academic demonstration.

---

# Performance

Avoid unnecessary renders.

Memoise expensive components.

Lazy load drawers where appropriate.

Maintain smooth animations.

Target 60fps during autoplay.

---

# Accessibility

Support keyboard navigation.

Provide focus indicators.

Maintain sufficient colour contrast.

Respect reduced-motion settings.

Use semantic HTML where possible.

---

# Error Handling

Prevent invalid state transitions.

Show friendly messages for mocked validation errors.

Never crash if a scenario is reset midway through playback.

---

# Testing

Ensure the following work correctly.

Reset demo

Switch scenarios

Toggle dark mode

Enable research mode

Enable X-Ray mode

Pause autoplay

Restart autoplay

Move between phases

Open JSON viewer

Open research drawer

Compilation completes successfully

Validation error scenario displays correctly

---

# Deliverables

Produce

A clean React project

Reusable components

Strong TypeScript types

Readable code

Well-structured folders

Consistent styling

Smooth animations

Maintainable architecture

The final prototype should be suitable for inclusion in a Master's dissertation demonstration.

---

# Important Constraints

Do not simplify the architecture.

Do not merge architectural components together.

The architecture is the research contribution.

Every architectural component should remain individually visible and understandable.

---

# Definition of Done

The prototype is complete when a user can:

1. Select a government service scenario.
2. Watch AI-assisted authoring build an Application Definition.
3. Observe the Completeness Engine drive clarification.
4. Review the completed Application Definition.
5. Confirm the application.
6. Watch deterministic compilation generate DIGIT configuration files.
7. Inspect every architectural component through Research Mode.
8. Understand the architecture without reading the dissertation.

If these outcomes are achieved, the implementation is considered complete.