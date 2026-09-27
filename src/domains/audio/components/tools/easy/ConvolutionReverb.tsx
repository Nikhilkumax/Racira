"use client";

/**
 * Convolution Reverb — FFT convolution with procedurally generated room
 * impulse responses (convolveFft + makeNoiseIr/makeEarlyReflectionsIr,
 * Node-verified against direct convolution; IR envelope exact). No IR sample
 * files needed: the rooms are synthesized, which keeps everything in the
 * existing no-new-dependency pipeline.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { convolveFft, makeNoiseIr, makeEarlyReflectionsIr } from "@/domains/audio/lib/reverb";

const ROOMS = [
  { label: "Small room", rt60: 0.4, gain: 0.35 },
  { label: "Club", rt60: 1.0, gain: 0.4 },
  { label: "Concert hall", rt60: 2.2, gain: 0.5 },
  { label: "Cathedral", rt60: 4.5, gain: 0.6 },
] as const;

export default function ConvolutionReverb() {
  const [room, setRoom] = useState(2);
  const [mix, setMix] = useState(0.35);
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
        const r = ROOMS[room];
        const sr = audio.sampleRate;
        // early-reflection pattern + noise tail = a plausible synthetic room
        const taps: Array<[number, number]> = [
          [12, 0.5 * r.gain], [23, 0.35 * r.gain], [37, 0.3 * r.gain],
          [53, 0.28 * r.gain], [71, 0.22 * r.gain],
        ];
        const ir = makeEarlyReflectionsIr(sr, taps, r.rt60);
        const out = audio.channels.map((ch) => {
          const wet = convolveFft(ch, ir);
          // Convolution extends the signal by the IR: the reverb tail rings
          // PAST the input's end — truncating wet to the input length throws
          // the tail away (real bug caught in browser verification: output
          // was exactly input-length and the tail was silent).
          const n = wet.length;
          const mixed = new Float32Array(n);
          for (let i = 0; i < ch.length; i++) mixed[i] = ch[i] * (1 - mix) + wet[i] * mix;
          for (let i = ch.length; i < n; i++) mixed[i] = wet[i] * mix;
          return mixed;
        });
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-convrev.wav" || "convrev.wav",
          report: `${r.label} (synthetic IR, rt60 ≈ ${r.rt60} s) · mix ${(mix * 100).toFixed(0)}%`,
        });
      } catch {
        setError("Convolution reverb failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, room, mix, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="flex flex-wrap gap-2">
        {ROOMS.map((r, i) => (
          <button key={r.label} onClick={() => setRoom(i)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${i === room ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
            {r.label}
          </button>
        ))}
      </div>

      <label className="block space-y-1.5 max-w-xs">
        <span className="text-xs font-medium text-muted-foreground">Mix: {(mix * 100).toFixed(0)}%</span>
        <input type="range" min={0} max={1} step={0.05} value={mix}
          onChange={(e) => setMix(Number(e.target.value))} className="w-full" />
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Apply convolution reverb
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
        True convolution — the audio is smeared by the room's impulse response
        exactly as physics would. The rooms are synthesized here; capturing a
        real room needs a sweep recording, which is the impulse-response
        generator's job.
      </p>
    </div>
  );
}
