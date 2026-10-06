---
type: Setup Guide
title: Antigravity CLI Setup
description: Install the skills in the Antigravity CLI as a native plugin.
tags: [setup, integration, antigravity]
generated: { by: human:thiagomedeiros, at: 2026-09-10T00:00:00Z }
---

# Antigravity CLI Setup

Antigravity installs the `agentic-sdlc` plugin from this marketplace repository
as a native plugin. The plugin lives in `plugins/agentic-sdlc/`: its
[`plugin.json`](/../plugins/agentic-sdlc/plugin.json) manifest declares the plugin, and
Antigravity auto-discovers the skills under `plugins/agentic-sdlc/skills/`.

> This plugin ships `SKILL.md` workflows only — including the `define`,
> `build`, `verify`, `review`, and `ship` phase skills. It does **not** ship
> command files or subagent personas.

`agy plugin install` treats the repository's `plugins/` folder as a bulk
plugins directory and installs every plugin in it, so both commands below point
at the repository itself.

## Install from the repo

```bash
agy plugin install https://github.com/thiagoalmedeiros/agent-skills.git
```

## Install from a local clone

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
agy plugin install ./agent-skills
```

To install only this plugin from a clone, point `agy` at its folder:
`agy plugin install ./agent-skills/plugins/agentic-sdlc`.

## Use

Once installed, the skills are available to the agent and activate based on
each skill's `description`. Skills also become slash commands in `agy`: type `/`
and pick one — for example the `define` phase skill — to invoke it manually.
List installed plugins with:

```bash
agy plugin list
```

## Troubleshooting

- **Plugin not found** — make sure you passed the full `.git` URL (or a valid
  local path) and that you have network/SSH access to GitHub. `agy` takes a
  directory or an `https` URL; it rejects `file://` URLs.
- **Skills not loading** — confirm `skills/<name>/SKILL.md` files exist in the
  installed plugin and that each has valid frontmatter.
