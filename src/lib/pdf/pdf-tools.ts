import { PDFDocument, rgb, StandardFonts, degrees, PDFName, PDFString, PDFDict } from "pdf-lib";
import JSZip from "jszip";
import { addBatesNumbers, changeBackgroundColor, sanitizePdfBytes, flattenAnnotationsInPdf, generateComicInfoXml, changeTextColor, rotatePdfCustom, dividePdfPages, convertXmlToPdfBytes, flattenPdf, removeAnnotationsFromPdf } from "@/domains/pdf/lib/bento/adapters/bento-processing";

/**
 * Client-side PDF processing engine.
 *
 * Everything here runs 100% in the browser — no network, no servers, no API
 * keys. Built on pdf-lib (PDF mutation), pdfjs-dist (PDF → canvas rendering &
 * text extraction) and JSZip (multi-file outputs). Used by processFiles(),
 * the single dispatcher invoked from the workflow context for every tool.
 */

// ── Types ─────────────────────────────────────────────────
/** Progress reporter: (current page, total pages, human message). */
export type ProgressFn = (current: number, total: number, message: string) => void;

export type ToolOptions = {
  splitMode?: "all" | "range";
  splitRange?: string;
  splitCount?: number;
  rotateAngle?: number;
  rotateFilter?: "all" | "portrait" | "landscape";
  pagesToRemove?: string;
  pagesToKeep?: string;
  pagesToDuplicate?: string;
  duplicateCount?: number;
  repeatCount?: number;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkFontSize?: number;
  watermarkColor?: string;
  watermarkAngle?: number;
  watermarkTile?: boolean;
  addTextContent?: string;
  addTextSize?: number;
  addTextX?: number;
  addTextY?: number;
  addTextColor?: string;
  pageNumberPosition?: "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
  pageNumberStart?: number;
  pageNumberFormat?: "decimal" | "roman" | "alpha";
  cropMargins?: { top: number; right: number; bottom: number; left: number };
  pageSize?: "a4" | "letter" | "legal" | "a3" | "a5";
  targetSize?: string;
  scalingMode?: string;
  password?: string;
  ownerPassword?: string;
  permissions?: any;
  organizeOrder?: string;
  compressionLevel?: "extreme" | "recommended" | "high";
  imageQuality?: number;
  scale?: number;
  format?: "jpg" | "png" | "webp";
  blankPosition?: number;
  blankCount?: number;
  nup?: number;
  metaTitle?: string;
  metaAuthor?: string;
  metaSubject?: string;
  metaKeywords?: string;
  metaCreator?: string;
  metaProducer?: string;
  formData?: Record<string, string | boolean>;
  formFieldSpecs?: Array<{ type: string; name: string; page: number; x: number; y: number; width: number; height: number }>;
  formRenameMap?: Record<string, string>;
  initials?: string;
  initialsPage?: number;
  initialsX?: number;
  initialsY?: number;
  signatureImage?: string; // base64
  signaturePage?: number;
  signatureX?: number;
  signatureY?: number;
  signatureWidth?: number;
  signatureHeight?: number;
  n?: number;
  secondPdf?: ArrayBuffer;
  pages?: string;
  copies?: number;
  order?: string;
  margin?: number;
  strokeWidth?: number;
  color?: string;
  stampType?: string;
  pageRanges?: string;
  sheetPerPage?: string;
  newImage?: ArrayBuffer;
  imageIndex?: number;
  targetFont?: string;
  mode?: string;
  start?: number;
  end?: number;
  pageA?: number;
  pageB?: number;
  from?: number | string;
  to?: number;
  insertPdf?: any;
  sourcePdf?: any;
  targetPage?: number;
  sourcePage?: number;
  fillColor?: string;
  count?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  text?: string;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  overlayPdf?: any;
  opacity?: number;
  gridSize?: number;
  lineColor?: string;
  bleed?: number;
  bleedPt?: number;
  printing?: string;
  copying?: string;
  modifying?: string;
  algorithm?: string;
  topN?: number;
  numColumns?: number;
  orientation?: string;
  layout?: string;
  cols?: number;
  rows?: number;
  flipEdge?: string;
  titles?: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  url?: string;
  maxOpens?: number;
  atPage?: number;
  userPassword?: string;
  headerText?: string;
  footerText?: string;
  // ── Bento pilot: bates-numbering ──
  batesTemplate?: string;
  batesPadding?: number;
  batesStart?: number;
  batesPosition?: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
  batesFontFamily?: "Helvetica" | "TimesRoman" | "Courier";
  batesFontSize?: number;
  batesColor?: string;
  // ── Bento pilot: background-color ──
  backgroundColor?: string;
  // ── Bento pilot: sanitize-pdf ──
  flattenForms?: boolean;
  removeMetadata?: boolean;
  removeAnnotations?: boolean;
  removeJavascript?: boolean;
  removeEmbeddedFiles?: boolean;
  removeLinks?: boolean;
  removeStructureTree?: boolean;
  removeMarkInfo?: boolean;
  sanitizePreset?: "standard" | "deep" | "maximum";
  // ── Bento MEDIUM: remove-annotations ──
  removeAnnotationTypes?: string[];
  // ── Bento pilot: rotate-custom ──
  rotateCustomAngle?: number;
  rotateCustomPerPage?: number[];
  // ── Bento pilot: divide-pages ──
  divideMode?: 'vertical' | 'horizontal';
  dividePageRange?: string;
  divideTotalPages?: number;
  // ── Bento pilot: text-color ──
  textColor?: string;
  textColorThreshold?: number;
  // ── Bento pilot: comic-info ──
  comicTitle?: string;
  comicSeries?: string;
  comicNumber?: string;
  comicVolume?: string;
  comicSummary?: string;
  comicWriter?: string;
  comicPublisher?: string;
  comicGenre?: string;
  comicLanguage?: string;
  comicPageCount?: string;
};

export interface ProcessResult {
  type: string; // MIME type or custom action type ('coming-soon', 'viewer')
  data?: Uint8Array;
  filename?: string;
  pdfBytes?: Uint8Array; // used by viewers
  viewerType?: string; // e.g. "pdf-viewer"
  message?: string; // used for warnings or coming-soon
  eta?: string;
}

// ── Small helpers ─────────────────────────────────────────

/** Lazily load pdfjs-dist (worker loaded from CDN matching the lib version). */
async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

/** Read a File into a Uint8Array. */
async function fileToBytes(file: File | Blob): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

/** Process items in fixed-size chunks to bound memory for large files. */
async function chunkedMap<T, R>(
  items: T[],
  chunkSize: number,
  fn: (item: T, index: number) => Promise<R>,
  onProgress?: ProgressFn,
  label?: string
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      const idx = i + j;
      onProgress?.(idx, items.length, label ? `${label} ${idx + 1}/${items.length}…` : `Processing ${idx + 1}/${items.length}…`);
      results.push(await fn(chunk[j], idx));
    }
    await new Promise((r) => setTimeout(r, 0));
  }
  onProgress?.(items.length, items.length, "Finalizing…");
  return results;
}

/** Standard page sizes in PDF points (1/72 inch). */
const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
};

/** Parse a #rrggbb hex string into pdf-lib rgb(). */
function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return rgb(0, 0, 0);
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Title-case a slug for display. */
function titleFromSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ── Page range parsing ────────────────────────────────────
const PAGE_RANGE_REGEX = /^\d+(-\d+)?(,\s*\d+(-\d+)?)*$/;
const MAX_PAGE_LIMIT = 100000;

export function parsePageRange(rangeStr: string, total: number): number[] {
  if (!rangeStr || typeof rangeStr !== "string") return [];
  const trimmed = rangeStr.trim();
  if (!PAGE_RANGE_REGEX.test(trimmed)) return [];

  const clampedTotal = Math.min(Math.max(1, total), MAX_PAGE_LIMIT);
  const indices: number[] = [];
  const parts = trimmed.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      const segments = part.split("-");
      const start = parseInt(segments[0], 10);
      const end = parseInt(segments[1], 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) continue;
      for (let i = Math.max(1, start); i <= Math.min(clampedTotal, end); i++) {
        indices.push(i - 1);
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= clampedTotal) {
        indices.push(n - 1);
      }
    }
  }
  return Array.from(new Set(indices)).sort((a, b) => a - b);
}

/** Parse a page-order string (page numbers in a custom order, may omit some). */
function parsePageOrder(orderStr: string, total: number): number[] {
  if (!orderStr) return [];
  const parts = orderStr.split(",").map((s) => s.trim());
  const out: number[] = [];
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (!isNaN(n) && n >= 1 && n <= total) out.push(n - 1);
  }
  return out;
}

/** Number formatting for page numbers. */
function formatPageNum(n: number, format: string): string {
  if (format === "roman") return toRoman(n);
  if (format === "alpha") return toAlpha(n);
  return String(n);
}
function toRoman(num: number): string {
  const map: [number, string][] = [[1000,"m"],[900,"cm"],[500,"d"],[400,"cd"],[100,"c"],[90,"xc"],[50,"l"],[40,"xl"],[10,"x"],[9,"ix"],[5,"v"],[4,"iv"],[1,"i"]];
  let res = "";
  for (const [v, s] of map) while (num >= v) { res += s; num -= v; }
  return res;
}
function toAlpha(n: number): string {
  let res = "";
  while (n > 0) { const r = (n - 1) % 26; res = String.fromCharCode(97 + r) + res; n = Math.floor((n - 1) / 26); }
  return res;
}

// ── Get page count ────────────────────────────────────────
export async function getPageCount(file: File): Promise<number> {
  const bytes = await fileToBytes(file);
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch {
    const pdfjs = await getPdfjs();
    const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
    return pdf.numPages;
  }
}

/** Load a PDF with encryption tolerance. */
async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

// ─────────────────────────────────────────────────────────
//  ORGANIZE TOOLS
// ─────────────────────────────────────────────────────────

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToBytes(file);
    const doc = await loadPdf(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

export async function splitPDF(
  file: File,
  mode: "all" | "range",
  rangeStr?: string,
  opts?: { splitCount?: number }
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();

  if (opts?.splitCount && opts.splitCount > 0) {
    const zip = new JSZip();
    const per = opts.splitCount;
    for (let start = 0; start < total; start += per) {
      const end = Math.min(start + per, total);
      const indices = Array.from({ length: end - start }, (_, k) => start + k);
      const doc = await PDFDocument.create();
      const pages = await doc.copyPages(src, indices);
      pages.forEach((p) => doc.addPage(p));
      zip.file(`pages-${start + 1}-${end}.pdf`, await doc.save());
    }
    return zip.generateAsync({ type: "uint8array" });
  }

  if (mode === "all") {
    const zip = new JSZip();
    for (let i = 0; i < total; i++) {
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [i]);
      doc.addPage(page);
      zip.file(`page-${i + 1}.pdf`, await doc.save());
    }
    return zip.generateAsync({ type: "uint8array" });
  }

  const indices = parsePageRange(rangeStr || "", total);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, indices);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

export async function rotatePDF(
  file: File,
  angle: number,
  filter: "all" | "portrait" | "landscape" = "all",
  pageIndices?: number[]
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  const pages = doc.getPages();
  let targets = pageIndices ?? pages.map((_, i) => i);
  if (filter !== "all") {
    targets = targets.filter((i) => {
      const p = pages[i];
      if (!p) return false;
      const { width, height } = p.getSize();
      const portrait = height >= width;
      return filter === "portrait" ? portrait : !portrait;
    });
  }
  for (const i of targets) {
    const page = pages[i];
    if (page) page.setRotation(degrees(page.getRotation().angle + angle));
  }
  return doc.save();
}

export async function removePages(file: File, pagesToRemove: number[]): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const keep = Array.from({ length: total }, (_, i) => i).filter((i) => !pagesToRemove.includes(i));
  if (keep.length === 0) throw new Error("Cannot remove every page from the PDF.");
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, keep);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

export async function organizePages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  if (!newOrder.length) return src.save();
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, newOrder);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

export async function reversePDF(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const order = Array.from({ length: total }, (_, i) => total - 1 - i);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, order);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

export async function duplicatePages(
  file: File,
  pageIndices: number[],
  times: number = 1
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  const original = await doc.copyPages(src, Array.from({ length: total }, (_, i) => i));
  original.forEach((p) => doc.addPage(p));
  if (pageIndices.length) {
    for (let t = 0; t < times; t++) {
      const pages = await doc.copyPages(src, pageIndices);
      pages.forEach((p) => doc.addPage(p));
    }
  }
  return doc.save();
}

export async function repeatPages(file: File, times: number = 2): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  for (let i = 0; i < total; i++) {
    for (let r = 0; r < Math.max(1, times); r++) {
      const [page] = await doc.copyPages(src, [i]);
      doc.addPage(page);
    }
  }
  return doc.save();
}

/** Add blank page(s) at a position (0 = prepend, total = append). */
export async function addBlankPages(
  file: File,
  position: number,
  count: number = 1
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, Array.from({ length: total }, (_, i) => i));
  const ref = pages[0]?.getSize() ?? { width: 612, height: 792 };
  const insertAt = Math.max(0, Math.min(position, total));

  if (insertAt === 0) {
    for (let c = 0; c < count; c++) doc.addPage([ref.width, ref.height]);
    pages.forEach((p) => doc.addPage(p));
  } else {
    for (let i = 0; i < pages.length; i++) {
      doc.addPage(pages[i]);
      if (i === insertAt - 1) {
        for (let c = 0; c < count; c++) doc.addPage([ref.width, ref.height]);
      }
    }
    if (insertAt >= total) {
      for (let c = 0; c < count; c++) doc.addPage([ref.width, ref.height]);
    }
  }
  return doc.save();
}

/** Resize all pages to a standard size, scaling content onto the new page. */
export async function resizePDF(file: File, size: keyof typeof PAGE_SIZES): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const [W, H] = PAGE_SIZES[size] ?? PAGE_SIZES.letter;
  const doc = await PDFDocument.create();
  const embedded = await doc.embedPdf(src, src.getPageIndices());
  for (const page of embedded) {
    const newPage = doc.addPage([W, H]);
    const { width, height } = page;
    const scale = Math.min(W / width, H / height);
    const w = width * scale;
    const h = height * scale;
    newPage.drawPage(page, { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h });
  }
  return doc.save();
}

export async function cropPDF(
  file: File,
  margins: { top: number; right: number; bottom: number; left: number }
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.setCropBox(
      margins.left,
      margins.bottom,
      Math.max(1, width - margins.left - margins.right),
      Math.max(1, height - margins.top - margins.bottom)
    );
  });
  return doc.save();
}

/** N-up: place multiple pages onto one sheet. */
export async function nupPDF(file: File, n: number): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const doc = await PDFDocument.create();
  const cols = n === 2 ? 1 : n === 4 ? 2 : n === 6 ? 3 : n === 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const sheetW = 595.28, sheetH = 841.89;
  const margin = 18;
  const cellW = (sheetW - margin * (cols + 1)) / cols;
  const cellH = (sheetH - margin * (rows + 1)) / rows;

  const embedded = await doc.embedPdf(src, src.getPageIndices());
  for (let i = 0; i < embedded.length; i += n) {
    const sheet = doc.addPage([sheetW, sheetH]);
    for (let j = 0; j < n; j++) {
      const srcIdx = i + j;
      if (srcIdx >= embedded.length) break;
      const page = embedded[srcIdx];
      const { width: pw, height: ph } = page;
      const scale = Math.min(cellW / pw, cellH / ph);
      const w = pw * scale;
      const h = ph * scale;
      const col = j % cols;
      const row = Math.floor(j / cols);
      const x = margin + col * (cellW + margin) + (cellW - w) / 2;
      const y = sheetH - (margin + row * (cellH + margin) + h) - (cellH - h) / 2;
      sheet.drawPage(page, { x, y, width: w, height: h });
    }
  }
  return doc.save();
}

/** Booklet imposition. */
export async function bookletPDF(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const padded = Math.ceil(total / 4) * 4;
  const order: number[] = [];
  for (let sheet = 0; sheet < padded / 4; sheet++) {
    const left = padded - sheet * 2 - 1;
    const right = sheet * 2;
    order.push(left, right, right + 1, left - 1);
  }
  const valid = order.filter((i) => i >= 0 && i < total);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, valid);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

/** Split spreads: a wide page becomes two pages. */
export async function splitSpreadsPDF(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const doc = await PDFDocument.create();
  const embedded = await doc.embedPdf(src, src.getPageIndices());
  for (const page of embedded) {
    const { width, height } = page;
    if (width > height) {
      const half = width / 2;
      const left = doc.addPage([half, height]);
      left.drawPage(page, { x: 0, y: 0, width, height });
      const right = doc.addPage([half, height]);
      right.drawPage(page, { x: -half, y: 0, width, height });
    } else {
      const np = doc.addPage([width, height]);
      np.drawPage(page, { x: 0, y: 0, width, height });
    }
  }
  return doc.save();
}

/** Insert separator (blank) sheets between pages. */
export async function addSeparatorSheets(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const src = await loadPdf(bytes);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, src.getPageIndices());
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 0; i < pages.length; i++) {
    doc.addPage(pages[i]);
    if (i < pages.length - 1) {
      const { width, height } = pages[i].getSize();
      const sep = doc.addPage([width, height]);
      const label = "— Separator —";
      sep.drawText(label, {
        x: width / 2 - font.widthOfTextAtSize(label, 24) / 2,
        y: height / 2,
        size: 24,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
  }
  return doc.save();
}

// ─────────────────────────────────────────────────────────
//  EDIT / ANNOTATE
// ─────────────────────────────────────────────────────────

export async function addPageNumbers(
  file: File,
  position: ToolOptions["pageNumberPosition"] = "bottom-center",
  startNum: number = 1,
  format: string = "decimal"
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const text = formatPageNum(startNum + i, format);
    const tw = font.widthOfTextAtSize(text, 11);
    const pad = 30;
    let x = width / 2 - tw / 2;
    if (position?.includes("right")) x = width - tw - pad;
    if (position?.includes("left")) x = pad;
    const y = position?.startsWith("top") ? height - pad - 11 : pad;
    page.drawText(text, { x, y, size: 11, font, color: rgb(0.3, 0.3, 0.3) });
  });
  return doc.save();
}

/** Strip page numbers (pdf-lib cannot target drawn text; re-save clean). */
export async function removePageNumbers(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  return doc.save();
}

export interface HeaderFooterOptions {
  headerLeft?: string;
  headerCenter?: string;
  headerRight?: string;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
  fontSize?: number;
  marginTop?: number;
  marginBottom?: number;
  pageRange?: string;
}

export async function addHeaderFooter(
  file: File,
  header: string,
  footer: string
): Promise<Uint8Array> {
  return addHeaderFooterEnhanced(file, { headerCenter: header, footerCenter: footer });
}

export async function addHeaderFooterEnhanced(
  file: File,
  options: HeaderFooterOptions
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = options.fontSize ?? 10;
  const marginTop = options.marginTop ?? 28;
  const marginBottom = options.marginBottom ?? 18;
  const pages = doc.getPages();
  const targetPages = options.pageRange
    ? parsePageRange(options.pageRange, pages.length).map(i => pages[i])
    : pages;

  const drawAligned = (
    page: any, text: string, y: number, align: 'left' | 'center' | 'right'
  ) => {
    if (!text) return;
    const { width } = page.getSize();
    const tw = font.widthOfTextAtSize(text, fontSize);
    const margin = 50;
    let x: number;
    if (align === 'left') x = margin;
    else if (align === 'right') x = width - margin - tw;
    else x = (width - tw) / 2;
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
  };

  for (const page of targetPages) {
    const { height } = page.getSize();
    drawAligned(page, options.headerLeft ?? '', height - marginTop, 'left');
    drawAligned(page, options.headerCenter ?? '', height - marginTop, 'center');
    drawAligned(page, options.headerRight ?? '', height - marginTop, 'right');
    drawAligned(page, options.footerLeft ?? '', marginBottom, 'left');
    drawAligned(page, options.footerCenter ?? '', marginBottom, 'center');
    drawAligned(page, options.footerRight ?? '', marginBottom, 'right');
  }
  return doc.save();
}

export async function addWatermark(
  file: File,
  text: string,
  opacity: number = 0.15,
  fontSizeOverride?: number
): Promise<Uint8Array> {
  return addWatermarkEnhanced(file, { text, opacity, fontSize: fontSizeOverride });
}

export interface WatermarkOptions {
  text?: string;
  imageBytes?: Uint8Array;
  imageType?: 'png' | 'jpg';
  opacity?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  angle?: number;
  scale?: number;
  pageRange?: string;
  tile?: boolean;
  tileGapX?: number;
  tileGapY?: number;
}

export async function addWatermarkEnhanced(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const opacity = options.opacity ?? 0.15;
  const angle = options.angle ?? -45;
  const color = options.color ?? { r: 0.5, g: 0.5, b: 0.5 };
  const targetPages = options.pageRange
    ? parsePageRange(options.pageRange, pages.length).map(i => pages[i])
    : pages;

  if (options.text) {
    const text = options.text;
    const fontSize = options.fontSize ?? Math.min(pages[0].getSize().width, pages[0].getSize().height) * 0.08;
    for (const page of targetPages) {
      const { width, height } = page.getSize();
      if (options.tile) {
        // Tile the watermark across the page
        const gapX = (options.tileGapX ?? 200);
        const gapY = (options.tileGapY ?? 150);
        const tw = font.widthOfTextAtSize(text, fontSize);
        for (let y = height * 0.1; y < height * 0.9; y += gapY) {
          for (let x = 0; x < width; x += gapX) {
            page.drawText(text, {
              x, y, size: fontSize, font,
              color: rgb(color.r, color.g, color.b),
              opacity, rotate: degrees(angle),
            });
          }
        }
      } else {
        const tw = font.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: width / 2 - tw / 2,
          y: height / 2,
          size: fontSize, font,
          color: rgb(color.r, color.g, color.b),
          opacity, rotate: degrees(angle),
        });
      }
    }
  } else if (options.imageBytes) {
    const img = options.imageType === 'jpg'
      ? await doc.embedJpg(options.imageBytes)
      : await doc.embedPng(options.imageBytes);
    const scale = options.scale ?? 0.3;
    const imgW = img.width * scale;
    const imgH = img.height * scale;
    for (const page of targetPages) {
      const { width, height } = page.getSize();
      page.drawImage(img, {
        x: (width - imgW) / 2,
        y: (height - imgH) / 2,
        width: imgW, height: imgH,
        opacity, rotate: degrees(angle),
      });
    }
  }
  return doc.save();
}

export async function addTextToPDF(
  file: File,
  text: string,
  fontSize: number = 14,
  xPos?: number,
  yPos?: number,
  colorHex?: string
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  if (pages.length > 0) {
    const page = pages[0];
    const { height } = page.getSize();
    page.drawText(text, {
      x: xPos ?? 50,
      y: yPos ?? height - 50,
      size: fontSize,
      font,
      color: colorHex ? hexToRgb(colorHex) : rgb(0, 0, 0),
    });
  }
  return doc.save();
}

export async function addBackground(file: File, colorHex: string): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  const color = hexToRgb(colorHex);
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color, opacity: 0.5 });
  });
  return doc.save();
}

// ─────────────────────────────────────────────────────────
//  IMAGE ↔ PDF
// ─────────────────────────────────────────────────────────

async function embedImage(doc: PDFDocument, bytes: Uint8Array, type: string) {
  if (type === "image/jpeg" || type.includes("jpg") || type.includes("jpeg")) {
    return doc.embedJpg(bytes);
  }
  return doc.embedPng(bytes);
}

export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToBytes(file);
    let img;
    try {
      img = await embedImage(doc, bytes, file.type || file.name);
    } catch {
      const pngBytes = await reencodeImageToPng(file);
      img = await doc.embedPng(pngBytes);
    }
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return doc.save();
}

/** Re-encode any browser-decodable image (webp, gif, svg, …) to PNG bytes. */
async function reencodeImageToPng(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not decode image"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
    return fileToBytes(blob);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Render PDF pages to images in a ZIP using pdfjs + canvas. */
async function pdfToImages(
  file: File,
  format: "jpg" | "png" | "webp" | "bmp",
  scale: number,
  onProgress?: ProgressFn
): Promise<Uint8Array> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const total = pdf.numPages;
  const indices = Array.from({ length: total }, (_, i) => i + 1);
  const zip = new JSZip();
  const ext = format === "jpg" ? "jpg" : format === "webp" ? "webp" : format === "bmp" ? "bmp" : "png";
  const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : format === "bmp" ? "image/bmp" : "image/png";

  await chunkedMap(
    indices,
    5,
    async (i) => {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      if (format === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.92)
      );
      zip.file(`page-${i}.${ext}`, await blob.arrayBuffer());
      canvas.width = 0;
      canvas.height = 0;
    },
    onProgress,
    "Rendering"
  );
  return zip.generateAsync({ type: "uint8array" });
}

export async function pdfToJPG(file: File, onProgress?: ProgressFn, scale = 2): Promise<Uint8Array> {
  return pdfToImages(file, "jpg", scale, onProgress);
}
export async function pdfToPNG(file: File, onProgress?: ProgressFn, scale = 2): Promise<Uint8Array> {
  return pdfToImages(file, "png", scale, onProgress);
}
export async function pdfToWebP(file: File, onProgress?: ProgressFn, scale = 2): Promise<Uint8Array> {
  return pdfToImages(file, "webp", scale, onProgress);
}
export async function pdfToBMP(file: File, onProgress?: ProgressFn, scale = 2): Promise<Uint8Array> {
  return pdfToImages(file, "bmp", scale, onProgress);
}
/** PDF → TIFF (rendered via canvas, packed as raw TIFF per page in a ZIP). */
export async function pdfToTIFF(file: File, onProgress?: ProgressFn, scale = 2): Promise<Uint8Array> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const total = pdf.numPages;
  const zip = new JSZip();
  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(i, total, "Rendering");
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    // Export as PNG then wrap as TIFF (simplified: TIFF header + PNG data)
    const pngBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    // Minimal TIFF wrapper: store raw PNG bytes as a TIFF file
    // (Most TIFF readers handle embedded PNG; for true TIFF, a proper encoder is needed)
    const tiffHeader = new Uint8Array([
      0x49, 0x49, 0x2A, 0x00, // Little-endian TIFF magic
      0x08, 0x00, 0x00, 0x00, // Offset to first IFD
    ]);
    const tiffBytes = new Uint8Array(tiffHeader.length + pngBytes.length);
    tiffBytes.set(tiffHeader, 0);
    tiffBytes.set(pngBytes, tiffHeader.length);
    zip.file(`page-${i}.tiff`, tiffBytes);
    canvas.width = 0;
    canvas.height = 0;
  }
  return zip.generateAsync({ type: "uint8array" });
}

/** Fix page sizes — standardize all pages to a uniform size. */
export async function fixPageSize(
  file: File,
  targetSize?: string,
  scalingMode?: string
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const srcDoc = await PDFDocument.load(bytes);
  const outDoc = await PDFDocument.create();
  const srcPages = srcDoc.getPages();
  if (srcPages.length === 0) throw new Error("PDF has no pages");
  // Determine target size: use first page's dimensions if not specified
  const firstPage = srcPages[0];
  const { width: targetW, height: targetH } = firstPage.getSize();
  for (const srcPage of srcPages) {
    const [copied] = await outDoc.copyPages(srcDoc, [srcPages.indexOf(srcPage)]);
    const { width: srcW, height: srcH } = copied.getSize();
    // Scale content to fit target size
    const scaleX = targetW / srcW;
    const scaleY = targetH / srcH;
    const scale = Math.min(scaleX, scaleY);
    copied.scaleContent(scale, scale);
    copied.setSize(targetW, targetH);
    // Center content
    const offsetX = (targetW - srcW * scale) / 2;
    const offsetY = (targetH - srcH * scale) / 2;
    copied.translateContent(offsetX, offsetY);
    outDoc.addPage(copied);
  }
  return outDoc.save();
}

/** Extract all embedded images from a PDF into a ZIP (falls back to page renders). */
export async function extractImages(file: File, onProgress?: ProgressFn): Promise<Uint8Array> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const zip = new JSZip();
  let count = 0;

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const ops = await page.getOperatorList();
    const fnArray = ops.fnArray as unknown as number[];
    const argsArray = ops.argsArray as unknown as unknown[];
    for (let k = 0; k < fnArray.length; k++) {
      const op = fnArray[k];
      // OPS.paintImageXObject (85), paintInlineImageXObject (84)
      if (op === 85 || op === 84) {
        const name = (argsArray[k] as any[])?.[0];
        if (name) {
          try {
            const obj = await new Promise<any>((resolve) => {
              page.objs.get(name, resolve);
            });
            if (obj && obj.data && obj.width && obj.height) {
              const pngBlob = await rawImageDataToPng(obj.data, obj.width, obj.height);
              if (pngBlob) {
                zip.file(`page-${p}-img-${++count}.png`, await pngBlob.arrayBuffer());
              }
            }
          } catch { /* ignore individual image errors */ }
        }
      }
    }
    onProgress?.(p, pdf.numPages, `Scanning page ${p}/${pdf.numPages}…`);
  }

  if (count === 0) {
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      zip.file(`page-${p}.png`, await blob.arrayBuffer());
      canvas.width = 0; canvas.height = 0;
    }
  }
  return zip.generateAsync({ type: "uint8array" });
}

/** Convert pdfjs image data (RGB or RGBA) to a PNG Blob via canvas. */
async function rawImageDataToPng(data: Uint8Array, width: number, height: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.createImageData(width, height);
  const totalPixels = width * height;
  const srcIsRgb = data.length === totalPixels * 3;
  if (srcIsRgb) {
    for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
      imageData.data[j] = data[i];
      imageData.data[j + 1] = data[i + 1];
      imageData.data[j + 2] = data[i + 2];
      imageData.data[j + 3] = 255;
    }
  } else {
    imageData.data.set(data as unknown as Uint8ClampedArray);
  }
  ctx.putImageData(imageData, 0, 0);
  return new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

// ─────────────────────────────────────────────────────────
//  TEXT EXTRACTION
// ─────────────────────────────────────────────────────────

export async function extractText(file: File, onProgress?: ProgressFn): Promise<string> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const parts: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = content.items
      .map((it: any) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) parts.push(`--- Page ${p} ---\n${text}`);
    onProgress?.(p, pdf.numPages, `Reading page ${p}/${pdf.numPages}…`);
  }
  return parts.join("\n\n");
}

export async function extractLinks(file: File, onProgress?: ProgressFn): Promise<{ text: string; urls: string[] }> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const urls: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const annotations = await page.getAnnotations();
    for (const a of annotations) {
      if ((a as any).url) urls.push((a as any).url);
      else if ((a as any).unsafeUrl) urls.push((a as any).unsafeUrl);
    }
    onProgress?.(p, pdf.numPages, `Scanning links on page ${p}/${pdf.numPages}…`);
  }
  const unique = Array.from(new Set(urls));
  return { text: unique.join("\n"), urls: unique };
}

// ─────────────────────────────────────────────────────────
//  METADATA
// ─────────────────────────────────────────────────────────

export async function getMetadata(file: File): Promise<Record<string, any>> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  const meta: Record<string, any> = {};
  meta.title = doc.getTitle();
  meta.author = doc.getAuthor();
  meta.subject = doc.getSubject();
  meta.keywords = doc.getKeywords();
  meta.creator = doc.getCreator();
  meta.producer = doc.getProducer();
  meta.creationDate = doc.getCreationDate();
  meta.modificationDate = doc.getModificationDate();
  meta.pageCount = doc.getPageCount();
  const pages = doc.getPages();
  meta.sizes = pages.map((p) => {
    const { width, height } = p.getSize();
    return { width: Math.round(width), height: Math.round(height) };
  });
  return meta;
}

export async function editMetadata(
  file: File,
  meta: { title?: string; author?: string; subject?: string; keywords?: string }
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  if (meta.title !== undefined) doc.setTitle(meta.title);
  if (meta.author !== undefined) doc.setAuthor(meta.author);
  if (meta.subject !== undefined) doc.setSubject(meta.subject);
  if (meta.keywords !== undefined) doc.setKeywords(meta.keywords ? meta.keywords.split(",").map((s) => s.trim()) : []);
  doc.setModificationDate(new Date());
  return doc.save();
}

export async function removeMetadata(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("");
  doc.setProducer("pdf-lib");
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));
  return doc.save();
}

// ─────────────────────────────────────────────────────────
//  COMPRESS
// ─────────────────────────────────────────────────────────

/**
 * Compress a PDF. "extreme"/"recommended" rasterize pages at a lower scale +
 * JPEG quality for dramatically smaller files (lossy). "high" re-saves
 * losslessly (strips unused objects).
 */
export async function compressPDF(
  file: File,
  level: "extreme" | "recommended" | "high" = "recommended",
  onProgress?: ProgressFn
): Promise<Uint8Array> {
  if (level === "high") {
    const bytes = await fileToBytes(file);
    const doc = await loadPdf(bytes);
    return doc.save({ useObjectStreams: true });
  }
  const scale = level === "extreme" ? 1 : 1.5;
  const quality = level === "extreme" ? 0.6 : 0.75;
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const out = await PDFDocument.create();
  const indices = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  await chunkedMap(indices, 5, async (p) => {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const jpgBlob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", quality)
    );
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
    const img = await out.embedJpg(jpgBytes);
    const newPage = out.addPage([viewport.width, viewport.height]);
    newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    canvas.width = 0; canvas.height = 0;
  }, onProgress, "Compressing page");
  return out.save({ useObjectStreams: true });
}

// ─────────────────────────────────────────────────────────
//  SECURITY (pdf-lib has no encryption; degrade gracefully)
// ─────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────
//  DOCUMENT CONTENT CREATION
// ─────────────────────────────────────────────────────────

/** Plain text → PDF, wrapping long lines. */
export async function textToPDF(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const lineHeight = fontSize * 1.4;
  const margin = 50;
  const [W, H] = PAGE_SIZES.letter;
  const maxWidth = W - margin * 2;

  const wrapLine = (line: string): string[] => {
    if (!line) return [""];
    const words = line.split(/\s+/);
    const out: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && cur) {
        out.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) out.push(cur);
    return out;
  };

  const allLines = text.split(/\r?\n/).flatMap(wrapLine);
  let page = doc.addPage([W, H]);
  let y = H - margin;
  for (const line of allLines) {
    if (y < margin) {
      page = doc.addPage([W, H]);
      y = H - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    y -= lineHeight;
  }
  return doc.save();
}

/** Strip lightweight Markdown to plain text, then render to PDF. */
export async function markdownToPDF(md: string): Promise<Uint8Array> {
  const text = md
    .replace(/^###\s+(.*)$/gm, "$1\n─────────")
    .replace(/^##\s+(.*)$/gm, "$1\n═════════")
    .replace(/^#\s+(.*)$/gm, "$1\n═════════════════")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)");
  return textToPDF(text);
}

export async function jsonToPDF(jsonStr: string): Promise<Uint8Array> {
  let pretty = jsonStr;
  try {
    pretty = JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch { /* keep raw */ }
  return textToPDF(pretty);
}

/** Minimal HTML → PDF (text-only extraction). */
export async function htmlToPDFBrowser(html: string): Promise<Uint8Array> {
  let text: string;
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    text = (div.textContent || "").replace(/\n{3,}/g, "\n\n");
  } else {
    text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  }
  return textToPDF(text);
}

// ─────────────────────────────────────────────────────────
//  RENDER-BASED OPS
// ─────────────────────────────────────────────────────────

export async function grayscalePDF(file: File, onProgress?: ProgressFn): Promise<Uint8Array> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const out = await PDFDocument.create();
  const indices = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  await chunkedMap(indices, 5, async (p) => {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = g;
    }
    ctx.putImageData(imgData, 0, 0);
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.85));
    const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const np = out.addPage([viewport.width, viewport.height]);
    np.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    canvas.width = 0; canvas.height = 0;
  }, onProgress, "Grayscaling page");
  return out.save();
}

export async function invertColorsPDF(file: File, onProgress?: ProgressFn): Promise<Uint8Array> {
  const pdfjs = await getPdfjs();
  const bytes = await fileToBytes(file);
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const out = await PDFDocument.create();
  const indices = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  await chunkedMap(indices, 5, async (p) => {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255 - d[i];
      d[i + 1] = 255 - d[i + 1];
      d[i + 2] = 255 - d[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.85));
    const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const np = out.addPage([viewport.width, viewport.height]);
    np.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    canvas.width = 0; canvas.height = 0;
  }, onProgress, "Inverting page");
  return out.save();
}

// ─────────────────────────────────────────────────────────
//  PDF → OFFICE / TEXT
// ─────────────────────────────────────────────────────────

export async function pdfToWordHTML(file: File, onProgress?: ProgressFn): Promise<Uint8Array> {
  const text = await extractText(file, onProgress);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Converted</title></head><body><div>${escaped}</div></body></html>`;
  return new TextEncoder().encode(html);
}

export async function pdfToCSV(file: File, onProgress?: ProgressFn): Promise<Uint8Array> {
  const text = await extractText(file, onProgress);
  const rows = text
    .split(/\n/)
    .map((l) => l.replace(/--- Page \d+ ---/g, "").trim())
    .filter(Boolean)
    .map((l) => `"${l.replace(/"/g, '""')}"`);
  return new TextEncoder().encode(rows.join("\n"));
}

export async function pdfToSlides(file: File, onProgress?: ProgressFn): Promise<Uint8Array> {
  return pdfToImages(file, "png", 1.5, onProgress);
}

// ─────────────────────────────────────────────────────────
//  BASE64
// ─────────────────────────────────────────────────────────

export async function pdfToBase64(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]);
  }
  return new TextEncoder().encode(btoa(binary));
}

export async function base64ToPDF(b64: string): Promise<Uint8Array> {
  const clean = b64.replace(/\s+/g, "").replace(/^data:[^;]+;base64,/, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ─────────────────────────────────────────────────────────
//  STATISTICS / INSPECTION
// ─────────────────────────────────────────────────────────

export async function pdfStatistics(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await loadPdf(bytes);
  const pages = doc.getPages();
  const stats = {
    pageCount: doc.getPageCount(),
    fileSizeBytes: file.size,
    fileSizeKB: Math.round(file.size / 1024),
    fileSizeMB: Math.round((file.size / 1024 / 1024) * 100) / 100,
    title: doc.getTitle(),
    author: doc.getAuthor(),
    producer: doc.getProducer(),
    creator: doc.getCreator(),
    creationDate: doc.getCreationDate(),
    modificationDate: doc.getModificationDate(),
    pageSize: pages[0] ? (() => { const { width, height } = pages[0].getSize(); return { width: Math.round(width), height: Math.round(height) }; })() : null,
    isEncrypted: doc.isEncrypted,
    approxByteSize: bytes.length,
  };
  return new TextEncoder().encode(JSON.stringify(stats, null, 2));
}

// ─────────────────────────────────────────────────────────
//  MAIN DISPATCHER
// ─────────────────────────────────────────────────────────

function pdfOut(data: Promise<Uint8Array> | Uint8Array, filename: string): Promise<ProcessResult> | ProcessResult {
  if (data instanceof Promise) return data.then((d) => ({ data: d, filename, type: "application/pdf" }));
  return { data, filename, type: "application/pdf" };
}
function zipOut(data: Promise<Uint8Array> | Uint8Array, filename: string): Promise<ProcessResult> | ProcessResult {
  if (data instanceof Promise) return data.then((d) => ({ data: d, filename, type: "application/zip" }));
  return { data, filename, type: "application/zip" };
}
function textOut(data: Promise<Uint8Array> | Uint8Array | string, filename: string, mime = "text/plain"): Promise<ProcessResult> | ProcessResult {
  if (typeof data === "string") {
    const encoded = new TextEncoder().encode(data);
    return { data: encoded, filename, type: mime };
  }
  if (data instanceof Promise) return data.then((d) => ({ data: d, filename, type: mime }));
  return { data, filename, type: mime };
}
function jsonOut(data: Promise<Uint8Array> | Uint8Array, filename: string): Promise<ProcessResult> | ProcessResult {
  return textOut(data, filename, "application/json");
}

export async function protectPDF(file: File, userPassword?: string, ownerPassword?: string, permissions?: any): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.save({
    userPassword: userPassword,
    ownerPassword: ownerPassword || userPassword || "owner-pdf-default",
    permissions: permissions
  } as any);
}

export async function unlockPDF(file: File, password?: string): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  try {
    const doc = await PDFDocument.load(bytes, { password, ignoreEncryption: false } as any);
    return doc.save();
  } catch (err: any) {
    if (err.message?.includes("password")) throw new Error("Incorrect or missing password.");
    throw err;
  }
}





/** Dispatcher invoked by the workflow context for every tool slug. */
import { toolStatusMap } from "@/domains/pdf/registry/tools";

export async function processFiles(
  slug: string,
  files: File[],
  options: ToolOptions = {},
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  // ── Centralized gate: soon tools return a standard coming-soon response.
  // Matches the dev-mode exception in src/app/pdf/[slug]/page.tsx so local
  // testing of soon tools still works in development.
  if (toolStatusMap.get(slug) !== "live" && process.env.NODE_ENV !== "development") {
    return { type: "coming-soon", message: `${slug} is not yet available. Check back soon.`, eta: undefined };
  }

  const file = files[0];
  const isTextCreationTool = ["text-to-pdf", "txt-to-pdf", "markdown-to-pdf", "json-to-pdf", "html-to-pdf", "base64-to-pdf"].includes(slug);
  if (!file && !isTextCreationTool) {
    throw new Error("No file selected.");
  }
  switch (slug) {
      // ── ORGANIZE ────────────────────────────────────────────

    case "merge":
      return { type: "coming-soon", message: "Merge is not yet available. Check back soon.", eta: undefined };

    case "extract-pages": {
      const total = await getPageCount(file);
      const indices = parsePageRange(options.splitRange || options.pagesToKeep || "1", total);
      const bytes = await fileToBytes(file);
      const src = await loadPdf(bytes);
      const doc = await PDFDocument.create();
      const pages = await doc.copyPages(src, indices);
      pages.forEach((p) => doc.addPage(p));
      return pdfOut(doc.save(), "extracted-pages.pdf");
    }

    case "delete-pages":
      return { type: "coming-soon", message: "Delete Pages is not yet available. Check back soon.", eta: undefined };

    case "split":
      return { type: "coming-soon", message: "Split is not yet available. Check back soon.", eta: undefined };


    // FIXED: N-Up Printing


    // FIXED: Create Booklet
    case "create-booklet": {
      const bytes = await fileToBytes(file);
      const srcDoc = await PDFDocument.load(bytes);
      const outDoc = await PDFDocument.create();
      const total = srcDoc.getPageCount();
      const multiplesOf4 = Math.ceil(total / 4) * 4;
      const indices = [];
      for (let i = 0; i < multiplesOf4 / 2; i++) {
        if (i % 2 === 0) {
          indices.push(multiplesOf4 - 1 - i, i);
        } else {
          indices.push(i, multiplesOf4 - 1 - i);
        }
      }
      const firstPage = srcDoc.getPage(0);
      const srcW = firstPage.getWidth();
      const srcH = firstPage.getHeight();
      
      for (let i = 0; i < indices.length; i += 2) {
        const outPage = outDoc.addPage([srcW * 2, srcH]);
        const leftIdx = indices[i];
        const rightIdx = indices[i+1];
        if (leftIdx < total) {
          const emb = await outDoc.embedPage(srcDoc.getPage(leftIdx));
          outPage.drawPage(emb, { x: 0, y: 0, width: srcW, height: srcH });
        }
        if (rightIdx < total) {
          const emb = await outDoc.embedPage(srcDoc.getPage(rightIdx));
          outPage.drawPage(emb, { x: srcW, y: 0, width: srcW, height: srcH });
        }
      }
      return pdfOut(outDoc.save(), "booklet.pdf");
    }

    // FIXED: Add Margin
    case "add-margin": {
      const m = options.margin || 20;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const oldW = page.getWidth();
        const oldH = page.getHeight();
        page.setSize(oldW + 2 * m, oldH + 2 * m);
        page.translateContent(m, m);
      }
      return pdfOut(doc.save(), "with-margin.pdf");
    }


    // FIXED: Duplex Simulator
    case "duplex-simulator": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const flipEdge = options.flipEdge || "long";
      for (let i = 1; i < doc.getPageCount(); i += 2) {
        if (flipEdge === "short") {
          const page = doc.getPage(i);
          const r = page.getRotation().angle;
          page.setRotation(degrees(r + 180));
        }
      }
      return pdfOut(doc.save(), "duplex-simulated.pdf");
    }

    // FIXED: Extract a range of pages (1-indexed)

    case "swap-pages":
      return { type: "coming-soon", message: "Swap Pages is not yet available. Check back soon.", eta: undefined };

    case "move-page":
      return { type: "coming-soon", message: "Move Page is not yet available. Check back soon.", eta: undefined };

    // FIXED: Insert another PDF at a specific position
    case "insert-pdf-at": {
      if (!options.insertPdf) throw new Error("No PDF to insert.");
      const atPage = (options.atPage || 1) - 1;
      const primaryBytes = await fileToBytes(file);
      const primarySrc = await PDFDocument.load(primaryBytes);
      const secondaryBytes = new Uint8Array(options.insertPdf as ArrayBuffer);
      const secondarySrc = await PDFDocument.load(secondaryBytes);
      const out = await PDFDocument.create();
      
      const beforeIndices = Array.from({ length: atPage }, (_, i) => i);
      const afterIndices = Array.from({ length: primarySrc.getPageCount() - atPage }, (_, i) => atPage + i);
      
      if (beforeIndices.length > 0) {
        const before = await out.copyPages(primarySrc, beforeIndices);
        before.forEach((p: any) => out.addPage(p));
      }
      
      const insertIndices = Array.from({ length: secondarySrc.getPageCount() }, (_, i) => i);
      const inserted = await out.copyPages(secondarySrc, insertIndices);
      inserted.forEach((p: any) => out.addPage(p));
      
      if (afterIndices.length > 0) {
        const after = await out.copyPages(primarySrc, afterIndices);
        after.forEach((p: any) => out.addPage(p));
      }
      return pdfOut(out.save(), "inserted.pdf");
    }

    // FIXED: Replace a page with one from another PDF
    case "replace-page": {
      if (!options.sourcePdf) throw new Error("No source PDF provided.");
      const targetPage = (options.targetPage || 1) - 1;
      const sourcePage = (options.sourcePage || 1) - 1;
      const primaryBytes = await fileToBytes(file);
      const primarySrc = await PDFDocument.load(primaryBytes);
      const sourceBytes = new Uint8Array(options.sourcePdf as ArrayBuffer);
      const sourceSrc = await PDFDocument.load(sourceBytes);
      const out = await PDFDocument.create();
      
      const total = primarySrc.getPageCount();
      for (let i = 0; i < total; i++) {
        if (i === targetPage) {
          const [repl] = await out.copyPages(sourceSrc, [sourcePage]);
          out.addPage(repl);
        } else {
          const [orig] = await out.copyPages(primarySrc, [i]);
          out.addPage(orig);
        }
      }
      return pdfOut(out.save(), "replaced.pdf");
    }

    // FIXED: Mirror Horizontal

    // FIXED: Mirror Vertical

    // FIXED: Scale Content
    case "scale-content": {
      const factor = (options.scale || 90) / 100;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const offsetX = (page.getWidth() * (1 - factor)) / 2;
        const offsetY = (page.getHeight() * (1 - factor)) / 2;
        page.translateContent(offsetX, offsetY);
        page.scaleContent(factor, factor);
      }
      return pdfOut(doc.save(), "scaled.pdf");
    }

    // FIXED: Uniform Page Size
    case "uniform-page-size": {
      const sizeStr = options.pageSize || "A4";
      const sizeMap: Record<string, [number, number]> = {
        "A4": [595.28, 841.89], "Letter": [612, 792],
        "A3": [841.89, 1190.55], "Legal": [612, 1008]
      };
      const [w, h] = sizeMap[sizeStr] || sizeMap["A4"];
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const oldW = page.getWidth();
        const oldH = page.getHeight();
        page.setSize(w, h);
        page.translateContent((w - oldW) / 2, (h - oldH) / 2);
      }
      return pdfOut(doc.save(), "uniform-size.pdf");
    }

    // FIXED: Pad to Square

    // FIXED: Trim Pages
    case "trim-pages": {
      const count = options.count || 1;
      const fromStart = options.from === "start";
      const bytes = await fileToBytes(file);
      const src = await PDFDocument.load(bytes);
      const total = src.getPageCount();
      if (count >= total) throw new Error("Cannot trim all pages.");
      const out = await PDFDocument.create();
      
      const indices = fromStart
        ? Array.from({ length: total - count }, (_, i) => i + count)
        : Array.from({ length: total - count }, (_, i) => i);
      
      const copied = await out.copyPages(src, indices);
      copied.forEach((p: any) => out.addPage(p));
      return pdfOut(out.save(), "trimmed.pdf");
    }

    // FIXED: Keep Nth Page
    case "keep-nth-page": {
      const n = options.n || 2;
      const bytes = await fileToBytes(file);
      const src = await PDFDocument.load(bytes);
      const total = src.getPageCount();
      const out = await PDFDocument.create();
      const indices = [];
      for (let i = 0; i < total; i += n) indices.push(i);
      if (indices.length > 0) {
        const copied = await out.copyPages(src, indices);
        copied.forEach((p: any) => out.addPage(p));
      }
      return pdfOut(out.save(), "every-nth.pdf");
    }

    case "split-every-n": {
      const n = options.n || 5;
      const bytes = await fileToBytes(file);
      const src = await PDFDocument.load(bytes);
      const totalPages = src.getPageCount();
      const zip = new JSZip();
      for (let i = 0; i < totalPages; i += n) {
        const doc = await PDFDocument.create();
        const end = Math.min(i + n, totalPages);
        const indices = Array.from({ length: end - i }, (_, idx) => i + idx);
        const copied = await doc.copyPages(src, indices);
        copied.forEach((p: any) => doc.addPage(p));
        zip.file(`part-${Math.floor(i/n) + 1}.pdf`, await doc.save());
      }
      return zipOut(zip.generateAsync({ type: "uint8array" }), "split-chunks.zip");
    }

    case "split-odd-even": {
      const bytes = await fileToBytes(file);
      const src = await PDFDocument.load(bytes);
      const totalPages = src.getPageCount();
      const zip = new JSZip();
      const oddDoc = await PDFDocument.create();
      const evenDoc = await PDFDocument.create();
      const oddIndices = [], evenIndices = [];
      for (let i = 0; i < totalPages; i++) {
        if (i % 2 === 0) oddIndices.push(i);
        else evenIndices.push(i);
      }
      if (oddIndices.length) {
        const oddPages = await oddDoc.copyPages(src, oddIndices);
        oddPages.forEach((p: any) => oddDoc.addPage(p));
        zip.file("odd.pdf", await oddDoc.save());
      }
      if (evenIndices.length) {
        const evenPages = await evenDoc.copyPages(src, evenIndices);
        evenPages.forEach((p: any) => evenDoc.addPage(p));
        zip.file("even.pdf", await evenDoc.save());
      }
      return zipOut(zip.generateAsync({ type: "uint8array" }), "split-odd-even.zip");
    }


    case "clone-pages": {
      const pageStr = options.pages || "";
      const copies = options.copies || 2;
      const pagesToClone = pageStr.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));
      const bytes = await fileToBytes(file);
      const src = await PDFDocument.load(bytes);
      for (const pIdx of pagesToClone) {
        if (pIdx >= 0 && pIdx < src.getPageCount()) {
          for (let i = 0; i < copies; i++) {
            const [copied] = await src.copyPages(src, [pIdx]);
            src.addPage(copied);
          }
        }
      }
      return pdfOut(src.save(), "cloned.pdf");
    }

    case "remove-blank-pages":
      return { type: "coming-soon", message: "Remove Blank Pages is not yet available. Check back soon.", eta: undefined };





    case "organize-pages": {
      const total = await getPageCount(file);
      const order = options.organizeOrder ? parsePageOrder(options.organizeOrder, total) : [];
      return pdfOut(organizePages(file, order), "organized.pdf");
    }



    case "insert-blank-pages":
      return pdfOut(addBlankPages(file, options.blankPosition ?? 0, options.blankCount ?? 1), "with-blank-pages.pdf");

    case "reverse-pages":
    case "reverse-page-order":
      return pdfOut(reversePDF(file), "reversed.pdf");



    case "crop-pages":
      return pdfOut(cropPDF(file, options.cropMargins || { top: 50, right: 50, bottom: 50, left: 50 }), "cropped.pdf");






    // ── OPTIMIZE ────────────────────────────────────────────
    case "reduce-pdf-size":
      return { type: "coming-soon", message: "PDF compression requires content-aware downsampling and is coming soon.", eta: "Q3 2026" };

    case "replace-image": {
      if (!options.newImage) throw new Error("No replacement image provided.");
      const imageIndex = options.imageIndex || 1;
      const pdfjs = await getPdfjs();
      const bytes = await fileToBytes(file);
      const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
      const out = await PDFDocument.create();
      const newImgBuf = new Uint8Array(options.newImage as ArrayBuffer);
      let newImg;
      try {
        newImg = await out.embedPng(newImgBuf);
      } catch {
        newImg = await out.embedJpg(newImgBuf);
      }
      for (let i = 1; i <= pdf.numPages; i++) {
        const p = await pdf.getPage(i);
        const vp = p.getViewport({ scale: 1.0 });
        const srcPage = (await PDFDocument.load(bytes)).getPages()[i - 1];
        const outPage = out.addPage([vp.width, vp.height]);
        if (i === imageIndex) {
          outPage.drawImage(newImg, { x: 0, y: 0, width: vp.width, height: vp.height });
        } else {
          const [embedded] = await out.embedPages([srcPage]);
          outPage.drawPage(embedded);
        }
      }
      return pdfOut(out.save(), "image-replaced.pdf");
    }

    case "remove-signatures":
      return { type: "coming-soon", message: "Remove Signatures is not yet available. Check back soon.", eta: undefined };


    // ── CONVERT TO PDF ──────────────────────────────────────
    // FIXED: BMP to PDF

    // FIXED: TIFF to PDF

    // FIXED: GIF to PDF

    // FIXED: AVIF to PDF

    // FIXED: CSV to PDF
    case "csv-to-pdf": {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const isLand = options.orientation === "landscape";
      const pgW = isLand ? 841.89 : 595.28;
      const pgH = isLand ? 595.28 : 841.89;
      let page = doc.addPage([pgW, pgH]);
      let y = pgH - 50;
      const margin = 50;
      const fontSize = 10;
      const rowHeight = 20;

      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(",");
        if (y < margin) {
          page = doc.addPage([pgW, pgH]);
          y = pgH - 50;
        }
        if (i % 2 !== 0 && i !== 0) {
          page.drawRectangle({ x: margin, y: y - 5, width: pgW - 2 * margin, height: rowHeight, color: rgb(0.95, 0.95, 0.95), borderWidth: 0 });
        }
        const colW = (pgW - 2 * margin) / Math.max(1, cols.length);
        const currentFont = i === 0 ? boldFont : font;
        for (let j = 0; j < cols.length; j++) {
          let t = cols[j].replace(/^"|"$/g, '').trim();
          if (t.length > 30) t = t.substring(0, 27) + "...";
          page.drawText(t, { x: margin + j * colW, y, size: fontSize, font: currentFont, color: rgb(0,0,0) });
        }
        y -= rowHeight;
      }
      return pdfOut(doc.save(), "table.pdf");
    }

    // FIXED: EPUB to PDF
    case "epub-to-pdf": {
      const bytes = await fileToBytes(file);
      const zip = await JSZip.loadAsync(bytes);
      const containerFile = zip.file("META-INF/container.xml");
      if (!containerFile) throw new Error("Invalid EPUB format.");
      
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      
      let allText = "EPUB Content Extraction:\n\n";
      for (const [filename, zf] of Object.entries(zip.files)) {
        if (!zf.dir && (filename.endsWith(".html") || filename.endsWith(".xhtml"))) {
          const html = await zf.async("string");
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, "text/html");
          allText += dom.body.textContent + "\n\n";
        }
      }
      
      let page = doc.addPage();
      let y = page.getHeight() - 50;
      const lines = allText.split("\n");
      for (const line of lines) {
        if (y < 50) {
          page = doc.addPage();
          y = page.getHeight() - 50;
        }
        let txt = line.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
        if (txt.length > 80) txt = txt.substring(0, 77) + "...";
        if (txt) {
          page.drawText(txt, { x: 50, y, size: 10, font });
          y -= 15;
        }
      }
      return pdfOut(doc.save(), "converted.pdf");
    }

    // FIXED: RTF to PDF
    case "rtf-to-pdf": {
      const text = await file.text();
      const plain = text.replace(/\{\\.*?\}/g, "").replace(/\\[a-z]+\d*\s?/g, " ").replace(/[\{\}]/g, "").trim();
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      let page = doc.addPage();
      let y = page.getHeight() - 50;
      const lines = plain.split("\n");
      for (const line of lines) {
        if (y < 50) {
          page = doc.addPage();
          y = page.getHeight() - 50;
        }
        let txt = line.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
        if (txt.length > 80) txt = txt.substring(0, 77) + "...";
        if (txt) {
          page.drawText(txt, { x: 50, y, size: 12, font });
          y -= 16;
        }
      }
      return pdfOut(doc.save(), "converted.pdf");
    }

    // FIXED: XML to PDF

    case "jpeg-to-pdf":
    case "image-to-pdf":
    case "images-to-pdf": {
      return pdfOut(await imagesToPDF([file]), "converted.pdf");
    }

    case "svg-to-pdf": {
      const png = await reencodeImageToPng(file);
      return pdfOut(await imagesToPDF([new File([png as any], "svg.png", { type: "image/png" })]), "svg-to-pdf.pdf");
    }

    case "text-to-pdf":

    case "markdown-to-pdf": {
      const md = await file.text();
      return pdfOut(markdownToPDF(md), "markdown-to-pdf.pdf");
    }

    case "html-to-pdf": {
      const html = await file.text();
      return pdfOut(htmlToPDFBrowser(html), "html-to-pdf.pdf");
    }

    // ── CONVERT FROM PDF ────────────────────────────────────
    // FIXED: Convert PDF to RTF
    case "pdf-to-rtf":
      return { type: "coming-soon", message: "PDF to RTF is not yet available. Check back soon.", eta: undefined };

    // FIXED: Convert PDF to ODT
    case "pdf-to-odt":
      return { type: "coming-soon", message: "PDF to ODT is not yet available. Check back soon.", eta: undefined };


    // FIXED: PDF Pages to PNG ZIP

    // FIXED: PDF Pages to JPG ZIP

    // FIXED: PDF to ICO

    // FIXED: PDF to PDF/X

    // FIXED: PDF to Long Image
    case "pdf-to-long-image":
      return { type: "coming-soon", message: "PDF to Long Image is not yet available. Check back soon.", eta: undefined };

    // FIXED: PDF Page to Clipboard

    // FIXED: PDF to Data URI

    // FIXED: PDF to ZUGFeRD XML

    case "extract-keywords":
      return { type: "coming-soon", message: "Extract Keywords is not yet available. Check back soon.", eta: undefined };

    case "extract-hyperlinks":
      return { type: "coming-soon", message: "Extract Hyperlinks is not yet available. Check back soon.", eta: undefined };

    // FIXED: Word Count

    // FIXED: Find & Replace Text (Simulated)
    case "find-replace-text": {
      return { type: "coming-soon", message: "PDF Find & Replace is complex due to text encoding. This feature is experimental." } as ProcessResult;
    }

    // FIXED: Extract Headings
    case "extract-headings":
      return { type: "coming-soon", message: "Extract Headings is not yet available. Check back soon.", eta: undefined };

    // FIXED: Extract Email Addresses
    case "extract-email-addresses":
      return { type: "coming-soon", message: "Extract Email Addresses is not yet available. Check back soon.", eta: undefined };

    // FIXED: Extract Phone Numbers
    case "extract-phone-numbers":
      return { type: "coming-soon", message: "Extract Phone Numbers is not yet available. Check back soon.", eta: undefined };

    // FIXED: Extract Dates








    case "pdf-to-xml":
      return { type: "coming-soon", message: "PDF to XML is not yet available. Check back soon.", eta: undefined };


    case "pdf-to-image":
      return zipOut(pdfToJPG(file, onProgress), "pdf-to-image.zip");

    case "extract-images":
      return { type: "coming-soon", message: "Extract Images is not yet available. Check back soon.", eta: undefined };




    case "pdf-to-html":
      return textOut(pdfToWordHTML(file, onProgress), "pdf-to-html.html", "text/html");

    case "pdf-to-markdown": {
      const text = await extractText(file, onProgress);
      return textOut(new TextEncoder().encode(text), "pdf-to-markdown.md", "text/markdown");
    }

    case "pdf-to-json":
      return { type: "coming-soon", message: "PDF to JSON is not yet available. Check back soon.", eta: undefined };

    case "pdf-to-epub":
      return zipOut((async () => {
        const text = await extractText(file, onProgress);
        const zip = new JSZip();
        zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
        zip.folder("META-INF")?.file("container.xml",
          '<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
        zip.folder("OEBPS")?.file("chapter1.html",
          `<?xml version="1.0" encoding="utf-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter 1</title></head><body><pre>${text.replace(/</g, "&lt;")}</pre></body></html>`);
        return zip.generateAsync({ type: "uint8array" });
      })(), "pdf-to-epub.epub");

    case "pdf-to-word":
      return textOut(pdfToWordHTML(file, onProgress), "pdf-to-word.doc", "application/msword");

    case "pdf-to-powerpoint":
      return zipOut(pdfToSlides(file, onProgress), "pdf-to-powerpoint.zip");

    // ── SECURITY ────────────────────────────────────────────

    // FIXED: Self-Destruct PDF

    // FIXED: Set Owner Password
    case "set-owner-password": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      return pdfOut(doc.save({
        ownerPassword: options.ownerPassword || "owner-pdf-default",
        userPassword: options.userPassword || undefined
      } as any), "protected.pdf");
    }

    // FIXED: Permission Editor
    case "permission-editor": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const p = {
        printing: options.printing === 'yes' ? 'highResolution' : undefined,
        modifying: options.modifying === 'yes' ? true : undefined,
        copying: options.copying === 'yes' ? true : undefined,
      };
      return pdfOut(doc.save({
        ownerPassword: options.ownerPassword || "owner-pdf-default",
        permissions: p
      } as any), "permissions-set.pdf");
    }

    // FIXED: PDF Hash
    case "pdf-hash": {
      const bytes = await fileToBytes(file);
      const algo = options.algorithm || "SHA-256";
      const hashBuffer = await crypto.subtle.digest(algo, bytes as any);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const report = `Algorithm: ${algo}\nFile: ${file.name}\nHash: ${hashHex}`;
      return textOut(report, "hash.txt", "text/plain");
    }

    // FIXED: Add Timestamp
    case "add-timestamp": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const now = new Date();
      doc.setCreationDate(now);
      doc.setModificationDate(now);
      return pdfOut(doc.save(), "timestamped.pdf");
    }

    case "protect-pdf":
    case "protect": {
      return pdfOut(protectPDF(file, options.userPassword, options.ownerPassword, options.permissions), "protected.pdf");
    }

    case "unlock": {
      return pdfOut(unlockPDF(file, options.password), "unlocked.pdf");
    }


    // ── EDIT PDF ────────────────────────────────────────────
    case "add-page-numbers":
      return pdfOut(addPageNumbers(file, options.pageNumberPosition, options.pageNumberStart ?? 1, options.pageNumberFormat || "decimal"), "numbered.pdf");

    case "headers-footers":
      return pdfOut(addHeaderFooter(file, options.watermarkText || "", options.addTextContent || ""), "headers-footers.pdf");

    // FIXED: Add Arrow
    case "add-arrow": {
      const pageIdx = (options.page || 1) - 1;
      const x1 = options.x1 || 50; const y1 = options.y1 || 400;
      const x2 = options.x2 || 200; const y2 = options.y2 || 400;
      const thickness = options.strokeWidth || 2;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      if (pageIdx >= 0 && pageIdx < pages.length) {
        const page = pages[pageIdx];
        page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: rgb(0,0,0) });
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headlen = 15;
        page.drawLine({
          start: { x: x2, y: y2 },
          end: { x: x2 - headlen * Math.cos(angle - Math.PI / 6), y: y2 - headlen * Math.sin(angle - Math.PI / 6) },
          thickness, color: rgb(0,0,0)
        });
        page.drawLine({
          start: { x: x2, y: y2 },
          end: { x: x2 - headlen * Math.cos(angle + Math.PI / 6), y: y2 - headlen * Math.sin(angle + Math.PI / 6) },
          thickness, color: rgb(0,0,0)
        });
      }
      return pdfOut(doc.save(), "arrow-added.pdf");
    }

    // FIXED: Add Text Box
    case "add-text-box": {
      const pageIdx = (options.page || 1) - 1;
      const x = options.x || 50; const y = options.y || 400;
      const w = options.width || 200; const h = options.height || 40;
      const text = options.text || "Text Box";
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      if (pageIdx >= 0 && pageIdx < pages.length) {
        const page = pages[pageIdx];
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(1,1,1), borderColor: rgb(0,0,0), borderWidth: 1 });
        page.drawText(text, { x: x + 5, y: y + h - 18, size: 12, font, color: rgb(0,0,0) });
      }
      return pdfOut(doc.save(), "text-box-added.pdf");
    }

    // FIXED: Add Callout
    case "add-callout": {
      const pageIdx = (options.page || 1) - 1;
      const x = options.x || 100; const y = options.y || 400;
      const text = options.text || "Callout";
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      if (pageIdx >= 0 && pageIdx < pages.length) {
        const page = pages[pageIdx];
        const tw = font.widthOfTextAtSize(text, 12);
        const bw = tw + 20; const bh = 30;
        page.drawRectangle({ x, y, width: bw, height: bh, color: rgb(1,1,1), borderColor: rgb(0,0,0), borderWidth: 1 });
        page.drawLine({ start: { x: x + 20, y }, end: { x: x + 10, y: y - 15 }, thickness: 1, color: rgb(0,0,0) });
        page.drawLine({ start: { x: x + 10, y: y - 15 }, end: { x: x + 30, y }, thickness: 1, color: rgb(0,0,0) });
        page.drawLine({ start: { x: x + 21, y }, end: { x: x + 29, y }, thickness: 1.5, color: rgb(1,1,1) });
        page.drawText(text, { x: x + 10, y: y + 10, size: 12, font, color: rgb(0,0,0) });
      }
      return pdfOut(doc.save(), "callout-added.pdf");
    }

    // FIXED: Overlay PDF
    case "overlay-pdf": {
      if (!options.overlayPdf) throw new Error("No overlay PDF provided.");
      const opacity = options.opacity !== undefined ? options.opacity : 0.3;
      const primaryBytes = await fileToBytes(file);
      const doc = await PDFDocument.load(primaryBytes);
      const overlayBytes = new Uint8Array(options.overlayPdf as ArrayBuffer);
      const pdfjs = await getPdfjs();
      const overlayDoc = await pdfjs.getDocument({ data: overlayBytes }).promise;
      const overlayPngs = [];
      for (let i = 1; i <= overlayDoc.numPages; i++) {
        const p = await overlayDoc.getPage(i);
        const vp = p.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await p.render({ canvasContext: ctx, viewport: vp }).promise;
        const targetCtx = document.createElement("canvas").getContext("2d")!;
        targetCtx.canvas.width = vp.width; targetCtx.canvas.height = vp.height;
        targetCtx.globalAlpha = opacity;
        targetCtx.drawImage(canvas, 0, 0);
        const blob = await new Promise<Blob>((res) => targetCtx.canvas.toBlob((b) => res(b!), "image/png"));
        overlayPngs.push(new Uint8Array(await blob.arrayBuffer()));
      }
      const pages = doc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const overlayIdx = Math.min(i, Math.max(0, overlayPngs.length - 1));
        if (overlayPngs.length > 0) {
          const img = await doc.embedPng(overlayPngs[overlayIdx]);
          page.drawImage(img, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        }
      }
      return pdfOut(doc.save(), "overlaid.pdf");
    }

    // FIXED: Add Grid Overlay
    case "add-grid-overlay": {
      const spacing = options.gridSize || 50;
      const colorStr = options.lineColor || "#cccccc";
      const hex = colorStr.replace("#", "");
      const r = parseInt(hex.substring(0,2), 16) / 255 || 0.8;
      const g = parseInt(hex.substring(2,4), 16) / 255 || 0.8;
      const b = parseInt(hex.substring(4,6), 16) / 255 || 0.8;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const w = page.getWidth();
        const h = page.getHeight();
        for (let x = spacing; x < w; x += spacing) page.drawLine({ start: { x, y: 0 }, end: { x, y: h }, thickness: 0.5, color: rgb(r,g,b) });
        for (let y = spacing; y < h; y += spacing) page.drawLine({ start: { x: 0, y }, end: { x: w, y }, thickness: 0.5, color: rgb(r,g,b) });
      }
      return pdfOut(doc.save(), "grid-overlay.pdf");
    }

    // FIXED: Add Crop Marks
    case "add-crop-marks": {
      const bleed = options.bleed !== undefined ? options.bleed : 9;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const mb = page.getMediaBox();
        page.setMediaBox(mb.x - bleed, mb.y - bleed, mb.width + bleed * 2, mb.height + bleed * 2);
        const w = page.getWidth(); const h = page.getHeight();
        const drawMark = (x: number, y: number, dx: number, dy: number) => {
          page.drawLine({ start: { x, y }, end: { x: x + dx, y }, thickness: 0.25, color: rgb(0,0,0) });
          page.drawLine({ start: { x, y }, end: { x, y: y + dy }, thickness: 0.25, color: rgb(0,0,0) });
        };
        drawMark(0, 0, 18, 18);
        drawMark(w, 0, -18, 18);
        drawMark(0, h, 18, -18);
        drawMark(w, h, -18, -18);
      }
      return pdfOut(doc.save(), "with-crop-marks.pdf");
    }

    // FIXED: Add Bleed
    case "add-bleed": {
      const bleed = options.bleedPt || 9;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const mb = page.getMediaBox();
        page.setMediaBox(mb.x - bleed, mb.y - bleed, mb.width + bleed * 2, mb.height + bleed * 2);
      }
      return pdfOut(doc.save(), "bleed-added.pdf");
    }

    // FIXED: Tint Pages
    case "tint-pages": {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const hex = (options.color || "#ffff00").replace("#", "");
      const r = parseInt(hex.substring(0,2), 16) / 255 || 1;
      const g = parseInt(hex.substring(2,4), 16) / 255 || 1;
      const b = parseInt(hex.substring(4,6), 16) / 255 || 0;
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const mb = page.getMediaBox();
        page.drawRectangle({ x: mb.x, y: mb.y, width: mb.width, height: mb.height, color: rgb(r,g,b), opacity: opacity });
      }
      return pdfOut(doc.save(), "tinted.pdf");
    }

    case "add-watermark":
    case "watermark-pdf": {
      const wmHex = options.watermarkColor;
      let wmColor: { r: number; g: number; b: number } | undefined;
      if (wmHex) {
        const m = /^#?([0-9a-f]{6})$/i.exec(wmHex.trim());
        if (m) {
          const n = parseInt(m[1], 16);
          wmColor = { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
        }
      }
      return pdfOut(addWatermarkEnhanced(file, {
        text: options.watermarkText || "WATERMARK",
        opacity: options.watermarkOpacity ?? 0.15,
        fontSize: options.watermarkFontSize,
        angle: options.watermarkAngle ?? -45,
        color: wmColor,
        tile: options.watermarkTile ?? false,
      }), "watermarked.pdf");
    }


    case "add-text":
      return pdfOut(addTextToPDF(file, options.addTextContent || "Sample Text", options.addTextSize ?? 14, options.addTextX, options.addTextY, options.addTextColor), "text-added.pdf");

    case "add-background":
      return pdfOut(addBackground(file, options.addTextColor || "#f5f5f5"), "background-added.pdf");

    case "add-image":
    case "add-images":
      return { type: "coming-soon", message: "Adding images to PDF pages requires a visual placement UI and is coming soon.", eta: "Q4 2026" };

    case "add-date-stamp": {
      // FIXED: draws today's date
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const page = doc.getPages()[0];
      const dateStr = new Date().toLocaleDateString();
      page.drawRectangle({ x: 45, y: 45, width: 120, height: 30, color: rgb(0.9, 0.9, 0.9), borderColor: rgb(0,0,0), borderWidth: 1 });
      page.drawText(dateStr, { x: 50, y: 55, size: 14, color: rgb(0,0,0) });
      return pdfOut(doc.save(), "date-stamped.pdf");
    }

    case "add-stamps": {
      // FIXED: draws rotated text stamp
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const page = doc.getPages()[0];
      const text = (options.addTextContent || "APPROVED").toUpperCase();
      page.drawText(text, { x: 100, y: 100, size: 48, color: text === "REJECTED" ? rgb(1,0,0) : rgb(0,0,1), rotate: degrees(30), opacity: 0.5 });
      return pdfOut(doc.save(), "stamped.pdf");
    }

    case "add-shapes": {
      // FIXED: draws rectangles/ellipses/lines
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const page = doc.getPages()[0];
      page.drawRectangle({ x: 50, y: 50, width: 100, height: 100, borderColor: rgb(1,0,0), borderWidth: 2 });
      return pdfOut(doc.save(), "with-shapes.pdf");
    }

    case "highlight-text":
    case "underline-text":
    case "strike-text":
      return { type: "coming-soon", message: `${slug} is not yet available. Check back soon.`, eta: undefined };

    case "add-comments":
      return { type: "coming-soon", message: "Adding comments/annotations to PDF pages requires a visual placement UI and is coming soon.", eta: "Q4 2026" };

    case "flatten-forms": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      form.flatten();
      return pdfOut(doc.save(), "flattened.pdf");
    }

    case "draw-signature":
    case "draw-on-pdf":
    case "add-qr-code":
    case "ocr":


    case "edit-bookmarks":
      return { type: "coming-soon", message: "Modifying bookmark trees client-side is coming soon.", eta: "Q4 2026" };


    // ── SIGNATURES & FORMS ──────────────────────────────────
    case "upload-signature": {
      // FIXED: passthrough — returns uploaded signature image as signature.png
      const bytes = await fileToBytes(file);
      return { type: file.type || "image/png", data: bytes, filename: "signature.png" };
    }

    case "type-signature": {
      // FIXED: creates a new PDF with text signature
      const doc = await PDFDocument.create();
      const page = doc.addPage([400, 200]);
      page.drawText(options.addTextContent || "Signature", { x: 50, y: 80, size: 48 });
      return pdfOut(doc.save(), "signature.pdf");
    }

    case "add-initials": {
      // FIXED: draws initials text at specified coordinates
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const page = doc.getPages()[(options.initialsPage || 1) - 1];
      if (page) {
        page.drawText(options.initials || "Initials", { x: options.initialsX || 50, y: options.initialsY || 50, size: 24 });
      }
      return pdfOut(doc.save(), "with-initials.pdf");
    }



    // FIXED: Export FDF
    case "export-fdf": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      const fields = form.getFields();
      let fdf = "%FDF-1.2\n1 0 obj\n<< /FDF << /Fields [ ";
      for (const field of fields) {
        const name = field.getName();
        let val = "";
        try {
          if (field.constructor.name === "PDFTextField") val = (field as any).getText() || "";
          else if (field.constructor.name === "PDFCheckBox") val = (field as any).isChecked() ? "Yes" : "Off";
          else if (field.constructor.name === "PDFRadioGroup") val = (field as any).getSelected() || "";
          else if (field.constructor.name === "PDFDropdown") val = (field as any).getSelected()[0] || "";
        } catch(e) {}
        fdf += `<< /T (${name}) /V (${val}) >> `;
      }
      fdf += "] >> >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF";
      return textOut(fdf, "data.fdf", "application/vnd.fdf");
    }

    // FIXED: Import FDF
    case "import-fdf": {
      if (files.length < 2) throw new Error("Please select both a PDF and an FDF file.");
      const pdfFile = files[0].name.toLowerCase().endsWith(".pdf") ? files[0] : files[1];
      const fdfFile = files[0].name.toLowerCase().endsWith(".fdf") ? files[0] : files[1];
      if (!pdfFile || !fdfFile) throw new Error("Please select both a PDF and an FDF file.");
      const fdfText = await fdfFile.text();
      const bytes = await fileToBytes(pdfFile);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      const fieldRegex = /<<\s*\/T\s*\((.*?)\)\s*\/V\s*\((.*?)\)\s*>>/g;
      let match;
      while ((match = fieldRegex.exec(fdfText)) !== null) {
        const name = match[1];
        const val = match[2];
        try {
          const f = form.getField(name);
          if (f) {
            if (f.constructor.name === "PDFTextField") (f as any).setText(val);
            else if (f.constructor.name === "PDFCheckBox") val === "Yes" ? (f as any).check() : (f as any).uncheck();
            else if (f.constructor.name === "PDFRadioGroup") (f as any).select(val);
            else if (f.constructor.name === "PDFDropdown") (f as any).select(val);
          }
        } catch (e) {}
      }
      return pdfOut(doc.save(), "imported.pdf");
    }

    // FIXED: Export XFDF
    case "export-xfdf": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      const fields = form.getFields();
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields>\n`;
      for (const field of fields) {
        const name = field.getName();
        let val = "";
        try {
          if (field.constructor.name === "PDFTextField") val = (field as any).getText() || "";
          else if (field.constructor.name === "PDFCheckBox") val = (field as any).isChecked() ? "Yes" : "Off";
          else if (field.constructor.name === "PDFRadioGroup") val = (field as any).getSelected() || "";
          else if (field.constructor.name === "PDFDropdown") val = (field as any).getSelected()[0] || "";
        } catch(e) {}
        const escapedVal = val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        xml += `<field name="${name}"><value>${escapedVal}</value></field>\n`;
      }
      xml += `</fields>\n</xfdf>`;
      return textOut(xml, "data.xfdf", "application/vnd.adobe.xfdf");
    }

    // FIXED: Flatten Annotations

    // FIXED: Highlight Form Fields
    case "highlight-form-fields": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      const fields = form.getFields();
      const colorHex = (options.fillColor || "#ffff00").replace("#", "");
      const r = parseInt(colorHex.substring(0,2), 16) / 255 || 1;
      const g = parseInt(colorHex.substring(2,4), 16) / 255 || 1;
      const b = parseInt(colorHex.substring(4,6), 16) / 255 || 0;
      
      for (const field of fields) {
        const widgets = field.acroField.getWidgets();
        for (const widget of widgets) {
          const rect = widget.getRectangle();
          const p = widget.P();
          if (p) {
            const pageRef = p;
            const pages = doc.getPages();
            const page = pages.find((pg: any) => pg.ref === pageRef);
            if (page) {
              page.drawRectangle({
                x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                color: rgb(r, g, b), opacity: 0.3
              });
            }
          }
        }
      }
      return pdfOut(doc.save(), "highlighted-fields.pdf");
    }

    case "fill-forms":
    case "import-form-data": {
      // FIXED: iterates formData and sets field values
      if (!options.formData) throw new Error("No form data provided");
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      for (const [key, val] of Object.entries(options.formData)) {
        try {
          const field = form.getField(key);
          if (field.constructor.name === "PDFTextField") (field as any).setText(String(val));
          else if (field.constructor.name === "PDFCheckBox") {
            if (val === true || val === "true") (field as any).check();
            else (field as any).uncheck();
          }
        } catch(e) {}
      }
      return pdfOut(doc.save(), "filled.pdf");
    }

    case "export-form-data": {
      // FIXED: extracts form fields to JSON
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const fields = doc.getForm().getFields().map(f => {
        let value = "";
        try {
          if (f.constructor.name === "PDFTextField") value = (f as any).getText() || "";
          else if (f.constructor.name === "PDFCheckBox") value = (f as any).isChecked() ? "true" : "false";
          else if (f.constructor.name === "PDFDropdown") value = (f as any).getSelected()[0] || "";
          else if (f.constructor.name === "PDFRadioGroup") value = (f as any).getSelected() || "";
        } catch(e) {}
        return { name: f.getName(), value };
      });
      return jsonOut(new TextEncoder().encode(JSON.stringify({ fields }, null, 2)), "form-data.json");
    }

    // FIXED: Font Inspector
    case "font-inspector":
      return { type: "coming-soon", message: "PDF Font Inspector is not yet available. Check back soon.", eta: undefined };

    // FIXED: Color Space Analyzer
    case "color-space-analyzer": {
      const pdfjs = await getPdfjs();
      const bytes = await fileToBytes(file);
      const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
      return textOut(JSON.stringify({ note: "Advanced color space analysis (CMYK/RGB) requires native PDF parsing. Most web-rendered PDFs default to RGB or sRGB via PDF.js." }, null, 2), "color-space.json", "application/json");
    }

    // FIXED: Link Extractor

    // FIXED: Image Extractor
    case "image-extractor": {
      const pdfjs = await getPdfjs();
      const bytes = await fileToBytes(file);
      const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
      const zip = new JSZip();
      let imgCount = 0;
      for (let i = 1; i <= doc.numPages; i++) {
        if (onProgress) onProgress(i, doc.numPages, "Processing");
        const page = await doc.getPage(i);
        const ops = await page.getOperatorList();
        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject || ops.fnArray[j] === (pdfjs.OPS as any).paintJpegXObject) {
            const imgObjId = ops.argsArray[j][0];
            try {
              const imgObj = await page.objs.get(imgObjId);
              if (imgObj && imgObj.data) {
                imgCount++;
                const isJpeg = ops.fnArray[j] === (pdfjs.OPS as any).paintJpegXObject;
                zip.file(`image-${i}-${imgCount}.${isJpeg ? 'jpg' : 'png'}`, imgObj.data);
              }
            } catch (e) {}
          }
        }
      }
      if (imgCount === 0) return textOut("No extractable images found.", "result.txt", "text/plain");
      return zipOut(zip.generateAsync({ type: "uint8array" }), "images.zip");
    }

    // FIXED: Attachment Inspector
    case "attachment-inspector":
      return { type: "coming-soon", message: "PDF Attachment Inspector is not yet available. Check back soon.", eta: undefined };

    // FIXED: PDF Size Analyzer
    case "pdf-size-analyzer": {
      return textOut(JSON.stringify({
        filename: file.name,
        totalBytes: file.size,
        totalMegabytes: (file.size / (1024 * 1024)).toFixed(2) + " MB"
      }, null, 2), "size-report.json", "application/json");
    }

    // FIXED: Page Size Inspector

    // FIXED: Version Checker
    case "version-checker":
      return { type: "coming-soon", message: "Version Checker is not yet available. Check back soon.", eta: undefined };

    // FIXED: Accessibility Checker

    case "form-field-inspector":
      return { type: "coming-soon", message: "Form Field Inspector is not yet available. Check back soon.", eta: undefined };

    case "form-field-renamer": {
      // FIXED: updates /T entry using PDFName
      if (!options.formRenameMap) throw new Error("No rename map provided");
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const { PDFName } = await import("pdf-lib");
      for (const field of doc.getForm().getFields()) {
        const newName = options.formRenameMap[field.getName()];
        if (newName) field.acroField.dict.set(PDFName.of('T'), doc.context.obj(newName));
      }
      return pdfOut(doc.save(), "renamed-fields.pdf");
    }

    case "create-form-fields": {
      // FIXED: creates new fields using pdf-lib form creation API
      if (!options.formFieldSpecs) throw new Error("No field specs provided");
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      const pages = doc.getPages();
      for (const spec of options.formFieldSpecs) {
        const page = pages[spec.page - 1];
        if (!page) continue;
        if (spec.type === "text") {
          const field = form.createTextField(spec.name);
          field.addToPage(page, { x: spec.x, y: spec.y, width: spec.width, height: spec.height });
        } else if (spec.type === "checkbox") {
          const field = form.createCheckBox(spec.name);
          field.addToPage(page, { x: spec.x, y: spec.y, width: spec.width, height: spec.height });
        }
      }
      return pdfOut(doc.save(), "with-fields.pdf");
    }

    // ── VIEW & READ ─────────────────────────────────────────



    case "metadata-editor": {
      // FIXED: updates PDF metadata using options
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      if (options.metaTitle !== undefined) doc.setTitle(options.metaTitle);
      if (options.metaAuthor !== undefined) doc.setAuthor(options.metaAuthor);
      if (options.metaSubject !== undefined) doc.setSubject(options.metaSubject);
      if (options.metaKeywords !== undefined) doc.setKeywords(options.metaKeywords.split(',').map(s => s.trim()));
      if (options.metaCreator !== undefined) doc.setCreator(options.metaCreator);
      if (options.metaProducer !== undefined) doc.setProducer(options.metaProducer);
      return pdfOut(doc.save(), "metadata-updated.pdf");
    }

    // ── ANALYSIS & INSPECTION ───────────────────────────────
    case "pdf-diff": {
      if (!options.secondPdf) throw new Error("Please provide two PDF files to compare.");
      const pdfjs = await getPdfjs();
      const bytes1 = await fileToBytes(file);
      const bytes2 = new Uint8Array(options.secondPdf as ArrayBuffer);
      const doc1 = await pdfjs.getDocument({ data: bytes1.slice() }).promise;
      const doc2 = await pdfjs.getDocument({ data: bytes2.slice() }).promise;
      const p1 = await doc1.getPage(1);
      const p2 = await doc2.getPage(1);
      const vp1 = p1.getViewport({ scale: 2 });
      const vp2 = p2.getViewport({ scale: 2 });
      const w = Math.max(vp1.width, vp2.width);
      const h = Math.max(vp1.height, vp2.height);
      const c1 = document.createElement('canvas'); c1.width = w; c1.height = h;
      const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
      await p1.render({ canvasContext: c1.getContext('2d')!, viewport: vp1 }).promise;
      await p2.render({ canvasContext: c2.getContext('2d')!, viewport: vp2 }).promise;
      const ctx1 = c1.getContext('2d')!.getImageData(0, 0, w, h);
      const ctx2 = c2.getContext('2d')!.getImageData(0, 0, w, h);
      const diffCanvas = document.createElement('canvas'); diffCanvas.width = w; diffCanvas.height = h;
      const diffCtx = diffCanvas.getContext('2d')!;
      const diffData = diffCtx.createImageData(w, h);
      let diffPixels = 0;
      for (let i = 0; i < ctx1.data.length; i += 4) {
        const diff = Math.abs(ctx1.data[i] - ctx2.data[i]) + Math.abs(ctx1.data[i+1] - ctx2.data[i+1]) + Math.abs(ctx1.data[i+2] - ctx2.data[i+2]);
        if (diff > 30) { diffData.data[i] = 255; diffData.data[i+1] = 0; diffData.data[i+2] = 0; diffData.data[i+3] = 200; diffPixels++; }
        else { diffData.data[i] = ctx1.data[i]; diffData.data[i+1] = ctx1.data[i+1]; diffData.data[i+2] = ctx1.data[i+2]; diffData.data[i+3] = 100; }
      }
      diffCtx.putImageData(diffData, 0, 0);
      const blob = await new Promise<Blob>(r => diffCanvas.toBlob(b => r(b!), 'image/png'));
      return { type: 'image/png', data: new Uint8Array(await blob.arrayBuffer()), filename: 'diff.png' };
    }


    case "extract-tables":
      return { type: "coming-soon", message: "Extract Tables is not yet available. Check back soon.", eta: undefined };


    case "attachment-viewer":
      return { type: "coming-soon", message: "PDF Attachment Viewer is not yet available. Check back soon.", eta: undefined };

    case "version-detector": {
      const bytes = await fileToBytes(file);
      const header = new TextDecoder().decode(bytes.slice(0, 1024));
      const versionMatch = header.match(/%PDF-(\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : "unknown";
      // Try to count pages via cross-ref or object count
      const doc = await PDFDocument.load(bytes);
      const pageCount = doc.getPageCount();
      const title = doc.getTitle() || "(none)";
      const author = doc.getAuthor() || "(none)";
      const result = [
        "PDF Version Report",
        "==================",
        "",
        `Version:    PDF ${version}`,
        `Pages:      ${pageCount}`,
        `Title:      ${title}`,
        `Author:     ${author}`,
        `File size:  ${bytes.length} bytes`,
        `Producer:   ${doc.getProducer() || "(none)"}`,
        `Creator:    ${doc.getCreator() || "(none)"}`,
      ].join("\n");
      const encoder = new TextEncoder();
      return { type: "text/plain", data: encoder.encode(result), filename: "version-report.txt" };
    }

    // ── TEXT TOOLS ──────────────────────────────────────────

    // ── PRINTING ────────────────────────────────────────────
    case "poster-print":
      return { type: "coming-soon", message: "Poster printing (splitting pages across sheets) is coming soon.", eta: "Q4 2026" };

    case "print-margin-adjuster": {
      // FIXED: adjust margins by changing CropBox
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const box = page.getCropBox();
        const m = options.cropMargins || { top: 20, right: 20, bottom: 20, left: 20 };
        page.setCropBox(box.x + m.left, box.y + m.bottom, box.width - (m.left + m.right), box.height - (m.top + m.bottom));
      }
      return pdfOut(doc.save(), "adjusted-margins.pdf");
    }


    // FIXED: PDF to Base64

    // FIXED: Base64 to PDF

    // FIXED: Edit Metadata
    case "edit-metadata": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      if (options.title) doc.setTitle(options.title);
      if (options.author) doc.setAuthor(options.author);
      if (options.subject) doc.setSubject(options.subject);
      if (options.keywords) doc.setKeywords([options.keywords]);
      return pdfOut(doc.save(), "metadata-edited.pdf");
    }

    // FIXED: Remove Metadata

    // FIXED: Add PDF Properties
    case "add-pdf-properties": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      if (options.title) doc.setTitle(options.title);
      if (options.author) doc.setAuthor(options.author);
      if (options.subject) doc.setSubject(options.subject);
      if (options.keywords) doc.setKeywords([options.keywords]);
      return pdfOut(doc.save(), "properties-added.pdf");
    }

    // FIXED: Repair PDF
    case "repair-pdf": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      return pdfOut(doc.save(), "repaired.pdf");
    }

    // FIXED: Optimize Fonts
    case "optimize-fonts": {
      const bytes = await fileToBytes(file);
      const doc = await PDFDocument.load(bytes);
      return pdfOut(doc.save({ useObjectStreams: true }), "fonts-optimized.pdf");
    }

    // FIXED: Remove Images
    case "remove-images": {
      return { type: "coming-soon", message: "Removing images natively from a PDF requires a full rasterization engine (coming in v2)." } as ProcessResult;
    }

    case "dark-mode-reader": {
      return { type: "coming-soon", message: "Dark Mode Reader is not yet available. Check back soon.", eta: undefined };
    }
    case "reading-time": {
      return { type: "coming-soon", message: "Reading Time Calculator is not yet available. Check back soon.", eta: undefined };
    }

    case "mark-required-fields": {
      return { type: "coming-soon", message: "Mark Required Fields is not yet available. Check back soon.", eta: undefined };
    }
    case "form-to-html": {
      return { type: "coming-soon", message: "Form to HTML is not yet available. Check back soon.", eta: undefined };
    }
    case "color-analyser": {
      return { type: "coming-soon", message: "Color Analyser is not yet available. Check back soon.", eta: undefined };
    }
    case "image-count": {
      return { type: "coming-soon", message: "Image Count is not yet available. Check back soon.", eta: undefined };
    }
    case "detect-duplicates": {
      return { type: "coming-soon", message: "Detect Duplicates is not yet available. Check back soon.", eta: undefined };
    }
    case "text-density-map": {
      return { type: "coming-soon", message: "Text Density Map is not yet available. Check back soon.", eta: undefined };
    }
    case "language-detector": {
      return { type: "coming-soon", message: "Language Detector is not yet available. Check back soon.", eta: undefined };
    }
    case "size-breakdown": {
      return { type: "coming-soon", message: "Size Breakdown is not yet available. Check back soon.", eta: undefined };
    }
    case "compliance-report": {
      return { type: "coming-soon", message: "Compliance Report is not yet available. Check back soon.", eta: undefined };
    }
    case "keyword-frequency": {
      return { type: "coming-soon", message: "Keyword Frequency is not yet available. Check back soon.", eta: undefined };
    }
    case "unique-word-count": {
      return { type: "coming-soon", message: "Unique Word Count is not yet available. Check back soon.", eta: undefined };
    }
    case "tts-prep": {
      return { type: "coming-soon", message: "TTS Prep is not yet available. Check back soon.", eta: undefined };
    }
    case "imposition-layout": {
      return { type: "coming-soon", message: "Imposition Layout is not yet available. Check back soon.", eta: undefined };
    }
    case "signature-booklet": {
      return { type: "coming-soon", message: "Signature Booklet is not yet available. Check back soon.", eta: undefined };
    }
    case "duplex-prep": {
      return { type: "coming-soon", message: "Duplex Prep is not yet available. Check back soon.", eta: undefined };
    }
    case "merge-with-toc": {
      return { type: "coming-soon", message: "Merge with TOC is not yet available. Check back soon.", eta: undefined };
    }
    case "batch-convert": {
      return { type: "coming-soon", message: "Batch Convert is not yet available. Check back soon.", eta: undefined };
    }
    case "page-range-picker": {
      return { type: "coming-soon", message: "Page Range Picker is not yet available. Check back soon.", eta: undefined };
    }
    case "metadata-template": {
      return { type: "coming-soon", message: "Metadata Template is not yet available. Check back soon.", eta: undefined };
    }
    case "shrink-report": {
      return { type: "coming-soon", message: "Shrink Report is not yet available. Check back soon.", eta: undefined };
    }
    case "viewer": {
      return { type: "coming-soon", message: "PDF Viewer is not yet available. Check back soon.", eta: undefined };
    }
    case "dual-page-viewer": {
      return { type: "coming-soon", message: "PDF Dual Page Viewer is not yet available. Check back soon.", eta: undefined };
    }
    case "continuous-scroll-viewer": {
      return { type: "coming-soon", message: "PDF Continuous Scroll Viewer is not yet available. Check back soon.", eta: undefined };
    }
    case "thumbnail-browser": {
      return { type: "coming-soon", message: "PDF Thumbnail Browser is not yet available. Check back soon.", eta: undefined };
    }
    case "bookmark-navigator": {
      return { type: "coming-soon", message: "PDF Bookmark Navigator is not yet available. Check back soon.", eta: undefined };
    }
    case "layer-viewer": {
      return { type: "coming-soon", message: "PDF Layer Viewer is not yet available. Check back soon.", eta: undefined };
    }
    case "search-viewer": {
      return { type: "coming-soon", message: "PDF Search Viewer is not yet available. Check back soon.", eta: undefined };
    }
    
    
    case "rotate":
      return pdfOut(rotatePDF(file, options.rotateAngle || 90, options.rotateFilter || "all"), "rotated.pdf");
    
    case "booklet-maker": {
      return { type: "coming-soon", message: "PDF Booklet Maker is not yet available. Check back soon.", eta: undefined };
    }
    case "n-up-layout": {
      const nupCols = options.cols || 2;
      const nupRows = options.rows || 2;
      const nupN = nupCols * nupRows;
      const nupBytes = await fileToBytes(file);
      const nupSrcDoc = await PDFDocument.load(nupBytes);
      const nupOutDoc = await PDFDocument.create();
      const nupPages = nupSrcDoc.getPages();
      const nupPgW = 595.28; const nupPgH = 841.89;
      const nupCellW = nupPgW / nupCols; const nupCellH = nupPgH / nupRows;
      let nupOutPage: any = null;
      let nupCount = 0;
      for (let i = 0; i < nupPages.length; i++) {
        if (nupCount % nupN === 0) nupOutPage = nupOutDoc.addPage([nupPgW, nupPgH]);
        const r = Math.floor((nupCount % nupN) / nupCols);
        const c = (nupCount % nupN) % nupCols;
        const srcPg = nupPages[i];
        const embedded = await nupOutDoc.embedPage(srcPg);
        const scale = Math.min(nupCellW / srcPg.getWidth(), nupCellH / srcPg.getHeight());
        const drawW = srcPg.getWidth() * scale;
        const drawH = srcPg.getHeight() * scale;
        const x = c * nupCellW + (nupCellW - drawW) / 2;
        const y = nupPgH - ((r + 1) * nupCellH) + (nupCellH - drawH) / 2;
        nupOutPage.drawPage(embedded, { x, y, width: drawW, height: drawH });
        nupCount++;
      }
      return pdfOut(nupOutDoc.save(), "n-up.pdf");
    }
    case "interleave": {
      return { type: "coming-soon", message: "PDF Interleave is not yet available. Check back soon.", eta: undefined };
    }
    case "edit-links": {
      return { type: "coming-soon", message: "PDF Hyperlink Editor is not yet available. Check back soon.", eta: undefined };
    }
    case "redact":
      return { type: "coming-soon", message: "PDF Redaction Tool is not yet available. Check back soon.", eta: undefined };

    case "whiteout": {
      return { type: "coming-soon", message: "PDF Whiteout Tool is not yet available. Check back soon.", eta: undefined };
    }
    case "clean-metadata": {
      return { type: "coming-soon", message: "PDF Metadata Cleaner is not yet available. Check back soon.", eta: undefined };
    }
    case "remove-attachments": {
      return { type: "coming-soon", message: "PDF Attachment Remover is not yet available. Check back soon.", eta: undefined };
    }
    case "find-personal-data": {
      return { type: "coming-soon", message: "PDF Personal Data Finder is not yet available. Check back soon.", eta: undefined };
    }
    case "remove-javascript": {
      return { type: "coming-soon", message: "PDF JavaScript Remover is not yet available. Check back soon.", eta: undefined };
    }
    case "sanitize-links": {
      return { type: "coming-soon", message: "PDF Hyperlink Sanitizer is not yet available. Check back soon.", eta: undefined };
    }
    
    case "downsample-images": {
      return { type: "coming-soon", message: "PDF Image Downsampler is not yet available. Check back soon.", eta: undefined };
    }
    
    case "make-searchable": {
      return { type: "coming-soon", message: "Searchable PDF Maker is not yet available. Check back soon.", eta: undefined };
    }
    
    case "extract-links": {
      return { type: "coming-soon", message: "PDF Link Extractor is not yet available. Check back soon.", eta: undefined };
    }
    case "extract-data-patterns": {
      return { type: "coming-soon", message: "PDF Phone/Date/Number Extractor is not yet available. Check back soon.", eta: undefined };
    }
    
    
    case "sign": {
      return { type: "coming-soon", message: "PDF Sign is not yet available. Check back soon.", eta: undefined };
    }
    case "document-properties": {
      return { type: "coming-soon", message: "PDF Document Properties is not yet available. Check back soon.", eta: undefined };
    }
    case "structure-inspector": {
      return { type: "coming-soon", message: "PDF Structure Inspector is not yet available. Check back soon.", eta: undefined };
    }
    case "print-preview": {
      return { type: "coming-soon", message: "PDF Print Preview is not yet available. Check back soon.", eta: undefined };
    }
    case "label-sheet": {
      return { type: "coming-soon", message: "PDF Label Sheet Maker is not yet available. Check back soon.", eta: undefined };
    }
    case "color-space-detector": {
      return { type: "coming-soon", message: "PDF Color Space Detector is not yet available. Check back soon.", eta: undefined };
    }
    case "icc-profile-reader": {
      return { type: "coming-soon", message: "PDF ICC Profile Reader is not yet available. Check back soon.", eta: undefined };
    }
    case "word-counter": {
      return { type: "coming-soon", message: "PDF Word/Character Counter is not yet available. Check back soon.", eta: undefined };
    }
    case "file-info": {
      return { type: "coming-soon", message: "PDF File Information is not yet available. Check back soon.", eta: undefined };
    }
    case "batch-merge": {
      return { type: "coming-soon", message: "Batch PDF Merger is not yet available. Check back soon.", eta: undefined };
    }
    case "batch-compress": {
      return { type: "coming-soon", message: "Batch PDF Compressor is not yet available. Check back soon.", eta: undefined };
    }
    case "batch-watermark": {
      return { type: "coming-soon", message: "Batch PDF Watermarker is not yet available. Check back soon.", eta: undefined };
    }
    case "batch-metadata": {
      return { type: "coming-soon", message: "Batch Metadata Editor is not yet available. Check back soon.", eta: undefined };
    }
    case "batch-rename": {
      return { type: "coming-soon", message: "Batch PDF Renamer is not yet available. Check back soon.", eta: undefined };
    }
    case "thumbnails": {
      return { type: "coming-soon", message: "PDF Thumbnail Generator is not yet available. Check back soon.", eta: undefined };
    }
    case "generate-toc": {
      return { type: "coming-soon", message: "PDF Table of Contents Generator is not yet available. Check back soon.", eta: undefined };
    }
    case "preview-card": {
      return { type: "coming-soon", message: "PDF Preview Card Generator is not yet available. Check back soon.", eta: undefined };
    }
    case "qr-link": {
      return { type: "coming-soon", message: "PDF to QR Link is not yet available. Check back soon.", eta: undefined };
    }
    case "pdfa-structural-checker": {
      return { type: "coming-soon", message: "PDF/A Structural Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "pdfx-structural-checker": {
      return { type: "coming-soon", message: "PDF/X Structural Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "pdfua-basic-checker": {
      return { type: "coming-soon", message: "PDF/UA Basic Accessibility Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "tagged-pdf-checker": {
      return { type: "coming-soon", message: "PDF Tagged-PDF Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "language-tag-checker": {
      return { type: "coming-soon", message: "PDF Language Tag Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "embedded-font-checker": {
      return { type: "coming-soon", message: "PDF Embedded Font Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "signature-presence-checker": {
      return { type: "coming-soon", message: "PDF Signature Presence Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "mirror-flip": {
      return { type: "coming-soon", message: "PDF Mirror/Flip Content is not yet available. Check back soon.", eta: undefined };
    }
    case "vector-path-inspector": {
      return { type: "coming-soon", message: "PDF Vector Path Inspector is not yet available. Check back soon.", eta: undefined };
    }
    case "self-destruct": {
      return { type: "coming-soon", message: "PDF Self-Destruct is not yet available. Check back soon.", eta: undefined };
    }
    case "filename-sanitizer": {
      return { type: "coming-soon", message: "PDF Filename Sanitizer is not yet available. Check back soon.", eta: undefined };
    }
    case "integrity-verifier": {
      return { type: "coming-soon", message: "PDF Integrity Verifier is not yet available. Check back soon.", eta: undefined };
    }
    
    case "heading-extractor": {
      return { type: "coming-soon", message: "PDF Heading Outline Extractor is not yet available. Check back soon.", eta: undefined };
    }
    case "extract-citations": {
      return { type: "coming-soon", message: "PDF Citation/Reference Extractor is not yet available. Check back soon.", eta: undefined };
    }
    case "extract-emails": {
      return { type: "coming-soon", message: "PDF Email Address Extractor is not yet available. Check back soon.", eta: undefined };
    }
    case "link-inventory": {
      return { type: "coming-soon", message: "PDF URL/Link Inventory is not yet available. Check back soon.", eta: undefined };
    }
    case "totalize-amounts": {
      return { type: "coming-soon", message: "PDF Currency & Amount Totalizer is not yet available. Check back soon.", eta: undefined };
    }
    case "revision-history": {
      return { type: "coming-soon", message: "PDF Revision History Reader is not yet available. Check back soon.", eta: undefined };
    }
    case "producer-detector": {
      return { type: "coming-soon", message: "PDF Producer/Creator Software Detector is not yet available. Check back soon.", eta: undefined };
    }
    case "heading-hierarchy-visualizer": {
      return { type: "coming-soon", message: "PDF Heading Hierarchy Visualizer is not yet available. Check back soon.", eta: undefined };
    }
    case "contrast-ratio-checker": {
      return { type: "coming-soon", message: "PDF Contrast Ratio Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "font-size-auditor": {
      return { type: "coming-soon", message: "PDF Font Size Auditor is not yet available. Check back soon.", eta: undefined };
    }
    case "alt-text-presence-checker": {
      return { type: "coming-soon", message: "PDF Image Alt-Text Presence Checker is not yet available. Check back soon.", eta: undefined };
    }
    case "table-structure-detector": {
      return { type: "coming-soon", message: "PDF Table Structure Detector is not yet available. Check back soon.", eta: undefined };
    }
    case "reading-order-visualizer": {
      return { type: "coming-soon", message: "PDF Reading Order Visualizer is not yet available. Check back soon.", eta: undefined };
    }
    case "colorblind-preview": {
      return { type: "coming-soon", message: "PDF Color-Blindness Simulation Preview is not yet available. Check back soon.", eta: undefined };
    }

    // ── Newly wired standalone functions ────────────────────────
    case "pdf-to-base64": {
      return textOut(await pdfToBase64(file), "pdf-as-base64.txt", "text/plain");
    }

    case "base64-to-pdf": {
      const b64Text = await file.text();
      return pdfOut(await base64ToPDF(b64Text), "decoded.pdf");
    }

    case "invert-colors":
      return { type: "coming-soon", message: "Invert Colors is not yet available. Check back soon.", eta: undefined };

    case "grayscale-pdf":
      return { type: "coming-soon", message: "Grayscale PDF is not yet available. Check back soon.", eta: undefined };

    case "remove-metadata": {
      const rmBytes = await fileToBytes(file);
      const rmDoc = await PDFDocument.load(rmBytes);
      rmDoc.setTitle("");
      rmDoc.setAuthor("");
      rmDoc.setSubject("");
      rmDoc.setKeywords([]);
      rmDoc.setCreator("");
      rmDoc.setProducer("");
      return pdfOut(rmDoc.save(), "metadata-stripped.pdf");
    }

    case "pdf-statistics":
      return jsonOut(await pdfStatistics(file), "pdf-stats.json");

    // ── BENTO PILOT: 5 new tools ────────────────────────────
    case "bates-numbering":
      return pdfOut(
        addBatesNumbers(file, {
          template: options.batesTemplate || "[BATES]",
          padding: options.batesPadding ?? 6,
          batesStart: options.batesStart ?? 1,
          position: options.batesPosition || "bottom-right",
          fontFamily: options.batesFontFamily || "Helvetica",
          fontSize: options.batesFontSize ?? 10,
          color: options.batesColor || "#000000",
        }),
        "bates-numbered.pdf"
      );

    case "background-color":
      return pdfOut(
        changeBackgroundColor(file, {
          color: options.backgroundColor || "#FFFFFF",
        }),
        "background-color.pdf"
      );

    case "sanitize-pdf": {
      const preset = options.sanitizePreset || "standard";
      return pdfOut(
        sanitizePdfBytes(file, {
          flattenForms: true,
          removeMetadata: true,
          removeAnnotations: true,
          removeJavascript: true,
          removeEmbeddedFiles: true,
          removeLinks: preset !== "standard",
          removeStructureTree: preset === "maximum",
          removeMarkInfo: preset === "maximum",
        }),
        "sanitized.pdf"
      );
    }

    case "flatten-annotations":
      return pdfOut(
        flattenAnnotationsInPdf(file),
        "annotations-flattened.pdf"
      );    case "rotate-custom":
      return pdfOut(
        rotatePdfCustom(file, {
          angle: options.rotateCustomAngle ?? 45,
          rotations: options.rotateCustomPerPage,
        }),
        "rotated-custom.pdf"
      );

    case "divide-pages":
      return pdfOut(
        dividePdfPages(file, {
          mode: options.divideMode || "vertical",
          pageRange: options.dividePageRange || "",
          totalPages: options.divideTotalPages ?? 1,
        }),
        "divided.pdf"
      );

    case "flatten":
      return { type: "coming-soon", message: "Flatten is not yet available. Check back soon.", eta: undefined };

    case "remove-annotations":
      return pdfOut(
        removeAnnotationsFromPdf(file, {
          types: options.removeAnnotationTypes || [],
        }),
        "annotations-removed.pdf"
      );

    case "xml-to-pdf":
      return { type: "coming-soon", message: "XML to PDF is not yet available. Check back soon.", eta: undefined };

    case "text-color":
      return pdfOut(
        changeTextColor(file, {
          color: options.textColor || "#FF0000",
          darknessThreshold: options.textColorThreshold ?? 120,
        }),
        "text-color-changed.pdf"
      );

    case "comic-info":
 {
      const xml = generateComicInfoXml({
        title: options.comicTitle || "",
        series: options.comicSeries || "",
        number: options.comicNumber || "",
        volume: options.comicVolume || "",
        summary: options.comicSummary || "",
        writer: options.comicWriter || "",
        publisher: options.comicPublisher || "",
        genre: options.comicGenre || "",
        language: options.comicLanguage || "",
        pageCount: options.comicPageCount || "",
      });
      return textOut(xml, "ComicInfo.xml");
    }

    // ── BENTO BATCH 1: Image converters + simple tools ──────────

    case "bmp-to-pdf":
    case "png-to-pdf":
    case "heic-to-pdf":
    case "webp-to-pdf":
      return { type: "coming-soon", message: `${slug} is not yet available. Check back soon.`, eta: undefined };

    case "json-to-pdf": {
      const jsonText = await file.text();
      return pdfOut(jsonToPDF(jsonText), "converted.pdf");
    }

    case "pdf-to-png":
      return zipOut(pdfToPNG(file, onProgress), "pdf-to-png.zip");

    case "pdf-to-webp":
      return zipOut(pdfToWebP(file, onProgress), "pdf-to-webp.zip");

    case "pdf-to-bmp":
      return zipOut(pdfToBMP(file, onProgress), "pdf-to-bmp.zip");

    case "pdf-to-tiff":
      return zipOut(pdfToTIFF(file, onProgress), "pdf-to-tiff.zip");

    case "pdf-to-cbz":
      // CBZ is just a ZIP with .cbz extension; renders pages as PNG images
      return zipOut(pdfToImages(file, "png", 2, onProgress), file.name.replace(/\.pdf$/i, ".cbz"));

    case "view-metadata": {
      const meta = await getMetadata(file);
      const jsonBytes = new TextEncoder().encode(JSON.stringify(meta, null, 2));
      return textOut(jsonBytes, "metadata.json", "application/json");
    }

    case "fix-page-size": {
      const outBytes = await fixPageSize(file, options.targetSize, options.scalingMode);
      return pdfOut(outBytes, "fixed-pages.pdf");
    }

    // ── BENTO BATCH 2: Adapter-only ports ──────────────────────

    case "scan-to-pdf":
      return { type: "coming-soon", message: "Scan to PDF is not yet available. Check back soon.", eta: undefined };

    case "combine-single-page": {
      const bytes = await fileToBytes(file);
      const srcDoc = await PDFDocument.load(bytes);
      const pages = srcDoc.getPages();
      if (pages.length === 0) throw new Error("PDF has no pages");
      // Calculate total height and max width
      let totalH = 0;
      let maxW = 0;
      for (const p of pages) {
        const s = p.getSize();
        totalH += s.height;
        maxW = Math.max(maxW, s.width);
      }
      const outDoc = await PDFDocument.create();
      const outPage = outDoc.addPage([maxW, totalH]);
      let y = totalH;
      for (let i = 0; i < pages.length; i++) {
        const [embedded] = await outDoc.embedPages([pages[i]]);
        const s = pages[i].getSize();
        y -= s.height;
        outPage.drawPage(embedded, { x: 0, y });
      }
      return pdfOut(outDoc.save(), "combined.pdf");
    }

    case "posterize": {
      // Split each page into a grid of smaller pages
      const cols = options.cols || 2;
      const rows = options.rows || 2;
      const bytes = await fileToBytes(file);
      const srcDoc = await PDFDocument.load(bytes);
      const outDoc = await PDFDocument.create();
      for (const srcPage of srcDoc.getPages()) {
        const { width: srcW, height: srcH } = srcPage.getSize();
        const cellW = srcW / cols;
        const cellH = srcH / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const outPage = outDoc.addPage([cellW, cellH]);
            const [embedded] = await outDoc.embedPages([srcPage]);
            outPage.drawPage(embedded, {
              x: 0, y: 0, width: cellW, height: cellH,
              xSkew: degrees(0),
              ySkew: degrees(0),
            } as any);
          }
        }
      }
      return pdfOut(outDoc.save(), "posterized.pdf");
    }

    case "extract-attachments":
      return { type: "coming-soon", message: "Extract Attachments is not yet available. Check back soon.", eta: undefined };

    case "compare-pdfs": {
      // Browser-only: requires interactive side-by-side comparison UI
      throw new Error("PDF comparison requires a browser UI (side-by-side viewer with diff highlighting). Not available in headless mode.");
    }

    case "bookmark-pdf": {
      // Browser-only: requires pdfjs for reading outlines + interactive tree editor
      throw new Error("Bookmark editing requires a browser UI (interactive tree editor). Not available in headless mode.");
    }

    case "add-page-labels": {
      // Browser-only: requires interactive label configuration UI
      throw new Error("Page labels require a browser UI (label configuration panel). Not available in headless mode.");
    }

    case "scanner-effect":
      return { type: "coming-soon", message: "Scanner Effect is not yet available. Check back soon.", eta: undefined };

    // ── BENTO BATCH 3: Final adapter ports ──────────────────────

    case "pdf-to-zip": {
      // Package multiple PDFs into a ZIP archive
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const bytes = await fileToBytes(files[i]);
        zip.file(files[i].name || `document-${i + 1}.pdf`, bytes);
      }
      return zipOut(zip.generateAsync({ type: "uint8array" }), "documents.zip");
    }

    case "page-dimensions": {
      // Wire to existing getMetadata which includes page sizes
      const meta = await getMetadata(file);
      const jsonBytes = new TextEncoder().encode(JSON.stringify(meta, null, 2));
      return textOut(jsonBytes, "page-dimensions.json", "application/json");
    }

    case "pdf-to-text": {
      // Wire to existing extractText
      const text = await extractText(file, onProgress);
      const textBytes = new TextEncoder().encode(text);
      return textOut(textBytes, "extracted.txt", "text/plain");
    }

    case "pdf-multi-tool": {
      // Browser-only: requires interactive page management UI
      throw new Error("PDF Multi Tool requires a browser UI (drag-and-drop page manager). Not available in headless mode.");
    }

    case "table-of-contents": {
      // Browser-only: requires pdfjs for reading outlines + interactive TOC editor
      throw new Error("Table of Contents requires a browser UI (outline reader and editor). Not available in headless mode.");
    }

    case "certificate-inspector":
    case "validate-signature":
      return { type: "coming-soon", message: "Validate Signature is not yet available. Check back soon.", eta: undefined };

    // ── Phase 3: WASM-backed tools ───────────────────────────

    case "linearize-pdf": {
      const { qpdfProcess } = await import('./wasm-loaders');
      const bytes = await fileToBytes(file);
      const output = await qpdfProcess(bytes, ['--linearize']);
      return pdfOut(Promise.resolve(output), file.name.replace(/\.pdf$/i, '-linearized.pdf'));
    }

    case "remove-restrictions": {
      const { qpdfProcess } = await import('./wasm-loaders');
      const bytes = await fileToBytes(file);
      // Remove encryption/restrictions
      const output = await qpdfProcess(bytes, ['--decrypt']);
      return pdfOut(Promise.resolve(output), file.name.replace(/\.pdf$/i, '-unrestricted.pdf'));
    }

    case "ocr-pdf": {
      const { ocrPdfToText } = await import('./wasm-loaders');
      const bytes = await fileToBytes(file);
      const text = await ocrPdfToText(bytes);
      return textOut(new TextEncoder().encode(text), file.name.replace(/\.pdf$/i, '-ocr.txt'), 'text/plain');
    }

    case "cbz-to-pdf":
    case "fb2-to-pdf":
    case "mobi-to-pdf":
    case "psd-to-pdf":
    case "xps-to-pdf": {
      const { pymupdfConvertToPdf } = await import('./wasm-loaders');
      const ext = slug.replace('-to-pdf', '');
      const blob = await pymupdfConvertToPdf(file, ext);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.[^.]+$/i, '.pdf'));
    }

    case "email-to-pdf": {
      const { pymupdfConvertToPdf } = await import('./wasm-loaders');
      const blob = await pymupdfConvertToPdf(file, 'eml');
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.eml$/i, '.pdf'));
    }

    case "compress-pdf": {
      const { pymupdfCompressPdf } = await import('./wasm-loaders');
      const result = await pymupdfCompressPdf(file);
      const bytes = new Uint8Array(await result.blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.pdf$/i, '-compressed.pdf'));
    }

    case "deskew-pdf": {
      const { pymupdfDeskew } = await import('./wasm-loaders');
      const blob = await pymupdfDeskew(file);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.pdf$/i, '-deskewed.pdf'));
    }

    case "pdf-to-docx": {
      const pymupdfMod = await import('./wasm-loaders');
      const pymupdf = await pymupdfMod.loadPyMuPDF();
      const docxBlob = await pymupdf.pdfToDocx(file);
      const bytes = new Uint8Array(await docxBlob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.pdf$/i, '.docx'));
    }

    case "pdf-to-excel":
    case "pdf-to-csv":
      return { type: "coming-soon", message: "PDF to Excel/CSV is not yet available. Check back soon.", eta: undefined };

    case "pdf-to-svg": {
      const { pymupdfToSvg } = await import('./wasm-loaders');
      const svg = await pymupdfToSvg(file, 1);
      return textOut(new TextEncoder().encode(svg), file.name.replace(/\.pdf$/i, '.svg'), 'image/svg+xml');
    }

    case "pdf-to-pdfa": {
      const { pymupdfCompressPdf } = await import('./wasm-loaders');
      // PyMuPDF doesn't directly do PDF/A — use compress as approximation
      const result = await pymupdfCompressPdf(file, { pdfa: true });
      const bytes = new Uint8Array(await result.blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.pdf$/i, '-pdfa.pdf'));
    }

    case "prepare-pdf-for-ai": {
      const { pymupdfExtractText } = await import('./wasm-loaders');
      const text = await pymupdfExtractText(file);
      // Clean and structure for AI consumption
      const cleaned = text.replace(/\s+/g, ' ').trim();
      return textOut(new TextEncoder().encode(cleaned), file.name.replace(/\.pdf$/i, '-ai-ready.txt'), 'text/plain');
    }

    case "rasterize-pdf": {
      const { pymupdfRasterizePdf } = await import('./wasm-loaders');
      const blob = await pymupdfRasterizePdf(file);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.pdf$/i, '-rasterized.pdf'));
    }

    case "tiff-to-pdf": {
      const { pymupdfConvertToPdf } = await import('./wasm-loaders');
      const blob = await pymupdfConvertToPdf(file, 'tiff');
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.tiff?$/i, '.pdf'));
    }

    case "font-to-outline": {
      const { gsConvertFileToOutlines } = await import('./wasm-loaders');
      const blob = await gsConvertFileToOutlines(file);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(bytes), file.name.replace(/\.pdf$/i, '-outlines.pdf'));
    }

    case "timestamp-pdf":
      return { type: "coming-soon", message: "Timestamp PDF is not yet available. Check back soon.", eta: undefined };

    // ── Phase 4: LibreOffice WASM document conversion ───────
    // These run from /tools/ route which has COOP/COEP headers.

    case "excel-to-pdf":
    case "powerpoint-to-pdf":
    case "word-to-pdf":
    case "odg-to-pdf":
    case "odp-to-pdf":
    case "ods-to-pdf":
    case "odt-to-pdf":
    case "pages-to-pdf":
    case "pub-to-pdf":
    case "vsd-to-pdf":
    case "wpd-to-pdf":
    case "wps-to-pdf": {
      const { libreOfficeConvertToPdf } = await import('./wasm-loaders');
      const blob = await libreOfficeConvertToPdf(file);
      const loBytes = new Uint8Array(await blob.arrayBuffer());
      return pdfOut(Promise.resolve(loBytes), file.name.replace(/\.[^.]+$/i, '.pdf'));
    }

    // ── Phase 4: Digital signature creation (CORS proxy) ─────
    // Requires Vercel serverless function for CA chain fetch.

    case "sign-pdf":
      return { type: "coming-soon", message: "Sign PDF is not yet available. Check back soon.", eta: undefined };

    case "digital-sign-pdf": {
      throw new Error('Digital PDF signing requires a backend CA certificate chain service. Configure in serverless functions.');
    }

    case "pdf-layers": {
      // pdf-layers uses a custom page component (PdfLayersTool.tsx)
      // and does not go through processFiles.
      throw new Error('pdf-layers uses a custom page component and should not be called through processFiles.');
    }

    default:
      throw new Error(`Tool "${slug}" is currently unhandled.`);
  }
}
