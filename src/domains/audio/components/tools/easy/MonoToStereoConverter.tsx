"use client";

/**
 * Mono-to-Stereo Converter — duplicates the mono channel to identical L/R.
 *
 * Uses monoToStereo() (Node-verified): both output channels equal the input
 * exactly, so mono content stays dead-center on playback.
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { monoToStereo } from "@/domains/audio/lib/edit";

export default function MonoToStereoConverter() {
  return (
    <EditToolShell
      outputSuffix="-stereo.wav"
      maxChannels={1}
      transform={({ channels, sampleRate }) => {
        if (channels.length !== 1) {
          throw new Error("This file is already stereo — mono-to-stereo needs a mono source.");
        }
        const [left, right] = monoToStereo(channels[0]);
        return {
          channels: [left, right],
          sampleRate,
          length: channels[0].length,
        };
      }}
      footer={
        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Both output channels are exact copies — perfect center image, no widening. For a wide
          stereo image from mono, use the Stereo Widener or add an Echo with independent taps.
        </div>
      }
    >
      <div className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
        Drop a mono file — it will be duplicated to identical left and right channels and
        downloaded as a stereo WAV.
      </div>
    </EditToolShell>
  );
}
