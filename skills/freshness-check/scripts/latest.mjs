#!/usr/bin/env node
// latest.mjs — authoritative "what version is current TODAY" lookups.
//
// Queries package registries directly (no scraping, no search ranking,
// no model memory). Zero dependencies — Node >= 18 (global fetch).
//
// Usage:
//   node skills/freshness-check/scripts/latest.mjs <registry>:<name> [...]
//   node skills/freshness-check/scripts/latest.mjs --json npm:react pypi:django
//
// Registries:
//   npm:<package>                  npm:@angular/core
//   pypi:<package>                 pypi:django
//   crates:<crate>                 crates:serde
//   nuget:<package-id>             nuget:Newtonsoft.Json
//   maven:<groupId>:<artifactId>   maven:org.springframework:spring-core
//   go:<module-path>               go:github.com/gin-gonic/gin
//   github:<owner>/<repo>          github:angular/angular  (latest release;
//                                  unauthenticated = 60 req/h)
//
// Output: registry, name, latest stable version, published date. Exit 1 if
// any lookup failed.

const UA = { "User-Agent": "freshness-check-skill (agent tooling)" };

async function get(url, headers = {}) {
  const res = await fetch(url, { headers: { ...UA, ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

const day = (iso) => (iso ? String(iso).slice(0, 10) : "?");
const stable = (v) => v && !/[-+]/.test(v); // no prerelease/build suffix

const registries = {
  async npm(name) {
    const d = await get(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    const latest = d["dist-tags"]?.latest;
    const tags = Object.entries(d["dist-tags"] || {})
      .map(([t, v]) => `${t}=${v}`)
      .join(" ");
    return { version: latest, date: day(d.time?.[latest]), extra: tags };
  },
  async pypi(name) {
    const d = await get(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
    const v = d.info.version;
    return { version: v, date: day(d.releases?.[v]?.[0]?.upload_time_iso_8601) };
  },
  async crates(name) {
    const d = await get(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`);
    return {
      version: d.crate.max_stable_version ?? d.crate.newest_version,
      date: day(d.crate.updated_at),
    };
  },
  async nuget(name) {
    const d = await get(
      `https://api.nuget.org/v3-flatcontainer/${name.toLowerCase()}/index.json`,
    );
    const stables = d.versions.filter(stable);
    return { version: stables.at(-1) ?? d.versions.at(-1), date: "?" };
  },
  async maven(name) {
    const [g, a] = name.split(":");
    if (!g || !a) throw new Error("maven needs <groupId>:<artifactId>");
    // core=gav lists individual versions — the summary doc's `latestVersion`
    // happily reports milestones/RCs (e.g. spring-core 7.0.0-M6) as latest.
    const d = await get(
      `https://search.maven.org/solrsearch/select?q=g:%22${g}%22+AND+a:%22${a}%22&core=gav&rows=50&wt=json`,
    );
    const docs = d.response?.docs;
    if (!docs?.length) throw new Error("not found on Maven Central");
    const pick =
      docs.find((x) => !/[-.](M|RC|alpha|beta|SNAPSHOT)[-.0-9]*$/i.test(x.v)) ?? docs[0];
    return { version: pick.v, date: day(new Date(pick.timestamp).toISOString()) };
  },
  async go(name) {
    // Module paths are case-encoded for the proxy: R -> !r
    const enc = name.replace(/[A-Z]/g, (c) => "!" + c.toLowerCase());
    const d = await get(`https://proxy.golang.org/${enc}/@latest`);
    return { version: d.Version, date: day(d.Time) };
  },
  async github(name) {
    const d = await get(`https://api.github.com/repos/${name}/releases/latest`, {
      Accept: "application/vnd.github+json",
    });
    return { version: d.tag_name, date: day(d.published_at), extra: d.name ?? "" };
  },
};

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const queries = args.filter((a) => a !== "--json");
if (!queries.length) {
  console.error("usage: latest.mjs [--json] <registry>:<name> [...]  (see header)");
  process.exit(2);
}

const results = await Promise.all(
  queries.map(async (q) => {
    const i = q.indexOf(":");
    const reg = i > 0 ? q.slice(0, i) : "";
    const name = q.slice(i + 1);
    if (!registries[reg])
      return { query: q, error: `unknown registry "${reg}" (${Object.keys(registries).join(", ")})` };
    try {
      return { query: q, registry: reg, name, ...(await registries[reg](name)) };
    } catch (e) {
      return { query: q, registry: reg, name, error: e.message };
    }
  }),
);

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const r of results) {
    if (r.error) console.log(`✗ ${r.query.padEnd(40)} ${r.error}`);
    else
      console.log(
        `✓ ${r.query.padEnd(40)} ${String(r.version).padEnd(14)} ${r.date}${r.extra ? "  [" + r.extra + "]" : ""}`,
      );
  }
}
process.exit(results.some((r) => r.error) ? 1 : 0);
