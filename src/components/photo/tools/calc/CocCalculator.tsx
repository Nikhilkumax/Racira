"use client";
import { useState } from "react";
import { ToolShell, Field, NumberInput, Result } from "../ui";

export function CocCalculator() {
  const [width, setWidth] = useState(36);
  const [height, setHeight] = useState(24);
  const [viewing, setViewing] = useState(25); // cm
  const [resolution, setResolution] = useState(5); // lp/mm
  const diag = Math.hypot(width, height);
  const zeiss = diag / 1730;
  const fromViewing = viewing * 10 / (resolution * 1500);
  return (
    <ToolShell note="Two estimates: Zeiss formula (sensor diagonal / 1730) and viewing-based.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Sensor width (mm)"><NumberInput value={width} onChange={(e) => setWidth(+e.target.value)} /></Field>
        <Field label="Sensor height (mm)"><NumberInput value={height} onChange={(e) => setHeight(+e.target.value)} /></Field>
        <Field label="Viewing distance (cm)"><NumberInput value={viewing} onChange={(e) => setViewing(+e.target.value)} /></Field>
        <Field label="Eye resolution (lp/mm)"><NumberInput value={resolution} step={0.5} onChange={(e) => setResolution(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="CoC (Zeiss)" value={`${zeiss.toFixed(4)} mm`} sub={`Diagonal ${diag.toFixed(1)} mm`} />
        <Result label="CoC (viewing-based)" value={`${fromViewing.toFixed(4)} mm`} />
      </div>
    </ToolShell>
  );
}
