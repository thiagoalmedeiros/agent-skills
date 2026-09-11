---
name: define
version: 1.0.0
description: >
  Define the work — turn a task description or Jira ticket into a
  structured implementation plan at plans/<topic>/plan.md before any code
  is written, by clarifying intent, stress-testing the approach, then
  planning.
  USE FOR: starting a piece of work end to end, "define this", "plan this
  ticket", turning a Jira URL or ticket key into a plan.
  DO NOT USE FOR: only fetching a ticket (use skill:jira-fetch), only
  stress-testing a decision already formed (use skill:grill-me), writing a
  plan when intent and approach are already settled (use
  skill:impl-strategy), or implementing (use skill:build).
argument-hint: "A task description, or a Jira URL / ticket key"
---

# Define

## Overview

The entry point for the definition phase: it turns a request into an
approved plan by composing three skills in a fixed order — pull context,
harden the approach, write the plan — and then stops. The argument is a
task description, or a Jira URL or ticket key.
**Prime directive: no code is written in this phase — its only outputs are
planning artifacts: the plan, its `lessons.md`, and any fetched ticket
context.**

## When to Use

- A new piece of work needs a plan before anyone writes code.
- The user hands over a Jira URL or ticket key and wants it turned into a plan.
- The user says "define this" or "plan this", or starts the definition → build → verify → review → ship path.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: FETCH — pull the ticket when there is one

If the argument is a Jira URL or ticket key, invoke `skill:jira-fetch` to
pull the description, comments, and subtasks as context. For a plain task
description, go straight to Step 2.

### Step 2: CLARIFY — pin the task to one confirmed sentence

Ask one question at a time until the task fits a single sentence the user
confirms. This is cooperative requirements-gathering, not critique.

### Step 3: HARDEN — stress-test the approach

Once an approach is on the table, invoke `skill:grill-me` to surface
load-bearing assumptions, failure modes, and cheaper alternatives, one
hard question at a time, until the approach holds or a fatal flaw
surfaces. Skip this only for trivial, mechanical tasks — grilling hardens
a formed decision; it is not requirements-gathering.

### Step 4: PLAN — write the plan folder

Invoke `skill:impl-strategy` on the hardened approach to produce
`plans/<topic>/plan.md` (What We Are Doing / How + Out of Scope / Tracking
List) and initialize its `lessons.md`.

### Step 5: STOP — hand off without implementing

Stop at the plan, even though the planning skill's own hand-off step says
to begin execution. Implementation is the next phase, `skill:build`.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The request is clear enough — skip clarifying." | An unconfirmed sentence is a guess, and the plan inherits every wrong assumption in it. |
| "Grilling is overkill; the approach is obvious." | Obvious approaches are the ones nobody attacked. Skip only for trivial, mechanical tasks. |
| "The planning skill says to start executing, so start." | This phase ends at the plan. Execution belongs to the build phase, one batch at a time. |
| "I'll write the first batch while the context is fresh." | Code written before the plan exists skips the batches and validation the plan defines. |

## Red Flags

- More than one clarifying question in a single message.
- Grilling started before the user confirmed the one-sentence task.
- A Jira URL or key in the argument, but no ticket fetched.
- A project file other than a planning artifact edited during this phase.
- A plan folder with no `lessons.md`.

## Verification

- [ ] The task was restated as one sentence and the user confirmed it.
- [ ] The approach was grilled, or the task was genuinely trivial and the skip was stated.
- [ ] The plan and its `lessons.md` both exist in the plan folder.
- [ ] No project file changed other than planning artifacts.
