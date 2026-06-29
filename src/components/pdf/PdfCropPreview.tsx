import { useEffect, useRef, useState, useCallback, MouseEvent } from "react";
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, Maximize2, Shield } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  file: File;
  onCropChange: (crop: { top: number; right: number; bottom: number; left: number }) => void;
  cropMode: "all" | "current";
  onCropModeChange: (mode: "all" | "current") => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
  done: boolean;
}

const PdfCropPreview = ({
  file,
  onCropChange,
  cropMode,
  onCropModeChange,
  onProcess,
  onReset,
  processing,
  done,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(70);
  const [autoFitDone, setAutoFitDone] = useState(false);
  const [crop, setCrop] = useState<CropArea>({ x: 20, y: 20, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropInitialized, setCropInitialized] = useState(false);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const buf = await file.arrayBuffer();
      if (cancelled) return;
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      if (!cancelled) {
        setPdf(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setCropInitialized(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [file]);

  // Auto-fit zoom on first load
  useEffect(() => {
    if (!pdf || autoFitDone) return;
    let cancelled = false;
    const fitZoom = async () => {
      const page = await pdf.getPage(1);
      const baseViewport = page.getViewport({ scale: 1.0 });
      // Target height: viewport minus toolbar (~50px), padding (~32px), header (~160px)
      const targetHeight = window.innerHeight - 280;
      const idealScale = targetHeight / baseViewport.height;
      const zoomPercent = Math.min(150, Math.max(30, Math.round(idealScale * 100)));
      if (!cancelled) {
        setZoom(zoomPercent);
        setAutoFitDone(true);
      }
    };
    fitZoom();
    return () => { cancelled = true; };
  }, [pdf, autoFitDone]);

  // Render page
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    const render = async () => {
      const page = await pdf.getPage(currentPage);
      const scale = (zoom / 100) * 1.0;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setCanvasSize({ width: viewport.width, height: viewport.height });
      setPageSize({ width: viewport.width, height: viewport.height });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport }).promise;

      if (!cropInitialized) {
        const margin = 10;
        setCrop({
          x: margin,
          y: margin,
          width: viewport.width - margin * 2,
          height: viewport.height - margin * 2,
        });
        setCropInitialized(true);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [pdf, currentPage, zoom, cropInitialized]);

  // Emit crop margins
  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;
    const scaleFactor = 72 / (zoom / 100);
    const top = (crop.y / canvasSize.height) * pageSize.height * (scaleFactor / 72);
    const left = (crop.x / canvasSize.width) * pageSize.width * (scaleFactor / 72);
    const right = ((canvasSize.width - crop.x - crop.width) / canvasSize.width) * pageSize.width * (scaleFactor / 72);
    const bottom = ((canvasSize.height - crop.y - crop.height) / canvasSize.height) * pageSize.height * (scaleFactor / 72);

    onCropChange({
      top: Math.max(0, Math.round(top)),
      right: Math.max(0, Math.round(right)),
      bottom: Math.max(0, Math.round(bottom)),
      left: Math.max(0, Math.round(left)),
    });
  }, [crop, canvasSize, pageSize, zoom]);

  const getMousePos = (e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getResizeHandle = (pos: { x: number; y: number }) => {
    const h = 8;
    const { x, y, width, height } = crop;
    if (Math.abs(pos.x - x) < h && Math.abs(pos.y - y) < h) return "nw";
    if (Math.abs(pos.x - (x + width)) < h && Math.abs(pos.y - y) < h) return "ne";
    if (Math.abs(pos.x - x) < h && Math.abs(pos.y - (y + height)) < h) return "sw";
    if (Math.abs(pos.x - (x + width)) < h && Math.abs(pos.y - (y + height)) < h) return "se";
    if (Math.abs(pos.y - y) < h && pos.x > x && pos.x < x + width) return "n";
    if (Math.abs(pos.y - (y + height)) < h && pos.x > x && pos.x < x + width) return "s";
    if (Math.abs(pos.x - x) < h && pos.y > y && pos.y < y + height) return "w";
    if (Math.abs(pos.x - (x + width)) < h && pos.y > y && pos.y < y + height) return "e";
    return null;
  };

  const handleMouseDown = (e: MouseEvent) => {
    const pos = getMousePos(e);
    const handle = getResizeHandle(pos);
    if (handle) {
      setIsResizing(handle);
      setDragStart(pos);
    } else if (pos.x >= crop.x && pos.x <= crop.x + crop.width && pos.y >= crop.y && pos.y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: pos.x - crop.x, y: pos.y - crop.y });
    } else {
      setCrop({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setIsResizing("se");
      setDragStart(pos);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const pos = getMousePos(e);
    if (isDragging) {
      const newX = Math.max(0, Math.min(pos.x - dragStart.x, canvasSize.width - crop.width));
      const newY = Math.max(0, Math.min(pos.y - dragStart.y, canvasSize.height - crop.height));
      setCrop((prev) => ({ ...prev, x: newX, y: newY }));
      return;
    }
    if (isResizing) {
      setCrop((prev) => {
        let { x, y, width, height } = prev;
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        if (isResizing.includes("e")) width = Math.max(20, pos.x - x);
        if (isResizing.includes("s")) height = Math.max(20, pos.y - y);
        if (isResizing.includes("w")) { x = Math.max(0, prev.x + dx); width = Math.max(20, prev.width - dx); }
        if (isResizing.includes("n")) { y = Math.max(0, prev.y + dy); height = Math.max(20, prev.height - dy); }
        width = Math.min(width, canvasSize.width - x);
        height = Math.min(height, canvasSize.height - y);
        return { x, y, width, height };
      });
      setDragStart(pos);
    }
  }, [isDragging, isResizing, dragStart, canvasSize, crop.width, crop.height]);

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const resetCrop = () => {
    const margin = 10;
    setCrop({
      x: margin,
      y: margin,
      width: canvasSize.width - margin * 2,
      height: canvasSize.height - margin * 2,
    });
  };

  return (
    <div className="mt-8">
      {/* 2-column workspace */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
        {/* LEFT — PDF Preview */}
        <div className="flex-1 min-w-0 lg:max-w-[calc(100%-352px)] flex flex-col">
          <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col flex-1" style={{ boxShadow: "var(--card-shadow)" }}>
            {/* Top toolbar */}
            <div className="flex items-center justify-between bg-muted/60 border-b border-border px-5 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-all duration-200 text-foreground"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-all duration-200 text-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <span className="text-sm text-foreground font-semibold ml-1">
                  Page {currentPage} <span className="text-muted-foreground font-normal">of {totalPages}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom((z) => Math.max(30, z - 10))}
                  className="p-1.5 rounded-lg hover:bg-accent transition-all duration-200 text-foreground"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs text-foreground font-semibold w-12 text-center bg-muted/80 rounded-md py-0.5">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(200, z + 10))}
                  className="p-1.5 rounded-lg hover:bg-accent transition-all duration-200 text-foreground"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <div className="h-5 w-px bg-border mx-2" />
                <button
                  onClick={resetCrop}
                  className="p-1.5 rounded-lg hover:bg-accent transition-all duration-200 text-foreground"
                  title="Reset crop area"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Canvas area */}
            <div
              ref={containerRef}
              className="relative overflow-auto flex justify-center items-center p-4 bg-muted/20 flex-1"
              style={{ minHeight: 250 }}
              onWheel={(e) => {
                if (e.deltaY > 0 && currentPage < totalPages) {
                  e.preventDefault();
                  setCurrentPage((p) => p + 1);
                } else if (e.deltaY < 0 && currentPage > 1) {
                  e.preventDefault();
                  setCurrentPage((p) => p - 1);
                }
              }}
            >
              <div
                className="relative inline-block select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas ref={canvasRef} className="block rounded-lg shadow-md" />

                {/* Dark overlay outside crop */}
                {cropInitialized && (
                  <>
                    <div className="absolute bg-foreground/35 pointer-events-none" style={{ top: 0, left: 0, width: canvasSize.width, height: crop.y }} />
                    <div className="absolute bg-foreground/35 pointer-events-none" style={{ top: crop.y + crop.height, left: 0, width: canvasSize.width, height: canvasSize.height - crop.y - crop.height }} />
                    <div className="absolute bg-foreground/35 pointer-events-none" style={{ top: crop.y, left: 0, width: crop.x, height: crop.height }} />
                    <div className="absolute bg-foreground/35 pointer-events-none" style={{ top: crop.y, left: crop.x + crop.width, width: canvasSize.width - crop.x - crop.width, height: crop.height }} />

                    <div
                      className="absolute border-2 border-primary pointer-events-none rounded-sm"
                      style={{ top: crop.y, left: crop.x, width: crop.width, height: crop.height }}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-primary" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-primary" />
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary" />
                      </div>

                      {/* Corner handles */}
                      {["nw", "ne", "sw", "se"].map((corner) => {
                        const isRight = corner.includes("e");
                        const isBottom = corner.includes("s");
                        return (
                          <div
                            key={corner}
                            className="absolute w-3.5 h-3.5 bg-primary rounded-full border-2 border-primary-foreground shadow-lg"
                            style={{
                              top: isBottom ? "100%" : 0,
                              left: isRight ? "100%" : 0,
                              transform: "translate(-50%, -50%)",
                              cursor: `${corner}-resize`,
                              pointerEvents: "auto",
                            }}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Settings Panel (30%) */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="lg:sticky lg:top-24 space-y-5">
            {/* Settings card */}
            <div className="rounded-2xl bg-card border border-border p-7 space-y-7" style={{ boxShadow: "var(--card-shadow)" }}>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Crop Settings</h3>

              {/* Instruction */}
              <div className="rounded-xl bg-muted/40 border border-border p-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Drag on the preview to select the area you want to keep. Use corner handles to resize.
                </p>
              </div>

              {/* Apply To */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Apply to</p>
                  <button
                    onClick={resetCrop}
                    className="text-xs text-primary hover:underline font-medium transition-colors duration-200"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { value: "all" as const, label: "All pages", desc: "Apply crop to every page" },
                    { value: "current" as const, label: "Current page only", desc: "Only crop this page" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                        cropMode === opt.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-muted/20"
                      }`}
                      onClick={() => onCropModeChange(opt.value)}
                    >
                      <div
                        className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                          cropMode === opt.value ? "border-primary bg-primary/10" : "border-muted-foreground/30"
                        }`}
                      >
                        {cropMode === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-medium block ${
                          cropMode === opt.value ? "text-foreground" : "text-foreground"
                        }`}>
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* File info */}
              <div className="rounded-xl bg-muted/30 border border-border p-4 flex items-start gap-3 transition-all duration-200 hover:bg-muted/50">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {totalPages} page{totalPages !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={onProcess}
                  disabled={processing || done}
                  className="group w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-4 text-[15px] font-bold text-primary-foreground transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  {processing ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Crop PDF
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </>
                  )}
                </button>
                <button
                  onClick={onReset}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2.5 px-3">
              <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Files are processed securely in your browser and never uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar (mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border px-5 py-3.5 flex items-center justify-between" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
        <p className="text-xs text-muted-foreground">
          Apply to: <span className="font-semibold text-foreground">{cropMode === "all" ? "All pages" : `Page ${currentPage}`}</span>
        </p>
        <button
          onClick={onProcess}
          disabled={processing || done}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          Crop PDF →
        </button>
      </div>
    </div>
  );
};

export default PdfCropPreview;
