"use client";

/**
 * Chord Progression Builder — the diatonic triads of a key with roman
 * numerals; click chords into a progression and render it as a WAV
 * (diatonicTriads Node-verified; audio via generateNoteSequence). Roman
 * numerals update with the key/mode.
 */

import { useCallback, useMemo, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateNoteSequence, type Generated } from "@/domains/audio/lib/generate";
import { diatonicTriads } from "@/domains/audio/lib/theory";

export default function ChordProgressionBuilder() {
  const [keyRoot, setKeyRoot] = useState("C4");
  const [mode, setMode] = useState<"major" | "minor">("major");
  const [selected, setSelected] = useState<number[]>([0, 5, 3, 4]); // I–vi–IV–V
  const [bpm, setBpm] = useState(90);

  const triads = useMemo(() => diatonicTriads(keyRoot, mode), [keyRoot, mode]);

  const toggle = (i: number) => {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const generate = useCallback(
    (sampleRate: number): Generated => {
      if (!triads || selected.length === 0) {
        return { channels: [new Float32Array(sampleRate)], sampleRate, length: sampleRate };
      }
      // Render each chord as an arpeggio (one step per tone, repeated to the beat).
      const midis: number[] = [];
      for (const idx of selected) {
        const chord = triads[idx];
        for (const tone of chord.tones) midis.push(tone.midi);
      }
      return generateNoteSequence(sampleRate, {
        midis,
        stepSec: 60 / bpm / 2,
        amplitude: 0.7,
      });
    },
    [triads, selected, bpm],
  );

  const selectedNames = triads
    ? selected.map((i) => `${triads[i].roman} (${triads[i].root})`).join(" → ")
    : "";

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="progression"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {selected.length} chords · {bpm} BPM · one tone per 8th ·{" "}
          {((60 / bpm / 2) * selected.length * 3).toFixed(2)} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Key root</span>
          <input
            type="text"
            value={keyRoot}
            onChange={(e) => setKeyRoot(e.target.value)}
            placeholder="C4, A3, G4"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value === "minor" ? "minor" : "major")}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value="major">Major</option>
            <option value="minor">Natural minor</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tempo (BPM)</span>
          <input
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(Math.max(40, Math.min(240, Number(e.target.value) || 90)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          Diatonic triads — click to add to the progression:
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {(triads ?? []).map((chord, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`rounded-lg border px-2 py-3 text-center transition-colors ${
                selected.includes(i)
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent/50"
              }`}
            >
              <span className="block text-sm font-bold">{chord.roman}</span>
              <span className="block text-xs text-muted-foreground">{chord.root}</span>
              <span className="block text-[10px] text-muted-foreground">{chord.quality}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {selected.length > 0 ? selectedNames : "No chords selected — click triads above."}
      </p>
    </GeneratorToolShell>
  );
}
