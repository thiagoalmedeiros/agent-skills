# Build Strategies

> The catalog of build strategies the `impl-strategy` skill can prescribe.
> The architect chooses a strategy and expands it into each batch's
> `**Build steps:**` line and any gates the strategy defines; the builder
> (`skill:build`) executes those steps in order and knows nothing about
> the strategy behind them. Swapping a strategy changes only the plan,
> never the builder.

## The contract every strategy satisfies

- It expands into an ordered list of named steps, written into each batch
  as `**Build steps (<strategy>):**`.
- Every step names a concrete action (file, test, command) and the
  **observable outcome** that must be seen before the next step starts.
- Steps reference real commands discovered in the repo — the same ones the
  batch's `Verify` line uses.
- It never moves verification into the builder. Any check the strategy
  adds is a gate: defined once in the plan's `### Gates` section, named in
  each batch's `**Gates:**` line, and run by the verify phase in the order
  [reference.md](reference.md) fixes.

To add a strategy, add a section below that satisfies this contract; no
other skill changes.

## Choosing and overriding

- The plan-wide strategy is recorded in the plan's `### Execution Config` as
  `Build strategy`. Default: `red-implement-green`.
- A batch may override it when the plan-wide strategy cannot apply (for
  example, a docs or config batch with no test-observable behavior). The
  override names the strategy in its `Build steps` label and states the
  reason in one clause.

## `red-implement-green` (default)

Requirement-first. Every test exists because a requirement needs proving,
and every line of code exists because a test needs it to pass.

**The chain:** requirement → Red test → implementation → Green.

- **Requirements are the root.** The plan lists them under Section 1 as
  `R1…Rn`: each a necessity the user, the ticket, or the confirmed task
  states. Nothing is tested or built that no requirement asks for.
- **A test is written only to prove a requirement.** No test is added for
  coverage, for an implementation detail, or "while we're here". A test
  that cites no requirement is slop and is removed, not kept.
- **Code is written only to make a Red test pass.** Code no test needs is
  either an unstated requirement — stop and raise it with the user, then
  add it to the plan — or slop to remove.
- **100% coverage is the consequence, not the target.** When every line
  serves a requirement-traced test, coverage is complete. A coverage gap
  means code with no requirement or a requirement with no test; it is
  investigated, never filled with a test written to hit the line.

Steps:

1. **Red** — write the tests named for this batch, each citing its
   requirement (`R<n>`); run `<test command>`; observe them **fail for the
   stated reason** (missing behavior, not a syntax or import error).
2. **Implement** — make the smallest change to the batch's items that
   satisfies the Red tests, and nothing beyond it.
3. **Green** — run `<test command>` again; observe the Red tests pass and
   no previously passing test fail.

Gate — **Necessity**, run by the verify phase first, before DoD and Thomas,
as two checks that never share context. Each is a fresh subagent that sees
only its inputs below — not the builder's reasoning and not the other
check's verdict:

- **Test necessity** — inputs: the plan's requirements and the batch's
  tests, *not* the implementation. For each test: which requirement does
  it prove, and would the suite lose the proof of that requirement without
  it? A test that proves no requirement, or only duplicates another's
  proof, fails the check.
- **Code necessity** — inputs: the batch's requirement-traced tests and
  the implementation diff. For each changed line or branch: which test
  needs it? Investigate by removing or reverting it and re-running the
  tests — if every test stays green, no test needs it. Such code fails the
  check as an unstated requirement or slop.

Plan-writing rules for this strategy:

- Section 1 lists `R1…Rn`; every Red test in the implementation checklist
  cites one and states why it must fail before the change.
- In the implementation checklist, list the test file before the
  production files it covers.
- Every batch carries a `Necessity` row and names `Necessity` first in its
  `**Gates:**` line.

Batch line:

```markdown
**Build steps (red-implement-green):** Red — add `<test_name>` (R<n>) in `<test/file>`; `<test command>` fails because <reason> → Implement — items 1–N, nothing beyond the Red tests → Green — `<test command>` passes, no regressions.
```

Gate definition, copied once into the plan's `### Gates`:

```markdown
- **Necessity** — run two isolated subagents that share no context. *Test necessity* — given only the requirements and the batch's tests, confirm each test proves a stated requirement and none is redundant. *Code necessity* — given only the batch's tests and diff, confirm each changed line is needed by a test (removing it turns a test red). Passes only when both pass; a failing test is removed, failing code is removed or raised as an unstated requirement.
```

## `implement-verify`

For batches with no test-observable behavior: docs, config, pure
formatting, dependency bumps. It writes no tests, so its batches drop
the `Necessity` row and gate.

1. **Implement** — make the batch's changes.
2. **Check** — run the stated check (`<lint/build/validate command>`) and
   observe it pass.

Batch line:

```markdown
**Build steps (implement-verify — <reason>):** Implement — items 1–N → Check — `<command>` passes.
```
