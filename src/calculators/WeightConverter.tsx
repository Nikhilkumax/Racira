"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WeightUnit = "mg" | "g" | "kg" | "ton" | "oz" | "lb" | "st";
const units: { key: WeightUnit; label: string; toGrams: number }[] = [
  { key: "mg", label: "Milligrams (mg)", toGrams: 0.001 },
  { key: "g", label: "Grams (g)", toGrams: 1 },
  { key: "kg", label: "Kilograms (kg)", toGrams: 1000 },
  { key: "ton", label: "Metric Tons (t)", toGrams: 1_000_000 },
  { key: "oz", label: "Ounces (oz)", toGrams: 28.3495 },
  { key: "lb", label: "Pounds (lb)", toGrams: 453.592 },
  { key: "st", label: "Stones (st)", toGrams: 6350.29 },
];

const fmt = (n: number) => {
  if (Math.abs(n) >= 0.01 || n === 0) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  return n.toExponential(4);
};

const WeightConverter = () => {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<WeightUnit>("kg");
  const [to, setTo] = useState<WeightUnit>("lb");

  const v = parseFloat(value) || 0;
  const fromUnit = units.find(u => u.key === from)!;
  const toUnit = units.find(u => u.key === to)!;
  const grams = v * fromUnit.toGrams;
  const result = grams / toUnit.toGrams;

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Weight Converter" }]} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Weight Converter</h1>
        <p className="text-muted-foreground mb-6">Convert between metric and imperial weight/mass units.</p>

        <div className="card-calc p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <InputField id="wt-value" label="Value" value={value} onChange={setValue} />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={from} onValueChange={(v) => setFrom(v as WeightUnit)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map(u => <SelectItem key={u.key} value={u.key}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Select value={to} onValueChange={(v) => setTo(v as WeightUnit)}>
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
                <p className="text-lg font-bold text-foreground">{fmt(grams / u.toGrams)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WeightConverter;

