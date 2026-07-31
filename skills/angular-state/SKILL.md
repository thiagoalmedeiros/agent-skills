---
name: angular-state
version: 1.0.0
description: >
  Standards for Angular state management using Signals and RxJS (Angular
  v20) — signal-first state, read-only public surfaces, and a legacy
  modernization checklist.
  USE FOR: writing signal-based state, reviewing or migrating legacy
  @Input/@Output/BehaviorSubject patterns, and resolving questions about
  reactive state design.
  DO NOT USE FOR: component boilerplate (use skill:angular-components),
  template or styling conventions (use skill:angular-ui), or non-Angular
  tasks.
argument-hint: "Optional: file path or feature area to audit for state management patterns"
---

# Angular State Management

## Overview

The single source of truth for reactive state in this Angular v20
codebase — signals first, RxJS only where signals can't express the
coordination. The API table, rules, and modernization checklist live in
[references/reference.md](references/reference.md); this file is the
process that applies them. **Prime directive: state is signal-first —
`signal()`/`computed()` for state and derivation, writable signals never
exposed publicly, and `mutate()` never used; RxJS is reserved for genuine
async coordination.**

## When to Use

- Writing new signal-based component or feature state.
- Reviewing or migrating legacy `@Input`/`@Output`/`BehaviorSubject` patterns.
- Resolving a question about reactive state design or Signals/RxJS interop.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — decide write vs. audit

If a file path or feature area is given, read the file(s) and prepare an
audit against the rules and modernization checklist. If writing new
state, prepare to apply the conventions proactively. If no context is
given, ask the user whether they want an audit or guidance for new code,
then proceed. Load [references/reference.md](references/reference.md).

### Step 2: APPLY — enforce signal-first state

Apply the reference's rules: pick the right API from the table, mutate
only via `update()`/`set()`, expose `ReadonlySignal`/`computed()` never
writable signals, and reserve `BehaviorSubject` for async coordination.
Walk the Modernization Checklist and flag every legacy pattern. Use the
`angular-cli` MCP to confirm current signal APIs and — when migrating —
to prefer an official `ng update` schematic over a manual rewrite.

### Step 3: EMIT — deliver the state code or the violations report

When writing, output state code that already conforms. When auditing,
produce a violations report with the exact location of each legacy
pattern and its modern replacement.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "`mutate()` is convenient." | It's banned here — use `update()` or `set()`. |
| "Exposing the writable signal is simpler." | It breaks encapsulation. Expose `ReadonlySignal`/`computed()` only. |
| "`BehaviorSubject` is what I know." | For simple state use `signal()`+`computed()`; keep `BehaviorSubject` for real async coordination. |
| "I'll migrate the legacy pattern by hand." | Prefer an official `ng update` schematic when one exists — check the MCP first. |

## Red Flags

- `mutate()` anywhere, or a writable signal exposed on a public surface.
- Circular dependencies in `linkedSignal`/`resource` chains.
- `BehaviorSubject` used for state that a `signal()`+`computed()` would express.
- A migration hand-rolled without checking for an official schematic.

## Verification

- [ ] Write vs. audit determined (or the user asked when ambiguous).
- [ ] Correct signal API chosen; state mutated only via `update()`/`set()`.
- [ ] No writable signals exposed publicly; no `mutate()`.
- [ ] Modernization Checklist walked; each legacy pattern flagged with its replacement.
- [ ] `angular-cli` MCP consulted for API currency and migration schematics.
