"use client";

/**
 * Bit Depth Calculator — ideal quantization SNR: 6.02·n + 1.76 dB. Works both
 * directions (bits → dB and dB → bits) plus a depth comparison table
 * (bitDepthDynamicRange/bitsForDynamicRange, Node-verified).
 */

import { useState } from "react";

import { bitDepthDynamicRange, bitsForDynamicRange } from "@/domains/audio/lib/calc";

const DEPTHS = [8, 12, 16, 20, 24, 32];

export default function BitDepthCalculator() {
  const [bits, setBits] = useState(16);
  const [targetDb, setTargetDb] = useState(120);

  const snr = bitDepthDynamicRange(bits);
  const neededBits = bitsForDynamicRange(targetDb);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dynamic range for a bit depth
          </p>
          <label className="mt-2 block space-y-1">
            <span className="text-xs text-muted-foreground">Bit depth</span>
            <input
              type="number"
              min={1}
              max={64}
              value={bits}
              onChange={(e) => setBits(Math.max(1, Math.min(64, Number(e.target.value) || 16)))}
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <p className="mt-2 text-lg font-bold text-foreground">{snr.toFixed(2)} dB</p>
          <p className="text-xs text-muted-foreground">SNR = 6.02·n + 1.76 dB (ideal quantizer, sine reference).</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bits needed for a target range
          </p>
          <label className="mt-2 block space-y-1">
            <span className="text-xs text-muted-foreground">Target dynamic range (dB)</span>
            <input
              type="number"
              min={2}
              max={600}
              value={targetDb}
              onChange={(e) => setTargetDb(Math.max(2, Math.min(600, Number(e.target.value) || 120)))}
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <p className="mt-2 text-lg font-bold text-foreground">{neededBits.toFixed(1)} bits</p>
          <p className="text-xs text-muted-foreground">
            Round up — {Math.ceil(neededBits)}-bit gives {bitDepthDynamicRange(Math.ceil(neededBits)).toFixed(1)} dB.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Depth</th>
              <th className="px-3 py-2 font-medium">Dynamic range</th>
              <th className="px-3 py-2 font-medium">Typical use</th>
            </tr>
          </thead>
          <tbody>
            {DEPTHS.map((d) => (
              <tr key={d} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-1.5 font-mono text-foreground">{d}-bit</td>
                <td className="px-3 py-1.5 font-mono text-muted-foreground">{bitDepthDynamicRange(d).toFixed(1)} dB</td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {d <= 12 ? "Lo-fi / vintage samplers" : d === 16 ? "CD / release standard" : d === 20 ? "Hi-res / archival" : d === 24 ? "Recording / mastering" : "Float headroom (internal)"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
