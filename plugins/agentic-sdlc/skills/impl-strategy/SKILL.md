---
name: impl-strategy
version: 1.2.0
description: >
  Create structured implementation plans with a fixed three-section
  output (What We Are Doing; How We Are Doing It / What Is Out of Scope;
  Tracking List), written as a plan folder that a later phase executes.
  It is the architect: it chooses the build strategy and writes it into
  every batch as ordered build steps.
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

Write the plan folder `plans/<topic>/` — `plan.md` plus `lessons.md` — that
`skill:build` and `skill:verify` execute batch by batch. **Prime directive:
the plan is specific enough to execute without re-discovering the approach
or the build strategy; this skill never implements.**

| Need | Read |
| --- | --- |
| Plan structure, batch shape, execution rules, gate definitions | [references/reference.md](references/reference.md) |
| Build strategies and their gates | [references/build-strategies.md](references/build-strategies.md) |
| Fill-in `plan.md` | [references/plan.template.md](references/plan.template.md) |

## When to Use

- The user wants a concrete implementation plan before coding.
- The task spans multiple files, components, modules, or execution steps.
- The user wants a tracking document that can be updated during implementation.
- The plan must define execution batches and validation without performing them yet.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: DISCOVER — gather the context to plan defensibly

Define the target outcome, scope, and constraints, and state the
requirements — the necessities the work must satisfy — as `R1…Rn`. Inspect
the current
implementation and identify affected files, dependencies, and risks.
Search the codebase for the real validation path, then ask the user, in
one message: which command(s) run after each batch, and which run
globally. Ask whether `skill:thomas` should gate each batch, and capture
the Definition of Done (a named DoD skill or inline criteria). Confirm the
build strategy — default `red-implement-green`. Group the work into
batches of at most 4. Record all of this in `### Execution Config`.

### Step 2: DESIGN — turn discovery into the 3-section plan

Define the in-scope workstreams, describe the implementation method
concretely (real paths, modules, commands), and separate non-goals and
deferred work. Copy the execution rules into the plan and define each gate
it uses once under `### Gates` — Necessity from the strategy, DoD when one
was captured, Thomas when enabled. Build the tracking list as batches,
each with `Build steps` expanded from the strategy (under
`red-implement-green`, every Red test cites its requirement and why it
must fail; any per-batch override states its reason), a `Verify` line, and
a `Gates` line naming its gates in run order. Mark `Parallel with` only
for batches that are truly independent. The last batch is the global gate.

### Step 3: WRITE — create the plan folder

Create `plans/<topic-kebab-case>/plan.md` from the template, replacing
every placeholder. Then — **mandatory, do not skip** — invoke
`skill:lessons-learned` in `init <topic>` mode to create `lessons.md` in
the same folder. This skill never writes `lessons.md` itself; if
`skill:lessons-learned` is unavailable, surface the missing dependency
and stop. The plan folder is incomplete until both files exist.

### Step 4: HAND OFF — verify the plan, then stop

Confirm both `plan.md` and `lessons.md` exist. Re-read Section 1 of
`plan.md` and confirm it contains the standing **Continuous lessons
capture** item; add it if absent. Confirm every batch has `Build steps`,
`Verify`, and `Gates` lines, and every gate named is defined under
`### Gates`. Then stop: each batch is built by `skill:build` and closed
by `skill:verify` — or all of them by `skill:go-wild` — never by this
skill.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll just start coding, the plan is obvious." | This skill produces the plan; skipping it loses the batches, validation, and out-of-scope boundary a later phase depends on. |
| "A single `plan.md` file is enough." | The output is a folder — `lessons.md` is the execution phase's memory and must exist before finishing. |
| "I'll paste the full gate text into every batch to be safe." | Repeated text drifts. Define each gate once under `### Gates`; batches only name it. |
| "The builder knows how to build; I'll leave the steps out." | The builder executes, it does not choose. A batch without `Build steps` hands the strategy decision to the wrong phase. |
| "Add tests until coverage hits 100%." | Coverage is the consequence of every line serving a requirement, not the target. A test that proves no requirement is slop. |
| "I'll guess the verify commands." | Invented commands fail. Search the codebase and confirm the real ones, or record the gap explicitly. |
| "I'll log lessons at the end." | Lessons are captured immediately after each correction or mistake — batching them to the end loses them. |

## Red Flags

- A plan written as a single loose file with no `lessons.md` beside it.
- `skill:lessons-learned` not invoked when a new plan folder is created.
- `Verify` lines with guessed commands instead of ones found in the repo.
- Section 1 missing the standing continuous-lessons-capture item.
- A batch with no `Build steps` line, or Red steps that name no test, no requirement, or no failure reason.
- A batch naming a gate that `### Gates` does not define, or gate text pasted into a batch.
- `Parallel with` on batches that share files or depend on each other's output.
- A test planned for coverage or an implementation detail rather than to prove a requirement.
- The skill starting to implement code instead of producing the plan.

## Verification

- [ ] `plans/<topic>/` contains both `plan.md` and `lessons.md` (the latter via `skill:lessons-learned`).
- [ ] `plan.md` uses the exact 3-section structure and batch shapes from the reference.
- [ ] `### Execution Config` records verify commands, the build strategy, Thomas state, and any DoD; `### Execution rules` and `### Gates` follow it.
- [ ] Section 1 lists the requirements as `R1…Rn`.
- [ ] Every batch has a `Build steps` line expanded from the chosen strategy, with any override's reason stated; under `red-implement-green` every Red test cites a requirement and the batch names the Necessity gate.
- [ ] Section 1 includes the standing continuous-lessons-capture item.
- [ ] Every batch has a `Verify` line built from real repo commands and a `Gates` line in Necessity → DoD → Thomas order, each gate defined once.
- [ ] The last batch runs the global verify command and names `Thomas (final)` when Thomas is enabled.
