"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface MicrowaveInputs {
  originalWatts: string;
  targetWatts: string;
  minutes: string;
  seconds: string;
  container: string; // "glass" | "plastic" | "ceramic" | "paper"
}

interface MicrowaveResults {
  adjustedSeconds: number;
  adjustedMinutes: number;
  adjustedLabel: string;
  ratio: number;
  originalSeconds: number;
  originalLabel: string;
  savingsSeconds: number;
  chartData: { name: string; seconds: number; highlighted: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const CONTAINER_PENALTY: Record<string, number> = { glass: 1, plastic: 1, ceramic: 1, paper: 1 };

function fmtClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  if (s === 60) return `${m + 1}:00`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcMicrowave(i: MicrowaveInputs): MicrowaveResults | null {
  const ow = parseFloat(i.originalWatts);
  const tw = parseFloat(i.targetWatts);
  const min = parseInt(i.minutes, 10);
  const sec = parseInt(i.seconds, 10);
  if (!ow || !tw || isNaN(min) || isNaN(sec) || ow <= 0 || tw <= 0 || min < 0 || sec < 0) return null;

  const originalSeconds = min * 60 + sec;
  const penalty = CONTAINER_PENALTY[i.container] ?? 1;
  // Wattage scaling: lower wattage needs proportionally more time
  const adjustedSeconds = Math.max(1, Math.round((originalSeconds * (ow / tw)) * penalty));

  const chartData = [
    { name: "Original", seconds: originalSeconds, highlighted: false },
    { name: "Adjusted", seconds: adjustedSeconds, highlighted: true },
  ];

  const breakdown = [
    { label: "Original Wattage", value: `${ow} W` },
    { label: "Target Wattage", value: `${tw} W` },
    { label: "Power Ratio", value: `${(ow / tw).toFixed(2)}×` },
    { label: "Original Cook Time", value: fmtClock(originalSeconds) },
    { label: "Adjusted Cook Time", value: fmtClock(adjustedSeconds), highlight: true, isTotal: true },
    { label: "Container Type", value: i.container === "glass" ? "Glass" : i.container === "plastic" ? "Plastic" : i.container === "ceramic" ? "Ceramic" : "Paper" },
  ];

  const summaryStats = [
    { label: "Adjusted Cook Time", value: fmtClock(adjustedSeconds) },
    { label: "Original Cook Time", value: fmtClock(originalSeconds) },
    { label: "Power Ratio", value: `${(ow / tw).toFixed(2)}×` },
    { label: "Time Saved / Added", value: `${adjustedSeconds >= originalSeconds ? "+" : "−"}${fmtClock(Math.abs(adjustedSeconds - originalSeconds))}` },
    { label: "Original Wattage", value: `${ow} W` },
    { label: "Target Wattage", value: `${tw} W` },
    { label: "Container Type", value: i.container === "glass" ? "Glass" : i.container === "plastic" ? "Plastic" : i.container === "ceramic" ? "Ceramic" : "Paper" },
    { label: "Rule of Thumb", value: `${(ow / tw).toFixed(2)}× the original time` },
  ];

  return {
    adjustedSeconds,
    adjustedMinutes: adjustedSeconds / 60,
    adjustedLabel: fmtClock(adjustedSeconds),
    ratio: ow / tw,
    originalSeconds,
    originalLabel: fmtClock(originalSeconds),
    savingsSeconds: adjustedSeconds - originalSeconds,
    chartData,
    breakdown,
    summaryStats,
  };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  originalWatts: "700",
  targetWatts: "1100",
  minutes: "5",
  seconds: "0",
  container: "glass",
};

// 4. Component
export default function MicrowaveWattageConversionCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<MicrowaveResults | null>(() => calcMicrowave(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcMicrowave(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcMicrowave(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcMicrowave(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const ow = parseFloat(inputs.originalWatts);
  const tw = parseFloat(inputs.targetWatts);
  const min = parseInt(inputs.minutes, 10);
  const sec = parseInt(inputs.seconds, 10);
  if (!ow || ow < 100 || ow > 2000) errors.originalWatts = "Must be 100–2000 W";
  if (!tw || tw < 100 || tw > 2000) errors.targetWatts = "Must be 100–2000 W";
  if (isNaN(min) || min < 0 || min > 120) errors.minutes = "0–120 min";
  if (isNaN(sec) || sec < 0 || sec > 59) errors.seconds = "0–59 sec";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I convert microwave cook time between wattages?", answer: "Microwave cooking power scales almost linearly with wattage: a 700 W microwave needs roughly 1100/700 ≈ 1.57× the time of an 1100 W microwave for the same result. Multiply the original time by the ratio of the old wattage over the new wattage: adjusted = original × (original watts ÷ target watts)." },
    { question: "Why does my 1100 W microwave still sometimes need more time?", answer: "Wattage is only one factor. The size and shape of the dish, the amount of food, whether it is covered, and the container material all change heat distribution. Start with the converted time, then check and add 15–30 second bursts until the food is done — microwave ovens also drift below their rated wattage as they age." },
    { question: "What is the most accurate way to check my microwave's actual wattage?", answer: "The rated wattage is printed on the back label, but real output drifts. The classic water test: heat 1 cup (240 ml) of room-temperature water for 2 minutes. If it boils, you have roughly 1000+ W; if it is steaming but not boiling, ~700–800 W; if it only gets hot, ~500–600 W. Use that measured value in the calculator for the most accurate conversions." },
    { question: "Do frozen or refrigerated foods convert the same way?", answer: "No. The wattage ratio holds for the cooking portion, but defrosting and chilled-food heating involve phase changes (melting ice) that absorb energy at a different rate. For frozen meals, follow the package's own wattage-adjusted times rather than converting a fresh-cook time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Microwave Wattage Conversion" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Microwave Wattage Conversion Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="originalWatts" className={lbl}>Original Wattage</label>
                <div className={inp}>
                  <input id="originalWatts" type="number" min="100" max="2000" step="50" value={inputs.originalWatts} onChange={(e) => set("originalWatts")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">W</span>
                </div>
                {errors.originalWatts && <p className="text-xs text-red-500 font-medium mt-1">{errors.originalWatts}</p>}
              </div>
              <div>
                <label htmlFor="targetWatts" className={lbl}>Target Wattage</label>
                <div className={inp}>
                  <input id="targetWatts" type="number" min="100" max="2000" step="50" value={inputs.targetWatts} onChange={(e) => set("targetWatts")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">W</span>
                </div>
                {errors.targetWatts && <p className="text-xs text-red-500 font-medium mt-1">{errors.targetWatts}</p>}
              </div>
              <div>
                <label htmlFor="minutes" className={lbl}>Cook Time (min)</label>
                <div className={inp}>
                  <input id="minutes" type="number" min="0" max="120" step="1" value={inputs.minutes} onChange={(e) => set("minutes")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.minutes && <p className="text-xs text-red-500 font-medium mt-1">{errors.minutes}</p>}
              </div>
              <div>
                <label htmlFor="seconds" className={lbl}>Cook Time (sec)</label>
                <div className={inp}>
                  <input id="seconds" type="number" min="0" max="59" step="1" value={inputs.seconds} onChange={(e) => set("seconds")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sec</span>
                </div>
                {errors.seconds && <p className="text-xs text-red-500 font-medium mt-1">{errors.seconds}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Container</div>
                    <label htmlFor="container" className={lbl}>Container Type</label>
                    <select id="container" value={inputs.container} onChange={(e) => set("container")(e.target.value)} className={sel}>
                      <option value="glass">Glass</option>
                      <option value="plastic">Plastic (microwave-safe)</option>
                      <option value="ceramic">Ceramic</option>
                      <option value="paper">Paper</option>
                    </select>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Adjusted Cook Time</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? result.adjustedLabel : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `Original ${result.originalLabel} at ${ow} W → ${tw} W (${result.ratio.toFixed(2)}× ratio)` : "Enter valid inputs to convert."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Power Ratio", result ? `${result.ratio.toFixed(2)}×` : "—"],
                ["Original Time", result ? result.originalLabel : "—"],
                ["Time Change", result ? (result.savingsSeconds < 0 ? `−${fmtClock(-result.savingsSeconds)} saved` : `+${fmtClock(result.savingsSeconds)} added`) : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Conversion Detail</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result?.breakdown.map((r, i) => (
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
              <h3 className="text-base font-bold mb-4">Cook Time Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result?.chartData ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} tickFormatter={(v: number) => `${v}s`} />
                  <Tooltip formatter={(v: number) => fmtClock(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
                    {(result?.chartData ?? []).map((d, idx) => (
                      <Cell key={idx} fill={d.highlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Lower-wattage microwaves need proportionally more time: adjusted = original × (original watts ÷ target watts).</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result?.summaryStats.map((s, i) => (
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
            <h2 className="text-2xl font-bold mb-3">Wattage Is the Dial, Not the Recipe</h2>
            <p>Packaged food instructions assume a specific microwave wattage — usually 700–800 W in older kitchens, 1000+ W in newer ones. Cooking power scales almost linearly with wattage, so the same food needs less time in a more powerful oven. The conversion is a simple ratio: adjusted time = original time × (original watts ÷ target watts). A 3-minute instruction at 700 W becomes about 1:55 at 1100 W.</p>
            <h2 className="text-2xl font-bold mb-3">Why Real Results Still Vary</h2>
            <p>Rated wattage is measured at the magnetron, and the food only sees a fraction of it. Dish shape, food density, starting temperature, and even the number of items in the oven all shift the outcome. Use the converted time as a starting point, then check early — you can always add 15–30 second bursts, but you cannot un-cook a dry edge.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring Your Actual Oven</h2>
            <p>If your results consistently run slow, your oven is likely below its label. The water test is a good approximation: microwave 1 cup of room-temperature water for 2 minutes. Boiling suggests 1000+ W, steaming-but-not-boiling suggests 700–800 W, and merely hot suggests 500–600 W. Feed that measured number into the calculator for the most reliable conversions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/microwave-wattage-conversion-calculator" />
          <PopularCalculators exclude="/calculator/microwave-wattage-conversion-calculator" />
        </div>
      </div>
    </>
  );
}
