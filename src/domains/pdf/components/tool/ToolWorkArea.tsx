"use client";

import {
  useState,
  useCallback,
  useRef,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  Upload,
  X,
  GripVertical,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Plus,
} from "lucide-react";
import { useToolWorkflow } from "@/lib/pdf/ToolWorkflowContext";
import { outputFilename, type ToolConfig } from "@/domains/pdf/registry/tool-config";
import type { Tool } from "@/domains/pdf/registry/tools";
import { saveAs } from "file-saver";
import { Progress } from "@/components/ui/progress";

interface ToolWorkAreaProps {
  tool: Tool;
  config: ToolConfig;
  /** Tool-specific options rendered between the file list and the action button. */
  children?: ReactNode;
}

/**
 * The main tool UI card.
 *
 * Manages the state machine: IDLE → FILES_SELECTED → PROCESSING → COMPLETE / ERROR.
 * Reads files/processing/done/error/result/progress from ToolWorkflowContext.
 * Renders per-tool options via `children`.
 */
const ToolWorkArea = ({ tool, config, children }: ToolWorkAreaProps) => {
  const {
    files,
    processing,
    done,
    error,
    result,
    progress,
    addFiles,
    removeFile,
    reorderFiles,
    process,
    reset,
    toolOptions,
    setToolOptions,
  } = useToolWorkflow();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Drag-reorder state (merge multi-file)
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // ── File handling ────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles],
  );

  const handleAddMore = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles],
  );

  // ── Drag-reorder handlers ────────────────────────────────────
  const onRowDragStart = useCallback((e: DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onRowDragOver = useCallback(
    (e: DragEvent, idx: number) => {
      e.preventDefault();
      if (dragIdx !== null && dragIdx !== idx) setOverIdx(idx);
    },
    [dragIdx],
  );

  const onRowDrop = useCallback(
    (e: DragEvent, idx: number) => {
      e.preventDefault();
      if (dragIdx !== null && dragIdx !== idx) reorderFiles(dragIdx, idx);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, reorderFiles],
  );

  const onDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  // ── Actions ───────────────────────────────────────────────────
  const handleProcess = useCallback(() => {
    process(tool.slug);
  }, [tool.slug, process]);

  const handleDownload = useCallback(() => {
    if (!result || !result.data) return;
    const blob = new Blob([result.data as any], { type: result.type });
    // Prefer the processor's reported filename/type (authoritative for the
    // actual bytes); fall back to the slug-derived name only as a default.
    const name = result.filename || outputFilename(tool.slug, config.outputExt);
    saveAs(blob, name);
  }, [result, tool.slug, config.outputExt]);

  const handleReset = useCallback(() => {
    reset();
    setDragIdx(null);
    setOverIdx(null);
  }, [reset]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasFiles = files.length > 0;
  const canProcess = hasFiles && !processing && !done;
  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : undefined;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 animate-fade-in"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {/* ── IDLE / UPLOAD ZONE ─────────────────────────────────── */}
      {!done && (
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            multiple={config.multiFile}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-3">
            <Upload className="h-6 w-6" />
          </div>
          <p className="font-medium text-foreground text-sm sm:text-base">
            {config.multiFile
              ? `Drop ${config.fileKindLabel} files here or click to upload`
              : `Drop a ${config.fileKindLabel} file here or click to upload`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {config.maxSizeNote}
          </p>
          {config.hint && (
            <p className="text-xs text-primary/70 mt-2">{config.hint}</p>
          )}
        </div>
      )}

      {/* ── FILE LIST ──────────────────────────────────────────── */}
      {hasFiles && !done && (
        <div className="mt-4 space-y-1.5">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              draggable={config.multiFile}
              onDragStart={(e) => onRowDragStart(e as unknown as DragEvent, idx)}
              onDragOver={(e) => onRowDragOver(e as unknown as DragEvent, idx)}
              onDrop={(e) => onRowDrop(e as unknown as DragEvent, idx)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                overIdx === idx
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              {config.multiFile && (
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-foreground font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add-more button for multi-file tools */}
          {config.multiFile && (
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Add more files
            </button>
          )}
          <input
            ref={addInputRef}
            type="file"
            accept={config.accept}
            multiple={config.multiFile}
            onChange={handleAddMore}
            className="hidden"
          />
        </div>
      )}

      {/* ── TOOL-SPECIFIC OPTIONS (children slot) ─────────────── */}
      {hasFiles && !done && !processing && children}

      {/* ── ACTION BUTTON (only when no options panel provides its own) */}
      {hasFiles && !done && !processing && !children && (
        <button
          type="button"
          onClick={handleProcess}
          disabled={config.serverOnly}
          className={`w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-4 ${
            config.serverOnly
              ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none hover:shadow-none hover:translate-y-0"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {config.serverOnly ? (
            config.actionLabel
          ) : (
            <>
              <Download className="h-4 w-4" />
              {config.actionLabel}
            </>
          )}
        </button>
      )}

      {/* ── PROCESSING STATE ──────────────────────────────────── */}
      {processing && (
        <div className="mt-4 space-y-3">
          {progressPercent !== undefined ? (
            <>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {progress?.message ?? "Processing…"}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Processing…
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLETE STATE (DOWNLOAD) ────────────────────────── */}
      {done && !error && result && result.type !== "coming-soon" && result.type !== "viewer" && result.type !== "print" && (
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--success)/0.08)] px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <p className="text-sm font-medium text-foreground">
              Processing complete — your file is ready.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--success))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--success-foreground))] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Download {tool.name} Output
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Process Another
          </button>
        </div>
      )}

      {/* ── COMING SOON STATE ────────────────────────────────── */}
      {done && !error && result && result.type === "coming-soon" && (
        <div className="mt-4 space-y-4 text-center rounded-xl p-8 bg-card border border-border shadow-sm">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {result.message || "This tool is under development and will be available soon."}
          </p>
          {result.eta && (
            <div className="inline-block mt-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Expected: {result.eta}
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Go Back
          </button>
        </div>
      )}

      {/* ── VIEWER STATE ─────────────────────────────────────── */}
      {done && !error && result && result.type === "viewer" && (
        <div className="mt-4 space-y-4">
           {result.pdfBytes && (
             <iframe 
               src={URL.createObjectURL(new Blob([result.pdfBytes as any], { type: "application/pdf" }))} 
               className="w-full h-[600px] border rounded-lg bg-background"
               title="PDF Viewer"
             />
           )}
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Close Viewer
          </button>
        </div>
      )}

      {/* ── PRINT STATE ──────────────────────────────────────── */}
      {done && !error && result && result.type === "print" && (
        <div className="mt-4 space-y-4 text-center">
           {result.pdfBytes && (
             <iframe 
               src={URL.createObjectURL(new Blob([result.pdfBytes as any], { type: "application/pdf" }))} 
               className="hidden"
               title="Print Frame"
               onLoad={(e) => {
                 const cw = (e.target as HTMLIFrameElement).contentWindow;
                 if (cw) {
                   cw.focus();
                   cw.print();
                 }
               }}
             />
           )}
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 justify-center mb-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Opening print dialog...
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Go Back
          </button>
        </div>
      )}

      {/* ── ERROR STATE ───────────────────────────────────────── */}
      {error && (
        <div className="mt-4 space-y-3">
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

      {/* ── SECURITY NOTE (visible when not in complete state) ── */}
      {!done && (
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          🔒 Your files are processed securely and never uploaded to any server.
        </p>
      )}
    </div>
  );
};

export default ToolWorkArea;
