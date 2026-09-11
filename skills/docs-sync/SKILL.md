---
name: docs-sync
version: 3.0.1
description: >
  Align documentation content with the actual code changes on a branch —
  across the four repo-root docs (AGENTS.md, ARCHITECTURE.md, README.md,
  CLAUDE.md) and the knowledge base alike — plan-first and
  evidence-based. A diff is the trigger, but the analysis radius extends
  to related docs the diff does not show. It asks one question of every
  document: is this content wrong? — contradictions, duplication,
  dead/outdated content, and content that could be simplified by
  combining, moving, or reorganizing it.
  USE FOR: syncing docs after code changes, detecting doc drift, or a
  pre-merge documentation check.
  DO NOT USE FOR: how a documentation bundle is organized — frontmatter,
  file and folder naming, folder structure, index or changelog
  obligations; writing net-new documentation unrelated to a diff;
  rewriting docs wholesale; or applying structural changes (combine,
  move, delete, reorganize) without the user's confirmation.
argument-hint: "Optional base branch (defaults to origin/main; a non-main base is the caller's responsibility to specify)"
---

# Documentation Sync

## Overview

Use a branch's diff as the trigger to bring the repo's documentation
**content** back in line — the four target docs (`AGENTS.md`,
`ARCHITECTURE.md`, `README.md`, `CLAUDE.md`) **and** the knowledge base —
proposing changes first, then applying only what the user approves. A
diff rarely reveals everything a change affects, so the analysis radius
extends to related docs the diff does not touch. The target-file map,
classification heuristics, drift and consistency categories, change-risk
tiers, per-file rules, and output format live in
[references/reference.md](references/reference.md).
**Prime directive: never edit before showing the plan, and never invent
content — every proposed change is evidenced by the diff or by a concrete
inconsistency it exposes in existing docs. Trivial in-place fixes are
applied once approved; structural changes (combine, move, delete,
reorganize) are actioned only after the user confirms they are
relevant. What a document says is in scope; how a documentation bundle is
organized is not — so removing a whole bundle file is only safe when an
organization pass runs afterwards to repair the index and changelog it
leaves stale; if none will, surface the deletion as a suggestion instead
of applying it.**

## When to Use

- Before merging a feature branch — ensure docs reflect new code.
- After significant structural changes (new apps, libs, tasks, configs).
- When references to files, tasks, or components appear stale or newly introduced.
- To cross-check the knowledge base and agent docs for duplication or
  contradictions a change exposes — even in files the diff didn't touch.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: COLLECT — scope the diff and the read radius

Collect the diff with three-dot syntax against the base ref (default
`origin/main`) as shown in
[references/reference.md](references/reference.md). If `git fetch` fails
or the base ref is missing, report and stop. If the diff is empty, report
"No changes relative to base branch" and stop.

A diff names only the files that changed, not everything those changes
affect. So also establish the **read radius** to cross-check in later
steps: the four target docs, the knowledge base (default
`knowledge-base/`, or wherever the user has set it), and
`CLAUDE.md`/`AGENTS.md`. These are read as context even when the diff
never touched them — a change can contradict or duplicate content that
lives in a file the diff doesn't mention.

### Step 2: CLASSIFY — map changes to affected docs

Apply the classification heuristics to decide which docs each changed file
affects — the four target docs **and** any knowledge-base concept that
describes the changed subsystem, plus `CLAUDE.md`/`AGENTS.md`. A changed
file often maps to a doc the diff never touched. Honor the fallthrough
rule: unrelated changes do not force doc updates, and if only fallthrough
files changed (below the notification threshold), report "Docs are up to
date" and stop — no plan, no summary.

### Step 3: DETECT — read the docs and find drift and inconsistency

Read all four target docs in full, plus the knowledge-base concepts and
agent docs the classification flagged, then read every changed file that
matched a heuristic. Detect two kinds of issue:

- **Drift vs. the change** — stale references, missing entries, incorrect
  descriptions, and structural mismatches.
- **Cross-doc inconsistency the change exposes** — duplication (the same
  content in two places), dead content (docs for removed code), outdated
  content, and contradictions (docs that conflict with each other or with
  the changed code). Where warranted, note opportunities to simplify by
  combining, moving, or reorganizing content.

Tag each finding by change-risk tier — **trivial** (an in-place fix) or
**structural** (combine, move, delete, reorganize) — since the tier
decides how it's gated in the plan. If a target file is missing, ask
whether to create it from a template or skip it before proceeding.

### Step 4: PLAN — present, do not edit

Present the Documentation Sync Plan grouped by file, each item stating the
action (Add / Update / Remove / Combine / Move / Delete), the target
section, the tier, and the evidence (the diff or the inconsistency that
triggered it). Split it in two: **trivial fixes** ready to apply on
approval, and **structural suggestions** (combine, move, delete,
reorganize) that first ask the user whether the change is relevant and
worth making. **Do not edit any file yet.** If the user rejects the plan,
stop. Apply only approved items; refuse content not evidenced by the diff
or a concrete doc inconsistency.

### Step 5: APPLY & VERIFY — edit approved items, then check

Apply only the approved changes, following the per-file rules (especially
`CLAUDE.md`'s pointer-only rule and `ARCHITECTURE.md`'s tree
regeneration). Re-read each edited file and verify: no broken relative
links, no references to deleted files/tasks, trees match actual `ls`
output, tables are valid, and cross-doc references resolve. On failure,
do one corrective pass and re-verify; if issues persist, report them and
do not claim success.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll just fix the docs directly." | Never edit before the plan. The plan is the user's approval gate. |
| "This related area could use an update too." | Fine to flag — but only when a concrete inconsistency evidences it, and if it's structural (combine/move/delete), ask before actioning. No speculative additions. |
| "I'll just merge these two duplicate sections while I'm here." | Combining, moving, or deleting is a structural change — surface it as a suggestion and confirm relevance first. |
| "This whole knowledge-base concept is dead, I'll delete the file." | Deleting a bundle file strands its index entry and leaves no changelog record, and repairing those is out of this skill's remit. Only delete when an organization pass follows; otherwise suggest it. |
| "The section is close enough, I'll rewrite it." | Don't rewrite already-correct sections — edit only what the change or a real inconsistency requires. |
| "While I'm in the knowledge base I'll fix its frontmatter and index too." | Content is this skill's remit; how the bundle is organized is not. Leave it — the organization pass that runs after this one normalizes whatever this skill writes. |
| "CLAUDE.md needs the workflow details." | `CLAUDE.md` is a pointer to `AGENTS.md` only — substantive content goes there. |

## Red Flags

- Editing any doc before presenting the plan.
- Adding content not evidenced by the diff or a concrete doc inconsistency.
- Applying a structural change (combine, move, delete, reorganize) without confirming relevance first.
- Editing a documentation bundle's frontmatter, filenames, index listings, or changelog — that is organization, not content.
- Using two-dot instead of three-dot (`origin/main...HEAD`) diff scope.
- Rewriting a whole section that no change or inconsistency touched.
- Declaring success with broken links or stale references remaining.

## Verification

- [ ] Diff collected with three-dot syntax against the correct base ref.
- [ ] Read radius established — knowledge base and agent docs read as context, not just the diff.
- [ ] Changes classified; unrelated-only diffs stopped early with no plan.
- [ ] Findings tagged trivial vs. structural; a plan was shown and approved before any edit.
- [ ] Structural changes (combine, move, delete) confirmed relevant before applying.
- [ ] Only approved items applied; per-file rules honored (CLAUDE.md pointer, ARCHITECTURE.md tree).
- [ ] Every applied edit changed what a document says, not how the bundle is organized.
- [ ] Any whole-file deletion in the bundle was either followed by an organization pass or left as a suggestion.
- [ ] Post-apply verification passed — links resolve, trees match, no stale references.
