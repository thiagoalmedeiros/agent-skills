# Taskfile Standard (Taskfile.dev v3) — Full Reference

> The complete normative standard applied by the `taskfile-standard`
> skill. `SKILL.md` is the lean process that points here; this file
> holds every rule it enforces. See [cheatsheet.md](cheatsheet.md) for
> the at-a-glance digest and [links.md](links.md) for authoritative
> sources.

The single source of truth for writing and reviewing Taskfile.dev v3
files in this project. Use it both when **authoring** new Taskfiles
and when **reviewing** existing ones.

## Purpose

Provide one authoritative, version-aware specification for go-task's
Taskfile schema so an agent can:

- Generate `Taskfile.yml` (and included partials) that follow the
  official schema, the recommended layout, and basic security
  hygiene.
- Review existing Taskfiles and produce a structured report citing
  the violated rule.

## When to Use

- The user asks to create, refactor, or review a `Taskfile.yml`,
  `Taskfile.dist.yml`, or any file `include`d by one.
- The user asks "is this a good Taskfile?" or "is this idiomatic?".
- A PR adds or changes task definitions.

Do **not** use this skill for:

- GNU Make, npm scripts, Just, Mage, or shell-only task runners.
- Choosing whether to adopt go-task in the first place.

## Mode Determination

Before proceeding:

1. **Check input type.** If the provided file is not a Taskfile.dev v3 document (e.g. a Makefile, GitHub Actions workflow, or any non-go-task file), respond: "This file is not a Taskfile.dev v3 document; this skill does not apply." and stop.
2. **Select mode:**
   - **Authoring mode** — user asks to create, write, or refactor a Taskfile → follow the Generation Procedure and output only the Taskfile YAML.
   - **Review mode** — user asks to review, audit, check, or validate a Taskfile → follow the Review Procedure and output only the Output Format report.

## Universal Principles

These principles anchor every section that follows.

1. **Schema first.** Use `version: '3'` and the documented keys.
   Unknown keys are a smell.
2. **Tasks are contracts.** A task has a name, a stable behavior, and
   visible inputs/outputs. Hidden side effects are forbidden.
3. **Idempotent + cacheable.** Whenever a task produces files, declare
   `sources:` and `generates:`. If it should run only when its inputs
   change, set `method: checksum` (default) or `method: timestamp`.
4. **No silent failure.** Default shell is `set -e`-equivalent — keep
   it that way; never paper over errors with `|| true` without a
   comment.
5. **Composable, not monolithic.** Prefer many small named tasks
   wired together via `deps:` and `cmds: - task: <name>` over one
   long shell block.
6. **Quote everything user-supplied.** Treat `{{.VAR}}` like shell
   `$VAR`: quote it unless you have a documented reason not to.

## Design Principles — DRY & SOLID

Every Taskfile this skill generates or approves must respect these
principles. Reviews must flag violations as a `Composition` or
`Maintainability` finding.

### DRY (Don't Repeat Yourself)

- Shared values live once in top-level `vars:` / `env:` — never
  copy-pasted across `cmds:`.
- Repeated command sequences become their own named task and are
  invoked via `cmds: - task: <name>` (or via `deps:`).
- Cross-task helpers live in `scripts/*.sh` and are called from
  multiple tasks — not re-written inline in each task.
- Repeated `sources:` / `generates:` globs become reusable vars:
  `GO_SOURCES: ['**/*.go', 'go.mod', 'go.sum']`.
- Settings shared across multiple Taskfiles (e.g. lint config
  paths, image tags) belong in an included Taskfile.
- If the same 3+ line command sequence or identical glob list appears in 3+ tasks, extract it to a shared task or var.

### SOLID (adapted for tasks)

- **Single Responsibility.** A task does one thing. If `desc:`
  needs the word "and", split it into two tasks composed by a
  third.
- **Open/Closed.** Extend behavior by adding new tasks, includes,
  or overriding `vars:` at the call site — never by editing the
  body of a stable task. Aggregate tasks (`…:all`) stay extensible
  by appending to their `deps:` / `cmds:` lists.
- **Liskov Substitution.** Any task invoked as `task: <name>` must
  honor the same contract regardless of the namespace it lives in:
  same expected vars, same artifact location, same exit-code
  semantics. A `tests:unit:all` must behave like every other
  `…:all` aggregate.
- **Interface Segregation.** Keep included Taskfiles focused: one
  namespace per file (`tests/Taskfile.yml`, `docker/Taskfile.yml`).
  Consumers include only the namespaces they actually use.
- **Dependency Inversion.** Tasks depend on **variables**, not on
  hard-coded paths or tool versions. `BUILD_DIR`, `IMAGE_TAG`,
  `GO_VERSION` are inputs to the task; callers override them via
  CLI or higher-level vars without editing the task body.

## Standards & Conventions

### File layout

```yaml
version: "3"

vars:
  PROJECT_NAME: my-project
  BUILD_DIR: ./build

env:
  CGO_ENABLED: "0"

includes:
  docker: ./build/docker/Taskfile.yml

tasks:
  default:
    desc: List available tasks.
    cmds:
      - task --list

  build:
    desc: Build the binary.
    sources:
      - "**/*.go"
    generates:
      - "{{.BUILD_DIR}}/{{.PROJECT_NAME}}"
    cmds:
      - "go build -o {{.BUILD_DIR}}/{{.PROJECT_NAME}} ./cmd/..."
```

Rules:

- Top-level key order: `version`, `output`, `method`, `silent`, `run`,
  `vars`, `env`, `dotenv`, `includes`, `interval`, `tasks`. Stick to
  this order; omit keys that are not needed.
- One task per concept. If the `cmds:` block exceeds 15 shell lines
  (excluding metadata keys), extract it to a script under `scripts/`
  or split into sub-tasks.
- 2-space indentation, no tabs.
- Always single-quote any scalar value containing `{{`.
- File must end with a trailing newline.

### Naming

| Element        | Style                   | Example         |
| -------------- | ----------------------- | --------------- |
| Task names     | `kebab-case`            | `build:image`   |
| Namespacing    | `colon:separated`       | `docker:build`  |
| Variables      | `UPPER_SNAKE_CASE`      | `BUILD_DIR`     |
| Includes alias | `kebab-case` short noun | `docker`, `web` |

Reserve `default` for the entry point that runs when `task` is
invoked with no arguments — it should list tasks or run the most
common workflow.

### Semantic grouping (namespaces)

Group related tasks under a shared **colon-separated namespace** so
the task list reads like a tree, `task --list` is browsable, and
shell tab-completion narrows results as the user types. Treat the
namespace as a noun (the domain), the next segment as a sub-domain
or scope, and the final segment as a verb or selector.

Pattern: `<domain>:<sub-domain>:<verb-or-scope>`

Examples:

```text
tests:unit:all
tests:unit:watch
tests:integration:all
tests:integration:smoke
tests:e2e:all

build:api
build:web
build:all

lint:js
lint:py
lint:all

docker:build
docker:push
docker:run

db:migrate:up
db:migrate:down
db:seed
```

Rules:

- Pick a noun for the top-level segment (`tests`, `build`, `lint`,
  `docker`, `db`, `deploy`) — never a verb.
- Use one consistent segment depth per domain; do not mix
  `tests:unit` and `tests:integration:all` under the same domain.
- Provide an aggregate `…:all` task per group that fans out via
  `deps:` (parallel) or `cmds: - task: <name>` (sequential, when
  order matters). Document which it is in the `desc:`.
- Provide a top-level alias task (`tests`, `build`) that runs the
  most common workflow for the group — usually `…:all`. Use
  `aliases: [test, t]` when an even shorter form is helpful.
- When a group grows past ~5 tasks, move it into its own included
  Taskfile under the matching alias (`includes: { tests: ./tests/Taskfile.yml }`)
  so the namespace and the file system mirror each other.
- Use the same verb vocabulary across groups: `all`, `watch`,
  `clean`, `up`, `down`. Consistency lets users guess task names.
- Do **not** namespace one-off tasks (`clean`, `format`) that are
  not part of a group — flat names beat fake hierarchies.

### Required task fields

Every non-trivial task should declare:

- `desc:` — one short sentence, capitalized, ends with a period.
  This is what `task --list` shows.
- `summary:` — multi-line longer doc (optional but encouraged for
  user-facing tasks).
- `cmds:` — the commands to run.

Internal helpers may set `internal: true` so they do not appear in
`task --list`.

### Variables, env, and precedence

Precedence (high → low, per the official docs):

1. CLI: `task build VAR=value`
2. Task-level `vars:` / `env:`
3. Top-level `vars:` / `env:`
4. `.env` files referenced via `dotenv:`

Rules:

- Never read shell env directly inside `cmds:` — declare it under
  `env:` so the dependency is visible and overridable.
- `dotenv:` files belong at the top level. Document them in `desc:`.
- Dynamic variables use `sh:`; keep them short:
  `VERSION: { sh: git describe --tags --always }`.

### Dependencies, deps vs. cmds-as-task

- `deps:` runs in **parallel**. Use only when steps are independent.
- Sequential composition uses `cmds: - task: <name>`.
- A task that has both `deps:` and `cmds:` runs deps first, then cmds.
- Do not rely on side effects between parallel deps.

### Sources, generates, and caching

- For any task that produces artifacts, declare both `sources:` and
  `generates:`.
- Use globs (`**/*.go`) rather than listing files.
- `method:` defaults to `checksum`; only switch to `timestamp` when
  checksums are expensive and timestamps are reliable.
- Use `status:` for tasks whose "up-to-date" check is a shell
  command (e.g. "is the binary newer than HEAD?").
- Use `preconditions:` to block execution with a clear message
  when an invariant fails (`msg:` is required).

### Includes

- Always alias each include (`docker:`, `web:`) — never include
  without an alias.
- Included Taskfiles live under a sub-directory next to what they
  build (e.g. `build/docker/Taskfile.yml`), not in the repo root.
- Set `internal: true` on helper tasks in included files unless they
  are meant to be called directly via `task docker:build`.

## Documentation

- Every public task has `desc:`. Tasks without `desc:` should set
  `internal: true`.
- The top of `Taskfile.yml` may have a YAML comment block
  describing project conventions and any non-obvious flags.
- Cross-reference long-running or destructive tasks in the project
  `README.md`.

## Type / Schema Discipline

- Declare `version: '3'` (quoted string).
- If the file declares `version: 2` or omits `version:` entirely,
  flag as a Critical Schema finding and recommend migration to v3
  before continuing the review.
- Stick to documented keys: `version`, `output`, `method`, `silent`,
  `run`, `vars`, `env`, `includes`, `dotenv`, `interval`, `tasks`.
- Inside a task: `desc`, `summary`, `aliases`, `sources`,
  `generates`, `status`, `preconditions`, `requires`, `deps`,
  `cmds`, `env`, `vars`, `dir`, `silent`, `interactive`, `internal`,
  `method`, `prefix`, `ignore_error`, `run`, `platforms`, `set`,
  `shopt`, `label`.
- Validate the file with `task --list-all` and (optionally) the
  taskfile JSON schema in your editor.

## Code Quality & Best Practices

- Prefer the standalone `task: <name>` form to invoking another task
  via shell (`task other-task`) — the former participates in the
  caching/dependency graph.
- Move multi-line shell into a real script (`scripts/foo.sh`) and
  call it. The Taskfile should orchestrate, not host program logic.
- `silent: true` only on truly noisy steps; default visibility helps
  users understand what is happening.
- `ignore_error: true` requires a comment explaining why.
- Cross-platform tasks declare `platforms: [linux, darwin]` rather
  than relying on shell-specific behavior.
- Use `requires:` to fail fast when a needed variable is unset.

## Security

- Never interpolate untrusted input into shell without quoting:
  `cmd: 'echo "{{.USER_INPUT}}"'`, not `cmd: echo {{.USER_INPUT}}`.
- Do not commit secrets in `vars:` or `env:`. Use `dotenv:` files
  that are git-ignored.
- Be cautious with `sh:` dynamic vars — they execute at parse time
  and can run unexpectedly during `task --list`. Keep them
  inexpensive and side-effect-free.
- Avoid `curl | sh` patterns. Pin the version or vendor the script.
- Tasks that download artifacts should verify checksums or
  signatures.
- Lock the go-task version used in CI (e.g. via `tool-versions`,
  asdf, or a pinned install step).

## Performance

- Parallelize independent work via `deps:`.
- Set `sources:`/`generates:` so unchanged work is skipped.
- Avoid invoking `task` recursively from inside a task body — use
  `cmds: - task: <name>` so the cache is honored.
- Keep `sh:` variables minimal — they run on every invocation.

## Testing & Validation

- `task --list-all` must succeed; surface every task or document
  the omission.
- For CI: run `task ci` (or the project equivalent) and ensure the
  Taskfile failing is loud, not silent.
- Lint with `task --dry` to see resolved commands without running
  them when reviewing changes.
- Snapshot critical resolved variables in CI logs for debugging.

## Tooling

| Tool                    | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `task --list`           | Show user-facing tasks                      |
| `task --list-all`       | Include internal tasks                      |
| `task --summary <name>` | Show full task documentation                |
| `task --dry <name>`     | Print resolved commands without executing   |
| `task --status <name>`  | Exit non-zero if a task would run           |
| Editor JSON schema      | Inline validation in VS Code / IntelliJ     |
| `shellcheck`            | Validate non-trivial `cmds:` shell snippets |
| `yamllint`              | Validate YAML formatting                    |

## Output Format (when used for review)

### Summary

- Overall Assessment: Excellent (0 Critical, 0 High findings) / Good (0 Critical, ≤2 High) / Fair (≤1 Critical or ≤5 High) / Needs Improvement (otherwise)
- Schema Compliance: High / Medium / Low
- Caching Discipline: High / Medium / Low
- Key Strengths (2–4 bullets)
- Critical Issues (if any)

### Detailed Findings

For each issue:

- **Category** — Schema / Layout / Naming / Caching / Composition /
  Security / Cross-Platform / Documentation
- **Severity** — Critical / High / Medium / Low
- **Task / Lines** — task name + line numbers
- **Reference** — link entry name from `links.md`
- **Current YAML** — verbatim excerpt
- **Recommended Fix** — corrected YAML
- **Rationale** — why it matters

### Positive Highlights

### Recommendations (priority-ordered)

### References

Link to `links.md` — do not repeat URLs here.

## Review Procedure

If the YAML fails to parse, report only the parse error location and stop — do not attempt semantic review.

1. Read the full `Taskfile.yml` plus every `includes:` target. If any
   included file is not available in context, list it in the report
   and mark it as Unreviewed — do not infer its contents.
2. Apply sections in this order: Schema → Layout → Naming → Caching
   → Composition → Security → Cross-Platform → Documentation.
3. Cross-check each violation against `cheatsheet.md` to
   quote the exact rule. If reference files are not provided in
   context, cite the rule by section name from this document instead
   and note that external references were unavailable.
4. Emit the report using the **Output Format** above.

## Generation Procedure

1. Start from the **File layout** template above.
2. Define `vars:` and `env:` up front; declare `dotenv:` if secrets
   are involved.
3. For each task, fill in `desc:`, `sources:`/`generates:` (if
   applicable), `deps:`, and `cmds:` — in that order.
4. Validate locally with `task --list-all` and `task --dry <name>`
   before declaring the work done.
5. Output the complete `Taskfile.yml` in a single ` ```yaml ` fenced
   code block, followed by a brief bullet list of design decisions made.

## References

- See [cheatsheet.md](cheatsheet.md) for the
  condensed rules digest.
- See [links.md](links.md) for the canonical
  official URLs (taskfile.dev usage, schema, styleguide, GitHub).
