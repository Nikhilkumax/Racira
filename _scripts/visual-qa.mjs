#!/usr/bin/env node
/**
 * visual-qa.mjs — Domain-agnostic visual/layout QA sweep.
 *
 * Visits every live route of a domain at configurable viewport widths and
 * measures, via DOM (not screenshots):
 *   BUG    page-level horizontal overflow (doc scrollWidth > viewport)
 *   BUG    elements poking past the right viewport edge with no scroll ancestor
 *   BUG    zero-sized elements that carry their own text (silent render loss)
 *   BUG    overflow-hidden elements that clip text (scrollWidth > clientWidth)
 *   INFO   tables that scroll internally (intended affordance)
 *   INFO   children extending past their parent (non-scrolling, inside viewport)
 *
 * Route lists are resolved from each domain's own registry:
 *   cad        → categories in registry.ts + ACTIVE_SLUGS (live tool slugs)
 *   developers → 18 categories + all tools (316, all live via the built set)
 *   pdf        → subcategories + tools with status "live" in tools.ts
 *
 * Usage:
 *   node _scripts/visual-qa.mjs --domain=cad [--vw=375 --vw=768 --vw=1440]
 *                                [--shards=2 --shard=0]
 *                                [--routes=/cad/foo,/cad/bar] [--no-index]
 *
 * NOTE (Git Bash / MSYS): leading-slash values like --routes=/cad/foo are
 * rewritten to Windows paths by path conversion. For spot checks run with
 *   MSYS_NO_PATHCONV=1 node _scripts/visual-qa.mjs --routes=/cad/foo …
 * or just run a full-domain sweep (the intended mode) which needs no args.
 * Exit code = number of BUG entries (0 = clean). Screenshots of buggy states
 * are saved under .qa-screens/. A JSON snapshot is written to report.json there
 * when the sweep is run with --json.
 */
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const SHOT_DIR = resolve(ROOT, ".qa-screens");
mkdirSync(SHOT_DIR, { recursive: true });

const toSlug = (t) =>
  String(t)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ── Route resolution per domain ──────────────────────────────────
function resolveDomain(domain) {
  if (domain === "cad") {
    const regSrc = readFileSync(resolve(ROOT, "src/domains/cad/registry.ts"), "utf-8");
    const categories = [];
    let currentCat = null;
    for (const line of regSrc.split(/\r?\n/)) {
      const catMatch = line.match(/cat\("([^"]+)",\s*\[/);
      if (catMatch) {
        currentCat = { title: catMatch[1], tools: [] };
        categories.push(currentCat);
        continue;
      }
      const toolMatch = line.match(/\[\s*"([^"]+)",\s*"([^"]*)"\s*\]/);
      if (toolMatch && currentCat) currentCat.tools.push(toolMatch[1]);
    }
    const activeMatch = regSrc.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/);
    const activeBody = (activeMatch ? activeMatch[1] : "").replace(/\/\/[^\r\n]*/g, "");
    const active = new Set(activeBody.split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean));
    const cats = categories.map((c) => `/cad/${toSlug(c.title)}`);
    const tools = [];
    for (const c of categories) for (const name of c.tools) {
      const s = toSlug(name);
      if (active.has(s)) tools.push(`/cad/${s}`);
    }
    return { index: "/cad", cats, tools };
  }

  if (domain === "developers") {
    const src = readFileSync(resolve(ROOT, "src/domains/developers/registry.ts"), "utf-8");
    const built = new Set(
      ((src.match(/const built = new Set\(\[([\s\S]*?)\]\)/) || [])[1] || "")
        .split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean)
    );
    let cat = null;
    const names = [];
    for (const line of src.split(/\r?\n/)) {
      const cm = line.match(/^  "([^"]+)": \[/);
      if (cm) { cat = cm[1]; continue; }
      if (cat) {
        const nm = line.match(/\["([^"]+)"/);
        if (nm) names.push({ cat, name: nm[1] });
        if (/^\s*\],/.test(line)) cat = null;
      }
    }
    const cats = [...new Set(names.map((n) => n.cat))].map((c) => `/developers/${toSlug(c)}`);
    const tools = [];
    for (const { name } of names) {
      const s = toSlug(name);
      // All 316 tools are built today; guard anyway so a future "soon" works.
      if (built.size === 0 || built.has(s)) tools.push(`/developers/${s}`);
    }
    return { index: "/developers", cats, tools };
  }

  if (domain === "pdf") {
    const src = readFileSync(resolve(ROOT, "src/domains/pdf/registry/tools.ts"), "utf-8");
    const tools = [];
    const subcats = new Set();
    const entryRe = /\{\s*name:\s*["'][^"']+["'][\s\S]*?slug:\s*["']([^"']+)["'][\s\S]*?status:\s*["']([^"']+)["'][\s\S]*?subCategory:\s*["']([^"']*)["']/g;
    let m;
    while ((m = entryRe.exec(src))) {
      const [, slug, status, sub] = m;
      if (sub) subcats.add(sub);
      if (status === "live") tools.push(`/pdf/${slug}`);
    }
    const cats = [...subcats].map((c) => `/pdf/${toSlug(c)}`);
    return { index: "/pdf", cats, tools };
  }

  throw new Error(`Unknown domain "${domain}"`);
}

// ── CLI ───────────────────────────────────────────────────────────
const args = process.argv;
const domain = (args.find((a) => a.startsWith("--domain=")) || "--domain=cad").slice(9);
const wanted = args.filter((a) => a.startsWith("--vw=")).map((a) => a.slice(5));
const ALL_VIEWPORTS = [
  { w: 375, h: 812, label: "375" },
  { w: 768, h: 1024, label: "768" },
  { w: 1440, h: 900, label: "1440" },
];
const VIEWPORTS = wanted.length ? ALL_VIEWPORTS.filter((v) => wanted.includes(v.label)) : ALL_VIEWPORTS;
const routesArg = args.find((a) => a.startsWith("--routes="));
const explicitRoutes = routesArg ? routesArg.slice(9).split(",") : null;
const noIndex = args.includes("--no-index");
const noCats = args.includes("--no-cats");
const jsonOut = args.includes("--json");
const printRoutes = args.includes("--print-routes");

const { index, cats, tools } = resolveDomain(domain);
let routes = [];
if (explicitRoutes) {
  routes = explicitRoutes;
} else {
  if (!noIndex) routes.push(index);
  if (!noCats) routes.push(...cats);
  routes.push(...tools);
}
const shards = +(args.find((a) => a.startsWith("--shards=")) || "--shards=1").slice(9);
const shard = +(args.find((a) => a.startsWith("--shard=")) || "--shard=0").slice(8);
if (shards > 1) routes = routes.filter((_, i) => i % shards === shard);

console.error(`domain=${domain} routes=${routes.length} (${routes[0]} … ${routes[routes.length - 1]}) viewports=${VIEWPORTS.map((v) => v.label).join(",")}`);
if (printRoutes) {
  console.log(routes.join("\n"));
  process.exit(0);
}

// ── Injected metric collector ─────────────────────────────────────
const METRICS = () => {
  const out = { docOverflowX: 0, bugs: [], infos: [] };
  const vw = document.documentElement.clientWidth;
  const de = document.documentElement;
  out.docOverflowX = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0) - vw;
  if (out.docOverflowX > 0) out.bugs.push(`PAGE horizontal overflow ${out.docOverflowX}px`);

  const xScrollable = (el) => {
    const cs = getComputedStyle(el);
    return (cs.overflowX === "auto" || cs.overflowX === "scroll" || cs.overflowX === "overlay") &&
      el.scrollWidth > el.clientWidth + 1;
  };
  const shown = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
    return el.getClientRects().length > 0;
  };
  const ownText = (el) => {
    let t = "";
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent;
    return t.trim();
  };
  const SKIP_TAG = new Set(["html", "body", "br", "script", "style", "template", "noscript", "svg", "path"]);
  const describe = (el) => {
    const r = el.getBoundingClientRect();
    const cls = String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className);
    return `${el.tagName.toLowerCase()}.${cls.split(" ").filter(Boolean).slice(0, 3).join(".") || "?"}` +
      ` x=${Math.round(r.left)} w=${Math.round(r.width)}` +
      (ownText(el) ? ` text="${ownText(el).slice(0, 40)}"` : "");
  };

  const es = Array.from(document.querySelectorAll("body *"));
  const tallies = { offender: 0, zeroText: 0, clipText: 0, scrollTable: 0, outParent: 0 };

  for (const el of es) {
    if (!shown(el)) continue;
    if (SKIP_TAG.has(el.tagName.toLowerCase())) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    if ((r.width < 1 || r.height < 1) && ownText(el).length > 0) {
      if (tallies.zeroText < 8) out.bugs.push(`ZERO-SIZE text: ${describe(el)}`);
      tallies.zeroText++;
      continue;
    }

    if (r.right > vw + 1 && !xScrollable(el)) {
      let p = el.parentElement, inside = false;
      while (p && p !== document.body) {
        if (xScrollable(p)) { inside = true; break; }
        p = p.parentElement;
      }
      if (!inside) {
        if (tallies.offender < 8) out.bugs.push(`RIGHT-OFFENDER: ${describe(el)} right=${Math.round(r.right)}px > vw ${vw}`);
        tallies.offender++;
      }
    }

    if ((cs.overflowX === "hidden" || cs.overflowX === "clip") && el.scrollWidth > el.clientWidth + 2) {
      if (tallies.clipText < 8) out.infos.push(`CLIPPED-X: ${describe(el)} scrollW=${el.scrollWidth} clientW=${el.clientWidth}`);
      tallies.clipText++;
    }

    if (xScrollable(el) && el.querySelector("table")) {
      if (tallies.scrollTable < 12) out.infos.push(`scroll-table: ${el.tagName.toLowerCase()} clientW=${el.clientWidth} scrollW=${el.scrollWidth}`);
      tallies.scrollTable++;
    }

    if (el.parentElement && shown(el.parentElement)) {
      const pr = el.parentElement.getBoundingClientRect();
      const pcs = getComputedStyle(el.parentElement);
      const pos = cs.position;
      if (
        pr.width > 40 && r.width > 0 &&
        r.right > pr.right + 8 &&
        !xScrollable(el.parentElement) &&
        pcs.overflowX !== "hidden" && pcs.overflowX !== "clip" &&
        pos !== "fixed" && pos !== "absolute"
      ) {
        if (tallies.outParent < 8) out.infos.push(`OVERFLOWS-PARENT: ${describe(el)} vs parent ${describe(el.parentElement)}`);
        tallies.outParent++;
      }
    }
  }
  return out;
};

// ── Run ───────────────────────────────────────────────────────────
const base = process.env.BASE_URL || "http://localhost:3002";
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(90000);

const results = [];
let bugCount = 0;
let n = 0;
for (const route of routes) {
  n++;
  for (const vp of VIEWPORTS) {
    console.error(`[${n}/${routes.length}] ${route} @${vp.label}`);
    await page.setViewportSize({ width: vp.w, height: vp.h });
    const resp = await page.goto(base + route, { waitUntil: "domcontentloaded" });
    if (!resp || resp.status() !== 200) {
      results.push({ route, vp: vp.label, status: resp ? resp.status() : "no-resp", bugs: ["HTTP " + (resp ? resp.status() : "?")] });
      bugCount++;
      continue;
    }
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
    await page.waitForTimeout(600);
    const m = await page.evaluate(METRICS);
    const entry = { route, vp: vp.label, docX: m.docOverflowX, bugs: m.bugs, infos: m.infos };
    results.push(entry);
    if (m.bugs.length) {
      bugCount += m.bugs.length;
      const shot = `${SHOT_DIR}/${domain}_${route.replace(/\//g, "_")}@${vp.label}.png`;
      await page.screenshot({ path: shot, fullPage: m.docOverflowX > 0 });
      entry.shot = shot;
    }
  }
}

await browser.close();

// ── Report ────────────────────────────────────────────────────────
for (const r of results) {
  const flag = r.bugs.length ? "BUG " : r.docX > 0 ? "OVF " : "ok  ";
  const bugs = r.bugs.join(" | ");
  const infos = r.infos.length ? `  [${r.infos.slice(0, 3).join("; ")}${r.infos.length > 3 ? ` +${r.infos.length - 3}` : ""}]` : "";
  console.log(`${flag} ${r.route} @${r.vp}${r.docX ? ` docX=${r.docX}` : ""}${bugs ? "  " + bugs : ""}${infos}`);
}
console.log(`\nTotal BUG entries: ${bugCount}`);
if (jsonOut) writeFileSync(resolve(SHOT_DIR, `${domain}-report.json`), JSON.stringify(results, null, 2));
process.exit(bugCount ? 1 : 0);
