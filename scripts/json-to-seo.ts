/**
 * JSON-to-SEO Converter
 *
 * Converts tool SEO content from structure-safe JSON to valid TypeScript.
 * Usage: npx tsx scripts/json-to-seo.ts scratch/seo-batch.json
 *
 * The JSON format enforces correct FAQ structure by construction:
 * subHeading is always a section-level key, never nested inside content.
 */

import { readFileSync, writeFileSync } from "fs";

interface SeoContentItem {
  type: "paragraph" | "list";
  text?: string;
  items?: string[];
}

interface SeoSection {
  heading: string;
  subHeading?: string;
  content: SeoContentItem[];
}

interface ToolSeoInput {
  slug: string;
  varName: string;
  name: string;
  sections: SeoSection[];
}

function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function sectionToTs(section: SeoSection, indent: string): string {
  const lines: string[] = [];
  const h = esc(section.heading);
  const sub = section.subHeading
    ? ', subHeading: "' + esc(section.subHeading) + '"'
    : "";

  lines.push(indent + '{ heading: "' + h + '"' + sub + ", content: [");

  for (const block of section.content) {
    if (block.type === "paragraph" && block.text) {
      lines.push(
        indent + '  { type: "paragraph", text: `' + esc(block.text) + "` },"
      );
    } else if (block.type === "list" && block.items) {
      lines.push(indent + "  { type: \"list\", items: [");
      for (const item of block.items) {
        lines.push(indent + "    `" + esc(item) + "`,");
      }
      lines.push(indent + "  ]},");
    }
  }

  lines.push(indent + "]},");
  return lines.join("\n");
}

function toolToTs(tool: ToolSeoInput): string {
  const lines: string[] = [];
  lines.push("const " + tool.varName + ": ToolSeo = {");
  lines.push("  sections: [");

  for (const section of tool.sections) {
    lines.push(sectionToTs(section, "    "));
  }

  lines.push("  ],");
  lines.push("};");
  return lines.join("\n");
}

// ── Main ──
const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Usage: npx tsx scripts/json-to-seo.ts <input.json>");
  process.exit(1);
}

const input: ToolSeoInput[] = JSON.parse(readFileSync(inputFile, "utf8"));
const outputLines: string[] = [];
const registrations: string[] = [];

for (const tool of input) {
  outputLines.push(toolToTs(tool));
  outputLines.push("");
  registrations.push('  "' + tool.slug + '": ' + tool.varName + ",");
}

const tsContent = outputLines.join("\n");
const outPath = inputFile.replace(".json", "-generated.ts");
writeFileSync(outPath, tsContent, "utf8");
console.log("Generated " + input.length + " tools -> " + outPath);
console.log("Registration lines:");
console.log(registrations.join("\n"));
