"use client";

/**
 * Left/Right Channel Swapper — exchanges the two channels (checks for flipped
 * recordings). applyChannelMatrix(0,1,1,0) — Node-verified swap-exact.
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyChannelMatrix } from "@/domains/audio/lib/edit";

export default function LeftRightChannelSwapper() {
  return (
    <EditToolShell
      outputSuffix="-swapped.wav"
      minChannels={2}
      transform={({ channels, sampleRate }) => {
        const [L, R] = applyChannelMatrix(channels, 0, 1, 1, 0);
        return { channels: [L, R], sampleRate, length: L.length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Every sample of the left channel moves to the right and vice versa — nothing else changes.
        </p>
      }
    >
      <p className="text-sm text-muted-foreground">
        Drop a stereo file and download the swapped version. Use it if your headphones feel
        &ldquo;inside out&rdquo; on a known-good recording, or to fix a mislabeled capture.
      </p>
    </EditToolShell>
  );
}
