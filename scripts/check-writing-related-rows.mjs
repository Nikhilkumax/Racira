/**
 * Enforces the CURATED_RELATED row contract in
 * src/domains/writing/components/related-tools.tsx:
 *
 *   - every row has exactly 4 distinct picks (MAX_RELATED);
 *   - every pick is a live writing-registry slug (derived from mk() lines via
 *     the src/lib/utils/slug.ts rule, same as the other SEO validators);
 *   - no pick is the row's own slug (non-self);
 *   - no pick repeats within a row (no duplicates);
 *   - no pick is one of the four "coming soon" tools, which must never surface
 *     as related links (doi-to-citation-converter, isbn-lookup-formatter,
 *     url-to-citation-tool, text-translation-previewer).
 *
 * Exit code 0 = every row obeys the contract; 1 = at least one violation.
 * Run: node scripts/check-writing-related-rows.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RELATED = path.join(ROOT, "src", "domains", "writing", "components", "related-tools.tsx");
const REGISTRY = path.join(ROOT, "src", "domains", "writing", "registry.ts");

const MAX_RELATED = 4;
const SOON_TOOLS = new Set([
  "doi-to-citation-converter",
  "isbn-lookup-formatter",
  "url-to-citation-tool",
  "text-translation-previewer",
]);

/** Slug rule from src/lib/utils/slug.ts. */
const toSlug = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/** Live slugs from the registry's mk() lines, as in validate-writing-seo.mjs. */
function readLiveSlugs(registryPath) {
  const live = new Set();
  for (const line of fs.readFileSync(registryPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*mk\("([^"]+)",\s*"[^"]*",[^,]+,\s*(true|false)\),?\s*$/);
    if (m && m[2] === "true") live.add(toSlug(m[1]));
  }
  return live;
}

/** Parse the CURATED_RELATED object literal out of the component source. */
function readCuratedMap(componentPath) {
  const src = fs.readFileSync(componentPath, "utf8");
  const start = src.indexOf("const CURATED_RELATED");
  if (start === -1) throw new Error("CURATED_RELATED not found");
  const open = src.indexOf("{", start);
  const close = src.indexOf("\n};", start);
  if (open === -1 || close === -1) throw new Error("CURATED_RELATED braces not found");
  const body = src
    .slice(open, close)
    .replace(/,(\s*[}\]])/g, "$1") // trailing commas after each row
    .replace(/,\s*$/, ""); // dangling comma before the map's closing brace
  return JSON.parse(`${body}}`);
}

const errors = [];
let rows = 0;

const live = readLiveSlugs(REGISTRY);
if (live.size === 0) errors.push(`parsed no live slugs from ${path.relative(ROOT, REGISTRY)}`);

let curated;
try {
  curated = readCuratedMap(RELATED);
} catch (err) {
  console.error(`\u2717 check-writing-related-rows failed: ${err.message}`);
  process.exit(1);
}

for (const [slug, picks] of Object.entries(curated)) {
  rows += 1;
  if (!Array.isArray(picks) || picks.length !== MAX_RELATED) {
    errors.push(`${slug}: has ${picks?.length ?? 0} picks; every row needs exactly ${MAX_RELATED}.`);
    continue;
  }
  if (new Set(picks).size !== picks.length) {
    errors.push(`${slug}: duplicate picks within the row: [${picks.join(", ")}]`);
  }
  for (const pick of picks) {
    if (pick === slug) errors.push(`${slug}: row includes itself.`);
    if (SOON_TOOLS.has(pick)) errors.push(`${slug}: pick "${pick}" is a coming-soon tool and must never appear.`);
    if (!live.has(pick)) errors.push(`${slug}: pick "${pick}" is not a live registry slug.`);
  }
}

if (errors.length > 0) {
  console.error(`\n\u2717 check-writing-related-rows failed with ${errors.length} problem(s):\n`);
  for (const message of errors) console.error(`  - ${message}`);
  console.error("");
  process.exit(1);
}

console.log(`\u2713 check-writing-related-rows: ${rows} curated row(s) OK — 4 live, non-self, duplicate-free picks each; no coming-soon tools.`);
