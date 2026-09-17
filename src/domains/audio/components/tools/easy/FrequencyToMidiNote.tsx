"use client";

/**
 * Frequency to MIDI Note — Hz → nearest MIDI note with cents offset, plus the
 * exact fractional MIDI value (freqToMidi/nearestNote, Node-verified).
 */

import { useState } from "react";

import { freqToMidi, nearestNote, midiToFreq, NOTE_NAMES } from "@/domains/audio/lib/calc";

export default function FrequencyToMidiNote() {
  const [freq, setFreq] = useState(450);
  const [a4Hz, setA4Hz] = useState(440);

  const scaled = (freq * 440) / a4Hz;
  const exact = freq > 0 ? freqToMidi(scaled) : 0;
  const nearest = nearestNote(scaled);
  const nearestFreq = nearest ? (midiToFreq(nearest.midi) * a4Hz) / 440 : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Frequency (Hz)</span>
          <input
            type="number"
            min={0.1}
            max={25000}
            step={0.1}
            value={freq}
            onChange={(e) => setFreq(Math.max(0.1, Math.min(25000, Number(e.target.value) || 440)))}
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
        {nearest ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Nearest note</p>
              <p className="text-xl font-bold text-foreground">{nearest.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">MIDI</p>
              <p className="text-xl font-bold text-foreground">{nearest.midi}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cents offset</p>
              <p className={`text-xl font-bold ${Math.abs(nearest.cents) < 5 ? "text-green-600" : "text-foreground"}`}>
                {nearest.cents >= 0 ? "+" : ""}{nearest.cents}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Exact MIDI (fractional)</p>
              <p className="text-xl font-bold text-foreground">{exact.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a positive frequency.</p>
        )}
      </div>

      {nearest && nearestFreq !== null && (
        <p className="text-xs text-muted-foreground">
          {nearest.name} sounds at {nearestFreq.toFixed(2)} Hz under A4 = {a4Hz} Hz — your input is{" "}
          {Math.abs(nearest.cents) < 1 ? "right on it" : `${Math.abs(nearest.cents).toFixed(1)} cents ${nearest.cents > 0 ? "above" : "below"}`}.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Note names use scientific pitch notation ({NOTE_NAMES.slice(0, 3).join(", ")}… with octave
        numbers); MIDI 69 = A4 = {a4Hz} Hz.
      </p>
    </div>
  );
}
