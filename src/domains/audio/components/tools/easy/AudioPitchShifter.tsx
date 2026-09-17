"use client";

/**
 * Audio Pitch Shifter — change pitch without changing speed
 * (resampleLinear + olaTimeStretch, both Node-verified). The chain is the
 * classic two-step: resample by f (pitch ×f, duration ÷f), then WSOLA-stretch
 * by f back to the original duration. Output length equals input length.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { resampleLinear, olaTimeStretch } from "@/domains/audio/lib/edit";
import { freqToMidi, nearestNote } from "@/domains/audio/lib/calc";

export default function AudioPitchShifter() {
  const [semitones, setSemitones] = useState(2);
  const [cents, setCents] = useState(0);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const total = semitones + cents / 100;
        const f = Math.pow(2, total / 12);
        const out = channels.map((ch) => {
          const shifted = resampleLinear(ch, f); // pitch ×f, duration ÷f
          return olaTimeStretch(shifted, f); // duration ×f back, pitch kept
        });
        // Nearest note reference at +A440 for the shift amount.
        const shiftedHz = 440 * f;
        const note = nearestNote(shiftedHz);
        setReport(
          `Shift ${total >= 0 ? "+" : ""}${total.toFixed(2)} semitones (×${f.toFixed(4)}) · 440 Hz → ${note ? note.name : shiftedHz.toFixed(1) + " Hz"} · length preserved (${(length / sampleRate).toFixed(2)} s)`,
        );
        return { channels: out, sampleRate, length };
      },
    [semitones, cents],
  );
  void freqToMidi;

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="pitch-shifted"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Semitones: {semitones > 0 ? "+" : ""}{semitones}
          </span>
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={semitones}
            onChange={(e) => setSemitones(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Fine-tune: {cents > 0 ? "+" : ""}{cents} cents
          </span>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={cents}
            onChange={(e) => setCents(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Duration is preserved exactly; pitch moves by the chosen interval. Small
          shifts (±3 semitones) are the most transparent — large shifts on complex
          material can sound slightly smeared, which is inherent to time-domain
          stretching.
        </p>
      </div>
    </EditToolShell>
  );
}
