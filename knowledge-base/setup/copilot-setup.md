---
type: Setup Guide
title: GitHub Copilot Setup
description: Install the skills in VS Code Copilot as a native agent plugin from the repo URL, or use them as workspace instructions.
tags: [setup, integration, github-copilot]
timestamp: 2026-07-13T18:00:00Z
---

# GitHub Copilot Setup

VS Code Copilot installs this repository as a native
[agent plugin](https://code.visualstudio.com/docs/copilot/customization/agent-plugins).
The root [`plugin.json`](/../plugin.json) manifest is Copilot's own plugin
format, and it points Copilot at the root `skills/` directory
(`"skills": "./skills/"`) — the same manifest Antigravity reads.

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
local clone. VS Code clones the repo and installs the plugin.

## Install from a local clone

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
```

Then run **Chat: Install Plugin From Source** and give it the `file:///` path to
the clone.

## Use

Once installed, the skills are available to Copilot's agent and activate based
on each skill's `description`. You can also point Copilot Chat at a specific
workflow with `#file:skills/impl-strategy/SKILL.md`.

## Slash commands (prompt files)

The `/define`, `/build`, `/verify`, `/review`, and `/ship` commands ship as
Copilot [prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
under [`prompts/`](/../prompts/) (`*.prompt.md`), invoked with `/<name>` in
Copilot Chat.

The root [`plugin.json`](/../plugin.json) references that folder with a `prompts`
field alongside `skills`:

```json
{
  "skills": "./skills/",
  "prompts": "./prompts/"
}
```

so installing the plugin delivers the commands together with the skills — just
invoke `/<name>` in Copilot Chat once the plugin is installed.

The prompt files are generated from the Claude Code command sources
(`.claude/commands/*.md`) — the same single source the Antigravity `commands/*.toml`
files come from. After editing a command source, regenerate:

```bash
node scripts/generate-commands.mjs
```

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
cp -R agent-skills/skills ./skills
# or: npx skills add thiagoalmedeiros/agent-skills
```

## Troubleshooting

- **Skills not loading** — Copilot detects the plugin format by checking, in
  order, `.plugin/plugin.json`, the root `plugin.json`,
  `.github/plugin/plugin.json`, then `.claude-plugin/plugin.json`. This repo is
  detected via the root `plugin.json`; confirm it declares
  `"skills": "./skills/"` and that `skills/<name>/SKILL.md` files exist with
  valid frontmatter.
- **Plugin not found** — make sure you passed the full `.git` URL (or a valid
  local path) and that you have network/SSH access to GitHub.
- **Review before installing** — plugins can ship hooks and MCP servers that run
  code on your machine. This repo ships neither; it is skills-only.
