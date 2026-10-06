"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Download, Trash2, HardDriveDownload, X } from "lucide-react";
import {
  VOICE_LANGUAGES,
  DEFAULT_VOICE_ID,
  findVoice,
  voicesForLanguage,
  type VoiceOption,
} from "@/domains/voice/lib/voiceCatalog";
import {
  SPEED_BADGE,
  LONG_TEXT_MIN_CHARS,
  LONG_TEXT_TIP,
  RECOMMENDED_LABEL,
  RECOMMENDED_MARK,
  estimateSeconds,
  formatEstimateSeconds,
  groupVoicesByGender,
  isRecommendedVoice,
  resolveSelection,
  sortVoices,
  voiceLabelText,
} from "@/domains/voice/lib/voicePresentation";
import {
  cancelSpeech,
  generateSpeech,
  deleteStoredVoice,
  clearStoredVoices,
  scheduleVoicePrefetch,
  SpeechCancelledError,
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

/**
 * One voice as the picker shows it: its label, plus the recommended mark when
 * it has one.
 *
 * The mark is an element rather than a character in the label string so it can
 * carry an accessible name: the star is a glyph, and a screen reader reading
 * the list would otherwise announce a symbol with no meaning or skip it
 * entirely. `role="img"` is what makes the label count, and it does not change
 * how the mark looks.
 */
function VoiceOptionLabel({ voice }: { voice: VoiceOption }) {
  return (
    <>
      {voiceLabelText(voice)}
      {isRecommendedVoice(voice) && (
        <>
          {" "}
          <span role="img" aria-label={RECOMMENDED_LABEL}>
            {RECOMMENDED_MARK}
          </span>
        </>
      )}
    </>
  );
}

export function SpeechStudio() {
  // Defaults: English (US) / Ryan (the middle quality tier) / MP3.
  const [language, setLanguage] = useState<string>(VOICE_LANGUAGES[0].code);
  const [voice, setVoice] = useState<string>(DEFAULT_VOICE_ID);
  // MP3 by default. It costs a client-side re-encode that the natively emitted
  // WAV does not, but the encoder runs in the worker rather than on the page and
  // the resulting file is a fraction of the size, which is what most visitors
  // want out of a voiceover. Nothing about the choice is persisted, so WAV is
  // never more than one selection away on any visit.
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

  // Voices are filtered by language only, and always in the picker's own order:
  // recommended first, then by gender, quality and name. A long language is
  // grouped instead of flattened so it stays scannable; the label carries the
  // gender either way.
  const languageVoices = useMemo(
    () => sortVoices(voicesForLanguage(language)),
    [language],
  );
  const voiceGroups = useMemo(() => groupVoicesByGender(languageVoices), [languageVoices]);

  // The selection is derived rather than merely stored: `voice` holds the last
  // explicit pick, and any pick this language cannot offer resolves to the
  // language's default. That is what keeps the select from ever holding a stale
  // value, and what makes a single-voice language select its voice with no
  // extra state and no layout change — the dropdown stays rendered either way.
  const selectedVoiceId = resolveSelection(languageVoices, voice);
  const selectedVoice = findVoice(selectedVoiceId);

  // A language switch keeps the current voice when the new language offers it,
  // and otherwise takes that language's first recommended (or best) voice.
  const handleLanguageChange = (code: string) => {
    const nextVoices = sortVoices(voicesForLanguage(code));
    setLanguage(code);
    setVoice(resolveSelection(nextVoices, voice));
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  // Characters that will actually be synthesized: the same trim the engine
  // applies, so the estimate describes the work and not the whitespace.
  const synthChars = text.trim().length;
  const hasText = synthChars > 0;
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
    if (!selectedVoiceId || !text.trim() || overLimit || busy) return;

    setStatus("loading-model");
    setProgress(null);
    setLoadError(null);

    try {
      const result = await generateSpeech({
        text: text.trim(),
        voiceId: selectedVoiceId,
        format,
        // The engine's phase stream drives the status machine: model download
        // is the loading branch, synthesis and assembly are the generating
        // branch. Without this, synthesis runs entirely under the preparing
        // label and the progress bar never moves.
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
      // A stop the visitor asked for is not a failure: cancel already returned
      // the page to idle, so there is nothing to report and nothing to undo.
      if (err instanceof SpeechCancelledError) return;

      // Console only. Whatever was thrown is developer text — it can name the
      // library, a model host, or a runtime internal — and none of that belongs
      // on screen. What is rendered is written for a visitor.
      console.error("[voice] generation failed:", err);
      setLoadError(toUserFacingError(err));
      setStatus("error");
      setProgress(null);

      // Drop any previously generated clip. Nothing partial was ever assigned
      // to audioUrl, but leaving an older clip in the player directly beneath
      // an error invites reading it as the partial result of the run that just
      // failed.
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

  const handleCancel = () => {
    // Unlocks immediately; the abandoned run's rejection is swallowed in
    // handleGenerate, so a cancel never renders an error.
    cancelSpeech();
    setStatus("idle");
    setProgress(null);
  };

  const handleRemoveStoredVoice = async () => {
    await deleteStoredVoice(selectedVoiceId);
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
  // language/voice/format pickers. A mid-run language change would repoint the
  // voice list at a model that is not the one being synthesized.
  const busy = status === "loading-model" || status === "generating";

  const canGenerate = Boolean(selectedVoiceId) && hasText && !overLimit && !busy;

  const voiceIsStored = storedVoices.includes(selectedVoiceId);

  // ── Progress and time estimates ────────────────────────────────────────

  // A first run downloads the voice model before it synthesizes anything, so
  // that download is its own phase with its own percentage. The engine reports
  // it as a fraction of the bytes fetched, and a cached model reports nothing —
  // so this is null on every run after the first.
  const downloadFraction = progress?.phase === "loading" ? progress.modelFraction : null;
  const downloading = downloadFraction != null;

  // Percentage is completed parts over total parts. The engine reports the
  // 1-based part it is about to synthesize, so a part is complete only when the
  // next one begins; assembly is the last part finishing.
  const totalParts = progress?.totalParts ?? plannedParts;
  const completedParts = progress
    ? progress.phase === "assembling"
      ? progress.totalParts
      : Math.max(0, progress.part - 1)
    : 0;
  const generationPercent =
    totalParts > 0 ? Math.min(100, Math.round((completedParts / totalParts) * 100)) : 0;
  const percent = downloading ? Math.round((downloadFraction ?? 0) * 100) : generationPercent;

  // Three labels, not two: the engine reports "loading" before its first byte
  // arrives, and that window is a genuine third state — a cached voice passes
  // through it instantly, a new one sits there while the request is set up. It
  // is only called a download once there are bytes to count, so a cached run
  // never claims to be downloading anything.
  //
  // The run's own status answers for the window before the engine's first
  // report: the bar is shown the moment a run starts, and a label derived only
  // from the progress stream would call those first frames "Generating audio…"
  // while nothing is being synthesized yet.
  const progressLabel = downloading
    ? "Downloading voice…"
    : status === "loading-model"
      ? "Preparing voice…"
      : "Generating audio…";

  // Whole-text estimate for the selected voice, and what is left of it once
  // some parts are done. Rounded coarsely by formatEstimateSeconds, and always
  // introduced with "About": the per-1000-character figure is a placeholder and
  // the real cost depends on the machine.
  const totalEstimateSeconds = estimateSeconds(synthChars, selectedVoice);
  const remainingSeconds =
    totalParts > 0
      ? Math.max(1, Math.round(totalEstimateSeconds * (1 - completedParts / totalParts)))
      : Math.max(1, Math.round(totalEstimateSeconds));
  const timeLeftLabel = downloading
    ? "Keep this tab open."
    : `About ${formatEstimateSeconds(remainingSeconds)} s left. Keep this tab open.`;

  // Long text read by the slow speed tier is the one combination worth warning
  // about. Keyed off the tier, never off the badge's wording, so rewording the
  // badge cannot switch the tip on or off.
  const showLongTextTip = synthChars >= LONG_TEXT_MIN_CHARS && selectedVoice?.speed === "slow";

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

              {/* 1. Language */}
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

              {/* 2. Voice — every voice for the language, no gender filter */}
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-muted-foreground">Voice</Label>
                <Select value={selectedVoiceId} onValueChange={setVoice} disabled={busy}>
                  <SelectTrigger className="w-full h-11 rounded-xl" data-testid="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceGroups
                      ? voiceGroups.map((group) => (
                          <SelectGroup key={group.label}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {group.voices.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                <VoiceOptionLabel voice={v} />
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))
                      : languageVoices.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            <VoiceOptionLabel voice={v} />
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>

                {/* Speed and what the text will cost in time. Both update as
                    the voice or the text changes. The badge is wide enough that
                    it and the estimate share a line only on a wide panel, so
                    the row wraps and the estimate drops below the badge when it
                    has to — never squeezed, never clipped. */}
                <div
                  className="space-y-1 text-[12.5px] text-muted-foreground"
                  data-testid="tts-voice-hint"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {selectedVoice && (
                      <span
                        data-testid="tts-speed-badge"
                        className="inline-flex items-center rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 font-medium text-foreground"
                      >
                        {SPEED_BADGE[selectedVoice.speed]}
                      </span>
                    )}
                    {hasText && selectedVoice && (
                      <span data-testid="tts-time-estimate" aria-live="polite">
                        About{" "}
                        {formatEstimateSeconds(estimateSeconds(synthChars, selectedVoice))} s for
                        your text
                      </span>
                    )}
                  </div>

                  {/* What is already on this device, and only that. The list is
                      read from local storage, never uploaded. */}
                  <div
                    data-testid="tts-stored-voices"
                    className="flex flex-wrap items-center gap-x-2 gap-y-1"
                  >
                    {voiceIsStored && (
                      <>
                        <span className="inline-flex items-center gap-1.5">
                          <HardDriveDownload className="h-3.5 w-3.5" />
                          Saved on this device.
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
                    )}
                  </div>

                  {showLongTextTip && (
                    <p data-testid="tts-long-text-tip">{LONG_TEXT_TIP}</p>
                  )}

                  {storedVoices.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearStoredVoices}
                      disabled={busy}
                      className="block rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
                    >
                      Clear all saved voices ({storedVoices.length})
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Format */}
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

              {/* 4. Generate / progress / error */}
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

                {busy ? (
                  // One bar for the whole run: a first-use download is its own
                  // phase, then the parts. The percentage is completed parts
                  // over total parts, so every visible change corresponds to
                  // work that actually finished rather than an animation.
                  <div className="space-y-3" data-testid="tts-generation-progress">
                    <div aria-live="polite" className="space-y-1">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium" data-testid="tts-progress-label">
                          {progressLabel}
                        </span>
                        <span
                          data-testid="tts-progress-percent"
                          className="font-mono tabular-nums text-muted-foreground"
                        >
                          {percent}%
                        </span>
                      </div>
                      <p data-testid="tts-time-left" className="text-[12.5px] text-muted-foreground">
                        {timeLeftLabel}
                      </p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className="h-full bg-brand transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        data-testid="tts-cancel"
                        className="h-9 rounded-full px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
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
              {/* Two rows below sm, one row from sm up. On a narrow screen the
                  transport (play, elapsed time, seek, duration) takes the first
                  row and the actions take the second, so the row is never wider
                  than the card. The seek input carries min-w-0 on purpose: a
                  range input has an intrinsic width and is otherwise treated as
                  unshrinkable, which is what pushed it and the buttons past the
                  card's right edge on mobile. */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
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
                    className="h-1 min-w-0 flex-1 cursor-pointer"
                    style={{ accentColor: "var(--brand, #7c3aed)" }}
                  />

                  <span className="w-10 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                    {fmt(duration)}
                  </span>
                </div>

                {/* Actions: a full-width row on mobile, a right-hand item in
                    the single row from sm up. The 40px height keeps the touch
                    target comfortable; desktop keeps its original 36px pill. */}
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap">
                  <a
                    href={audioUrl}
                    download={`racira-tts-output.${format}`}
                    data-testid="tts-download"
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface px-4 text-sm font-semibold sm:h-9 sm:flex-none sm:px-3"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
