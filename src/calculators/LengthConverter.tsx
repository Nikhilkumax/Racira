"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LengthUnit = "mm" | "cm" | "m" | "km" | "in" | "ft" | "yd" | "mi" | "nm";
const units: { key: LengthUnit; label: string; toMeters: number }[] = [
  { key: "mm", label: "Millimeters (mm)", toMeters: 0.001 },
  { key: "cm", label: "Centimeters (cm)", toMeters: 0.01 },
  { key: "m", label: "Meters (m)", toMeters: 1 },
  { key: "km", label: "Kilometers (km)", toMeters: 1000 },
  { key: "in", label: "Inches (in)", toMeters: 0.0254 },
  { key: "ft", label: "Feet (ft)", toMeters: 0.3048 },
  { key: "yd", label: "Yards (yd)", toMeters: 0.9144 },
  { key: "mi", label: "Miles (mi)", toMeters: 1609.344 },
  { key: "nm", label: "Nautical Miles (nm)", toMeters: 1852 },
];

const fmt = (n: number) => {
  if (Math.abs(n) >= 0.01 || n === 0) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  return n.toExponential(4);
};

const LengthConverter = () => {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<LengthUnit>("m");
  const [to, setTo] = useState<LengthUnit>("ft");

  const v = parseFloat(value) || 0;
  const fromUnit = units.find(u => u.key === from)!;
  const toUnit = units.find(u => u.key === to)!;
  const meters = v * fromUnit.toMeters;
  const result = meters / toUnit.toMeters;

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Length Converter" }]} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Length Converter</h1>
        <p className="text-muted-foreground mb-6">Convert between metric and imperial length units.</p>

        <div className="card-calc p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <InputField id="len-value" label="Value" value={value} onChange={setValue} />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={from} onValueChange={(v) => setFrom(v as LengthUnit)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map(u => <SelectItem key={u.key} value={u.key}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Select value={to} onValueChange={(v) => setTo(v as LengthUnit)}>
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
                <p className="text-lg font-bold text-foreground">{fmt(meters / u.toMeters)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LengthConverter;

