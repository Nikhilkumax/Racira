"use client";

/**
 * System Audio Recorder — record everything your computer is playing into a
 * WAV via the shared RecorderToolShell display path (screen-share with
 * audio; the video track is dropped immediately). Browser support: Chrome
 * and Edge on Windows offer the whole-screen option whose audio is system
 * output; macOS browsers can only share tab audio.
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function SystemAudioRecorder() {
  return (
    <RecorderToolShell
      source="display"
      filePrefix="system-recording"
      hint="In the share dialog choose an entire screen (Chrome/Edge on Windows) so the recording captures all system sound, not one app."
    />
  );
}
