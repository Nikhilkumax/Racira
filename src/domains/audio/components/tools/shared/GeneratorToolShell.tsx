"use client";

/**
 * Shared scaffolding for Easy-tier generator tools (Batches 6–10).
 *
 * Owns the generate → preview → download plumbing so a generator is only its
 * own options UI plus a pure `generate(sampleRate)` call into generate.ts.
 * No file input: everything is synthesized from parameters, deterministically.
 *
 * The shell keeps the last result so the preview player and download stay
 * valid until the next Generate click.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Download, Loader2, RefreshCw } from "lucide-react";

import { encodeWav } from "@/domains/audio/lib/edit";
import type { Generated } from "@/domains/audio/lib/generate";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";

export interface GeneratorToolShellProps {
  /** The tool's synthesis — pure, deterministic in (params, sampleRate). */
  generate: (sampleRate: number) => Generated;
  /** Options UI shown above the generate button. */
  children?: React.ReactNode;
  /** Extra readouts rendered from the produced signal (stats, canvases). */
  renderInfo?: (result: Generated) => React.ReactNode;
  /** Download filename prefix (default "generated"). */
  filePrefix?: string;
  /** Sample rates offered in the shell's select. Defaults to 44.1k + 48k. */
  sampleRates?: number[];
  /** Generate button label (default "Generate"). */
  buttonLabel?: string;
}

type Stage = "idle" | "generating" | "done" | "error";

export default function GeneratorToolShell({
  generate,
  children,
  renderInfo,
  filePrefix = "generated",
  sampleRates = [44100, 48000],
  buttonLabel = "Generate",
}: GeneratorToolShellProps) {
  const [sampleRate, setSampleRate] = useState(sampleRates[0]);
  const [result, setResult] = useState<Generated | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const runTokenRef = useRef(0);
  const previewCtxRef = useRef<AudioContext | null>(null);
  const previewSrcRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      previewSrcRef.current?.stop();
      void previewCtxRef.current?.close();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const run = useCallback(() => {
    const token = ++runTokenRef.current;
    previewSrcRef.current?.stop();
    setStage("generating");
    setErrorMsg("");
    // Yield a frame so the button paints its generating state before the
    // (synchronous, potentially long) synthesis blocks the main thread.
    window.setTimeout(() => {
      try {
        if (runTokenRef.current !== token) return;
        const g = generate(sampleRate);
        if (runTokenRef.current !== token) return;
        setResult(g);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        const url = URL.createObjectURL(encodeWav(g.channels, g.sampleRate, g.length));
        setDownloadUrl(url);
        setDownloadName(
          `${filePrefix}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.wav`,
        );
        setStage("done");
      } catch (err) {
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : "Generation failed with these parameters.");
        setStage("error");
      }
    }, 30);
  }, [generate, sampleRate, downloadUrl, filePrefix]);

  const busy = stage === "generating";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      {children}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          Sample rate
          <select
            value={sampleRate}
            onChange={(e) => setSampleRate(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {sampleRates.map((sr) => (
              <option key={sr} value={sr}>
                {(sr / 1000).toLocaleString()} kHz
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {buttonLabel}
        </button>

        {stage === "done" && downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70 sm:flex-none"
          >
            <Download className="h-4 w-4" /> Download WAV
          </a>
        )}
      </div>

      {errorMsg && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </p>
      )}

      {stage === "done" && result && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {formatSeconds(result.length / result.sampleRate)} ·{" "}
              {result.channels.length === 1 ? "mono" : "stereo"} ·{" "}
              {result.sampleRate.toLocaleString()} Hz · 16-bit WAV
            </span>
          </div>
          <audio
            controls
            src={downloadUrl ?? undefined}
            className="w-full"
            onPlay={() => {
              // Keep the <audio> element as the only playback path.
              previewSrcRef.current?.stop();
            }}
          />
          {renderInfo?.(result)}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Generated entirely in your browser — nothing is uploaded anywhere.
      </p>
    </div>
  );
}
