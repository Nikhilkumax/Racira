#!/usr/bin/env node
/**
 * developers-coverage-check.mjs
 *
 * Flags:
 *   1. Any `live` tool in the registry with no matching implementation
 *   2. Any implementation file not imported in index.tsx
 *   3. Any registered slug not in the domain registry
 *
 * Exit code 1 = gaps found. 0 = all clear.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, basename } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const TOOLS_DIR = resolve(ROOT, "src/lib/developers/tools");
const REGISTRY_PATH = resolve(ROOT, "src/domains/developers/registry.ts");
const INDEX_PATH = resolve(ROOT, "src/lib/developers/tools/index.tsx");

// Utility files that are NOT tool definitions — they're imported by other tool files.
const UTILITY_FILES = new Set(["helpers.tsx", "security-algorithms.ts"]);

// Must match src/lib/utils/slug.ts exactly
function toSlug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── 1. Parse registry ─────────────────────────────────────────────
const registrySrc = readFileSync(REGISTRY_PATH, "utf-8");

// Built Set
const builtMatch = registrySrc.match(/const built = new Set\(\[([\s\S]*?)\]\)/);
const builtSlugs = new Set();
if (builtMatch) {
  for (const m of builtMatch[1].matchAll(/"([^"]+)"/g)) {
    builtSlugs.add(m[1]);
  }
}

// Status overrides (status: "live")
const liveOverrides = new Set();
for (const m of registrySrc.matchAll(/slug:\s*"([^"]+)"[\s\S]*?status:\s*"live"/g)) {
  liveOverrides.add(m[1]);
}

const liveSlugs = new Set([...builtSlugs, ...liveOverrides]);

// All slugs in the registry — extract from the ["Name", "Desc"] tuples
// Pattern: ["Name", "Description"] in the groups
const registryAllSlugs = new Set();
for (const m of registrySrc.matchAll(/\["([^"]+)",\s*"[^"]*"\]/g)) {
  registryAllSlugs.add(toSlug(m[1]));
}
// Also add any explicit slug fields from overrides
for (const m of registrySrc.matchAll(/slug:\s*"([^"]+)"/g)) {
  registryAllSlugs.add(m[1]);
}

// ── 2. Parse index.tsx for registered slugs ───────────────────────
const indexSrc = readFileSync(INDEX_PATH, "utf-8");

const importedFiles = [];
for (const m of indexSrc.matchAll(/from\s*"\.\/([^"]+)"/g)) {
  const filePath = resolve(TOOLS_DIR, m[1] + ".tsx");
  if (existsSync(filePath)) {
    importedFiles.push(filePath);
    continue;
  }
  const tsPath = resolve(TOOLS_DIR, m[1] + ".ts");
  if (existsSync(tsPath)) {
    importedFiles.push(tsPath);
  }
}

const registeredSlugs = new Set();
for (const filePath of importedFiles) {
  const src = readFileSync(filePath, "utf-8");
  for (const m of src.matchAll(/slug:\s*"([^"]+)"/g)) {
    registeredSlugs.add(m[1]);
  }
  // Also detect tool factory functions like apiTesterSlug("slug-name")
  for (const m of src.matchAll(/apiTesterSlug\("([a-z][a-z0-9-]+)"\)/g)) {
    registeredSlugs.add(m[1]);
  }
}

// ── 3. Find ALL implementation files ──────────────────────────────
const allFiles = readdirSync(TOOLS_DIR).filter(
  (f) => (f.endsWith(".tsx") || f.endsWith(".ts")) && !UTILITY_FILES.has(f)
);
const importedBasenames = new Set(importedFiles.map((f) => basename(f)));

const unimportedFiles = allFiles.filter((f) => {
  if (f === "index.tsx") return false;
  return !importedBasenames.has(f);
});

// ── 4. Flag issues ────────────────────────────────────────────────
let issues = 0;

// 4a. Live tools with no registered implementation
const liveWithoutImpl = [...liveSlugs].filter((slug) => !registeredSlugs.has(slug));
if (liveWithoutImpl.length > 0) {
  console.error(`\n🔴 LIVE tools with no registered implementation (${liveWithoutImpl.length}):`);
  for (const s of liveWithoutImpl.sort()) console.error(`   - ${s}`);
  issues += liveWithoutImpl.length;
} else {
  console.log(`\n✅ All ${liveSlugs.size} live tools have registered implementations.`);
}

// 4b. Implementation files not imported in index.tsx
if (unimportedFiles.length > 0) {
  console.error(`\n🟡 Implementation files NOT imported in index.tsx (${unimportedFiles.length}):`);
  for (const f of unimportedFiles.sort()) {
    console.error(`   - src/lib/developers/tools/${f}`);
    issues++;
  }
} else {
  console.log(`\n✅ All implementation files are imported in index.tsx.`);
}

// 4c. Registered slugs not in domain registry
const registeredNotInRegistry = [...registeredSlugs].filter(
  (slug) => !registryAllSlugs.has(slug)
);
if (registeredNotInRegistry.length > 0) {
  console.error(`\n🟡 Registered slugs NOT in domain registry (${registeredNotInRegistry.length}):`);
  for (const s of registeredNotInRegistry.sort()) console.error(`   - ${s}`);
  issues += registeredNotInRegistry.length;
} else {
  console.log(`\n✅ All registered slugs exist in the domain registry.`);
}

// ── Summary ───────────────────────────────────────────────────────
console.log(`\n📊 Coverage summary:`);
console.log(`   Registry total: ${registryAllSlugs.size} slugs`);
console.log(`   Live: ${liveSlugs.size} | Soon: ~${registryAllSlugs.size - liveSlugs.size}`);
console.log(`   Registered (with implementation): ${registeredSlugs.size}`);
console.log(`   Implementation files: ${allFiles.length} (excl index.tsx & utils)`);
console.log(`   Imported files: ${importedFiles.length}`);

if (issues === 0) {
  console.log(`\n✅ No coverage issues found.`);
} else {
  console.error(`\n⚠️  ${issues} issue(s) found.`);
}

process.exit(issues > 0 ? 1 : 0);
