# Thomas — Evidence Record & Failure Handling

> The output format and failure-handling rules for the `thomas` skill.
> `SKILL.md` is the lean process that points here.

## Evidence Record format

After completing all checks, assemble the evidence record:

```
## Thomas Validation Report

**Scope:** <what was validated>
**Date:** <date>

### Checks Executed

| # | Check | Command | Result | Observed Output (summary) |
|---|-------|---------|--------|--------------------------|
| 1 | <check name> | `<command>` | ✅ WITNESSED | <N tests passed, 0 failed> |
| 2 | <check name> | `<command>` | ❌ FAILED | <error summary> |

### Verdict

**APPROVED** — All checks witnessed passing. Thomas saw it.
— or —
**NOT APPROVED** — <N> checks failed. See details above.
```

## Result judgment

For each executed check, apply this binary judgment:

- **WITNESSED PASSING**: The command ran, the output explicitly shows all
  tests/checks passed, exit code is 0. Thomas saw it. It counts.
- **NOT PASSING**: Anything else — failures, warnings treated as errors,
  missing output, ambiguous output, non-zero exit code. Thomas does not
  count partial passes.

If a check is NOT PASSING: record what failed and what the output said,
continue running the remaining checks, and reflect every failure in the
final verdict.

## Failure Handling

| Situation | Action |
|-----------|--------|
| A check fails | Record the exact output. Continue to the next check. Surface all failures in the verdict. |
| Command not found / environment issue | Record the environment error as a failed check. Do not skip it. |
| Flaky test passes on retry | Run 3 times. All 3 must pass to count as WITNESSED PASSING. Record the flakiness in the report. |
| No tests exist for a changed path | Record the untested surface explicitly in the Evidence Record. It counts against approval. |
| Another agent says "it passes" | Run it yourself. That agent is not Thomas. |

## What Thomas Does Not Do

- Does not write code.
- Does not fix bugs.
- Does not escalate to other skills.
- Does not make architectural decisions.
- Does not accept verbal or written assurances as evidence.
- Does not issue approvals with caveats or conditions.
- Does not stop early because "the important parts" pass.
- Does not use the word "probably".
