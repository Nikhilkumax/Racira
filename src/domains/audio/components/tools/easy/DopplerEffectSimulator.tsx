"use client";

/**
 * Doppler Effect Simulator — constant-speed flyby (dopplerFlyby,
 * Node-verified: approaching pitch above, receding below, level peaking at
 * closest approach, symmetric). Moving-source delay line + 1/r gain +
 * bearing panning at c = 343 m/s.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { dopplerFlyby } from "@/domains/audio/lib/reverb";

export default function DopplerEffectSimulator() {
  const [speedMs, setSpeedMs] = useState(30);
  const [closestM, setClosestM] = useState(20);
  const [file, setFile] = useState<File | null>(null);
  const [audio, setAudio] = useState<{ channels: Float32Array[]; sampleRate: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; report: string } | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        setAudio(decoded);
        setResult(null);
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const run = useMemo(
    () => async () => {
      if (!audio || busy) return;
      setBusy(true);
      setError("");
      try {
        const c = 343;
        const frac = speedMs / c;
        const { left, right } = dopplerFlyby(audio.channels[0], audio.sampleRate, {
          closestM,
          speedMs,
          panWidth: 30,
        });
        const out = [left, right];
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-flyby.wav" || "flyby.wav",
          report: `${speedMs} m/s at ${closestM} m closest approach · Doppler peak +${(1200 * Math.log2(1 / (1 - frac))).toFixed(0)} / −${Math.abs(1200 * Math.log2(1 / (1 + frac))).toFixed(0)} cents far-field (asymmetric — ratio math, not a fudge) · L→R crossing`,
        });
      } catch {
        setError("Flyby failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, speedMs, closestM, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Speed: {speedMs} m/s ({(speedMs * 3.6).toFixed(0)} km/h)</span>
          <input type="range" min={5} max={80} step={1} value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Closest approach: {closestM} m</span>
          <input type="range" min={2} max={80} step={1} value={closestM}
            onChange={(e) => setClosestM(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Simulate flyby
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-2">
          <a href={result.url} download={result.name}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent">
            <Download className="size-4" /> {result.name}
          </a>
          <p className="text-xs text-muted-foreground">{result.report}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        The pitch rise-fall, the level swell, and the left-to-right crossing all
        fall out of one physical model — the source's distance changing over
        time at the speed of sound.
      </p>
    </div>
  );
}
