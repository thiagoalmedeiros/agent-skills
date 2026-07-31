# Python Standard — Full Reference

> The complete normative standard applied by the `python-standard`
> skill. `SKILL.md` is the lean process that points here; this file
> holds every rule it enforces. See [cheatsheet.md](cheatsheet.md) for
> the at-a-glance digest and [links.md](links.md) for authoritative
> sources.

The single source of truth for Python style, structure, typing,
documentation, and security inside this project. Use it both when
**generating** new Python code and when **reviewing** existing code.

## Purpose

Provide one authoritative, vendor-neutral specification that an agent
can consult to:

- Write idiomatic Python that complies with PEP 8 / PEP 257 / PEP 484
  and the Google Python Style Guide.
- Review existing Python and produce a structured report with
  references to the violated rule.

## When to Use

- The user asks to create, refactor, or review a `.py` file.
- The user asks "is this idiomatic?" or "does this follow PEP 8?".
- The user wants a style/lint pre-flight before commit.
- The user wants the standard the project agrees to follow.

Do **not** use this skill for:

- Non-Python code reviews (use the matching language skill).
- Build, packaging, or dependency selection decisions.
- Framework-specific architecture (Django, FastAPI, Flask, etc.).

## Universal Principles

These principles are referenced by every section below — they are
the DRY anchor for the rest of the document.

1. **Readability first.** "Code is read much more often than it is
   written." Optimize for the next reader.
2. **Consistency hierarchy.** Consistency within a function > within
   a file > within a project > with the global standard. When the
   surrounding code already follows a convention, match it.
3. **Explicit is better than implicit.** Prefer explicit returns,
   explicit `None` checks, explicit types on public APIs.
4. **One way to do it.** When a modern syntax replaces an older one,
   use the modern one (`X | None`, `list[int]`, f-strings) unless
   targeting an interpreter that does not support it.
5. **Fail loudly, fail close to the source.** Validate at boundaries.
   Raise specific exceptions. Never swallow exceptions silently.
6. **Standards are tools, not laws.** Diverge only with a written
   reason in code (`# noqa: <rule> — <reason>`).

## Design Principles — DRY & SOLID

Every piece of Python this skill generates or approves must respect
these principles. Reviews must flag violations as a `Maintainability`
finding.

### DRY (Don't Repeat Yourself)

- Extract any logic that appears in three or more places into a
  helper function or method.
- Constants live once, at module scope or in a dedicated
  `constants.py` — never inlined as magic numbers/strings.
- Repeated string templates become `str.format` templates or
  `Template` instances defined once.
- Reusable validation goes into a single Pydantic model /
  `dataclass` / function — never duplicated across handlers.
- Configuration values come from one source (env, settings module,
  Pydantic settings) and are imported, never re-read in each call site.
- Test fixtures replace copy-pasted setup blocks; parametrize
  (`@pytest.mark.parametrize`) instead of duplicating test bodies.
- Avoid premature abstraction: tolerate duplication at two
  occurrences; refactor at the third.

### SOLID

- **Single Responsibility.** A module, class, or function has one
  reason to change. If a docstring needs the word "and" to list
  responsibilities, split it.
- **Open/Closed.** Extend behavior via composition, strategy
  functions, or subclassing — not by editing existing branches.
  Plug-in points use `abc.ABC` or `typing.Protocol` rather than
  `isinstance` chains.
- **Liskov Substitution.** Subclasses must accept every input the
  parent accepts and produce every output the parent guarantees.
  Never tighten preconditions or weaken postconditions in a
  subclass.
- **Interface Segregation.** Prefer many small `Protocol`s over one
  fat one. Callers should depend only on the methods they use.
  Split a class when half its consumers use only half its methods.
- **Dependency Inversion.** High-level modules depend on
  `Protocol`s / abstract types injected via constructor parameters
  — never on concrete classes constructed inline. This is what
  makes code testable without monkey-patching.

## Standards & Conventions

### Layout & formatting (PEP 8)

- Indentation: 4 spaces, never tabs.
- Line length: 80 columns (Google) or project-configured limit;
  docstrings/comments wrap at 72.
- Blank lines: 2 between top-level definitions, 1 between methods.
- Whitespace: no space inside `()`/`[]`/`{}`, single space around
  binary operators, no space around `=` in keyword arguments.
- String quotes: pick one (`'` or `"`) per file and stick to it;
  always `"""` for docstrings.
- Trailing commas in multi-line literals; mandatory for single-element
  tuples: `(x,)`.

### Imports (PEP 8 + Google)

Order with one blank line between groups:

1. `from __future__` imports
2. Standard library
3. Third-party
4. Local application

Rules:

- One import per line: `import os`, not `import os, sys`.
- Use absolute imports. Relative imports are acceptable only inside
  large packages.
- Never `from module import *`.
- `import numpy as np` only for established short aliases.

### Naming (PEP 8 + Google)

| Kind                  | Convention             | Example                      |
| --------------------- | ---------------------- | ---------------------------- |
| Modules / packages    | `lower_with_under`     | `my_module`                  |
| Classes / Exceptions  | `CapWords` (+ `Error`) | `MyClass`, `ConnectionError` |
| Functions / methods   | `lower_with_under()`   | `my_function()`              |
| Constants             | `CAPS_WITH_UNDER`      | `MAX_RETRIES`                |
| Variables (any scope) | `lower_with_under`     | `instance_var`               |
| Type variables        | `_T`, `_P`             | `_T = TypeVar("_T")`         |

Avoid `l`, `O`, `I` as single-letter names. Avoid type-suffixing
(`id_dict`) when the type is obvious. Scope drives descriptiveness:
the wider the scope, the more descriptive the name.

## Documentation

### Docstrings (PEP 257 + Google)

- Triple double quotes, summary line first, period at the end.
- One blank line between summary and body when a body exists.
- Google sections (in order): `Args:`, `Returns:` (or `Yields:`),
  `Raises:`. Omit sections that do not apply.

Function template:

```python
def fetch_rows(table: str, keys: Sequence[str]) -> dict[str, tuple[str, ...]]:
    """Fetch rows from a database table.

    Args:
        table: Name of the database table.
        keys: Row keys to fetch.

    Returns:
        Mapping of key to row tuple; empty when no rows match.

    Raises:
        IOError: Database is unreachable.
    """
```

### Comments

- Block comments are full sentences, capitalized, terminated by a
  period.
- Inline comments are separated from code by at least two spaces.
- TODO format: `# TODO(username): description` or
  `# TODO: <issue-ref> — description`. Comments must stay accurate
  when code changes.

## Type / Schema Discipline

### Type hints (PEP 484 + Google)

- Annotate public function signatures. Do not annotate `self`/`cls`
  (use `Self` only where it materially improves the API).
- `__init__` returns `None`; do not annotate the return type.
- Modern syntax (Python 3.10+): `X | None`, `list[int]`,
  `dict[str, int]`. For parameters, prefer `collections.abc.Sequence`,
  `Mapping`, etc. over concrete types.
- Implicit `None` defaults are wrong: `def f(x: str = None)` →
  `def f(x: str | None = None)`.
- Type-only imports go behind `if TYPE_CHECKING:`.

### Schema / data classes

- Prefer `dataclasses.dataclass(slots=True, frozen=True)` for
  immutable records.
- Use `typing.TypedDict` or Pydantic at boundaries only — keep core
  logic typed with stdlib primitives.

## Code Quality & Best Practices

- Implicit truthiness: `if not seq:`, `if foo is None:`. Never
  compare to `True`/`False`.
- Use `isinstance(x, int)`, not `type(x) is int`.
- No bare `except:`. Catch specific exceptions. Re-raise with
  `raise X from Y` to preserve causes.
- Custom exception classes derive from `Exception` (not
  `BaseException`) and end in `Error` when they signal failure.
- Strings: f-strings for formatting, `''.join(parts)` for loops.
- Logging: use `%`-style placeholders so the logging call can defer
  formatting: `log.info("user %s logged in", user_id)`.
- No mutable default arguments. Use `None` and assign inside.
- Resource management: prefer `with` blocks for any closeable
  resource. Use `contextlib.closing` for legacy objects.
- Comprehensions: keep to a single `for` clause and at most one
  `if`. Otherwise, write a normal loop.
- Avoid `lambda` for anything past a one-liner. Prefer `operator`
  module helpers (`attrgetter`, `itemgetter`).
- Power features (custom metaclasses, `__del__` cleanup, import
  hacks, reflection tricks) are forbidden outside well-justified
  framework code.

## Security

Aligned with the OWASP Python and Top 10 guidance (see
`links.md`).

- Never build SQL via string concatenation or f-strings. Always use
  parameterized queries.
- Never `eval`, `exec`, `compile`, or `__import__` on untrusted input.
- `yaml.safe_load`, not `yaml.load`. Avoid `pickle` on untrusted data.
- Validate at boundaries with allowlists.
- Never hard-code secrets. Read them from the environment or a
  managed secret store.
- Always set timeouts on `requests`, `httpx`, `urllib` calls.
- Hash passwords with `argon2`/`bcrypt`/`scrypt`, never plain SHA.

## Performance

- Build strings with `''.join(iterable)` inside loops, not `+=`.
- Iterate `for k, v in d.items()`; do not call `.keys()`/`.readlines()`
  unless you need the materialized list.
- Use generators for large pipelines.
- `bisect`, `heapq`, `collections.deque`, and `set` membership all
  beat the naive list equivalent — reach for them when the data set
  grows.

## Testing & Validation

- Tests live in `tests/` mirroring the package layout.
- Test names use `test_<unit>_<state>_<expectation>`.
- `pytest` is the default runner; `unittest` is acceptable inside
  larger code bases that already use it.
- Use fixtures over setUp/tearDown classes.
- Assertions in production code are forbidden for control flow
  (`-O` disables them). Validate with `if … raise …`.
- Aim for fast, isolated tests; mark slow/integration tests with
  pytest markers.

## Tooling

Recommended toolchain (configure in `pyproject.toml` so it is shared):

| Tool        | Purpose                                              |
| ----------- | ---------------------------------------------------- |
| `ruff`      | Lint + import sort + many PEP 8 / pyflakes / bugbear |
| `black`     | Auto-format (or `ruff format`)                       |
| `mypy`      | Static type checking (`--strict` on new modules)     |
| `pytest`    | Test runner                                          |
| `bandit`    | Security lint                                        |
| `pip-audit` | Dependency vulnerability scan                        |

Suppress rules locally with `# noqa: <rule> — reason` and never with
blanket `# noqa`. Type ignores use `# type: ignore[<code>]`.

## Output Format (when used for review)

Produce the following structured report:

### Summary

- Overall Assessment: Excellent / Good / Fair / Needs Improvement
- PEP 8 Compliance: High / Medium / Low
- Google Style Compliance: High / Medium / Low
- Key Strengths (2–4 bullets)
- Critical Issues (if any)

### Detailed Findings

Group by category. Each finding:

- **Category** — Style / Documentation / Quality / Security / Performance / Maintainability
- **Severity** — Critical / High / Medium / Low
- **Lines** — exact line numbers
- **Reference** — PEP / Google section identifier
- **Current Code** — verbatim excerpt
- **Recommended Fix** — corrected code
- **Rationale** — why it matters

### Positive Highlights

### Recommendations (priority-ordered)

### References

Link to `links.md` — do not repeat URLs here.

## Review Procedure

1. Read the full file before commenting on parts of it.
2. Apply the sections above in this order: Standards & Conventions →
   Documentation → Type Discipline → Code Quality → Security →
   Performance → Testing → Tooling.
3. Compare findings against `cheatsheet.md` for the exact
   rule wording.
4. Emit the report in the **Output Format** above.

## Generation Procedure

1. Confirm the target Python version (default: the project's
   `pyproject.toml`, fall back to the highest currently-supported
   CPython).
2. Generate code that already obeys every rule in **Standards &
   Conventions**, **Documentation**, and **Type Discipline**.
3. For new public APIs, add Google-style docstrings and tests in
   the same change.
4. Run `ruff`, `black`/`ruff format`, and `mypy` before declaring the
   work done.

## References

- See [cheatsheet.md](cheatsheet.md) for the
  condensed rules digest.
- See [links.md](links.md) for the canonical
  official URLs (PEP 8/257/484/20, Google Python Style Guide, OWASP).
