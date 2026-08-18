"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { RotateCcw, Flame, Footprints } from "lucide-react";

// 1. Types
interface WalkResult {
  calories: number;
  timeMins: number;
  speed: number;
  caloriesPerKm: number;
  met: number;
  isError: boolean;
  errorMsg?: string;
}

const PACE_MAP: Record<string, { met: number; speed: number; label: string }> = {
  slow: { met: 3.0, speed: 3, label: "Slow (stroll)" },
  brisk: { met: 3.8, speed: 5, label: "Brisk (power walk)" },
  veryBrisk: { met: 5.0, speed: 6.5, label: "Very brisk (fast)" },
};

// 2. Pure calculation (MET formula)
const calculateWalk = (weightKg: number, distKm: number, paceId: string): WalkResult => {
  if (isNaN(weightKg) || isNaN(distKm) || weightKg <= 0 || distKm < 0) {
    return { calories: 0, timeMins: 0, speed: 0, caloriesPerKm: 0, met: 0, isError: true, errorMsg: "Please enter valid weight and distance values." };
  }
  const { met, speed } = PACE_MAP[paceId] ?? PACE_MAP.brisk;
  const timeHours = speed > 0 ? distKm / speed : 0;
  const timeMins = timeHours * 60;
  const calories = ((met * 3.5 * weightKg) / 200) * timeMins;

  return {
    calories,
    timeMins,
    speed,
    caloriesPerKm: distKm > 0 ? calories / distKm : 0,
    met,
    isError: false,
  };
};

// 3. Defaults
const DEFAULTS = {
  weight: "70",
  distance: "5",
  pace: "brisk",
  unit: "metric" as "metric" | "imperial",
};

// 4. Input component
const CompactInput = ({ id, label, value, onChange, suffix, placeholder }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 5. Component
export default function WalkingCalorieCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<WalkResult>(() => calculateWalk(70, 5, "brisk"));

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    const imperial = inputs.unit === "imperial";
    let w = parseFloat(inputs.weight) || 0;
    let d = parseFloat(inputs.distance) || 0;
    if (imperial) {
      w = w / 2.20462;
      d = d * 1.60934;
    }
    setResults(calculateWalk(w, d, inputs.pace));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateWalk(70, 5, "brisk"));
  };

  // Chart: calories by pace for the entered weight/distance
  const baseWeight = inputs.unit === "imperial" ? (parseFloat(inputs.weight) || 70) / 2.20462 : parseFloat(inputs.weight) || 70;
  const distKm = inputs.unit === "imperial" ? (parseFloat(inputs.distance) || 5) * 1.60934 : parseFloat(inputs.distance) || 5;
  const chartData = Object.entries(PACE_MAP).map(([id, p]) => {
    const mins = distKm / p.speed * 60;
    const kcal = ((p.met * 3.5 * baseWeight) / 200) * mins;
    return { name: p.label.split(" (")[0], kcal: Math.round(kcal), isCurrent: id === inputs.pace };
  });

  const faqs = [
    { question: "How are walking calories calculated?", answer: "Using the MET formula: calories = (MET × 3.5 × weight in kg ÷ 200) × minutes walked. Walking METs run from about 3.0 for a stroll to 5.0 for a very fast walk, and the calculator multiplies the duration derived from your distance and pace." },
    { question: "Why does walking burn fewer calories than running?", answer: "Running has a flight phase — both feet leave the ground each stride — which roughly doubles the vertical work per step. Walking keeps one foot down and swings your legs like pendulums, so its metabolic cost per mile is about 40–50% lower." },
    { question: "Do I burn more fat walking slowly?", answer: "At low intensity a higher share of calories comes from fat, but total calories still matter more for weight loss. A brisk 5 km walk at 5 km/h burns more total calories than a slow 3 km/h stroll over the same distance — and both are excellent daily habits." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Walking Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Walking Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Estimate the calories you burn walking based on weight, distance, and pace.</p>

            <div>
              <div className="flex rounded-md border border-input overflow-hidden h-9 w-full mb-3">
                <button type="button" onClick={() => handleChange("unit", "metric")} className={`flex-1 text-sm font-bold transition-colors ${inputs.unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (kg / km)</button>
                <button type="button" onClick={() => handleChange("unit", "imperial")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${inputs.unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (lb / mi)</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="weight" label="Body Weight" value={inputs.weight} onChange={(v: string) => handleChange("weight", v)} suffix={inputs.unit === "metric" ? "kg" : "lb"} placeholder="70" />
              <CompactInput id="distance" label="Distance" value={inputs.distance} onChange={(v: string) => handleChange("distance", v)} suffix={inputs.unit === "metric" ? "km" : "mi"} placeholder="5" />
            </div>

            <div className="flex flex-col">
              <label htmlFor="pace" className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Walking Pace</label>
              <select id="pace" value={inputs.pace} onChange={(e) => handleChange("pace", e.target.value)} className="rounded-md border border-input bg-background h-9 px-2 text-sm text-foreground font-medium">
                <option value="slow">Slow (stroll, ~3 km/h)</option>
                <option value="brisk">Brisk (power walk, ~5 km/h)</option>
                <option value="veryBrisk">Very brisk (fast, ~6.5 km/h)</option>
              </select>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Calories Burned</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-4xl font-black text-primary tracking-tighter">{Math.round(results.calories)}</div>
                    <div className="text-xl font-bold text-muted-foreground mb-1">kcal</div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">
                    ≈ {results.caloriesPerKm.toFixed(1)} kcal per {inputs.unit === "metric" ? "km" : "mile"} · {PACE_MAP[inputs.pace]?.label}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Duration</div>
                    <div className="text-xl font-bold text-foreground">{Math.round(results.timeMins)} min</div>
                    <div className="text-xs text-muted-foreground mt-0.5">≈ {(results.timeMins / 60).toFixed(1)} hours</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speed</div>
                    <div className="text-xl font-bold text-foreground">{results.speed.toFixed(1)} km/h</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{(results.speed * 0.621371).toFixed(1)} mph</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">MET Level</div>
                    <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1.5"><Footprints className="h-4 w-4 text-primary" />{results.met.toFixed(1)} METs</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Calories by Pace</h3>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => `${value} kcal`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Bar dataKey="kcal" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isCurrent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.35)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-3 italic">Same distance, same weight — faster walking burns more because the duration is shorter but intensity is higher.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Walking Calories Differ from Running</h2>
            <p>Walking is a pendulum motion: your legs swing forward while one foot stays planted, so your center of mass stays low and energy cost stays modest. Running adds a flight phase that lifts your whole body off the ground each stride, roughly doubling the work per step. That is why the same 70 kg person burns about 360 kcal running 5 km but only about 230 kcal walking it briskly.</p>

            <h2 className="text-2xl font-bold mb-3">The MET Method</h2>
            <p>This calculator uses the standard MET (metabolic equivalent) approach: a slow walk runs about 3.0 METs, a brisk power walk 3.8, and a very fast walk 5.0. Multiply the MET value by 3.5 and your weight in kilograms, divide by 200, then multiply by minutes walked — the result is the widely accepted estimate used by health authorities and fitness trackers alike.</p>

            <h2 className="text-2xl font-bold mb-3">Steps, Distance, and Daily Habits</h2>
            <p>Ten thousand steps is roughly 8 km for an average stride. At a brisk pace that is close to 370 kcal — a meaningful daily expenditure that compounds over weeks. Because walking is low-impact and easy to sustain, it remains the most accessible calorie-burning activity for most people, and the numbers here give you a reliable baseline to plan with.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/walking-calorie-calculator" />
          <PopularCalculators exclude="/calculator/walking-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
