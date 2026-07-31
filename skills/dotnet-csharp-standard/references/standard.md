# .NET / C# Standard — Full Reference

> The complete normative standard applied by the `dotnet-csharp-standard`
> skill. `SKILL.md` is the lean process that points here; this file
> holds every rule it enforces. See [cheatsheet.md](cheatsheet.md) for
> the at-a-glance digest and [links.md](links.md) for authoritative
> sources.

The single source of truth for C# style, structure, async patterns,
documentation, and security inside this project. Use it both when
**generating** new C# code and when **reviewing** existing code.

## Purpose

Provide one authoritative, vendor-neutral specification grounded in
Microsoft's own guidance so an agent can:

- Write idiomatic C# that complies with the Framework Design
  Guidelines, the C# coding conventions, and the .NET runtime style.
- Review existing C# and produce a structured report citing the
  exact rule that was violated.

## When to Use

- The user asks to create, refactor, or review a `.cs`, `.csproj`,
  `.sln`, `Directory.Build.props`, or `.editorconfig` file.
- The user asks "is this idiomatic C#?" or "does this follow MS
  guidelines?".
- A PR adds or modifies C# source.

Do **not** use this skill for:

- F#, VB.NET, or other CLR languages.
- ASP.NET application architecture, EF Core schema design, or other
  framework-level decisions.
- Build/dependency selection (which NuGet package to adopt).

### Input Guardrails

- If the provided file is **not C# source** (e.g., F#, VB.NET,
  `.csproj`/`.sln` XML, JSON, YAML, plain text), respond with a
  single sentence declining and naming the detected language;
  do not produce a review.
- If `cheatsheet.md` or `links.md` is not
  accessible, omit the **Reference** field and cite the section
  heading from this document instead. **Never fabricate quotes or
  URLs.**
- If the file exceeds ~500 lines, review in sequential sections of
  ~200 lines and explicitly state which line ranges have been
  covered in this response (and which remain).

### Rule strength (RFC 2119)

Every rule in this document carries one of three strengths:

- **MUST** — no deviation. A violation is always a finding.
- **SHOULD** — deviation allowed only with an inline
  `// Justification: …` comment.
- **MAY** — preference; absence is not a finding.

When a rule is stated as an absolute ("never", "always", "every")
without an explicit qualifier, treat it as **MUST**. The
"Standards are tools, not laws" principle applies **only** to
**SHOULD** and **MAY** rules.

## Universal Principles

These principles anchor every section below.

1. **Clarity over cleverness.** If two readers disagree on what
   code does, simplify it.
2. **Follow the framework you ship on.** Match BCL naming, BCL
   exception types, and BCL async patterns.
3. **Be explicit at API boundaries.** Public surface gets explicit
   types, nullability, and XML doc comments. Internals may rely on
   `var` and inferred types.
4. **Allocate intentionally.** Prefer value types, `Span<T>`,
   pooled buffers, and `async`/`await` over hand-rolled threading.
5. **Fail loudly.** Throw the most specific exception. Never
   swallow. Never catch `Exception` without rethrowing.
6. **Standards are tools, not laws.** Diverge only with an
   `// Justification:` comment and an `.editorconfig` suppression.

## Design Principles — DRY & SOLID

Every piece of C# this skill generates or approves must respect
these principles. Reviews must flag violations as a
`Maintainability` finding.

### DRY (Don't Repeat Yourself)

- Constants live once, in a `static class` of constants or as
  `const` / `static readonly` fields on the owning type — never
  inlined as magic numbers or strings.
- Extract repeated logic into private methods, extension methods,
  or shared services. Three occurrences → refactor.
- Repeated guards (`ArgumentNullException.ThrowIfNull`,
  range checks) belong in a single extension or helper.
- Configuration values flow through `IOptions<T>` /
  `IConfiguration`; never re-read from `Environment` inside
  business code.
- Use generics, base classes, or `record` inheritance to share
  shape between similar DTOs — not copy-paste.
- Test data lives in `Theory`/`InlineData` or builder helpers, not
  duplicated across test methods.
- Tolerate duplication at two occurrences; refactor at the third.

### SOLID

- **Single Responsibility.** A class has one reason to change. If
  the XML `<summary>` uses the word "and", split it. Constructors
  with **more than 4 dependencies** are a smell — flag as a
  **Medium** severity `Maintainability` finding.
- **Open/Closed.** Extend via new types, strategy/decorator
  patterns, or DI registrations — not by editing existing
  switch/`if` chains. Use polymorphism or pattern matching with
  `switch` expressions on a sealed type hierarchy.
- **Liskov Substitution.** A derived class must accept every input
  the base accepts and honor every postcondition. Do not throw
  `NotSupportedException` from overrides — that signals an
  incorrect hierarchy. Prefer composition over inheritance when
  this rule is hard to satisfy.
- **Interface Segregation.** Prefer many small, role-based
  interfaces (`IOrderReader`, `IOrderWriter`) over one fat one
  (`IOrderRepository` with 20 methods). Callers depend only on the
  members they use.
- **Dependency Inversion.** High-level code depends on abstractions
  (`ILogger<T>`, custom interfaces, `IOptions<T>`) injected via the
  constructor. No `new` of services inside business logic; no
  `ServiceLocator` / `IServiceProvider` lookups outside composition
  roots.

## Standards & Conventions

### Layout & formatting (C# coding conventions)

- Indentation: 4 spaces, never tabs.
- Allman braces: each brace on its own line.
- One statement and one declaration per line.
- One blank line between methods; logical groupings within a method
  may use a single blank line.
- File-scoped namespaces (`namespace Foo.Bar;`) on new files.
- `using` directives outside the namespace, sorted: `System.*` first,
  then alphabetical; enable `dotnet_sort_system_directives_first`.
- Use C# language features for type names: `string`, `int`, `bool`
  (not `String`, `Int32`, `Boolean`). **(MUST)**
- **`var` usage (MUST).** Use `var` only when the type appears
  literally on the right-hand side — i.e. `new T(...)`, a cast
  (`(T)x`), or a typed literal (`1L`, `"x"`, `default(T)`).
  Otherwise use the explicit type. This rule applies uniformly to
  public and internal code; there is no public-vs-internal
  distinction. (This supersedes the "Internals may rely on `var`
  and inferred types" wording in the Universal Principles.)

### Naming (Framework Design Guidelines)

| Element                           | Convention    | Example                  |
| --------------------------------- | ------------- | ------------------------ |
| Namespaces, types, methods, props | `PascalCase`  | `OrderService`           |
| Public / protected fields         | `PascalCase`  | `MaxRetries`             |
| Private instance fields           | `_camelCase`  | `_logger`                |
| Static private fields             | `s_camelCase` | `s_cache`                |
| Thread-static private fields      | `t_camelCase` | `t_buffer`               |
| Constants (any scope)             | `PascalCase`  | `MaxBufferSize`          |
| Local variables / parameters      | `camelCase`   | `userId`                 |
| Interfaces                        | `IPascalCase` | `IOrderRepository`       |
| Type parameters                   | `TPascalCase` | `TResult`                |
| Async methods                     | `…Async`      | `LoadAsync`              |
| Attributes                        | `…Attribute`  | `RetryAttribute`         |
| Exceptions                        | `…Exception`  | `OrderNotFoundException` |

Avoid Hungarian notation. Avoid abbreviations (`db`, `ctx`) outside
short loop variables. Avoid `m_` or `c_` field prefixes — they are
not in the Microsoft conventions.

### Project & solution layout

- `src/` for production projects, `tests/` for test projects.
- One type per file; filename matches the type name.
- Each project has an `.editorconfig` (root or repo) enabling the
  Microsoft analyzers and nullable reference types.
- `Directory.Build.props` defines shared `<LangVersion>`,
  `<Nullable>enable</Nullable>`, `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`,
  and `<AnalysisLevel>latest</AnalysisLevel>`.

## Documentation

### XML doc comments

Required on every `public` and `protected` member of a library.
Recommended on internals when the intent isn't obvious.

```csharp
/// <summary>
/// Loads an order by its identifier.
/// </summary>
/// <param name="orderId">The order's unique identifier.</param>
/// <param name="cancellationToken">Token to observe for cancellation.</param>
/// <returns>The order, or <see langword="null"/> when not found.</returns>
/// <exception cref="OrderRepositoryException">
/// Thrown when the underlying store is unreachable.
/// </exception>
public Task<Order?> LoadAsync(
    Guid orderId,
    CancellationToken cancellationToken = default);
```

Rules:

- Summary is one sentence, ends with a period.
- Document every `<param>`, `<returns>`, `<typeparam>`, and any
  exception the caller is expected to handle.
- Reference other members with `<see cref="…"/>`; reference literals
  with `<c>…</c>`.

### Inline comments

- Full sentences, capitalized, terminated by a period.
- `// TODO(username): description` or
  `// TODO: <issue-ref> — description`.
- Explain _why_, not _what_ — the code already says what.

## Type / Schema Discipline

### Nullable reference types

- `<Nullable>enable</Nullable>` is mandatory.
- Annotate references: `string?` vs `string`. Do not silence the
  compiler with `!` unless you can prove non-null in a comment.
- Prefer `ArgumentNullException.ThrowIfNull(arg)` for null guards.

### Records, structs, classes

- Use `record` (or `record struct`) for immutable data carriers.
- Use `readonly struct` for immutable value types with roughly
  **1–3 primitive fields** used in hot paths; when in doubt,
  prefer `record class`.
- Use `class` (likely `sealed`) for everything else.
- Seal classes by default; unseal only when inheritance is a
  documented extension point.

### Generics

- Constrain type parameters as tightly as possible (`where T : class,
IDisposable`).
- Name single type parameters `T`; use descriptive `TKey`, `TValue`
  for multiple.

## Code Quality & Best Practices

### Async / await

- Async methods end in `Async` and return `Task`/`Task<T>`/`ValueTask`. **(MUST)**
- Accept a `CancellationToken` parameter on every async method that
  performs I/O. **(MUST)**
- Never block on async with `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`. **(MUST)**
- Library code uses `.ConfigureAwait(false)` on every `await`. **(MUST.)** The only documented exception is a method that
  explicitly requires the captured synchronization context; that
  exception must be called out in an inline
  `// Justification: requires sync context …` comment.
- Avoid `async void` except for event handlers. **(SHOULD)**

### LINQ

- Prefer method syntax for chains of more than two operators.
- Materialize with `.ToList()`/`.ToArray()` once at the boundary;
  pass `IEnumerable<T>` along otherwise — but document if the source
  is single-enumeration.
- Avoid `.Count() > 0` on `IEnumerable<T>`; use `.Any()`.

### Exceptions

- Throw the most specific BCL exception that fits
  (`ArgumentException`, `InvalidOperationException`, `IOException`).
- Define a custom exception only when callers need to catch it
  distinctly. Custom exceptions inherit from `Exception`, end in
  `Exception`, and provide the standard three constructors.
- `catch (Exception)` requires a comment explaining why and must
  rethrow with `throw;` unless logging-and-swallowing is genuinely
  the intent.
- Never catch `OutOfMemoryException`, `StackOverflowException`,
  `ThreadAbortException`, or `AccessViolationException`.

### Resource management

- Implement `IDisposable`/`IAsyncDisposable` whenever a type owns
  unmanaged resources or other disposables.
- Use `using` declarations: `using var stream = File.OpenRead(path);`.
- Follow the standard Dispose pattern when sealing isn't possible.

### Dependency injection

- Depend on abstractions (`ILogger<T>`, `IOptions<T>`,
  domain-specific interfaces), not concretions.
- Constructor injection only — no service locator, no
  property-injected services.
- Register lifetimes intentionally: singleton, scoped, transient.

### Other

- Pattern matching (`is`, `switch` expressions) beats nested
  conditionals.
- `init` setters or constructor-only assignment for immutable
  properties.
- Use the `nameof()` operator for any string that refers to a
  symbol.
- Avoid `dynamic` outside interop scenarios.

## Security

Aligned with the OWASP .NET Cheat Sheet and OWASP Top 10
(see `links.md`).

- Use parameterized queries (Dapper parameters, EF Core LINQ).
  Never build SQL with `string.Format` or interpolation.
- Treat all input as untrusted. Validate with FluentValidation /
  DataAnnotations / explicit checks at the boundary.
- Hash passwords with `Microsoft.AspNetCore.Identity.PasswordHasher`
  or `Konscious.Security.Cryptography.Argon2`; never SHA-256 alone.
- Use the `System.Security.Cryptography` primitives — never custom
  crypto. Prefer `AesGcm`/`ChaCha20Poly1305`.
- ASP.NET Core: antiforgery on state-changing endpoints, HTTPS-only
  cookies, `[Authorize]` by default with explicit `[AllowAnonymous]`.
- Configuration: read secrets from User Secrets in development,
  Azure Key Vault / AWS Secrets Manager / environment variables in
  production. Never hard-code.
- Always pass `HttpClient` a `Timeout` and a `CancellationToken`.
- Enable `dotnet list package --vulnerable` in CI.

## Performance

- Prefer `Span<T>`/`Memory<T>` for hot parsing paths.
- Pool reusable buffers with `ArrayPool<T>.Shared`.
- Use `StringBuilder` for loops that build strings; otherwise
  interpolation is fine.
- Avoid LINQ in hot loops — prefer `for`/`foreach` over `IEnumerable<T>`
  chains.
- Prefer `ValueTask<T>` for hot async paths that frequently complete
  synchronously.
- Benchmark with BenchmarkDotNet — guesses are not data.

## Testing & Validation

- Tests live under `tests/<Project>.Tests/`.
- Default framework: xUnit. NUnit/MSTest are acceptable when the
  project already uses them.
- Naming: `MethodName_State_ExpectedBehavior` (e.g.
  `LoadAsync_OrderMissing_ReturnsNull`).
- Use `FluentAssertions` or `Shouldly` for readable assertions.
- Mock with `NSubstitute` or `Moq` — only abstractions, never
  concretions.
- Each test is independent: no shared mutable state between tests.

## Tooling

| Tool                               | Purpose                                        |
| ---------------------------------- | ---------------------------------------------- |
| `.editorconfig`                    | Style + analyzer severity (Microsoft template) |
| `dotnet format`                    | Auto-format using `.editorconfig`              |
| Roslyn analyzers                   | Built-in `Microsoft.CodeAnalysis.NetAnalyzers` |
| `StyleCop.Analyzers`               | StyleCop rules as Roslyn analyzers             |
| `SonarAnalyzer.CSharp`             | Additional quality + security rules            |
| `dotnet test`                      | Test runner                                    |
| `dotnet list package --vulnerable` | Vulnerability scan                             |
| BenchmarkDotNet                    | Microbenchmarks                                |

Suppress analyzer warnings with `// <pragma> #pragma warning disable
<code> // Justification:` blocks scoped to the smallest region — never
file-wide.

## Output Format (when used for review)

Always emit the **Summary**, **Detailed Findings**, **Positive
Highlights**, **Recommendations**, and **References** sections, in
that order, even when the file is clean. Inside **Detailed
Findings**, emit every category heading from the Per-Category
Checklist below; if a category has no findings, write
`No issues found.` under its heading.

### Per-Category Checklist

Before writing the report, emit this checklist verbatim and fill it
in as you go. This forces explicit coverage of every category:

```
- Style                : Checked: yes/no — Findings: N
- Naming               : Checked: yes/no — Findings: N
- Documentation        : Checked: yes/no — Findings: N
- Nullability          : Checked: yes/no — Findings: N
- Async                : Checked: yes/no — Findings: N
- LINQ                 : Checked: yes/no — Findings: N
- Exceptions           : Checked: yes/no — Findings: N
- Resource Management  : Checked: yes/no — Findings: N
- Dependency Injection : Checked: yes/no — Findings: N
- Security             : Checked: yes/no — Findings: N
- Performance          : Checked: yes/no — Findings: N
- Testing              : Checked: yes/no — Findings: N
- Maintainability      : Checked: yes/no — Findings: N
```

### Summary

- Overall Assessment: Excellent / Good / Fair / Needs Improvement
- Framework Guidelines Compliance: High / Medium / Low
- C# Conventions Compliance: High / Medium / Low
- Key Strengths (2–4 bullets)
- Critical Issues (if any)

### Detailed Findings

For each issue:

- **Category** — Style / Naming / Async / Nullability / Documentation /
  Exceptions / Security / Performance / Maintainability
- **Severity** — Critical / High / Medium / Low
- **File / Lines** — exact location
- **Reference** — link entry name from `links.md`
- **Current Code** — verbatim excerpt
- **Recommended Fix** — corrected C#
- **Rationale** — why it matters

### Positive Highlights

### Recommendations (priority-ordered)

### References

Link to `links.md` — do not repeat URLs here.

## Review Procedure

1. Read each file in full before commenting on parts.
2. Apply sections in this order: Standards & Conventions →
   Documentation → Type Discipline → Code Quality (Async, Exceptions,
   LINQ, DI) → Security → Performance → Testing.
3. Quote the exact rule from `cheatsheet.md` when it is
   accessible. If it is not accessible, cite the matching section
   heading from this document instead and leave the cheatsheet
   reference blank. Never fabricate a quote.
4. Emit the report in the **Output Format** above.

## Generation Procedure

1. Confirm `<TargetFramework>` and `<LangVersion>` (default: the
   latest LTS .NET).
2. Generate code that already obeys every rule in **Standards &
   Conventions**, **Documentation**, and **Type Discipline**.
3. For new public APIs, add XML doc comments and xUnit tests in the
   same change.
4. Run `dotnet format`, `dotnet build`
   (`-warnaserror`), and `dotnet test` before declaring the work done.

## Output Format (when generating)

When generating code, emit, in this order:

1. **Production file** — the `.cs` file in a fenced ```csharp block,
   with a comment header showing the intended path.
2. **Companion test file** — an xUnit test file in a fenced
   ```csharp block, with a comment header showing the intended path
   under `tests/<Project>.Tests/`.
   ```
3. **Project / config changes** — any required `.csproj`,
   `Directory.Build.props`, or `.editorconfig` edits in fenced
   blocks; omit the section if no changes are needed.
4. **Rationale** — a brief bullet list (≤6 bullets) explaining the
   key design decisions and which **MUST**/`SHOULD` rules drove
   them.

## References

- See [cheatsheet.md](cheatsheet.md) for the
  condensed rules digest.
- See [links.md](links.md) for the canonical
  official URLs (Microsoft Framework Design Guidelines, C# coding
  conventions, .NET runtime style, Roslyn analyzers, OWASP .NET).
