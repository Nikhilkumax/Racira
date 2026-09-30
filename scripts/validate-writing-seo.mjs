/**
 * Build-time gate for Racira Writing (/writing) SEO content.
 *
 * Loads the domain SEO registry straight from TypeScript (via the installed
 * `typescript` compiler API — no separate build step, no Playwright, no dev
 * server) and fails the build when the content contract is broken:
 *
 *   1. every slug with authored content is a live tool in the writing registry;
 *   2. every live tool has authored content (a live page with no body copy is a
 *      thin page, and a live flag must not outrun its SEO);
 *   3. `seo.content` sits in the 500-1000 word band (both ends enforced);
 *   4. every keyword appears verbatim in `seo.content`;
 *   5. between 4 and 6 unique FAQs per tool, unique across the whole domain;
 *   6. `whenToUse` links at least two live sibling tools, never itself, and
 *      never a slug that is not live;
 *   7. `howTo`, when present, has at least three steps;
 *   8. no two tools share more than 90% of their vocabulary;
 *   9. content carries no `**emphasis**` markers (the shared SeoContent
 *      renderer unwraps them, so they are dead weight in the source).
 *
 * Wired into `prebuild` in package.json (and therefore into `npm run build`).
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const SEO_ENTRY = path.join(ROOT, "src", "domains", "writing", "registry", "tool-seo.ts");
const DOMAIN_REGISTRY = path.join(ROOT, "src", "domains", "writing", "registry.ts");
const COMPONENT_MAP = path.join(
  ROOT,
  "src",
  "domains",
  "writing",
  "components",
  "tools",
  "registry.tsx",
);

const MIN_WORDS = 500;
const MAX_WORDS = 1000;
const MAX_SIMILARITY = 0.9;
const MIN_FAQS = 4;
const MAX_FAQS = 6;
const MIN_TOOL_LINKS = 2;
const MIN_HOWTO_STEPS = 3;

const TOOL_LINK = /\{\{([^|{}]+)\|([^{}]+)\}\}/g;
const EMPHASIS = /\*\*/;

// ── Minimal TS→CJS loader (relative imports only) ─────────────────────────────
const moduleCache = new Map();

function loadTsModule(file) {
  const full = path.resolve(file);
  if (moduleCache.has(full)) return moduleCache.get(full).exports;

  const source = fs.readFileSync(full, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: full,
  });

  const mod = { exports: {} };
  moduleCache.set(full, mod);

  const requireShim = (id) => {
    if (!id.startsWith(".")) {
      // Type-only imports are erased by transpile; anything else is a bug.
      throw new Error(`Unexpected runtime import "${id}" in ${path.relative(ROOT, full)}`);
    }
    let resolved = path.resolve(path.dirname(full), id);
    if (!fs.existsSync(resolved) && fs.existsSync(resolved + ".ts")) resolved += ".ts";
    return loadTsModule(resolved);
  };

  new Function("exports", "require", "module", outputText)(mod.exports, requireShim, mod);
  return mod.exports;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const wordsOf = (text) => text.toLowerCase().match(/\p{L}[\p{L}\p{N}'\u2019-]*/gu) || [];
const wordCount = (text) => wordsOf(text).length;

function jaccard(a, b) {
  const sa = new Set(wordsOf(a));
  const sb = new Set(wordsOf(b));
  if (sa.size === 0 && sb.size === 0) return 1;
  let inter = 0;
  for (const token of sa) if (sb.has(token)) inter += 1;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 1 : inter / union;
}

/** Slug rule from src/lib/utils/slug.ts. */
const toSlug = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Live slugs from the writing registry, which stores tools through the `mk()`
 * helper: mk("Name", "description", Icon, true|false).
 */
function readLiveSlugs(file) {
  const text = fs.readFileSync(file, "utf8");
  const live = new Map(); // slug -> name
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*mk\("([^"]+)",\s*"[^"]*",[^,]+,\s*(true|false)\),?\s*$/);
    if (!match) continue;
    if (match[2] === "true") live.set(toSlug(match[1]), match[1]);
  }
  return live;
}

/** Slugs wired in the per-tool component map (the reconcile gate's concern, checked here too). */
function readWiredSlugs(file) {
  const text = fs.readFileSync(file, "utf8");
  const wired = new Set();
  for (const match of text.matchAll(/"([a-z0-9-]+)"\s*:\s*dynamic\(/g)) wired.add(match[1]);
  return wired;
}

function fail(messages) {
  console.error("\n\u2717 validate-writing-seo failed:\n");
  for (const message of messages) console.error(`  - ${message}`);
  console.error("");
  process.exit(1);
}

// ── Load content + registry ───────────────────────────────────────────────────
if (!fs.existsSync(SEO_ENTRY)) fail([`missing ${path.relative(ROOT, SEO_ENTRY)}`]);

const seoModule = loadTsModule(SEO_ENTRY);
const getToolSeo = seoModule.getToolSeo;
const SEO_SLUGS = seoModule.WRITING_SEO_SLUGS || [];
if (typeof getToolSeo !== "function") fail(["tool-seo.ts does not export getToolSeo."]);
if (SEO_SLUGS.length === 0) fail(["no authored SEO entries found in the writing registry."]);

const liveSlugs = readLiveSlugs(DOMAIN_REGISTRY);
const wiredSlugs = readWiredSlugs(COMPONENT_MAP);
if (liveSlugs.size === 0) {
  fail([`parsed no live slugs out of ${path.relative(ROOT, DOMAIN_REGISTRY)}`]);
}

const errors = [];
const report = [];

// ── 1/2. Slug coverage both ways ──────────────────────────────────────────────
for (const slug of SEO_SLUGS) {
  if (!liveSlugs.has(slug)) {
    errors.push(`SEO content exists for "${slug}", which is not a live tool in the registry.`);
  }
}
for (const [slug, name] of liveSlugs) {
  if (!SEO_SLUGS.includes(slug)) {
    errors.push(`Live tool "${name}" (${slug}) has no authored SEO content.`);
  }
  if (!wiredSlugs.has(slug)) {
    errors.push(`Live tool "${name}" (${slug}) is not wired in the per-tool component map.`);
  }
}

// ── Per tool ──────────────────────────────────────────────────────────────────
const faqTexts = new Map(); // faq text -> slug
const contents = [];

for (const slug of SEO_SLUGS) {
  const seo = getToolSeo(slug);
  const label = `${slug}:`;

  if (!seo || typeof seo !== "object") {
    errors.push(`${label} entry is not an object.`);
    continue;
  }
  if (!seo.content || typeof seo.content !== "string") {
    errors.push(`${label} missing content.`);
    continue;
  }

  const count = wordCount(seo.content);
  report.push({ slug, words: count, faqs: seo.faqs?.length ?? 0 });
  if (count < MIN_WORDS || count > MAX_WORDS) {
    errors.push(`${label} content is ${count} words; the band is ${MIN_WORDS}-${MAX_WORDS}.`);
  }
  if (EMPHASIS.test(seo.content)) {
    errors.push(`${label} content contains ** emphasis markers, which the renderer unwraps.`);
  }

  for (const keyword of seo.keywords ?? []) {
    if (!seo.content.toLowerCase().includes(String(keyword).toLowerCase())) {
      errors.push(`${label} keyword "${keyword}" does not appear verbatim in content.`);
    }
  }
  if (!Array.isArray(seo.keywords) || seo.keywords.length === 0) {
    errors.push(`${label} has no keywords.`);
  }
  if (!seo.intro || typeof seo.intro !== "string") errors.push(`${label} missing intro.`);

  const faqs = Array.isArray(seo.faqs) ? seo.faqs : [];
  if (faqs.length < MIN_FAQS || faqs.length > MAX_FAQS) {
    errors.push(`${label} has ${faqs.length} FAQs; the band is ${MIN_FAQS}-${MAX_FAQS}.`);
  }
  const seenQuestions = new Set();
  for (const faq of faqs) {
    if (!faq?.q || !faq?.a) {
      errors.push(`${label} has an FAQ with an empty question or answer.`);
      continue;
    }
    const key = String(faq.q).toLowerCase().trim();
    if (seenQuestions.has(key)) errors.push(`${label} repeats the FAQ question "${faq.q}".`);
    seenQuestions.add(key);
    if (faqTexts.has(key)) {
      errors.push(`${label} FAQ "${faq.q}" is also used by ${faqTexts.get(key)}.`);
    } else {
      faqTexts.set(key, slug);
    }
  }

  if (seo.howTo) {
    if (!Array.isArray(seo.howTo) || seo.howTo.length < MIN_HOWTO_STEPS) {
      errors.push(`${label} howTo has fewer than ${MIN_HOWTO_STEPS} steps.`);
    } else if (seo.howTo.some((step) => !step?.step)) {
      errors.push(`${label} howTo contains an empty step.`);
    }
  }

  if (seo.whenToUse) {
    const links = [...String(seo.whenToUse).matchAll(TOOL_LINK)].map((match) => match[1]);
    if (links.length < MIN_TOOL_LINKS) {
      errors.push(`${label} whenToUse links ${links.length} sibling tools; at least ${MIN_TOOL_LINKS} are required.`);
    }
    for (const linked of links) {
      if (linked === slug) errors.push(`${label} whenToUse links to itself.`);
      else if (!liveSlugs.has(linked)) {
        errors.push(`${label} whenToUse links to "${linked}", which is not a live tool.`);
      }
    }
  } else {
    errors.push(`${label} missing whenToUse (needs ${MIN_TOOL_LINKS}+ sibling links).`);
  }

  contents.push({ slug, content: seo.content });
}

// ── 8. Cross-tool similarity ──────────────────────────────────────────────────
for (let i = 0; i < contents.length; i += 1) {
  for (let j = i + 1; j < contents.length; j += 1) {
    const similarity = jaccard(contents[i].content, contents[j].content);
    if (similarity > MAX_SIMILARITY) {
      errors.push(
        `${contents[i].slug} and ${contents[j].slug} are ${(similarity * 100).toFixed(1)}% similar (max ${MAX_SIMILARITY * 100}%).`,
      );
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log("=== WRITING SEO VALIDATION ===");
console.log(`Live tools: ${liveSlugs.size} | authored SEO entries: ${SEO_SLUGS.length}`);
for (const entry of report.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const band = entry.words >= MIN_WORDS && entry.words <= MAX_WORDS ? "ok" : "OUT OF BAND";
  console.log(`  ${entry.slug}: ${entry.words} words, ${entry.faqs} FAQs (${band})`);
}
console.log(`Total words: ${report.reduce((sum, entry) => sum + entry.words, 0)}`);

if (errors.length > 0) fail(errors);

console.log("\n\u2713 validate-writing-seo: all checks passed.");
