"use client";

/**
 * Sample Rate Calculator — Nyquist both directions: minimum rate for a target
 * bandwidth, and captured bandwidth for a given rate (nyquistMinRate/
 * maxCapturedFreq, Node-verified). Common rates shown with their uses.
 */

import { useState } from "react";

import { nyquistMinRate, maxCapturedFreq } from "@/domains/audio/lib/calc";

const COMMON = [
  { hz: 44100, use: "CD / general release" },
  { hz: 48000, use: "Video & streaming standard" },
  { hz: 96000, use: "Hi-res production" },
  { hz: 192000, use: "Archival / sound design" },
];

export default function SampleRateCalculator() {
  const [maxFreq, setMaxFreq] = useState(20000);
  const [rate, setRate] = useState(48000);

  const minRate = nyquistMinRate(maxFreq);
  const captured = maxCapturedFreq(rate);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rate needed for a bandwidth
          </p>
          <label className="mt-2 block space-y-1">
            <span className="text-xs text-muted-foreground">Highest frequency (Hz)</span>
            <input
              type="number"
              min={1}
              max={96000}
              value={maxFreq}
              onChange={(e) => setMaxFreq(Math.max(1, Math.min(96000, Number(e.target.value) || 20000)))}
              className="w-40 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <p className="mt-2 text-lg font-bold text-foreground">
            ≥ {minRate.toLocaleString()} Hz
          </p>
          <p className="text-xs text-muted-foreground">Nyquist: rate must be at least 2 × the highest frequency.</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bandwidth captured by a rate
          </p>
          <label className="mt-2 block space-y-1">
            <span className="text-xs text-muted-foreground">Sample rate (Hz)</span>
            <input
              type="number"
              min={1}
              max={384000}
              value={rate}
              onChange={(e) => setRate(Math.max(1, Math.min(384000, Number(e.target.value) || 48000)))}
              className="w-40 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <p className="mt-2 text-lg font-bold text-foreground">
            {captured.toLocaleString()} Hz
          </p>
          <p className="text-xs text-muted-foreground">Half the rate; anything above aliases.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Rate</th>
              <th className="px-3 py-2 font-medium">Captures up to</th>
              <th className="px-3 py-2 font-medium">Typical use</th>
            </tr>
          </thead>
          <tbody>
            {COMMON.map((c) => (
              <tr key={c.hz} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-1.5 font-mono text-foreground">{c.hz.toLocaleString()} Hz</td>
                <td className="px-3 py-1.5 font-mono text-muted-foreground">{(c.hz / 2000).toFixed(1)} kHz</td>
                <td className="px-3 py-1.5 text-muted-foreground">{c.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
