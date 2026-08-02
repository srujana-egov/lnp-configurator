# 08_Animation_Specification.md

# Animation & Interaction Specification

---

# Purpose

Animations in this prototype are not decorative.

They communicate:

• Data movement

• State transitions

• Component responsibility

• Architecture execution

Every animation should reinforce the research architecture.

---

# Design Principles

Animations should be

Fast

Professional

Minimal

Purposeful

Never distracting.

Avoid

Bounce animations

Elastic effects

Large rotations

Exaggerated scaling

Cartoon effects

Think Microsoft Azure or Figma rather than marketing websites.

---

# Animation Library

Use

Framer Motion

Every animation should be interruptible.

Animations should respect React state.

---

# Global Timing

Very Fast

150ms

Small transitions

250ms

Normal transitions

350ms

Architecture movement

600ms

Phase transitions

800ms

Autoplay delay

1000ms

---

# Page Transition

Landing Page

↓

Workspace

Animation

Fade

Scale

0.98 → 1

Duration

600ms

---

# Panel Animation

Conversation

Architecture

Definition

Timeline

Animate independently.

Effect

Fade Up

Opacity

0 → 1

Y

16px → 0

Duration

350ms

Stagger

75ms

---

# Card Appearance

Every card

Definition

Preview

Compiler

Appears using

Opacity

0 → 1

Scale

0.96 → 1

Duration

250ms

---

# Hover Behaviour

Cards

Lift

4px

Shadow increases.

Border becomes blue.

Cursor pointer.

Duration

150ms

---

# Button Behaviour

Hover

Slight background change.

Pressed

Scale

0.98

Release

Normal.

No bounce.

---

# Architecture Activation

When a component begins execution

Background

Light blue

Border

Blue

Shadow

Soft glow

Icon

Blue

Pulse once.

Duration

400ms

---

# Completed Component

Background

Very light green.

Checkmark appears.

Glow disappears.

Component becomes inactive.

---

# Selected Component

Research Mode

Blue border

Persistent highlight

No pulse.

---

# Edge Animation

Architecture connections

Grey when inactive.

Blue while active.

Green after completion.

---

# Data Flow

Blue particles move along the edge.

Particle spacing

24px

Speed

Constant

Duration

600ms

Only active path animates.

---

# Conversation Messages

Administrator

Slides from right.

AI

Slides from left.

System

Fades.

Duration

250ms

---

# AI Typing

Instead of instantly displaying text

Display

Thinking...

↓

Typing indicator

↓

Words appear progressively.

Typing speed

35ms per character.

Can be skipped during autoplay.

---

# Suggested Replies

Fade upward.

Delay

40ms between chips.

Hover

Blue border.

Selected

Filled blue.

---

# Understanding Animation

Natural language sentence appears.

Words separate into floating chips.

Example

Create

Birth Certificate

Registrar

Citizen

Approval

Each chip flies into its destination.

Destination examples

Birth Certificate

↓

Metadata

Registrar

↓

Roles

Approval

↓

Workflow

---

# Operation Generation

Operation cards appear one by one.

CREATE_APPLICATION

↓

CREATE_ROLE

↓

CREATE_WORKFLOW

↓

ADD_FIELD

Each slides downward.

Delay

100ms

---

# Operation Execution

Operation card moves

↓

Operation Executor

↓

Application Definition

After entering

Card disappears.

Updated section glows.

---

# Application Definition Update

Updated section

Brief blue outline.

Field fades in.

New value highlighted.

Duration

300ms

---

# Progress Bar

Smooth width transition.

Duration

400ms

Colour

Orange while incomplete.

Green at 100%.

---

# Completeness Checklist

Each completed item

Receives

Green checkmark.

Short fade.

Missing items

Orange warning.

No shaking.

---

# Workflow Preview

States appear sequentially.

Submission

↓

Verification

↓

Approval

Connecting arrows draw themselves.

---

# Registry Preview

Sections appear.

Fields fade one by one.

Conditional fields display with dashed outline.

---

# Notification Preview

Approval

↓

Citizen

↓

SMS

Arrows animate downward.

---

# Compiler Animation

Input card

Moves into compiler.

Compiler glows.

Progress spinner.

Output file appears.

Duration

800ms

---

# Generated Files

registry.json

workflow.json

calculation.json

notification.json

Appear sequentially.

Small green check.

---

# Timeline Animation

Current stage

Blue glow.

Completed

Green.

Future

Grey.

Marker slides smoothly.

---

# Research Drawer

Slides from right.

Width

420px

Duration

350ms

Overlay

Light dim.

---

# JSON Viewer

Expand

Fade.

Collapse

Fade.

No sudden appearance.

---

# Toast Notifications

Appear

Top right.

Slide down.

Fade in.

Dismiss

After

3 seconds.

Slide upward.

---

# Dark Mode Transition

Background

Cross-fade.

Cards

Cross-fade.

Duration

300ms

No flash.

---

# Demo Playback

Play

Automatically advances.

Pause

Stops current timer.

Restart

Resets animation state.

Next

Immediately triggers next step.

Previous

Returns previous snapshot.

---

# Speed Controls

0.5×

Educational

1×

Default

2×

Presentation

5×

Quick overview

Animations scale proportionally.

---

# X-Ray Mode

When enabled

Architecture becomes more technical.

Display

Moving data packets

Live operation names

Current input

Current output

Execution time

Components show

Idle

Running

Completed

---

# Developer Console

Console logs appear live.

Example

09:42:01 Conversation received

09:42:02 Understanding started

09:42:03 Operations generated

09:42:04 Application Definition updated

09:42:05 Validation complete

Logs animate upward.

Newest entry highlighted briefly.

---

# Error Animation

Validation failure

Component border

Red.

Error icon appears.

Related dependency highlighted.

No shaking animation.

Resolution

Green transition.

---

# Accessibility

Respect reduced-motion preferences.

If reduced motion is enabled

Disable

Particles

Typing

Complex transitions

Keep

Fade

Colour changes

State indicators

---

# Animation Philosophy

Every animation must answer one of these questions:

What is executing?

What data is moving?

What changed?

Why did it change?

If an animation does not improve understanding of the architecture, it should not exist.