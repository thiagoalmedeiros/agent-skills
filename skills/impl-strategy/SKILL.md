---
name: impl-strategy
version: 1.0.0
description: >
  Create structured implementation plans with a fixed three-section
  output (What We Are Doing; How We Are Doing It / What Is Out of Scope;
  Tracking List), written as a plan folder that a later phase executes.
  USE FOR: planning refactors, migrations, feature delivery, technical
  execution plans, and persistent plan documents that guide a later
  implementation phase.
  DO NOT USE FOR: direct execution (this skill plans, it does not
  implement), ad-hoc code explanations, one-off tiny edits that need no
  planning, or broad product brainstorming with no concrete target.
argument-hint: "Feature, route, or task to analyze and turn into an implementation plan"
---

# Implementation Plan

## Overview

Produce a reusable implementation plan that captures everything a later
execution phase needs — as a **folder** (`plans/<topic>/`) holding
`plan.md` and a `lessons.md`. The full output structure, batch shapes,
and execution rules live in [references/reference.md](references/reference.md);
the fill-in template is [references/plan.template.md](references/plan.template.md).
**Prime directive: the output is a planning artifact specific enough that
another agent — or a later phase — can execute the work without
re-discovering the approach; this skill produces the plan, it never
performs the implementation.**

## When to Use

- The user wants a concrete implementation plan before coding.
- The task spans multiple files, components, modules, or execution steps.
- The user wants a tracking document that can be updated during implementation.
- The plan must define execution batches and validation without performing them yet.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: DISCOVER — gather the context to plan defensibly

Define the target outcome, scope, and constraints. Inspect the current
implementation and identify affected files, dependencies, and risks.
Search the codebase for the real validation path, then ask the user, in
one message: which command(s) run after each batch, and which run
globally. Ask whether `skill:thomas` should gate each batch, and capture
the Definition of Done (a named DoD skill or inline criteria). Group the
work into batches of at most 4. Record all of this in `## Execution
Config` per [references/reference.md](references/reference.md).

### Step 2: DESIGN — turn discovery into the 3-section plan

Define the in-scope workstreams, describe the implementation method
concretely (real paths, modules, commands), separate non-goals and
deferred work, and build the tracking list as batches with a `Verify`
line each. If a DoD was captured, embed a `DoD` row and a mandatory
`**DoD Gate:**` line in every batch. Use the exact section structure and
batch table shapes from [references/reference.md](references/reference.md).

### Step 3: WRITE — create the plan folder

Create `plans/<topic-kebab-case>/plan.md` from
[references/plan.template.md](references/plan.template.md), replacing
every placeholder. Then — **mandatory, do not skip** — invoke
`skill:lessons-learned` in `init <topic>` mode to create `lessons.md` in
the same folder. This skill never writes `lessons.md` itself; if
`skill:lessons-learned` is unavailable, surface the missing dependency
and stop. The plan folder is incomplete until both files exist.

### Step 4: HAND OFF — verify, then begin execution

Confirm both `plan.md` and `lessons.md` exist. Re-read Section 1 of
`plan.md` and confirm it contains the standing **Continuous lessons
capture** item; add it if absent. Then read `## Execution Config` and
begin executing batches in order, following every embedded execution rule
(lessons capture, status re-read, DoD Gate, Thomas Gate) from
[references/reference.md](references/reference.md). No further user
confirmation is required to start.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll just start coding, the plan is obvious." | This skill produces the plan; skipping it loses the batches, validation, and out-of-scope boundary a later phase depends on. |
| "A single `plan.md` file is enough." | The output is a folder — `lessons.md` is the execution phase's memory and must exist before finishing. |
| "I'll guess the verify commands." | Invented commands fail. Search the codebase and confirm the real ones, or record the gap explicitly. |
| "I'll log lessons at the end." | Lessons are captured immediately after each correction or mistake — batching them to the end loses them. |

## Red Flags

- A plan written as a single loose file with no `lessons.md` beside it.
- `skill:lessons-learned` not invoked when a new plan folder is created.
- `Verify` lines with guessed commands instead of ones found in the repo.
- Section 1 missing the standing continuous-lessons-capture item.
- The skill starting to implement code instead of producing the plan.

## Verification

- [ ] `plans/<topic>/` contains both `plan.md` and `lessons.md` (the latter via `skill:lessons-learned`).
- [ ] `plan.md` uses the exact 3-section structure and batch shapes from `references/reference.md`.
- [ ] `## Execution Config` records verify commands, `thomas:` state, and any DoD.
- [ ] Section 1 includes the standing continuous-lessons-capture item.
- [ ] Every batch has a `Verify` line built from real repo commands (plus DoD/Thomas gates where configured).
