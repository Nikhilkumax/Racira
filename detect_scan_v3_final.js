#!/usr/bin/env node
/**
 * RACIRA CALCULATOR — DETECT SCAN v3.0
 * Scans all .tsx calculator files and categorizes into Keep/Polish/Rebuild/Create
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const COMP_DIR = path.join(ROOT, "src", "domains", "calculator", "components");
const REG_DIR = path.join(ROOT, "src", "domains", "calculator", "registry");
const DB_FILE = path.join(ROOT, "Calculator_Database_Final.json");
const APPROVED_FILE = path.join(COMP_DIR, "_approved.json");

// ---------- Helpers ----------
function toKebab(pascal) {
    return pascal
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
}

// ---------- Load approved ----------
let approvedSet = new Set();
try {
    const ap = JSON.parse(fs.readFileSync(APPROVED_FILE, "utf8"));
    approvedSet = new Set(ap.approved || []);
} catch (e) {
    console.error("Could not read _approved.json:", e.message);
}

// ---------- Load registry ----------
const regFiles = fs.readdirSync(REG_DIR).filter((f) => f.endsWith(".ts"));
let registry = [];
for (const f of regFiles) {
    const content = fs.readFileSync(path.join(REG_DIR, f), "utf8");
    const re = /\{\s*slug:\s*"([^"]+)"[^}]*?status:\s*"(live|soon)"/gs;
    let m;
    while ((m = re.exec(content)) !== null) {
        registry.push({ slug: m[1], status: m[2] });
    }
}
const regBySlug = {};
for (const r of registry) regBySlug[r.slug] = r.status;

// ---------- Load database ----------
let dbCount = 0;
try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    for (const cat of Object.keys(db)) {
        for (const sub of Object.keys(db[cat])) {
            dbCount += (db[cat][sub] || []).length;
        }
    }
} catch (e) {
    console.error("Could not read database:", e.message);
}

// ---------- Scan .tsx files ----------
const tsxFiles = fs
    .readdirSync(COMP_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => {
        const base = f.replace(/\.tsx$/, "");
        const full = path.join(COMP_DIR, f);
        const stat = fs.statSync(full);
        const content = fs.readFileSync(full, "utf8");
        const sizeKB = stat.size / 1024;

        const hasCalculate = /\bCalculate\b/.test(content);
        const hasRecharts = /recharts/i.test(content) || /ResponsiveContainer|PieChart|BarChart|LineChart|AreaChart|RadialBarChart/.test(content);
        const hasResultCard = /Primary Result|primaryResult|result-card|bg-primary\/10|border-l-4/i.test(content);
        const hasBreakdown = /breakdown|Breakdown/i.test(content);
        const hasSummary = /summary|Summary/i.test(content);
        const hasUseClient = /"use client"/.test(content);
        const hasFetch = /\bfetch\(|axios/i.test(content);
        const hasPlaceholderMath = /valueA\s*\/\s*valueB|value1\s*\*\s*value2|placeholder/i.test(content);
        const hasTieredInputs = /Advanced Options|advancedOptions|showAdvanced|Professional Mode/i.test(content);
        const hasResetButton = /Reset|↺|RotateCcw/i.test(content);
        const hasSEO = /<h2/i.test(content) && /What Is|How It Works|Understanding/i.test(content);
        const hasH2Correct = /text-2xl font-bold mb-3/.test(content);
        const hasCalculateExact = />Calculate</.test(content);

        const kebabSlug = toKebab(base);
        const regStatus = regBySlug[kebabSlug] || regBySlug[base.toLowerCase()] || "soon";
        const isBuilt = regStatus === "live";
        const isApproved = approvedSet.has(base);

        return {
            file: f, base, kebabSlug, sizeKB, isBuilt, isApproved,
            hasCalculate, hasCalculateExact, hasRecharts, hasResultCard,
            hasBreakdown, hasSummary, hasUseClient, hasFetch, hasPlaceholderMath,
            hasTieredInputs, hasResetButton, hasSEO, hasH2Correct, content,
        };
    });

// ---------- Categorize ----------
const keep = [];
const polish = [];
const rebuild = [];

for (const t of tsxFiles) {
    if (t.isApproved && t.isBuilt) {
        keep.push(t);
        continue;
    }
    if (!t.isBuilt) {
        rebuild.push({ ...t, reason: "isBuilt false in registry" });
        continue;
    }
    const coreFails = [];
    if (t.sizeKB < 8) coreFails.push("file < 8KB");
    if (t.hasPlaceholderMath) coreFails.push("placeholder formula");
    if (!t.hasRecharts) coreFails.push("no Recharts chart");
    if (!t.hasResultCard) coreFails.push("missing result card");
    if (!t.hasCalculate) coreFails.push("no Calculate button");
    if (t.hasFetch) coreFails.push("live API call");
    if (!t.hasTieredInputs) coreFails.push("no tiered input system");

    if (coreFails.length > 0) {
        rebuild.push({ ...t, reason: coreFails.join("; ") });
        continue;
    }

    const polishIssues = [];
    if (!t.hasSEO) polishIssues.push("SEO under 400 words");
    if (!t.hasH2Correct) polishIssues.push("H2 className not text-2xl font-bold mb-3");
    if (!t.hasCalculateExact) polishIssues.push("Calculate button label not exactly Calculate");
    if (!t.hasResetButton) polishIssues.push("missing Reset button");
    if (!t.hasBreakdown) polishIssues.push("missing breakdown table");
    if (!t.hasSummary) polishIssues.push("missing summary stats");

    if (polishIssues.length > 0) {
        polish.push({ ...t, issues: polishIssues });
    } else {
        keep.push(t);
    }
}

// ---------- Output ----------
const line = "━".repeat(55);
console.log(line);
console.log("RACIRA CALCULATOR — DETECT RESULTS");
console.log(line);
console.log(`Database entries total:          ${dbCount.toLocaleString()}`);
console.log(`Files in /src/calculators:        ${tsxFiles.length.toLocaleString()}`);
console.log(`Approved (exempt):                  ${approvedSet.size}`);
console.log("─".repeat(55));
console.log(`✅ Keep:     ${keep.length}`);
console.log(`🟠 Polish:   ${polish.length}`);
console.log(`🔴 Rebuild:  ${rebuild.length}`);
console.log(`🟡 Create:   (database entries without .tsx — see note)`);
console.log("─".repeat(55));
console.log(`Total work:  ${polish.length + rebuild.length}`);
console.log(line);

if (polish.length > 0) {
    console.log("\n🟠 POLISH LIST:");
    for (const p of polish.slice(0, 50)) {
        console.log(`  • ${p.base} — ${p.issues.join(", ")}`);
    }
    if (polish.length > 50) console.log(`  ... and ${polish.length - 50} more`);
}

if (rebuild.length > 0) {
    console.log("\n🔴 REBUILD LIST (first 30):");
    for (const r of rebuild.slice(0, 30)) {
        console.log(`  • ${r.base} — ${r.reason}`);
    }
    if (rebuild.length > 30) console.log(`  ... and ${rebuild.length - 30} more`);
}

const out = {
    dbCount, tsxCount: tsxFiles.length, approvedCount: approvedSet.size,
    keep: keep.map((k) => k.base),
    polish: polish.map((p) => ({ name: p.base, issues: p.issues })),
    rebuild: rebuild.map((r) => ({ name: r.base, reason: r.reason })),
    keepCount: keep.length, polishCount: polish.length, rebuildCount: rebuild.length,
};
fs.writeFileSync(path.join(ROOT, "detect_results_v3_final.json"), JSON.stringify(out, null, 2));
console.log("\nFull results written to detect_results_v3_final.json");