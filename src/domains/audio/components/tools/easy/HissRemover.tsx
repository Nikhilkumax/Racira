"use client";

/**
 * Hiss Remover — gentle high-frequency roll-off (lowpassCoeffs +
 * applyBiquad, Node-verified: −3.0 dB at the corner, steep above). Tape hiss
 * and preamp hiss live above ~10 kHz; music's energy mostly doesn't. This is
 * the honest, artifact-free kind of hiss removal — a filter, not a spectral
 * decoder.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, lowpassCoeffs, applyBiquad } from "@/domains/audio/lib/edit";

export default function HissRemover() {
  const [cutoffHz, setCutoffHz] = useState(10000);
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
        const c = lowpassCoeffs(sr, cutoffHz, Math.SQRT1_2);
        const out = audio.channels.map((ch) => applyBiquad(ch, c));
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-dehissed.wav" || "dehissed.wav",
          report: `12 dB/oct lowpass at ${cutoffHz} Hz — content above rolls off fast, below ${cutoffHz / 2} Hz effectively untouched`,
        });
      } catch {
        setError("De-hiss failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, cutoffHz, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <label className="block space-y-1.5 max-w-sm">
        <span className="text-xs font-medium text-muted-foreground">Cutoff: {cutoffHz} Hz</span>
        <input type="range" min={4000} max={16000} step={500} value={cutoffHz}
          onChange={(e) => setCutoffHz(Number(e.target.value))} className="w-full" />
        <span className="text-xs text-muted-foreground">
          Lower cutoff = less hiss but duller cymbals. 10–12 kHz is the usual
          sweet spot for music; 6–8 kHz for speech.
        </span>
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Remove hiss
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
        Hiss that overlaps the music's own highs can't be filtered without
        dulling them — that case needs spectral tools, which are a different
        (heavier) beast entirely.
      </p>
    </div>
  );
}
