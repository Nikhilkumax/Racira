// RACIRA CALCULATOR — PHASE 1 STATUS SCAN (read-only)
// Buckets: ✅ Approved & Complete | 🟢 Live/Not Approved | 🟠 Needs Polish | 🔴 Needs Rebuild | 🟡 Not Built
const fs = require("fs");
const path = require("path");

const componentsDir = "src/domains/calculator/components";
const registryDir = "src/domains/calculator/registry";
const approvedFile = path.join(componentsDir, "_approved.json");
const lazyFile = "src/app/calculator/lazyComponents.tsx";

// ---------------------------------------------------------------- approved
const approvedRaw = fs.readFileSync(approvedFile, "utf8");
const approved = JSON.parse(approvedRaw.replace(/^\uFEFF/, ""));
const approvedRawList = approved.approved;
const approvedSet = new Set(approvedRawList.map((s) => s.replace(/\.tsx$/, "")));

// ---------------------------------------------------------------- component files
const tsxFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
const tsxSet = new Set(tsxFiles);

// ---------------------------------------------------------------- lazyComponents map (authoritative slug -> file)
const lazyContent = fs.readFileSync(lazyFile, "utf8");
const slugToFile = {};
const lazyRe = /"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)/g;
let lm;
while ((lm = lazyRe.exec(lazyContent))) {
  const [, slug, imp] = lm;
  const fname = imp.split("/").pop().replace(/["']$/, "") + ".tsx";
  slugToFile[slug] = fname;
}

// ---------------------------------------------------------------- heuristic fallback
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

// ---------------------------------------------------------------- registry
const registryFiles = fs.readdirSync(registryDir).filter((f) => f.endsWith(".ts"));
const allEntries = [];
for (const rf of registryFiles) {
  const content = fs.readFileSync(path.join(registryDir, rf), "utf8");
  const parts = content.split(/\{\s*slug:/);
  for (let i = 1; i < parts.length; i++) {
    const block = "{slug:" + parts[i];
    const slugM = block.match(/slug:\s*"([^"]+)"/);
    if (!slugM) continue;
    const nameM = block.match(/name:\s*"([^"]+)"/);
    const statusM = block.match(/status:\s*"(\w+)"/);
    const catM = block.match(/category:\s*"([^"]+)"/);
    const subM = block.match(/subcategory:\s*"([^"]+)"/);
    allEntries.push({
      slug: slugM[1],
      name: nameM ? nameM[1] : "",
      status: statusM ? statusM[1] : "unknown",
      category: catM ? catM[1] : "",
      subcategory: subM ? subM[1] : "",
      sourceFile: rf,
    });
  }
}

// ---------------------------------------------------------------- file checks
const STUB_RE =
  /(?:>|"|')Value A(?:<|"|')|(?:>|"|')Value B(?:<|"|')|placeholder="Value A"|placeholder="Value B"|Coming Soon|This calculator is planned|planned for a future|Back to Calculators/;

function extractButtonTexts(content) {
  const texts = [];
  // Opening tag may contain JSX expressions with '>' inside (e.g. onClick={() => setMode(m)})
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
  // Only a real subtitle if the <p> appears BEFORE any input/label/select (i.e., not input helper text)
  const before = after.slice(0, pMatch.index);
  return !/<\s*(?:input|select|label)\b/i.test(before);
}

function analyzeFile(content, status) {
  const sizeKB = Buffer.byteLength(content, "utf8") / 1024;
  const hasStub = STUB_RE.test(content);
  const hasRecharts = /from\s+["']recharts["']|import\s*\(\s*["']recharts["']|require\(\s*["']recharts["']\)/.test(content);
  const hasPrimaryCard = /bg-primary\/10/.test(content) && /border-l-4/.test(content) && /\bborder-primary\b/.test(content);

  const btnTexts = extractButtonTexts(content);
  const hasCalculate = btnTexts.some((t) => /^calculat/i.test(t.trim()));
  const calcButtons = btnTexts.filter((t) => /^calculat/i.test(t.trim()));
  const calcLabelWrong = calcButtons.length > 0 && calcButtons.every((t) => t.trim() !== "Calculate");

  // polish surface checks
  const issues = [];
  if (calcLabelWrong) issues.push("button label not exactly 'Calculate'");
  if (hasSubtitleUnderH1(content)) issues.push("subtitle under H1");
  const hasAdvUI = />\s*Advanced Options|Advanced Options\s*<|Advanced Options\s*\{|Advanced Options\s*<\/|\{\/\*\s*Advanced Options/.test(content);
  const hasGroupLabel = /text-xs uppercase tracking-wide text-muted-foreground/.test(content) ||
    /text-\[11px\] font-bold uppercase tracking-wider text-muted-foreground/.test(content);
  if (hasAdvUI && !hasGroupLabel) issues.push("Advanced Options not grouped");
  if (/useState\("0"\)|useState\('0'\)|defaultValue="0"|defaultValue=\{'0'\}/.test(content)) issues.push("minor default value (0)");

  // core failures (primary first)
  const buildCoreFailures = (withPrimaryCard) => {
    const failures = [];
    if (hasStub) failures.push("stub placeholder (Value A/B)");
    if (status !== "live") failures.push(`status "${status}" in registry`);
    if (sizeKB < 8) failures.push(`file < 8KB (${sizeKB.toFixed(1)}KB)`);
    if (!hasRecharts) failures.push("no Recharts import");
    if (!hasCalculate) failures.push("no Calculate button");
    if (withPrimaryCard && !hasPrimaryCard) failures.push("missing primary result card");
    return failures;
  };

  return { sizeKB, hasStub, hasRecharts, hasPrimaryCard, hasCalculate, buildCoreFailures, issues };
}

// ---------------------------------------------------------------- classify
const buckets = {
  approvedComplete: [],
  liveNotApproved: [],
  needsPolish: [],
  needsRebuild: [],
  notBuilt: [],
};

const stats = { viaLazy: 0, viaHeuristic: 0, notFound: 0 };
const notBuiltLive = [];
const approvedInRebuild = [];
const dupSlugs = new Set();

for (const entry of allEntries) {
  const { slug, name, status, category, subcategory } = entry;

  let file = slugToFile[slug] || null;
  if (file) stats.viaLazy++;
  else {
    file = findFileByHeuristic(slug);
    if (file) stats.viaHeuristic++;
  }
  if (!file) stats.notFound++;

  const isApproved = approvedSet.has(slug.replace(/\.tsx$/, "")) || approvedSet.has(pascal(slug)) || approvedSet.has(pascal(slug) + "Calculator") || approvedSet.has(pascal(slug) + "Calc");
  // also match approved names against the file base name when file found
  if (file && !isApproved) {
    const base = file.replace(/\.tsx$/, "");
    isApproved2 = approvedSet.has(base);
  } else {
    isApproved2 = false;
  }
  const approvedFlag = isApproved || isApproved2;

  if (!file) {
    buckets.notBuilt.push({ slug, category: subcategory || category || "uncategorized", name });
    if (status === "live") notBuiltLive.push({ slug, category: subcategory || category });
    continue;
  }

  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const a = analyzeFile(content, status);

  // Approved files are exempt from re-flagging (see _approved.json) — old core checks only.
  // Non-approved files must satisfy ALL core checks including the primary result card.
  const failures = approvedFlag ? a.buildCoreFailures(false) : a.buildCoreFailures(true);

  if (failures.length > 0) {
    buckets.needsRebuild.push({ slug, file, reason: failures.join(", "), approved: approvedFlag });
    if (approvedFlag) approvedInRebuild.push({ slug, file, reason: failures.join(", ") });
  } else if (approvedFlag && status === "live") {
    buckets.approvedComplete.push(slug);
  } else {
    // not approved -> polish surface checks; clean files -> live/not approved
    if (a.issues.length > 0) {
      buckets.needsPolish.push({ slug, file, issues: a.issues });
    } else {
      buckets.liveNotApproved.push(slug);
    }
  }
}

// ---------------------------------------------------------------- report
const totalRegistry = allEntries.length;
const totalComponents = tsxFiles.length;
const totalApproved = approvedRawList.length;

const fmtN = (n) => n.toLocaleString("en-US");

const report = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total registry entries:        ${fmtN(totalRegistry)}
Total component files:         ${fmtN(totalComponents)}
Approved (_approved.json):      ${fmtN(totalApproved)}
─────────────────────────────────────────────────────
✅ Approved & Complete:          ${fmtN(buckets.approvedComplete.length)}
🟢 Live / Not Approved:          ${fmtN(buckets.liveNotApproved.length)}
🟠 Needs Polish:                 ${fmtN(buckets.needsPolish.length)}
🔴 Needs Rebuild:                ${fmtN(buckets.needsRebuild.length)}
🟡 Not Built:                    ${fmtN(buckets.notBuilt.length)}
─────────────────────────────────────────────────────
Total action needed:             ${fmtN(buckets.liveNotApproved.length + buckets.needsPolish.length + buckets.needsRebuild.length + buckets.notBuilt.length)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 LIVE / NOT APPROVED (${buckets.liveNotApproved.length})
${buckets.liveNotApproved.map((s) => `  • ${slugToFile[s] ? slugToFile[s].replace(/\.tsx$/, "") : pascal(s)}`).join("\n")}

🟠 NEEDS POLISH (${buckets.needsPolish.length})
${buckets.needsPolish.map((s) => `  • ${s.file.replace(/\.tsx$/, "")} — ${s.issues.join(", ")}`).join("\n")}

🔴 NEEDS REBUILD (${buckets.needsRebuild.length})
${buckets.needsRebuild.map((s) => `  • ${s.file.replace(/\.tsx$/, "")} — ${s.reason}`).join("\n")}

🟡 NOT BUILT (${buckets.notBuilt.length})
${buckets.notBuilt.map((s) => `  • ${s.slug} — [${s.category}]`).join("\n")}
`;

fs.writeFileSync("status_report.md", report);
fs.writeFileSync("status_live_not_approved.txt", buckets.liveNotApproved.join("\n"));
fs.writeFileSync("status_polish.txt", buckets.needsPolish.map((s) => `${s.slug} — ${s.issues.join("; ")}`).join("\n"));
fs.writeFileSync("status_rebuild.txt", buckets.needsRebuild.map((s) => `${s.slug} — ${s.reason}`).join("\n"));
fs.writeFileSync("status_not_built.txt", buckets.notBuilt.map((s) => `${s.slug} — [${s.category}]`).join("\n"));

// ---------------------------------------------------------------- console
console.log(`Total registry entries: ${totalRegistry} (dups in registry: ${totalRegistry - new Set(allEntries.map(e => e.slug)).size})`);
console.log(`Total component files: ${totalComponents}`);
console.log(`Approved list size: ${totalApproved}`);
console.log(`Slug->file: lazy=${stats.viaLazy} heuristic=${stats.viaHeuristic} notFound=${stats.notFound}`);
console.log(`✅ Approved & Complete: ${buckets.approvedComplete.length}`);
console.log(`🟢 Live / Not Approved: ${buckets.liveNotApproved.length}`);
console.log(`🟠 Needs Polish: ${buckets.needsPolish.length}`);
console.log(`🔴 Needs Rebuild: ${buckets.needsRebuild.length}`);
console.log(`🟡 Not Built: ${buckets.notBuilt.length}`);
console.log("--- samples ---");
console.log("Live/NotApproved:", buckets.liveNotApproved.slice(0, 5).join(", "));
console.log("Polish:", buckets.needsPolish.slice(0, 5).map(s => `${s.slug} [${s.issues.join("; ")}]`).join("\n         "));
console.log("Rebuild reasons:", [...new Set(buckets.needsRebuild.map(s => s.reason.split(",")[0]))].join(" | "));
console.log(`NotBuilt with status live: ${notBuiltLive.length} ->`, notBuiltLive.slice(0, 8).map(s => `${s.slug} [${s.category}]`).join(", "));
console.log(`Approved files in Rebuild: ${approvedInRebuild.length}`);
console.log("  ", approvedInRebuild.slice(0, 8).map(s => `${s.file} — ${s.reason}`).join("\n   "));
