# Taskfile Standard — Cheatsheet

Short, stable digest. Consult `SKILL.md` for full guidance and
`links.md` for the authoritative source.

## Design Principles — DRY & SOLID

- **DRY:** shared values in top-level `vars:`/`env:`; repeated
  commands become named tasks; long shell goes in `scripts/*.sh`;
  shared globs become reusable vars.
- **SRP:** a task does one thing — if `desc:` needs "and", split.
- **OCP:** extend by adding tasks/includes or overriding `vars:` at
  the call site, never by editing a stable task body.
- **LSP:** every `…:all` aggregate honors the same contract
  (vars, artifacts, exit codes) regardless of namespace.
- **ISP:** one namespace per included Taskfile; consumers include
  only what they use.
- **DIP:** tasks depend on `vars:` (paths, versions, tags), never
  on hard-coded values.

## File skeleton

```yaml
version: "3"

vars:
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
```

Top-level key order: `version`, `vars`, `env`, `includes`, `tasks`.

## Naming

| Element       | Style              | Example        |
| ------------- | ------------------ | -------------- |
| Task          | `kebab-case`       | `build`        |
| Namespace     | `colon:separated`  | `docker:build` |
| Variable      | `UPPER_SNAKE_CASE` | `BUILD_DIR`    |
| Include alias | `kebab-case` noun  | `docker`       |

## Semantic grouping

Pattern: `<domain>:<sub-domain>:<verb-or-scope>` — domain is a noun,
final segment is a verb or selector.

```text
tests:unit:all          build:api       lint:js     db:migrate:up
tests:unit:watch        build:web       lint:py     db:migrate:down
tests:integration:all   build:all       lint:all    db:seed
tests:e2e:all
```

Rules:

- Top-level segment is a noun (`tests`, `build`, `lint`, `docker`,
  `db`, `deploy`) — never a verb.
- Consistent depth per domain. Don't mix `tests:unit` with
  `tests:integration:all`.
- Every group exposes a `…:all` aggregate (parallel via `deps:`,
  sequential via `cmds: - task:`).
- Top-level alias (`tests`, `build`) runs the common workflow,
  usually `…:all`.
- Groups with >5 tasks move to their own included Taskfile.
- Same verb vocabulary across groups: `all`, `watch`, `clean`,
  `up`, `down`.
- Don't namespace one-off tasks — flat names beat fake hierarchies.

## Every task should have

- `desc:` (or `internal: true`)
- `cmds:`
- `sources:` + `generates:` when artifacts are produced
- `preconditions:` when an invariant must hold (with `msg:`)
- `requires:` when a variable must be set

## Composition

- `deps:` runs in **parallel** — only for independent steps.
- Sequential = `cmds: - task: <name>`.
- Never `task <name>` via raw shell; use the `task:` form so the
  dependency graph is honored.

## Variables

Precedence: CLI → task-level → top-level → `dotenv:`.

- Quote scalars with `{{ }}`: `'echo "{{.NAME}}"'`.
- Dynamic vars use `sh:` — keep them cheap and side-effect-free.

## Caching

- Declare both `sources:` and `generates:`.
- Default `method: checksum`; switch to `timestamp` only when
  checksums are expensive.
- Use `status:` for shell-driven up-to-date checks.

## Security

- Never interpolate untrusted input unquoted.
- Don't commit secrets in `vars:`/`env:` — use git-ignored `dotenv:`.
- `ignore_error: true` requires a comment.
- Pin go-task version in CI.
- No `curl | sh` without checksum/signature verification.

## Validation commands

- `task --list` / `task --list-all`
- `task --summary <name>`
- `task --dry <name>` (resolve commands without running)
- `task --status <name>`

## Tooling

`shellcheck` for non-trivial shell snippets, `yamllint` for YAML
formatting, editor JSON schema for inline validation.
