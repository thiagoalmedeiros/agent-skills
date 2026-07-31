# Documentation Sync — Targets, Heuristics & Output

> The target-file map, classification heuristics, per-file rules, and
> output format for the `docs-sync` skill. `SKILL.md` is the lean process
> that points here.

## Target Files

| File              | Governs                                            | Key Sections to Watch                                                   |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| `AGENTS.md`       | AI agent workflows, key commands                   | Key Workflows, Database Operations, Edit Configuration                  |
| `ARCHITECTURE.md` | System design, components, directory tree          | System Components, Directory Structure, Configuration, Tests, Data Flow |
| `README.md`       | Setup guide, prerequisites, quick start            | Prerequisites, Environment Configuration, Documentation links           |
| `CLAUDE.md`       | Thin redirect — points the agent to read AGENTS.md | Single pointer line to AGENTS.md                                        |
| `knowledge-base/` | OKF concept docs describing subsystems, architecture, setup | Any concept describing the changed subsystem; `index.md`, `log.md` |

The first four files are edited directly. The `knowledge-base/` bundle is
cross-checked for change-triggered drift in its **content**; trivial
fixes are applied in place and structural changes are deferred (see
Change-risk tiers).

## Collect the diff

Use the base ref provided by the caller, defaulting to `origin/main`:

```bash
git fetch origin
git diff origin/main...HEAD --name-status
```

Capture added (`A`), modified (`M`), deleted (`D`), and renamed (`R`) files. If `git fetch`
fails or the base ref does not exist, report and stop. If the diff is empty, report "No
changes relative to base branch" and stop.

### Read radius

The diff names only changed files, not everything they affect. Before classifying, note the
read radius to cross-check in later steps:

- The five doc targets above.
- The knowledge base — default `knowledge-base/`, or the folder the user has designated. List
  it (`ls -R knowledge-base`) so concept docs are discoverable even when the diff didn't touch
  them.
- `CLAUDE.md` and `AGENTS.md`.

A change can contradict or duplicate content in a file the diff never mentions; the read
radius is how that surfaces.

## Classification heuristics

**Code and infrastructure changes:**

- **Structural changes** (new/removed/renamed directories, apps, libs, services) → `ARCHITECTURE.md` (Components, Directory Structure), `README.md`
- **Build/task changes** (task definitions, build scripts, orchestration) → `AGENTS.md` (Workflows), `ARCHITECTURE.md` (Orchestration)
- **Configuration changes** (env vars, settings templates, port numbers) → `ARCHITECTURE.md` (Configuration), `README.md` (Setup)
- **Infrastructure changes** (Docker/compose files, CI pipelines, deploy manifests) → `ARCHITECTURE.md` (Infrastructure, Ports, Directory Structure)
- **Dependency changes** (package manifests, requirements files) → `ARCHITECTURE.md` (Components), `README.md` (Prerequisites)

**Agent customization changes:**

- **Agent/skill/instruction changes** (files in `.agents/skills/`, `.agents/rules/`, `.agents/`, or `.github/instructions/`) → `AGENTS.md`, `CLAUDE.md`

**Documentation content changes:**

- **Subsystem/behavior changes** with an existing knowledge-base concept describing them → that concept (and its `index.md` if the entry point changed)
- **A change that duplicates, contradicts, or obsoletes** existing doc content → the doc(s) holding that content, whether or not the diff touched them

**Cross-cutting changes:**

- **Renamed or moved files** referenced in any doc → all affected files

**Fallthrough:** other file changes do not force doc updates. If more than 10 non-doc files
changed, or any file under `src/`, `apps/`, or `libs/` was added/removed/renamed, notify the
user of the non-doc changes and stop without producing a Sync Summary. If only fallthrough
files changed and the threshold is not met, report "Docs are up to date" and stop — no Sync
Summary or Update Plan.

## Drift and consistency categories

For each doc in the read radius, compare current content against post-change reality:

1. **Stale references** — paths, file names, task names, env vars, or ports that no longer exist.
2. **Missing entries** — new components, tasks, env vars, directories, or workflows not yet documented.
3. **Incorrect descriptions** — text that contradicts the actual behavior of changed code.
4. **Structural mismatches** — directory trees in ARCHITECTURE.md that don't reflect the actual layout.
5. **Duplication** — the same information maintained in two or more places, now at risk of diverging.
6. **Dead content** — documentation for code, tasks, or files the change removed.
7. **Outdated content** — narrative overtaken by the change but not strictly a "reference" (e.g., prose that no longer matches behavior).
8. **Contradiction** — docs that conflict with each other or with the changed code.

Where categories 5–8 surface, also note **restructuring opportunities**: content to combine,
move to a better-fitting doc, or delete.

## Change-risk tiers

Every finding carries a tier that decides its gate in the plan:

- **Trivial** — an in-place fix that preserves structure: correct a stale reference, update a
  description, add a missing entry, resolve a contradiction by editing one side. Applied once
  the plan is approved.
- **Structural** — combine duplicated sections, move content to another doc, delete dead
  content, or reorganize a file/folder. Surfaced as a suggestion that first asks the user
  whether it's relevant and worth doing; never applied on plan approval alone.

When unsure, treat a finding as structural — the cost of asking is lower than the cost of an
unwanted reorganization.

## Per-file apply rules

**`CLAUDE.md`:** Only update the pointer line that references `AGENTS.md` (always a relative
markdown link like `[AGENTS.md](AGENTS.md)`, never a `file://` URI). Do NOT add workflows or
substantive content — that belongs in `AGENTS.md`.

**`ARCHITECTURE.md` — Directory Structure section:** Use the existing tree as the inclusion
template — same depth and same categories of files. Auto-regenerate from the filesystem
(`tree` or `ls -R`), then format to match the existing indentation and annotation style. Add
directories that now exist; remove ones that no longer exist. Do not introduce new file
categories not previously documented.

**`knowledge-base/`:** Trivial content fixes may be applied — a stale statement corrected,
a contradiction resolved, dead content removed. Structural changes (combine, move, delete,
reorganize) require user confirmation first. How the bundle is organized — frontmatter,
naming, `index.md`, `log.md` — is not this skill's concern.

General apply rules: edit only approved changes; preserve each file's writing style, heading
structure, and formatting; do not rewrite already-correct sections; do not add content
unevidenced by the diff or a concrete doc inconsistency.

## Output format

### Update plan (Step: PLAN — shown before any edit)

Split into trivial fixes (apply on approval) and structural suggestions (confirm relevance
first):

```
## Documentation Sync Plan

### Trivial fixes — apply on approval

#### <filename>
- [ ] <Add|Update|Remove> — <section>: <what changed and why, referencing the diff or inconsistency>

#### <filename>
- (no changes needed)

### Structural suggestions — confirm relevance first

#### <filename>
- [ ] <Combine|Move|Delete|Reorganize> — <section>: <the inconsistency and the proposed restructure>. Relevant?
```

### Sync Summary

One paragraph: how many files need updates, and severity (cosmetic, structural, or missing coverage).

### Post-Apply Verification

After applying, a short confirmation listing files edited and any warnings.

## Constraints

- NEVER apply edits without showing the plan first.
- NEVER apply a structural change (combine, move, delete, reorganize) without confirming relevance with the user.
- NEVER rewrite documentation sections that no change or inconsistency touched.
- NEVER invent features or components not evidenced by the diff or an existing-doc inconsistency.
- ALWAYS use three-dot diff syntax (`origin/main...HEAD`) to scope to branch-only changes.
- ALWAYS preserve each file's tone, structure, and formatting.
- If the base branch is not `main`, the caller must specify it; the model never prompts and silently defaults to `origin/main`.
