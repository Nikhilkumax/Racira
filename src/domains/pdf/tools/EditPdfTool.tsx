"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, Download, Loader2, AlertCircle } from "lucide-react";
import { saveAs } from "file-saver";

/* ── Types ─────────────────────────────────────────────────── */

type ToolState = "idle" | "editor" | "done" | "error";

/* ── Helpers ───────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Component ─────────────────────────────────────────────── */

export default function EditPdfTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [editorReady, setEditorReady] = useState(false);

  const fileRef = useRef<File | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // Listen for messages from the iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "edit-pdf-ready") {
        setEditorReady(true);
        // Send the PDF file to the editor
        if (fileRef.current && iframeRef.current) {
          const file = fileRef.current;
          const reader = new FileReader();
          reader.onload = () => {
            iframeRef.current?.contentWindow?.postMessage(
              {
                type: "edit-pdf-open",
                buffer: reader.result,
                fileName: file.name,
              },
              "*"
            );
          };
          reader.readAsArrayBuffer(file);
        }
      }

      if (data.type === "edit-pdf-saved") {
        // Receive saved PDF from the editor
        const buffer = new Uint8Array(data.buffer);
        const blob = new Blob([buffer], { type: "application/pdf" });
        saveAs(blob, data.fileName || fileName || "edited.pdf");
        setState("done");
      }

      if (data.type === "edit-pdf-exit") {
        setState("idle");
        setEditorReady(false);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [fileName]);

  const handleFile = useCallback((file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }

    // Cleanup previous
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    fileRef.current = file;
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
    setEditorReady(false);

    // Create blob URL for the iframe
    const blob = new Blob([file], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;

    setState("editor");
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

  const handleReset = useCallback(() => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = null;
    fileRef.current = null;
    setFileName("");
    setFileSize(0);
    setError(null);
    setEditorReady(false);
    setState("idle");
  }, []);

  // ── Render ──────────────────────────────────────────────────

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-green-400 text-4xl mb-4">✓</div>
        <p className="text-green-300 mb-2">PDF saved successfully</p>
        <p className="text-muted-foreground text-sm mb-4">
          {fileName} · {formatBytes(fileSize)}
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Edit Another PDF
        </button>
      </div>
    );
  }

  if (state === "editor") {
    return (
      <div className="w-full h-[80vh] relative">
        {!editorReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-muted-foreground">Loading PDF Text Editor…</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/edit-pdf-viewer/index.html"
          className="w-full h-full border-0 rounded-lg"
          title="PDF Text Editor"
          allow="cross-origin-isolated"
        />
      </div>
    );
  }

  // idle — upload UI
  return (
    <div className="flex flex-col items-center justify-start py-8">
      <div className="bg-gray-800/50 rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-2">
          Edit PDF Text
        </h2>
        <p className="text-gray-400 mb-6">
          Click any paragraph and edit it in place with live reflow, fonts,
          and styling.
        </p>

        <div
          className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-gray-800/50 transition-all duration-300"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold text-gray-300">
                Click to select a file
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF file</p>
            <p className="text-xs text-gray-500 mt-1">
              Your files never leave your device.
            </p>
          </div>
          <input
            type="file"
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            accept="application/pdf"
            onChange={handleInputChange}
          />
        </div>

        <div className="mt-6 space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              1
            </span>
            <p>Upload a PDF and click any editable paragraph</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              2
            </span>
            <p>Edit text with live reflow, change fonts, colors, and styling</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              3
            </span>
            <p>Export your edited PDF — all processing happens in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}
