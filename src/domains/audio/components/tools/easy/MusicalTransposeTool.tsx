"use client";

/**
 * Musical Transpose Tool — rewrites a set of chord symbols into a new key
 * (transposeChordSymbol, Node-verified) with quick ±1/±2 semitone nudges and
 * a reference of the scale it lands in. Pure text tool: no audio is
 * processed, so you can paste it straight into chord sheets / DAW markers.
 */

import { useMemo, useState } from "react";

import { transposeChordSymbol } from "@/domains/audio/lib/calc";
import { buildScale } from "@/domains/audio/lib/theory";

const PRESETS = ["Am", "C", "Dm7", "G7", "F", "Em", "Bb", "E"] as const;

export default function MusicalTransposeTool() {
  const [text, setText] = useState("Am  F  C  G\nAm  Em  F  E");
  const [semitones, setSemitones] = useState(2);

  const { lines, unparsed } = useMemo(() => {
    const rows = text.split("\n").map((line) => {
      const tokens = line.split(/(\s+)/); // keep whitespace for round-trip layout
      return tokens.map((tok) => {
        if (!tok || /^\s+$/.test(tok)) return { text: tok, chord: null as string | null };
        const t = transposeChordSymbol(tok, semitones);
        return t ? { text: t.transposedRoot + t.suffix, chord: tok } : { text: tok, chord: null };
      });
    });
    const bad = text
      .split(/[\s,]+/)
      .filter((w) => w && /^[A-G]/.test(w) && transposeChordSymbol(w, semitones) === null);
    return { lines: rows, unparsed: bad.slice(0, 5) };
  }, [text, semitones]);

  // Reference scale: transpose C (or A minor) by the same amount.
  const referenceRoot = useMemo(() => {
    const t = transposeChordSymbol("C", semitones);
    return t ? t.transposedRoot + " major" : "";
  }, [semitones]);
  const referenceScale = useMemo(
    () => buildScale((transposeChordSymbol("C", semitones)?.transposedRoot ?? "C") + "4", "Major (Ionian)"),
    [semitones],
  );

  const nudge = (d: number) => setSemitones((s) => (((s + d + 12) % 12) + 12) % 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Transpose by</span>
        <div className="inline-flex items-center rounded-lg border border-border">
          <button type="button" onClick={() => nudge(-1)} className="px-3 py-1.5 text-sm font-medium hover:text-foreground" aria-label="Down one semitone">
            −1
          </button>
          <span className="min-w-14 border-x border-border px-2 py-1.5 text-center text-sm font-bold">
            {semitones > 0 ? `+${semitones}` : semitones}
          </span>
          <button type="button" onClick={() => nudge(1)} className="px-3 py-1.5 text-sm font-medium hover:text-foreground" aria-label="Up one semitone">
            +1
          </button>
        </div>
        <button type="button" onClick={() => nudge(2)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:text-foreground">
          +2 (whole step)
        </button>
        <button type="button" onClick={() => nudge(-3)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:text-foreground">
          −3
        </button>
        <button type="button" onClick={() => nudge(5)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:text-foreground">
          +5 (fourth up)
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Chords in</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground"
            spellCheck={false}
          />
        </label>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Chords out</span>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(lines.map((l) => l.map((t) => t.text).join("")).join("\n"))}
              className="text-xs font-medium text-primary hover:underline"
            >
              Copy result
            </button>
          </div>
          <div className="min-h-[168px] whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm text-foreground">
            {lines.map((l, i) => (
              <div key={i}>{l.map((t, j) => (
                <span key={j} className={t.chord !== null && t.text !== t.chord ? "font-semibold text-primary" : undefined}>
                  {t.text}
                </span>
              ))}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => setText((t) => `${t} ${p}`.trim())} className="rounded-md border border-border px-2 py-1 font-mono text-xs hover:border-primary/40">
            {p}
          </button>
        ))}
        <button type="button" onClick={() => setText("")} className="text-xs text-muted-foreground underline">
          clear
        </button>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        C major transposed {semitones > 0 ? `+${semitones}` : semitones} → {referenceRoot}
        {referenceScale && <> · notes: {referenceScale.map((n) => n.name).join(" ")}</>}
      </div>

      {unparsed.length > 0 && (
        <p className="text-xs text-amber-600">
          Not recognized as chords: {unparsed.join(", ")} — left as written.
        </p>
      )}
    </div>
  );
}
