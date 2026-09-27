"use client";

/**
 * Brickwall Limiter — the final-safety version of the limiter (limitChannel,
 * Node-verified lookahead brick wall). Presets instead of a parameter wall:
 * transparent (1 dB headroom, fast release), loud (−0.3 dBFS streaming
 * standard), and hard digital (0 dBFS, nothing passes). Same engine as Peak
 * Limiter; this one is about never exceeding a line.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { limitChannel, peakOf, toDb } from "@/domains/audio/lib/dynamics";

const PRESETS = [
  { label: "Transparent", ceilingDb: -1, releaseMs: 80, note: "1 dB headroom, gentle release — inaudible on most material" },
  { label: "Loud (streaming)", ceilingDb: -0.3, releaseMs: 40, note: "−0.3 dBFS, the usual streaming delivery ceiling" },
  { label: "Hard digital", ceilingDb: 0, releaseMs: 20, note: "0 dBFS — nothing passes, fastest recovery" },
] as const;

export default function BrickwallLimiter() {
  const [preset, setPreset] = useState(1);
  const [lookaheadMs, setLookaheadMs] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [audio, setAudio] = useState<{ channels: Float32Array[]; sampleRate: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; report: string } | null>(null);

  const p = PRESETS[preset];

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
        const before = Math.max(...audio.channels.map(peakOf));
        const out = audio.channels.map((ch) =>
          limitChannel(ch, audio.sampleRate, { ceilingDb: p.ceilingDb, lookaheadMs, releaseMs: p.releaseMs }),
        );
        const after = Math.max(...out.map(peakOf));
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-brickwalled.wav" || "brickwalled.wav",
          report: `peak ${toDb(before).toFixed(1)} → ${toDb(after).toFixed(1)} dBFS · ceiling ${p.ceilingDb} dBFS · ${p.note}`,
        });
      } catch {
        setError("Limiting failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, p, lookaheadMs, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((x, i) => (
          <button key={x.label} onClick={() => setPreset(i)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${i === preset ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{p.note}</p>

      <label className="block space-y-1.5 max-w-xs">
        <span className="text-xs font-medium text-muted-foreground">Lookahead: {lookaheadMs} ms</span>
        <input type="range" min={1} max={20} step={1} value={lookaheadMs}
          onChange={(e) => setLookaheadMs(Number(e.target.value))} className="w-full" />
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Apply brick wall
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
        Put this last in any chain: whatever happens upstream, the output never
        crosses the ceiling. Overshoot isn't possible — the limiter acts before
        the peak arrives.
      </p>
    </div>
  );
}
