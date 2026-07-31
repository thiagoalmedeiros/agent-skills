---
name: graphify-setup
version: 1.0.0
description: >
  Install and configure graphify so an AI coding assistant can navigate
  the codebase via a persistent knowledge graph — across Claude Code,
  Codex, and Copilot, with git hooks and optional devcontainer wiring.
  USE FOR: first-time graphify setup for a project, or auditing an
  existing graphify configuration for missing pieces.
  DO NOT USE FOR: general knowledge-graph theory, non-graphify tools, or
  building application features on top of the graph.
argument-hint: "Optional: which AI platform(s) to configure (defaults to auto-detecting Claude Code / Codex / Copilot)"
---

# Graphify Setup

## Overview

Set up [graphify](https://github.com/safishamsi/graphify) so the AI
assistant navigates the codebase through a knowledge graph, configuring
whichever platforms are in use and keeping the graph fresh via git hooks.
The full new-setup steps, per-platform commands, and audit flow live in
[references/reference.md](references/reference.md). **Prime directive:
verify Python 3.10+ before doing anything, detect and configure every AI
platform in use, and remember the PyPI package is `graphifyy`
(double-y) — `graphify` on PyPI is an unrelated package.**

## When to Use

- Setting up graphify for a project for the first time.
- Auditing an existing graphify configuration for gaps.
- Adding graphify support for an additional AI platform (Claude Code, Codex, Copilot).

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: DETECT — mode and prerequisites

Check whether graphify is already configured (a graphify reference in
`CLAUDE.md`, `AGENTS.md`, `.graphifyignore`, or `.git/hooks/post-commit`).
Verify Python 3.10+ (`python3 --version`); if it is missing, stop, tell
the user, and link https://www.python.org/downloads/. Choose the New
Setup or Audit flow accordingly.

### Step 2: CONFIGURE — run the chosen flow

Follow the selected flow from
[references/reference.md](references/reference.md). **New setup:** install
`graphifyy`, detect the AI platform(s), install the skill + always-on
integration for each, install git hooks, create `.graphifyignore`, wire
the devcontainer if one exists, and add `graphify-out/` to `.gitignore`.
**Audit:** read each configuration component, present findings (✅ / ⚠️),
let the user select fixes, and apply only those — preserving unflagged
configuration.

### Step 3: BUILD & VERIFY — produce the initial graph

For a new setup, run `graphify .` to build the first graph and confirm it
produces `graphify-out/graph.html`, `GRAPH_REPORT.md`, and `graph.json`.
Remind the user that git hooks are local and teammates must run
`graphify hook install` themselves.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "`pip install graphify` is the package." | That's an unrelated package. The PyPI name is `graphifyy` (double-y); the CLI is still `graphify`. |
| "Only Claude Code needs configuring." | Configure every detected platform — Copilot reads the skill from `.claude/skills/` even without Claude Code. |
| "I'll skip the Python check." | Graphify needs Python 3.10+. Verify it first, or setup fails downstream. |
| "The hooks are committed, teammates are covered." | Git hooks are local and uncommitted — each teammate runs `graphify hook install`. |

## Red Flags

- Installing `graphify` instead of `graphifyy`.
- Proceeding without confirming Python 3.10+.
- Configuring only one platform when several are in use.
- Running `graphify install --platform copilot` (targets the wrong, legacy directory).

## Verification

- [ ] Python 3.10+ confirmed before any install.
- [ ] Every detected AI platform configured (skill + always-on integration).
- [ ] Git hooks installed; `.graphifyignore` created; `graphify-out/` git-ignored.
- [ ] Initial graph built — `graphify-out/` contains `graph.html`, `GRAPH_REPORT.md`, `graph.json`.
- [ ] Audit mode: only user-selected fixes applied; existing config preserved.
