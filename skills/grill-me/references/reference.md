# Grill Me — Vectors, Formats & Example

> The attack-vector table, dodge responses, scoring tags, verdict block,
> stop condition, and a worked example for the `grill-me` skill.
> `SKILL.md` is the lean process that points here.

## Step 1 format — pin the target

```
TARGET: [one falsifiable sentence — the claim on trial]
STAKES: [what it costs if this is wrong, and how reversible it is]
```

If the position can't be reduced to a falsifiable claim, that is itself the first finding —
say so and help sharpen it before continuing.

## Step 2 format — one attack at a time

```
ATTACK [vector]: [single sharp question]
MY READ: [the strongest version of why this could sink the idea]
```

One-at-a-time is deliberate: batched questions get skimmed and let the user cherry-pick the
easy one. Rotate across the vectors:

| Vector | The question it presses |
| --- | --- |
| **Evidence** | How do you *know* that — measurement, or vibe? |
| **Assumption** | What must be true for this to work? Which is load-bearing and unchecked? |
| **Failure mode** | What is the first thing that breaks under load / at scale / with a hostile user? |
| **Alternative** | Why is this better than the obvious cheaper option you skipped? |
| **Cost of wrong** | If you're wrong, how do you find out, and how expensive is the reversal? |
| **Incentive/bias** | Did you pick this because it's right, or because it's familiar / fun / already built? |
| **Second-order** | What does this cause six months out that you're not pricing in? |
| **Base rate** | How often do efforts like this actually succeed? Why are you the exception? |

## Step 3 — refuse weak answers

Name the dodge and re-press the same vector before moving on:

- Appeal to authority ("best practice says…") → "Whose context produced that rule, and does yours match it?"
- Deferral ("we'll handle that later") → "Later is more expensive. What changes between now and later that makes it solvable then but not now?"
- Vibes ("I feel good about it") → "What observation would make you feel bad about it? If none, the feeling isn't evidence."
- Scope dodge ("that's out of scope") → legitimate only if the boundary is explicit and the risk lands outside it. Otherwise it's avoidance.

Hold your ground. Retreat on a vector only when the user supplies real evidence, a distinct
data point, or a changed constraint — not a restated preference.

## Step 4 — score each exchange

- `[HOLDS]` — defense is evidence-backed; vector closed.
- `[CRACKS]` — partially answered; a real weakness remains, note it.
- `[BREAKS]` — no adequate defense; a candidate fatal flaw.

Calibrate honestly. A vector you *wanted* to break but couldn't is a `[HOLDS]` — say the idea
got stronger there.

## Step 5 — verdict block

```
VERDICT: SURVIVES | NEEDS WORK | FATAL FLAW

Strongest surviving form: [the claim, rewritten to reflect what held]
Open risks:               [each CRACKS — the weakness + how to close it]
Fatal flaw (if any):      [the BREAKS the idea cannot answer]
Next move:                [the single most valuable thing to test or decide next]
```

## Stop condition

Grill until **every relevant vector has been fired at least once** and either the target
survived all of them (→ `SURVIVES`, said plainly) or one vector produced a `[BREAKS]` the user
cannot answer (→ `FATAL FLAW`; stop attacking other vectors). Do not manufacture objections to
look rigorous — if three vectors in a row `[HOLDS]` with strong evidence, converge to the verdict.

## Loading constraint

Grilling requires a live, responsive user. In a non-interactive context (CI/CD, scheduled
tasks, autonomous loops), do not simulate both sides — emit a single written **red-team memo**
(attack vectors and unresolved risks) and flag that interactive grilling was skipped.

## Example

*User:* Grill me — we're going to rewrite the billing service in Rust to fix our latency problems.

*Agent:*
```
TARGET: Rewriting the billing service in Rust will fix our latency problems.
STAKES: Multi-month rewrite; hard to reverse once half-migrated.

ATTACK [Evidence]: What have you measured that says the language is the latency
source — p99 numbers, a profile — or is Rust the assumed fix?
MY READ: Most "rewrite for speed" latency lives in I/O and N+1 queries, not the
runtime. If you haven't profiled, the rewrite ships the same slow queries in a
faster language.
```

*User:* We haven't profiled it end to end, but Rust is just faster.

*Agent:*
```
[BREAKS] "Rust is just faster" is a language benchmark, not a diagnosis of YOUR
latency. That's the incentive vector too — this reads as wanting to write Rust.

ATTACK [Cost of wrong]: If you rewrite and p99 doesn't move because the cost was
in the database, how many months are gone before you find out?
MY READ: A one-day profile answers what a six-month rewrite only gambles on.
```

*User:* …fair. A day of profiling before we commit.

*Agent:*
```
VERDICT: NEEDS WORK
Strongest surviving form: "We have a latency problem worth fixing" — true. "Rust
is the fix" — unproven.
Fatal flaw: the fix was chosen before the cause was diagnosed.
Next move: profile the billing path end-to-end; decide the fix from the p99
breakdown, not the language.
```
