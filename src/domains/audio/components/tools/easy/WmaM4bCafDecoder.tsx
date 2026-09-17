"use client";

/**
 * WMA/M4B/CAF Decoder — transcode Windows Media, Audiobook (M4B) and Core
 * Audio (CAF) files into the three universally playable targets (MP3/WAV/
 * FLAC) via the self-hosted ffmpeg core. Decode args are pure helpers
 * (buildDecodeArgs, Node-verified); the container quirks (cover-art streams
 * in M4B, PCM variants in CAF) are handled with a `-vn` guard plus metadata
 * preservation. Single file per run — these sources are rare enough that a
 * queue would only complicate the error reporting.
 */

import { useCallback, useRef, useState } from "react";
import { Download, FileAudio, Loader2, UploadCloud, X } from "lucide-react";

import {
  DECODER_TARGETS,
  buildDecodeArgs,
  targetExtension,
  type DecoderTarget,
} from "@/domains/audio/lib/audioFormats";
import { loadFfmpeg, runFfmpeg } from "@/domains/audio/lib/ffmpegEngine";

type Stage = "empty" | "ready" | "busy" | "done" | "error";

interface Result {
  url: string;
  fileName: string;
  sizeKb: number;
  target: DecoderTarget;
}

export default function WmaM4bCafDecoder() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<DecoderTarget>("mp3");
  const [stage, setStage] = useState<Stage>("empty");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setFile(null);
    setResult(null);
    setStage("empty");
    setErrorMsg("");
  }, []);

  const accept = (selected: File | null) => {
    if (!selected) return;
    reset();
    setFile(selected);
    setStage("ready");
  };

  const decode = useCallback(async () => {
    if (!file) return;
    setStage("busy");
    setProgress(0);
    setErrorMsg("");
    try {
      const ff = await loadFfmpeg((ratio) => setProgress(Math.round(ratio * 100)));
      const inExt = file.name.split(".").pop()?.toLowerCase() || "bin";
      const inputName = `in_decode.${inExt}`;
      const outputName = `out_decode.${targetExtension(target)}`;
      const data = await runFfmpeg(ff, {
        file,
        inputName,
        outputName,
        args: buildDecodeArgs(target, inputName, outputName),
        onProgress: setProgress,
      });
      // Copy: the wasm heap the view points at is detached after the run.
      const copy = new Uint8Array(data.length);
      copy.set(data);
      const blob = new Blob([copy.buffer as ArrayBuffer], {
        type: target === "wav" ? "audio/wav" : target === "flac" ? "audio/flac" : "audio/mpeg",
      });
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({
        url,
        fileName: `${file.name.replace(/\.[^.]+$/, "")}.${targetExtension(target)}`,
        sizeKb: Math.max(1, Math.round(copy.length / 1024)),
        target,
      });
      setStage("done");
    } catch (err) {
      console.error("WMA/M4B/CAF decode failed:", err);
      setErrorMsg(
        "Could not decode this file — the format may be unsupported, DRM-protected, or corrupt.",
      );
      setStage("error");
    }
  }, [file, target]);

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
          accept(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".wma,.m4b,.caf,.asf,.audio"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0] ?? null)}
        />
        <FileAudio className="mb-2 h-10 w-10 text-muted-foreground" />
        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(1)} MB · click to choose another
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Drop a WMA, M4B (audiobook) or CAF file here, or click to browse
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Output format</label>
        <div className="flex flex-wrap gap-2">
          {DECODER_TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTarget(t.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                target === t.id
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {stage === "busy" && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="w-10 text-right text-xs tabular-nums">{progress}%</span>
        </div>
      )}

      {errorMsg && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={stage !== "ready"}
          onClick={decode}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Decode to {target.toUpperCase()}
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

      {stage === "done" && result && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="text-sm">
            <p className="font-medium">{result.fileName}</p>
            <p className="text-xs text-muted-foreground">{result.sizeKb} KB · ready</p>
          </div>
          <a
            href={result.url}
            download={result.fileName}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
      )}
    </div>
  );
}
