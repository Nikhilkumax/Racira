"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { RotateCcw, Flame, Timer } from "lucide-react";

// 1. Types
interface RunResult {
  calories: number;
  speed: number;
  timeMins: number;
  caloriesPerKm: number;
  met: number;
  intensity: string;
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation
const calculateRun = (weightKg: number, distKm: number, timeMins: number): RunResult => {
  if (isNaN(weightKg) || isNaN(distKm) || isNaN(timeMins) || weightKg <= 0 || distKm < 0 || timeMins <= 0) {
    return { calories: 0, speed: 0, timeMins: 0, caloriesPerKm: 0, met: 0, intensity: "—", isError: true, errorMsg: "Please enter valid weight, distance, and time values." };
  }

  // Gross running calories ≈ body weight (kg) × distance (km) × 1.036
  const calories = distKm * weightKg * 1.036;

  const speed = timeMins > 0 ? distKm / (timeMins / 60) : 0;
  const met = speed < 8 ? 6 : speed < 12 ? 10 : 13;
  const intensity = speed > 12 ? "High" : speed > 8 ? "Moderate" : "Low";

  return {
    calories,
    speed,
    timeMins,
    caloriesPerKm: distKm > 0 ? calories / distKm : 0,
    met,
    intensity,
    isError: false,
  };
};

// 3. Defaults
const DEFAULTS = {
  weight: "70", // kg
  distance: "5", // km
  time: "30", // minutes
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
export default function RunningCalorieCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RunResult>(() => calculateRun(70, 5, 30));

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
    const t = parseFloat(inputs.time) || 0;
    setResults(calculateRun(w, d, t));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateRun(70, 5, 30));
  };

  // Chart: calories vs distance at current pace for a range of distances
  const baseWeight = inputs.unit === "imperial" ? (parseFloat(inputs.weight) || 70) / 2.20462 : parseFloat(inputs.weight) || 70;
  const timeMins = parseFloat(inputs.time) || 30;
  const speedKmh = timeMins > 0 ? (parseFloat(inputs.distance) || 5) / (timeMins / 60) : 0;
  const distRef = inputs.unit === "imperial" ? (parseFloat(inputs.distance) || 5) * 1.60934 : parseFloat(inputs.distance) || 5;
  const chartData = [2, 4, 6, 8, 10, 12, 15].map((d) => ({
    name: `${d} km`,
    kcal: Math.round(d * baseWeight * 1.036),
    isCurrent: Math.abs(d - distRef) < 0.6,
  }));

  const faqs = [
    { question: "How accurate is the running calorie estimate?", answer: "The formula weight × distance × 1.036 is a well-established gross estimate for steady-state running on flat ground. It ignores elevation, temperature, running economy, and muscle mass, so treat it as a planning number — accurate to roughly ±15% for most runners." },
    { question: "Why does distance matter more than speed for calories?", answer: "Calories burned while running are dominated by the work of moving your mass over a distance, not how fast you do it. Running 5 km burns almost the same calories whether you finish in 25 or 35 minutes — speed mostly changes how quickly you burn them." },
    { question: "What is MET and intensity?", answer: "MET (metabolic equivalent) is a multiple of your resting metabolic rate. Light jogging runs about 6 METs, moderate running about 10, and hard running 13+. The calculator uses your pace to assign an intensity band." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Running Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Running Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Estimate the calories you burn on a run from your weight, distance, and time.</p>

            <div>
              <div className="flex rounded-md border border-input overflow-hidden h-9 w-full mb-3">
                <button type="button" onClick={() => handleChange("unit", "metric")} className={`flex-1 text-sm font-bold transition-colors ${inputs.unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (kg / km)</button>
                <button type="button" onClick={() => handleChange("unit", "imperial")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${inputs.unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (lb / mi)</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="weight" label={inputs.unit === "metric" ? "Body Weight" : "Body Weight"} value={inputs.weight} onChange={(v: string) => handleChange("weight", v)} suffix={inputs.unit === "metric" ? "kg" : "lb"} placeholder="70" />
              <CompactInput id="distance" label="Distance" value={inputs.distance} onChange={(v: string) => handleChange("distance", v)} suffix={inputs.unit === "metric" ? "km" : "mi"} placeholder="5" />
            </div>
            <CompactInput id="time" label="Run Duration" value={inputs.time} onChange={(v: string) => handleChange("time", v)} suffix="min" placeholder="30" />

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
                    ≈ {results.caloriesPerKm.toFixed(1)} kcal per {inputs.unit === "metric" ? "km" : "mile"} · {results.intensity} intensity
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Avg Pace</div>
                    <div className="text-xl font-bold text-foreground">{results.speed.toFixed(1)} km/h</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{results.speed > 0 ? `${(60 / results.speed).toFixed(1)} min/km` : "—"}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Duration</div>
                    <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1.5"><Timer className="h-4 w-4 text-muted-foreground" />{Math.round(results.timeMins)} min</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">MET Level</div>
                    <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1.5"><Flame className="h-4 w-4 text-primary" />{results.met} METs</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Calories by Distance</h3>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => `${value} kcal`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Bar dataKey="kcal" radius={[4, 4, 0, 0]} maxBarSize={45}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isCurrent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.35)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-3 italic">Highlighted bar is your entered distance — calories scale linearly with distance.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Running Calorie Estimates Work</h2>
            <p>Running is one of the most efficient ways to burn calories per minute because it moves your entire body weight repeatedly against gravity. The standard field formula multiplies your body weight in kilograms by the distance covered in kilometers and a factor near 1.0 (here 1.036) that reflects the energy cost of steady running. For a 70 kg runner covering 5 km, that is about 362 kcal.</p>

            <h2 className="text-2xl font-bold mb-3">Distance vs. Speed</h2>
            <p>A common misconception is that running faster burns meaningfully more calories for the same route. In reality, the total work is dominated by distance: moving 70 kg over 5 km requires roughly the same energy whether it takes 25 or 40 minutes. Speed matters for the rate of burn, the MET intensity, and which energy systems dominate — but for total calories, distance wins.</p>

            <h2 className="text-2xl font-bold mb-3">What Can Change the Number</h2>
            <p>Uphill running adds roughly 5–10% per grade, heat and humidity force your body to work harder, and heavy runners burn slightly less per kilogram than light runners because of differences in running economy. Interval sessions with hard surges inflate the average metabolic cost too. Use this calculator as a consistent baseline, then adjust for your conditions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/running-calorie-calculator" />
          <PopularCalculators exclude="/calculator/running-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
