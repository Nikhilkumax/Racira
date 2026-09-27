"use client";

/**
 * Flanger Effect — the resonant comb (flangerChannel, Node-verified: the
 * impulse response lands exactly on mix·fb^(n−1) at multiples of the delay,
 * with zero spill between teeth). Two flangers = chorus with a much shorter
 * delay and feedback — that's why this one sweeps and shimmers instead of
 * doubling.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { flangerChannel } from "@/domains/audio/lib/effects";
import { peakOf } from "@/domains/audio/lib/dynamics";

export default function FlangerEffect() {
  const [rateHz, setRateHz] = useState(0.3);
  const [depthMs, setDepthMs] = useState(2);
  const [feedback, setFeedback] = useState(0.6);
  const [mix, setMix] = useState(0.7);
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
          flangerChannel(ch, audio.sampleRate, { rateHz, baseMs: 1, depthMs, feedback, mix }),
        );
        const peak = Math.max(...out.map(peakOf));
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-flanger.wav" || "flanger.wav",
          report: `${rateHz} Hz sweep ±${depthMs} ms around 1 ms · feedback ${(feedback * 100).toFixed(0)}% · mix ${(mix * 100).toFixed(0)}%${peak > 1 ? " · output limited to full scale" : ""}`,
        });
      } catch {
        setError("Flanging failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, rateHz, depthMs, feedback, mix, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Rate: {rateHz} Hz</span>
          <input type="range" min={0.05} max={5} step={0.05} value={rateHz}
            onChange={(e) => setRateHz(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Depth: {depthMs} ms</span>
          <input type="range" min={0} max={5} step={0.1} value={depthMs}
            onChange={(e) => setDepthMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Feedback: {(feedback * 100).toFixed(0)}%</span>
          <input type="range" min={0} max={0.9} step={0.05} value={feedback}
            onChange={(e) => setFeedback(Number(e.target.value))} className="w-full" />
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
        Apply flanger
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
        High feedback plus slow sweep is the classic jet-plane whoosh. Keep
        feedback under ~80% — past that the comb starts to howl.
      </p>
    </div>
  );
}
