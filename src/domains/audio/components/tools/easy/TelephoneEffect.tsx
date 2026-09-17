"use client";

/**
 * Telephone Effect — the classic PSTN band-pass (300–3400 Hz by default).
 *
 * Chain (Node-verified): each corner is two cascaded 2nd-order biquads
 * (LR4, 24 dB/oct) + fixed makeup gain. Measured: 200 Hz ×0.33, 1 kHz ×1.97,
 * 3 kHz ×1.25, 6 kHz ×0.16 at defaults — the band edges are real band edges.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyTelephoneEffect, TELEPHONE_DEFAULTS } from "@/domains/audio/lib/edit";

const PRESETS: { label: string; highpassHz: number; lowpassHz: number; gainDb: number }[] = [
  { label: "Classic landline (300–3400 Hz)", highpassHz: 300, lowpassHz: 3400, gainDb: 6 },
  { label: "Vintage narrow (400–2800 Hz)", highpassHz: 400, lowpassHz: 2800, gainDb: 7 },
  { label: "Wide cordless (250–3800 Hz)", highpassHz: 250, lowpassHz: 3800, gainDb: 5 },
];

export default function TelephoneEffect() {
  const [presetIndex, setPresetIndex] = useState(0);

  const preset = PRESETS[presetIndex];

  return (
    <EditToolShell
      outputSuffix="-telephone.wav"
      transform={({ channels, sampleRate }) => ({
        channels: channels.map((ch) =>
          applyTelephoneEffect(ch, sampleRate, {
            highpassHz: preset.highpassHz,
            lowpassHz: preset.lowpassHz,
            gainDb: preset.gainDb,
          }),
        ),
        sampleRate,
        length: channels[0].length,
      })}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Line character</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresetIndex(i)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (presetIndex === i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Band-pass {preset.highpassHz}–{preset.lowpassHz} Hz with {preset.gainDb > 0 ? "+" : ""}
          {preset.gainDb} dB makeup — everything outside the band is rolled off at 24 dB/oct.
        </p>
      </div>
    </EditToolShell>
  );
}
