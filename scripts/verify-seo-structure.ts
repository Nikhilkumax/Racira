import { readFileSync } from "fs";

const filePath = "src/domains/pdf/registry/tool-seo.ts";
const content = readFileSync(filePath, "utf-8");

const organizeTools = [
  "seoAddMargin", "seoAddPageLabels", "seoAddPageNumbers", "seoBatesNumbering",
  "seoBookmarkPdf", "seoCropPages", "seoDividePages", "seoEditAttachments",
  "seoExtractPages", "seoHeadersFooters", "seoInsertBlankPages", "seoKeepNthPage",
  "seoOrganizePages", "seoPdfMultiTool", "seoPosterize", "seoReplacePage",
  "seoRotateCustom", "seoSplitEveryN", "seoSplitOddEven", "seoTableOfContents",
  "seoTintPages",
];

const convertFromPdfTools = [
  "seoPdfToText", "seoPdfToBmp", "seoPdfToCbz", "seoPdfToEpub",
  "seoPdfToHtml", "seoPdfToImage", "seoPdfToMarkdown", "seoPdfToOdt",
  "seoPdfToPng", "seoPdfToPowerpoint", "seoPdfToRtf", "seoPdfToTiff",
  "seoPdfToWebp", "seoPdfToWord", "seoPdfToXml",
];

const requiredHeadings = [
  "What is",
  "How to Use",
  "Why Use",
  "Privacy & Security",
  "Frequently Asked Questions",
];

let totalErrors = 0;

const allTools = [...organizeTools, ...convertFromPdfTools];

for (const toolName of allTools) {
  const toolRegex = new RegExp(`const ${toolName}: ToolSeo = \\{([\\s\\S]*?)\\n\\};`);
  const match = content.match(toolRegex);
  if (!match) {
    console.log(`❌ ${toolName}: NOT FOUND in tool-seo.ts`);
    totalErrors++;
    continue;
  }

  const block = match[1];

  // Count sections by finding heading: "..." at section level
  const sectionHeadings: string[] = [];
  const sectionRegex = /\{\s*heading:\s*"([^"]*)"/g;
  let m;
  while ((m = sectionRegex.exec(block)) !== null) {
    const beforeMatch = block.slice(0, m.index);
    const lastNewline = beforeMatch.lastIndexOf("\n");
    const lineStart = beforeMatch.slice(lastNewline + 1);
    const indent = lineStart.length - lineStart.trimStart().length;
    if (indent <= 10 && m[1] !== "") {
      sectionHeadings.push(m[1]);
    }
  }

  // Check exactly 5 sections in order
  let sectionsOk = true;
  if (sectionHeadings.length !== 5) {
    console.log(`❌ ${toolName}: Expected 5 sections, found ${sectionHeadings.length}: [${sectionHeadings.join(", ")}]`);
    sectionsOk = false;
    totalErrors++;
  } else {
    for (let i = 0; i < 5; i++) {
      if (!sectionHeadings[i].startsWith(requiredHeadings[i].split(" ").slice(0, 2).join(" "))) {
        console.log(`❌ ${toolName}: Section ${i + 1} should start with "${requiredHeadings[i]}", got "${sectionHeadings[i]}"`);
        sectionsOk = false;
        totalErrors++;
      }
    }
  }

  // Count words across all text content (paragraphs + list items)
  const textBlocks = block.match(/text: `[^`]+`/g) || [];
  const listItems = block.match(/`[^`]{10,}`/g) || [];
  const allText = [
    ...textBlocks.map(t => t.replace(/^text: `/,"").replace(/`$/,"")),
    ...listItems.map(t => t.replace(/^`/,"").replace(/`$/,"")),
  ].join(" ");
  const wordCount = allText.split(/\s+/).filter(w => w.length > 0).length;

  const wordOk = wordCount >= 1000 && wordCount <= 1500;

  // Find FAQ subHeadings and their first answer
  const faqIdx = block.indexOf("Frequently Asked Questions");
  const faqBlock = faqIdx >= 0 ? block.slice(faqIdx) : "";
  const subHeadings = [...faqBlock.matchAll(/subHeading:\s*"([^"]+)"/g)].map(m => m[1]);

  const faqDetails: string[] = [];
  for (const sh of subHeadings) {
    const shIdx = faqBlock.indexOf(`subHeading: "${sh}"`);
    const afterSh = faqBlock.slice(shIdx);
    const paraMatch = afterSh.match(/text:\s*`([^`]{1,200})/);
    const firstWords = paraMatch ? paraMatch[1].split(/\s+/).slice(0, 10).join(" ") + "..." : "(no answer found)";
    faqDetails.push(`  Q: ${sh}`);
    faqDetails.push(`     A: ${firstWords}`);
  }

  // Check for duplicate subHeadings
  const uniqueShs = new Set(subHeadings);
  const dupes = subHeadings.length !== uniqueShs.size;

  const status = sectionsOk && wordOk && !dupes ? "✅" : "❌";
  console.log(`${status} ${toolName} — ${wordCount} words — ${sectionHeadings.length} sections${dupes ? " — DUPLICATE FAQ!" : ""}`);
  if (!sectionsOk) {
    console.log(`     Sections: [${sectionHeadings.join(" | ")}]`);
  }
  if (!wordOk) {
    console.log(`     Word count: ${wordCount} (target: 1000-1500)`);
  }
  for (const detail of faqDetails) {
    console.log(detail);
  }
  console.log("");
}

console.log("═".repeat(60));
console.log(`Total errors: ${totalErrors}`);
