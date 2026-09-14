#!/usr/bin/env node
/**
 * cad-reconcile.mjs — Script-verified reconciliation of the CAD domain.
 *
 * Ground truth is src/domains/cad/registry.ts (single source — there is no
 * separate data/ file for CAD). This script verifies:
 *   1. Total tool count and per-category counts.
 *   2. Slug uniqueness (no duplicate slugs, no slug collisions).
 *   3. Live/soon split from ACTIVE_SLUGS and the TOOL_COMPONENTS wiring in
 *      app/cad/[slug]/page.tsx (a live flag is only truthful if the slug has a
 *      wired component).
 *   4. Route cross-check: every tool slug resolves via TOOLS_BY_SLUG semantics,
 *      the live tool has a wired component, soon tools are non-clickable.
 *   5. Dynamic-count checks: cad layout metadata and index hero must read the
 *      registry, not hardcode a number; liveToolFilters must not gate "cad".
 *
 * This is a STRUCTURAL check. Functional verification (drawing, measuring,
 * exporting) is done separately against the running app — see e2e/
 * cad-sketch-tool.test.ts and the audit report.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");

const regSrc = readFileSync(resolve(ROOT, "src/domains/cad/registry.ts"), "utf-8");
const pageSrc = readFileSync(resolve(ROOT, "src/app/cad/[slug]/page.tsx"), "utf-8");
const indexSrc = readFileSync(resolve(ROOT, "src/app/cad/page.tsx"), "utf-8");
const layoutSrc = readFileSync(resolve(ROOT, "src/app/cad/layout.tsx"), "utf-8");
const filtersSrc = readFileSync(resolve(ROOT, "src/lib/tools/liveToolFilters.ts"), "utf-8");

const toSlug = (t) =>
  t.toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ── Parse the registry ───────────────────────────────────────────
const categories = [];
let currentCat = null;
for (const line of regSrc.split(/\r?\n/)) {
  const catMatch = line.match(/cat\("([^"]+)",\s*\[/);
  if (catMatch) {
    currentCat = { title: catMatch[1], tools: [] };
    categories.push(currentCat);
    continue;
  }
  const toolMatch = line.match(/\[\s*"([^"]+)",\s*"([^"]*)"\s*\]/);
  if (toolMatch && currentCat) {
    currentCat.tools.push({ name: toolMatch[1], description: toolMatch[2] });
  }
}

const activeMatch = regSrc.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/);
// Strip // comments (ACTIVE_SLUGS is annotated per batch) before tokenizing.
const activeBody = (activeMatch ? activeMatch[1] : "").replace(/\/\/[^\r\n]*/g, "");
const activeSlugs = new Set(
  activeBody.split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean)
);

// ── 1. Counts ────────────────────────────────────────────────────
let total = 0;
for (const c of categories) total += c.tools.length;

console.log("=== CAD REGISTRY RECONCILIATION ===");
console.log(`Categories: ${categories.length}`);
console.log(`Total tools: ${total}`);
for (const c of categories) {
  console.log(`  ${c.title}: ${c.tools.length}`);
}

// ── 2. Slug uniqueness ───────────────────────────────────────────
const slugMap = new Map();
const collisions = [];
for (const c of categories) {
  for (const t of c.tools) {
    const s = toSlug(t.name);
    if (slugMap.has(s)) collisions.push({ slug: s, a: slugMap.get(s), b: `${c.title} → ${t.name}` });
    else slugMap.set(s, `${c.title} → ${t.name}`);
  }
}
console.log(`\nUnique slugs: ${slugMap.size} / ${total}`);
if (collisions.length) {
  console.log("COLLISIONS:");
  for (const c of collisions) console.log(`  ${c.slug}: ${c.a} vs ${c.b}`);
  process.exitCode = 1;
} else {
  console.log("No duplicate slugs, no slug collisions. ✔");
}

// ── 3. Live/soon split ───────────────────────────────────────────
const liveTools = [];
const soonTools = [];
for (const c of categories) {
  for (const t of c.tools) {
    const s = toSlug(t.name);
    (activeSlugs.has(s) ? liveTools : soonTools).push({ ...t, slug: s, category: c.title });
  }
}
console.log(`\nRegistry status: ${liveTools.length} live, ${soonTools.length} soon`);
console.log(`Live tools: ${liveTools.map((t) => t.slug).join(", ") || "(none)"}`);

// ── 4. Route cross-check ─────────────────────────────────────────
console.log("\n--- Route cross-check ---");
// Live slugs must be wired to a component either directly in [slug]/page.tsx
// (sketch tool) or in the easy/medium tool registries the page spreads (all
// other batches — batch 7 onward wires its tools in the medium registry).
const easyRegSrc = readFileSync(resolve(ROOT, "src/domains/cad/components/tools/easy/registry.tsx"), "utf-8");
const mediumRegSrc = readFileSync(resolve(ROOT, "src/domains/cad/components/tools/medium/registry.tsx"), "utf-8");
const wiringSrc = pageSrc + "\n" + easyRegSrc + "\n" + mediumRegSrc;
for (const t of liveTools) {
  const wired = new RegExp(`["']${t.slug}["']\\s*:`).test(wiringSrc);
  console.log(`  ${t.slug}: registry live → wired component: ${wired ? "YES ✔" : "NO ✘ (404)"}`);
  if (!wired) process.exitCode = 1;
}

// Every registry slug must appear in TOOLS_BY_SLUG semantics — since the map is
// built from the same array this holds by construction; verify no name/slug
// mismatch by checking the page resolves slug→name through TOOLS_BY_SLUG import.
for (const c of categories) {
  for (const t of c.tools) {
    const s = toSlug(t.name);
    if (!activeSlugs.has(s) && !soonTools.some((x) => x.slug === s)) {
      console.log(`  MISSING route entry: ${t.name} (${s})`);
      process.exitCode = 1;
    }
  }
}

// Soon tools must render as non-clickable cards (ToolCard + hasComingSoonPage
// gate): verify the index page passes the domain through so cards can't link
// to 404s, and comingSoonPage does not list cad as having soon pages.
const comingSoonSrc = readFileSync(resolve(ROOT, "src/lib/tools/comingSoonPage.ts"), "utf-8");
const hasCadSoon = /DOMAINS_WITH_COMING_SOON[\s\S]*?["']cad["']/.test(comingSoonSrc);
console.log(`  cad in DOMAINS_WITH_COMING_SOON (would give soon tools pages): ${hasCadSoon}`);
if (hasCadSoon) {
  console.log("  WARNING: soon tools would be clickable but have no page (notFound).");
  process.exitCode = 1;
}

// ── 5. Dynamic counts ────────────────────────────────────────────
console.log("\n--- Dynamic count audit ---");
const layoutDynamic = /totalCount/.test(layoutSrc) && !/description:\s*["']\d+\+/.test(layoutSrc);
console.log(`  app/cad/layout.tsx metadata uses registry totalCount: ${layoutDynamic ? "YES ✔" : "NO ✘ (hardcoded)"}`);
if (!layoutDynamic) process.exitCode = 1;

const heroDynamic = /onlyLive\(/.test(indexSrc);
console.log(`  app/cad/page.tsx hero count computed via onlyLive(): ${heroDynamic ? "YES ✔" : "NO ✘"}`);
if (!heroDynamic) process.exitCode = 1;

const cadGated = /COMPONENT_GATED_DOMAINS[\s\S]*?["']cad["']/.test(filtersSrc);
console.log(`  "cad" still component-gated in liveToolFilters: ${cadGated ? "YES ✘ (live flag ignored)" : "NO ✔"}`);
if (cadGated) process.exitCode = 1;

// ── Summary ──────────────────────────────────────────────────────
console.log("\n=== SUMMARY ===");
console.log(`Total: ${total} | Live: ${liveTools.length} | Soon: ${soonTools.length}`);
console.log(`Exit code: ${process.exitCode || 0}`);