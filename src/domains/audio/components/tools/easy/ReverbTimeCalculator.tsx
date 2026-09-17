"use client";

/**
 * Reverb Time Calculator — pre-delay/decay starting points from BPM and room
 * character (reverbForBpm, Node-verified room table).
 */

import { useState } from "react";

import { reverbForBpm, beatMs } from "@/domains/audio/lib/calc";

type Room = "small" | "medium" | "large" | "plate";

const ROOMS: { value: Room; label: string }[] = [
  { value: "small", label: "Small room — tight, transient-safe" },
  { value: "medium", label: "Medium room — general vocals" },
  { value: "large", label: "Large hall — ballads, pads" },
  { value: "plate", label: "Plate — dense, short pre-delay" },
];

export default function ReverbTimeCalculator() {
  const [bpm, setBpm] = useState(120);
  const [room, setRoom] = useState<Room>("medium");
  const settings = reverbForBpm(bpm, room);
  const beat = beatMs(bpm);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tempo (BPM)</span>
          <input
            type="number"
            min={1}
            max={400}
            value={bpm}
            onChange={(e) => setBpm(Math.max(1, Math.min(400, Number(e.target.value) || 120)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Room character</span>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value as Room)}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {ROOMS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pre-delay</p>
          <p className="text-2xl font-bold text-foreground">{settings.preDelayMs} ms</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Decay (RT60)</p>
          <p className="text-2xl font-bold text-foreground">{settings.decayMs} ms</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground">
        <p>
          At {bpm} BPM one beat is {beat.toFixed(1)} ms. The suggested decay keeps reflections from
          smearing across the next beat — a common mixing starting point.
        </p>
        <p className="mt-2">
          Pre-delay (10–30 ms) separates the dry transient from the tail so vocals keep their edge.
          Plates use near-zero pre-delay by design.
        </p>
      </div>
    </div>
  );
}
