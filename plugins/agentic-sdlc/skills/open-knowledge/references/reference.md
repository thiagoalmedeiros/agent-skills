# Open Knowledge Format (OKF) — Full Reference

> The OKF v0.2 bundle structure, concept frontmatter (with the provenance,
> trust, lifecycle, and computation families), reserved-file rules,
> cross-linking, the house rules this repository adds on top of the spec,
> and the bundled validator's codes for the `open-knowledge` skill.
> `SKILL.md` is the lean process that points here.

## 1. Bundle Structure

The project's documentation bundle is rooted in the `knowledge-base/` folder:

```
knowledge-base/
├── index.md                      # Directory listing; the root one may declare okf_version
├── log.md                        # Optional update history (changelog)
├── <concept>.md                  # Concept documents at the root
└── <subdirectory>/               # Subdirectories for concept groups
    ├── index.md                  # Subdirectory-level index
    └── <concept>.md              # Subdirectory-level concepts
```

The spec makes `index.md` and `log.md` optional everywhere. This repository's
house rules (§3.2) require an `index.md` in every folder that holds concepts;
`log.md` stays optional.

## 2. Concept Files

Every `.md` file except the reserved `index.md` and `log.md` is a **Concept**:
a YAML frontmatter block followed by a Markdown body. Its **Concept ID** is
its path in the bundle without `.md` (`setup/codex-setup`).

### 2.1 Core frontmatter

```yaml
---
type: <Type name>                  # REQUIRED — the only always-required key
title: <Display name>              # RECOMMENDED
description: <One-line summary>    # RECOMMENDED (index.md entries reuse it)
resource: <Canonical URI>          # RECOMMENDED for concrete assets; omit for abstract ideas
tags: [<tag>, <tag>, ...]          # OPTIONAL
---
```

- `type` is a free-form string (`System Architecture`, `Setup Guide`,
  `Metric`, `Attested Computation`). Types are not registered centrally —
  pick a descriptive one, reuse the bundle's existing types, and never
  reject or "correct" an unfamiliar one.
- **Extensions:** any other key is allowed. Preserve keys you do not
  recognize when you edit a concept — never strip them.

### 2.2 Provenance — `sources`

`sources` lists the materials a concept derives from:

```yaml
sources:
  - id: ga4-schema                                  # stable key for footnotes
    resource: https://developers.google.com/...     # REQUIRED in every entry
    title: GA4 BigQuery Export schema
    author: team:ga4-docs                           # credibility signals, all optional
    usage_count: 5000
    last_modified: 2026-05-30T00:00:00Z
usage_window: { from: 2026-06-01T00:00:00Z, to: 2026-06-30T00:00:00Z }
```

- `resource` is an absolute URL, a bundle-relative (`/…`) or relative path,
  or a scope descriptor (`all queries in project X`).
- `author` uses the actor convention (§7); `team:<id>` is also accepted here.
- `usage_window` frames every `usage_count`; an entry may carry its own.
- Attribute a specific claim with a markdown footnote whose label is the
  entry's `id` — keyed, never positional:

```markdown
The `events_` table is sharded daily.[^ga4-schema]

[^ga4-schema]: GA4 BigQuery Export schema
```

### 2.3 Trust — `generated` and `verified`

```yaml
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-05T14:00:00Z }
verified:
  - { by: human:thiagomedeiros, at: 2026-10-06T09:00:00Z }
```

- `generated` records who wrote the current content and when its last
  meaningful change happened. `by` is required inside it; `at` is the
  content's last-changed datetime. It replaces the legacy `timestamp` (§10).
- `verified` records independent confirmations, each `{ by, at }`. A single
  verifier may be written as a bare mapping; it means a one-element list.
- Writing and confirming are separate facts: an edit changes `generated`,
  never `verified`.

### 2.4 Lifecycle — `status` and `stale_after`

```yaml
status: stable                      # draft | stable | deprecated; absent = stable
stale_after: 2026-12-31T00:00:00Z   # stale on or after this instant
```

`deprecated` concepts stay for links and history. `stale_after` is an
absolute instant, never a relative TTL.

### 2.5 Datetimes

Every datetime-valued key (`generated.at`, `verified[].at`, `stale_after`,
`last_modified`, `usage_window.from`/`to`) is ISO 8601 **with an explicit
offset**: `2026-06-30T14:00:00Z` or `2026-06-30T16:00:00+02:00`.

### 2.6 Concept body

Standard Markdown with a semantic heading hierarchy. Prefer structure —
headings, lists, tables, fenced code — over freeform prose. Conventional
headings, used when they apply: `# Schema` (an asset's fields),
`# Examples`, `# Computation` (§6).

## 3. Naming

File and folder names are part of the format: a bundle whose names follow one
convention is navigable by name alone. These are house rules — the spec does
not mandate a naming scheme.

### 3.1 Concept files

- Lowercase **kebab-case**, `.md` extension: `system-architecture.md`, not
  `System Architecture.md` or `system_architecture.md`.
- The name describes the concept, not its position — no `01-`, `part2-`, or
  `final-` prefixes. Ordering belongs in `index.md`.
- No spaces, and no characters outside `[a-z0-9-]` before the extension.

### 3.2 Folders

- Same lowercase kebab-case rule, no extension: `setup/`, `resources/`.
- A folder holding concepts MUST contain an `index.md` listing them.

### 3.3 Reserved names

`index.md` and `log.md` are reserved bundle-wide. A file may carry one of
these names only for its reserved purpose (§4) — never as an ordinary
concept.

### 3.4 Judging conformance

These rules are the standard. Where a bundle is internally consistent but
uses a different convention, the bundle's own established convention wins —
report the deviation once, and do not rename files unasked.

## 4. Reserved Filenames

### 4.1 `index.md` (Directory Listing)

- Used for **progressive disclosure** so humans and agents explore directory
  contents without opening every file.
- Carries **no frontmatter**, with one exception: the **bundle-root**
  `index.md` MAY declare the targeted spec version, and nothing else:

  ```markdown
  ---
  okf_version: "0.2"
  ---
  ```

- Lists the concepts in its directory as markdown links, grouped under
  headings, each followed by the concept's `description` (paraphrasing is
  fine). Every concept in the directory is listed (house rule).
- Links should use **bundle-relative paths** (starting with `/`, relative to
  `knowledge-base/`), e.g. `[System Architecture](/architecture.md)`.

### 4.2 `log.md` (Update History)

- **Optional per bundle.** A bundle may omit a changelog entirely; when it
  does, the update obligation in §8 does not apply. The name stays reserved
  either way. When a bundle has one, every rule below binds.
- Records modifications to its scope, newest first. It carries no
  frontmatter — the spec is silent on this; it is a house rule, matching the
  plain date-grouped list the spec describes.
- Date-grouped headers in ISO 8601 form: `## YYYY-MM-DD`.
- Entries: `* **<Action>**: Short description referencing the [Concept](/path)`.
  The bold action (`Creation`, `Update`, `Deprecation`, `Migration`,
  `Initialization`) is a convention, not a requirement.

## 5. Cross-Linking

Concepts link to other concepts to build a relationship graph. The kind of
relationship lives in the surrounding prose, not the link.

- **Absolute bundle-relative links** (recommended): start with `/`, relative to
  the bundle root (e.g. `[Architecture](/architecture.md)`). They survive a
  file moving within its folder.
- **Relative links**: standard markdown paths (e.g. `[Lessons](./lessons.md)`).

The spec tells consumers to tolerate broken links — a missing target may be
knowledge not yet written. This repository is stricter: every link inside the
bundle must resolve (house rule). A link that leaves the bundle (`/../README.md`)
passes when its target exists.

## 6. Attested Computation

A concept of `type: Attested Computation` carries a sanctioned way to
**compute** a value, so a consumer can confirm a number was produced the
blessed way rather than by improvised code. One computation per concept;
concepts that need the value (a `Metric`) link to it.

```markdown
---
type: Attested Computation
title: Revenue for fiscal year
description: Recognized revenue for a fiscal year, per Finance's definition.
runtime: bigquery                                   # REQUIRED for this type
parameters:
  - { name: year, type: integer, required: true }   # the only holes an agent fills
executor:
  resource: references/skills/run-on-bq.md          # how a run happens
  receipt: [job_id, executed_sql, result]           # evidence a run returns
attester:
  resource: references/attesters/revenue.py         # deterministic, no-LLM check
generated: { by: human:ahormati, at: 2026-06-20T22:53:05Z }
---

# Computation

    SELECT SUM(amount) AS revenue
    FROM finance.recognized_revenue
    WHERE fiscal_year = @year
```

- The computation is either a single fenced block under `# Computation`, or a
  file named by the `computation` key (then the body has no fence).
- An agent MAY supply values for the declared `parameters` only. It MUST NOT
  write or edit the computation itself.
- `verified` confirms the *definition* still matches policy; attestation
  confirms a single *run* — it happens at runtime and is never stored in the
  bundle.
- A `references/` folder conventionally holds the run instructions,
  attesters, and mirrored external material these keys point at. Inside the
  bundle every `.md` file is a concept, so a Markdown run instruction such as
  `references/skills/run-on-bq.md` needs concept frontmatter and an
  `index.md` listing like any other (§2, §4.1); keep material that is not a
  concept outside the bundle, or in a non-Markdown file.

## 7. Actor Convention and Trust Tiers

Every identity value (`generated.by`, `verified[].by`, `sources[].author`) is
an **actor**:

| Actor | Form | Example |
| --- | --- | --- |
| Agent or tool | `<producer>/<version>` | `claude-code/claude-opus-5-5` |
| Person | `human:<id>` | `human:thiagomedeiros` |
| Automated process | `process:<id>` | `process:docs-nightly` |

`human:` is reserved for content a person actually wrote or confirmed. An
agent's own writing is never `human:`, however closely a person directed it.

Consumers derive a **trust tier** from `verified`: no `verified` key →
**unverified**; only non-`human:` verifiers → **machine-confirmed**; any
`human:` verifier → **human-reviewed**. Tiers are advisory signals, not
access control, and a concept with no trust keys is still conformant.

## 8. Update obligations

Whenever creating or updating documentation:

1. **Provenance** — set the concept's `generated` to
   `{ by: <your actor>, at: <now, ISO 8601 with offset> }`. An agent uses
   `<agent>/<model-id>`. If the concept still carries a legacy `timestamp`,
   replace it with `generated` in the same edit. Leave `verified` alone unless
   the user explicitly signs off on the content — then add their
   `{ by: human:<id>, at }`.
2. **Other families only when warranted** — add `sources` when the content
   derives from identifiable material, `status`/`stale_after` when the
   lifecycle is actually known. Never invent a source, a verifier, or a date.
3. **Index** — if creating a new concept, add it to the relevant `index.md`
   with its title and description.
4. **Log** — if the bundle has a `knowledge-base/log.md`, add an entry
   summarizing the creation/modification under the current date. If it has
   none, skip this step; do not create one unasked.
5. **Hierarchy** — assess the files/folders under `knowledge-base/`; if a
   different hierarchy or subdirectory grouping would be clearer, suggest it
   to the user.

## 9. Validator

`scripts/validate.mjs` in this skill's directory checks a bundle mechanically —
run it by that path, never as a project-relative `scripts/validate.mjs`. Zero
dependencies, Node 18+:

```bash
node <skill-dir>/scripts/validate.mjs [--strict] [--json] <bundle-dir>
```

It parses frontmatter as a strict YAML subset — plain and quoted scalars,
flow `[...]`/`{...}` collections, block lists, and one level of nested block
mapping. Anything outside that subset (block scalars `|`/`>`, anchors,
aliases, tags, deeper nesting, unquoted `: ` in a value) is an `E1`, never a
silent pass.

| Code | Level | Rule |
| --- | --- | --- |
| `E1` | error | Concept has no frontmatter, or it is unparseable (§2) |
| `E2` | error | Concept's `type` is missing or empty (§2.1) |
| `E3` | error | Reserved file breaks its structure — non-root `index.md` with frontmatter, root `index.md` frontmatter beyond `okf_version`, `log.md` with frontmatter or a non-`YYYY-MM-DD` `##` heading (§4) |
| `W1` | warning | Attested Computation without `runtime` (§6) |
| `W2` | warning | `generated` without `by`; a `verified` entry without `by` or `at` (§2.3) |
| `W3` | warning | Datetime without an explicit offset, or `usage_window` not `{ from, to }` (§2.5) |
| `W4` | warning | `status` outside `draft` / `stable` / `deprecated` (§2.4) |
| `W5` | warning | `sources` not a list, or an entry without `resource` (§2.2) |
| `W6` | warning | Actor outside the convention (§7) |
| `W7` | warning | Concept is past its `stale_after` (§2.4) |
| `H1` | warning | File or folder name not kebab-case (§3.1, §3.2) |
| `H2` | warning | Folder holds concepts but has no `index.md` (§3.2) |
| `H3` | warning | Concept not listed in its folder's `index.md` (§4.1) |
| `H4` | warning | Concept has no `generated` — legacy `timestamp` or nothing (§8) |
| `H5` | warning | Bundle-relative or relative link does not resolve, letter case included; links in code and HTML comments are skipped (§5) |

- **Errors** always fail. They are the spec's conformance faults (spec §11 —
  frontmatter parses, `type` is non-empty, reserved files keep their structure)
  plus two restrictions this validator adds: frontmatter outside its YAML
  subset is an `E1` even when it is valid YAML, and a `log.md` with
  frontmatter is an `E3` (house rule, §4.2).
- **`W*` warnings** are faults in the v0.2 families, which the spec treats as
  soft guidance; **`H*` warnings** are this repository's house rules.
- **`--strict`** turns every warning into an error. This repository's
  `npm test` runs it in strict mode against `knowledge-base/`; on a bundle
  that does not follow these house rules, run without it.
- Exit codes: `0` conformant · `1` errors (any warning counts under
  `--strict`) · `2` bad usage.

## 10. Migrating from v0.1

OKF v0.2 superseded v0.1 with two breaking changes; everything else carried
forward. A v0.2 consumer still reads a v0.1 bundle through the fallbacks
below, so a bundle can migrate concept by concept.

| v0.1 | v0.2 | Fallback a consumer may apply |
| --- | --- | --- |
| `timestamp: <datetime>` | `generated: { by: <actor>, at: <datetime> }` | Read `timestamp` when `generated` is absent |
| Body `# Citations` list | `sources` frontmatter + keyed footnotes | Parse a legacy `# Citations` list when `sources` is absent |
| `index.md` never carries frontmatter | Root `index.md` may carry `okf_version` | — |

When migrating a concept, keep its existing `timestamp` value as
`generated.at` — the migration is not a content change — and set
`generated.by` to whoever truly wrote the content. If nobody can say, ask the
user rather than guessing.

## 11. References

- [Open Knowledge Format (OKF) Specification v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md) — normative; last revised 2026-08-21 (explicit-offset datetimes).
- [How the Open Knowledge Format can improve data sharing](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
- [okf.md](https://okf.md/) — community site. Its example root `index.md` carries `title`/`version`/`entries` frontmatter, which the spec forbids (only `okf_version` is allowed); where it disagrees with the spec, follow the spec.
