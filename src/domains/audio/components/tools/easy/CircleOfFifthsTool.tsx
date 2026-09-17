"use client";

/**
 * Circle of Fifths Tool — interactive wheel of the 12 major keys with
 * relative minors and key signatures (circleOfFifths, Node-verified).
 * Selecting a key shows its diatonic triads via the same theory lib.
 */

import { useMemo, useState } from "react";

import { circleOfFifths, diatonicTriads } from "@/domains/audio/lib/theory";

export default function CircleOfFifthsTool() {
  const keys = circleOfFifths();
  const [selectedMajor, setSelectedMajor] = useState("C");

  const selected = keys.find((k) => k.major === selectedMajor) ?? keys[0];
  // Diatonic triads in the selected major key (parse needs an octave).
  const triads = useMemo(() => diatonicTriads(`${selectedMajor}4`, "major"), [selectedMajor]);

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-square w-full max-w-md">
        {keys.map((k) => {
          const angle = (k.position / 12) * 2 * Math.PI;
          const majorX = 50 + 42 * Math.sin(angle);
          const majorY = 50 - 42 * Math.cos(angle);
          const minorX = 50 + 24 * Math.sin(angle);
          const minorY = 50 - 24 * Math.cos(angle);
          const isSel = k.major === selectedMajor;
          return (
            <div key={k.major}>
              <button
                type="button"
                onClick={() => setSelectedMajor(k.major)}
                style={{ left: `${majorX}%`, top: `${majorY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-sm font-bold shadow-sm transition-colors ${
                  isSel
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {k.major}
                <span className="block text-[10px] font-normal text-muted-foreground">{k.signature}</span>
              </button>
              <span
                style={{ left: `${minorX}%`, top: `${minorY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs text-muted-foreground"
              >
                {k.minor.replace(" minor", "m")}
              </span>
            </div>
          );
        })}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{selected.major} major</p>
          <p>{selected.signature}</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm font-semibold text-foreground">
          {selectedMajor} major / {selected.minor} — diatonic triads
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {(triads ?? []).map((c, i) => (
            <div key={i} className="rounded-md border border-border bg-background p-2 text-center">
              <p className="text-sm font-bold text-foreground">{c.roman}</p>
              <p className="text-xs text-muted-foreground">{c.root}</p>
              <p className="text-[10px] text-muted-foreground">{c.quality}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Clockwise = ascending fifths (sharps grow); counterclockwise = fourths (flats grow). Each
        major key's relative minor sits three positions clockwise at the inner ring.
      </p>
    </div>
  );
}
