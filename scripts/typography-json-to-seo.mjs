/**
 * JSON-to-TS generator for Racira Fonts (/typography) SEO batches.
 *
 * Usage: node scripts/typography-json-to-seo.mjs <batch.json> <out.ts> [exportName]
 *
 * Turns a validated JSON batch (see scripts/validate-typography-seo-json.mjs)
 * into a `Record<string, ToolSeo>` module. Strings are emitted with
 * JSON.stringify so quoting/escaping (newlines, em dashes, ${...}) is always
 * valid TypeScript — never hand-concatenate strings here.
 *
 * The generated module is an intermediate artifact: scripts/apply-typography-seo-batch.mjs
 * splices each entry into the batch file that already holds that slug, so the
 * content that reaches the page is exactly the content that passed the
 * validator. Generate into a throwaway path (scripts/.tmp-<batch>.ts), not into
 * the repository's content modules.
 *
 * Always validate before generating:
 *   node scripts/validate-typography-seo-json.mjs <batch.json> \
 *     && node scripts/typography-json-to-seo.mjs <batch.json> scripts/.tmp-<batch>.ts TMP \
 *     && node scripts/apply-typography-seo-batch.mjs scripts/.tmp-<batch>.ts --write
 */
import fs from "node:fs";
import path from "node:path";

const [, , inputFile, outFile, exportNameArg] = process.argv;
if (!inputFile || !outFile) {
  console.error("usage: node scripts/typography-json-to-seo.mjs <batch.json> <out.ts> [exportName]");
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(inputFile, "utf8"));
if (!Array.isArray(batch)) {
  console.error("batch JSON must be an array of tools.");
  process.exit(1);
}

const exportName =
  exportNameArg ||
  "SEO_BATCH_" +
    path
      .basename(inputFile)
      .replace(/\.json$/i, "")
      .replace(/[^a-z0-9]+/gi, "_")
      .toUpperCase();

const indent = (text, pad) =>
  text
    .split("\n")
    .map((l) => pad + l)
    .join("\n");

function toolToTs(tool) {
  const lines = [];
  lines.push(`  ${JSON.stringify(tool.slug)}: {`);

  lines.push("    keywords: [");
  for (const kw of tool.keywords || []) lines.push(`      ${JSON.stringify(kw)},`);
  lines.push("    ],");

  lines.push(`    intro:`);
  lines.push(indent(JSON.stringify(tool.intro), "      ") + ",");

  lines.push(`    content:`);
  lines.push(indent(JSON.stringify(tool.content), "      ") + ",");

  lines.push("    howTo: [");
  for (const step of tool.howTo || []) {
    const value = typeof step === "string" ? step : step.step;
    lines.push(`      { step: ${JSON.stringify(value)} },`);
  }
  lines.push("    ],");

  lines.push(`    whenToUse:`);
  lines.push(indent(JSON.stringify(tool.whenToUse), "      ") + ",");

  lines.push("    faqs: [");
  for (const faq of tool.faqs || []) {
    lines.push("      {");
    lines.push(`        q: ${JSON.stringify(faq.q)},`);
    lines.push(`        a: ${JSON.stringify(faq.a)},`);
    lines.push("      },");
  }
  lines.push("    ],");

  lines.push("  },");
  return lines.join("\n");
}

const body = batch.map(toolToTs).join("\n\n");
const source = path.relative(process.cwd(), path.resolve(inputFile)).replace(/\\/g, "/");

const output = `/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: ${source}
 * Regenerate: node scripts/typography-json-to-seo.mjs ${source} <this file> ${exportName}
 * Validate first: node scripts/validate-typography-seo-json.mjs ${source}
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const ${exportName}: Record<string, ToolSeo> = {
${body}
};
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, output, "utf8");
console.log(`\u2713 generated ${batch.length} tool(s) -> ${outFile} (${exportName})`);
