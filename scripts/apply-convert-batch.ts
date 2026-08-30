import { readFileSync, writeFileSync } from "fs";

const toolSeo = readFileSync("src/domains/pdf/registry/tool-seo.ts", "utf-8");
const template = readFileSync("scratch/seo-convert-from-pdf-template.ts", "utf-8")
  .replace(/^\/\*[\s\S]*?\*\/\n/, "").trim();
const batch = readFileSync("scratch/seo-convert-from-pdf-batch.ts", "utf-8")
  .replace(/^\/\*[\s\S]*?\*\/\n/, "").trim();

// Combine: template + batch
const combined = template + "\n\n" + batch;

// Find insertion point (before explicitSeo)
const marker = "const explicitSeo: Record<string, ToolSeo> = {";
const idx = toolSeo.indexOf(marker);
if (idx === -1) { console.error("Marker not found"); process.exit(1); }

// Insert content
const before = toolSeo.slice(0, idx);
const after = toolSeo.slice(idx);
let result = before + combined + "\n\n\n" + after;

// Register all 15 tools in explicitSeo
const registrations = [
  `"pdf-to-bmp": seoPdfToBmp,`,
  `"pdf-to-cbz": seoPdfToCbz,`,
  `"pdf-to-epub": seoPdfToEpub,`,
  `"pdf-to-html": seoPdfToHtml,`,
  `"pdf-to-image": seoPdfToImage,`,
  `"pdf-to-markdown": seoPdfToMarkdown,`,
  `"pdf-to-odt": seoPdfToOdt,`,
  `"pdf-to-png": seoPdfToPng,`,
  `"pdf-to-powerpoint": seoPdfToPowerpoint,`,
  `"pdf-to-rtf": seoPdfToRtf,`,
  `"pdf-to-text": seoPdfToText,`,
  `"pdf-to-tiff": seoPdfToTiff,`,
  `"pdf-to-webp": seoPdfToWebp,`,
  `"pdf-to-word": seoPdfToWord,`,
  `"pdf-to-xml": seoPdfToXml,`,
];

result = result.replace(
  marker,
  marker + "\n  /* ── Convert from PDF batch ── */\n  " + registrations.join("\n  ")
);

// Remove consecutive duplicate };
const lines = result.split("\n");
const deduped: string[] = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "};" && i > 0 && lines[i-1].trim() === "};") continue;
  deduped.push(lines[i]);
}

writeFileSync("src/domains/pdf/registry/tool-seo.ts", deduped.join("\n"), "utf-8");
console.log(`Applied ${registrations.length} Convert from PDF tools`);
console.log(`File: ${toolSeo.split("\n").length} → ${deduped.length} lines`);
