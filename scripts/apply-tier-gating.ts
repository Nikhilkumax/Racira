/**
 * Part B — Steps 5+6: Generate plan AND apply changes.
 *
 * Run: npx tsx scripts/apply-tier-gating.ts          (plan only)
 * Run: npx tsx scripts/apply-tier-gating.ts --apply   (plan + apply)
 *
 * Reads: scratch/audit/pdf-audit-final.csv
 * Writes: scratch/audit/pdf-gating-plan.csv
 * Modifies (only with --apply): src/domains/pdf/registry/tools.ts
 */

import { readFileSync, writeFileSync } from "fs";

const CSV_PATH = "scratch/audit/pdf-audit-final.csv";
const PLAN_PATH = "scratch/audit/pdf-gating-plan.csv";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const csv = readFileSync(CSV_PATH, "utf8");
const lines = csv.trim().split("\n").slice(1); // skip header

// Current registry status map (from the registry file)
const registrySrc = readFileSync("src/domains/pdf/registry/tools.ts", "utf8");
const regLines = registrySrc.split("\n");
const registryStatus = new Map<string, string>();
for (let i = 0; i < regLines.length; i++) {
  const slugRe = /slug:\s*["']([^"']+)["']/g;
  let sm: RegExpExecArray | null;
  while ((sm = slugRe.exec(regLines[i])) !== null) {
    const slug = sm[1];
    const afterSlug = regLines[i].substring(sm.index);
    const stOnLine = /status:\s*["'](live|soon)["']/.exec(afterSlug);
    if (stOnLine) { registryStatus.set(slug, stOnLine[1]); }
    else {
      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        const st = /status:\s*["'](live|soon)["']/.exec(regLines[j]);
        if (st) { registryStatus.set(slug, st[1]); break; }
      }
    }
  }
}

interface PlanRow {
  slug: string;
  tier: string;
  currentStatus: string;
  plannedStatus: string;
  changed: string;
}

const planRows: PlanRow[] = [];

for (const line of lines) {
  const m = line.match(/"([^"]+)","([^"]+)","([^"]+)"/);
  if (!m) continue;
  const [, slugRaw, tier, auditStatus] = m;
  // Strip "(orphan)" suffix for registry lookup
  const slug = slugRaw.replace(/ \(orphan\)$/, "");
  const isOrphan = slugRaw.endsWith(" (orphan)");

  // Current registry status
  const currentRegStatus = isOrphan ? "(orphan)" : (registryStatus.get(slug) || "unknown");

  // Planned status per the rules:
  // - Easy/Medium + starts with "Working" → "live"
  // - Hard + any status → "soon"
  // - Easy/Medium + Stub/Not started → no change (stays "soon")
  let plannedStatus: string;
  let changed: string;

  if (tier === "Easy" || tier === "Medium") {
    if (auditStatus.startsWith("Working")) {
      plannedStatus = "live";
    } else {
      // Stub or Not started → no change
      plannedStatus = currentRegStatus;
    }
  } else if (tier === "Hard") {
    plannedStatus = "soon";
  } else {
    // N/A — no change
    plannedStatus = currentRegStatus;
  }

  changed = plannedStatus !== currentRegStatus ? "yes" : "no";

  planRows.push({
    slug: slugRaw,
    tier,
    currentStatus: currentRegStatus,
    plannedStatus,
    changed,
  });
}

// Write the plan CSV
const planCsv = ["slug,tier,current_registry_status,planned_new_status,changed",
  ...planRows.map(r => `"${r.slug}","${r.tier}","${r.currentStatus}","${r.plannedStatus}","${r.changed}"`)
];
writeFileSync(PLAN_PATH, planCsv.join("\n"));

// Summary
const changedCount = planRows.filter(r => r.changed === "yes").length;
const unchangedCount = planRows.filter(r => r.changed === "no").length;
console.log(`Gating plan: ${planRows.length} slugs total`);
console.log(`  Changed: ${changedCount}`);
console.log(`  Unchanged: ${unchangedCount}`);

// Hard-tier tools being pulled from live → soon
const hardPulled = planRows.filter(r => r.tier === "Hard" && r.changed === "yes" && r.currentStatus === "live");
console.log(`\nHard-tier tools currently live that would be pulled to soon: ${hardPulled.length}`);
if (hardPulled.length > 0) {
  console.log("---");
  for (const r of hardPulled) {
    console.log(`  ${r.slug}`);
  }
}

// Also show Easy/Medium tools being set to live (currently soon)
const easyMediumLive = planRows.filter(r => (r.tier === "Easy" || r.tier === "Medium") && r.changed === "yes" && r.plannedStatus === "live");
console.log(`\nEasy/Medium tools currently soon that would become live: ${easyMediumLive.length}`);

// Write the plan
writeFileSync(PLAN_PATH, planCsv.join("\n"));
console.log(`\nPlan written to ${PLAN_PATH}`);

// ── STEP 6: Apply changes (only if --apply flag) ─────────
const APPLY = process.argv.includes("--apply");
if (!APPLY) {
  console.log("\nDry run complete. Pass --apply to modify the registry.");
  process.exit(0);
}

console.log("\nApplying changes to registry...");

// Re-read the registry source (fresh copy)
let regContent = readFileSync("src/domains/pdf/registry/tools.ts", "utf8");
let changeCount = 0;
const regLinesArr = regContent.split("\n");

for (const row of planRows) {
  if (row.changed !== "yes") continue;
  const slug = row.slug.replace(/ \(orphan\)$/, "");
  if (row.currentStatus === "(orphan)") continue;

  // For each line containing this slug, check if it has the old status
  // and replace with the new status.
  for (let i = 0; i < regLinesArr.length; i++) {
    if (!regLinesArr[i].includes(`slug: "${slug}"`) && !regLinesArr[i].includes(`slug: '${slug}'`)) continue;
    // This line contains the slug — check for status on this line
    const oldDQ = `status: "${row.currentStatus}"`;
    const newDQ = `status: "${row.plannedStatus}"`;
    const oldSQ = `status: '${row.currentStatus}'`;
    const newSQ = `status: '${row.plannedStatus}'`;
    if (regLinesArr[i].includes(oldDQ)) {
      regLinesArr[i] = regLinesArr[i].replace(oldDQ, newDQ);
      changeCount++;
      console.log(`  ${slug}: "${row.currentStatus}" → "${row.plannedStatus}" (line ${i+1})`);
    } else if (regLinesArr[i].includes(oldSQ)) {
      regLinesArr[i] = regLinesArr[i].replace(oldSQ, newSQ);
      changeCount++;
      console.log(`  ${slug}: '${row.currentStatus}' → '${row.plannedStatus}' (line ${i+1})`);
    }
  }
}

regContent = regLinesArr.join("\n");
writeFileSync("src/domains/pdf/registry/tools.ts", regContent);
console.log(`\nApplied ${changeCount} status changes to registry.`);
console.log("Run dispatcher-coverage-check.ts to verify.");
