---
type: Template
title: SKILL.md Template
description: Canonical copy-paste template for a SKILL.md file.
resource: /../skills/
tags: [skills, template, authoring]
timestamp: 2026-07-12T18:00:00Z
---

# SKILL.md Template

Copy the block below into `skills/<skill-name>/SKILL.md` and fill it in. The
folder name must equal the `name:` field. The `description` is what an agent
matches a request against — pack it with real trigger phrases and keep
`USE FOR:` / `DO NOT USE FOR:` explicit. Keep the always-loaded body lean; move
long tables, examples, and output formats into a `references/` file.

```markdown
---
name: my-skill
version: 1.0.0
description: >
  One sentence on what this skill does and the principle it enforces.
  USE FOR: <trigger phrase>, <trigger phrase>, <concrete scenario>.
  DO NOT USE FOR: <adjacent task> (use skill:<other-skill>), <another out-of-scope task>.
argument-hint: "Optional: what argument this skill accepts, and its default"
---

# My Skill

## Overview

What this skill does in one or two sentences, and the single guiding principle
it exists to enforce. **Prime directive: <the one rule that overrides all else>.**

## When to Use

- <Concrete trigger — a situation or a phrase the user says>
- <Concrete trigger>
- <Concrete trigger>

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: VERB — <short outcome>

What to do, and how to know it's done.

### Step 2: VERB — <short outcome>

What to do next.

### Step 3: VERB — <short outcome>

The final action before verification.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "<excuse for skipping the discipline>" | <why that excuse is wrong> |
| "<another excuse>" | <the reality> |

## Red Flags

- <An observable sign the skill is being violated>
- <Another warning sign>

## Verification

- [ ] <Concrete, evidence-based check that the skill was applied>
- [ ] <Another check — tests pass, build succeeds, output observed>

## See Also

- `skill:<related-skill>` — <how it relates (runs before / after / alongside)>
```
