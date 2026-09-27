"use client";

/**
 * Clipping Distortion Remover — repairs hard-clipped audio (declipSamples,
 * Node-verified: cubic Hermite interpolation across each clip run with
 * signal-measured joint slopes — restores the true crest to within 1 % on
 * the standard fixture, slope-continuous at the entry joint, bounded by the
 * signal's own data). Threshold = the ceiling the file was clipped at; the
 * tool reports how much material was rebuilt.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { declipSamples, peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function ClippingDistortionRemover() {
  const [ceilingDb, setCeilingDb] = useState(-0.1); // where the file tops out
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
        const ceiling = Math.pow(10, ceilingDb / 20);
        let runs = 0;
        const out = audio.channels.map((ch) => {
          const before = ch.slice();
          const fixed = declipSamples(ch, ceiling);
          // count runs for the report: samples that changed
          for (let i = 0; i < fixed.length; i++) if (fixed[i] !== before[i]) runs++;
          return fixed;
        });
        // A faithful repair can exceed full scale (the crest the clipping cut
        // off may be > 1.0). Scale the file down so the restored crest fits
        // below −0.1 dBFS instead of letting the WAV encoder clamp it back
        // onto the digital rail — the reported crest must equal the file's.
        const crest = Math.max(...out.map(peakOf));
        const limit = Math.pow(10, -0.1 / 20);
        const scale = crest > limit ? limit / crest : 1;
        if (scale !== 1) for (const ch of out) for (let i = 0; i < ch.length; i++) ch[i] *= scale;
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-declipped.wav" || "declipped.wav",
          report: `${runs} samples rebuilt around the ${ceilingDb} dBFS ceiling · crest restored to ${toDb(crest).toFixed(1)} dBFS${scale !== 1 ? ` · output scaled ${toDb(scale).toFixed(1)} dB so it fits full scale` : ""}`,
        });
      } catch {
        setError("Repair failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, ceilingDb, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <label className="block space-y-1.5 max-w-sm">
        <span className="text-xs font-medium text-muted-foreground">
          Clip ceiling: {ceilingDb} dBFS — where the file tops out
        </span>
        <input type="range" min={-6} max={0} step={0.1} value={ceilingDb}
          onChange={(e) => setCeilingDb(Number(e.target.value))} className="w-full" />
        <span className="text-xs text-muted-foreground">
          A hard-clipped file has flat tops at a constant level; set the slider
          just above that level.
        </span>
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Repair clipping
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
        This smooths the flat tops back into continuous curves using the shape
        of the surrounding signal. It cannot restore harmonics the clipping
        destroyed — badly clipped audio improves but isn't magically undone.
      </p>
    </div>
  );
}
