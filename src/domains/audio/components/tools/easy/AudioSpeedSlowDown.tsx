"use client";

/**
 * Audio Speed Slow Down — comprehension-focused slowing of a loaded file.
 *
 * Reuses the Batch-1 verified DSP: resampleLinear (tape mode — pitch drops
 * with speed, clearest for speech comprehension) or olaTimeStretch (preserved
 * pitch). Slower-than-source only by design (0.5–1.0×).
 *
 * Direction convention (as verified in scratch/test-batch1.cjs): both lib
 * functions take a PLAYBACK-speed factor — resampleLinear(factor) produces
 * duration = original / factor, and olaTimeStretch takes a DURATION
 * multiplier — so slowing to `speed` means resampleLinear(speed) and
 * olaTimeStretch(1 / speed). (Calling resampleLinear(1 / speed) would SPEED
 * the file up — caught before ship by the Batch 18 verification script.)
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { olaTimeStretch, resampleLinear } from "@/domains/audio/lib/edit";

type Mode = "tape" | "preserve";

export default function AudioSpeedSlowDown() {
  const [speed, setSpeed] = useState(0.75);
  const [mode, setMode] = useState<Mode>("tape");

  return (
    <div className="space-y-4">
      <EditToolShell
        outputSuffix={`slowed-${speed.toFixed(2)}x`}
        transform={({ channels, sampleRate }) => ({
          channels: channels.map((c) =>
            mode === "tape" ? resampleLinear(c, speed) : olaTimeStretch(c, 1 / speed),
          ),
          sampleRate,
          // Both modes produce duration = original / speed (the lib functions
          // size their outputs as ceil(len / speed) and ceil(len · (1/speed))
          // respectively, which agree up to the shared Math.ceil).
          length: Math.max(1, Math.ceil(channels[0].length / speed)),
        })}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Speed: {speed.toFixed(2)}× ({Math.round((1 - speed) * 100)}% slower)
            </label>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex gap-2 text-xs">
              {[0.5, 0.6, 0.7, 0.8, 0.9].map((p) => (
                <button
                  key={p}
                  onClick={() => setSpeed(p)}
                  className="rounded border px-2 py-0.5 hover:bg-muted"
                >
                  {p}×
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="tape">Tape (pitch drops — clearest for speech)</option>
              <option value="preserve">Preserve pitch (slightly robotic)</option>
            </select>
          </div>
        </div>
      </EditToolShell>
    </div>
  );
}
