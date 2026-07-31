---
name: dotnet-csharp-standard
version: 1.0.0
description: >
  Canonical .NET / C# coding standard (Microsoft Framework Design
  Guidelines, C# coding conventions, .NET runtime style, Roslyn
  analyzers, OWASP .NET) for authoring and reviewing C# — every finding
  cites the rule it violates.
  USE FOR: writing new C# code, reviewing existing C# code, enforcing
  project conventions, onboarding a .NET codebase, or reviewing a PR that
  adds/modifies C# source.
  DO NOT USE FOR: F#, VB.NET, or other CLR languages; ASP.NET/EF Core
  application architecture; or NuGet/dependency selection.
argument-hint: "Path to a C# file, project, or solution to author, refactor, or review"
---

# .NET / C# Standard

## Overview

The single source of truth for C# style, structure, async patterns,
documentation, security, and performance in this project — applied both
when **generating** new C# and when **reviewing** existing code. The full
rule set, including RFC-2119 rule strengths and the review/generation
output formats, lives in [references/standard.md](references/standard.md);
this file is the process that applies it. **Prime directive: follow the
framework you ship on — match BCL naming, exceptions, and async patterns
— and back every finding with a named rule; standards bend only for
`SHOULD`/`MAY` rules with an inline `// Justification:` comment.**

## When to Use

- The user asks to create, refactor, or review a `.cs`, `.csproj`, `.sln`, `Directory.Build.props`, or `.editorconfig`.
- The user asks "is this idiomatic C#?" or "does this follow MS guidelines?".
- A PR adds or modifies C# source.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: SCOPE — decide generate vs. review, and guard the input

Determine whether the request is to **generate** or **review**. If the
file is not C# source (F#, VB.NET, XML project files, JSON/YAML), decline
in one sentence naming the detected language. Confirm `<TargetFramework>`
and `<LangVersion>` (default: latest LTS .NET). Load
[references/standard.md](references/standard.md) and apply its RFC-2119
rule-strength convention (MUST / SHOULD / MAY).

### Step 2: APPLY — enforce the standard in fixed order

Apply the standard's sections in this order: Standards & Conventions →
Documentation → Type Discipline → Code Quality (Async, Exceptions, LINQ,
DI) → Security → Performance → Testing. When generating, emit code that
already obeys every rule, plus XML doc comments and xUnit tests for new
public APIs. When reviewing, read each file in full first, then cite the
exact rule from [references/cheatsheet.md](references/cheatsheet.md) for
every finding. For files over ~500 lines, review in ~200-line sections
and state which line ranges are covered.

### Step 3: EMIT — deliver code or the structured report

For generation: output the production file, its xUnit companion test,
any config changes, and a brief rationale, then run `dotnet format`,
`dotnet build -warnaserror`, and `dotnet test` before declaring done. For
review: emit the report exactly as specified in
[references/standard.md](references/standard.md) — the Per-Category
Checklist, then Summary → Detailed Findings → Positive Highlights →
Recommendations → References — citing `references/links.md` rather than
repeating URLs.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "`var` everywhere is cleaner." | The standard permits `var` only when the type is on the right-hand side. Use the explicit type otherwise. |
| "`.Result` is fine here." | Blocking on async risks deadlock. Never `.Result`/`.Wait()`/`.GetAwaiter().GetResult()`. |
| "Catching `Exception` keeps it robust." | Swallowing hides bugs. Throw the most specific type; `catch (Exception)` needs a comment and a rethrow. |
| "It's internal code, skip the doc comments." | Public/protected members of a library require XML docs — that's the API contract. |

## Red Flags

- A review finding with no Framework-Guidelines / convention citation.
- `async void` outside an event handler, or an `await` in library code missing `.ConfigureAwait(false)`.
- SQL built with `string.Format`/interpolation, or secrets hard-coded in source.
- Generated code shipped without tests, or without `dotnet build -warnaserror` passing.

## Verification

- [ ] Generate vs. review determined; non-C# input declined; framework/lang version confirmed.
- [ ] Every finding cites a rule and respects its MUST/SHOULD/MAY strength.
- [ ] Sections applied in order; large files covered in stated line ranges.
- [ ] Generation path: `dotnet format`, `dotnet build -warnaserror`, `dotnet test` all clean; tests included.
- [ ] Review path: Per-Category Checklist emitted, then the full report, with no invented URLs.
