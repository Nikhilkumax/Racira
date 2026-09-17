"use client";

/**
 * DC Offset Remover — subtracts each channel's measured mean (removeDcOffset,
 * Node-verified exact). DC offset wastes headroom, makes meters read unequal
 * up/down, and causes clicks at edit points.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { removeDcOffset } from "@/domains/audio/lib/edit";

export default function DcOffsetRemover() {
  const [stats, setStats] = useState<{ before: number[]; after: number[] } | null>(null);

  return (
    <EditToolShell
      outputSuffix="-dc-clean.wav"
      transform={({ channels, sampleRate }) => {
        const mean = (c: Float32Array) => {
          let s = 0;
          for (let i = 0; i < c.length; i++) s += c[i];
          return c.length ? s / c.length : 0;
        };
        const before = channels.map(mean);
        const out = removeDcOffset(channels);
        setStats({ before, after: out.map(mean) });
        return { channels: out, sampleRate, length: out[0].length };
      }}
      footer={
        stats ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            DC offset{" "}
            {stats.before.map((b, i) => `ch${i + 1}: ${(b * 1000).toFixed(1)}‰`).join(" · ")} →{" "}
            {stats.after.map((a) => `${(a * 1000).toFixed(2)}‰`).join(" · ")} (residual ≈ 0)
          </div>
        ) : undefined
      }
    >
      <p className="text-sm text-muted-foreground">
        Drop a file — the offset is measured from the whole file and subtracted. Common sources:
        cheap USB interfaces, phone mics, and over-driven inputs.
      </p>
    </EditToolShell>
  );
}
