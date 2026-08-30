"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2, Paperclip, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";

const CPDF_CDN = 'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/';

/* ── Types ─────────────────────────────────────────────────── */

type ToolState = "idle" | "loading" | "loaded" | "processing" | "done" | "error";

interface AttachmentInfo {
  name: string;
  size: number;
  description?: string;
  data?: any;
}

/* ── Component ─────────────────────────────────────────────── */

export default function EditAttachmentsTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [toRemove, setToRemove] = useState<Set<number>>(new Set());

  const [rawFile, setRawFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }

    setRawFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
    setState("loading");

    try {
      const worker = new Worker("/workers/edit-attachments.worker.js");
      const result = await new Promise<AttachmentInfo[]>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent) => {
          const data = e.data;
          if (data.status === "success") {
            resolve(data.attachments || []);
          } else {
            reject(new Error(data.message || "Failed to read attachments"));
          }
          worker.terminate();
        };
        worker.onerror = (e) => {
          reject(new Error(e.message || "Worker error"));
          worker.terminate();
        };
        file.arrayBuffer().then((buffer) => {
          worker.postMessage({
            cpdfUrl: CPDF_CDN + 'coherentpdf.browser.min.js',
            command: 'get-attachments',
            fileBuffer: buffer,
            fileName: file.name,
          });
        });
      });

      setAttachments(result);
      setState("loaded");
    } catch (e) {
      console.error("Failed to read attachments:", e);
      setError(e instanceof Error ? e.message : "Failed to read PDF attachments");
      setState("error");
    }
  }, []);

  const toggleRemove = useCallback((index: number) => {
    setToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!rawFile || toRemove.size === 0) return;
    setState("processing");

    try {
      const worker = new Worker("/workers/edit-attachments.worker.js");
      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent) => {
          const data = e.data;
          if (data.status === "success") {
            // Worker sends 'modifiedPDF', not 'pdfBytes'
            resolve(data.modifiedPDF || data.pdfBytes);
          } else {
            reject(new Error(data.message || "Failed to save"));
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
            command: 'edit-attachments',
            fileBuffer: buffer,
            fileName: fileName,
            attachmentsToRemove: Array.from(toRemove),
          });
        });
      });

      const blob = new Blob([result], { type: "application/pdf" });
      saveAs(blob, fileName || "edited.pdf");
      setState("done");
    } catch (e) {
      console.error("Failed to save:", e);
      setError(e instanceof Error ? e.message : "Failed to save PDF");
      setState("error");
    }
  }, [rawFile, toRemove, fileName]);

  const handleReset = useCallback(() => {
    setRawFile(null);
    setFileName("");
    setFileSize(0);
    setAttachments([]);
    setToRemove(new Set());
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
        <p className="text-green-300 mb-2">PDF saved with attachment changes</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Edit Another</button>
      </div>
    );
  }

  if (state === "loading" || state === "processing") {
    return (
      <div data-state={state} className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">{state === "loading" ? "Reading attachments…" : "Saving…"}</p>
      </div>
    );
  }

  if (state === "loaded") {
    return (
      <div data-state="loaded" className="w-full max-w-2xl mx-auto py-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
          <p className="text-sm text-muted-foreground">{fileName} · {(fileSize / 1024).toFixed(1)} KB · {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}</p>
        </div>

        {attachments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No attachments in this PDF.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{att.name}</p>
                  <p className="text-xs text-muted-foreground">{att.size != null ? (att.size / 1024).toFixed(1) + ' KB' : att.data ? ((att.data.byteLength || 0) / 1024).toFixed(1) + ' KB' : ''}</p>
                </div>
                <button
                  onClick={() => toggleRemove(i)}
                  className={`p-1.5 rounded-lg text-sm ${toRemove.has(i) ? "bg-red-600 text-white" : "text-muted-foreground hover:text-red-400 hover:bg-muted"}`}
                  title={toRemove.has(i) ? "Undo remove" : "Remove"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleReset} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">← Start Over</button>
          {toRemove.size > 0 && (
            <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">
              <Download className="h-4 w-4" /> Save ({toRemove.size} removed)
            </button>
          )}
        </div>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Edit Attachments</h2>
        <p className="text-muted-foreground mb-6">View and remove attachments from your PDF.</p>
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
