"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { TextPanel } from "./TextPanel";
import { AudioPlayer } from "./AudioPlayer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { curatedVoices } from "@/utils/curated-voices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const MAX_CHARS = 5000;
const SAMPLE =
  "Welcome to Racira TTS — turn any text into a natural, expressive voice in seconds using the Web Speech API.";

export function StudioCard() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useLocalStorage<string>("racira-tts-text", SAMPLE);
  const [selectedVoice, setSelectedVoice] = useState(curatedVoices[0]);
  const [speed, setSpeed] = useState(1.0);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lastVoiceId, setLastVoiceId] = useState<string | null>(null);
  const [voiceChanged, setVoiceChanged] = useState(false);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "downloading" | "playing" | "paused" | "done" | "error">("loading");

  const workerRef = useRef<Worker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize worker
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../../workers/tts-worker.js', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const data = e.data;
        if (data.status === 'ready') {
          setStatus("idle");
        } else if (data.status === 'complete') {
          setIsGenerating(false);
          if (data.audio) {
            const url = URL.createObjectURL(data.audio);
            setAudioUrl(url);
          }
        } else if (data.status === 'error') {
          toast.error("Generation error: " + data.data);
          setIsGenerating(false);
          setStatus("error");
        }
      };

      worker.onerror = (err) => {
        console.error("Worker error:", err);
        setIsGenerating(false);
        setStatus("error");
      };

      worker.postMessage({ type: 'init' });

      return () => {
        worker.terminate();
      };
    } catch (err) {
      console.error("Failed to initialize worker:", err);
      setStatus("error");
    }
  }, []);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track voice changes
  useEffect(() => {
    if (hasGenerated && selectedVoice.id !== lastVoiceId) {
      setVoiceChanged(true);
    }
  }, [selectedVoice.id, hasGenerated, lastVoiceId]);

  // Audio playback synchronization
  useEffect(() => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setStatus("done");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    setStatus("playing");
    audio.play().catch((e) => console.log("Auto-play prevented:", e));

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const trimmedText = text.trim();
  const isOverLimit = trimmedText.length > MAX_CHARS;
  const isReady =
    hasGenerated &&
    (status === "playing" ||
      status === "paused" ||
      status === "done");

  const handleGenerate = async () => {
    if (!trimmedText) {
      toast.warning("Please enter some text first.");
      return;
    }
    if (isOverLimit) {
      toast.warning(
        `Text exceeds ${MAX_CHARS.toLocaleString()} character limit. Please shorten your text.`,
      );
      return;
    }

    setIsGenerating(true);
    setHasGenerated(true);
    setLastVoiceId(selectedVoice.id);
    setVoiceChanged(false);

    // Call Piper worker
    workerRef.current?.postMessage({
      type: 'generate',
      text: text,
      voiceId: selectedVoice.originalKey,    // 'en_US-lessac-medium'
      speakerId: selectedVoice.speakerId,    // 0, 15, 23, etc.
      voice: selectedVoice.speakerId,        // for tts-worker speakerId key compatibility
      speed: speed,
    });
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setStatus("playing");
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus("paused");
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus("done");
    setCurrentTime(0);
  };

  const handleSeek = (fraction: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = fraction * duration;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `racira-tts-${selectedVoice.displayName}-${Date.now()}.wav`;
    a.click();
  };

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-7xl h-[600px] animate-pulse rounded-3xl bg-muted/20 border border-border-subtle" />
    );
  }

  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      className="mx-auto w-full max-w-7xl scroll-mt-24"
    >
      <div className="rounded-3xl border border-border-subtle bg-gradient-card shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          {/* LEFT */}
          <div className="border-b border-border-subtle lg:border-b-0 lg:border-r">
            <h2 id="studio-title" className="sr-only">
              Racira TTS Studio
            </h2>
            <TextPanel
              value={text}
              onChange={setText}
            />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Voice options
              </h3>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-muted-foreground block mb-2">
                Voice
              </Label>
              <Select
                value={selectedVoice.id}
                onValueChange={(value) => {
                  const voice = curatedVoices.find(v => v.id === value);
                  if (voice) setSelectedVoice(voice);
                }}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue>
                    {selectedVoice.name} - {selectedVoice.personality}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {curatedVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} - {voice.personality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-muted-foreground block mb-2">
                Speed
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {speed.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 pt-1">
              <div className="text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground">{trimmedText ? trimmedText.split(/\s+/).length : 0}</span> words
                <span className="mx-2 opacity-30">|</span>
                <span className={cn(isOverLimit ? "text-destructive font-semibold" : "text-muted-foreground")}>
                  {trimmedText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
              <div className="w-full sm:w-64">
                <Button 
                  onClick={handleGenerate}
                  disabled={!trimmedText || isOverLimit || isGenerating}
                  className="w-full h-11 bg-brand text-brand-foreground hover:bg-brand/90 flex items-center justify-center gap-2 rounded-full font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Generating...
                    </>
                  ) : (hasGenerated || voiceChanged) ? (
                    'Regenerate'
                  ) : (
                    'Generate Audio'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AudioPlayer
          status={status}
          currentTime={currentTime}
          duration={duration}
          speed={speed}
          isReady={isReady}
          recorderSupported={true}
          recorderReason=""
          isDownloading={false}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onReplay={handleGenerate}
          onSpeedChange={setSpeed}
          onSeek={handleSeek}
          onDownload={handleDownload}
        />
      </div>
    </section>
  );
}
