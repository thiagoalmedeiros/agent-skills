# Python Standard — Cheatsheet

A short, stable digest of the rules in `SKILL.md`. Use this when you
need the rule at a glance; consult `SKILL.md` for the full guidance
and `links.md` for the authoritative source.

## Design Principles — DRY & SOLID

- **DRY:** extract on third repetition; constants live once; one
  config source; parametrize tests (`@pytest.mark.parametrize`).
- **SRP:** if the docstring needs "and", split it.
- **OCP:** extend via composition / `Protocol` strategies; don't
  edit existing branches.
- **LSP:** subclasses accept every parent input, return every
  parent guarantee.
- **ISP:** many small `Protocol`s, not one fat interface.
- **DIP:** depend on `Protocol`s injected via constructor; no
  inline `new` of dependencies.

## Formatting

- 4-space indent, never tabs.
- 80-column limit (72 for docstrings/comments).
- 2 blank lines between top-level defs, 1 between methods.
- No space inside brackets; single space around binary operators;
  no space around `=` in keyword args.
- One quote style per file; `"""` for docstrings.

## Imports

- Order: `__future__` → stdlib → third-party → local.
- One module per `import`; never `from m import *`.
- Absolute imports; aliases only for well-known short forms.

## Naming

| Kind      | Style              |
| --------- | ------------------ |
| Module    | `lower_with_under` |
| Class     | `CapWords`         |
| Exception | `CapWordsError`    |
| Function  | `lower_with_under` |
| Constant  | `CAPS_WITH_UNDER`  |
| TypeVar   | `_T`               |

Avoid `l`, `O`, `I` as single-letter names.

## Docstrings (PEP 257 + Google)

- Summary line, period, blank line, body.
- Sections: `Args:`, `Returns:`/`Yields:`, `Raises:`.
- `__init__` docs go on the class.

## Types (PEP 484)

- Annotate public signatures.
- `X | None` not `Optional[X]`; `list[int]` not `List[int]`.
- `from __future__ import annotations` for forward references.
- Use `collections.abc` (`Sequence`, `Mapping`) for parameters.
- `if TYPE_CHECKING:` for type-only imports.

## Idioms

- `if not seq:` / `if x is None:` — never `== None`, never `== True`.
- `isinstance(x, T)` — never `type(x) is T`.
- f-strings for user-facing formatting; `%`-style for `logging`.
- `''.join(parts)` to build strings inside loops.
- No mutable default arguments — use `None` and assign inside.
- `with` for every closeable resource.
- Specific `except`, never bare. `raise X from Y`.

## Security (OWASP)

- Parameterized SQL only.
- `yaml.safe_load`, not `yaml.load`.
- Never `eval`/`exec`/`pickle` on untrusted input.
- Always set network call timeouts.
- Read secrets from env or a secret manager.
- Password hashing: `argon2` / `bcrypt` / `scrypt`.

## Tooling

`ruff`, `black` (or `ruff format`), `mypy --strict` on new modules,
`pytest`, `bandit`, `pip-audit`. Config lives in `pyproject.toml`.

## Suppressions

`# noqa: <rule> — reason`, `# type: ignore[<code>]`. Never blanket
suppressions.
