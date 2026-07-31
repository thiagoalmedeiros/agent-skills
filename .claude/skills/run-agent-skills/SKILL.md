---
name: run-agent-skills
description: Build, validate, and drive the agentic-sdlc skills plugin. Use when asked to run or test this repo, validate the skills, regenerate commands/prompts, or verify the plugin actually loads in Claude Code.
---

This repo is not a server or app — it's a multi-target agent-skills **plugin**
(Claude Code, Codex, Antigravity, Copilot). "Running" it means proving the
plugin loads and its skills fire in a real Claude Code session. Drive it via
`.claude/skills/run-agent-skills/smoke.sh`, which chains every check below.

All paths are relative to the repo root. No `npm install` is ever needed —
the scripts use `node:` builtins only.

## Prerequisites

- Node ≥ 22 (verified with v22.22.0)
- `claude` CLI ≥ 2.1.207 on PATH, authenticated (only for steps 2–4 of the smoke)

## Build

`commands/*.toml` (Antigravity) and `prompts/*.prompt.md` (Copilot) are
byte-faithful projections of `.claude/commands/*.md`. After editing any
command source:

```bash
npm run commands   # regenerates both; validate fails if they're stale
```

## Run (agent path)

```bash
.claude/skills/run-agent-skills/smoke.sh                # full, ~1-2 min
SKIP_E2E=1 .claude/skills/run-agent-skills/smoke.sh     # offline, ~5 s, no tokens
```

| step | what it proves |
|---|---|
| 1. `node scripts/validate.mjs` | repo invariants: manifests parse, frontmatter valid, regen in sync, `skill:` refs + doc links resolve |
| 2. `claude plugin validate .` | marketplace manifest parses for the real consumer |
| 3. `claude --plugin-dir . plugin details agentic-sdlc` | the **local tree** registers all skills + commands (`Source: agentic-sdlc@inline`) |
| 4. headless E2E | a live `claude -p` session (haiku, `--allowedTools Skill`) loads a probe skill via the Skill tool and echoes its first heading |

`PROBE_SKILL=<name>` changes which skill steps 3–4 probe (default
`security-and-hardening`). Step 4 spends one small model call and needs auth.

To inspect the local tree's inventory and projected token cost directly:

```bash
claude --plugin-dir . plugin details agentic-sdlc
```

## Run (human path)

Install from the marketplace and use the skills in any session — the README's
Quick Start covers per-agent install. On this machine it's already installed
at user scope as `agentic-sdlc@agentic-skills` (check: `claude plugin list`).

## Test

```bash
npm test   # alias for node scripts/validate.mjs — 7 groups, all must pass
```

Expected: `✓ All checks passed — 21 skills and 5 commands load correctly for
every documented agent.` (counts grow as skills are added).

## Gotchas

- **The installed plugin lags the working tree.** `claude plugin details
  agentic-sdlc` (without `--plugin-dir`) inventories the copy installed from
  GitHub — it was missing `security-and-hardening` while the local tree had
  it. Always test local changes with `--plugin-dir .`.
- **`--plugin-dir` is a global flag.** `claude --plugin-dir . plugin details
  agentic-sdlc` works; `claude plugin details agentic-sdlc --plugin-dir .`
  fails with `error: unknown option`. A bare path (`claude plugin details ./`)
  fails too — the positional arg is a plugin *name*.
- **Root `commands/` is not for Claude Code.** It's the Antigravity TOML
  projection. Claude Code reads `.claude/commands/*.md` because the manifest
  sets `"commands"` — `claude plugin list` even prints a note that the default
  `commands/` folder is ignored.
- **Commands count as skills in the inventory.** `Skills (26)` = 21
  `skills/*/SKILL.md` + 5 commands. Don't treat 26 ≠ 21 as a bug.
- **Working inside this repo you see doubles** — e.g. both `/build` (project
  `.claude/commands/`) and `/agentic-sdlc:build` (installed plugin). Expected.

## Troubleshooting

- **`Plugin "./" not found`**: you passed a path to `plugin details`. Use
  `claude --plugin-dir . plugin details agentic-sdlc`.
- **`commands/<name>.toml is STALE — run: node scripts/generate-commands.mjs`**
  (from validate): a `.claude/commands/*.md` was edited without regenerating.
  Run `npm run commands` and commit the diff.
- **Smoke step 4 hangs or errors on auth**: there's no `timeout` on macOS to
  cap it; Ctrl-C and rerun with `SKIP_E2E=1`, or `claude /login` first.
