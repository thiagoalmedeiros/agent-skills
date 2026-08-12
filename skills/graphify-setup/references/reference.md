# Graphify Setup — Full Reference

> The complete check, update, configure, and review flows for the
> `graphify-setup` skill. `SKILL.md` is the lean process that points here;
> this file holds every command, path, and safety rule.

You are a developer-experience expert. Bring this project's graphify wiring
to a known-good state so the AI coding assistant can navigate the codebase
through a persistent knowledge graph.

This skill is an **orchestrator and conformance checker**, not an executor.
Everything runnable belongs to the `graphify` CLI or to the vendored
`/graphify` skill. The value added here is running the four steps in order,
knowing which commands are real, and reporting the end state.

---

## Source of truth

**The installed CLI is the only authority.** Read
`graphify/__main__.py` inside the installed package when a command is in
doubt. The project's GitHub README advertises commands and platforms that
the shipped dispatch table does not contain; it is marketing, not
documentation. Never emit a command that cannot be traced to a dispatch
branch in that file.

The PyPI package is **`graphifyy`** (double-y). The single-y `graphify` on
PyPI is an unrelated package — never install it. The CLI binary and the
import module are both spelled `graphify` (single-y).

### Commands that do not exist

| Claimed | Reality |
| --- | --- |
| A bare path argument to `graphify` | Dispatch has no path fallthrough — it errors `unknown command '.'` and exits 1. See [Handing off the graph build](#handing-off-the-graph-build). |
| `graphify update` | Not in dispatch. Upgrade through the package manager — Step 2. |
| `graphify extract` | An internal module, not a subcommand. |
| `graphify --version` | Only `-h` and `--help` are matched at the top level. Read the version from disk — Step 1. |
| Any `install` flag other than `--platform` | Silently discarded, **and the install still runs**. See below. |

---

## Probe safety — read before running anything

**`graphify install <anything>` performs a real global install.** The
argument loop matches only `--platform=X` and `--platform X`; every other
token is discarded by an `else: i += 1` branch, and the install then runs
unconditionally with the default platform. All of these install for real:

```
graphify install --help
graphify install -h
graphify install --dry-run
graphify install --anything-at-all
```

**The operating rule: never append a flag to a `graphify` subcommand.**
Other subcommands merely reject unknown arguments with exit 1, but `install`
is the single exception — and it is also the most destructive. Treat the
rule as absolute rather than memorising which subcommands are forgiving.

Only two invocations are genuinely read-only and safe to probe:

| Probe | Why it is safe |
| --- | --- |
| `graphify`, `graphify -h`, `graphify --help` | Prints usage and returns before the command argument is read. |
| `graphify hook status` | Only reads `.git/hooks/*`. |

Nearly every other invocation runs a stale-version check first, so even
`hook status` may print unrelated `warning: skill is from graphify X,
package is Y` lines. That is a print, not a write.

---

## Step 1 — CHECK

Establish whether graphify exists, how it was installed, and how stale it is.
Nothing here modifies the machine.

1. **On PATH?** `command -v graphify`. If absent, the one-time global
   install is a prerequisite — proceed to Step 3's install matrix after
   installing the package with the user's package manager of choice
   (`pipx install graphifyy`, `uv tool install graphifyy`, or
   `pip3 install graphifyy`).
2. **Install method** — `readlink -f "$(command -v graphify)"`. The resolved
   path names the installer, which in turn dictates the upgrade command:

   | Path signature | Method | Upgrade command |
   | --- | --- | --- |
   | `…/pipx/venvs/graphifyy/…` | pipx | `pipx upgrade graphifyy` |
   | `…/uv/tools/graphifyy/…` | uv | `uv tool upgrade graphifyy` |
   | system or venv `site-packages` | pip | `pip install -U graphifyy` |

3. **Package version** — there is no CLI flag for it. Read it from the
   distribution metadata beside the resolved binary, or use the detected
   installer's own listing (`pipx list`, `uv tool list`, `pip show graphifyy`).
4. **Skill-file version** — `.graphify_version` sits beside each installed
   `SKILL.md` (e.g. `~/.claude/skills/graphify/.graphify_version`). It records
   the package version **at the moment the skill file was copied**, not the
   current one. A mismatch against the package version is the signal that the
   platform install must be re-run. The CLI's own stale-version warning reports
   every platform except Gemini — read
   `~/.gemini/skills/graphify/.graphify_version` yourself when Gemini is in use.
5. **Existing project wiring** — check for a graphify reference in
   `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/graphify.mdc`,
   `.graphifyignore`, and `graphify hook status`. This determines how much of
   Step 3 is a re-sync rather than a first-time setup.

Python 3.10+ is a hard prerequisite. If `python3 --version` reports less than
that, stop and point the user at https://www.python.org/downloads/.

---

## Step 2 — UPDATE

Upgrade the package with the command Step 1 resolved. Skip only when the
installed version already matches the latest available.

**After any upgrade, re-run the platform install from Step 3.** Upgrading the
package does not touch the vendored `SKILL.md` files already copied into the
home directory; they and their `.graphify_version` stamps stay at the old
version until the install is re-run. This is exactly the drift the stale
version warning reports.

---

## Step 3 — CONFIGURE / RE-SYNC

### 3a. Detect the assistants in use

| Signal | Assistant |
| --- | --- |
| `.claude/` or `CLAUDE.md` | Claude Code |
| `.codex/` or `AGENTS.md` | Codex |
| `.github/copilot-instructions.md`, or Copilot is the active IDE | GitHub Copilot |
| `.cursor/` | Cursor |
| `GEMINI.md` or `.gemini/` | Gemini CLI |
| `opencode.json` or `.opencode/` | OpenCode |
| `.aider*` | Aider |

Configure every assistant detected, not just the first. When none is
detectable, ask the user rather than guessing.

### 3b. Install per assistant

Two halves exist and **both are usually required**:

- The **global skill copy** — `graphify install [--platform P]` writes a
  vendored `SKILL.md` plus a `.graphify_version` stamp under the home
  directory. It writes no project wiring.
- The **project wiring** — `graphify <platform> install` writes the
  instruction-file section and hooks into the current directory. It copies no
  skill file.

`gemini` is the sole command that does both.

| Assistant | Global skill copy | Project wiring |
| --- | --- | --- |
| Claude Code | `graphify install` → `~/.claude/skills/graphify/SKILL.md`, plus a registration block in `~/.claude/CLAUDE.md` | `graphify claude install` → `./CLAUDE.md` + `.claude/settings.json` PreToolUse hook |
| Windows variant | `graphify install --platform windows` → same destination as Claude Code | `graphify claude install` |
| Codex | `graphify install --platform codex` → `~/.agents/skills/graphify/SKILL.md` | `graphify codex install` → `./AGENTS.md` + `.codex/hooks.json` |
| OpenCode | `graphify install --platform opencode` → `~/.config/opencode/skills/graphify/SKILL.md` | `graphify opencode install` → `./AGENTS.md` + `.opencode/plugins/graphify.js` + `opencode.json` |
| Aider | `graphify install --platform aider` → `~/.aider/graphify/SKILL.md` | `graphify aider install` → `./AGENTS.md` |
| OpenClaw / Droid / Trae / Trae CN | `graphify install --platform claw\|droid\|trae\|trae-cn` → `~/.claw/`, `~/.factory/`, `~/.trae/`, `~/.trae-cn/` respectively | `graphify claw\|droid\|trae\|trae-cn install` → `./AGENTS.md` |
| GitHub Copilot | `graphify copilot install` → `~/.copilot/skills/graphify/SKILL.md` | none from the CLI — write the instructions file by hand, see 3c |
| Gemini CLI | `graphify gemini install` → `~/.gemini/skills/graphify/SKILL.md` | same command → `./GEMINI.md` + `.gemini/settings.json` BeforeTool hook |
| Cursor | none — no global skill file exists for Cursor | `graphify cursor install` → `.cursor/rules/graphify.mdc` |

Three traps in that table are worth stating outright:

- **`install --platform cursor` crashes** with a `TypeError` — the internal
  call omits the required project directory. Always use
  `graphify cursor install`, which passes it correctly. It fails before
  touching any file, so it errors cleanly rather than half-installing.
- **`install --platform gemini` also writes project files** into the current
  working directory — the only `--platform` value that is not purely global.
  Prefer `graphify gemini install`, and run it from the project root either way.
- **There is no standalone `windows` subcommand.** That platform is reachable
  only through `install --platform windows`, and it shares Claude Code's
  destination.
- **Gemini's staleness is invisible to the CLI.** `gemini install` writes a
  `.graphify_version` stamp like every other platform, but `~/.gemini/` is the
  one skill directory absent from the internal platform config the stale-version
  scan iterates. Gemini therefore drifts silently — compare its stamp by hand in
  Step 1.

**Do not derive the platform roster from `graphify --help` alone.** Three
rosters exist in the source and they disagree: the help text's `--platform`
line lists 11 and omits `copilot`, while the config plus special cases accepts
12. `copilot` is a first-class platform — `graphify copilot install` and
`install --platform copilot` are equivalent, and both work.

Codex additionally needs `multi_agent = true` under `[features]` in
`~/.codex/config.toml` for parallel extraction. Tell the user; do not edit
their global Codex config without asking.

### 3c. Copilot's project integration

The CLI's `copilot` support is the global skill copy only. The project-side
always-on integration has no CLI equivalent, so write it by hand into
`.github/copilot-instructions.md`, which Copilot loads in every chat session:

```markdown
## graphify

This project has a graphify knowledge graph at `graphify-out/`.

Rules:
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files
- The graph is rebuilt automatically by the post-commit and post-checkout git hooks — do not rebuild it by hand
```

Create `.github/` if it does not exist. If the file already exists,
**append** the block; never overwrite. Skip entirely if a `## graphify`
section is already present.

### 3d. Project-scoped wiring

These apply to every assistant and are the skill's own responsibility — no
`graphify` command creates either one. They are not equally optional, though:
the `.gitignore` entry is pure convention, but `.graphifyignore` is a real
input format that graphify parses with `.gitignore`-style ancestor discovery
and honours during extraction. Creating it shapes what lands in the graph.

1. **`.graphifyignore`** at the project root, `.gitignore` syntax. Keep it
   minimal — exclude only what adds noise without signal:

   ```
   node_modules/
   dist/
   build/
   .git/
   .venv/
   __pycache__/
   *.generated.*
   graphify-out/
   ```

   Adjust to the project's real build artefacts and vendored directories.

2. **`.gitignore`** — add `graphify-out/` so generated artefacts stay
   uncommitted.

3. **Git hooks** — `graphify hook install` from the project root. It writes
   marker-delimited blocks into `.git/hooks/post-commit` and
   `.git/hooks/post-checkout`, appending to existing hooks rather than
   clobbering them. `post-commit` rebuilds after any code change;
   `post-checkout` rebuilds on branch switches, and only when `graphify-out/`
   already exists. Hooks are local and never committed — tell the user each
   teammate must run this themselves.

4. **Devcontainer** — only when `.devcontainer/` exists. Add the package to
   `.devcontainer/Dockerfile` after the base image, alongside other global
   tooling:

   ```dockerfile
   RUN pip3 install graphifyy
   ```

   Fold it into an existing `pip3` step if one is present, to keep the image
   lean. Do **not** add any `graphify install` or `graphify hook install`
   line to the Dockerfile — those touch the assistant environment and the git
   directory, and belong to the developer after the container starts. Tell the
   user the image needs a rebuild. See `skill:devcontainer-setup` for the
   surrounding conventions.

### No-clobber rules

`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and `.github/copilot-instructions.md`
are user-owned files that may hold unrelated content. The CLI appends
marker-delimited sections to the first three; anything this skill writes by
hand must do the same. Never overwrite one, never reorder it, and skip the
write entirely when a `## graphify` section is already present. All
configuration files belong at the **project root**.

### Never call `_rebuild_code` directly

The graph rebuild lives in a **private** function, `graphify.watch._rebuild_code`.
The git hooks from step 3d already call it on every commit and branch switch,
which is the supported path.

Note the tension deliberately: graphify itself writes a
`python3 -c "from graphify.watch import _rebuild_code; …"` line into the
`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and Cursor rule sections it installs.
This skill diverges from that on purpose — a private function pinned into a
project's instruction file is exactly the kind of upstream detail that breaks
silently on upgrade. State the cost honestly rather than claiming equivalence:
the vendor's line refreshes mid-session, the hook only on commit, so a long run
of uncommitted edits leaves the graph a commit behind. A bounded staleness
window is the accepted price; a silently broken private import is not. Leave
the vendor's own sections as written; just do not add the call anywhere else,
and do not run it by hand.

---

## Step 4 — REVIEW

Nothing is finished until the user has seen what changed. Enumerate every
file touched, separated by scope, because the two behave very differently.

**Global — written once per machine, under the home directory:**

- `~/<platform-skill-dir>/SKILL.md` and its sibling `.graphify_version`, for
  each platform installed. The prefix varies per platform and is not uniform —
  most are `~/<dir>/skills/graphify/`, but Aider's is `~/.aider/graphify/` with
  no `skills` segment. Take the exact path from the matrix in 3b.
- `~/.claude/CLAUDE.md` — a registration block, for the Claude and Windows
  platforms only

**Project — written per repository:**

- `./CLAUDE.md`, `./AGENTS.md`, `./GEMINI.md`
- `.claude/settings.json`, `.codex/hooks.json`, `.gemini/settings.json`
- `.opencode/plugins/graphify.js`, `opencode.json`
- `.cursor/rules/graphify.mdc`
- `.github/copilot-instructions.md`
- `.git/hooks/post-commit`, `.git/hooks/post-checkout`
- `.graphifyignore`, the `.gitignore` entry, and later `graphify-out/`

Present each as ✅ configured or ⚠️ missing, with the specific change needed.
When re-syncing an existing setup, ask which gaps to fix before touching
anything, and preserve everything not flagged.

### Disclose: the global install cannot be undone by the CLI

`graphify install` has **no uninstall counterpart**. Skill-file removal exists
for exactly two platforms — `copilot uninstall` and `gemini uninstall`.
Nothing in the CLI removes `~/.claude/skills/graphify/SKILL.md` or its
equivalents.

`graphify claude uninstall` is not the reversal, for two independent reasons:
it targets `CLAUDE.md` in the *current directory* rather than `~/.claude/`,
and it anchors on a `## graphify` heading while `install` writes a `# graphify`
one. It reports "nothing to do" and exits cleanly, which reads as success.

Real cleanup is manual:

```
rm -rf ~/.claude/skills/graphify/
# then hand-edit ~/.claude/CLAUDE.md — check first whether it pre-existed
```

Say this out loud during review whenever a global install happened in this
session. A user who believes the install is reversible will discover otherwise
at the worst moment.

### Handing off the graph build

**This skill does not build the graph.** The CLI has no graph-building
subcommand at all.

- **First build** — the user types `/graphify` in their assistant, which
  invokes the vendored skill. The CLI's own success message prints that
  slash command with a trailing path argument; it is a slash command *for the
  assistant*, not a shell command. Typed at a terminal it errors with
  `unknown command`.
- **Incremental rebuilds** — the git hooks, automatically. They refresh
  `graph.json` and `GRAPH_REPORT.md` only.

A completed build produces `graphify-out/graph.html` (interactive),
`graphify-out/GRAPH_REPORT.md` (god nodes and communities), and
`graphify-out/graph.json` (queryable). Only the last two stay current on their
own — `graph.html` is written by the vendored skill's full build and goes stale
until the next one, so re-run `/graphify` when the picture matters. Querying the
result, `save-result`, and `benchmark` all belong to the vendored skill, not here.

---

## See also

- `skill:devcontainer-setup` — the devcontainer conventions step 3d plugs into.
- `skill:freshness-check` — for re-verifying that upstream still matches what
  this reference claims.
