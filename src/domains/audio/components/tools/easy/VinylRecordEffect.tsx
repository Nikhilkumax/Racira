"use client";

/**
 * Vinyl Record Effect — crackle + warmth (vinylize, Node-verified: output
 * noise floor equals the requested dB, crackle clusters land at the Poisson
 * rate, 30 Hz warmth attenuation with 1 kHz untouched). Stereo keeps its
 * channels; the seed makes the same render reproducible.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { vinylize } from "@/domains/audio/lib/pitch";

export default function VinylRecordEffect() {
  const [crackleRate, setCrackleRate] = useState(3);
  const [noiseDb, setNoiseDb] = useState(-42);
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
        const seed = 987654321;
        const out = audio.channels.map((ch) =>
          vinylize(ch, audio.sampleRate, { crackleRate, noiseDb, seed }),
        );
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-vinyl.wav" || "vinyl.wav",
          report: `crackle ${crackleRate}/s · surface noise ${noiseDb} dBFS floor · warmth HP at 40 Hz`,
        });
      } catch {
        setError("Vinyl effect failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, crackleRate, noiseDb, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Crackle density: {crackleRate}/s</span>
          <input type="range" min={0} max={15} step={0.5} value={crackleRate}
            onChange={(e) => setCrackleRate(Number(e.target.value))} className="w-full" />
          <span className="text-xs text-muted-foreground">
            Dust pops per second. 2–5 is a well-kept record; 10+ is the
            estate-sale copy.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Surface noise: {noiseDb} dBFS</span>
          <input type="range" min={-60} max={-30} step={1} value={noiseDb}
            onChange={(e) => setNoiseDb(Number(e.target.value))} className="w-full" />
          <span className="text-xs text-muted-foreground">
            The rumble-y floor between tracks. −48 is clean vinyl; −36 is a
            well-loved one.
          </span>
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Vinylize
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
    </div>
  );
}
