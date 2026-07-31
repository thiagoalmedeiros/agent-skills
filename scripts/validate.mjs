#!/usr/bin/env node
// Validate that every install path in the README's Quick Start actually works.
//
// Checks the repo invariants each agent depends on:
//   1. JSON manifests parse (Claude marketplace/plugin, Codex, Antigravity, npm)
//   2. Each manifest's `skills` path resolves to the full set of SKILL.md files
//   3. Every skill has valid frontmatter and `name` matches its directory
//   4. Claude command sources exist in .claude/commands/*.md with a description
//   5. commands/*.toml and prompts/*.prompt.md are in sync with
//      .claude/commands/*.md (regen is a no-op)
//   6. Every `skill:<name>` referenced by a command resolves to a real skill
//   7. Relative links in README.md and knowledge-base/ point at real files
//
// Usage: node scripts/validate.mjs   (or: npm test)

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => join(root, ...p);
const fails = [];
const pass = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const fail = (m) => {
  fails.push(m);
  console.log(`  \x1b[31m✗\x1b[0m ${m}`);
};
const head = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

const skillDirs = readdirSync(R("skills")).filter((d) =>
  existsSync(R("skills", d, "SKILL.md")),
);
const SKILL_COUNT = skillDirs.length;
const hints = JSON.parse(readFileSync(R("scripts", "model-hints.json"), "utf8"));

// Descriptions carry a model hint containing ": ", which YAML only allows inside
// a quoted scalar — an unquoted one makes GitHub reject the frontmatter.
const yamlUnquote = (s) =>
  /^"[\s\S]*"$/.test(s) ? s.slice(1, -1).replace(/\\(["\\])/g, "$1") : s;
const yamlQuote = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const yamlBroken = (raw) => !/^".*"$/.test(raw) && /:\s/.test(raw);

head(`1. JSON manifests parse`);
const manifests = [
  ".claude-plugin/marketplace.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  "plugin.json",
  "package.json",
];
for (const m of manifests) {
  try {
    JSON.parse(readFileSync(R(m), "utf8"));
    pass(m);
  } catch (e) {
    fail(`${m}: ${e.message}`);
  }
}

head(`2. Manifest 'skills' paths resolve to ${SKILL_COUNT} skills`);
for (const m of [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  "plugin.json", // root manifest — Antigravity + VS Code Copilot native plugin format
]) {
  const s = JSON.parse(readFileSync(R(m), "utf8")).skills;
  if (!s) {
    fail(`${m}: no "skills" field`);
    continue;
  }
  const dir = R(s);
  const n = existsSync(dir)
    ? readdirSync(dir).filter((d) => existsSync(join(dir, d, "SKILL.md"))).length
    : 0;
  n === SKILL_COUNT
    ? pass(`${m} → "${s}" → ${n} skills`)
    : fail(`${m} → "${s}" → ${n} skills (expected ${SKILL_COUNT})`);
}

head(`3. Skill frontmatter (${SKILL_COUNT} skills)`);
let good = 0;
for (const d of skillDirs.sort()) {
  const t = readFileSync(R("skills", d, "SKILL.md"), "utf8");
  const fm = t.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    fail(`${d}: missing YAML frontmatter`);
    continue;
  }
  const name = (fm[1].match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  const desc = /^description:\s*\S|^description:\s*>/m.test(fm[1]);
  if (name !== d) fail(`${d}: frontmatter name "${name}" ≠ directory "${d}"`);
  else if (!desc) fail(`${d}: missing description (agents match on this)`);
  else good++;
}
if (good === SKILL_COUNT) pass(`${good}/${SKILL_COUNT} valid, name matches directory`);

head(`4. Claude command sources (.claude/commands/*.md)`);
const srcDir = R(".claude", "commands");
if (!existsSync(srcDir)) {
  fail(".claude/commands/ is missing — /define, /build, … will not load in Claude Code");
} else {
  const mds = readdirSync(srcDir).filter((f) => f.endsWith(".md")).sort();
  if (!mds.length) fail(".claude/commands/ has no *.md command sources");
  for (const f of mds) {
    const t = readFileSync(join(srcDir, f), "utf8");
    const m = t.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) fail(`${f}: missing frontmatter`);
    else if (!/^description:\s*(.+)$/m.test(m[1])) fail(`${f}: missing description`);
    else if (!m[2].trim()) fail(`${f}: empty body`);
    else pass(`.claude/commands/${f}`);
  }

  head(`5. Generated commands in sync with .claude/commands/*.md`);
  const tomls = existsSync(R("commands"))
    ? readdirSync(R("commands")).filter((f) => f.endsWith(".toml")).sort()
    : [];
  const prompts = existsSync(R("prompts"))
    ? readdirSync(R("prompts")).filter((f) => f.endsWith(".prompt.md")).sort()
    : [];
  const a = mds.map((f) => f.replace(/\.md$/, ""));
  const b = tomls.map((f) => f.replace(/\.toml$/, ""));
  const c = prompts.map((f) => f.replace(/\.prompt\.md$/, ""));
  if (a.join() !== b.join()) fail(`Antigravity name mismatch: md=[${a}] toml=[${b}]`);
  else pass(`commands/*.toml: same ${a.length} commands as source`);
  if (a.join() !== c.join()) fail(`Copilot name mismatch: md=[${a}] prompt=[${c}]`);
  else pass(`prompts/*.prompt.md: same ${a.length} commands as source`);

  // The root plugin.json (Copilot format) must reference the prompt folder so a
  // plugin install bundles the commands, not just the skills.
  const promptsField = JSON.parse(readFileSync(R("plugin.json"), "utf8")).prompts;
  const pDir = promptsField && R(promptsField);
  const pCount =
    pDir && existsSync(pDir)
      ? readdirSync(pDir).filter((f) => f.endsWith(".prompt.md")).length
      : 0;
  if (!promptsField) fail(`plugin.json: no "prompts" field — Copilot install won't bundle the commands`);
  else if (pCount !== a.length)
    fail(`plugin.json → "${promptsField}" → ${pCount} prompt files (expected ${a.length})`);
  else pass(`plugin.json → "prompts": "${promptsField}" → ${pCount} prompt files`);

  // Re-derive each generated file from its md source and compare to what's committed.
  for (const f of mds) {
    const name = f.replace(/\.md$/, "");
    const t = readFileSync(join(srcDir, f), "utf8");
    const m = t.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) continue;
    const desc = yamlUnquote((m[1].match(/^description:\s*(.*)$/m) || [])[1].trim());
    const body = m[2].replace(/^\n+/, "").replace(/\s+$/, "");
    if (body.includes('"""')) {
      fail(`${f}: body contains """ — cannot embed in TOML`);
      continue;
    }
    // Each agent's description carries only its own model hint (see model-hints.json).
    const describe = (label, hint) =>
      desc.replace(/\s*\[[^\]]*\]\s*$/, "") + (hint ? ` [${label}: ${hint}]` : "");
    const antigravityDesc = describe("Antigravity", hints.antigravity?.[name]);
    const copilotDesc = describe("Copilot", hints.copilot?.[name]);
    const wantToml = `description = "${antigravityDesc.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"\n\nprompt = """\n${body}\n"""\n`;
    const tp = R("commands", `${name}.toml`);
    const gotToml = existsSync(tp) ? readFileSync(tp, "utf8") : "";
    gotToml === wantToml
      ? pass(`commands/${name}.toml matches source`)
      : fail(`commands/${name}.toml is STALE — run: node scripts/generate-commands.mjs`);

    const wantPrompt = `---\ndescription: ${yamlQuote(copilotDesc)}\n---\n\n${body}\n`;
    const pp = R("prompts", `${name}.prompt.md`);
    const gotPrompt = existsSync(pp) ? readFileSync(pp, "utf8") : "";
    gotPrompt === wantPrompt
      ? pass(`prompts/${name}.prompt.md matches source`)
      : fail(`prompts/${name}.prompt.md is STALE — run: node scripts/generate-commands.mjs`);
  }

  // A command must never recommend a model its reader cannot select, so each
  // target needs its own hint and the Claude source must stay Claude-only.
  const OTHER_VENDORS = /GPT|Gemini|Grok|Kimi|MAI-|Raptor|Codex|Luna|Sol|Terra/i;
  for (const target of ["copilot", "antigravity"]) {
    const missing = a.filter((n) => !hints[target]?.[n]);
    missing.length
      ? fail(`scripts/model-hints.json: no "${target}" hint for ${missing.join(", ")}`)
      : pass(`model-hints.json: "${target}" covers all ${a.length} commands`);
  }
  const leaked = mds.filter((f) => {
    const d = (readFileSync(join(srcDir, f), "utf8").match(/^description:\s*(.*)$/m) || [])[1] || "";
    return OTHER_VENDORS.test((d.match(/\[([^\]]*)\]\s*$/) || [])[1] || "");
  });
  leaked.length
    ? fail(`.claude/commands/ names a non-Claude model: ${leaked.join(", ")} — Claude Code runs Claude only`)
    : pass(`.claude/commands/*.md recommend Claude models only`);

  head(`6. YAML frontmatter parses (unquoted ": " breaks GitHub's renderer)`);
  const fmFiles = [
    ...mds.map((f) => `.claude/commands/${f}`),
    ...prompts.map((f) => `prompts/${f}`),
    ...skillDirs.sort().map((d) => `skills/${d}/SKILL.md`),
  ];
  const badYaml = fmFiles.filter((p) => {
    const fm = readFileSync(R(p), "utf8").match(/^---\n([\s\S]*?)\n---\n/);
    return (fm?.[1].match(/^description:\s*(.*)$/m) || []).slice(1).some(yamlBroken);
  });
  badYaml.length
    ? badYaml.forEach((p) => fail(`${p}: description holds ": " unquoted — wrap the value in double quotes`))
    : pass(`${fmFiles.length} frontmatter descriptions are YAML-safe`);

  head(`7. skill: references in commands resolve`);
  const refs = new Set();
  for (const f of mds)
    for (const r of readFileSync(join(srcDir, f), "utf8").matchAll(/skill:([a-z0-9-]+)/g))
      refs.add(r[1]);
  const missing = [...refs].filter((r) => !existsSync(R("skills", r, "SKILL.md")));
  missing.length
    ? fail(`unresolved skill refs: ${missing.join(", ")}`)
    : pass(`all ${refs.size} skill: references resolve to a real SKILL.md`);
}

head(`8. README documents every skill and every command's skills`);
const readme = readFileSync(R("README.md"), "utf8");
const catalog = readme.slice(readme.indexOf("## Skills Catalog"));
const listed = new Set([...catalog.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]));
const undocumented = skillDirs.filter((d) => !listed.has(d));
undocumented.length
  ? fail(`missing from the README catalog: ${undocumented.join(", ")}`)
  : pass(`all ${SKILL_COUNT} skills appear in the Skills Catalog`);
// A skill a command invokes must be visible in that command's README row, or
// readers plan around a phase that silently does more than documented.
// Scope to the Commands table — the model table below it is also keyed by `/cmd`
// but its columns hold model names, not skills.
const commandTable = readme.slice(
  readme.indexOf("## Commands"),
  readme.indexOf("### Recommended model per command"),
);
const commandRows = [...commandTable.matchAll(/^\|\s*`\/([a-z]+)`\s*\|[^|]*\|([^|]*)\|/gm)];
const rowGaps = commandRows.flatMap(([, cmd, invokes]) => {
  const src = R(".claude", "commands", `${cmd}.md`);
  if (!existsSync(src)) return [];
  const refs = [...readFileSync(src, "utf8").matchAll(/skill:([a-z0-9-]+)/g)].map((m) => m[1]);
  // Build lists standards generically ("the coding standard for the files you touch").
  if (/coding standard/.test(invokes)) return [];
  return [...new Set(refs)].filter((r) => !invokes.includes(r)).map((r) => `/${cmd} invokes ${r}`);
});
rowGaps.length
  ? rowGaps.forEach((g) => fail(`README Commands table: ${g} but does not list it`))
  : pass(`every command row lists the skills that command invokes`);

head(`9. Version agrees everywhere`);
const VERSION = JSON.parse(readFileSync(R("package.json"), "utf8")).version;
const versions = {
  "package.json": VERSION,
  "plugin.json": JSON.parse(readFileSync(R("plugin.json"), "utf8")).version,
  ".claude-plugin/plugin.json": JSON.parse(readFileSync(R(".claude-plugin/plugin.json"), "utf8")).version,
  ".codex-plugin/plugin.json": JSON.parse(readFileSync(R(".codex-plugin/plugin.json"), "utf8")).version,
  ".claude-plugin/marketplace.json": JSON.parse(readFileSync(R(".claude-plugin/marketplace.json"), "utf8")).metadata?.version,
  // Hand-maintained blob and prose — nothing else regenerates these, so they drift silently.
  "knowledge-base/index.html": (readFileSync(R("knowledge-base/index.html"), "utf8").match(/const DATA = (\{.*\});$/m) || []).slice(1).map((d) => JSON.parse(d).version)[0],
  "README.md": (readFileSync(R("README.md"), "utf8").match(/^\*\*Version ([\d.]+)\*\*/m) || [])[1],
};
for (const [file, v] of Object.entries(versions))
  v === VERSION ? pass(`${file} → ${v}`) : fail(`${file} → ${v ?? "not found"} (expected ${VERSION})`);

head(`10. Relative links in docs resolve`);
const docs = ["README.md", ...readdirSync(R("knowledge-base")).filter((f) => f.endsWith(".md")).map((f) => `knowledge-base/${f}`)];
for (const doc of docs) {
  const t = readFileSync(R(doc), "utf8");
  const base = dirname(R(doc));
  for (const m of t.matchAll(/\]\((?!https?:|mailto:|#)([^)]+)\)/g)) {
    const p = m[1].split("#")[0];
    if (!p) continue;
    const target = join(base, p);
    if (!existsSync(target)) fail(`${doc} → broken link: ${p}`);
  }
}
if (!fails.some((f) => f.includes("broken link"))) pass("no broken relative links");

console.log(
  fails.length
    ? `\n\x1b[31m✗ ${fails.length} failure(s)\x1b[0m\n`
    : `\n\x1b[32m✓ All checks passed — ${SKILL_COUNT} skills and 5 commands load correctly for every documented agent.\x1b[0m\n`,
);
process.exit(fails.length ? 1 : 0);
