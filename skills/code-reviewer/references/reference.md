# Code Reviewer — Full Reference

> The full axis checklists, structural remedies, review discipline,
> output format, and review checklist for the `code-reviewer` skill.
> `SKILL.md` is the lean process that points here.

# Code Reviewer — Detail

Use this skill when asked to review code changes on a branch or on local uncommitted changes — whether the code was written by you, another agent, or a human.

Before reviewing, orient to the project's own conventions — its style guide, existing patterns, and any language- or framework-specific skills the project defines. All convention-specific checks must be evaluated against those, not against personal preference.

## Prime Directive: "Approve what improves code health; block only real defects."

Approve a change when it **definitely improves overall code health**, even if it isn't perfect. Perfect code doesn't exist — the goal is continuous improvement. Don't block a change because it isn't exactly how you would have written it. If it improves the codebase and follows the project's conventions, approve it. Reserve blocking for real defects: correctness, security, architectural regressions, and violations of the project's standards.

---

## When to Use

- Before merging any branch or PR.
- After completing a feature implementation.
- When another agent or model produced code you need to evaluate — AI-generated code needs **more** scrutiny, not less; it's confident and plausible even when wrong.
- When refactoring existing code.
- After any bug fix — review both the fix **and** the regression test.

---

## Step 1 — Determine Review Scope

Based on the input provided:

- **Branch name** (default): review the branch diff against `develop`.
  ```bash
  git fetch origin develop
  git fetch origin <branch>
  git diff origin/develop..origin/<branch> --name-status
  git diff origin/develop..origin/<branch>
  ```
- **`local`**: review uncommitted staged and unstaged changes.
  ```bash
  git diff --name-status
  git diff
  git diff --cached --name-status
  git diff --cached
  ```

Read each changed file **in full** — not just diff hunks — to judge context accurately.

---

## Step 2 — Understand the Context, Tests First

Before evaluating code, understand the intent:

- What is this change trying to accomplish? What spec or task does it implement?
- What is the expected behavior change?

Then **review the tests first** — tests reveal intent and coverage:

- Do tests exist for the change?
- Do they test behavior, not implementation details?
- Are edge cases covered?
- Would the tests catch a regression if the code changed?

---

## Step 3 — Review Across the Five Axes

Walk through every changed file across the five axes below. The first three carry finer-grained sub-checks (SOLID, duplication, tests, comments); the last two — **security** and **performance** — are mandatory even when the change looks purely cosmetic.

### Axis 1 — Correctness

Does the code do what it claims to do?

- Does it match the spec or task requirements?
- Are edge cases handled (null, empty, boundary values)?
- Are error paths handled — not just the happy path?
- Are there off-by-one errors, race conditions, or state inconsistencies?
- Does it pass all tests, and are the tests actually testing the right things?

**Test quality** (evaluate every new or changed test):

| Check               | Criteria                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Empty tests**     | Flag tests with no meaningful assertion.                                            |
| **Duplicate tests** | Flag test cases that exercise the exact same path with trivially different data.    |
| **String reuse**    | Repeated literal strings must be extracted into constants or fixtures.              |
| **Maintainability** | Tests must use fixtures/factories, not inline setup blocks duplicated across cases. |
| **Naming**          | Test names must describe the scenario and the expected outcome.                     |
| **Isolation**       | Each test must be independent — no ordering dependencies or shared mutable state.   |

### Axis 2 — Readability & Simplicity

Can another engineer (or agent) understand this code without the author explaining it?

- Are names descriptive and consistent with project conventions? (No bare `temp`, `data`, `result`.)
- Is the control flow straightforward — no nested ternaries, no deep callbacks?
- Could this be done in fewer lines? (1000 lines where 100 suffice is a failure.)
- Are abstractions earning their complexity? (Don't generalize until the third use case.)
- **Is a new conditional bolted onto an unrelated flow?** That's a design smell, not a nit — push the logic into its own helper, state, or policy.
- **Do repeated conditionals on the same shape appear?** They signal a missing model or dispatcher.
- **Would this read without its comments?** If not, the finding is the code, not the missing explanation.

#### Comment hygiene — the code is the documentation

**The code is the rule.** Names, types, and small functions carry the meaning. A comment is an admission the code failed to say something — the default answer is delete it and fix the code.

**Comments are highlights, not narration.** Highlight a whole page and nothing is highlighted: nobody reads a file that narrates itself, so the one comment that mattered gets skimmed past too. Density is the defect, independent of any single comment's accuracy.

**Delete on sight:**

- Comments saying **what** the code does — restating a name, narrating a line (`// set the flag`), banner-labelling a section that should have been a function.
- Comments explaining **why** it's written this way — the reason belongs in a named function, constant, type, or test, not in prose beside the code.
- Docblocks re-spelling the signature (`@param userId The user id`), commented-out code, and stale comments describing behavior the code no longer has.

**Keep only** what has no representation in code: legal headers, `TODO`/`FIXME` with a ticket reference, project-required doc comments, and facts living outside the codebase (a vendor bug, a protocol quirk, a spec clause).

**Report the code, not the comment.** When a function "needs" a comment, the finding is the function — name the rename, extraction, or explicit type. Comment density rivalling the code is one readability finding on the file, not a dozen line nits.

### Axis 3 — Architecture & Design

Does the change fit the system's design?

Evaluate every changed file against **SOLID**:

| Principle                 | What to check                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility** | Does each class/module/function do exactly one thing? Flag god-classes and multi-purpose functions.           |
| **Open/Closed**           | Is the design extensible without modifying existing code? Flag hardcoded switches that should be polymorphic. |
| **Liskov Substitution**   | Can subtypes replace their base without breaking behavior? Flag violated contracts.                           |
| **Interface Segregation** | Are interfaces lean? Flag fat interfaces that force unused implementations.                                   |
| **Dependency Inversion**  | Do high-level modules depend on abstractions, not concretions? Flag direct instantiation of dependencies.     |

Then assess the broader design:

- Does it follow existing patterns, or introduce a new one? If new, is it justified?
- Does it maintain clean module boundaries and correct dependency direction (no circular dependencies)?
- **Does this refactor reduce complexity or just relocate it?** Count the concepts a reader must hold. If a "cleaner" version leaves that count unchanged, it isn't cleaner. Prefer deleting an abstraction to polishing it.
- **Is feature-specific logic leaking into a shared or general-purpose module?** Keep logic in its owning layer; reuse the existing canonical helper instead of a near-duplicate.
- **Are type boundaries explicit?** Question gratuitous `any`/`unknown`/optional/casts and silent fallbacks that paper over an unclear invariant.

**Duplication detection** — search **beyond the diff**. For every new function, class, or utility:

1. Search the **entire codebase** for similar logic using semantic search and grep.
2. Flag any feature or behavior that already exists elsewhere.
3. Flag copy-pasted code blocks (even with minor renames).
4. Suggest reuse of existing abstractions or extraction of shared utilities.

### Axis 4 — Security

Does the change introduce vulnerabilities?

- Is user input validated and sanitized at system boundaries?
- Are secrets kept out of code, logs, and version control?
- Is authentication/authorization checked where needed?
- Are outputs encoded to prevent injection (XSS, template injection)? Watch raw-HTML sinks and any mechanism that bypasses the framework's built-in sanitization.
- Are queries parameterized (no string concatenation)?
- Is data from external sources (APIs, logs, user content, config) treated as untrusted before use in logic or rendering?

### Axis 5 — Performance

Does the change introduce performance problems?

- Any N+1 query or request patterns?
- Any unbounded loops or unconstrained data fetching? Any missing pagination on list endpoints?
- Any synchronous operations that should be async?
- Any unnecessary re-renders, or heavy work in hot paths / render cycles?
- Any large objects created in hot paths?

---

## Step 4 — Check Project & Framework Conventions

Judge the change against the project's own established conventions, not against personal taste. Where the project defines a style guide, linter/formatter config, or language- or framework-specific skills, treat those as the authority and verify:

- Code follows the project's patterns for structure, module layout, naming, and boilerplate.
- Idioms match the language and framework already in use — no gratuitously novel patterns where a conventional one exists.
- Styling, formatting, and configuration follow project conventions.
- Flag legacy patterns the project has since moved away from, and point to the current idiom.

---

## Step 5 — Final Sweep

After the axis review, run these closing checks before writing the verdict.

**Dependency review.** Part of code review is dependency review. Before adding any dependency: does the existing stack solve this? How large is it? Is it actively maintained? Any known vulnerabilities (`npm audit`)? Is the license compatible? Prefer the standard library and existing utilities — every dependency is a liability. **Upgrading an existing dependency** is a code change like any other:

1. **Read the changelog, not just the version number** — semver is a promise that may not have been kept.
2. **One dependency per change** — a bulk bump that breaks the build hides which package did it.
3. **Let the tests decide** — verified by a green suite before *and* after, not by "it installed."
4. **Review the lockfile diff**, not just `package.json` — one direct bump can pull in dozens of transitive changes. Never hand-edit the lockfile.

**Dead code.** After any refactoring or implementation change, check for orphaned code: identify anything now unreachable or unused, list it explicitly, and **ask before deleting** — don't silently remove things you're not sure about.

```
DEAD CODE IDENTIFIED:
- formatLegacyDate() in src/utils/date.ts — replaced by formatDate()
- OldTaskCard component in src/components/ — replaced by TaskCard
→ Safe to remove these?
```

**Change sizing.** Small, focused changes are easier to review, faster to merge, and safer to deploy:

```
~100 lines changed   → Good. Reviewable in one sitting.
~300 lines changed   → Acceptable if it's a single logical change.
~1000 lines changed  → Too large. Recommend splitting.
```

Watch **file** size, not just diff size. A small diff can still push a file past a healthy boundary — around 1000 *total* lines in a single file is an inspection signal. When a change materially grows an already-large file, ask whether to extract helpers, subcomponents, or modules *first*, before piling more on. And **separate refactoring from feature work** — a change that refactors existing code *and* adds new behavior is two changes; recommend submitting them separately. Small cleanups (a rename) can ride along at reviewer discretion.

---

## Structural Remedies

When you flag a structural problem, propose the move — not just the problem. A review that only says "this is complex" leaves the author guessing. Reach for a named restructuring:

- **Replace a chain of conditionals** with a typed model or an explicit dispatcher.
- **Collapse duplicate branches** into a single clearer flow.
- **Separate orchestration from business logic** so each reads on its own.
- **Move feature-specific logic** out of a shared module into the package that owns the concept.
- **Reuse the canonical helper** instead of a bespoke near-duplicate.
- **Make a type boundary explicit** so downstream branching disappears.
- **Delete a pass-through wrapper** that adds indirection without clarifying the API.
- **Extract a helper, or split a large file** into focused modules.

Prefer the remedy that removes moving pieces over one that spreads the same complexity around.

---

## Review Discipline

### Honesty over politeness

- **Don't rubber-stamp.** "LGTM" without evidence of review helps no one.
- **Don't soften real issues.** Calling a production bug "a minor concern" is dishonest.
- **Quantify problems when possible.** "This N+1 will add ~50ms per list item" beats "this could be slow."
- **Push back on approaches with clear problems** and propose alternatives. Sycophancy is a failure mode in reviews.
- **Comment on code, not people.** If the author has full context and disagrees, defer to their judgment gracefully.

When resolving disputes: technical facts and data override preferences; the project's style guide is the authority on convention matters; codebase consistency is acceptable if it doesn't degrade overall health. **Don't accept "I'll clean it up later"** — require the fix before merge, or a filed ticket with self-assignment.

### Rationalizations to reject

| Rationalization | Reality |
|---|---|
| "It works, that's good enough" | Working code that's unreadable, insecure, or architecturally wrong creates debt that compounds. |
| "I wrote it, so I know it's correct" | Authors are blind to their own assumptions. Every change benefits from another set of eyes. |
| "We'll clean it up later" | Later never comes. The review is the quality gate — require cleanup before merge, not after. |
| "AI-generated code is probably fine" | AI code needs more scrutiny, not less. It's confident and plausible, even when wrong. |
| "The tests pass, so it's good" | Tests don't catch architecture problems, security issues, or readability concerns. |
| "The refactor makes it cleaner" | Relocating complexity isn't reducing it. Look for the version where branches disappear. |
| "It's only a small addition to this file" | Small diffs still push files past a healthy size and bolt branches onto unrelated flows. |
| "It's just a version bump" | A bump is a behavior change you didn't write. Read the changelog. |
| "The comments explain what it does" | Then the code doesn't. Fix the names and the structure. |
| "The comment documents why we did it this way" | Put the why in a named function, constant, type, or test. Prose drifts; code can't. |
| "More comments can't hurt" | Nobody reads a file that narrates itself, so the one that mattered is skipped too. |

### Red flags to watch for

- PRs merged without any review, or "LGTM" with no evidence of actual review.
- Review that only checks whether tests pass, ignoring the other axes.
- Security-sensitive changes without a security-focused pass.
- Large changes that are "too big to review properly" — recommend splitting.
- No regression test accompanying a bug fix.
- A refactor that moves code around without reducing the concepts a reader must hold.
- A change that grows an already-large file instead of decomposing it.
- New conditionals scattered into unrelated code paths (a missing abstraction).
- A bespoke helper that duplicates an existing canonical one, or feature logic placed in a shared module.
- A bulk "bump dependencies" change with no changelog review or per-package isolation.
- Comment lines rivalling code lines, or a comment added where a rename or an extraction was the real fix.

---

## Output Format

### Summary

One-paragraph overall assessment leading with the verdict: **merge-ready**, **needs minor fixes**, or **needs rework**.

**Lead with what matters.** Order findings by leverage: correctness and security first, then structural regressions and missed simplifications, then everything else. A few high-conviction comments beat a long list — if you have one structural problem and ten nits, the structural problem *is* the review.

### Findings

Group findings by severity:

**🔴 Must Fix** — Blocks merge (correctness bugs, security vulnerabilities, SOLID violations, duplication, empty tests, architectural regressions).

**🟡 Should Fix** — Improve before merge (test quality, naming, minor duplication, performance concerns, legacy patterns).

**🟢 Nit** — Optional improvements (style, minor readability). The author may ignore these.

Each finding must include:

- **File** and **line range**
- **Axis / Category** (Correctness, Readability, Architecture/SOLID, Security, Performance, Convention, Duplication, Test, Comment)
- **Description** of the issue
- **Suggestion** for how to fix it — a concrete structural remedy where one applies

---

## Review Checklist

```markdown
## Review: [branch / change title]

### Context
- [ ] I understand what this change does and why

### Correctness
- [ ] Matches spec/task requirements; edge cases and error paths handled
- [ ] Tests cover the change; no empty/duplicate tests; tests are isolated

### Readability
- [ ] Names clear and conventional; logic straightforward; no unnecessary complexity
- [ ] The code reads without its comments; each surviving comment earns its place

### Architecture
- [ ] SOLID respected; follows existing patterns; appropriate abstraction level
- [ ] Refactors reduce complexity rather than relocate it
- [ ] No feature logic in shared modules; no near-duplicate of a canonical helper; file stays a healthy size

### Conventions
- [ ] Structure, naming, idioms, and styling follow the project's established conventions
- [ ] No legacy patterns that should be modernized

### Security
- [ ] No secrets in code; input validated at boundaries; external data treated as untrusted
- [ ] No injection/XSS; auth checks in place

### Performance
- [ ] No N+1 or unbounded operations; pagination on lists; no needless re-renders

### Verification
- [ ] Tests pass; build succeeds; manual verification done (if applicable)

### Verdict
- [ ] **Approve** — ready to merge
- [ ] **Request changes** — issues must be addressed
```
