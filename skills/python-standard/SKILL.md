---
name: python-standard
version: 1.0.0
description: >
  Canonical Python coding standard (PEP 8, PEP 257, PEP 484, PEP 20,
  Google Python Style Guide) for authoring and reviewing Python — every
  finding cites the rule it violates.
  USE FOR: writing new Python code, reviewing existing Python code,
  enforcing project conventions, a style/lint pre-flight before commit,
  onboarding a Python codebase.
  DO NOT USE FOR: non-Python languages (use the matching language skill),
  framework-specific guidance such as Django/FastAPI/Flask, or
  build/packaging/dependency selection.
argument-hint: "Path to a Python file or module to author, refactor, or review"
---

# Python Standard

## Overview

The single source of truth for Python style, structure, typing,
documentation, security, and performance in this project — applied both
when **generating** new Python and when **reviewing** existing code. The
full rule set lives in [references/standard.md](references/standard.md);
this file is the process that applies it. **Prime directive: every
judgment traces to a named rule (PEP or Google section) in
`references/standard.md` — never to personal taste, and never fabricate a
citation.**

## When to Use

- The user asks to create, refactor, or review a `.py` file.
- The user asks "is this idiomatic?" or "does this follow PEP 8?".
- The user wants a style/lint pre-flight before commit.
- The user wants the standard the project agrees to follow.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — decide generate vs. review, and confirm target

Determine whether the request is to **generate** new code or **review**
existing code. Confirm the target Python version (default: the project's
`pyproject.toml`, else the highest supported CPython). If the file is not
Python, decline in one sentence naming the detected language. Load
[references/standard.md](references/standard.md) — it holds every rule the
next step applies.

### Step 2: APPLY — enforce the standard in fixed order

Apply the standard's sections in this order: Standards & Conventions →
Documentation → Type Discipline → Code Quality → Security → Performance →
Testing → Tooling. When generating, emit code that already obeys every
rule plus Google-style docstrings and tests. When reviewing, read the
full file first, then check each section, capturing the exact rule from
[references/cheatsheet.md](references/cheatsheet.md) for every finding.

### Step 3: EMIT — deliver code or the structured report

For generation: output the code, its tests, and a short rationale, then
run `ruff`, `black`/`ruff format`, and `mypy` before declaring done. For
review: emit the report exactly as specified in
[references/standard.md](references/standard.md) (Summary → Detailed
Findings → Positive Highlights → Recommendations → References), citing
`references/links.md` rather than repeating URLs.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It runs, so the style doesn't matter." | Code is read far more than written; style is how the next reader trusts it. Apply the standard. |
| "I'll add type hints and docstrings later." | Later never comes. Public signatures get annotations and docstrings in the same change. |
| "This finding is just my preference." | If it isn't in `references/standard.md`, it isn't a finding — cite the rule or drop it. |
| "The file is huge, I'll skim it." | Skimming misses cross-file context. Read the full file before commenting on parts of it. |

## Red Flags

- A review finding with no PEP / Google citation, or a fabricated one.
- Generated code shipped without tests or without running `ruff`/`mypy`.
- Bare `except:`, mutable default arguments, or string-built SQL slipping through.
- Applying rules out of order, or commenting on a file read only in part.

## Verification

- [ ] Generate vs. review determined; Python version confirmed.
- [ ] Every finding cites a rule from `references/standard.md` / `cheatsheet.md`.
- [ ] Sections applied in the prescribed order across the whole file.
- [ ] Generation path: `ruff`, `black`/`ruff format`, and `mypy` run clean; tests included.
- [ ] Review path: report emitted in the exact Output Format, with no invented URLs.
