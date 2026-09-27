/**
 * Build-time gate for colors-domain SEO content.
 *
 * Loads the authored content module straight from TypeScript (via the installed
 * `typescript` compiler API — no separate build step, no Playwright, no dev
 * server) and fails the build if any authored tool breaks the content contract:
 *
 *   1. every authored slug is a live tool in the colors registry;
 *   2. seo.content sits in the 500-1000 word band (both ends enforced);
 *   3. every keyword appears verbatim in seo.content;
 *   4. 4-6 unique FAQs per tool, all non-empty;
 *   5. no two tools have identical or >90%-similar content.
 *
 * Wired into `prebuild` in package.json.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const SEO_DIR = path.join(ROOT, "src", "domains", "colors", "seo");
const REGISTRY = path.join(ROOT, "src", "domains", "colors", "registry.ts");

const MIN_WORDS = 500;
const MAX_WORDS = 1000;
const MAX_SIMILARITY = 0.9;

// ── Minimal TS→CJS loader for the seo/ folder (relative imports only) ──────────
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
      // Type-only imports are erased by transpile; anything else here is a bug.
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
const words = (s) => (s.toLowerCase().match(/[a-z0-9]+/g) || []);
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

function jaccard(a, b) {
  const sa = new Set(words(a));
  const sb = new Set(words(b));
  if (sa.size === 0 && sb.size === 0) return 1;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 1 : inter / union;
}

function fail(msg) {
  console.error(`\n\u2717 validate-color-seo: ${msg}`);
  process.exit(1);
}

// ── Load content + registry ───────────────────────────────────────────────────
const contentModule = loadTsModule(path.join(SEO_DIR, "content.ts"));
const CONTENT = contentModule.COLOR_SEO_CONTENT;
if (!CONTENT || typeof CONTENT !== "object") fail("COLOR_SEO_CONTENT did not load.");

const registryText = fs.readFileSync(REGISTRY, "utf8");
const liveSlugs = new Set(
  [...registryText.matchAll(/slug:\s*"([^"]+)"[^}]*status:\s*"live"/g)].map((m) => m[1]),
);

const slugs = Object.keys(CONTENT);
if (slugs.length === 0) fail("No authored SEO content found.");

const errors = [];

// 1 + 2 + 3 + 4 — per tool
for (const slug of slugs) {
  const seo = CONTENT[slug];
  if (!liveSlugs.has(slug)) errors.push(`${slug}: not a live registry slug (orphaned SEO entry).`);

  const content = seo.content || "";
  const count = words(content).length;
  if (count < MIN_WORDS) errors.push(`${slug}: content is ${count} words (min ${MIN_WORDS}).`);
  if (count > MAX_WORDS) errors.push(`${slug}: content is ${count} words (max ${MAX_WORDS}).`);

  // Guard against over-escaped paragraph separators. A content string written as
  // "\\n\\n" instead of "\n\n" renders as a literal backslash-n in the page and
  // silently collapses the whole body into one paragraph.
  if (content.includes("\\")) {
    errors.push(`${slug}: content contains a literal backslash character (over-escaped string).`);
  }
  const breaks = content.split("\n\n").length - 1;
  if (breaks < 2) errors.push(`${slug}: content has ${breaks} paragraph breaks (expected at least 2).`);

  for (const kw of seo.keywords || []) {
    if (!norm(content).includes(norm(kw))) errors.push(`${slug}: keyword not in content: "${kw}".`);
  }

  const faqs = seo.faqs || [];
  if (faqs.length < 4 || faqs.length > 6) {
    errors.push(`${slug}: has ${faqs.length} FAQs (expected 4-6).`);
  }
  const seen = new Set();
  for (const f of faqs) {
    if (!f.q || !f.a) errors.push(`${slug}: empty FAQ question or answer.`);
    const k = norm(f.q || "");
    if (seen.has(k)) errors.push(`${slug}: duplicate FAQ question "${f.q}".`);
    seen.add(k);
  }

  if (!seo.intro || !seo.intro.trim()) errors.push(`${slug}: missing intro.`);
}

// 5 — near-duplicate content
for (let i = 0; i < slugs.length; i++) {
  for (let j = i + 1; j < slugs.length; j++) {
    const sim = jaccard(CONTENT[slugs[i]].content, CONTENT[slugs[j]].content);
    if (sim >= MAX_SIMILARITY) {
      errors.push(`${slugs[i]} and ${slugs[j]}: content similarity ${(sim * 100).toFixed(1)}% (max 90%).`);
    }
  }
}

if (process.argv.includes("--report")) {
  const rows = slugs.map((s) => ({
    slug: s,
    words: words(CONTENT[s].content).length,
    keywords: CONTENT[s].keywords.length,
    faqs: (CONTENT[s].faqs || []).length,
    howTo: (CONTENT[s].howTo || []).length,
  }));
  console.log(`\n${rows.length} authored tools:`);
  for (const r of rows) {
    console.log(
      `  ${r.slug.padEnd(34)} ${String(r.words).padStart(4)} words  ` +
        `${r.keywords} kw  ${r.faqs} faq  ${r.howTo} howto`,
    );
  }
}

if (errors.length) {
  console.error(`\n\u2717 validate-color-seo failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`   - ${e}`);
  console.error("");
  process.exit(1);
}

const counts = slugs.map((s) => words(CONTENT[s].content).length).sort((a, b) => a - b);
console.log(
  `\u2713 validate-color-seo: ${slugs.length} authored tools OK ` +
    `(words ${counts[0]}-${counts[counts.length - 1]}, band ${MIN_WORDS}-${MAX_WORDS}, keywords present, no >90% duplicates).`,
);
