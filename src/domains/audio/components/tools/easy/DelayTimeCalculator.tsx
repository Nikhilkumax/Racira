"use client";

/**
 * Delay Time Calculator — the standard note-division delay table for a BPM
 * (delayTable, Node-verified: 120 BPM → 1/4 = 500 ms, dotted = 750 ms).
 */

import { useState } from "react";

import { delayTable } from "@/domains/audio/lib/calc";

export default function DelayTimeCalculator() {
  const [bpm, setBpm] = useState(120);
  const table = delayTable(bpm);

  const fmt = (ms: number) => (ms >= 100 ? ms.toFixed(1) : ms.toFixed(2));

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Tempo (BPM)</span>
        <input
          type="number"
          min={1}
          max={400}
          value={bpm}
          onChange={(e) => setBpm(Math.max(1, Math.min(400, Number(e.target.value) || 120)))}
          className="w-full max-w-xs rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
        />
      </label>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Note</th>
              <th className="px-3 py-2 font-medium">Time (ms)</th>
              <th className="px-3 py-2 font-medium">Dotted (ms)</th>
              <th className="px-3 py-2 font-medium">Triplet (ms)</th>
              <th className="px-3 py-2 font-medium">Hz</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => (
              <tr key={row.label} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-1.5 font-medium text-foreground">{row.label}</td>
                <td className="px-3 py-1.5 font-mono text-foreground">{fmt(row.ms)}</td>
                <td className="px-3 py-1.5 font-mono text-muted-foreground">{fmt(row.dottedMs)}</td>
                <td className="px-3 py-1.5 font-mono text-muted-foreground">{fmt(row.tripletMs)}</td>
                <td className="px-3 py-1.5 font-mono text-muted-foreground">{(1000 / row.ms).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/30 text-xs text-muted-foreground">
              <td className="px-3 py-2" colSpan={5}>
                Hz column = modulation rate for that division (1 / time). Ping-pong and stereo delays:
                1/8 dotted is the classic U2 setting.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Dotted = ×1.5 the straight time; triplet = ×⅔ (fits three in the space of two).
      </p>
    </div>
  );
}
