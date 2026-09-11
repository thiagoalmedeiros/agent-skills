---
name: open-knowledge
version: 2.0.0
description: >
  The single source of truth for how the repository's knowledge-base/
  documentation bundle is organized under the Open Knowledge Format (OKF)
  v0.1 — frontmatter, file and folder naming, folder structure, the
  reserved index.md and log.md rules, and cross-linking — applied both
  when writing the bundle and when reviewing it for conformance.
  USE FOR: creating or editing documentation in knowledge-base/, adding
  concepts, updating index.md or log.md, standardizing file and folder
  names, restructuring the bundle, or auditing it for OKF conformance
  after documentation edits land.
  DO NOT USE FOR: judging whether documentation content is wrong,
  contradictory, out of date, or misaligned with a code diff;
  session-scoped lessons logs (use skill:lessons-learned); or
  non-documentation tasks.
argument-hint: "Optional: path under knowledge-base/ to create, edit, or review"
---

# Open Knowledge Format (OKF) Standard

## Overview

The single source of truth for how the `knowledge-base/` bundle is
organized under OKF v0.1 — applied both when **writing** documentation
and when **reviewing** the bundle for conformance. The full spec — bundle
structure, concept frontmatter, reserved-file rules, and cross-linking
conventions — lives in
[references/reference.md](references/reference.md); this file is the
process that applies it. **Prime directive: this skill governs how the
bundle is organized, never whether its content is right — every judgment
traces to a numbered section of `references/reference.md`, and no write
is complete until the timestamp, index, and (where the bundle has one)
the log are updated.**

## When to Use

- Creating or editing a concept document in `knowledge-base/`.
- Updating an `index.md` listing or the `log.md` changelog.
- Standardizing file and folder names, or restructuring the bundle.
- Auditing the bundle for OKF conformance — including files another pass
  has just edited.

## The Process

Step 1 picks one of two paths. **Take the write path (2 → 3) or the review
path (4), never both** — a review reports, it does not edit. Do not skip
the verification step.

### Step 1: SCOPE — pick the path and locate the target

Determine whether the request is to **write** (create or edit a file in
the bundle) or to **review** (audit the bundle's organization, typically
after other documentation edits have landed). For a write, identify what
is being touched: a **concept** (any doc other than the reserved files),
an `index.md` (directory listing), or `log.md` (update history), and
where it sits in the bundle structure — then go to Step 2. For a review,
the scope is every file under `knowledge-base/` — go straight to Step 4.
Load [references/reference.md](references/reference.md) — it holds every
rule the remaining steps apply.

### Step 2 — write path: APPLY — write to the OKF rules

For a concept, write the required YAML frontmatter (`type` required;
`title`/`description`/`timestamp` recommended) followed by a semantic
Markdown body, cross-linking related concepts with bundle-relative
(`/path`) links. For reserved files, follow their rules: `index.md` has no
frontmatter and lists concepts with descriptions; `log.md` is
newest-first with date-grouped headers. Name new files and folders to
match the convention the bundle already uses, and never reuse the
reserved names `index.md` or `log.md` for anything but their reserved
purpose.

### Step 3 — write path: UPDATE — timestamp, index, log, hierarchy

Update every touched concept's `timestamp`; add any new concept to the
relevant `index.md`; if the bundle has a `log.md`, add a dated entry
summarizing the change (if it has none, skip it — do not create one
unasked); and if a clearer folder hierarchy would help, suggest it to the
user rather than restructuring unasked. The write path ends here.

### Step 4 — review path: AUDIT — check the bundle's organization

Sweep every scoped file against the spec in this order: **frontmatter**
(§2 — `type` present on every concept; reserved files carry none) →
**naming** (§3 — kebab-case files and folders; reserved names used only
for their reserved purpose) → **structure** (§1, §3.2 — concepts sit
under the right folder; every folder holding concepts has an `index.md`)
→ **`index.md` completeness** (§4.1 — every concept listed with its
description) → **`log.md`** (§4.2 — if the bundle has one, a dated entry
for every change; a bundle with no `log.md` is conformant) →
**cross-links** (§5 — bundle-relative and resolving to real files).

Report each violation with the section it breaks. What you then do
depends on how this pass was invoked:

- **Standalone audit** — report only. Change nothing on disk; the user
  decides what to act on.
- **Normalization after a content pass** — repair the organization faults
  that pass left behind, which always includes bumping the `timestamp` of
  every concept it edited, and re-listing anything it added or removed in
  the relevant `index.md`. Repair organization only; never revise the
  prose the content pass just wrote.

Either way, say nothing about whether the prose itself is correct — that
is a different question.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It's just a small edit, skip the log." | If the bundle has a `log.md`, every change gets an entry — the changelog is how the bundle stays traceable. |
| "I'll add frontmatter to index.md too." | `index.md` is reserved and MUST NOT carry frontmatter. |
| "A new concept doesn't need to be linked." | Add it to the directory's `index.md` and cross-link related concepts, or it's undiscoverable. |
| "I'll leave the timestamp as-is." | Update `timestamp` on every edit — stale timestamps mislead readers and agents. |
| "The names are inconsistent but the links still work." | Naming is part of the format (§3). A bundle whose names don't follow one convention stops being navigable by name. |
| "This concept's content is out of date, I'll fix it while I'm here." | Organization is this skill's remit; whether the content is right is judged elsewhere. Flag it, don't rewrite it. |
| "The bundle has no changelog, I'll create one." | A bundle without a `log.md` is conformant (§4.2). Adding one is a structural decision for the user, not a conformance fix. |

## Red Flags

- A concept file missing its `type` frontmatter, or `index.md`/`log.md` carrying frontmatter.
- A file or folder name that breaks §3, or a reserved name used for a non-reserved file.
- A new concept absent from its directory's `index.md`.
- A documentation change with no corresponding `log.md` entry, in a bundle that has a `log.md`.
- Broken or non-bundle-relative cross-links between concepts.
- A review that reports content faults — wrong or outdated prose — instead of organization faults.
- A standalone audit that edits files, or any finding that cites no section of the reference.
- A normalization pass that leaves a just-edited concept's `timestamp` stale, or that rewrites prose instead of repairing organization.

## Verification

- [ ] Concept files have valid YAML frontmatter (`type` present); reserved files follow their rules.
- [ ] File and folder names follow §3; reserved names are used only for their reserved purpose.
- [ ] Every concept is listed in its directory's `index.md` with a description.
- [ ] A dated entry was added to `knowledge-base/log.md`, or the bundle has none and none was invented.
- [ ] Every touched concept's `timestamp` was updated to the current time.
- [ ] Cross-links use bundle-relative paths and resolve to real files.
- [ ] On a review pass, every finding cites the section it breaks and no content judgment was reported — a standalone audit edited nothing; a normalization pass repaired only organization, timestamps included.
