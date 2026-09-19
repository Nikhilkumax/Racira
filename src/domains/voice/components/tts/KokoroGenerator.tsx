"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Download, Trash2, Loader2 } from "lucide-react";
import {
  KOKORO_VOICES,
  KOKORO_LANGUAGES,
  type KokoroVoice,
} from "@/domains/voice/lib/kokoroVoices";
import { getKokoroEngine } from "@/domains/voice/lib/kokoroEngine";
import {
  splitTextIntoChunks,
  chunkCharLimit,
} from "@/domains/voice/lib/textChunker";
import { cn } from "@/lib/utils";
import type { RawAudio } from "@huggingface/transformers";
import type { KokoroTTS } from "kokoro-js";

// Hard cap on a single submission. Text beyond the per-language single-chunk
// threshold is no longer rejected — it is split and generated chunk by chunk —
// so this ceiling exists to bound total wait, not to prevent truncation.
// At the measured RTF it is roughly 6 minutes of generation for English and
// 11 for Hindi, which is already at the edge of reasonable.
const MAX_INPUT_CHARS = 5000;

// Measured on this machine: 29s of generation for 24.4s of audio, single
// threaded on the main thread. Used only to estimate the wait shown up front.
// Deliberately not adjusted downward for `speed`: a faster speaking rate
// yields shorter audio and so a shorter generation, which makes this estimate
// conservative rather than optimistic. Under-promising is the safer error when
// the page is about to lock up.
const SECONDS_PER_CHUNK = 29;

// Gap inserted between concatenated chunks. Chunk boundaries fall on sentence
// or clause ends, where a speaker would pause anyway; without it the joins
// sound clipped, and much beyond this they start to drag.
const CHUNK_GAP_SECONDS = 0.1;

interface ModelProgress {
  status?: string;
  progress?: number;
  name?: string;
  loaded?: number;
  total?: number;
}

/**
 * Join per-chunk audio into one buffer, separated by short silences.
 *
 * Concatenation happens at the raw sample level. Merging encoded WAV blobs
 * instead would embed a 44-byte RIFF header at every join, which decoders read
 * as garbage samples.
 */
function concatWithGaps(parts: RawAudio[], gapSeconds: number): RawAudio {
  const samplingRate = parts[0].sampling_rate;
  const gapSamples = Math.round(samplingRate * gapSeconds);
  const total =
    parts.reduce((sum, p) => sum + p.audio.length, 0) +
    gapSamples * (parts.length - 1);

  // Zero-filled, so the gaps need no explicit write — only the audio is copied.
  const merged = new Float32Array(total);
  let offset = 0;
  for (let i = 0; i < parts.length; i++) {
    merged.set(parts[i].audio, offset);
    offset += parts[i].audio.length + gapSamples;
  }

  // Constructed from the first part's prototype rather than by importing
  // RawAudio: the class lives in the transformers ESM bundle that is otherwise
  // only pulled in dynamically, and a static import would drag it into the
  // initial page chunk.
  const Ctor = parts[0].constructor as new (
    audio: Float32Array,
    samplingRate: number,
  ) => RawAudio;
  return new Ctor(merged, samplingRate);
}

/** Carries which chunk failed, so the message can name it. */
class ChunkGenerationError extends Error {
  constructor(
    readonly part: number,
    readonly total: number,
    cause: unknown,
  ) {
    const detail = (cause as { message?: string })?.message ?? String(cause);
    super(`Generation failed at part ${part} of ${total}. ${detail}`);
    this.name = "ChunkGenerationError";
    this.cause = cause;
  }
}

/**
 * Give the browser one real opportunity to repaint.
 *
 * Inference is synchronous on the main thread (ONNX_ENV.wasm.proxy = false),
 * so between-chunk state updates are the only moment anything can render. A
 * bare await is not enough: React batches the update into a microtask, and the
 * next generate() call would start before a frame is produced. Waiting for a
 * frame and then yielding the task guarantees the new "part N of M" is on
 * screen before the thread locks up again.
 */
function yieldToPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0)),
  );
}

/**
 * Generate each chunk in turn and merge the results.
 *
 * Strictly sequential: transformers.js funnels every session through one
 * promise chain, so concurrent calls would queue anyway while multiplying peak
 * memory. Throws ChunkGenerationError on the first failure, discarding the
 * chunks already produced — a clip missing its middle is worse than no clip.
 */
async function generateChunked(
  tts: KokoroTTS,
  chunks: string[],
  voice: string,
  speed: number,
  onChunkStart: (index: number) => Promise<void>,
): Promise<RawAudio> {
  const parts: RawAudio[] = [];
  const runStart = performance.now();

  for (let i = 0; i < chunks.length; i++) {
    await onChunkStart(i);

    const chunkStart = performance.now();
    try {
      parts.push(
        await tts.generate(chunks[i], { voice: voice as any, speed: speed }),
      );
    } catch (chunkErr: any) {
      console.error(
        `[kokoro][diag] chunk ${i + 1}/${chunks.length} THREW:`,
        chunkErr?.name,
        chunkErr?.message,
        chunkErr?.stack,
      );
      throw new ChunkGenerationError(i + 1, chunks.length, chunkErr);
    }

    const part = parts[parts.length - 1];
    const outSec = part.audio.length / part.sampling_rate;
    const chunkMs = performance.now() - chunkStart;
    console.log(
      `[kokoro][timing] chunk ${i + 1}/${chunks.length} = ${chunkMs.toFixed(0)} ms ` +
        `for ${chunks[i].length} chars -> ${outSec.toFixed(2)}s audio, ` +
        `RTF ${(chunkMs / 1000 / outSec).toFixed(2)}`,
    );
  }

  const merged = concatWithGaps(parts, CHUNK_GAP_SECONDS);
  console.log(
    `[kokoro][timing] ${chunks.length} chunks in ${((performance.now() - runStart) / 1000).toFixed(1)}s ` +
      `-> ${(merged.audio.length / merged.sampling_rate).toFixed(2)}s merged audio`,
  );
  return merged;
}

async function encodeMp3ClientSide(audio: RawAudio): Promise<Blob> {
  const lamejs = (await import("lamejs")).default;
  const samples: Float32Array = audio.audio;
  const sampleRate: number = audio.sampling_rate;
  const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const maxSamples = 1152;
  const chunks: any[] = [];

  for (let i = 0; i < samples.length; i += maxSamples) {
    const chunk = samples.subarray(i, i + maxSamples);
    const int16 = new Int16Array(chunk.length);
    for (let j = 0; j < chunk.length; j++) {
      int16[j] = Math.max(-1, Math.min(1, chunk[j])) * 0x7fff;
    }
    const mp3buf = mp3Encoder.encodeBuffer(int16);
    if (mp3buf.length > 0) chunks.push(mp3buf);
  }

  const mp3buf = mp3Encoder.flush();
  if (mp3buf.length > 0) chunks.push(mp3buf);

  return new Blob(chunks, { type: "audio/mp3" });
}

async function toOutputBlob(
  audio: RawAudio,
  format: "wav" | "mp3",
): Promise<Blob> {
  if (format === "wav") {
    return audio.toBlob();
  }
  return encodeMp3ClientSide(audio);
}

export function KokoroGenerator() {
  const [voice, setVoice] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(KOKORO_LANGUAGES[0].code);
  const [speed, setSpeed] = useState(1);
  const [format, setFormat] = useState<"wav" | "mp3">("wav");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading-model" | "generating" | "error"
  >("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [loadProgress, setLoadProgress] = useState(0);
  const [loadMessage, setLoadMessage] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Multi-chunk progress. `chunkTotal` of 0 means the current run is a
  // single-call generation, which renders the original spinner.
  const [chunkIndex, setChunkIndex] = useState(0);
  const [chunkTotal, setChunkTotal] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Autoplay each newly generated clip. Runs after the <audio> element is
  // mounted with the new src, so the ref is guaranteed to be attached.
  // A rejected play() (e.g. browser autoplay policy) is non-fatal — the user
  // can still press play, so it is logged rather than surfaced as an error.
  useEffect(() => {
    if (!audioUrl) return;
    console.log("[kokoro][diag] autoplay effect — audioUrl:", audioUrl, "audioRef attached:", !!audioRef.current, "element src:", audioRef.current?.src);
    audioRef.current
      ?.play()
      .then(() => console.log("[kokoro][diag] play() resolved — paused:", audioRef.current?.paused, "duration:", audioRef.current?.duration, "readyState:", audioRef.current?.readyState))
      .catch((err) => console.error("[kokoro] play() rejected:", err));
  }, [audioUrl]);

  useEffect(() => {
    const filtered = KOKORO_VOICES.filter((v) => v.language === language);
    if (filtered.length > 0 && !filtered.some((v) => v.id === voice)) {
      setVoice(filtered[0].id);
    }
  }, [language, voice]);

  const filteredVoices = KOKORO_VOICES.filter((v) => v.language === language);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const charCount = text.length;
  const overLimit = charCount > MAX_INPUT_CHARS;

  // Single-chunk threshold for the active language, from the same arithmetic
  // the chunker uses. No longer the user-facing cap — it only decides whether
  // this input needs splitting at all.
  const singleChunkLimit = chunkCharLimit(language);

  // Planned chunk count for the current text, shown before generation starts so
  // the wait is never a surprise. Runs the real splitter rather than dividing
  // by the limit, so the estimate matches what generation will actually do.
  // Memoised because splitting 5000 characters on every keystroke is wasteful,
  // even though it is fast.
  const plannedChunks = useMemo(() => {
    if (overLimit) return 0;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length <= singleChunkLimit) return trimmed ? 1 : 0;
    return splitTextIntoChunks(trimmed, language).length;
  }, [text, language, singleChunkLimit, overLimit]);

  const estimatedMinutes = Math.ceil((plannedChunks * SECONDS_PER_CHUNK) / 60);

  const handleGenerate = async () => {
    if (!voice || !text.trim()) return;
    if (status === "loading-model" || status === "generating") return;
    // Mirrors the `canGenerate` gate on the button. Repeated here because the
    // limit depends on `language`, which can change after the text is typed —
    // switching to Hindi shrinks the budget and can push existing text over.
    if (overLimit) return;

    setStatus("loading-model");
    setLoadProgress(0);
    setLoadMessage("");
    setLoadError(null);
    setChunkIndex(0);
    setChunkTotal(0);

    console.log("[kokoro] handleGenerate called, voice:", voice, "text length:", text.length);
    console.log("[kokoro] calling getKokoroEngine...");

    try {
      const tts = await getKokoroEngine((info: unknown) => {
        const e = info as ModelProgress;
        if (typeof e.progress === "number") {
          // transformers.js reports progress already on a 0-100 scale (the
          // engine logs it: "progress":100 at completion), not 0-1 —
          // multiplying again here showed 10000% at completion.
          setLoadProgress(Math.round(e.progress));
        }
        if (e.status) setLoadMessage(e.status);
      });

      setStatus("generating");

      console.log("[kokoro][diag] BEFORE tts.generate — voice:", voice, "textLength:", text.length, "speed:", speed, "format:", format);

      // Short inputs take the original single-call path untouched: no splitter,
      // no loop, no array, no extra await. Only text that would truncate is
      // routed through chunking.
      let audio: RawAudio;
      if (text.length <= singleChunkLimit) {
        const genStart = performance.now();
        try {
          audio = await tts.generate(text, {
            voice: voice as any,
            speed: speed,
          });
        } catch (genErr: any) {
          console.error("[kokoro][diag] tts.generate THREW:", genErr?.name, genErr?.message, genErr?.stack);
          throw genErr;
        }
        const genMs = performance.now() - genStart;
        {
          const outSec = audio?.audio?.length && audio?.sampling_rate
            ? audio.audio.length / audio.sampling_rate
            : 0;
          // Real-time factor: generate-seconds per audio-second. RTF is the
          // figure that extrapolates honestly across chunk sizes; raw ms does not,
          // because a chunk's cost tracks its phoneme count, not its char count.
          console.log(
            `[kokoro][timing] tts.generate() = ${genMs.toFixed(0)} ms for ${text.length} chars ` +
              `(${(genMs / Math.max(text.length, 1)).toFixed(2)} ms/char) -> ${outSec.toFixed(2)}s audio, ` +
              `RTF ${outSec > 0 ? (genMs / 1000 / outSec).toFixed(2) : "n/a"}`,
          );
        }

        const samples = audio?.audio as Float32Array | undefined;
        let nanCount = 0;
        let min = Infinity;
        let max = -Infinity;
        if (samples) {
          for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            if (Number.isNaN(s)) nanCount++;
            else {
              if (s < min) min = s;
              if (s > max) max = s;
            }
          }
        }
        console.log("[kokoro][diag] AFTER tts.generate — audio shape:", {
          ctor: audio?.constructor?.name,
          samplesCtor: samples?.constructor?.name,
          length: samples?.length,
          sampling_rate: audio?.sampling_rate,
          durationSec: samples && audio?.sampling_rate ? samples.length / audio.sampling_rate : undefined,
          nanCount,
          min: min === Infinity ? null : min,
          max: max === -Infinity ? null : max,
          allZeroOrNaN: nanCount === samples?.length || (min === 0 && max === 0),
          first8: samples ? Array.from(samples.slice(0, 8)) : undefined,
        });
      } else {
        const chunks = splitTextIntoChunks(text, language);
        console.log(
          `[kokoro][diag] chunked path — ${chunks.length} chunks, limit ${singleChunkLimit} for ${language}, sizes:`,
          chunks.map((c) => c.length),
        );
        setChunkTotal(chunks.length);

        // The NaN scan that guards the single-call path is deliberately not run
        // per chunk. It was a Phase 2 diagnostic for a fault that reproduced on
        // the very first generation; repeating it up to 22 times per run costs
        // a full pass over every sample and reports nothing new.
        audio = await generateChunked(tts, chunks, voice, speed, async (i) => {
          setChunkIndex(i);
          await yieldToPaint();
        });
      }

      console.log("[kokoro][diag] BEFORE toOutputBlob — format:", format);
      let blob: Blob;
      try {
        blob = await toOutputBlob(audio, format);
      } catch (blobErr: any) {
        console.error("[kokoro][diag] toOutputBlob THREW:", blobErr?.name, blobErr?.message, blobErr?.stack);
        throw blobErr;
      }
      console.log("[kokoro][diag] AFTER toOutputBlob — blob:", { size: blob?.size, type: blob?.type });

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      console.log("[kokoro][diag] BEFORE createObjectURL");
      const url = URL.createObjectURL(blob);
      console.log("[kokoro][diag] AFTER createObjectURL — url:", url);
      objectUrlRef.current = url;

      // Reset playback state for the new clip; the <audio> element picks up
      // the new src and reports its own duration via onLoadedMetadata.
      setCurrentTime(0);
      setDuration(0);
      console.log("[kokoro][diag] BEFORE setAudioUrl");
      setAudioUrl(url);
      console.log("[kokoro][diag] AFTER setAudioUrl");

      setStatus("idle");
      setChunkTotal(0);
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("[kokoro][diag] handleGenerate CAUGHT:", err?.name, msg, err?.stack, err);
      // A chunk failure already names the failing part; it must not be prefixed
      // with the generic sentence.
      setLoadError(
        err instanceof ChunkGenerationError ? msg : `Speech generation failed. ${msg}`,
      );
      setStatus("error");
      // Cleared so a retry does not resume showing a stale part number.
      setChunkTotal(0);
      // Drop any previously generated clip. Nothing partial was ever assigned
      // to audioUrl, but leaving an older clip in the player directly beneath
      // "Generation failed at part 7 of 13" invites reading it as the partial
      // result of the run that just failed.
      setAudioUrl(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el || !isFinite(el.duration) || el.duration <= 0) return;
    const next = (Number(e.target.value) / 100) * el.duration;
    el.currentTime = next;
    setCurrentTime(next);
  };

  const handleClear = () => {
    setText("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const fmt = (sec: number) => {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const canGenerate =
    voice &&
    text.trim() &&
    !overLimit &&
    status !== "loading-model" &&
    status !== "generating";

  // Everything is frozen while a run is in flight — including the text and the
  // language/voice pickers, which the original only guarded during model load.
  // A mid-run language change would repoint the chunk threshold at text that
  // has already been split.
  const busy = status === "loading-model" || status === "generating";

  const selectedVoice = KOKORO_VOICES.find((v) => v.id === voice) ?? null;

  return (
    // pt-0: the hero's pb owns the heading-to-tool-box gap, so it stays equal
    // to the header-to-heading gap above it. Adding top padding here would
    // stack on top of that and reintroduce the asymmetry.
    <section className="racira-page-container pb-8 pt-0">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-3xl border border-border-subtle bg-gradient-card shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
            {/* LEFT PANEL */}
            <div className="flex flex-col border-b border-border-subtle lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3 px-5 pt-5">
                <h3 className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your text
                </h3>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!text}
                  aria-label="Clear text"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="relative flex-1 px-5 pb-3 pt-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={busy}
                  placeholder="Enter the text you want to convert to speech..."
                  className={cn(
                    "h-[460px] w-full resize-none rounded-xl border-0 bg-transparent p-3 text-[15.5px] leading-relaxed shadow-none",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 pb-4 text-[13px]">
                <span className="text-muted-foreground">
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span
                  data-testid="tts-char-count"
                  aria-live="polite"
                  className={cn(
                    "font-mono tabular-nums",
                    overLimit ? "font-semibold text-destructive" : "text-muted-foreground",
                  )}
                >
                  {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
                </span>
                {overLimit ? (
                  <p
                    role="alert"
                    data-testid="tts-limit-warning"
                    className="w-full text-destructive"
                  >
                    Too long by {(charCount - MAX_INPUT_CHARS).toLocaleString()}{" "}
                    {charCount - MAX_INPUT_CHARS === 1 ? "character" : "characters"}.
                    Text is generated in parts, and past {MAX_INPUT_CHARS.toLocaleString()}{" "}
                    characters the wait becomes impractical. Shorten it, or split it
                    into separate clips.
                  </p>
                ) : (
                  plannedChunks > 1 && (
                    <p
                      data-testid="tts-chunk-estimate"
                      aria-live="polite"
                      className="w-full text-muted-foreground"
                    >
                      Generates in {plannedChunks} parts — estimated{" "}
                      {estimatedMinutes} {estimatedMinutes === 1 ? "minute" : "minutes"}.
                      The page may be unresponsive while this runs.
                    </p>
                  )
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex flex-col gap-5 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Voice options
              </h3>

              {/* Voice (split Language + Voice) */}
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Language
                    </Label>
                    <Select
                      value={language}
                      onValueChange={setLanguage}
                      disabled={busy}
                    >
                      <SelectTrigger className="w-full h-11 rounded-xl" data-testid="language-select">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {KOKORO_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Voice
                    </Label>
                    <Select
                      value={voice ?? ""}
                      onValueChange={setVoice}
                      disabled={busy}
                    >
                      <SelectTrigger className="w-full h-11 rounded-xl" data-testid="voice-select">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVoices.map((v: KokoroVoice) => (
                          <SelectItem key={v.id} value={v.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {v.name} — {v.gender}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Speed</span>
                  <span className="text-sm font-medium">
                    {speed.toFixed(1)}x
                  </span>
                </Label>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  disabled={busy}
                  className="w-full"
                />
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">
                  Format
                </Label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as "wav" | "mp3")}
                  disabled={busy}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl" data-testid="format-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wav">WAV (uncompressed)</SelectItem>
                    <SelectItem value="mp3">MP3 (compressed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate / Loading / Error */}
              <div className="mt-auto space-y-3">
                {status === "error" && loadError && (
                  <div
                    role="alert"
                    data-testid="tts-generate-error"
                    className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {loadError}
                  </div>
                )}

                {status === "loading-model" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                      <span>{loadMessage || "Loading model..."}</span>
                      <span>{loadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${loadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : status === "generating" ? (
                  chunkTotal > 1 ? (
                    // Multi-chunk: no spinner. The main thread is blocked inside
                    // each generate() call, so a CSS animation would freeze for
                    // ~29s at a time and read as a hung page. A bar that steps
                    // forward between chunks is honest about what is happening —
                    // every visible change corresponds to a real completed part.
                    <div className="space-y-3" data-testid="tts-chunk-progress">
                      <div className="flex items-center justify-between text-[13px]">
                        <span aria-live="polite" className="font-medium">
                          Generating part {chunkIndex + 1} of {chunkTotal}...
                        </span>
                        <span className="font-mono tabular-nums text-muted-foreground">
                          {Math.round((chunkIndex / chunkTotal) * 100)}%
                        </span>
                      </div>
                      <div className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: chunkTotal }, (_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-2 flex-1 rounded-full",
                              i < chunkIndex
                                ? "bg-brand"
                                : i === chunkIndex
                                  ? "bg-brand/40"
                                  : "bg-muted/30",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[12.5px] text-muted-foreground">
                        The page will be unresponsive until this finishes.
                      </p>
                    </div>
                  ) : (
                    <Button
                      disabled
                      className="w-full h-11 rounded-full bg-brand text-brand-foreground font-semibold"
                    >
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full h-11 rounded-full bg-brand text-brand-foreground hover:bg-brand/90 font-semibold disabled:opacity-50"
                  >
                    Generate Audio
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Audio player */}
          {audioUrl && (
            <div className="border-t border-border-subtle bg-surface-muted/40 px-5 py-4">
              <audio
                ref={audioRef}
                data-testid="tts-audio"
                src={audioUrl}
                preload="metadata"
                style={{ display: "none" }}
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  setDuration(isFinite(d) ? d : 0);
                }}
                onDurationChange={(e) => {
                  const d = e.currentTarget.duration;
                  setDuration(isFinite(d) ? d : 0);
                }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onError={(e) => {
                  const el = e.currentTarget;
                  console.error("[kokoro][diag] <audio> error:", {
                    error: el.error,
                    code: el.error?.code,
                    message: el.error?.message,
                    networkState: el.networkState,
                    readyState: el.readyState,
                    src: el.src,
                  });
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  onClick={handlePlayPause}
                  className="h-11 w-11 flex-shrink-0 rounded-full bg-brand text-brand-foreground shadow-brand hover:bg-brand/90"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 translate-x-[1px]" />
                  )}
                </Button>

                <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {fmt(currentTime)}
                </span>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={duration > 0 ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  aria-label="Seek"
                  className="flex-1 h-1 cursor-pointer"
                  style={{ accentColor: "var(--brand, #7c3aed)" }}
                />

                <span className="w-10 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                  {fmt(duration)}
                </span>

                <a
                  href={audioUrl}
                  download={`racira-tts-output.${format === "wav" ? "wav" : "mp3"}`}
                  data-testid="tts-download"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 text-sm font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
