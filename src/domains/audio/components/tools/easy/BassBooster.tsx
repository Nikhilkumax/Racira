"use client";

/**
 * Bass Booster — low-shelf lift (lowShelfCoeffs + applyBiquad, Node-verified
 * shelf math; the EQ tool's low band generalized with a frequency control).
 * Everything below the corner comes up together; above it, untouched.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, lowShelfCoeffs, applyBiquad } from "@/domains/audio/lib/edit";
import { peakOf } from "@/domains/audio/lib/dynamics";

export default function BassBooster() {
  const [boostDb, setBoostDb] = useState(6);
  const [cornerHz, setCornerHz] = useState(120);
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
        const c = lowShelfCoeffs(sr, cornerHz, boostDb);
        const out = audio.channels.map((ch) => applyBiquad(ch, c));
        const peak = Math.max(...out.map(peakOf));
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-bass.wav" || "bass.wav",
          report: `+${boostDb} dB shelf below ${cornerHz} Hz${peak > 1 ? " · output limited to full scale (reduce the boost or use the peak limiter)" : ""}`,
        });
      } catch {
        setError("Bass boost failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, boostDb, cornerHz, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Boost: +{boostDb} dB</span>
          <input type="range" min={0} max={15} step={1} value={boostDb}
            onChange={(e) => setBoostDb(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Corner: {cornerHz} Hz</span>
          <input type="range" min={40} max={300} step={10} value={cornerHz}
            onChange={(e) => setCornerHz(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Boost bass
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
        Small laptop speakers can't reproduce the boost — check on headphones.
        Big boosts on loud material clip; the report tells you when.
      </p>
    </div>
  );
}
