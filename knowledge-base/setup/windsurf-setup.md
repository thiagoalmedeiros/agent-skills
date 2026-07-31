---
type: Setup Guide
title: Windsurf Setup
description: Use the skills in Windsurf via workspace rules and Cascade memories.
tags: [setup, integration, windsurf]
timestamp: 2026-07-12T16:30:00Z
---

# Windsurf Setup

Windsurf doesn't have a dedicated skills directory, so add the skill content to
your Windsurf **rules** configuration (Cascade memories / workspace rules).

## Recommended approach

1. Clone the repo (or install via the skills CLI) so you have the `SKILL.md`
   files locally:

   ```bash
   git clone https://github.com/thiagoalmedeiros/agent-skills.git
   # or: npx skills add thiagoalmedeiros/agent-skills
   ```

2. For each workflow you want always available, add a **workspace rule** that
   references or inlines the relevant `skills/<name>/SKILL.md`. Keep rules
   focused — add the one or two skills you use most rather than all 19, to
   avoid context bloat.

3. For everything else, keep the cloned `skills/` in the workspace and ask
   Cascade to follow a specific `SKILL.md` by path when you need it.

## Tips

- Prefer a short pointer rule ("when planning, follow
  `skills/impl-strategy/SKILL.md`") over pasting entire skill bodies into
  always-on rules.
- Skills are plain Markdown, so they render and diff cleanly inside Windsurf.
