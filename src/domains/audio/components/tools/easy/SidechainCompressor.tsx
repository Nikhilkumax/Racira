"use client";

/**
 * Sidechain Compressor — ducking / pumping (duckBySidechain, Node-verified:
 * threshold-referenced duck depth, attack/release-smoothed gain, exact
 * lookahead delay so the duck is fully engaged before the sidechain
 * transient). Feed music as the program and a voice as the sidechain: the
 * music gets out of the voice's way, automatically. Output is the mixed
 * program + voice, with an optional brick-wall safety limiter on the sum.
 */

import { useCallback, useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { duckBySidechain, limitChannel } from "@/domains/audio/lib/dynamics";

interface Clip {
  name: string;
  channels: Float32Array[];
  sampleRate: number;
}

const mixDown = (clip: Clip): Float32Array => {
  const n = clip.channels[0].length;
  const mono = new Float32Array(n);
  for (let c = 0; c < clip.channels.length; c++)
    for (let i = 0; i < n; i++) mono[i] += clip.channels[c][i] / clip.channels.length;
  return mono;
};

export default function SidechainCompressor() {
  const [thresholdDb, setThresholdDb] = useState(-30);
  const [rangeDb, setRangeDb] = useState(9);
  const [attackMs, setAttackMs] = useState(10);
  const [releaseMs, setReleaseMs] = useState(300);
  const [lookaheadMs, setLookaheadMs] = useState(5);
  const [safety, setSafety] = useState(true);
  const [clipA, setClipA] = useState<Clip | null>(null);
  const [clipB, setClipB] = useState<Clip | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; report: string } | null>(null);

  const load = useCallback(async (file: File | undefined, slot: "a" | "b") => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const decoded = await decodeFileToChannels(file);
      const clip: Clip = { name: file.name, channels: decoded.channels, sampleRate: decoded.sampleRate };
      if (slot === "a") setClipA(clip);
      else setClipB(clip);
    } catch {
      setError("Could not decode that file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const run = useMemo(
    () => async () => {
      if (!clipA || !clipB || busy) return;
      setBusy(true);
      setError("");
      try {
        if (clipA.sampleRate !== clipB.sampleRate) {
          throw new Error(
            `Sample rates differ (${clipA.sampleRate} vs ${clipB.sampleRate} Hz) — convert both to the same rate first.`,
          );
        }
        const sr = clipA.sampleRate;
        const n = Math.max(clipA.channels[0].length, clipB.channels[0].length);
        const pad = (x: Float32Array) => {
          const y = new Float32Array(n);
          y.set(x);
          return y;
        };
        const program = pad(mixDown(clipA));
        const voice = pad(mixDown(clipB));
        const ducked = duckBySidechain(program, voice, sr, thresholdDb, rangeDb, attackMs, releaseMs, lookaheadMs);
        const summed = new Float32Array(n);
        for (let i = 0; i < n; i++) summed[i] = ducked[i] + voice[i];
        const out = safety
          ? limitChannel(summed, sr, { ceilingDb: -1, lookaheadMs: 3, releaseMs: 80 })
          : summed;
        const blob = encodeWav([out], sr, n);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: "sidechain-mix.wav",
          report: `duck up to ${rangeDb} dB below ${thresholdDb} dBFS sidechain · lookahead ${lookaheadMs} ms${safety ? " · safety limiter −1 dBFS" : ""}`,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ducking failed.");
      } finally {
        setBusy(false);
      }
    },
    [clipA, clipB, busy, thresholdDb, rangeDb, attackMs, releaseMs, lookaheadMs, safety],
  );

  const slot = (clip: Clip | null, onFile: (f: File | undefined) => void, label: string) => (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 text-xs font-medium text-muted-foreground">{label}</div>
      {clip ? (
        <p className="truncate text-sm">
          {clip.name} · {(clip.channels[0].length / clip.sampleRate).toFixed(1)} s · {clip.sampleRate} Hz
        </p>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <UploadCloud className="size-4" /> Choose a file…
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {slot(clipA, (f) => void load(f, "a"), "Program (music — gets ducked)")}
        {slot(clipB, (f) => void load(f, "b"), "Sidechain (voice — triggers the duck)")}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Threshold: {thresholdDb} dBFS</span>
          <input type="range" min={-60} max={-6} step={1} value={thresholdDb}
            onChange={(e) => setThresholdDb(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Duck range: {rangeDb} dB</span>
          <input type="range" min={0} max={24} step={1} value={rangeDb}
            onChange={(e) => setRangeDb(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Attack: {attackMs} ms</span>
          <input type="range" min={1} max={100} step={1} value={attackMs}
            onChange={(e) => setAttackMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Release: {releaseMs} ms</span>
          <input type="range" min={50} max={1000} step={10} value={releaseMs}
            onChange={(e) => setReleaseMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Lookahead: {lookaheadMs} ms</span>
          <input type="range" min={0} max={20} step={1} value={lookaheadMs}
            onChange={(e) => setLookaheadMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={safety} onChange={(e) => setSafety(e.target.checked)} />
          Safety limiter on the mix (−1 dBFS)
        </label>
      </div>

      <button onClick={() => void run()} disabled={!clipA || !clipB || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Create ducking mix
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
        Lookahead delays the program a few milliseconds so the duck is already
        at full depth when the voice starts — no clipped-off first syllables.
      </p>
    </div>
  );
}
