---
name: taskfile-standard
version: 1.0.0
description: >
  Canonical standard for authoring and reviewing Taskfile.dev v3 task
  runners (schema, namespacing, caching, composition, security) — every
  finding cites the rule it violates.
  USE FOR: writing new Taskfiles, refactoring existing Taskfiles,
  reviewing a PR that changes `Taskfile.yml` or an included partial, or
  onboarding a project that uses go-task.
  DO NOT USE FOR: GNU Make, npm scripts, Just, Mage, or shell-only task
  runners; or deciding whether to adopt go-task in the first place.
argument-hint: "Path to a `Taskfile.yml` (or included partial) to author, refactor, or review"
---

# Taskfile Standard (Taskfile.dev v3)

## Overview

The single source of truth for writing and reviewing Taskfile.dev v3
files in this project — applied both when **authoring** new Taskfiles and
when **reviewing** existing ones. The full rule set, schema key lists, and
review output format live in
[references/standard.md](references/standard.md); this file is the process
that applies it. **Prime directive: tasks are contracts — schema-first,
idempotent, and cacheable — so any task that produces files declares
`sources:` and `generates:`, and no task hides side effects.**

## When to Use

- The user asks to create, refactor, or review a `Taskfile.yml`, `Taskfile.dist.yml`, or any file `include`d by one.
- The user asks "is this a good Taskfile?" or "is this idiomatic?".
- A PR adds or changes task definitions.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — confirm it is a Taskfile, then pick the mode

If the file is not a Taskfile.dev v3 document (a Makefile, GitHub Actions
workflow, or other non-go-task file), respond "This file is not a
Taskfile.dev v3 document; this skill does not apply." and stop. Otherwise
select the mode: **authoring** (create/write/refactor) or **review**
(audit/check/validate). Load [references/standard.md](references/standard.md).

### Step 2: APPLY — enforce the standard in fixed order

Apply the standard's sections in this order: Schema → Layout → Naming →
Caching → Composition → Security → Cross-Platform → Documentation. When
authoring, start from the File Layout template, define `vars:`/`env:` up
front, and fill each task's `desc:`, `sources:`/`generates:`, `deps:`,
and `cmds:` in that order. When reviewing, read the full `Taskfile.yml`
plus every `includes:` target (mark any unavailable include as
Unreviewed), and cite the exact rule from
[references/cheatsheet.md](references/cheatsheet.md) for every finding. If
the YAML fails to parse, report only the parse-error location and stop.

### Step 3: EMIT — deliver the Taskfile or the structured report

For authoring: output the complete `Taskfile.yml` in a single fenced
`yaml` block followed by a brief bullet list of design decisions, after
validating locally with `task --list-all` and `task --dry <name>`. For
review: emit the report exactly as specified in
[references/standard.md](references/standard.md) (Summary → Detailed
Findings → Positive Highlights → Recommendations → References), citing
`references/links.md` rather than repeating URLs.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "`version:` is optional." | v2/omitted is a Critical schema finding — declare `version: '3'` and migrate before continuing. |
| "One big shell block is simpler." | Hidden side effects and no caching. Split into named, composable tasks with `sources:`/`generates:`. |
| "`{{.VAR}}` doesn't need quoting." | Treat it like `$VAR`: quote it, or an injected value breaks the shell. |
| "`\|\| true` just makes it pass." | It papers over real errors. Silent failure is forbidden without a documented comment. |

## Red Flags

- A finding with no schema/section citation, or `version:` missing/2.
- A file-producing task with no `sources:`/`generates:` (breaks caching).
- Unquoted `{{.VAR}}` interpolation, `curl | sh`, or secrets committed in `vars:`/`env:`.
- A `cmds:` block over ~15 shell lines that should be a `scripts/*.sh` file.

## Verification

- [ ] Confirmed the file is a Taskfile v3; mode (author/review) selected.
- [ ] Every finding cites a rule from `references/standard.md` / `cheatsheet.md`.
- [ ] Sections applied in order; all `includes:` read or marked Unreviewed.
- [ ] Authoring path: `task --list-all` and `task --dry <name>` validate clean.
- [ ] Review path: report emitted in the exact Output Format, with no invented URLs.
