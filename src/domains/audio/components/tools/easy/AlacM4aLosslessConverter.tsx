"use client";

/**
 * ALAC/M4A Lossless Converter — convert to ALAC inside an M4A container, or
 * decode existing ALAC/M4A files back out to WAV/FLAC (lossless) or AAC/MP3
 * (lossy). Args are pure helpers (buildAlacArgs, Node-verified) run on the
 * self-hosted ffmpeg core, which ships the `alac` encoder. `-vn` on both
 * directions keeps M4A cover art from breaking the stream mapping.
 */

import { useCallback, useRef, useState } from "react";
import { Download, FileAudio, Loader2, UploadCloud, X } from "lucide-react";

import {
  ALAC_TARGETS,
  buildAlacArgs,
  targetExtension,
  type AlacTarget,
} from "@/domains/audio/lib/audioFormats";
import { loadFfmpeg, runFfmpeg } from "@/domains/audio/lib/ffmpegEngine";

type Stage = "empty" | "ready" | "busy" | "done" | "error";

interface Result {
  url: string;
  fileName: string;
  sizeKb: number;
}

export default function AlacM4aLosslessConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<AlacTarget>("alac");
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

  const convert = useCallback(async () => {
    if (!file) return;
    setStage("busy");
    setProgress(0);
    setErrorMsg("");
    try {
      const ff = await loadFfmpeg((ratio) => setProgress(Math.round(ratio * 100)));
      const inExt = file.name.split(".").pop()?.toLowerCase() || "m4a";
      const inputName = `in_alac.${inExt}`;
      const outputName = `out_alac.${targetExtension(target)}`;
      const data = await runFfmpeg(ff, {
        file,
        inputName,
        outputName,
        args: buildAlacArgs(target, inputName, outputName),
        onProgress: setProgress,
      });
      // Copy: the wasm heap the view points at is detached after the run.
      const copy = new Uint8Array(data.length);
      copy.set(data);
      const mime =
        target === "alac" || target === "aac"
          ? "audio/mp4"
          : target === "wav"
            ? "audio/wav"
            : target === "flac"
              ? "audio/flac"
              : "audio/mpeg";
      const blob = new Blob([copy.buffer as ArrayBuffer], { type: mime });
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({
        url,
        fileName: `${file.name.replace(/\.[^.]+$/, "")}.${targetExtension(target)}`,
        sizeKb: Math.max(1, Math.round(copy.length / 1024)),
      });
      setStage("done");
    } catch {
      setErrorMsg("Conversion failed — the file may be corrupt or use an unsupported codec.");
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
          accept=".m4a,.mp4,.alac,.aac,.wav,.flac,.mp3,.caf"
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
            Drop an M4A/ALAC file here — or any audio to encode into lossless ALAC
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Output format</label>
        <div className="flex flex-wrap gap-2">
          {ALAC_TARGETS.map((t) => (
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
          onClick={convert}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Convert
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
