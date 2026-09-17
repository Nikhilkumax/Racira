"use client";

/**
 * Time Stretcher — make audio longer or shorter without touching pitch
 * (olaTimeStretch, Node-verified). The sibling of the Tempo Changer with a
 * duration-first UX: pick a target length multiplier and go.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { olaTimeStretch } from "@/domains/audio/lib/edit";

export default function TimeStretcher() {
  const [multiplier, setMultiplier] = useState(1.25);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const out = channels.map((ch) => olaTimeStretch(ch, multiplier));
        const newLen = out[0]?.length ?? 0;
        setReport(
          `Duration ×${multiplier.toFixed(2)} · ${(length / sampleRate).toFixed(2)} s → ${(newLen / sampleRate).toFixed(2)} s · pitch preserved`,
        );
        return { channels: out, sampleRate, length: newLen };
      },
    [multiplier],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="stretched"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Length: ×{multiplier.toFixed(2)} ({multiplier > 1 ? "longer" : multiplier < 1 ? "shorter" : "unchanged"})
          </span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Stretching fills (or removes) time by overlapping waveform-matched grains,
          so a stretched vocal still sounds like the same vocal. Ambiences and pads
          stretch beautifully; percussive loops are happiest within ±20%.
        </p>
      </div>
    </EditToolShell>
  );
}
