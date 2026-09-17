"use client";

/**
 * Multi-Guest Leveler — balance levels across guests in a shared recording
 * (autoLevelChannel, Node-verified, applied independently per channel). Two
 * people recorded onto one stereo file — guest A on the left, guest B on the
 * right — come out matched, each steered to the same target with its own
 * slew-limited gain. The per-guest gain ranges are reported honestly.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { autoLevelChannel, rmsOf, toDb } from "@/domains/audio/lib/dynamics";

const GUEST_NAMES = ["Guest L", "Guest R"];

export default function MultiGuestLeveler() {
  const [targetRmsDb, setTargetRmsDb] = useState(-16);
  const [maxGainDb, setMaxGainDb] = useState(15);
  const [maxSlewDbPerSec, setMaxSlewDbPerSec] = useState(18);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const inDb = channels.map((ch) => toDb(Math.max(rmsOf(ch), 1e-10)));
        const params = { targetRmsDb, maxGainDb, maxSlewDbPerSec, blockMs: 100 } as const;
        const ranges: string[] = [];
        const out = channels.map((ch, i) => {
          const r = autoLevelChannel(ch, sampleRate, params);
          ranges.push(
            `${GUEST_NAMES[i] ?? `Ch ${i + 1}`}: ${inDb[i].toFixed(1)} → ${toDb(Math.max(rmsOf(r.data), 1e-10)).toFixed(1)} dBFS (gain ${r.gainRangeDb[0].toFixed(1)}…+${r.gainRangeDb[1].toFixed(1)} dB)`,
          );
          return r.data;
        });
        setReport(ranges.join(" · "));
        return { channels: out, sampleRate, length };
      },
    [targetRmsDb, maxGainDb, maxSlewDbPerSec],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="balanced"
      minChannels={2}
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Drop a stereo recording where each guest is on their own channel (left =
          guest 1, right = guest 2 — the standard two-mic setup). Each channel is
          leveled independently to the same target.
        </p>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Target level per guest: {targetRmsDb} dBFS (RMS)
          </span>
          <input
            type="range"
            min={-24}
            max={-12}
            step={1}
            value={targetRmsDb}
            onChange={(e) => setTargetRmsDb(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Max gain per guest: +{maxGainDb} dB
            </span>
            <input
              type="range"
              min={6}
              max={24}
              step={1}
              value={maxGainDb}
              onChange={(e) => setMaxGainDb(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Max speed: {maxSlewDbPerSec} dB/s
            </span>
            <input
              type="range"
              min={6}
              max={40}
              step={2}
              value={maxSlewDbPerSec}
              onChange={(e) => setMaxSlewDbPerSec(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Slow slew keeps each voice natural (no pumping on syllables); the max-gain
          cap stops a silent channel being amplified into room noise.
        </p>
      </div>
    </EditToolShell>
  );
}
