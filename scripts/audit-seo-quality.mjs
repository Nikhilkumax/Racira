#!/usr/bin/env node
/**
 * Cross-domain SEO quality audit — the post-build gate.
 *
 * The structural validators in `prebuild` read the authored JSON and the React
 * tree. They cannot see two things this script exists to catch:
 *
 *   1. the *internal-link graph* (a page nothing links to passes every gate), and
 *   2. the *built static HTML* (duplicate or missing JSON-LD graphs, a second
 *      FAQ section, a related row that does not match the curated picks).
 *
 * Because it reads `.next/server/app/**`, it must run AFTER `next build`. It is
 * wired as the `postbuild` npm script, so `npm run build` now fails when the
 * audit fails — a regression cannot be merged by ignoring a report file.
 *
 * Usage:
 *   node scripts/audit-seo-quality.mjs [options]
 *
 *   --domain <audio|colors|typography|all>   default: all
 *   --report-only      write reports, always exit 0 (exploration)
 *   --graph-only       skip the built-page parity checks
 *   --pages-only       skip the link-graph checks
 *   --self-test        run the fixtures that prove the detection works, then exit
 *   --out <dir>        report directory (default: _audioseo)
 *
 * Exit code is non-zero when a gate fails: parity findings, structural link
 * problems, or (for domains whose link graph is gated) orphaned/thin pages.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Mirrors `src/lib/utils/slug.ts`. Kept in sync by construction: for typography
 * the derived slug set must equal the authored slug set exactly, or the audit
 * aborts rather than reporting numbers from a broken parse.
 */
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

const PRIVACY_MARKER = "runs entirely in your browser";

/** Domains differ in registry shape, source layout and page output. */
const DOMAINS = {
  audio: {
    label: "Audio",
    origin: "src/domains/audio",
    sourceDir: "src/domains/audio/seo/source",
    builtDir: ".next/server/app/audio",
    relatedFile: "src/domains/audio/components/related-tools.tsx",
    registryFile: "src/domains/audio/registry.ts",
    registryFormat: "blocks", // `name: "Category"` then tools with `slug: "..."`
    validator: "scripts/validate-audio-seo-json.mjs",
    curatedEveryTool: true,
    requiredGraphs: ["BreadcrumbList", "SoftwareApplication", "FAQPage", "HowTo"],
    marker: "audio",
    gateGraph: true,
    legacyFaqPattern: /Is this .* converter free\?/g,
    report: "AUDIT-AUDIO-QUALITY.md",
  },
  colors: {
    label: "Colors",
    origin: "src/domains/colors",
    sourceDir: "src/domains/colors/seo/source",
    builtDir: ".next/server/app/colors",
    relatedFile: "src/domains/colors/components/related-tools.tsx",
    // Colors declares tools in two places: the base table plus a later block
    // appended in registry.ts. Both must be read or 32 slugs lose their category.
    registryFile: "src/domains/colors/registry/registry-meta.ts",
    registryFiles: ["src/domains/colors/registry/registry-meta.ts", "src/domains/colors/registry.ts"],
    categoryMetaFile: "src/domains/colors/registry/types.ts",
    registryFormat: "field", // one-line objects carrying `category: "<id>"`
    validator: "scripts/validate-color-seo-json.mjs",
    curatedEveryTool: true, // full-coverage curation pass replaced the 190 same-category fallback rows
    requiredGraphs: ["FAQPage", "HowTo"],
    optionalGraphs: ["BreadcrumbList", "SoftwareApplication"],
    marker: "colors",
    gateGraph: true, // gated after the full-coverage curation pass reached 0 orphans / 0 thin (2026-09-29)
    report: "AUDIT-COLORS-QUALITY.md",
  },
  typography: {
    label: "Typography",
    origin: "src/domains/typography",
    sourceDir: "src/domains/typography/registry/seo/source",
    builtDir: ".next/server/app/typography",
    relatedFile: "src/domains/typography/components/related-tools.tsx",
    registryFile: "src/domains/typography/registry.ts",
    registryFormat: "mkBlocks", // `name: "Category"` then mk([[name, desc, icon, live]])
    validator: "scripts/validate-typography-seo-json.mjs",
    curatedEveryTool: true,
    requiredGraphs: ["FAQPage", "HowTo"],
    optionalGraphs: ["BreadcrumbList", "SoftwareApplication"],
    marker: "typography",
    gateGraph: true, // gated after the 15 curated-row swaps reached 0 orphans / 0 thin (2026-09-29)
    report: "AUDIT-TYPOGRAPHY-QUALITY.md",
  },
};

// ── arguments ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const OPTS = {
  domain: valueOf("--domain", "all"),
  reportOnly: has("--report-only"),
  graphOnly: has("--graph-only"),
  pagesOnly: has("--pages-only"),
  selfTest: has("--self-test"),
  outDir: valueOf("--out", "_audioseo"),
};

// ── inputs ──────────────────────────────────────────────────────────────────
export function readSources(sourceDir) {
  const dir = join(ROOT, sourceDir);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const entries = [];
  for (const f of files) {
    const parsed = JSON.parse(readFileSync(join(dir, f), "utf8"));
    const list = Array.isArray(parsed) ? parsed : (parsed.tools ?? Object.values(parsed)[0]);
    for (const t of list) entries.push({ ...t, file: f });
  }
  return { files, entries };
}

export function parseCurated(relatedFile) {
  const src = readFileSync(join(ROOT, relatedFile), "utf8");
  const body = src.slice(src.indexOf("CURATED_RELATED"), src.indexOf("const MAX_RELATED"));
  const curated = {};
  for (const m of body.matchAll(/^\s{2}"([a-z0-9-]+)": \[([^\]]*)\],/gm)) {
    curated[m[1]] = [...m[2].matchAll(/"([a-z0-9-]+)"/g)].map((x) => x[1]);
  }
  return curated;
}

/**
 * Resolve slug -> category *label* per domain, using that domain's real registry
 * shape. Every format is verified against the authored slug set (and, for
 * colors, against CATEGORY_META) before any number derived from it is trusted.
 */
export function parseCategories(cfg) {
  const raw = readFileSync(join(ROOT, cfg.registryFile), "utf8");
  const bySlug = {};
  const liveBySlug = {};
  let ids = [];
  const notes = [];

  if (cfg.registryFormat === "blocks") {
    const parts = raw.split(/\r?\n\s{4}name: "([^"]+)",\r?\n\s{4}tools: \[/);
    for (let i = 1; i < parts.length; i += 2) {
      ids.push(parts[i]);
      const body0 = parts[i + 1] ?? "";
      // Each tool starts at `slug: "..."`; its status sits in the same segment.
      const hits = [...body0.matchAll(/slug: "([a-z0-9-]+)"/g)];
      hits.forEach((h, idx) => {
        const segment = body0.slice(h.index, idx + 1 < hits.length ? hits[idx + 1].index : body0.length);
        bySlug[h[1]] = parts[i];
        liveBySlug[h[1]] = /status: "live"/.test(segment);
      });
    }
  } else if (cfg.registryFormat === "mkBlocks") {
    const parts = raw.split(/\r?\n\s{4}name: "([^"]+)",\r?\n\s{4}tools: mk\(\[/);
    // Each entry is [name, desc, icon, isLive]; the slug comes from toSlug(name).
    for (let i = 1; i < parts.length; i += 2) {
      ids.push(parts[i]);
      const body = (parts[i + 1] ?? "").split(/\]\),?\s*\r?\n\s*\},/)[0];
      for (const m of body.matchAll(/\[\s*"([^"]+)",\s*"[^"]*",\s*[^,]+,\s*(true|false)\s*\]/g)) {
        const slug = toSlug(m[1]);
        bySlug[slug] = parts[i];
        liveBySlug[slug] = m[2] === "true";
      }
    }
    notes.push("typography slugs are derived from tool names with toSlug()");
  } else if (cfg.registryFormat === "field") {
    const meta = readFileSync(join(ROOT, cfg.categoryMetaFile), "utf8");
    const labels = {};
    for (const m of meta.matchAll(/(\w+):\s*\{\s*label:\s*"([^"]+)"/g)) labels[m[1]] = m[2];
    ids = Object.keys(labels);
    for (const rel of cfg.registryFiles ?? [cfg.registryFile]) {
      const fileRaw = rel === cfg.registryFile ? raw : readFileSync(join(ROOT, rel), "utf8");
      for (const chunk of fileRaw.split(/\{\s*slug:/).slice(1)) {
        const slug = chunk.match(/^\s*"([a-z0-9-]+)"/)?.[1];
        if (!slug) continue;
        const cat = chunk.match(/category:\s*"([a-z]+)"/)?.[1];
        const status = chunk.match(/status:\s*"(live|soon)"/)?.[1];
        bySlug[slug] = labels[cat] ?? `??${cat}`;
        liveBySlug[slug] = status === "live";
      }
    }
    notes.push("colors categories resolved through CATEGORY_META labels");
  } else {
    throw new Error(`unknown registryFormat: ${cfg.registryFormat}`);
  }

  return { bySlug, liveBySlug, ids, notes };
}

export function readPages(cfg, slugs) {
  const dir = join(ROOT, cfg.builtDir);
  const pages = new Map();
  const missing = [];
  for (const slug of slugs) {
    const f = join(dir, `${slug}.html`);
    if (existsSync(f)) pages.set(slug, readFileSync(f, "utf8"));
    else missing.push(slug);
  }
  let builtCount = 0;
  if (existsSync(dir)) builtCount = readdirSync(dir).filter((f) => f.endsWith(".html")).length;
  return { pages, missing, builtCount };
}

// ── checks (pure enough to be re-used by --self-test) ────────────────────────
const count = (s, re) => (s.match(re) || []).length;

export function checkJsonLd(html, required, optional = []) {
  const findings = [];
  const types = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((b) => {
    try {
      return JSON.parse(b[1])["@type"];
    } catch {
      return "PARSE_FAIL";
    }
  });
  for (const t of types) if (t === "PARSE_FAIL") findings.push("a JSON-LD block does not parse");
  for (const want of required) {
    const n = types.filter((t) => t === want).length;
    if (n !== 1) findings.push(`${n} ${want} graph(s), expected exactly 1`);
  }
  // An "optional" graph may be absent on a domain, but never duplicated: two
  // BreadcrumbList graphs are as wrong as two FAQPage graphs, and the whole
  // point of this check is the double-emission class of bug.
  for (const want of optional) {
    const n = types.filter((t) => t === want).length;
    if (n > 1) findings.push(`${n} ${want} graph(s), expected at most 1`);
  }
  const missingOptional = optional.filter((t) => !types.includes(t));
  return { findings, types, missingOptional };
}

export function auditGraph({ entries, curated, bySlug, minProseLinks = 3, relatedBySlug = null }) {
  // Related-row edges come from the RENDERED row when the built pages are
  // available. Domains that leave most tools uncurated (colors) fill those rows
  // from a same-category fallback, which is a real inbound link; counting only
  // the curated map would invent orphans that the live site does not have.
  // A curated row is authoritative in the source (a gate must react to the file a
  // developer edits), while an uncurated tool's row only exists after the build's
  // same-category fallback runs — so those edges come from the rendered page.
  const rendered = relatedBySlug ?? new Map();
  const relatedOut = new Map(
    entries.map((e) => [e.slug, curated[e.slug] ?? rendered.get(e.slug) ?? []]),
  );
  const problems = [];
  const proseOut = new Map();
  const proseIn = new Map(entries.map((e) => [e.slug, []]));
  const linkHist = {};
  const authored = new Set(entries.map((e) => e.slug));

  for (const e of entries) {
    const links = [...(e.whenToUse || "").matchAll(/\{\{([a-z0-9-]+)\|/g)].map((m) => m[1]);
    proseOut.set(e.slug, links);
    linkHist[links.length] = (linkHist[links.length] || 0) + 1;
    if (links.length < minProseLinks) {
      problems.push(`${e.slug}: ${links.length} prose links (minimum ${minProseLinks})`);
    }
    if (new Set(links).size !== links.length) problems.push(`${e.slug}: duplicate prose link`);
    for (const t of links) {
      if (t === e.slug) problems.push(`${e.slug}: self prose link`);
      else if (!authored.has(t)) problems.push(`${e.slug}: prose link to non-authored "${t}"`);
      else proseIn.get(t).push(e.slug);
    }
  }

  const curatedIn = new Map(entries.map((e) => [e.slug, []]));
  const uncurated = entries.filter((e) => !curated[e.slug]).map((e) => e.slug);
  const noRenderedRow = [];
  for (const e of entries) {
    const picks = relatedOut.get(e.slug);
    if (!picks || picks.length === 0) {
      noRenderedRow.push(e.slug);
      continue;
    }
    if (picks.length !== 4) problems.push(`${e.slug}: ${picks.length} curated picks (expected 4)`);
    if (new Set(picks).size !== picks.length) problems.push(`${e.slug}: duplicate curated pick`);
    for (const t of picks) {
      if (t === e.slug) problems.push(`${e.slug}: curated pick points at itself`);
      else if (!authored.has(t)) problems.push(`${e.slug}: curated pick "${t}" is not authored`);
      else curatedIn.get(t).push(e.slug);
    }
  }

  const combinedIn = new Map(
    entries.map((e) => [e.slug, new Set([...(proseIn.get(e.slug) || []), ...(curatedIn.get(e.slug) || [])])]),
  );
  const orphans = entries.filter((e) => combinedIn.get(e.slug).size === 0).map((e) => e.slug);
  const thin = entries.filter((e) => combinedIn.get(e.slug).size === 1).map((e) => e.slug);
  const proseOrphans = entries.filter((e) => (proseIn.get(e.slug) || []).length === 0).map((e) => e.slug);

  const proseStats = (map) => {
    const v = entries.map((e) => (map.get(e.slug) || []).length);
    return { total: v.reduce((a, b) => a + b, 0), min: Math.min(...v), max: Math.max(...v) };
  };
  let sameCat = 0;
  let crossCat = 0;
  for (const e of entries) {
    for (const t of proseOut.get(e.slug) || []) {
      const a = bySlug?.[e.slug];
      const b = bySlug?.[t];
      if (a && b && a !== b) crossCat++;
      else sameCat++;
    }
  }
  let mutual = 0;
  for (const e of entries) {
    for (const t of proseOut.get(e.slug) || []) if ((proseOut.get(t) || []).includes(e.slug)) mutual++;
  }

  const combStats = { total: 0, min: Infinity, max: 0 };
  for (const set of combinedIn.values()) {
    combStats.total += set.size;
    combStats.min = Math.min(combStats.min, set.size);
    combStats.max = Math.max(combStats.max, set.size);
  }

  return {
    problems, orphans, thin, proseOrphans, proseStats: proseStats(proseIn),
    curatedTotal: [...curatedIn.values()].reduce((a, b) => a + b.length, 0),
    uncurated, noRenderedRow, combinedIn, combStats, sameCat, crossCat, mutual, linkHist, proseOut, curatedIn,
  };
}

/** The sibling-link minimum is the domain's own gate, read from its validator. */
export function readMinProseLinks(cfg) {
  const src = readFileSync(join(ROOT, cfg.validator), "utf8");
  const m = src.match(/MIN_TOOL_LINKS\s*=\s*(\d+)/);
  return m ? Number(m[1]) : 3;
}

export function auditPages({ entries, curated, pages, cfg, optionalGraphs = [] }) {
  const findings = [];
  const graphInventory = new Map();
  const optionalMissing = new Map();
  const headingFailures = [];
  const authored = new Set(entries.map((e) => e.slug));
  const fallbackRows = [];

  for (const e of entries) {
    const html = pages.get(e.slug);
    if (!html) {
      findings.push(`${e.slug}: no built page`);
      continue;
    }
    const bad = (m) => findings.push(`${e.slug}: ${m}`);

    const multiGraph = (cfg.requiredGraphs?.length ?? 1) > 1 || true; // per-domain expectation
    const { findings: ldFindings, types, missingOptional } = checkJsonLd(
      html,
      cfg.requiredGraphs,
      optionalGraphs,
    );
    for (const f of ldFindings) bad(f);
    for (const t of new Set(types)) graphInventory.set(t, (graphInventory.get(t) || 0) + 1);
    for (const t of missingOptional) optionalMissing.set(t, (optionalMissing.get(t) || 0) + 1);
    void multiGraph;

    if (count(html, /<h1[\s>]/g) !== 1) bad(`${count(html, /<h1[\s>]/g)} <h1> elements`);

    const h2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
      m[1].replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim(),
    );
    const startIdx = h2.findIndex((t) => t.startsWith("What is "));
    if (startIdx < 0) bad("no 'What is ...' heading found");
    else {
      const name = h2[startIdx].slice("What is ".length).replace(/\?$/, "");
      const expected = [
        `What is ${name}?`,
        `How to use ${name}`,
        `When to use ${name} vs related tools`,
        "Privacy & Security",
        `Frequently asked questions about ${name}`,
      ];
      const got = h2.slice(startIdx, startIdx + expected.length);
      if (JSON.stringify(got) !== JSON.stringify(expected)) {
        bad(`locked heading set/order mismatch: ${JSON.stringify(got)}`);
        headingFailures.push(e.slug);
      }
    }

    const bandStart = html.indexOf("<h2>What is");
    const bandEnd = html.indexOf("Frequently asked questions about", bandStart);
    if (bandStart < 0 || bandEnd < 0) bad("could not locate the SEO band");
    const band = bandStart < 0 || bandEnd < 0 ? "" : html.slice(bandStart, bandEnd);

    // The accordion lives AFTER the FAQ heading, so the FAQ checks scope from that
    // heading to the end of the SEO section — scoping them to the What-is band
    // would find no buttons at all (and tool UIs elsewhere on the page can carry
    // their own accordions, so the whole page is the wrong scope too).
    const faqStart = html.indexOf("Frequently asked questions about");
    const faqEnd = faqStart < 0 ? -1 : html.indexOf("</section>", faqStart);
    const faqSlice = faqStart < 0 || faqEnd < 0 ? "" : html.slice(faqStart, faqEnd);
    if (!faqSlice) bad("could not locate the FAQ accordion in the built page");
    const collapsed = count(faqSlice, /aria-expanded="false"/g);
    const expanded = count(faqSlice, /aria-expanded="true"/g);
    const answers = count(faqSlice, /leading-relaxed/g);
    if (collapsed !== 5) bad(`${collapsed} collapsed FAQ buttons (expected 5)`);
    if (expanded !== 0) bad(`${expanded} FAQ items expanded on load`);
    if (answers !== 0) bad(`${answers} FAQ answer nodes rendered on load`);

    if (!/<h2[^>]*>\s*Privacy &amp; Security\s*<\/h2>/.test(html)) bad("privacy heading missing");
    if (!html.includes(PRIVACY_MARKER)) bad("privacy block text missing");
    if (count(band, /\*\*/g) !== 0) bad("** marker in the SEO band");
    const em = count(band, /<(strong|b|em|mark|i)[\s>/]/gi);
    if (em > 0) bad(`${em} emphasis tag(s) in the SEO band`);
    if (/\{\{/.test(band)) bad("unresolved {{slug|display}} syntax in the SEO band");

    const marker = html.indexOf(`data-related-tools="${cfg.marker}"`);
    const rowEnd = marker < 0 ? -1 : html.indexOf("</section>", marker);
    if (marker < 0 || rowEnd < 0) bad("related-tools row missing");
    else {
      const links = [...html.slice(marker, rowEnd).matchAll(/href="\/[a-z]+\/([a-z0-9-]+)"/g)].map((m) => m[1]);
      const picks = curated[e.slug];
      if (picks) {
        // Curated rows must render exactly as authored, in order.
        if (JSON.stringify(links) !== JSON.stringify(picks)) {
          bad(`related row ${JSON.stringify(links)} != curated ${JSON.stringify(picks)}`);
        }
      } else {
        // Domains that only curate some tools fill the rest by fallback, so the
        // expectation is a valid row rather than a specific list.
        fallbackRows.push(e.slug);
        if (links.length !== 4) bad(`${links.length} related links from the fallback row (expected 4)`);
        if (new Set(links).size !== links.length) bad("fallback related row has duplicates");
        for (const t of links) {
          if (!authored.has(t)) bad(`fallback related pick "${t}" is not an authored live slug`);
          if (t === e.slug) bad("fallback related row links to itself");
        }
      }
    }

    if (cfg.legacyFaqPattern && cfg.legacyFaqPattern.test(html)) bad("legacy registry FAQ still rendered");
    if (cfg.legacyFaqPattern) cfg.legacyFaqPattern.lastIndex = 0;
  }

  return { findings, graphInventory, optionalMissing, headingFailures, fallbackRows };
}

/**
 * Cross-check the registry-derived category for every page against the category
 * breadcrumb link that page actually renders. This is the guard against the
 * indentation-style parsing bug: if the registry parse is wrong, this disagrees.
 */
export function verifyCategoryMethod({ entries, pages, bySlug }) {
  const authored = new Set(entries.map((e) => e.slug));
  const findings = [];
  const observed = new Map(); // label -> Set(category slugs seen)
  let withoutLink = 0;

  for (const e of entries) {
    const html = pages.get(e.slug);
    if (!html) continue;
    const domain = e.slug && html.includes(`/audio/`) ? null : null;
    void domain;
    const cats = new Set(
      [...html.matchAll(/href="\/(audio|colors|typography)\/([a-z0-9-]+)"/g)]
        .map((m) => m[2])
        .filter((s) => !authored.has(s)),
    );
    const label = bySlug?.[e.slug];
    if (cats.size === 0) {
      withoutLink++;
      continue;
    }
    if (cats.size > 1) {
      findings.push(`${e.slug}: ${cats.size} distinct category links (${[...cats].join(", ")})`);
      continue;
    }
    const seen = [...cats][0];
    if (!observed.has(label)) observed.set(label, new Set());
    observed.get(label).add(seen);
    if (label && toSlug(label) !== seen) {
      findings.push(`${e.slug}: registry category "${label}" -> "${toSlug(label)}" but page links /${seen}`);
    }
  }

  const ambiguous = [...observed.entries()].filter(([, set]) => set.size !== 1);
  for (const [label, set] of ambiguous) {
    findings.push(`category "${label}" maps to several breadcrumb slugs: ${[...set].join(", ")}`);
  }
  if (withoutLink > 0) findings.push(`${withoutLink} page(s) had no category breadcrumb link to compare`);

  return { findings, observed, withoutLink };
}

// ── reporting ───────────────────────────────────────────────────────────────
function reportFor(cfg, { files, entries, graph, pagesResult, catVerify, pageCount }) {
  const L = [];
  const pct = (a, b) => (a + b === 0 ? "0.0" : ((a / (a + b)) * 100).toFixed(1));
  L.push(`# ${cfg.label} SEO — quality audit`);
  L.push("");
  L.push(`Generated by \`scripts/audit-seo-quality.mjs\` from ${entries.length} authored entries`);
  L.push(`across ${files.length} source files, checked against ${pageCount} built pages in`);
  L.push(`\`${cfg.builtDir}\`.`);
  L.push("");
  if (graph) {
    L.push("## A. Internal-link graph");
    L.push("");
    L.push("| measure | value |");
    L.push("|---|---|");
    // Count categories that actually have authored content, not registry labels:
    // a category holding only `soon` tools contributes no page and no breadcrumb,
    // so counting labels would overstate the authored spread (audio: 14 labels,
    // 13 with authored tools).
    const authoredCats = new Set(entries.map((e) => catVerify.bySlug?.[e.slug]).filter(Boolean));
    const registryCats = new Set(Object.values(catVerify.bySlug ?? {}));
    const soonOnly = registryCats.size - authoredCats.size;
    const catSuffix = registryCats.size !== authoredCats.size
      ? ` (${registryCats.size} registry categories; ${soonOnly} ${soonOnly === 1 ? "holds" : "hold"} only \`soon\` tools)`
      : "";
    L.push(`| authored tools | ${entries.length} across ${authoredCats.size} categories${catSuffix} |`);
    L.push(`| prose links (whenToUse) | ${graph.proseStats.total} total, ${(graph.proseStats.total / entries.length).toFixed(2)} per tool |`);
    L.push(`| related-row picks (curated) | ${graph.curatedTotal} total |`);
    L.push(`| inbound prose links | min ${graph.proseStats.min}, max ${graph.proseStats.max} |`);
    L.push(`| inbound (prose + curated, unique) | min ${graph.combStats.min}, max ${graph.combStats.max}, mean ${(graph.combStats.total / entries.length).toFixed(2)} |`);
    L.push(`| links staying in category | ${graph.sameCat} |`);
    L.push(`| links crossing category | ${graph.crossCat} (${pct(graph.crossCat, graph.sameCat)} %) |`);
    L.push(`| mutual prose pairs | ${graph.mutual} |`);
    L.push(`| prose links per tool | ${Object.keys(graph.linkHist).sort().map((k) => `${k}: ${graph.linkHist[k]}`).join(", ")} |`);
    L.push(`| curated related coverage | ${graph.uncurated.length === 0 ? "every tool" : `${entries.length - graph.uncurated.length}/${entries.length} tools curated, ${graph.uncurated.length} served by the same-category fallback`} |`);
    L.push(`| related-row picks (rendered) | ${graph.curatedTotal} total across ${entries.length - graph.noRenderedRow.length} page(s) |`);
    L.push(`| pages with no rendered related row | ${graph.noRenderedRow.length} |`);
    L.push("");
    L.push("### Orphans and thin pages");
    L.push("");
    L.push(`- **Orphaned (no inbound link at all): ${graph.orphans.length}**${graph.orphans.length ? ` — ${graph.orphans.join(", ")}` : ""}`);
    L.push(`- Thin (exactly one inbound link): ${graph.thin.length}${graph.thin.length ? ` — ${graph.thin.join(", ")}` : ""}`);
    L.push(`- No inbound **prose** link (${graph.proseOrphans.length}): ${graph.proseOrphans.join(", ") || "none"}`);
    L.push("");
    L.push("### Inbound distribution");
    L.push("");
    L.push("| inbound (prose + curated) | tools |");
    L.push("|---|---|");
    const hist = {};
    for (const set of graph.combinedIn.values()) hist[set.size] = (hist[set.size] || 0) + 1;
    for (const k of Object.keys(hist).map(Number).sort((a, b) => a - b)) L.push(`| ${k} | ${hist[k]} |`);
    L.push("");
    L.push("### Structural problems");
    L.push("");
    if (graph.problems.length) for (const p of graph.problems) L.push(`- ${p}`);
    else L.push("- none: every prose row has 3+ unique links and every curated row has 4 live non-self picks.");
    L.push("");
  }
  if (pagesResult) {
    L.push("## B. Built-page parity");
    L.push("");
    L.push(`Pages checked: ${entries.length - pagesResult.missingCount}. Failures: **${pagesResult.findings.length}**.`);
    if (pagesResult.fallbackRows?.length) {
      L.push(`Related rows validated as fallback output (no curated entry): ${pagesResult.fallbackRows.length}.`);
    }
    L.push("");
    L.push(`Required JSON-LD per page: ${cfg.requiredGraphs.join(", ")}.`);
    if (Object.keys(pagesResult.optionalMissing).length) {
      L.push("");
      L.push(`**Graphs absent on every page** (present on other domains, so a cross-domain`);
      L.push(`inconsistency rather than a per-page bug): ${Object.entries(pagesResult.optionalMissing).map(([k, v]) => `${k} (${v}/${entries.length})`).join(", ")}.`);
    }
    L.push("");
    L.push("Each page is also checked for exactly one `<h1>`, the five locked `<h2>`s in");
    L.push("order inside the SEO block, 5 collapsed FAQ buttons with 0 expanded and 0 answer");
    L.push("nodes in the band, the verbatim privacy block, no emphasis or unresolved");
    L.push("`{{slug|display}}` syntax in the band, and a related row equal to the curated picks.");
    L.push("");
    if (pagesResult.findings.length) for (const p of pagesResult.findings) L.push(`- ${p}`);
    else L.push("- none: every checked page passes.");
    L.push("");
  }
  if (catVerify) {
    L.push("## C. Category-extraction methodology");
    L.push("");
    L.push(`Each page's registry category was cross-checked against the category breadcrumb link`);
    L.push(`that page renders, so a wrong registry parse cannot silently distort the`);
    L.push(`cross-category figure above.`);
    L.push("");
    L.push("| registry category | breadcrumb slug observed |");
    L.push("|---|---|");
    for (const [label, set] of [...catVerify.observed.entries()].sort()) {
      L.push(`| ${label} | ${[...set].join(", ")} |`);
    }
    L.push("");
    if (catVerify.findings.length) for (const p of catVerify.findings) L.push(`- ${p}`);
    else L.push("- consistent: every page's breadcrumb matches its registry category.");
    L.push("");
  }
  return L.join("\n");
}

// ── self-test ───────────────────────────────────────────────────────────────
function selfTest() {
  const failures = [];
  const assert = (name, cond) => {
    if (!cond) failures.push(name);
    console.log(`  ${cond ? "\u2713" : "\u2717"} ${name}`);
  };

  console.log("self-test: fixture checks");

  // Fixture 1 — an entry nothing links to must be reported as an orphan, and its
  // removal must clear the finding. This is the class of gap the audio pass found.
  const mkEntry = (slug, links) => ({ slug, whenToUse: links.map((l) => `{{${l}|${l}}}`).join(" and ") });
  const entriesOrphaned = [
    mkEntry("alpha", ["beta", "gamma", "delta"]),
    mkEntry("beta", ["alpha", "gamma", "delta"]),
    mkEntry("gamma", ["alpha", "beta", "delta"]),
    mkEntry("delta", ["alpha", "beta", "gamma"]),
    mkEntry("orphan", ["alpha", "beta", "gamma"]),
  ];
  const curatedNoOrphan = {};
  for (const e of entriesOrphaned) curatedNoOrphan[e.slug] = ["alpha", "beta", "gamma", "delta"].filter((s) => s !== e.slug);
  const g1 = auditGraph({ entries: entriesOrphaned, curated: curatedNoOrphan, bySlug: {} });
  assert("orphan detection fires on an unreferenced page", g1.orphans.includes("orphan"));
  assert("an orphan is not also counted as thin", !g1.thin.includes("orphan"));

  // A page with exactly one inbound link must be reported as thin, not orphaned.
  // The pool needs six slugs so every curated row can avoid "lonely" and the
  // only route into it is one prose link from "alpha".
  const pool = ["alpha", "beta", "gamma", "delta", "epsilon"];
  const entriesThin = pool.map((s) => mkEntry(s, pool.filter((t) => t !== s)));
  entriesThin.push(mkEntry("lonely", ["alpha", "beta", "gamma"]));
  entriesThin[0] = mkEntry("alpha", ["beta", "gamma", "lonely"]);
  const curatedThin = {};
  for (const s of pool) curatedThin[s] = pool.filter((t) => t !== s);
  curatedThin.lonely = pool.slice(0, 4);
  const g1b = auditGraph({ entries: entriesThin, curated: curatedThin, bySlug: {} });
  assert("thin detection fires on a page with one inbound link", g1b.thin.includes("lonely"));
  assert("a thin page is not counted as orphaned", !g1b.orphans.includes("lonely"));
  assert("the thin fixture itself has no structural problems", g1b.problems.length === 0);

  const curatedFixed = { ...curatedNoOrphan, alpha: ["orphan", "beta", "gamma", "delta"] };
  const g2 = auditGraph({ entries: entriesOrphaned, curated: curatedFixed, bySlug: {} });
  assert("orphan finding clears once a link points at the page", !g2.orphans.includes("orphan"));

  const g3 = auditGraph({
    entries: [
      mkEntry("a", ["b", "c", "b"]),
      mkEntry("b", ["a", "c", "a"]),
      mkEntry("c", ["a", "b", "b"]),
      mkEntry("selfish", ["selfish", "a", "b"]),
    ],
    curated: {
      a: ["b", "c", "b", "c"],
      b: ["a", "c", "a", "c"],
      c: ["a", "b", "a", "b"],
      selfish: ["a", "b", "a", "b"],
    },
    bySlug: {},
  });
  assert("duplicate prose link detection fires", g3.problems.some((p) => p.includes("duplicate")));
  assert("self prose link detection fires", g3.problems.some((p) => p.includes("self prose link")));
  const g3b = auditGraph({
    entries: [mkEntry("a", ["b", "c"]), mkEntry("b", ["a", "c", "a"]), mkEntry("c", ["a", "b", "a"])],
    curated: { a: ["b", "c", "b", "c"], b: ["a", "c", "a", "c"], c: ["a", "b", "a", "b"] },
    bySlug: {},
  });
  assert("fewer than three prose links is caught", g3b.problems.some((p) => p.includes("minimum 3")));

  // A curated row that points at a slug with no authored entry must be caught.
  const g4 = auditGraph({
    entries: [mkEntry("a", ["b", "c", "d"]), mkEntry("b", ["a", "c", "d"]), mkEntry("c", ["a", "b", "d"]), mkEntry("d", ["a", "b", "c"])],
    curated: { a: ["b", "c", "d", "ghost"], b: ["a", "c", "d", "b"], c: ["a", "b", "d", "a"], d: ["a", "b", "c", "a"] },
    bySlug: {},
  });
  assert("curated pick to a non-authored slug is caught", g4.problems.some((p) => p.includes("not authored")));
  assert("curated pick pointing at itself is caught", g4.problems.some((p) => p.includes("points at itself")));

  // Fixture 2 — the duplicate-FAQPage class of bug found in the audio pass.
  const ldBlock = (type) => `<script type="application/ld+json">{"@type":"${type}"}</script>`;
  const good = ldBlock("FAQPage") + ldBlock("HowTo");
  const duplicated = ldBlock("FAQPage") + ldBlock("FAQPage") + ldBlock("HowTo");
  const missing = ldBlock("HowTo");
  assert(
    "one FAQPage + one HowTo passes",
    checkJsonLd(good, ["FAQPage", "HowTo"]).findings.length === 0,
  );
  assert(
    "duplicate FAQPage is caught",
    checkJsonLd(duplicated, ["FAQPage", "HowTo"]).findings.some((f) => f.includes("2 FAQPage")),
  );
  assert(
    "missing FAQPage is caught",
    checkJsonLd(missing, ["FAQPage", "HowTo"]).findings.some((f) => f.includes("0 FAQPage")),
  );
  assert(
    "a graph the domain never emits is reported as optional-missing",
    checkJsonLd(good, ["FAQPage", "HowTo"], ["BreadcrumbList"]).missingOptional.includes("BreadcrumbList"),
  );
  assert(
    "a duplicated optional graph is caught",
    checkJsonLd(
      ldBlock("BreadcrumbList") + ldBlock("BreadcrumbList") + good,
      ["FAQPage", "HowTo"],
      ["BreadcrumbList"],
    ).findings.some((f) => f.includes("2 BreadcrumbList")),
  );
  assert(
    "one copy of an optional graph is not a finding",
    checkJsonLd(
      ldBlock("BreadcrumbList") + good,
      ["FAQPage", "HowTo"],
      ["BreadcrumbList"],
    ).findings.length === 0,
  );
  assert(
    "unparseable JSON-LD is caught",
    checkJsonLd('<script type="application/ld+json">{oops}</script>', ["FAQPage"]).findings.some((f) =>
      f.includes("does not parse"),
    ),
  );

  console.log(failures.length ? `\n\u2717 self-test failed (${failures.length})` : "\n\u2713 self-test passed");
  process.exit(failures.length ? 1 : 0);
}

// ── main ────────────────────────────────────────────────────────────────────
function run() {
  if (OPTS.selfTest) return selfTest();

  const names =
    OPTS.domain === "all" ? Object.keys(DOMAINS) : OPTS.domain.split(",").map((s) => s.trim());
  const unknown = names.filter((n) => !DOMAINS[n]);
  if (unknown.length) {
    console.error(`unknown domain(s): ${unknown.join(", ")}. Known: ${Object.keys(DOMAINS).join(", ")}`);
    process.exit(2);
  }

  const outDir = join(ROOT, OPTS.outDir);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  let hardFailures = 0;
  for (const name of names) {
    const cfg = DOMAINS[name];
    const { files, entries } = readSources(cfg.sourceDir);
    const curated = parseCurated(cfg.relatedFile);
    const { bySlug, liveBySlug, ids, notes } = parseCategories(cfg);
    const slugs = entries.map((e) => e.slug);
    const authored = new Set(slugs);

    // Guard: a broken parse must never produce trusted numbers. The registry may
    // legitimately hold `soon` tools, so the reverse direction only requires that
    // every LIVE registry slug has authored content — which is exactly the
    // inventory invariant the batch rollout established.
    const missingCat = slugs.filter((s) => !bySlug[s]);
    if (missingCat.length) {
      console.error(`\n\u2717 ${cfg.label}: ${missingCat.length} authored slug(s) had no registry category — parse is wrong, aborting.`);
      console.error(`   first few: ${missingCat.slice(0, 8).join(", ")}`);
      process.exit(2);
    }
    const liveRegistry = Object.keys(bySlug).filter((s) => liveBySlug[s]);
    const unauthoredLive = liveRegistry.filter((s) => !authored.has(s));
    const soonCount = Object.keys(bySlug).length - liveRegistry.length;
    if (unauthoredLive.length) {
      console.error(`\n\u2717 ${cfg.label}: ${unauthoredLive.length} live registry slug(s) have no authored content — parse or inventory mismatch, aborting.`);
      console.error(`   first few: ${unauthoredLive.slice(0, 8).join(", ")}`);
      process.exit(2);
    }
    const authoredNotLive = slugs.filter((s) => !liveBySlug[s]);
    if (authoredNotLive.length) {
      console.error(`\n\u2717 ${cfg.label}: ${authoredNotLive.length} authored slug(s) are not live in the registry (e.g. ${authoredNotLive.slice(0, 3).join(", ")}) — parse or inventory mismatch, aborting.`);
      process.exit(2);
    }
    notes.push(
      `inventory: ${liveRegistry.length} live registry slugs = ${slugs.length} authored entries; ${soonCount} soon tool(s) excluded`,
    );

    const { pages, missing, builtCount } = readPages(cfg, slugs);
    const minProseLinks = readMinProseLinks(cfg);
    notes.push(`sibling-link minimum taken from ${cfg.validator}: ${minProseLinks}`);
    // Ground-truth related edges: what each page actually renders.
    const relatedBySlug = new Map();
    for (const [slug, html] of pages) {
      const m = html.indexOf(`data-related-tools="${cfg.marker}"`);
      if (m < 0) continue;
      const end = html.indexOf("</section>", m);
      relatedBySlug.set(
        slug,
        [...html.slice(m, end < 0 ? html.length : end).matchAll(/href="\/[a-z]+\/([a-z0-9-]+)"/g)].map((x) => x[1]),
      );
    }
    const graph = OPTS.pagesOnly ? null : auditGraph({ entries, curated, bySlug, minProseLinks, relatedBySlug });
    const pagesResult = OPTS.graphOnly
      ? null
      : (() => {
          const r = auditPages({ entries, curated, pages, cfg, optionalGraphs: cfg.optionalGraphs });
          return { ...r, missingCount: missing.length };
        })();
    const catVerify = OPTS.pagesOnly ? null : verifyCategoryMethod({ entries, pages, bySlug });

    const graphFailures =
      (graph?.problems.length ?? 0) +
      (cfg.gateGraph ? (graph?.orphans.length ?? 0) + (graph?.thin.length ?? 0) : 0);
    const parityFailures = pagesResult?.findings.length ?? 0;
    const catFailures = catVerify?.findings.filter((f) => !f.includes("no category breadcrumb")).length ?? 0;
    hardFailures += graphFailures + parityFailures + catFailures;

    const md = reportFor(cfg, {
      files, entries, graph, pagesResult,
      catVerify: catVerify ? { ...catVerify, bySlug } : null,
      pageCount: builtCount,
    });
    writeFileSync(join(outDir, cfg.report), md);

    console.log(`\n${cfg.label}`);
    console.log(`  entries ${entries.length} (${files.length} files) | categories ${ids.length} | built pages ${builtCount}`);
    if (graph) {
      console.log(`  prose links ${graph.proseStats.total} | inbound min ${graph.combStats.min} max ${graph.combStats.max} | cross-category ${graph.crossCat} (${((graph.crossCat / Math.max(1, graph.crossCat + graph.sameCat)) * 100).toFixed(1)}%)`);
      console.log(`  orphans ${graph.orphans.length}${graph.orphans.length ? `: ${graph.orphans.join(", ")}` : ""} | thin ${graph.thin.length}${graph.thin.length ? `: ${graph.thin.join(", ")}` : ""} | uncurated rows ${graph.uncurated.length}`);
      if (graph.problems.length) console.log(`  link problems:\n    ${graph.problems.join("\n    ")}`);
    }
    if (pagesResult) console.log(`  parity failures ${pagesResult.findings.length}${pagesResult.findings.length ? `:\n    ${pagesResult.findings.slice(0, 12).join("\n    ")}` : ""}`);
    if (catVerify) console.log(`  category cross-check: ${catVerify.findings.length ? `${catVerify.findings.length} finding(s): ${catVerify.findings.slice(0, 5).join("; ")}` : "consistent with the rendered breadcrumb"}`);
    if (notes.length) for (const n of notes) console.log(`  note: ${n}`);
    console.log(`  report -> ${OPTS.outDir}/${cfg.report}`);
    void missing;
  }

  if (hardFailures && !OPTS.reportOnly) {
    console.error(`\n\u2717 audit-seo-quality failed with ${hardFailures} gate failure(s).`);
    console.error(`  Re-run with --report-only to inspect without failing.`);
    process.exit(1);
  }
  console.log(`\n\u2713 audit-seo-quality: ${hardFailures} gate failure(s)${OPTS.reportOnly ? " (report-only)" : ""}`);
  process.exit(0);
}

run();
