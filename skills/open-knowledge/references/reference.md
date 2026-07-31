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

## 3. Reserved Filenames

### 3.1 `index.md` (Directory Listing)

- Used for **progressive disclosure** so humans and agents explore directory contents without opening every file.
- MUST NOT contain YAML frontmatter.
- MUST list the concepts in its directory using standard markdown links and their `description` values.
- Links should use **bundle-relative paths** (starting with `/`, relative to `knowledge-base/`), e.g. `[System Architecture](/architecture.md)`.

### 3.2 `log.md` (Update History)

- Captures chronological modifications to the bundle, newest first.
- Uses date-grouped headers `## YYYY-MM-DD`.
- Format: `* **<Action>**: Short description referencing the [Concept](/path)`. Action is typically `Creation`, `Update`, or `Migration`.

## 4. Cross-Linking

Concepts link to other concepts to build a relationship graph:

- **Absolute bundle-relative links** (recommended): start with `/`, relative to the `knowledge-base/` root (e.g. `[Architecture](/architecture.md)`).
- **Relative links**: standard markdown paths (e.g. `[Lessons](./lessons.md)`).

## 5. Update obligations

Whenever creating or updating documentation:

1. **Timestamp** — update the concept's `timestamp` frontmatter to the current ISO 8601 time.
2. **Index** — if creating a new concept, add it to the relevant `index.md` with its title and description.
3. **Log** — add a `knowledge-base/log.md` entry summarizing the creation/modification under the current date.
4. **Hierarchy** — assess the files/folders under `knowledge-base/`; if a different hierarchy or subdirectory grouping would be clearer, suggest it to the user.

## 6. References

- [Open Knowledge Format (OKF) Specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- [How the Open Knowledge Format can improve data sharing](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
