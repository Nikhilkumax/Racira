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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Download, Trash2, Loader2, HardDriveDownload, X } from "lucide-react";
import {
  VOICE_LANGUAGES,
  DEFAULT_VOICE_ID,
  findVoice,
  isFeaturedVoice,
  voicesForLanguage,
} from "@/domains/voice/lib/voiceCatalog";
import {
  generateSpeech,
  deleteStoredVoice,
  clearStoredVoices,
  scheduleVoicePrefetch,
  toUserFacingError,
  PART_MAX_CHARS,
  type SpeechFormat,
  type SpeechProgress,
} from "@/domains/voice/lib/piperEngine";
// Reading what is cached is a directory listing, not engine work, so it lives
// in its own module — loading it must never pull the speech engine into the
// page bundle.
import { listStoredVoices } from "@/domains/voice/lib/voiceStorage";
import { chunkText } from "@/domains/voice/lib/textChunker";
import { cn } from "@/lib/utils";

// Hard cap on a single submission. Longer text is not rejected up to this
// point — it is split on sentence boundaries and generated part by part — so
// this ceiling bounds the total wait rather than preventing truncation.
const MAX_INPUT_CHARS = 5000;

type Gender = "male" | "female";

export function SpeechStudio() {
  // Defaults: English (US) / Male / Ryan / MP3.
  const [language, setLanguage] = useState<string>(VOICE_LANGUAGES[0].code);
  const [gender, setGender] = useState<Gender>("male");
  const [voice, setVoice] = useState<string>(DEFAULT_VOICE_ID);
  const [format, setFormat] = useState<SpeechFormat>("mp3");
  const [text, setText] = useState("");

  const [status, setStatus] = useState<"idle" | "loading-model" | "generating" | "error">("idle");
  const [progress, setProgress] = useState<SpeechProgress | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Voices already downloaded to this device, so a visitor can see what is
  // cached and reclaim the space. Read from local storage only — the list is
  // never uploaded and is empty when storage is unavailable.
  const [storedVoices, setStoredVoices] = useState<string[]>([]);

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

  useEffect(() => {
    let active = true;
    listStoredVoices().then((ids) => {
      if (active) setStoredVoices(ids);
    });
    return () => {
      active = false;
    };
  }, []);

  // Idle-time prefetch of the featured default voice, so the common first run
  // does not also pay for a model download. Deliberately stateless: it renders
  // nothing, reports nothing, and a failure is invisible by design — the first
  // real generation simply downloads on demand behind the existing progress
  // bar. Returning the cleanup cancels a prefetch that has not started yet.
  useEffect(() => scheduleVoicePrefetch(DEFAULT_VOICE_ID), []);

  // Autoplay each newly generated clip. A rejected play() (browser autoplay
  // policy) is non-fatal — the play button is right there — so it is logged
  // rather than surfaced as a generation error.
  useEffect(() => {
    if (!audioUrl) return;
    audioRef.current?.play().catch((err) => console.error("[voice] play() rejected:", err));
  }, [audioUrl]);

  // Gender filters the voice list. A language with no voice of the selected
  // gender (several ship only one voice) falls back to all of that language's
  // voices, so the dropdown is never empty.
  const languageVoices = voicesForLanguage(language);
  const maleAvailable = languageVoices.some((v) => v.gender === "male");
  const femaleAvailable = languageVoices.some((v) => v.gender === "female");
  const genderVoices = languageVoices.filter((v) => v.gender === gender);
  const availableVoices = genderVoices.length > 0 ? genderVoices : languageVoices;
  const selectedVoice = findVoice(voice);

  // A language switch re-evaluates gender availability for that language and
  // re-picks a sensible default voice: first match for the current gender, or
  // the first voice overall when the gender has none there. A language that
  // lacks the chosen gender flips the gender to one it has, rather than
  // leaving a selectable-but-useless value in the field.
  const handleLanguageChange = (code: string) => {
    const nextVoices = voicesForLanguage(code);
    let nextGender = gender;
    if (nextVoices.length > 0 && !nextVoices.some((v) => v.gender === gender)) {
      nextGender = nextVoices[0].gender;
      setGender(nextGender);
    }
    setLanguage(code);
    const firstMatch = nextVoices.find((v) => v.gender === nextGender) ?? nextVoices[0];
    if (firstMatch) setVoice(firstMatch.id);
  };

  const handleGenderChange = (next: Gender) => {
    setGender(next);
    const firstMatch = languageVoices.find((v) => v.gender === next) ?? languageVoices[0];
    if (firstMatch) setVoice(firstMatch.id);
  };
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const overLimit = charCount > MAX_INPUT_CHARS;

  // Planned part count for the current text, shown before generation starts so
  // the wait is never a surprise. Runs the real chunker rather than dividing by
  // the limit, so the estimate matches what generation will actually do.
  // Memoised because chunking 5000 characters on every keystroke is wasteful
  // even though it is fast.
  const plannedParts = useMemo(() => {
    if (overLimit) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return chunkText(trimmed, PART_MAX_CHARS).length;
  }, [text, overLimit]);

  const refreshStoredVoices = () => {
    listStoredVoices().then(setStoredVoices);
  };

  const handleGenerate = async () => {
    if (!voice || !text.trim() || overLimit || busy) return;

    setStatus("loading-model");
    setProgress(null);
    setLoadError(null);

    try {
      const result = await generateSpeech({
        text: text.trim(),
        voiceId: voice,
        format,
        // The engine's phase stream drives the status machine: model download
        // is the loading branch, synthesis and assembly are the generating
        // branch (the stepped part bar). Without this, synthesis runs entirely
        // under "Preparing voice..." and the per-part progress never shows.
        onProgress: (p) => {
          setProgress(p);
          setStatus(p.phase === "loading" ? "loading-model" : "generating");
        },
      });

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(result.blob);
      objectUrlRef.current = url;

      // Reset playback state for the new clip; the <audio> element picks up the
      // new src and reports its own duration via onLoadedMetadata.
      setCurrentTime(0);
      setDuration(0);
      setAudioUrl(url);
      setStatus("idle");
      setProgress(null);

      // The first generation for this voice downloaded and stored its model.
      refreshStoredVoices();
    } catch (err) {
      // Console only. Whatever was thrown is developer text — it can name the
      // library, a model host, or a runtime internal — and none of that belongs
      // on screen. What is rendered is written for a visitor.
      console.error("[voice] generation failed:", err);
      setLoadError(toUserFacingError(err));
      setStatus("error");
      setProgress(null);

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

  const handleRemoveStoredVoice = async () => {
    await deleteStoredVoice(voice);
    refreshStoredVoices();
  };

  const handleClearStoredVoices = async () => {
    await clearStoredVoices();
    setStoredVoices([]);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
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

  const handleClearText = () => {
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

  // Everything is frozen while a run is in flight — including the text and the
  // language/voice pickers. A mid-run language change would repoint the voice
  // list at a model that is not the one being synthesized.
  const busy = status === "loading-model" || status === "generating";

  const canGenerate =
    Boolean(voice) && Boolean(text.trim()) && !overLimit && !busy;

  const voiceIsStored = storedVoices.includes(voice);

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
                  onClick={handleClearText}
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
                  <p role="alert" data-testid="tts-limit-warning" className="w-full text-destructive">
                    Too long by {(charCount - MAX_INPUT_CHARS).toLocaleString()}{" "}
                    {charCount - MAX_INPUT_CHARS === 1 ? "character" : "characters"}. Text is
                    generated in parts, and past {MAX_INPUT_CHARS.toLocaleString()} characters the
                    wait becomes impractical. Shorten it, or split it into separate clips.
                  </p>
                ) : (
                  plannedParts > 1 && (
                    <p
                      data-testid="tts-chunk-estimate"
                      aria-live="polite"
                      className="w-full text-muted-foreground"
                    >
                      Generates in {plannedParts} parts.
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

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">
                  Language
                </Label>
                <Select value={language} onValueChange={handleLanguageChange} disabled={busy}>
                  <SelectTrigger className="w-full h-11 rounded-xl" data-testid="language-select">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(v) => handleGenderChange(v as Gender)}
                  disabled={busy}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl" data-testid="gender-select">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" disabled={!maleAvailable}>
                      Male
                    </SelectItem>
                    <SelectItem value="female" disabled={!femaleAvailable}>
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">Voice</Label>
                <Select value={voice} onValueChange={setVoice} disabled={busy}>
                  <SelectTrigger className="w-full h-11 rounded-xl" data-testid="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {isFeaturedVoice(v.id) ? `${v.name} — ${v.qualityLabel} ★` : `${v.name} — ${v.qualityLabel}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* What is already on this device. Shown only for a voice that
                    has been downloaded, so first-time visitors see nothing. */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground" data-testid="tts-stored-voices">
                  {voiceIsStored ? (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <HardDriveDownload className="h-3.5 w-3.5" />
                        Saved on this device — ready offline.
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveStoredVoice}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </button>
                    </>
                  ) : (
                    <span>
                      {selectedVoice
                        ? "First use downloads this voice to your device; later runs are offline."
                        : "\u00a0"}
                    </span>
                  )}
                  {storedVoices.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearStoredVoices}
                      disabled={busy}
                      className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
                    >
                      Clear all saved voices ({storedVoices.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">Format</Label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as SpeechFormat)}
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
                      <span>{progress?.phase === "loading" ? "Preparing voice..." : "Starting..."}</span>
                      <span>
                        {progress?.modelFraction != null
                          ? `${Math.round(progress.modelFraction * 100)}%`
                          : ""}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.round((progress?.fraction ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : status === "generating" ? (
                  progress && progress.totalParts > 1 ? (
                    // Multi-part: a stepped bar rather than a spinner. One step
                    // per completed part, so every visible change corresponds to
                    // real progress instead of an animation that keeps moving
                    // after the page has stopped responding.
                    <div className="space-y-3" data-testid="tts-chunk-progress">
                      <div className="flex items-center justify-between text-[13px]">
                        <span aria-live="polite" className="font-medium">
                          {progress.phase === "assembling"
                            ? "Finishing the clip..."
                            : `Generating part ${progress.part} of ${progress.totalParts}...`}
                        </span>
                        <span className="font-mono tabular-nums text-muted-foreground">
                          {Math.round((progress.fraction ?? 0) * 100)}%
                        </span>
                      </div>
                      <div className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: progress.totalParts }, (_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-2 flex-1 rounded-full",
                              i < progress.part - 1
                                ? "bg-brand"
                                : i === progress.part - 1
                                  ? "bg-brand/40"
                                  : "bg-muted/30",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[12.5px] text-muted-foreground">
                        Parts are generated one after another on your device, then joined into a
                        single file.
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
                  console.error("[voice] <audio> error:", {
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
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
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
                  download={`racira-tts-output.${format}`}
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
