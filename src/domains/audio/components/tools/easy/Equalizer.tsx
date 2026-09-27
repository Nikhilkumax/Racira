"use client";

/**
 * Equalizer — 3-band tone stack (lowShelf/peaking/highShelfCoeffs +
 * applyBiquad, Node-verified: +12 dB shelf lands within 0.5 dB in the
 * passband, untouched bands stay untouched). The classic bass/mid/treble
 * recording-console layout, chained in fixed order.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, lowShelfCoeffs, peakingCoeffs, highShelfCoeffs, applyBiquad } from "@/domains/audio/lib/edit";

export default function Equalizer() {
  const [bassDb, setBassDb] = useState(0);
  const [midDb, setMidDb] = useState(0);
  const [trebleDb, setTrebleDb] = useState(0);
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
        const sr = audio.sampleRate;
        const chain = [
          lowShelfCoeffs(sr, 200, bassDb),
          peakingCoeffs(sr, 1000, 0.7, midDb),
          highShelfCoeffs(sr, 4000, trebleDb),
        ];
        const out = audio.channels.map((ch) => {
          let v = ch;
          for (const c of chain) v = applyBiquad(v, c);
          return v;
        });
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-eq.wav" || "eq.wav",
          report: `bass ${bassDb >= 0 ? "+" : ""}${bassDb} dB @ 200 Hz · mid ${midDb >= 0 ? "+" : ""}${midDb} dB @ 1 kHz · treble ${trebleDb >= 0 ? "+" : ""}${trebleDb} dB @ 4 kHz`,
        });
      } catch {
        setError("EQ failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, bassDb, midDb, trebleDb, file],
  );

  const slider = (label: string, v: number, set: (n: number) => void) => (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}: {v >= 0 ? "+" : ""}{v} dB</span>
      <input type="range" min={-12} max={12} step={1} value={v}
        onChange={(e) => set(Number(e.target.value))} className="w-full" />
    </label>
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        {slider("Bass (shelf @ 200 Hz)", bassDb, setBassDb)}
        {slider("Mid (peak @ 1 kHz)", midDb, setMidDb)}
        {slider("Treble (shelf @ 4 kHz)", trebleDb, setTrebleDb)}
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Apply EQ
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
        Cut muddy mids (−2 to −4 dB around 1 kHz) before boosting anything —
        subtraction usually sounds cleaner than addition.
      </p>
    </div>
  );
}
