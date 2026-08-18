/**
 * RACIRA CALCULATOR — PHASE 1 STATUS SCAN (read-only)
 *
 * Classifies every registry entry into 5 buckets per the owner spec:
 *   ✅ Approved & Complete | 🟢 Live / Not Approved | 🟠 Needs Polish
 *   🔴 Needs Rebuild | 🟡 Not Built
 *
 * Writes to project root:
 *   status_report.md, status_live_not_approved.txt, status_polish.txt,
 *   status_rebuild.txt, status_not_built.txt
 *
 * Touches no component, registry, or _approved.json file.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REG_DIR = path.join(ROOT, "src/domains/calculator/registry");
const COMP_DIR = path.join(ROOT, "src/domains/calculator/components");
const LAZY = path.join(ROOT, "src/app/calculator/lazyComponents.tsx");
const APPROVED_FILE = path.join(COMP_DIR, "_approved.json");

// ---- stub patterns ----
// "Value A" / "Value B" — quoted or rendered as JSX text (avoids "Value Added" false positives)
const VALUE_AB_RE = /["'>]Value [AB]["'<]/;
// Coming-soon / planned UI phrases
const PLANNED_RE = /Coming Soon|This calculator is planned|planned for a future|Back to Calculators/;
// 5 patterns listed in the spec's Approved & Complete definition
const APPROVED_STUB_RE = /["'>]Value [AB]["'<]|Coming Soon|This calculator is planned|Back to Calculators/;

// ---- registry (handles both single-line and multi-line entry objects) ----
function readRegistry() {
  const out = [];
  for (const f of fs.readdirSync(REG_DIR).filter((x) => x.endsWith(".ts"))) {
    const text = fs.readFileSync(path.join(REG_DIR, f), "utf8");
    for (const block of text.split(/\{\s*slug:/).slice(1)) {
      const slug = block.match(/^\s*"([^"]+)"/);
      if (!slug) continue;
      const name = block.match(/name:\s*"([^"]*)"/);
      const cat = block.match(/category:\s*"([^"]*)"/);
      const st = block.match(/status:\s*"([^"]*)"/);
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

// ---- slug -> component file (lazy map is authoritative, heuristic fallback) ----
function readLazyMap() {
  const text = fs.readFileSync(LAZY, "utf8");
  const map = {};
  const re = /"([^"]+)":\s*\(\)\s*=>\s*import\("@\/domains\/calculator\/components\/([^"]+)"\)/g;
  let m;
  while ((m = re.exec(text))) map[m[1]] = m[2].split("/").pop().replace(/\.tsx$/, "");
  return map;
}

const pascalFromSlug = (slug) =>
  slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

function resolveComponent(entry, lazyMap, tsxSet) {
  if (lazyMap[entry.slug]) return lazyMap[entry.slug];
  const p = pascalFromSlug(entry.slug);
  for (const c of [p, p + "Calculator", p + "Calc", p + "Full", p + "CalculatorFull"]) {
    if (tsxSet.has(c)) return c;
  }
  return null;
}

// ---- per-file inspection ----
function extractButtonTexts(content) {
  const texts = [];
  const re = /<(?:button|Button)\b((?:[^>{]|\{[^}]*\})*)>([\s\S]*?)<\/(?:button|Button)>/gi;
  let m;
  while ((m = re.exec(content))) {
    const t = m[2]
      .replace(/<[^>]*>/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (t) texts.push(t);
  }
  return texts;
}

function hasSubtitleUnderH1(content) {
  const m = content.match(/<h1\b[\s\S]*?<\/h1>/i);
  if (!m) return false;
  const after = content.slice(m.index + m[0].length, m.index + m[0].length + 700);
  const pMatch = after.match(/<\s*p\b/i);
  if (!pMatch) return false;
  const before = after.slice(0, pMatch.index);
  return !/<\s*(?:input|select|label)\b/i.test(before);
}

function inspectFile(comp) {
  const file = path.join(COMP_DIR, comp + ".tsx");
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf8");
  const sizeKB = Buffer.byteLength(text, "utf8") / 1024;

  const hasValueAB = VALUE_AB_RE.test(text);
  const hasPlanned = PLANNED_RE.test(text);
  const hasRecharts = /from\s+["']recharts["']|import\s*\(\s*["']recharts["']/.test(text);
  const hasPrimaryCard =
    /bg-primary\/10/.test(text) && /border-l-4/.test(text) && /\bborder-primary\b/.test(text);

  const btnTexts = extractButtonTexts(text);
  const hasCalculate = btnTexts.some((t) => /^calculat/i.test(t.trim()));
  const calcButtons = btnTexts.filter((t) => /^calculat/i.test(t.trim()));
  const calcLabelWrong = calcButtons.length > 0 && calcButtons.every((t) => t.trim() !== "Calculate");

  const hasAdvUI = />\s*Advanced Options|Advanced Options\s*<|Advanced Options\s*\{|Advanced Options\s*<\/|{\/\*\s*Advanced Options/.test(text);
  const hasGroupLabel =
    /text-xs uppercase tracking-wide text-muted-foreground/.test(text) ||
    /text-\[11px\] font-bold uppercase tracking-wider text-muted-foreground/.test(text);

  return {
    text,
    sizeKB,
    hasValueAB,
    hasPlanned,
    hasRecharts,
    hasPrimaryCard,
    hasCalculate,
    calcLabelWrong,
    hasAdvUI,
    hasGroupLabel,
  };
}

// ---- classification ----
const registryRaw = readRegistry();
const lazyMap = readLazyMap();
const tsxFiles = fs
  .readdirSync(COMP_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));
const tsxSet = new Set(tsxFiles);

const approvedRaw = fs
  .readFileSync(APPROVED_FILE, "utf8")
  .replace(/^\uFEFF/, "");
const approvedList = JSON.parse(approvedRaw).approved;
const approvedSet = new Set(approvedList.map((s) => s.replace(/\.tsx$/, "")));

// dedupe registry by slug (first wins)
const seen = new Set();
const registry = [];
for (const e of registryRaw) {
  if (seen.has(e.slug)) continue;
  seen.add(e.slug);
  registry.push(e);
}

const B = { complete: [], liveNotApproved: [], polish: [], rebuild: [], notBuilt: [] };

for (const e of registry) {
  const comp = resolveComponent(e, lazyMap, tsxSet);
  if (!comp) {
    B.notBuilt.push({ slug: e.slug, category: e.category, name: e.name });
    continue;
  }

  const info = inspectFile(comp);
  const isApproved = approvedSet.has(comp);

  // ✅ APPROVED & COMPLETE — approved + live + file exists + no stub patterns
  if (isApproved && e.status === "live" && !APPROVED_STUB_RE.test(info.text)) {
    B.complete.push({ slug: e.slug, comp, name: e.name });
    continue;
  }

  // core checks (spec order)
  const core = [];
  if (info.hasValueAB) core.push('stub placeholder ("Value A"/"Value B")');
  if (info.sizeKB < 8) core.push(`file < 8KB (${info.sizeKB.toFixed(1)}KB)`);
  if (!info.hasRecharts) core.push("no Recharts import");
  if (!info.hasCalculate) core.push("no Calculate button");
  if (info.hasPlanned) core.push("Coming Soon / planned UI");
  if (e.status !== "live") core.push(`status "${e.status}" in registry`);
  if (!info.hasPrimaryCard) core.push("missing Primary Result Card pattern");

  if (core.length) {
    B.rebuild.push({ slug: e.slug, comp, name: e.name, reason: core[0], all: core });
    continue;
  }

  // surface checks
  const surface = [];
  if (info.calcLabelWrong) surface.push("button label not exactly `Calculate`");
  if (hasSubtitleUnderH1(info.text)) surface.push("subtitle under H1");
  if (info.hasAdvUI && !info.hasGroupLabel)
    surface.push("Advanced Options not grouped into labeled sub-sections");
  if (/useState\(\s*["']0["']\s*\)|defaultValue=\s*["']0["']/.test(info.text))
    surface.push("minor default value (0 instead of realistic)");

  if (surface.length) {
    B.polish.push({ slug: e.slug, comp, name: e.name, issues: surface.slice(0, 5) });
  } else {
    B.liveNotApproved.push({ slug: e.slug, comp, name: e.name, info });
  }
}

// ---- report ----
const bar = "━".repeat(53);
const dash = "─".repeat(53);
const pad = (n) => String(n).padStart(5);
const alphaName = (a, b) => (a.name || a.slug).localeCompare(b.name || b.slug);
const alphaSlug = (a, b) => a.slug.localeCompare(b.slug);

const totalAction =
  B.liveNotApproved.length + B.polish.length + B.rebuild.length + B.notBuilt.length;

let out = "";
out += bar + "\n";
out += "RACIRA CALCULATOR — STATUS REPORT\n";
out += bar + "\n";
out += `Total registry entries:       ${pad(registry.length)}\n`;
out += `Total component files:        ${pad(tsxFiles.length)}\n`;
out += `Approved (_approved.json):     ${pad(approvedList.length)}\n`;
out += dash + "\n";
out += `✅ Approved & Complete:         ${pad(B.complete.length)}\n`;
out += `🟢 Live / Not Approved:         ${pad(B.liveNotApproved.length)}\n`;
out += `🟠 Needs Polish:                ${pad(B.polish.length)}\n`;
out += `🔴 Needs Rebuild:               ${pad(B.rebuild.length)}\n`;
out += `🟡 Not Built:                   ${pad(B.notBuilt.length)}\n`;
out += dash + "\n";
out += `Total action needed:            ${pad(totalAction)}\n`;
out += bar + "\n";

// section builders
const liveList = B.liveNotApproved.slice().sort(alphaName).map((c) => `  • ${c.comp}`);
const polishList = B.polish.slice().sort(alphaName).map((c) => `  • ${c.comp} — ${c.issues.join(", ")}`);
const rebuildList = B.rebuild.slice().sort(alphaName).map((c) => `  • ${c.comp} — ${c.reason}`);
const notBuiltList = B.notBuilt.slice().sort(alphaSlug).map((c) => `  • ${c.slug} — [${c.category}]`);

out += `\n🟢 LIVE / NOT APPROVED (${B.liveNotApproved.length})\n${liveList.join("\n")}\n`;
out += `\n🟠 NEEDS POLISH (${B.polish.length})\n${polishList.join("\n")}\n`;
out += `\n🔴 NEEDS REBUILD (${B.rebuild.length})\n${rebuildList.join("\n")}\n`;
out += `\n🟡 NOT BUILT (${B.notBuilt.length})\n${notBuiltList.join("\n")}\n`;

// ---- write outputs ----
const W = (p, s) => fs.writeFileSync(path.join(ROOT, p), s, "utf8");
W("status_report.md", out);
W("status_live_not_approved.txt", B.liveNotApproved.map((c) => c.slug).join("\n") + "\n");
W(
  "status_polish.txt",
  B.polish.map((c) => `${c.slug} — ${c.issues.join(", ")}`).join("\n") + "\n"
);
W("status_rebuild.txt", B.rebuild.map((c) => `${c.slug} — ${c.reason}`).join("\n") + "\n");
W("status_not_built.txt", B.notBuilt.map((c) => `${c.slug} — ${c.category}`).join("\n") + "\n");

console.log(out);

// ---- console summaries ----
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
console.log("\nWrote status_report.md + status_live_not_approved/polish/rebuild/not_built .txt");
