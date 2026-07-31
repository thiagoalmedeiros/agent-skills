# Angular UI Conventions — Full Reference

> The template and styling conventions applied by the `angular-ui`
> skill. `SKILL.md` is the lean process that points here; this file
> holds the rules and examples.
>
> **Stack:** Angular v20 · Tailwind CSS · SCSS

## Angular CLI MCP

This skill is loaded with the `angular-cli` MCP server. **You must use it** in the following situations:

- **When validating template syntax**: query the MCP to confirm current control flow syntax (`@if`, `@for`, `@switch`) and block-syntax details before writing or correcting templates.
- **When reviewing directive usage**: use the MCP to verify whether a directive (e.g., `NgClass`, `NgStyle`, `rxLet`) is still recommended or has a preferred native replacement in the current Angular version.
- **When unsure about styling encapsulation**: query the MCP for current `ViewEncapsulation` options and `:host` / `:host-context` behavior before making encapsulation decisions.

## 1. Template Conventions

- Use **native control flow**: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use `@for` with `track` (mandatory in Angular v20).
- Use `class` / `style` bindings over `ngClass` / `ngStyle` where simple.
- Move complex expressions to `computed()` signals or pipes — keep templates declarative.
- Use `rxLet` or `async` pipe for observables not yet migrated to signals.

### Template Example

```html
<div class="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
  <h2 class="text-xl font-bold text-gray-800">{{ data().title }}</h2>

  @if (data().isActive) {
  <span class="text-green-500">Active</span>
  }

  <button (click)="action.emit()" class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">
    {{ 'COMMON.ACTION' | translate }}
  </button>
</div>
```

## 2. Styling

- **Tailwind first**: Use utility classes in templates for layout and spacing.
- **SCSS for theming**: Use CSS variables and `:host` for component-specific theming.
- **No global leaks**: Do not use global classes to style component internals.
- **No `::ng-deep`**: Use `:host` and `:host-context` sparingly.
- Reuse variables/mixins from `src/styles/`.
- Use `responsive-class.directive.ts` for dynamic classes based on breakpoints.

```scss
:host {
  display: block;
  background-color: var(--fill-secondary);
}

.text_secondary {
  color: var(--text-secondary);
}
```
