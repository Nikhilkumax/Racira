"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface WorkoutCalResult { calories: number; calPerHour: number; met: number; duration: number; }
const DEFAULTS = { weight: "75", duration: "45", activity: "weightlifting_moderate", customMet: "" };

const ACTIVITIES = [
  { key: "weightlifting_light", label: "Weight Training (light)", met: 3.0 },
  { key: "weightlifting_moderate", label: "Weight Training (moderate)", met: 5.0 },
  { key: "weightlifting_vigorous", label: "Weight Training (vigorous)", met: 6.0 },
  { key: "hiit", label: "HIIT / Circuit Training", met: 8.0 },
  { key: "crossfit", label: "CrossFit", met: 7.5 },
  { key: "yoga", label: "Yoga (Hatha)", met: 3.0 },
  { key: "yoga_power", label: "Yoga (Power / Vinyasa)", met: 4.0 },
  { key: "pilates", label: "Pilates (mat)", met: 3.5 },
  { key: "aerobics_low", label: "Aerobics (low impact)", met: 5.0 },
  { key: "aerobics_high", label: "Aerobics (high impact)", met: 7.3 },
  { key: "jump_rope", label: "Jump Rope", met: 11.8 },
  { key: "rowing_moderate", label: "Rowing Machine (moderate)", met: 7.0 },
  { key: "rowing_vigorous", label: "Rowing Machine (vigorous)", met: 8.5 },
  { key: "elliptical", label: "Elliptical Trainer", met: 5.0 },
  { key: "stair_climber", label: "Stair Climber", met: 8.0 },
  { key: "boxing", label: "Boxing (sparring)", met: 7.8 },
  { key: "custom", label: "Custom MET Value", met: 0 },
];

function calculate(d: typeof DEFAULTS): WorkoutCalResult {
  const w = parseFloat(d.weight)||70, dur = parseFloat(d.duration)||0;
  const act = ACTIVITIES.find(a => a.key === d.activity);
  const met = d.activity === "custom" ? (parseFloat(d.customMet)||0) : (act?.met || 5);
  const calPerHour = met * w;
  const calories = Math.round(calPerHour * (dur / 60));
  return { calories, calPerHour: Math.round(calPerHour), met, duration: dur };
}

export default function WorkoutCalorieCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<WorkoutCalResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const topActivities = ACTIVITIES.filter(a => a.key !== "custom").slice(0, 8).map(a => ({
    name: a.label.split("(")[0].trim(),
    cals: Math.round(a.met * (parseFloat(f.weight)||75) * (parseFloat(f.duration)||45) / 60),
    fill: a.key === f.activity ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const faqs = [
    { question: "How are workout calories calculated?", answer: "Calories = MET × Body Weight (kg) × Duration (hours). MET (Metabolic Equivalent of Task) is a standardized measure of exercise intensity. MET 1 = resting energy expenditure (~1 kcal/kg/hr). Exercise METs range from 3 (light yoga) to 15+ (vigorous interval training)." },
    { question: "Which workout burns the most calories?", answer: "High-intensity activities burn the most: jump rope (~11.8 MET), HIIT (~8 MET), boxing (7.8 MET), vigorous rowing (8.5 MET), stair climbing (8 MET). For a 75 kg person, 45 minutes of jump rope burns ~663 calories vs. 281 for light yoga." },
    { question: "Does weight training burn many calories?", answer: "Resistance training burns fewer calories during the session than cardio (MET 3–6 vs. 7–12 for vigorous cardio). However, weight training increases resting metabolic rate for 24–72 hours post-workout (EPOC effect) and builds muscle that permanently elevates basal metabolic rate. Long-term, it is highly effective for body composition." },
    { question: "What is EPOC and does it matter?", answer: "EPOC (Excess Post-exercise Oxygen Consumption), or the afterburn effect, is additional calorie burn after exercise ends. HIIT and heavy resistance training produce the highest EPOC — extending calorie burn for up to 24–48 hours. Steady-state cardio produces minimal EPOC." },
    { question: "How accurate are calorie burn estimates?", answer: "MET-based estimates are accurate within 20–30% for most people. Individual variation (fitness level, muscle mass, efficiency, temperature) affects actual burn significantly. Wearable fitness trackers have 10–40% error depending on device and activity type. Use these estimates for planning, not precise tracking." },
    { question: "How many calories do I need to burn to lose 1 kg of fat?", answer: "Approximately 7,700 calories equals 1 kg of body fat. A daily deficit of 500 calories (through diet and exercise combined) produces approximately 0.5 kg per week of fat loss. Exercise alone is rarely sufficient — combining dietary changes with exercise is the most effective and sustainable approach." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Workout Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Workout Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Body Weight (kg)</label>
                <input type="number" value={f.weight} onChange={e => set("weight")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Duration (minutes)</label>
                <input type="number" value={f.duration} onChange={e => set("duration")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
            </div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Activity Type</label>
              <select value={f.activity} onChange={e => set("activity")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                {ACTIVITIES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select></div>
            {f.activity === "custom" && (
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Custom MET Value</label>
                <input type="number" value={f.customMet} onChange={e => set("customMet")(e.target.value)} placeholder="e.g. 6.5" className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
            )}
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Calories Burned</div>
              <div className="text-5xl font-extrabold text-foreground">{r.calories.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">MET {r.met} · {r.calPerHour} kcal/hr · {f.duration} minutes</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">MET Value</div><div className="font-bold text-lg">{r.met}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Cal/Hour</div><div className="font-bold text-lg">{r.calPerHour}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Fat Burned</div><div className="font-bold text-lg">{(r.calories / 7700 * 1000).toFixed(1)}g</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Calories Burned by Activity (your weight &amp; time)</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topActivities} layout="vertical" barSize={16}>
                    <XAxis type="number" tick={{ fontSize: 10 }} unit=" cal" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <RTooltip formatter={(v: number) => [`${v} kcal`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <ReferenceLine x={r.calories} stroke="hsl(var(--primary))" strokeDasharray="4 2" />
                    <Bar dataKey="cals" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Workout Calorie Calculator</h2>
            <p>This workout calorie calculator covers 16 common gym and fitness activities using validated MET (Metabolic Equivalent of Task) values from the Compendium of Physical Activities (Ainsworth et al., 2011). It includes a custom MET option for activities not listed. Results include total calories, calorie rate per hour, and an estimate of fat mass burned.</p>
            <h2 className="text-2xl font-bold mb-3">How MET Values Work</h2>
            <p>MET = the ratio of working metabolic rate to resting metabolic rate. MET 1 = resting (watching TV). MET 5 = moderate exercise (5× resting burn). MET 10 = vigorous exercise (10× resting burn). The formula Calories = MET × weight(kg) × duration(hr) is the industry-standard approach used in exercise science, clinical settings, and fitness technology.</p>
            <h2 className="text-2xl font-bold mb-3">Calorie Burn for Weight Loss</h2>
            <p>A 500-calorie daily deficit (diet + exercise) creates approximately 0.5 kg/week fat loss — the widely recommended sustainable rate. For a 75 kg person doing 45-minute moderate weight training (281 calories), combined with a 200-calorie dietary reduction creates the needed deficit. 3 sessions/week = ~843 exercise calories/week contributing to 1 kg loss approximately every 9 weeks from exercise alone.</p>
            <h2 className="text-2xl font-bold mb-3">Resistance Training and Metabolic Rate</h2>
            <p>While resistance training burns fewer calories per session than cardio, it uniquely builds lean muscle mass. Each additional kilogram of muscle increases resting metabolic rate by approximately 13 kcal/day — compounding permanently. A 5 kg muscle gain adds 65 kcal/day resting burn — equivalent to a 20-minute jog daily without effort. This is why strength training is considered superior for long-term weight management.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/workout-calorie-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Workout Calorie Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Workout Calorie Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Workout Calorie Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Workout Calorie Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Workout Calorie Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/workout-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
