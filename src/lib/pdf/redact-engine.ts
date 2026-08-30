/**
 * Redaction engine — ported from BentoPDF's redact.ts.
 * Applies black rectangles to redacted areas in a PDF.
 * Pure processing, no DOM coupling.
 */
import { PDFDocument, rgb } from 'pdf-lib';

export interface RedactionRect {
  pageIndex: number;
  // PDF coordinates (already converted from canvas)
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Apply redaction rectangles to a PDF, drawing solid black over each area.
 * @param bytes - The PDF file as Uint8Array
 * @param redactions - Array of redaction rectangles in PDF coordinates
 * @returns Modified PDF as Uint8Array
 */
export async function applyRedactions(
  bytes: Uint8Array,
  redactions: RedactionRect[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  for (const r of redactions) {
    if (r.pageIndex < 0 || r.pageIndex >= pages.length) continue;
    const page = pages[r.pageIndex];
    page.drawRectangle({
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      color: rgb(0, 0, 0),
    });
  }

  const savedBytes = await pdfDoc.save();
  return new Uint8Array(savedBytes);
}
