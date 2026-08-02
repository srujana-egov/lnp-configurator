# 07_Component_Behaviour.md

# React Component Architecture

---

# Purpose

This document defines the React component hierarchy.

Every component should have a single responsibility.

Components should communicate through props and global application state.

The prototype should follow modern React best practices.

No component should exceed approximately 250–300 lines of code.

---

# Folder Structure

src/

components/

    layout/

    conversation/

    architecture/

    definition/

    preview/

    compiler/

    timeline/

    drawer/

    ui/

pages/

hooks/

context/

data/

types/

animations/

assets/

---

# Root Component

<App>

Responsibilities

Initialize application

Provide Theme

Provide Global Context

Handle routing

Render current page

Children

LandingPage

WorkspacePage

---

# Workspace Page

Contains

Header

Workspace

Footer Timeline

Responsibilities

Manage overall layout

Handle mode switching

Track current phase

---

# Header Component

Header

Contains

Logo

Application Title

Phase Badge

Research Mode Toggle

Dark Mode Toggle

Play Controls

Progress Indicator

Props

currentPhase

progress

researchMode

Functions

Toggle Research Mode

Start Demo

Pause Demo

Reset Demo

---

# Workspace Layout

Workspace

Contains

Conversation Panel

Architecture Canvas

Application Definition Panel

Timeline

Compiler Panel (Phase 2)

---

# Conversation Panel

Purpose

Display conversation.

Components

ConversationHeader

ConversationMessages

SuggestedReplies

MessageInput

ConversationControls

---

# Conversation Header

Displays

Current AI Status

Thinking

Waiting

Question

Completed

---

# Conversation Messages

Props

messages

Displays

Administrator messages

AI messages

System messages

Supports

Typing animation

Auto scrolling

---

# Suggested Replies

Purpose

Display clickable chips.

Example

Child Name

DOB

Gender

Hospital Name

Props

suggestions

onSelect()

---

# Message Input

Components

Text Input

Send Button

Voice button placeholder

Supports

Enter

Send

---

# Architecture Canvas

Purpose

Visualise architecture.

Children

ArchitectureNode

ArchitectureEdge

FlowAnimation

ResearchDrawer

---

# Architecture Node

Props

id

title

icon

status

description

onClick

State

inactive

active

completed

selected

Animation

Glow

Pulse

Lift

---

# Architecture Edge

Props

source

target

active

Animation

Moving particles

Colour

Grey

Blue

Green

---

# Flow Animation

Purpose

Animate information moving.

Receives

Current active connection

Displays

Blue particles

Travelling arrows

---

# Application Definition Panel

Contains

DefinitionProgress

MetadataCard

RegistryCard

WorkflowCard

RolesCard

FeeCard

NotificationCard

SettingsCard

---

# Definition Progress

Displays

Completion %

Checklist

Updates automatically.

---

# Metadata Card

Props

metadata

Displays

Application Name

Department

Applicant

Description

Status

---

# Registry Card

Contains

Section Cards

Each Section

Contains Field Cards

Supports

Expand

Collapse

---

# Workflow Card

Displays

State machine

Submission

↓

Verification

↓

Approval

Animation

States appear sequentially.

---

# Roles Card

Displays

Role chips

Citizen

Registrar

Supervisor

---

# Fee Card

Displays

Fee rules

Condition

↓

Amount

---

# Notification Card

Displays

Event

↓

Recipient

↓

Channel

---

# Preview Panel

Tabs

Form

Workflow

Fees

Notifications

Children

FormPreview

WorkflowPreview

FeePreview

NotificationPreview

Updates automatically.

---

# Form Preview

Generates

Mock application form.

Consumes

Registry only.

Never reads conversation.

---

# Workflow Preview

Consumes

Workflow.

Displays

Vertical process.

---

# Fee Preview

Consumes

Fees.

Displays

Rule cards.

---

# Notification Preview

Consumes

Notifications.

Displays

Notification flow.

---

# Completeness Engine Card

Displays

Checklist

Metadata

Registry

Workflow

Roles

Fees

Notifications

Progress Bar

Missing Information

Suggested Question

Updates after every operation.

---

# Review Component

Displays

Application Summary

Buttons

Edit

Confirm

Export JSON

---

# Compilation Panel

Visible only during Phase 2.

Contains

ReferenceResolver

RegistryCompiler

WorkflowCompiler

FeeCompiler

NotificationCompiler

GeneratedConfigurations

---

# Reference Resolver

Displays

Validation checklist.

Props

ApplicationDefinition

Output

ValidationResult

---

# Compiler Component

Reusable component.

Props

title

input

output

status

animation

Used by

Registry

Workflow

Fee

Notification

---

# Generated Configuration Panel

Displays

registry.json

workflow.json

calculation.json

notification.json

Click

Open JSON Drawer

---

# Timeline Component

Displays

Conversation

Understanding

Operations

Definition

Validation

Compilation

Deployment

Updates automatically.

---

# Research Drawer

Purpose

Explain selected component.

Sections

Purpose

Responsibilities

Inputs

Outputs

Example

Architecture Notes

Research Contribution

Future Work

Props

selectedComponent

Visible

Only in Research Mode

---

# JSON Viewer

Purpose

Display Application Definition.

Modes

Tree

Raw JSON

Syntax Highlighted

Read Only

---

# Demo Controller

Responsibilities

Play

Pause

Restart

Next Step

Previous Step

Change Speed

Maintains

Demo State

---

# Toast Manager

Displays

Operations Generated

Application Updated

Validation Passed

Compilation Complete

Auto dismiss

---

# Global Application State

ApplicationState

Contains

conversation

currentStep

currentPhase

selectedComponent

applicationDefinition

preview

validation

compilerStatus

demoStatus

researchMode

darkMode

timeline

Everything derives from this state.

---

# State Flow

Conversation

↓

Understanding

↓

Operations

↓

Application Definition

↓

Preview

↓

Completeness

↓

Review

↓

Compilation

No component should mutate state directly.

Updates occur through actions.

---

# Component Communication

Conversation

↓

dispatch()

↓

Global State

↓

Architecture updates

↓

Application Definition updates

↓

Preview updates

↓

Timeline updates

Everything remains synchronized.

---

# Design Principles

Each component has one responsibility.

Components are reusable.

Components communicate only through props and state.

Application Definition is the shared model.

Conversation never updates Preview directly.

Preview never updates Application Definition.

Compilers never update Application Definition.

Only the Operation Executor modifies the Application Definition.

This rule must never be violated.

---

# Future Extension

The architecture should allow replacing mocked AI with a real LLM without changing the UI.

Similarly, mocked compilers should be replaceable with actual DIGIT compilers while keeping the interface unchanged.

This separation should be reflected in the component structure.