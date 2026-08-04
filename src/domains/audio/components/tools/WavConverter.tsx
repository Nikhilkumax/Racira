"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileAudio, Download, Loader2, CheckCircle2, Waves } from "lucide-react";

import { cn } from "@/lib/utils";
import { audioBufferToWav, type WavBitDepth } from "@/domains/audio/lib/wav";

type Status = "idle" | "ready" | "converting" | "done" | "error";

export default function WavConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [bitDepth, setBitDepth] = useState<WavBitDepth>(16);
  const [status, setStatus] = useState<Status>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("converted.wav");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetOutput = useCallback(() => {
    setDownloadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) return;
      resetOutput();
      setErrorMsg("");
      setFile(selected);
      setStatus("ready");
    },
    [resetOutput],
  );

  const convert = useCallback(async () => {
    if (!file) return;
    setStatus("converting");
    setErrorMsg("");

    try {
      const arrayBuffer = await file.arrayBuffer();

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

      const blob = audioBufferToWav(audioBuffer, bitDepth);
      void audioCtx.close();

      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(file.name.replace(/\.[^.]+$/, "") + ".wav");
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        "Could not convert this file. Please try a different audio file (MP3, OGG, FLAC, M4A, etc.).",
      );
      setStatus("error");
    }
  }, [file, bitDepth]);

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div
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
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-accent/40" : "border-border hover:border-primary/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center gap-3">
            <FileAudio className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · click to choose another
              </p>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Drop an audio file here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports MP3, OGG, FLAC, M4A, AAC and more
            </p>
          </>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Bit depth</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {([16, 24] as WavBitDepth[]).map((bd) => (
            <button
              key={bd}
              type="button"
              onClick={() => setBitDepth(bd)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                bitDepth === bd
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {bd}-bit
              <span className="block text-[10px] font-normal opacity-80">
                {bd === 16 ? "CD quality" : "Studio"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!file || status === "converting"}
          onClick={convert}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "converting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Waves className="h-4 w-4" />
          )}
          Convert to WAV
        </button>

        {status === "done" && downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
          >
            <Download className="h-4 w-4" />
            Download WAV
          </a>
        )}
      </div>

      {status === "done" && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Conversion complete!
        </p>
      )}
    </div>
  );
}
