"use client";
import { useState } from "react";
import { ToolShell, Field, NumberInput, Select, Result } from "../ui";

const ND = [
  { name: "ND2 (1 stop)", stops: 1 },
  { name: "ND4 (2 stops)", stops: 2 },
  { name: "ND8 (3 stops)", stops: 3 },
  { name: "ND16 (4 stops)", stops: 4 },
  { name: "ND32 (5 stops)", stops: 5 },
  { name: "ND64 (6 stops)", stops: 6 },
  { name: "ND400 (~9 stops)", stops: 9 },
  { name: "ND1000 (10 stops)", stops: 10 },
  { name: "ND32000 (15 stops)", stops: 15 },
];

export function NdFilterCalculator() {
  const [base, setBase] = useState(0.004); // sec, 1/250
  const [nd, setNd] = useState(7);
  const newTime = base * Math.pow(2, ND[nd].stops);
  const fmt = (s: number) => {
    if (s < 1) return `1/${Math.round(1 / s)} s`;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = Math.floor(s / 60);
    return `${m}m ${Math.round(s - m * 60)}s`;
  };
  return (
    <ToolShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Base shutter (seconds)" hint="e.g. 0.004 = 1/250, 0.0167 = 1/60">
          <NumberInput value={base} step={0.001} onChange={(e) => setBase(+e.target.value)} />
        </Field>
        <Field label="ND filter">
          <Select value={nd} onChange={(e) => setNd(+e.target.value)}>
            {ND.map((n, i) => <option key={n.name} value={i}>{n.name}</option>)}
          </Select>
        </Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="New shutter speed" value={fmt(newTime)} />
        <Result label="Light reduction" value={`${ND[nd].stops} stops`} sub={`×${Math.pow(2, ND[nd].stops)}`} />
      </div>
    </ToolShell>
  );
}
