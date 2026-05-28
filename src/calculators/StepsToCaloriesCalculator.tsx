"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SPEEDS = [
  { name: "Slow (2.0 mph / 3.2 kmh)", met: 2.0, speedMph: 2.0 },
  { name: "Moderate (3.0 mph / 4.8 kmh)", met: 3.3, speedMph: 3.0 },
  { name: "Fast (3.5 mph / 5.6 kmh)", met: 4.3, speedMph: 3.5 },
  { name: "Race Walking (4.5 mph / 7.2 kmh)", met: 7.0, speedMph: 4.5 },
];

export default function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState("10000");
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [speedIndex, setSpeedIndex] = useState(1);
  const [res, setRes] = useState<{
    calories: number;
    distance: number;
    duration: number;
    chartData: { name: string; calories: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const s = parseFloat(steps) || 0;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (s <= 0 || w <= 0 || h <= 0) return;

    // Weight conversion to kg
    const weightKg = unit === "imperial" ? w * 0.453592 : w;
    // Height conversion to cm
    const heightCm = unit === "imperial" ? h * 2.54 : h;

    // Estimated stride length (cm) = Height (cm) * 0.413 for females / 0.415 for males average
    const strideCm = heightCm * 0.414;
    const strideInches = strideCm / 2.54;

    // Distance in meters
    const distanceMeters = (s * strideCm) / 100;
    const distanceKm = distanceMeters / 1000;
    const distanceMiles = distanceKm * 0.621371;

    const selectedSpeed = SPEEDS[speedIndex];
    const speedMph = selectedSpeed.speedMph;
    const met = selectedSpeed.met;

    // Duration in hours = distance / speed
    const durationHours = (unit === "imperial" ? distanceMiles : distanceKm) / (unit === "imperial" ? speedMph : speedMph * 1.60934);
    const durationMinutes = durationHours * 60;

    // Calories burned = MET * weight (kg) * duration (hours)
    const calories = Math.round(met * weightKg * durationHours);

    // Chart data for comparison across all speeds
    const chartData = SPEEDS.map(sp => {
      const dHours = (unit === "imperial" ? distanceMiles : distanceKm) / (unit === "imperial" ? sp.speedMph : sp.speedMph * 1.60934);
      return {
        name: sp.name.split(" (")[0],
        calories: Math.round(sp.met * weightKg * dHours),
      };
    });

    setRes({
      calories,
      distance: unit === "imperial" ? distanceMiles : distanceKm,
      duration: durationMinutes,
      chartData,
    });
  };

  const reset = () => {
    setSteps("10000");
    setWeight("75");
    setHeight("175");
    setSpeedIndex(1);
  };

  const faqs = [
    { question: "How many calories do 10,000 steps burn?", answer: "For an average-weight adult, 10,000 steps burn between 300 to 500 calories. The exact amount depends heavily on your weight, height (which dictates stride length), and speed of walking." },
    { question: "How is the calorie burn calculated from steps?", answer: "The calculator estimates distance using stride length (derived from height), determines the duration based on walking speed, and applies MET (Metabolic Equivalent of Task) values matching your pace to your body weight over that duration." },
    { question: "What is stride length?", answer: "Stride length is the distance covered from the heel strike of one foot to the next heel strike of the same foot. It is highly correlated with height and averages roughly 41.4% of total height." },
    { question: "Does speed affect calorie burn per step?", answer: "Yes. Walking faster raises your heart rate, increasing MET energy expenditure per unit of time. Walking at a brisk pace (3.5 mph) burns significantly more calories over the same distance than a leisurely stroll." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Steps to Calories Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Steps to Calories Burned Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Step Details</h2>
            <div className="flex gap-2">
              {(["metric", "imperial"] as const).map(u => (
                <button key={u} type="button" onClick={() => { setUnit(u); setWeight(u === "metric" ? "75" : "165"); setHeight(u === "metric" ? "175" : "69"); }} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${unit === u ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{u === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/in)"}</button>
              ))}
            </div>
            <CompactInput id="steps" label="Number of Steps" value={steps} onChange={setSteps} suffix="steps" min="0" />
            <CompactInput id="weight" label="Weight" value={weight} onChange={setWeight} suffix={unit === "metric" ? "kg" : "lbs"} />
            <CompactInput id="height" label="Height" value={height} onChange={setHeight} suffix={unit === "metric" ? "cm" : "in"} />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Walking Speed/Pace</label>
              <select value={speedIndex} onChange={e => setSpeedIndex(Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {SPEEDS.map((s, idx) => <option key={s.name} value={idx}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Calories
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Calorie Burn Summary</h2>
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Est. Calories Burned</div>
                  <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">{res.calories}</div>
                  <div className="text-sm font-semibold text-muted-foreground">kcal</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Steps Counted", value: (parseFloat(steps) || 0).toLocaleString() },
                        { label: "Estimated Distance", value: `${res.distance.toFixed(2)} ${unit === "metric" ? "km" : "miles"}` },
                        { label: "Estimated Active Duration", value: `${Math.round(res.duration)} minutes` },
                        { label: "Calories Burned", value: `${res.calories} kcal`, bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Calorie Burn by Walking Speed</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [`${v} kcal`]} />
                        <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>Translating Daily Steps to Energy Expenditure</h2>
            <p>Walking is one of the most accessible and effective forms of physical activity. Tracking steps with pedometers, fitness bands, or smartphones has become standard practice. However, translating a raw step count to actual calories burned requires understanding metabolic task equivalents and personal biology.</p>
            <p>This calculator processes steps using two intermediate estimations: stride length and duration. Stride length dictates how much physical distance is covered with each step, which depends directly on height. Duration measures how long your body was active, calculated by dividing total distance by the chosen speed of travel.</p>

            <h2>Understanding MET and Speed Variables</h2>
            <p>The rate of energy expenditure is calculated using Metabolic Equivalent of Task (MET) multipliers. A MET represents the ratio of active metabolic rate relative to resting metabolic rate. Quiet sitting is equivalent to 1 MET. Leisurely walking (2.0 mph) requires roughly 2.0 METs, while brisk walking (3.5 mph) escalates energy demands to 4.3 METs.</p>
            <p>Because energy expenditure scales with body weight, heavier individuals require more kinetic energy to cover the same distance, resulting in a higher calorie burn rate. Consistently maintaining a higher walking speed will burn significantly more calories over the same step count because the body works against higher kinetic resistance.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/steps-to-calories-calculator" />
          <PopularCalculators exclude="/calculator/steps-to-calories-calculator" />
        </div>
      </div>
    </>
  );
}
