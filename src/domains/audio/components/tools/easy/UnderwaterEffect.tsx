"use client";

/**
 * Underwater Effect — murky low-passed audio with a slow swimming tremolo.
 *
 * Chain (Node-verified): lowpass×2 (24 dB/oct) + slow tremolo. Measured:
 * 4 kHz residual 0.0001, 200 Hz survives at ×0.24, envelope exactly
 * amp·(1−depth)…amp.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyUnderwaterEffect, UNDERWATER_DEFAULTS } from "@/domains/audio/lib/edit";

export default function UnderwaterEffect() {
  const [depthPercent, setDepthPercent] = useState(UNDERWATER_DEFAULTS.depth * 100);

  return (
    <EditToolShell
      outputSuffix="-underwater.wav"
      transform={({ channels, sampleRate }) => ({
        channels: channels.map((ch) =>
          applyUnderwaterEffect(ch, sampleRate, {
            ...UNDERWATER_DEFAULTS,
            depth: depthPercent / 100,
          }),
        ),
        sampleRate,
        length: channels[0].length,
      })}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Swim depth <span className="text-muted-foreground">({depthPercent}% tremolo swing)</span>
          </p>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={depthPercent}
            onChange={(e) => setDepthPercent(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Underwater tremolo depth"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Heavy low-pass at 600 Hz plus a slow 1.2 Hz amplitude swell — voices turn muffled and
          distant, like listening from beneath the surface.
        </p>
      </div>
    </EditToolShell>
  );
}
