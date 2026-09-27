"use client";

/**
 * Hallway / Room Simulator — early reflections without the late tail
 * (makeEarlyReflectionsIr + convolveFft, Node-verified: taps at exact
 * samples with exact gains). Discrete first echoes are what a listener's
 * brain uses to infer room size — this isolates that cue. 3D games and
 * dialogue mixes live here.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { convolveFft, makeEarlyReflectionsIr } from "@/domains/audio/lib/reverb";

const SPACES = [
  { label: "Hallway", taps: [[9, 0.6], [13, 0.4], [19, 0.3], [26, 0.2]] as Array<[number, number]>, tail: 0.08, note: "narrow, hard walls — dense fast taps" },
  { label: "Living room", taps: [[12, 0.4], [21, 0.25], [31, 0.18]] as Array<[number, number]>, tail: 0.12, note: "furniture absorbs — sparse, soft" },
  { label: "Stairwell", taps: [[8, 0.7], [14, 0.5], [22, 0.42], [33, 0.35], [47, 0.3]] as Array<[number, number]>, tail: 0.18, note: "concrete — loud, ringing" },
  { label: "Warehouse", taps: [[25, 0.55], [48, 0.4], [74, 0.3], [103, 0.25]] as Array<[number, number]>, tail: 0.25, note: "big, bright, sparse" },
] as const;

export default function HallwayRoomSimulator() {
  const [space, setSpace] = useState(0);
  const [wetDb, setWetDb] = useState(-9);
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
        const s = SPACES[space];
        const sr = audio.sampleRate;
        const ir = makeEarlyReflectionsIr(sr, s.taps, s.tail);
        const wetGain = Math.pow(10, wetDb / 20);
        const out = audio.channels.map((ch) => {
          const wet = convolveFft(ch, ir);
          const n = ch.length;
          const mixed = new Float32Array(n);
          for (let i = 0; i < n; i++) mixed[i] = ch[i] + (wet[i] ?? 0) * wetGain;
          return mixed;
        });
        const blob = encodeWav(out, sr, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-room.wav" || "room.wav",
          report: `${s.label} — ${s.note} · reflections up to ${Math.max(...s.taps.map(([d]) => d))} ms · wet ${wetDb} dB`,
        });
      } catch {
        setError("Room simulation failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, space, wetDb, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="flex flex-wrap gap-2">
        {SPACES.map((s, i) => (
          <button key={s.label} onClick={() => setSpace(i)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${i === space ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{SPACES[space].note}</p>

      <label className="block space-y-1.5 max-w-xs">
        <span className="text-xs font-medium text-muted-foreground">Reflection level: {wetDb} dB</span>
        <input type="range" min={-30} max={0} step={1} value={wetDb}
          onChange={(e) => setWetDb(Number(e.target.value))} className="w-full" />
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Place in room
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
        No tail — just the first echoes that say "room". Dialogue stays crisp;
        it just sounds like it happened somewhere.
      </p>
    </div>
  );
}
