"use client";

/**
 * Correlation Meter — the broadcast-style stereo correlation meter
 * (stereoCorrelation, Node-verified 13/13). Same truth as the Phase Meter,
 * presented as the classic needle-style horizontal meter with a running
 * history across the file's quarters.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

import { decodeFileToChannels } from "@/domains/audio/lib/edit";
import { stereoCorrelation } from "@/domains/audio/lib/meters";

export default function CorrelationMeter() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ corr: number; trend: [number, number, number, number] } | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        if (decoded.channels.length < 2) {
          setError("Correlation needs a stereo file (this one is mono).");
          setResult(null);
        } else {
          const res = stereoCorrelation(decoded.channels[0], decoded.channels[1]);
          setResult({ corr: res.correlation, trend: res.trend });
        }
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose a stereo audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      {busy && <Loader2 className="size-4 animate-spin" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-4">
          <div className="relative h-10 rounded-lg border bg-muted/40">
            {/* meter track: -1 .. +1 with center zero */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/30" />
            <div
              className="absolute inset-y-2 rounded bg-primary transition-all"
              style={{
                left: result.corr >= 0 ? "50%" : `${50 + result.corr * 50}%`,
                width: `${Math.abs(result.corr) * 50}%`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] text-muted-foreground">
              <span>−1</span><span>−0.5</span><span>0</span><span>+0.5</span><span>+1</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{result.corr.toFixed(3)}</span>
            <span className="text-xs text-muted-foreground">
              {result.corr > 0.7 ? "highly correlated — mono-safe" : result.corr < -0.5 ? "dangerous anti-phase content" : "healthy stereo spread"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {result.trend.map((t, i) => (
              <div key={i} className="rounded border p-2">
                <div className="text-muted-foreground">segment {i + 1}</div>
                <div className="font-medium">{Number.isNaN(t) ? "—" : t.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Broadcast masters keep correlation above roughly 0 for mono-TV
        compatibility; dance music typically sits +0.3 to +0.8, wide ambient
        can hover near 0.
      </p>
    </div>
  );
}
