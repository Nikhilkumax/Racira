/**
 * Rendered-output gate for Racira Fonts (/typography) SEO content.
 *
 * Usage:
 *   node scripts/validate-typography-seo-render.mjs            # all sources
 *   node scripts/validate-typography-seo-render.mjs <slug>...  # selected slugs
 *
 * The JSON/source validators can only prove what was authored. This one proves
 * what a reader actually receives: it reads the prerendered HTML that
 * `npm run build` writes to .next/server/app/typography/ and checks the
 * invariants that only exist in output —
 *
 *   - no <strong>/<b>/<em>/<mark>/<i> inside the SEO block (body copy is
 *     single-weight; the renderer unwraps any ** markers rather than bolding);
 *   - exactly five <h2> headings, one per locked section;
 *   - the HowTo block renders as an <ol> with one <li> per authored step;
 *   - all five FAQ buttons render collapsed (aria-expanded="false", none open)
 *     and no FAQ answer text reaches the DOM outside the FAQPage JSON-LD;
 *   - every {{slug|label}} link resolves to a real /typography/<slug> anchor;
 *   - the related-tools row renders four distinct, live, non-self targets.
 *
 * Because it reads build output it is deliberately NOT part of `prebuild`
 * (which runs before the build that produces it). Run it after `npm run build`,
 * or after a dev server has prerendered the same routes.
 *
 * Exit code 0 = every checked page passed, 1 = at least one failed.
 */
import fs from "node:fs";
import path from "node:path";

const SOURCE_DIR = path.join("src", "domains", "typography", "registry", "seo", "source");
const HTML_DIR = path.join(".next", "server", "app", "typography");
const BASE_PATH = "/typography";

if (!fs.existsSync(HTML_DIR)) {
  console.error(
    `\n\u2717 validate-typography-seo-render: no prerendered HTML at ${HTML_DIR}\n` +
      "  Run `npm run build` first — this gate reads build output by design.\n",
  );
  process.exit(1);
}

/** Every authored tool, in source order, with what its page must render. */
const sources = fs
  .readdirSync(SOURCE_DIR)
  .filter((f) => f.toLowerCase().endsWith(".json"))
  .sort()
  .flatMap((f) => {
    const parsed = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, f), "utf8"));
    return (Array.isArray(parsed) ? parsed : []).map((tool) => ({ ...tool, file: f }));
  });

if (sources.length === 0) {
  console.error(`\n\u2717 validate-typography-seo-render: no authored sources in ${SOURCE_DIR}\n`);
  process.exit(1);
}

const selected = process.argv.slice(2);
const tools = selected.length ? sources.filter((t) => selected.includes(t.slug)) : sources;
if (tools.length === 0) {
  console.error(`\n\u2717 validate-typography-seo-render: no matching slugs for ${selected.join(", ")}\n`);
  process.exit(1);
}

const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ");

/** Named entities React escapes in text; numeric ones are decoded directly. */
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (value) =>
  value.replace(/&(?:#(x[0-9a-fA-F]+|[0-9]+)|([a-zA-Z]+));/g, (match, numeric, named) => {
    if (numeric) {
      const code = numeric[0] === "x" ? parseInt(numeric.slice(1), 16) : parseInt(numeric, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED[named] ?? match;
  });

/** Visible text of a fragment, so authored copy can be compared to the page. */
const text = (html) => decode(strip(html).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const slice = (html, marker, end) => {
  const at = html.indexOf(marker);
  if (at === -1) return null;
  const stop = html.indexOf(end, at);
  return html.slice(at, stop === -1 ? undefined : stop);
};

const failures = [];
const rows = [];

for (const tool of tools) {
  const file = path.join(HTML_DIR, `${tool.slug}.html`);
  if (!fs.existsSync(file)) {
    failures.push(`${tool.slug} (${tool.file}): prerendered page missing`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const seo = slice(html, 'data-seo-content="tool"', "</section>");
  const related = slice(html, 'data-related-tools="typography"', "</section>");
  const problems = [];

  // ── 1. body copy carries no bold or emphasis markup ────────────────────────
  if (!seo) {
    problems.push("no SEO block on the page");
  } else {
    const strong = (seo.match(/<strong[\s>]/g) || []).length;
    if (strong !== 0) problems.push(`${strong} <strong> element(s) in body copy`);
    const emphasis = (seo.match(/<(b|em|mark|i)[\s>]/g) || []).length;
    if (emphasis !== 0) problems.push(`${emphasis} bold/emphasis element(s) in body copy`);
  }

  // ── 2. locked section structure ───────────────────────────────────────────
  const headings = seo ? (seo.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || []).map(text) : [];
  for (const want of [
    "What is",
    "How to use",
    "vs related tools",
    "Privacy & Security",
    "Frequently asked questions about",
  ]) {
    if (!headings.some((h) => h.includes(want))) problems.push(`missing h2 containing "${want}"`);
  }
  if (headings.length !== 5) problems.push(`${headings.length} h2 heading(s) (expected 5)`);

  // ── 3. howTo renders every authored step ──────────────────────────────────
  const steps = seo ? (seo.match(/<ol[\s\S]*?<\/ol>/) || [""])[0].match(/<li[\s>]/g) || [] : [];
  if (steps.length !== (tool.howTo || []).length) {
    problems.push(`${steps.length} ordered step(s) for ${(tool.howTo || []).length} authored step(s)`);
  }

  // ── 4. FAQs are collapsed and their answers are not in the DOM ────────────
  const collapsed = seo ? (seo.match(/aria-expanded="false"/g) || []).length : 0;
  const expanded = seo ? (seo.match(/aria-expanded="true"/g) || []).length : 0;
  if (collapsed !== (tool.faqs || []).length) {
    problems.push(`${collapsed} collapsed FAQ button(s) for ${(tool.faqs || []).length} question(s)`);
  }
  if (expanded !== 0) problems.push(`${expanded} FAQ button(s) open by default`);
  const rendered = seo ? (seo.match(/<button[\s\S]*?<\/button>/g) || []).map(text) : [];
  for (const [i, faq] of (tool.faqs || []).entries()) {
    if (!rendered.some((button) => button.includes(faq.q))) {
      problems.push(`FAQ ${i + 1} question not found in the rendered buttons`);
    }
    const phrase = faq.a.split(/\s+/).slice(0, 8).join(" ");
    // scripts stripped: the FAQPage JSON-LD must carry the answer, the closed
    // accordion body must not.
    if (strip(html).includes(phrase)) problems.push(`FAQ ${i + 1} answer present in the DOM while collapsed`);
  }

  // ── 5. {{slug|label}} links resolve to real anchors ───────────────────────
  const targets = [...new Set([...(tool.whenToUse || "").matchAll(/\{\{([a-z0-9-]+)\|/g)].map((m) => m[1]))];
  for (const target of targets) {
    if (!seo || !seo.includes(`href="${BASE_PATH}/${target}"`)) {
      problems.push(`inline link to ${target} did not render as an anchor`);
    }
  }
  // Unrendered syntax only: `{{slug|label}}` that the link parser did not
  // expand, or `**` markers the renderer did not unwrap. Angle brackets are
  // deliberately not tested — this domain's copy legitimately quotes markup
  // (image/<mime>, <slug>-<face-suffix>.woff2), which renders escaped.
  if (seo && /\{\{|\}\}|\[\[|\*\*/.test(text(seo))) {
    problems.push("unrendered link or emphasis syntax visible in copy");
  }

  // ── 6. related-tools row: four distinct, live, non-self targets ───────────
  if (!related) {
    problems.push("related-tools row missing");
  } else {
    const relTargets = [...new Set([...related.matchAll(new RegExp(`href="${BASE_PATH}/([a-z0-9-]+)"`, "g"))].map((m) => m[1]))];
    if (relTargets.length !== 4) problems.push(`${relTargets.length} related target(s) (expected 4)`);
    if (relTargets.includes(tool.slug)) problems.push("related row links to the page itself");
    for (const target of relTargets) {
      if (!fs.existsSync(path.join(HTML_DIR, `${target}.html`))) {
        problems.push(`related target ${target} is not a live page`);
      }
    }
  }

  const words = seo ? text(seo).split(" ").filter(Boolean).length : 0;
  rows.push({ slug: tool.slug, words, h2: headings.length, steps: steps.length, faq: collapsed, links: targets.length, ok: problems.length === 0 });
  for (const problem of problems) failures.push(`${tool.slug} (${tool.file}): ${problem}`);
}

const pad = (value, width) => String(value).padStart(width);
console.log("\nslug".padEnd(34) + pad("h2", 4) + pad("steps", 7) + pad("faq", 5) + pad("links", 7) + pad("words", 7));
for (const row of rows) {
  console.log(
    row.slug.padEnd(34) +
      pad(row.h2, 4) +
      pad(row.steps, 7) +
      pad(row.faq, 5) +
      pad(row.links, 7) +
      pad(row.words, 7),
  );
}

if (failures.length) {
  console.error(`\n\u2717 validate-typography-seo-render failed with ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`   - ${failure}`);
  process.exit(1);
}

console.log(
  `\n\u2713 validate-typography-seo-render: ${rows.length} prerendered page(s) OK ` +
    `(0 bold in body copy, 5 sections, collapsed FAQs with answers out of the DOM, links resolving, 4 live non-self related targets).`,
);
