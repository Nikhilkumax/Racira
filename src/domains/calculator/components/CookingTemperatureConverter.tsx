"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Thermometer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ConvertResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  converted: number;
  convertedLabel: string;
  chartData: { name: string; temp: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const UNITS: Record<string, { label: string; toC: (v: number) => number; fromC: (c: number) => number }> = {
  f: { label: "Fahrenheit (°F)", toC: (v) => (v - 32) * 5 / 9, fromC: (c) => c * 9 / 5 + 32 },
  c: { label: "Celsius (°C)", toC: (v) => v, fromC: (c) => c },
  k: { label: "Kelvin (K)", toC: (v) => v - 273.15, fromC: (c) => c + 273.15 },
};

function convertTemp(value: number, from: string, to: string): ConvertResult {
  const toC = UNITS[from].toC(value);
  const converted = UNITS[to].fromC(toC);

  const chartData = [
    { name: "From", temp: value },
    { name: "To", temp: Math.round(converted * 100) / 100 },
  ];

  const breakdown = [
    { label: "Input", value: `${value} ${from.toUpperCase()}` },
    { label: "Converted", value: `${converted.toFixed(2)} ${to.toUpperCase()}` },
    { label: "In Celsius", value: `${toC.toFixed(2)} °C` },
    { label: "In Fahrenheit", value: `${(toC * 9 / 5 + 32).toFixed(2)} °F` },
    { label: "In Kelvin", value: `${(toC + 273.15).toFixed(2)} K` },
    { label: "Common Doneness (this temp)", value: donenessLabel(toC) },
  ];

  const summaryStats = [
    { label: `Converted (${to.toUpperCase()})`, value: `${converted.toFixed(2)}` },
    { label: "Celsius", value: `${toC.toFixed(2)} °C` },
    { label: "Fahrenheit", value: `${(toC * 9 / 5 + 32).toFixed(2)} °F` },
    { label: "Kelvin", value: `${(toC + 273.15).toFixed(2)} K` },
    { label: "Absolute Zero", value: "-273.15 °C / 0 K" },
    { label: "Water Boils", value: "100 °C / 212 °F" },
  ];

  return { value, fromUnit: from, toUnit: to, converted, convertedLabel: `${converted.toFixed(2)} ${to.toUpperCase()}`, chartData, breakdown, summaryStats };
}

function donenessLabel(c: number): string {
  if (c >= 70) return "Well done / pasteurizing";
  if (c >= 63) return "Well done (beef/pork)";
  if (c >= 60) return "Medium well";
  if (c >= 55) return "Medium";
  if (c >= 52) return "Medium rare";
  if (c >= 45) return "Rare";
  return "Below cooking range";
}

const DEFAULTS = { value: "350", from: "f", to: "c" };

export default function CookingTemperatureConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [to, setTo] = useState(DEFAULTS.to);
  const [result, setResult] = useState<ConvertResult>(() => convertTemp(350, "f", "c"));

  useEffect(() => {
    const v = parseFloat(value);
    if (!isNaN(v)) setResult(convertTemp(v, from, to));
  }, [value, from, to]);

  const reset = () => { setValue(DEFAULTS.value); setFrom(DEFAULTS.from); setTo(DEFAULTS.to); };
  const invalid = isNaN(parseFloat(value));

  const faqs = [
    { question: "What is the formula for converting Fahrenheit to Celsius?", answer: "Subtract 32, multiply by 5, then divide by 9: (°F − 32) × 5/9 = °C. To go the other way: °C × 9/5 + 32 = °F." },
    { question: "What is 350°F in Celsius?", answer: "350°F is about 177°C — the classic baking temperature. 400°F ≈ 204°C and 425°F ≈ 218°C are common roasting settings." },
    { question: "Why do some recipes use fan/air fryer temperatures?", answer: "Convection ovens circulate hot air and cook faster, so recipes often recommend lowering the temperature by 25°F (about 14°C) when using the fan setting." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cooking Temperature Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cooking Temperature Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="tempval" className="block text-sm font-medium mb-1 text-foreground">Temperature</label>
              <input id="tempval" type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fromu" className="block text-sm font-medium mb-1 text-foreground">From</label>
                <select id="fromu" value={from} onChange={(e) => setFrom(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="f">Fahrenheit</option>
                  <option value="c">Celsius</option>
                  <option value="k">Kelvin</option>
                </select>
              </div>
              <div>
                <label htmlFor="tou" className="block text-sm font-medium mb-1 text-foreground">To</label>
                <select id="tou" value={to} onChange={(e) => setTo(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="c">Celsius</option>
                  <option value="f">Fahrenheit</option>
                  <option value="k">Kelvin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Thermometer className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid temperature.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Temperature</div>
              <div className="text-4xl font-extrabold text-primary">{result.converted.toFixed(2)}°{result.toUnit.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.value}°{result.fromUnit.toUpperCase()} = {result.convertedLabel} · {donenessLabel(UNITS[result.fromUnit].toC(result.value))}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Celsius</div>
                <div className="text-lg font-bold text-primary">{UNITS[result.fromUnit].toC(result.value).toFixed(1)}°C</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Fahrenheit</div>
                <div className="text-lg font-bold text-primary">{(UNITS[result.fromUnit].toC(result.value) * 9 / 5 + 32).toFixed(1)}°F</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Kelvin</div>
                <div className="text-lg font-bold text-primary">{(UNITS[result.fromUnit].toC(result.value) + 273.15).toFixed(1)} K</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scale</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Common Oven Settings (°F → °C)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{ name: "350°F", temp: 177 }, { name: "375°F", temp: 190 }, { name: "400°F", temp: 204 }, { name: "425°F", temp: 218 }, { name: "450°F", temp: 232 }]} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="°C" />
                  <Tooltip formatter={(v: number) => [`${v}°C`, "≈ Celsius"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="temp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Cooking Temperature Converter</h2>
            <p>Recipes around the world use different scales: Fahrenheit in the US, Celsius nearly everywhere else, and Kelvin in science. This converter instantly translates between all three using the standard formulas, and tells you what the temperature means for cooking doneness.</p>
            <h3>Common Conversions</h3>
            <p>350°F ≈ 177°C (baking), 400°F ≈ 204°C (roasting), and 425°F ≈ 218°C (crisping). For convection/air fryer ovens, reduce the temperature by about 25°F (14°C).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cooking-temperature-converter" />
          <PopularCalculators exclude="/calculator/cooking-temperature-converter" />
        </div>
      </div>
    </>
  );
}
