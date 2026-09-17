"use client";

/**
 * RMS Meter — overall RMS/peak/crest-factor plus a windowed RMS timeline,
 * from computeRmsStats() (Node-verified). Renders linear RMS as dBFS.
 */

import { useCallback } from "react";
import { Gauge } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { computeRmsStats, type RmsStats } from "@/domains/audio/lib/analyze";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";

const toDb = (v: number) => (v > 0 ? Math.max(-200, 20 * Math.log10(v)) : -200);

function RmsBar({ value }: { value: number }) {
  // 0 dBFS → full bar; −60 dBFS → empty.
  const pct = Math.max(0, Math.min(1, 1 + toDb(value) / 60));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

export default function RmsMeter() {
  const render = useCallback((stats: RmsStats, input: AnalyzerInput) => {
    const maxWindow = Math.max(...Array.from(stats.windowRms), 1e-9);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">RMS</p>
            <p className="text-lg font-semibold text-foreground">{stats.overallRmsDb.toFixed(1)} dBFS</p>
            <p className="text-xs text-muted-foreground">linear {stats.overallRms.toFixed(4)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="text-lg font-semibold text-foreground">{stats.peakDb.toFixed(1)} dBFS</p>
            <p className="text-xs text-muted-foreground">linear {stats.peak.toFixed(4)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Crest factor</p>
            <p className="text-lg font-semibold text-foreground">{stats.crestFactorDb.toFixed(1)} dB</p>
            <p className="text-xs text-muted-foreground">peak ÷ RMS</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-lg font-semibold text-foreground">
              {formatSeconds(input.length / input.sampleRate)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            RMS per 0.5 s window (largest window = full bar)
          </p>
          <div className="flex h-24 items-end gap-px">
            {Array.from(stats.windowRms).map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/80"
                style={{ height: `${Math.max(2, (v / maxWindow) * 100)}%` }}
                title={`Window ${i}: ${(20 * Math.log10(Math.max(v, 1e-10))).toFixed(1)} dBFS`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <AnalyzerToolShell<RmsStats>
      analyze={(input: AnalyzerInput) => computeRmsStats(input.channels, input.sampleRate, 0.5)}
      render={render}
    />
  );
}
