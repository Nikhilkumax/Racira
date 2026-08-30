"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";

const CPDF_CDN = 'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/';

/* ── Types ─────────────────────────────────────────────────── */

type ToolState = "idle" | "loading" | "config" | "processing" | "done" | "error";

/* ── Component ─────────────────────────────────────────────── */

export default function TableOfContentsTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [tocTitle, setTocTitle] = useState("Table of Contents");
  const [fontSize, setFontSize] = useState("12");
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [addBookmark, setAddBookmark] = useState(true);

  const [rawFile, setRawFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }
    setRawFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
    setState("config");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!rawFile) return;
    setState("processing");

    try {
      const worker = new Worker("/workers/table-of-contents.worker.js");

      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent) => {
          const data = e.data;
          if (data.status === "success") {
            resolve(data.pdfBytes);
          } else {
            reject(new Error(data.message || "TOC generation failed"));
          }
          worker.terminate();
        };
        worker.onerror = (e) => {
          reject(new Error(e.message || "Worker error"));
          worker.terminate();
        };

        rawFile.arrayBuffer().then((buffer) => {
          worker.postMessage({
            cpdfUrl: CPDF_CDN + 'coherentpdf.browser.min.js',
            command: 'generate-toc',
            pdfData: buffer,
            title: tocTitle,
            fontSize: parseInt(fontSize),
            fontFamily,
            addBookmark,
          });
        });
      });

      const blob = new Blob([result], { type: "application/pdf" });
      saveAs(blob, fileName || "with-toc.pdf");
      setState("done");
    } catch (e) {
      console.error("TOC generation failed:", e);
      setError(e instanceof Error ? e.message : "Failed to generate TOC");
      setState("error");
    }
  }, [rawFile, tocTitle, fontSize, fontFamily, addBookmark, fileName]);

  const handleReset = useCallback(() => {
    setRawFile(null);
    setFileName("");
    setFileSize(0);
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
        <p className="text-green-300 mb-2">Table of contents added</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Process Another</button>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div data-state="processing" className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">Generating table of contents…</p>
      </div>
    );
  }

  if (state === "config") {
    return (
      <div data-state="config" className="w-full max-w-2xl mx-auto py-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Generate Table of Contents</h2>
          <p className="text-sm text-muted-foreground">{fileName} · {(fileSize / 1024).toFixed(1)} KB</p>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">TOC Title</label>
            <input type="text" value={tocTitle} onChange={(e) => setTocTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Font Size</label>
              <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="10">10pt</option>
                <option value="12">12pt</option>
                <option value="14">14pt</option>
                <option value="16">16pt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Font Family</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="Helvetica">Helvetica</option>
                <option value="Times-Roman">Times Roman</option>
                <option value="Courier">Courier</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={addBookmark} onChange={(e) => setAddBookmark(e.target.checked)} className="rounded" />
            Add bookmark for each entry
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={handleReset} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">← Back</button>
          <button onClick={handleGenerate} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">
            <Download className="h-4 w-4" /> Generate & Download
          </button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Table of Contents</h2>
        <p className="text-muted-foreground mb-6">Generate a table of contents page from your PDF's headings and structure.</p>
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
