"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Conversion factors: value in unit = factor × value in cd/m²
const UNITS: Record<string, { label: string; toNits: number }> = {
  "nit": { label: "cd/m² (nit)", toNits: 1 },
  "cd/ft2": { label: "cd/ft²", toNits: 10.76391 },
  "cd/in2": { label: "cd/in²", toNits: 1550.0031 },
  "footlambert": { label: "Footlambert (fL)", toNits: 3.426259 },
  "lambert": { label: "Lambert", toNits: 3183.0988 },
  "millilambert": { label: "Millilambert", toNits: 3.1830988 },
  "apostilb": { label: "Apostilb", toNits: 0.3183099 },
  "stilb": { label: "Stilb", toNits: 10000 },
};

interface LuminanceResult {
  value: number;
  unit: string;
  nits: number;
  conversions: { unit: string; label: string; value: number }[];
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcLuminance(value: number, unit: string): LuminanceResult {
  const nits = value * UNITS[unit].toNits;
  const conversions = Object.entries(UNITS).map(([u, info]) => ({ unit: u, label: info.label, value: nits / info.toNits }));
  const chartData = [
    { name: "cd/m²", value: Number(nits.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "cd/ft²", value: Number((nits / 10.76391).toFixed(2)), fill: "#8b5cf6" },
    { name: "fL", value: Number((nits / 3.426259).toFixed(2)), fill: "#f59e0b" },
    { name: "cd/in²", value: Number((nits / 1550.0031).toFixed(4)), fill: "#10b981" },
  ];
  const breakdown = [
    { label: "Input", value: `${fmt(value)} ${UNITS[unit].label}` },
    ...conversions.map((c) => ({ label: c.label, value: fmt(c.value) })),
  ];
  const summaryStats = [
    { label: "cd/m² (nits)", value: fmt(nits) },
    { label: "cd/ft²", value: fmt(nits / 10.76391) },
    { label: "cd/in²", value: fmt(nits / 1550.0031) },
    { label: "Footlamberts", value: fmt(nits / 3.426259) },
    { label: "Lambert", value: fmt(nits / 3183.0988) },
    { label: "Apostilb", value: fmt(nits / 0.3183099) },
    { label: "Stilb", value: fmt(nits / 10000) },
    { label: "Input", value: `${fmt(value)} ${UNITS[unit].label}` },
  ];
  return { value, unit, nits, conversions, chartData, breakdown, summaryStats };
}

const DEFAULTS = { value: "500", unit: "nit" };

export default function LuminanceConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<LuminanceResult | null>(null);

  const v = parseFloat(value);
  const errs: string[] = [];
  if (isNaN(v) || v < 0) errs.push("Luminance cannot be negative — enter a positive number.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLuminance(v, unit)); };
  const reset = () => {
    setValue(DEFAULTS.value); setUnit(DEFAULTS.unit);
    setResult(calcLuminance(500, "nit"));
  };
  useEffect(() => { setResult(calcLuminance(500, "nit")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is luminance?", answer: "Luminance measures how bright a surface appears — the luminous intensity emitted per unit area, in candelas per square meter (nits). Unlike illuminance (light arriving), luminance is light leaving a surface toward the eye." },
    { question: "Why are there so many units?", answer: "Displays use nits, older photography used footlamberts, and European engineering used the lambert family. Each unit is a fixed multiple of cd/m², so converting is a single multiplication." },
    { question: "What are typical luminance values?", answer: "A phone screen is roughly 300-800 nits, a TV 200-1000, a sunny sky tens of thousands. The converter makes these numbers comparable no matter which unit a spec sheet quotes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Luminance Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Luminance Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Luminance Value</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={sel}>
                  {Object.entries(UNITS).map(([k, info]) => <option key={k} value={k}>{info.label}</option>)}
                </select>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">In Candelas per Square Meter</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.nits)} cd/m²</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.value)} {UNITS[result.unit].label} · {fmt(result.nits / 3.426259)} footlamberts</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`cd/ft²`, fmt(result.nits / 10.76391)], ["Footlambert", fmt(result.nits / 3.426259)], ["Apostilb", fmt(result.nits / 0.3183099)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold break-all">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">All Conversions</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Key Units Compared</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">The same luminance expressed in common units</p>
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
            <h2 className="text-2xl font-bold mb-3">Luminance vs Illuminance</h2>
            <p>This <strong>luminance converter</strong> works with the light a surface emits or reflects — luminance — measured in candelas per square meter. Illuminance, by contrast, is the light arriving at a surface (lux). The two are linked by a surface's reflectivity but are distinct quantities.</p>
            <h2 className="text-2xl font-bold mb-3">The Unit Ladder</h2>
            <p>One footlambert equals 3.426 cd/m², one cd/ft² equals 10.764 cd/m², and one stilb equals 10,000 cd/m². Every conversion here is an exact factor multiplication from the base unit — no estimation involved.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Spec Sheets</h2>
            <p>Phone and TV brightness is quoted in nits; projectors and film may quote footlamberts or lumens-per-area. Converting to one common unit lets you compare displays fairly regardless of the manufacturer's choice of units.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/luminance-converter" />
          <PopularCalculators exclude="/calculator/luminance-converter" />
        </div>
      </div>
    </>
  );
}
