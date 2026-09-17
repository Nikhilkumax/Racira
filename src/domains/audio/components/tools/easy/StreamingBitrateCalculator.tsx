"use client";

/**
 * Streaming Bitrate Calculator — bandwidth and monthly transfer for a stream
 * at a given bitrate and audience (streamBandwidthKbps/monthlyTransferGB,
 * Node-verified against hand-computed 3456 GB case).
 */

import { useState } from "react";

import { streamBandwidthKbps, monthlyTransferGB } from "@/domains/audio/lib/calc";

export default function StreamingBitrateCalculator() {
  const [listeners, setListeners] = useState(500);
  const [bitrateKbps, setBitrateKbps] = useState(128);
  const [hoursPerDay, setHoursPerDay] = useState(4);

  const totalKbps = streamBandwidthKbps(listeners, bitrateKbps);
  const gb = monthlyTransferGB(listeners, bitrateKbps, hoursPerDay, 30);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Simultaneous listeners</span>
          <input
            type="number"
            min={1}
            max={1000000}
            value={listeners}
            onChange={(e) => setListeners(Math.max(1, Math.min(1000000, Number(e.target.value) || 500)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Bitrate (kbps)</span>
          <select
            value={bitrateKbps}
            onChange={(e) => setBitrateKbps(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {[64, 96, 128, 192, 256, 320].map((r) => (
              <option key={r} value={r}>{r} kbps</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Hours streamed per day</span>
          <input
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Math.max(0.5, Math.min(24, Number(e.target.value) || 4)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Upload bandwidth needed
          </p>
          <p className="text-2xl font-bold text-foreground">
            {totalKbps >= 1000 ? `${(totalKbps / 1000).toFixed(1)} Mbps` : `${totalKbps} kbps`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {listeners} listeners × {bitrateKbps} kbps
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Monthly transfer (30 days)
          </p>
          <p className="text-2xl font-bold text-foreground">
            {gb >= 1000 ? `${(gb / 1024).toFixed(2)} TB` : `${gb.toFixed(1)} GB`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hoursPerDay} h/day of continuous streaming
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Add headroom — providers count protocol overhead, and listener counts spike. Double the
        bandwidth figure before picking a plan.
      </p>
    </div>
  );
}
