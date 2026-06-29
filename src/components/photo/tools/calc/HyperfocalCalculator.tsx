"use client";
import { useState, useMemo } from "react";
import { ToolShell, Field, NumberInput, Select, Result, SENSORS } from "../ui";

export function HyperfocalCalculator() {
  const [sensor, setSensor] = useState(0);
  const [focal, setFocal] = useState(24);
  const [aperture, setAperture] = useState(8);
  const r = useMemo(() => {
    const c = SENSORS[sensor].coc;
    const H = (focal * focal) / (aperture * c) + focal;
    return { H: H / 1000, near: H / 2 / 1000 };
  }, [sensor, focal, aperture]);
  return (
    <ToolShell note="Focus at the hyperfocal distance to make everything from half that distance to infinity acceptably sharp.">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Sensor">
          <Select value={sensor} onChange={(e) => setSensor(+e.target.value)}>
            {SENSORS.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Focal length (mm)">
          <NumberInput value={focal} min={1} onChange={(e) => setFocal(+e.target.value)} />
        </Field>
        <Field label="Aperture (f/)">
          <NumberInput value={aperture} step={0.1} onChange={(e) => setAperture(+e.target.value)} />
        </Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="Hyperfocal distance" value={`${r.H.toFixed(2)} m`} sub="Focus here for max DoF" />
        <Result label="Near sharp limit" value={`${r.near.toFixed(2)} m`} sub="Sharpness extends from here to ∞" />
      </div>
    </ToolShell>
  );
}
