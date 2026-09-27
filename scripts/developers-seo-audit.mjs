/**
 * Developer Tools — SEO content audit.
 *
 * Measures, per tool: prose word count (headings excluded) and which of the
 * eight PMI-standard sections are present, so each content batch can be
 * verified before it is considered done.
 *
 * Run: node scripts/developers-seo-audit.mjs [--group "Encoding"] [--verbose]
 */
import { readFileSync } from "fs";

const SRC = "src/domains/developers/registry/tool-seo.ts";
const src = readFileSync(SRC, "utf8");

const stripHtml = (s) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const words = (s) => (stripHtml(s).match(/[A-Za-z0-9][A-Za-z0-9'’\-./]*/g) || []).length;

/**
 * Prose only: strip code/pre spans so symbol-heavy patterns are not counted as
 * prose, and strip <h3> question text because the brief excludes headings.
 */
const proseWords = (s) =>
  words(
    s
      .replace(/<code>[\s\S]*?<\/code>/g, " ")
      .replace(/<pre>[\s\S]*?<\/pre>/g, " ")
      .replace(/<h3>[\s\S]*?<\/h3>/g, " "),
  );

/** The eight sections the PMI golden standard requires, in order. */
const REQUIRED = [
  ["what", /^what\b/i],
  ["howItWorks", /how\b.*\bworks?\b|how\b.*\b(calculate|comput|evaluat|process|encod|decod|pars|hash|match)/i],
  ["usage", /how to use|step[- ]by[- ]step|\busing the\b|\busing a\b|step 1/i],
  ["useCases", /use case|when to use|why use|real[- ]world/i],
  ["example", /example|worked sample|sample input/i],
  ["tips", /tip|best practice|common mistake|gotcha|pitfall/i],
  ["faq", /faq|frequently asked/i],
  ["related", /related tool|see also|works well with|pairs with/i],
];

// Split the file into `registerToolSeo("<slug>", <ident>Seo);` spans.
const blocks = [];
const reg = /registerToolSeo\(\s*"([^"]+)"\s*,\s*([A-Za-z0-9_$]+)\s*\);/g;
let m;
while ((m = reg.exec(src)) !== null) {
  blocks.push({ slug: m[1], ident: m[2], at: m.index });
}

const declared = new Map();
const declRe = /^const ([A-Za-z0-9_$]+): ToolSeo = \{/gm;
while ((m = declRe.exec(src)) !== null) declared.set(m[1], m.index);
const declPositions = [...declared.entries()].sort((a, b) => a[1] - b[1]);

function bodyOf(ident) {
  const start = declared.get(ident);
  if (start === undefined) return "";
  // Body runs to the next top-level declaration, or the registration line.
  const next = declPositions.find(([, pos]) => pos > start);
  const end = next ? next[1] : src.length;
  return src.slice(start, end);
}

// ── Render check ──────────────────────────────────────────
// Faithful port of src/lib/utils/html-to-react.tsx. That parser only accepts a
// fixed set of inline tags; any other tag appearing mid-string is emitted as
// literal text and rendered visibly on the page. This catches that pre-ship.
const stripBlockWrappers = (html) => {
  let t = html.trim();
  const tags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "section", "article", "blockquote"];
  let changed = true;
  while (changed) {
    changed = false;
    for (const g of tags) {
      const o = `<${g}>`;
      const c = `</${g}>`;
      if (t.startsWith(o) && t.endsWith(c)) {
        t = t.slice(o.length, -c.length).trim();
        changed = true;
        break;
      }
    }
  }
  return t;
};
const VALID_INLINE = new Set([
  "strong", "em", "b", "i", "u", "s", "code", "pre", "a", "br",
  "sup", "sub", "small", "mark", "span", "ol", "ul", "li", "h3", "p",
]);
function htmlToReact(html) {
  html = stripBlockWrappers(html);
  if (!html.includes("<")) return html;
  const nodes = [];
  let remaining = html;
  while (remaining.length > 0) {
    const tagStart = remaining.indexOf("<");
    if (tagStart === -1) {
      nodes.push(remaining);
      break;
    }
    if (tagStart > 0) {
      nodes.push(remaining.slice(0, tagStart));
      remaining = remaining.slice(tagStart);
    }
    const tagEnd = remaining.indexOf(">");
    const tagContent = remaining.slice(1, tagEnd).trim();
    remaining = remaining.slice(tagEnd + 1);
    const spaceIdx = tagContent.indexOf(" ");
    const tagName = (spaceIdx === -1 ? tagContent : tagContent.slice(0, spaceIdx))
      .replace(/\//g, "")
      .trim();
    if (!VALID_INLINE.has(tagName)) {
      nodes.push({ LEAKED_LITERAL: `<${tagContent}>${remaining}` });
      break;
    }
    if (tagContent.endsWith("/")) continue;
    // The real component throws here: React rejects children on a self-closing tag.
    // `<br></br>` reaches this branch and crashes the page at render time.
    if (tagName === "br") {
      nodes.push({ THROWS_SELF_CLOSING_TAG: "br" });
      break;
    }
    const closing = `</${tagName}>`;
    const closingIdx = remaining.indexOf(closing);
    let inner;
    if (closingIdx === -1) {
      inner = remaining;
      remaining = "";
    } else {
      inner = remaining.slice(0, closingIdx);
      remaining = remaining.slice(closingIdx + closing.length);
    }
    nodes.push({ type: tagName, children: inner.includes("<") ? htmlToReact(inner) : inner, display: tagName === "code" });
  }
  return nodes.length === 1 ? nodes[0] : nodes;
}
// A literal only counts as a real defect when real markup got swallowed into it
// OUTSIDE a <code> element. Angle brackets that merely *display* inside <code>
// are author intent (code samples), and were the reason `&lt;` was used before —
// htmlToReact does not decode entities, so `&lt;` would show as visible text.
const REAL_TAG = /<\/?(?:p|div|h1|h2|h4|h5|h6|section|blockquote|table|tr|td|th|strong|em|b|i|u|s|code|pre|a|br|sup|sub|small|mark|span|ol|ul|li|h3)\b[^>]*>/;
// htmlToReact performs no entity decoding, so any entity is visible text on the page.
const ENTITY = /&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/;
const hasLeak = (x, inCode) => {
  if (!x || typeof x === "string") return false;
  if (Array.isArray(x)) return x.some((c) => hasLeak(c, inCode));
  if (x.THROWS_SELF_CLOSING_TAG) return true;
  if (x.LEAKED_LITERAL) return !inCode && REAL_TAG.test(x.LEAKED_LITERAL);
  return hasLeak(x.children, inCode || Boolean(x.display));
};
const collectLeaks = (x, out) => {
  if (!x || typeof x === "string") return out;
  if (Array.isArray(x)) { x.forEach((c) => collectLeaks(c, out)); return out; }
  if (x.LEAKED_LITERAL) out.push(x.LEAKED_LITERAL);
  if (x.THROWS_SELF_CLOSING_TAG) out.push("THROWS: <" + x.THROWS_SELF_CLOSING_TAG + "></" + x.THROWS_SELF_CLOSING_TAG + ">");
  collectLeaks(x.children, out);
  return out;
};
const unescapeTs = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

const rows = [];
for (const b of blocks) {
  const body = bodyOf(b.ident);
  // Section headings only — never count `heading:` text toward word count.
  const headings = [...body.matchAll(/heading:\s*"((?:[^"\\]|\\.)*)"/g)].map((h) =>
    h[1].replace(/\\"/g, '"'),
  );
  // Prose = every paragraph/list text, excluding heading strings.
  const proseParts = [
    ...[...body.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)].map((p) => p[1].replace(/\\"/g, '"')),
    ...[...body.matchAll(/items:\s*\[([\s\S]*?)\]/g)].map((p) => p[1]),
  ];
  const rawJoined = proseParts.join(" ");
  const wc = words(rawJoined);
  const proseWc = proseWords(rawJoined);

  const joined = headings.join(" || ");
  const present = {};
  for (const [key, re] of REQUIRED) present[key] = re.test(joined);

  // "howItWorks" must not be satisfied by the usage heading alone.
  if (present.howItWorks && present.usage) {
    const nonUsage = headings.filter((h) => !/how to use/i.test(h)).join(" || ");
    present.howItWorks = /how\b.*\bworks?\b|how\b.*\b(calculate|comput|evaluat|process|encod|decod|pars|hash|match)/i.test(
      nonUsage,
    );
  }

  const missing = REQUIRED.filter(([k]) => !present[k]).map(([k]) => k);
  // Every string that will be passed through htmlToReact on the live page.
  const renderStrings = [
    ...[...body.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)].map((x) => unescapeTs(x[1])),
    ...[...body.matchAll(/items:\s*\[([\s\S]*?)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => unescapeTs(x[1])),
    ),
  ];
  const leaks = renderStrings.filter((s) => hasLeak(htmlToReact(s)));
  const entityStrings = renderStrings.filter((s) => ENTITY.test(s));

  rows.push({
    slug: b.slug,
    words: wc,
    proseWords: proseWc,
    sectionsFound: REQUIRED.length - missing.length,
    missing: missing.join(","),
    inRange: proseWc >= 1000 && proseWc <= 1500,
    renderStrings: renderStrings.length,
    leaks: leaks.length,
    leakSample: leaks[0] ? leaks[0].slice(0, 90) : "",
    leakFragments: leaks.flatMap((s) => collectLeaks(htmlToReact(s), [])),
    entities: entityStrings.length,
    entitySample: entityStrings[0] ? entityStrings[0].slice(0, 90) : "",
  });
}

// ── Report ────────────────────────────────────────────────
const renderCheck = process.argv.includes("--render-check");
const verbose = process.argv.includes("--verbose");
const groupArg = process.argv.indexOf("--group");
const groupFilter = groupArg > -1 ? process.argv[groupArg + 1] : null;

const registry = readFileSync("src/domains/developers/registry.ts", "utf8");
const body = registry.slice(registry.indexOf("const groups"), registry.indexOf("export const tools"));
const groupOf = (() => {
  const map = new Map();
  const gr = /^\s{2}"([^"]+)":\s*\[/gm;
  const marks = [];
  let g;
  while ((g = gr.exec(body)) !== null) marks.push({ name: g[1], idx: g.index });
  for (let i = 0; i < marks.length; i++) {
    const seg = body.slice(marks[i].idx, i + 1 < marks.length ? marks[i + 1].idx : body.length);
    for (const t of seg.matchAll(/^\s*\["([^"]+)"/gm)) map.set(t[1], marks[i].name);
  }
  return map;
})();

const toSlug = (t) =>
  t
    // Keep in sync with src/lib/utils/slug.ts (accent transliteration).
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
const slugToGroup = new Map();
for (const [name, grp] of groupOf) slugToGroup.set(toSlug(name), grp);

let report = rows.filter((r) => !groupFilter || slugToGroup.get(r.slug) === groupFilter);
report = report.sort((a, b) => a.words - b.words);

console.log(
  "Tool".padEnd(34),
  "Prose".padStart(6),
  "All".padStart(6),
  "Sect".padStart(5),
  "InRange".padStart(8),
  "Group".padEnd(24),
  "Missing",
);
console.log("-".repeat(118));
for (const r of verbose || groupFilter ? report : report.slice(0, 40)) {
  console.log(
    r.slug.padEnd(34),
    String(r.proseWords).padStart(6),
    String(r.words).padStart(6),
    String(r.sectionsFound + "/8").padStart(5),
    (r.inRange ? "yes" : "no").padStart(8),
    (slugToGroup.get(r.slug) ?? "?").padEnd(24),
    r.missing,
  );
}

if (renderCheck) {
  const bad = report.filter((r) => r.leaks > 0);
  const totalStrings = report.reduce((a, r) => a + r.renderStrings, 0);
  console.log(
    `\n── Render check · ${totalStrings} strings passed through htmlToReact · ${bad.length}/${report.length} tools emit literal markup`,
  );
  for (const r of bad) {
    console.log(`  ${r.slug.padEnd(34)} ${String(r.leaks).padStart(3)} leaking string(s)  e.g. ${r.leakSample}...`);
  }
  if (!bad.length) console.log("  none — every string renders as real elements, no visible tags");
  const entityTools = report.filter((r) => r.entities > 0);
  console.log(
    `  entities · ${entityTools.length}/${report.length} tools contain undecoded HTML entities (visible as literal text)`,
  );
  for (const r of entityTools) {
    console.log(`  ${r.slug.padEnd(34)} ${String(r.entities).padStart(3)} string(s)  e.g. ${r.entitySample}...`);
  }
  if (process.argv.includes("--leaks")) {
    for (const r of bad) {
      console.log(`\n  ── ${r.slug}`);
      r.leakFragments.forEach((f) => console.log(`     ${JSON.stringify(f.slice(0, 320))}`));
    }
  }
}

const wcs = report.map((r) => r.words);
const sum = wcs.reduce((a, b) => a + b, 0);
const inRange = report.filter((r) => r.inRange).length;
const fullSections = report.filter((r) => r.sectionsFound === 8).length;
console.log("\n── Summary" + (groupFilter ? ` — group "${groupFilter}"` : " — all tools") + " ──");
console.log(`tools measured        ${report.length}`);
console.log(`word count min/median/max   ${Math.min(...wcs)} / ${wcs.sort((a, b) => a - b)[Math.floor(wcs.length / 2)]} / ${Math.max(...wcs)}`);
console.log(`total words           ${sum.toLocaleString()}`);
console.log(`in 1000-1500 range    ${inRange}/${report.length}  (measured on prose excluding code spans)`);
console.log(`all 8 sections        ${fullSections}/${report.length}`);
console.log(`leaking markup        ${report.filter((r) => r.leaks > 0).length}/${report.length}`);
console.log(`undecoded entities    ${report.filter((r) => r.entities > 0).length}/${report.length}`);
const need = report.reduce((a, r) => a + Math.max(0, 1000 - r.proseWords), 0);
console.log(`words still needed to reach the 1,000-word floor: ~${need.toLocaleString()}`);

const byGroup = {};
for (const r of report) {
  const g = slugToGroup.get(r.slug) ?? "?";
  (byGroup[g] ||= []).push(r.words);
}
console.log("\nGroup".padEnd(32), "Tools".padStart(5), "Min".padStart(6), "Max".padStart(6), "Total".padStart(7));
for (const [g, list] of Object.entries(byGroup).sort((a, b) => a[1].reduce((x, y) => x + y, 0) - b[1].reduce((x, y) => x + y, 0))) {
  console.log(g.padEnd(32), String(list.length).padStart(5), String(Math.min(...list)).padStart(6), String(Math.max(...list)).padStart(6), String(list.reduce((a, b) => a + b, 0)).padStart(7));
}
