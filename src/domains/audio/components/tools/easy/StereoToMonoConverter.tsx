"use client";

/**
 * Stereo-to-Mono Converter — folds L/R to one channel via (L+R)/2.
 *
 * Uses stereoToMono() (Node-verified): identical L/R folds back to the exact
 * source waveform; out-of-phase content can cancel (that's what a downmix is).
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { stereoToMono } from "@/domains/audio/lib/edit";

export default function StereoToMonoConverter() {
  return (
    <EditToolShell
      outputSuffix="-mono.wav"
      minChannels={2}
      transform={({ channels, sampleRate }) => {
        if (channels.length !== 2) {
          throw new Error("This file is already mono — stereo-to-mono needs a stereo source.");
        }
        const mono = stereoToMono(channels[0], channels[1]);
        return {
          channels: [mono],
          sampleRate,
          length: mono.length,
        };
      }}
      footer={
        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Fold is the broadcast-standard (L+R)/2: correlated content drops 6 dB, out-of-phase
          material can cancel. Peak level is checked after folding — the shell reports it.
        </div>
      }
    >
      <div className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
        Drop a stereo file — left and right are averaged into a single mono channel. Mono
        compatibility check: if the mono result sounds much quieter, the mix has phase issues.
      </div>
    </EditToolShell>
  );
}
