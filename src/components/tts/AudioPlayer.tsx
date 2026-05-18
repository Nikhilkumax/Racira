"use client";

import { Pause, Play, Download, Loader2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SpeechStatus } from "@/lib/tts/useRaciraSpeech";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  status: SpeechStatus;
  currentTime: number;
  duration: number;
  speed: number;
  isReady: boolean;
  recorderSupported: boolean;
  recorderReason?: string;
  isDownloading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReplay: () => void;
  onSpeedChange: (s: number) => void;
  onSeek: (frac: number) => void;
  onDownload: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer(p: AudioPlayerProps) {
  const playing = p.status === "playing";
  const loading = p.status === "loading" || p.status === "downloading";
  const canPlay = p.status === "paused" || p.status === "done" || p.status === "idle";
  const progress = p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;

  const handlePlayPause = () => {
    if (playing) {
      p.onPause();
    } else if (canPlay) {
      p.onPlay();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fraction = Number(e.target.value) / 100;
    p.onSeek(fraction);
  };

  const handleSpeedClick = () => {
    const currentIndex = SPEEDS.indexOf(p.speed);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    p.onSpeedChange(SPEEDS[nextIndex]);
  };

  return (
    <div className="border-t border-border-subtle bg-surface-muted/40 px-5 py-4">
      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <Button
          type="button"
          size="icon"
          disabled={loading || p.status === "idle"}
          aria-label={playing ? "Pause" : "Play"}
          onClick={handlePlayPause}
          className={cn(
            "h-11 w-11 flex-shrink-0 rounded-full bg-brand text-brand-foreground shadow-brand hover:bg-brand/90",
            "disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
          )}
        >
          {loading
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : playing
            ? <Pause className="h-5 w-5" />
            : <Play className="h-5 w-5 translate-x-[1px]" />}
        </Button>

        {/* Current time */}
        <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
          {fmt(p.currentTime)}
        </span>

        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={handleSeek}
          disabled={!p.isReady}
          aria-label="Seek"
          className="flex-1 h-1 cursor-pointer accent-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ accentColor: "var(--brand, #7c3aed)" }}
        />

        {/* Duration */}
        <span className="w-10 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
          {fmt(p.duration)}
        </span>

        {/* Speed cycle button */}
        <button
          type="button"
          onClick={handleSpeedClick}
          className="flex min-w-[44px] items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-sm font-medium hover:bg-surface-muted transition-colors"
        >
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          {p.speed}x
        </button>

        {/* Download button */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={p.onDownload}
                  disabled={!p.isReady || !p.recorderSupported || p.isDownloading}
                  className="h-9 gap-2 rounded-full border-border-subtle bg-surface px-3 text-sm font-semibold"
                >
                  {p.isDownloading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Download className="h-3.5 w-3.5" />}
                  Download
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[260px] text-center">
              {p.recorderSupported
                ? "Download the generated audio file."
                : (p.recorderReason ?? "Download available after generation.")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
