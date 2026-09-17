"use client";

/**
 * Mid-Side Decoder — turns M/S files back into regular left/right stereo.
 *
 * The exact inverse of the Mid-Side Encoder: L = M + S, R = M − S via
 * decodeMidSide() (Node-verified: hand-computed samples plus a sample-exact
 * round-trip through encodeMidSide).
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { decodeMidSide } from "@/domains/audio/lib/edit";

export default function MidSideDecoder() {
  return (
    <EditToolShell
      outputSuffix="-decoded-stereo.wav"
      minChannels={2}
      transform={({ channels, sampleRate, length }) => {
        const [left, right] = decodeMidSide(channels[0], channels[1]);
        return { channels: [left, right], sampleRate, length };
      }}
    >
      <div className="mt-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Drop an M/S file: the left channel is treated as the <strong>mid</strong> (center) signal and the right
          channel as the <strong>side</strong> (stereo-difference) signal, decoded back to L/R with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">L = M + S, R = M − S</code>.
        </p>
        <p className="text-xs text-muted-foreground">
          Tip: files exported from the Mid-Side Encoder decode back sample-exactly.
        </p>
      </div>
    </EditToolShell>
  );
}
