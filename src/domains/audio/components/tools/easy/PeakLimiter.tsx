"use client";

/**
 * Peak Limiter — transparent peak control (limitChannel, Node-verified:
 * lookahead brick wall with exact-delay ring buffer, so a peak always gets
 * the gain computed when it was seen). The general-purpose limiter: choose
 * how hard it listens (lookahead) and how fast it lets go (release).
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { limitChannel, peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function PeakLimiter() {
  const [ceilingDb, setCeilingDb] = useState(-1);
  const [lookaheadMs, setLookaheadMs] = useState(5);
  const [releaseMs, setReleaseMs] = useState(60);
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
        const before = Math.max(...audio.channels.map(peakOf));
        const out = audio.channels.map((ch) =>
          limitChannel(ch, audio.sampleRate, { ceilingDb, lookaheadMs, releaseMs }),
        );
        const after = Math.max(...out.map(peakOf));
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        const gr = toDb(before) - toDb(after);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-limited.wav" || "limited.wav",
          report: `peak ${toDb(before).toFixed(1)} → ${toDb(after).toFixed(1)} dBFS · ceiling ${ceilingDb} dB · gain reduction ${Math.max(0, gr).toFixed(1)} dB`,
        });
      } catch {
        setError("Limiting failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, ceilingDb, lookaheadMs, releaseMs, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Ceiling: {ceilingDb} dBFS</span>
          <input type="range" min={-12} max={0} step={0.5} value={ceilingDb}
            onChange={(e) => setCeilingDb(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Lookahead: {lookaheadMs} ms</span>
          <input type="range" min={1} max={20} step={1} value={lookaheadMs}
            onChange={(e) => setLookaheadMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Release: {releaseMs} ms</span>
          <input type="range" min={10} max={500} step={10} value={releaseMs}
            onChange={(e) => setReleaseMs(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Limit peaks
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
        Lookahead lets the limiter see peaks coming and duck before they arrive —
        longer is safer but delays the audio. Release shapes how quickly level
        returns after each peak.
      </p>
    </div>
  );
}
