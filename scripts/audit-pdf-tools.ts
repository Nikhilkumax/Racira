/**
 * Mechanical PDF-tool audit — Steps 1-4. v3
 * Run: npx tsx scripts/audit-pdf-tools.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const registrySrc = readFileSync("src/domains/pdf/registry/tools.ts", "utf8");
const dispatcherSrc = readFileSync("src/lib/pdf/pdf-tools.ts", "utf8");
let toolPageSrc = "";
try { toolPageSrc = readFileSync("src/domains/pdf/tools/ToolPage.tsx", "utf8"); } catch {}

// ── STEP 1: Registry slug extraction ──────────────────────
const lines = registrySrc.split("\n");
const registryEntries: { slug: string; status: string }[] = [];
for (let i = 0; i < lines.length; i++) {
  // Use g-flag regex to find ALL slug occurrences on this line
  const slugRe = /slug:\s*["']([^"']+)["']/g;
  let sm: RegExpExecArray | null;
  while ((sm = slugRe.exec(lines[i])) !== null) {
    const slug = sm[1];
    // Search backwards (and on same line) for status
    let status = "unknown";
    // First check same line after the slug match
    const afterSlug = lines[i].substring(sm.index);
    const stOnLine = /status:\s*["'](live|soon)["']/.exec(afterSlug);
    if (stOnLine) { status = stOnLine[1]; }
    else {
      // Search backwards up to 15 lines
      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        const st = /status:\s*["'](live|soon)["']/.exec(lines[j]);
        if (st) { status = st[1]; break; }
      }
    }
    registryEntries.push({ slug, status });
  }
}
// Last entry wins for same slug
const registryMap = new Map<string, string>();
for (const e of registryEntries) registryMap.set(e.slug, e.status);
console.log(`Registry: ${registryEntries.length} entries → ${registryMap.size} unique slugs`);

// ── Dispatcher cases ──────────────────────────────────────
const dispatcherCases = new Set<string>();
const caseRe = /case\s+"([^"]+)":/g;
let cm: RegExpExecArray | null;
while ((cm = caseRe.exec(dispatcherSrc)) !== null) dispatcherCases.add(cm[1]);
console.log(`Dispatcher: ${dispatcherCases.size} case labels`);

function getCaseBody(slug: string): string {
  const caseLabel = `case "${slug}"`;
  const idx = dispatcherSrc.indexOf(caseLabel);
  if (idx === -1) return "";
  // For stacked/fall-through cases, find the actual code body.
  // Scan forward from the case label to find the first `{`, `return`, `const`, or `await`.
  // Then capture from there to the next case/default that ends the group.
  let codeStart = idx;
  const afterIdx = dispatcherSrc.substring(idx);
  // Find first `{` or `return` or `const` or `await` — that's where the shared body starts
  const codeMatch = afterIdx.match(/\n\s*(?:const\s|return\s|await\s|\{)/);
  if (codeMatch) {
    codeStart = idx + codeMatch.index;
  }
  // Now find the end: next `case "` or `default:` after codeStart
  const rest = dispatcherSrc.substring(codeStart);
  // Skip past the opening `{` if present
  const bodyText = rest;
  const nextCase = bodyText.match(/\n\s*case\s+"/);
  const nextDefault = bodyText.match(/\n\s*default:/);
  let endOffset = bodyText.length;
  if (nextCase && (!nextDefault || nextCase.index < nextDefault.index)) endOffset = nextCase.index;
  else if (nextDefault) endOffset = nextDefault.index;
  return dispatcherSrc.substring(codeStart, codeStart + endOffset);
}

// ── Engine detection v3 ───────────────────────────────────
// Rules:
//  1. If body contains "coming-soon" → none
//  2. If body throws and mentions browser/UI/headless/component → custom-component
//  3. If body throws for other reasons → none (broken/placeholder)
//  4. Explicit WASM imports → specific WASM tag
//  5. node-forge → node-forge
//  6. pdfjs-dist patterns (getPdfjs, OPS, getTextContent etc.) → pdfjs-analysis
//  7. Canvas rendering (page.render, toBlob) without text extraction → pdfjs-render
//  8. Canvas pixel analysis (getImageData for diff/detection) → canvas-analysis
//  9. Any real code that doesn't match above → pdf-lib (the base library)
// 10. Empty/too-short body → none
function detectEngine(body: string): string {
  if (!body || body.length < 30) return "none";

  // 1. coming-soon stub
  if (body.includes("coming-soon")) return "none";

  // 2/3. throw cases
  if (/throw new Error/.test(body)) {
    if (/custom page component|browser UI|headless mode|requires a browser|not be called through/.test(body)) return "custom-component";
    return "none";
  }

  // 4. Explicit WASM engines (these import from wasm-loaders or use specific WASM functions)
  if (/pymupdfConvertToPdf|loadPyMuPDF|pymupdfToSvg|pymupdfCompressPdf|pymupdfDeskew|pymupdfRasterizePdf|pymupdfExtractTables|pymupdfExtractText/.test(body)) return "pymupdf-wasm";
  if (/libreOfficeConvertToPdf/.test(body)) return "libreoffice-wasm";
  if (/gsConvertFileToOutlines/.test(body)) return "ghostscript-wasm";
  if (/ocrPdfToText/.test(body)) return "tesseract-wasm";
  if (/qpdfProcess/.test(body)) return "qpdf-wasm";

  // 5. node-forge
  if (/node-forge|forge\.(md|asn1|util|pkcs7)|validatePdfSignatures|countSignatures/.test(body)) return "node-forge";

  // 6. pdfjs-analysis: text extraction, annotation reading, operator list
  //    These patterns indicate the tool reads PDF structure, not just renders pages
  if (/getTextContent|getAnnotations|getOperatorList|getAttachments/.test(body)) {
    // But if it also does canvas rendering, check if the PRIMARY purpose is rendering
    // For now, if getTextContent is present, it's analysis
    return "pdfjs-analysis";
  }

  // 7. pdfjs-render: page rendering to images (no text extraction)
  //    Also detect calls to known render helper functions
  if (/page\.render\(|\.render\(\{.*canvasContext|toBlob|canvas\.toBlob|pdfToJPG|pdfToPNG|pdfToWebP|pdfToBMP|pdfToTIFF|pdfToImages|pdfToSlides/.test(body) && !/getTextContent|getAnnotations/.test(body)) {
    return "pdfjs-render";
  }

  // 8. canvas-analysis: pixel-level operations for diff/detection
  if (/getImageData|whitePixels|diffData|pixelData/.test(body)) return "canvas-analysis";

  // 9. Any substantial code → pdf-lib (the base library in this file)
  //    The file imports PDFDocument from pdf-lib at the top.
  //    Most case bodies call helper functions that use pdf-lib internally.
  if (body.length > 80) return "pdf-lib";

  return "none";
}

// ── Test file search ───────────────────────────────────────
function findTests(slug: string): string[] {
  const hits: string[] = [];
  for (const dir of ["e2e", "src/domains/pdf/lib/bento/__tests__"]) {
    try {
      for (const f of readdirSync(dir)) {
        if (!/\.test\.ts$/.test(f)) continue;
        try {
          const c = readFileSync(join(dir, f), "utf8");
          if (c.includes(`"${slug}"`) || c.includes(`'${slug}'`) || c.includes(`/pdf/${slug}`)) {
            hits.push(`${dir}/${f}`);
          }
        } catch {}
      }
    } catch {}
  }
  try {
    const a = readFileSync("src/domains/pdf/_approved.json", "utf8");
    if (a.includes(`"slug": "${slug}"`)) hits.push("_approved.json");
  } catch {}
  return hits;
}

function hasCustomComponent(slug: string): boolean {
  if (!toolPageSrc) return false;
  // Check if the slug appears in CUSTOM_PAGES object
  const cpMatch = toolPageSrc.match(/CUSTOM_PAGES[^{]*\{([\s\S]*?)\n\};/);
  return cpMatch ? cpMatch[1].includes(`"${slug}"`) : false;
}

// ── Build raw rows ─────────────────────────────────────────
interface RawRow {
  slug: string; registry_status: string; dispatcher_case_exists: boolean;
  returns_coming_soon: boolean; engine_tag: string;
  test_files: string; custom_component: boolean;
}
const rawRows: RawRow[] = [];
for (const slug of Array.from(registryMap.keys()).sort()) {
  const regStatus = registryMap.get(slug)!;
  const hasCase = dispatcherCases.has(slug);
  const body = getCaseBody(slug);
  const comingSoon = body.includes("coming-soon");
  const engine = detectEngine(body);
  const tests = findTests(slug);
  const custom = hasCustomComponent(slug);
  rawRows.push({
    slug, registry_status: regStatus, dispatcher_case_exists: hasCase,
    returns_coming_soon: comingSoon, engine_tag: engine,
    test_files: tests.join(";") || "none", custom_component: custom,
  });
}

const csvE = (s: string) => `"${s.replace(/"/g, '""')}"`;
const rawCsv = ["slug,registry_status,dispatcher_case_exists,returns_coming_soon,engine_tag,test_file_found,custom_component",
  ...rawRows.map(r => [csvE(r.slug), csvE(r.registry_status), r.dispatcher_case_exists, r.returns_coming_soon, csvE(r.engine_tag), csvE(r.test_files), r.custom_component].join(","))
];
writeFileSync("scratch/audit/pdf-audit-raw.csv", rawCsv.join("\n"));
console.log(`Step 1: ${rawRows.length} rows → scratch/audit/pdf-audit-raw.csv`);

// ── Detect orphan dispatcher cases (not in registry) ──────
const orphanRows: RawRow[] = [];
for (const slug of Array.from(dispatcherCases).sort()) {
  if (registryMap.has(slug)) continue; // already in registry
  const body = getCaseBody(slug);
  const comingSoon = body.includes("coming-soon");
  const engine = detectEngine(body);
  const tests = findTests(slug);
  const custom = hasCustomComponent(slug);
  orphanRows.push({
    slug, registry_status: "(orphan)", dispatcher_case_exists: true,
    returns_coming_soon: comingSoon, engine_tag: engine,
    test_files: tests.join(";") || "none", custom_component: custom,
  });
}
console.log(`Orphan dispatcher cases: ${orphanRows.length}`);
if (orphanRows.length > 0) {
  for (const r of orphanRows) console.log(`  ${r.slug} — engine: ${r.engine_tag}, coming-soon: ${r.returns_coming_soon}`);
}

// ── Engine tag distribution ────────────────────────────────
const engineCounts: Record<string, number> = {};
for (const r of rawRows) engineCounts[r.engine_tag] = (engineCounts[r.engine_tag] || 0) + 1;
console.log("Engine tag distribution:", engineCounts);

// ── STEP 2: Tier + Status ─────────────────────────────────
const ENGINE_TIER: Record<string, string> = {
  "pdf-lib": "Easy", "pdfjs-render": "Easy",
  "pdfjs-analysis": "Medium", "canvas-analysis": "Medium",
  "node-forge": "Medium", "custom-component": "Medium",
  "pymupdf-wasm": "Hard", "libreoffice-wasm": "Hard",
  "ghostscript-wasm": "Hard", "tesseract-wasm": "Hard", "qpdf-wasm": "Hard",
};

function classify(r: RawRow): { tier: string; status: string } {
  // Custom component tools are always Medium/Working (they have real UI)
  if (r.custom_component) {
    const tested = r.test_files !== "none";
    return { tier: "Medium", status: tested ? "Working" : "Working, untested" };
  }
  if (r.engine_tag !== "none") {
    const tier = ENGINE_TIER[r.engine_tag] || "Unknown";
    const tested = r.test_files !== "none";
    return { tier, status: tested ? "Working" : "Working, untested" };
  }
  if (r.returns_coming_soon) return { tier: "N/A", status: "Stub" };
  if (r.registry_status === "soon" && !r.dispatcher_case_exists) return { tier: "N/A", status: "Not started" };
  if (!r.dispatcher_case_exists) return { tier: "N/A", status: "Not started" };
  return { tier: "N/A", status: "Not started" };
}

// ── STEP 3: Duplicate resolution ───────────────────────────
const DUPES: Record<string, string> = {
  compress: "compress-pdf", sign: "sign-pdf", "draw-signature": "sign-pdf",
  grayscale: "grayscale-pdf", "pdf-to-excel": "pdf-to-csv",
  "edit-bookmarks": "bookmark-pdf", ocr: "ocr-pdf",
  "booklet-maker": "create-booklet", "duplex-prep": "duplex-simulator",
  "version-checker": "version-detector",
  "edit-metadata": "metadata-editor", "add-pdf-properties": "metadata-editor",
};
const cleanupLines = ["slug,canonical,reason"];
const rawBySlug = new Map(rawRows.map(r => [r.slug, r]));
const canonicalSet = new Set<string>();
for (const r of rawRows) {
  const canon = DUPES[r.slug];
  if (canon) { cleanupLines.push(`"${r.slug}","${canon}","duplicate resolution table"`); canonicalSet.add(canon); }
  else canonicalSet.add(r.slug);
}
writeFileSync("scratch/audit/pdf-audit-cleanup-debt.csv", cleanupLines.join("\n"));
console.log(`Step 3: ${cleanupLines.length - 1} duplicates → scratch/audit/pdf-audit-cleanup-debt.csv`);

// ── STEP 4: Final CSV ─────────────────────────────────────
const finalRows: { slug: string; tier: string; status: string; test: string; engine: string }[] = [];
for (const slug of Array.from(canonicalSet).sort()) {
  const r = rawBySlug.get(slug);
  if (!r) { finalRows.push({ slug, tier: "N/A", status: "Not started", test: "none", engine: "none" }); continue; }
  // Re-check: "soon" slugs with working dispatcher cases
  let engine = r.engine_tag;
  if (engine === "none" && r.dispatcher_case_exists && !r.returns_coming_soon) {
    const body = getCaseBody(slug);
    const re2 = detectEngine(body);
    if (re2 !== "none") engine = re2;
  }
  const adj = { ...r, engine_tag: engine };
  const { tier, status } = classify(adj);
  const testShort = r.test_files === "none" ? "none" : r.test_files.replace(/^.*\//, "").replace(/\.test\.ts$/, "");
  finalRows.push({ slug, tier, status, test: testShort, engine });
}

// Add orphan dispatcher cases to final CSV
for (const r of orphanRows) {
  let engine = r.engine_tag;
  const adj = { ...r, engine_tag: engine };
  const { tier, status } = classify(adj);
  const testShort = r.test_files === "none" ? "none" : r.test_files.replace(/^.*\//, "").replace(/\.test\.ts$/, "");
  finalRows.push({ slug: r.slug + " (orphan)", tier, status, test: testShort, engine });
}

const finalCsv = ["slug,tier,status,test_backing,engine_tag",
  ...finalRows.map(r => `"${r.slug}","${r.tier}","${r.status}","${r.test}","${r.engine}"`)
];
writeFileSync("scratch/audit/pdf-audit-final.csv", finalCsv.join("\n"));
console.log(`Step 4: ${finalRows.length} rows (${finalRows.length - orphanRows.length} registry + ${orphanRows.length} orphans) → scratch/audit/pdf-audit-final.csv`);

// ── SUMMARY ───────────────────────────────────────────────
const tierOrder = ["Easy", "Medium", "Hard", "N/A"];
const statusOrder = ["Working", "Working, untested", "Stub", "Not started"];
const grid: Record<string, Record<string, number>> = {};
for (const t of tierOrder) { grid[t] = {}; for (const s of statusOrder) grid[t][s] = 0; }
for (const r of finalRows) { if (grid[r.tier]?.[r.status] !== undefined) grid[r.tier][r.status]++; }

const W = 16;
console.log("\n=== SUMMARY TABLE ===\n");
console.log(["Tier".padEnd(8), ...statusOrder.map(s => s.padEnd(W)), "Total"].join(" | "));
console.log("-".repeat(8 + statusOrder.length * (W + 3) + 7));
let gTotal = 0; const gC: Record<string, number> = {}; for (const s of statusOrder) gC[s] = 0;
for (const t of tierOrder) {
  const cells = statusOrder.map(s => String(grid[t][s]).padEnd(W));
  const total = statusOrder.reduce((a, s) => a + grid[t][s], 0);
  gTotal += total; for (const s of statusOrder) gC[s] += grid[t][s];
  if (total > 0) console.log([t.padEnd(8), ...cells, String(total)].join(" | "));
}
console.log("-".repeat(8 + statusOrder.length * (W + 3) + 7));
console.log(["TOTAL".padEnd(8), ...statusOrder.map(s => String(gC[s]).padEnd(W)), String(gTotal)].join(" | "));
console.log(`\nCanonical slugs: ${finalRows.length} | Cleanup debt: ${cleanupLines.length - 1}`);
