---
type: Setup Guide
title: Codex Setup
description: Install the skills in Codex as a native plugin that reads the root skills/ directory.
tags: [setup, integration, codex]
timestamp: 2026-07-13T18:00:00Z
---

# Codex Setup

Codex installs this repository as a native plugin. The
[`.codex-plugin/plugin.json`](/../.codex-plugin/plugin.json) manifest points
Codex at the root `skills/` directory (`"skills": "./skills/"`).

## Marketplace install (Codex CLI v0.122+)

```bash
codex plugin marketplace add thiagoalmedeiros/agent-skills
```

## Local install

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
codex plugin marketplace add ./agent-skills
```

## Use

Once installed, invoke a skill in chat with `@`:

```
@impl-strategy plan a change
@code-reviewer      review a diff
@jira-fetch         pull a Jira ticket
```

## Troubleshooting

- **`codex plugin` unrecognized** — update to Codex CLI v0.122 or later.
- **Skills not listed** — confirm `.codex-plugin/plugin.json` resolves
  `./skills/` to the 20 skill folders, then re-run the marketplace add.
