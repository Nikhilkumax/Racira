// RACIRA CALCULATOR — PHASE 1 STATUS SCAN (read-only over source)
// Buckets: ✅ Approved & Complete | 🟢 Live/Not Approved | 🟠 Needs Polish |
//          🔴 Needs Rebuild | 🟡 Not Built
// Writes the 5 status outputs into the project root. Run from racira-nextjs/.
const fs = require("fs");
const path = require("path");

const componentsDir = "src/domains/calculator/components";
const registryDir = "src/domains/calculator/registry";
const approvedFile = path.join(componentsDir, "_approved.json");
const lazyFile = "src/app/calculator/lazyComponents.tsx";

// ---------------------------------------------------------------- approved
const approvedRaw = fs.readFileSync(approvedFile, "utf8");
const approved = JSON.parse(approvedRaw.replace(/^\uFEFF/, ""));
const approvedSet = new Set(approved.approved.map((s) => s.replace(/\.tsx$/, "")));

// ---------------------------------------------------------------- component files
const tsxFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
const tsxSet = new Set(tsxFiles);

// ---------------------------------------------------------------- lazyComponents map (slug -> file base)
const slugToFile = {};
const lazyContent = fs.readFileSync(lazyFile, "utf8");
const lazyRe = /"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)/g;
let lm;
while ((lm = lazyRe.exec(lazyContent))) {
  const [, slug, imp] = lm;
  const seg = imp.split("/").pop().replace(/["']$/, "");
  slugToFile[slug] = seg + (seg.endsWith(".tsx") ? "" : ".tsx");
}

function pascal(slug) {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
function findFileByHeuristic(slug) {
  const p = pascal(slug);
  for (const c of [p, p + "Calculator", p + "Calc", p + "Full", p + "CalculatorFull"]) {
    if (tsxSet.has(c + ".tsx")) return c + ".tsx";
  }
  return null;
}

// ---------------------------------------------------------------- registry parse
const registryFiles = fs.readdirSync(registryDir).filter((f) => f.endsWith(".ts"));
const allEntries = [];
for (const rf of registryFiles) {
  const content = fs.readFileSync(path.join(registryDir, rf), "utf8");
  const parts = content.split(/\{\s*slug:/);
  for (let i = 1; i < parts.length; i++) {
    const block = "{slug:" + parts[i];
    const slugM = block.match(/slug:\s*"([^"]+)"/);
    if (!slugM) continue;
    const nameM = block.match(/name:\s*"([^"]*)"/);
    const statusM = block.match(/status:\s*"(\w+)"/);
    const catM = block.match(/category:\s*"([^"]+)"/);
    const subM = block.match(/subcategory:\s*"([^"]+)"/);
    allEntries.push({
      slug: slugM[1],
      name: nameM ? nameM[1] : "",
      status: statusM ? statusM[1] : "unknown",
      category: catM ? catM[1] : "",
      subcategory: subM ? subM[1] : "",
    });
  }
}

// ---------------------------------------------------------------- file checks
const STUB_RE = /\bValue A\b|\bValue B\b|Coming Soon|This calculator is planned|planned for a future|Back to Calculators/;

function extractButtonTexts(content) {
  const texts = [];
  const re = /<(?:button|Button)\b((?:[^>{]|\{[^}]*\})*)>([\s\S]*?)<\/(?:button|Button)>/gi;
  let m;
  while ((m = re.exec(content))) {
    let t = m[2]
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

function analyzeFile(content, status) {
  const sizeKB = Buffer.byteLength(content, "utf8") / 1024;
  const hasStub = STUB_RE.test(content);
  const hasRecharts = /from\s+["']recharts["']|import\s*\(\s*["']recharts["']|require\(\s*["']recharts["']\)/.test(content);
  const hasPrimaryCard = /bg-primary\/10/.test(content) && /border-l-4/.test(content) && /\bborder-primary\b/.test(content);

  const btnTexts = extractButtonTexts(content);
  const calcButtons = btnTexts.filter((t) => /^calculat/i.test(t.trim()));
  const hasCalculate = calcButtons.length > 0;
  const calcLabelWrong = calcButtons.length > 0 && calcButtons.every((t) => t.trim() !== "Calculate");

  const issues = [];
  if (calcLabelWrong) issues.push("button label not exactly 'Calculate'");
  if (hasSubtitleUnderH1(content)) issues.push("subtitle under H1");
  const hasAdvUI = />\s*Advanced Options|Advanced Options\s*<|Advanced Options\s*\{|Advanced Options\s*<\/|\{\/\*\s*Advanced Options/.test(content);
  const hasGroupLabel =
    /text-xs uppercase tracking-wide text-muted-foreground/.test(content) ||
    /text-\[11px\] font-bold uppercase tracking-wider text-muted-foreground/.test(content);
  if (hasAdvUI && !hasGroupLabel) issues.push("Advanced Options not grouped");
  if (/useState\("0"\)|useState\('0'\)|defaultValue="0"|defaultValue=\{'0'\}/.test(content)) issues.push("minor default value (0)");

  const coreFailures = (withPrimaryCard) => {
    const failures = [];
    if (hasStub) failures.push("stub placeholder");
    if (status !== "live") failures.push('status "' + status + '" in registry');
    if (sizeKB < 8) failures.push("file < 8KB (" + sizeKB.toFixed(1) + "KB)");
    if (!hasRecharts) failures.push("no Recharts import");
    if (!hasCalculate) failures.push("no Calculate button");
    if (withPrimaryCard && !hasPrimaryCard) failures.push("missing primary result card");
    return failures;
  };

  return { sizeKB, hasStub, hasRecharts, hasPrimaryCard, hasCalculate, coreFailures, issues };
}

// ---------------------------------------------------------------- classify
const buckets = { approvedComplete: [], liveNotApproved: [], needsPolish: [], needsRebuild: [], notBuilt: [] };
const approvedNoRegistryMatch = [];
const stats = { viaLazy: 0, viaHeuristic: 0, notFound: 0 };

function isApproved(slug, file) {
  const p = pascal(slug);
  return (
    approvedSet.has(slug) ||
    approvedSet.has(p) ||
    approvedSet.has(p + "Calculator") ||
    approvedSet.has(p + "Calc") ||
    (file ? approvedSet.has(file.replace(/\.tsx$/, "")) : false)
  );
}

for (const entry of allEntries) {
  const { slug, status, category, subcategory } = entry;

  let file = slugToFile[slug] || null;
  if (file) {
    if (!tsxSet.has(file)) file = null; // lazy points at a missing file -> fall through
    else stats.viaLazy++;
  }
  if (!file) {
    file = findFileByHeuristic(slug);
    if (file) stats.viaHeuristic++;
  }
  if (!file) stats.notFound++;

  const approvedFlag = isApproved(slug, file);

  if (!file) {
    buckets.notBuilt.push({ slug, category: category || subcategory || "uncategorized" });
    continue;
  }

  const filePath = path.join(componentsDir, file);
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    buckets.notBuilt.push({ slug, category: category || subcategory || "uncategorized" });
    stats.notFound++;
    continue;
  }
  const a = analyzeFile(content, status);

  // Approved files are exempt from the primary-card check (they were gated under
  // the pre-gold-standard style) but still re-flag on genuine regressions.
  const failures = approvedFlag ? a.coreFailures(false) : a.coreFailures(true);

  if (failures.length > 0) {
    buckets.needsRebuild.push({ slug, file, reason: failures[0], approved: approvedFlag });
  } else if (approvedFlag && status === "live") {
    buckets.approvedComplete.push(slug);
  } else if (approvedFlag) {
    // approved file but registry not live -> rebuild (status soon/unknown)
    buckets.needsRebuild.push({ slug, file, reason: 'status "' + status + '" in registry', approved: true });
  } else if (a.issues.length > 0) {
    buckets.needsPolish.push({ slug, file, issues: a.issues });
  } else {
    buckets.liveNotApproved.push(slug);
  }
}

// Approved entries with no registry correspondence (informational only)
{
  const matched = new Set();
  for (const e of allEntries) {
    const p = pascal(e.slug);
    if (approvedSet.has(e.slug) || approvedSet.has(p)) matched.add(approvedSet.has(e.slug) ? e.slug : p);
    if (approvedSet.has(p + "Calculator")) matched.add(p + "Calculator");
    if (approvedSet.has(p + "Calc")) matched.add(p + "Calc");
  }
  for (const f of tsxFiles) {
    const b = f.replace(/\.tsx$/, "");
    if (approvedSet.has(b)) {
      // only count as matched when the file backs a registry entry
      const backsEntry = Object.values(slugToFile).includes(f) || allEntries.some((e) => pascal(e.slug) === b || pascal(e.slug) + "Calculator" === b || pascal(e.slug) + "Calc" === b || e.slug === b);
      if (backsEntry) matched.add(b);
    }
  }
  approvedNoRegistryMatch.push(...approved.approved.filter((x) => !matched.has(x.replace(/\.tsx$/, ""))));
}

// ---------------------------------------------------------------- sort
const sortCmp = (a, b) => a.localeCompare(b);
buckets.approvedComplete.sort(sortCmp);
buckets.liveNotApproved.sort(sortCmp);
buckets.needsPolish.sort((a, b) => a.slug.localeCompare(b.slug));
buckets.needsRebuild.sort((a, b) => a.slug.localeCompare(b.slug));
buckets.notBuilt.sort((a, b) => a.slug.localeCompare(b.slug));

// ---------------------------------------------------------------- report
const totalRegistry = allEntries.length;
const totalComponents = tsxFiles.length;
const totalApproved = approved.approved.length;
const sumBuckets =
  buckets.approvedComplete.length + buckets.liveNotApproved.length + buckets.needsPolish.length + buckets.needsRebuild.length + buckets.notBuilt.length;
const actionNeeded = buckets.liveNotApproved.length + buckets.needsPolish.length + buckets.needsRebuild.length + buckets.notBuilt.length;
const fmtN = (n) => n.toLocaleString("en-US");

const byCat = {};
for (const nb of buckets.notBuilt) byCat[nb.category] = (byCat[nb.category] || 0) + 1;
const catLines = Object.entries(byCat)
  .sort((a, b) => b[1] - a[1])
  .map(([c, n]) => "  " + c + ": " + fmtN(n))
  .join("\n");

const L = [];
const line = (s) => L.push(s === undefined ? "" : s);
const bar = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
line(bar);
line("RACIRA CALCULATOR — STATUS REPORT");
line(bar);
line("Total registry entries:        " + fmtN(totalRegistry));
line("Total component files:         " + fmtN(totalComponents));
line("Approved (_approved.json):       " + fmtN(totalApproved));
line("─────────────────────────────────────────────────────");
line("✅ Approved & Complete:          " + fmtN(buckets.approvedComplete.length));
line("🟢 Live / Not Approved:          " + fmtN(buckets.liveNotApproved.length));
line("🟠 Needs Polish:                 " + fmtN(buckets.needsPolish.length));
line("🔴 Needs Rebuild:                " + fmtN(buckets.needsRebuild.length));
line("🟡 Not Built:                    " + fmtN(buckets.notBuilt.length));
line("─────────────────────────────────────────────────────");
line("Total action needed:             " + fmtN(actionNeeded));
line("  (bucket sum check: " + sumBuckets + " = " + totalRegistry + " " + (sumBuckets === totalRegistry ? "✓" : "✗ MISMATCH") + ")");
line(bar);
line("");
line("Not Built by Category (" + fmtN(buckets.notBuilt.length) + "):");
line(catLines);
line("");
line("Registry status: live=" + allEntries.filter((e) => e.status === "live").length + ", soon=" + allEntries.filter((e) => e.status === "soon").length);
line("Slug->file: lazy=" + stats.viaLazy + " heuristic=" + stats.viaHeuristic + " notFound=" + stats.notFound);
line("⚪ Approved w/o registry match (informational): " + approvedNoRegistryMatch.length);
line("");
line("🟢 LIVE / NOT APPROVED (" + buckets.liveNotApproved.length + ")");
if (buckets.liveNotApproved.length === 0) line("  (none)");
for (const s of buckets.liveNotApproved) line("  • " + s);
line("");
line("🟠 NEEDS POLISH (" + buckets.needsPolish.length + ")");
if (buckets.needsPolish.length === 0) line("  (none)");
for (const s of buckets.needsPolish) line("  • " + s.file.replace(/\.tsx$/, "") + " — " + s.issues.join(", "));
line("");
line("🔴 NEEDS REBUILD (" + buckets.needsRebuild.length + ")");
if (buckets.needsRebuild.length === 0) line("  (none)");
for (const s of buckets.needsRebuild) line("  • " + s.file.replace(/\.tsx$/, "") + " — " + s.reason);
line("");
line("🟡 NOT BUILT (" + buckets.notBuilt.length + ")");
if (buckets.notBuilt.length === 0) line("  (none)");
for (const s of buckets.notBuilt) line("  • " + s.slug + " — [" + s.category + "]");

fs.writeFileSync("status_report.md", L.join("\n") + "\n");
fs.writeFileSync("status_live_not_approved.txt", buckets.liveNotApproved.join("\n") + (buckets.liveNotApproved.length ? "\n" : ""));
fs.writeFileSync("status_polish.txt", buckets.needsPolish.map((s) => s.slug + " — " + s.issues.join("; ")).join("\n") + (buckets.needsPolish.length ? "\n" : ""));
fs.writeFileSync("status_rebuild.txt", buckets.needsRebuild.map((s) => s.slug + " — " + s.reason).join("\n") + (buckets.needsRebuild.length ? "\n" : ""));
fs.writeFileSync("status_not_built.txt", buckets.notBuilt.map((s) => s.slug + " — [" + s.category + "]").join("\n") + (buckets.notBuilt.length ? "\n" : ""));

// ---------------------------------------------------------------- console
const out = [];
const cl = (s) => out.push(s === undefined ? "" : s);
cl(bar);
cl("RACIRA CALCULATOR — STATUS REPORT");
cl(bar);
cl("Total registry entries:        " + fmtN(totalRegistry));
cl("Total component files:         " + fmtN(totalComponents));
cl("Approved (_approved.json):       " + fmtN(totalApproved));
cl("─────────────────────────────────────────────────────");
cl("✅ Approved & Complete:          " + fmtN(buckets.approvedComplete.length));
cl("🟢 Live / Not Approved:          " + fmtN(buckets.liveNotApproved.length));
cl("🟠 Needs Polish:                 " + fmtN(buckets.needsPolish.length));
cl("🔴 Needs Rebuild:                " + fmtN(buckets.needsRebuild.length));
cl("🟡 Not Built:                    " + fmtN(buckets.notBuilt.length));
cl("─────────────────────────────────────────────────────");
cl("Total action needed:             " + fmtN(actionNeeded) + "  (buckets sum " + sumBuckets + " " + (sumBuckets === totalRegistry ? "✓" : "✗ MISMATCH") + ")");
cl(bar);
cl("Slug->file: lazy=" + stats.viaLazy + " heuristic=" + stats.viaHeuristic + " notFound=" + stats.notFound);
cl("Registry live=" + allEntries.filter((e) => e.status === "live").length + ", soon=" + allEntries.filter((e) => e.status === "soon").length);
cl("⚪ Approved w/o registry match (info): " + approvedNoRegistryMatch.length);
cl("");
cl("🟢 LIVE / NOT APPROVED (" + buckets.liveNotApproved.length + "): " + buckets.liveNotApproved.slice(0, 40).join(", ") + (buckets.liveNotApproved.length > 40 ? ", ..." : ""));
cl("");
cl("🟠 NEEDS POLISH (" + buckets.needsPolish.length + "):");
for (const s of buckets.needsPolish.slice(0, 60)) cl("  • " + s.file.replace(/\.tsx$/, "") + " — " + s.issues.join(", "));
if (buckets.needsPolish.length > 60) cl("  ... and " + (buckets.needsPolish.length - 60) + " more (see status_report.md)");
cl("");
cl("🔴 NEEDS REBUILD (" + buckets.needsRebuild.length + "):");
for (const s of buckets.needsRebuild.slice(0, 80)) cl("  • " + s.file.replace(/\.tsx$/, "") + " — " + s.reason);
if (buckets.needsRebuild.length > 80) cl("  ... and " + (buckets.needsRebuild.length - 80) + " more (see status_report.md)");
cl("");
cl("Rebuild primary reasons: " + JSON.stringify([...new Set(buckets.needsRebuild.map((s) => s.reason))]));
cl("Polish issue types: " + JSON.stringify([...new Set(buckets.needsPolish.flatMap((s) => s.issues))]));
cl("Not Built (" + buckets.notBuilt.length + "): full list in status_not_built.txt + status_report.md");
cl("Not Built by Category: " + Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, n]) => c + "=" + n).join("  "));
process.stdout.write(out.join("\n") + "\n");
