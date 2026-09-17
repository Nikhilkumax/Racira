"use client";

/**
 * Harmonizer — generate a harmony voice by pitch-shifting a copy of the input
 * by a musical interval and mixing it under the original (resampleLinear +
 * olaTimeStretch chain, both Node-verified). Interval is chosen in semitones
 * from the chord/interval table; +3/+4 = third, +7 = fifth, +12 = octave.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { resampleLinear, olaTimeStretch } from "@/domains/audio/lib/edit";

const INTERVALS: { semitones: number; label: string }[] = [
  { semitones: 3, label: "+3 · minor third above" },
  { semitones: 4, label: "+4 · major third above" },
  { semitones: 7, label: "+7 · fifth above" },
  { semitones: 12, label: "+12 · octave above" },
  { semitones: -5, label: "−5 · fourth below" },
  { semitones: -12, label: "−12 · octave below" },
];

export default function Harmonizer() {
  const [semitones, setSemitones] = useState(4);
  const [mix, setMix] = useState(50);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const f = Math.pow(2, semitones / 12);
        const harmony = channels.map((ch) => {
          const shifted = resampleLinear(ch, f);
          return olaTimeStretch(shifted, f);
        });
        const m = mix / 100;
        const out = channels.map((ch, c) => {
          const o = new Float32Array(ch.length);
          for (let i = 0; i < ch.length; i++) {
            o[i] = ch[i] * (1 - m * 0.5) + (harmony[c]?.[i] ?? harmony[0][i]) * (m * 0.5);
          }
          return o;
        });
        setReport(
          `Harmony ${semitones > 0 ? "+" : ""}${semitones} semitones (×${f.toFixed(4)}) blended at ${mix}%`,
        );
        return { channels: out, sampleRate, length };
      },
    [semitones, mix],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="harmony"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {INTERVALS.map((iv) => (
            <button
              key={iv.semitones}
              type="button"
              onClick={() => setSemitones(iv.semitones)}
              className={`rounded-lg border px-3 py-1.5 text-left text-sm ${
                semitones === iv.semitones
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Harmony level: {mix}% ({100 - mix}% original)
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={mix}
            onChange={(e) => setMix(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          The harmony is a parallel interval above or below the melody — pick the
          interval that fits the song's key. This is a fixed-interval shift, not
          an intelligent auto-harmony that tracks chords (that would need polyphonic
          pitch detection we deliberately don't ship in the browser).
        </p>
      </div>
    </EditToolShell>
  );
}
