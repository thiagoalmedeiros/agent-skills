---
description: "Ship it — sync docs, then merge and validate against the Definition of Done. [Copilot: **GPT-5.6 Luna** → GPT-5.6 Terra]"
---

Ship the change: sync the docs, then merge and validate against the Definition of Done.

Argument: `$ARGUMENTS` — the branch to merge (default: the current branch).

1. Invoke `skill:docs-sync` to bring `AGENTS.md` / `README.md` / architecture docs back in line with the code change; it delegates every `knowledge-base/` edit to `skill:open-knowledge` for OKF conformance.
2. Invoke `skill:merge-and-validate` to merge the branch and run the Definition-of-Done gate.
3. If validation fails, stop and surface the failures — do **not** ship.
