---
name: review
version: 1.0.0
description: >
  Review the change — code health and sound reasoning — before it ships,
  composing code review, security hardening, simplification, and
  reasoning checks into one severity-ranked report.
  USE FOR: the pre-ship review of a branch or local diff, "review this
  change before merge", the phase between verify and ship.
  DO NOT USE FOR: reviewing a single function, file, or one axis (use
  skill:code-reviewer), only simplifying code (use
  skill:code-simplification), only threat-modeling (use
  skill:security-and-hardening), or running checks (use skill:verify).
argument-hint: "Optional: branch name, or 'local' for uncommitted changes (default: the current diff)"
---

# Review

## Overview

The entry point for the review phase: it runs the review skills over the
change in a fixed order and reports findings by severity. The argument is
an optional branch name, or `local` for uncommitted changes; without one,
it reviews the current diff. **Prime directive: approve what improves code
health; block only genuine defects.**

## When to Use

- Every batch of a plan is verified and the change is headed for merge.
- The user asks for a full review of a branch or of local uncommitted changes.
- A change touches security-sensitive surfaces and needs a hardening pass before it ships.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: REVIEW — assess code health across every axis

Invoke `skill:code-reviewer` on the diff. It reviews correctness,
readability, architecture, security, and performance, and blocks only
real defects.

### Step 2: HARDEN — threat-model sensitive changes

When the change touches user input, authentication, sessions, data
storage, secrets, external integrations, or LLM features, invoke
`skill:security-and-hardening` to threat-model and harden it — treating
all external data and model output as hostile.

### Step 3: SIMPLIFY — flag complexity beyond the readability axis

Invoke `skill:code-simplification` on the changed files to flag (and, if
asked, apply) cleanups beyond the code review's readability axis — deep
nesting, long functions, unclear names, duplicated logic.

### Step 4: CHALLENGE — pressure-test the reasoning

For a decision or architecture choice that needs pressure-testing, invoke
`skill:objective-advisor` to challenge the reasoning and rate its own
certainty.

### Step 5: REPORT — rank findings and decide

Report findings by severity. Approve what improves code health; block
only genuine defects. An approved change moves on to `skill:ship`.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The tests pass, so the review is a formality." | Passing tests say nothing about readability, architecture, or threat surface. |
| "It's internal — no need for the hardening pass." | The trigger is what the change touches, not who calls it. Check the list. |
| "I'll block on style preferences to be safe." | Blocking non-defects stalls improvements. Block only genuine defects. |
| "Simplification can wait until after merge." | Nobody reopens working code after merge. Flag it now; apply it if asked. |

## Red Flags

- A change touching input, auth, sessions, storage, secrets, integrations, or LLM features with no hardening pass.
- Findings reported without a severity.
- A change blocked on preference rather than a demonstrable defect.
- Simplification edits applied without the user asking.

## Verification

- [ ] The code review ran on the full diff in scope.
- [ ] The security trigger list was checked, and the hardening pass ran whenever it matched.
- [ ] The simplification pass ran on the changed files.
- [ ] Findings are reported by severity with a clear approve or block decision.
