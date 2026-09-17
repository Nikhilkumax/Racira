"use client";

/**
 * Echo / Delay Generator — feedback delay with tempo presets.
 *
 * Uses applyEcho() (Node-verified): out[i] = dry[i] + mix·e[i],
 * e[i] = dry[i−d] + fb·e[i−d]. An impulse yields echo taps at every
 * multiple of the delay with amplitudes mix, mix·fb, mix·fb², …
 */

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyEcho } from "@/domains/audio/lib/edit";

const TIME_PRESETS: { label: string; ms: number }[] = [
  { label: "Slapback 80 ms", ms: 80 },
  { label: "1/8 · 250 ms", ms: 250 },
  { label: "Dotted 1/8 · 375 ms", ms: 375 },
  { label: "Quarter · 500 ms", ms: 500 },
];

export default function EchoDelayGenerator() {
  const [delayMs, setDelayMs] = useState(250);
  const [feedback, setFeedback] = useState(0.35);
  const [mix, setMix] = useState(0.4);
  const [taps, setTaps] = useState<{ delayMs: number; count: number } | null>(null);

  return (
    <EditToolShell
      outputSuffix="-echo.wav"
      transform={({ channels, sampleRate }) => {
        const delaySamples = Math.round((delayMs / 1000) * sampleRate);
        // Echoes visible inside the file length: the largest n with
        // n·delay < length (the geometric tail past the end is dropped,
        // exactly as the lib documents).
        const count = delaySamples > 0 ? Math.floor((channels[0].length - 1) / delaySamples) : 0;
        setTaps({ delayMs, count });
        return {
          channels: channels.map((ch) => applyEcho(ch, sampleRate, { delayMs, feedback, mix })),
          sampleRate,
          length: channels[0].length,
        };
      }}
      footer={
        taps ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Echo every {taps.delayMs} ms; {taps.count} repeat{taps.count === 1 ? "" : "s"} fall inside this file at{" "}
            {(feedback * 100).toFixed(0)}% feedback ({((1 - Math.pow(feedback, taps.count + 1)) / (1 - feedback)).toFixed(2)}×
            summed tap energy at 100% wet).
          </div>
        ) : undefined
      }
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Delay time <span className="text-muted-foreground">({delayMs} ms)</span>
          </p>
          <input
            type="range"
            min={20}
            max={1200}
            step={5}
            value={delayMs}
            onChange={(e) => setDelayMs(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Delay time in milliseconds"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.ms}
                type="button"
                onClick={() => setDelayMs(preset.ms)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (delayMs === preset.ms
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Feedback <span className="text-muted-foreground">({(feedback * 100).toFixed(0)}%)</span>
            </p>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={feedback * 100}
              onChange={(e) => setFeedback(Number(e.target.value) / 100)}
              className="mt-3 w-full accent-[hsl(var(--primary))]"
              aria-label="Echo feedback"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Echo level</p>
            <div className="mt-3 flex items-center gap-2">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={mix * 100}
                onChange={(e) => setMix(Number(e.target.value) / 100)}
                className="w-full accent-[hsl(var(--primary))]"
                aria-label="Echo wet mix"
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </EditToolShell>
  );
}
