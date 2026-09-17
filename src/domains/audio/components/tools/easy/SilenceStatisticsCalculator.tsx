"use client";

/**
 * Silence Statistics Calculator — how much of a file is silence (silenceStats,
 * Node-verified): silent share, run count, longest/mean run, plus a table of
 * every qualifying run with timestamps you can punch straight into the
 * Silence Remover. Threshold and minimum-run controls re-run the analysis.
 * Processing is the shared EditToolShell; the "output" is the stats footer.
 */

import { useMemo, useState } from "react";

import EditToolShell, { formatSeconds, type EditInput, type EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { silenceStats, type SilenceStatsResult } from "@/domains/audio/lib/calc";

export default function SilenceStatisticsCalculator() {
  const [thresholdDb, setThresholdDb] = useState(-60);
  const [minRunMs, setMinRunMs] = useState(500);
  const [stats, setStats] = useState<SilenceStatsResult | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const r = silenceStats(channels, sampleRate, { thresholdDb, minRunMs });
        // setState during the shell's process step (an event handler), not
        // during render — safe, and it makes the footer live.
        setStats(r);
        // Pass-through: this tool analyzes, it does not edit.
        return { channels, sampleRate, length };
      },
    [thresholdDb, minRunMs],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="silence-stats"
      footer={stats ? <StatsPanel stats={stats} /> : undefined}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Silence threshold: {thresholdDb} dBFS
          </span>
          <input
            type="range"
            min={-80}
            max={-20}
            step={1}
            value={thresholdDb}
            onChange={(e) => setThresholdDb(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Minimum run: {minRunMs} ms</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={minRunMs}
            onChange={(e) => setMinRunMs(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        A frame counts as silent when its RMS sits under the threshold for at least the minimum
        run. Loudness-normalized podcasts usually want −50 to −60 dBFS; noisy room recordings
        need a higher (less negative) threshold.
      </p>
    </EditToolShell>
  );
}

function StatsPanel({ stats }: { stats: SilenceStatsResult }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Silent time" value={formatSeconds(stats.silenceDurationSec)} />
        <Stat label="Share of file" value={`${stats.silencePercent.toFixed(1)}%`} />
        <Stat label="Runs" value={String(stats.runCount)} />
        <Stat label="Longest run" value={formatSeconds(stats.longestRunSec)} />
      </div>
      {stats.runs.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Start</th>
                <th className="px-3 py-2 text-left font-medium">End</th>
                <th className="px-3 py-2 text-left font-medium">Length</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {stats.runs.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-1.5">{i + 1}</td>
                  <td className="px-3 py-1.5">{r.startSec.toFixed(2)} s</td>
                  <td className="px-3 py-1.5">{r.endSec.toFixed(2)} s</td>
                  <td className="px-3 py-1.5">{r.durationSec.toFixed(2)} s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
