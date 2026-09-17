"use client";

/**
 * Instrument Tuner — chromatic live tuner: detects any pitch from ~55 Hz to
 * 1 kHz and shows the nearest note name with the signed cents offset, plus
 * quick-reference open-string presets (guitar/bass/ukulele/violin/cello from
 * calc.ts, Node-verified) for players who want a target highlight.
 * Detection is the shared useLivePitch hook (estimateFundamental).
 */

import { useMemo, useState } from "react";
import { Mic, MicOff, CircleAlert } from "lucide-react";

import { useLivePitch } from "@/domains/audio/components/tools/shared/useLivePitch";
import { TUNER_PRESETS, nearestNote, tunerCents } from "@/domains/audio/lib/calc";

const PRESET_KEYS = [
  { key: "guitar", label: "Guitar" },
  { key: "bass-4", label: "Bass" },
  { key: "ukulele", label: "Ukulele" },
  { key: "violin", label: "Violin" },
  { key: "cello", label: "Cello" },
] as const;

export default function InstrumentTuner() {
  const [presetKey, setPresetKey] = useState<string | null>("guitar");
  const { hz, confidence, listening, error, start, stop } = useLivePitch(55, 1000);

  const nearest = useMemo(() => (hz > 0 ? nearestNote(hz) : null), [hz]);
  const presetReading = useMemo(
    () => (listening && presetKey ? tunerCents(hz, TUNER_PRESETS[presetKey]) : null),
    [listening, presetKey, hz],
  );

  const needlePct = nearest ? Math.max(0, Math.min(100, ((nearest.cents + 50) / 100) * 100)) : 50;
  const inTune = nearest !== null && Math.abs(nearest.cents) <= 5;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPresetKey(null)}
            className={
              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors " +
              (presetKey === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground")
            }
          >
            Chromatic
          </button>
          {PRESET_KEYS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPresetKey(p.key)}
              className={
                "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors " +
                (presetKey === p.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground")
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => (listening ? stop() : void start())}
          className={
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
            (listening ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground")
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

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="relative h-2 rounded-full bg-muted">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-foreground/40" />
          <div
            className={
              "absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-100 " +
              (inTune ? "bg-green-500" : "bg-amber-500")
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
          {nearest ? (
            <>
              <p className="text-4xl font-bold text-foreground">
                {nearest.name}
                <span
                  className={
                    "ml-3 align-middle text-lg font-semibold " +
                    (inTune ? "text-green-600" : "text-amber-600")
                  }
                >
                  {nearest.cents > 0 ? "+" : ""}
                  {nearest.cents.toFixed(1)} ¢
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{hz.toFixed(1)} Hz detected</p>
              {presetReading && (
                <p className="mt-1 text-sm">
                  <span
                    className={
                      "font-medium " +
                      (presetReading.inTune ? "text-green-600" : "text-amber-600")
                    }
                  >
                    {presetReading.direction === "in tune"
                      ? `${presetReading.targetNote} is in tune`
                      : `tune toward ${presetReading.targetNote} (${presetReading.direction})`}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {listening
                ? confidence > 0
                  ? "Listening — hold a steady note…"
                  : "Listening — play or sing a note…"
                : "Start the tuner and play any note — it works chromatically."}
            </p>
          )}
        </div>
      </div>

      {presetKey && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TUNER_PRESETS[presetKey].map((s) => {
            const active = presetReading?.targetNote === s.note;
            return (
              <div
                key={s.note}
                className={
                  "rounded-xl border p-3 text-center transition-colors " +
                  (active
                    ? presetReading?.inTune
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
      )}

      <p className="text-xs text-muted-foreground">
        Chromatic mode names the nearest note to whatever it hears; a preset adds the
        open-string target. Audio stays on-device — nothing is recorded.
      </p>
    </div>
  );
}
