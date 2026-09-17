"use client";

/**
 * Key Signature Identifier — how many sharps or flats identify a key.
 * Interactive both ways: pick a signature to see the key, or pick a key to
 * see its signature (keyFromSignature, Node-verified against the canonical
 * sharp/flat orders and relative minors).
 */

import { useState } from "react";

import { keyFromSignature } from "@/domains/audio/lib/theory";

export default function KeySignatureIdentifier() {
  // Modes: "sig" = pick accidental count → key; "key" = pick key → signature.
  const [mode, setMode] = useState<"sig" | "key">("sig");
  const [sharps, setSharps] = useState(0);
  const [flats, setFlats] = useState(0);
  const [keyInput, setKeyInput] = useState("E♭");

  const fromSig = keyFromSignature(sharps, flats);
  const knownSigKeys = [
    "C", "G", "D", "A", "E", "B", "F♯", "C♯",
    "F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭",
  ];
  const fromKey = knownSigKeys.includes(keyInput)
    ? keyFromSignature(
        knownSigKeys.indexOf(keyInput) < 8 ? knownSigKeys.indexOf(keyInput) : 0,
        knownSigKeys.indexOf(keyInput) < 8 ? 0 : knownSigKeys.indexOf(keyInput) - 7,
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("sig")}
          className={`rounded-md px-3 py-1.5 ${mode === "sig" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Signature → Key
        </button>
        <button
          type="button"
          onClick={() => setMode("key")}
          className={`rounded-md px-3 py-1.5 ${mode === "key" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Key → Signature
        </button>
      </div>

      {mode === "sig" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">Sharps (0–7)</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setSharps(n); setFlats(0); }}
                    className={`h-9 w-9 rounded-md border text-sm font-semibold ${
                      sharps === n && flats === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">Flats (0–7)</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setFlats(n); setSharps(0); }}
                    className={`h-9 w-9 rounded-md border text-sm font-semibold ${
                      flats === n && sharps === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            {fromSig ? (
              <>
                <p className="text-xl font-bold text-foreground">
                  {fromSig.major} major / {fromSig.minor}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fromSig.accidentals.length === 0
                    ? "No accidentals (open key)."
                    : `Accidentals in order: ${fromSig.accidentals.join(", ")}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-destructive">A signature has either sharps or flats — not both.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Major key</span>
            <select
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full max-w-xs rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
            >
              {knownSigKeys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>

          <div className="rounded-lg bg-muted/50 p-4">
            {fromKey ? (
              <>
                <p className="text-xl font-bold text-foreground">
                  {fromKey.accidentals.length === 0
                    ? "No accidentals"
                    : `${fromKey.accidentals.length} ${fromKey.accidentals[0].includes("♯") ? "sharps" : "flats"}`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fromKey.accidentals.length === 0
                    ? `${keyInput} major / ${fromKey.minor}`
                    : `In order: ${fromKey.accidentals.join(", ")} — relative minor: ${fromKey.minor}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a key above.</p>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Sharp order: F♯ C♯ G♯ D♯ A♯ E♯ B♯ · Flat order: B♭ E♭ A♭ D♭ G♭ C♭ F♭ — each accidental is a
        fifth above (or below) the previous.
      </p>
    </div>
  );
}
