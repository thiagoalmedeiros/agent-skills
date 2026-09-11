---
type: Setup Guide
title: Cursor Setup
description: Install the skills in Cursor — sync them into .cursor/skills/ and keep rules short.
tags: [setup, integration, cursor]
timestamp: 2026-07-12T16:30:00Z
---

# Cursor Setup

Cursor reads two kinds of context you care about here:

- **Skills** — `.cursor/skills/<skill-name>/SKILL.md`: full step-by-step
  workflows. Cursor uses each skill's `description` frontmatter to decide when
  to apply it, so discovery is automatic.
- **Rules** — `.cursor/rules/*.mdc`: short, always-on or globbed policies.

Keep the two separate: **do not paste full `SKILL.md` bodies into rules** — that
duplicates `.cursor/skills/` and wastes context.

## Sync the skills

Treat this repo as a read-only upstream and sync skills inward:

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
mkdir -p .cursor/skills
rsync -a --delete agent-skills/skills/ .cursor/skills/
```

Or copy just the skills you want:

```bash
cp -R agent-skills/skills/impl-strategy .cursor/skills/
```

The skills CLI can do this for you too:

```bash
npx skills add thiagoalmedeiros/agent-skills
```

## Add a routing rule (optional)

Instead of many always-on rules, add one short `.cursor/rules/skills.mdc` that
points Cursor at `.cursor/skills/` and lets it pick the matching skill by
`description`.

## Verify

Open **Settings → Rules & Skills** and confirm the synced skills appear. If a
skill doesn't show, check that its `SKILL.md` has valid `name`/`description`
frontmatter.
