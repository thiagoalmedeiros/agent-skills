---
type: Setup Guide
title: GitHub Copilot Setup
description: Install the skills in VS Code Copilot as a native agent plugin from the repo URL, or use them as workspace instructions.
tags: [setup, integration, github-copilot]
generated: { by: human:thiagomedeiros, at: 2026-09-10T00:00:00Z }
---

# GitHub Copilot Setup

VS Code Copilot installs the `agentic-sdlc` plugin from this repository as a native
[agent plugin](https://code.visualstudio.com/docs/copilot/customization/agent-plugins).
The repository is a marketplace: Copilot reads
[`.claude-plugin/marketplace.json`](/../.claude-plugin/marketplace.json), which
lists the plugin at `./plugins/agentic-sdlc`. That folder's
[`plugin.json`](/../plugins/agentic-sdlc/plugin.json) is Copilot's own plugin format, and it
points Copilot at the plugin's `skills/` directory (`"skills": "./skills/"`) —
the same manifest Antigravity reads.

> This repo is **skills-only** — it does not ship Copilot agent personas (there
> is no `agents/` directory). Copilot loads the `SKILL.md` workflows and
> activates them based on each skill's `description`.

## Install from the repo URL

In VS Code, run **Chat: Install Plugin From Source** from the Command Palette
(or the **+** button on the Plugins page of the Agent Customizations editor) and
paste the repository URL:

```
https://github.com/thiagoalmedeiros/agent-skills.git
```

Copilot accepts several URL forms: the `owner/repo` shorthand
(`thiagoalmedeiros/agent-skills`), a full HTTPS `.git` URL, an SSH URL
(`git@github.com:thiagoalmedeiros/agent-skills.git`), or a `file:///` path to a
local clone. VS Code clones the repo, finds the marketplace, and installs the
plugin it lists.

## Install from a local clone

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
```

Then run **Chat: Install Plugin From Source** and give it the `file:///` path to
the clone.

## Use

Once installed, the skills are available to Copilot's agent and activate based
on each skill's `description`. You can also point Copilot Chat at a specific
workflow with `#file:plugins/agentic-sdlc/skills/impl-strategy/SKILL.md`.

## Phase skills

The workflow phases ship as ordinary skills — `define`, `build`, `verify`,
`review`, and `ship` — so the plugin install delivers them with the rest. In
Copilot Chat, type `/` and choose `/agentic-sdlc:define` (or `build`, `verify`,
…): skills distributed through a plugin are prefixed with the plugin name.

## Alternative: workspace instructions

If you prefer not to install the plugin, reference the workflows you use most
from `.github/copilot-instructions.md`:

```markdown
# Copilot instructions
When planning a change, follow skills/impl-strategy/SKILL.md.
When reviewing, follow skills/code-reviewer/SKILL.md.
```

Keep that file short — link to skills rather than pasting whole `SKILL.md`
bodies. Make the skills available in the workspace with:

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
cp -R agent-skills/plugins/agentic-sdlc/skills ./skills
# or: npx skills add thiagoalmedeiros/agent-skills
```

## Troubleshooting

- **Skills not loading** — Copilot first looks for a marketplace file
  (`marketplace.json`, `.plugin/marketplace.json`,
  `.github/plugin/marketplace.json`, then `.claude-plugin/marketplace.json`) and
  only falls back to a single plugin at the repository root when it finds none.
  This repo is detected via `.claude-plugin/marketplace.json`; confirm it lists
  `./plugins/agentic-sdlc`, that `plugins/agentic-sdlc/plugin.json` declares `"skills": "./skills/"`, and that
  `skills/<name>/SKILL.md` files exist with valid frontmatter.
- **Plugin not found** — make sure you passed the full `.git` URL (or a valid
  local path) and that you have network/SSH access to GitHub.
- **Review before installing** — plugins can ship hooks and MCP servers that run
  code on your machine. This repo ships neither; it is skills-only.
