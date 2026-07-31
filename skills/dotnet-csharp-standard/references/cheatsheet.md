# .NET / C# Standard — Cheatsheet

Short, stable digest. Consult `SKILL.md` for full guidance and
`links.md` for the authoritative source.

## Design Principles — DRY & SOLID

- **DRY:** constants in `const` / `static readonly` fields; extract
  on third repetition; config via `IOptions<T>` / `IConfiguration`;
  test data via `[Theory]` / `[InlineData]`.
- **SRP:** if `<summary>` needs "and", split. Constructors with >4
  dependencies are a smell.
- **OCP:** extend via new types, strategy/decorator, or DI
  registrations; never edit existing `switch`/`if` chains.
- **LSP:** no `NotSupportedException` from overrides. Prefer
  composition over inheritance when this is hard.
- **ISP:** many small role-based interfaces (`IOrderReader`,
  `IOrderWriter`) over one fat repository.
- **DIP:** constructor-injected abstractions only; no `new` of
  services in business code; no `IServiceProvider` lookup outside
  composition roots.

## Formatting

- 4-space indent, never tabs.
- Allman braces.
- File-scoped namespaces (`namespace Foo;`).
- `using` outside namespace; `System.*` first.
- Language keywords: `string`, `int`, `bool` (not `String`, `Int32`).
- `var` when the RHS makes the type obvious; explicit otherwise.

## Naming

| Element                      | Style         |
| ---------------------------- | ------------- |
| Types / methods / properties | `PascalCase`  |
| Interfaces                   | `IPascalCase` |
| Type parameters              | `TPascalCase` |
| Private instance fields      | `_camelCase`  |
| Static private fields        | `s_camelCase` |
| Thread-static private fields | `t_camelCase` |
| Constants (any scope)        | `PascalCase`  |
| Locals / parameters          | `camelCase`   |
| Async methods                | `…Async`      |
| Attributes                   | `…Attribute`  |
| Exceptions                   | `…Exception`  |

## Project defaults

- `<Nullable>enable</Nullable>`
- `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`
- `<AnalysisLevel>latest</AnalysisLevel>`
- Roslyn analyzers + StyleCop + SonarAnalyzer

## XML docs

Required on `public`/`protected` members of libraries: `<summary>`,
`<param>`, `<returns>`, `<typeparam>`, `<exception>`.

## Async rules

- End method names in `Async`.
- Accept a `CancellationToken` on every I/O async.
- Library code: `.ConfigureAwait(false)` on every `await`.
- No `.Result`, `.Wait()`, `.GetAwaiter().GetResult()`.
- `async void` only for event handlers.

## Nullability

- Annotate (`string?` vs `string`).
- `ArgumentNullException.ThrowIfNull(arg)` for guards.
- `!` only when provably non-null + comment.

## Records / structs / classes

- `record`/`record struct` for immutable data.
- `readonly struct` for small (<16B) immutables.
- `sealed class` by default.

## Exceptions

- Throw the most specific BCL exception.
- `catch (Exception)` requires a justification comment and a rethrow.
- Custom exceptions: derive from `Exception`, end in `Exception`,
  provide the standard three constructors.

## Disposal

- `IDisposable` / `IAsyncDisposable` when owning resources.
- `using var x = …;` declarations.

## DI

- Constructor injection only.
- Depend on abstractions.
- Pick lifetimes intentionally.

## Security (OWASP .NET)

- Parameterized queries only.
- `PasswordHasher` / Argon2 — never raw SHA.
- `System.Security.Cryptography` primitives; no custom crypto.
- HTTPS, antiforgery, `[Authorize]` by default.
- `HttpClient` with `Timeout` + `CancellationToken`.
- `dotnet list package --vulnerable` in CI.
- Secrets via User Secrets / Key Vault / env vars.

## Tooling

`dotnet format`, `dotnet build -warnaserror`, `dotnet test`,
`dotnet list package --vulnerable`, BenchmarkDotNet for hot paths.

## Suppressions

`#pragma warning disable <code> // Justification: …`, scoped to
the smallest region. Never blanket-suppress.
