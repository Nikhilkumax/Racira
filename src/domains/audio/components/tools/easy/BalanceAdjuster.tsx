"use client";

/**
 * Balance Adjuster — attenuates one channel without touching the other
 * (applyBalance, Node-verified). Not the same as pan: balance fixes a leaning
 * mix; pan positions a source.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyBalance } from "@/domains/audio/lib/edit";

export default function BalanceAdjuster() {
  const [position, setPosition] = useState(0);

  const label =
    position === 0
      ? "Centered (unity)"
      : position < 0
        ? `Right attenuated ${(Math.abs(position) * 100).toFixed(0)}%`
        : `Left attenuated ${(position * 100).toFixed(0)}%`;

  return (
    <EditToolShell
      outputSuffix="-balanced.wav"
      minChannels={2}
      transform={({ channels, sampleRate }) => {
        const out = applyBalance(channels, position);
        return { channels: [out[0], out[1]], sampleRate, length: out[0].length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          {label} — the untouched channel is bit-identical to the source.
        </p>
      }
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Balance</span>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={position * 100}
          onChange={(e) => setPosition(Number(e.target.value) / 100)}
          className="w-full accent-[hsl(var(--primary))]"
          aria-label="Balance"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Full left</span>
          <span>{label}</span>
          <span>Full right</span>
        </div>
      </label>
    </EditToolShell>
  );
}
