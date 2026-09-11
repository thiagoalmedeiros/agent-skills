---
type: Repository Structure
title: Repository Structure
description: Top-level folder layout of the skills-only repository.
resource: /
tags: [structure, layout, skills]
timestamp: 2026-09-10T00:00:00Z
---

# Repository Structure

A light, skills-only repository: skills plus the manifests that let each agent
discover them, and a small Node toolchain that validates both. The workflow
phases are skills too — `define`, `build`, `verify`, `review`, and `ship` live in
`skills/` beside the specialist skills they run. There is no install CLI,
release pipeline, or schema/area configuration.

```
agent-skills/
├── skills/            # Source of truth: one folder per skill (SKILL.md + references)
├── scripts/           # validate.mjs (test)
├── package.json       # npm scripts: `validate` and `test` (both run validate.mjs)
├── .claude-plugin/    # Claude Code marketplace + plugin manifests
├── .codex-plugin/     # Codex plugin manifest
├── plugin.json        # Antigravity + VS Code Copilot plugin manifest (repo root)
├── knowledge-base/    # This OKF documentation bundle
│   └── index.html     # Static HTML catalog of the skills
├── AGENTS.md          # Agent instructions
└── README.md          # Project readme
```

`index.html` is a static, self-contained snapshot committed inside the
knowledge base bundle; there is no generator.

Related: [System Architecture](/architecture.md).
