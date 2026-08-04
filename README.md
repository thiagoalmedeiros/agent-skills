# Agentic SDLC Skills

**Production-grade SDLC skills for AI coding agents.**

**Version 1.4.1** · 22 skills · 5 commands · MIT

22 structured skills that encode a full software-delivery workflow — the path
**definition → build → verify → review → ship**, plus security hardening and a
shelf of always-available reference and thinking-aid skills — into steps AI
coding assistants follow consistently. Works with Claude Code, VS Code Copilot, and
any agent that reads the `SKILL.md` format.

Everything is **skill-only**: there are no agent persona definitions and no
install CLI. The repository is just skills plus the manifests that let each
agent discover them.

> 🗺️ **Visual catalog:** open [index.html](knowledge-base/index.html) in a
> browser for a game-style map of the skills.

## Quick Start

**Fastest path — any agent, one command.** The open [skills CLI](https://github.com/vercel-labs/skills) installs into 70+ agents (Claude Code, Cursor, Codex, Copilot, Cline, and more):

```bash
npx skills add thiagoalmedeiros/agent-skills            # install all 22 skills
npx skills add thiagoalmedeiros/agent-skills --list     # browse before installing
```

Or grab individual skills:

```bash
npx skills add thiagoalmedeiros/agent-skills --skill impl-strategy  # structured implementation plans (definition)
npx skills add thiagoalmedeiros/agent-skills --skill code-reviewer       # multi-axis code review (review)
npx skills add thiagoalmedeiros/agent-skills --skill jira-fetch          # pull full Jira ticket details from a URL
```

Prefer a native integration? Pick your tool below.

<details>
<summary><b>Claude Code (recommended)</b></summary>

**Marketplace install:**

```
/plugin marketplace add thiagoalmedeiros/agent-skills
/plugin install agentic-sdlc@agentic-skills
```

> **SSH errors?** The marketplace clones repos via SSH. If you don't have SSH keys set up on GitHub, either [add your SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) or use the full HTTPS URL to force HTTPS cloning during the marketplace-add step:
> ```bash
> /plugin marketplace add https://github.com/thiagoalmedeiros/agent-skills.git
> /plugin install agentic-sdlc@agentic-skills
> ```
>
> If `/plugin install` still fails with `git@github.com: Permission denied (publickey)` on Windows or macOS, the recommended workaround is to configure Git once to rewrite GitHub SSH URLs to HTTPS for subprocess clones:
> ```bash
> git config --global url."https://github.com/".insteadOf git@github.com:
> ```

**Local / development:**

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
claude --plugin-dir /path/to/agent-skills
```

</details>

<details>
<summary><b>Cursor</b></summary>

Put workflow skills under `.cursor/skills/` (sync from `skills/`) and short policies in `.cursor/rules/*.mdc` — do not paste full skills into rules. See [knowledge-base/setup/cursor-setup.md](knowledge-base/setup/cursor-setup.md).

</details>

<details>
<summary><b>Antigravity CLI</b></summary>

Install as a native plugin so skills are auto-discovered. See [knowledge-base/setup/antigravity-setup.md](knowledge-base/setup/antigravity-setup.md).

**Install from the repo:**

```bash
agy plugin install https://github.com/thiagoalmedeiros/agent-skills.git
```

**Install from a local clone:**

```bash
git clone https://github.com/thiagoalmedeiros/agent-skills.git
agy plugin install ./agent-skills
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Install as native skills for auto-discovery, or add to `GEMINI.md` for persistent context. See [knowledge-base/setup/gemini-cli-setup.md](knowledge-base/setup/gemini-cli-setup.md).

**Install from the repo:**

```bash
gemini skills install https://github.com/thiagoalmedeiros/agent-skills.git --path skills
```

**Install from a local clone:**

```bash
gemini skills install ./agent-skills/skills/
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add skill contents to your Windsurf rules configuration. See [knowledge-base/setup/windsurf-setup.md](knowledge-base/setup/windsurf-setup.md).

</details>

<details>
<summary><b>OpenCode</b></summary>

Uses agent-driven skill execution via AGENTS.md and the `skill` tool.

See [knowledge-base/setup/opencode-setup.md](knowledge-base/setup/opencode-setup.md).

</details>

<details>
<summary><b>GitHub Copilot</b></summary>

Install as a native VS Code [agent plugin](https://code.visualstudio.com/docs/copilot/customization/agent-plugins). In VS Code, run **Chat: Install Plugin From Source** (or the **+** on the Plugins page of the Agent Customizations editor) and paste the repo URL:

```
https://github.com/thiagoalmedeiros/agent-skills.git
```

Copilot reads the root `plugin.json` (its native plugin format), which points at the root `skills/` directory (`skills` field) and the root `prompts/` directory (`prompts` field) — so an install delivers both the skills and the `/define`, `/build`, … slash commands. Prefer no plugin? Put skill content in `.github/copilot-instructions.md` instead. See [knowledge-base/setup/copilot-setup.md](knowledge-base/setup/copilot-setup.md).

</details>

<details>
  <summary><b>Kiro IDE & CLI </b></summary>
  Skills for Kiro reside under ".kiro/skills/" and can be stored under Project or Global level. Kiro also supports Agents.md. See Kiro docs at https://kiro.dev/docs/skills/
</details>

<details>
<summary><b>Codex</b></summary>

Install as a native Codex plugin (Codex CLI v0.122+):

```bash
codex plugin marketplace add thiagoalmedeiros/agent-skills
```

Codex reads the root `skills/` directory directly through `.codex-plugin/plugin.json`. Once installed, invoke skills in chat using `@` (e.g., `@impl-strategy`). See [knowledge-base/setup/codex-setup.md](knowledge-base/setup/codex-setup.md) for local installation and troubleshooting.

</details>

<details>
<summary><b>Other Agents</b></summary>

Skills are plain Markdown — they work with any agent that accepts system prompts or instruction files. See [knowledge-base/setup/getting-started.md](knowledge-base/setup/getting-started.md).

</details>

## Using the skills

Open your agent's chat and ask for a skill by name. The workflow skills follow
the implementation path:

- **Definition** — **`jira-fetch`** pulls ticket context; **`grill-me`**
  adversarially stress-tests the approach before it is written down;
  **`impl-strategy`** turns the hardened approach into a
  `plans/<topic>/plan.md` artifact.
- **Build** — write code against the coding standards: **`python-standard`**,
  **`dotnet-csharp-standard`**, **`taskfile-standard`**, and the
  **`angular-components`** / **`angular-state`** / **`angular-ui`** skills.
- **Verify** — **`thomas`** runs every check first-hand; only witnessed
  passing output counts.
- **Review** — **`code-reviewer`** for code health, **`security-and-hardening`**
  to harden against vulnerabilities, **`code-simplification`** for readability
  cleanup, **`objective-advisor`** for reasoning.
- **Ship** — **`docs-sync`** (delegating to **`open-knowledge`** for the
  knowledge base), then **`merge-and-validate`**.

A **shelf** of stage-agnostic skills is available at any point:
**`grill-me`**, **`open-knowledge`**, **`lessons-learned`**,
**`devcontainer-setup`**, **`graphify-setup`**, **`browser-testing`**, and
**`freshness-check`**.

## Commands

Thin slash commands wrap the workflow skills into one entry point per pipeline
phase. A command just composes the relevant skills — the logic lives in the
skills.

| Command | Phase | Invokes |
| --- | --- | --- |
| `/define` | Definition | `jira-fetch` (for a ticket) → `grill-me` → `impl-strategy` |
| `/build` | Build | the coding standard for the files you touch |
| `/verify` | Verify | `thomas` |
| `/review` | Review | `code-reviewer` → `security-and-hardening` → `code-simplification` (+ `objective-advisor`) |
| `/ship` | Ship | `docs-sync` (→ `open-knowledge`) → `merge-and-validate` |

### Recommended model per command

Each command's `description` ends with a model recommendation, shown as a highlight
in that agent's command picker. **Every agent exposes a different model catalog**, so
each command file names only models its own reader can select — Claude Code runs
Claude models only, while Copilot and Antigravity are multi-vendor with different
line-ups. The hint is per-file, never shared:

| File | Read by | Highlight |
| --- | --- | --- |
| `.claude/commands/*.md` | Claude Code | `[Claude: …]` |
| `prompts/*.prompt.md` | VS Code Copilot | `[Copilot: …]` |
| `commands/*.toml` | Antigravity CLI | `[Antigravity: …]` |
| — | Codex | none — no command files, so the table below is its only record |

**Notation.** Every pair reads **cheapest → most expensive**, always in that
direction. **Bold is where to start.** Bold on the left means the right-hand model is
the escalation when it stalls; bold on the right means the left-hand model is the
budget drop for trivial work.

| Command | Claude Code | Codex (effort) | Copilot | Antigravity |
| --- | --- | --- | --- | --- |
| `/define` | Sonnet 5 → **Opus 5** | high → **xhigh** | GPT-5.6 Terra → **GPT-5.6 Sol** | Gemini 3.1 Pro → **Claude Opus 4.6** |
| `/build` | **Sonnet 5** → Opus 5 | **medium** → high | **GPT-5.6 Luna** → GPT-5.3-Codex | **Claude Sonnet 4.6** → Claude Opus 4.6 |
| `/verify` | Haiku 4.5 → **Sonnet 5** | low → **medium** | GPT-5.6 Luna → **GPT-5.6 Terra** | **Gemini 3.5 Flash** → Claude Sonnet 4.6 |
| `/review` | Sonnet 5 → **Opus 5** | high → **xhigh** | **Claude Sonnet 5** → Claude Opus 5 | Claude Sonnet 4.6 → **Claude Opus 4.6** |
| `/ship` | **Haiku 4.5** → Sonnet 5 | **low** → medium | **GPT-5.6 Luna** → GPT-5.6 Terra | **Gemini 3.5 Flash** → Claude Sonnet 4.6 |

Codex is the odd column out: it exposes one coding model (GPT-5.3-Codex) behind a
reasoning-effort dial rather than a model ladder, so it is graded by effort level —
set with `/model` in the Codex CLI.

The reasoning is the same across agents, applied to each catalog: `/define` and
`/review` are the two phases where being wrong is expensive — planning errors
propagate and missed defects ship — so they start on the strongest reasoning model
and drop a tier only for trivial changes. `/build` and `/ship` are high-volume and
mostly routine, so they start cheap and escalate. `/verify` sits between: reading a
failing suite takes more than the bottom tier, so it starts mid and drops only for
trivial batches. **Escalate if the starting model hasn't converged in ~3 turns.**

Two columns start a tier lower than that rule implies, deliberately: Copilot `/review`
(the credit math below makes trying the cheaper model first nearly free) and
Antigravity `/verify` (Gemini 3.5 Flash already clears a routine batch).

This matters most on Copilot, which bills usage-based **AI credits** (1 credit =
$0.01) against input + output tokens — making model choice a direct multiplier on
burn, with a ~40x spread in output rates. Trying the cheap model first is nearly
free: the full escalation chain costs only ~18% more than going straight to the
frontier model, while the common case costs roughly a thirteenth. Inline
completions and Next Edit Suggestions are never billed.

The Claude Code hint lives inline in the source `description`; the other two come
from [scripts/model-hints.json](scripts/model-hints.json) and are substituted at
generation time. Codex ships no command file, so it has no hint entry — the table
above is where its recommendation lives. `npm test` fails if a target is missing a
hint, or if a Claude command file names a non-Claude model.

**Availability by agent:**

- **Claude Code** — committed to `.claude/commands/*.md`; type `/define`, `/build`, … in chat.
- **Antigravity CLI** — committed to `commands/*.toml`; auto-discovered by the plugin.
- **VS Code Copilot** — committed to `prompts/*.prompt.md` as **prompt files** and
  referenced from `plugin.json` via the `prompts` field, so a plugin install delivers
  them alongside the skills; invoke `/define`, `/build`, … in chat.
- **Codex** — no repo commands. Codex custom prompts are deprecated and live only
  in `~/.codex/prompts/` (not shareable via a repo), so Codex users invoke the
  underlying **skills** directly (e.g. `@impl-strategy`) — the commands are
  only thin wrappers over those skills anyway. Its per-phase reasoning effort is
  in the table above.

The Claude `.md` files are the **single source**; the Antigravity `.toml` files
and the Copilot `.prompt.md` files are generated from them. After editing a
command, regenerate:

```bash
npm run commands   # node scripts/generate-commands.mjs
```

## Validating the install paths

`npm test` checks the invariants every agent in the Quick Start depends on —
manifests parse, each manifest's `skills` path resolves to all 22 skills, every
`SKILL.md` has frontmatter whose `name` matches its directory, the commands
exist and are in sync with their generated `.toml` counterparts, every
`skill:<name>` a command invokes resolves to a real skill, and no doc link is
broken.

```bash
npm test           # node scripts/validate.mjs
```

Run it after adding a skill or editing a command — it fails loudly if
`commands/*.toml` drifts out of sync with `.claude/commands/*.md`.

## Skills Catalog (22)

Grouped by the implementation path — **definition → build → verify → review →
ship** — plus the shelf. Two skills are listed twice: `grill-me` and
`open-knowledge` live on the shelf but are also invoked directly by a phase
command (`/define` and `/ship` respectively), so they appear under that phase
as well. The count of 22 is unique skills, not table rows.

### Definition
| Skill | Purpose |
| --- | --- |
| `jira-fetch` | Fetch full Jira ticket details from a URL |
| `grill-me` | Stress-test the approach before it becomes a plan — also on the shelf |
| `impl-strategy` | Structured implementation plans (`plans/<topic>/plan.md`) |

### Build
| Skill | Purpose |
| --- | --- |
| `angular-components` | Component standards and boilerplate (Angular v20, DDD) |
| `angular-state` | Signals + RxJS state management standards |
| `angular-ui` | Template and styling conventions (Tailwind, SCSS) |
| `python-standard` | Canonical Python coding standard (PEP 8/257/484) |
| `dotnet-csharp-standard` | Canonical .NET / C# coding standard |
| `taskfile-standard` | Canonical Taskfile.dev v3 standard |

_No orchestrated implementer skill — the agent writes code directly against these standards._

### Verify
| Skill | Purpose |
| --- | --- |
| `thomas` | Hands-on validation — only witnessed passing output counts |

### Review
| Skill | Purpose |
| --- | --- |
| `code-reviewer` | Multi-axis code review (correctness, readability, architecture, security, performance) |
| `security-and-hardening` | Threat-model and harden against vulnerabilities — OWASP Top 10, input validation, secrets, dependency auditing, LLM security. _By [Addy Osmani](https://github.com/addyosmani), vendored (MIT)_ |
| `code-simplification` | Reduce complexity in working code while preserving exact behavior |
| `objective-advisor` | Objective, bias-hunting advisor mode |

### Ship
| Skill | Purpose |
| --- | --- |
| `docs-sync` | Keep project documentation aligned with code changes |
| `open-knowledge` | The OKF arm of the doc step — `docs-sync` delegates every `knowledge-base/` edit to it |
| `merge-and-validate` | Merge a branch and validate against the Definition of Done |

### Shelf — reference & thinking aids (any stage)
| Skill | Purpose |
| --- | --- |
| `grill-me` | Adversarially stress-test a decision you've already made until it hardens or breaks |
| `open-knowledge` | Read/write docs in the Open Knowledge Format (OKF) |
| `lessons-learned` | Per-plan `lessons.md` lifecycle (init / read / append) |
| `devcontainer-setup` | Set up or audit a `.devcontainer/` environment |
| `graphify-setup` | Install the graphify codebase knowledge graph |
| `browser-testing` | Verify browser-facing changes by driving a real browser interactively |
| `freshness-check` | Validate version-sensitive knowledge against live registries and the current web before acting on it |

## Skill anatomy

Each skill is a directory with a `SKILL.md` file:

```yaml
---
name: docs-sync
version: 1.0.0
description: >
  What the skill does and when the agent should trigger it.
---
```

The body contains the step-by-step workflow the agent follows. A
trigger-rich `description` is what the agent matches a user's request
against, so keep it specific.

## Repository layout

```
agent-skills/
├── skills/               # 22 skills — the heart of the repo (one dir per SKILL.md)
├── .claude/commands/     # Claude Code slash commands (single source, *.md)
├── commands/             # Antigravity CLI commands (*.toml, generated)
├── prompts/              # VS Code Copilot slash commands (*.prompt.md, generated)
├── scripts/              # generate-commands.mjs (commands/ + prompts/ ← .claude/commands/), validate.mjs (npm test)
├── .claude-plugin/       # Claude Code marketplace + plugin manifests
├── .codex-plugin/        # Codex plugin manifest
├── plugin.json           # Root plugin manifest — Antigravity + VS Code Copilot (native format)
├── knowledge-base/       # OKF docs bundle (architecture + setup guides)
│   ├── index.html        # Static visual catalog of the skills
│   └── setup/            # Per-tool setup guides (linked from Quick Start)
├── AGENTS.md             # Agent instructions
└── README.md             # This file
```

## Contributing

Skills must be **specific** (actionable steps), **verifiable** (clear
exit criteria), and **minimal** (only necessary guidance). Author the
skill under `skills/<name>/SKILL.md` with `name`, `version`, and a
trigger-rich `description` in the frontmatter — that's the whole
contribution. See the [architecture overview](knowledge-base/architecture.md)
for the design and [knowledge-base/](knowledge-base/index.md) for the full
documentation bundle.

## License

MIT

## Credits & attribution

The whole idea of this repository is to give an agent the experience of a
complete, **end-to-end SDLC** — definition → build → verify → review → ship —
and security hardening is a first-class part of that loop.

The **[`security-and-hardening`](skills/security-and-hardening/SKILL.md)** skill
in the catalog above is **not authored here**. It is by
**[Addy Osmani](https://github.com/addyosmani)** and vendored verbatim from
[`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) —
included as a first-class skill in this collection to round out the end-to-end
experience, and invoked by `/review`. The upstream project is the source of
truth.

That same upstream collection also ships **`code-simplification`** and a
browser-testing counterpart, **`browser-testing-with-devtools`** — the analogues
of this repo's [`code-simplification`](skills/code-simplification/SKILL.md) and
[`browser-testing`](skills/browser-testing/SKILL.md) skills — so those two are
expected to track the upstream versions as well. The remaining skills are
original to this repo.
