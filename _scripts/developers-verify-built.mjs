#!/usr/bin/env node
/**
 * developers-verify-built.mjs — Cross-references the built Set in
 * domains/developers/registry.ts against actual registered tool
 * definitions in lib/developers/tools/*.tsx.
 *
 * For each tool in the built Set:
 * 1. Check that it appears as a slug in one of the implementation files
 * 2. Check that the implementation file is imported and registered in index.tsx
 * 3. Flag any mismatches
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");

// ── Extract the built Set from domains registry ──────────────────
const registryContent = readFileSync(
  join(ROOT, "src/domains/developers/registry.ts"),
  "utf8"
);
const builtMatch = registryContent.match(/const built = new Set\(\[([^\]]+)\]/);
const builtSlugs = new Set(
  builtMatch[1]
    .split(",")
    .map((s) => s.trim().replace(/"/g, ""))
    .filter(Boolean)
);

// ── Extract all tool slugs from implementation files ─────────────
const libDir = join(ROOT, "src/lib/developers/tools");
const libFiles = readdirSync(libDir).filter(
  (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && f !== "index.tsx" && f !== "security-algorithms.ts"
);

const implSlugs = new Map(); // slug → file
for (const file of libFiles) {
  const content = readFileSync(join(libDir, file), "utf8");
  // Match slug: "some-slug" patterns
  const slugMatches = content.matchAll(/slug:\s*"([^"]+)"/g);
  for (const m of slugMatches) {
    const slug = m[1];
    if (!implSlugs.has(slug)) {
      implSlugs.set(slug, file);
    }
    // Track multiple files defining same slug (potential collision)
    const existing = implSlugs.get(slug);
    if (existing !== file) {
      implSlugs.set(slug, `${existing}, ${file}`);
    }
  }
}

// ── Read the index.tsx registration chain ────────────────────────
const indexContent = readFileSync(join(libDir, "index.tsx"), "utf8");
const registeredExports = [];
for (const line of indexContent.split("\n")) {
  const m = line.match(
    /import\s*\{\s*(\w+)\s*\}\s*from\s*["']\.\/(\w+)["']/
  );
  if (m) registeredExports.push({ exportName: m[1], file: m[2] });
}

// Check if each file is actually registered
const registeredFiles = new Set(registeredExports.map((e) => e.file));

// ── Cross-reference ─────────────────────────────────────────────
console.log("=== BUILT STATUS VERIFICATION ===\n");
console.log(`Built Set slugs: ${builtSlugs.size}`);
console.log(`Implementation file slugs: ${implSlugs.size}`);
console.log(`Registered files: ${[...registeredFiles].join(", ")}\n`);

let verified = 0;
let missingImpl = 0;
let notRegistered = 0;
let collisionSlugs = [];

for (const slug of builtSlugs) {
  const implFile = implSlugs.get(slug);
  if (!implFile) {
    console.log(`  ✗ ${slug} — NO IMPLEMENTATION FOUND`);
    missingImpl++;
    continue;
  }

  // Check if the file is registered
  const files = implFile.split(", ").map((f) => f.replace(".tsx", "").replace(".ts", ""));
  const allRegistered = files.every((f) => registeredFiles.has(f));
  if (!allRegistered) {
    console.log(`  ⚠ ${slug} — implementation in ${implFile} but NOT registered in index.tsx`);
    notRegistered++;
    continue;
  }

  // Check for collision (same slug in multiple files)
  if (implFile.includes(",")) {
    collisionSlugs.push({ slug, files: implFile });
  }

  console.log(`  ✓ ${slug} — ${implFile}`);
  verified++;
}

console.log(`\n--- SUMMARY ---`);
console.log(`Verified (implemented + registered): ${verified}`);
console.log(`Missing implementation: ${missingImpl}`);
console.log(`Not registered in index.tsx: ${notRegistered}`);

if (collisionSlugs.length) {
  console.log(`\n⚠ COLLISIONS (slug defined in multiple files):`);
  for (const c of collisionSlugs) {
    console.log(`  ${c.slug}: ${c.files}`);
  }
}

// ── Check for implemented but not in built Set ──────────────────
console.log(`\n--- IMPLEMENTED BUT NOT IN BUILT SET ---`);
let orphanImpls = 0;
for (const [slug, file] of implSlugs) {
  if (!builtSlugs.has(slug)) {
    console.log(`  ${slug} — ${file}`);
    orphanImpls++;
  }
}
console.log(`Orphan implementations: ${orphanImpls}`);

// ── Check for files not imported in index.tsx ───────────────────
console.log(`\n--- UNREGISTERED FILES ---`);
let unregisteredFiles = 0;
for (const file of libFiles) {
  const baseName = file.replace(".tsx", "").replace(".ts", "");
  if (!registeredFiles.has(baseName)) {
    console.log(`  ${file} — not imported in index.tsx`);
    unregisteredFiles++;
  }
}
console.log(`Unregistered files: ${unregisteredFiles}`);
