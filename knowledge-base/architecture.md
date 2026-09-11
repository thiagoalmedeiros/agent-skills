---
type: System Architecture
title: System Architecture
description: Components and how agents discover the skills in this repository.
tags: [architecture, skills, plugins]
timestamp: 2026-09-10T00:00:00Z
---

# System Architecture

The **agent-skills** repository is a **skills catalog** for AI coding
agents: a collection of `SKILL.md` workflows plus the manifests that let each
agent discover them. It is a single self-contained repository with no install
CLI, no build step, and no schema or area/plugin configuration. See
[Repository Structure](/repository-structure.md) for the folder layout.

## Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| Skills | `skills/` | Source of truth; one folder per skill with a `SKILL.md`. |
| Phase skills | `skills/define`, `build`, `verify`, `review`, `ship` | One entry-point skill per workflow phase; each runs that phase's specialist skills in order. |
| Claude Code manifests | `.claude-plugin/` | `marketplace.json` + `plugin.json`; installs the repo as one plugin. |
| Codex manifest | `.codex-plugin/` | `plugin.json`; exposes root `skills/` to Codex. |
| Antigravity + Copilot manifest | `plugin.json` | Root plugin manifest; exposes `skills/` to the Antigravity CLI and VS Code Copilot. |
| Knowledge base | `knowledge-base/` | This OKF documentation bundle. |
| Visual catalog | `knowledge-base/index.html` | Static, self-contained page for browsing the skills. |
| Toolchain | `scripts/` | `validate.mjs` (`npm test`). |

## Install Model

There is no install CLI; agents read the skills directly.

- **Claude Code** loads `skills/` via `.claude-plugin/` (a marketplace plugin
  whose `source` is the repo root).
- **Codex** loads `skills/` via `.codex-plugin/plugin.json`.
- **Antigravity** and **VS Code Copilot** load `skills/` via the root
  `plugin.json`.
- **The open skills CLI** (`npx skills add`) and other agents read the root
  `skills/` directory or copy it into their own skills folder.

Per-tool guides live under [Setup](/setup/index.md). Skills are documented by
their own `SKILL.md` and are not duplicated into the knowledge base.
