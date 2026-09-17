"use client";

/**
 * Frequency Counter — fundamental frequency via normalized-autocorrelation
 * pitch detection (estimateFundamental, Node-verified: exact on sines and
 * sawtooth, octave-safe). Shows the median estimate with a confidence readout
 * and a per-window history from the lib's internal windows.
 */

import { Activity } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { estimateFundamental } from "@/domains/audio/lib/analyze";

interface CounterResult {
  hz: number;
  confidence: number;
  windows: number;
}

export default function FrequencyCounter() {
  return (
    <AnalyzerToolShell<CounterResult>
      analyze={(input: AnalyzerInput) => estimateFundamental(input.channels[0], input.sampleRate)}
      render={(r, input) => (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Detected fundamental (first channel)
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
              {r.hz > 0 ? r.hz.toFixed(1) : "—"}{" "}
              <span className="text-base font-normal text-muted-foreground">Hz</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.windows > 0
                ? `${r.windows} windows · confidence ${(r.confidence * 100).toFixed(0)}%`
                : "No periodic signal found in the search range (50 Hz – 5 kHz)"}
            </p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, r.confidence * 100))}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {input.fileName} · {(input.sampleRate / 1000).toFixed(1)} kHz ·{" "}
            {input.channels.length === 1 ? "mono" : `${input.channels.length} channels`} ·
            autocorrelation with octave-safe peak picking — more precise than an FFT bin peak.
          </p>
        </div>
      )}
    />
  );
}
