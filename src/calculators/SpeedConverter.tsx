"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SpeedUnit = "mps" | "kmh" | "mph" | "kn" | "fps" | "mach";
const units: { key: SpeedUnit; label: string; toMps: number }[] = [
  { key: "mps", label: "Meters/sec (m/s)", toMps: 1 },
  { key: "kmh", label: "Kilometers/hr (km/h)", toMps: 1 / 3.6 },
  { key: "mph", label: "Miles/hr (mph)", toMps: 0.44704 },
  { key: "kn", label: "Knots (kn)", toMps: 0.514444 },
  { key: "fps", label: "Feet/sec (ft/s)", toMps: 0.3048 },
  { key: "mach", label: "Mach", toMps: 343 },
];

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const SpeedConverter = () => {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<SpeedUnit>("kmh");
  const [to, setTo] = useState<SpeedUnit>("mph");

  const v = parseFloat(value) || 0;
  const fromUnit = units.find(u => u.key === from)!;
  const toUnit = units.find(u => u.key === to)!;
  const mps = v * fromUnit.toMps;
  const result = mps / toUnit.toMps;

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Speed Converter" }]} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Speed Converter</h1>
        <p className="text-muted-foreground mb-6">Convert between common speed and velocity units.</p>

        <div className="card-calc p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <InputField id="spd-value" label="Value" value={value} onChange={setValue} />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={from} onValueChange={(v) => setFrom(v as SpeedUnit)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map(u => <SelectItem key={u.key} value={u.key}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Select value={to} onValueChange={(v) => setTo(v as SpeedUnit)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map(u => <SelectItem key={u.key} value={u.key}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="card-calc p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Result</h2>
          <div className="result-card">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{fromUnit.label} → {toUnit.label}</p>
            <p className="text-2xl font-bold text-accent">{fmt(v)} → {fmt(result)}</p>
          </div>
          <h3 className="text-md font-semibold text-foreground mt-6 mb-3">All Conversions</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {units.map(u => (
              <div key={u.key} className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{u.label}</p>
                <p className="text-lg font-bold text-foreground">{fmt(mps / u.toMps)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpeedConverter;

