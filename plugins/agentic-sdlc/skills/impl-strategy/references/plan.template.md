# Plan: <short initiative title>

## Section 1 — What We Are Doing

1. **<Workstream title>** — <One-sentence outcome description. What changes and why it matters.>

2. **<Workstream title>** — <One-sentence outcome description.>

3. **Continuous lessons capture** — Lessons are automatically logged to `lessons.md` after every user correction and every agent mistake discovered during execution — without being asked.

### Requirements

- **R1** — <A necessity the user, ticket, or confirmed task states. Observable behavior, not mechanism.>
- **R2** — <A necessity.>

---

## Section 2 — How We Are Doing It / What Is Out of Scope

### Execution Config

| Setting | Value |
| ------- | ----- |
| Per-batch verify command | `<command agreed with user>` |
| Global verify command | `<command agreed with user>` |
| Build strategy | `red-implement-green` / `<strategy from build-strategies.md>` |
| Thomas | `enabled` / `disabled` |
| Definition of Done | `skill:<name>` / `<inline criteria>` / `none` |

### Execution rules

1. **Lessons** — invoke `skill:lessons-learned` in `append` mode immediately after any user correction or agent mistake. Do not wait to be asked or batch lessons.
2. **Order** — a batch starts only after every batch before it is ✅, unless it carries `**Parallel with:**` naming that batch.
3. **Build** — execute the batch's `**Build steps:**` in order, observing each step's stated outcome before the next; an outcome that does not occur stops the batch. When done, mark the batch's items 🔄 (when running as a subagent under `skill:go-wild`, report status to the orchestrator instead of editing `plan.md`).
4. **Verify** — run the batch's `**Verify:**` line, then each gate in its `**Gates:**` line in order, as defined under `### Gates`. When `Verify` passes mark the items ✅; mark each gate row ✅ when that gate passes.
5. **Failure** — any failure resets the batch's ✅ rows to 🔄; fix and re-run rule 4 from the start.
6. **Confirm writes** — after every status update, re-read the batch in `plan.md` and confirm the symbols landed.

### Gates

- **Necessity** — run two isolated subagents that share no context. *Test necessity* — given only the requirements and the batch's tests, confirm each test proves a stated requirement and none is redundant. *Code necessity* — given only the batch's tests and diff, confirm each changed line is needed by a test (removing it turns a test red). Passes only when both pass; a failing test is removed, failing code is removed or raised as an unstated requirement.
- **DoD** — invoke `skill:<dod-skill-name>` (or the inline Definition of Done criteria) against the batch's output in a validation subagent. Mandatory. Passes only when every criterion passes, reported per criterion.
- **Thomas** — dispatch `skill:thomas` as a subagent to execute every check in the batch's `Verify` line itself and confirm every other row of the batch is ✅. Passes only on an **APPROVED** verdict.
- **Thomas (final)** — dispatch `skill:thomas` to re-run the global verify command and confirm every other row in `plan.md` is ✅. Passes only on an **APPROVED** verdict; the plan is complete only then.

### Implementation checklist

#### `<path/to/test/file_test.ext>`
- Import `<symbol>`.
- Add `<TestClass>` with:
  - `<test_name>` — proves R<n>; fails before the change because <reason>.
  - `<test_name>` — proves R<n>; fails before the change because <reason>.

#### `<path/to/primary/file.ext>`
- <Concrete change: method signature, field name, behavior, return value.>
- <Edge-case handling or error path to implement.>

#### `<path/to/secondary/file.ext>`
- <Concrete change.>
- <Data-flow or dependency note that affects sequencing.>

### Out of scope

- **<Deferred area>** — <Reason for deferral or dependency that blocks it.>
- **<Unrelated system>** — unrelated to this initiative; no changes.
- **<Infrastructure concern>** — already handled; no changes needed here.

---

## Section 3 — Tracking List

### Batch 1 — <Short batch description>

| #         | Item              | File/Area           | Status |
| --------- | ----------------- | ------------------- | ------ |
| 1         | `<Work item>`     | `<path/or/feature>` | ⬜     |
| 2         | `<Work item>`     | `<path/or/feature>` | ⬜     |
| 3         | `<Work item>`     | `<path/or/feature>` | ⬜     |
| Necessity | Necessity gate    | Gates               | ⬜     |
| DoD       | DoD gate          | Gates               | ⬜     |
| Thomas    | Thomas gate       | Gates               | ⬜     |

**Build steps (red-implement-green):** Red — add `<test_name>` (R<n>) in `<test/file>`; `<test command>` fails because <reason> → Implement — items 1–3, nothing beyond the Red tests → Green — `<test command>` passes, no regressions.
**Verify:** `<per-batch verify command>` → <what passing looks like; no regressions in related suite.>
**Gates:** Necessity → DoD → Thomas

---

### Batch 2 — <Short batch description>

| #         | Item              | File/Area           | Status |
| --------- | ----------------- | ------------------- | ------ |
| 1         | `<Work item>`     | `<path/or/feature>` | ⬜     |
| 2         | `<Work item>`     | `<path/or/feature>` | ⬜     |
| DoD       | DoD gate          | Gates               | ⬜     |
| Thomas    | Thomas gate       | Gates               | ⬜     |

**Parallel with:** Batch 1
**Build steps (implement-verify — <reason no test-observable behavior>):** Implement — items 1–2 → Check — `<command>` passes.
**Verify:** <Manual or automated check — what to inspect and what outcome confirms success.>
**Gates:** DoD → Thomas

---

### Batch 3 — Final validation

| #         | Item                                               | File/Area           | Status |
| --------- | -------------------------------------------------- | ------------------- | ------ |
| 1         | Run `<global verify command>` — all suites green   | repo root           | ⬜     |
| 2         | <Runtime smoke check or log verification>          | `<path/to/file>`    | ⬜     |
| DoD       | DoD gate                                           | Gates               | ⬜     |
| Thomas    | Full plan sign-off                                 | Gates               | ⬜     |

**Build steps (implement-verify — validation only):** Implement — none → Check — `<global verify command>` passes.
**Verify:** `<global verify command>` → 0 failures; <observable outcome confirming end-to-end correctness.>
**Gates:** DoD → Thomas (final)
