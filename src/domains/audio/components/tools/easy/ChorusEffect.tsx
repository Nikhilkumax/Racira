"use client";

/**
 * Chorus Effect — doubled/rich voice via modulated delay (chorusChannel,
 * Node-verified: exact delay-line addition, dry passthrough at mix 0, LFO
 * phase coherent across channels so the stereo image doesn't smear).
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { chorusChannel } from "@/domains/audio/lib/effects";
import { peakOf } from "@/domains/audio/lib/dynamics";

export default function ChorusEffect() {
  const [rateHz, setRateHz] = useState(1.5);
  const [depthMs, setDepthMs] = useState(5);
  const [mix, setMix] = useState(0.5);
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
        const out = audio.channels.map((ch) =>
          chorusChannel(ch, audio.sampleRate, { rateHz, baseMs: 15, depthMs, mix }),
        );
        const peak = Math.max(...out.map(peakOf));
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-chorus.wav" || "chorus.wav",
          report: `${rateHz} Hz sweep ±${depthMs} ms around 15 ms · mix ${(mix * 100).toFixed(0)}%${peak > 1 ? " · output limited to full scale" : ""}`,
        });
      } catch {
        setError("Chorus failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, rateHz, depthMs, mix, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Rate: {rateHz} Hz</span>
          <input type="range" min={0.1} max={8} step={0.1} value={rateHz}
            onChange={(e) => setRateHz(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Depth: {depthMs} ms</span>
          <input type="range" min={0} max={12} step={0.5} value={depthMs}
            onChange={(e) => setDepthMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Mix: {(mix * 100).toFixed(0)}%</span>
          <input type="range" min={0} max={1} step={0.05} value={mix}
            onChange={(e) => setMix(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Apply chorus
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
        The chorus voice is a copy delayed 15 ms and swept a few milliseconds —
        close enough that it fuses with the original, different enough that it
        sounds like a second performance.
      </p>
    </div>
  );
}
