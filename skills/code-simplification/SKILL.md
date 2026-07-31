---
name: code-simplification
version: 1.0.0
description: >
  Reduces complexity in working code while preserving exact behavior, judged
  by whether a new teammate would understand the result faster than the
  original.
  USE FOR: cleaning up deeply nested logic, long functions, or unclear names
  after a feature works; consolidating duplicated logic; refactoring code
  written under time pressure; addressing readability feedback from review.
  DO NOT USE FOR: reviewing code health across correctness, security, and
  architecture (use skill:code-reviewer), or code you don't yet understand —
  comprehend it first, simplify it second.
argument-hint: "Optional: file or directory to scope the pass to (default: recently changed files)"
---

# Code Simplification

## Overview

Reduce a working piece of code's complexity without changing what it does —
only how it's expressed. Simpler does not mean shorter; it means faster to
read, understand, and safely change. **Prime directive: behavior is fixed,
only expression changes — if a rewrite isn't obviously behavior-preserving,
don't make it.**

## When to Use

- A feature works and its tests pass, but the implementation is heavier than it needs to be.
- Code review flags deep nesting, a long function, or an unclear name.
- Refactoring code that was written under time pressure or has absorbed patches over time.
- Consolidating logic that has drifted into near-duplicates across files.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: UNDERSTAND — apply Chesterton's Fence

Before touching anything, establish the code's responsibility, its callers
and dependents, its edge cases and error paths, and whether tests already
pin its behavior. Check `git blame` for why it was written this way — a
workaround for a real constraint looks identical to accidental complexity
until you check. If you can't explain why the code exists in its current
form, read more before simplifying.

### Step 2: SCAN — find concrete complexity signals

Read the target code against the structural, naming, and redundancy
patterns in [references/reference.md](references/reference.md) — deep
nesting, boolean-flag parameters, generic names, duplicated logic, dead
code, over-engineered abstractions. Weigh each candidate against the
project's own conventions (CLAUDE.md, neighboring code, linter config)
before deciding it's actually a problem worth fixing.

### Step 3: SIMPLIFY — change one thing at a time

Apply a single simplification, then run the test suite before moving to
the next. If tests fail, revert that change and reconsider rather than
pushing through. Keep simplification commits separate from feature or
bug-fix commits — a diff that does both is two changes wearing one commit.
If a pass would touch more than roughly 500 lines by hand, write a codemod
or script instead of editing manually.

### Step 4: VERIFY — confirm the result is actually simpler

Compare the before and after side by side. If the "simplified" version is
harder to follow, longer, or introduces a pattern inconsistent with the
rest of the codebase, revert it — not every attempt succeeds. Confirm the
diff stays scoped to the simplification and is reviewable on its own.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It works, no need to touch it." | Code that's hard to read is hard to fix later — simplifying now is cheaper than paying for it on every future change. |
| "Fewer lines is always simpler." | A dense one-line nested ternary can cost more comprehension time than a five-line if/else. Optimize for read speed, not line count. |
| "I'll tidy this unrelated code while I'm in here." | Unscoped changes bloat the diff and risk regressions in code nobody asked you to touch. Stay inside the task's scope. |
| "The original author must have had a reason." | Maybe — check git blame and apply Chesterton's Fence. But plenty of complexity is just leftover residue from iteration, not intent. |
| "I'll refactor while I add this feature." | Mixed diffs are harder to review and to revert. Ship the refactor and the feature as separate changes. |

## Red Flags

- A simplification that only passes after you edit the tests — you likely changed behavior, not just expression.
- The "simplified" result is longer or harder to follow than what it replaced.
- Error handling quietly disappeared because it "made the code cleaner."
- Many unrelated simplifications batched into one large, unreviewable commit.
- Renames or restructuring driven by personal taste rather than the project's existing conventions.

## Verification

- [ ] Every existing test passes without modification.
- [ ] Build and linter both pass with no new warnings.
- [ ] Each simplification landed as its own reviewable, tested change.
- [ ] The diff contains only the simplification — no unrelated drive-by edits.
- [ ] Simplified code matches the project's own conventions, not personal preference.
- [ ] No error handling or edge-case coverage was silently dropped.
