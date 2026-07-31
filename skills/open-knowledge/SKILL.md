---
name: open-knowledge
version: 1.0.0
description: >
  Read, write, and maintain repository documentation under the Open
  Knowledge Format (OKF) v0.1 so the `knowledge-base/` stays
  human-readable, agent-parseable, and portable.
  USE FOR: editing or creating documentation in knowledge-base/, adding
  concepts, updating index.md or log.md, or reviewing repository
  documentation context.
  DO NOT USE FOR: aligning document content against a code diff, judging
  whether documentation is contradictory or out of date, session-scoped
  lessons logs (use skill:lessons-learned), or non-documentation tasks.
argument-hint: "Optional: path under knowledge-base/ to create, edit, or review"
---

# Open Knowledge Format (OKF) Documentation

## Overview

Govern the creation, modification, and structure of the project's
`knowledge-base/` documentation under OKF v0.1. The full bundle structure,
concept format, reserved-file rules, and cross-linking conventions live in
[references/reference.md](references/reference.md). **Prime directive:
every documentation change conforms to OKF — concepts carry YAML
frontmatter, `index.md`/`log.md` are reserved with their own rules, and no
change is complete until the timestamp, index, and log are updated.**

## When to Use

- Creating or editing a concept document in `knowledge-base/`.
- Updating an `index.md` listing or the `log.md` changelog.
- Reviewing repository documentation for OKF conformance or context.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: ORIENT — locate the file in the bundle

Determine what is being touched: a **concept** (any doc other than the
reserved files), an `index.md` (directory listing), or `log.md` (update
history) — and where it sits in the `knowledge-base/` bundle structure
from [references/reference.md](references/reference.md).

### Step 2: APPLY — write to the OKF rules

For a concept, write the required YAML frontmatter (`type` required;
`title`/`description`/`timestamp` recommended) followed by a semantic
Markdown body, cross-linking related concepts with bundle-relative
(`/path`) links. For reserved files, follow their rules: `index.md` has no
frontmatter and lists concepts with descriptions; `log.md` is
newest-first with date-grouped headers.

### Step 3: UPDATE — timestamp, index, log, hierarchy

Update the concept's `timestamp`; add any new concept to the relevant
`index.md`; add a dated `log.md` entry summarizing the change; and if a
clearer folder hierarchy would help, suggest it to the user.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It's just a small edit, skip the log." | Every change gets a `log.md` entry — the changelog is how the bundle stays traceable. |
| "I'll add frontmatter to index.md too." | `index.md` is reserved and MUST NOT carry frontmatter. |
| "A new concept doesn't need to be linked." | Add it to the directory's `index.md` and cross-link related concepts, or it's undiscoverable. |
| "I'll leave the timestamp as-is." | Update `timestamp` on every edit — stale timestamps mislead readers and agents. |

## Red Flags

- A concept file missing its `type` frontmatter, or `index.md`/`log.md` carrying frontmatter.
- A new concept absent from its directory's `index.md`.
- A documentation change with no corresponding `log.md` entry.
- Broken or non-bundle-relative cross-links between concepts.

## Verification

- [ ] Concept files have valid YAML frontmatter (`type` present); reserved files follow their rules.
- [ ] New concepts are listed in the relevant `index.md` with a description.
- [ ] A dated entry was added to `knowledge-base/log.md`.
- [ ] The edited concept's `timestamp` was updated to the current time.
- [ ] Cross-links use bundle-relative paths and resolve to real files.
