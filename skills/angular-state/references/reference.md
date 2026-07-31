# Angular State Management — Full Reference

> The state-management conventions applied by the `angular-state` skill.
> `SKILL.md` is the lean process that points here; this file holds the
> API table, rules, and modernization checklist.
>
> **Stack:** Angular v20 · Signals · RxJS

## Angular CLI MCP

This skill is loaded with the `angular-cli` MCP server. **You must use it** in the following situations:

- **When validating signal APIs**: query the MCP to confirm the current API surface for `signal()`, `computed()`, `linkedSignal`, `resource`, and related APIs before recommending them.
- **When migrating legacy patterns**: use the MCP to check whether Angular provides an automated migration schematic (e.g., `ng update`) for the pattern being replaced — always prefer official schematics over manual rewrites.
- **When unsure about RxJS/Signals interop**: query the MCP for current guidance on `toSignal`, `toObservable`, and interop utilities before implementing bridging code.

## 1. Signal APIs

| API                              | Use case                                              |
| -------------------------------- | ----------------------------------------------------- |
| `signal()`                       | Local mutable component state                         |
| `computed()`                     | Derived/read-only state                               |
| `model()`                        | Two-way bindings                                      |
| `input()` / `input.required()`   | Component inputs (replaces `@Input()`)                |
| `output()`                       | Component outputs (replaces `@Output() EventEmitter`) |
| `viewChild()` / `contentChild()` | Query-based references                                |
| `linkedSignal`                   | Linked dependent signals                              |
| `resource` / `httpResource`      | Async data fetching                                   |

## 2. Rules

- Prefer `update()` or `set()` — never use `mutate()`.
- Never expose writable signals publicly; expose `ReadonlySignal` or use `computed()`.
- Watch for circular dependencies in `linkedSignal` and `resource` chains.
- Use `BehaviorSubject` only for complex async coordination not expressible with signals.
- Use `async` pipe or `rxLet` for observables not yet migrated to signals.

## 3. Modernization Checklist

When reviewing or modifying existing code, flag and fix these legacy patterns:

| Legacy Pattern                     | Modern Replacement                |
| ---------------------------------- | --------------------------------- |
| `@Input()`                         | `input()` / `input.required()`    |
| `@Output() EventEmitter`           | `output()`                        |
| Constructor injection              | `inject()`                        |
| `*ngIf` / `*ngFor` / `*ngSwitch`   | `@if` / `@for` / `@switch`        |
| `BehaviorSubject` for simple state | `signal()` + `computed()`         |
| `ChangeDetectionStrategy.Default`  | `ChangeDetectionStrategy.OnPush`  |
| `ngClass` / `ngStyle`              | Direct `class` / `style` bindings |
| Class-based guards/resolvers       | Functional equivalents            |
| `NgModules` for new code           | Standalone components             |
