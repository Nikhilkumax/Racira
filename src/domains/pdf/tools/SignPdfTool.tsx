"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Download,
  Loader2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { saveAs } from "file-saver";

/* ── Types ─────────────────────────────────────────────────── */

interface PDFViewerApplication {
  pdfDocument: {
    saveDocument: (
      annotationStorage: unknown
    ) => Promise<ArrayBuffer>;
    annotationStorage: unknown;
  };
  eventBus?: {
    _on: (event: string, handler: () => void) => void;
    dispatch: (event: string, data: unknown) => void;
  };
}

interface PDFViewerWindow extends Window {
  PDFViewerApplication?: PDFViewerApplication;
}

type ToolState = "idle" | "viewer" | "processing" | "done" | "error";

/* ── Helpers ───────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Component ─────────────────────────────────────────────── */

export default function SignPdfTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [flatten, setFlatten] = useState(false);

  const fileRef = useRef<File | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const viewerReadyRef = useRef(false);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

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
    viewerReadyRef.current = false;

    // Create blob URL for the viewer
    const blob = new Blob([file], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;

    setState("viewer");
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

  const handleViewerLoad = useCallback(() => {
    viewerReadyRef.current = true;

    // Enable signature tools in the viewer
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const viewerWindow = iframe.contentWindow as PDFViewerWindow | null;
      if (!viewerWindow?.PDFViewerApplication) return;

      const app = viewerWindow.PDFViewerApplication;
      const doc = viewerWindow.document;
      const eventBus = app.eventBus;

      // Set PDF.js preferences for signature mode
      try {
        const existing = localStorage.getItem("pdfjs.preferences");
        const prefs: Record<string, unknown> = existing
          ? JSON.parse(existing)
          : {};
        delete prefs.annotationEditorMode;
        Object.assign(prefs, {
          enableSignatureEditor: true,
          enablePermissions: false,
        });
        localStorage.setItem("pdfjs.preferences", JSON.stringify(prefs));
      } catch {
        // ignore
      }

      eventBus?._on("annotationeditoruimanager", () => {
        const editorModeButtons = doc.getElementById("editorModeButtons");
        editorModeButtons?.classList.remove("hidden");
        const editorSignature = doc.getElementById("editorSignature");
        editorSignature?.removeAttribute("hidden");
        const sigBtn = doc.getElementById(
          "editorSignatureButton"
        ) as HTMLButtonElement | null;
        if (sigBtn) sigBtn.disabled = false;
        const editorStamp = doc.getElementById("editorStamp");
        editorStamp?.removeAttribute("hidden");
        const stampBtn = doc.getElementById(
          "editorStampButton"
        ) as HTMLButtonElement | null;
        if (stampBtn) stampBtn.disabled = false;
        // Auto-click highlight to initialize
        try {
          (
            doc.getElementById("editorHighlightButton") as HTMLButtonElement | null
          )?.click();
        } catch {
          // ignore
        }
      });
    } catch (e) {
      console.error("Could not initialize PDF.js viewer for signing:", e);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!viewerReadyRef.current || !iframeRef.current) {
      setError("Viewer not ready. Please wait for the PDF to load.");
      setState("error");
      return;
    }

    setState("processing");

    try {
      const viewerWindow = iframeRef.current.contentWindow as
        | PDFViewerWindow
        | null;
      if (!viewerWindow?.PDFViewerApplication) {
        throw new Error("PDF viewer is still initializing.");
      }

      const app = viewerWindow.PDFViewerApplication;

      if (flatten) {
        // Save with annotations, then flatten using pdf-lib
        const rawBytes = await app.pdfDocument.saveDocument(
          app.pdfDocument.annotationStorage
        );
        const { PDFDocument } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.load(new Uint8Array(rawBytes));

        // Try to flatten form fields
        try {
          const form = pdfDoc.getForm();
          form.flatten();
        } catch {
          // No form fields — that's fine
        }

        const flattenedBytes = await pdfDoc.save();
        const blob = new Blob([flattenedBytes as any], { type: "application/pdf" });
        saveAs(blob, fileName || "signed.pdf");
      } else {
        // Let the viewer handle the download directly
        app.eventBus?.dispatch("download", { source: app });
        // Fallback: create download from saveDocument
        try {
          const rawBytes = await app.pdfDocument.saveDocument(
            app.pdfDocument.annotationStorage
          );
          const blob = new Blob([rawBytes as any], { type: "application/pdf" });
          saveAs(blob, fileName || "signed.pdf");
        } catch {
          // Viewer's own download may have fired
        }
      }

      setState("done");
    } catch (e: unknown) {
      console.error("Failed to export the signed PDF:", e);
      setError(
        e instanceof Error ? e.message : "Could not export the signed PDF."
      );
      setState("error");
    }
  }, [fileName, flatten]);

  const handleReset = useCallback(() => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = null;
    fileRef.current = null;
    iframeRef.current = null;
    viewerReadyRef.current = false;
    setState("idle");
    setError(null);
    setFileName("");
    setFileSize(0);
    setFlatten(false);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
          onDragOver={(e) => {
            e.preventDefault();
          }}
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

      {/* ── FILE INFO (while in viewer mode) ─────────────────── */}
      {state === "viewer" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(fileSize)}
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

          {/* ── PDF Viewer iframe ──────────────────────────────── */}
          <div className="rounded-lg border border-border overflow-hidden bg-background">
            <iframe
              ref={iframeRef}
              src={`/pdfjs-viewer/sign-viewer.html?file=${encodeURIComponent(blobUrlRef.current || "")}`}
              className="w-full border-none"
              style={{ height: "70vh", minHeight: "500px" }}
              title="PDF Signer"
              onLoad={handleViewerLoad}
            />
          </div>

          {/* ── Controls ───────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="rounded border-border"
              />
              Flatten signature (embed in page)
            </label>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              Save Signed PDF
            </button>
          </div>
        </div>
      )}

      {/* ── PROCESSING ───────────────────────────────────────── */}
      {state === "processing" && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Flattening and saving…
          </span>
        </div>
      )}

      {/* ── DONE ─────────────────────────────────────────────── */}
      {state === "done" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--success)/0.08)] px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <p className="text-sm font-medium text-foreground">
              Signed PDF saved successfully!
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Sign Another PDF
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
