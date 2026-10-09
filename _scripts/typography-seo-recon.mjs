/**
 * Recon / migration-status report for Racira Fonts (/typography) SEO content.
 *
 * Usage: node _scripts/typography-seo-recon.mjs [--verbose]
 *
 * Answers, from the actual source (never from assumption):
 *   1. how many registry tools are live, per category
 *   2. which live slugs have SEO content and which have none
 *   3. how the existing content is structured per tool: sections, words,
 *      paragraphs, bullet items, `<strong>` markers, FAQ count, {{...}} links
 *   4. which live slugs have a wired component
 *
 * The content modules are the legacy section-based schema, so this script
 * measures them as-is (it does not assume the locked flat ToolSeo shape).
 * Read-only: nothing is written.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url);

const verbose = process.argv.includes("--verbose");

const SEO_DIR = path.join("src", "domains", "typography", "registry", "seo");
const REGISTRY = path.join("src", "domains", "typography", "registry.ts");
const COMPONENT_REGISTRY = path.join(
  "src",
  "domains",
  "typography",
  "components",
  "tools",
  "registry.ts",
);
const EASY_REG = path.join("src", "domains", "typography", "components", "tools", "easy", "registry.tsx");
const MEDIUM_REG = path.join("src", "domains", "typography", "components", "tools", "medium", "registry.tsx");

// ── registry: category → tools, live flags ────────────────────────────────
const regText = fs.readFileSync(REGISTRY, "utf8");
const categories = [];
let current = null;
for (const rawLine of regText.split(/\r?\n/)) {
  const catMatch = rawLine.match(/^\s{4}name: "([^"]+)",\s*$/);
  if (catMatch) {
    current = { name: catMatch[1], tools: [] };
    categories.push(current);
    continue;
  }
  const toolMatch = rawLine.match(/^\s{6}\["([^"]+)",\s*"([^"]*)",\s*[A-Za-z0-9_$]+,\s*(true|false)\],?\s*$/);
  if (toolMatch && current) {
    current.tools.push({
      name: toolMatch[1],
      desc: toolMatch[2],
      live: toolMatch[3] === "true",
      category: current.name,
      slug: null,
    });
  }
}

const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const liveSlugs = new Set();
const slugCategory = new Map();
const slugName = new Map();
for (const cat of categories) {
  for (const tool of cat.tools) {
    tool.slug = toSlug(tool.name);
    if (tool.live) {
      liveSlugs.add(tool.slug);
      slugCategory.set(tool.slug, cat.name);
      slugName.set(tool.slug, tool.name);
    }
  }
}

// ── wired components ──────────────────────────────────────────────────────
const wired = new Set();
for (const file of [COMPONENT_REGISTRY, EASY_REG, MEDIUM_REG]) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/^\s+"([a-z0-9-]+)":/gm)) wired.add(m[1]);
}

// ── existing SEO modules ──────────────────────────────────────────────────
const batchFiles = fs
  .readdirSync(SEO_DIR)
  .filter((f) => /^batch\d+\.ts$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const words = (s) => (String(s).match(/[a-z0-9']+/gi) || []).length;

const rows = [];
const seen = new Map();

for (const file of batchFiles) {
  const mod = jiti(path.resolve(SEO_DIR, file));
  const batch = Object.values(mod)[0];
  for (const [slug, seo] of Object.entries(batch)) {
    if (seen.has(slug)) {
      rows.push({ slug, file, duplicateOf: seen.get(slug), sections: 0, wc: 0, faqs: 0 });
      continue;
    }
    seen.set(slug, file);

    // Locked flat shape (rendered) vs legacy section shape (migration backlog).
    const locked = typeof seo.content === "string" && Array.isArray(seo.faqs);
    if (locked) {
      const faqText = (seo.faqs || []).flatMap((f) => [f.q, f.a]).join(" ");
      const steps = (seo.howTo || []).map((s) => (typeof s === "string" ? s : s?.step)).join(" ");
      const allText = [seo.intro, seo.content, seo.whenToUse, faqText].join(" ");
      rows.push({
        slug,
        file,
        shape: "locked",
        category: slugCategory.get(slug) || "(not live)",
        name: slugName.get(slug) || "(unknown)",
        sections: 0,
        paragraphSections: 0,
        faqs: (seo.faqs || []).length,
        bullets: (seo.content.match(/^[-•]\s/gm) || []).length,
        paragraphs: seo.content.split(/\n{2,}/).filter((b) => !/^[-•]\s/m.test(b)).length,
        strong: (allText.match(/<\/?strong>/g) || []).length + (allText.match(/\*\*/g) || []).length,
        links: (seo.whenToUse?.match(/\{\{[^}]+\}\}/g) || []).length,
        keywords: (seo.keywords || []).length,
        steps: (seo.howTo || []).length,
        wc: words(seo.content),
        hasPrivacy: true, // supplied verbatim by the shared renderer
        stepMarkers: (steps.match(/Step \d/gi) || []).length,
      });
      continue;
    }

    const sections = seo.sections || [];
    let allText = "";
    let paragraphs = 0;
    let bullets = 0;
    let strong = 0;
    let links = 0;
    for (const section of sections) {
      allText += " " + (section.heading || "") + " " + (section.subHeading || "");
      for (const block of section.content || []) {
        if (block.type === "list") {
          bullets += (block.items || []).length;
          allText += " " + (block.items || []).join(" ");
        } else if (block.text) {
          paragraphs++;
          allText += " " + block.text;
        }
      }
    }
    strong += (allText.match(/<\/?strong>/g) || []).length;
    links += (allText.match(/\{\{[^}]+\}\}/g) || []).length;
    rows.push({
      slug,
      file,
      shape: "legacy",
      category: slugCategory.get(slug) || "(not live)",
      name: slugName.get(slug) || "(unknown)",
      sections: sections.length,
      paragraphSections: sections.filter((s) => !s.subHeading && s.heading !== "").length,
      faqs: sections.filter((s) => s.subHeading).length,
      bullets,
      paragraphs,
      strong,
      links,
      keywords: 0,
      steps: (allText.match(/Step \d/gi) || []).length,
      wc: words(allText),
      hasPrivacy: sections.some((s) => /privacy/i.test(s.heading || "")),
      stepMarkers: (allText.match(/Step \d/gi) || []).length,
    });
  }
}

// ── report ────────────────────────────────────────────────────────────────
console.log("=".repeat(96));
console.log("RACIRA FONT — SEO RECON");
console.log("=".repeat(96));

console.log("\n1) REGISTRY: live vs soon, per category");
let totalTools = 0;
let totalLive = 0;
for (const cat of categories) {
  const live = cat.tools.filter((t) => t.live).length;
  totalTools += cat.tools.length;
  totalLive += live;
  console.log(
    `   ${cat.name.padEnd(30)} live ${String(live).padStart(3)} / total ${String(cat.tools.length).padStart(3)}`,
  );
}
console.log(`   ${"TOTAL".padEnd(30)} live ${String(totalLive).padStart(3)} / total ${String(totalTools).padStart(3)}`);

const liveWithoutComponent = [...liveSlugs].filter((s) => !wired.has(s));
const componentWithoutLive = [...wired].filter((s) => !liveSlugs.has(s));
console.log(`   wired components: ${wired.size}`);
console.log(`   live slugs missing a wired component: ${liveWithoutComponent.length}${liveWithoutComponent.length ? " → " + liveWithoutComponent.join(", ") : ""}`);
console.log(`   wired components not live in registry: ${componentWithoutLive.length}${componentWithoutLive.length ? " → " + componentWithoutLive.join(", ") : ""}`);

const withSeo = new Set(rows.map((r) => r.slug));
const liveWithoutSeo = [...liveSlugs].filter((s) => !withSeo.has(s));
const seoWithoutLive = rows.filter((r) => !liveSlugs.has(r.slug)).map((r) => r.slug);
console.log(`\n2) SEO CONTENT COVERAGE`);
console.log(`   live slugs with SEO content: ${[...liveSlugs].filter((s) => withSeo.has(s)).length} / ${liveSlugs.size}`);
console.log(`   live slugs with NO SEO content: ${liveWithoutSeo.length}${liveWithoutSeo.length ? " → " + liveWithoutSeo.join(", ") : ""}`);
console.log(`   SEO entries whose slug is not live: ${seoWithoutLive.length}${seoWithoutLive.length ? " → " + seoWithoutLive.join(", ") : ""}`);
console.log(`   total SEO entries across ${batchFiles.length} batch files: ${rows.length}`);
const dupes = rows.filter((r) => r.duplicateOf);
console.log(`   duplicate slugs inside SEO modules: ${dupes.length}${dupes.length ? " → " + dupes.map((d) => d.slug).join(", ") : ""}`);console.log(`\n3) ENTRIES (shape, then per-tool counts; locked rows are what the page renders)`);
const sorted = [...rows].sort((a, b) => a.slug.localeCompare(b.slug));
console.log(
  `   ${"slug".padEnd(34)} ${"shape".padEnd(7)} ${"kw".padStart(3)}${"par".padStart(5)}${"bul".padStart(5)}${"faq".padStart(5)}${"str".padStart(5)}${"lnk".padStart(5)}${"words".padStart(7)}`,
);
for (const r of sorted) {
  console.log(
    `   ${r.slug.padEnd(34)} ${r.shape.padEnd(7)} ` +
      `${String(r.keywords).padStart(3)}${String(r.paragraphs).padStart(5)}${String(r.bullets).padStart(5)}` +
      `${String(r.faqs).padStart(5)}${String(r.strong).padStart(5)}${String(r.links).padStart(5)}${String(r.wc).padStart(7)}`,
  );
}

const hist = (arr) => {
  const m = new Map();
  for (const v of arr) m.set(v, (m.get(v) || 0) + 1);
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}×${v}`).join("  ");
};

const locked = sorted.filter((r) => r.shape === "locked");
const legacy = sorted.filter((r) => r.shape === "legacy");

console.log(`\n4) MIGRATION STATUS`);
console.log(`   locked (rendered): ${locked.length} / ${sorted.length}`);
console.log(`   legacy (not rendered): ${legacy.length} / ${sorted.length}`);
for (const cat of categories) {
  const inCat = locked.filter((r) => r.category === cat.name);
  const totalLive = cat.tools.filter((t) => t.live).length;
  console.log(`     ${cat.name.padEnd(30)} ${String(inCat.length).padStart(3)} / ${String(totalLive).padStart(3)} locked`);
}

if (locked.length) {
  const lw = locked.map((r) => r.wc).sort((a, b) => a - b);
  console.log(`\n5) LOCKED-ENTRY HEALTH`);
  console.log(`   content words: min ${lw[0]} · max ${lw[lw.length - 1]} · median ${lw[Math.floor(lw.length / 2)]} (band 500-1000)`);
  console.log(`   outside the band: ${locked.filter((r) => r.wc < 500 || r.wc > 1000).length}`);
  console.log(`   with <strong>/\*\* markers: ${locked.filter((r) => r.strong > 0).length}`);
  console.log(`   FAQ count per tool: ${hist(locked.map((r) => r.faqs))} (target 5)`);
  console.log(`   keywords per tool: ${hist(locked.map((r) => r.keywords))}`);
  console.log(`   steps per tool: ${hist(locked.map((r) => r.steps))} (target 3-4)`);
  console.log(`   {{slug|text}} links per tool: ${hist(locked.map((r) => r.links))} (min 2)`);
  console.log(`   bullet items per tool: ${hist(locked.map((r) => r.bullets))}`);
}

console.log(`\n6) LEGACY BACKLOG SHAPE (the old sections, for reference while migrating)`);
const wcs = legacy.map((r) => r.wc).filter((n) => n > 0);
console.log(`   words (legacy total, incl. headings): min ${Math.min(...wcs)} · max ${Math.max(...wcs)} · median ${wcs.sort((a, b) => a - b)[Math.floor(wcs.length / 2)]}`);
console.log(`   with <strong> markers (bold in body copy): ${legacy.filter((r) => r.strong > 0).length} / ${legacy.length}`);
console.log(`   with any {{slug|text}} link: ${legacy.filter((r) => r.links > 0).length} / ${legacy.length}`);
console.log(`   legacy FAQ count per tool: ${hist(legacy.map((r) => r.faqs))} (target 5 flat {q,a})`);
console.log(`   bullet items per tool: ${hist(legacy.map((r) => r.bullets))}`);
console.log("");
