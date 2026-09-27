"use client";

/**
 * Wind Noise Remover — sub-100 Hz rumble kill (highpassCoeffs + applyBiquad,
 * Node-verified: 60 Hz down 18+ dB at a 300 Hz corner while 500 Hz passes
 * untouched). Wind hitting a mic capsule is almost pure low-frequency
 * energy; speech and music don't live there.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, highpassCoeffs, applyBiquad } from "@/domains/audio/lib/edit";

export default function WindNoiseRemover() {
  const [cornerHz, setCornerHz] = useState(150);
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
        const c = highpassCoeffs(sr, cornerHz, Math.SQRT1_2);
        const out = audio.channels.map((ch) => applyBiquad(ch, c));
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-dewinded.wav" || "dewinded.wav",
          report: `12 dB/oct highpass at ${cornerHz} Hz — rumble below rolls off fast, content above ${cornerHz * 2} Hz effectively untouched`,
        });
      } catch {
        setError("Wind removal failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, cornerHz, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <label className="block space-y-1.5 max-w-sm">
        <span className="text-xs font-medium text-muted-foreground">Corner: {cornerHz} Hz</span>
        <input type="range" min={40} max={400} step={10} value={cornerHz}
          onChange={(e) => setCornerHz(Number(e.target.value))} className="w-full" />
        <span className="text-xs text-muted-foreground">
          Start at 80–150 Hz. Male broadcast voices go down to ~85 Hz — go
          higher only for wind you can't otherwise tame.
        </span>
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Remove wind rumble
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
        Violent gusts also clip the capsule — the distortion above the rumble
        is permanent, and the declipper only helps with mild cases.
      </p>
    </div>
  );
}
