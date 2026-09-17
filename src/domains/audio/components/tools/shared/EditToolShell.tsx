"use client";

/**
 * Shared scaffolding for Easy-tier file-editing tools.
 *
 * Owns the repetitive plumbing — file drop, decode, a live preview player,
 * process → download — so each tool component is only its own options UI plus
 * a transform function. Deliberately NOT a generic pipeline: the shell keeps
 * the original decoded channels in memory and hands the transform a fresh
 * {channels, sampleRate, length} record; transforms must not mutate channel
 * arrays in place, because Preview needs the pristine original and Compare
 * mode needs the untouched processed copy. All transform functions in the edit
 * lib already return new arrays, so this costs nothing extra.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, Download, Loader2, CheckCircle2, Play, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { decodeFileToChannels, baseName, encodeWav, type DecodedAudio } from "@/domains/audio/lib/edit";

export interface EditInput {
  channels: Float32Array[];
  sampleRate: number;
  length: number;
}

export interface EditOutput {
  channels: Float32Array[];
  sampleRate: number;
  length: number;
}

/** A tool's whole behaviour: input channels in, output channels out. */
export type EditTransform = (input: EditInput) => EditOutput;

export interface EditToolShellProps {
  /** The tool's actual processing — must be pure (no in-place mutation). */
  transform: EditTransform;
  /** Shown above the drop zone. */
  children: React.ReactNode;
  /** Extra line under the process button (e.g. computed stats). */
  footer?: React.ReactNode;
  /** Suffix for the output filename; the source basename is prepended. */
  outputSuffix: string;
  accept?: string;
  /** Disallow >2 channels (mono/stereo-only transforms). */
  maxChannels?: number;
  /** Require at least this many channels (stereo-only transforms). */
  minChannels?: number;
}

type Stage = "empty" | "ready" | "processing" | "done" | "error";

export function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}

export default function EditToolShell({
  transform,
  children,
  footer,
  outputSuffix,
  accept = "audio/*",
  maxChannels,
  minChannels,
}: EditToolShellProps) {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<DecodedAudio | null>(null);
  const [stage, setStage] = useState<Stage>("empty");
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState<EditOutput | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [previewing, setPreviewing] = useState<"original" | "edited" | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewCtxRef = useRef<AudioContext | null>(null);
  const previewSrcRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      previewSrcRef.current?.stop();
      void previewCtxRef.current?.close();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const reset = useCallback(() => {
    previewSrcRef.current?.stop();
    setPreviewing(null);
    setOutput(null);
    setStage((s) => (s === "error" || s === "done" ? "ready" : s));
    setErrorMsg("");
  }, []);

  const handleFile = useCallback(async (selected: File | null) => {
    if (!selected) return;
    setStage("processing");
    setErrorMsg("");
    setFile(selected);
    try {
      const result = await decodeFileToChannels(selected);
      if (maxChannels !== undefined && result.channels.length > maxChannels) {
        setErrorMsg(
          `This tool works on mono/stereo audio — the file has ${result.channels.length} channels.`,
        );
        setStage("error");
        return;
      }
      if (minChannels !== undefined && result.channels.length < minChannels) {
        setErrorMsg(
          `This tool needs stereo audio — the file is ${result.channels.length === 1 ? "mono" : `${result.channels.length}-channel`}.`,
        );
        setStage("error");
        return;
      }
      setDecoded(result);
      setStage("ready");
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not decode this file — it may be corrupt or use an unsupported codec.");
      setStage("error");
    }
  }, [maxChannels, minChannels]);

  const playBuffer = useCallback(
    (kind: "original" | "edited") => {
      if (previewing === kind) {
        previewSrcRef.current?.stop();
        setPreviewing(null);
        return;
      }
      const source =
        kind === "edited" ? output : decoded ? { ...decoded } : null;
      if (!source) return;

      previewSrcRef.current?.stop();
      if (!previewCtxRef.current || previewCtxRef.current.state === "closed") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        previewCtxRef.current = new AudioCtx();
      }
      const ctx = previewCtxRef.current;
      const buffer = ctx.createBuffer(
        source.channels.length,
        source.length,
        source.sampleRate,
      );
      for (let c = 0; c < source.channels.length; c++) {
        // getChannelData().set() rather than copyToChannel(): the latter's
        // Float32Array<ArrayBuffer> parameter rejects ArrayBufferLike channel
        // arrays, while set() accepts any ArrayLike<number>.
        buffer.getChannelData(c).set(source.channels[c]);
      }
      const node = ctx.createBufferSource();
      node.buffer = buffer;
      node.connect(ctx.destination);
      node.onended = () => setPreviewing(null);
      node.start();
      previewSrcRef.current = node;
      setPreviewing(kind);
    },
    [decoded, output, previewing],
  );

  const run = useCallback(() => {
    if (!decoded || !file) return;
    reset();
    setStage("processing");
    try {
      // Yield one frame so the button paints its processing state.
      window.setTimeout(() => {
        try {
          const result = transform({
            channels: decoded.channels,
            sampleRate: decoded.sampleRate,
            length: decoded.length,
          });
          setOutput(result);
          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          const url = URL.createObjectURL(encodeWav(result.channels, result.sampleRate, result.length));
          setDownloadUrl(url);
          // Normalize the suffix so every consumer gets a sane filename:
          // "-amplified.wav", "-amplified" and "amplified" all become
          // "song-amplified.wav" (dash + .wav added when missing).
          const suffix = outputSuffix.startsWith("-") || outputSuffix === "" ? outputSuffix : `-${outputSuffix}`;
          const name = `${baseName(file.name)}${suffix}`;
          setDownloadName(/\.[a-z0-9]{2,4}$/i.test(name) ? name : `${name}.wav`);
          setStage("done");
        } catch (err) {
          console.error(err);
          setErrorMsg(err instanceof Error ? err.message : "Processing failed for this file.");
          setStage("error");
        }
      }, 30);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Processing failed for this file.");
      setStage("error");
    }
  }, [decoded, file, transform, outputSuffix, downloadUrl, reset]);

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
                {decoded
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

      {children}

      {errorMsg && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={stage !== "ready" && stage !== "done"}
          onClick={run}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {stage === "processing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Process
        </button>

        {stage === "done" && downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        )}
      </div>

      {stage === "done" && output && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => playBuffer("original")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {previewing === "original" ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {previewing === "original" ? "Stop original" : "Preview original"}
            </button>
            <button
              type="button"
              onClick={() => playBuffer("edited")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
            >
              {previewing === "edited" ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {previewing === "edited" ? "Stop edited" : "Preview edited"}
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {formatSeconds(output.length / output.sampleRate)} out
            </span>
          </div>
          {footer}
        </div>
      )}
    </div>
  );
}
