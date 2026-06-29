"use client";
import { useState } from "react";
import { ToolShell, Field, NumberInput, Result } from "../ui";

export function MagnificationCalculator() {
  const [focal, setFocal] = useState(100);
  const [subject, setSubject] = useState(0.5); // m
  const s = subject * 1000;
  const m = focal / (s - focal);
  return (
    <ToolShell note="Magnification ratio (image height / subject height). 1.0× = life size.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Focal length (mm)"><NumberInput value={focal} onChange={(e) => setFocal(+e.target.value)} /></Field>
        <Field label="Subject distance (m)"><NumberInput value={subject} step={0.01} onChange={(e) => setSubject(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="Magnification" value={`${m.toFixed(3)}×`} />
        <Result label="Reproduction ratio" value={`1 : ${(1 / m).toFixed(1)}`} />
      </div>
    </ToolShell>
  );
}
