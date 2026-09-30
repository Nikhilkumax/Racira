#!/usr/bin/env node
/**
 * writing-reconcile.mjs — Script-verified reconciliation of the Writing domain.
 *
 * Ground truth is src/domains/writing/registry.ts (the `mk()` factory encodes
 * `status: "live" | "soon"` from its fourth argument). This script verifies:
 *
 *   1. Total tool count and per-category counts, with the live/soon split.
 *   2. Slug uniqueness and slug hygiene (no empty slug, no edge hyphens, ASCII).
 *   3. Live flags are truthful: every slug the registry marks live has a wired
 *      component in src/domains/writing/components/tools/registry.tsx, and the
 *      file that component imports exists on disk.
 *   4. No orphan wiring: a component in the map must be a live registry tool.
 *   5. No duplicate-component slugs: two live slugs may never point at the same
 *      component file (that is how a sibling silently renders another tool).
 *   6. The domain is not in COMPONENT_GATED_DOMAINS (which would force every
 *      writing tool non-live regardless of its flag).
 *   7. Every live slug has authored SEO content in registry/seo/.
 *   8. Counts shown to users come from the registry, not hardcoded literals.
 *
 * Warnings (printed, non-fatal) cover component files that exist but are wired
 * nowhere — the historical `components/impl/DistractionFreeEditor.tsx` duplicate.
 *
 * This is a STRUCTURAL check. Functional verification is done by node unit tests
 * (src/domains/writing/lib/text/*.test.ts) and the Playwright smoke test
 * (e2e/writing-b1.test.ts).
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, dirname } from "path";

const ROOT = resolve(import.meta.dirname, "..");

const REGISTRY = resolve(ROOT, "src/domains/writing/registry.ts");
const COMPONENT_MAP = resolve(ROOT, "src/domains/writing/components/tools/registry.tsx");
const TOOLS_DIR = resolve(ROOT, "src/domains/writing/components/tools");
const FILTERS = resolve(ROOT, "src/lib/tools/liveToolFilters.ts");
const INDEX_PAGE = resolve(ROOT, "src/app/writing/page.tsx");
const LAYOUT = resolve(ROOT, "src/app/writing/layout.tsx");

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);

/** Slug rule — mirrors src/lib/utils/slug.ts exactly. */
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

// ── Parse the registry ───────────────────────────────────────────────────────
const regSrc = readFileSync(REGISTRY, "utf-8");
const categories = [];
let current = null;

for (const line of regSrc.split(/\r?\n/)) {
  const nameMatch = line.match(/^\s*name:\s*"([^"]+)",\s*$/);
  if (nameMatch) {
    current = { name: nameMatch[1], tools: [] };
    categories.push(current);
    continue;
  }
  // mk("Name", "description", Icon, true|false)
  const toolMatch = line.match(/^\s*mk\("([^"]+)",\s*"([^"]*)"(?:,\s*([A-Za-z0-9_]+))?(?:,\s*(true|false))?\),\s*$/);
  if (toolMatch && current) {
    const name = toolMatch[1];
    const explicit = toolMatch[4];
    current.tools.push({
      name,
      description: toolMatch[2],
      slug: toSlug(name),
      live: explicit === undefined ? false : explicit === "true",
    });
  }
}

if (categories.length === 0) fail("parsed no categories out of the writing registry.");

const allTools = categories.flatMap((c) => c.tools);
const total = allTools.length;

// ── 1. Counts ────────────────────────────────────────────────────────────────
console.log("=== WRITING REGISTRY RECONCILIATION ===");
console.log(`Categories: ${categories.length}`);
console.log(`Total tools: ${total}`);
for (const category of categories) {
  const live = category.tools.filter((t) => t.live).length;
  console.log(`  ${category.name}: ${category.tools.length} (live ${live} / soon ${category.tools.length - live})`);
}

// ── 2. Slug uniqueness + hygiene ─────────────────────────────────────────────
const bySlug = new Map();
for (const tool of allTools) {
  if (!tool.slug) fail(`tool "${tool.name}" produces an empty slug.`);
  if (tool.slug !== toSlug(tool.name)) fail(`slug mismatch for "${tool.name}" (${tool.slug}).`);
  if (/^-|-$|-{2,}/.test(tool.slug)) fail(`slug "${tool.slug}" has edge or doubled hyphens.`);
  if (!/^[a-z0-9-]+$/.test(tool.slug)) fail(`slug "${tool.slug}" is not ASCII lowercase.`);
  if (bySlug.has(tool.slug)) fail(`duplicate slug "${tool.slug}" (${bySlug.get(tool.slug).name} and ${tool.name}).`);
  bySlug.set(tool.slug, tool);
}

// ── 3/4/5. Component wiring ──────────────────────────────────────────────────
const mapSrc = readFileSync(COMPONENT_MAP, "utf-8");
const wired = new Map(); // slug -> imported module path
for (const match of mapSrc.matchAll(/"([a-z0-9-]+)"\s*:\s*dynamic\(\(\)\s*=>\s*import\("([^"]+)"\)\)/g)) {
  wired.set(match[1], match[2]);
}

for (const [slug, importPath] of wired) {
  const tool = bySlug.get(slug);
  if (!tool) {
    fail(`component map wires "${slug}", which is not a registry slug.`);
    continue;
  }
  if (!tool.live) {
    fail(`component map wires "${slug}" but the registry marks it soon — orphan wiring.`);
  }
}

for (const tool of allTools.filter((t) => t.live)) {
  if (!wired.has(tool.slug)) {
    fail(`live tool "${tool.name}" (${tool.slug}) has no wired component — its page would 404.`);
  }
}

for (const [slug, importPath] of wired) {
  const file = resolve(TOOLS_DIR, importPath.replace(/^\.\//, ""));
  const candidates = [file, `${file}.tsx`, `${file}.ts`];
  if (!candidates.some((candidate) => existsSync(candidate))) {
    fail(`component for "${slug}" imports ${importPath}, which does not exist on disk.`);
  }
}

// Duplicate-component slugs: two slugs must never resolve to the same file.
const byFile = new Map();
for (const [slug, importPath] of wired) {
  const list = byFile.get(importPath) ?? [];
  list.push(slug);
  byFile.set(importPath, list);
}
for (const [importPath, slugs] of byFile) {
  if (slugs.length > 1) {
    fail(`slugs ${slugs.join(", ")} all render the same component (${importPath}).`);
  }
}

// Warnings: component files that are wired nowhere. `ui.tsx` is the shared
// primitives module and `registry.tsx` is the map itself, so both are exempt.
const SHARED_MODULES = new Set(["ui", "registry"]);
const wiredFiles = new Set(
  [...wired.values()].map((importPath) => importPath.replace(/^\.\//, "").replace(/\.tsx?$/, "")),
);
for (const entry of readdirSync(TOOLS_DIR)) {
  if (!entry.endsWith(".tsx") || SHARED_MODULES.has(entry.replace(/\.tsx$/, ""))) continue;
  const base = entry.replace(/\.tsx$/, "");
  if (!wiredFiles.has(base)) warnings.push(`component file ${entry} is wired nowhere — dead code?`);
}
const implDir = resolve(ROOT, "src/domains/writing/components/impl");
if (existsSync(implDir)) {
  for (const entry of readdirSync(implDir)) {
    const referenced = [...wired.values()].some((importPath) => importPath.includes(`/impl/${entry.replace(/\.tsx?$/, "")}`));
    if (!referenced) warnings.push(`components/impl/${entry} is unreferenced (duplicate of a wired component?).`);
  }
}

// ── 6. Domain must not be component-gated ────────────────────────────────────
const filtersSrc = readFileSync(FILTERS, "utf-8");
const gatedMatch = filtersSrc.match(/const COMPONENT_GATED_DOMAINS = new Set\(\[([\s\S]*?)\]\)/);
const gatedBody = (gatedMatch ? gatedMatch[1] : "").replace(/\/\/[^\r\n]*/g, "");
const gated = gatedBody.split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean);
if (gated.includes("writing")) {
  fail('"writing" is in COMPONENT_GATED_DOMAINS — every live flag would be overridden to non-live.');
}

// ── 7. SEO coverage for live slugs ───────────────────────────────────────────
const seoDir = resolve(ROOT, "src/domains/writing/registry/seo");
let seoBody = "";
if (existsSync(seoDir)) {
  for (const entry of readdirSync(seoDir).filter((file) => file.endsWith(".ts"))) {
    seoBody += readFileSync(resolve(seoDir, entry), "utf-8");
  }
}
for (const tool of allTools.filter((t) => t.live)) {
  if (!seoBody.includes(`"${tool.slug}": {`)) {
    fail(`live tool "${tool.name}" (${tool.slug}) has no authored SEO entry in registry/seo/.`);
  }
}

// ── 8. Counts must come from the registry ────────────────────────────────────
const layoutSrc = readFileSync(LAYOUT, "utf-8");
if (!layoutSrc.includes("totalToolCount")) fail("writing layout metadata does not derive its count from the registry.");
if (/\b\d{3}\+ *free writing tools/i.test(layoutSrc)) fail("writing layout hardcodes a tool count literal.");
const indexSrc = readFileSync(INDEX_PAGE, "utf-8");
if (!indexSrc.includes("categories")) fail("writing index page does not read the registry.");

// ── Report ───────────────────────────────────────────────────────────────────
const liveCount = allTools.filter((t) => t.live).length;
console.log(`Live (registry flag): ${liveCount}`);
console.log(`Live (wired): ${wired.size}`);
console.log(`Soon: ${total - liveCount}`);
console.log(`Build progress: ${((liveCount / total) * 100).toFixed(1)}%`);

for (const warning of warnings) console.log(`  warning: ${warning}`);

if (errors.length > 0) {
  console.error("\n✗ writing-reconcile failed:\n");
  for (const error of errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log("\n✓ writing-reconcile: live flags, wiring and SEO coverage agree.");
