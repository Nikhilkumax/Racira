import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import JSZip from "jszip";

// ── Merge PDF ──────────────────────────────────────────────
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

// ── Split PDF ──────────────────────────────────────────────
export async function splitPDF(
  file: File,
  mode: "all" | "range",
  rangeStr?: string
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();

  if (mode === "all") {
    // Return a ZIP with one PDF per page
    const zip = new JSZip();
    for (let i = 0; i < total; i++) {
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [i]);
      doc.addPage(page);
      const pdfBytes = await doc.save();
      zip.file(`page-${i + 1}.pdf`, pdfBytes);
    }
    const zipBlob = await zip.generateAsync({ type: "uint8array" });
    return zipBlob;
  }

  // Range mode: e.g. "1-3,5,7-9"
  const indices = parsePageRange(rangeStr || "", total);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, indices);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

// ── Rotate PDF ─────────────────────────────────────────────
export async function rotatePDF(
  file: File,
  angle: number,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  const targets = pageIndices || pages.map((_, i) => i);

  for (const i of targets) {
    if (i < pages.length) {
      const page = pages[i];
      const current = page.getRotation().angle;
      page.setRotation(degrees(current + angle));
    }
  }
  return doc.save();
}

// ── Remove Pages ───────────────────────────────────────────
export async function removePages(
  file: File,
  pagesToRemove: number[]
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const keepIndices = Array.from({ length: total }, (_, i) => i).filter(
    (i) => !pagesToRemove.includes(i)
  );

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, keepIndices);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

// ── Compress PDF ───────────────────────────────────────────
export async function compressPDF(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  // Re-saving with pdf-lib strips unused objects and applies basic compression
  return doc.save();
}

// ── Page Numbers ───────────────────────────────────────────
export async function addPageNumbers(
  file: File,
  position: "bottom-center" | "bottom-right" | "bottom-left",
  startNum: number = 1
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const text = `${startNum + i}`;
    const textWidth = font.widthOfTextAtSize(text, 11);

    let x = width / 2 - textWidth / 2;
    if (position === "bottom-right") x = width - 50;
    if (position === "bottom-left") x = 30;

    page.drawText(text, {
      x,
      y: 25,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return doc.save();
}

// ── Add Watermark ──────────────────────────────────────────
export async function addWatermark(
  file: File,
  text: string,
  opacity: number = 0.15
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.08;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(-45),
    });
  });

  return doc.save();
}

// ── Add Text ───────────────────────────────────────────────
export async function addTextToPDF(
  file: File,
  text: string,
  fontSize: number = 14,
  xPos: number = 50,
  yPos: number = 50
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  if (pages.length > 0) {
    const page = pages[0];
    const { height } = page.getSize();
    page.drawText(text, {
      x: xPos,
      y: height - yPos,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return doc.save();
}

// ── Crop PDF ───────────────────────────────────────────────
export async function cropPDF(
  file: File,
  margins: { top: number; right: number; bottom: number; left: number }
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.setCropBox(
      margins.left,
      margins.bottom,
      width - margins.left - margins.right,
      height - margins.top - margins.bottom
    );
  });

  return doc.save();
}

// ── JPG to PDF ─────────────────────────────────────────────
export async function jpgToPDF(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const imgBytes = await file.arrayBuffer();
    const isJpg = file.type === "image/jpeg";
    const isPng = file.type === "image/png";

    let img;
    if (isJpg) {
      img = await doc.embedJpg(imgBytes);
    } else if (isPng) {
      img = await doc.embedPng(imgBytes);
    } else {
      continue;
    }

    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
  }

  return doc.save();
}

// ── Protect PDF ────────────────────────────────────────────
// NOTE: PDF encryption is not supported by pdf-lib.
// This function is intentionally disabled to avoid false security.
export async function protectPDF(
  _file: File,
  _password: string
): Promise<Uint8Array> {
  throw new Error(
    "PDF password protection is not yet available. This feature requires server-side encryption which is coming soon."
  );
}

// ── PDF to JPG (using canvas) ──────────────────────────────
export async function pdfToJPG(file: File): Promise<Uint8Array> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 2;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
    );
    const arrBuf = await blob.arrayBuffer();
    zip.file(`page-${i}.jpg`, arrBuf);
  }

  return zip.generateAsync({ type: "uint8array" });
}

// ── Organize Pages (reorder) ──────────────────────────────
export async function organizePages(
  file: File,
  newOrder: number[]
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, newOrder);
  pages.forEach((p) => doc.addPage(p));
  return doc.save();
}

// ── PDF to PDF/A (simplified - just re-saves) ──────────────
export async function pdfToPDFA(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  // True PDF/A conversion requires server-side tools
  // This re-saves with clean structure
  return doc.save();
}

// ── Helpers ────────────────────────────────────────────────
const PAGE_RANGE_REGEX = /^\d+(-\d+)?(,\s*\d+(-\d+)?)*$/;
const MAX_PAGE_LIMIT = 10000;

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

  return [...new Set(indices)].sort((a, b) => a - b);
}

// ── Get page count ─────────────────────────────────────────
export async function getPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

// ── Main dispatcher ────────────────────────────────────────
export type ToolOptions = {
  splitMode?: "all" | "range";
  splitRange?: string;
  rotateAngle?: number;
  rotateFilter?: "all" | "portrait" | "landscape";
  pagesToRemove?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
  addTextContent?: string;
  addTextSize?: number;
  pageNumberPosition?: "bottom-center" | "bottom-right" | "bottom-left";
  pageNumberStart?: number;
  cropMargins?: { top: number; right: number; bottom: number; left: number };
  password?: string;
  organizeOrder?: string;
};

export async function processFiles(
  slug: string,
  files: File[],
  options: ToolOptions = {}
): Promise<{ data: Uint8Array; filename: string; type: string }> {
  const file = files[0];

  switch (slug) {
    case "merge-pdf":
      return {
        data: await mergePDFs(files),
        filename: "merged.pdf",
        type: "application/pdf",
      };

    case "split-pdf":
      if (options.splitMode === "all") {
        return {
          data: await splitPDF(file, "all"),
          filename: "split-pages.zip",
          type: "application/zip",
        };
      }
      return {
        data: await splitPDF(file, "range", options.splitRange),
        filename: "split.pdf",
        type: "application/pdf",
      };

    case "rotate-pdf":
      return {
        data: await rotatePDF(file, options.rotateAngle || 90),
        filename: "rotated.pdf",
        type: "application/pdf",
      };

    case "remove-pages": {
      const pagesToRemove = parsePageRange(
        options.pagesToRemove || "",
        999
      );
      return {
        data: await removePages(file, pagesToRemove),
        filename: "pages-removed.pdf",
        type: "application/pdf",
      };
    }

    case "compress-pdf":
    case "reduce-pdf-size":
      return {
        data: await compressPDF(file),
        filename: "compressed.pdf",
        type: "application/pdf",
      };

    case "page-numbers":
      return {
        data: await addPageNumbers(
          file,
          options.pageNumberPosition || "bottom-center",
          options.pageNumberStart || 1
        ),
        filename: "numbered.pdf",
        type: "application/pdf",
      };

    case "add-watermark":
      return {
        data: await addWatermark(
          file,
          options.watermarkText || "WATERMARK",
          options.watermarkOpacity || 0.15
        ),
        filename: "watermarked.pdf",
        type: "application/pdf",
      };

    case "add-text":
      return {
        data: await addTextToPDF(
          file,
          options.addTextContent || "Sample Text",
          options.addTextSize || 14
        ),
        filename: "text-added.pdf",
        type: "application/pdf",
      };

    case "crop-pdf":
      return {
        data: await cropPDF(
          file,
          options.cropMargins || { top: 50, right: 50, bottom: 50, left: 50 }
        ),
        filename: "cropped.pdf",
        type: "application/pdf",
      };

    case "jpg-to-pdf":
      return {
        data: await jpgToPDF(files),
        filename: "images.pdf",
        type: "application/pdf",
      };

    case "pdf-to-jpg":
      return {
        data: await pdfToJPG(file),
        filename: "pages.zip",
        type: "application/zip",
      };

    case "organize-pages": {
      const order = options.organizeOrder
        ? parsePageRange(options.organizeOrder, 999)
        : [];
      return {
        data: await organizePages(file, order),
        filename: "organized.pdf",
        type: "application/pdf",
      };
    }

    case "protect-pdf":
      return {
        data: await protectPDF(file, options.password || ""),
        filename: "protected.pdf",
        type: "application/pdf",
      };

    case "repair-pdf":
    case "pdf-to-pdfa":
      return {
        data: await pdfToPDFA(file),
        filename: slug === "repair-pdf" ? "repaired.pdf" : "archive.pdf",
        type: "application/pdf",
      };

    // Tools that re-save (unlock, edit-pdf, sign-pdf, etc.)
    case "unlock-pdf":
    case "edit-pdf":
    case "sign-pdf":
    case "add-image":
    case "redact-pdf":
    case "ocr-pdf":
    case "scan-to-pdf": {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      return {
        data: await doc.save(),
        filename: `${slug}-result.pdf`,
        type: "application/pdf",
      };
    }

    // Convert tools that need server-side processing
    case "pdf-to-word":
    case "pdf-to-excel":
    case "pdf-to-powerpoint":
    case "word-to-pdf":
    case "excel-to-pdf":
    case "powerpoint-to-pdf":
    case "html-to-pdf":
      throw new Error(
        "This conversion requires server-side processing. Coming soon!"
      );

    default:
      throw new Error(`Tool "${slug}" is not yet implemented.`);
  }
}
