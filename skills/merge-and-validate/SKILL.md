---
name: merge-and-validate
version: 1.0.0
description: >
  Safely merges a branch into the current branch and validates the result
  against the project's Definition of Done, rolling back to the recorded
  pre-merge state on any failure.
  USE FOR: merging feature branches, release branches, or hotfixes while
  ensuring validation gates pass before finishing.
  DO NOT USE FOR: rebasing, cherry-picking, or resolving complex
  multi-branch merge strategies.
argument-hint: "Branch name to merge into the current branch"
---

# Merge and Validate

## Overview

Merge a target branch into the current branch, validate the result
against the project's Definition of Done, and never leave the branch in a
broken state. The exact command sequences, rollback procedure, and Merge
Report format live in [references/reference.md](references/reference.md).
**Prime directive: a merge is not done until validation passes — start
from a clean working tree, record the pre-merge SHA, and on any validation
failure roll back to it rather than leaving a half-merged branch.**

## When to Use

- Merging a feature, release, or hotfix branch into the current branch.
- Any merge where validation gates must pass before it is considered complete.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: PRE-FLIGHT — clean tree, recorded SHA

Run the pre-flight command set from
[references/reference.md](references/reference.md). **Gate:** if the
working tree is dirty (uncommitted or untracked files), stop and ask the
user to commit or stash. Record the current HEAD as `PRE_MERGE_SHA` for
rollback.

### Step 2: FETCH & PREVIEW — confirm the target and show the diff

Fetch the target branch and confirm it exists on the remote (list remote
branches and ask if not). Preview the merge — commits, files changed,
insertions/deletions. If the diff is empty, report it and stop; no merge
is needed.

### Step 3: MERGE — execute, halt on conflict

Run the `--no-ff --no-edit` merge. If conflicts occur, list every
conflicting file, show the markers, and **stop** for manual resolution;
resume only after the user confirms and `git diff --check` is clean. If
the merge is clean, proceed.

### Step 4: VALIDATE — run the Definition of Done

Invoke `skill:definition-of-done`. If found, follow its steps exactly; if
not, ask the user which commands validate the merge and run them
sequentially. Any failing step triggers the Rollback Procedure.

### Step 5: REPORT or ROLLBACK — finish cleanly

On success, emit the Merge Report. On any validation failure, run the
Rollback Procedure (abort/reset to `PRE_MERGE_SHA`, confirm a clean tree,
report the failing step) and include actionable Next Steps.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll merge over these local changes." | A dirty tree corrupts the merge and rollback. Stop until it's clean. |
| "It merged clean, so it's done." | A clean merge can still fail the DoD. Validation is the gate, not the merge. |
| "Validation failed but it's probably fine." | Roll back. A half-merged, unvalidated branch is a broken state. |
| "I'll resolve conflicts myself to save time." | Conflict resolution is the user's call — stop and hand it to them. |

## Red Flags

- Merging with uncommitted or untracked changes present.
- Skipping the Definition of Done, or treating a clean merge as validation.
- Leaving conflicts or a failed validation in place instead of rolling back.
- No `PRE_MERGE_SHA` recorded before the merge.

## Verification

- [ ] Working tree was clean and `PRE_MERGE_SHA` recorded before merging.
- [ ] Target branch confirmed on the remote; empty diffs stopped early.
- [ ] Conflicts (if any) resolved by the user and `git diff --check` is clean.
- [ ] Definition of Done ran and passed — or the branch was rolled back to `PRE_MERGE_SHA`.
- [ ] A Merge Report was emitted (with Next Steps if rolled back).
