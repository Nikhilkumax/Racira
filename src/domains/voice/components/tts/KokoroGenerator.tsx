"use client";

import { useState, useRef, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import type { RawAudio } from "@huggingface/transformers";

interface ModelProgress {
  status?: string;
  progress?: number;
  name?: string;
  loaded?: number;
  total?: number;
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
  // can still press play, so we swallow it rather than surfacing an error.
  useEffect(() => {
    if (!audioUrl) return;
    audioRef.current?.play().catch(() => {});
  }, [audioUrl]);

  useEffect(() => {
    const filtered = KOKORO_VOICES.filter((v) => v.language === language);
    if (filtered.length > 0 && !filtered.some((v) => v.id === voice)) {
      setVoice(filtered[0].id);
    }
  }, [language, voice]);

  const filteredVoices = KOKORO_VOICES.filter((v) => v.language === language);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleGenerate = async () => {
    if (!voice || !text.trim()) return;
    if (status === "loading-model" || status === "generating") return;

    setStatus("loading-model");
    setLoadProgress(0);
    setLoadMessage("");
    setLoadError(null);

    console.log("[kokoro] handleGenerate called, voice:", voice, "text length:", text.length);
    console.log("[kokoro] calling getKokoroEngine...");

    try {
      const tts = await getKokoroEngine((info: unknown) => {
        const e = info as ModelProgress;
        if (typeof e.progress === "number") {
          setLoadProgress(Math.round(e.progress * 100));
        }
        if (e.status) setLoadMessage(e.status);
      });

      setStatus("generating");

      const audio = await tts.generate(text, {
        voice: voice as any,
        speed: speed,
      });

      const blob = await toOutputBlob(audio, format);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      // Reset playback state for the new clip; the <audio> element picks up
      // the new src and reports its own duration via onLoadedMetadata.
      setCurrentTime(0);
      setDuration(0);
      setAudioUrl(url);

      setStatus("idle");
    } catch (err: any) {
      const msg = err?.message || String(err);
      setLoadError(
        `Speech generation isn't available in this browser. ${msg}`,
      );
      setStatus("error");
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
    voice && text.trim() && status !== "loading-model" && status !== "generating";

  const selectedVoice = KOKORO_VOICES.find((v) => v.id === voice) ?? null;

  return (
    <section className="racira-page-container pb-8 pt-8">
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
                  placeholder="Enter the text you want to convert to speech..."
                  className={cn(
                    "h-[460px] w-full resize-none rounded-xl border-0 bg-transparent p-3 text-[15.5px] leading-relaxed shadow-none",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                  )}
                />
              </div>

              <div className="px-5 pb-4 text-[13px] text-muted-foreground">
                {wordCount} {wordCount === 1 ? "word" : "words"}
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
                      disabled={status === "loading-model"}
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
                      disabled={status === "loading-model"}
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
                  disabled={status === "loading-model" || status === "generating"}
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
                  disabled={status === "loading-model" || status === "generating"}
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
              <div className="mt-auto">
                {status === "error" && loadError ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {loadError}
                  </div>
                ) : status === "loading-model" ? (
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
                  <Button
                    disabled
                    className="w-full h-11 rounded-full bg-brand text-brand-foreground font-semibold"
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </Button>
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
