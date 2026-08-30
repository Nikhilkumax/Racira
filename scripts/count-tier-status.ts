import { readFileSync } from "fs";

const src = readFileSync("src/domains/pdf/registry/tools.ts", "utf8");
const csv = readFileSync("scratch/audit/pdf-audit-final.csv", "utf8");

// Build slug→tier from CSV
const tierMap = new Map<string, string>();
for (const line of csv.trim().split("\n").slice(1)) {
  const m = line.match(/^"([^"]+)","([^"]+)"/);
  if (m) tierMap.set(m[1].replace(/ \(orphan\)$/, ""), m[2]);
}

// Scan registry for slug→status
const lines = src.split("\n");
const counts: Record<string, { live: number; soon: number }> = {};
for (const t of ["Easy", "Medium", "Hard", "N/A"]) counts[t] = { live: 0, soon: 0 };

for (let i = 0; i < lines.length; i++) {
  const re = /slug:\s*["']([^"']+)["']/g;
  let sm: RegExpExecArray | null;
  while ((sm = re.exec(lines[i])) !== null) {
    const slug = sm[1];
    let status = "";
    const afterSlug = lines[i].substring(sm.index);
    const sOnLine = /status:\s*["'](live|soon)["']/.exec(afterSlug);
    if (sOnLine) status = sOnLine[1];
    else {
      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        const s = /status:\s*["'](live|soon)["']/.exec(lines[j]);
        if (s) { status = s[1]; break; }
      }
    }
    if (!status) continue;
    const tier = tierMap.get(slug) || "N/A";
    if (counts[tier]) counts[tier][status as "live" | "soon"]++;
  }
}

console.log("Tier     | live | soon | Total");
console.log("---------|------|------|------");
let gL = 0, gS = 0;
for (const t of ["Easy", "Medium", "Hard", "N/A"]) {
  const l = counts[t].live, s = counts[t].soon;
  gL += l; gS += s;
  console.log(`${t.padEnd(9)}| ${String(l).padStart(4)} | ${String(s).padStart(4)} | ${String(l + s).padStart(5)}`);
}
console.log("---------|------|------|------");
console.log(`${"TOTAL".padEnd(9)}| ${String(gL).padStart(4)} | ${String(gS).padStart(4)} | ${String(gL + gS).padStart(5)}`);
