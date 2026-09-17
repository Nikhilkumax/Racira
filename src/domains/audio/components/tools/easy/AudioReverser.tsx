"use client";

/**
 * Audio Reverser — plays the file backwards.
 *
 * Reverses each channel independently through reverseChannelData() (pure,
 * Node-verified in scratch/test-batch1.mjs). Reversal preserves every sample,
 * so the output duration always matches the source exactly.
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { reverseChannelData } from "@/domains/audio/lib/edit";

export default function AudioReverser() {
  return (
    <EditToolShell
      outputSuffix="-reversed.wav"
      transform={({ channels, sampleRate, length }) => ({
        channels: reverseChannelData(channels),
        sampleRate,
        length,
      })}
    >
      <p className="mt-4 text-xs text-muted-foreground">
        Every sample is kept — the audio simply plays back-to-front, including the fade-ins
        and fade-outs becoming fade-outs and fade-ins.
      </p>
    </EditToolShell>
  );
}
