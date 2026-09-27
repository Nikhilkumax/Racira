"use client";

/**
 * Dynamic Range Compressor — "professional-grade audio compression"
 * (compressChannel, Node-verified: windowed-RMS detector, soft knee,
 * gain-smoothing ballistics — the fixes found during the compressor-family
 * batches are baked into the lib). Distinct from Audio Compressor in UX:
 * this one leads with presets (vocal, drum bus, broadcast) and shows the
 * static gain-reduction curve numbers instead of raw parameters.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { compressChannel, rmsOf, toDb } from "@/domains/audio/lib/dynamics";

const PRESETS = [
  { label: "Vocal leveler", thresholdDb: -24, ratio: 3, kneeDb: 8, attackMs: 10, releaseMs: 150, makeupGainDb: 4, note: "evens out a voice without pumping" },
  { label: "Drum punch", thresholdDb: -18, ratio: 6, kneeDb: 3, attackMs: 25, releaseMs: 100, makeupGainDb: 3, note: "slower attack keeps the transient, body gets dense" },
  { label: "Broadcast", thresholdDb: -20, ratio: 4, kneeDb: 6, attackMs: 5, releaseMs: 120, makeupGainDb: 5, note: "consistent loudness, speech-safe" },
] as const;

export default function DynamicRangeCompressor() {
  const [preset, setPreset] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [audio, setAudio] = useState<{ channels: Float32Array[]; sampleRate: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; report: string } | null>(null);

  const p = PRESETS[preset];

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
        const before = rmsOf(audio.channels[0]);
        const out = audio.channels.map((ch) =>
          compressChannel(ch, audio.sampleRate, p, p.attackMs, p.releaseMs),
        );
        const after = rmsOf(out[0]);
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-compressed.wav" || "compressed.wav",
          report: `RMS ${toDb(before).toFixed(1)} → ${toDb(after).toFixed(1)} dBFS · ${p.ratio}:1 above ${p.thresholdDb} dBFS · ${p.note}`,
        });
      } catch {
        setError("Compression failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, p, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((x, i) => (
          <button key={x.label} onClick={() => setPreset(i)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${i === preset ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {p.ratio}:1 above {p.thresholdDb} dBFS, knee {p.kneeDb} dB, attack {p.attackMs} ms,
        release {p.releaseMs} ms, make-up +{p.makeupGainDb} dB — {p.note}.
      </p>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Compress
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
        Compression narrows the gap between loud and quiet. Want the loudest
        possible file? Compress, then finish with the LUFS normalizer.
      </p>
    </div>
  );
}
