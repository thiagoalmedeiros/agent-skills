import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, validateBundle } from "../plugins/agentic-sdlc/skills/open-knowledge/scripts/validate.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = join(root, "tests", "fixtures", "okf");
const script = join(root, "plugins", "agentic-sdlc", "skills", "open-knowledge", "scripts", "validate.mjs");
const fixture = (name) => join(fixtures, name);
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
const frontmatter = (yaml) => parseFrontmatter(`---\n${yaml}\n---\nbody`);

describe("parseFrontmatter", () => {
  test("returns null data when the file has no frontmatter", () => {
    assert.deepEqual(parseFrontmatter("# Title\n"), { data: null, body: "# Title\n" });
  });

  test("parses plain, quoted, and commented scalars", () => {
    const { data } = frontmatter(
      [
        "type: Metric",
        'title: "Revenue: \\"fiscal\\" year"',
        "description: 'Finance''s definition'",
        "status: stable   # draft | stable | deprecated",
        "note: C# is not a comment",
        "empty:",
      ].join("\n"),
    );
    assert.deepEqual(data, {
      type: "Metric",
      title: 'Revenue: "fiscal" year',
      description: "Finance's definition",
      status: "stable",
      note: "C# is not a comment",
      empty: null,
    });
  });

  test("resolves YAML null spellings to null, plain or in flow, but not when quoted", () => {
    const { data } = frontmatter('a: null\nb: Null\nc: NULL\nd: ~\ne: { k: ~ }\nf: "null"');
    assert.deepEqual(data, { a: null, b: null, c: null, d: null, e: { k: null }, f: "null" });
  });

  test("parses nested flow collections", () => {
    const { data } = frontmatter('tags: [a, "b, c"]\ngenerated: { by: agent/v1, at: 2026-01-01T00:00:00Z, n: [1, { k: v }] }');
    assert.deepEqual(data, {
      tags: ["a", "b, c"],
      generated: { by: "agent/v1", at: "2026-01-01T00:00:00Z", n: ["1", { k: "v" }] },
    });
  });

  test("parses block sequences of scalars, flow mappings, and block mappings", () => {
    const { data } = frontmatter(
      [
        "tags:",
        "  - a",
        "  - b",
        "verified:",
        "  - { by: human:x, at: 2026-01-01T00:00:00Z }",
        "sources:",
        "- id: one",
        "  resource: https://example.com",
        "- resource: /local.md",
      ].join("\n"),
    );
    assert.deepEqual(data, {
      tags: ["a", "b"],
      verified: [{ by: "human:x", at: "2026-01-01T00:00:00Z" }],
      sources: [{ id: "one", resource: "https://example.com" }, { resource: "/local.md" }],
    });
  });

  test("parses one level of nested block mapping", () => {
    const { data } = frontmatter("executor:\n  resource: run.md\n  receipt: [job_id, result]");
    assert.deepEqual(data, { executor: { resource: "run.md", receipt: ["job_id", "result"] } });
  });

  for (const [construct, yaml] of [
    ["block scalar", "notes: |\n  text"],
    ["folded scalar", "notes: >\n  text"],
    ["anchor", "a: &x value"],
    ["alias", "a: *x"],
    ["tag", "a: !!str value"],
    ["unquoted colon-space", "title: Incident: freshness"],
    ["nesting deeper than one level", "a:\n  b:\n    c: d"],
    ["tab indentation", "a:\n\tb: c"],
    ["duplicate key", "a: 1\na: 2"],
    ["unterminated quote", 'a: "open'],
    ["unclosed flow mapping", "a: { b: c"],
    ["multi-line sequence item", "a:\n  - b\n    c"],
    ["inline value plus block", "a: b\n  c: d"],
    ["__proto__ block key", "__proto__:\n  type: Guide"],
    ["__proto__ flow key", "__proto__: { type: Guide }"],
    ["__proto__ nested flow key", "a: { __proto__: { b: c } }"],
  ])
    test(`rejects ${construct} instead of guessing`, () => {
      const result = frontmatter(yaml);
      assert.equal(result.data, undefined);
      assert.match(result.error, /^line \d+: /);
    });

  test("rejects frontmatter that is never closed", () => {
    assert.match(parseFrontmatter("---\ntype: Guide\n").error, /never closed/);
  });

  test("normalizes CRLF line endings", () => {
    assert.deepEqual(parseFrontmatter("---\r\ntype: Guide\r\n---\r\n").data, { type: "Guide" });
  });

  test("ignores a leading byte order mark", () => {
    assert.deepEqual(parseFrontmatter("\uFEFF---\ntype: Guide\n---\n").data, { type: "Guide" });
  });
});

describe("validateBundle", () => {
  test("a bundle exercising every v0.2 family is clean, even under --strict", () => {
    const { findings, summary } = validateBundle(fixture("valid"), { strict: true });
    assert.deepEqual(findings, []);
    assert.deepEqual(summary, { files: 6, concepts: 2, errors: 0, warnings: 0 });
  });

  for (const name of readdirSync(fixtures).filter((name) => name.startsWith("valid-")))
    test(`${name} is clean under --strict`, () => {
      assert.deepEqual(validateBundle(fixture(name), { strict: true }).findings, []);
    });

  const expected = {
    "e1-no-frontmatter": ["sample.md", /^no YAML frontmatter$/],
    "e1-unparseable": ["sample.md", /unsupported YAML construct "\|"/],
    "e2-no-type": ["sample.md", /^missing or empty type$/],
    "e2-null-type": ["sample.md", /^missing or empty type$/],
    "e3-log-frontmatter": ["log.md", /^log\.md must not carry frontmatter$/],
    "e3-log-heading": ["log.md", /"## May 2026" is not an ISO 8601/],
    "e3-root-index-extra-key": ["index.md", /only carry okf_version \(found: title\)/],
    "e3-subindex-frontmatter": ["sub/index.md", /only the bundle-root index\.md/],
    "h1-folder-name": ["Sub_Folder/", /^folder name is not lowercase kebab-case$/],
    "h1-not-kebab": ["Sample_Doc.md", /^file name is not lowercase kebab-case$/],
    "h2-no-index": ["sub/", /no index\.md/],
    "h3-unlisted": ["sample.md", /not listed in its folder's index\.md/],
    "h4-legacy-timestamp": ["sample.md", /^legacy timestamp/],
    "h4-no-generated": ["sample.md", /^no generated/],
    "h5-broken-link": ["sample.md", /^link "\/missing\.md" does not resolve$/],
    "h5-broken-reference-link": ["sample.md", /^link "\/missing\.md" does not resolve$/],
    "h5-broken-relative-link": ["sample.md", /^link "missing\.md" does not resolve$/],
    "h5-nested-list-link": ["sample.md", /^link "\/missing\.md" does not resolve$/],
    "h5-wrong-case": ["sample.md", /^link "\/Other\.md" does not resolve$/],
    "w1-no-runtime": ["sample.md", /no runtime/],
    "w2-generated-no-by": ["sample.md", /^generated has no by$/],
    "w2-verified-no-at": ["sample.md", /^verified\[0\] has no at$/],
    "w3-datetime-no-offset": ["sample.md", /^generated\.at "2026-01-01" is not/],
    "w3-time-no-offset": ["sample.md", /^generated\.at "2026-01-01T00:00:00" is not/],
    "w3-usage-window-shape": ["sample.md", /^usage_window must be a \{ from, to \} mapping/],
    "w4-bad-status": ["sample.md", /^status "final"/],
    "w5-source-no-resource": ["sample.md", /^sources\[0\] has no resource$/],
    "w5-sources-not-list": ["sample.md", /^sources must be a list$/],
    "w6-bad-actor": ["sample.md", /^generated\.by "tester" does not follow/],
    "w7-stale": ["sample.md", /^stale since 2020-01-01T00:00:00Z$/],
  };
  const cases = readdirSync(fixtures).filter((name) => !name.startsWith("valid"));
  for (const name of cases)
    test(`${name} reports exactly ${name.split("-")[0].toUpperCase()}`, () => {
      assert.ok(expected[name], `add an expectation for fixture ${name}`);
      const [file, message] = expected[name];
      const findings = validateBundle(fixture(name)).findings;
      assert.deepEqual(findings.map((f) => [f.code, f.file]), [[name.split("-")[0].toUpperCase(), file]]);
      assert.match(findings[0].message, message);
    });

  test("validates a symlinked concept like any other file", (t) => {
    const dir = mkdtempSync(join(tmpdir(), "okf-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    writeFileSync(join(dir, "target.txt"), "---\ntitle: Linked\n---\n# Linked\n");
    writeFileSync(join(dir, "index.md"), "# Index\n\n- [Linked](/linked.md)\n");
    symlinkSync(join(dir, "target.txt"), join(dir, "linked.md"));
    const { findings, summary } = validateBundle(dir);
    assert.deepEqual(findings.map((f) => [f.code, f.file]), [["E2", "linked.md"]]);
    assert.equal(summary.concepts, 1);
  });

  test("every code family is covered by a fixture", () => {
    const covered = new Set(cases.map((name) => name.split("-")[0].toUpperCase()));
    const families = ["E1", "E2", "E3", "W1", "W2", "W3", "W4", "W5", "W6", "W7", "H1", "H2", "H3", "H4", "H5"];
    assert.deepEqual([...covered].sort(), families.sort());
  });

  test("errors stay errors and warnings become errors under strict", () => {
    assert.equal(validateBundle(fixture("e2-no-type")).findings[0].level, "error");
    assert.equal(validateBundle(fixture("h4-legacy-timestamp")).findings[0].level, "warning");
    assert.equal(validateBundle(fixture("h4-legacy-timestamp"), { strict: true }).findings[0].level, "error");
  });

  test("staleness is judged against the supplied clock", () => {
    const before = validateBundle(fixture("w7-stale"), { now: new Date("2019-12-31T23:59:59Z") });
    const at = validateBundle(fixture("w7-stale"), { now: new Date("2020-01-01T00:00:00Z") });
    assert.deepEqual(before.findings, []);
    assert.deepEqual(at.findings.map((f) => f.code), ["W7"]);
  });
});

describe("CLI", () => {
  test("exits 0 on a conformant bundle and prints the summary", () => {
    const { status, stdout } = run("--strict", fixture("valid"));
    assert.equal(status, 0);
    assert.match(stdout, /^0 error\(s\), 0 warning\(s\)$/m);
  });

  test("exits 1 on errors", () => {
    const { status, stdout } = run(fixture("e2-no-type"));
    assert.equal(status, 1);
    assert.match(stdout, /^E2 error sample\.md — /m);
  });

  test("--strict turns a warnings-only bundle into a failure", () => {
    assert.equal(run(fixture("h4-legacy-timestamp")).status, 0);
    assert.equal(run("--strict", fixture("h4-legacy-timestamp")).status, 1);
  });

  test("--json prints the result object", () => {
    const { status, stdout } = run("--json", fixture("h5-broken-link"));
    assert.equal(status, 0);
    const result = JSON.parse(stdout);
    assert.deepEqual(result.findings.map((f) => [f.code, f.file]), [["H5", "sample.md"]]);
  });

  for (const [why, args] of [
    ["no bundle", []],
    ["two bundles", [fixture("valid"), fixture("valid")]],
    ["an unknown flag", ["--fix", fixture("valid")]],
    ["a missing directory", [join(fixtures, "does-not-exist")]],
  ])
    test(`exits 2 on ${why}`, () => {
      const { status, stderr } = run(...args);
      assert.equal(status, 2);
      assert.notEqual(stderr, "");
    });
});
