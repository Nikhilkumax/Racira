"use client";

/**
 * Interview Recorder — high-quality interview capture: requests the mic at
 * 48 kHz stereo (echo cancellation / noise suppression / auto gain OFF so
 * the raw room is preserved for post production), 24-minute safety
 * auto-stop, via the shared shell.
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

const HQ_CONSTRAINTS: MediaTrackConstraints = {
  channelCount: { ideal: 2 },
  sampleRate: { ideal: 48000 },
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

export default function InterviewRecorder() {
  return (
    <div className="space-y-4">
      <RecorderToolShell
        source="mic"
        audioConstraints={HQ_CONSTRAINTS}
        filePrefix="interview"
        maxDurationSec={1440}
        hint="Records at the mic's best quality (48 kHz stereo requested) with browser processing OFF — echo cancellation, noise suppression and auto gain are disabled so the raw conversation is captured for post-editing. Auto-stops at 24 min as a safety net."
      />
      <p className="text-xs text-muted-foreground">
        Tip: with processing off, room echo and background noise are kept —
        that is the point (you can clean them later with the Noise Reducer and
        Plosive Remover). For quick voice notes use the Voice Recorder instead.
      </p>
    </div>
  );
}
