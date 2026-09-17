"use client";

/**
 * Crest Factor Meter — peak-to-RMS ratio in dB, overall and per 300 ms
 * window, highlighting the most peak-heavy moment. All math is
 * computeCrestLevels() (Node-verified against computeRmsStats).
 */

import { Zap } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { computeCrestLevels, type CrestReading } from "@/domains/audio/lib/analyze";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";

export default function CrestFactorMeter() {
  return (
    <AnalyzerToolShell<CrestReading>
      analyze={(input: AnalyzerInput) => computeCrestLevels(input.channels, input.sampleRate)}
      render={(r, input) => {
        const maxCrest = Math.max(...Array.from(r.windowCrest), 1e-9);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" /> Crest factor
                </p>
                <p className="text-2xl font-semibold text-foreground">{r.crestFactorDb.toFixed(1)} dB</p>
                <p className="text-xs text-muted-foreground">peak ÷ RMS</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Peak</p>
                <p className="text-2xl font-semibold text-foreground">{r.peakDb.toFixed(1)} dBFS</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">RMS</p>
                <p className="text-2xl font-semibold text-foreground">{r.rmsDb.toFixed(1)} dBFS</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Most peak-heavy</p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatSeconds((r.peakiestWindow * r.windowSize) / input.sampleRate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.windowCrest[r.peakiestWindow]?.toFixed(1)} dB in that window
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Crest factor per 0.3 s window (dB)</p>
              <div className="flex h-20 items-end gap-px">
                {Array.from(r.windowCrest).map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${i === r.peakiestWindow ? "bg-yellow-400" : "bg-primary/80"}`}
                    style={{ height: `${Math.max(2, (v / maxCrest) * 100)}%` }}
                    title={`Window ${i}: ${v.toFixed(1)} dB`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              A pure sine sits at 3.0 dB; natural speech and percussive material often exceed 12 dB.
              High crest factor is why material can clip while its RMS looks safe.
            </p>
          </div>
        );
      }}
    />
  );
}
