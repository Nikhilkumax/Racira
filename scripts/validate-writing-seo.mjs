/**
 * Build-time gate for Racira Writing (/writing) SEO content.
 *
 * Loads the domain SEO registry straight from TypeScript (via the installed
 * `typescript` compiler API — no separate build step, no Playwright, no dev
 * server) and fails the build when the content contract is broken.
 *
 * Migration-aware gating
 * ----------------------
 * The domain is moving from legacy TS-authored entries to JSON-sourced entries
 * through scripts/writing-json-to-seo.mjs + scripts/apply-writing-seo-batch.mjs.
 * While both formats coexist:
 *
 *   - every entry, legacy or JSON-sourced, is checked for the base contract
 *     (live slug, 500-1000 word band, verbatim keywords, unique FAQs across the
 *     domain, sibling links, similarity ceiling, no emphasis markup);
 *   - JSON-sourced entries ("migrated") additionally obey the locked structure
 *     gate: exactly 5 FAQs, 3-4 howTo steps, and at least two bullet blocks
 *     (named modes/options and verified limitations);
 *   - legacy entries report their pending strict gaps as warnings, not errors,
 *     so the build stays green until every tool has a JSON source.
 *
 * `--require-full` (used at closeout) turns the migration itself into a gate:
 * every live tool must have a JSON source, and no strict gap may remain.
 *
 * Base contract:
 *   1. every slug with authored content is a live tool in the writing registry;
 *   2. every live tool has authored content (a live page with no body copy is a
 *      thin page, and a live flag must not outrun its SEO);
 *   3. `seo.content` sits in the 500-1000 word band (both ends enforced);
 *   4. every keyword appears verbatim in `seo.content`;
 *   5. migrated: exactly 5 FAQs; legacy: 4-6; unique across the whole domain;
 *   6. `whenToUse` links at least two live sibling tools, never itself, and
 *      never a slug that is not live;
 *   7. `howTo`, when present, has 3-4 steps (migrated) / at least 3 (legacy);
 *   8. no two tools share more than 90% of their vocabulary;
 *   9. content carries no emphasis markers and no `{{slug|display}}` syntax
 *      outside `whenToUse`.
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
const JSON_SOURCE_DIR = path.join(ROOT, "src", "domains", "writing", "registry", "seo", "source");

const MIN_WORDS = 500;
const MAX_WORDS = 1000;
const MAX_SIMILARITY = 0.9;
const MIN_FAQS = 4;
const MAX_FAQS = 6;
const STRICT_FAQ_COUNT = 5;
const MIN_TOOL_LINKS = 2;
const MIN_HOWTO_STEPS = 3;
const MAX_HOWTO_STEPS = 4;
const MIN_BULLET_BLOCKS = 2;

const TOOL_LINK = /\{\{([^|{}]+)\|([^{}]+)\}\}/g;
const EMPHASIS = /\*\*|<\s*\/?\s*(?:strong|b|em|mark|i)\b/i;

const requireFull = process.argv.includes("--require-full");

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
const wordsOf = (text) => text.toLowerCase().match(/[\p{L}][\p{L}\p{N}'\u2019-]*/gu) || [];
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

/** Slugs with a JSON source — the entries that must already obey the locked structure. */
function readMigratedSlugs(dir) {
  const migrated = new Set();
  if (!fs.existsSync(dir)) return migrated;
  for (const file of fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"))) {
    const batch = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    for (const tool of batch) if (tool?.slug) migrated.add(tool.slug);
  }
  return migrated;
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
const migratedSlugs = readMigratedSlugs(JSON_SOURCE_DIR);

if (liveSlugs.size === 0) {
  fail([`parsed no live slugs out of ${path.relative(ROOT, DOMAIN_REGISTRY)}`]);
}

const errors = [];
const warnings = [];
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
  if (migratedSlugs.has(slug) && !SEO_SLUGS.includes(slug)) {
    errors.push(`JSON source exists for "${slug}", which has no authored SEO entry.`);
  }
}
for (const slug of migratedSlugs) {
  if (!liveSlugs.has(slug)) errors.push(`JSON source exists for "${slug}", which is not a live tool.`);
}

// ── Per tool ──────────────────────────────────────────────────────────────────
const faqTexts = new Map(); // faq text -> slug
const contents = [];

for (const slug of SEO_SLUGS) {
  const seo = getToolSeo(slug);
  const label = `${slug}:`;
  const migrated = migratedSlugs.has(slug);

  if (!seo || typeof seo !== "object") {
    errors.push(`${label} entry is not an object.`);
    continue;
  }
  if (!seo.content || typeof seo.content !== "string") {
    errors.push(`${label} missing content.`);
    continue;
  }

  const count = wordCount(seo.content);
  report.push({ slug, words: count, faqs: seo.faqs?.length ?? 0, steps: seo.howTo?.length ?? 0, migrated });
  if (count < MIN_WORDS || count > MAX_WORDS) {
    errors.push(`${label} content is ${count} words; the band is ${MIN_WORDS}-${MAX_WORDS}.`);
  }

  // ── markup hygiene: no emphasis, no link syntax outside whenToUse ──────────
  const bodyFields = [
    ["intro", seo.intro],
    ["content", seo.content],
    ...(seo.howTo || []).map((step, i) => [`howTo[${i}]`, step?.step]),
    ...(seo.faqs || []).flatMap((faq, i) => [[`faqs[${i}].q`, faq?.q], [`faqs[${i}].a`, faq?.a]]),
  ];
  for (const [field, value] of bodyFields) {
    if (typeof value !== "string") continue;
    if (EMPHASIS.test(value)) {
      errors.push(`${label} ${field} contains emphasis markup (** or a <strong>/<b>/<em>/<mark> tag).`);
    }
    if (/\{\{[^|{}]+\|[^{}]+\}\}/.test(value)) {
      // A real sibling link outside whenToUse renders literally on the page;
      // plain `{{placeholder}}` template syntax is legitimate documentation.
      if (migrated) {
        errors.push(`${label} ${field} contains {{slug|display}} link syntax, which only renders in whenToUse.`);
      } else {
        warnings.push(
          `${slug}: ${field} contains unresolved {{slug|display}} link syntax (renders literally) — fix in its JSON batch`,
        );
      }
    }
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

  // ── FAQs: strict 5 for migrated, 4-6 legacy, unique across the domain ──────
  const faqs = Array.isArray(seo.faqs) ? seo.faqs : [];
  if (migrated) {
    if (faqs.length !== STRICT_FAQ_COUNT) {
      errors.push(`${label} has ${faqs.length} FAQs; the locked spec is exactly ${STRICT_FAQ_COUNT}.`);
    }
  } else if (faqs.length < MIN_FAQS || faqs.length > MAX_FAQS) {
    errors.push(`${label} has ${faqs.length} FAQs; the band is ${MIN_FAQS}-${MAX_FAQS}.`);
  } else if (faqs.length !== STRICT_FAQ_COUNT) {
    warnings.push(
      `${slug}: ${faqs.length} FAQs (locked spec: ${STRICT_FAQ_COUNT}) — pending JSON migration`,
    );
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

  // ── howTo: strict 3-4 for migrated, >=3 legacy ─────────────────────────────
  if (seo.howTo) {
    if (!Array.isArray(seo.howTo) || seo.howTo.length < MIN_HOWTO_STEPS) {
      errors.push(`${label} howTo has fewer than ${MIN_HOWTO_STEPS} steps.`);
    } else if (seo.howTo.some((step) => !step?.step)) {
      errors.push(`${label} howTo contains an empty step.`);
    } else if (migrated && seo.howTo.length > MAX_HOWTO_STEPS) {
      errors.push(
        `${label} howTo has ${seo.howTo.length} steps; the locked spec is ${MIN_HOWTO_STEPS}-${MAX_HOWTO_STEPS}.`,
      );
    } else if (!migrated && seo.howTo.length > MAX_HOWTO_STEPS) {
      warnings.push(
        `${slug}: ${seo.howTo.length} howTo steps (locked spec: ${MIN_HOWTO_STEPS}-${MAX_HOWTO_STEPS}) — pending JSON migration`,
      );
    }
  }

  // ── migrated-only structure: two bullet blocks, each with real items ───────
  if (migrated) {
    const bulletBlocks = seo.content.split(/\n{2,}/).filter((block) => /^[-•]\s/m.test(block));
    if (bulletBlocks.length < MIN_BULLET_BLOCKS) {
      errors.push(
        `${label} content has ${bulletBlocks.length} bullet block(s); the locked spec needs at least ` +
          `${MIN_BULLET_BLOCKS} (named modes/options and verified limitations).`,
      );
    }
    for (const block of seo.content.split(/\n{2,}/)) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lines.some((l) => /^[-•]\s/.test(l))) continue;
      if (!lines.every((l) => /^[-•]\s/.test(l))) {
        errors.push(`${label} a bullet block mixes bullets and paragraph lines.`);
      }
      if (lines.length < 2) errors.push(`${label} a bullet list has fewer than 2 items.`);
    }
  } else if (seo.content.split(/\n{2,}/).filter((block) => /^[-•]\s/m.test(block)).length === 0) {
    warnings.push(`${slug}: no bullet blocks in content (locked spec: 2) — pending JSON migration`);
  }

  // ── sibling links ─────────────────────────────────────────────────────────
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

// ── Migration coverage ────────────────────────────────────────────────────────
const migratedCount = SEO_SLUGS.filter((slug) => migratedSlugs.has(slug)).length;
const legacy = SEO_SLUGS.filter((slug) => !migratedSlugs.has(slug));
if (requireFull) {
  const pending = [...liveSlugs.keys()].filter((slug) => !migratedSlugs.has(slug));
  if (pending.length > 0) {
    errors.push(
      `--require-full: ${pending.length} live tool(s) still have no JSON source (first: ${pending.slice(0, 8).join(", ")}).`,
    );
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log("=== WRITING SEO VALIDATION ===");
console.log(`Live tools: ${liveSlugs.size} | authored SEO entries: ${SEO_SLUGS.length}`);
console.log(`JSON-migrated: ${migratedCount} | legacy entries pending migration: ${legacy.length}`);
for (const entry of report.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const band = entry.words >= MIN_WORDS && entry.words <= MAX_WORDS ? "ok" : "OUT OF BAND";
  const tag = entry.migrated ? "strict" : "legacy";
  console.log(
    `  ${entry.slug}: ${entry.words} words, ${entry.faqs} FAQs, ${entry.steps} steps (${band}, ${tag})`,
  );
}
console.log(`Total words: ${report.reduce((sum, entry) => sum + entry.words, 0)}`);

if (warnings.length > 0) {
  console.log(`\nPending migration (${warnings.length}):`);
  for (const warning of warnings.slice(0, 12)) console.log(`  - ${warning}`);
  if (warnings.length > 12) console.log(`  ... and ${warnings.length - 12} more`);
}

if (errors.length > 0) fail(errors);

console.log("\n\u2713 validate-writing-seo: all checks passed.");
