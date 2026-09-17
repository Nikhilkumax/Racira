"use client";

/**
 * Phase Inverter — flips the polarity of the entire signal by 180°
 * (invertPhase on all channels, Node-verified exact negation). "Phase"
 * inversion here is polarity inversion: every sample's sign flips, which is
 * what mixes and plugin UIs mean by the ⌀ button.
 */

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { invertPhase } from "@/domains/audio/lib/edit";

export default function PhaseInverter() {
  return (
    <EditToolShell
      outputSuffix="-phase-flip.wav"
      transform={({ channels, sampleRate }) => {
        const out = invertPhase(
          channels,
          channels.map(() => true),
        );
        return { channels: out, sampleRate, length: out[0].length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Every sample multiplied by −1. Summing the original and inverted copies cancels to
          (near) silence — the classic null test.
        </p>
      }
    >
      <p className="text-sm text-muted-foreground">
        Use it to fix polarity-cancelling overlaps (multi-mic drums, dual-cat-5 cable splits, or a
        reversed DI), or to null-test two takes: drop both into the Mixer as original +
        inverted-and-level-matched and whatever survives is the difference.
      </p>
    </EditToolShell>
  );
}
