"use client";

/**
 * Reverb Simulator — Schroeder algorithmic reverb (schroederReverb,
 * Node-verified: exact dry passthrough at mix 0, tail decays toward zero,
 * output length = input + tail). 4 damped combs + 2 allpasses, the classic
 * 1961 topology that still defines "algorithmic plate".
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { schroederReverb, type SchroederOptions } from "@/domains/audio/lib/reverb";

export default function ReverbSimulator() {
  const [size, setSize] = useState(1);
  const [feedback, setFeedback] = useState(0.75);
  const [dampHz, setDampHz] = useState(4000);
  const [mix, setMix] = useState(0.3);
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
        const opts: SchroederOptions = { size, feedback, dampHz, mix, tailSec: 2 };
        const out = audio.channels.map((ch) => schroederReverb(ch, audio.sampleRate, opts));
        const len = out[0].length;
        const blob = encodeWav(out, audio.sampleRate, len);
        const url = URL.createObjectURL(blob);
        const rt60 = Math.round((size * (0.5 + feedback * 4)) * 10) / 10; // honest rough estimate
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-reverb.wav" || "reverb.wav",
          report: `size ×${size} · feedback ${(feedback * 100).toFixed(0)}% · damping ${dampHz} Hz · mix ${(mix * 100).toFixed(0)}% — output is ${((len / audio.sampleRate)).toFixed(1)} s (2 s tail added)`,
        });
        void rt60;
      } catch {
        setError("Reverb failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, size, feedback, dampHz, mix, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Room size: ×{size.toFixed(1)}</span>
          <input type="range" min={0.5} max={2} step={0.1} value={size}
            onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sustain: {(feedback * 100).toFixed(0)}%</span>
          <input type="range" min={0.6} max={0.9} step={0.01} value={feedback}
            onChange={(e) => setFeedback(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Damping: {dampHz} Hz</span>
          <input type="range" min={1000} max={8000} step={250} value={dampHz}
            onChange={(e) => setDampHz(Number(e.target.value))} className="w-full" />
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
        Apply reverb
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
        Damping low = dark, distant hall; high = bright plate. Keep mix under
        40% for vocals unless you want them inside the room.
      </p>
    </div>
  );
}
