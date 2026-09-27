"use client";

/**
 * Auto-Wah — envelope-driven bandpass sweep (autoWahChannel, Node-verified:
 * the env→frequency mapping is exact at the endpoints and midpoint, and the
 * settled output matches a manual bandpass at the mapped frequency). Loud
 * notes open the filter toward brightness; quiet ones let it sag closed.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { autoWahChannel } from "@/domains/audio/lib/effects";

export default function AutoWah() {
  const [sensitivity, setSensitivity] = useState(0.25);
  const [attackMs, setAttackMs] = useState(10);
  const [releaseMs, setReleaseMs] = useState(120);
  const [mix, setMix] = useState(1);
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
          autoWahChannel(ch, audio.sampleRate, {
            fminHz: 200,
            fmaxHz: 2000,
            openAt: sensitivity,
            attackMs,
            releaseMs,
            mix,
          }),
        );
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-wah.wav" || "wah.wav",
          report: `opens fully at ${sensitivity.toFixed(2)} (−${(-20 * Math.log10(sensitivity)).toFixed(0)} dBFS) · attack ${attackMs} ms · release ${releaseMs} ms`,
        });
      } catch {
        setError("Auto-wah failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, sensitivity, attackMs, releaseMs, mix, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Sensitivity: opens at {sensitivity.toFixed(2)}
          </span>
          <input type="range" min={0.05} max={0.6} step={0.01} value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Mix: {(mix * 100).toFixed(0)}%</span>
          <input type="range" min={0} max={1} step={0.05} value={mix}
            onChange={(e) => setMix(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Attack: {attackMs} ms</span>
          <input type="range" min={1} max={100} step={1} value={attackMs}
            onChange={(e) => setAttackMs(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Release: {releaseMs} ms</span>
          <input type="range" min={20} max={500} step={10} value={releaseMs}
            onChange={(e) => setReleaseMs(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Apply auto-wah
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
        Turn sensitivity down for quiet playing to trigger it, up for only the
        hardest attacks. Fast attack + slow release is the funk setting.
      </p>
    </div>
  );
}
