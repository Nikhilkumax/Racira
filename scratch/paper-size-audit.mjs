// Regression check for the Scale Paper Tool catalog.
// Verifies the four acceptance criteria for the paper-size dropdowns:
//   1. no physical size appears twice (after orientation normalisation)
//   2. every family has a group, and every group is reachable
//   3. one canonical label format across all groups
//   4. the group list covers every series present in the data
// Run: node scratch/paper-size-audit.mjs
import { readFileSync } from "node:fs";

const SRC = "src/domains/cad/components/tools/easy/scale-paper-tool.tsx";
const src = readFileSync(SRC, "utf8");

/** Pull a top-level `const NAME = [...]` array literal out of the TSX source. */
function arrayLiteral(name) {
  const at = src.indexOf(`export const ${name}`);
  const open = src.indexOf("[", src.indexOf("=", at));
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") { depth--; if (depth === 0) return src.slice(open, i + 1); }
  }
  throw new Error(`could not find array literal for ${name}`);
}

const PAPER_SIZES = eval(arrayLiteral("PAPER_SIZES"));
const PAPER_GROUPS = eval(arrayLiteral("PAPER_GROUPS"));

// Mirror of canonicalLabel() in the component.
const canonicalLabel = (s) => {
  const mm = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(1)));
  return `${s.name} — ${mm(s.wMm)} × ${mm(s.hMm)} mm`;
};

let failures = 0;
const fail = (msg) => { failures++; console.log(`  FAIL  ${msg}`); };
const pass = (msg) => console.log(`  ok    ${msg}`);

console.log(`\nentries: ${PAPER_SIZES.length}   groups: ${PAPER_GROUPS.length}\n`);

// ── 1. no duplicate physical sizes ──────────────────────────────────────────
console.log("[1] duplicate physical sizes");
const norm = (s) => `${Math.min(s.wMm, s.hMm)}x${Math.max(s.wMm, s.hMm)}`;
const byDim = new Map();
for (const s of PAPER_SIZES) {
  if (!byDim.has(norm(s))) byDim.set(norm(s), []);
  byDim.get(norm(s)).push(s);
}
const dupes = [...byDim].filter(([, list]) => list.length > 1);
if (dupes.length) {
  for (const [dim, list] of dupes) {
    fail(`${dim} mm  ->  ${list.map((s) => `${s.id} "${s.name}"`).join("  ==  ")}`);
  }
} else {
  pass(`${PAPER_SIZES.length} entries, all distinct (${byDim.size} unique sizes)`);
}

// ── 2. unique ids ───────────────────────────────────────────────────────────
console.log("\n[2] unique ids");
const idSeen = new Map();
for (const s of PAPER_SIZES) idSeen.set(s.id, (idSeen.get(s.id) ?? 0) + 1);
const dupIds = [...idSeen].filter(([, n]) => n > 1);
if (dupIds.length) dupIds.forEach(([id, n]) => fail(`id "${id}" used ${n} times`));
else pass("all ids unique");

// ── 3. group coverage ───────────────────────────────────────────────────────
console.log("\n[3] group coverage");
// The Custom group is synthetic: it is populated at run time from the user's
// typed width/height, so it is legitimately empty in the static catalog.
const SYNTHETIC_GROUPS = ["Custom"];
const present = [...new Set(PAPER_SIZES.map((s) => s.series))];
const ungrouped = present.filter((g) => !PAPER_GROUPS.includes(g));
const empty = PAPER_GROUPS.filter((g) => !present.includes(g) && !SYNTHETIC_GROUPS.includes(g));
if (ungrouped.length) fail(`series with no group header (would be appended): ${ungrouped.join(", ")}`);
else pass(`every series (${present.length}) has a declared group`);
if (empty.length) fail(`declared groups with no sizes: ${empty.join(", ")}`);
else pass(`no empty groups (${SYNTHETIC_GROUPS.join(", ")} is synthetic)`);
for (const g of PAPER_GROUPS) {
  const n = PAPER_SIZES.filter((s) => s.series === g).length;
  console.log(`        ${g.padEnd(24)} ${n}${SYNTHETIC_GROUPS.includes(g) ? "  (synthetic)" : ""}`);
}

// Custom must stay last, and must not be a catalog entry — otherwise typing a
// standard size (e.g. 210 × 297) would register as a duplicate.
const customIdx = PAPER_GROUPS.indexOf("Custom");
if (customIdx !== PAPER_GROUPS.length - 1) fail('"Custom" must be the last entry in PAPER_GROUPS');
else pass('"Custom" is last in PAPER_GROUPS');
const customId = src.match(/export const CUSTOM_ID = "([^"]+)"/)?.[1];
if (!customId) fail("CUSTOM_ID is not exported");
else if (PAPER_SIZES.some((s) => s.id === customId)) fail(`CUSTOM_ID "${customId}" must not appear in PAPER_SIZES`);
else pass(`CUSTOM_ID "${customId}" is not in the catalog (kept out of dedupe)`);

// ── 4. canonical label format ───────────────────────────────────────────────
console.log("\n[4] canonical label format");
const FORMAT = /^.+ — -?[\d.]+ × -?[\d.]+ mm$/;
const badLabels = PAPER_SIZES.filter((s) => !FORMAT.test(canonicalLabel(s)));
if (badLabels.length) badLabels.forEach((s) => fail(`off-format label: "${canonicalLabel(s)}"`));
else pass(`all ${PAPER_SIZES.length} labels match "Name — W × H mm"`);

// ── 5. search smoke test ────────────────────────────────────────────────────
console.log("\n[5] search smoke test");
const haystack = (s) => `${s.name} ${s.id} ${s.series} ${s.wMm} ${s.hMm} ${canonicalLabel(s)}`.toLowerCase();
const search = (q) => {
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return PAPER_SIZES.filter((s) => terms.every((t) => haystack(s).includes(t)));
};
for (const q of ["a4", "letter", "210", "foolscap", "arch d", "jis b5", "ledger"]) {
  const hits = search(q);
  console.log(`        "${q}" -> ${hits.length} hit(s)${hits.length ? `: ${hits.slice(0, 3).map((s) => s.name).join(", ")}` : ""}`);
  if (!hits.length) fail(`search "${q}" returned nothing`);
}

console.log(failures ? `\n${failures} FAILURE(S)\n` : "\nall checks passed\n");
process.exit(failures ? 1 : 0);
