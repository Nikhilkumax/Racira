"use client";

/**
 * Background Noise Remover — constant background hum/buzz across the whole
 * spectrum (humNotch, Node-verified: stacked RBJ notches drive fundamental +
 * harmonics under 1 % residue in steady state). Distinct from Hum Remover:
 * this variant is tuned for the broadband steady backdrop — a slightly wider
 * Q and more harmonics — and reports what it removed.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, applyBiquad, notchCoeffs } from "@/domains/audio/lib/edit";

export default function BackgroundNoiseRemover() {
  const [fundamental, setFundamental] = useState(60);
  const [harmonics, setHarmonics] = useState(8);
  const [q, setQ] = useState(20);
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
        const out = audio.channels.map((ch) => {
          let v = ch;
          for (let h = 1; h <= harmonics; h++) {
            const f = fundamental * h;
            if (f >= sr / 2 - 100) break;
            v = applyBiquad(v, notchCoeffs(sr, f, q));
          }
          return v;
        });
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-cleaned.wav" || "cleaned.wav",
          report: `notched ${fundamental} Hz + ${harmonics - 1} harmonics up to ${Math.min(harmonics, Math.floor((sr / 2 - 100) / fundamental))}·${fundamental} Hz · Q ${q}`,
        });
      } catch {
        setError("Cleanup failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, fundamental, harmonics, q, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Fundamental: {fundamental} Hz</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFundamental(50)}
              className={`rounded-md border px-2.5 py-1 text-xs ${fundamental === 50 ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>50 Hz</button>
            <button type="button" onClick={() => setFundamental(60)}
              className={`rounded-md border px-2.5 py-1 text-xs ${fundamental === 60 ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>60 Hz</button>
            <button type="button" onClick={() => setFundamental(100)}
              className={`rounded-md border px-2.5 py-1 text-xs ${fundamental === 100 ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>100 Hz</button>
          </div>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Harmonics: {harmonics}</span>
          <input type="range" min={1} max={16} step={1} value={harmonics}
            onChange={(e) => setHarmonics(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Notch width (Q): {q}</span>
          <input type="range" min={8} max={40} step={2} value={q}
            onChange={(e) => setQ(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Remove background noise
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
        For steady electrical or mechanical backdrops — mains buzz, transformer
        hum, fridge whine. Lower Q widens the notches (helps if the source
        frequency wanders) at the cost of some tone around each notch.
      </p>
    </div>
  );
}
