---
name: verify
version: 1.0.0
description: >
  Verify the batch — validate the batch just built by first-hand execution
  through thomas, fixing and re-running until the verdict is APPROVED;
  only witnessed passing output counts.
  USE FOR: validating a completed plan batch before it is marked done,
  "verify this batch", the gate between one build batch and the next.
  DO NOT USE FOR: pressure-testing a single claim or signing off a pull
  request or release outside a plan (use skill:thomas), implementing (use
  skill:build), or code-health critique (use skill:review).
argument-hint: "Optional: batch number or scope (default: the batch just built)"
---

# Verify

## Overview

The entry point for the verify phase: it puts the batch just built through
first-hand validation, loops on failures, and closes the batch only on an
APPROVED verdict. The argument is an optional batch number or scope;
without one, it verifies the batch just built. **Prime directive: only
witnessed passing output counts — a batch is never marked done on "should
pass".**

## When to Use

- A batch was just built and needs validation before it is marked done.
- The user asks to verify a specific batch or scope of the plan.
- A previous verification returned NOT APPROVED and the fixes are in.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: INVOKE — hand the batch to thomas

Invoke `skill:thomas` with the batch's scope and its `Verify` line. Thomas
runs every check itself — build, test suite, and any runtime or manual
check the batch requires. When the plan's gate text requires something
before Thomas signs off — a Definition-of-Done gate, or tracking rows
marked in `plans/<topic>/plan.md` — do it first, in the order the plan
gives.

### Step 2: READ — take the evidence record as the verdict

Thomas returns an evidence record with a verdict: **APPROVED** or **NOT
APPROVED**. Read every row; the verdict is binary.

### Step 3: FIX — loop on NOT APPROVED

If the verdict is **NOT APPROVED**, fix the failures, reset any rows the
plan had marked ahead of sign-off, and re-run from Step 1. Do not close the
batch on "should pass", and do not argue a failing row into a pass.

### Step 4: CLOSE — close the batch only on APPROVED

The batch is closed only once the verdict is **APPROVED**; record the
closing status in `plans/<topic>/plan.md` as the plan's gate text
specifies. When the plan's last batch closes, the next phase is
`skill:review`.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The builder already ran the tests." | A report is not evidence. Every check is executed again, first-hand. |
| "Only one flaky check failed — close enough." | NOT APPROVED is not a partial pass. Fix it and re-run. |
| "The fix is trivial; no need to re-verify." | Every fix re-enters Step 1. Trivial fixes break things too. |

## Red Flags

- A batch closed without an APPROVED verdict on record.
- Results copied from the build step instead of re-executed.
- A NOT APPROVED verdict followed by closing the batch anyway.
- Fixes applied without a full re-run.

## Verification

- [ ] Thomas ran against this batch's scope and its `Verify` line.
- [ ] An evidence record with a binary verdict exists for the final run.
- [ ] Every NOT APPROVED run was followed by fixes and a full re-run.
- [ ] The batch was closed only after APPROVED, with its plan rows updated in the order the plan's gate text specifies.
