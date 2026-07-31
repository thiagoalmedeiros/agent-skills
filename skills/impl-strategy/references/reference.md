# Implementation Plan — Output Structure & Execution Rules

> The detailed output structure, batch shapes, and execution rules for
> the `impl-strategy` skill. `SKILL.md` is the lean process that points
> here. Use [plan.template.md](plan.template.md) as the fill-in template
> for `plan.md`.

## Execution Config (captured during Discovery)

Record these in a `## Execution Config` section of `plan.md`:

- **Per-batch verify command(s)** and **global verify command(s)** — discovered by
  searching the codebase (`Taskfile.yml`, `package.json`, `README.md`, CI configs)
  and confirmed with the user. They become each batch's `**Verify:**` line.
- **`thomas: enabled` | `thomas: disabled`** — whether `skill:thomas` is spawned as a
  subagent to witness each batch's Verify step. If disabled, omit the `Thomas` row and
  `**Thomas Gate:**` lines from all batches.
- **Definition of Done** — a named DoD skill (`skill:<dod-skill-name>`) or inline
  criteria, recorded under `## Definition of Done`. If neither is provided, omit that
  section and all `DoD Gate` lines.

## Output Structure

Every implementation plan must use exactly these 3 sections.

### Section 1 — What We Are Doing

A numbered list of the actual changes or workstreams being delivered.

- Each item has a bold title and a short explanation.
- Describe the outcome, not just the mechanism.
- Scope to in-scope work only.
- **Always include a standing item for continuous lessons capture:** `Lessons are automatically logged to \`lessons.md\` after every user correction and every agent mistake discovered during execution — without being asked.`

### Section 2 — How We Are Doing It / What Is Out of Scope

Must contain both the execution method and the explicit non-goals.

- The implementation checklist by item type (TypeScript, template, styling, backend, config, runtime) where relevant.
- The validation strategy the executor runs after each batch.
- An explicit out-of-scope list, calling out shared infrastructure to handle separately and excluding speculative cleanup.
- Prefer concrete file paths, modules, interfaces, routes, or commands over abstract guidance.

### Section 3 — Tracking List

Track the work in batches of at most 4 items. Each batch has a short title, a markdown
table, and a `**Verify:**` line based on commands discovered in the codebase.

Table shape (without DoD):

```markdown
### Batch N - <description>

| #      | Item              | File/Area                     | Status |
| ------ | ----------------- | ----------------------------- | ------ |
| 1      | `Work item`       | `src/app/path/or/feature`     | ⬜     |
| 2      | `Work item`       | `src/app/path/or/feature`     | ⬜     |
| Thomas | Verify this batch | `skill:thomas` (if available) | ⛾      |

**Verify:** `<command>` -> `<command>` -> check <routes/tests/scenarios>
**Thomas Gate (if available):** After the `Verify` command passes, dispatch `skill:thomas` as a subagent to execute every check in this batch's `Verify` line itself and confirm witnessed passing output. Thomas will also verify that all tracking-list rows for this batch are marked ✅ in `plan.md`. Mark the Thomas row ✅ only after Thomas issues an **APPROVED** verdict. If Thomas returns **NOT APPROVED**, the batch is not complete.
```

Table shape (**when a DoD was provided**):

```markdown
### Batch N - <description>

| #      | Item              | File/Area                     | Status |
| ------ | ----------------- | ----------------------------- | ------ |
| 1      | `Work item`       | `src/app/path/or/feature`     | ⬜     |
| 2      | `Work item`       | `src/app/path/or/feature`     | ⬜     |
| DoD    | Validate batch    | DoD / validation script       | ⬜     |
| Thomas | Verify this batch | `skill:thomas` (if available) | ⛾      |

**Verify:** `<command>` -> `<command>` -> check <routes/tests/scenarios>
**DoD Gate:** Invoke `skill:<dod-skill-name>` (or run the inline DoD criteria) against this batch's output using a validation subagent. This step is **mandatory and cannot be skipped**. Mark the DoD row ✅ only after the subagent confirms all criteria pass. If any criterion fails, fix the failure, log the correction in `lessons.md`, and re-run the gate before proceeding.
**Thomas Gate (if available):** After the DoD Gate passes, dispatch `skill:thomas` as a subagent to execute every check itself and confirm witnessed passing output. Thomas will also verify that all tracking-list rows for this batch — including the DoD row — are marked ✅ in `plan.md`. Mark the Thomas row ✅ only after Thomas issues an **APPROVED** verdict. If Thomas returns **NOT APPROVED**, the batch is not complete.
```

Status values: `⬜` pending · `🔄` in progress · `✅` completed. Default new items to `⬜`
unless preserving status from an existing document.

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
- **User corrections are logged automatically.** Whenever the user corrects the agent's
  approach, output, or reasoning, immediately (without being asked) capture the lesson —
  invoke `skill:lessons-learned` in `append` mode if available, otherwise write directly
  to `lessons.md`.
- **Agent mistakes are logged automatically.** Whenever the agent detects an error, fix it
  first, then immediately capture the lesson the same way. Do not defer to end of session.

## Execution rules (throughout every session using the plan)

- **After every user correction / agent mistake:** capture the lesson immediately (see above).
- **After every batch with a DoD Gate:** spawn a validation subagent to run all DoD
  criteria before advancing; the DoD row must be ✅ before the next batch starts.
- **After every status update to `plan.md`:** re-read the modified section and confirm the
  ✅ symbols landed in the file before declaring a batch complete; if not, re-apply and re-read.
- **After every batch (if Thomas is enabled):** invoke `skill:thomas` as a subagent after
  the Verify step (and after the DoD Gate, if present). The Thomas row must be ✅ before the
  next batch starts.
- **Final batch — full-plan review (if Thomas is enabled):** the last batch includes a
  Thomas Gate covering the entire plan — Thomas re-runs the full validation suite, reviews
  every section of `plan.md` to confirm all rows are ✅, and issues a final APPROVED /
  NOT APPROVED verdict. The plan is not complete until this verdict is APPROVED.

## Batching Rules

- Default to batches of 4 items maximum.
- Prefer grouping by user-visible outcome or tightly related files.
- Do not mix unrelated risk areas in the same batch.
- If a single item is large enough to need isolated validation, give it its own batch.
- Each batch should leave the executor with a coherent validation target.

## Validation Rules

- Define validation in the plan before implementation begins.
- Search the codebase first to discover the project's commands before writing any `Verify` line.
- Prioritize commands found in `Taskfile.yml`, `package.json`, `README.md`, pipeline files, and existing plan documents.
- When the task affects runtime behavior, specify the manual checks the executor must perform.
- If validation cannot yet be determined, record the gap explicitly rather than inventing commands.
- **If the user supplies a DoD or validation script:** record it verbatim under `## Definition of Done`, attach a `DoD Gate` to every batch, and spawn a validation subagent to execute every criterion after the batch lands — non-negotiable, reported pass/fail per criterion.

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
