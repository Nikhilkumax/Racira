"use client";
import { useState, useMemo } from "react";
import { ToolShell, Field, NumberInput, Select, Result, SENSORS } from "../ui";

export function FovCalculator() {
  const [sensor, setSensor] = useState(0);
  const [focal, setFocal] = useState(50);
  const [distance, setDistance] = useState(5);
  const r = useMemo(() => {
    const s = SENSORS[sensor];
    const h = 2 * Math.atan(s.width / (2 * focal)) * (180 / Math.PI);
    const v = 2 * Math.atan(s.height / (2 * focal)) * (180 / Math.PI);
    const d = 2 * Math.atan(Math.hypot(s.width, s.height) / (2 * focal)) * (180 / Math.PI);
    const fw = 2 * distance * Math.tan((h * Math.PI) / 360);
    const fh = 2 * distance * Math.tan((v * Math.PI) / 360);
    return { h, v, d, fw, fh };
  }, [sensor, focal, distance]);
  return (
    <ToolShell>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Sensor">
          <Select value={sensor} onChange={(e) => setSensor(+e.target.value)}>
            {SENSORS.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Focal length (mm)"><NumberInput value={focal} onChange={(e) => setFocal(+e.target.value)} /></Field>
        <Field label="Subject distance (m)"><NumberInput value={distance} step={0.1} onChange={(e) => setDistance(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Result label="Horizontal FoV" value={`${r.h.toFixed(1)}°`} />
        <Result label="Vertical FoV" value={`${r.v.toFixed(1)}°`} />
        <Result label="Diagonal FoV" value={`${r.d.toFixed(1)}°`} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Result label="Frame width @ distance" value={`${r.fw.toFixed(2)} m`} />
        <Result label="Frame height @ distance" value={`${r.fh.toFixed(2)} m`} />
      </div>
    </ToolShell>
  );
}
