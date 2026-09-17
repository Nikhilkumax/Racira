"use client";

/**
 * Mid-Side Encoder — converts L/R stereo to M/S (mid, side) as stereo WAV.
 *
 * Uses encodeMidSide() (Node-verified): M = (L+R)/2, S = (L−R)/2. The paired
 * Mid-Side Decoder round-trips this exactly — verified by sample diff.
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { encodeMidSide } from "@/domains/audio/lib/edit";

export default function MidSideEncoder() {
  return (
    <EditToolShell
      outputSuffix="-ms-encoded.wav"
      minChannels={2}
      transform={({ channels, sampleRate }) => {
        const [left, right] = channels;
        const { mid, side } = encodeMidSide(left, right);
        return {
          channels: [mid, side],
          sampleRate,
          length: mid.length,
        };
      }}
      footer={
        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          In the output: left channel = mid (mono sum), right channel = side (stereo difference).
          Playing this directly will sound phasey — that's expected. Decode it back with the
          Mid-Side Decoder to recover the original stereo exactly.
        </div>
      }
    >
      <div className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
        Drop a stereo file. The mid channel carries everything common to both sides; the side
        channel carries only the difference. Pure-mono content produces a silent side channel —
        drop one and see.
      </div>
    </EditToolShell>
  );
}
