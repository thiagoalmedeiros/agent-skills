# Angular Components — Full Reference

> The conventions applied by the `angular-components` skill. `SKILL.md`
> is the lean process that points here; this file holds the tables,
> boilerplate, and per-area rules.
>
> **Stack:** Angular v20 · TypeScript (strict) · DDD architecture

## Angular CLI MCP

This skill is loaded with the `angular-cli` MCP server. **You must use it** in the following situations:

- **Before generating a new component**: run `ng generate component --dry-run` via the MCP to confirm the expected scaffolding, then apply project-specific conventions on top.
- **When unsure about a pattern**: query the MCP to validate against the current CLI behavior before applying it (e.g., decorator options, standalone APIs, DI changes).
- **When auditing**: use the MCP to resolve any ambiguity about whether a given pattern is current or deprecated in the installed Angular version.
- **When validating an implementation**: run a dry-run generate and compare the CLI output against the code under review to surface structural drift.

## 1. Component Types & Locations

| Type                    | Purpose                                                  | Location                               |
| ----------------------- | -------------------------------------------------------- | -------------------------------------- |
| **Presentation (Dumb)** | Display data, emit events. Minimal service dependencies. | `src/app/components/<feature>/<name>/` |
| **Container (Smart)**   | Manage state, fetch data, pass to dumb components.       | `src/app/containers/<feature>/<name>/` |
| **Page**                | Route-level entry points.                                | `src/app/pages/<page>/`                |

## 2. File Structure

Every component must have:

- `<name>.component.ts` — Logic
- `<name>.component.html` — Template
- `<name>.component.scss` — Styles (use `:host` or Tailwind; keep empty if no custom styles needed)

## 3. Component Boilerplate

```typescript
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-<name>',
  imports: [TranslateModule],
  templateUrl: './<name>.component.html',
  styleUrls: ['./<name>.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <Name>Component {
  // Inputs — use signal-based inputs
  public data = input.required<DataType>();

  // Outputs — use function-based outputs
  public action = output<void>();

  // Dependencies — use inject()
  // private readonly _service = inject(MyService);
}
```

> `standalone: true` is the default in Angular v20+ — do **NOT** set it explicitly.

## 4. Dependency Injection

- Always use `inject()` in class fields — never constructor injection.
- Use `InjectionToken` for abstracting external dependencies.
- Services should be `providedIn: 'root'` unless scoped to a feature.

## 5. Services

- Keep services stateless or encapsulate state with Signals.
- Expose `ReadonlySignal` or `Observable` (use `as$` suffix for observables); never expose writable signals publicly.
- Centralize HTTP calls in dedicated API services.
- Handle errors at the service layer; map to domain-safe types. Never swallow errors silently.

## 6. Routing

- Lazy load feature routes using `loadComponent` or `loadChildren`.
- Use functional guards (`CanActivateFn`, etc.) — never class-based guards.
