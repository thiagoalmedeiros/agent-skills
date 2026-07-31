---
type: Setup Guide
title: Gemini CLI Setup
description: Install the skills in Gemini CLI natively, or reference them from GEMINI.md context.
tags: [setup, integration, gemini]
timestamp: 2026-07-12T16:30:00Z
---

# Gemini CLI Setup

Gemini CLI can install the skills natively for auto-discovery, or you can point
persistent context at them from `GEMINI.md`.

## Install from the repo

`skills/` is the source directory in this repo, so install with `--path skills`:

```bash
gemini skills install https://github.com/thiagoalmedeiros/agent-skills.git --path skills
```

## Install from a local clone

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
gemini skills install ./agent-skills/skills/
```

## Persistent context (alternative)

If you'd rather always load a few skills, reference them from `GEMINI.md`:

```markdown
# Project context
Follow the workflow in skills/impl-strategy/SKILL.md when planning changes.
```

## Verify

In the Gemini CLI, list the installed skills:

```
/skills list
```

Each skill's `description` frontmatter drives when Gemini applies it, so keep
`SKILL.md` frontmatter intact when copying files by hand.
