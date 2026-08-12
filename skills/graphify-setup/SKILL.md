---
name: graphify-setup
version: 2.0.0
description: >
  Bring a project's graphify wiring to a known-good state so an AI coding
  assistant can navigate the codebase through a persistent knowledge graph —
  checking the install, updating it, configuring or re-syncing every
  assistant in use, then reporting every file touched. Delegates to the
  installed graphify CLI rather than reimplementing it.
  USE FOR: first-time graphify setup for a project, updating an existing
  graphify install, re-syncing project wiring that an upgrade left stale,
  adding another AI assistant to a project that already has graphify, or
  auditing a graphify configuration for gaps.
  DO NOT USE FOR: building the knowledge graph itself (the vendored
  /graphify skill owns that), querying an existing graph, general
  knowledge-graph theory, or non-graphify tools.
argument-hint: "Optional: a platform override such as 'codex'; by default every assistant in the project is auto-detected"
---

# Graphify Setup

## Overview

Bring this project's graphify wiring to a known-good state across four
steps — check, update, configure, review. This skill is an **orchestrator
and conformance checker**, not an executor: everything runnable belongs to
the `graphify` CLI or to the vendored `/graphify` skill, and the value added
here is running the steps in order, knowing which commands are real, and
reporting the end state. Every command, path, and safety rule lives in
[references/reference.md](references/reference.md). **Prime directive: the
installed CLI is the only source of truth — never append a flag to a
`graphify` subcommand, and never build the graph yourself.**

## When to Use

- Setting up graphify in a project for the first time.
- Updating an existing install, and re-syncing what the upgrade left stale.
- Adding another AI assistant to a project that already has graphify.
- Auditing an existing graphify configuration for gaps.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: CHECK — is graphify present, and how stale?

Read-only. Confirm `graphify` is on PATH, resolve the install method with
`readlink -f` (pipx / uv / pip — it dictates the upgrade command), read the
package version from disk, and compare it against the `.graphify_version`
stamp beside each installed skill file. Absence of the binary means the
one-time global install is a prerequisite, not a per-repo step. Python 3.10+
is required.

### Step 2: UPDATE — upgrade, then re-run the platform install

Upgrade with the installer Step 1 resolved. **Upgrading is not enough on its
own:** the vendored `SKILL.md` files already copied into the home directory
stay at the old version until the platform install from Step 3 is re-run.
That drift is exactly what the CLI's stale-version warning reports.

### Step 3: CONFIGURE — install per assistant, then wire the project

Detect every assistant in use and configure all of them. Each needs two
halves — the **global skill copy** (`graphify install [--platform P]`) and
the **project wiring** (`graphify <platform> install`); only `gemini` does
both in one command. Take the exact command and destination for each
assistant from the reference's matrix — the platforms are not
interchangeable. Then the project-scoped wiring the CLI does not own:
`.graphifyignore`, `graphify-out/` in `.gitignore`, `graphify hook install`,
and the devcontainer if one exists.

### Step 4: REVIEW — report every file touched, then hand off the build

Nothing is finished until the user has seen what changed. Enumerate every
file written, separated into global (once per machine, under the home
directory) and project (per repository) — the two behave very differently.
State plainly that the CLI cannot undo a global install. Then hand the graph
build to the user: they type `/graphify` in their assistant; the git hooks
handle every rebuild after that.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "`graphify .` builds the graph." | No such command — the dispatch has no path fallthrough, so it errors `unknown command '.'`. That string is a slash command for the *assistant*, not a shell command. The CLI has no graph-building subcommand at all. |
| "`graphify install --project` scopes it to this repo." | There is no such flag. `install` silently discards every flag except `--platform`, then installs globally anyway. |
| "The README lists it, so it exists." | The README advertises commands and platforms the installed dispatch table does not contain. Read `__main__.py` in the installed package; nothing else is authoritative. |
| "`--help` is safe to probe with." | `graphify install --help` performs a real global install. Only top-level `graphify --help` and `graphify hook status` are read-only. |
| "`graphify claude uninstall` undoes the global install." | It reverses `graphify claude install` — the project half — and nothing more. Against the global install it reads `CLAUDE.md` in the current directory rather than `~/.claude/`, and anchors on `## graphify` where the global install writes `# graphify`. No CLI command removes the global skill copy; that cleanup is manual. |

## Red Flags

- Any `graphify` subcommand invoked with a flag appended to it.
- Upgrading the package and stopping there, leaving stale vendored skill files.
- Deriving the platform roster from `graphify --help` — it omits `copilot`.
- Reaching for `install --platform cursor` (crashes) or `install --platform gemini` (writes project files into the working directory) instead of the standalone form.
- Running `_rebuild_code` by hand, or instructing the user to.
- Finishing without listing what was written, or implying the global install is reversible.

## Verification

- [ ] Install method resolved from `readlink -f`, and the `.graphify_version` stamp compared against the package version.
- [ ] If the package was upgraded, the platform install was re-run afterwards.
- [ ] Every detected assistant has both halves — global skill copy and project wiring.
- [ ] `.graphifyignore` created, `graphify-out/` git-ignored, git hooks installed, devcontainer wired if one exists.
- [ ] Every file written was listed by scope, with the manual-cleanup caveat stated if a global install happened this session.
- [ ] No `graphify` subcommand was run with a flag, and the graph build was handed to `/graphify`.

## See Also

- `skill:devcontainer-setup` — runs alongside Step 3 when the project has a `.devcontainer/`.
- `skill:freshness-check` — run it before trusting this skill's CLI facts; graphify's command surface changes between releases.
