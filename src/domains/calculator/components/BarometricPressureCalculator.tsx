"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

type PressureUnit = "hPa" | "inHg" | "mmHg" | "atm" | "kPa" | "psi";

const TO_HPA: Record<PressureUnit, number> = {
  hPa: 1,
  inHg: 33.8639,
  mmHg: 1.33322,
  atm: 1013.25,
  kPa: 10,
  psi: 68.9476,
};

const UNIT_LABEL: Record<PressureUnit, string> = {
  hPa: "hPa",
  inHg: "inHg",
  mmHg: "mmHg",
  atm: "atm",
  kPa: "kPa",
  psi: "psi",
};

const M = 0.0289644;
const G = 9.80665;
const R = 8.31447;

const DEFAULTS = {
  pressure: "1013.25",
  fromUnit: "hPa" as PressureUnit,
  toUnit: "inHg" as PressureUnit,
  altitude: "0",
  showAdvanced: false,
  temperature: "15",
  seaLevel: "1013.25",
};

interface ResultType {
  convertedPressure: number;
  convertedUnit: PressureUnit;
  altitudeAdjustedPressure: number;
  altitudeIsValid: boolean;
  chartData: { unit: string; value: number }[];
  summary: { min: number; max: number; mean: number };
}

function convertToHpa(value: number, unit: PressureUnit): number {
  return value * TO_HPA[unit];
}

function convertFromHpa(hpa: number, unit: PressureUnit): number {
  return hpa / TO_HPA[unit];
}

function safeNum(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function calculate(v: typeof DEFAULTS): ResultType {
  const rawPressure = safeNum(v.pressure);
  const altitude = safeNum(v.altitude);
  const temperature = safeNum(v.temperature);
  const seaLevel = safeNum(v.seaLevel);

  const pressureHpa = convertToHpa(rawPressure, v.fromUnit);
  const convertedPressure = convertFromHpa(pressureHpa, v.toUnit);

  const altitudeIsValid = Number.isFinite(altitude) && Number.isFinite(temperature) && Number.isFinite(seaLevel);
  let altitudeAdjustedPressure = convertedPressure;
  if (altitudeIsValid) {
    const tempK = temperature + 273.15;
    const p0 = convertToHpa(seaLevel, "hPa");
    const adjustedHpa = p0 * Math.exp((-M * G * altitude) / (R * tempK));
    altitudeAdjustedPressure = convertFromHpa(adjustedHpa, v.toUnit);
  }

  const chartData = (Object.keys(TO_HPA) as PressureUnit[]).map((u) => ({
    unit: UNIT_LABEL[u],
    value: Number(convertFromHpa(pressureHpa, u).toFixed(4)),
  }));

  const values = chartData.map((d) => d.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return {
    convertedPressure,
    convertedUnit: v.toUnit,
    altitudeAdjustedPressure,
    altitudeIsValid,
    chartData,
    summary: { min, max, mean },
  };
}

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, step, type }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type={type || "number"} step={step || "any"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium appearance-none">
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground pointer-events-none" />
    </div>
  </div>
);

export default function BarometricPressureCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ResultType>(calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: any) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResult(calculate(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const unitOptions = (Object.keys(TO_HPA) as PressureUnit[]).map((u) => ({ value: u, label: UNIT_LABEL[u] }));

  const faqs = [
    { question: "How does altitude affect atmospheric pressure?", answer: "Atmospheric pressure decreases exponentially with altitude because there is less air mass above you. Using the barometric formula P = P₀·exp(−Mgh/RT), a pressure that is 1013.25 hPa at sea level drops to roughly 898 hPa at 1000 m." },
    { question: "Why does temperature matter for pressure conversions?", answer: "Temperature changes the density of the air column and therefore how quickly pressure falls with height. The altitude correction uses absolute temperature in Kelvin, so colder air produces a steeper pressure drop per meter of elevation." },
    { question: "What are common pressure units?", answer: "Hectopascals (hPa) are standard in meteorology, inches of mercury (inHg) in aviation, millimeters of mercury (mmHg) in medicine, and atmospheres (atm), kilopascals (kPa), and pounds per square inch (psi) in engineering." },
    { question: "How is this used in weather forecasting?", answer: "Forecasters compare station pressure to sea-level pressure to remove altitude effects, revealing pressure systems that drive wind, fronts, and storms. Converting between units lets different regions share a consistent dataset." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Barometric Pressure Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Barometric Pressure Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Convert barometric pressure between units and adjust it for altitude and temperature.</p>

            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="pressure" label="Pressure" value={inputs.pressure} onChange={(v: string) => handleChange("pressure", v)} suffix={UNIT_LABEL[inputs.fromUnit]} />
              <SelectInput id="fromUnit" label="From Unit" value={inputs.fromUnit} onChange={(v: PressureUnit) => handleChange("fromUnit", v)} options={unitOptions} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="toUnit" label="To Unit" value={inputs.toUnit} onChange={(v: PressureUnit) => handleChange("toUnit", v)} options={unitOptions} />
              <CompactInput id="altitude" label="Altitude" value={inputs.altitude} onChange={(v: string) => handleChange("altitude", v)} suffix="m" />
            </div>

            <button
              type="button"
              onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground bg-secondary/50 hover:bg-secondary rounded-md px-3 py-2.5 transition-colors mt-1"
            >
              <span>Advanced Options</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {inputs.showAdvanced && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
                <div className="col-span-2">
                  <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Calibration</h4>
                </div>
                <CompactInput id="temperature" label="Temperature" value={inputs.temperature} onChange={(v: string) => handleChange("temperature", v)} suffix="°C" />
                <CompactInput id="seaLevel" label="Sea Level" value={inputs.seaLevel} onChange={(v: string) => handleChange("seaLevel", v)} suffix="hPa" />
              </div>
            )}

            <div className="flex gap-2.5 mt-3">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-11 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none shadow-sm"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div id="results-section" className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-1">
              <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Converted Pressure</p>
              <div className="text-5xl font-black text-foreground mb-1 tracking-tight">
                {result.convertedPressure.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-2xl font-bold text-muted-foreground">{UNIT_LABEL[result.convertedUnit]}</span>
              </div>
              {result.altitudeIsValid && (
                <p className="text-base text-muted-foreground font-medium mt-2">
                  Altitude-adjusted: {result.altitudeAdjustedPressure.toLocaleString(undefined, { maximumFractionDigits: 4 })} {UNIT_LABEL[result.convertedUnit]}
                </p>
              )}
              <Gauge className="absolute right-5 bottom-5 h-16 w-16 text-primary opacity-10" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Min Unit</p>
                <p className="text-lg font-bold text-foreground">{result.summary.min.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Max Unit</p>
                <p className="text-lg font-bold text-foreground">{result.summary.max.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Mean Unit</p>
                <p className="text-lg font-bold text-foreground">{result.summary.mean.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
              </div>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">Pressure Breakdown by Unit</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left font-semibold py-2 pr-4">Unit</th>
                      <th className="text-right font-semibold py-2">Pressure Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.chartData.map((d) => (
                      <tr key={d.unit} className="border-b border-border/60">
                        <td className="py-2 pr-4 font-medium text-foreground">{d.unit}</td>
                        <td className="py-2 text-right font-mono text-foreground">{d.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">Pressure in Different Units</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="unit" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => [value.toLocaleString(undefined, { maximumFractionDigits: 4 }), "Pressure"]} contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => (
                        <Cell key={i} fill={d.unit === UNIT_LABEL[result.convertedUnit] ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Converted ({UNIT_LABEL[result.convertedUnit]})</span>
                  <span className="font-semibold text-foreground">{result.convertedPressure.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Altitude-adjusted</span>
                  <span className="font-semibold text-foreground">{result.altitudeIsValid ? result.altitudeAdjustedPressure.toLocaleString(undefined, { maximumFractionDigits: 4 }) + " " + UNIT_LABEL[result.convertedUnit] : "—"}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Minimum across units</span>
                  <span className="font-semibold text-foreground">{result.summary.min.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Maximum across units</span>
                  <span className="font-semibold text-foreground">{result.summary.max.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mean across units</span>
                  <span className="font-semibold text-foreground">{result.summary.mean.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Barometric Pressure Conversion Works</h2>
            <p>Barometric pressure is the weight of the atmosphere pressing down on a given point, and it is reported in several incompatible units depending on the field. Meteorologists rely on hectopascals (hPa), aviation uses inches of mercury (inHg), medicine uses millimeters of mercury (mmHg), and engineering reaches for atmospheres (atm), kilopascals (kPa), or pounds per square inch (psi). This calculator converts cleanly between them using fixed physical constants: 1 inHg equals 33.8639 hPa, 1 mmHg equals 1.33322 hPa, 1 atm equals 1013.25 hPa, 1 kPa equals 10 hPa, and 1 psi equals 68.9476 hPa. By first normalizing every input to hPa and then scaling to the target unit, the tool avoids compounding rounding errors and keeps results accurate to four decimal places regardless of the source and destination scales.</p>

            <h2 className="text-2xl font-bold mb-3">Altitude and Temperature Correction</h2>
            <p>The barometric formula P = P₀·exp(−Mgh/RT) describes how pressure falls with elevation, where P₀ is sea-level pressure, M is the molar mass of air, g is gravity, h is altitude, R is the gas constant, and T is absolute temperature in Kelvin. Because colder, thinner air exerts less weight, both altitude and temperature change the reading at a mountaintop station versus sea level. Enabling Advanced Options lets you supply the local temperature and a reference sea-level pressure so the calculator returns an altitude-adjusted value that meteorologists and pilots use to compare stations fairly. Without this correction, a high-altitude station would always look like a low-pressure system even on a calm day.</p>

            <h2 className="text-2xl font-bold mb-3">Forecasting and Practical Applications</h2>
            <p>In weather forecasting, converting station pressure to sea-level pressure exposes the highs and lows that drive wind, fronts, and storms, while altitude correction ensures satellite and ground networks speak the same language. Aviators use the same math to set altimeters and judge density altitude, hikers track pressure trends to predict incoming weather, and HVAC and process engineers size equipment against expected load. By showing every unit side by side in one bar chart and a breakdown table, this calculator makes it easy to verify a reading, share it across disciplines, and understand exactly how elevation reshapes the atmosphere above you.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/barometric-pressure-calculator" />
          <PopularCalculators exclude="/calculator/barometric-pressure-calculator" />
        </div>
      </div>
    </>
  );
}
