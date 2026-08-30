"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  Download,
  Loader2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import { saveAs } from "file-saver";

/* ── Types ─────────────────────────────────────────────────── */

interface LayerData {
  number: number;
  xref: number;
  text: string;
  on: boolean;
  locked: boolean;
  depth: number;
  parentXref: number;
  displayOrder: number;
}

interface PyMuPDFDocument {
  getLayerConfig: () => LayerData[];
  addLayer: (name: string) => { number: number; xref: number };
  addOCG: (name: string) => { number: number; xref: number };
  addOCGWithParent: (
    name: string,
    parentXref: number
  ) => { number: number; xref: number };
  setLayerConfig: (layers: LayerData[]) => void;
  setLayerVisibility: (xref: number, visible: boolean) => void;
  deleteOCG: (xref: number) => void;
  save: () => Uint8Array;
}

type ToolState = "idle" | "loaded" | "loading" | "processing" | "done" | "error";

/* ── Helpers ───────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Component ─────────────────────────────────────────────── */

export default function PdfLayersTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [newLayerName, setNewLayerName] = useState("");
  const [showAddChild, setShowAddChild] = useState<number | null>(null);
  const [childLayerName, setChildLayerName] = useState("");

  const fileRef = useRef<File | null>(null);
  const docRef = useRef<PyMuPDFDocument | null>(null);
  const nextOrderRef = useRef(0);

  const handleFile = useCallback(async (file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }

    fileRef.current = file;
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);

    // Get page count via pdfjs
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      setPageCount(pdf.numPages);
    } catch {
      setPageCount(null);
    }

    setState("loaded");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) handleFile(files[0]);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0)
        handleFile(e.target.files[0]);
    },
    [handleFile]
  );

  const loadLayers = useCallback(async () => {
    if (!fileRef.current) return;

    setState("loading");
    try {
      const { loadPyMuPDF } = await import("@/lib/pdf/wasm-loaders");
      const pymupdf = await loadPyMuPDF();
      const doc = await (pymupdf as any).open(fileRef.current);
      docRef.current = doc;

      const existingLayers = doc.getLayerConfig() as LayerData[];
      const layersMap = new Map<number, LayerData>();
      let order = 0;

      existingLayers.forEach((layer) => {
        layersMap.set(layer.number, {
          number: layer.number,
          xref: layer.xref ?? layer.number,
          text: layer.text,
          on: layer.on,
          locked: layer.locked,
          depth: layer.depth ?? 0,
          parentXref: layer.parentXref ?? 0,
          displayOrder: layer.displayOrder ?? order++,
        });
        if ((layer.displayOrder ?? -1) >= order) {
          order = layer.displayOrder + 1;
        }
      });

      nextOrderRef.current = order;
      setLayers(Array.from(layersMap.values()));
      setState("loaded");
    } catch (e: unknown) {
      console.error("Failed to load layers:", e);
      setError(e instanceof Error ? e.message : "Failed to load layers");
      setState("error");
    }
  }, []);

  const handleToggleVisibility = useCallback(
    (xref: number, visible: boolean) => {
      try {
        docRef.current?.setLayerVisibility(xref, visible);
        setLayers((prev) =>
          prev.map((l) => (l.xref === xref ? { ...l, on: visible } : l))
        );
      } catch (e) {
        console.error("Failed to toggle visibility:", e);
      }
    },
    []
  );

  const handleDeleteLayer = useCallback((number: number, xref: number) => {
    try {
      docRef.current?.deleteOCG(number);
      setLayers((prev) => prev.filter((l) => l.xref !== xref));
    } catch (e) {
      console.error("Failed to delete layer:", e);
    }
  }, []);

  const handleAddLayer = useCallback(() => {
    if (!newLayerName.trim() || !docRef.current) return;
    try {
      const result = docRef.current.addOCG(newLayerName.trim());
      const newOrder = nextOrderRef.current++;
      setLayers((prev) => [
        ...prev,
        {
          number: result.number,
          xref: result.xref,
          text: newLayerName.trim(),
          on: true,
          locked: false,
          depth: 0,
          parentXref: 0,
          displayOrder: newOrder,
        },
      ]);
      setNewLayerName("");
    } catch (e) {
      console.error("Failed to add layer:", e);
    }
  }, [newLayerName]);

  const handleAddChildLayer = useCallback(
    (parentXref: number) => {
      if (!childLayerName.trim() || !docRef.current) return;
      try {
        const result = docRef.current.addOCGWithParent(
          childLayerName.trim(),
          parentXref
        );
        const parentLayer = layers.find((l) => l.xref === parentXref);
        const parentOrder = parentLayer?.displayOrder ?? 0;
        const newOrder = nextOrderRef.current++;

        setLayers((prev) => [
          ...prev,
          {
            number: result.number,
            xref: result.xref,
            text: childLayerName.trim(),
            on: true,
            locked: false,
            depth: (parentLayer?.depth ?? 0) + 1,
            parentXref,
            displayOrder: parentOrder + 1,
          },
        ]);
        setChildLayerName("");
        setShowAddChild(null);
      } catch (e) {
        console.error("Failed to add child layer:", e);
      }
    },
    [childLayerName, layers]
  );

  const handleSave = useCallback(async () => {
    if (!docRef.current || !fileRef.current) return;

    setState("processing");
    try {
      const pdfBytes = docRef.current.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      saveAs(blob, fileRef.current.name);
      setState("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    docRef.current = null;
    fileRef.current = null;
    nextOrderRef.current = 0;
    setState("idle");
    setError(null);
    setFileName("");
    setFileSize(0);
    setPageCount(null);
    setLayers([]);
    setNewLayerName("");
    setShowAddChild(null);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Sorted layers ────────────────────────────────────────── */
  const sortedLayers = [...layers].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 animate-fade-in"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {/* ── IDLE: Upload Zone ─────────────────────────────────── */}
      {state === "idle" && (
        <div
          className="relative rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 border-border hover:border-primary/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-3">
            <Upload className="h-6 w-6" />
          </div>
          <p className="font-medium text-foreground text-sm sm:text-base">
            Drop a PDF file here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF file · Processed entirely in your browser
          </p>
        </div>
      )}

      {/* ── LOADED: File info + Load Layers button ──────────── */}
      {state === "loaded" && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(fileSize)}
                {pageCount !== null ? ` · ${pageCount} pages` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Load layers button (when no layers loaded yet) */}
          {layers.length === 0 && (
            <button
              type="button"
              onClick={loadLayers}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Load Layers
            </button>
          )}

          {/* Layers list */}
          {layers.length > 0 && (
            <>
              <div className="space-y-1">
                {sortedLayers.map((layer) => (
                  <div
                    key={layer.xref}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    style={{ paddingLeft: `${layer.depth * 24 + 12}px` }}
                  >
                    {layer.depth > 0 && (
                      <span className="text-muted-foreground text-xs">└</span>
                    )}
                    <input
                      type="checkbox"
                      checked={layer.on}
                      disabled={layer.locked}
                      onChange={(e) =>
                        handleToggleVisibility(layer.xref, e.target.checked)
                      }
                      className="rounded border-border"
                    />
                    <span className="flex-1 text-foreground truncate">
                      {layer.text || `Layer ${layer.number}`}
                    </span>
                    {layer.locked && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                    {!layer.locked && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setShowAddChild(
                              showAddChild === layer.xref ? null : layer.xref
                            )
                          }
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Add child layer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteLayer(layer.number, layer.xref)
                          }
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete layer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}

                    {/* Inline child layer input */}
                    {showAddChild === layer.xref && (
                      <div className="flex items-center gap-1 ml-2">
                        <input
                          type="text"
                          value={childLayerName}
                          onChange={(e) => setChildLayerName(e.target.value)}
                          placeholder="Child name"
                          className="w-32 rounded border border-border bg-background px-2 py-1 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleAddChildLayer(layer.xref);
                            if (e.key === "Escape") setShowAddChild(null);
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddChildLayer(layer.xref)}
                          className="text-xs text-primary hover:underline"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new layer */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  placeholder="New layer name"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddLayer();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddLayer}
                  disabled={!newLayerName.trim()}
                  className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                Save PDF with Layer Changes
              </button>
            </>
          )}
        </div>
      )}

      {/* ── LOADING ──────────────────────────────────────────── */}
      {(state === "loading" || state === "processing") && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {state === "loading" ? "Loading layers…" : "Saving…"}
          </span>
        </div>
      )}

      {/* ── DONE ─────────────────────────────────────────────── */}
      {state === "done" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--success)/0.08)] px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <p className="text-sm font-medium text-foreground">
              PDF saved with layer changes!
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Process Another PDF
          </button>
        </div>
      )}

      {/* ── ERROR ────────────────────────────────────────────── */}
      {state === "error" && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* ── Security Note ────────────────────────────────────── */}
      {state !== "done" && (
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          🔒 Your files are processed securely and never uploaded to any server.
        </p>
      )}
    </div>
  );
}
