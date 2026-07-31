#!/usr/bin/env bash
# smoke.sh — smoke-drive the agentic-sdlc plugin from the local working tree.
#
# Steps:
#   1. node scripts/validate.mjs   — repo invariants (manifests, frontmatter,
#                                    regen sync, skill refs, doc links)
#   2. claude plugin validate .    — manifest as the real consumer parses it
#   3. claude --plugin-dir . plugin details agentic-sdlc
#                                  — LOCAL-tree inventory: every skill and
#                                    command registers (not the installed copy)
#   4. headless E2E               — real `claude -p` session loads a probe
#                                    skill via the Skill tool and echoes its
#                                    first heading (~1 min, one haiku call,
#                                    needs `claude` auth; skip: SKIP_E2E=1)
#
# Usage (from anywhere; it cd's to the repo root):
#   .claude/skills/run-agent-skills/smoke.sh
#   SKIP_E2E=1 .claude/skills/run-agent-skills/smoke.sh      # offline/fast
#   PROBE_SKILL=grill-me .claude/skills/run-agent-skills/smoke.sh

set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$REPO"

PROBE="${PROBE_SKILL:-security-and-hardening}"
BOLD=$'\033[1m'; GREEN=$'\033[32m'; RED=$'\033[31m'; RESET=$'\033[0m'
step() { printf '\n%s== %s ==%s\n' "$BOLD" "$1" "$RESET"; }
ok()   { printf '%s\xe2\x9c\x93%s %s\n' "$GREEN" "$RESET" "$1"; }
die()  { printf '%s\xe2\x9c\x97 %s%s\n' "$RED" "$1" "$RESET" >&2; exit 1; }

step "1/4 repo invariants (scripts/validate.mjs)"
node scripts/validate.mjs

command -v claude >/dev/null || die "claude CLI not found — steps 2-4 need it"

step "2/4 claude plugin validate ."
claude plugin validate .

step "3/4 local-tree inventory (claude --plugin-dir . plugin details)"
SKILLS=$(find skills -mindepth 2 -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')
CMDS=$(ls .claude/commands/*.md | wc -l | tr -d ' ')
WANT=$((SKILLS + CMDS))   # commands surface as skills in the inventory
INV=$(claude --plugin-dir . plugin details agentic-sdlc)
echo "$INV" | grep -q "Skills ($WANT)" \
  || die "expected Skills ($WANT) [$SKILLS skills + $CMDS commands], got: $(echo "$INV" | grep -o 'Skills ([0-9]*)' || true)"
echo "$INV" | grep -q "$PROBE" || die "probe skill '$PROBE' missing from inventory"
ok "Skills ($WANT) = $SKILLS skills + $CMDS commands; '$PROBE' present"

if [ "${SKIP_E2E:-0}" = "1" ]; then
  step "4/4 headless E2E — SKIPPED (SKIP_E2E=1)"
else
  step "4/4 headless E2E: load agentic-sdlc:$PROBE in a live session (~1 min)"
  WORK=$(mktemp -d)  # run outside the repo so its project context doesn't load
  OUT=$(cd "$WORK" && claude --plugin-dir "$REPO" --model haiku --allowedTools Skill -p \
    "Invoke the Skill tool with skill 'agentic-sdlc:$PROBE'. After it loads, output ONLY the first markdown heading line of the loaded skill content, nothing else.")
  rm -rf "$WORK"
  echo "$OUT"
  echo "$OUT" | grep -q '^#' || die "E2E: expected a markdown heading from the loaded skill, got: $OUT"
  ok "skill loaded end-to-end in a live session"
fi

printf '\n%s\xe2\x9c\x93 smoke passed%s\n' "$GREEN" "$RESET"
