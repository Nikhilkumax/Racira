"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CookResult {
  weight: number;
  meat: string;
  minutesPerLb: number;
  totalMinutes: number;
  restMinutes: number;
  targetTempC: number;
  chartData: { name: string; minutes: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const MEATS: Record<string, { label: string; minPerLb: number; targetF: number; rest: number }> = {
  turkey: { label: "Whole Turkey (unstuffed)", minPerLb: 13, targetF: 165, rest: 30 },
  chicken: { label: "Whole Chicken", minPerLb: 20, targetF: 165, rest: 10 },
  beef: { label: "Beef Roast (medium)", minPerLb: 15, targetF: 145, rest: 15 },
  pork: { label: "Pork Roast", minPerLb: 25, targetF: 145, rest: 15 },
  ham: { label: "Ham (pre-cooked)", minPerLb: 15, targetF: 140, rest: 10 },
  lamb: { label: "Lamb Roast (medium)", minPerLb: 20, targetF: 145, rest: 15 },
};

function calcCookTime(weight: number, meat: string): CookResult {
  const m = MEATS[meat] || MEATS.chicken;
  const totalMinutes = Math.round(weight * m.minPerLb);

  const chartData = [
    { name: "Cook Time", minutes: totalMinutes },
    { name: "Rest Time", minutes: m.rest },
    { name: "Total", minutes: totalMinutes + m.rest },
  ];

  const breakdown = [
    { label: "Weight", value: `${weight.toFixed(1)} lb` },
    { label: "Cut", value: m.label },
    { label: "Rate", value: `${m.minPerLb} min/lb` },
    { label: "Cook Time", value: `${totalMinutes} min (${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m)` },
    { label: "Rest Time", value: `${m.rest} min` },
    { label: "Target Temp", value: `${m.targetF}°F (${Math.round((m.targetF - 32) * 5 / 9)}°C)` },
    { label: "Total Time", value: `${totalMinutes + m.rest} min` },
    { label: "Doneness", value: meat === "beef" || meat === "lamb" ? "Medium (145°F)" : "Fully cooked" },
  ];

  const summaryStats = [
    { label: "Cook Time", value: `${totalMinutes} min` },
    { label: "Rest Time", value: `${m.rest} min` },
    { label: "Total Time", value: `${totalMinutes + m.rest} min` },
    { label: "Min per Lb", value: `${m.minPerLb}` },
    { label: "Target Temp", value: `${m.targetF}°F` },
    { label: "Oven", value: "325°F (163°C)" },
  ];

  return { weight, meat, minutesPerLb: m.minPerLb, totalMinutes, restMinutes: m.rest, targetTempC: m.targetF, chartData, breakdown, summaryStats };
}

const DEFAULTS = { weight: "12", meat: "turkey" };

export default function CookingTimeCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [meat, setMeat] = useState(DEFAULTS.meat);
  const [result, setResult] = useState<CookResult>(() => calcCookTime(12, "turkey"));

  useEffect(() => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0 && w <= 100) setResult(calcCookTime(w, meat));
  }, [weight, meat]);

  const reset = () => { setWeight(DEFAULTS.weight); setMeat(DEFAULTS.meat); };
  const invalid = isNaN(parseFloat(weight)) || parseFloat(weight) <= 0 || parseFloat(weight) > 100;

  const faqs = [
    { question: "How long do I cook a turkey per pound?", answer: "An unstuffed turkey takes about 13 minutes per pound at 325°F — a 12 lb bird takes roughly 2.5–3 hours. Always verify with a meat thermometer; the thigh should reach 165°F." },
    { question: "Do I need to rest meat after cooking?", answer: "Yes. Resting lets juices redistribute so the meat stays moist. Rest roasts 10–30 minutes (larger cuts longer) before carving; the temperature keeps rising 5–10°F during rest." },
    { question: "What is the safe internal temperature?", answer: "Poultry: 165°F (74°C). Beef, pork, and lamb roasts: 145°F (63°C) with a rest period. Ground meats: 160°F (71°C). Use a probe thermometer for accuracy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cooking Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cooking Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wgt" className="block text-sm font-medium mb-1 text-foreground">Weight (lb)</label>
                <input id="wgt" type="number" min="0.5" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="meat" className="block text-sm font-medium mb-1 text-foreground">Cut</label>
                <select id="meat" value={meat} onChange={(e) => setMeat(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {Object.entries(MEATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Assumes a 325°F (163°C) oven. Times are estimates — always check with a meat thermometer.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Timer className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a weight between 0.5 and 100 lb.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Cook Time</div>
              <div className="text-4xl font-extrabold text-primary">{result.totalMinutes} min</div>
              <div className="text-sm text-muted-foreground mt-1">{Math.floor(result.totalMinutes / 60)}h {result.totalMinutes % 60}m at 325°F · rest {result.restMinutes} min</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cook Time</div>
                <div className="text-lg font-bold text-primary">{result.totalMinutes} min</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Rest Time</div>
                <div className="text-lg font-bold text-primary">{result.restMinutes} min</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Target Temp</div>
                <div className="text-lg font-bold text-primary">{result.targetTempC}°F</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
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
              <h3 className="text-base font-bold mb-3">Cook, Rest &amp; Total Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" min" />
                  <Tooltip formatter={(v: number) => [`${v} min`, "Time"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
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
            <h2 className="text-2xl font-bold mb-3">About the Cooking Time Calculator</h2>
            <p>Roasting times scale with weight, but different cuts cook at different rates. Whole poultry takes about 13–20 minutes per pound, roasts 15–25 minutes per pound, all at 325°F. This calculator applies those standards and adds the mandatory rest period.</p>
            <h3>Why Resting Matters</h3>
            <p>Carving immediately lets juices run out and dries the meat. Resting 10–30 minutes lets the fibers reabsorb moisture — the internal temperature also rises 5–10°F during rest, so pull the roast slightly before your target.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cooking-time-calculator" />
          <PopularCalculators exclude="/calculator/cooking-time-calculator" />
        </div>
      </div>
    </>
  );
}
