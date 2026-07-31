---
description: "Verify the batch — run every check first-hand; only witnessed passing output counts. [Copilot: GPT-5.6 Terra → cheaper GPT-5.6 Luna]"
---

Invoke `skill:thomas` to validate the current batch by first-hand execution — no claims accepted on trust.

Argument: `$ARGUMENTS` — an optional batch number or scope; default is the batch just built.

1. Invoke `skill:thomas`. Thomas runs every check itself — build, test suite, and any runtime or manual check the batch requires.
2. Thomas returns an evidence record with a verdict: **APPROVED** or **NOT APPROVED**.
3. Only witnessed passing output counts. If **NOT APPROVED**, fix the failures and re-run — do **not** mark the batch done on "should pass".
