---
description: "Define the work — turn a task or Jira ticket into a structured implementation plan before any code. [Copilot: GPT-5.6 Sol → cheaper GPT-5.6 Terra]"
---

Invoke `skill:impl-strategy` to turn the request into a structured plan at `plans/<topic>/plan.md` **before any code is written**.

Argument: `$ARGUMENTS` — a task description, or a Jira URL / ticket key.

1. If the argument is a Jira URL or ticket key, first invoke `skill:jira-fetch` to pull the ticket (description, comments, subtasks) as context.
2. Clarify intent cooperatively — ask one question at a time until the task fits a single sentence the user confirms.
3. Once an approach is on the table, invoke `skill:grill-me` to adversarially stress-test it: surface load-bearing assumptions, failure modes, and cheaper alternatives, one hard question at a time, until the approach holds or a fatal flaw surfaces. Skip this for trivial, mechanical tasks — `skill:grill-me` hardens a *formed* decision; it is not requirements-gathering (that is step 2).
4. Invoke `skill:impl-strategy` to produce the plan (What We Are Doing / How + Out of Scope / Tracking List) on the hardened approach, and initialize `lessons.md`.
5. Stop at the plan. Do **not** implement — that is `/build`.
