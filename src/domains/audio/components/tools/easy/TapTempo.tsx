"use client";

/**
 * Tap Tempo — tap a pad in time with the music; the median of the inter-tap
 * intervals gives the tempo (bpmFromTaps, Node-verified: a stray double- or
 * missed tap can't swing the result).
 */

import { useRef, useState } from "react";

import { bpmFromTaps } from "@/domains/audio/lib/calc";

const MAX_TAPS = 32;

export default function TapTempo() {
  const [taps, setTaps] = useState<number[]>([]);
  const lastTapRef = useRef(0);

  const tap = () => {
    const now = performance.now();
    // Debounce accidental double-fires within 60 ms.
    if (now - lastTapRef.current < 60) return;
    lastTapRef.current = now;
    setTaps((prev) => [...prev.slice(-(MAX_TAPS - 1)), now]);
  };

  const reset = () => {
    setTaps([]);
    lastTapRef.current = 0;
  };

  const bpm = bpmFromTaps(taps);
  const lastInterval = taps.length >= 2 ? taps[taps.length - 1] - taps[taps.length - 2] : 0;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={tap}
        className="w-full select-none rounded-xl bg-primary py-10 text-lg font-bold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
      >
        TAP
      </button>

      <div className="rounded-lg bg-muted/50 p-4 text-center">
        {taps.length >= 2 && bpm > 0 ? (
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">
              {bpm.toFixed(1)} <span className="text-base font-medium text-muted-foreground">BPM</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {taps.length} taps · last interval {lastInterval.toFixed(0)} ms
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap at least twice (keep tapping for a steadier reading).
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Median-based, so one missed or doubled tap won&apos;t skew the result.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
