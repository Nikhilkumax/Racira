#!/usr/bin/env node
/**
 * typography-audit.mjs — script-verified reconciliation of the typography
 * domain (display label "Racira Fonts", route segment /typography).
 *
 * Ground truth is src/domains/typography/registry.ts. The script parses the
 * source (like _scripts/cad-reconcile.mjs) so it can run without a React
 * toolchain, and replicates the app's real `toSlug` algorithm for slug truth.
 *
 * Verifies:
 *   1. Total + per-category counts, slug uniqueness / duplicates.
 *   2. Live vs soon split — and whether each "live" flag is truthful
 *      (a wired component must exist in the registry COMP_MAP for the badge
 *      to mean anything).
 *   3. Hidden-built: implementation files that exist for slugs still flagged
 *      "soon" (never registered).
 *   4. Orphans: implementation files that are not wired into any component map.
 *   5. h1 coverage: every component that renders a tool must not be the only
 *      h1 surface; page-level h1 comes from ToolPageHeader.
 *   6. Stale/duplicate registries: src/data/typography/tools.ts and
 *      src/components/typography/font-previewer.tsx are checked for imports.
 *   7. DOM gate: liveToolFilters must not treat typography as component-gated,
 *      and the [slug] page must gate on isLiveTool + a wired component.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, relative } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const rel = (p) => p.replace(/\\/g, "/");

const regPath = resolve(ROOT, "src/domains/typography/registry.ts");
const compRegPath = resolve(ROOT, "src/domains/typography/components/tools/registry.ts");
const pagePath = resolve(ROOT, "src/app/typography/[slug]/page.tsx");
const indexPath = resolve(ROOT, "src/app/typography/page.tsx");
const layoutPath = resolve(ROOT, "src/app/typography/layout.tsx");
const filtersPath = resolve(ROOT, "src/lib/tools/liveToolFilters.ts");
const sitePath = resolve(ROOT, "src/domains/typography/site.ts");

const regSrc = readFileSync(regPath, "utf-8");
const compRegSrc = existsSync(compRegPath) ? readFileSync(compRegPath, "utf-8") : "";
const pageSrc = readFileSync(pagePath, "utf-8");
const indexSrc = readFileSync(indexPath, "utf-8");
const layoutSrc = readFileSync(layoutPath, "utf-8");
const filtersSrc = readFileSync(filtersPath, "utf-8");
const siteSrc = readFileSync(sitePath, "utf-8");

// ── real toSlug (must stay byte-equivalent to src/lib/utils/slug.ts) ────────
const toSlug = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ── parse registry.ts ───────────────────────────────────────────────────────
const catRe = /name:\s*"([^"]+)",\s*\n\s*tools:\s*mk\(\[([\s\S]*?)\n\s*\]\),/g;
const categories = [];
for (const m of regSrc.matchAll(catRe)) {
  const tools = [];
  const rowRe = /\[\s*"([^"]+)",\s*"([^"]+)",\s*([A-Za-z0-9_]+),\s*(true|false)\s*\]/g;
  for (const row of m[2].matchAll(rowRe)) {
    tools.push({ name: row[1], desc: row[2], icon: row[3], live: row[4] === "true", slug: toSlug(row[1]) });
  }
  categories.push({ name: m[1], slug: toSlug(m[1]), tools });
}

const allTools = categories.flatMap((c) => c.tools.map((t) => ({ ...t, category: c.name })));

// ── wired components (COMP_MAP) ─────────────────────────────────────────────
// COMP_MAP in the domain registry aliases TOOL_COMPONENTS, which spreads the
// Easy-tier map. So the real wiring surface is:
//   components/tools/registry.ts   → literal entries (font-previewer)
//   components/tools/easy/registry.tsx → one dynamic import per Easy slug
const tierRegPaths = ["easy", "medium"].map((t) =>
  resolve(ROOT, `src/domains/typography/components/tools/${t}/registry.tsx`)
);
const tierRegSrcs = tierRegPaths.filter(existsSync).map((p) => readFileSync(p, "utf-8"));
const compMapEntries = new Map();
for (const m of compRegSrc.matchAll(/^\s*"([^"]+)":\s*[A-Za-z0-9_]+\s*,?\s*$/gm)) compMapEntries.set(m[1], m[1]);
for (const src of tierRegSrcs) {
  for (const m of src.matchAll(/"([^"]+)":\s*dynamic\(/g)) compMapEntries.set(m[1], "dynamic");
}
// the wiring registry must spread every tier registry
const spreadTiers = ["EASY_TOOL_COMPONENTS", "MEDIUM_TOOL_COMPONENTS"].filter((name) =>
  new RegExp(`\\.\\.\\.${name}`).test(compRegSrc)
);
if (!/const COMP_MAP[\s\S]{0,80}=\s*TOOL_COMPONENTS/.test(regSrc)) {
  add("WARN", "COMP_MAP in the domain registry no longer aliases TOOL_COMPONENTS — wiring surfaces may have diverged");
}

// ── implementation files on disk ────────────────────────────────────────────
const implDir = resolve(ROOT, "src/domains/typography/components/impl");
const implFiles = existsSync(implDir) ? readdirSync(implDir).filter((f) => f.endsWith(".tsx")) : [];
const implSlugs = new Map(); // slug -> file
for (const f of implFiles) {
  const base = f.replace(/\.tsx$/, "");
  // FontPreviewer -> font-previewer
  const kebab = base.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  implSlugs.set(kebab, f);
}

// ── checks ─────────────────────────────────────────────────────────────────
const findings = [];
const add = (level, msg) => findings.push({ level, msg });

const total = allTools.length;
const live = allTools.filter((t) => t.live);
const soon = allTools.filter((t) => !t.live);

// 1. duplicates
const seen = new Map();
for (const t of allTools) {
  if (seen.has(t.slug)) add("ERROR", `duplicate slug "${t.slug}" — ${seen.get(t.slug)} vs ${t.category} / ${t.name}`);
  else seen.set(t.slug, `${t.category} / ${t.name}`);
}
// slug collisions with category slugs
for (const c of categories) {
  const clash = allTools.find((t) => t.slug === c.slug);
  if (clash) add("ERROR", `tool slug collides with category slug "${c.slug}" (${clash.name})`);
}

// 2. live flags truthful
for (const t of live) {
  if (!compMapEntries.has(t.slug)) {
    add("ERROR", `live tool "${t.slug}" has NO wired component in COMP_MAP (page cannot render it)`);
  }
}

// 3. hidden-built: impl file exists, slug never registered
for (const [slug, file] of implSlugs) {
  const tool = allTools.find((t) => t.slug === slug);
  if (!tool) add("WARN", `hidden-built: component ${file} has no registry entry (slug "${slug}")`);
  else if (!tool.live) add("WARN", `hidden-built: ${file} implements "${slug}" but registry says status=soon`);
}

// 4. orphans: registered + live but not wired
for (const t of allTools) {
  if (t.live && !compMapEntries.has(t.slug)) {
    // already reported above; keep the distinction explicit here
  }
}
const wiredSlugs = new Set(compMapEntries.keys());
for (const [slug, file] of implSlugs) {
  if (!wiredSlugs.has(slug)) add("WARN", `orphan component: ${file} (slug "${slug}") is not wired into COMP_MAP`);
}

// cross-registry overlap: components/tools/registry.ts vs easy/registry.tsx
const toolRegEntries = [...compRegSrc.matchAll(/^\s*"([^"]+)":\s*[A-Za-z0-9_]+\s*,?\s*$/gm)].map((m) => m[1]);
const tierRegSlugs = tierRegSrcs.flatMap((src) => [...src.matchAll(/"([^"]+)":\s*dynamic\(/g)].map((m) => m[1]));
if (toolRegEntries.length || tierRegSlugs.length) {
  const dupes = tierRegSlugs.filter((s, i) => tierRegSlugs.indexOf(s) !== i);
  add(
    "INFO",
    `wiring: ${toolRegEntries.length} literal entry(ies) in components/tools/registry.ts ` +
      `(${toolRegEntries.join(", ") || "none"}), ${tierRegSlugs.length} dynamic entr(ies) across ${tierRegSrcs.length} tier registr(ies) ` +
      `[${spreadTiers.join(", ") || "NO TIER SPREAD"}]` +
      (dupes.length ? `, ${dupes.length} slug(s) wired twice — ${dupes.join(", ")}` : "")
  );
  if (spreadTiers.length !== 2) {
    add("ERROR", "components/tools/registry.ts does not spread every tier registry (easy + medium)");
  }
}
// every URL is component-gated: a live flag without a wired component is an ERROR
const unwired = live.filter((t) => !compMapEntries.has(t.slug)).map((t) => t.slug);
if (!unwired.length) add("INFO", `all ${live.length} live slugs have a wired component`);

// stale parallel registry: src/data/typography/tools.ts
const dataToolsPath = resolve(ROOT, "src/data/typography/tools.ts");
if (existsSync(dataToolsPath)) {
  const hits = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.name === "node_modules" || f.name.startsWith(".")) continue;
      const p = resolve(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(ts|tsx|mjs|js)$/.test(f.name)) {
        const src = readFileSync(p, "utf-8");
        if (src.includes("data/typography")) hits.push(rel(p));
      }
    }
  };
  walk(resolve(ROOT, "src"));
  add(
    hits.length ? "WARN" : "INFO",
    hits.length
      ? `parallel registry src/data/typography/tools.ts is imported by ${hits.join(", ")}`
      : `parallel registry src/data/typography/tools.ts exists but has 0 importers (dead duplicate of the domain registry)`
  );
}

// stale duplicate component
const dupCompPath = resolve(ROOT, "src/components/typography/font-previewer.tsx");
if (existsSync(dupCompPath)) add("INFO", "duplicate component src/components/typography/font-previewer.tsx exists (orphan — verify 0 importers)");

// 5. h1 coverage in impl components
for (const f of implFiles) {
  const src = readFileSync(resolve(implDir, f), "utf-8");
  const hasH1 = /<h1[\s>]/.test(src);
  if (hasH1) add("INFO", `${f} renders its own <h1> — verify the page shell does not also render one (double-h1 risk)`);
}

// 6. page shell gates
if (/isLiveTool\(result\.tool,\s*"typography"\)/.test(pageSrc)) {
  add("INFO", '[slug] page gates live tools via isLiveTool(tool, "typography")');
} else {
  add("ERROR", '[slug] page does not gate on isLiveTool(tool, "typography")');
}
if (/findToolWithComponent/.test(pageSrc) && !/TOOL_COMPONENTS/.test(pageSrc)) {
  add("INFO", "[slug] page renders through registry COMP_MAP (findToolWithComponent), not a page-level TOOL_COMPONENTS map");
}
if (/COMPONENT_GATED_DOMAINS[\s\S]*?typography/.test(filtersSrc)) {
  add("ERROR", 'liveToolFilters lists "typography" as component-gated — live flags would be ignored');
} else {
  add("INFO", 'liveToolFilters does NOT gate "typography" (live flags are honoured)');
}

// 7. hardcoded counts in index/layout vs registry truth
if (/98\+/.test(indexSrc) || /98\+/.test(layoutSrc)) add("WARN", 'hardcoded "98+" tool count still present in index/layout');
if (/\$\{TOTAL_FONT_TOOLS\}|TOTAL_FONT_TOOLS/.test(layoutSrc)) add("INFO", "layout metadata count derives from the registry");

// 8. brand label
if (/Typography Tools|Racira Typography/.test(regSrc + indexSrc + layoutSrc + pageSrc + siteSrc)) {
  add("ERROR", "old domain label ('Typography Tools' / 'Racira Typography') still present");
} else {
  add("INFO", "old domain label is gone from registry + all four route files");
}
const contentMentions = allTools.filter((t) => /typography/i.test(t.name)).length;
const catMentions = categories.filter((c) => /typography/i.test(c.name)).length;
add("INFO", `remaining word "typography" in content labels: ${catMentions} category name(s), ${contentMentions} tool name(s)`);

// ── report ─────────────────────────────────────────────────────────────────
console.log("=== Racira Fonts (/typography) audit ===");
console.log(`Categories: ${categories.length}`);
for (const c of categories) {
  console.log(`  - ${c.name} (${c.slug}): ${c.tools.length} tools, ${c.tools.filter((t) => t.live).length} live`);
}
console.log(`TOTAL tools: ${total}`);
console.log(`LIVE (registry flag): ${live.length} — ${live.map((t) => t.slug).join(", ") || "(none)"}`);
console.log(`SOON (registry flag): ${soon.length}`);
console.log(`Wired components (COMP_MAP): ${compMapEntries.size}`);
console.log(`Implementation files: ${implFiles.length}`);
console.log("");
for (const f of findings) {
  const tag = f.level.padEnd(5);
  console.log(`[${tag}] ${f.msg}`);
}
const errors = findings.filter((f) => f.level === "ERROR").length;
console.log("");
console.log(errors ? `AUDIT: ${errors} error(s)` : "AUDIT: no structural errors");
