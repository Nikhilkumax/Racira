"use client";

import { useState } from "react";
import { Btn, Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "../ui";
import { FONTS, WEIGHTS } from "../fonts";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789 .,;:!?()[]{}&@#$%*";
const SAMPLE_LINES = [
  "The quick brown fox jumps over the lazy dog",
  "Sphinx of black quartz, judge my vow",
  "Waltz, bad nymph, for quick jigs vex",
];

/**
 * Font Specimen Sheet — a printable specimen: display alphabet, digit and
 * punctuation rows, a weight ladder and sample paragraphs, laid out for A4/Letter
 * print. The Print button calls window.print(); the sheet itself uses a light
 * surface with black text so the printout does not invert.
 */
export default function FontSpecimenSheet() {
  const [fontName, setFontName] = useState("Fraunces");
  const [title, setTitle] = useState("Racira Fonts — Specimen");
  const [note, setNote] = useState("Display size 72px · text size 16px · printed at 100%");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const lineCount = SAMPLE_LINES.length;

  return (
    <div className="space-y-4">
      <Panel className="print:hidden">
        <PanelTitle>Specimen settings</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Sel
            name="font"
            label="Font family"
            value={fontName}
            onChange={setFontName}
            options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
          />
          <TextInput name="title" label="Sheet title" value={title} onChange={setTitle} />
          <TextInput name="note" label="Footer note" value={note} onChange={setNote} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Btn onClick={() => window.print()} testid="print-specimen">
            Print specimen
          </Btn>
          <span className="text-xs text-muted-foreground">Print styles hide this control panel.</span>
        </div>
        <ResBox>
          <Res name="family" label="Family" value={font.name} />
          <Res name="kind" label="Classification" value={font.kind} />
          <Res name="lines" label="Sample lines" value={String(lineCount)} />
        </ResBox>
      </Panel>

      {/* Light print surface: mirrors what the printer will render. */}
      <div
        data-testid="specimen-sheet"
        className="rounded-xl border border-border bg-white p-6 text-black shadow-sm sm:p-10"
        style={{ fontFamily: font.stack }}
      >
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/20 pb-4">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">{font.name}</span>
        </header>

        <p className="mt-6 text-5xl leading-none tracking-tight sm:text-6xl">{font.name}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
          {font.kind} · {WEIGHTS.join(" · ")}
        </p>

        <p className="mt-6 break-words text-lg leading-relaxed">{ALPHABET}</p>
        <p className="mt-2 break-words text-lg leading-relaxed">{ALPHABET.toLowerCase()}</p>
        <p className="mt-2 break-words text-lg leading-relaxed">{DIGITS}</p>

        <div className="mt-8 space-y-2 border-t border-black/10 pt-6">
          {WEIGHTS.map((w) => (
            <div key={w} className="flex items-baseline gap-4">
              <span className="w-10 shrink-0 font-mono text-[10px] text-black/50">{w}</span>
              <span style={{ fontWeight: w }} className="min-w-0 flex-1 truncate text-xl">
                Weight {w} — {font.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-black/10 pt-6 text-[15px] leading-relaxed">
          {SAMPLE_LINES.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>

        <footer className="mt-8 border-t border-black/20 pt-3 text-[10px] text-black/60">{note}</footer>
      </div>
    </div>
  );
}
