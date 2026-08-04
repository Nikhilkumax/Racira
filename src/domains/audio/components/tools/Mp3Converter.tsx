"use client";

import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  FileAudio,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Music,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Bitrate = 64 | 128 | 192 | 320;
type ChannelMode = "original" | "mono" | "stereo";
/** "original" keeps the source rate; numbers are explicit Hz targets. */
type SampleRateOption = "original" | 16000 | 24000 | 32000 | 44100 | 48000;
type FileStatus = "queued" | "converting" | "done" | "error";

const BITRATES: { value: Bitrate; label: string }[] = [
  { value: 64, label: "Economy" },
  { value: 128, label: "Standard" },
  { value: 192, label: "High" },
  { value: 320, label: "Best" },
];

const CHANNEL_MODES: { value: ChannelMode; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "mono", label: "Mono" },
  { value: "stereo", label: "Stereo" },
];

const SAMPLE_RATES: { value: SampleRateOption; label: string }[] = [
  { value: "original", label: "Original" },
  { value: 16000, label: "16 kHz" },
  { value: 24000, label: "24 kHz" },
  { value: 32000, label: "32 kHz" },
  { value: 44100, label: "44.1 kHz" },
  { value: 48000, label: "48 kHz" },
];

interface QueueItem {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  downloadUrl: string | null;
  downloadName: string;
  errorMsg: string;
  /** Populated by a metadata-only decode when the file is added; null until then. */
  duration: number | null;
  sourceSampleRate: number | null;
  sourceChannels: number | null;
  /** Set when the requested rate exceeded this file's source and had to be clamped. */
  clampedTo: number | null;
}

function floatTo16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function getAudioCtx(): AudioContext {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new AudioCtx();
}

/** Average L+R into one channel. lamejs with channels=1 ignores its second arg. */
function downmixToMono(buffer: AudioBuffer): Float32Array {
  const len = buffer.length;
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const out = new Float32Array(len);
  const l = buffer.getChannelData(0);
  const r = buffer.getChannelData(1);
  for (let i = 0; i < len; i++) out[i] = (l[i] + r[i]) / 2;
  return out;
}

/**
 * Resample via OfflineAudioContext at the target rate. Needs no extra dependency —
 * the browser's own resampler runs during startRendering().
 */
async function resample(buffer: AudioBuffer, targetRate: number): Promise<AudioBuffer> {
  if (buffer.sampleRate === targetRate) return buffer;
  const frames = Math.ceil(buffer.duration * targetRate);
  const offline = new OfflineAudioContext(buffer.numberOfChannels, frames, targetRate);
  const src = offline.createBufferSource();
  src.buffer = buffer;
  src.connect(offline.destination);
  src.start();
  return offline.startRendering();
}

interface EncodeSettings {
  bitrate: Bitrate;
  channelMode: ChannelMode;
  sampleRate: SampleRateOption;
}

interface EncodeResult {
  url: string;
  name: string;
  /** Non-null when the requested rate was above the source and got clamped down. */
  clampedTo: number | null;
}

async function encodeToMp3(
  file: File,
  settings: EncodeSettings,
  onProgress: (pct: number) => void,
): Promise<EncodeResult> {
  const lamejs = (await import("lamejs")).default ?? (await import("lamejs"));
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = getAudioCtx();

  try {
    let audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const sourceRate = audioBuffer.sampleRate;

    // Never fake-upsample: a target above the source is clamped to the source rate.
    let clampedTo: number | null = null;
    if (settings.sampleRate !== "original") {
      if (settings.sampleRate > sourceRate) {
        clampedTo = sourceRate;
      } else {
        try {
          audioBuffer = await resample(audioBuffer, settings.sampleRate);
        } catch {
          // Some browsers reject non-standard OfflineAudioContext rates (Safari
          // historically). Fall back to the source rate rather than failing the file.
          clampedTo = sourceRate;
        }
      }
    }

    const wantMono =
      settings.channelMode === "mono" ||
      (settings.channelMode === "original" && audioBuffer.numberOfChannels === 1);
    const outChannels = wantMono ? 1 : Math.min(audioBuffer.numberOfChannels, 2);
    const encoder = new lamejs.Mp3Encoder(outChannels, audioBuffer.sampleRate, settings.bitrate);

    let left: Int16Array;
    let right: Int16Array | null = null;

    if (outChannels === 1) {
      left = floatTo16(downmixToMono(audioBuffer));
    } else {
      left = floatTo16(audioBuffer.getChannelData(0));
      // "stereo" on a mono source duplicates the single channel into both sides.
      right = floatTo16(
        audioBuffer.numberOfChannels > 1
          ? audioBuffer.getChannelData(1)
          : audioBuffer.getChannelData(0),
      );
    }

    const blockSize = 1152;
    const mp3Data: Int8Array[] = [];
    const total = left.length;

    for (let i = 0; i < total; i += blockSize) {
      const lChunk = left.subarray(i, i + blockSize);
      const chunk = right
        ? encoder.encodeBuffer(lChunk, right.subarray(i, i + blockSize))
        : encoder.encodeBuffer(lChunk);
      if (chunk.length > 0) mp3Data.push(chunk);
      if (i % (blockSize * 50) === 0) {
        onProgress(Math.round((i / total) * 100));
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    const flush = encoder.flush();
    if (flush.length > 0) mp3Data.push(flush);

    const blob = new Blob(mp3Data as BlobPart[], { type: "audio/mpeg" });
    return {
      url: URL.createObjectURL(blob),
      name: file.name.replace(/\.[^.]+$/, "") + ".mp3",
      clampedTo,
    };
  } finally {
    void audioCtx.close();
  }
}

/** Decode just to read duration/rate/channels for the queue row and size estimate. */
async function probeFile(
  file: File,
): Promise<{ duration: number; sampleRate: number; channels: number }> {
  const audioCtx = getAudioCtx();
  try {
    const buf = await audioCtx.decodeAudioData((await file.arrayBuffer()).slice(0));
    return { duration: buf.duration, sampleRate: buf.sampleRate, channels: buf.numberOfChannels };
  } finally {
    void audioCtx.close();
  }
}

const ACCEPTED_EXT = ["wav", "m4a", "flac", "ogg", "aac", "mp3", "opus", "aiff", "aif", "webm"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Extension is a hint only — the real check is whether decodeAudioData succeeds. */
function detectFormat(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext && ACCEPTED_EXT.includes(ext)) return ext.toUpperCase();
  if (file.type.startsWith("audio/")) return file.type.replace("audio/", "").toUpperCase();
  return ext ? ext.toUpperCase() : "Unknown";
}

/**
 * CBR estimate: bitrate x duration / 8. Independent of channel/rate settings —
 * with constant bitrate the bitrate alone determines size. Excludes ~200 bytes
 * of frame-header overhead, hence "≈" in the UI.
 */
function estimateSize(durationSec: number, bitrate: Bitrate): number {
  return (bitrate * 1000 * durationSec) / 8;
}

let idCounter = 0;

export default function Mp3Converter() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [bitrate, setBitrate] = useState<Bitrate>(192);
  const [channelMode, setChannelMode] = useState<ChannelMode>("original");
  const [sampleRate, setSampleRate] = useState<SampleRateOption>("original");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = useCallback((id: string, changes: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }, []);

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const next: QueueItem[] = Array.from(list).map((file) => ({
        id: `f${++idCounter}`,
        file,
        status: "queued" as FileStatus,
        progress: 0,
        downloadUrl: null,
        downloadName: file.name.replace(/\.[^.]+$/, "") + ".mp3",
        errorMsg: "",
        duration: null,
        sourceSampleRate: null,
        sourceChannels: null,
        clampedTo: null,
      }));
      setItems((prev) => [...prev, ...next]);

      // Probe each file so the row can show duration, source rate and a size
      // estimate before conversion. A probe failure is not fatal — the row just
      // shows "—" and the real error surfaces at encode time.
      next.forEach((item) => {
        void probeFile(item.file)
          .then(({ duration, sampleRate: sr, channels }) =>
            patch(item.id, { duration, sourceSampleRate: sr, sourceChannels: channels }),
          )
          .catch(() => undefined);
      });
    },
    [patch],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.downloadUrl) URL.revokeObjectURL(target.downloadUrl);
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((it) => {
        if (it.downloadUrl) URL.revokeObjectURL(it.downloadUrl);
      });
      return [];
    });
  }, []);

  const convertAll = useCallback(async () => {
    setBusy(true);
    // Snapshot the pending ids up front so state updates mid-loop can't reorder work.
    const pending = items.filter((it) => it.status === "queued" || it.status === "error");

    for (const item of pending) {
      patch(item.id, { status: "converting", progress: 0, errorMsg: "", clampedTo: null });
      try {
        const { url, name, clampedTo } = await encodeToMp3(
          item.file,
          { bitrate, channelMode, sampleRate },
          (pct) => patch(item.id, { progress: pct }),
        );
        patch(item.id, {
          status: "done",
          progress: 100,
          downloadUrl: url,
          downloadName: name,
          clampedTo,
        });
      } catch (err) {
        // One bad file must not stop the queue — record it and keep going.
        console.error(err);
        patch(item.id, {
          status: "error",
          progress: 0,
          errorMsg:
            err instanceof Error && /decode/i.test(err.message)
              ? "Could not decode this file — it may be corrupt or use an unsupported codec."
              : "Conversion failed. Try a different audio file.",
        });
      }
    }

    setBusy(false);
  }, [items, bitrate, channelMode, sampleRate, patch]);

  const downloadAll = useCallback(() => {
    items
      .filter((it) => it.status === "done" && it.downloadUrl)
      .forEach((it) => {
        const a = document.createElement("a");
        a.href = it.downloadUrl!;
        a.download = it.downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  }, [items]);

  const doneCount = items.filter((it) => it.status === "done").length;
  const pendingCount = items.filter((it) => it.status === "queued" || it.status === "error").length;

  // Highest source rate across probed files. A target above this can't apply to
  // any queued file, so it's disabled; targets between the lowest and highest
  // stay enabled and get clamped per-file at encode time.
  const probedRates = items
    .map((it) => it.sourceSampleRate)
    .filter((r): r is number => typeof r === "number");
  const maxSourceRate = probedRates.length > 0 ? Math.max(...probedRates) : null;

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
          addFiles(e.dataTransfer.files);
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
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Drop audio files here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports WAV, M4A, FLAC, OGG, AAC and more · multiple files at once
        </p>
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Queue <span className="text-muted-foreground">({items.length})</span>
            </p>
            <button
              type="button"
              onClick={clearAll}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  <FileAudio className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{it.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {detectFormat(it.file)} · {formatSize(it.file.size)}
                      {it.sourceSampleRate !== null && (
                        <> · {(it.sourceSampleRate / 1000).toFixed(it.sourceSampleRate % 1000 === 0 ? 0 : 1)} kHz</>
                      )}
                      {it.duration !== null && it.status !== "done" && (
                        <> · ≈{formatSize(estimateSize(it.duration, bitrate))} out</>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {it.status === "queued" && (
                      <span className="text-xs text-muted-foreground">Queued</span>
                    )}
                    {it.status === "converting" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {it.progress}%
                      </span>
                    )}
                    {it.status === "done" && it.downloadUrl && (
                      <a
                        href={it.downloadUrl}
                        download={it.downloadName}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
                      >
                        <Download className="h-3.5 w-3.5" /> MP3
                      </a>
                    )}
                    {it.status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      disabled={busy}
                      aria-label={`Remove ${it.file.name}`}
                      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {it.status === "converting" && (
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${it.progress}%`,
                        backgroundImage: "var(--gradient-primary)",
                      }}
                    />
                  </div>
                )}

                {it.status === "error" && (
                  <p className="mt-2 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                    {it.errorMsg}
                  </p>
                )}

                {it.status === "done" && it.clampedTo !== null && (
                  <p className="mt-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground">
                    Kept at {(it.clampedTo / 1000).toFixed(it.clampedTo % 1000 === 0 ? 0 : 1)} kHz —
                    the source rate. Upsampling adds no quality.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Quality (bitrate)</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BITRATES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setBitrate(value)}
              disabled={busy}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                bitrate === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {value} kbps
              <span className="block text-[10px] font-normal opacity-80">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Channels</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {CHANNEL_MODES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setChannelMode(value)}
              disabled={busy}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                channelMode === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Sample rate</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SAMPLE_RATES.map(({ value, label }) => {
            // Disabled only when the target exceeds every queued file's source rate.
            const tooHigh =
              value !== "original" && maxSourceRate !== null && value > maxSourceRate;
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => setSampleRate(value)}
                disabled={busy || tooHigh}
                title={tooHigh ? "Above the source sample rate — upsampling adds no quality" : undefined}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  sampleRate === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={pendingCount === 0 || busy}
          onClick={convertAll}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
          {busy ? "Converting…" : `Convert to MP3${pendingCount > 1 ? ` (${pendingCount})` : ""}`}
        </button>

        {doneCount > 1 && (
          <button
            type="button"
            onClick={downloadAll}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
          >
            <Download className="h-4 w-4" /> Download all ({doneCount})
          </button>
        )}
      </div>

      {doneCount > 0 && !busy && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {doneCount} file{doneCount > 1 ? "s" : ""} converted.
        </p>
      )}
    </div>
  );
}
