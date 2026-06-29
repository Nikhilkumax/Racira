"use client";
import { useState } from "react";
import { ToolShell, Field, NumberInput, Result } from "../ui";

export function PrintSizeCalculator() {
  const [px, setPx] = useState(6000);
  const [py, setPy] = useState(4000);
  const [dpi, setDpi] = useState(300);
  const wIn = px / dpi;
  const hIn = py / dpi;
  return (
    <ToolShell note="Recommended: 300 DPI for fine prints, 240 for large prints, 150 for posters.">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Image width (px)"><NumberInput value={px} onChange={(e) => setPx(+e.target.value)} /></Field>
        <Field label="Image height (px)"><NumberInput value={py} onChange={(e) => setPy(+e.target.value)} /></Field>
        <Field label="Print DPI"><NumberInput value={dpi} onChange={(e) => setDpi(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="Print size (inches)" value={`${wIn.toFixed(2)} × ${hIn.toFixed(2)} in`} />
        <Result label="Print size (cm)" value={`${(wIn * 2.54).toFixed(1)} × ${(hIn * 2.54).toFixed(1)} cm`} />
      </div>
    </ToolShell>
  );
}
