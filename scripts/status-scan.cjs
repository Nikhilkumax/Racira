/**
 * READ-ONLY status scan. Classifies every registry entry into 5 buckets and
 * writes status_report.md + 4 status txt files to the project root.
 * Touches no component, registry, or _approved.json file.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REG_DIR = path.join(ROOT, "src/domains/calculator/registry");
const COMP_DIR = path.join(ROOT, "src/domains/calculator/components");
const LAZY = path.join(ROOT, "src/app/calculator/lazyComponents.tsx");

const STUBS = [
  '"Value A"',
  '"Value B"',
  "Coming Soon",
  "This calculator is planned",
  "planned for a future",
  "Back to Calculators",
];

function readRegistry() {
  const out = [];
  for (const f of fs.readdirSync(REG_DIR).filter((x) => x.endsWith(".ts"))) {
    const text = fs.readFileSync(path.join(REG_DIR, f), "utf8");
    for (const line of text.split("\n")) {
      const slug = line.match(/slug:\s*"([^"]+)"/);
      if (!slug) continue;
      const name = line.match(/name:\s*"([^"]*)"/);
      const cat = line.match(/category:\s*"([^"]*)"/);
      const st = line.match(/status:\s*"([^"]*)"/);
      out.push({
        slug: slug[1],
        name: name ? name[1] : slug[1],
        category: cat ? cat[1] : f.replace(/\.ts$/, ""),
        status: st ? st[1] : "unknown",
      });
    }
  }
  return out;
}

function readLazyMap() {
  const text = fs.readFileSync(LAZY, "utf8");
  const map = {};
  const re =
    /"([^"]+)":\s*\(\)\s*=>\s*import\("@\/domains\/calculator\/components\/([^"]+)"\)/g;
  let m;
  while ((m = re.exec(text))) map[m[1]] = m[2];
  return map;
}

const pascalFromSlug = (slug) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");

function seoWordCount(text) {
  let words = 0;
  const re = /<(p|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(text))) {
    const inner = m[2]
      .replace(/\{[\s\S]*?\}/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .trim();
    if (inner) words += inner.split(/\s+/).filter(Boolean).length;
  }
  return words;
}

const cache = new Map();
function inspect(componentName) {
  if (cache.has(componentName)) return cache.get(componentName);
  const file = path.join(COMP_DIR, componentName + ".tsx");
  let info = { exists: false };
  if (fs.existsSync(file)) {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch (err) {
      info = { exists: true, unreadable: err.message };
      cache.set(componentName, info);
      return info;
    }
    info = {
      exists: true,
      size: Buffer.byteLength(text),
      stub: STUBS.filter((s) => text.includes(s)),
      recharts: /from\s+"recharts"/.test(text),
      calcButton: /Calculate/.test(text),
      exactCalcLabel: />\s*Calculate\s*</.test(text),
      primaryCard: /border-l-4\s+border-primary/.test(text),
      subtitle: /<h1[\s\S]{0,400}?<\/h1>\s*\n?\s*<p[^>]*>/.test(text),
      grouped: /uppercase tracking-wide text-muted-foreground/.test(text),
      advanced: /Advanced Options/.test(text),
      h2ok: !/<h2\b/.test(text) || /<h2 className="text-2xl font-bold mb-3"/.test(text),
      seoWords: seoWordCount(text),
    };
  }
  cache.set(componentName, info);
  return info;
}

function resolveComponent(entry, lazyMap) {
  if (lazyMap[entry.slug]) return lazyMap[entry.slug].split("/").pop();
  const guess = pascalFromSlug(entry.slug);
  if (fs.existsSync(path.join(COMP_DIR, guess + ".tsx"))) return guess;
  return null;
}

// ---- run ----
const entries = readRegistry();
const lazyMap = readLazyMap();
const approvedRaw = fs
  .readFileSync(path.join(COMP_DIR, "_approved.json"), "utf8")
  .replace(/^﻿/, "");
const approved = new Set(JSON.parse(approvedRaw).approved);

const seen = new Set();
const registry = [];
for (const e of entries) {
  if (seen.has(e.slug)) continue;
  seen.add(e.slug);
  registry.push(e);
}

const B = { complete: [], liveNotApproved: [], polish: [], rebuild: [], notBuilt: [], unknown: [] };

for (const e of registry) {
  const comp = resolveComponent(e, lazyMap);
  const info = comp ? inspect(comp) : { exists: false };

  if (!comp || !info.exists) {
    B.notBuilt.push({ ...e });
    continue;
  }
  if (info.unreadable) {
    B.unknown.push({ ...e, comp, err: info.unreadable });
    continue;
  }

  const isApproved = approved.has(comp) || approved.has(comp.replace(/\.tsx$/, ""));

  // ✅ APPROVED & COMPLETE
  if (isApproved && e.status === "live" && info.stub.length === 0) {
    B.complete.push({ ...e, comp });
    continue;
  }

  // core checks
  const core = [];
  if (info.stub.length) core.push(`stub placeholder (contains "${info.stub[0].replace(/"/g, "")}")`);
  if (info.size < 8192) core.push(`file < 8KB (${(info.size / 1024).toFixed(1)}KB)`);
  if (!info.recharts) core.push("no Recharts import");
  if (!info.calcButton) core.push("no Calculate button");
  if (!info.primaryCard) core.push("missing Primary Result Card pattern");
  if (e.status === "soon") core.push('status: "soon" in registry');

  if (core.length) {
    B.rebuild.push({ ...e, comp, reason: core[0], all: core });
    continue;
  }

  // surface checks
  const surface = [];
  if (info.seoWords < 500) surface.push(`SEO: ${info.seoWords} words (needs 500)`);
  if (!info.h2ok) surface.push("H2 className not exactly `text-2xl font-bold mb-3`");
  if (!info.exactCalcLabel) surface.push("button label not exactly `Calculate`");
  if (info.subtitle) surface.push("subtitle under H1");
  if (info.advanced && !info.grouped) surface.push("Advanced Options not grouped into labeled sub-sections");

  if (surface.length) B.polish.push({ ...e, comp, issues: surface.slice(0, 5) });
  else if (e.status === "live") B.liveNotApproved.push({ ...e, comp, info });
  else B.liveNotApproved.push({ ...e, comp, info });
}

const files = fs.readdirSync(COMP_DIR).filter((f) => f.endsWith(".tsx"));
const totalAction =
  B.liveNotApproved.length + B.polish.length + B.rebuild.length + B.notBuilt.length;

const bar = "━".repeat(53);
const dash = "─".repeat(53);
const pad = (n) => String(n).padStart(5);
const alpha = (a, b) => (a.name || a.slug).localeCompare(b.name || b.slug);

let head = "";
head += bar + "\n";
head += "RACIRA CALCULATOR — STATUS REPORT\n";
head += `Generated: ${process.env.SCAN_STAMP || "(unstamped)"}\n`;
head += bar + "\n";
head += `Total registry entries:     ${pad(registry.length)}\n`;
head += `Total component files:      ${pad(files.length)}\n`;
head += `Approved (_approved.json):  ${pad(approved.size)}\n`;
head += dash + "\n";
head += `✅ Approved & Complete:     ${pad(B.complete.length)}\n`;
head += `🟢 Live / Not Approved:     ${pad(B.liveNotApproved.length)}\n`;
head += `🟠 Needs Polish:            ${pad(B.polish.length)}\n`;
head += `🔴 Needs Rebuild:           ${pad(B.rebuild.length)}\n`;
head += `🟡 Not Built:               ${pad(B.notBuilt.length)}\n`;
if (B.unknown.length) head += `❓ Unknown (unreadable):    ${pad(B.unknown.length)}\n`;
head += dash + "\n";
head += `Total action needed:        ${pad(totalAction)}\n`;
head += bar + "\n";

console.log(head);
const tally = (list, key) => {
  const c = {};
  list.forEach((r) => {
    const v = r[key];
    (Array.isArray(v) ? v : [v]).forEach((x) => (c[x] = (c[x] || 0) + 1));
  });
  return c;
};
console.log("REBUILD reasons:", JSON.stringify(tally(B.rebuild, "reason"), null, 1));
console.log("POLISH issues:", JSON.stringify(tally(B.polish, "issues"), null, 1));
console.log("NOT BUILT by category:", JSON.stringify(tally(B.notBuilt, "category"), null, 1));

// ---- write outputs ----
const R = (p) => path.join(ROOT, p);
const W = (p, s) => fs.writeFileSync(R(p), s, "utf8");

W("status_approved.txt", B.complete.slice().sort(alpha).map((c) => c.slug).join("\n") + "\n");
W("status_live_not_approved.txt", B.liveNotApproved.slice().sort(alpha).map((c) => c.slug).join("\n") + "\n");
W("status_polish.txt", B.polish.slice().sort(alpha).map((c) => `${c.slug} — ${c.issues.join(", ")}`).join("\n") + "\n");
W("status_rebuild.txt", B.rebuild.slice().sort(alpha).map((c) => `${c.slug} — ${c.reason}`).join("\n") + "\n");
W("status_not_built.txt", B.notBuilt.slice().sort(alpha).map((c) => `${c.slug} — ${c.category}`).join("\n") + "\n");

let md = head;
const section = (title, list, fmt) => {
  md += "\n\n" + bar + "\n" + `${title} (${list.length})\n` + bar + "\n";
  md += list.slice().sort(alpha).map((c) => "  • " + fmt(c)).join("\n") + "\n";
};
section("✅ APPROVED & COMPLETE", B.complete, (c) => c.comp);
section("🟢 LIVE / NOT APPROVED", B.liveNotApproved, (c) =>
  `${c.comp} — [${(c.info.size / 1024).toFixed(1)}KB, has Recharts: ${c.info.recharts ? "yes" : "no"}]`);
section("🟠 NEEDS POLISH", B.polish, (c) => `${c.comp} — ${c.issues.join(", ")}`);
section("🔴 NEEDS REBUILD", B.rebuild, (c) => `${c.comp} — ${c.reason}`);
section("🟡 NOT BUILT", B.notBuilt, (c) => `${c.slug} (registry category: ${c.category})`);
if (B.unknown.length) section("❓ UNKNOWN", B.unknown, (c) => `${c.comp} — ${c.err}`);
W("status_report.md", md);

console.log("\nWrote status_report.md + status_approved/live_not_approved/polish/rebuild/not_built .txt");
