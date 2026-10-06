#!/usr/bin/env node
// validate.mjs — OKF v0.2 conformance check for a knowledge bundle.
//
// Errors (E*) are OKF v0.2 spec §11 conformance faults, plus this
// validator's own restrictions: frontmatter outside its strict YAML subset is
// an error even when it is valid YAML, never a silent pass, and log.md may
// not carry frontmatter. Warnings are v0.2 family-shape faults (W*) and house
// rules (H*); --strict promotes every warning to an error. The codes are
// listed in ../references/reference.md. Zero dependencies — Node >= 18.
//
// Usage:
//   node plugins/agentic-sdlc/skills/open-knowledge/scripts/validate.mjs [--strict] [--json] <bundle-dir>
//
// Exit: 0 conformant · 1 errors (any warning counts under --strict) · 2 bad usage.

import { readdirSync, readFileSync, realpathSync, existsSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RESERVED = new Set(["index.md", "log.md"]);
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;
const ACTOR = /^(?:human:\S+|process:\S+|[^\s/:]+\/\S+)$/;
const SOURCE_AUTHOR = /^(?:team:\S+|human:\S+|process:\S+|[^\s/:]+\/\S+)$/;
const STATUSES = new Set(["draft", "stable", "deprecated"]);
const LOG_HEADING = /^## \d{4}-\d{2}-\d{2}\s*$/;
const KEY_LINE = /^([A-Za-z_][\w.-]*|"[^"]*"|'[^']*'):(?:[ \t]+(.*))?$/;
const UNSUPPORTED_SCALAR = /^(?:[|>&*!%@`]|- |-$)/;
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const YAML_NULLS = new Set(["null", "Null", "NULL", "~"]);
const INLINE_LINK = /\]\(\s*<?([^)\s>]+)>?(?:\s+["'(][^)]*)?\)/g;
const REFERENCE_DEFINITION = /^ {0,3}\[(?!\^)[^\]]+\]:\s*<?([^\s>]+)>?/gm;
const FENCE_OPEN = /^\s*(`{3,}|~{3,})/;
const INDENTED_CODE = /^(?: {4}|\t)/;
const LIST_ITEM = /^ {0,3}(?:[-*+]|\d+[.)])(?:\s|$)/;
const DOUBLE_QUOTE_ESCAPES = { n: "\n", t: "\t", '"': '"', "\\": "\\", "/": "/" };

class FrontmatterError extends Error {
  constructor(line, message) {
    super(`line ${line}: ${message}`);
  }
}

export function parseFrontmatter(text) {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] !== "---") return { data: null, body: lines.join("\n") };
  const end = lines.indexOf("---", 1);
  if (end < 0) return { error: "line 1: frontmatter is never closed with ---" };
  try {
    return {
      data: parseBlockMapping(toEntries(lines.slice(1, end), 2), 0),
      body: lines.slice(end + 1).join("\n"),
    };
  } catch (e) {
    if (e instanceof FrontmatterError) return { error: e.message };
    throw e;
  }
}

function toEntries(lines, firstLineNo) {
  return lines
    .map((raw, i) => ({ no: i + firstLineNo, raw }))
    .filter(({ raw }) => raw.trim() && !raw.trim().startsWith("#"))
    .map(({ no, raw }) => {
      const indent = raw.match(/^[ \t]*/)[0];
      if (indent.includes("\t")) throw new FrontmatterError(no, "tab indentation is not supported");
      return { no, indent: indent.length, text: stripComment(raw.slice(indent.length)) };
    });
}

function stripComment(text) {
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote === '"' && c === "\\") i++;
    else if (quote && c === quote) quote = null;
    else if (!quote && (c === '"' || c === "'") && (i === 0 || /[\s:,[{]/.test(text[i - 1]))) quote = c;
    else if (!quote && c === "#" && (i === 0 || /\s/.test(text[i - 1]))) return text.slice(0, i).trimEnd();
  }
  return text.trimEnd();
}

const isSequenceItem = (text) => text === "-" || text.startsWith("- ");

function splitKey(no, text) {
  const m = text.match(KEY_LINE);
  if (!m) throw new FrontmatterError(no, `expected "key: value", found "${text}"`);
  return [mappingKey(no, unquoteKey(m[1])), (m[2] ?? "").trim()];
}

const unquoteKey = (key) => (/^["']/.test(key) ? key.slice(1, -1) : key);

function mappingKey(no, key) {
  if (key === "__proto__") throw new FrontmatterError(no, `key "__proto__" is not supported`);
  return key;
}

function parseBlockMapping(entries, depth) {
  const data = {};
  const base = entries[0]?.indent ?? 0;
  let i = 0;
  while (i < entries.length) {
    const { no, indent, text } = entries[i];
    if (indent !== base) throw new FrontmatterError(no, "unexpected indentation");
    const [key, inline] = splitKey(no, text);
    if (Object.hasOwn(data, key)) throw new FrontmatterError(no, `duplicate key "${key}"`);
    const block = [];
    for (i++; i < entries.length; i++) {
      const next = entries[i];
      if (next.indent < base || (next.indent === base && !isSequenceItem(next.text))) break;
      block.push(next);
    }
    if (inline !== "") {
      data[key] = parseInline(no, inline);
      if (block.length) throw new FrontmatterError(block[0].no, `"${key}" has both an inline value and a block`);
    } else if (!block.length) {
      data[key] = null;
    } else if (depth > 0) {
      throw new FrontmatterError(no, `"${key}": blocks nested more than one level deep are not supported`);
    } else {
      data[key] = isSequenceItem(block[0].text)
        ? parseBlockSequence(block)
        : parseBlockMapping(block, depth + 1);
    }
  }
  return data;
}

function parseBlockSequence(entries) {
  const base = entries[0].indent;
  const items = [];
  let i = 0;
  while (i < entries.length) {
    const { no, indent, text } = entries[i];
    if (indent !== base || !isSequenceItem(text)) throw new FrontmatterError(no, "expected a sequence item");
    const content = text.slice(1).trimStart();
    const continuation = [];
    for (i++; i < entries.length && entries[i].indent > base; i++) continuation.push(entries[i]);
    if (content === "") throw new FrontmatterError(no, "empty or nested sequence items are not supported");
    if (KEY_LINE.test(content)) {
      const column = base + text.length - content.length;
      items.push(parseBlockMapping([{ no, indent: column, text: content }, ...continuation], 1));
    } else if (continuation.length) {
      throw new FrontmatterError(continuation[0].no, "multi-line sequence items are not supported");
    } else {
      items.push(parseInline(no, content));
    }
  }
  return items;
}

function parseInline(no, text) {
  const reader = { text, i: 0, no };
  let value;
  if (text.startsWith("[") || text.startsWith("{")) value = readFlow(reader);
  else if (text.startsWith('"') || text.startsWith("'")) value = readQuoted(reader);
  else return plainScalar(no, text);
  skipSpace(reader);
  if (reader.i < text.length)
    throw new FrontmatterError(no, `unexpected "${text.slice(reader.i)}" after value`);
  return value;
}

function plainScalar(no, text) {
  if (UNSUPPORTED_SCALAR.test(text)) throw new FrontmatterError(no, `unsupported YAML construct "${text}"`);
  if (/:\s/.test(text) || text.endsWith(":"))
    throw new FrontmatterError(no, `plain value "${text}" contains ": " — quote it`);
  return YAML_NULLS.has(text) ? null : text;
}

const skipSpace = (r) => {
  while (r.i < r.text.length && /\s/.test(r.text[r.i])) r.i++;
};

function readFlow(r) {
  skipSpace(r);
  if (r.text[r.i] === "[") return readFlowCollection(r, "]", () => readFlow(r));
  if (r.text[r.i] === "{") return toMapping(r.no, readFlowCollection(r, "}", () => readFlowPair(r)));
  return readFlowScalar(r, ",]}");
}

function readFlowPair(r) {
  const key = readFlowScalar(r, ",]}:");
  if (r.text[r.i] !== ":") throw new FrontmatterError(r.no, `expected ":" after "${key}" in flow mapping`);
  r.i++;
  return [key, readFlow(r)];
}

function readFlowCollection(r, close, readItem) {
  r.i++;
  const items = [];
  skipSpace(r);
  if (r.text[r.i] === close) {
    r.i++;
    return items;
  }
  for (;;) {
    items.push(readItem());
    skipSpace(r);
    const c = r.text[r.i++];
    if (c === close) return items;
    if (c !== ",") throw new FrontmatterError(r.no, `expected "," or "${close}" in flow collection`);
  }
}

function readFlowScalar(r, stops) {
  skipSpace(r);
  if (r.text[r.i] === '"' || r.text[r.i] === "'") return readQuoted(r);
  const start = r.i;
  while (r.i < r.text.length && !stops.includes(r.text[r.i])) r.i++;
  const value = r.text.slice(start, r.i).trim();
  if (value === "") throw new FrontmatterError(r.no, "empty value in flow collection");
  return plainScalar(r.no, value);
}

function readQuoted(r) {
  const quote = r.text[r.i++];
  let value = "";
  while (r.i < r.text.length) {
    const c = r.text[r.i++];
    if (quote === "'" && c === "'" && r.text[r.i] === "'") {
      value += "'";
      r.i++;
    } else if (c === quote) {
      return value;
    } else if (quote === '"' && c === "\\") {
      const escaped = DOUBLE_QUOTE_ESCAPES[r.text[r.i++]];
      if (escaped === undefined) throw new FrontmatterError(r.no, "unsupported escape sequence");
      value += escaped;
    } else {
      value += c;
    }
  }
  throw new FrontmatterError(r.no, "unterminated quoted value");
}

function toMapping(no, pairs) {
  const data = {};
  for (const [key, value] of pairs) {
    mappingKey(no, key);
    if (Object.hasOwn(data, key)) throw new FrontmatterError(no, `duplicate key "${key}"`);
    data[key] = value;
  }
  return data;
}

const isMapping = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function validateBundle(dir, { strict = false, now = new Date() } = {}) {
  const root = resolve(dir);
  const findings = [];
  const exists = exactCaseExists();
  let files = 0;
  let concepts = 0;
  const report = (code, path, message) =>
    findings.push({
      code,
      level: code.startsWith("E") || strict ? "error" : "warning",
      file: displayPath(root, path),
      message,
    });

  walk(root, (dirPath, entries) => {
    if (dirPath !== root && !KEBAB.test(basename(dirPath)))
      report("H1", dirPath, "folder name is not lowercase kebab-case");
    const docs = entries.filter((e) => e.name.endsWith(".md") && isFile(dirPath, e)).map((e) => e.name);
    const conceptNames = docs.filter((name) => !RESERVED.has(name));
    const indexed = new Set();

    for (const name of docs) {
      const path = join(dirPath, name);
      const text = readFileSync(path, "utf8");
      const parsed = parseFrontmatter(text);
      const prose = proseOnly(parsed.body ?? text);
      const flag = (code, message) => report(code, path, message);
      files++;

      if (name === "index.md") checkIndex(parsed, dirPath === root, flag);
      else if (name === "log.md") checkLog(parsed, prose, flag);
      else {
        concepts++;
        if (!KEBAB.test(name.slice(0, -3))) flag("H1", "file name is not lowercase kebab-case");
        checkConcept(parsed, flag, now);
      }

      for (const { href, target } of bundleLinks(prose, path, root)) {
        if (!exists(target)) flag("H5", `link "${href}" does not resolve`);
        if (name === "index.md") indexed.add(target);
      }
    }

    if (conceptNames.length && !docs.includes("index.md"))
      report("H2", dirPath, "folder holds concepts but has no index.md");
    else
      for (const name of conceptNames)
        if (!indexed.has(join(dirPath, name)))
          report("H3", join(dirPath, name), "concept is not listed in its folder's index.md");
  });

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.code.localeCompare(b.code));
  const errors = findings.filter((f) => f.level === "error").length;
  return { bundle: dir, findings, summary: { files, concepts, errors, warnings: findings.length - errors } };
}

const isFile = (dirPath, entry) =>
  entry.isFile() || (entry.isSymbolicLink() && Boolean(statSync(join(dirPath, entry.name), { throwIfNoEntry: false })?.isFile()));

function exactCaseExists() {
  const listings = new Map();
  const exists = (path) => {
    const parent = dirname(path);
    if (parent === path) return true;
    if (!listings.has(parent)) {
      try {
        listings.set(parent, new Set(readdirSync(parent)));
      } catch {
        return existsSync(path);
      }
    }
    return listings.get(parent).has(basename(path)) && exists(parent);
  };
  return exists;
}

function walk(dirPath, visit) {
  const entries = readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));
  visit(dirPath, entries);
  for (const e of entries) if (e.isDirectory()) walk(join(dirPath, e.name), visit);
}

function displayPath(root, path) {
  const rel = relative(root, path).split(sep).join("/");
  if (path.endsWith(".md")) return rel;
  return rel ? `${rel}/` : "./";
}

function checkIndex(parsed, isRoot, flag) {
  if (parsed.error) return flag("E3", `index.md frontmatter is unparseable — ${parsed.error}`);
  if (parsed.data === null) return;
  if (!isRoot) return flag("E3", "only the bundle-root index.md may carry frontmatter");
  const extra = Object.keys(parsed.data).filter((key) => key !== "okf_version");
  if (extra.length) flag("E3", `root index.md frontmatter may only carry okf_version (found: ${extra.join(", ")})`);
}

function checkLog(parsed, prose, flag) {
  if (parsed.error || parsed.data !== null) return flag("E3", "log.md must not carry frontmatter");
  for (const line of prose.split("\n"))
    if (line.startsWith("## ") && !LOG_HEADING.test(line))
      flag("E3", `log.md heading "${line}" is not an ISO 8601 YYYY-MM-DD date`);
}

function checkConcept(parsed, flag, now) {
  if (parsed.error) return flag("E1", `unparseable frontmatter — ${parsed.error}`);
  if (parsed.data === null) return flag("E1", "no YAML frontmatter");
  const data = parsed.data;
  if (typeof data.type !== "string" || !data.type.trim()) return flag("E2", "missing or empty type");

  if (data.type === "Attested Computation" && data.runtime == null)
    flag("W1", "Attested Computation has no runtime");
  if (data.generated == null)
    flag("H4", data.timestamp != null
      ? "legacy timestamp — replace it with generated: { by, at }"
      : "no generated: { by, at }");
  else if (!isMapping(data.generated)) flag("W2", "generated must be a { by, at } mapping");
  else checkEvent(data.generated, "generated", false, flag);
  if (data.verified != null) checkVerified(data.verified, flag);
  if (data.status != null && !STATUSES.has(data.status))
    flag("W4", `status "${data.status}" is not draft, stable, or deprecated`);
  if (data.stale_after != null && checkDatetime(data.stale_after, "stale_after", flag) && now >= new Date(data.stale_after))
    flag("W7", `stale since ${data.stale_after}`);
  if (data.sources != null) checkSources(data.sources, flag);
  if (data.usage_window != null) checkWindow(data.usage_window, "usage_window", flag);
}

function checkVerified(verified, flag) {
  const events = isMapping(verified) ? [verified] : verified;
  if (!Array.isArray(events)) return flag("W2", "verified must be a { by, at } mapping or a list of them");
  events.forEach((event, i) =>
    isMapping(event)
      ? checkEvent(event, `verified[${i}]`, true, flag)
      : flag("W2", `verified[${i}] must be a { by, at } mapping`),
  );
}

function checkEvent(event, label, requireAt, flag) {
  if (event.by == null) flag("W2", `${label} has no by`);
  else checkActor(event.by, `${label}.by`, ACTOR, flag);
  if (event.at != null) checkDatetime(event.at, `${label}.at`, flag);
  else if (requireAt) flag("W2", `${label} has no at`);
}

function checkSources(sources, flag) {
  if (!Array.isArray(sources)) return flag("W5", "sources must be a list");
  sources.forEach((source, i) => {
    if (!isMapping(source) || source.resource == null) return flag("W5", `sources[${i}] has no resource`);
    if (source.author != null) checkActor(source.author, `sources[${i}].author`, SOURCE_AUTHOR, flag);
    if (source.last_modified != null) checkDatetime(source.last_modified, `sources[${i}].last_modified`, flag);
    if (source.usage_window != null) checkWindow(source.usage_window, `sources[${i}].usage_window`, flag);
  });
}

function checkWindow(window, label, flag) {
  if (!isMapping(window)) return flag("W3", `${label} must be a { from, to } mapping of datetimes`);
  for (const bound of ["from", "to"]) checkDatetime(window[bound], `${label}.${bound}`, flag);
}

function checkDatetime(value, label, flag) {
  const valid = typeof value === "string" && DATETIME.test(value) && !Number.isNaN(Date.parse(value));
  if (!valid) flag("W3", `${label} "${value}" is not an ISO 8601 datetime with an explicit offset`);
  return valid;
}

function checkActor(value, label, pattern, flag) {
  if (typeof value !== "string" || !pattern.test(value))
    flag("W6", `${label} "${value}" does not follow the actor convention`);
}

function proseOnly(body) {
  const kept = [];
  let fence = null;
  let indentedCode = false;
  let inList = false;
  let afterBlank = true;
  for (const line of body.replace(/<!--[\s\S]*?-->/g, "").split("\n")) {
    if (fence) {
      if (fence.test(line)) fence = null;
      continue;
    }
    if (!line.trim()) {
      afterBlank = true;
      kept.push(line);
      continue;
    }
    const indented = INDENTED_CODE.test(line);
    indentedCode = indented && (indentedCode || (afterBlank && !inList));
    afterBlank = false;
    if (indentedCode) continue;
    const open = line.match(FENCE_OPEN);
    if (open) {
      fence = new RegExp(`^\\s*\\${open[1][0]}{${open[1].length},}\\s*$`);
      continue;
    }
    if (!indented) inList = LIST_ITEM.test(line) || (inList && line.startsWith(" "));
    kept.push(line);
  }
  return kept.join("\n").replace(/`[^`\n]*`/g, "");
}

function bundleLinks(prose, file, root) {
  const links = [];
  const hrefs = [...prose.matchAll(INLINE_LINK), ...prose.matchAll(REFERENCE_DEFINITION)].map((m) => m[1]);
  for (const href of hrefs) {
    if (URL_SCHEME.test(href) || href.startsWith("#")) continue;
    const path = safeDecode(href.split(/[?#]/)[0]);
    links.push({ href, target: path.startsWith("/") ? join(root, path) : join(dirname(file), path) });
  }
  return links;
}

function safeDecode(path) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function main(args) {
  const flags = args.filter((a) => a.startsWith("--"));
  const dirs = args.filter((a) => !a.startsWith("--"));
  const unknown = flags.filter((f) => f !== "--strict" && f !== "--json");
  if (dirs.length !== 1 || unknown.length) {
    console.error("usage: validate.mjs [--strict] [--json] <bundle-dir>  (see header)");
    return 2;
  }
  if (!existsSync(dirs[0]) || !statSync(dirs[0]).isDirectory()) {
    console.error(`validate.mjs: "${dirs[0]}" is not a directory`);
    return 2;
  }
  const result = validateBundle(dirs[0], { strict: flags.includes("--strict") });
  if (flags.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const f of result.findings) console.log(`${f.code} ${f.level} ${f.file} — ${f.message}`);
    console.log(`${result.summary.errors} error(s), ${result.summary.warnings} warning(s)`);
  }
  return result.summary.errors ? 1 : 0;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)))
  process.exitCode = main(process.argv.slice(2));
