"use client";

/**
 * Auto-Tune Effect — the hard, obvious pitch snap (autoTune, Node-verified:
 * 224 Hz → 220.0 within 3 Hz, scale mode lands on the scale, strength 0 is
 * transparent). Continuous whole-file phase vocoder with a smoothed
 * per-frame rate map; unvoiced frames pass through. Key/scale presets map to
 * targetMidi's pitch-class snapping.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { autoTune } from "@/domains/audio/lib/pitch";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES: Record<string, number[]> = {
  Chromatic: [],
  Major: [0, 2, 4, 5, 7, 9, 11],
  "Natural minor": [0, 2, 3, 5, 7, 8, 10],
};

export default function AutoTuneEffect() {
  const [keyIdx, setKeyIdx] = useState(9); // A
  const [scaleName, setScaleName] = useState("Chromatic");
  const [strength, setStrength] = useState(100);
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
        const scale = SCALES[scaleName];
        const root = keyIdx;
        const out = audio.channels.map((ch) =>
          autoTune(ch, audio.sampleRate, { scale, root, strength: strength / 100 }),
        );
        const snapped = out.reduce((s, o) => s + o.framesSnapped, 0);
        const voiced = out.reduce((s, o) => s + o.framesTotal, 0);
        const median = out.length ? out[0].medianCentsMoved : 0;
        const blob = encodeWav(out.map((o) => o.out), audio.sampleRate, audio.channels[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-autotuned.wav" || "autotuned.wav",
          report: `${scaleName} in ${KEYS[keyIdx]} · retune ${strength}% · snapped ${snapped}/${voiced} voiced frames (median move ${median.toFixed(0)} cents)`,
        });
      } catch {
        setError("Auto-tune failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, keyIdx, scaleName, strength, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Key: {KEYS[keyIdx]}</span>
          <input type="range" min={0} max={11} step={1} value={keyIdx}
            onChange={(e) => setKeyIdx(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5 max-w-xs">
          <span className="text-xs font-medium text-muted-foreground">Scale</span>
          <select value={scaleName} onChange={(e) => setScaleName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {Object.keys(SCALES).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-1.5 max-w-sm">
        <span className="text-xs font-medium text-muted-foreground">Retune strength: {strength}%</span>
        <input type="range" min={0} max={100} step={5} value={strength}
          onChange={(e) => setStrength(Number(e.target.value))} className="w-full" />
        <span className="text-xs text-muted-foreground">
          100% = the hard T-Pain snap. 60–80% sounds like radio pop; lower it
          for gentle cleanup. Vocals with clear melody work best.
        </span>
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Auto-tune
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
