"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Download, Trash2, Loader2 } from "lucide-react";
import {
  KOKORO_VOICES,
  getVoicesGroupedByLanguage,
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
  const [speed, setSpeed] = useState(1);
  const [format, setFormat] = useState<"wav" | "mp3">("wav");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading-model" | "generating" | "error"
  >("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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

  const voiceGroups = getVoicesGroupedByLanguage();
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleGenerate = async () => {
    if (!voice || !text.trim()) return;
    if (status === "loading-model" || status === "generating") return;

    setStatus("loading-model");
    setLoadProgress(0);
    setLoadMessage("");
    setLoadError(null);

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
      setAudioBlob(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audioEl = new Audio(url);
      audioRef.current = audioEl;
      audioEl.playbackRate = 1;

      await audioEl.play().catch(() => {});
    } catch (err: any) {
      const msg = err?.message || String(err);
      setLoadError(
        `Speech generation isn't available in this browser. ${msg}`,
      );
      setStatus("error");
    } finally {
      setStatus("idle");
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
    if (!audioRef.current) return;
    const duration = audioRef.current.duration || 0;
    audioRef.current.currentTime = (Number(e.target.value) / 100) * duration;
  };

  const handleDownload = () => {
    if (!objectUrlRef.current) return;
    const a = document.createElement("a");
    a.href = objectUrlRef.current;
    const ext = format === "wav" ? "wav" : "mp3";
    a.download = `racira-tts-output.${ext}`;
    a.click();
  };

  const handleClear = () => {
    setText("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioBlob(null);
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

              {/* Voice (grouped by language) */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">
                  Voice
                </Label>
                <Select
                  value={voice ?? ""}
                  onValueChange={setVoice}
                  disabled={status === "loading-model"}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceGroups.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.voices.map((v: KokoroVoice) => (
                          <SelectItem key={v.id} value={v.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {v.name} — {v.gender}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
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
                  <SelectTrigger className="w-full h-11 rounded-xl">
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
          {audioBlob && (
            <div className="border-t border-border-subtle bg-surface-muted/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  aria-label={audioRef.current?.paused ? "Play" : "Pause"}
                  onClick={handlePlayPause}
                  className="h-11 w-11 flex-shrink-0 rounded-full bg-brand text-brand-foreground shadow-brand hover:bg-brand/90"
                >
                  {audioRef.current && !audioRef.current.paused ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 translate-x-[1px]" />
                  )}
                </Button>

                <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {audioRef.current ? fmt(audioRef.current.currentTime) : "00:00"}
                </span>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={
                    audioRef.current && audioRef.current.duration > 0
                      ? (audioRef.current.currentTime / audioRef.current.duration) * 100
                      : 0
                  }
                  onChange={handleSeek}
                  aria-label="Seek"
                  className="flex-1 h-1 cursor-pointer"
                  style={{ accentColor: "var(--brand, #7c3aed)" }}
                />

                <span className="w-10 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                  {audioRef.current && isFinite(audioRef.current.duration)
                    ? fmt(audioRef.current.duration)
                    : "00:00"}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-9 gap-2 rounded-full border-border-subtle bg-surface px-3 text-sm font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
