const fs = require("fs");
const path = require("path");
const S = require("./scan-calculators.cjs");

const entries = S.readRegistry();
const lazyMap = S.readLazyMap();
const approvedRaw = fs
  .readFileSync(path.join(S.COMP_DIR, "_approved.json"), "utf8")
  .replace(/^﻿/, "");
const approved = new Set(JSON.parse(approvedRaw).approved);

// de-dup registry by slug (first wins)
const seen = new Set();
const registry = [];
for (const e of entries) {
  if (seen.has(e.slug)) continue;
  seen.add(e.slug);
  registry.push(e);
}

const buckets = {
  complete: [],
  liveNotApproved: [],
  polish: [],
  rebuild: [],
  notBuilt: [],
};

for (const e of registry) {
  const comp = S.resolveComponent(e, lazyMap);
  const info = comp ? S.inspect(comp) : { exists: false };

  if (!comp || !info.exists) {
    buckets.notBuilt.push({ ...e, comp });
    continue;
  }

  // core checks
  const coreFails = [];
  if (info.stub.length) coreFails.push(`stub placeholder (${info.stub[0]})`);
  if (info.size < 8192) coreFails.push(`file < 8KB (${(info.size / 1024).toFixed(1)}KB)`);
  if (!info.recharts) coreFails.push("no Recharts import");
  if (!info.calcButton) coreFails.push("no Calculate button");
  if (!info.primaryCard) coreFails.push("missing Primary Result Card pattern");
  if (e.status === "soon") coreFails.push('status: "soon" in registry');

  if (coreFails.length) {
    buckets.rebuild.push({ ...e, comp, reason: coreFails[0], all: coreFails });
    continue;
  }

  const surface = [];
  if (!info.exactCalcLabel) surface.push("button label not exactly `Calculate`");
  if (info.subtitle) surface.push("subtitle under H1");
  if (info.advanced && !info.grouped)
    surface.push("Advanced Options not grouped into labeled sub-sections");
  if (!info.gridCols2) surface.push("inputs not 2-per-row (grid-cols-2 gap-3)");

  const isApproved = approved.has(comp) || approved.has(comp.replace(/\.tsx$/, ""));

  if (isApproved && !surface.length) {
    buckets.complete.push({ ...e, comp });
  } else if (isApproved) {
    // approved but has surface issues -> still complete per spec (approved & no stubs)
    buckets.complete.push({ ...e, comp });
  } else if (surface.length) {
    buckets.polish.push({ ...e, comp, issues: surface.slice(0, 5) });
  } else {
    buckets.liveNotApproved.push({ ...e, comp });
  }
}

const files = fs.readdirSync(S.COMP_DIR).filter((f) => f.endsWith(".tsx"));
const totalAction =
  buckets.liveNotApproved.length +
  buckets.polish.length +
  buckets.rebuild.length +
  buckets.notBuilt.length;

const bar = "━".repeat(53);
const dash = "─".repeat(53);
const pad = (n) => String(n).padStart(5);
let out = "";
out += bar + "\n";
out += "RACIRA CALCULATOR — STATUS REPORT\n";
out += bar + "\n";
out += `Total registry entries:      ${pad(registry.length)}\n`;
out += `Total component files:      ${pad(files.length)}\n`;
out += `Approved (_approved.json):  ${pad(approved.size)}\n`;
out += dash + "\n";
out += `✅ Approved & Complete:     ${pad(buckets.complete.length)}\n`;
out += `🟢 Live / Not Approved:     ${pad(buckets.liveNotApproved.length)}\n`;
out += `🟠 Needs Polish:            ${pad(buckets.polish.length)}\n`;
out += `🔴 Needs Rebuild:           ${pad(buckets.rebuild.length)}\n`;
out += `🟡 Not Built:               ${pad(buckets.notBuilt.length)}\n`;
out += dash + "\n";
out += `Total action needed:        ${pad(totalAction)}\n`;
out += bar + "\n";

console.log(out);

// summaries for the console: rebuild reasons + not-built by category
const reasonCounts = {};
buckets.rebuild.forEach((r) => (reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1));
console.log("REBUILD reasons:", JSON.stringify(reasonCounts, null, 1));
const polishCounts = {};
buckets.polish.forEach((r) =>
  r.issues.forEach((i) => (polishCounts[i] = (polishCounts[i] || 0) + 1))
);
console.log("POLISH issues:", JSON.stringify(polishCounts, null, 1));
const nbCat = {};
buckets.notBuilt.forEach((r) => (nbCat[r.category] = (nbCat[r.category] || 0) + 1));
console.log("NOT BUILT by category:", JSON.stringify(nbCat, null, 1));

// write files
const R = (p) => path.join(S.ROOT, p);
fs.writeFileSync(
  R("status_live_not_approved.txt"),
  buckets.liveNotApproved.map((c) => c.slug).join("\n") + "\n"
);
fs.writeFileSync(
  R("status_polish.txt"),
  buckets.polish.map((c) => `${c.slug} — ${c.issues.join(", ")}`).join("\n") + "\n"
);
fs.writeFileSync(
  R("status_rebuild.txt"),
  buckets.rebuild.map((c) => `${c.slug} — ${c.reason}`).join("\n") + "\n"
);
fs.writeFileSync(
  R("status_not_built.txt"),
  buckets.notBuilt.map((c) => `${c.slug} — ${c.category}`).join("\n") + "\n"
);

let md = out;
const section = (title, list, fmt) => {
  md += `\n${title} (${list.length})\n`;
  md += list.map((c) => "  • " + fmt(c)).join("\n") + "\n";
};
section("🟢 LIVE / NOT APPROVED", buckets.liveNotApproved, (c) => `${c.name} [${c.slug}]`);
section("🟠 NEEDS POLISH", buckets.polish, (c) => `${c.name} — ${c.issues.join(", ")}`);
section("🔴 NEEDS REBUILD", buckets.rebuild, (c) => `${c.name} — ${c.reason}`);
section("🟡 NOT BUILT", buckets.notBuilt, (c) => `${c.slug} — ${c.category}`);
fs.writeFileSync(R("status_report.md"), md);
console.log("\nWrote status_report.md + 4 status txt files");
