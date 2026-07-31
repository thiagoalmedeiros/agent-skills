---
type: Guide
title: Getting Started
description: How to install and use the skills in any agent — the universal skills CLI, the manual copy path, and links to per-tool guides.
tags: [setup, getting-started, install]
timestamp: 2026-07-13T18:00:00Z
---

# Getting Started

**agent-skills** is a light, skills-only repository. Every capability
is a plain-Markdown `SKILL.md` under `skills/<name>/SKILL.md` — there are no
agent personas, no slash commands, and no install CLI. Any agent that can read
instruction files can use these skills.

## The universal path — the skills CLI

The open [skills CLI](https://github.com/vercel-labs/skills) installs into 70+
agents with one command:

```bash
npx skills add thiagoalmedeiros/agent-skills            # install all 21 skills
npx skills add thiagoalmedeiros/agent-skills --list     # browse before installing
npx skills add thiagoalmedeiros/agent-skills --skill impl-strategy
```

## The manual path — copy the skills

Skills are just folders. Copy the ones you want into wherever your agent looks
for skills or instructions:

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
cp -R agent-skills/skills/<skill-name> <your-agents-skills-dir>/
```

Each skill's `description` frontmatter is what the agent matches a request
against, so tools that support skill auto-discovery will surface the right one
automatically.

## Native integrations

Prefer a first-class integration? See the per-tool guides:

- [Claude Code](/../README.md#quick-start) — marketplace plugin
- [Cursor](/setup/cursor-setup.md)
- [Antigravity CLI](/setup/antigravity-setup.md)
- [Gemini CLI](/setup/gemini-cli-setup.md)
- [Windsurf](/setup/windsurf-setup.md)
- [OpenCode](/setup/opencode-setup.md)
- [GitHub Copilot](/setup/copilot-setup.md)
- [Codex](/setup/codex-setup.md)

## What's in the catalog

Open [`index.html`](/index.html) in a browser for a visual map of all 20
skills, or browse [`skills/`](/../skills/) directly.
