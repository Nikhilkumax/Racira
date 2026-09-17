"use client";

/**
 * 8D Audio Converter — rotating spatial effect for headphones
 * (apply8D, Node-verified: equal-power circular pan with interaural delay).
 * The source is downmixed to mono and spun around the listener at the chosen
 * speed; stereo output always.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { apply8D } from "@/domains/audio/lib/edit";

export default function EightDAudioConverter() {
  const [rotationSec, setRotationSec] = useState(8);
  const [depth, setDepth] = useState(80);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        // Mono source: single channel, or the average of a stereo pair.
        const mono = new Float32Array(length);
        if (channels.length === 1) mono.set(channels[0]);
        else {
          for (let i = 0; i < length; i++) mono[i] = (channels[0][i] + channels[1][i]) / 2;
        }
        const [left, right] = apply8D(mono, sampleRate, {
          rotationSec,
          depth: depth / 100,
        });
        setReport(
          `One revolution every ${rotationSec} s · depth ${depth}% (±0.65 ms ear delay at 100%) · stereo out, ${(length / sampleRate).toFixed(1)} s`,
        );
        return { channels: [left, right], sampleRate, length };
      },
    [rotationSec, depth],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="8d"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Rotation speed: one circle every {rotationSec} s
          </span>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={rotationSec}
            onChange={(e) => setRotationSec(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Spatial depth: {depth}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Use headphones — the effect is built from panning plus the tiny delay
          difference between your ears, which speakers collapse. Slower rotations
          sound more natural; the source passes "behind" you once per revolution,
          which is what gives 8D its characteristic sweep.
        </p>
      </div>
    </EditToolShell>
  );
}
