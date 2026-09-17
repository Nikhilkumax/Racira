"use client";

/**
 * Scale Generator — spelled scales in any of 12 modes/qualities, with a
 * rendered WAV of the scale (generateNoteSequence, Node-verified). Spelling
 * is letter-arithmetic correct (F# major = F# G# A# B C# D# E#).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateNoteSequence, type Generated } from "@/domains/audio/lib/generate";
import { buildScale, SCALE_MODES } from "@/domains/audio/lib/theory";

export default function ScaleGenerator() {
  const [root, setRoot] = useState("C4");
  const [mode, setMode] = useState("Major (Ionian)");
  const [stepSec, setStepSec] = useState(0.4);

  const scale = buildScale(root, mode);

  const generate = useCallback(
    (sampleRate: number): Generated => {
      if (!scale) return { channels: [new Float32Array(sampleRate)], sampleRate, length: sampleRate };
      return generateNoteSequence(sampleRate, {
        midis: scale.map((n) => n.midi),
        stepSec,
        amplitude: 0.7,
        gate: 0.9,
      });
    },
    [scale, stepSec],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="scale"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {root} {mode} · {scale?.length ?? 0} notes · {stepSec} s/note · {(scale?.length ?? 0) * stepSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Root</span>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            placeholder="C4, F#4, Bb3"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {Object.keys(SCALE_MODES).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Note length (s)</span>
          <input
            type="number"
            min={0.1}
            max={2}
            step={0.05}
            value={stepSec}
            onChange={(e) => setStepSec(Math.max(0.1, Math.min(2, Number(e.target.value) || 0.4)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-muted/50 p-4">
        {scale ? (
          <p className="text-lg font-bold text-foreground">
            {scale.map((n) => n.name.replace(/\d+$/, "")).join(" · ")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a root like C4, F#4 or Bb3.</p>
        )}
      </div>
    </GeneratorToolShell>
  );
}
