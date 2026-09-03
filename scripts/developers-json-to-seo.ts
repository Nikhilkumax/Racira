/**
 * JSON-to-SEO Converter for Developer Tools
 *
 * Converts tool SEO content from structure-safe JSON to valid TypeScript.
 * Usage: npx tsx scripts/developers-json-to-seo.ts scratch/seo-batch.json
 *
 * Appends to the existing tool-seo.ts file rather than overwriting,
 * so batches can be incremental.
 */

import { readFileSync, writeFileSync, appendFileSync } from "fs";

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
      lines.push(indent + '  { type: "list", items: [');
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
  console.error("Usage: npx tsx scripts/developers-json-to-seo.ts <input.json>");
  process.exit(1);
}

const input: ToolSeoInput[] = JSON.parse(readFileSync(inputFile, "utf8"));
const outputLines: string[] = [];
const registrations: string[] = [];

for (const tool of input) {
  outputLines.push(toolToTs(tool));
  outputLines.push("");
  registrations.push('registerToolSeo("' + tool.slug + '", ' + tool.varName + ");");
}

const tsContent = outputLines.join("\n");
const regContent = "\n" + registrations.join("\n") + "\n";

// Append to tool-seo.ts (before the closing marker or at end)
const outPath = "src/domains/developers/registry/tool-seo.ts";
const existing = readFileSync(outPath, "utf8");
const marker = "// ── Content batches are registered below this line ──";

if (existing.includes(marker)) {
  // Insert before the closing comment
  const before = existing.substring(0, existing.indexOf(marker));
  const after = existing.substring(existing.indexOf(marker));
  writeFileSync(outPath, before + tsContent + "\n" + regContent + "\n" + after, "utf8");
} else {
  // Append at end
  appendFileSync(outPath, "\n" + tsContent + "\n" + regContent, "utf8");
}

console.log("Generated " + input.length + " tools -> " + outPath);
console.log("Registration lines:");
console.log(regContent);
