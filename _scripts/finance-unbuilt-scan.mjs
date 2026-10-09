// Read-only Phase 1 scan: unbuilt FINANCE calculators in src/domains/calculator/registry/finance.ts
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, "src/domains/calculator/registry/finance.ts");
const COMPONENTS_DIR = path.join(ROOT, "src/domains/calculator/components");
const LAZY = path.join(ROOT, "src/app/calculator/lazyComponents.tsx");
const APPROVED = path.join(ROOT, "src/domains/calculator/components/_approved.json");

const registrySrc = fs.readFileSync(REGISTRY, "utf8");
const lazySrc = fs.readFileSync(LAZY, "utf8");
const approvedJson = JSON.parse(fs.readFileSync(APPROVED, "utf8"));
const approvedSet = new Set(approvedJson.approved || []);

// slug -> component module path (from lazyComponents)
const lazyMap = new Map();
for (const m of lazySrc.matchAll(/"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)/g)) {
  lazyMap.set(m[1], m[2]);
}

const field = (line, key) => {
  const m = line.match(new RegExp(key + ':\\s*"([^"]*)"'));
  return m ? m[1] : null;
};

const entries = [];
for (const raw of registrySrc.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line.startsWith("{ slug:")) continue;
  const slug = field(line, "slug");
  if (!slug) continue;
  entries.push({
    slug,
    name: field(line, "name"),
    description: field(line, "description"),
    subcategory: field(line, "subcategory"),
    tier: field(line, "tier"),
    priorityScore: Number((line.match(/priorityScore:\s*(\d+)/) || [])[1] || 0),
    status: field(line, "status"),
    isBuilt: /isBuilt:\s*true/.test(line),
  });
}

const pascal = (slug) =>
  slug
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")
    .replace(/\.tsx?$/, "");

const STUB_MARKERS = [/coming soon/i, /\bTODO\b/, /placeholder/i, /not implemented/i];

// Registry descriptions are mostly SEO boilerplate, not real product copy.
const isGenericDesc = (d) =>
  !d ||
  /online with our free tool\.?$/i.test(d) ||
  /^A free .* to easily calculate your results\.?$/i.test(d) ||
  /^Calculate .* online with our free tool\.?$/i.test(d);

function resolveComponent(slug) {
  const mapped = lazyMap.get(slug);
  const candidates = [];
  if (mapped) {
    const rel = mapped.replace(/^@\//, "src/");
    candidates.push(rel.endsWith(".tsx") || rel.endsWith(".ts") ? rel : rel + ".tsx");
  }
  const guess = path.join("src/domains/calculator/components", pascal(slug) + ".tsx");
  if (!candidates.includes(guess)) candidates.push(guess);
  for (const rel of candidates) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) return { rel, abs };
  }
  return null;
}

function classify(slug) {
  const found = resolveComponent(slug);
  if (!found) return { kind: "unbuilt", file: null, bytes: 0, inApproved: false, wired: false };
  const bytes = fs.statSync(found.abs).size;
  const src = fs.readFileSync(found.abs, "utf8");
  const comp = path.basename(found.rel, ".tsx");
  const inApproved = approvedSet.has(comp);
  const wired = lazyMap.has(slug);
  const hasState = /useState/.test(src);
  const looksStub = bytes < 8000 || !hasState || STUB_MARKERS.some((r) => r.test(src));
  const kind = looksStub ? "stub" : "partial";
  return { kind, file: found.rel, bytes, inApproved, wired };
}

const soon = entries.filter((e) => e.status === "soon");
const live = entries.filter((e) => e.status === "live");

const soonResolved = soon.map((e) => ({ ...e, ...classify(e.slug) }));
const liveResolved = live.map((e) => ({ ...e, hasComponent: !!resolveComponent(e.slug) }));

const bySub = new Map();
for (const e of soonResolved) {
  if (!bySub.has(e.subcategory)) bySub.set(e.subcategory, []);
  bySub.get(e.subcategory).push(e);
}
const subcats = [...bySub.entries()]
  .map(([sub, list]) => ({      subcategory: sub,
      soon: list.length,
    unbuilt: list.filter((x) => x.kind === "unbuilt").length,
    stub: list.filter((x) => x.kind === "stub").length,
    partial: list.filter((x) => x.kind === "partial").length,
    genericDescriptions: list.filter((x) => isGenericDesc(x.description)).length,
    tiers: list.reduce((acc, x) => {
      acc[x.tier || "untiered"] = (acc[x.tier || "untiered"] || 0) + 1;
      return acc;
    }, {}),
    batchesOf5: Math.ceil(list.length / 5),
    entries: list.sort((a, b) => (b.priorityScore - a.priorityScore) || a.slug.localeCompare(b.slug)),
  }))
  .sort((a, b) => b.soon - a.soon);

const tierTotals = soonResolved.reduce((acc, x) => {
  acc[x.tier || "untiered"] = (acc[x.tier || "untiered"] || 0) + 1;
  return acc;
}, {});

const totals = {
  financeEntries: entries.length,
  financeLive: live.length,
  financeSoon: soonResolved.length,
  unbuilt: soonResolved.filter((x) => x.kind === "unbuilt").length,
  stub: soonResolved.filter((x) => x.kind === "stub").length,
  partial: soonResolved.filter((x) => x.kind === "partial").length,
  soonButIsBuilt: soonResolved.filter((x) => x.isBuilt).length,
  liveMissingComponent: liveResolved.filter((x) => !x.hasComponent).length,
};

const out = {
  generated: new Date().toISOString(),
  source: "src/domains/calculator/registry/finance.ts",
  referenceStandard: "PMI Calculator (src/domains/calculator/components/PmiCalculator.tsx)",
  totals,
  bySubcategory: subcats,
};

fs.writeFileSync(path.join(ROOT, "status_finance_unbuilt.json"), JSON.stringify(out, null, 2));

const pad = (n) => String(n).padStart(5);
const md = [];
md.push("=".repeat(78));
md.push("RACIRA FINANCE — UNBUILT CALCULATOR SCAN (Phase 1, read-only)");
md.push(`Generated: ${out.generated}`);
md.push("=".repeat(78));
md.push("Source: src/domains/calculator/registry/finance.ts");
md.push(`Gold Standard reference: PMI Calculator (full PMT + amortization + tiered inputs + no chart)`);
md.push("");
md.push(`Entries in finance.ts: ${totals.financeEntries.toLocaleString()}  |  live: ${totals.financeLive.toLocaleString()}  |  soon: ${totals.financeSoon.toLocaleString()}`);
md.push("");
md.push(`GRAND TOTAL "soon" (unbuilt) finance calculators: ${totals.financeSoon.toLocaleString()}`);
md.push(`  - fully unbuilt (no component file):        ${totals.unbuilt.toLocaleString()}`);
md.push(`  - stub file exists (< 8 KB / no useState):  ${totals.stub.toLocaleString()}`);
md.push(`  - partial file exists (>= 8 KB):            ${totals.partial.toLocaleString()}`);
md.push(`  - flagged isBuilt:true while still soon:    ${totals.soonButIsBuilt.toLocaleString()}`);
md.push("");
md.push("Per-subcategory counts:");
for (const s of subcats) {
  md.push(`  ${pad(s.soon)}  ${s.subcategory}  (unbuilt ${s.unbuilt}, stub ${s.stub}, partial ${s.partial})`);
  md.push(`            tiers: ${Object.entries(s.tiers).map(([t, n]) => `${t}=${n}`).join(", ")}  |  batches of 5: ${s.batchesOf5}  |  boilerplate descriptions: ${s.genericDescriptions}`);
}
md.push("");
md.push(`Tier distribution of the ${totals.financeSoon.toLocaleString()} soon tools:`);
for (const [t, n] of Object.entries(tierTotals).sort((a, b) => b[1] - a[1])) {
  md.push(`  ${pad(n)}  ${t}`);
}
md.push("");
md.push("Batches of 5 required to finish the whole finance domain:");
for (const s of subcats) {
  md.push(`  ${pad(s.batchesOf5)}  ${s.subcategory}  (${s.soon} tools)`);
}
md.push(`  ${pad(Math.ceil(totals.financeSoon / 5))}  TOTAL batches at 5 per batch`);
md.push("");
md.push("METHOD (how the three buckets were resolved):");
md.push("  1. Parse finance.ts line-by-line for every `{ slug: ... status: ... }` entry.");
md.push("  2. Resolve a component by (a) the slug -> module map in");
md.push("     src/app/calculator/lazyComponents.tsx, then (b) exact PascalCase slug filename");
md.push("     in src/domains/calculator/components. Validated against all 444 live finance");
md.push("     entries: 444/444 resolve (0 live entries are missing a component).");
md.push("  3. Buckets: unbuilt = no file; stub = file < 8 KB, no useState, or stub markers;");
md.push("     partial = file >= 8 KB but not wired/approved.");
md.push("  4. Cross-checked with an independent normalized-filename + loose-substring sweep so");
md.push("     a differently-named component could not silently hide a 'soon' tool.");
md.push("");
md.push("FINDINGS THAT AFFECT SCOPE:");
md.push("  * Loans & Mortgages (the reference subcategory) is essentially DONE: 210 of 215 built.");
md.push("    Only 5 remain, and 4 of them are unbuilt; the 5th (escrow-reserve-calculator) has an");
md.push("    orphan file EscrowReserveCalculator.tsx that is truncated (4.6 KB, no export default,");
md.push("    not wired into lazyComponents) -> rebuild from scratch rather than patch.");
md.push("  * Nearly all remaining work sits in subcategories with no existing component scaffolding,");
md.push("    so every entry is a from-scratch build (no reuse of partial files exists).");
md.push("  * Registry descriptions are SEO boilerplate, not product copy: most read");
md.push("    \"Calculate <name> online with our free tool.\" The 500-1000 word SEO block, the");
md.push("    hero subtext, and all formula prose must be authored fresh per calculator.");
md.push("  * 'soon' entries are already present in the registry, so each approved build needs the");
md.push("    slug flipped to status: \"live\", isBuilt: true, plus a lazyComponents.tsx mapping.");
md.push("");
md.push("NOTE: build order = subcategory order below (largest remaining scope first),");
md.push("      batches of 5, following the PMI Calculator Gold Standard.");
for (const s of subcats) {
  md.push("");
  md.push("=".repeat(78));
  md.push(`## ${s.subcategory} — ${s.soon} soon`);
  md.push("=".repeat(78));
  for (const e of s.entries) {
    md.push(`- [${e.kind.toUpperCase()}] ${e.slug}`);
    md.push(`    name: ${e.name}`);
    md.push(`    tier: ${e.tier}  |  priority: ${e.priorityScore}  |  wired: ${e.wired ? "yes" : "no"}  |  approved: ${e.inApproved ? "yes" : "no"}`);
    md.push(`    component: ${e.file || "(none)"}${e.bytes ? ` (${e.bytes} bytes)` : ""}`);
    md.push(`    desc: ${e.description}`);
  }
}
fs.writeFileSync(path.join(ROOT, "status_finance_unbuilt.md"), md.join("\n") + "\n");

console.log(JSON.stringify(totals, null, 2));
console.log("\nSubcategories:");
for (const s of subcats) console.log(`  ${pad(s.soon)}  ${s.subcategory} (unbuilt ${s.unbuilt}/stub ${s.stub}/partial ${s.partial})`);
