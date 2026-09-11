# Open Knowledge Format (OKF) — Full Reference

> The full OKF v0.1 bundle structure, concept format, reserved-file
> rules, and cross-linking conventions for the `open-knowledge` skill.
> `SKILL.md` is the lean process that points here.

## 1. Bundle Structure

The project's documentation bundle is rooted in the `knowledge-base/` folder:

```
knowledge-base/
├── index.md                      # Bundle Root Index (progressive disclosure)
├── log.md                        # Global Update History (changelog)
├── <concept>.md                  # Concept documents at the root
└── <subdirectory>/               # Subdirectories for concept groups
    ├── index.md                  # Subdirectory-level index
    └── <concept>.md              # Subdirectory-level concepts
```

## 2. Concept Files

Every documentation file except the reserved `index.md` and `log.md` is a **Concept**.

### 2.1 YAML frontmatter

Each concept starts with a YAML frontmatter block delimited by `---`:

```yaml
---
type: <Type name>                  # REQUIRED (e.g., System Architecture, Lessons Learned, Checklist)
title: <Display name>              # RECOMMENDED (human-readable title)
description: <One-line summary>    # RECOMMENDED (single sentence overview)
resource: <Canonical URI>          # OPTIONAL (canonical URI of the asset; omit for abstract concepts)
tags: [<tag>, <tag>, ...]          # OPTIONAL (semantic classification tags)
timestamp: <ISO 8601 datetime>     # RECOMMENDED (e.g., 2026-06-22T16:15:00-06:00)
---
```

### 2.2 Concept body

Standard Markdown following semantic heading hierarchies (`#`, `##`, `###`) with descriptive
prose, tables, or lists.

## 3. Naming

File and folder names are part of the format: a bundle whose names follow one
convention is navigable by name alone.

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

- Used for **progressive disclosure** so humans and agents explore directory contents without opening every file.
- MUST NOT contain YAML frontmatter.
- MUST list the concepts in its directory using standard markdown links and their `description` values.
- Links should use **bundle-relative paths** (starting with `/`, relative to `knowledge-base/`), e.g. `[System Architecture](/architecture.md)`.

### 4.2 `log.md` (Update History)

- **Optional per bundle.** A bundle may omit a changelog entirely; when it
  does, the update obligation in §6.3 does not apply. The name stays
  reserved either way. When a bundle has one, every rule below binds.
- Captures chronological modifications to the bundle, newest first.
- Uses date-grouped headers `## YYYY-MM-DD`.
- Format: `* **<Action>**: Short description referencing the [Concept](/path)`. Action is typically `Creation`, `Update`, or `Migration`.

## 5. Cross-Linking

Concepts link to other concepts to build a relationship graph:

- **Absolute bundle-relative links** (recommended): start with `/`, relative to the `knowledge-base/` root (e.g. `[Architecture](/architecture.md)`).
- **Relative links**: standard markdown paths (e.g. `[Lessons](./lessons.md)`).

## 6. Update obligations

Whenever creating or updating documentation:

1. **Timestamp** — update the concept's `timestamp` frontmatter to the current ISO 8601 time.
2. **Index** — if creating a new concept, add it to the relevant `index.md` with its title and description.
3. **Log** — if the bundle has a `knowledge-base/log.md`, add an entry summarizing the creation/modification under the current date. If it has none, skip this step; do not create one unasked.
4. **Hierarchy** — assess the files/folders under `knowledge-base/`; if a different hierarchy or subdirectory grouping would be clearer, suggest it to the user.

## 7. References

- [Open Knowledge Format (OKF) Specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- [How the Open Knowledge Format can improve data sharing](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
