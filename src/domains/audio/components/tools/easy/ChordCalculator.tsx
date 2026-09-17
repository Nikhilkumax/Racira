"use client";

/**
 * Chord Calculator — spell any chord from a root and quality. Spelling uses
 * letter arithmetic so Eb7 reads Eb–G–Bb–Db, never D# (buildChord,
 * Node-verified).
 */

import { useState } from "react";

import { buildChord, CHORD_QUALITIES } from "@/domains/audio/lib/theory";

const QUALITY_LABELS: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  dim: "Diminished",
  aug: "Augmented",
  sus2: "Suspended 2nd",
  sus4: "Suspended 4th",
  maj7: "Major 7th",
  min7: "Minor 7th",
  dom7: "Dominant 7th",
  m7b5: "Half-diminished (m7♭5)",
  dim7: "Diminished 7th",
  maj6: "Major 6th",
  min6: "Minor 6th",
  add9: "Add 9",
  dom9: "Dominant 9th",
};

export default function ChordCalculator() {
  const [root, setRoot] = useState("Eb3");
  const [quality, setQuality] = useState("dom7");

  const chord = buildChord(root, quality);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Root note</span>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            placeholder="C4, Eb3, F#2"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Quality</span>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {Object.keys(CHORD_QUALITIES).map((q) => (
              <option key={q} value={q}>
                {QUALITY_LABELS[q] ?? q}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        {chord ? (
          <>
            <p className="text-lg font-bold text-foreground">
              {chord.tones.map((t) => t.name.replace(/\d+$/, "")).join(" · ")}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pr-4 font-medium">Tone</th>
                    <th className="pr-4 font-medium">MIDI</th>
                    <th className="font-medium">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {chord.tones.map((t, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="py-1.5 pr-4 font-medium text-foreground">{t.name}</td>
                      <td className="py-1.5 pr-4 font-mono text-muted-foreground">{t.midi}</td>
                      <td className="py-1.5 font-mono text-muted-foreground">{t.freq.toFixed(2)} Hz</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a root like C4, Eb3 or F#2.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Spellings follow the root letter (Eb7 = Eb G Bb Db) — the same chord spelled from D# would
        be D# F## A# C#.
      </p>
    </div>
  );
}
