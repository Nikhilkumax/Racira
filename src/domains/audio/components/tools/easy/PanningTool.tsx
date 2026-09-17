"use client";

/**
 * Panning Tool — equal-power pan across the stereo field (applyPan,
 * Node-verified against the StereoPannerNode law: center −3 dB per channel,
 * hard pan isolates the channel exactly).
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyPan } from "@/domains/audio/lib/edit";

const posLabel = (p: number) =>
  p === 0 ? "Center" : p === -1 ? "Hard left" : p === 1 ? "Hard right" : p < 0 ? `${Math.abs(p * 100).toFixed(0)}% left` : `${(p * 100).toFixed(0)}% right`;

export default function PanningTool() {
  const [position, setPosition] = useState(0);

  return (
    <EditToolShell
      outputSuffix="-panned.wav"
      transform={({ channels, sampleRate }) => {
        const out = applyPan(channels, position);
        return { channels: [out[0], out[1]], sampleRate, length: out[0].length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Position {posLabel(position)} · equal-power law (center = −3 dB per channel, total energy
          preserved).
        </p>
      }
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Pan position</span>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={position * 100}
          onChange={(e) => setPosition(Number(e.target.value) / 100)}
          className="w-full accent-[hsl(var(--primary))]"
          aria-label="Pan position"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>100% left</span>
          <span>{posLabel(position)}</span>
          <span>100% right</span>
        </div>
      </label>
    </EditToolShell>
  );
}
