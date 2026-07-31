---
name: angular-ui
version: 1.0.0
description: >
  UI conventions for Angular templates and styling (Angular v20, Tailwind
  CSS, SCSS) — native control flow, Tailwind-first layout, and scoped SCSS
  theming.
  USE FOR: writing Angular templates, applying native control flow
  (@if/@for/@switch), styling components, and reviewing UI code for
  convention compliance.
  DO NOT USE FOR: component boilerplate and DI (use
  skill:angular-components), state management logic (use
  skill:angular-state), or non-UI tasks.
argument-hint: "Optional: file path or component name to audit"
---

# Angular UI Conventions

## Overview

The single source of truth for Angular v20 template control flow and
Tailwind/SCSS styling in this codebase. The full rules and examples live
in [references/reference.md](references/reference.md); this file is the
process that applies them. **Prime directive: templates use native
control flow (`@if`/`@for` with `track`/`@switch`) and stay declarative —
complex logic moves to `computed()` or pipes, styling is Tailwind-first
with scoped SCSS, and no `*ngIf`/`*ngFor`/`::ng-deep` survive.**

## When to Use

- Writing or correcting an Angular template.
- Styling a component with Tailwind utilities and scoped SCSS.
- Auditing UI code for convention compliance.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — decide write vs. audit

If a file path or component name is given, read the file(s) and prepare a
compliance audit. If writing new UI, prepare to apply the conventions
proactively. If no context is given, ask the user whether they want an
audit or guidance for new code, then proceed. Load
[references/reference.md](references/reference.md).

### Step 2: APPLY — enforce template and styling conventions

Apply the reference's rules: native control flow (`@if`/`@for` with
`track`/`@switch`), `class`/`style` bindings over `ngClass`/`ngStyle`,
complex expressions lifted into `computed()`/pipes, Tailwind-first
layout, and scoped SCSS theming via `:host` and CSS variables — no global
leaks, no `::ng-deep`. Use the `angular-cli` MCP to confirm current
control-flow syntax, directive currency, and encapsulation behavior.

### Step 3: EMIT — deliver the template or the violations report

When writing, output templates/styles that already conform. When
auditing, produce a violations report with the exact location of each
issue and the suggested native replacement.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "`*ngIf`/`*ngFor` still compile." | v20 uses `@if`/`@for`. Flag every structural directive and migrate it. |
| "`@for` without `track` is fine for small lists." | `track` is mandatory in v20 — add it every time. |
| "`::ng-deep` is the quick fix." | It leaks styles and is deprecated. Use `:host`/`:host-context` instead. |
| "The logic can live in the template." | Complex expressions belong in `computed()` or a pipe — keep templates declarative. |

## Red Flags

- `*ngIf`/`*ngFor`/`*ngSwitch`, or `@for` missing `track`.
- `::ng-deep` or global classes reaching into component internals.
- Non-trivial expressions inline in the template instead of `computed()`/pipes.
- Styling/encapsulation decisions made without checking the `angular-cli` MCP.

## Verification

- [ ] Write vs. audit determined (or the user asked when ambiguous).
- [ ] Templates use native control flow with `track`; no legacy structural directives remain.
- [ ] Styling is Tailwind-first with scoped SCSS; no `::ng-deep` or global leaks.
- [ ] `angular-cli` MCP consulted for control-flow/directive/encapsulation currency.
- [ ] Audit output pinpoints each violation's location with a concrete fix.
