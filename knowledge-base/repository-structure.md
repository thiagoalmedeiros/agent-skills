---
type: Repository Structure
title: Repository Structure
description: Top-level folder layout of the skills-only repository.
resource: /
tags: [structure, layout, skills]
timestamp: 2026-07-13T16:18:22Z
---

# Repository Structure

A light, skills-only repository: skills plus the manifests that let each agent
discover them. There is no install CLI, build step, release pipeline, test
suite, or schema/area configuration.

```
agent-skills/
├── skills/            # Source of truth: one folder per skill (SKILL.md + references)
├── .claude-plugin/    # Claude Code marketplace + plugin manifests
├── .codex-plugin/     # Codex plugin manifest
├── plugin.json        # Antigravity plugin manifest (repo root)
├── knowledge-base/    # This OKF documentation bundle
│   └── index.html     # Static HTML catalog of the skills
├── AGENTS.md          # Agent instructions
└── README.md          # Project readme
```

`index.html` is a static, self-contained snapshot committed inside the
knowledge base bundle; there is no generator.

Related: [System Architecture](/architecture.md).
