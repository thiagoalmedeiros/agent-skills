---
name: angular-components
version: 1.0.0
description: >
  Standards and boilerplate for Angular components (Angular v20,
  TypeScript strict, DDD architecture) — signal inputs/outputs,
  inject()-based DI, OnPush, and correct component/container/page layout.
  USE FOR: creating new components, auditing existing components for
  standards compliance, and questions about component structure,
  dependency injection, services, or routing.
  DO NOT USE FOR: state management patterns (use skill:angular-state),
  template and styling conventions (use skill:angular-ui), or non-Angular
  tasks.
argument-hint: "Optional: component name, file path, or feature area to generate or audit"
---

# Angular Components

## Overview

The single source of truth for how components are structured, injected,
and wired in this Angular v20 (TypeScript strict, DDD) codebase. The full
tables, boilerplate, and per-area rules live in
[references/reference.md](references/reference.md); this file is the
process that applies them. **Prime directive: apply the current Angular
v20 idioms — signal `input()`/`output()`, `inject()` in class fields,
`OnPush`, standalone-by-default — and validate against the `angular-cli`
MCP rather than guessing.**

## When to Use

- Creating a new presentation, container, or page component.
- Auditing an existing component for standards compliance.
- Resolving a question about component structure, DI, services, or routing.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — decide generate vs. audit

If a file path or component name is given, read the file(s) and prepare a
compliance audit. If generating new code, prepare to apply the
conventions without being asked. If no context is given, ask the user
whether they want to generate or audit, then proceed. Load
[references/reference.md](references/reference.md).

### Step 2: APPLY — enforce the conventions against the CLI

Apply the reference's rules: correct type/location (component / container
/ page), the three-file structure, the signal-based boilerplate,
`inject()` DI, stateless services exposing read-only signals, and lazy
routes with functional guards. Use the `angular-cli` MCP as the
reference requires — a `--dry-run` generate before scaffolding, and to
confirm any pattern is current, not deprecated, in the installed version.

### Step 3: EMIT — deliver the component or the violations report

When generating, output the component files already conforming to the
conventions. When auditing, produce a violations report with the exact
file location of each issue and a suggested fix, verified against a
CLI dry-run where structure is in question.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "Constructor injection is fine." | This codebase uses `inject()` in class fields — never constructor injection. |
| "`@Input()`/`@Output()` still work." | v20 uses signal `input()`/`output()`. Flag and migrate the legacy decorators. |
| "I'll set `standalone: true` to be explicit." | It's the default in v20+ — setting it is noise. Omit it. |
| "I know the scaffolding, no need for the MCP." | The installed version may differ. A `--dry-run` is the source of truth. |

## Red Flags

- Constructor-injected dependencies, or writable signals exposed publicly.
- `ChangeDetectionStrategy` left at `Default` instead of `OnPush`.
- A component missing its `.html`/`.scss` siblings, or placed in the wrong layer.
- Generating or auditing structure without consulting the `angular-cli` MCP.

## Verification

- [ ] Generate vs. audit determined (or the user asked when ambiguous).
- [ ] Component type/location, file structure, and boilerplate match `references/reference.md`.
- [ ] DI uses `inject()`; services expose read-only signals/observables only.
- [ ] `angular-cli` MCP consulted for scaffolding or pattern-currency questions.
- [ ] Audit output pinpoints each violation's location with a concrete fix.
