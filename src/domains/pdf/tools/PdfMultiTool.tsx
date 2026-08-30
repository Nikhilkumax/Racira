"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2, GripVertical, RotateCw, RotateCcw, Trash2, Plus, FileText } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { saveAs } from "file-saver";

type ToolState = "idle" | "loading" | "loaded" | "processing" | "done" | "error";

interface PageEntry {
  id: string;
  fileIndex: number; // which source file this came from
  pageIndex: number; // page number within source file (0-based)
  rotation: number; // degrees (0, 90, 180, 270)
  selected: boolean;
  label: string; // e.g. "doc.pdf — Page 1"
}

let idCounter = 0;
function genId(): string {
  return `page-${++idCounter}`;
}

export default function PdfMultiTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [sourceFiles, setSourceFiles] = useState<{ name: string; bytes: Uint8Array }[]>([]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    setState("loading");
    const files = Array.from(fileList).filter(
      (f) => f.name.toLowerCase().endsWith(".pdf")
    );
    if (files.length === 0) {
      setError("Please select PDF files.");
      setState("error");
      return;
    }

    try {
      const loaded: { name: string; bytes: Uint8Array }[] = [];
      const allPages: PageEntry[] = [];

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const doc = await PDFDocument.load(bytes);
        loaded.push({ name: file.name, bytes });

        for (let i = 0; i < doc.getPageCount(); i++) {
          allPages.push({
            id: genId(),
            fileIndex: loaded.length - 1,
            pageIndex: i,
            rotation: 0,
            selected: false,
            label: `${file.name} — Page ${i + 1}`,
          });
        }
      }

      setSourceFiles(loaded);
      setPages(allPages);
      setState("loaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load PDFs");
      setState("error");
    }
  }, []);

  const rotatePage = useCallback((id: string, delta: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, rotation: (p.rotation + delta + 360) % 360 }
          : p
      )
    );
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  }, []);

  const selectAll = useCallback(() => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  }, []);

  const deselectAll = useCallback(() => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  }, []);

  const deleteSelected = useCallback(() => {
    setPages((prev) => prev.filter((p) => !p.selected));
  }, []);

  const movePage = useCallback((id: string, direction: -1 | 1) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  const handleExport = useCallback(async () => {
    if (pages.length === 0) return;
    setState("processing");

    try {
      const outDoc = await PDFDocument.create();

      // Load all source docs
      const docs = await Promise.all(
        sourceFiles.map((sf) => PDFDocument.load(sf.bytes))
      );

      for (const page of pages) {
        const srcDoc = docs[page.fileIndex];
        if (!srcDoc) continue;

        const [copiedPage] = await outDoc.copyPages(srcDoc, [page.pageIndex]);
        if (page.rotation !== 0) {
          copiedPage.setRotation(degrees(page.rotation));
        }
        outDoc.addPage(copiedPage);
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      saveAs(blob, "multi-tool-output.pdf");
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export PDF");
      setState("error");
    }
  }, [pages, sourceFiles]);

  const handleReset = useCallback(() => {
    setPages([]);
    setSourceFiles([]);
    setError(null);
    setState("idle");
  }, []);

  // ── Render ──────────────────────────────────────────────────

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
        <p className="text-green-300 mb-2">PDF exported successfully ({pages.length} pages)</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Process More</button>
      </div>
    );
  }

  if (state === "loading" || state === "processing") {
    return (
      <div data-state={state} className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">{state === "loading" ? "Loading PDFs…" : "Exporting…"}</p>
      </div>
    );
  }

  if (state === "loaded") {
    const selectedCount = pages.filter((p) => p.selected).length;
    return (
      <div data-state="loaded" className="w-full max-w-4xl mx-auto py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Multi-Tool</h2>
            <p className="text-sm text-muted-foreground">{pages.length} pages from {sourceFiles.length} file{sourceFiles.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleFiles.bind(null, [])} className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg">
              <Plus className="h-3 w-3 inline mr-1" /> Add More
            </button>
            <button onClick={handleReset} className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg">Reset</button>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2">
          <button onClick={selectAll} className="text-xs text-muted-foreground hover:text-foreground">Select All</button>
          <button onClick={deselectAll} className="text-xs text-muted-foreground hover:text-foreground">Deselect</button>
          {selectedCount > 0 && (
            <button onClick={deleteSelected} className="text-xs text-red-400 hover:text-red-300">
              Delete {selectedCount} selected
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg"
          >
            <Download className="h-3 w-3" /> Export ({pages.length} pages)
          </button>
        </div>

        {/* Page list */}
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {pages.map((page, index) => (
            <div key={page.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

              <input
                type="checkbox"
                checked={page.selected}
                onChange={() => toggleSelect(page.id)}
                className="rounded"
              />

              <span className="text-xs text-muted-foreground w-8 text-right">{index + 1}</span>

              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />

              <span className="text-sm text-foreground truncate flex-1">{page.label}</span>

              {page.rotation !== 0 && (
                <span className="text-xs text-muted-foreground">{page.rotation}°</span>
              )}

              <div className="flex items-center gap-1">
                <button onClick={() => movePage(page.id, -1)} disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">↑</button>
                <button onClick={() => movePage(page.id, 1)} disabled={index === pages.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">↓</button>
                <button onClick={() => rotatePage(page.id, 90)}
                  className="p-1 text-muted-foreground hover:text-foreground" title="Rotate right">
                  <RotateCw className="h-3 w-3" />
                </button>
                <button onClick={() => rotatePage(page.id, -90)}
                  className="p-1 text-muted-foreground hover:text-foreground" title="Rotate left">
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button onClick={() => deletePage(page.id)}
                  className="p-1 text-muted-foreground hover:text-red-400" title="Delete page">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">PDF Multi-Tool</h2>
        <p className="text-muted-foreground mb-6">Merge, reorder, rotate, and delete pages from multiple PDFs.</p>
        <div
          className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-muted/50 transition-all"
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Click to select files</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">One or more PDF files</p>
          </div>
          <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf" multiple
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
        </div>
      </div>
    </div>
  );
}
