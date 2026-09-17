"use client";

/**
 * Hearing Aid Frequency Reference — an educational guide to the bands a
 * hearing-aid fitting conversation revolves around. All content lives in
 * calc.ts (HEARING_AID_BANDS, VOWEL_FORMANTS, phonemeBand,
 * sensationLevelDb — Batch-18 Node-verified). Not a fitting tool: the page
 * says plainly that prescriptions are individual.
 */

import { useMemo, useState } from "react";

import {
  HEARING_AID_BANDS,
  VOWEL_FORMANTS,
  phonemeBand,
  sensationLevelDb,
} from "@/domains/audio/lib/calc";

const BAND_PX = 64; // chart width per band
const F_MIN = 125;
const F_MAX = 10000;

/** Log-frequency x position (0–1) for a Hz value. */
function logPos(hz: number): number {
  return (Math.log2(hz / F_MIN) / Math.log2(F_MAX / F_MIN));
}

export default function HearingAidFrequencyReference() {
  const [sliderHz, setSliderHz] = useState(3000);
  const [presentationDb, setPresentationDb] = useState(60);
  const [thresholdDb, setThresholdDb] = useState(45);

  const band = useMemo(() => phonemeBand(sliderHz), [sliderHz]);
  const sl = sensationLevelDb(presentationDb, thresholdDb);

  return (
    <div className="space-y-6">
      {/* Band chart: log-frequency axis with importance-tinted columns */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-foreground">The eight fitting bands</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Column shading = how critical the band typically is for speech understanding (darker =
          more critical). Speech sounds and vowels are marked where they live.
        </p>

        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex" style={{ minWidth: HEARING_AID_BANDS.length * BAND_PX }}>
            {HEARING_AID_BANDS.map((b, i) => {
              // Edges are the geometric means of adjacent centers — the same
              // partition phonemeBand() uses — so the chart and the lookup
              // can never disagree about where a band ends.
              const lo = i === 0 ? F_MIN : Math.sqrt(b.hz * HEARING_AID_BANDS[i - 1].hz);
              const hi = i + 1 < HEARING_AID_BANDS.length
                ? Math.sqrt(b.hz * HEARING_AID_BANDS[i + 1].hz)
                : F_MAX;
              const wPct = (logPos(hi) - logPos(lo)) * 100;
              const active = b.hz === band.hz;
              return (
                <div
                  key={b.hz}
                  data-testid={`band-${b.hz}`}
                  style={{
                    width: `${Math.max(4, wPct)}%`,
                    background: `hsl(var(--primary) / ${0.08 + b.importance * 0.13})`,
                  }}
                  className={
                    "min-w-[64px] border-r border-border/60 px-2 py-2 text-center " +
                    (active ? "ring-2 ring-inset ring-primary" : "")
                  }
                >
                  <div className="font-mono text-[11px] font-semibold text-foreground">
                    {b.hz >= 1000 ? `${b.hz / 1000}k` : b.hz}
                  </div>
                  <div className="mt-1 flex justify-center gap-[2px]">
                    {Array.from({ length: b.importance }, (_, k) => (
                      <span key={k} className="inline-block h-1 w-1 rounded-full bg-primary" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Vowel formant markers */}
          <div className="relative mt-2 h-10" style={{ minWidth: HEARING_AID_BANDS.length * BAND_PX }}>
            {VOWEL_FORMANTS.map((v) => (
              <div
                key={v.vowel}
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-center"
                style={{ left: `${logPos(v.f2) * 100}%` }}
                title={`${v.vowel} — F1 ${v.f1} Hz (openness), F2 ${v.f2} Hz (frontness) — say "${v.example}"`}
              >
                <div className="mx-auto h-4 w-px bg-primary/60" />
                <div className="text-[10px] font-medium text-muted-foreground">{v.vowel}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground" style={{ minWidth: HEARING_AID_BANDS.length * BAND_PX }}>
            <span>125 Hz</span>
            <span>500</span>
            <span>1k</span>
            <span>2k</span>
            <span>4k</span>
            <span>10k</span>
          </div>
        </div>

        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          {VOWEL_FORMANTS.slice(0, 4).map((v) => (
            <p key={v.vowel}>
              <span className="font-medium text-foreground">{v.vowel}</span> — F1 {v.f1} Hz (openness), F2{" "}
              {v.f2} Hz (frontness) — say &ldquo;{v.example}&rdquo;
            </p>
          ))}
        </div>
      </div>

      {/* Interactive band explorer */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-foreground">Explore a frequency</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5 sm:col-span-1">
            <span className="text-xs font-medium text-muted-foreground">
              Frequency: <span className="font-mono text-foreground">{Math.round(sliderHz)} Hz</span>
            </span>
            <input
              type="range"
              min={125}
              max={10000}
              step={5}
              value={sliderHz}
              onChange={(e) => setSliderHz(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
              aria-label="Frequency to look up"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Tone level: <span className="font-mono text-foreground">{presentationDb} dB SPL</span>
            </span>
            <input
              type="range"
              min={20}
              max={90}
              step={1}
              value={presentationDb}
              onChange={(e) => setPresentationDb(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
              aria-label="Tone presentation level"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Your threshold here: <span className="font-mono text-foreground">{thresholdDb} dB HL</span>
            </span>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={thresholdDb}
              onChange={(e) => setThresholdDb(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
              aria-label="Hearing threshold at this frequency"
            />
          </label>
        </div>

        <div data-testid="band-explain" className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-semibold text-foreground">
            {Math.round(sliderHz)} Hz → {band.hz >= 1000 ? `${band.hz / 1000} kHz` : `${band.hz} Hz`} band
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{band.speechContent}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Fitting note:</span> {band.fittingNote}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            A {presentationDb} dB tone here with a {thresholdDb} dB threshold sits{" "}
            <span className={"font-mono font-semibold " + (sl > 0 ? "text-foreground" : "text-destructive")}>
              {sl} dB
            </span>{" "}
            above threshold{sl === 0 ? " — below threshold, likely inaudible" : ""}. (Rough guide —
            loudness perception varies with frequency.)
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        This reference explains what each band carries. It is not a fitting: real prescriptions
        come from your audiogram and your audiologist. Values use average adult vowel formants
        (Peterson &amp; Barney, 1952).
      </p>
    </div>
  );
}
