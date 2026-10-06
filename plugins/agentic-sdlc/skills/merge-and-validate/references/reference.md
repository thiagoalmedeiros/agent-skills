# Merge and Validate — Commands, Rollback & Report

> The exact command sequences, rollback procedure, and output format for
> the `merge-and-validate` skill. `SKILL.md` is the lean process that
> points here.

## Step 1 — Pre-flight command set

```bash
git status --short
git stash list
git branch --show-current
git rev-parse HEAD   # store as PRE_MERGE_SHA for rollback
```

**Gate:** if there are uncommitted changes or untracked files, stop and ask the user to
commit or stash. Do not proceed with a dirty working tree. Record `PRE_MERGE_SHA`.

## Step 2 — Fetch and validate the target branch

```bash
git fetch origin <target>
```

Confirm the target branch exists on the remote. If it does not, list available remote
branches and ask the user to clarify.

## Step 3 — Preview the merge

```bash
git log --oneline HEAD..origin/<target> | head -30
git diff --stat HEAD...origin/<target>
```

Summarize commits, files changed, insertions/deletions. If the diff is empty (branches
identical), report that and stop — no merge needed.

## Step 4 — Execute the merge

```bash
git merge origin/<target> --no-ff --no-edit
```

**If conflicts occur:**

1. List every conflicting file: `git diff --name-only --diff-filter=U`
2. Show the conflict markers for each file.
3. **Stop** and ask the user to resolve conflicts manually.
4. Once the user confirms resolution, verify with `git diff --check` and continue.

**If the merge is clean**, proceed to validation.

## Step 5 — Validate against the Definition of Done

Invoke `skill:definition-of-done` relative to the project.

- **If found:** invoke it and follow its validation steps exactly. If any step fails, run the Rollback Procedure.
- **If not found:** ask the user — *"No Definition of Done skill was found. What commands should I run to validate this merge?"* — wait, then execute each command sequentially. If any fails, run the Rollback Procedure.

## Rollback Procedure

If any validation step fails:

1. Abort or reset to `PRE_MERGE_SHA` (recorded in Step 1):
   ```bash
   git merge --abort 2>/dev/null || git reset --hard $PRE_MERGE_SHA
   ```
2. Confirm the working tree is clean: `git status`.
3. Report exactly which step failed, with output excerpts.
4. Do **not** leave the branch in a broken state.

## Output Format — Merge Report

```
## Merge Report

| Field          | Value                                                          |
|----------------|----------------------------------------------------------------|
| Current Branch | <branch name>                                                  |
| Merged From    | origin/<target>                                                |
| Merge Result   | ✅ Clean / ⚠️ Conflicts (resolved) / ❌ Failed                  |
| Commits Merged | <count>                                                        |
| Files Changed  | <count>                                                        |
| Validation     | ✅ PASS / ❌ FAIL — <step that failed with output summary>      |
| Final Status   | ✅ Merge validated / ❌ Rolled back                             |
```

If rolled back, include a **Next Steps** section with actionable guidance on what the user
should fix before retrying.
