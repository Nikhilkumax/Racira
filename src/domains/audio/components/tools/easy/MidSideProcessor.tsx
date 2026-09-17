"use client";

/**
 * Mid/Side Processor — independent level control of the mid (center) and side
 * (stereo) components, built on the Node-verified mid/side transform from
 * Batch 4 (encodeMidSide/decodeMidSide). Mid 0% = karaoke-style side-only;
 * side 0% = mono.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { encodeMidSide, decodeMidSide } from "@/domains/audio/lib/edit";

export default function MidSideProcessor() {
  const [midPct, setMidPct] = useState(100);
  const [sidePct, setSidePct] = useState(100);

  return (
    <EditToolShell
      outputSuffix="-ms.wav"
      minChannels={2}
      transform={({ channels, sampleRate }) => {
        const [left, right] = channels;
        const { mid, side } = encodeMidSide(left, right);
        for (let i = 0; i < mid.length; i++) {
          mid[i] *= midPct / 100;
          side[i] *= sidePct / 100;
        }
        const [outL, outR] = decodeMidSide(mid, side);
        return { channels: [outL, outR], sampleRate, length: outL.length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          mid {(midPct / 100).toFixed(2)}× · side {(sidePct / 100).toFixed(2)}× — width scales with
          the side gain; vocals and bass usually live in the mid.
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Mid (center) <span className="text-muted-foreground">({midPct}%)</span>
          </span>
          <input
            type="range"
            min={0}
            max={200}
            value={midPct}
            onChange={(e) => setMidPct(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Side (stereo) <span className="text-muted-foreground">({sidePct}%)</span>
          </span>
          <input
            type="range"
            min={0}
            max={200}
            value={sidePct}
            onChange={(e) => setSidePct(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </label>
      </div>
    </EditToolShell>
  );
}
