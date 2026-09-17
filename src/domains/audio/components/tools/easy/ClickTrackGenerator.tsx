"use client";

/**
 * Click Track Generator — an exponentially decaying sine click per beat at a
 * set BPM, accents every 4th beat (generateClickTrack, Node-verified sample-
 * exact beat placement). Download the WAV and import it into any DAW.
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateClickTrack, type Generated } from "@/domains/audio/lib/generate";

export default function ClickTrackGenerator() {
  const [bpm, setBpm] = useState(120);
  const [beats, setBeats] = useState(64);
  const [accentHz, setAccentHz] = useState(1600);
  const [beatHz, setBeatHz] = useState(1000);
  const [clickMs, setClickMs] = useState(40);
  const [amplitudePct, setAmplitudePct] = useState(85);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateClickTrack(sampleRate, {
        bpm,
        beats,
        accentHz,
        beatHz,
        clickMs,
        amplitude: amplitudePct / 100,
      }),
    [bpm, beats, accentHz, beatHz, clickMs, amplitudePct],
  );

  const barCount = Math.floor(beats / 4);

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="click-track"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {bpm} BPM · {beats} beats ({Math.floor(beats / 4)} bars) · {barCount ? "accent every 4" : "no accents"} ·{" "}
          {(beats * (60 / bpm)).toFixed(1)} s total
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
            onChange={(e) => setBeats(Math.max(4, Math.min(512, Number(e.target.value) || 64)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Accent pitch (Hz)</span>
          <input
            type="number"
            min={200}
            max={4000}
            value={accentHz}
            onChange={(e) => setAccentHz(Math.max(200, Math.min(4000, Number(e.target.value) || 1600)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Beat pitch (Hz)</span>
          <input
            type="number"
            min={200}
            max={4000}
            value={beatHz}
            onChange={(e) => setBeatHz(Math.max(200, Math.min(4000, Number(e.target.value) || 1000)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Click length (ms)</span>
          <input
            type="number"
            min={10}
            max={200}
            value={clickMs}
            onChange={(e) => setClickMs(Math.max(10, Math.min(200, Number(e.target.value) || 40)))}
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
