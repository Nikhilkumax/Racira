/**
 * Live-page checks for migrated Color Tools SEO pages.
 *
 * Usage:
 *   node scripts/check-color-seo-live.mjs [--base http://localhost:3002] <slug> [slug ...]
 *   node scripts/check-color-seo-live.mjs --related-only [--base ...] <slug> [slug ...]
 *
 * Requires a running server (dev or next start). For each slug it fetches
 * /colors/<slug> and asserts, against the real rendered HTML:
 *
 *   - the page answers 200 (the slug exists and is live);
 *   - the authored section (data-seo-content="tool") carries no body bold —
 *     no <strong>/<b> anywhere inside it;
 *   - every FAQ starts collapsed: there is at least one aria-expanded button
 *     and not a single one reads true;
 *   - the five locked headings are present (what / how to use / when to use /
 *     privacy / FAQ);
 *   - the "when to use" copy renders at least one inline sibling link, every
 *     link target answers 200, and none of them is the page itself;
 *   - the related row (data-related-tools="colors") holds exactly four picks,
 *     none of them the current tool.
 *
 * --related-only prints just the related-row picks, which is the cheapest way
 * to compare the curated/fallback selection for a page before and after a
 * change to the related-tools logic.
 */
const args = process.argv.slice(2);
const relatedOnly = args.includes("--related-only");
const baseIdx = args.indexOf("--base");
const base = (baseIdx === -1 ? "http://localhost:3002" : args[baseIdx + 1]).replace(/\/$/, "");
const slugs = args.filter((a, i) => !a.startsWith("--") && (baseIdx === -1 || i !== baseIdx + 1));

if (slugs.length === 0) {
  console.error("usage: node scripts/check-color-seo-live.mjs [--base URL] [--related-only] <slug> [slug ...]");
  process.exit(1);
}

const failures = [];
const targetCache = new Map();

async function fetchStatus(url) {
  if (targetCache.has(url)) return targetCache.get(url);
  const res = await fetch(url, { redirect: "manual" });
  const status = res.status;
  targetCache.set(url, status);
  return status;
}

function sliceSection(html, marker) {
  const at = html.indexOf(marker);
  if (at === -1) return null;
  const start = html.lastIndexOf("<section", at);
  const end = html.indexOf("</section>", at);
  if (start === -1 || end === -1) return null;
  return html.slice(start, end);
}

const relatedSlugs = (chunk) =>
  [...chunk.matchAll(/href="\/colors\/([a-z0-9-]+)"/g)].map((m) => m[1]);

for (const slug of slugs) {
  const url = `${base}/colors/${slug}`;
  const res = await fetch(url, { redirect: "manual" });
  if (res.status !== 200) {
    failures.push(`${slug}: GET ${url} -> ${res.status}`);
    console.log(`\u2717 ${slug.padEnd(42)} HTTP ${res.status}`);
    continue;
  }
  const html = await res.text();

  const relatedChunk = sliceSection(html, 'data-related-tools="colors"');
  const related = relatedChunk ? relatedSlugs(relatedChunk) : [];

  if (relatedOnly) {
    console.log(`${slug.padEnd(42)} related: ${related.join(", ") || "(none)"}`);
    continue;
  }

  const seoChunk = sliceSection(html, 'data-seo-content="tool"');
  const problems = [];
  if (!seoChunk) {
    problems.push("no authored SEO section found");
  } else {
    const bold = [...seoChunk.matchAll(/<(strong|b)\b/g)].length;
    if (bold > 0) problems.push(`${bold} body bold element(s) inside the SEO section`);

    const expanded = [...seoChunk.matchAll(/aria-expanded="(true|false)"/g)].map((m) => m[1]);
    if (expanded.length < 4) problems.push(`only ${expanded.length} FAQ button(s) found`);
    if (expanded.some((v) => v === "true")) problems.push("an FAQ renders expanded by default");

    for (const heading of [
      "What is ",
      "How to use ",
      "When to use ",
      "Privacy &amp; Security",
      "Frequently asked questions about ",
    ]) {
      if (!seoChunk.includes(heading)) problems.push(`missing heading "${heading}"`);
    }

    const links = [...new Set(relatedSlugs(seoChunk))];
    if (links.length === 0) problems.push("no inline sibling links in the when-to-use copy");
    if (links.includes(slug)) problems.push("the when-to-use copy links the page itself");
    for (const target of links) {
      const status = await fetchStatus(`${base}/colors/${target}`);
      if (status !== 200) problems.push(`inline link /colors/${target} -> ${status}`);
    }
  }

  if (related.length !== 4) problems.push(`related row has ${related.length} picks (expected 4)`);
  if (related.includes(slug)) problems.push("related row suggests the page itself");

  if (problems.length === 0) {
    console.log(`\u2713 ${slug.padEnd(42)} 0 bold, FAQ collapsed, headings OK, links OK, related OK`);
  } else {
    console.log(`\u2717 ${slug.padEnd(42)}`);
    for (const p of problems) console.log(`    - ${p}`);
    failures.push(`${slug}: ${problems.join("; ")}`);
  }
}

if (!relatedOnly) {
  if (failures.length) {
    console.error(`\n\u2717 check-color-seo-live: ${failures.length} page(s) failed`);
    process.exit(1);
  }
  console.log(`\n\u2713 check-color-seo-live: ${slugs.length} page(s) OK`);
}
