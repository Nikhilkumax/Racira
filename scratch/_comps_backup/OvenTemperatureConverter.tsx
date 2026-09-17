"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OvenResult {
  c: number;
  f: number;
  k: number;
  gas: number;
  label: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 0): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function gasMark(c: number): number {
  const f = (c * 9) / 5 + 32;
  return Math.max(1, Math.min(9, Math.round((f - 275) / 25) + 1));
}

function heatLabel(c: number): string {
  if (c < 110) return "Very low (warming)";
  if (c < 150) return "Low / slow";
  if (c < 170) return "Moderately low";
  if (c < 190) return "Moderate / medium";
  if (c < 220) return "Moderately hot";
  if (c < 250) return "Hot";
  return "Very hot";
}

function calcOven(unit: string, value: number): OvenResult {
  let c = 0;
  if (unit === "c") c = value;
  else if (unit === "f") c = ((value - 32) * 5) / 9;
  else if (unit === "k") c = value - 273.15;
  else c = (((275 + (value - 1) * 25) - 32) * 5) / 9; // gas mark
  const f = (c * 9) / 5 + 32;
  const k = c + 273.15;
  const gas = gasMark(c);
  const label = heatLabel(c);
  const breakdown = [
    { label: "Celsius", value: `${fmt(c)} °C` },
    { label: "Fahrenheit", value: `${fmt(f)} °F` },
    { label: "Kelvin", value: `${fmt(k)} K` },
    { label: "Gas Mark", value: `Mark ${gas}` },
    { label: "Oven Description", value: label },
  ];
  const summaryStats = [
    { label: "Celsius", value: `${fmt(c)} °C` },
    { label: "Fahrenheit", value: `${fmt(f)} °F` },
    { label: "Gas Mark", value: `${gas}` },
    { label: "Heat Level", value: label },
  ];
  const chartData = [
    { name: "°C", value: Number(c.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "°F", value: Number(f.toFixed(0)), fill: "#f59e0b" },
    { name: "K", value: Number(k.toFixed(0)), fill: "#10b981" },
  ];
  return { c, f, k, gas, label, breakdown, summaryStats, chartData };
}

const DEFAULTS = { unit: "c", value: "180" };

export default function OvenTemperatureConverter() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [value, setValue] = useState(DEFAULTS.value);
  const [result, setResult] = useState<OvenResult | null>(null);

  const v = parseFloat(value);
  const errs: string[] = [];
  if (isNaN(v)) errs.push("Temperature must be a number.");
  if (unit === "k" && v < 0) errs.push("Kelvin cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOven(unit, v)); };
  const reset = () => {
    setUnit(DEFAULTS.unit); setValue(DEFAULTS.value);
    setResult(calcOven("c", 180));
  };
  const changeUnit = (u: string) => {
    setUnit(u);
    setValue(u === "c" ? "180" : u === "f" ? "350" : u === "k" ? "453" : "4");
    setResult(calcOven(u, u === "c" ? 180 : u === "f" ? 350 : u === "k" ? 453 : 4));
  };
  useEffect(() => { setResult(calcOven("c", 180)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const presets = [
    { label: "Slow 150°C", u: "c", v: "150" },
    { label: "Moderate 180°C", u: "c", v: "180" },
    { label: "Hot 200°C", u: "c", v: "200" },
    { label: "350°F", u: "f", v: "350" },
    { label: "400°F", u: "f", v: "400" },
    { label: "Gas 4", u: "gas", v: "4" },
  ];

  const faqs = [
    { question: "How do I convert oven temperatures?", answer: "Celsius to Fahrenheit: ×9/5 + 32. Fahrenheit to Celsius: −32 then ×5/9. Kelvin adds 273.15 to Celsius. Gas marks step roughly 14 °C per mark, with mark 1 near 135 °C." },
    { question: "What is a gas mark?", answer: "A UK oven scale where each mark corresponds to a heat setting — mark 1 is low (~135 °C), mark 4 moderate (~180 °C), mark 7 hot (~220 °C). The converter interpolates between marks using 14 °C steps." },
    { question: "Why do recipes disagree?", answer: "Ovens drift, and older recipes predate standard calibration. Use the heat label as a sanity check: a 'moderate' oven should be near 180 °C regardless of whether the recipe was written in Celsius or Fahrenheit." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Oven Temperature Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Oven Temperature Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Unit</label>
              <select value={unit} onChange={e => changeUnit(e.target.value)} className={inp}>
                <option value="c">Celsius (°C)</option>
                <option value="f">Fahrenheit (°F)</option>
                <option value="k">Kelvin (K)</option>
                <option value="gas">Gas Mark</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Temperature</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} className={inp} placeholder="180" />
            </div>
            <div>
              <label className={lbl}>Common Settings</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => { setUnit(p.u); setValue(p.v); setResult(calcOven(p.u, parseFloat(p.v))); }} className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-secondary text-muted-foreground hover:bg-accent">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Temperature</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.c)} °C</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.f)} °F · {fmt(result.k)} K · Gas Mark {result.gas} · {result.label}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Fahrenheit", `${fmt(result.f)} °F`], ["Kelvin", `${fmt(result.k)} K`], ["Gas Mark", `${result.gas}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 0 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Temperature Scales</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The same heat expressed in each scale</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Recipes in Any Language</h2>
            <p>A 350°F American recipe, a 180°C European one, and a "gas mark 4" British one all point to the same oven. This <strong>oven temperature converter</strong> translates between Celsius, Fahrenheit, Kelvin, and gas marks in one click.</p>
            <h2 className="text-2xl font-bold mb-3">The Conversions</h2>
            <p>°F = °C × 9/5 + 32; °C = (°F − 32) × 5/9; K = °C + 273.15. Gas marks step about 14 °C per mark from a low of ~135 °C at mark 1 — close enough for baking, where ovens vary by 10 °C anyway.</p>
            <h2 className="text-2xl font-bold mb-3">Trust the Heat Level</h2>
            <p>Descriptions like "moderate" or "hot" survive translation better than any number. The converter pairs every result with its descriptive level so you can sanity-check an unfamiliar recipe before the cake hits the oven.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/oven-temperature-converter" />
          <PopularCalculators exclude="/calculator/oven-temperature-converter" />
        </div>
      </div>
    </>
  );
}
