"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Download, Loader2, Undo2 } from "lucide-react";
import { saveAs } from "file-saver";

type ToolState = "idle" | "loading" | "loaded" | "processing" | "done" | "error";

interface DrawRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface RedactionRect {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function RedactTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [redactions, setRedactions] = useState<RedactionRect[]>([]);
  const [currentDraw, setCurrentDraw] = useState<DrawRect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rawFileRef = useRef<File | null>(null);
  const pdfDocRef = useRef<any>(null);

  const SCALE = 1.5;

  const renderPage = useCallback(async (pageNum: number) => {
    const pdfDoc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdfDoc || !canvas) return;

    const page = await pdfDoc.getPage(pageNum + 1);
    const viewport = page.getViewport({ scale: SCALE });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Draw existing redactions on this page
    ctx.fillStyle = "black";
    for (const r of redactions) {
      if (r.pageIndex === pageNum) {
        ctx.fillRect(r.x * SCALE, r.y * SCALE, r.width * SCALE, r.height * SCALE);
      }
    }

    // Draw current in-progress rectangle
    if (currentDraw && isDrawing) {
      const x = Math.min(currentDraw.startX, currentDraw.endX);
      const y = Math.min(currentDraw.startY, currentDraw.endY);
      const w = Math.abs(currentDraw.endX - currentDraw.startX);
      const h = Math.abs(currentDraw.endY - currentDraw.startY);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(x, y, w, h);
    }
  }, [redactions, currentDraw, isDrawing]);

  useEffect(() => {
    if (state === "loaded") {
      renderPage(currentPage);
    }
  }, [state, currentPage, renderPage]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setError(null);
    setState("loading");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const buffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
      pdfDocRef.current = pdfDoc;
      rawFileRef.current = file;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(0);
      setRedactions([]);
      setState("loaded");
    } catch (e) {
      console.error("Failed to load PDF:", e);
      setError(e instanceof Error ? e.message : "Failed to load PDF");
      setState("error");
    }
  }, []);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentDraw({ startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y });
  }, [getCanvasCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    setCurrentDraw(prev => prev ? { ...prev, endX: coords.x, endY: coords.y } : null);
  }, [isDrawing, getCanvasCoords]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentDraw) return;
    setIsDrawing(false);

    const w = Math.abs(currentDraw.endX - currentDraw.startX);
    const h = Math.abs(currentDraw.endY - currentDraw.startY);

    if (w > 5 && h > 5) {
      const pdfX = Math.min(currentDraw.startX, currentDraw.endX) / SCALE;
      const pdfY = Math.min(currentDraw.startY, currentDraw.endY) / SCALE;
      const pdfW = w / SCALE;
      const pdfH = h / SCALE;

      setRedactions(prev => [...prev, {
        pageIndex: currentPage,
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
      }]);
    }

    setCurrentDraw(null);
  }, [isDrawing, currentDraw, currentPage]);

  const handleUndoLast = useCallback(() => {
    setRedactions(prev => prev.slice(0, -1));
  }, []);

  const handleApplyRedactions = useCallback(async () => {
    if (!rawFileRef.current || redactions.length === 0) return;
    setState("processing");

    try {
      const { applyRedactions } = await import("@/lib/pdf/redact-engine");
      const buffer = await rawFileRef.current.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const result = await applyRedactions(bytes, redactions);
      const blob = new Blob([result as any], { type: "application/pdf" });
      saveAs(blob, fileName.replace(/\.pdf$/i, "") + "-redacted.pdf");
      setState("done");
    } catch (e) {
      console.error("Redaction failed:", e);
      setError(e instanceof Error ? e.message : "Failed to apply redactions");
      setState("error");
    }
  }, [redactions, fileName]);

  const handleReset = useCallback(() => {
    setFileName("");
    setRedactions([]);
    setCurrentPage(0);
    setTotalPages(0);
    setCurrentDraw(null);
    setIsDrawing(false);
    pdfDocRef.current = null;
    rawFileRef.current = null;
    setError(null);
    setState("idle");
  }, []);

  const pageRedactions = redactions.filter(r => r.pageIndex === currentPage);

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-green-400 text-4xl mb-4">✓</div>
        <p className="text-green-300 mb-2">Redacted PDF saved</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Redact Another</button>
      </div>
    );
  }

  if (state === "loading" || state === "processing") {
    return (
      <div data-state={state} className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">{state === "loading" ? "Loading PDF…" : "Applying redactions…"}</p>
      </div>
    );
  }

  if (state === "loaded") {
    return (
      <div data-state="loaded" className="w-full max-w-5xl mx-auto py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Redact PDF</h2>
            <p className="text-sm text-muted-foreground">{fileName} · Page {currentPage + 1}/{totalPages} · {redactions.length} redaction{redactions.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            {pageRedactions.length > 0 && (
              <button onClick={handleUndoLast} className="flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">
                <Undo2 className="h-3.5 w-3.5" /> Undo on Page
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Click and drag to draw a redaction rectangle. Black boxes will be applied to the output PDF.</p>

        {/* Canvas */}
        <div ref={containerRef} className="flex justify-center bg-muted/30 border border-border rounded-lg overflow-auto max-h-[60vh] p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border border-border cursor-crosshair"
          />
        </div>

        {/* Page navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-lg disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-lg disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleReset} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">← Start Over</button>
          <button
            onClick={handleApplyRedactions}
            disabled={redactions.length === 0}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> Apply &amp; Download ({redactions.length} redaction{redactions.length !== 1 ? "s" : ""})
          </button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Redact PDF</h2>
        <p className="text-muted-foreground mb-6">Draw black boxes over sensitive content and download the redacted PDF.</p>
        <div
          className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-muted/50 transition-all"
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Click to select a file</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF file</p>
          </div>
          <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      </div>
    </div>
  );
}
