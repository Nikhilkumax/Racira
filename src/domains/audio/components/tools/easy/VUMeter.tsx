"use client";

/**
 * VU Meter — IEC-style VU reading of a dropped file: average-rectified level
 * integrated over 300 ms windows, 0 VU referenced to −18 dBFS RMS (EBU R68).
 * All math is computeVuLevels() (Node-verified).
 */

import { Gauge } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { computeVuLevels, type VuReading } from "@/domains/audio/lib/analyze";

function VuBar({ vu }: { vu: number }) {
  // −20 VU … +3 VU displayed on a 0–1 scale.
  const pct = Math.max(0, Math.min(1, (vu + 20) / 23));
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"
        style={{ width: `${pct * 100}%` }}
      />
      <div className="absolute inset-y-0 left-[87%] w-px bg-foreground/60" title="0 VU" />
    </div>
  );
}

export default function VUMeter() {
  return (
    <AnalyzerToolShell<VuReading>
      analyze={(input: AnalyzerInput) => computeVuLevels(input.channels, input.sampleRate)}
      render={(r, input) => (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Integrated VU (0 VU = −18 dBFS RMS)
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
              {r.vu > -60 ? r.vu.toFixed(1) : "−∞"} <span className="text-base font-normal text-muted-foreground">VU</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.rmsDb > -200 ? `${r.rmsDb.toFixed(1)} dBFS average-rectified · ` : ""}
              {input.channels.length === 1 ? "mono" : `${input.channels.length} channels`} ·{" "}
              {input.sampleRate.toLocaleString()} Hz
            </p>
            <div className="mt-3">
              <VuBar vu={r.vu} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">VU per 0.3 s window (−20 … +3 VU scale)</p>
            <div className="flex h-20 items-end gap-px">
              {Array.from(r.windowVu).map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: `${Math.max(2, Math.min(100, ((v + 20) / 23) * 100))}%` }}
                  title={`Window ${i}: ${v.toFixed(1)} VU`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            A VU needle deliberately averages over ~300 ms and under-reads fast transients — that is
            the standard&apos;s intent, matching how loudness is perceived.
          </p>
        </div>
      )}
    />
  );
}
