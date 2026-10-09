/**
 * Rendered-DOM gate for the Racira Writing (/writing) SEO block.
 *
 * Usage:
 *   node scripts/validate-writing-seo-render.mjs            # every migrated tool
 *   node scripts/validate-writing-seo-render.mjs <slug> ...  # named tools only
 *   node scripts/validate-writing-seo-render.mjs --require-full  # fail unless every live tool is migrated
 *
 * Renders the REAL components — `src/components/shared/SeoContent.tsx` and
 * `src/domains/writing/components/related-tools.tsx` — to static markup with
 * react-dom/server (no build, no dev server, no browser) and asserts the
 * rendered output, not the data:
 *
 *   1. the FAQ accordion starts fully collapsed — exactly 5
 *      `aria-expanded="false"`, zero `aria-expanded="true"`, and zero answer
 *      nodes in the initial markup;
 *   2. exactly 4 related-tool links, every target a live writing slug, never the
 *      current tool (curated picks once a batch lands, similarity-ranked
 *      same-category fallback until then);
 *   3. zero `<strong>/<b>/<em>/<mark>/<i>` and zero `**` anywhere in the
 *      rendered SEO body copy (bold lives only on headings + the FAQ question);
 *   4. the Privacy & Security section is present and byte-identical to the
 *      shared `PRIVACY_SECURITY_BLOCK`;
 *   5. the rendered "What is …?" body sits in the 500-1000 word band;
 *   6. section 4 uses the repo-wide locked heading
 *      "When to use … vs related tools", with no unresolved link syntax.
 *
 * The tool list is derived from the JSON sources under
 * `src/domains/writing/registry/seo/source/`, so a new batch is covered
 * automatically. During the legacy-to-JSON migration there may be no sources
 * yet: the gate then reports nothing to check and exits 0, so prebuild stays
 * green; `--require-full` (used at closeout) instead demands that every live
 * tool has been migrated.
 *
 * Wired into `prebuild` and into .husky/pre-push, so a regression cannot ship.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const ROOT = process.cwd();
const nodeRequire = createRequire(import.meta.url);

const MIN_WORDS = 500;
const MAX_WORDS = 1000;
const FAQ_COUNT = 5;
const RELATED_COUNT = 4;
const SOURCE_DIR = path.join(ROOT, "src", "domains", "writing", "registry", "seo", "source");

// ── Minimal TS/TSX → CJS loader with `@/` aliases and two browser stubs ───────
const moduleCache = new Map();

/** `next/link` + `lucide-react` are the only import-time browser deps. */
const LinkStub = ({ href, children, ...rest }) =>
  React.createElement("a", { href, ...rest }, children);
const IconStub = (props) => React.createElement("svg", props);
const STUBS = {
  "next/link": { __esModule: true, default: LinkStub },
  "lucide-react": new Proxy(
    { __esModule: true },
    { get: (target, prop) => (prop in target ? target[prop] : IconStub) },
  ),
};

const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];

function resolveModule(fromDir, spec) {
  const base = spec.startsWith("@/") ? path.join(ROOT, "src", spec.slice(2)) : path.resolve(fromDir, spec);
  for (const ext of EXTS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`cannot resolve "${spec}" from ${path.relative(ROOT, fromDir)}`);
}

function loadModule(file) {
  const full = path.resolve(file);
  if (moduleCache.has(full)) return moduleCache.get(full).exports;

  const source = fs.readFileSync(full, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: full,
  });

  const mod = { exports: {} };
  moduleCache.set(full, mod);

  const requireShim = (id) => {
    if (STUBS[id]) return STUBS[id];
    if (id.startsWith(".") || id.startsWith("@/")) return loadModule(resolveModule(path.dirname(full), id));
    return nodeRequire(id);
  };

  new Function("exports", "require", "module", outputText)(mod.exports, requireShim, mod);
  return mod.exports;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || [];

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const stripTags = (s) => decodeEntities(s.replace(/<[^>]*>/g, " "));

const count = (haystack, re) => (haystack.match(re) || []).length;

const failures = [];
const rows = [];
const fail = (slug, msg) => failures.push(`${slug}: ${msg}`);

const requireFull = process.argv.includes("--require-full");

// ── Load the registry, the SEO entries, and the components ────────────────────
const registry = loadModule(path.join(ROOT, "src", "domains", "writing", "registry.ts"));
const toolSeo = loadModule(path.join(ROOT, "src", "domains", "writing", "registry", "tool-seo.ts"));
const sharedTypes = loadModule(path.join(ROOT, "src", "components", "shared", "seo-types.ts"));
const SeoContent = loadModule(path.join(ROOT, "src", "components", "shared", "SeoContent.tsx")).default;
const { RelatedTools } = loadModule(
  path.join(ROOT, "src", "domains", "writing", "components", "related-tools.tsx"),
);

const PRIVACY = sharedTypes.PRIVACY_SECURITY_BLOCK;
const liveTools = registry.allTools.filter((t) => t.status === "live");
const liveSlugs = new Set(liveTools.map((t) => t.slug));

// Authored slugs come from the JSON sources, so new batches are picked up with
// no edit here.
const authoredSlugs = fs.existsSync(SOURCE_DIR)
  ? fs
      .readdirSync(SOURCE_DIR)
      .filter((f) => f.toLowerCase().endsWith(".json"))
      .sort()
      .flatMap((f) => JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, f), "utf8")).map((t) => t.slug))
  : [];

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const slugs = only.length ? only : authoredSlugs;

if (slugs.length === 0) {
  if (requireFull) {
    console.error(
      `\n\u2717 validate-writing-seo-render: --require-full but no JSON sources found in ${path.relative(ROOT, SOURCE_DIR)} — 0/${liveSlugs.size} live tools migrated.`,
    );
    process.exit(1);
  }
  console.log(
    `\u2713 validate-writing-seo-render: no JSON sources yet — nothing to check (${liveSlugs.size} live tools pending migration)`,
  );
  process.exit(0);
}

for (const slug of slugs) {
  const tool = liveTools.find((t) => t.slug === slug);
  const seo = toolSeo.getToolSeo(slug);
  if (!tool) {
    fail(slug, "not a live registry slug");
    continue;
  }
  if (!seo) {
    fail(slug, "no authored SEO entry (run the batch generator)");
    continue;
  }

  const seoHtml = renderToStaticMarkup(
    React.createElement(SeoContent, { seo, toolName: tool.name, basePath: "/writing" }),
  );
  const relatedHtml = renderToStaticMarkup(
    React.createElement(RelatedTools, { currentSlug: slug, category: tool.category }),
  );

  // 1. FAQ accordion collapsed on initial render.
  const collapsed = count(seoHtml, /aria-expanded="false"/g);
  const expanded = count(seoHtml, /aria-expanded="true"/g);
  const answerNodes = count(seoHtml, /leading-relaxed/g);
  if (collapsed !== FAQ_COUNT) fail(slug, `expected ${FAQ_COUNT} collapsed FAQ buttons, found ${collapsed}`);
  if (expanded !== 0) fail(slug, `${expanded} FAQ item(s) render expanded on load`);
  if (answerNodes !== 0) fail(slug, `${answerNodes} FAQ answer node(s) render before interaction`);

  // 2. Related row — exactly 4 live, non-self picks.
  const relatedLinks = [...relatedHtml.matchAll(/href="\/writing\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  if (!/data-related-tools="writing"/.test(relatedHtml)) fail(slug, "related-tools row missing");
  if (relatedLinks.length !== RELATED_COUNT) {
    fail(slug, `expected ${RELATED_COUNT} related links, found ${relatedLinks.length}`);
  }
  if (new Set(relatedLinks).size !== relatedLinks.length) fail(slug, "related picks contain duplicates");
  for (const target of relatedLinks) {
    if (!liveSlugs.has(target)) fail(slug, `related pick "${target}" is not a live writing slug`);
    if (target === slug) fail(slug, "related row links to itself");
  }

  // 3. No emphasis markup anywhere in body copy.
  for (const [label, html] of [["seo", seoHtml], ["related", relatedHtml]]) {
    const emphasisTag = count(html, /<(strong|b|em|mark|i)[\s>/]/gi);
    const stars = count(html, /\*\*/g);
    if (emphasisTag > 0) fail(slug, `${emphasisTag} emphasis tag(s) in rendered ${label} markup`);
    if (stars > 0) fail(slug, `${stars} ** marker(s) in rendered ${label} markup`);
  }

  // 4. Privacy & Security present, verbatim.
  const seoText = stripTags(seoHtml);
  if (!/<h2[^>]*>\s*Privacy &amp; Security\s*<\/h2>/.test(seoHtml)) {
    fail(slug, "Privacy & Security heading missing");
  }
  if (!seoText.includes(PRIVACY)) fail(slug, "Privacy & Security text is not the verbatim shared block");

  // 5. Rendered content word band — the copy between "What is …?" and "How to use …".
  const whatIdx = seoHtml.indexOf("<h2>What is");
  const howIdx = seoHtml.indexOf("<h2>How to use");
  if (whatIdx < 0 || howIdx < 0 || howIdx <= whatIdx) {
    fail(slug, "could not locate the What is / How to use content band in the rendered markup");
  } else {
    const whatClose = seoHtml.indexOf("</h2>", whatIdx);
    const body = seoHtml.slice(whatClose + "</h2>".length, howIdx);
    const bodyWords = words(stripTags(body)).length;
    if (bodyWords < MIN_WORDS) fail(slug, `rendered content is ${bodyWords} words (min ${MIN_WORDS})`);
    if (bodyWords > MAX_WORDS) fail(slug, `rendered content is ${bodyWords} words (max ${MAX_WORDS})`);
    rows.push({ slug, words: bodyWords, faqs: collapsed, related: relatedLinks.length });
  }

  // 6. Locked section-4 heading, and no unresolved link syntax.
  if (!seoText.includes(`When to use ${tool.name} vs related tools`)) {
    fail(slug, "section 4 is not using the locked heading 'When to use … vs related tools'");
  }
  if (/\{\{[^|{}]+\|[^{}]+\}\}/.test(seoText)) {
    fail(slug, "unresolved {{slug|display}} link syntax in rendered markup");
  }
}

if (requireFull) {
  const migrated = new Set(authoredSlugs);
  const missing = [...liveSlugs].filter((s) => !migrated.has(s));
  if (missing.length > 0) {
    fail(
      "coverage",
      `--require-full but ${missing.length} live tool(s) have no JSON source (first: ${missing.slice(0, 8).join(", ")})`,
    );
  }
}

if (failures.length) {
  console.error(`\n\u2717 validate-writing-seo-render failed with ${failures.length} problem(s):`);
  for (const f of failures) console.error(`   - ${f}`);
  console.error("");
  process.exit(1);
}

console.log(`\u2713 validate-writing-seo-render: ${rows.length} authored tool(s) render correctly`);
for (const r of rows) {
  console.log(
    `   ${r.slug.padEnd(34)} ${String(r.words).padStart(4)} words  ${r.faqs} collapsed faq  ${r.related} related`,
  );
}
