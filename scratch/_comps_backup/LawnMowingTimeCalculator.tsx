"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface MowInputs {
  area: number;      // sq ft
  mowerWidth: number; // in
  speed: number;     // mph
  efficiency: number; // % effective cutting (overlap, turns)
  trimTime: number;  // min
}

interface MowResults {
  effectiveWidthFt: number;
  speedFtPerHr: number;
  areaPerHour: number;
  cutMinutes: number;
  totalMinutes: number;
  chartData: { name: string; minutes: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const FT_PER_MILE = 5280;

function calcMow(i: MowInputs): MowResults {
  const effectiveWidthFt = (i.mowerWidth / 12) * (i.efficiency / 100);
  const speedFtPerHr = i.speed * FT_PER_MILE;
  const areaPerHour = effectiveWidthFt * speedFtPerHr;
  const cutMinutes = areaPerHour > 0 ? (i.area / areaPerHour) * 60 : 0;
  const totalMinutes = cutMinutes + i.trimTime;

  const chartData = [
    { name: "Cutting", minutes: +cutMinutes.toFixed(1) },
    { name: "Trim & Edge", minutes: +i.trimTime.toFixed(1) },
  ];

  const breakdown = [
    { label: "Lawn Area", value: `${i.area.toLocaleString()} sq ft` },
    { label: `Mower Width (${i.mowerWidth} in)`, value: `${(i.mowerWidth / 12).toFixed(2)} ft` },
    { label: `Mowing Speed (${i.speed} mph)`, value: `${speedFtPerHr.toLocaleString()} ft/hr` },
    { label: `Effective Width (${i.efficiency}%)`, value: `${effectiveWidthFt.toFixed(2)} ft` },
    { label: "Area per Hour", value: `${areaPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft` },
    { label: "Cutting Time", value: `${cutMinutes.toFixed(1)} min` },
    { label: "Trim & Edge Time", value: `${i.trimTime} min` },
    { label: "Total Mowing Time", value: `${totalMinutes.toFixed(1)} min`, highlight: true, isTotal: true },
  ];

  const summaryStats = [
    { label: "Total Mowing Time", value: `${totalMinutes.toFixed(1)} min` },
    { label: "Cutting Time", value: `${cutMinutes.toFixed(1)} min` },
    { label: "Trim & Edge", value: `${i.trimTime} min` },
    { label: "Area per Hour", value: `${areaPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft` },
    { label: "Lawn Area", value: `${i.area.toLocaleString()} sq ft` },
    { label: "Mower Width", value: `${i.mowerWidth} in` },
    { label: "Mowing Speed", value: `${i.speed} mph` },
    { label: "Efficiency", value: `${i.efficiency}%` },
  ];

  return { effectiveWidthFt, speedFtPerHr, areaPerHour, cutMinutes, totalMinutes, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  area: "5000",
  mowerWidth: "21",
  speed: "3",
  efficiency: "75",
  trimTime: "10",
};

// 4. Component
export default function LawnMowingTimeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<MowResults>(() => calcMow({ area: 5000, mowerWidth: 21, speed: 3, efficiency: 75, trimTime: 10 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcMow({ area: 5000, mowerWidth: 21, speed: 3, efficiency: 75, trimTime: 10 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcMow({
        area: parseFloat(inputs.area) || 0,
        mowerWidth: parseFloat(inputs.mowerWidth) || 0,
        speed: parseFloat(inputs.speed) || 0,
        efficiency: parseFloat(inputs.efficiency) || 0,
        trimTime: parseFloat(inputs.trimTime) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcMow({ area: 5000, mowerWidth: 21, speed: 3, efficiency: 75, trimTime: 10 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const area = parseFloat(inputs.area) || 0;
  const mowerWidth = parseFloat(inputs.mowerWidth) || 0;
  const speed = parseFloat(inputs.speed) || 0;
  const efficiency = parseFloat(inputs.efficiency) || 0;
  if (area <= 0) errors.area = "Must be greater than 0";
  if (mowerWidth < 14 || mowerWidth > 72) errors.mowerWidth = "Must be 14–72 in";
  if (speed < 0.5 || speed > 8) errors.speed = "Must be 0.5–8 mph";
  if (efficiency < 30 || efficiency > 100) errors.efficiency = "Must be 30–100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How long does it take to mow a 5,000 sq ft lawn?", answer: "With a 21-inch walk-behind mower at 3 mph and 75% efficiency, a 5,000 sq ft lawn takes about 11 minutes of cutting plus 10 minutes of trimming — roughly 21 minutes total. A 42-inch riding mower covers the same ground in about half the cutting time." },
    { question: "Why isn't mowing speed simply width × speed?", answer: "Real mowing isn't perfect coverage: you overlap passes, slow at corners and obstacles, and pivot at the ends of rows. A 75% efficiency factor accounts for that — the effective swath is narrower than the blade. Obstacle-heavy yards with trees and beds can drop efficiency to 60% or below." },
    { question: "What mowing speed is realistic?", answer: "A comfortable walking pace while pushing a mower is 2.5–3.5 mph; self-propelled walk-behinds run 3–4 mph; riding mowers cover 4–6 mph in open areas. Going faster than comfortable creates ragged cuts and skipped grass, so the calculator's 3 mph default is a good planning figure for walk-behinds." },
    { question: "How much time does trimming add?", answer: "Trimming and edging typically add 10–20 minutes to a suburban lawn, and often a third of the total chore — edges, beds, and around trees all need the string trimmer. String trimming is manual and slow, so keeping edges tight against a hard border or adding mowing strips can cut that time substantially." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Lawn Mowing Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lawn Mowing Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="area" className={lbl}>Lawn Area</label>
                <div className={inp}>
                  <input id="area" type="number" min="1" step="100" value={inputs.area} onChange={(e) => set("area")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.area && <p className="text-xs text-red-500 font-medium mt-1">{errors.area}</p>}
              </div>
              <div>
                <label htmlFor="mowerWidth" className={lbl}>Mower Width</label>
                <div className={inp}>
                  <input id="mowerWidth" type="number" min="14" max="72" step="1" value={inputs.mowerWidth} onChange={(e) => set("mowerWidth")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.mowerWidth && <p className="text-xs text-red-500 font-medium mt-1">{errors.mowerWidth}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="speed" className={lbl}>Mowing Speed</label>
                <div className={inp}>
                  <input id="speed" type="number" min="0.5" max="8" step="0.5" value={inputs.speed} onChange={(e) => set("speed")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">mph</span>
                </div>
                {errors.speed && <p className="text-xs text-red-500 font-medium mt-1">{errors.speed}</p>}
              </div>
              <div>
                <label htmlFor="efficiency" className={lbl}>Cutting Efficiency</label>
                <div className={inp}>
                  <input id="efficiency" type="number" min="30" max="100" step="5" value={inputs.efficiency} onChange={(e) => set("efficiency")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.efficiency && <p className="text-xs text-red-500 font-medium mt-1">{errors.efficiency}</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Trim & Prep</div>
                    <div>
                      <label htmlFor="trimTime" className={lbl}>Trim & Edge Time</label>
                      <div className={inp}>
                        <input id="trimTime" type="number" min="0" max="60" step="5" value={inputs.trimTime} onChange={(e) => set("trimTime")(e.target.value)} className={ci} />
                        <span className="pr-3 text-muted-foreground text-sm">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Mowing Time</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.totalMinutes.toFixed(1)} <span className="text-xl text-muted-foreground">min</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.cutMinutes.toFixed(1)} min cutting + {inputs.trimTime} min trim · {result.areaPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft/hr
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Cutting Time", `${result.cutMinutes.toFixed(1)} min`],
                ["Trim & Edge", `${parseFloat(inputs.trimTime).toFixed(1)} min`],
                ["Area per Hour", `${result.areaPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Time Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Cutting vs Trimming</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} min`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Trimming is a fixed cost per week — on small lawns it can rival the cutting time itself.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Mowing Is a Throughput Problem</h2>
            <p>Mowing time = lawn area ÷ (effective swath × speed). A 21-inch mower at 3 mph covers about 27,700 sq ft per hour at 100% efficiency — but nobody mows at 100%. Overlap, turns, and obstacles drop the effective swath to roughly 75%, which is why the same lawn takes 11 minutes of cutting in the calculator, not 8.</p>
            <h2 className="text-2xl font-bold mb-3">Width Is the Big Lever</h2>
            <p>Doubling mower width roughly halves cutting time: a 42-inch riding mower covers a 5,000 sq ft lawn in about 5 minutes of cutting versus 11 for a 21-inch walk-behind. Speed matters too — a 4 mph self-propelled mower beats 3 mph walking — but width compounds every pass, making it the most impactful number on the screen.</p>
            <h2 className="text-2xl font-bold mb-3">The Hidden Half-Hour</h2>
            <p>Trimming, edging, and cleanup routinely add 10–20 minutes and can equal a third of the whole chore. That time is almost independent of lawn size — it's driven by how many edges and beds you have. Mowing strips, hard borders, and a tight trimmer routine are how you attack the half of the job that isn't cutting.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lawn-mowing-time-calculator" />
          <PopularCalculators exclude="/calculator/lawn-mowing-time-calculator" />
        </div>
      </div>
    </>
  );
}
