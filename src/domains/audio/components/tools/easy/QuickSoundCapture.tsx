"use client";

/**
 * Quick Sound Capture — record whatever is playing in a browser tab.
 *
 * Same shared RecorderToolShell as Voice Memo, pointed at tab/system audio via
 * getDisplayMedia (audio-only output; the video track exists only because
 * Chrome requires it to offer tab audio, and is stopped immediately).
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

export default function QuickSoundCapture() {
  return (
    <RecorderToolShell
      source="display"
      filePrefix="sound-capture"
      hint="When the browser asks what to share, pick the tab that is playing audio and enable “Also share tab audio”. Recording starts as soon as you confirm."
    />
  );
}
