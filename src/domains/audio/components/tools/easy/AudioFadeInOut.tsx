"use client";

/**
 * Audio Fade In/Out — smooth fade-in and fade-out with curve choice
 * (applyFadeIn/applyFadeOut, Node-verified: linear, exponential, equal-power).
 * The last/first sample always lands on exact silence, so downloads never end
 * in a click.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyFadeIn, applyFadeOut, type FadeCurve } from "@/domains/audio/lib/edit";

const CURVES: { id: FadeCurve; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "exponential", label: "Exponential" },
  { id: "equalPower", label: "Equal power" },
];

export default function AudioFadeInOut() {
  const [fadeInSec, setFadeInSec] = useState(2);
  const [fadeOutSec, setFadeOutSec] = useState(3);
  const [curve, setCurve] = useState<FadeCurve>("linear");
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const flat = channels.map((ch) => ch.slice());
        const dur = length / sampleRate;
        const inSamples = Math.round(Math.min(fadeInSec, dur / 2) * sampleRate);
        const outSamples = Math.round(Math.min(fadeOutSec, dur / 2) * sampleRate);
        applyFadeIn(flat, inSamples, curve);
        applyFadeOut(flat, outSamples, curve);
        setReport(
          `Fade in ${ (inSamples / sampleRate).toFixed(2) } s · fade out ${(outSamples / sampleRate).toFixed(2) } s · ${curve} curve · duration ${dur.toFixed(2)} s`,
        );
        return { channels: flat, sampleRate, length };
      },
    [fadeInSec, fadeOutSec, curve],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="faded"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {CURVES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurve(c.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                curve === c.id
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Fade in: {fadeInSec} s
            </span>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={fadeInSec}
              onChange={(e) => setFadeInSec(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Fade out: {fadeOutSec} s
            </span>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={fadeOutSec}
              onChange={(e) => setFadeOutSec(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Linear is the neutral choice; exponential sounds smoother because hearing
          is logarithmic; equal power keeps loudness constant through the fade (the
          crossfade curve) — good for DJ-style endings. Fades are capped at half the
          file so they can never collide.
        </p>
      </div>
    </EditToolShell>
  );
}
