"use client";

/**
 * Channel Inverter — flips polarity (×−1) on selected channel(s)
 * (invertPhase, Node-verified exact negation). Polarity inversion is not time
 * alignment: it fixes comb-filter cancellation when two copies of a signal
 * are out of polarity.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { invertPhase } from "@/domains/audio/lib/edit";

export default function ChannelInverter() {
  const [invertL, setInvertL] = useState(true);
  const [invertR, setInvertR] = useState(true);

  return (
    <EditToolShell
      outputSuffix="-inverted.wav"
      transform={({ channels, sampleRate }) => {
        const out = invertPhase(channels, [invertL, invertR]);
        return { channels: out, sampleRate, length: out[0].length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Polarity flip = multiply by −1. If a summed mono version of your stereo file gets
          <em> quieter</em>, the channels are out of polarity — invert one of them here.
        </p>
      }
    >
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={invertL}
            onChange={(e) => setInvertL(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          Invert left channel
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={invertR}
            onChange={(e) => setInvertR(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          Invert right channel
        </label>
      </div>
    </EditToolShell>
  );
}
