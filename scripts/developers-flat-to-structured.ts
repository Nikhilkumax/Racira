/**
 * Converts flat SEO JSON (whatIs/howToUse/whyUse/faq) to the structured
 * format expected by developers-validate-seo-json.ts and developers-json-to-seo.ts.
 *
 * Usage: npx tsx scripts/developers-flat-to-structured.ts input.json output.json
 */

import { readFileSync, writeFileSync } from "fs";

const PRIVACY_SECURITY =
  "This tool runs entirely in your browser — no data ever leaves your device. There are no server calls, no analytics tracking, and no input logging. All processing happens locally using the Web Crypto API or client-side JavaScript libraries. Your inputs are never stored, transmitted, or accessible to anyone else.";

interface FlatTool {
  slug: string;
  title: string;
  whatIs: string;
  howToUse: string;
  whyUse: string;
  faq: { question: string; answer: string }[];
}

interface StructuredSection {
  heading: string;
  subHeading?: string;
  content: { type: string; text?: string; items?: string[] }[];
}

interface StructuredTool {
  slug: string;
  varName: string;
  name: string;
  sections: StructuredSection[];
}

function slugToVarName(slug: string): string {
  return (
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") + "Seo"
  );
}

function stripH2(html: string): string {
  return html.replace(/<\/?h2>/g, "").trim();
}

function extractListItems(html: string): string[] {
  const items: string[] = [];
  const re = /<p>(.*?)<\/p>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push(m[1]);
  }
  return items.length ? items : [html.replace(/<[^>]+>/g, "").trim()];
}

function extractParagraphs(html: string): { type: string; text: string }[] {
  // Split by <p> tags
  const parts: { type: string; text: string }[] = [];
  const re = /<p>(.*?)<\/p>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    parts.push({ type: "paragraph", text: m[1] });
  }
  return parts.length ? parts : [{ type: "paragraph", text: html.replace(/<[^>]+>/g, "").trim() }];
}

function convertTool(tool: FlatTool): StructuredTool {
  const varName = slugToVarName(tool.slug);

  const sections: StructuredSection[] = [
    {
      heading: `What is ${tool.title}`,
      content: extractParagraphs(tool.whatIs),
    },
    {
      heading: `How to Use ${tool.title}`,
      content: [{ type: "list", items: extractListItems(tool.howToUse) }],
    },
    {
      heading: `Why Use ${tool.title}`,
      content: extractParagraphs(tool.whyUse),
    },
    {
      heading: "Privacy & Security",
      content: [{ type: "paragraph", text: PRIVACY_SECURITY }],
    },
  ];

  // FAQ: each question becomes a section with subHeading
  for (const faq of tool.faq) {
    sections.push({
      heading: "Frequently Asked Questions",
      subHeading: faq.question,
      content: [{ type: "paragraph", text: faq.answer }],
    });
  }

  return { slug: tool.slug, varName, name: tool.title, sections };
}

// Main
const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath.replace(".json", "-structured.json");

const input: FlatTool[] = JSON.parse(readFileSync(inputPath, "utf8"));
const output = input.map(convertTool);
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Converted ${output.length} tools to structured format → ${outputPath}`);
