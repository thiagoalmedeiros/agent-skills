---
name: verify
version: 1.1.0
description: >
  Verify what was just built — a plan batch or any spec build handed back —
  by first-hand execution: run its checks, then each gate it names in
  order, fixing and re-running until every one passes; only witnessed
  passing output counts.
  USE FOR: validating a built plan batch before it is marked done, "verify
  this batch", "verify this", the gate between one build and the next.
  DO NOT USE FOR: pressure-testing a single claim or signing off a pull
  request or release (use skill:thomas), implementing (use skill:build),
  or code-health critique (use skill:review).
argument-hint: "Optional: batch number or scope (default: whatever was just built)"
---

# Verify

## Overview

The entry point for the verify phase: it takes the work just built, runs
every check that decides whether it is done, loops on failures, and closes
it only when all of them pass. For a plan batch the checks are the batch's
`Verify` line and the gates its `Gates` line names, defined in the plan's
`### Gates`. For any other spec they are the checks the spec states, run
through `skill:thomas`. **Prime directive: only witnessed passing output
counts — nothing is closed on "should pass".**

## When to Use

- A batch or spec was just built and needs validation before it is called done.
- The user asks to verify a specific batch or scope of the plan.
- A previous verification failed and the fixes are in.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — find what decides done

For a plan batch, read the batch, the plan's `### Execution rules`, and its
`### Gates`. For any other spec, take the checks it states; if it states
none, ask which checks decide done.

### Step 2: RUN — execute the checks, then each gate in order

Run the batch's `Verify` line first-hand, then each gate in its `Gates`
line in the order written, marking rows as the plan's execution rules
say. For a spec outside a plan, invoke `skill:thomas` with its checks. A
gate passes only on its own pass condition — for Thomas, an **APPROVED**
verdict.

### Step 3: FIX — loop on any failure

On any failure, reset rows as the plan's execution rules say, fix, and
re-run from Step 2. Do not close on "should pass", and do not argue a
failing check into a pass.

### Step 4: CLOSE — close only when every gate passed

Close the batch only once every gate passed and its rows are ✅ in
`plan.md`. When the closed batch is the plan's final one, the plan is
complete and the next phase is `skill:review`.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The builder already ran the tests." | A report is not evidence. Every check is executed again, first-hand. |
| "Only one flaky check failed — close enough." | A failing check is not a partial pass. Fix it and re-run. |
| "The fix is trivial; no need to re-verify." | Every fix re-enters Step 2. Trivial fixes break things too. |
| "The gates can run in any order." | The plan fixes the order. Thomas runs last because it confirms the others passed. |

## Red Flags

- A batch closed with a gate that did not pass, or a row not ✅.
- Results copied from the build step instead of re-executed.
- Gates run out of the order the batch's `Gates` line gives.
- Fixes applied without a full re-run.

## Verification

- [ ] The batch's `Verify` line, or the spec's checks, ran first-hand.
- [ ] Every gate the batch names ran, in order, and met its pass condition.
- [ ] Every failure was followed by fixes and a full re-run.
- [ ] The batch was closed only after every gate passed, with its rows ✅ in `plan.md`.
