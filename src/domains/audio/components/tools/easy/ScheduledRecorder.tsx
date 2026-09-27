"use client";

/**
 * Scheduled Recorder — arms a recording with a countdown, then hands the
 * lifecycle to the shared shell (mic → MediaRecorder → 16-bit WAV).
 * Auto-stop makes it a self-contained "record the 19:00 call for 60
 * minutes" tool. The countdown/auto-stop lifecycle lives in the shared
 * RecorderToolShell (countdownSec / maxDurationSec props).
 */

import { useState } from "react";
import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function ScheduledRecorder() {
  const [countdown, setCountdown] = useState(10);
  const [duration, setDuration] = useState(300);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Start delay: {countdown} s</span>
          <input
            type="range"
            min={3}
            max={60}
            step={1}
            value={countdown}
            onChange={(e) => setCountdown(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Auto-stop after: {duration < 60 ? `${duration} s` : `${Math.round((duration / 60) * 10) / 10} min`}
          </span>
          <input
            type="range"
            min={15}
            max={3600}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <RecorderToolShell
        source="mic"
        filePrefix="scheduled-recording"
        countdownSec={countdown}
        maxDurationSec={duration}
        hint={`Press arm — recording starts after a ${countdown} s countdown and stops automatically at ${Math.round((duration / 60) * 10) / 10} min. Keep this tab visible.`}
      />
    </div>
  );
}
