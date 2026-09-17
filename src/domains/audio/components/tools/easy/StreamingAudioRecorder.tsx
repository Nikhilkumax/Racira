"use client";

/**
 * Streaming Audio Recorder — capture audio from a streaming service or any
 * web player into a WAV via the shared RecorderToolShell display path.
 * Functionally it is tab capture; the tool exists to frame that job (pick
 * the tab that is playing, enable its audio, record as long as the stream
 * runs) and to carry the fair-use reminder: record only what you have the
 * right to record — DRM-protected streams stay DRM-protected, and personal
 * recordings are not a license to redistribute.
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function StreamingAudioRecorder() {
  return (
    <RecorderToolShell
      source="display"
      filePrefix="stream-recording"
      hint="In the share dialog pick the tab playing the stream and enable “Also share tab audio”. Record only content you have the right to record."
    />
  );
}
