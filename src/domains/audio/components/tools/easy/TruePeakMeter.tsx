"use client";

/**
 * True Peak Meter — sample peak vs estimated true peak (truePeakDbfs,
 * Node-verified 13/13: recovers a half-sample-offset crest from −3.01 dB to
 * ~0 dB via 4× band-limited sinc oversampling; linear interpolation proven
 * vacuous this batch). Reports both, plus headroom against 0 dBFS and the
 * common −1 dBTP delivery target.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

import { decodeFileToChannels } from "@/domains/audio/lib/edit";
import { truePeakDbfs } from "@/domains/audio/lib/meters";

export default function TruePeakMeter() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ sp: number; tp: number; channels: number } | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        // worst (highest) peak across channels
        let sp = -Infinity, tp = -Infinity;
        for (const ch of decoded.channels) {
          const t = truePeakDbfs(ch);
          sp = Math.max(sp, t.samplePeakDb);
          tp = Math.max(tp, t.truePeakDb);
        }
        setResult({ sp, tp, channels: decoded.channels.length });
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
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      {busy && <Loader2 className="size-4 animate-spin" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Sample peak</div>
              <div className="text-3xl font-semibold">{result.sp.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">dBFS</span></div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">True peak (est.)</div>
              <div className="text-3xl font-semibold">{result.tp.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">dBTP</span></div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Headroom to 0 dBTP: {(-result.tp).toFixed(2)} dB · to −1 dBTP delivery: {(-1 - result.tp).toFixed(2)} dB</p>
            {result.tp > -0.1 && <p className="text-destructive">At or above full scale — inter-sample clipping likely on DA conversion.</p>}
            {result.tp > -1 && result.tp <= -0.1 && <p>Below full scale but above the −1 dBTP streaming target.</p>}
            {result.tp <= -1 && <p>Meets the common −1 dBTP delivery target.</p>}
          </div>
          <p className="text-xs text-muted-foreground">{result.channels} channel(s) analyzed; worst channel shown.</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        True peak estimates the analog level between digital samples —
        near-Nyquist material can reconstruct up to ~3 dB hotter than the
        samples show, which is why loudness-normalized masters specify −1 dBTP.
      </p>
    </div>
  );
}
