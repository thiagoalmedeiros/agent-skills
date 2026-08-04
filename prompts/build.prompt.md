---
description: "Build the next slice — implement against the project's coding standards, one reviewable batch at a time. [Copilot: **GPT-5.6 Luna** → GPT-5.3-Codex]"
---

Implement the next slice of the approved plan, held to the project's coding standards. There is **no dedicated implementer skill** — you write the code directly, but you must load the standard for the files you touch.

Argument: `$ARGUMENTS` — an optional batch number or task; default is the next pending batch in `plans/<topic>/plan.md`.

1. Pick the next pending batch from `plans/<topic>/plan.md` (or the one named in `$ARGUMENTS`).
2. Load the applicable standard for each file you touch: `skill:python-standard`, `skill:dotnet-csharp-standard`, `skill:taskfile-standard`, or the `skill:angular-components` / `skill:angular-state` / `skill:angular-ui` skills.
3. Write the code and its tests together. Keep the change scoped to this one batch.
4. Update the batch's items in the plan, then stop for `/verify`. Do **not** proceed to the next batch unprompted.
