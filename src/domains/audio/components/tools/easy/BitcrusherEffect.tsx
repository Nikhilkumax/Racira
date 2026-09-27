"use client";

/**
 * Bitcrusher Effect — quantization + sample-and-hold (bitcrushChannel,
 * Node-verified: every output on the 2^(bits−1) grid, hold blocks bit-
 * identical, 16-bit/hold-1 transparent). The lo-fi/time machine: 8-bit
 * sampler grit, video-game drums, telephone-era texture.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { bitcrushChannel } from "@/domains/audio/lib/effects";

export default function BitcrusherEffect() {
  const [bits, setBits] = useState(8);
  const [hold, setHold] = useState(4);
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
        const out = audio.channels.map((ch) => bitcrushChannel(ch, { bits, hold }));
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-crushed.wav" || "crushed.wav",
          report: `${bits}-bit quantization · ${hold}× sample-and-hold (≈ ${(audio.sampleRate / hold / 1000).toFixed(1)} kHz effective)`,
        });
      } catch {
        setError("Crushing failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, bits, hold, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Bit depth: {bits} bit</span>
          <input type="range" min={2} max={16} step={1} value={bits}
            onChange={(e) => setBits(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Sample-rate crush: {hold}× (1 in {hold} kept)
          </span>
          <input type="range" min={1} max={40} step={1} value={hold}
            onChange={(e) => setHold(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Crush it
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
        Low bits add the raspy quantization noise; the sample-hold adds the
        aliasing shimmer. Together they're the 1986 drum machine sound.
      </p>
    </div>
  );
}
