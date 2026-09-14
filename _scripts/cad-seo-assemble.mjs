#!/usr/bin/env node
/**
 * cad-seo-assemble.mjs — wrap a json-to-seo.ts -generated.ts output into a
 * typed, slug-keyed per-batch module under src/domains/cad/registry/seo/.
 *
 * Pipeline per batch:
 *   1. Author content:        scratch/cad-seo-batchN.json
 *   2. Schema-check:          SEO_MIN_WORDS=500 SEO_MAX_WORDS=1000 SEO_STRICT=1 \
 *                               npx tsx scripts/validate-seo-json.ts scratch/cad-seo-batchN.json
 *   3. Convert consts:        npx tsx scripts/json-to-seo.ts scratch/cad-seo-batchN.json
 *                             → scratch/cad-seo-batchN-generated.ts
 *   4. Assemble this module:  node _scripts/cad-seo-assemble.mjs \
 *                               scratch/cad-seo-batchN.json src/domains/cad/registry/seo/batchN.ts
 *   5. Register:              add one import + loop in src/domains/cad/registry/tool-seo.ts
 *
 * NUMERIC GUARDRAIL (step 4, runs automatically): every FAQ answer whose text
 * contains a number alongside conclusion language (works out to, gives,
 * returns, equals, exactly, rounds to, ≈, is about, " = ") is printed as a
 * claim that MUST be checked against the live tool's real output before the
 * batch ships — never trust a hand-derived number in FAQ copy. If any claims
 * are found, the assemble step exits 1 unless SEO_NUM_OK=1 is set to
 * acknowledge each claim was verified against the running tool.
 *
 * Usage:
 *   node _scripts/cad-seo-assemble.mjs <batch.json> <out.ts>   # lists claims, exits 1 if any
 *   SEO_NUM_OK=1 node _scripts/cad-seo-assemble.mjs <batch.json> <out.ts>   # after verifying
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const inputFile = process.argv[2];
const outFile = process.argv[3];

if (!inputFile || !outFile) {
  console.error("Usage: node _scripts/cad-seo-assemble.mjs <batch.json> <out.ts>");
  process.exit(1);
}

const jsonPath = resolve(ROOT, inputFile);
const generatedPath = jsonPath.replace(/\.json$/, "-generated.ts");

let input;
try {
  input = JSON.parse(readFileSync(jsonPath, "utf8"));
} catch (e) {
  console.error(`Cannot read/parse ${jsonPath}: ${e.message}`);
  process.exit(1);
}

let generated;
try {
  generated = readFileSync(generatedPath, "utf8");
} catch (e) {
  console.error(`Missing generated consts at ${generatedPath} — run scripts/json-to-seo.ts first.`);
  process.exit(1);
}

const batchNo = inputFile.match(/cad-seo-batch(\d+)/)?.[1];
if (!batchNo) {
  console.error(`Cannot derive batch number from ${inputFile} (expected cad-seo-batchN.json)`);
  process.exit(1);
}
const exportName = `cadSeoBatch${batchNo}`;

// ── numeric worked-example guardrail ──────────────────────────────────────
// FAQ answers with numbers + conclusion language are the exact place the
// arc-length sagitta error happened. Flag them for live-tool verification.
const CONCLUSION =
  /(works out to|works out at|gives |returns |equals |exactly |rounds to|is about|\u2248|\b=\b)/i;
const claims = [];
for (const t of input) {
  for (const s of t.sections || []) {
    if (!s.subHeading) continue; // FAQ answers only
    for (const b of s.content || []) {
      const texts = b.type === "paragraph" && b.text ? [b.text] : b.type === "list" ? b.items || [] : [];
      for (const text of texts) {
        if (/\d/.test(text) && CONCLUSION.test(text)) {
          const clean = text.replace(/\s+/g, " ").trim();
          claims.push({
            slug: t.slug,
            question: s.subHeading,
            snippet: clean.length > 160 ? clean.slice(0, 157) + "..." : clean,
          });
        }
      }
    }
  }
}
if (claims.length > 0) {
  console.log(`\n[guardrail] ${claims.length} numeric FAQ claim(s) found — verify EACH against the live tool's output:`);
  for (const c of claims) {
    console.log(`  - ${c.slug} :: ${c.question}`);
    console.log(`      ${c.snippet}`);
  }
  if (process.env.SEO_NUM_OK !== "1") {
    console.error(
      "\n[guardrail] Assemble BLOCKED: FAQ copy contains numeric worked examples that were not" +
        "\nconfirmed against the live tool. Run the tool with the example's inputs, compare outputs," +
        "\nthen re-run with SEO_NUM_OK=1 to acknowledge every claim above was verified."
    );
    process.exit(1);
  }
  console.log("[guardrail] SEO_NUM_OK=1 — claims acknowledged as verified.\n");
}

const mapLines = input.map((t) => `  "${t.slug}": ${t.varName},`);

const module = `/**
 * CAD SEO content — batch ${batchNo}.
 * GENERATED — do not edit by hand. Regenerate from the JSON source:
 *   npx tsx scripts/json-to-seo.ts ${inputFile.replace(/\\/g, "/")}
 *   node _scripts/cad-seo-assemble.mjs ${inputFile.replace(/\\/g, "/")} ${outFile.replace(/\\/g, "/")}
 */
import type { ToolSeo } from "../tool-seo";

${generated.trim()}

export const ${exportName}: Record<string, ToolSeo> = {
${mapLines.join("\n")}
};
`;

mkdirSync(dirname(resolve(ROOT, outFile)), { recursive: true });
writeFileSync(resolve(ROOT, outFile), module, "utf8");
console.log(`Assembled ${input.length} tools -> ${outFile}`);
console.log("Register in src/domains/cad/registry/tool-seo.ts:");
console.log(`  import { ${exportName} } from "./seo/batch${batchNo}";`);
console.log(`  for (const [slug, seo] of Object.entries(${exportName})) registerToolSeo(slug, seo);`);
