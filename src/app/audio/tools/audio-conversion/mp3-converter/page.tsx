"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  FileAudio,
  Download,
  Loader2,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Music,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Bitrate = 128 | 192 | 320;
type Status = "idle" | "ready" | "converting" | "done" | "error";

export default function Mp3ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState<Bitrate>(192);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("converted.mp3");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetOutput = useCallback(() => {
    setDownloadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setProgress(0);
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
    setProgress(0);
    setErrorMsg("");

    try {
      const lamejs = (await import("lamejs")).default ?? (await import("lamejs"));
      const arrayBuffer = await file.arrayBuffer();

      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

      const channels = Math.min(audioBuffer.numberOfChannels, 2);
      const sampleRate = audioBuffer.sampleRate;
      const encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);

      const left = floatTo16(audioBuffer.getChannelData(0));
      const right = channels > 1 ? floatTo16(audioBuffer.getChannelData(1)) : null;

      const blockSize = 1152;
      const mp3Data: Int8Array[] = [];
      const totalSamples = left.length;

      for (let i = 0; i < totalSamples; i += blockSize) {
        const leftChunk = left.subarray(i, i + blockSize);
        let chunk: Int8Array;
        if (right) {
          const rightChunk = right.subarray(i, i + blockSize);
          chunk = encoder.encodeBuffer(leftChunk, rightChunk);
        } else {
          // lamejs expects a second array if stereo, or just one if mono
          chunk = encoder.encodeBuffer(leftChunk);
        }
        if (chunk.length > 0) mp3Data.push(chunk);

        if (i % (blockSize * 50) === 0) {
          setProgress(Math.round((i / totalSamples) * 100));
          // Yield to the UI thread
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      const flush = encoder.flush();
      if (flush.length > 0) mp3Data.push(flush);

      void audioCtx.close();

      const blob = new Blob(mp3Data as BlobPart[], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(file.name.replace(/\.[^.]+$/, "") + ".mp3");
      setProgress(100);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        "Could not convert this file. Please try a different audio file (WAV, OGG, FLAC, M4A, etc.).",
      );
      setStatus("error");
    }
  }, [file, bitrate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="category" categoryName="Audio" />

      <main className="flex-1">
        <div className="racira-page-container py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Audio Conversion</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">MP3 Converter</span>
          </nav>

          <header className="mt-5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              MP3 Converter
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Convert WAV, OGG, FLAC, M4A and other audio files to MP3 at up to 320 kbps. Everything
              runs in your browser — your files never leave your device.
            </p>
          </header>

          {/* Converter card */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            {/* Dropzone */}
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
                    Supports WAV, OGG, FLAC, M4A, AAC and more
                  </p>
                </>
              )}
            </div>

            {/* Bitrate selector */}
            <div className="mt-6">
               <p className="text-sm font-medium text-foreground">Quality (bitrate)</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([128, 192, 320] as Bitrate[]).map((br) => (
                  <button
                    key={br}
                    type="button"
                    onClick={() => setBitrate(br)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      bitrate === br
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {br} kbps
                    <span className="block text-[10px] font-normal opacity-80">
                      {br === 128 ? "Standard" : br === 192 ? "High" : "Best"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {status === "converting" && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                   <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Converting…
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundImage: "var(--gradient-primary)" }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
               <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMsg}
              </p>
            )}

            {/* Actions */}
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
                  <Music className="h-4 w-4" />
                )}
                Convert to MP3
              </button>

              {status === "done" && downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
                >
                  <Download className="h-4 w-4" />
                  Download MP3
                </a>
              )}
            </div>

            {status === "done" && (
               <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Conversion complete!
              </p>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
             <Feature icon={ShieldCheck} title="100% private" text="Files are processed in your browser." />
            <Feature icon={Zap} title="No uploads" text="Nothing is sent to any server." />
            <Feature icon={Download} title="Free forever" text="No signup, no watermarks, no limits." />
          </div>

          {/* About / SEO content */}
          <section className="mt-12 space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                How to convert audio to MP3
              </h2>
               <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Drag and drop your audio file or click to browse.</li>
                <li>Choose your preferred quality — 128, 192 or 320 kbps.</li>
                <li>Click “Convert to MP3” and wait a moment.</li>
                <li>Download your new MP3 file.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
              <div className="mt-3 space-y-4">
                 <Faq
                  q="Is this MP3 converter free?"
                  a="Yes — it's completely free with no signup, no limits and no watermarks."
                />
                <Faq
                  q="Are my files uploaded anywhere?"
                  a="No. All conversion happens locally in your browser using the Web Audio API, so your audio never leaves your device."
                />
                <Faq
                  q="Which formats can I convert from?"
                  a="Any audio your browser can decode, including WAV, OGG, FLAC, M4A, AAC and more."
                />
                <Faq
                  q="What bitrate should I choose?"
                  a="192 kbps is a great balance of size and quality. Choose 320 kbps for the best quality, or 128 kbps for the smallest files."
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Audio — 234 free audio tools. Runs entirely in your browser.
      </footer>
    </div>
  );
}

function floatTo16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
       <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">{q}</h3>
       <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
