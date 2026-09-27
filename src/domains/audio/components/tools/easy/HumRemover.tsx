"use client";

/**
 * Hum Remover — notch the mains fundamental and its harmonics (notchCoeffs +
 * applyBiquad, Node-verified: 60 Hz gain < 0.05 at Q 30, stacked notches kill
 * 60/120/180/240 to under 2% residue, unity gain elsewhere). The electrical
 * buzz that ground loops and bad cables inject is exactly this comb.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, notchCoeffs, applyBiquad } from "@/domains/audio/lib/edit";

export default function HumRemover() {
  const [mainsHz, setMainsHz] = useState(50);
  const [harmonics, setHarmonics] = useState(5);
  const [q, setQ] = useState(30);
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
        const chain = Array.from({ length: harmonics }, (_, k) =>
          notchCoeffs(sr, mainsHz * (k + 1), q),
        );
        const out = audio.channels.map((ch) => {
          let v = ch;
          for (const c of chain) v = applyBiquad(v, c);
          return v;
        });
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-dehummed.wav" || "dehummed.wav",
          report: `notched ${mainsHz} Hz + ${harmonics - 1} harmonics (${Array.from({ length: harmonics }, (_, k) => mainsHz * (k + 1)).join(", ")} Hz) · Q ${q}`,
        });
      } catch {
        setError("De-hum failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, mainsHz, harmonics, q, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Mains: {mainsHz} Hz</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMainsHz(50)}
              className={`rounded-md border px-2.5 py-1 text-xs ${mainsHz === 50 ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>50 Hz (EU)</button>
            <button type="button" onClick={() => setMainsHz(60)}
              className={`rounded-md border px-2.5 py-1 text-xs ${mainsHz === 60 ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>60 Hz (US)</button>
          </div>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Harmonics: {harmonics}</span>
          <input type="range" min={1} max={10} step={1} value={harmonics}
            onChange={(e) => setHarmonics(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Notch sharpness (Q): {q}</span>
          <input type="range" min={10} max={60} step={5} value={q}
            onChange={(e) => setQ(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Remove hum
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
        Higher Q = narrower notches = less music removed alongside the hum, but
        mains frequency drift (grid wander) needs a slightly wider notch.
      </p>
    </div>
  );
}
