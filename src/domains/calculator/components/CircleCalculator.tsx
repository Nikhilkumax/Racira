"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type CircleMode = "radius" | "diameter" | "circumference" | "area";

interface CircleResult {
  radius: number;
  diameter: number;
  circumference: number;
  area: number;
  knownLabel: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const UNIT_SUFFIX: Record<string, string> = { in: "in", ft: "ft", cm: "cm", m: "m", mm: "mm", yd: "yd" };
const UNIT_AREA: Record<string, string> = { in: "in²", ft: "ft²", cm: "cm²", m: "m²", mm: "mm²", yd: "yd²" };

function calcCircle(mode: CircleMode, value: number, dp: number): CircleResult | null {
  if (!isFinite(value) || value <= 0) return null;
  let radius: number;
  switch (mode) {
    case "radius": radius = value; break;
    case "diameter": radius = value / 2; break;
    case "circumference": radius = value / (2 * Math.PI); break;
    case "area": radius = Math.sqrt(value / Math.PI); break;
    default: return null;
  }
  const diameter = radius * 2;
  const circumference = 2 * Math.PI * radius;
  const area = Math.PI * radius * radius;
  const r = (n: number) => parseFloat(n.toFixed(dp));
  const knownLabel = { radius: "Radius", diameter: "Diameter", circumference: "Circumference", area: "Area" }[mode];

  const breakdown = [
    { label: `Known Input — ${knownLabel}`, value: `${r(value)}` },
    { label: "Radius (r)", value: `${r(radius)}` },
    { label: "Diameter (d = 2r)", value: `${r(diameter)}` },
    { label: "Circumference (C = 2πr)", value: `${r(circumference)}` },
    { label: "Area (A = πr²)", value: `${r(area)}` },
  ];
  const summaryStats = [
    { label: "Radius", value: `${r(radius)}` },
    { label: "Diameter", value: `${r(diameter)}` },
    { label: "Circumference", value: `${r(circumference)}` },
    { label: "Area", value: `${r(area)}` },
    { label: "Input Mode", value: knownLabel },
    { label: "Precision", value: `${dp} dp` },
    { label: "π Used", value: "3.14159265..." },
    { label: "Formulas", value: "d=2r, C=2πr, A=πr²" },
  ];
  const chartData = [
    { name: "Radius", value: r(radius), fill: "hsl(var(--primary))" },
    { name: "Diameter", value: r(diameter), fill: "#8b5cf6" },
    { name: "Circumference", value: r(circumference), fill: "#10b981" },
    { name: "Area", value: r(area), fill: "#f59e0b" },
  ];
  return { radius: r(radius), diameter: r(diameter), circumference: r(circumference), area: r(area), knownLabel, breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "10", mode: "radius", unit: "in", decimals: "4" };

const MODE_LABELS: Record<string, string> = { radius: "Radius", diameter: "Diameter", circumference: "Circumference", area: "Area" };

export default function CircleCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [mode, setMode] = useState<CircleMode>("radius");
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [decimals, setDecimals] = useState(DEFAULTS.decimals);
  const [result, setResult] = useState<CircleResult | null>(null);

  const v = parseFloat(value);
  const dp = Math.max(0, Math.min(10, parseInt(decimals) || 4));
  const errs: string[] = [];
  if (!isFinite(v) || v <= 0) errs.push("Value must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcCircle(mode, v, dp)); };
  const reset = () => {
    setValue(DEFAULTS.value); setMode("radius"); setUnit(DEFAULTS.unit); setDecimals(DEFAULTS.decimals);
    setResult(calcCircle("radius", 10, 4));
  };
  useEffect(() => { setResult(calcCircle("radius", 10, 4)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do you find the area of a circle?", answer: "Area = π × r², where r is the radius. If you know the diameter d, use A = π × (d/2)². If you know the circumference C, use A = C² / (4π)." },
    { question: "What is the difference between radius and diameter?", answer: "The radius is the distance from the center of the circle to any point on its edge. The diameter is twice the radius — the distance across the circle through its center. Diameter = 2 × radius." },
    { question: "What is the circumference of a circle?", answer: "The circumference is the distance around the circle, equal to 2πr or πd. For a circle of radius 10, the circumference is 2 × π × 10 ≈ 62.83 units." },
    { question: "What is the value of pi (π)?", answer: "Pi is the ratio of a circle's circumference to its diameter, approximately 3.14159. It is an irrational number — its decimal expansion never ends and never repeats. This calculator uses the full double-precision value of π." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Circle Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Circle Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Known Value</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">{UNIT_SUFFIX[unit]}</span></div>
              </div>
              <div>
                <label className={lbl}>Input Mode</label>
                <select value={mode} onChange={e => setMode(e.target.value as CircleMode)} className={sel}>
                  {Object.entries(MODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Units</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={sel}>
                  {Object.keys(UNIT_SUFFIX).map(u => <option key={u} value={u}>{u === "in" ? "Inches" : u === "ft" ? "Feet" : u === "cm" ? "Centimeters" : u === "m" ? "Meters" : u === "mm" ? "Millimeters" : "Yards"}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Decimal Places</label>
                <div className={inp}><input type="number" min="0" max="10" value={decimals} onChange={e => setDecimals(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Area</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.area} <span className="text-2xl text-muted-foreground">{UNIT_AREA[unit]}</span></div>
                <div className="text-sm text-muted-foreground mt-1">A = πr² with radius {result.radius} {UNIT_SUFFIX[unit]}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Radius", `${result.radius} ${UNIT_SUFFIX[unit]}`], ["Diameter", `${result.diameter} ${UNIT_SUFFIX[unit]}`], ["Circumference", `${result.circumference} ${UNIT_SUFFIX[unit]}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Circle Properties</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 0 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 0 ? "text-amber-700" : ""}`}>{r.value} {i === 4 ? UNIT_AREA[unit] : i > 0 ? UNIT_SUFFIX[unit] : ""}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Dimension Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(dp)} ${v === result.area ? UNIT_AREA[unit] : UNIT_SUFFIX[unit]}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">Circle Formulas</h2>
            <p>Every circle is defined by its radius r. From it, all other properties follow exactly: diameter d = 2r, circumference C = 2πr, and area A = πr². This <strong>circle calculator</strong> accepts any one known value — radius, diameter, circumference, or area — and derives the rest using exact formulas with no approximations.</p>
            <h2 className="text-2xl font-bold mb-3">Working Backward from Any Input</h2>
            <p>Given the diameter, radius = d/2. Given the circumference, radius = C/(2π). Given the area, radius = √(A/π). The calculator applies the correct inverse formula automatically based on your chosen input mode, so you never need to rearrange equations by hand.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Circle calculations appear everywhere: sizing round tables and rugs, laying out garden beds and ponds, computing pizza areas for value comparisons, designing gears and pulleys, and calculating the cross-section of pipes and cables. Choose your unit — inches, feet, centimeters, meters, millimeters, or yards — and the results follow in matching units.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/circle-calculator" />
          <PopularCalculators exclude="/calculator/circle-calculator" />
        </div>
      </div>
    </>
  );
}
