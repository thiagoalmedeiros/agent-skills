---
name: open-knowledge
version: 3.0.0
description: >
  The single source of truth for how the repository's knowledge-base/
  documentation bundle is organized under the Open Knowledge Format (OKF)
  v0.2 — frontmatter (including the provenance, trust, and lifecycle
  families), file and folder naming, folder structure, the reserved
  index.md and log.md rules, and cross-linking — applied both when
  writing the bundle and when reviewing it for conformance, with a
  bundled validator.
  USE FOR: creating or editing documentation in knowledge-base/, adding
  concepts, updating index.md or log.md, standardizing file and folder
  names, restructuring the bundle, migrating legacy OKF frontmatter, or
  auditing it for OKF conformance after documentation edits land.
  DO NOT USE FOR: judging whether documentation content is wrong,
  contradictory, out of date, or misaligned with a code diff;
  session-scoped lessons logs (use skill:lessons-learned); or
  non-documentation tasks.
argument-hint: "Optional: path under knowledge-base/ to create, edit, or review"
---

# Open Knowledge Format (OKF) Standard

## Overview

The single source of truth for how the `knowledge-base/` bundle is
organized under OKF v0.2 — applied both when **writing** documentation
and when **reviewing** the bundle for conformance. The full spec — bundle
structure, concept frontmatter and its families, reserved-file rules,
cross-linking, house rules, and the validator's codes — lives in
[references/reference.md](references/reference.md); the mechanical checks
run through the bundled `<skill-dir>/scripts/validate.mjs`, where
`<skill-dir>` is this skill's own directory — not the project's `scripts/`;
this file is the process that applies both. **Prime directive: this skill
governs how the bundle is organized, never whether its content is right — every judgment traces to a
numbered section of `references/reference.md`, provenance is recorded
truthfully or not at all, and no write is complete until `generated`, the
index, and (where the bundle has one) the log are updated.**

## When to Use

- Creating or editing a concept document in `knowledge-base/`.
- Updating an `index.md` listing or the `log.md` changelog.
- Standardizing file and folder names, or restructuring the bundle.
- Migrating concepts off the legacy `timestamp` field or `# Citations` list (§10).
- Auditing the bundle for OKF conformance — including files another pass
  has just edited.

## The Process

Step 1 picks one of two paths. **Take the write path (2 → 3) or the review
path (4), never both.** A review edits only when it normalizes the bundle
after a content pass; a standalone audit reports without editing (Step 4).
Do not skip the verification step.

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

### Step 2: APPLY — write to the OKF rules

For a concept, write the YAML frontmatter (§2.1 — `type` required;
`title`/`description` recommended; reuse the bundle's existing types)
followed by a structured Markdown body, cross-linking related concepts
with bundle-relative (`/path`) links (§5). Add `sources`, `status`, or
`stale_after` only when the content actually warrants them (§2.2, §2.4) —
never invent a source, verifier, or date — and keep every frontmatter key
you did not add. An Attested Computation's computation is never yours to
write or edit; supply parameter values only (§6). For reserved files,
follow §4: `index.md` carries no frontmatter except `okf_version` on the
bundle root, and lists every concept in its folder with its description;
`log.md` is newest-first with `## YYYY-MM-DD` headers. Name new files and
folders to match the convention the bundle already uses (§3).

### Step 3: UPDATE — provenance, index, log, hierarchy

On every concept whose content you created or changed, set
`generated: { by: <agent>/<model-id>, at: <now, ISO 8601 with offset> }`
(§2.3, §8), replacing a legacy `timestamp` if one is still there. A
migration-only edit is not a content change: it carries the old `timestamp`
over as `generated.at` instead of now (§10). Add
`verified` only when the user explicitly signs off, as
`{ by: human:<id>, at }`; never mark your own writing `human:` (§7). Add
any new concept to the relevant `index.md`; if the bundle has a `log.md`,
add a dated entry summarizing the change (if it has none, skip it — do not
create one unasked); and if a clearer folder hierarchy would help, suggest
it to the user rather than restructuring unasked. Then run
`node <skill-dir>/scripts/validate.mjs --strict <bundle-dir>` — drop
`--strict` only for a bundle that does not follow this repository's house
rules (§9) — and fix what it reports for the files you touched. The write
path ends here.

### Step 4: AUDIT — check the bundle's organization

Run the validator first:
`node <skill-dir>/scripts/validate.mjs --strict <bundle-dir>` for a bundle
that follows this repository's house rules (`knowledge-base/`
does), or without `--strict` for one that does not (§9). Each finding's
code maps to a section: **frontmatter** (`E1`/`E2`, §2) → **families**
(`W1`–`W7`, §2.2–§2.5, §6, §7) → **reserved files** (`E3`, §4) →
**naming** (`H1`, §3) → **structure** (`H2`, §3.2) → **`index.md`
completeness** (`H3`, §4.1) → **provenance** (`H4`, §8) → **cross-links**
(`H5`, §5). Then make the checks the validator cannot: concepts sit under
the right folder (§1, §3.2); a `log.md`, where there is one, has an entry
for every change (§4.2); every `human:` actor and `verified` entry is one
a person actually stands behind (§7); every `sources` entry backs the
claims cited from it (§2.2).

Report each violation with the section it breaks. What you then do
depends on how this pass was invoked:

- **Standalone audit** — report only. Change nothing on disk; the user
  decides what to act on.
- **Normalization after a content pass** — repair the organization faults
  that pass left behind, which always includes setting `generated` on
  every concept it edited, and re-listing anything it added or removed in
  the relevant `index.md`. Repair organization only; never revise the
  prose the content pass just wrote.

Either way, say nothing about whether the prose itself is correct — that
is a different question.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It's just a small edit, skip the log." | If the bundle has a `log.md`, every change gets an entry — the changelog is how the bundle stays traceable. |
| "I'll add frontmatter to index.md too." | Only the bundle-root `index.md` may carry frontmatter, and only `okf_version` (§4.1). |
| "A new concept doesn't need to be linked." | Add it to the directory's `index.md` and cross-link related concepts, or it's undiscoverable. |
| "I'll just bump the `timestamp`." | `timestamp` is the legacy field. Replace it with `generated: { by, at }` on every edit (§2.3, §10). |
| "The user asked for this edit, so `generated.by` is `human:`." | Directing an edit is not writing it. Agent-written content carries the agent's actor (§7). |
| "It looks right, I'll add `verified`." | `verified` records a confirmation that actually happened. Only an explicit sign-off earns one (§2.3). |
| "Adding `sources` and `stale_after` makes the concept look thorough." | Invented provenance is worse than none. Add a family only when the facts behind it exist (§8). |
| "I don't recognize this frontmatter key, I'll tidy it away." | Extensions are part of the format. Preserve unknown keys (§2.1). |
| "The validator passed, so the bundle is fine." | It checks shape, not placement, log coverage, or whether a `human:` claim is true. Finish Step 4's manual checks. |
| "The names are inconsistent but the links still work." | Naming is part of the format (§3). A bundle whose names don't follow one convention stops being navigable by name. |
| "This concept's content is out of date, I'll fix it while I'm here." | Organization is this skill's remit; whether the content is right is judged elsewhere. Flag it, don't rewrite it. |
| "The bundle has no changelog, I'll create one." | A bundle without a `log.md` is conformant (§4.2). Adding one is a structural decision for the user, not a conformance fix. |

## Red Flags

- A concept file missing its `type`, a non-root `index.md` carrying frontmatter, or a root `index.md` carrying anything beyond `okf_version`.
- A concept written or edited without `generated`, or still carrying a legacy `timestamp` after an edit.
- A `human:` actor on agent-written content, or a `verified` entry nobody explicitly gave.
- A `sources` entry, `status`, or `stale_after` added without facts behind it, or an unknown frontmatter key deleted.
- An Attested Computation's computation edited by an agent.
- A file or folder name that breaks §3, or a reserved name used for a non-reserved file.
- A new concept absent from its directory's `index.md`.
- A documentation change with no corresponding `log.md` entry, in a bundle that has a `log.md`.
- Broken or non-bundle-relative cross-links between concepts.
- An audit that skipped the validator, or that reported only the validator's output and skipped the manual checks.
- A review that reports content faults — wrong or outdated prose — instead of organization faults.
- A standalone audit that edits files, or any finding that cites no section of the reference.
- A normalization pass that leaves a just-edited concept's `generated` stale, or that rewrites prose instead of repairing organization.

## Verification

- [ ] `node <skill-dir>/scripts/validate.mjs` was run against the bundle (`--strict` for `knowledge-base/`) and its output quoted; no error remains on the touched files.
- [ ] Every created or edited concept carries `generated` with a truthful actor and a datetime with an explicit offset; no legacy `timestamp` survived the edit.
- [ ] `verified`, `sources`, `status`, and `stale_after` appear only where real facts back them; unknown keys were preserved.
- [ ] File and folder names follow §3; reserved names are used only for their reserved purpose.
- [ ] Every concept is listed in its directory's `index.md` with a description.
- [ ] A dated entry was added to `knowledge-base/log.md`, or the bundle has none and none was invented.
- [ ] Cross-links use bundle-relative paths and resolve to real files.
- [ ] On a review pass, every finding cites the section it breaks and no content judgment was reported — a standalone audit edited nothing; a normalization pass repaired only organization, `generated` included.
