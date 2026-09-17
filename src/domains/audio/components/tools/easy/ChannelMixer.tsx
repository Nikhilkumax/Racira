"use client";

/**
 * Channel Mixer — arbitrary 2×2 channel matrix with presets (swap, mono
 * downmix, L→stereo, L−R difference). Powered by applyChannelMatrix
 * (Node-verified: identity passthrough, swap exact, downmix averages).
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyChannelMatrix } from "@/domains/audio/lib/edit";

const PRESETS: { label: string; m: [number, number, number, number] }[] = [
  { label: "Identity", m: [1, 0, 0, 1] },
  { label: "Swap L/R", m: [0, 1, 1, 0] },
  { label: "Mono (L+R)/2", m: [0.5, 0.5, 0.5, 0.5] },
  { label: "L only → stereo", m: [1, 0, 1, 0] },
  { label: "R only → stereo", m: [0, 1, 0, 1] },
  { label: "Difference (L−R)", m: [1, -1, 1, -1] },
];

export default function ChannelMixer() {
  const [m, setM] = useState<[number, number, number, number]>([1, 0, 0, 1]);

  return (
    <EditToolShell
      outputSuffix="-mixed.wav"
      transform={({ channels, sampleRate }) => {
        const out = applyChannelMatrix(channels, m[0], m[1], m[2], m[3]);
        return { channels: [out[0], out[1]], sampleRate, length: out[0].length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          out_L = {m[0]}·L + {m[1]}·R &nbsp;·&nbsp; out_R = {m[2]}·L + {m[3]}·R
        </p>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setM(p.m)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                (m[0] === p.m[0] && m[1] === p.m[1] && m[2] === p.m[2] && m[3] === p.m[3]
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([["a (L→L)", 0], ["b (R→L)", 1], ["c (L→R)", 2], ["d (R→R)", 3]] as const).map(
            ([label, idx]) => (
              <label key={idx} className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <input
                  type="number"
                  step={0.1}
                  min={-2}
                  max={2}
                  value={m[idx]}
                  onChange={(e) => {
                    const v = Math.max(-2, Math.min(2, Number(e.target.value) || 0));
                    setM((prev) => {
                      const next = [...prev] as [number, number, number, number];
                      next[idx] = v;
                      return next;
                    });
                  }}
                  className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
                />
              </label>
            ),
          )}
        </div>
      </div>
    </EditToolShell>
  );
}
