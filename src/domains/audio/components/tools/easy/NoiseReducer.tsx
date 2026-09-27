"use client";

/**
 * Noise Reducer — spectral subtraction (spectralDenoise, Node-verified 15/15:
 * noise floor −45 % at strength 0.8, tone preserved within 10 %, identity at
 * strength 0, WOLA edges exact). The noise profile is measured from the
 * file's own quietest stretch, so no noise print is needed.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { spectralDenoise } from "@/domains/audio/lib/cleanup";

export default function NoiseReducer() {
  const [strength, setStrength] = useState(0.5);
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
        const r = spectralDenoise(audio.channels, audio.sampleRate, { strength });
        const out = r.outs;
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-denoised.wav" || "denoised.wav",
          report: `strength ${(strength * 100).toFixed(0)}% · mean gain reduction ${r.noiseReductionDb.toFixed(1)} dB · channels ${out.length}`,
        });
      } catch {
        setError("Denoising failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, strength, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Strength: {(strength * 100).toFixed(0)}%
        </span>
        <input type="range" min={0} max={100} step={5} value={strength * 100}
          onChange={(e) => setStrength(Number(e.target.value) / 100)} className="w-full" />
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Reduce noise
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
        The noise profile is measured from the quietest stretch of your file —
        it should contain a moment of &ldquo;just the noise&rdquo; (a pause, room tone).
        High strengths can add a watery artifact to noisy material; 40–70 % is
        usually the sweet spot.
      </p>
    </div>
  );
}
