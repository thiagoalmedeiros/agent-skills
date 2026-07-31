# Agentic SDLC Wizard — Knowledge Base

This is the Open Knowledge Format (OKF) documentation bundle for the
**agent-skills** repository: a light, skills-only catalog of workflows
for AI coding agents, plus the manifests that let each agent discover them.

For a visual, clickable overview open [`index.html`](/index.html) in this
bundle (a static catalog of the skills).

## Concepts

- [System Architecture](/architecture.md) — components and how agents discover the skills.
- [Repository Structure](/repository-structure.md) — top-level folder layout of the skills-only repository.
- [SKILL.md Template](/skill-template.md) — canonical copy-paste template for a `SKILL.md` file.

## Directories

- [Setup](/setup/index.md) — per-tool guides for installing and using the skills (Claude Code, Cursor, Codex, and more).
- [Resources](/resources/index.md) — external research papers (arXiv) relevant to agent skills, harnesses, and multi-agent systems.

The skills themselves are **not** duplicated into this bundle. Each skill is
documented by its own `SKILL.md` under [`skills/`](/../skills/) (the source of
truth), and all skills are browsable in the visual catalog
([`index.html`](/index.html)).

## Housekeeping

- [Update History](/log.md) — chronological log of changes to this bundle.
