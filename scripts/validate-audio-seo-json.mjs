/**
 * Schema + structure gate for Racira Audio (/audio) SEO JSON source batches.
 *
 * Usage:
 *   node scripts/validate-audio-seo-json.mjs                 # every source file
 *   node scripts/validate-audio-seo-json.mjs <batch.json>    # one file
 *
 * With no argument (or `--all`) it validates every `*.json` under
 * `src/domains/audio/seo/source/` as one combined set, so cross-file duplicate
 * slugs and cross-file similarity are caught too. It runs in `prebuild`
 * alongside scripts/validate-audio-seo.mjs, so a future batch cannot skip schema
 * validation.
 *
 * The JSON source format (one array of tool objects) mirrors the locked flat
 * `ToolSeo` shape rendered by `src/components/shared/SeoContent.tsx`:
 *   { slug, keywords[], intro, content, howTo[] (string steps),
 *     whenToUse, faqs[{ q, a }] }
 *
 * Checks, in order:
 *   - valid JSON array, required fields present, no unknown keys
 *   - slug is a LIVE audio-registry slug, unique across every source file
 *   - NO inline emphasis markup anywhere (** , <strong>/<b>/<em>/<mark>) —
 *     body copy must be plain prose (bold lives only on headings/FAQ questions)
 *   - `{{slug|display text}}` links are well formed, appear ONLY in `whenToUse`,
 *     resolve to a LIVE registry slug, are not self-referential, never carry
 *     markup in the label, and name at least two different sibling tools
 *   - FAQ items are flat { q, a } objects — no nested keys, and no legacy
 *     `sections` / `privacy` keys (the Privacy & Security block is supplied
 *     verbatim by the renderer, never authored per tool)
 *   - content sits in the 500-1000 word band (build gate parity)
 *   - content has >= 2 blank-line paragraph breaks, no literal backslash
 *   - at least two bullet blocks (the named modes/options list and the verified
 *     limitations list), each well formed with >= 2 items
 *   - every keyword appears verbatim in content; 3-5 keywords
 *   - exactly 5 FAQs, questions unique across the whole set, answers non-empty
 *   - 3-4 howTo steps, all non-empty; intro is 1-2 sentences
 *   - no pair of tools is >=90% similar on content
 *
 * Exits non-zero on any error so it can gate a batch before generation.
 */
import fs from "node:fs";
import path from "node:path";

const MIN_WORDS = 500;
const MAX_WORDS = 1000;
const MAX_SIMILARITY = 0.9;
const FAQ_COUNT = 5;
const MIN_TOOL_LINKS = 2;
const MIN_BULLET_BLOCKS = 2;
const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 5;
const SOURCE_DIR = path.join("src", "domains", "audio", "seo", "source");
const REGISTRY = path.join("src", "domains", "audio", "registry.ts");

/** Inline sibling-tool link: `{{slug|display text}}`. */
const TOOL_LINK = /\{\{([^|{}]+)\|([^{}]+)\}\}/g;

const ALLOWED_KEYS = ["slug", "keywords", "intro", "content", "howTo", "whenToUse", "faqs"];
const FORBIDDEN_KEYS = ["sections", "subHeading", "privacy", "items", "text"];

const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || [];
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
const EMPHASIS = /\*\*|<\s*\/?\s*(?:strong|b|em|mark|i)\b/i;

const fail = (msg) => {
  console.error(`\n\u2717 validate-audio-seo-json: ${msg}`);
  process.exit(1);
};

/**
 * Live slugs from the audio registry. Entries are either one-liners
 * (`{ name, slug, description, icon, status }`) or multi-line objects whose
 * `slug:` and `status:` sit on their own lines, with `status` always the last
 * of the two — so a line scan that remembers the pending slug is exact.
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

// ── Which sources to check ────────────────────────────────────────────────────
const arg = process.argv[2];
let files;
if (arg && arg !== "--all") {
  if (!fs.existsSync(arg)) fail(`no such file: ${arg}`);
  files = [arg];
} else {
  if (!fs.existsSync(SOURCE_DIR)) fail(`missing source directory: ${SOURCE_DIR}`);
  files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort()
    .map((f) => path.join(SOURCE_DIR, f));
  if (files.length === 0) fail(`no *.json sources found in ${SOURCE_DIR}`);
}

const liveSlugs = readLiveSlugs(REGISTRY);
if (liveSlugs.size === 0) fail(`parsed no live slugs out of ${REGISTRY}`);

const errors = [];
const report = [];
const seenSlug = new Map();
const seenQuestion = new Map();
const allTools = [];

for (const file of files) {
  let batch;
  try {
    batch = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    fail(`${file}: invalid JSON — ${e.message}`);
  }
  if (!Array.isArray(batch) || batch.length === 0) {
    fail(`${file}: batch must be a non-empty array of tools.`);
  }
  for (const tool of batch) allTools.push({ file, tool });
}

for (const { file, tool } of allTools) {
  const where = file;
  if (!tool || typeof tool !== "object") {
    errors.push(`${where}: batch entry is not an object`);
    continue;
  }
  const slug = tool.slug;
  if (!slug) {
    errors.push(`${where}: entry missing slug`);
    continue;
  }
  if (seenSlug.has(slug)) {
    errors.push(`${slug}: duplicate slug (also in ${seenSlug.get(slug)})`);
  }
  seenSlug.set(slug, where);
  if (!liveSlugs.has(slug)) errors.push(`${slug}: not a live registry slug`);

  for (const f of ["keywords", "intro", "content", "howTo", "whenToUse", "faqs"]) {
    if (tool[f] === undefined) errors.push(`${slug}: missing "${f}"`);
  }

  // ── no legacy/unknown keys ────────────────────────────────────────────────
  for (const key of Object.keys(tool)) {
    if (FORBIDDEN_KEYS.includes(key)) {
      errors.push(
        `${slug}: legacy key "${key}" — this domain authors the flat shape only ` +
          `(privacy comes from the renderer, FAQs are flat { q, a })`,
      );
    } else if (!ALLOWED_KEYS.includes(key)) {
      errors.push(`${slug}: unexpected key "${key}"`);
    }
  }

  if (!Array.isArray(tool.keywords) || tool.keywords.length === 0) {
    errors.push(`${slug}: keywords must be a non-empty array`);
  } else if (tool.keywords.length < MIN_KEYWORDS || tool.keywords.length > MAX_KEYWORDS) {
    errors.push(
      `${slug}: keywords must be ${MIN_KEYWORDS}-${MAX_KEYWORDS} entries (got ${tool.keywords.length})`,
    );
  }
  if (!tool.intro || !tool.intro.trim()) errors.push(`${slug}: missing intro`);
  if (!tool.content || !tool.content.trim()) errors.push(`${slug}: missing content`);
  if (!tool.whenToUse || !tool.whenToUse.trim()) errors.push(`${slug}: missing whenToUse`);

  // ── no emphasis markup anywhere ────────────────────────────────────────────
  const allText = [
    tool.intro,
    tool.content,
    tool.whenToUse,
    ...(tool.keywords || []),
    ...(tool.howTo || []).map((h) => (typeof h === "string" ? h : h?.step)),
    ...(tool.faqs || []).flatMap((f) => [f?.q, f?.a]),
  ]
    .filter(Boolean)
    .join("\n");
  if (EMPHASIS.test(allText)) {
    errors.push(`${slug}: emphasis markup found (** or <strong>/<b>/<em>/<mark>) — body copy must be plain`);
  }

  // ── inline sibling-tool links ({{slug|display text}}) ──────────────────────
  // They only render inside the "vs related tools" copy, so anywhere else they
  // would show up verbatim on the page.
  const linkable = [
    ["intro", tool.intro],
    ["content", tool.content],
    ...(tool.howTo || []).map((h, i) => [`howTo[${i}]`, typeof h === "string" ? h : h?.step]),
    ...(tool.faqs || []).flatMap((f, i) => [[`faqs[${i}].q`, f?.q], [`faqs[${i}].a`, f?.a]]),
  ];
  for (const [field, value] of linkable) {
    if (typeof value === "string" && /[{}]/.test(value)) {
      errors.push(
        `${slug}: {{...}} link syntax is only rendered in whenToUse — move it out of ${field}`,
      );
    }
  }

  const whenToUse = tool.whenToUse || "";
  const links = [...whenToUse.matchAll(TOOL_LINK)];
  const stripped = whenToUse.replace(TOOL_LINK, "");
  if (/[{}]/.test(stripped)) {
    errors.push(
      `${slug}: malformed link syntax in whenToUse — every link must be a complete {{slug|display text}}`,
    );
  }
  for (const [, linkSlug, label] of links) {
    if (!label.trim()) errors.push(`${slug}: link to "${linkSlug}" has empty display text`);
    if (/\*\*|[<>]/.test(label)) {
      errors.push(`${slug}: link display text may not carry markup: "${label}"`);
    }
    if (linkSlug !== linkSlug.trim() || /\s/.test(linkSlug)) {
      errors.push(`${slug}: link slug "${linkSlug}" must be a bare slug with no spaces`);
    }
    if (!liveSlugs.has(linkSlug.trim())) {
      errors.push(`${slug}: link target "${linkSlug}" is not a live registry slug`);
    }
    if (linkSlug.trim() === slug) errors.push(`${slug}: links to itself — related tools must not be self-referential`);
  }
  if (links.length < MIN_TOOL_LINKS) {
    errors.push(
      `${slug}: whenToUse needs at least ${MIN_TOOL_LINKS} {{slug|display text}} sibling links (found ${links.length})`,
    );
  }
  if (links.length !== new Set(links.map((m) => m[1].trim())).size) {
    errors.push(`${slug}: whenToUse links the same tool more than once`);
  }

  // ── FAQ shape: flat { q, a }, no nested keys ───────────────────────────────
  const faqs = tool.faqs || [];
  if (!Array.isArray(faqs) || faqs.length !== FAQ_COUNT) {
    errors.push(`${slug}: faqs must be exactly ${FAQ_COUNT} items (got ${faqs.length})`);
  } else {
    for (const f of faqs) {
      const keys = f && typeof f === "object" ? Object.keys(f) : [];
      if (keys.some((k) => k !== "q" && k !== "a")) {
        errors.push(`${slug}: FAQ item has unexpected key(s) [${keys.join(", ")}] — must be { q, a } only`);
      }
      if (!f || !f.q || !f.a) {
        errors.push(`${slug}: empty FAQ question or answer`);
        continue;
      }
      const key = norm(f.q);
      if (seenQuestion.has(key)) {
        errors.push(`${slug}: FAQ question duplicated (also in ${seenQuestion.get(key)}): "${f.q}"`);
      } else {
        seenQuestion.set(key, slug);
      }
    }
  }

  // ── content band + structure ───────────────────────────────────────────────
  const content = tool.content || "";
  const wc = words(content).length;
  if (wc < MIN_WORDS) errors.push(`${slug}: content is ${wc} words (min ${MIN_WORDS})`);
  if (wc > MAX_WORDS) errors.push(`${slug}: content is ${wc} words (max ${MAX_WORDS})`);
  if (content.includes("\\")) errors.push(`${slug}: content contains a literal backslash`);
  const breaks = content.split("\n\n").length - 1;
  if (breaks < 2) errors.push(`${slug}: content has ${breaks} paragraph breaks (need >= 2)`);

  for (const kw of tool.keywords || []) {
    if (!norm(content).includes(norm(kw))) errors.push(`${slug}: keyword not in content: "${kw}"`);
  }

  const bulletBlocks = content.split(/\n{2,}/).filter((block) => /^[-•]\s/m.test(block));
  if (bulletBlocks.length < MIN_BULLET_BLOCKS) {
    errors.push(
      `${slug}: content has ${bulletBlocks.length} bullet block(s) — need at least ${MIN_BULLET_BLOCKS} ` +
        `(the named modes/options/formats list and the verified limitations list)`,
    );
  }
  for (const block of content.split(/\n{2,}/)) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const isList = lines.some((l) => /^[-•]\s/.test(l));
    if (!isList) continue;
    if (!lines.every((l) => /^[-•]\s/.test(l))) {
      errors.push(`${slug}: bullet block mixes bullets and paragraph lines`);
    }
    if (lines.length < 2) errors.push(`${slug}: bullet list needs at least 2 items`);
  }

  // ── howTo / intro ──────────────────────────────────────────────────────────
  const steps = (tool.howTo || []).map((h) => (typeof h === "string" ? h : h?.step));
  if (steps.length < 3 || steps.length > 4) {
    errors.push(`${slug}: howTo needs 3-4 steps (got ${steps.length})`);
  }
  if (steps.some((s) => !s || !String(s).trim())) errors.push(`${slug}: empty howTo step`);
  const sentenceEnds = (tool.intro || "").match(/[.!?](?:\s|$)/g) || [];
  if (sentenceEnds.length < 1 || sentenceEnds.length > 2) {
    errors.push(`${slug}: intro must be 1-2 sentences (found ${sentenceEnds.length})`);
  }

  report.push({
    file,
    slug,
    wc,
    faqs: faqs.length,
    steps: steps.length,
    links: links.length,
    bullets: bulletBlocks.length,
  });
}

// ── cross-tool similarity (within and across source files) ───────────────────
const tools = allTools.map(({ tool }) => tool).filter((t) => t && t.slug);
for (let i = 0; i < tools.length; i++) {
  for (let j = i + 1; j < tools.length; j++) {
    const a = new Set(words(tools[i].content || ""));
    const b = new Set(words(tools[j].content || ""));
    if (a.size === 0 && b.size === 0) continue;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter++;
    const union = a.size + b.size - inter;
    const sim = union === 0 ? 1 : inter / union;
    if (sim >= MAX_SIMILARITY) {
      errors.push(
        `${tools[i].slug} and ${tools[j].slug}: ${(sim * 100).toFixed(1)}% similar (max ${MAX_SIMILARITY * 100}%)`,
      );
    }
  }
}

if (errors.length) {
  console.error(`\n\u2717 validate-audio-seo-json failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`   - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `\u2713 validate-audio-seo-json: ${report.length} tools OK across ${files.length} source file(s)`,
);
for (const r of report) {
  console.log(
    `   ${r.slug.padEnd(40)} ${String(r.wc).padStart(4)} words  ${r.faqs} faq  ${r.steps} steps  ` +
      `${r.bullets} lists  ${r.links} link${r.links === 1 ? "" : "s"}`,
  );
}
