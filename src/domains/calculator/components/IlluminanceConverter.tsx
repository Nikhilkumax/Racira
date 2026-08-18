"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface IlluminanceResult {
  value: number;
  unit: string;
  lux: number;
  fc: number;
  lmM2: number;
  lmFt2: number;
  phot: number;
  nox: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const TO_LUX: Record<string, number> = { lux: 1, fc: 10.76391, lmM2: 1, phot: 10000, nox: 0.001 };

function calcIllum(value: number, unit: string): IlluminanceResult {
  const lux = value * TO_LUX[unit];
  const fc = lux / 10.76391;
  const lmM2 = lux;
  const lmFt2 = fc;
  const phot = lux / 10000;
  const nox = lux * 1000;

  const breakdown = [
    { label: "Input", value: `${value} ${unit}` },
    { label: "Lux (lx)", value: `${lux.toLocaleString("en-US", { maximumFractionDigits: 2 })} lx` },
    { label: "Foot-Candles (fc)", value: `${fc.toLocaleString("en-US", { maximumFractionDigits: 2 })} fc` },
    { label: "Lumens per m²", value: `${lmM2.toLocaleString("en-US", { maximumFractionDigits: 2 })} lm/m²` },
    { label: "Lumens per ft²", value: `${lmFt2.toLocaleString("en-US", { maximumFractionDigits: 2 })} lm/ft²` },
    { label: "Phot (ph)", value: `${phot.toLocaleString("en-US", { maximumFractionDigits: 4 })} ph` },
    { label: "Nox (nx)", value: `${nox.toLocaleString("en-US", { maximumFractionDigits: 0 })} nx` },
    { label: "Reference", value: "1 fc = 10.76391 lx exactly" },
  ];
  const summaryStats = [
    { label: "Lux", value: `${lux.toFixed(2)} lx` },
    { label: "Foot-Candles", value: `${fc.toFixed(2)} fc` },
    { label: "lm/m²", value: `${lmM2.toFixed(2)}` },
    { label: "lm/ft²", value: `${lmFt2.toFixed(2)}` },
    { label: "Phot", value: `${phot.toFixed(4)} ph` },
    { label: "Nox", value: `${nox.toFixed(0)} nx` },
    { label: "Input", value: `${value} ${unit}` },
    { label: "Factor", value: "1 fc = 10.76391 lx" },
  ];
  const chartData = [
    { name: "Lux", value: Math.round(lux), fill: "hsl(var(--primary))" },
    { name: "fc", value: Math.round(fc), fill: "#8b5cf6" },
    { name: "lm/ft²", value: Math.round(lmFt2), fill: "#f59e0b" },
    { name: "Nox", value: Math.round(nox / 10), fill: "#10b981" },
  ];
  return { value, unit, lux, fc, lmM2, lmFt2, phot, nox, breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "500", unit: "lux" };

export default function IlluminanceConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<IlluminanceResult | null>(null);

  const v = parseFloat(value) || 0;
  const errs: string[] = [];
  if (v < 0) errs.push("Illuminance cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcIllum(v, unit)); };
  const reset = () => {
    setValue(DEFAULTS.value); setUnit(DEFAULTS.unit);
    setResult(calcIllum(500, "lux"));
  };
  useEffect(() => { setResult(calcIllum(500, "lux")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is illuminance?", answer: "Illuminance measures how much light lands on a surface — lumens per unit area. One lux is one lumen per square meter; one foot-candle is one lumen per square foot." },
    { question: "What are typical values?", answer: "Full daylight is about 10,000–25,000 lux, office lighting 300–500 lux, and moonlight under 1 lux. Lighting standards usually specify lux targets for workspaces." },
    { question: "How do I convert foot-candles to lux?", answer: "Multiply by 10.76391 (one square foot is that many square meters). Design values in the US are often given in foot-candles, while the rest of the world uses lux." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Illuminance Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Illuminance Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Illuminance Value</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={sel}>
                  <option value="lux">Lux (lx)</option>
                  <option value="fc">Foot-Candles (fc)</option>
                  <option value="lmM2">Lumens per m²</option>
                  <option value="phot">Phot (ph)</option>
                  <option value="nox">Nox (nx)</option>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Lux</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.lux.toLocaleString("en-US", { maximumFractionDigits: 2 })} lx</div>
                <div className="text-sm text-muted-foreground mt-1">{result.fc.toFixed(2)} foot-candles · {result.lmM2.toFixed(2)} lm/m²</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Foot-Candles`, `${result.fc.toFixed(2)} fc`], ["Lumens/ft²", `${result.lmFt2.toFixed(2)}`], ["Phot", `${result.phot.toFixed(4)} ph`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Unit Conversions</h3>
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
                <h3 className="text-base font-bold mb-4">Equivalent Illuminance</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Nox scaled by 1/10 for display</p>
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
            <h2 className="text-2xl font-bold mb-3">Illuminance Units</h2>
            <p>This <strong>illuminance converter</strong> converts between lux (lumens per square meter), foot-candles (lumens per square foot), and the derived units phot and nox. The relationship is exact: 1 fc = 10.76391 lx, since one square foot equals 0.092903 m².</p>
            <h2 className="text-2xl font-bold mb-3">Lighting Standards</h2>
            <p>Workplace standards specify illuminance targets — typically 300–500 lux for offices, 750 lux for fine detail work, and 50–100 lux for corridors. Converting spec sheets between US foot-candles and international lux is a daily task for lighting designers.</p>
            <h2 className="text-2xl font-bold mb-3">Lux vs Lumens</h2>
            <p>Lumens measure the total light a source emits; lux measures how concentrated that light is on a surface. The same 1,000-lumen bulb delivers far fewer lux at 4 meters than at 1 meter — which is why distance always matters in lighting math.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/illuminance-converter" />
          <PopularCalculators exclude="/calculator/illuminance-converter" />
        </div>
      </div>
    </>
  );
}
