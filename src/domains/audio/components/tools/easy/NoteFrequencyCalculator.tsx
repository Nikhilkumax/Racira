"use client";

/**
 * Note Frequency Calculator — note name ↔ frequency, with cents offsets and a
 * tuning-reference adjustment (A4 = 415–466 Hz for historical/alternate
 * tunings). Math is midiToFreq/parseNote/nearestNote from calc.ts
 * (Node-verified).
 */

import { useState } from "react";

import { midiToFreq, parseNote, nearestNote, freqToMidi, centsBetween, NOTE_NAMES } from "@/domains/audio/lib/calc";

export default function NoteFrequencyCalculator() {
  const [noteName, setNoteName] = useState("A4");
  const [a4Hz, setA4Hz] = useState(440);
  const [freqInput, setFreqInput] = useState(450);

  const parsed = parseNote(noteName);
  const noteFreq = parsed !== null ? (midiToFreq(parsed) * a4Hz) / 440 : null;

  const nearest = nearestNote((freqInput * 440) / a4Hz);
  const nearestFreqAtA4 = nearest ? (midiToFreq(nearest.midi) * a4Hz) / 440 : null;
  const cents = nearestFreqAtA4 ? centsBetween(nearestFreqAtA4, freqInput) : 0;
  const midiExact = freqInput > 0 ? freqToMidi((freqInput * 440) / a4Hz) : 0;

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Tuning reference: A4 = {a4Hz} Hz
        </span>
        <input
          type="range"
          min={415}
          max={466}
          step={1}
          value={a4Hz}
          onChange={(e) => setA4Hz(Number(e.target.value))}
          className="w-full max-w-xs accent-[hsl(var(--primary))]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Note → frequency
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="A4, C#3, Eb2"
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
            <span className="flex items-center text-lg font-bold text-foreground">
              {noteFreq ? `${noteFreq.toFixed(2)} Hz` : "—"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {parsed !== null
              ? `MIDI ${parsed} · scientific pitch notation`
              : "Enter a note like A4, C#3 or Eb2"}
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Frequency → note
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={20000}
              value={freqInput}
              onChange={(e) => setFreqInput(Math.max(1, Math.min(20000, Number(e.target.value) || 440)))}
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
            <span className="text-lg font-bold text-foreground">
              {nearest ? nearest.name : "—"}
            </span>
          </div>
          {nearest && (
            <p className="mt-1 text-xs text-muted-foreground">
              {cents >= 0 ? "+" : ""}{cents.toFixed(1)} cents · MIDI {midiExact.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        Equal temperament (12-TET): semitone ratio 2^(1/12). Octave: {NOTE_NAMES.slice(0, 4).join(" ")}… —
        each octave doubles the frequency.
      </div>
    </div>
  );
}
