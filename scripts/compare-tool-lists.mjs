#!/usr/bin/env node

/**
 * Compare Bento's tool list against Racira's registry.
 *
 * Extracts slugs from:
 *  1. Racira's tool registry (src/domains/pdf/registry/tools.ts)
 *  2. Bento's logic files (src/domains/pdf/lib/bento/logic/*-page.ts)
 *
 * Also extracts slugs from the processFiles dispatcher (src/lib/pdf/pdf-tools.ts)
 * to identify which tools are already wired.
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");

// ── Extract slugs from Racira registry ──────────────────────
function extractRaciraSlugs() {
  const content = fs.readFileSync(
    path.join(ROOT, "src/domains/pdf/registry/tools.ts"),
    "utf-8",
  );
  const slugRe = /slug:\s*['"]([^'"]+)['"]/g;
  const slugs = new Set();
  let m;
  while ((m = slugRe.exec(content)) !== null) slugs.add(m[1]);
  return [...slugs];
}

// ── Extract slugs from processFiles dispatcher ──────────────
function extractWiredSlugs() {
  const content = fs.readFileSync(
    path.join(ROOT, "src/lib/pdf/pdf-tools.ts"),
    "utf-8",
  );
  // Match case "slug": patterns
  const caseRe = /case\s+["']([^"']+)["']\s*:/g;
  const slugs = new Set();
  let m;
  while ((m = caseRe.exec(content)) !== null) slugs.add(m[1]);
  return [...slugs];
}

// ── Extract tool names from Bento logic files ───────────────
function extractBentoTools() {
  const dir = path.join(
    ROOT,
    "src/domains/pdf/lib/bento/logic",
  );
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  const tools = [];
  for (const file of files) {
    let slug = file
      .replace(/-page\.(ts|js)$/, "")
      .replace(/\.(ts|js)$/, "");
    if (slug === "index" || slug === "compare-render") continue;
    tools.push({ slug, file });
  }
  return tools;
}

// ── Check WASM flag per Bento file ──────────────────────────
function checkWasmFlag(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return /\bwasm\b/i.test(content) || /\.wasm\b/.test(content);
}

// ── Normalize slugs for comparison ──────────────────────────
function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ── Main ────────────────────────────────────────────────────
function main() {
  console.log("=== Bento vs Racira Tool List Comparison ===\n");

  const raciraSlugs = extractRaciraSlugs();
  const wiredSlugs = extractWiredSlugs();
  const bentoTools = extractBentoTools();

  console.log(`Racira registry:      ${raciraSlugs.length} slugs`);
  console.log(`processFiles wired:   ${wiredSlugs.length} slugs`);
  console.log(`Bento logic files:    ${bentoTools.length} tools\n`);

  const raciraNorm = new Map(raciraSlugs.map((s) => [norm(s), s]));
  const bentoNorm = new Map(bentoTools.map((t) => [norm(t.slug), t]));

  // ── Overlap ──
  const overlap = [];
  for (const [n, orig] of raciraNorm) {
    if (bentoNorm.has(n)) {
      const bt = bentoNorm.get(n);
      const wired = wiredSlugs.includes(orig);
      const wasmPath = path.join(
        ROOT,
        "src/domains/pdf/lib/bento/logic",
        bt.file,
      );
      const wasm = checkWasmFlag(wasmPath);
      overlap.push({ racira: orig, bento: bt.slug, file: bt.file, wired, wasm });
    }
  }

  // ── Bento-only ──
  const bentoOnly = [];
  for (const [n, bt] of bentoNorm) {
    if (!raciraNorm.has(n)) {
      const wasmPath = path.join(
        ROOT,
        "src/domains/pdf/lib/bento/logic",
        bt.file,
      );
      const wasm = checkWasmFlag(wasmPath);
      bentoOnly.push({ slug: bt.slug, file: bt.file, wasm });
    }
  }

  // ── Racira-only (no Bento counterpart) ──
  const raciraOnly = [];
  for (const [n, orig] of raciraNorm) {
    if (!bentoNorm.has(n)) {
      const wired = wiredSlugs.includes(orig);
      raciraOnly.push({ slug: orig, wired });
    }
  }

  // ── Not yet wired (overlap with Bento, but no case in processFiles) ──
  const notYetWired = overlap.filter((o) => !o.wired);

  // ── Output ──
  console.log("─── OVERLAP (Bento has a matching Racira slug) ───");
  console.log(`Count: ${overlap.length}`);
  for (const o of overlap) {
    const tags = [];
    if (o.wired) tags.push("WIRED");
    if (o.wasm) tags.push("WASM");
    console.log(`  ${o.racira.padEnd(30)} ← ${o.file.padEnd(40)} ${tags.join(" ")}`);
  }

  console.log(`\n─── BENTO-ONLY (new from Bento, no Racira slug) ───`);
  console.log(`Count: ${bentoOnly.length}`);
  for (const b of bentoOnly) {
    const tags = [];
    if (b.wasm) tags.push("WASM");
    console.log(`  ${b.slug.padEnd(30)} ${b.file.padEnd(40)} ${tags.join(" ")}`);
  }

  console.log(`\n─── RACIRA-ONLY (no Bento counterpart) ───`);
  console.log(`Count: ${raciraOnly.length}`);
  for (const r of raciraOnly) {
    console.log(`  ${r.slug.padEnd(30)} ${r.wired ? "WIRED" : "NOT WIRED"}`);
  }

  console.log(`\n─── NOT YET WIRED (overlap exists but no processFiles case) ───`);
  console.log(`Count: ${notYetWired.length}`);
  for (const o of notYetWired) {
    const tags = [];
    if (o.wasm) tags.push("WASM");
    console.log(`  ${o.racira.padEnd(30)} ← ${o.file.padEnd(40)} ${tags.join(" ")}`);
  }

  // ── Write JSON report ──
  const report = {
    timestamp: new Date().toISOString(),
    raciraCount: raciraSlugs.length,
    wiredCount: wiredSlugs.length,
    bentoCount: bentoTools.length,
    overlap: overlap.map((o) => o.racira).sort(),
    overlapCount: overlap.length,
    bentoOnly: bentoOnly.map((b) => b.slug).sort(),
    bentoOnlyCount: bentoOnly.length,
    raciraOnly: raciraOnly.map((r) => r.slug).sort(),
    raciraOnlyCount: raciraOnly.length,
    notYetWired: notYetWired.map((o) => o.racira).sort(),
    notYetWiredCount: notYetWired.length,
  };

  const outPath = path.join(ROOT, "tool-diff-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${outPath}`);
}

main();
