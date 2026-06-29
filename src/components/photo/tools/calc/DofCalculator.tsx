"use client";
import { useState, useMemo } from "react";
import { ToolShell, Field, NumberInput, Select, Result, SENSORS } from "../ui";

export function DofCalculator() {
  const [sensor, setSensor] = useState(0);
  const [focal, setFocal] = useState(50);
  const [aperture, setAperture] = useState(2.8);
  const [distance, setDistance] = useState(3); // meters

  const r = useMemo(() => {
    const c = SENSORS[sensor].coc; // mm
    const f = focal; // mm
    const N = aperture;
    const s = distance * 1000; // mm
    const H = (f * f) / (N * c) + f; // mm
    const near = (s * (H - f)) / (H + s - 2 * f);
    const far = (s * (H - f)) / (H - s);
    const total = far > 0 ? far - near : Infinity;
    return {
      near: near / 1000,
      far: far > 0 ? far / 1000 : Infinity,
      total: total / 1000,
      hyperfocal: H / 1000,
    };
  }, [sensor, focal, aperture, distance]);

  const fmt = (v: number) => (!isFinite(v) ? "∞" : v < 1 ? `${(v * 100).toFixed(1)} cm` : `${v.toFixed(2)} m`);

  return (
    <ToolShell note="Distances assume the circle of confusion for the selected sensor. Real-world DoF varies with viewing conditions.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Sensor">
          <Select value={sensor} onChange={(e) => setSensor(+e.target.value)}>
            {SENSORS.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Focal length (mm)">
          <NumberInput value={focal} min={1} onChange={(e) => setFocal(+e.target.value)} />
        </Field>
        <Field label="Aperture (f/)">
          <NumberInput value={aperture} step={0.1} min={0.7} onChange={(e) => setAperture(+e.target.value)} />
        </Field>
        <Field label="Subject distance (m)">
          <NumberInput value={distance} step={0.1} min={0.05} onChange={(e) => setDistance(+e.target.value)} />
        </Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Near focus" value={fmt(r.near)} />
        <Result label="Far focus" value={fmt(r.far)} />
        <Result label="Total DoF" value={fmt(r.total)} />
        <Result label="Hyperfocal" value={fmt(r.hyperfocal)} />
      </div>
    </ToolShell>
  );
}
