"use client";

/**
 * Audio Slicer — split one file into many segment WAVs (sliceEqualSegments /
 * sliceByDuration, Node-verified): N near-equal parts, or fixed-length
 * segments with a short tail. Standalone rather than EditToolShell because
 * the tool's whole job is multiple outputs: decode once, then produce one
 * download per segment from the same decoded audio.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, UploadCloud, X } from "lucide-react";

import { decodeFileToChannels, encodeWav, sliceByDuration, sliceEqualSegments } from "@/domains/audio/lib/edit";

interface Segment {
  index: number;
  url: string;
  label: string;
  fileName: string;
  sizeKb: number;
}

type Stage = "empty" | "ready" | "busy" | "error";

export default function AudioSlicer() {
  const [mode, setMode] = useState<"equal" | "duration">("equal");
  const [parts, setParts] = useState(4);
  const [segmentSec, setSegmentSec] = useState(30);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [stage, setStage] = useState<Stage>("empty");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const decodedRef = useRef<{ channels: Float32Array[]; sampleRate: number; length: number } | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const handleFile = useCallback(async (selected: File | null) => {
    if (!selected) return;
    setStage("busy");
    setErrorMsg("");
    setSegments([]);
    setFile(selected);
    try {
      const decoded = await decodeFileToChannels(selected);
      decodedRef.current = decoded;
      setDuration(decoded.length / decoded.sampleRate);
      setStage("ready");
    } catch {
      setErrorMsg("Could not decode this file — it may be corrupt or use an unsupported codec.");
      setStage("error");
    }
  }, []);

  const reset = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    decodedRef.current = null;
    setFile(null);
    setSegments([]);
    setDuration(null);
    setStage("empty");
  };

  const computeSegs = (length: number, sampleRate: number) =>
    mode === "equal" ? sliceEqualSegments(length, parts) : sliceByDuration(length, sampleRate, segmentSec);

  const slice = useCallback(async () => {
    const decoded = decodedRef.current;
    if (!decoded) return;
    setStage("busy");
    setErrorMsg("");
    try {
      const segs = computeSegs(decoded.length, decoded.sampleRate);
      const base = file?.name.replace(/\.[^.]+$/, "") || "audio";
      const made: Segment[] = [];
      for (let i = 0; i < segs.length; i++) {
        const { start, end } = segs[i];
        const sliced = decoded.channels.map((ch) => ch.slice(start, end));
        const wav = encodeWav(sliced, decoded.sampleRate, end - start, 16);
        const blob = wav;
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        made.push({
          index: i + 1,
          url,
          label: `${((end - start) / decoded.sampleRate).toFixed(1)} s`,
          fileName: `${base}-slice-${String(i + 1).padStart(2, "0")}.wav`,
          sizeKb: blob.size / 1024,
        });
      }
      setSegments(made);
      setStage("ready");
    } catch {
      setErrorMsg("Slicing failed — try a different segment size.");
      setStage("error");
    }
  }, [mode, parts, segmentSec, file]);

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="audio/*"
      className="hidden"
      onChange={(e) => {
        void handleFile(e.target.files?.[0] ?? null);
        e.target.value = "";
      }}
    />
  );

  return (
    <div className="space-y-4">
      {input}

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
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
          className={
            dragging
              ? "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-primary/5 p-8 text-primary"
              : "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          }
        >
          <UploadCloud className="size-6" />
          <span className="text-sm font-medium">Drop an audio file or click to choose</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {duration !== null ? `${duration.toFixed(1)} s total` : "decoding…"}
            </p>
          </div>
          <button type="button" onClick={reset} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground" aria-label="Choose a different file">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {(
            [
              ["equal", "Equal parts"],
              ["duration", "Fixed length"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "equal" ? (
          <label className="block w-40 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Number of parts</span>
            <input
              type="number"
              min={2}
              max={64}
              value={parts}
              onChange={(e) => setParts(Math.min(64, Math.max(2, Math.round(Number(e.target.value) || 2))))}
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />
          </label>
        ) : (
          <label className="block w-40 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Segment length (seconds)</span>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={segmentSec}
              onChange={(e) => setSegmentSec(Math.max(0.5, Number(e.target.value) || 0.5))}
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />
          </label>
        )}

        <button
          type="button"
          disabled={stage !== "ready" || !file}
          onClick={() => void slice()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {stage === "busy" ? <Loader2 className="size-4 animate-spin" /> : null}
          Slice into {mode === "equal" ? parts : "fixed-length"} segments
        </button>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      {segments.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{segments.length} segments ready</p>
          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {segments.map((s) => (
              <a
                key={s.index}
                href={s.url}
                download={s.fileName}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <Download className="size-3.5 shrink-0 text-primary" />
                <span className="font-mono text-xs">{s.fileName}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {s.label} · {s.sizeKb.toFixed(0)} KB
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
