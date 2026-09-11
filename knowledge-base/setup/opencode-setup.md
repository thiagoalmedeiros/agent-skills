---
type: Setup Guide
title: OpenCode Setup
description: Use the skills in OpenCode via AGENTS.md and the skill tool.
tags: [setup, integration, opencode]
timestamp: 2026-07-12T16:30:00Z
---

# OpenCode Setup

OpenCode runs skills through agent-driven execution: it reads `AGENTS.md` for
project instructions and can load a `SKILL.md` on demand via its `skill` tool.

## Setup

1. Make the skills available in your project:

   ```bash
   git clone https://github.com/thiagoalmedeiros/agent-skills.git
   cp -R agent-skills/skills ./skills
   # or: npx skills add thiagoalmedeiros/agent-skills
   ```

2. Point OpenCode at them from your project `AGENTS.md`, for example:

   ```markdown
   ## Skills
   Skills live under `skills/<name>/SKILL.md`. Load the matching skill with the
   `skill` tool before starting a task — e.g. `impl-strategy` for planning,
   `code-reviewer` for review, or `thomas` for validation.
   ```

## Use

Ask OpenCode to run a skill by name; it loads the corresponding `SKILL.md` and
follows the workflow. Because each skill declares a `description`, you can also
let the agent choose the right skill for the task at hand.
