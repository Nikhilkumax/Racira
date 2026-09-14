/**
 * Validate a JSON batch file for tool SEO content.
 * Usage: npx tsx scripts/validate-seo-json.ts scratch/seo-batch.json
 *
 * Checks:
 * - Valid JSON
 * - Each tool has slug, varName, name, sections
 * - Each section has heading and content
 * - FAQ questions have subHeading at section level (not inside content)
 * - First FAQ section heading is "Frequently Asked Questions"
 * - No duplicate slugs
 * - No duplicate subHeadings within a tool
 * - Word count per tool is in 1000-1500 range
 */

import { readFileSync } from "fs";

interface SeoContentItem {
  type: string;
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

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function toolWordCount(tool: ToolSeoInput): number {
  let words = 0;
  for (const section of tool.sections) {
    for (const block of section.content) {
      if (block.type === "paragraph" && block.text) {
        words += countWords(block.text);
      } else if (block.type === "list" && block.items) {
        for (const item of block.items) {
          words += countWords(item);
        }
      }
    }
  }
  return words;
}

const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Usage: npx tsx scripts/validate-seo-json.ts <input.json>");
  process.exit(1);
}

let input: ToolSeoInput[];
try {
  input = JSON.parse(readFileSync(inputFile, "utf8"));
} catch (e: any) {
  console.error("ERROR: Invalid JSON - " + e.message);
  process.exit(1);
}

// CAD batches run with explicit env bounds (500-1000 words) and heading
// enforcement; unset defaults preserve the original 1000-1500 warning
// behaviour used by the developers/pdf rollouts.
const minWords = +(process.env.SEO_MIN_WORDS || 1000);
const maxWords = +(process.env.SEO_MAX_WORDS || 1500);
const wordErrors = process.env.SEO_MIN_WORDS !== undefined || process.env.SEO_MAX_WORDS !== undefined;
const strict = process.env.SEO_STRICT === "1";

let errors = 0;
let warnings = 0;
const slugs = new Set<string>();
const expectedHeadings = [
  "What is",
  "How to Use",
  "Why Use",
  "Privacy & Security",
  "Frequently Asked Questions",
];

for (const tool of input) {
  console.log("\n--- " + (tool.slug || "UNKNOWN SLUG") + " ---");

  // Check required fields
  if (!tool.slug) {
    console.error("  ERROR: Missing slug");
    errors++;
  } else if (slugs.has(tool.slug)) {
    console.error("  ERROR: Duplicate slug '" + tool.slug + "'");
    errors++;
  } else {
    slugs.add(tool.slug);
  }

  if (!tool.varName) {
    console.error("  ERROR: Missing varName");
    errors++;
  }
  if (!tool.name) {
    console.error("  ERROR: Missing name");
    errors++;
  }
  if (!tool.sections || !Array.isArray(tool.sections)) {
    console.error("  ERROR: Missing or invalid sections array");
    errors++;
    continue;
  }

  // Check section count
  if (tool.sections.length < 5) {
    console.error(
      "  ERROR: Only " + tool.sections.length + " sections (expected 5+)"
    );
    errors++;
  }

  // Check section headings in order
  let faqStarted = false;
  const subHeadings = new Set<string>();
  const topHeadings: string[] = [];
  for (let i = 0; i < tool.sections.length; i++) {
    const section = tool.sections[i];

    if (!section.heading && !section.subHeading) {
      console.error(
        "  ERROR: Section " + (i + 1) + " has no heading or subHeading"
      );
      errors++;
    }

    if (!section.content || !Array.isArray(section.content)) {
      console.error(
        "  ERROR: Section " + (i + 1) + " ('" + section.heading + "') has no content array"
      );
      errors++;
      continue;
    }

    // Check for subHeading inside content items (the recurring bug)
    for (const block of section.content) {
      if ((block as any).subHeading) {
        console.error(
          "  ERROR: subHeading found INSIDE content item in section " +
            (i + 1) +
            " — this is the structural bug! subHeading must be at section level."
        );
        errors++;
      }
    }

    // Check FAQ structure
    if (section.heading === "Frequently Asked Questions") {
      faqStarted = true;
      if (!section.subHeading) {
        console.error(
          "  ERROR: FAQ section heading without subHeading — first FAQ needs a question"
        );
        errors++;
      }
      topHeadings.push(section.heading);
    } else if (faqStarted && section.heading === "" && section.subHeading) {
      // Continuation FAQ — heading should be empty
      if (subHeadings.has(section.subHeading)) {
        console.error(
          "  ERROR: Duplicate FAQ question: '" + section.subHeading + "'"
        );
        errors++;
      }
      subHeadings.add(section.subHeading);
    } else if (faqStarted && section.heading !== "") {
      // New top-level section after FAQ — acceptable
      topHeadings.push(section.heading);
    } else if (section.heading) {
      topHeadings.push(section.heading);
    }
  }

  // Strict mode (CAD): require the five standard movements in order, each
  // exactly once, and at least three FAQ questions.
  if (strict) {
    const expect = [
      "What is",
      "How to Use",
      "Why Use",
      "Privacy & Security",
      "Frequently Asked Questions",
    ];
    const norm = (h: string) =>
      h === "Frequently Asked Questions" ? h : h.split(" ").slice(0, 2).join(" ");
    const present = new Set(topHeadings.map(norm));
    for (const e of expect) {
      const ok =
        e === "Frequently Asked Questions"
          ? present.has(e)
          : topHeadings.some((h) => h.startsWith(e));
      if (!ok) {
        console.error("  ERROR (strict): missing required section starting with \"" + e + "\"");
        errors++;
      }
    }
    for (const e of expect) {
      const count = topHeadings.filter((h) =>
        e === "Frequently Asked Questions" ? h === e : h.startsWith(e)
      ).length;
      if (count > 1) {
        console.error("  ERROR (strict): section \"" + e + "\" appears " + count + " times (expected 1)");
        errors++;
      }
    }
    if (faqStarted && subHeadings.size + 1 < 3) {
      console.error("  ERROR (strict): FAQ needs at least 3 questions (found " + (subHeadings.size + 1) + ")");
      errors++;
    }
  }

  // Check word count (env-bounded runs treat out-of-range as an error)
  const wc = toolWordCount(tool);
  if (wc < minWords) {
    console.error("  " + (wordErrors ? "ERROR" : "WARNING") + ": Word count " + wc + " is below " + minWords + " target");
    if (wordErrors) errors++;
    else warnings++;
  } else if (wc > maxWords) {
    console.error("  " + (wordErrors ? "ERROR" : "WARNING") + ": Word count " + wc + " exceeds " + maxWords + " target");
    if (wordErrors) errors++;
    else warnings++;
  } else {
    console.log("  OK: " + wc + " words");
  }
}

console.log("\n═══════════════════════════════════════════");
console.log("Total tools: " + input.length);
console.log("Errors: " + errors);
console.log("Warnings: " + warnings);

if (errors > 0) {
  console.error("\nFAILED — fix errors before converting to TypeScript");
  process.exit(1);
} else {
  console.log("\nPASSED — safe to convert to TypeScript");
}
