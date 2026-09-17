"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Brackets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RoundResult {
  original: number;
  floored: number;
  ceiled: number;
  rounded: number;
  floorDiff: number;
  ceilDiff: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRound(input: number, decimals: number): RoundResult {
  const factor = Math.pow(10, Math.max(0, decimals));
  const floored = Math.floor(input * factor) / factor;
  const ceiled = Math.ceil(input * factor) / factor;
  const rounded = Math.round(input * factor) / factor;

  const chartData = [
    { name: "Floor", value: floored },
    { name: "Rounded", value: rounded },
    { name: "Original", value: input },
    { name: "Ceiling", value: ceiled },
  ];

  const breakdown = [
    { label: "Original Number", value: `${input}` },
    { label: "Floor (round down)", value: `${floored}` },
    { label: "Ceiling (round up)", value: `${ceiled}` },
    { label: "Nearest (half up)", value: `${rounded}` },
    { label: "Decimal Places", value: `${decimals}` },
    { label: "Floor Difference", value: `${(input - floored).toFixed(Math.max(decimals, 4))}` },
    { label: "Ceiling Difference", value: `${(ceiled - input).toFixed(Math.max(decimals, 4))}` },
    { label: "Rounding Error", value: `${(rounded - input).toExponential(4)}` },
  ];

  const summaryStats = [
    { label: "Floor", value: `${floored}` },
    { label: "Ceiling", value: `${ceiled}` },
    { label: "Nearest", value: `${rounded}` },
    { label: "Decimal Places", value: `${decimals}` },
    { label: "Width (ceil−floor)", value: `${(ceiled - floored).toFixed(Math.max(decimals, 4))}` },
    { label: "Error (nearest)", value: `${(rounded - input).toExponential(3)}` },
  ];

  return { original: input, floored, ceiled, rounded, floorDiff: input - floored, ceilDiff: ceiled - input, chartData, breakdown, summaryStats };
}

const DEFAULTS = { number: "12.345", decimals: "2" };

export default function CeilingFloorCalculator() {
  const [number, setNumber] = useState(DEFAULTS.number);
  const [decimals, setDecimals] = useState(DEFAULTS.decimals);
  const [result, setResult] = useState<RoundResult>(() => calcRound(12.345, 2));

  useEffect(() => {
    const n = parseFloat(number);
    const d = parseInt(decimals, 10);
    if (!isNaN(n) && !isNaN(d) && d >= 0 && d <= 12) setResult(calcRound(n, d));
  }, []);

  const reset = () => { setNumber(DEFAULTS.number); setDecimals(DEFAULTS.decimals); setResult(calcRound(parseFloat(DEFAULTS.number), parseFloat(DEFAULTS.decimals))); };
  const invalid = isNaN(parseFloat(number)) || isNaN(parseInt(decimals, 10)) || parseInt(decimals, 10) < 0 || parseInt(decimals, 10) > 12;

  const faqs = [
    { question: "What is the difference between floor and ceiling?", answer: "Floor always rounds down to the nearest value (e.g., 3.7 → 3), while ceiling always rounds up (3.2 → 4). Rounding to the nearest integer picks whichever is closer, with .5 rounding up." },
    { question: "Where is rounding used in real life?", answer: "Ceilings are used for inventory and payment calculations where you must not underestimate (e.g., materials needed), floors for conservative estimates, and nearest-rounding for currency, pricing, and statistics." },
    { question: "Why do programming languages round .5 differently?", answer: "Many languages implement banker's rounding (round half to even) to reduce bias in statistics. This calculator uses standard round-half-up for clarity." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ceiling & Floor Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ceiling &amp; Floor Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rnum" className="block text-sm font-medium mb-1 text-foreground">Number</label>
                <input id="rnum" type="number" step="any" value={number} onChange={(e) => setNumber(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dec" className="block text-sm font-medium mb-1 text-foreground">Decimal Places</label>
                <input id="dec" type="number" min="0" max="12" value={decimals} onChange={(e) => setDecimals(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Rounds to the nearest, floor, and ceiling at the chosen precision.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Brackets className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid number and 0–12 decimal places.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Rounded to Nearest</div>
              <div className="text-4xl font-extrabold text-primary">{result.rounded}</div>
              <div className="text-sm text-muted-foreground mt-1">Floor: {result.floored} · Ceiling: {result.ceiled}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Floor</div>
                <div className="text-lg font-bold text-primary">{result.floored}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Ceiling</div>
                <div className="text-lg font-bold text-primary">{result.ceiled}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Nearest</div>
                <div className="text-lg font-bold text-primary">{result.rounded}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Operation</th>
                    <th className="p-2.5 pr-3 text-right">Result</th>
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
              <h3 className="text-base font-bold mb-3">Floor vs Original vs Ceiling</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}`, "Value"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {result.chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.name === "Original" ? "hsl(var(--primary))" : "hsl(var(--primary)/0.45)"} />
                    ))}
                  </Bar>
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
            <h2 className="text-2xl font-bold mb-3">About the Ceiling &amp; Floor Calculator</h2>
            <p>Ceiling and floor functions round a number to a chosen precision in opposite directions: floor always rounds down, ceiling always rounds up, and nearest-rounding picks the closer value (with .5 rounding up). This is the math behind everything from pricing and inventory to statistical estimates.</p>
            <h3>When to Use Each</h3>
            <p>Use ceiling when you must not under-estimate (materials, safety margins, capacity planning) and floor for conservative budgets. Nearest rounding is standard for currency and everyday arithmetic.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ceiling-floor-calculator" />
          <PopularCalculators exclude="/calculator/ceiling-floor-calculator" />
        </div>
      </div>
    </>
  );
}
