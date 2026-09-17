"use client";

/**
 * Voice Memo — record straight from the microphone into a downloadable WAV.
 *
 * Pure browser capture via the shared RecorderToolShell (mic source →
 * MediaRecorder → decode → 16-bit WAV). No processing, so verification here
 * is the recorded duration/channels matching what the mic actually produced,
 * plus real downloads.
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function VoiceMemo() {
  return (
    <RecorderToolShell
      source="mic"
      filePrefix="voice-memo"
      hint="Recording starts right after you allow microphone access."
    />
  );
}
