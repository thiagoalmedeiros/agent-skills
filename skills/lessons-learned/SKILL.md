---
name: lessons-learned
version: 1.0.0
description: >
  Standalone lessons-learned log. Captures problems, mistakes, and
  non-obvious patterns discovered during a session into a `lessons.md`
  file at a caller-supplied location, with init / read / append modes.
  USE FOR: initializing, reading, or appending entries to a `lessons.md`
  log during any working session.
  DO NOT USE FOR: writing implementation plans (use skill:impl-strategy),
  running code changes, or producing generic best-practice documents.
argument-hint: 'init <path> | read <path> | append <path> "<short-title>"'
---

# Lessons Learned

## Overview

A self-contained skill for capturing lessons during any working session.
The caller decides **where** `lessons.md` lives by passing a path; this
skill owns **how** it is created, read, and appended to. The file
template, entry format, append triggers, and quality bar live in
[references/reference.md](references/reference.md). **Prime directive:
lessons are earned, not predicted — append only real, specific lessons
from what actually happened, one per entry, and never overwrite existing
entries.**

## When to Use

- A caller (skill or user) needs to create a `lessons.md` for a plan or session (`init`).
- A session is starting and prior lessons should be read first (`read`).
- The user corrected an approach, or a non-obvious failure or recurring pattern surfaced (`append`).

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: RESOLVE — locate the file

Resolve the target from the caller's first argument: a directory path
means `<path>/lessons.md`; a `.md` file path is used directly. Never
invent a location — if none is given, ask the caller for one before doing
anything.

### Step 2: DISPATCH — act on the mode

Select the mode and apply its rule from
[references/reference.md](references/reference.md):

- **`init`** — create the file from the template only if it does not exist; never overwrite.
- **`read`** — return the full contents, or report that no prior lessons exist.
- **`append`** — add exactly one lesson entry at the bottom, running `init` first if the file is missing.

### Step 3: VALIDATE — check the entry (append)

For `append`, confirm the entry meets the quality bar: all four fields
filled (`Context`, `Mistake`, `Rule`, `Applies to`), a short prescriptive
`Rule`, today's date, one lesson only, and the `_No lessons recorded
yet._` placeholder removed if this is the first entry.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll add a few likely lessons up front." | Lessons are earned, not predicted. Append only what actually happened. |
| "This general best practice is worth noting." | Generic advice doesn't belong here — only project- or session-specific lessons. |
| "I'll batch today's lessons into one entry." | One lesson per entry; batching buries the individual rules. |
| "I'll pick a sensible default path." | The skill never invents a location — ask the caller. |

## Red Flags

- Overwriting an existing `lessons.md` on `init`.
- Speculative or generic entries with no concrete triggering event.
- An entry missing one of the four fields, or several lessons crammed into one.
- Inventing a file location instead of using the caller's path.

## Verification

- [ ] Location resolved from the caller's path (never invented).
- [ ] `init` created the file only when absent; existing content preserved.
- [ ] `append` added exactly one entry with all four fields and today's date.
- [ ] The `_No lessons recorded yet._` placeholder was removed on the first entry.
- [ ] No prior entries were edited or deleted without explicit instruction.
