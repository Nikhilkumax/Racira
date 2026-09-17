"use client";

/**
 * Audio Leveler — slow automatic gain control (autoLevelChannel, Node-verified).
 * Unlike a compressor it adapts the whole level over seconds: a speaker leaning
 * back and a speaker leaning in end up matched, without squashing transients.
 * The gain is slew-limited (dB/s) so loudness glides rather than pumps, and
 * hard-capped (maxGainDb) so silence never gets amplified into noise.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { autoLevelChannel } from "@/domains/audio/lib/dynamics";

export default function AudioLeveler() {
  const [targetRmsDb, setTargetRmsDb] = useState(-20);
  const [maxGainDb, setMaxGainDb] = useState(18);
  const [maxSlewDbPerSec, setMaxSlewDbPerSec] = useState(24);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const params = { targetRmsDb, maxGainDb, maxSlewDbPerSec, blockMs: 100 } as const;
        let minGain = Infinity;
        let maxGain = -Infinity;
        const out = channels.map((ch) => {
          const r = autoLevelChannel(ch, sampleRate, params);
          minGain = Math.min(minGain, r.gainRangeDb[0]);
          maxGain = Math.max(maxGain, r.gainRangeDb[1]);
          return r.data;
        });
        setReport(
          `Gain applied: ${minGain.toFixed(1)} dB … +${maxGain.toFixed(1)} dB (slew-limited to ${maxSlewDbPerSec} dB/s)`,
        );
        return { channels: out, sampleRate, length };
      },
    [targetRmsDb, maxGainDb, maxSlewDbPerSec],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="leveled"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Target level: {targetRmsDb} dBFS (RMS)
          </span>
          <input
            type="range"
            min={-30}
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
              Max gain: +{maxGainDb} dB
            </span>
            <input
              type="range"
              min={6}
              max={30}
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
              max={60}
              step={3}
              value={maxSlewDbPerSec}
              onChange={(e) => setMaxSlewDbPerSec(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          The leveler re-rides volume slowly — good for voice memos, lectures and
          interviews where the source level drifts. A lower max speed sounds smoother;
          a higher one follows the talker faster.
        </p>
      </div>
    </EditToolShell>
  );
}
