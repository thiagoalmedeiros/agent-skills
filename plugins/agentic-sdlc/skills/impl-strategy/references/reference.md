# Implementation Plan — Output Structure & Execution Rules

> The single source of truth for the shape of `plan.md` and the rules every
> phase follows while executing it. `SKILL.md` is the lean process that points
> here; [plan.template.md](plan.template.md) is the fill-in copy of this shape;
> [build-strategies.md](build-strategies.md) defines what goes in each batch's
> `Build steps` line and any gate a strategy adds.

## How a plan flows

```
impl-strategy writes plan.md
  └─ per batch, in order:
       build   — runs the batch's Build steps, marks its items 🔄
       verify  — runs Verify, then each gate in the batch's Gates line,
                 marking rows ✅ as each passes; Thomas last
  └─ the final batch is the global gate → plan complete → skill:review
```

`go-wild` runs that loop unattended; a user can run it one batch at a time. No
phase reads anything except `plan.md`, so everything below is written into it.

## Execution Config (captured during Discovery)

Record these in a `### Execution Config` table at the top of Section 2:

- **Per-batch verify command(s)** and **global verify command(s)** — discovered by
  searching the codebase (`Taskfile.yml`, `package.json`, `README.md`, CI configs)
  and confirmed with the user. They become each batch's `**Verify:**` line.
- **Build strategy** — the strategy from [build-strategies.md](build-strategies.md)
  every batch's `**Build steps:**` line is expanded from. Default: `red-implement-green`.
- **Thomas** — `enabled` or `disabled`. When disabled, omit the `Thomas` row and the
  Thomas gate, and the verify phase executes the `Verify` line itself.
- **Definition of Done** — a named DoD skill (`skill:<dod-skill-name>`) or inline
  criteria. If neither is provided, record `none` and omit the DoD gate everywhere.

## Output Structure

Every implementation plan must use exactly these 3 sections.

### Section 1 — What We Are Doing

A numbered list of the actual changes or workstreams being delivered.

- Each item has a bold title and a short explanation.
- Describe the outcome, not just the mechanism.
- Scope to in-scope work only.
- **List the requirements under `### Requirements` as `R1…Rn`** — each a necessity the
  user, ticket, or confirmed task states. Under `red-implement-green` every test cites one,
  and nothing is tested or built that no requirement asks for.
- **Always include a standing item for continuous lessons capture:** `Lessons are automatically logged to \`lessons.md\` after every user correction and every agent mistake discovered during execution — without being asked.`

### Section 2 — How We Are Doing It / What Is Out of Scope

In this order:

1. `### Execution Config` — the table above.
2. `### Execution rules` — copied verbatim from [Execution rules](#execution-rules) below.
3. `### Gates` — one definition per gate the plan uses, copied from
   [Gate definitions](#gate-definitions) below. Defined once here; batches only name them.
4. `### Implementation checklist` — by file, with concrete changes (TypeScript, template,
   styling, backend, config, runtime where relevant). Under `red-implement-green`, list
   each test file before the production files it covers.
5. `### Out of scope` — non-goals, shared infrastructure to handle separately, no
   speculative cleanup.

Prefer concrete file paths, modules, interfaces, routes, or commands over abstract guidance.

### Section 3 — Tracking List

Batches of at most 4 items. Every batch has exactly this shape:

```markdown
### Batch N — <description>

| #         | Item             | File/Area                 | Status |
| --------- | ---------------- | ------------------------- | ------ |
| 1         | `Work item`      | `src/app/path/or/feature` | ⬜     |
| 2         | `Work item`      | `src/app/path/or/feature` | ⬜     |
| Necessity | Necessity gate   | Gates                     | ⬜     |
| DoD       | DoD gate         | Gates                     | ⬜     |
| Thomas    | Thomas gate      | Gates                     | ⬜     |

**Build steps (<strategy>):** <expanded from build-strategies.md>
**Verify:** `<command>` → `<command>` → <what passing looks like>
**Gates:** Necessity → DoD → Thomas
```

- One gate row per gate the batch names; the `Gates` line lists them in run order.
  Run order is always **Necessity → DoD → Thomas**, dropping any the plan or strategy
  does not use. Thomas, when enabled, is always last.
- `**Parallel with:** Batch M` — optional. Only this line makes two batches independent;
  without it every batch runs after the one before it closes.
- **The final batch is the global gate.** Its `Verify` line runs the global verify
  command, and it names `Thomas (final)` instead of `Thomas`. The plan is complete only
  when this batch closes.

Status values: `⬜` pending · `🔄` built, awaiting verify · `✅` passed. Default new items
to `⬜` unless preserving status from an existing document.

## Execution rules

Copy these into the plan's `### Execution rules` verbatim.

```markdown
1. **Lessons** — invoke `skill:lessons-learned` in `append` mode immediately after any user correction or agent mistake. Do not wait to be asked or batch lessons.
2. **Order** — a batch starts only after every batch before it is ✅, unless it carries `**Parallel with:**` naming that batch.
3. **Build** — execute the batch's `**Build steps:**` in order, observing each step's stated outcome before the next; an outcome that does not occur stops the batch. When done, mark the batch's items 🔄 (when running as a subagent under `skill:go-wild`, report status to the orchestrator instead of editing `plan.md`).
4. **Verify** — run the batch's `**Verify:**` line, then each gate in its `**Gates:**` line in order, as defined under `### Gates`. When `Verify` passes mark the items ✅; mark each gate row ✅ when that gate passes.
5. **Failure** — any failure resets the batch's ✅ rows to 🔄; fix and re-run rule 4 from the start.
6. **Confirm writes** — after every status update, re-read the batch in `plan.md` and confirm the symbols landed.
```

## Gate definitions

Copy each gate the plan uses into its `### Gates` section (plus any strategy-specific gate from [build-strategies.md](build-strategies.md)).

```markdown
- **Necessity** — run two isolated subagents that share no context. *Test necessity* — given only the requirements and the batch's tests, confirm each test proves a stated requirement and none is redundant. *Code necessity* — given only the batch's tests and diff, confirm each changed line is needed by a test (removing it turns a test red). Passes only when both pass; a failing test is removed, failing code is removed or raised as an unstated requirement.
- **DoD** — invoke `skill:<dod-skill-name>` (or the inline Definition of Done criteria) against the batch's output in a validation subagent. Mandatory. Passes only when every criterion passes, reported per criterion.
- **Thomas** — dispatch `skill:thomas` as a subagent to execute every check in the batch's `Verify` line itself and confirm every other row of the batch is ✅. Passes only on an **APPROVED** verdict.
- **Thomas (final)** — dispatch `skill:thomas` to re-run the global verify command and confirm every other row in `plan.md` is ✅. Passes only on an **APPROVED** verdict; the plan is complete only then.
```

## Plan folder layout

The plan is a **folder**, not a single file:

```
plans/<topic-kebab-case>/
├── plan.md        # the 3-section plan artifact
└── lessons.md     # per-plan execution lessons, owned by skill:lessons-learned
```

- `<topic-kebab-case>` is a short descriptive slug (e.g. `auth-middleware-rewrite`).
- `plans/` is the default parent. If the project already organizes planning artifacts
  under another root (`tasks/`, `docs/plans/`), use that convention and note the choice.
- New folder: create `plan.md` from [plan.template.md](plan.template.md), then invoke
  `skill:lessons-learned` in `init <topic>` mode to create `lessons.md`. **Both files must
  exist before the skill finishes.**
- Existing folder: read `plan.md` first, preserve completed status items, update in place.
  Do **not** touch `lessons.md` — it belongs to `skill:lessons-learned`.

## Lessons File rules

`lessons.md` lives in every plan folder but is owned by `skill:lessons-learned`, not this
skill.

- Always invoke `skill:lessons-learned` in `init <topic>` mode when creating a new plan
  folder, even for a small plan.
- Never write or overwrite `lessons.md` from this skill. If `skill:lessons-learned` is
  unavailable, surface the missing dependency instead of inlining a template.
- Do not pre-populate lessons — they are earned during execution, not predicted.

## Batching Rules

- Default to batches of 4 items maximum.
- Prefer grouping by user-visible outcome or tightly related files.
- Do not mix unrelated risk areas in the same batch.
- If a single item is large enough to need isolated validation, give it its own batch.
- Each batch should leave the executor with a coherent validation target.
- Mark batches `Parallel with` only when they touch disjoint files and neither needs the
  other's output.

## Validation Rules

- Define validation in the plan before implementation begins.
- Search the codebase first to discover the project's commands before writing any `Verify` line.
- Prioritize commands found in `Taskfile.yml`, `package.json`, `README.md`, pipeline files, and existing plan documents.
- When the task affects runtime behavior, specify the manual checks the executor must perform.
- If validation cannot yet be determined, record the gap explicitly rather than inventing commands.
- **If the user supplies a DoD or validation script:** record it verbatim in the Execution Config and name the DoD gate in every batch.

## Decision Points

- **Create a plan folder** (`plans/<topic>/` with `plan.md` + `lessons.md`) when the user
  asks for a document, wants persistent tracking, or the work spans multiple batches.
- **In-chat-only plan** (no file) is the exception: use the same 3-section structure in the
  response and skip the folder only when the user explicitly asks for no file.
- **Match an existing planning root** (`tasks/`, `docs/plans/`) over the default when one exists.
- **This skill does not execute immediately** — it produces the plan, then hands off to a
  separate execution phase that uses the plan as input.
- **Out of scope** when work changes business logic beyond the request, touches shared
  infrastructure with likely cross-feature impact, or is cleanup not required for the outcome.

## Quality Bar

- Specific enough that each batch can be executed without re-planning the whole task.
- Describes execution but does not perform it.
- Each batch has a clear validation path.
- The tracking list is usable as a working checklist during implementation.
- Clearly distinguishes in-scope, out-of-scope, assumptions, and deferred items.
- The output is a **folder** (`plans/<topic>/`) containing `plan.md` and a `lessons.md`
  initialized through `skill:lessons-learned` — not a single loose file, unless the user
  explicitly requested an in-chat-only plan.
