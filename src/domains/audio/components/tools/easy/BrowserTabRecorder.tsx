"use client";

/**
 * Browser Tab Recorder — capture the audio of one browser tab into a WAV
 * (the shared RecorderToolShell display path; the video track is requested
 * only so Chrome offers "share tab audio", then dropped immediately).
 * Distinct from System Audio Recorder in framing: this records one specific
 * tab's audio, not the whole machine's output.
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function BrowserTabRecorder() {
  return (
    <RecorderToolShell
      source="display"
      filePrefix="tab-recording"
      hint="In the share dialog pick a tab and enable “Also share tab audio” — only that tab's sound is recorded, even if you switch tabs."
    />
  );
}
