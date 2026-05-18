"use client";
import {  } from "lucide-react";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TempUnit = "celsius" | "fahrenheit" | "kelvin" | "rankine";

const labels: Record<TempUnit, string> = { celsius: "Celsius (°C)", fahrenheit: "Fahrenheit (°F)", kelvin: "Kelvin (K)", rankine: "Rankine (°R)" };

const toCelsius = (v: number, u: TempUnit): number => {
  if (u === "celsius") return v;
  if (u === "fahrenheit") return (v - 32) * 5 / 9;
  if (u === "kelvin") return v - 273.15;
  return (v - 491.67) * 5 / 9;
};

const fromCelsius = (c: number, u: TempUnit): number => {
  if (u === "celsius") return c;
  if (u === "fahrenheit") return c * 9 / 5 + 32;
  if (u === "kelvin") return c + 273.15;
  return (c + 273.15) * 9 / 5;
};

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const TemperatureConverter = () => {
  const [value, setValue] = useState("100");
  const [showResults, setShowResults] = useState(false);
  const [from, setFrom] = useState<TempUnit>("celsius");
  const [to, setTo] = useState<TempUnit>("fahrenheit");

  const v = parseFloat(value) || 0;
  const celsius = toCelsius(v, from);
  const units: TempUnit[] = ["celsius", "fahrenheit", "kelvin", "rankine"];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Temperature Converter" }]} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Temperature Converter</h1>
        <p className="text-muted-foreground mb-6">Convert between Celsius, Fahrenheit, Kelvin, and Rankine.</p>

        <div className="card-calc p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <InputField id="temp-value" label="Value" value={value} onChange={setValue} />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={from} onValueChange={(v) => setFrom(v as TempUnit)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{labels[u]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Select value={to} onValueChange={(v) => setTo(v as TempUnit)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{labels[u]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="card-calc p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Result</h2>
          <div className="result-card">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{labels[from]} → {labels[to]}</p>
            <p className="text-2xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">{fmt(v)} → {fmt(fromCelsius(celsius, to))}</p>
          </div>
          <h3 className="text-md font-semibold text-foreground mt-6 mb-3">All Conversions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {units.map(u => (
              <div key={u} className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{labels[u]}</p>
                <p className="text-xl font-bold text-foreground">{fmt(fromCelsius(celsius, u))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-calc p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Temperature Conversion Formulas</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
            <li>°F = °C × 9/5 + 32</li>
            <li>°C = (°F − 32) × 5/9</li>
            <li>K = °C + 273.15</li>
            <li>°R = (°C + 273.15) × 9/5</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default TemperatureConverter;


