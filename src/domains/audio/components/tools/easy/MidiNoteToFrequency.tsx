"use client";

/**
 * MIDI Note to Frequency — note number → Hz under equal temperament, with an
 * adjustable A4 reference (midiToFreq scaled, Node-verified). Shows the full
 * 12-tone neighborhood for context.
 */

import { useState } from "react";

import { midiToFreq, NOTE_NAMES } from "@/domains/audio/lib/calc";

export default function MidiNoteToFrequency() {
  const [midi, setMidi] = useState(69);
  const [a4Hz, setA4Hz] = useState(440);

  const freq = (midiToFreq(midi) * a4Hz) / 440;
  const name = `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">MIDI note (0–127)</span>
          <input
            type="number"
            min={0}
            max={127}
            value={midi}
            onChange={(e) => setMidi(Math.max(0, Math.min(127, Number(e.target.value) || 69)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">A4 reference: {a4Hz} Hz</span>
          <input
            type="range"
            min={415}
            max={466}
            step={1}
            value={a4Hz}
            onChange={(e) => setA4Hz(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-3xl font-bold text-foreground">
          {freq.toFixed(2)} <span className="text-base font-medium text-muted-foreground">Hz</span>
        </p>
        <p className="text-sm text-muted-foreground">
          MIDI {midi} = {name} · {a4Hz === 440 ? "standard 440 Hz tuning" : `A4 = ${a4Hz} Hz`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">MIDI</th>
              <th className="px-3 py-2 font-medium">Note</th>
              <th className="px-3 py-2 font-medium">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }, (_, i) => midi - 5 + i).map((m) => (
              <tr key={m} className={`border-b border-border/50 last:border-0 ${m === midi ? "bg-accent/50" : ""}`}>
                <td className="px-3 py-1.5 font-mono text-foreground">{m}</td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {NOTE_NAMES[((m % 12) + 12) % 12]}{Math.floor(m / 12) - 1}
                </td>
                <td className="px-3 py-1.5 font-mono text-muted-foreground">
                  {((midiToFreq(m) * a4Hz) / 440).toFixed(2)} Hz
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
