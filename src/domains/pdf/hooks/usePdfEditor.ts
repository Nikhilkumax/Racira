import { useState, useCallback, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PageThumb {
  id: string;
  pageIndex: number; // 0-based index in original PDF
  dataUrl: string;
  width: number;
  height: number;
  rotation: number; // accumulated rotation in degrees
}

interface PdfEditorState {
  originalPdfBytes: Uint8Array | null;
  workingPdfBytes: Uint8Array | null;
  pageOrder: number[]; // array of original page indices
  pageRotations: Record<number, number>; // pageIndex -> accumulated rotation
  removedPages: Set<number>; // original page indices marked for removal
  thumbs: PageThumb[];
  loading: boolean;
  processing: boolean;
  error: string | null;
}

export function usePdfEditor() {
  const [state, setState] = useState<PdfEditorState>({
    originalPdfBytes: null,
    workingPdfBytes: null,
    pageOrder: [],
    pageRotations: {},
    removedPages: new Set(),
    thumbs: [],
    loading: false,
    processing: false,
    error: null,
  });

  const renderIdRef = useRef(0);

  // Generate thumbnails from given PDF bytes
  const generateThumbs = useCallback(async (
    pdfBytes: Uint8Array,
    pageOrder: number[],
    pageRotations: Record<number, number>,
    removedPages: Set<number>
  ): Promise<PageThumb[]> => {
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
    const thumbs: PageThumb[] = [];

    for (let i = 0; i < pageOrder.length; i++) {
      const origIdx = pageOrder[i];
      if (removedPages.has(origIdx)) continue;

      const pageNum = origIdx + 1; // pdfjs uses 1-based
      if (pageNum > pdf.numPages) continue;

      const page = await pdf.getPage(pageNum);
      const rotation = pageRotations[origIdx] || 0;
      const viewport = page.getViewport({ scale: 0.3, rotation });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport }).promise;

      thumbs.push({
        id: `page-${origIdx}-${i}`,
        pageIndex: origIdx,
        dataUrl: canvas.toDataURL(),
        width: viewport.width,
        height: viewport.height,
        rotation,
      });
    }

    return thumbs;
  }, []);

  // Build working PDF from original bytes + edits
  const rebuildWorkingPdf = useCallback(async (
    originalBytes: Uint8Array,
    pageOrder: number[],
    pageRotations: Record<number, number>,
    removedPages: Set<number>
  ): Promise<Uint8Array> => {
    const src = await PDFDocument.load(originalBytes);
    const doc = await PDFDocument.create();

    const activePages = pageOrder.filter(idx => !removedPages.has(idx));
    if (activePages.length === 0) return originalBytes;

    const copiedPages = await doc.copyPages(src, activePages);
    copiedPages.forEach((page, i) => {
      const origIdx = activePages[i];
      const rot = pageRotations[origIdx] || 0;
      if (rot !== 0) {
        const current = page.getRotation().angle;
        page.setRotation(degrees(current + rot));
      }
      doc.addPage(page);
    });

    return doc.save();
  }, []);

  // Refresh thumbnails and working PDF
  const refresh = useCallback(async (
    originalBytes: Uint8Array,
    pageOrder: number[],
    pageRotations: Record<number, number>,
    removedPages: Set<number>
  ) => {
    const currentRender = ++renderIdRef.current;

    setState(prev => ({ ...prev, loading: true }));
    try {
      const [workingBytes, thumbs] = await Promise.all([
        rebuildWorkingPdf(originalBytes, pageOrder, pageRotations, removedPages),
        generateThumbs(originalBytes, pageOrder, pageRotations, removedPages),
      ]);

      if (currentRender !== renderIdRef.current) return;

      setState(prev => ({
        ...prev,
        workingPdfBytes: workingBytes,
        thumbs,
        loading: false,
        pageOrder,
        pageRotations,
        removedPages,
      }));
    } catch (err: any) {
      if (currentRender !== renderIdRef.current) return;
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, [rebuildWorkingPdf, generateThumbs]);

  // Load a PDF file
  const loadFile = useCallback(async (file: File) => {
    const currentRender = ++renderIdRef.current;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      const src = await PDFDocument.load(bytes);
      const totalPages = src.getPageCount();
      const pageOrder = Array.from({ length: totalPages }, (_, i) => i);
      const pageRotations: Record<number, number> = {};
      const removedPages = new Set<number>();

      const thumbs = await generateThumbs(bytes, pageOrder, pageRotations, removedPages);

      if (currentRender !== renderIdRef.current) return;

      setState({
        originalPdfBytes: bytes,
        workingPdfBytes: null,
        pageOrder,
        pageRotations,
        removedPages,
        thumbs,
        loading: false,
        processing: false,
        error: null,
      });
    } catch (err: any) {
      if (currentRender !== renderIdRef.current) return;
      setState(prev => ({ ...prev, loading: false, error: err.message || "Failed to load PDF" }));
    }
  }, [generateThumbs]);

  // Reorder pages
  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      if (!prev.originalPdfBytes) return prev;
      const newOrder = [...prev.pageOrder];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);

      // Trigger async refresh
      refresh(prev.originalPdfBytes, newOrder, prev.pageRotations, prev.removedPages);

      return { ...prev, pageOrder: newOrder };
    });
  }, [refresh]);

  // Rotate a specific page (by visual index, not original index)
  const rotatePage = useCallback((visualIndex: number, angle: number = 90) => {
    setState(prev => {
      if (!prev.originalPdfBytes) return prev;
      const activePages = prev.pageOrder.filter(idx => !prev.removedPages.has(idx));
      const origIdx = activePages[visualIndex];
      if (origIdx === undefined) return prev;

      const newRotations = { ...prev.pageRotations };
      newRotations[origIdx] = ((newRotations[origIdx] || 0) + angle) % 360;

      refresh(prev.originalPdfBytes, prev.pageOrder, newRotations, prev.removedPages);

      return { ...prev, pageRotations: newRotations };
    });
  }, [refresh]);

  // Rotate all pages
  const rotateAllPages = useCallback((angle: number) => {
    setState(prev => {
      if (!prev.originalPdfBytes) return prev;
      const newRotations = { ...prev.pageRotations };
      const activePages = prev.pageOrder.filter(idx => !prev.removedPages.has(idx));
      activePages.forEach(idx => {
        newRotations[idx] = ((newRotations[idx] || 0) + angle) % 360;
      });

      refresh(prev.originalPdfBytes, prev.pageOrder, newRotations, prev.removedPages);

      return { ...prev, pageRotations: newRotations };
    });
  }, [refresh]);

  // Toggle page removal
  const toggleRemovePage = useCallback((visualIndex: number) => {
    setState(prev => {
      if (!prev.originalPdfBytes) return prev;
      // Map visual index to original page index
      const activeAndRemoved = prev.pageOrder;
      // We need visual index among ALL pages (not just active)
      const origIdx = activeAndRemoved[visualIndex];
      if (origIdx === undefined) return prev;

      const newRemoved = new Set(prev.removedPages);
      if (newRemoved.has(origIdx)) {
        newRemoved.delete(origIdx);
      } else {
        // Don't allow removing all pages
        const remainingAfter = prev.pageOrder.filter(idx => !newRemoved.has(idx) && idx !== origIdx);
        if (remainingAfter.length === 0) return prev;
        newRemoved.add(origIdx);
      }

      refresh(prev.originalPdfBytes, prev.pageOrder, prev.pageRotations, newRemoved);

      return { ...prev, removedPages: newRemoved };
    });
  }, [refresh]);

  // Set removed pages by set of visual indices
  const setRemovedByVisualIndices = useCallback((visualIndices: Set<number>) => {
    setState(prev => {
      if (!prev.originalPdfBytes) return prev;
      const newRemoved = new Set<number>();
      visualIndices.forEach(vi => {
        const origIdx = prev.pageOrder[vi];
        if (origIdx !== undefined) newRemoved.add(origIdx);
      });

      // Don't allow removing all
      const remaining = prev.pageOrder.filter(idx => !newRemoved.has(idx));
      if (remaining.length === 0 && prev.pageOrder.length > 0) return prev;

      refresh(prev.originalPdfBytes, prev.pageOrder, prev.pageRotations, newRemoved);

      return { ...prev, removedPages: newRemoved };
    });
  }, [refresh]);

  // Clear all removed pages
  const clearRemoved = useCallback(() => {
    setState(prev => {
      if (!prev.originalPdfBytes) return prev;
      const newRemoved = new Set<number>();
      refresh(prev.originalPdfBytes, prev.pageOrder, prev.pageRotations, newRemoved);
      return { ...prev, removedPages: newRemoved };
    });
  }, [refresh]);

  // Get current download bytes
  const getDownloadBytes = useCallback((): Uint8Array | null => {
    return state.workingPdfBytes || state.originalPdfBytes;
  }, [state.workingPdfBytes, state.originalPdfBytes]);

  // Reset everything
  const resetEditor = useCallback(() => {
    renderIdRef.current++;
    setState({
      originalPdfBytes: null,
      workingPdfBytes: null,
      pageOrder: [],
      pageRotations: {},
      removedPages: new Set(),
      thumbs: [],
      loading: false,
      processing: false,
      error: null,
    });
  }, []);

  const totalPages = state.pageOrder.length;
  const activePageCount = state.pageOrder.filter(idx => !state.removedPages.has(idx)).length;
  const hasEdits = state.workingPdfBytes !== null;

  return {
    ...state,
    totalPages,
    activePageCount,
    hasEdits,
    loadFile,
    reorderPages,
    rotatePage,
    rotateAllPages,
    toggleRemovePage,
    setRemovedByVisualIndices,
    clearRemoved,
    getDownloadBytes,
    resetEditor,
  };
}
