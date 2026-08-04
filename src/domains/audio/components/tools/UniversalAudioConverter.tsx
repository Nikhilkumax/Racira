"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  FileAudio,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Music,
  Trash2,
  Settings2,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { FFmpeg as FFmpegInstance } from "@ffmpeg/ffmpeg";
import { audioBufferToWav, type PcmSource } from "@/domains/audio/lib/wav";
import { audioBufferToAiff } from "@/domains/audio/lib/aiff";
import {
  loadFfmpeg,
  runFfmpeg,
  getEncoderSupport,
  isFfmpegReady,
  type EncoderSupport,
} from "@/domains/audio/lib/ffmpegEngine";
import {
  FORMATS,
  FORMAT_ORDER,
  MP3_BITRATES,
  AAC_BITRATES,
  WMA_BITRATES,
  OPUS_BITRATES,
  VORBIS_QUALITIES,
  VORBIS_CBR_BITRATES,
  FLAC_COMPRESSION_MIN,
  FLAC_COMPRESSION_MAX,
  FLAC_COMPRESSION_DEFAULT,
  BIT_DEPTHS,
  CHANNEL_MODES,
  SAMPLE_RATES,
  canUseNativeEncoder,
  hasNativeEncoder,
  buildFfmpegArgs,
  isFormatSupported,
  supportsVbr,
  isVbrFirst,
  type FormatId,
  type QualityMode,
  type MetadataMode,
  type ChannelMode,
  type SampleRateOption,
  type BitDepth,
  type EncodeSettings,
} from "@/domains/audio/lib/audioFormats";

type FileStatus = "queued" | "converting" | "done" | "error";

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
  /**
   * Which encoder produced the output. Recorded per row for debugging which
   * path a given file actually took; not currently surfaced in the UI.
   */
  engineUsed: "native" | "ffmpeg" | null;
}

type EngineState = "idle" | "loading" | "ready" | "error";

// ---------------------------------------------------------------------------
// Shared audio helpers
// ---------------------------------------------------------------------------

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

/** Resample through the browser's own resampler — no extra dependency needed. */
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const ACCEPTED_EXT = ["wav", "m4a", "flac", "ogg", "aac", "mp3", "opus", "aiff", "aif", "webm", "wma"];

/** Extension is a hint only — the real check is whether the decoder accepts it. */
function detectFormat(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext && ACCEPTED_EXT.includes(ext)) return ext.toUpperCase();
  if (file.type.startsWith("audio/")) return file.type.replace("audio/", "").toUpperCase();
  return ext ? ext.toUpperCase() : "Unknown";
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

/** Sensible starting bitrate for each format's own ladder. */
function defaultBitrateFor(format: FormatId): number {
  switch (format) {
    case "mp3":
      return 192;
    case "aac":
    case "m4a":
    case "wma":
    case "opus":
      return 128;
    default:
      return 128;
  }
}

/**
 * Predictable-size estimate. Only shown where output size is actually
 * determined by the settings — variable-bitrate and FLAC are omitted rather
 * than guessed at.
 */
function estimateOutputSize(item: QueueItem, settings: EncodeSettings): number | null {
  if (item.duration === null) return null;
  const kind = FORMATS[settings.format].qualityKind;

  if (kind === "bit-depth") {
    const rate =
      settings.sampleRate === "original"
        ? (item.sourceSampleRate ?? 44100)
        : Math.min(settings.sampleRate, item.sourceSampleRate ?? settings.sampleRate);
    const channels =
      settings.channelMode === "mono"
        ? 1
        : settings.channelMode === "stereo"
          ? 2
          : (item.sourceChannels ?? 2);
    return rate * channels * (settings.bitDepth / 8) * item.duration;
  }

  if (kind === "flac-compression") return null;
  if (settings.qualityMode === "vbr") return null;

  return (settings.bitrate * 1000 * item.duration) / 8;
}

// ---------------------------------------------------------------------------
// Native fast paths — no ffmpeg core download
//
// MP3 (CBR) goes through lamejs; WAV and AIFF go through the in-process PCM
// writers. All three are gated by canUseNativeEncoder(), which escalates to
// ffmpeg the moment a setting genuinely needs it (metadata passthrough, MP3
// VBR, or any other container).
// ---------------------------------------------------------------------------

interface EncodeResult {
  blob: Blob;
  clampedTo: number | null;
}

interface PreparedAudio {
  audioBuffer: AudioBuffer;
  clampedTo: number | null;
}

/**
 * Decode the file and apply the sample-rate setting.
 *
 * Shared by both native paths. Never fake-upsamples: a target above the source
 * is reported back as a clamp rather than silently interpolated.
 */
async function decodeAndPrepare(
  audioCtx: AudioContext,
  file: File,
  settings: EncodeSettings,
): Promise<PreparedAudio> {
  const arrayBuffer = await file.arrayBuffer();
  let audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  const sourceRate = audioBuffer.sampleRate;

  let clampedTo: number | null = null;
  if (settings.sampleRate !== "original") {
    if (settings.sampleRate > sourceRate) {
      clampedTo = sourceRate;
    } else {
      try {
        audioBuffer = await resample(audioBuffer, settings.sampleRate);
      } catch {
        // Some browsers reject non-standard OfflineAudioContext rates. Fall
        // back to the source rate rather than failing the file.
        clampedTo = sourceRate;
      }
    }
  }

  return { audioBuffer, clampedTo };
}

/**
 * Apply the channel setting without copying the samples that do not change.
 *
 * Returns a PcmSource view rather than an AudioBuffer: for a stereo file kept as
 * stereo this hands back the decoder's own Float32Arrays, so a long file does
 * not get duplicated in memory just to satisfy a type.
 */
function applyChannelMode(buffer: AudioBuffer, mode: ChannelMode): PcmSource {
  const sourceChannels = buffer.numberOfChannels;

  let channels: Float32Array[];
  if (mode === "mono" && sourceChannels > 1) {
    channels = [downmixToMono(buffer)];
  } else if (mode === "stereo" && sourceChannels === 1) {
    // Duplicate rather than copy — both channels can share one array.
    const only = buffer.getChannelData(0);
    channels = [only, only];
  } else if (mode === "stereo" && sourceChannels > 2) {
    channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
  } else {
    channels = Array.from({ length: sourceChannels }, (_, i) => buffer.getChannelData(i));
  }

  return {
    numberOfChannels: channels.length,
    sampleRate: buffer.sampleRate,
    length: buffer.length,
    getChannelData: (channel: number) => channels[channel],
  };
}

/** WAV and AIFF: decode, resample, adjust channels, write the container. */
async function encodeNativePcm(
  file: File,
  settings: EncodeSettings,
  onProgress: (pct: number) => void,
): Promise<EncodeResult> {
  const audioCtx = getAudioCtx();

  try {
    const { audioBuffer, clampedTo } = await decodeAndPrepare(audioCtx, file, settings);
    onProgress(60);

    const source = applyChannelMode(audioBuffer, settings.channelMode);
    const blob =
      settings.format === "aiff"
        ? audioBufferToAiff(source, settings.bitDepth)
        : audioBufferToWav(source, settings.bitDepth);

    onProgress(100);
    return { blob, clampedTo };
  } finally {
    void audioCtx.close();
  }
}

async function encodeWithLamejs(
  file: File,
  settings: EncodeSettings,
  onProgress: (pct: number) => void,
): Promise<EncodeResult> {
  const lamejs = (await import("lamejs")).default ?? (await import("lamejs"));
  const audioCtx = getAudioCtx();

  try {
    const { audioBuffer, clampedTo } = await decodeAndPrepare(audioCtx, file, settings);

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

    return { blob: new Blob(mp3Data as BlobPart[], { type: "audio/mpeg" }), clampedTo };
  } finally {
    void audioCtx.close();
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let idCounter = 0;

export interface UniversalAudioConverterProps {
  /** Format the tool opens on, driven by the registry slug. */
  defaultFormat?: FormatId;
}

export default function UniversalAudioConverter({
  defaultFormat = "mp3",
}: UniversalAudioConverterProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [format, setFormat] = useState<FormatId>(defaultFormat);
  const [qualityMode, setQualityMode] = useState<QualityMode>(
    isVbrFirst(defaultFormat) ? "vbr" : "cbr",
  );
  const [bitrate, setBitrate] = useState<number>(defaultBitrateFor(defaultFormat));
  const [bitDepth, setBitDepth] = useState<BitDepth>(16);
  const [flacCompression, setFlacCompression] = useState<number>(FLAC_COMPRESSION_DEFAULT);
  const [vorbisQuality, setVorbisQuality] = useState<number>(5);
  const [channelMode, setChannelMode] = useState<ChannelMode>("original");
  const [sampleRate, setSampleRate] = useState<SampleRateOption>("original");
  const [metadataMode, setMetadataMode] = useState<MetadataMode>("strip");

  const [engineState, setEngineState] = useState<EngineState>(
    isFfmpegReady() ? "ready" : "idle",
  );
  const [engineProgress, setEngineProgress] = useState(0);
  const [encoderSupport, setEncoderSupport] = useState<EncoderSupport | null>(
    getEncoderSupport(),
  );
  const [engineError, setEngineError] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const settings: EncodeSettings = useMemo(
    () => ({
      format,
      qualityMode,
      bitrate,
      bitDepth,
      flacCompression,
      vorbisQuality,
      channelMode,
      sampleRate,
      metadataMode,
    }),
    [
      format,
      qualityMode,
      bitrate,
      bitDepth,
      flacCompression,
      vorbisQuality,
      channelMode,
      sampleRate,
      metadataMode,
    ],
  );

  const spec = FORMATS[format];

  const patch = useCallback((id: string, changes: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }, []);

  /**
   * Load the core if the current settings need it. Called on the settings change
   * that first requires ffmpeg, so the button row can be gated on the real probe
   * result before the user hits Convert.
   */
  const ensureEngine = useCallback(
    async (needed: EncodeSettings): Promise<FFmpegInstance | null> => {
      if (canUseNativeEncoder(needed)) return null;

      // Already loaded: loadFfmpeg() returns the cached instance synchronously
      // on its first line, so this is not a second download.
      if (isFfmpegReady()) {
        setEngineState("ready");
        setEncoderSupport(getEncoderSupport());
        return loadFfmpeg();
      }

      setEngineState("loading");
      setEngineProgress(0);
      setEngineError("");
      try {
        const ff = await loadFfmpeg((ratio) => setEngineProgress(Math.round(ratio * 100)));
        setEncoderSupport(getEncoderSupport());
        setEngineState("ready");
        return ff;
      } catch (err) {
        console.error(err);
        setEngineState("error");
        setEngineError(
          "Could not load the conversion engine. Check your connection and try again.",
        );
        throw err;
      }
    },
    [],
  );

  const changeFormat = useCallback(
    (next: FormatId) => {
      setFormat(next);
      const nextMode: QualityMode = isVbrFirst(next) ? "vbr" : "cbr";
      setQualityMode(nextMode);
      setBitrate(defaultBitrateFor(next));

      void ensureEngine({ ...settings, format: next, qualityMode: nextMode }).catch(
        () => undefined,
      );
    },
    [ensureEngine, settings],
  );

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const next: QueueItem[] = Array.from(list).map((file) => ({
        id: `f${++idCounter}`,
        file,
        status: "queued" as FileStatus,
        progress: 0,
        downloadUrl: null,
        downloadName: `${baseName(file.name)}.${spec.ext}`,
        errorMsg: "",
        duration: null,
        sourceSampleRate: null,
        sourceChannels: null,
        clampedTo: null,
        engineUsed: null,
      }));
      setItems((prev) => [...prev, ...next]);

      // Probe so the row can show duration, source rate and a size estimate
      // before conversion. A probe failure is not fatal — the row shows "—" and
      // the real error surfaces at encode time.
      next.forEach((item) => {
        void probeFile(item.file)
          .then(({ duration, sampleRate: sr, channels }) =>
            patch(item.id, { duration, sourceSampleRate: sr, sourceChannels: channels }),
          )
          .catch(() => undefined);
      });
    },
    [patch, spec.ext],
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

    // Re-read the fast-path condition here, against the settings as they stand
    // right now — not as they were when the files were queued.
    const useNative = canUseNativeEncoder(settings);

    let ff: FFmpegInstance | null = null;
    if (!useNative) {
      try {
        ff = await ensureEngine(settings);
      } catch {
        setBusy(false);
        return;
      }
      if (!ff) {
        setBusy(false);
        return;
      }
    }

    const pending = items.filter((it) => it.status === "queued" || it.status === "error");

    for (const item of pending) {
      patch(item.id, {
        status: "converting",
        progress: 0,
        errorMsg: "",
        clampedTo: null,
        engineUsed: null,
      });

      try {
        let blob: Blob;
        let clampedTo: number | null = null;

        if (useNative) {
          const encode = settings.format === "mp3" ? encodeWithLamejs : encodeNativePcm;
          const result = await encode(item.file, settings, (pct) =>
            patch(item.id, { progress: pct }),
          );
          blob = result.blob;
          clampedTo = result.clampedTo;
        } else {
          if (!ff) throw new Error("Conversion engine unavailable");

          // Clamp the target rate to this file's source so we never upsample.
          let effectiveRate: number | null = null;
          if (settings.sampleRate !== "original") {
            const source = item.sourceSampleRate;
            if (source !== null && settings.sampleRate > source) {
              clampedTo = source;
            } else {
              effectiveRate = settings.sampleRate;
            }
          }

          const inputName = `in_${item.id}.${
            item.file.name.split(".").pop()?.toLowerCase() || "bin"
          }`;
          const outputName = `out_${item.id}.${spec.ext}`;
          const { args, optionalArgs } = buildFfmpegArgs(
            settings,
            inputName,
            outputName,
            effectiveRate,
          );

          const data = await runFfmpeg(ff, {
            file: item.file,
            inputName,
            outputName,
            args,
            optionalArgs,
            onProgress: (pct) => patch(item.id, { progress: pct }),
          });

          const copy = new Uint8Array(data.length);
          copy.set(data);
          blob = new Blob([copy.buffer as ArrayBuffer], { type: spec.mime });
        }

        patch(item.id, {
          status: "done",
          progress: 100,
          downloadUrl: URL.createObjectURL(blob),
          downloadName: `${baseName(item.file.name)}.${spec.ext}`,
          clampedTo,
          engineUsed: useNative ? "native" : "ffmpeg",
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
              : `Conversion to ${spec.label} failed for this file.`,
        });
      }
    }

    setBusy(false);
  }, [items, settings, spec, patch, ensureEngine]);

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
  // any queued file, so it's disabled; targets in between get clamped per file.
  const probedRates = items
    .map((it) => it.sourceSampleRate)
    .filter((r): r is number => typeof r === "number");
  const maxSourceRate = probedRates.length > 0 ? Math.max(...probedRates) : null;

  const currentSupported = isFormatSupported(format, encoderSupport);

  // Explicitly widened: the four ladders are `as const`, and mapping over a
  // union of readonly tuple types is not callable without a common element type.
  const bitrateLadder: readonly { value: number; label: string }[] =
    spec.qualityKind === "aac-bitrate"
      ? AAC_BITRATES
      : spec.qualityKind === "wma-bitrate"
        ? WMA_BITRATES
        : spec.qualityKind === "opus-bitrate"
          ? OPUS_BITRATES
          : MP3_BITRATES;

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      {/* Drop zone */}
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

      {/* Engine loading banner — only while the core is actually downloading. */}
      {engineState === "loading" && (
        <div className="mt-4 rounded-xl border border-border bg-background p-3">
          <p className="inline-flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading conversion engine (~31 MB, one-time)
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${engineProgress}%`, backgroundImage: "var(--gradient-primary)" }}
            />
          </div>
        </div>
      )}

      {engineState === "error" && engineError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {engineError}
        </p>
      )}

      {/* Queue */}
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
            {items.map((it) => {
              const estimate = estimateOutputSize(it, settings);
              return (
                <li key={it.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <FileAudio className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {it.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {detectFormat(it.file)} · {formatSize(it.file.size)}
                        {it.sourceSampleRate !== null && (
                          <>
                            {" "}
                            ·{" "}
                            {(it.sourceSampleRate / 1000).toFixed(
                              it.sourceSampleRate % 1000 === 0 ? 0 : 1,
                            )}{" "}
                            kHz
                          </>
                        )}
                        {estimate !== null && it.status !== "done" && (
                          <> · ≈{formatSize(estimate)} out</>
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
                          <Download className="h-3.5 w-3.5" /> {spec.label}
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
                      Kept at{" "}
                      {(it.clampedTo / 1000).toFixed(it.clampedTo % 1000 === 0 ? 0 : 1)} kHz —
                      the source rate. Upsampling adds no quality.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Output format */}
      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Output format</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {FORMAT_ORDER.map((id) => {
            const supported = isFormatSupported(id, encoderSupport);
            // MP3, WAV and AIFF stay available regardless: their native
            // encoders need no core, so a missing ffmpeg encoder only limits
            // metadata passthrough rather than the format itself.
            const unavailable = !hasNativeEncoder(id) && supported === false;
            return (
              <button
                key={id}
                type="button"
                onClick={() => changeFormat(id)}
                disabled={busy || unavailable}
                title={
                  unavailable
                    ? "Not available in this build of the conversion engine"
                    : undefined
                }
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  format === id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {FORMATS[id].label}
              </button>
            );
          })}
        </div>
        {encoderSupport === null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Format availability is confirmed once the conversion engine loads.
          </p>
        ) : currentSupported === false && !hasNativeEncoder(format) ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            This build of the engine has no {spec.label} encoder.
          </p>
        ) : null}
      </div>

      {/* Quality control — one branch per format family */}
      <div className="mt-6">
        {spec.qualityKind === "flac-compression" ? (
          <>
            <p className="text-sm font-medium text-foreground">
              Compression level{" "}
              <span className="text-muted-foreground">({flacCompression})</span>
            </p>
            <input
              type="range"
              min={FLAC_COMPRESSION_MIN}
              max={FLAC_COMPRESSION_MAX}
              step={1}
              value={flacCompression}
              disabled={busy}
              onChange={(e) => setFlacCompression(Number(e.target.value))}
              className="mt-3 w-full accent-[hsl(var(--primary))]"
              aria-label="FLAC compression level"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{FLAC_COMPRESSION_MIN} — fastest</span>
              <span>{FLAC_COMPRESSION_MAX} — smallest</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Compression level affects file size and encoding speed only — audio quality is
              identical (lossless) at every level.
            </p>
          </>
        ) : spec.qualityKind === "bit-depth" ? (
          <>
            <p className="text-sm font-medium text-foreground">Bit depth</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {BIT_DEPTHS.map((bd) => (
                <button
                  key={bd}
                  type="button"
                  onClick={() => setBitDepth(bd)}
                  disabled={busy}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
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
          </>
        ) : spec.qualityKind === "vorbis-quality" ? (
          <>
            <p className="text-sm font-medium text-foreground">
              Quality {qualityMode === "vbr" && <span className="text-muted-foreground">(VBR)</span>}
            </p>
            {qualityMode === "vbr" ? (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VORBIS_QUALITIES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVorbisQuality(value)}
                    disabled={busy}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                      vorbisQuality === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {label}
                    <span className="block text-[10px] font-normal opacity-80">q={value}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VORBIS_CBR_BITRATES.map((value) => (
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
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => setQualityMode(qualityMode === "vbr" ? "cbr" : "vbr")}
              className="mt-3 text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
            >
              {qualityMode === "vbr"
                ? "Advanced: use a fixed bitrate instead"
                : "Back to variable bitrate (recommended)"}
            </button>
            {qualityMode === "cbr" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Vorbis is natively variable-bitrate. Forcing a fixed bitrate works, but usually
                gives a larger file at the same quality.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">Quality (bitrate)</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {bitrateLadder.map(({ value, label }) => (
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

            {/* VBR is offered where the codec handles it well. AAC/M4A and WMA
                are deliberately excluded. */}
            {supportsVbr(format) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const next: QualityMode = qualityMode === "vbr" ? "cbr" : "vbr";
                  setQualityMode(next);
                  void ensureEngine({ ...settings, qualityMode: next }).catch(() => undefined);
                }}
                className="mt-3 text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
              >
                {qualityMode === "vbr"
                  ? "Use a fixed bitrate (CBR) instead"
                  : "Use variable bitrate (VBR) instead"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Advanced settings */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
          aria-expanded={showAdvanced}
        >
          <Settings2 className="h-4 w-4" />
          Advanced settings
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-6 rounded-xl border border-border bg-background p-4">
            <div>
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
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Sample rate</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {SAMPLE_RATES.map(({ value, label }) => {
                  const tooHigh =
                    value !== "original" && maxSourceRate !== null && value > maxSourceRate;
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setSampleRate(value)}
                      disabled={busy || tooHigh}
                      title={
                        tooHigh
                          ? "Above the source sample rate — upsampling adds no quality"
                          : undefined
                      }
                      className={cn(
                        "rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
                        "disabled:cursor-not-allowed disabled:opacity-40",
                        sampleRate === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Metadata</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["preserve", "strip"] as MetadataMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setMetadataMode(mode);
                      void ensureEngine({ ...settings, metadataMode: mode }).catch(
                        () => undefined,
                      );
                    }}
                    disabled={busy}
                    title={
                      mode === "preserve"
                        ? "Tags are carried over where the target format supports them — some fields or album art may not transfer between very different formats."
                        : undefined
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                      metadataMode === mode
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {mode === "preserve" ? "Preserve" : "Strip"}
                  </button>
                ))}
              </div>
              {metadataMode === "preserve" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Tags are carried over where the target format supports them — some fields or
                  album art may not transfer between very different formats.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={pendingCount === 0 || busy || (format !== "mp3" && currentSupported === false)}
          onClick={convertAll}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
          {busy
            ? "Converting…"
            : `Convert to ${spec.label}${pendingCount > 1 ? ` (${pendingCount})` : ""}`}
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
