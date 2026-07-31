# Lessons Learned — Templates & Rules

> The file template, entry format, append triggers, and quality bar for
> the `lessons-learned` skill. `SKILL.md` is the lean process that points
> here.

## Location resolution

The caller passes a target location as the first argument:

- A **directory path** → the skill writes/reads `<path>/lessons.md`.
- A **file path ending in `.md`** → the skill uses that file directly.

The skill never invents a location. If no path is given, ask the caller for one before
doing anything.

## `init` — initial file content

Create `lessons.md` at the resolved location **only if it does not already exist** (never
overwrite). The initial content is exactly:

```markdown
# Lessons Learned

_Append an entry whenever the user corrects an approach, something fails
in a non-obvious way, or a pattern worth remembering is discovered. Read
this file at the start of every working session._

## Format

Each lesson follows this structure:

### [YYYY-MM-DD] — [Short Title]
**Context:** What was happening when this was discovered
**Mistake:** What went wrong (or what was nearly missed)
**Rule:** The rule to prevent recurrence
**Applies to:** [file, area, or task]

---

_No lessons recorded yet._
```

## `read` — return contents

Return the full contents of `lessons.md` at the resolved location. If it does not exist,
return an empty result and tell the caller no prior lessons exist there. Callers should read
lessons at the start of a session before acting.

## `append` — add one entry

Append a new lesson to the bottom of the file using this format:

```markdown
### [YYYY-MM-DD] — <Short Title>
**Context:** <one or two sentences>
**Mistake:** <what went wrong or was nearly missed>
**Rule:** <the rule to prevent recurrence>
**Applies to:** <file, area, or task>
```

Rules:

- One lesson per entry. Do not batch multiple unrelated lessons.
- Keep `Rule` short and prescriptive — actionable as a check next time.
- If the file still has the `_No lessons recorded yet._` placeholder, remove it when adding the first entry.
- Use today's date in `YYYY-MM-DD` format.
- If the file does not exist when `append` is invoked, run `init` first, then append.

## When to append a lesson

Append whenever, during a session:

- The user corrects an approach you chose.
- Something fails for a non-obvious reason and the diagnosis is worth remembering.
- A recurring pattern in this codebase or environment is discovered.
- A disagreement is resolved and the resolution should be remembered.

Do **not** append:

- Pre-emptive or speculative lessons — lessons are earned, not predicted.
- Generic best practices not specific to this project, codebase, or recurring situation.

## Quality bar

- Every lesson entry has all four fields filled in.
- No entry exceeds a small handful of lines — long write-ups belong in code comments or design docs.
- The file is append-only during a session. Editing or deleting prior entries requires explicit user instruction.
