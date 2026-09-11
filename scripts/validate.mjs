#!/usr/bin/env node
// Validate that every install path in the README's Quick Start actually works.
//
// Checks the repo invariants each agent depends on:
//   1. JSON manifests parse (Claude marketplace/plugin, Codex, Antigravity, npm)
//   2. Each manifest's `skills` path resolves to the full set of SKILL.md files
//   3. Every skill has valid frontmatter, `name` matches its directory, and `description` fits the spec limit
//   4. No manifest or root folder ships command or prompt files — skills only
//   5. Skill descriptions are YAML-safe
//   6. Every `skill:<name>` reference in a skill resolves to a real skill
//   7. README catalog matches the skill folders, and phase rows list invoked skills
//   8. Version agrees everywhere
//   9. Relative links in README.md and knowledge-base/ point at real files
//
// Usage: node scripts/validate.mjs   (or: npm test)

import { readFileSync, readdirSync, existsSync } from "node:fs";
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
const pluginManifests = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  "plugin.json", // root manifest — Antigravity + VS Code Copilot native plugin format
];
const PROJECT_PROVIDED_SKILLS = new Set(["definition-of-done"]);
const PHASE_SKILLS = ["define", "build", "verify", "review", "ship"];
const MAX_DESCRIPTION_CHARS = 1024;

const sectionBetween = (text, startHeading, endHeading) => {
  const start = text.indexOf(startHeading);
  const end = start === -1 ? -1 : text.indexOf(endHeading, start);
  return end === -1 ? null : text.slice(start, end);
};

// An unquoted description holding ": " is invalid YAML, and GitHub rejects the frontmatter.
const yamlBroken = (raw) => !/^".*"$/.test(raw) && /:\s/.test(raw);

const unfoldedDescription = (frontmatter) => {
  const lines = frontmatter.split("\n");
  const at = lines.findIndex((l) => l.startsWith("description:"));
  if (at === -1) return "";
  const inline = lines[at].slice("description:".length).trim();
  if (!/^[>|][+-]?$/.test(inline)) return inline.replace(/^"(.*)"$/, "$1");
  const block = [];
  for (const line of lines.slice(at + 1)) {
    if (!/^\s/.test(line)) break;
    block.push(line.trim());
  }
  return block.join(" ");
};

head(`1. JSON manifests parse`);
const manifests = [".claude-plugin/marketplace.json", ...pluginManifests, "package.json"];
for (const m of manifests) {
  try {
    JSON.parse(readFileSync(R(m), "utf8"));
    pass(m);
  } catch (e) {
    fail(`${m}: ${e.message}`);
  }
}

head(`2. Manifest 'skills' paths resolve to ${SKILL_COUNT} skills`);
for (const m of pluginManifests) {
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
  const desc = unfoldedDescription(fm[1]);
  if (name !== d) fail(`${d}: frontmatter name "${name}" ≠ directory "${d}"`);
  else if (!desc) fail(`${d}: missing description (agents match on this)`);
  else if (desc.length > MAX_DESCRIPTION_CHARS)
    fail(`${d}: description is ${desc.length} chars (max ${MAX_DESCRIPTION_CHARS}) — VS Code silently skips the skill`);
  else good++;
}
if (good === SKILL_COUNT) pass(`${good}/${SKILL_COUNT} valid, name matches directory, description ≤ ${MAX_DESCRIPTION_CHARS} chars`);

head(`4. Skills only — no command or prompt surfaces`);
const retiredFolders = ["commands", "prompts"].filter((f) => existsSync(R(f)));
retiredFolders.length
  ? fail(`root ${retiredFolders.join(", ")} folder exists — phases ship as skills/<name>/SKILL.md`)
  : pass(`no root commands or prompts folder`);
for (const m of pluginManifests) {
  const declared = ["commands", "prompts"].filter((k) => k in JSON.parse(readFileSync(R(m), "utf8")));
  declared.length
    ? fail(`${m}: declares ${declared.map((k) => `"${k}"`).join(", ")} — the plugin ships skills only`)
    : pass(`${m}: declares skills only`);
}

head(`5. YAML frontmatter parses (unquoted ": " breaks GitHub's renderer)`);
const badYaml = skillDirs.filter((d) => {
  const fm = readFileSync(R("skills", d, "SKILL.md"), "utf8").match(/^---\n([\s\S]*?)\n---\n/);
  return (fm?.[1].match(/^description:\s*(.*)$/m) || []).slice(1).some(yamlBroken);
});
badYaml.length
  ? badYaml.forEach((d) => fail(`skills/${d}/SKILL.md: description holds ": " unquoted — wrap the value in double quotes`))
  : pass(`${SKILL_COUNT} frontmatter descriptions are YAML-safe`);

head(`6. skill: references resolve`);
const skillDocs = skillDirs.flatMap((d) => {
  const refsDir = R("skills", d, "references");
  const references = existsSync(refsDir)
    ? readdirSync(refsDir).filter((f) => f.endsWith(".md")).map((f) => `skills/${d}/references/${f}`)
    : [];
  return [`skills/${d}/SKILL.md`, ...references];
});
const unresolved = skillDocs.flatMap((doc) =>
  [...readFileSync(R(doc), "utf8").matchAll(/skill:([a-z0-9-]+)/g)]
    .map((m) => m[1])
    .filter((ref) => !PROJECT_PROVIDED_SKILLS.has(ref) && !existsSync(R("skills", ref, "SKILL.md")))
    .map((ref) => `${doc} → skill:${ref}`),
);
unresolved.length
  ? unresolved.forEach((u) => fail(`unresolved ${u}`))
  : pass(`every skill: reference across ${skillDocs.length} skill files resolves to a real SKILL.md`);

head(`7. README catalog matches the skill folders, and phase rows list invoked skills`);
const readme = readFileSync(R("README.md"), "utf8");
const catalog = readme.slice(readme.indexOf("## Skills Catalog"));
const listed = new Set([...catalog.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]));
const undocumented = skillDirs.filter((d) => !listed.has(d));
undocumented.length
  ? fail(`missing from the README catalog: ${undocumented.join(", ")}`)
  : pass(`all ${SKILL_COUNT} skills appear in the Skills Catalog`);
const listedWithoutFolder = [...listed].filter((name) => !skillDirs.includes(name));
listedWithoutFolder.length
  ? fail(`README catalog lists skills with no skills/<name>/SKILL.md: ${listedWithoutFolder.join(", ")}`)
  : pass(`every Skills Catalog row names a real skill`);
// A skill a phase invokes must be visible in that phase's README row, or readers
// plan around a phase that silently does more than documented.
const phaseTable = sectionBetween(readme, "## Phase skills", "### Recommended model per phase skill");
const phaseRows = new Map(
  [...(phaseTable ?? "").matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|[^|\n]*\|([^|\n]*)\|/gm)].map(([, phase, invokes]) => [phase, invokes]),
);
const phaseGaps = [
  ...[...phaseRows.keys()].filter((row) => !PHASE_SKILLS.includes(row)).map((row) => `unexpected row \`${row}\` — not a phase skill`),
  ...PHASE_SKILLS.flatMap((phase) => {
    if (!phaseRows.has(phase)) return [`no \`${phase}\` row`];
    const src = R("skills", phase, "SKILL.md");
    if (!existsSync(src)) return [`\`${phase}\` has no skills/${phase}/SKILL.md`];
    const steps = sectionBetween(readFileSync(src, "utf8"), "## The Process", "## Common Rationalizations");
    if (steps === null) return [`skills/${phase}/SKILL.md lacks "## The Process" followed by "## Common Rationalizations"`];
    const invoked = new Set([...steps.matchAll(/skill:([a-z0-9-]+)/g)].map((m) => m[1]));
    return [...invoked]
      .filter((ref) => !PHASE_SKILLS.includes(ref) && !phaseRows.get(phase).includes(`\`${ref}\``))
      .map((ref) => `\`${phase}\` invokes ${ref} but its row does not list it`);
  }),
];
if (phaseTable === null) fail(`README has no "## Phase skills" section ahead of "### Recommended model per phase skill"`);
else if (phaseGaps.length) phaseGaps.forEach((g) => fail(`README Phase skills table: ${g}`));
else pass(`all ${PHASE_SKILLS.length} phase skill rows list the skills that phase invokes`);

head(`8. Version agrees everywhere`);
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

head(`9. Relative links in docs resolve`);
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
    : `\n\x1b[32m✓ All checks passed — ${SKILL_COUNT} skills load correctly for every documented agent.\x1b[0m\n`,
);
process.exit(fails.length ? 1 : 0);
