"use client";

/**
 * Audio Splitter — split a file into tracks at its silent gaps (chapter marks
 * for recordings, between-song gaps for albums, sides for cassette rips).
 * Detection reuses the Node-verified detectSilenceSpans (20 ms frames, peak
 * threshold, minimum gap length); the audio between consecutive gaps becomes
 * one track with per-track download. This is the "where to cut is in the
 * audio itself" counterpart to Slicer (fixed math cuts) and Cutter (remove
 * ranges) — three genuinely different jobs that share decode/WAV plumbing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Scissors, UploadCloud, X } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { detectSilenceSpans } from "@/domains/audio/lib/edit";

interface Track {
  index: number;
  url: string;
  fileName: string;
  sizeKb: number;
  startSec: number;
  endSec: number;
}

type Stage = "empty" | "ready" | "busy" | "error";

export default function AudioSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [thresholdDb, setThresholdDb] = useState(-50);
  const [minGapSec, setMinGapSec] = useState(1);
  const [tracks, setTracks] = useState<Track[]>([]);
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
    setTracks([]);
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
    setTracks([]);
    setDuration(null);
    setStage("empty");
  };

  const split = useCallback(async () => {
    const decoded = decodedRef.current;
    if (!decoded) return;
    setStage("busy");
    setErrorMsg("");
    try {
      // Detect gaps on the mono downmix (decode is often stereo; a gap is a
      // gap only when both channels are quiet — peak of L/R handles that).
      const mono =
        decoded.channels.length === 1
          ? decoded.channels[0]
          : decoded.channels.map((ch, i) => (i === 0 ? ch.slice() : ch)).reduce((acc, ch) => {
              for (let i = 0; i < acc.length; i++) acc[i] = Math.max(acc[i], ch[i]);
              return acc;
            });
      const spans = detectSilenceSpans(mono, decoded.sampleRate, {
        thresholdDb,
        minSilenceMs: Math.round(minGapSec * 1000),
      });

      // Track spans: everything between consecutive silence gaps.
      const sr = decoded.sampleRate;
      const bounds: Array<{ start: number; end: number }> = [];
      let cursor = 0;
      for (const gap of spans) {
        if (gap.startSample - cursor > sr * 0.2) bounds.push({ start: cursor, end: gap.startSample });
        cursor = gap.endSample;
      }
      if (decoded.length - cursor > sr * 0.2) bounds.push({ start: cursor, end: decoded.length });

      if (bounds.length < 2) {
        setErrorMsg(
          "No quiet gaps long enough to split on were found. Try a higher (less negative) threshold or a shorter minimum gap.",
        );
        setStage("error");
        return;
      }

      const base = file?.name.replace(/\.[^.]+$/, "") || "audio";
      const made: Track[] = [];
      for (let i = 0; i < bounds.length; i++) {
        const { start, end } = bounds[i];
        const sliced = decoded.channels.map((ch) => ch.slice(start, end));
        const wav = encodeWav(sliced, sr, end - start, 16);
        const url = URL.createObjectURL(wav);
        urlsRef.current.push(url);
        made.push({
          index: i + 1,
          url,
          fileName: `${base}-track${String(i + 1).padStart(2, "0")}.wav`,
          sizeKb: Math.max(1, Math.round(wav.size / 1024)),
          startSec: start / sr,
          endSec: end / sr,
        });
      }
      setTracks(made);
      setStage("ready");
    } catch {
      setErrorMsg("Splitting failed — unexpected error while processing the audio.");
      setStage("error");
    }
  }, [file, thresholdDb, minGapSec]);

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {duration !== null && `${duration.toFixed(1)} s · `}click to choose another
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Drop an audio file here — tracks are cut at the silent gaps it already contains
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="split-threshold" className="mb-1 block text-sm font-medium">
            Silence threshold: {thresholdDb} dBFS
          </label>
          <input
            id="split-threshold"
            type="range"
            min={-80}
            max={-20}
            step={1}
            value={thresholdDb}
            onChange={(e) => setThresholdDb(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="split-gap" className="mb-1 block text-sm font-medium">
            Minimum gap: {minGapSec.toFixed(1)} s
          </label>
          <input
            id="split-gap"
            type="range"
            min={0.3}
            max={5}
            step={0.1}
            value={minGapSec}
            onChange={(e) => setMinGapSec(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {errorMsg && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={stage !== "ready"}
          onClick={split}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {stage === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
          Split at silences
        </button>
        {file && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {tracks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {tracks.length} tracks · {tracks[0].startSec.toFixed(1)} s –{" "}
            {tracks[tracks.length - 1].endSec.toFixed(1)} s
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {tracks.map((t) => (
              <div key={t.index} className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="text-sm">
                  <span className="font-medium">Track {t.index}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t.startSec.toFixed(2)} s → {t.endSec.toFixed(2)} s · {t.sizeKb} KB
                  </span>
                </div>
                <a
                  href={t.url}
                  download={t.fileName}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary"
                >
                  <Download className="h-3.5 w-3.5" /> WAV
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
