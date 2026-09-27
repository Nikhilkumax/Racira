"use client";

/**
 * Phaser Effect — cascaded allpass notches (phaserChannel, Node-verified:
 * DC and Nyquist anchors settle at (1−mix)·x for any stage count, deep
 * notch where the chain comes in phase with dry). Where a flanger's comb
 * teeth are harmonically spaced, a phaser's notches are unevenly spaced —
 * that's the whole character difference.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { phaserChannel } from "@/domains/audio/lib/effects";

export default function PhaserEffect() {
  const [rateHz, setRateHz] = useState(0.5);
  const [stages, setStages] = useState(4);
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
          phaserChannel(ch, audio.sampleRate, {
            rateHz,
            fminHz: 300,
            fmaxHz: 4000,
            stages,
            mix,
          }),
        );
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-phaser.wav" || "phaser.wav",
          report: `${stages}-stage sweep ${rateHz} Hz (300 Hz–4 kHz) · mix ${(mix * 100).toFixed(0)}%`,
        });
      } catch {
        setError("Phasing failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, rateHz, stages, mix, file],
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
          <input type="range" min={0.05} max={5} step={0.05} value={rateHz}
            onChange={(e) => setRateHz(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Stages: {stages}</span>
          <input type="range" min={1} max={8} step={1} value={stages}
            onChange={(e) => setStages(Number(e.target.value))} className="w-full" />
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
        Apply phaser
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
        More stages = more notches = a deeper, swirlier sweep. The notches move
        together like a fan opening and closing.
      </p>
    </div>
  );
}
