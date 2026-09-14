/**
 * Report generator for the logic audit — reads logic_audit_results.json and writes:
 *   logic_audit_report.md, logic_ghost_fields.txt (tiered), logic_autocalc_violations.txt (tiered)
 *
 * Usage: node _scripts/logic-audit-report.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "logic_audit_results.json"), "utf8"));
const files = Object.values(data.results);

// ── classification helpers ──────────────────────────────────────────────────

const MODE_KEY = /(mode|type|system|class|category|level|style|format|method|plan|schedule|goal|preset|tier|coverage|record|credit|frequency|intensity|terrain|pace|shape|unit|units|material|support|printer|drive|transmission|tire|gender|sex|race|activity|insulin|feeding|schedule|strategy|formula|payment|freq|loan|occupancy|property|purpose|compounding|fee|fees|option|language|theme|case|digits|decimal|round|show|include|display)/i;
const COSMETIC_KEY = /^(label|name|title|note|notes|description|desc|comment|currencySymbol|displayUnit|unitLabel|fieldLabel|babyName|childName|petName|personName|playerName|teamName|projectName|jobTitle|companyName|recipientName|senderName|locationName|cityName|storeName|brandName|itemName|dishName|exerciseName|activityName|workoutName|recipeName|mealName|categoryLabel|sectionLabel)$/i;
const UNIT_SUFFIXES = [
  ["Cm", "Meters", "M"], ["Cm", "In", "Inches", "Ft"], ["Kg", "Lbs"], ["Lbs", "Kg"],
  ["In", "Cm", "Ft"], ["Ft", "In", "Cm", "M"], ["M", "Cm", "Ft", "Km"], ["Km", "Mi", "M"],
  ["Lb", "Kg"], ["Oz", "G"], ["Gal", "L", "Ml"], ["Sqft", "Sqm"], ["Miles", "Km", "M"],
  ["Inches", "Centimeters", "Feet", "Meters"], ["Feet", "Inches", "Meters", "Centimeters"],
  ["Pounds", "Kilograms", "Kilos"], ["Kilograms", "Pounds"],
];
const UNIT_FAMILY = { cm: 1, inches: 1, in: 1, ft: 1, feet: 1, m: 1, meters: 1, km: 1, mi: 1, miles: 1, kg: 1, kilograms: 1, lbs: 1, lb: 1, pounds: 1, g: 1, oz: 1, gal: 1, l: 1, ml: 1, sqft: 1, sqm: 1, acres: 1, hectares: 1, cents: 1 };

function stripUnitSuffixes(name) {
  const parts = [];
  for (const s of ["Centimeters", "centimeters", "Inches", "inches", "Meters", "meters", "Feet", "feet", "Kilograms", "kilograms", "Pounds", "pounds", "Cm", "cm", "In", "in", "Ft", "ft", "M", "m", "Kg", "kg", "Lbs", "lbs", "Lb", "lb", "Km", "km", "Mi", "mi", "Miles", "miles", "Oz", "oz", "G", "g", "Gal", "gal", "Ml", "ml", "Sqft", "sqft", "Sqm", "sqm"]) {
    if (name.endsWith(s) && name.length > s.length) parts.push([name.slice(0, name.length - s.length), s]);
  }
  return parts;
}

function classifyKey(file, key, ghost) {
  if (ghost.likelyCosmetic || COSMETIC_KEY.test(key)) return "COSMETIC";
  if (!ghost.staticPresent) {
    // mirror/dual-field check
    const stripped = stripUnitSuffixes(key);
    let mirror = null;
    for (const [base, unit] of stripped) {
      if (!UNIT_FAMILY[unit.toLowerCase()]) continue;
      for (const other of file.keys || []) {
        if (other === key) continue;
        const st2 = stripUnitSuffixes(other);
        for (const [b2, u2] of st2) {
          if (UNIT_FAMILY[u2.toLowerCase()] && b2 === base && u2 !== unit) { mirror = other; break; }
        }
        if (mirror) break;
      }
      if (mirror) break;
    }
    if (mirror) return "DUAL-UNIT (mirror key: " + mirror + ")";
    if (MODE_KEY.test(key)) return "MODE/ENUM (verify branch)";
    return "TRUE-GHOST (static-missing)";
  }
  if (MODE_KEY.test(key)) return "MODE/ENUM (verify branch)";
  return "BEHAVIORAL (in calculate, no output change)";
}

// ── regenerate tiered ghost file ────────────────────────────────────────────

const ghosts = files.filter((f) => f.ghostKeys.length);
let gOut = "";
const tierCounts = {};
for (const f of ghosts) {
  for (const g of f.ghostKeys) {
    const tier = classifyKey(f, g.key, g);
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    gOut += `[${tier}] ${f.file} — "${g.key}" (in calculate(): ${g.staticPresent}; candidates: ${g.candidates.join(", ")})\n  before: ${g.before}\n  after:  ${g.after} (identical)\n`;
  }
}
fs.writeFileSync(path.join(ROOT, "logic_ghost_fields.txt"), gOut);

// ── regenerate tiered autocalc file ────────────────────────────────────────

const autocalcFiles = files.filter((f) => f.autocalc.length);
let vOut = "";
const acPattern = {};
for (const f of autocalcFiles) {
  for (const h of f.autocalc) {
    let tier;
    if (h.kind === "useEffect") {
      if (/\[inputs\]/.test(h.reason)) tier = "A2-direct-calc-in-effect";
      else tier = "A1-effect-auto-recalc";
    } else if (h.kind === "onChange" || h.kind === "onValueChange" || h.kind === "onSelect" || h.kind === "onInput" || h.kind === "onBlur") {
      tier = "A3-input-handler-calc";
    } else if (h.kind === "onKeyDown" || h.kind === "onKeyUp") {
      tier = "A3-key-handler-calc";
    } else if (h.kind === "render-body-calc") {
      tier = "A4-render-body-calc";
    } else {
      tier = "A5-memo-callback";
    }
    acPattern[tier] = (acPattern[tier] || 0) + 1;
    vOut += `[${tier}] ${f.file}:${h.line} ${h.reason}\n    ${h.code}\n`;
  }
}
fs.writeFileSync(path.join(ROOT, "logic_autocalc_violations.txt"), vOut);

// ── build the markdown report ───────────────────────────────────────────────

const cleanFiles = files.filter((f) => !f.unverified && f.autocalc.length === 0 && f.ghostKeys.length === 0);
const unverifiedFiles = files.filter((f) => f.unverified);
const noCalcFiles = unverifiedFiles.filter((f) => String(f.unverified).includes("no calculate"));

const tierOrder = ["TRUE-GHOST (static-missing)", "BEHAVIORAL (in calculate, no output change)", "MODE/ENUM (verify branch)", "DUAL-UNIT (mirror key: ", "COSMETIC"];
const tierLabel = {
  "TRUE-GHOST (static-missing)": "TRUE GHOST — key absent from calculate() and no output change (highest confidence)",
  "BEHAVIORAL (in calculate, no output change)": "BEHAVIORAL — key present in calculate() but output identical (dead branch / clamped / gated)",
  "MODE/ENUM (verify branch)": "MODE/ENUM — likely conditional field (verify branches)",
  "DUAL-UNIT (mirror key: ": "DUAL-UNIT — likely synced unit pair (verify onChange sync)",
  "COSMETIC": "COSMETIC — display-only field",
};

let md = "";
md += "# LOGIC AUDIT — AUTO-CALC + GHOST FIELD REPORT\n\n";
md += `- Generated: ${new Date().toISOString()}\n`;
md += `- Harness: \`_scripts/logic-audit.cjs\` (Phase 1 static scan + Phase 1.5 behavioral verification in an isolated vm sandbox; no React, no app boot, no build)\n`;
md += `- Full machine-readable evidence: \`logic_audit_results.json\`\n\n`;

md += "## Summary\n\n```\n";
md += `Calculators scanned:              ${data.scanned}\n`;
md += `🔴 Auto-calc violation:           ${autocalcFiles.length} files / ${autocalcFiles.reduce((n, r) => n + r.autocalc.length, 0)} hits\n`;
md += `🟣 Ghost field(s) found:          ${ghosts.length} files / ${ghosts.reduce((n, r) => n + r.ghostKeys.length, 0)} keys\n`;
md += `✅ Clean (both, with evidence):   ${cleanFiles.length}\n`;
md += `⚠️ Unverified (harness limitation): ${unverifiedFiles.length}\n`;
md += "```\n\n";

md += "### Auto-calc patterns\n\n";
md += "| Pattern | Count |\n|---|---|\n";
for (const [k, v] of Object.entries(acPattern)) md += `| ${k} | ${v} |\n`;
md += "\n> A1 = `useEffect` with non-empty deps calling `handleCalculate`/`calculate` (recalculates on every input change). A2 = `useEffect` with `[inputs]` deps calling the calc directly. A3 = input `onChange`/key handlers calling `calculate`/`setResult`. A4 = calc-style call in the render body. A5 = `useMemo`/`useCallback` with non-empty deps.\n\n";

md += "### Ghost-field classifications\n\n";
md += "| Tier | Keys |\n|---|---|\n";
for (const t of tierOrder) md += `| ${tierLabel[t]} | ${tierCounts[t] || 0} |\n`;
md += "\n> Note: MODE/ENUM and DUAL-UNIT flags are **conditional fields** (e.g. advanced-mode inputs that are gated off at defaults, unit pairs updated together by the UI) — they need a per-file branch review, not a blanket fix. TRUE GHOST and BEHAVIORAL are the actionable bug class.\n\n";

// ── autocalc section ────────────────────────────────────────────────────────
md += "## 🔴 AUTO-CALC VIOLATIONS\n\n";
md += "Every hit below recomputes the result **without a Calculate press**. Full list with snippets: `logic_autocalc_violations.txt`.\n\n";
const byTier = {};
for (const f of autocalcFiles) {
  for (const h of f.autocalc) {
    const t = h.kind === "useEffect" ? (/\[inputs\]/.test(h.reason) ? "A2" : "A1") : h.kind === "render-body-calc" ? "A4" : "A3";
    (byTier[t] = byTier[t] || []).push(`${f.file}:${h.line}`);
  }
}
for (const [t, list] of Object.entries(byTier)) {
  md += `### ${t} — ${list.length} hit(s)\n\n`;
  md += list.map((x) => `- \`${x}\``).join("\n") + "\n\n";
}

// ── ghost section ───────────────────────────────────────────────────────────
md += "## 🟣 GHOST FIELDS\n\n";
md += "Full evidence (before/after JSON per key): `logic_ghost_fields.txt`.\n\n";

for (const t of tierOrder) {
  const list = ghosts.flatMap((f) => f.ghostKeys.filter((g) => classifyKey(f, g.key, g).startsWith(t)).map((g) => `${f.file} — "${g.key}"`));
  if (!list.length) continue;
  md += `### ${tierLabel[t]} (${list.length})\n\n`;
  if (t.startsWith("TRUE-GHOST") || t.startsWith("BEHAVIORAL")) {
    // include short before/after for actionable tiers
    for (const f of ghosts) {
      for (const g of f.ghostKeys) {
        if (!classifyKey(f, g.key, g).startsWith(t)) continue;
        md += `- **${f.file} — "${g.key}"** (in calculate(): ${g.staticPresent})\n  - before: \`${g.before.slice(0, 180)}…\`\n  - after:  \`${g.after.slice(0, 180)}…\` (identical)\n`;
      }
    }
  } else {
    md += list.join("\n") + "\n";
  }
  md += "\n";
}

// ── unverified ──────────────────────────────────────────────────────────────
md += "## ⚠️ UNVERIFIED (behavioral test could not run)\n\n";
const unvReasons = {};
for (const f of unverifiedFiles) {
  const k = String(f.unverified).split(":")[0].split("(")[0].trim().slice(0, 50);
  unvReasons[k] = (unvReasons[k] || 0) + 1;
}
md += "| Reason | Files |\n|---|---|\n";
for (const [k, v] of Object.entries(unvReasons).sort((a, b) => b[1] - a[1])) md += `| ${k} | ${v} |\n`;
md += "\nUnverified files: " + unverifiedFiles.map((f) => f.file).join(", ") + "\n\n";
md += `> \`no calculate() found\` (${noCalcFiles.length}) means the file has no local calculate/calc function — these are non-calculator components or unbuilt stubs.\n\n`;

// ── clean section ───────────────────────────────────────────────────────────
md += "## ✅ CLEAN (both bugs absent, with evidence)\n\n";
md += "Spot-check per calculator — first key (sorted) with `before→after` output (truncated):\n\n";
for (const f of cleanFiles) {
  const s = f.spotCheck;
  md += `- ${f.file} — spot-check: ${s ? `\`${s.key}\` before→\`${s.before.slice(0, 60)}…\` after→\`${s.after.slice(0, 60)}…\`` : "(no keys)"}\n`;
}
md += "\n";

// ── appendix ────────────────────────────────────────────────────────────────
md += "## Appendix — Phase 1 raw greps\n\n";
md += "```bash\n";
md += `grep -rn "useEffect" src/domains/calculator/components/ | grep -v "\\[\\]"   # raw match lines: see logic_audit_raw_useEffect.txt\n`;
md += `grep -rn "onChange.*setResult\\|onChange.*calculate(" src/domains/calculator/components/   # raw: see logic_audit_raw_onchange.txt\n`;
md += "```\n";
md += "Raw outputs saved alongside this report. Note: these greps are line-based and noisy (they include `Calculator(` component names and mount-only `[]` effects on other lines); the violation counts above come from the brace-aware scan in the harness, not from the raw greps.\n";

fs.writeFileSync(path.join(ROOT, "logic_audit_report.md"), md);

// ── summary stdout ──────────────────────────────────────────────────────────
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("LOGIC AUDIT — AUTO-CALC + GHOST FIELD REPORT");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Calculators scanned:              ${data.scanned}`);
console.log(`🔴 Auto-calc violation:           ${autocalcFiles.length} files / ${autocalcFiles.reduce((n, r) => n + r.autocalc.length, 0)} hits`);
console.log(`🟣 Ghost field(s) found:          ${ghosts.length} files / ${ghosts.reduce((n, r) => n + r.ghostKeys.length, 0)} keys`);
console.log(`✅ Clean (both, with evidence):   ${cleanFiles.length}`);
console.log(`⚠️ Unverified (harness limitation): ${unverifiedFiles.length}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
for (const [t, v] of Object.entries(tierCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${t} — ${v}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");