"use client";

/**
 * Channel Isolator — keeps only the selected channel of a stereo file, as a
 * fresh mono WAV (matrix: L→stereo or R→stereo; Node-verified).
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyChannelMatrix } from "@/domains/audio/lib/edit";

type Keep = "left" | "right" | "both";

export default function ChannelIsolator() {
  const [keep, setKeep] = useState<Keep>("left");

  return (
    <EditToolShell
      outputSuffix={keep === "left" ? "-left.wav" : keep === "right" ? "-right.wav" : "-isolated.wav"}
      transform={({ channels, sampleRate }) => {
        const out =
          keep === "left"
            ? applyChannelMatrix(channels, 1, 0, 1, 0)
            : keep === "right"
              ? applyChannelMatrix(channels, 0, 1, 0, 1)
              : applyChannelMatrix(channels, 1, 0, 0, 1);
        return { channels: [out[0], out[1]], sampleRate, length: out[0].length };
      }}
      footer={
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          {keep === "both"
            ? "Stereo passthrough — handy for A/B against the isolated versions."
            : keep === "left"
              ? "Only the left channel survives, duplicated into both outputs (mono)."
              : "Only the right channel survives, duplicated into both outputs (mono)."}
        </p>
      }
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["left", "Keep left → mono"],
            ["right", "Keep right → mono"],
            ["both", "Keep both (passthrough)"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setKeep(value)}
            className={
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
              (keep === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>
    </EditToolShell>
  );
}
