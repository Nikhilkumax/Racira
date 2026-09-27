"use client";

/**
 * Phase Meter — stereo phase correlation readout (stereoCorrelation,
 * Node-verified 13/13: identical +1, inverted −1, decorrelated ~0, silence
 * NaN-guarded). Shows the whole-file correlation, its trend across quarters,
 * and the L/R balance.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

import { decodeFileToChannels } from "@/domains/audio/lib/edit";
import { stereoCorrelation } from "@/domains/audio/lib/meters";

export default function PhaseMeter() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ corr: number; trend: [number, number, number, number]; balance: number } | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        if (decoded.channels.length < 2) {
          setError("Stereo analysis needs a stereo file (this one is mono).");
          setResult(null);
        } else {
          const [l, r] = decoded.channels;
          const res = stereoCorrelation(l, r);
          setResult({ corr: res.correlation, trend: res.trend, balance: res.balanceDb });
        }
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const label = (c: number) =>
    c > 0.9 ? "effectively mono" : c > 0.3 ? "correlated" : c > -0.3 ? "wide / decorrelated" : c > -0.95 ? "out of phase in places" : "polarity inverted";

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose a stereo audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      {busy && <Loader2 className="size-4 animate-spin" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold">{result.corr.toFixed(3)}</span>
            <span className="text-sm text-muted-foreground">{label(result.corr)}</span>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">correlation</div>
            <div className="relative h-3 rounded bg-muted">
              <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/40" />
              <div
                className="absolute top-0 h-full rounded bg-primary"
                style={{
                  left: result.corr >= 0 ? "50%" : `${50 + result.corr * 50}%`,
                  width: `${Math.abs(result.corr) * 50}%`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>−1 anti-phase</span><span>0 wide</span><span>+1 mono</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {result.trend.map((t, i) => (
              <div key={i} className="rounded border p-2">
                <div className="text-muted-foreground">Q{i + 1}</div>
                <div className="font-medium">{Number.isNaN(t) ? "—" : t.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            L/R balance: {Number.isNaN(result.balance) ? "—" : `${result.balance > 0 ? "+" : ""}${result.balance.toFixed(2)} dB (L relative to R)`}
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Mono-compatibility check: values near +1 collapse safely to mono; near
        −1 the sides cancel in mono (a real polarity problem). Trend shows how
        the stereo image moves across the file.
      </p>
    </div>
  );
}
