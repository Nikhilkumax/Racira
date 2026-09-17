"use client";

/**
 * PPM Meter — IEC 60268-10 style peak program metering: 10 ms block peaks,
 * per-100 ms envelope, true sample peak for the over lamp. All math is
 * computePpmLevels() (Node-verified).
 */

import { AlertTriangle, Gauge } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { computePpmLevels, type PpmReading } from "@/domains/audio/lib/analyze";

function PpmBar({ db }: { db: number }) {
  // −48 … 0 dBFS displayed on a 0–1 scale; yellow from −9, red from −3.
  const pct = Math.max(0, Math.min(1, (db + 48) / 48));
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${
          db > -3 ? "bg-red-500" : db > -9 ? "bg-yellow-400" : "bg-emerald-500"
        }`}
        style={{ width: `${pct * 100}%` }}
      />
      {[0, -3, -6, -9, -12, -24, -48].map((mark) => (
        <div
          key={mark}
          className="absolute inset-y-0 w-px bg-foreground/40"
          style={{ left: `${((mark + 48) / 48) * 100}%` }}
          title={`${mark} dBFS`}
        />
      ))}
    </div>
  );
}

export default function PPMMeter() {
  return (
    <AnalyzerToolShell<PpmReading>
      analyze={(input: AnalyzerInput) => computePpmLevels(input.channels, input.sampleRate)}
      render={(r, input) => (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Peak program level (10 ms integration)
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
              {r.ppmDb > -60 ? r.ppmDb.toFixed(1) : "−∞"}{" "}
              <span className="text-base font-normal text-muted-foreground">dBFS</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              True sample peak {r.truePeakDb.toFixed(1)} dBFS ·{" "}
              {input.channels.length === 1 ? "mono" : `${input.channels.length} channels`}
            </p>
            <div className="mt-3">
              <PpmBar db={r.ppmDb} />
            </div>
            {r.truePeakDb > -0.1 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" /> Over: samples at or above −0.1 dBFS
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Peak envelope per 0.1 s window (dBFS)</p>
            <div className="flex h-20 items-end gap-px">
              {Array.from(r.windowPpm).map((v, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${v > -3 ? "bg-red-500/80" : "bg-primary/80"}`}
                  style={{ height: `${Math.max(2, Math.min(100, ((v + 48) / 48) * 100))}%` }}
                  title={`Window ${i}: ${v.toFixed(1)} dBFS`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
}
