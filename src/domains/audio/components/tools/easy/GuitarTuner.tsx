"use client";

/**
 * Guitar Tuner — live mic tuner locked to standard guitar tuning
 * (E2 A2 D3 G3 B3 E4, presets in calc.ts, Node-verified). Pitch detection is
 * estimateFundamental (normalized autocorrelation, Node-verified octave-safe)
 * through the shared useLivePitch hook; this component renders the six
 * strings and the cents needle. Bass players: the instrument switch swaps to
 * the 4-string bass preset.
 */

import { useMemo, useState } from "react";
import { Mic, MicOff, CircleAlert } from "lucide-react";

import { useLivePitch } from "@/domains/audio/components/tools/shared/useLivePitch";
import { TUNER_PRESETS, tunerCents } from "@/domains/audio/lib/calc";

export default function GuitarTuner() {
  const [bass, setBass] = useState(false);
  const preset = bass ? TUNER_PRESETS["bass-4"] : TUNER_PRESETS.guitar;
  const { hz, confidence, listening, error, start, stop } = useLivePitch(40, 500);

  const reading = useMemo(() => (listening ? tunerCents(hz, preset) : null), [listening, hz, preset]);

  // Needle position: −50…+50 cents maps to 0…100%.
  const needlePct = reading ? Math.max(0, Math.min(100, ((reading.cents + 50) / 100) * 100)) : 50;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setBass(false)}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
              (!bass ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            Guitar (6)
          </button>
          <button
            type="button"
            onClick={() => setBass(true)}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
              (bass ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            Bass (4)
          </button>
        </div>

        <button
          type="button"
          onClick={() => (listening ? stop() : void start())}
          className={
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
            (listening
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground")
          }
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {listening ? "Stop" : "Start listening"}
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {/* Needle: center = in tune */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="relative h-2 rounded-full bg-muted">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-foreground/40" />
          <div
            className={
              "absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-100 " +
              (reading?.inTune ? "bg-green-500" : "bg-amber-500")
            }
            style={{ left: `${needlePct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>−50 ¢</span>
          <span>in tune</span>
          <span>+50 ¢</span>
        </div>

        <div className="mt-4 text-center">
          {reading ? (
            <>
              <p className="text-4xl font-bold text-foreground">
                {reading.targetNote}
                <span className={"ml-3 align-middle text-lg font-semibold " + (reading.inTune ? "text-green-600" : reading.cents < 0 ? "text-amber-600" : "text-amber-600")}>
                  {reading.cents > 0 ? "+" : ""}{reading.cents.toFixed(1)} ¢
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {reading.hz.toFixed(1)} Hz detected · target {reading.targetHz.toFixed(2)} Hz · tune{" "}
                <span className="font-medium text-foreground">{reading.direction}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {listening
                ? confidence > 0
                  ? "Listening — play a single open string clearly…"
                  : "Listening — play a string…"
                : "Start the tuner and play one open string at a time."}
            </p>
          )}
        </div>
      </div>

      {/* String targets */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {preset.map((s) => {
          const active = reading?.targetNote === s.note;
          return (
            <div
              key={s.note}
              className={
                "rounded-xl border p-3 text-center transition-colors " +
                (active
                  ? reading?.inTune
                    ? "border-green-500 bg-green-500/10"
                    : "border-amber-500 bg-amber-500/10"
                  : "border-border bg-card")
              }
            >
              <p className="text-lg font-bold text-foreground">{s.note}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{s.hz.toFixed(2)} Hz</p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Everything runs locally — the mic feed is analysed in the page and never recorded or uploaded.
        Detection is octave-safe autocorrelation; if a reading looks an octave off, move closer and
        pluck a single string.
      </p>
    </div>
  );
}
