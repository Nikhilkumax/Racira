"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SnowInputs {
  area: string;
  depth: string;
  snowType: string; // "light" | "packed" | "wet"
  weight: string;
  intensity: string; // "moderate" | "heavy"
}

interface SnowResults {
  volumeFt3: number;
  weightLb: number;
  rateLbMin: number;
  minutes: number;
  minutesLabel: string;
  calories: number;
  passes: number;
  densityLbFt3: number;
  chartData: { name: string; weight: number; highlighted: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const SNOW_DENSITY: Record<string, number> = { light: 5, packed: 12, wet: 20 }; // lb/ft³
const INTENSITY: Record<string, { rate: number; met: number; label: string }> = {
  moderate: { rate: 1.6, met: 5.0, label: "Moderate pace" },
  heavy: { rate: 2.4, met: 6.5, label: "Fast, vigorous pace" },
};

function fmtMin(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function calcSnow(i: SnowInputs): SnowResults | null {
  const area = parseFloat(i.area);
  const depthIn = parseFloat(i.depth);
  const weightLb = parseFloat(i.weight);
  if (!area || !depthIn || !weightLb || area <= 0 || depthIn <= 0 || weightLb <= 0) return null;

  const density = SNOW_DENSITY[i.snowType] ?? 12;
  const volumeFt3 = area * (depthIn / 12);
  const snowWeight = volumeFt3 * density;
  const rate = INTENSITY[i.intensity]?.rate ?? 1.6;
  const met = INTENSITY[i.intensity]?.met ?? 5.0;
  const minutes = Math.max(1, Math.round(snowWeight / rate));
  // kcal = MET × 3.5 × kg ÷ 200 × minutes
  const calories = Math.round((met * 3.5 * (weightLb / 2.20462) / 200) * minutes);
  const passes = Math.ceil(snowWeight / 25); // ~25 lb per shovel load

  const chartData = [
    { name: "Light", weight: Math.round(volumeFt3 * 5), highlighted: i.snowType === "light" },
    { name: "Packed", weight: Math.round(volumeFt3 * 12), highlighted: i.snowType === "packed" },
    { name: "Wet", weight: Math.round(volumeFt3 * 20), highlighted: i.snowType === "wet" },
  ];

  const breakdown = [
    { label: "Driveway / Walk Area", value: `${area.toLocaleString()} sq ft` },
    { label: "Snow Depth", value: `${depthIn} in` },
    { label: "Snow Volume", value: `${volumeFt3.toFixed(0)} cu ft` },
    { label: "Snow Density", value: `${density} lb/cu ft (${i.snowType})` },
    { label: "Total Snow Weight", value: `${Math.round(snowWeight).toLocaleString()} lb` },
    { label: "Clearing Time", value: fmtMin(minutes), highlight: true, isTotal: true },
    { label: "Calories Burned", value: `${calories.toLocaleString()} kcal` },
    { label: "Shovel Loads", value: `≈ ${passes}` },
  ];

  const summaryStats = [
    { label: "Clearing Time", value: fmtMin(minutes) },
    { label: "Snow Weight", value: `${Math.round(snowWeight).toLocaleString()} lb` },
    { label: "Calories Burned", value: `${calories.toLocaleString()} kcal` },
    { label: "Snow Volume", value: `${volumeFt3.toFixed(0)} cu ft` },
    { label: "Clearing Rate", value: `${rate} lb/min` },
    { label: "Shovel Loads", value: `≈ ${passes}` },
    { label: "Body Weight", value: `${weightLb} lb` },
    { label: "Snow Type", value: i.snowType === "light" ? "Light (5 lb/ft³)" : i.snowType === "packed" ? "Packed (12 lb/ft³)" : "Wet (20 lb/ft³)" },
  ];

  return { volumeFt3, weightLb: snowWeight, rateLbMin: rate, minutes, minutesLabel: fmtMin(minutes), calories, passes, densityLbFt3: density, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: SnowInputs = { area: "500", depth: "6", snowType: "packed", weight: "175", intensity: "moderate" };

// 4. Component
export default function SnowShovelingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SnowResults | null>(() => calcSnow(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSnow(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcSnow(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSnow(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const area = parseFloat(inputs.area), depthIn = parseFloat(inputs.depth), weight = parseFloat(inputs.weight);
  if (!area || area <= 0 || area > 100000) errors.area = "Enter area in sq ft";
  if (!depthIn || depthIn <= 0 || depthIn > 120) errors.depth = "0–120 in";
  if (!weight || weight < 80 || weight > 500) errors.weight = "80–500 lb";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much does snow actually weigh?", answer: "Fresh, fluffy snow weighs about 5 lb per cubic foot; packed snow after a day or two is closer to 12 lb; wet, heavy snow can reach 20 lb per cubic foot. The same 500 sq ft driveway with 6 inches of snow ranges from 1,250 lb (light) to 5,000 lb (wet) — which is why snow type dominates the effort estimate." },
    { question: "How are the calorie estimates calculated?", answer: "Calories use the standard MET formula: kcal = MET × 3.5 × body weight (kg) ÷ 200 × minutes. Snow shoveling is estimated at MET 5.0 (moderate pace) to 6.5 (vigorous pace), similar to brisk walking on a treadmill at an incline. A 175 lb person shoveling for 40 minutes burns roughly 300–380 kcal." },
    { question: "Why does clearing rate matter?", answer: "Rate converts snow weight into time: an average adult clears about 1.6 lb of snow per minute at a moderate pace and 2.4 lb/min when working hard. Doubling the snow weight or halving the rate doubles the time, which is why the calculator reports weight and rate separately — the time is only as good as those two inputs." },
    { question: "Is snow shoveling dangerous?", answer: "Shoveling heavy snow is genuinely strenuous — sudden exertion in cold air raises heart rate and blood pressure, and it is a known trigger for cardiac events, especially for people with heart conditions. Take breaks, push rather than lift when possible, use proper lifting form, and treat it as the workout the calorie figure suggests it is." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Snow Shoveling Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Snow Shoveling Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="area" className={lbl}>Area to Clear</label>
                <div className={inp}>
                  <input id="area" type="number" min="1" max="100000" step="50" value={inputs.area} onChange={(e) => set("area")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.area && <p className="text-xs text-red-500 font-medium mt-1">{errors.area}</p>}
              </div>
              <div>
                <label htmlFor="depth" className={lbl}>Snow Depth</label>
                <div className={inp}>
                  <input id="depth" type="number" min="1" max="120" step="1" value={inputs.depth} onChange={(e) => set("depth")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.depth && <p className="text-xs text-red-500 font-medium mt-1">{errors.depth}</p>}
              </div>
              <div>
                <label htmlFor="snowType" className={lbl}>Snow Type</label>
                <select id="snowType" value={inputs.snowType} onChange={(e) => set("snowType")(e.target.value)} className={sel}>
                  <option value="light">Light, fluffy (5 lb/ft³)</option>
                  <option value="packed">Packed (12 lb/ft³)</option>
                  <option value="wet">Wet, heavy (20 lb/ft³)</option>
                </select>
              </div>
              <div>
                <label htmlFor="weight" className={lbl}>Your Weight</label>
                <div className={inp}>
                  <input id="weight" type="number" min="80" max="500" step="5" value={inputs.weight} onChange={(e) => set("weight")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
                {errors.weight && <p className="text-xs text-red-500 font-medium mt-1">{errors.weight}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Pace</div>
                    <label htmlFor="intensity" className={lbl}>Shoveling Pace</label>
                    <select id="intensity" value={inputs.intensity} onChange={(e) => set("intensity")(e.target.value)} className={sel}>
                      <option value="moderate">Moderate (1.6 lb/min · MET 5.0)</option>
                      <option value="heavy">Fast &amp; vigorous (2.4 lb/min · MET 6.5)</option>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Clearing Time</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? result.minutesLabel : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${Math.round(result.weightLb).toLocaleString()} lb of snow at ${result.rateLbMin} lb/min` : "Enter valid inputs."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Snow Weight", result ? `${Math.round(result.weightLb).toLocaleString()} lb` : "—"],
                ["Calories Burned", result ? `${result.calories.toLocaleString()} kcal` : "—"],
                ["Shovel Loads", result ? `≈ ${result.passes}` : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Effort Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Snow Weight by Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result?.chartData ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} tickFormatter={(v: number) => `${v.toLocaleString()} lb`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} lb`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                    {(result?.chartData ?? []).map((d, idx) => (
                      <Cell key={idx} fill={d.highlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Same footprint, wildly different loads — wet snow is 4× heavier than fresh powder.</p>
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
            <h2 className="text-2xl font-bold mb-3">Weight Is the Real Enemy</h2>
            <p>Shoveling time and effort are driven almost entirely by how much the snow weighs, which depends on its density. Fresh powder weighs about 5 lb per cubic foot, packed snow roughly 12 lb, and wet spring snow up to 20 lb. Six inches over a 500 sq ft driveway is 1,250 lb of light snow — or 5,000 lb if it is wet. The calculator computes the volume first, applies the density, and then converts weight into time and calories.</p>
            <h2 className="text-2xl font-bold mb-3">Time From a Rate, Calories From a MET</h2>
            <p>An average adult clears snow at roughly 1.6 lb per minute at a moderate pace and 2.4 lb/min when working hard. Time is weight divided by that rate. Calories follow the standard MET equation — kcal = MET × 3.5 × body weight (kg) ÷ 200 × minutes — with shoveling rated at MET 5.0 to 6.5, comparable to a brisk uphill walk.</p>
            <h2 className="text-2xl font-bold mb-3">Treat It Like Exercise, Because It Is</h2>
            <p>Clearing a deep, wet driveway is a genuine cardiovascular workout — and a well-documented trigger for cardiac events in cold weather, when blood vessels constrict and sudden exertion spikes heart rate and blood pressure. Warm up, push snow instead of lifting it when you can, take breaks, and pace yourself. The calorie figure is a reminder of how hard the task actually is.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/snow-shoveling-calculator" />
          <PopularCalculators exclude="/calculator/snow-shoveling-calculator" />
        </div>
      </div>
    </>
  );
}
