---
name: code-reviewer
version: 1.1.0
description: >
  Multi-axis code review, language- and framework-agnostic — correctness,
  readability, architecture/SOLID, security, and performance, layered
  with convention conformance, duplication detection, test quality, and
  strict comment hygiene (self-documenting code; over-commenting is a
  readability defect).
  USE FOR: reviewing a branch diff or local uncommitted changes before
  merge; assessing code health across dimensions; reviewing code written
  by yourself, another agent, or a human.
  DO NOT USE FOR: writing new features, planning work (use
  skill:impl-strategy), or first-hand test execution (use skill:thomas).
argument-hint: "Optional: branch name (default, diffed against develop), or 'local' for uncommitted changes"
---

# Code Reviewer

## Overview

Review changes across five axes and a final sweep, judged against the
project's own conventions rather than personal taste. The full axis
checklists, structural remedies, review discipline, output format, and
review checklist live in [references/reference.md](references/reference.md).
**Prime directive: approve what improves code health; block only real
defects. Approve a change that definitely improves overall health even if
imperfect — reserve blocking for correctness, security, architectural
regressions, and violations of the project's standards.**

## When to Use

- Before merging any branch or PR, or after completing a feature.
- When another agent or model produced code — AI-generated code needs more scrutiny, not less.
- When refactoring existing code, or after a bug fix (review the fix **and** its regression test).

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — get the diff and read files in full

Determine the scope (branch diff against `develop`, or `local`
uncommitted changes) using the git commands in
[references/reference.md](references/reference.md). Read each changed file
**in full**, not just the hunks, to judge context accurately.

### Step 2: CONTEXT — understand intent, tests first

Establish what the change is trying to accomplish and its expected
behavior. Review the **tests first** — do they exist, test behavior not
implementation, cover edge cases, and catch regressions?

### Step 3: REVIEW — walk the five axes

Evaluate every changed file across Correctness, Readability & Simplicity,
Architecture & Design (SOLID + duplication search beyond the diff),
Security, and Performance — applying the per-axis checklists and test/
comment-hygiene sub-checks in
[references/reference.md](references/reference.md). Security and
performance are mandatory even when the change looks cosmetic.

**The code is the documentation.** Comments are highlights, not
narration: one saying *what* the code does or *why* it's written that way
means the code should have said it — report the rename or extraction
instead. Density rivalling the code is one finding on the file, not a run
of nits. Only legal headers, ticketed `TODO`/`FIXME`s, required doc
comments, and facts outside the codebase survive.

### Step 4: CONVENTIONS — judge against the project's own rules

Check structure, naming, idioms, and styling against the project's style
guide, linter config, and any language/framework skills it defines (e.g.
`skill:python-standard`, `skill:angular-components`) — not personal
preference. Flag legacy patterns the project has moved away from.

### Step 5: SWEEP & VERDICT — final checks, then report

Run the final sweep — dependency review, dead-code identification (ask
before deleting), and change sizing. Then emit the verdict and findings
grouped by severity (🔴 Must Fix / 🟡 Should Fix / 🟢 Nit), leading with
what matters most, using the output format and structural remedies in
[references/reference.md](references/reference.md).

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It works, that's good enough." | Unreadable, insecure, or architecturally wrong code compounds debt even when it runs. |
| "AI-generated code is probably fine." | It needs more scrutiny, not less — confident and plausible even when wrong. |
| "The tests pass, so it's good." | Tests don't catch architecture, security, or readability problems. |
| "The refactor makes it cleaner." | Relocating complexity isn't reducing it — look for the version where branches disappear. |
| "We'll clean it up later." | Later never comes. The review is the quality gate — require the fix before merge, or a filed ticket. |
| "It's just a version bump." | A bump is a behavior change you didn't write. Read the changelog. |
| "The comments explain what it does." | Then the code doesn't. Fix the names and the structure. |
| "More comments can't hurt." | Nobody reads a file that narrates itself, so the one that mattered is skipped too. |

## Red Flags

- "LGTM" with no evidence of actual review, or checking only whether tests pass.
- Security-sensitive changes without a security-focused pass.
- A refactor that moves code around without reducing the concepts a reader must hold.
- New conditionals bolted onto unrelated flows, or a bespoke helper duplicating a canonical one.
- A change "too big to review properly," or one that grows an already-large file instead of decomposing it.
- Comment lines rivalling code lines, or a comment added where a rename or an extraction was the real fix.

## Verification

- [ ] Scope determined; every changed file read in full.
- [ ] Tests reviewed first; all five axes walked, security and performance included.
- [ ] Each file judged readable without its comments; surviving comments each earn their place.
- [ ] Duplication searched beyond the diff; conventions judged against the project's own rules.
- [ ] Final sweep done — dependencies, dead code (asked before deleting), change sizing.
- [ ] Verdict and severity-grouped findings emitted, leading with the highest-leverage issues.
