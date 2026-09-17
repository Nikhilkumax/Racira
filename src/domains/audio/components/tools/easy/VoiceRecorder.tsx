"use client";

/**
 * Voice Recorder — record from the microphone into a downloadable WAV.
 * Shared RecorderToolShell (mic → MediaRecorder → decode → 16-bit WAV).
 * Distinct from Voice Memo only in copy: framed for general-purpose voice
 * recording (notes, dictation, ideas) rather than quick memos.
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function VoiceRecorder() {
  return (
    <RecorderToolShell
      source="mic"
      filePrefix="voice-recording"
      hint="Recording starts right after you allow microphone access. Stop when done — the WAV downloads automatically."
    />
  );
}
