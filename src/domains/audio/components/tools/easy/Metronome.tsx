"use client";

/**
 * Metronome — wood-block accents on bar starts, ticks on other beats,
 * configurable beats per bar (generateMetronome, Node-verified accent
 * pattern and tick placement).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateMetronome, type Generated } from "@/domains/audio/lib/generate";

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [beats, setBeats] = useState(32);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [blockHz, setBlockHz] = useState(2000);
  const [amplitudePct, setAmplitudePct] = useState(85);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateMetronome(sampleRate, { bpm, beats, beatsPerBar, blockHz, amplitude: amplitudePct / 100 }),
    [bpm, beats, beatsPerBar, blockHz, amplitudePct],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="metronome"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {bpm} BPM · {beatsPerBar}/4 · {Math.floor(beats / beatsPerBar)} bars ·{" "}
          {(beats * (60 / bpm)).toFixed(1)} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tempo (BPM)</span>
          <input
            type="number"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Math.max(20, Math.min(300, Number(e.target.value) || 120)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Beats</span>
          <input
            type="number"
            min={4}
            max={512}
            value={beats}
            onChange={(e) => setBeats(Math.max(4, Math.min(512, Number(e.target.value) || 32)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Beats per bar</span>
          <select
            value={beatsPerBar}
            onChange={(e) => setBeatsPerBar(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value={2}>2/4</option>
            <option value={3}>3/4</option>
            <option value={4}>4/4</option>
            <option value={5}>5/4</option>
            <option value={6}>6/8</option>
            <option value={7}>7/8</option>
            <option value={12}>12/8</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Accent pitch (Hz)</span>
          <input
            type="number"
            min={500}
            max={4000}
            value={blockHz}
            onChange={(e) => setBlockHz(Math.max(500, Math.min(4000, Number(e.target.value) || 2000)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Amplitude ({amplitudePct}%)</span>
          <input
            type="range"
            min={1}
            max={100}
            value={amplitudePct}
            onChange={(e) => setAmplitudePct(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </label>
      </div>
    </GeneratorToolShell>
  );
}
