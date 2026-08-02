# 09_Sample_Scenarios.md

# Prototype Demo Scenarios

---

# Purpose

This document defines the scripted scenarios used throughout the prototype.

These scenarios provide realistic examples for demonstrating the architecture without requiring a live AI model.

Each scenario should follow the exact same architecture pipeline.

Only the application data changes.

---

# Scenario Structure

Every scenario contains

• Initial Prompt

• Extracted Knowledge

• Generated Operations

• Application Definition

• Completeness Questions

• Preview

• Final Application Definition

• Compilation Output

---

=============================================================================

# SCENARIO 1

Birth Certificate Application

=============================================================================

## Initial Prompt

Create a Birth Certificate application where citizens apply online.

A registrar verifies every application before approval.

Birth registrations within 30 days are free.

Late registrations cost £100.

Notify citizens by SMS after approval.

---

## Extracted Knowledge

Application

Birth Certificate

Department

Birth Registration

Applicant

Citizen

Workflow

Submission

Verification

Approval

Roles

Citizen

Registrar

Fee

Within 30 Days

Free

After 30 Days

£100

Notification

Approval

SMS

Citizen

---

## Generated Operations

CREATE_APPLICATION

CREATE_ROLE

Citizen

CREATE_ROLE

Registrar

CREATE_WORKFLOW

Submission

Verification

Approval

CREATE_FEE_RULE

Within 30 Days

£0

CREATE_FEE_RULE

After 30 Days

£100

CREATE_NOTIFICATION

Approval

SMS

Citizen

---

## Clarification Questions

Question

What information should citizens provide?

Suggested Replies

Child Name

Date of Birth

Gender

Hospital Name

Parents Details

---

## Registry

Citizen Details

Child Name

Date of Birth

Gender

Hospital Details

Hospital Name

Parents

Mother Name

Father Name

---

## Preview

Form

Workflow

Fees

Notifications

---

## Generated Files

registry.json

workflow.json

calculation.json

notification.json

---

=============================================================================

# SCENARIO 2

Trade Licence

=============================================================================

## Initial Prompt

Create a Trade Licence application.

Business owners apply online.

Health inspectors inspect the premises.

Municipal officers approve licences.

Applications require annual renewal.

---

## Extracted Knowledge

Application

Trade Licence

Applicant

Business Owner

Department

Municipal Administration

Roles

Business Owner

Health Inspector

Municipal Officer

Workflow

Submission

Inspection

Approval

Fee

Annual Licence Fee

Notification

Approval Email

---

## Registry

Business Details

Business Name

Owner Name

Business Address

Business Type

Contact Number

GST Number

---

## Generated Operations

CREATE_APPLICATION

CREATE_ROLE

Business Owner

CREATE_ROLE

Health Inspector

CREATE_ROLE

Municipal Officer

CREATE_WORKFLOW

Submission

Inspection

Approval

ADD_FIELD

Business Name

ADD_FIELD

GST Number

CREATE_NOTIFICATION

Approval Email

---

## Clarification Questions

Should inspections always be required?

Should licence renewal reuse existing information?

---

## Generated Files

registry.json

workflow.json

notification.json

---

=============================================================================

# SCENARIO 3

Water Connection

=============================================================================

## Initial Prompt

Citizens should be able to request a new household water connection.

Applications require address verification before approval.

---

## Extracted Knowledge

Application

Water Connection

Applicant

Citizen

Department

Water Board

Workflow

Submission

Address Verification

Approval

Roles

Citizen

Verification Officer

---

## Registry

Applicant Details

Applicant Name

Phone Number

Email

Property Address

Property Type

Ownership Proof

---

## Fees

Connection Charge

£250

---

## Notification

SMS

Approval

Citizen

---

## Generated Operations

CREATE_APPLICATION

CREATE_ROLE

Citizen

CREATE_ROLE

Verification Officer

CREATE_WORKFLOW

Submission

Verification

Approval

ADD_FIELD

Property Address

ADD_FIELD

Ownership Proof

CREATE_FEE_RULE

Connection Charge

---

## Clarification Questions

Should commercial properties use the same workflow?

Is proof of ownership mandatory?

---

=============================================================================

# SCENARIO 4

Grievance Redressal

=============================================================================

## Initial Prompt

Citizens should submit complaints online.

Complaints are assigned to departments.

Departments resolve complaints.

Citizens receive updates.

---

## Extracted Knowledge

Application

Grievance

Applicant

Citizen

Roles

Citizen

Case Officer

Department Manager

Workflow

Submission

Assignment

Investigation

Resolution

Closure

---

## Registry

Complaint Details

Complaint Type

Description

Location

Photo Upload

---

## Notification

Complaint Submitted

SMS

Investigation Started

Email

Complaint Closed

SMS

---

## Clarification Questions

Should anonymous complaints be allowed?

Should images be mandatory?

---

=============================================================================

# Scenario Selection Screen

The landing page should contain

Choose Demo Scenario

○ Birth Certificate

○ Trade Licence

○ Water Connection

○ Grievance

Button

Start Demo

The selected scenario becomes the initial Application Definition seed.

---

# Demo Playback

Every scenario follows identical execution.

Conversation

↓

Understanding

↓

Operations

↓

Application Definition

↓

Completeness

↓

Preview

↓

Review

↓

Compilation

Only the data differs.

---

# Research Note

The ability to execute multiple domains using the same architecture demonstrates that the proposed architecture is domain-independent.

The architecture is reusable across government services.

Only the Application Definition changes.

The execution pipeline remains identical.

---

# Mock AI Responses

Each scenario should include predefined AI responses.

Example

Question

What information should citizens provide?

AI Response

Based on your application, the Registry section is incomplete.

Please specify the information applicants must submit.

Suggested fields include:

• Name

• Address

• Date of Birth

You may type your own fields or select from the suggestions below.

---

# Demo Reset

Resetting the prototype should

Clear conversation

Reset Application Definition

Reset architecture status

Reset timeline

Reload the selected scenario

No page refresh required.