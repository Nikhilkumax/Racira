"use client";

/**
 * Surround Sound Simulator — stereo to 4-channel quad (upmixQuad,
 * Node-verified: front pair bit-identical to the input, rears a delayed,
 * cross-fed, quieter derivative). The rear channels carry ambience, not
 * content — below the fusion threshold, so the brain places them "around".
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { upmixQuad } from "@/domains/audio/lib/reverb";
import { peakOf } from "@/domains/audio/lib/dynamics";

export default function SurroundSoundSimulator() {
  const [rearTrimDb, setRearTrimDb] = useState(-6);
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
        const left = audio.channels[0];
        const right = audio.channels[1] ?? audio.channels[0];
        const [fl, fr, rl, rr] = upmixQuad(left, right, sr);
        const trim = Math.pow(10, rearTrimDb / 20);
        for (let i = 0; i < rl.length; i++) {
          rl[i] *= trim;
          rr[i] *= trim;
        }
        const out = [fl, fr, rl, rr];
        const rearPeak = Math.max(peakOf(rl), peakOf(rr));
        const blob = encodeWav(out, sr, fl.length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-quad.wav" || "quad.wav",
          report: `4-channel WAV (FL·FR·RL·RR) · rears delayed 17 ms, cross-fed, trimmed to ${rearTrimDb} dB (peak ${rearPeak.toFixed(2)})`,
        });
      } catch {
        setError("Surround upmix failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, rearTrimDb, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <label className="block space-y-1.5 max-w-sm">
        <span className="text-xs font-medium text-muted-foreground">Rear level: {rearTrimDb} dB</span>
        <input type="range" min={-18} max={0} step={1} value={rearTrimDb}
          onChange={(e) => setRearTrimDb(Number(e.target.value))} className="w-full" />
        <span className="text-xs text-muted-foreground">
          Rears should be felt, not heard: −6 to −12 dB is the usual range.
        </span>
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Upmix to quad
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
        Output is a 4-channel WAV. On a stereo system it folds back to the
        original fronts (rears stay quiet); on a quad rig the room opens up.
      </p>
    </div>
  );
}
