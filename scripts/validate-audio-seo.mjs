/**
 * Build-time gate for Racira Audio (/audio) SEO content.
 *
 * Loads the domain SEO registry straight from TypeScript (via the installed
 * `typescript` compiler API — no separate build step, no Playwright, no dev
 * server) and fails the build if any rendered entry breaks the content
 * contract:
 *
 *   1. every rendered slug is a live tool in the audio registry;
 *   2. seo.content sits in the 500-1000 word band (both ends enforced);
 *   3. every keyword appears verbatim in seo.content;
 *   4. exactly 5 unique FAQs per tool, all non-empty;
 *   5. whenToUse links at least two live sibling tools, never itself, and never
 *      a slug that is not live;
 *   6. no two tools have identical or >=90%-similar content.
 *
 * Wired into `prebuild` in package.json, so a hand-edited generated module or a
 * drifted JSON source cannot reach a build.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const REGISTRY_FILE = path.join(ROOT, "src", "domains", "audio", "registry", "tool-seo.ts");
const DOMAIN_REGISTRY = path.join(ROOT, "src", "domains", "audio", "registry.ts");

const MIN_WORDS = 500;
const MAX_WORDS = 1000;
const MAX_SIMILARITY = 0.9;
const FAQ_COUNT = 5;
const MIN_TOOL_LINKS = 2;

const TOOL_LINK = /\{\{([^|{}]+)\|([^{}]+)\}\}/g;

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
const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || [];
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
  console.error(`\n\u2717 validate-audio-seo: ${msg}`);
  process.exit(1);
}

/**
 * Live slugs from the audio registry. One-line entries carry `slug` and
 * `status` on the same line; multi-line entries put `slug:` then `status:` on
 * their own lines, `status` always last — so a line scan is exact.
 */
function readLiveSlugs(registryPath) {
  const text = fs.readFileSync(registryPath, "utf8");
  const live = new Set();
  let pendingSlug = null;
  for (const line of text.split(/\r?\n/)) {
    const oneLine = line.match(/\{\s*name:\s*"[^"]*",\s*slug:\s*"([^"]+)"[\s\S]*?status:\s*"(live|soon)"/);
    if (oneLine) {
      if (oneLine[2] === "live") live.add(oneLine[1]);
      pendingSlug = null;
      continue;
    }
    const slug = line.match(/^\s+slug:\s*"([^"]+)",\s*$/);
    if (slug) {
      pendingSlug = slug[1];
      continue;
    }
    const status = line.match(/^\s+status:\s*"(live|soon)",\s*$/);
    if (status && pendingSlug) {
      if (status[1] === "live") live.add(pendingSlug);
      pendingSlug = null;
    }
  }
  return live;
}

// ── Load content + registry ───────────────────────────────────────────────────
const seoModule = loadTsModule(REGISTRY_FILE);
const getToolSeo = seoModule.getToolSeo;
const LOCKED_SEO_SLUGS = seoModule.LOCKED_SEO_SLUGS || [];
if (typeof getToolSeo !== "function") fail("tool-seo.ts did not export getToolSeo.");
if (LOCKED_SEO_SLUGS.length === 0) fail("No SEO entries found in the audio registry.");

const liveSlugs = readLiveSlugs(DOMAIN_REGISTRY);
if (liveSlugs.size === 0) fail(`parsed no live slugs out of ${path.relative(ROOT, DOMAIN_REGISTRY)}`);

const errors = [];

// ── per rendered tool ─────────────────────────────────────────────────────────
for (const slug of LOCKED_SEO_SLUGS) {
  const seo = getToolSeo(slug);
  if (!seo) continue; // defensive: LOCKED_SEO_SLUGS is derived from the same map
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
  if (faqs.length !== FAQ_COUNT) {
    errors.push(`${slug}: has ${faqs.length} FAQs (expected exactly ${FAQ_COUNT}).`);
  }
  const seen = new Set();
  for (const f of faqs) {
    if (!f.q || !f.a) errors.push(`${slug}: empty FAQ question or answer.`);
    const k = norm(f.q || "");
    if (seen.has(k)) errors.push(`${slug}: duplicate FAQ question "${f.q}".`);
    seen.add(k);
  }

  if (!seo.intro || !seo.intro.trim()) errors.push(`${slug}: missing intro.`);

  // Sibling links must resolve to live tools and never to the page itself.
  const whenToUse = seo.whenToUse || "";
  const links = [...whenToUse.matchAll(TOOL_LINK)];
  if (!whenToUse.trim()) errors.push(`${slug}: missing whenToUse.`);
  if (links.length < MIN_TOOL_LINKS) {
    errors.push(`${slug}: whenToUse has ${links.length} sibling link(s) (min ${MIN_TOOL_LINKS}).`);
  }
  for (const [, linkSlug] of links) {
    const target = linkSlug.trim();
    if (!liveSlugs.has(target)) errors.push(`${slug}: whenToUse links "${target}", which is not live.`);
    if (target === slug) errors.push(`${slug}: whenToUse links itself.`);
  }
}

// ── near-duplicate content across every rendered tool ─────────────────────────
for (let i = 0; i < LOCKED_SEO_SLUGS.length; i++) {
  for (let j = i + 1; j < LOCKED_SEO_SLUGS.length; j++) {
    const a = getToolSeo(LOCKED_SEO_SLUGS[i]);
    const b = getToolSeo(LOCKED_SEO_SLUGS[j]);
    if (!a || !b) continue;
    const sim = jaccard(a.content, b.content);
    if (sim >= MAX_SIMILARITY) {
      errors.push(
        `${LOCKED_SEO_SLUGS[i]} and ${LOCKED_SEO_SLUGS[j]}: content similarity ${(sim * 100).toFixed(1)}% (max 90%).`,
      );
    }
  }
}

if (process.argv.includes("--report")) {
  const rows = LOCKED_SEO_SLUGS.map((slug) => {
    const seo = getToolSeo(slug) || {};
    return {
      slug,
      words: words(seo.content || "").length,
      keywords: (seo.keywords || []).length,
      faqs: (seo.faqs || []).length,
      howTo: (seo.howTo || []).length,
    };
  });
  console.log(`\n${rows.length} rendered tool(s):`);
  for (const r of rows) {
    console.log(
      `  ${r.slug.padEnd(34)} ${String(r.words).padStart(4)} words  ` +
        `${r.keywords} kw  ${r.faqs} faq  ${r.howTo} howto`,
    );
  }
}

if (errors.length) {
  console.error(`\n\u2717 validate-audio-seo failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`   - ${e}`);
  console.error("");
  process.exit(1);
}

const counts = LOCKED_SEO_SLUGS.map((s) => words((getToolSeo(s) || {}).content || "").length).sort(
  (a, b) => a - b,
);
console.log(
  `\u2713 validate-audio-seo: ${LOCKED_SEO_SLUGS.length} authored entry(ies) render ` +
    (counts.length
      ? `(words ${counts[0]}-${counts[counts.length - 1]}, band ${MIN_WORDS}-${MAX_WORDS}, keywords present, no >=90% duplicates).`
      : "(none yet)."),
);
