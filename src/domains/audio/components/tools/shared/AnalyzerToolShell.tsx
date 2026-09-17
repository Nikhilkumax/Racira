"use client";

/**
 * Shared scaffolding for Easy-tier analyzer/meter tools.
 *
 * Owns the file-drop → decode → analyze plumbing so each analyzer is only its
 * own options UI (children) and its own presentation of the result (render).
 * Analyzers produce measurements, not processed audio, so there is no
 * transform/download path here — a tool that wants to export its analysis
 * builds that from its own result inside `render`.
 *
 * The analyze callback may be async; a stale run (user re-drops mid-analysis)
 * is discarded via a run token.
 */

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { decodeFileToChannels } from "@/domains/audio/lib/edit";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";

export interface AnalyzerInput {
  channels: Float32Array[];
  sampleRate: number;
  length: number;
  fileName: string;
}

export interface AnalyzerToolShellProps<T> {
  /** The tool's measurement — pure or async, must not mutate the channels. */
  analyze: (input: AnalyzerInput) => T | Promise<T>;
  /** The tool's whole display: stats, canvases, export buttons. */
  render: (result: T, input: AnalyzerInput) => React.ReactNode;
  /** Options UI shown between the drop zone and the result. */
  children?: React.ReactNode;
  accept?: string;
}

type Stage = "empty" | "analyzing" | "done" | "error";

export default function AnalyzerToolShell<T>({
  analyze,
  render,
  children,
  accept = "audio/*",
}: AnalyzerToolShellProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<AnalyzerInput | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [stage, setStage] = useState<Stage>("empty");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const runTokenRef = useRef(0);

  const handleFile = useCallback(
    async (selected: File | null) => {
      if (!selected) return;
      const token = ++runTokenRef.current;
      setStage("analyzing");
      setErrorMsg("");
      setFile(selected);
      try {
        const audio = await decodeFileToChannels(selected);
        const input: AnalyzerInput = {
          channels: audio.channels,
          sampleRate: audio.sampleRate,
          length: audio.length,
          fileName: selected.name,
        };
        if (runTokenRef.current !== token) return; // a newer drop superseded us
        setDecoded(input);
        const r = await analyze(input);
        if (runTokenRef.current !== token) return;
        setResult(r);
        setStage("done");
      } catch (err) {
        console.error(err);
        if (runTokenRef.current !== token) return;
        setErrorMsg(
          err instanceof Error && err.message
            ? err.message
            : "Could not analyze this file — it may be corrupt or use an unsupported codec.",
        );
        setStage("error");
      }
    },
    [analyze],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-primary bg-accent/40" : "border-border hover:border-primary/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        {file ? (
          <div className="flex items-center gap-3">
            <UploadCloud className="h-7 w-7 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {stage === "analyzing"
                  ? "Analyzing…"
                  : decoded
                    ? `${(decoded.sampleRate / 1000).toFixed(decoded.sampleRate % 1000 === 0 ? 0 : 1)} kHz · ${decoded.channels.length === 1 ? "mono" : decoded.channels.length === 2 ? "stereo" : `${decoded.channels.length} ch`} · ${formatSeconds(decoded.length / decoded.sampleRate)} · click to choose another`
                    : "Decoding…"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-9 w-9 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Drop an audio file here or click to browse
            </p>
          </>
        )}
      </div>

      {stage === "analyzing" && (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing…
        </p>
      )}

      {children}

      {errorMsg && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMsg}
        </p>
      )}

      {stage === "done" && result && decoded && (
        <div className="mt-4">{render(result, decoded)}</div>
      )}
    </div>
  );
}
