---
type: System Architecture
title: System Architecture
description: Components and how agents discover the skills in this repository.
tags: [architecture, skills, plugins]
generated: { by: human:thiagomedeiros, at: 2026-09-10T00:00:00Z }
---

# System Architecture

The **agent-skills** repository is a **skills catalog** for AI coding
agents, published as a **plugin marketplace**: the repository root holds the
marketplace manifest, and each plugin lives in its own folder under `plugins/`.
Today the marketplace lists one plugin, `agentic-sdlc` — a collection of
`SKILL.md` workflows plus the manifests that let each agent discover them. There
is no install CLI, no build step, and no schema or area configuration. See
[Repository Structure](/repository-structure.md) for the folder layout.

## Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| Marketplace manifest | `.claude-plugin/marketplace.json` | Lists every plugin in the repo by its folder under `plugins/`; read by Claude Code, Codex, VS Code Copilot, Copilot CLI, and the skills CLI. |
| Plugin | `plugins/agentic-sdlc/` | The `agentic-sdlc` plugin: its skills plus one manifest per agent. |
| Skills | `plugins/agentic-sdlc/skills/` | Source of truth; one folder per skill with a `SKILL.md`. |
| Phase skills | `plugins/agentic-sdlc/skills/define`, `build`, `verify`, `review`, `ship` | One entry-point skill per workflow phase; each runs that phase's specialist skills in order. |
| Claude Code manifest | `plugins/agentic-sdlc/.claude-plugin/plugin.json` | Plugin name and version for Claude Code. |
| Codex manifest | `plugins/agentic-sdlc/.codex-plugin/plugin.json` | Exposes the plugin's `skills/` to Codex. |
| Antigravity + Copilot manifest | `plugins/agentic-sdlc/plugin.json` | Exposes the plugin's `skills/` to the Antigravity CLI and VS Code Copilot. |
| Knowledge base | `knowledge-base/` | This OKF documentation bundle. |
| Visual catalog | `knowledge-base/index.html` | Static, self-contained page for browsing the skills. |
| Toolchain | `scripts/` | `validate.mjs` (`npm test`). |

## Install Model

There is no install CLI; agents read the skills directly. Plugin manifests live
only inside the plugin folder — never at the repository root, where a tool that
treats the root as the plugin would find no skills.

- **Claude Code** reads `.claude-plugin/marketplace.json`, follows the
  `agentic-sdlc` entry's `source` to `./plugins/agentic-sdlc`, and loads its `skills/`.
- **Codex** reads the same marketplace file, then loads the plugin's
  `skills/` via `plugins/agentic-sdlc/.codex-plugin/plugin.json`.
- **VS Code Copilot** reads the same marketplace file, then the plugin's
  `plugin.json`.
- **Antigravity** treats `plugins/` as a bulk plugins directory and installs
  each plugin folder in it, reading its `plugin.json`.
- **The open skills CLI** (`npx skills add`) follows the marketplace file to
  `plugins/agentic-sdlc/skills/`; other agents read that directory or copy it into their own skills
  folder.

### Adding a plugin

Create `plugins/<name>/` with its own `skills/` and the three manifests (copy
them from `plugins/agentic-sdlc/`), then add a `{ "name": "<name>", "source": "./plugins/<name>" }`
entry to `.claude-plugin/marketplace.json` — `npm test` fails on a `plugins/`
folder the marketplace does not list, or an entry with no folder behind it.

Per-tool guides live under [Setup](/setup/index.md). Skills are documented by
their own `SKILL.md` and are not duplicated into the knowledge base.
