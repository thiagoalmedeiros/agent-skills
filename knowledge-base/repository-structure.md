---
type: Repository Structure
title: Repository Structure
description: Top-level folder layout of the skills-only marketplace repository.
resource: /
tags: [structure, layout, skills]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-06T12:58:02Z }
---

# Repository Structure

A light, skills-only plugin marketplace: a root marketplace manifest, one folder
per plugin under `plugins/`, and a small Node toolchain that validates both. The
workflow phases are skills too — `define`, `build`, `verify`, `review`, and
`ship` live in `plugins/agentic-sdlc/skills/` beside the specialist skills they run. There is no install CLI,
release pipeline, or schema/area configuration.

```
agent-skills/
├── .claude-plugin/
│   └── marketplace.json   # Marketplace manifest — lists each plugin under plugins/
├── plugins/
│   └── agentic-sdlc/      # The agentic-sdlc plugin
│       ├── .claude-plugin/plugin.json  # Claude Code plugin manifest
│       ├── .codex-plugin/plugin.json   # Codex plugin manifest
│       ├── plugin.json                 # Antigravity + VS Code Copilot plugin manifest
│       └── skills/                     # Source of truth: one folder per skill (SKILL.md + references)
├── scripts/           # validate.mjs (test)
├── tests/             # node:test suites + fixture bundles (test)
├── package.json       # npm scripts: `validate` (validate.mjs) and `test` (validate.mjs + node --test)
├── knowledge-base/    # This OKF documentation bundle
│   └── index.html     # Static HTML catalog of the skills
├── AGENTS.md          # Agent instructions
└── README.md          # Project readme
```

`index.html` is a static, self-contained snapshot committed inside the
knowledge base bundle; there is no generator.

Related: [System Architecture](/architecture.md).
