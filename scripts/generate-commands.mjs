#!/usr/bin/env node
// Generate per-agent command files from a single source.
//
// Source of truth : .claude/commands/*.md   (Claude Code slash commands)
// Generated       : commands/*.toml          (Antigravity CLI commands)
//                   prompts/*.prompt.md       (VS Code Copilot prompt files)
//
// Copilot's slash commands ship as prompt files in a root prompts/ folder,
// referenced by the plugin manifest's "prompts" field and invoked with /<name>.
//
// Codex is intentionally NOT generated: its custom prompts are deprecated and
// global-only (~/.codex/prompts), so they cannot be committed to the repo.
// Codex users invoke the underlying skills directly instead.
//
// Each agent exposes a different model catalog — Claude Code runs Claude only,
// Copilot and Antigravity are multi-vendor with different line-ups — so a model
// recommendation is never shared across targets. The source `description` ends
// with Claude Code's own `[Claude: …]` hint; the generator strips it and appends
// the target's hint from model-hints.json, so each command file names only
// models the agent reading it can actually select.
//
// Usage: node scripts/generate-commands.mjs
// Re-run after editing any .claude/commands/*.md file or model-hints.json.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, ".claude", "commands");
const outDir = join(root, "commands");
const promptsDir = join(root, "prompts");
mkdirSync(outDir, { recursive: true });
mkdirSync(promptsDir, { recursive: true });

const hints = JSON.parse(readFileSync(join(root, "scripts", "model-hints.json"), "utf8"));

// A model hint puts ": " inside the description, which YAML only allows in a
// quoted scalar — so descriptions are stored and emitted double-quoted.
const yamlUnquote = (s) =>
  /^"[\s\S]*"$/.test(s) ? s.slice(1, -1).replace(/\\(["\\])/g, "$1") : s;
const yamlQuote = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function parse(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("missing YAML frontmatter");
  const front = m[1];
  const body = m[2].replace(/^\n+/, "").replace(/\s+$/, "");
  const desc = (front.match(/^description:\s*(.*)$/m) || [])[1];
  if (!desc) throw new Error("missing description");
  return { description: yamlUnquote(desc.trim()), body };
}

// Drop Claude Code's `[Claude: …]` hint so another agent's file never names a
// model that agent cannot run, then append that agent's own recommendation.
const describe = (description, label, hint) =>
  description.replace(/\s*\[[^\]]*\]\s*$/, "") + (hint ? ` [${label}: ${hint}]` : "");

function toToml({ description, body }) {
  if (body.includes('"""')) throw new Error('body contains """ — cannot embed in TOML');
  const d = description.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `description = "${d}"\n\nprompt = """\n${body}\n"""\n`;
}

// Copilot prompt file: the /<name> comes from the filename; keep the body
// verbatim (same as the TOML) so all targets stay a byte-faithful projection.
function toPromptFile({ description, body }) {
  return `---\ndescription: ${yamlQuote(description)}\n---\n\n${body}\n`;
}

const files = readdirSync(srcDir).filter((f) => f.endsWith(".md")).sort();
let n = 0;
for (const f of files) {
  const name = f.replace(/\.md$/, "");
  const parsed = parse(readFileSync(join(srcDir, f), "utf8"));
  const forAntigravity = describe(parsed.description, "Antigravity", hints.antigravity?.[name]);
  const forCopilot = describe(parsed.description, "Copilot", hints.copilot?.[name]);
  writeFileSync(join(outDir, `${name}.toml`), toToml({ ...parsed, description: forAntigravity }));
  writeFileSync(join(promptsDir, `${name}.prompt.md`), toPromptFile({ ...parsed, description: forCopilot }));
  console.log(`  ${f}  ->  commands/${name}.toml, prompts/${name}.prompt.md`);
  n++;
}
console.log(`Generated ${n} Antigravity command + ${n} Copilot prompt file(s) from ${files.length} Claude source(s).`);
