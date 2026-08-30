import type { PDFDocumentProxy } from 'pdfjs-dist';

/** Minimal Cropper interface — matches cropperjs API surface used by BentoPDF. */
export interface CropperInstance {
  getCroppedCanvas(options?: Record<string, unknown>): HTMLCanvasElement;
  destroy(): void;
  reset(): void;
  clear(): void;
  enable(): void;
  disable(): void;
}

export interface CropPercentages {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropperState {
  pdfDoc: PDFDocumentProxy | null;
  currentPageNum: number;
  cropper: CropperInstance | null;
  originalPdfBytes: ArrayBuffer | null;
  pageCrops: Record<number, CropPercentages>;
  file: File | null;
}
