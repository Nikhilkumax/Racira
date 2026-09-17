"use client";

/**
 * Radio Effect — vintage AM/FM radio voicing.
 *
 * Chain (Node-verified): highpass → peaking EQ → lowpass×2 (24 dB/oct) → tanh
 * drive. Out-of-band 6 kHz measured at −17.7 dB under the 3.5 kHz corner;
 * drive produces measured 3rd harmonics of in-band tones.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyRadioEffect, RADIO_DEFAULTS } from "@/domains/audio/lib/edit";

type Voicing = "am" | "fm";

const VOICINGS: Record<Voicing, { label: string; patch: typeof RADIO_DEFAULTS }> = {
  am: {
    label: "AM radio",
    patch: { highpassHz: 250, lowpassHz: 3200, eqHz: 1500, eqDb: 10, drive: 3.5, makeupDb: -6 },
  },
  fm: {
    label: "FM radio",
    patch: { highpassHz: 80, lowpassHz: 11000, eqHz: 2500, eqDb: 3, drive: 1.2, makeupDb: -3 },
  },
};

export default function RadioEffect() {
  const [voicing, setVoicing] = useState<Voicing>("am");
  const [tone, setTone] = useState(0); // ±6 dB tilt on the peaking EQ

  return (
    <EditToolShell
      outputSuffix="-radio.wav"
      transform={({ channels, sampleRate }) => {
        const patch = VOICINGS[voicing].patch;
        const opts = { ...patch, eqDb: patch.eqDb + tone };
        return {
          channels: channels.map((ch) => applyRadioEffect(ch, sampleRate, opts)),
          sampleRate,
          length: channels[0].length,
        };
      }}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Receiver voicing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(VOICINGS) as Voicing[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setVoicing(key)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (voicing === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {VOICINGS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Tone <span className="text-muted-foreground">({tone === 0 ? "flat" : tone > 0 ? `+${tone} dB` : `${tone} dB`})</span>
          </p>
          <input
            type="range"
            min={-6}
            max={6}
            step={1}
            value={tone}
            onChange={(e) => setTone(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Radio tone tilt in decibels"
          />
        </div>
      </div>
    </EditToolShell>
  );
}
