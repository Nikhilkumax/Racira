"use client";
import { useState } from "react";
import { ToolShell, Field, NumberInput, Result } from "../ui";

export function PrintDpiChecker() {
  const [px, setPx] = useState(6000);
  const [py, setPy] = useState(4000);
  const [wIn, setWIn] = useState(20);
  const [hIn, setHIn] = useState(13.3);
  const dpiW = px / wIn;
  const dpiH = py / hIn;
  const eff = Math.min(dpiW, dpiH);
  const quality = eff >= 300 ? "Excellent (fine art)" : eff >= 240 ? "Great" : eff >= 180 ? "Good" : eff >= 100 ? "Acceptable for posters" : "Too low";
  return (
    <ToolShell>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Width (px)"><NumberInput value={px} onChange={(e) => setPx(+e.target.value)} /></Field>
        <Field label="Height (px)"><NumberInput value={py} onChange={(e) => setPy(+e.target.value)} /></Field>
        <Field label="Print width (in)"><NumberInput value={wIn} step={0.1} onChange={(e) => setWIn(+e.target.value)} /></Field>
        <Field label="Print height (in)"><NumberInput value={hIn} step={0.1} onChange={(e) => setHIn(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="Effective DPI" value={`${eff.toFixed(0)} DPI`} sub={`${dpiW.toFixed(0)} × ${dpiH.toFixed(0)}`} />
        <Result label="Quality assessment" value={quality} />
      </div>
    </ToolShell>
  );
}
