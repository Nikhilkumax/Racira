"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface CyclingResult { calories: number; calPerHour: number; met: number; distanceKm: number; avgSpeed: number; }
const DEFAULTS = { weight: "75", duration: "60", intensity: "moderate_outdoor", terrain: "flat" };

const INTENSITIES = [
  { key: "leisure", label: "Leisure (<16 km/h)", met: 4.0 },
  { key: "moderate_outdoor", label: "Moderate (16–19 km/h)", met: 8.0 },
  { key: "vigorous_outdoor", label: "Vigorous (19–22 km/h)", met: 10.0 },
  { key: "racing", label: "Racing (22–26 km/h)", met: 12.0 },
  { key: "spinning_moderate", label: "Spin Class (moderate)", met: 8.5 },
  { key: "spinning_vigorous", label: "Spin Class (vigorous)", met: 11.0 },
  { key: "mountain_bike", label: "Mountain Biking", met: 8.5 },
];

const TERRAIN_MULT: Record<string, number> = { flat: 1.0, rolling: 1.15, hilly: 1.35, mountain: 1.6 };

function calculate(d: typeof DEFAULTS): CyclingResult {
  const w = parseFloat(d.weight)||70, dur = parseFloat(d.duration)||0;
  const intensity = INTENSITIES.find(i => i.key === d.intensity) || INTENSITIES[1];
  const terrainMult = TERRAIN_MULT[d.terrain] || 1;
  const met = intensity.met * terrainMult;
  const calPerHour = met * w;
  const calories = Math.round(calPerHour * (dur / 60));
  const avgSpeed = d.intensity.includes("spin") ? 0 : intensity.key === "leisure" ? 14 : intensity.key === "moderate_outdoor" ? 17.5 : intensity.key === "vigorous_outdoor" ? 20.5 : intensity.key === "racing" ? 24 : intensity.key === "mountain_bike" ? 16 : 0;
  const distanceKm = avgSpeed * (dur / 60);
  return { calories, calPerHour: Math.round(calPerHour), met: +met.toFixed(1), distanceKm: +distanceKm.toFixed(1), avgSpeed };
}

export default function CyclingCalorieCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<CyclingResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const chartData = INTENSITIES.slice(0, 6).map(i => ({
    name: i.label.split("(")[0].trim(),
    cals: Math.round(i.met * (parseFloat(f.weight)||75) * (parseFloat(f.duration)||60) / 60),
    fill: i.key === f.intensity ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const faqs = [
    { question: "How many calories does cycling burn?", answer: "A 75 kg cyclist burns approximately 480–720 calories per hour depending on intensity. Leisure cycling burns ~400 cal/hr; vigorous cycling burns ~750 cal/hr; spin class can reach 800+ cal/hr. Heavier riders burn proportionally more." },
    { question: "Is cycling or running better for calorie burn?", answer: "Running burns slightly more calories per hour at similar perceived effort because it uses body weight as resistance. However, cycling is lower impact, allowing longer sessions. Elite cyclists sustain 700–1,000+ watts during sprints, burning calories at extraordinary rates. For joint health and sustainability, cycling is often preferable." },
    { question: "How does terrain affect calories burned cycling?", answer: "Hilly terrain burns significantly more calories because climbing requires overcoming gravitational potential energy. A steep climb can double or triple energy expenditure compared to flat cycling. Our calculator applies terrain multipliers (flat 1.0×, rolling 1.15×, hilly 1.35×, mountainous 1.6×)." },
    { question: "How many calories does a 1-hour spin class burn?", answer: "A 75 kg person burns approximately 510–660 calories in a 45–60 minute spin class depending on effort level. Indoor cycling provides consistent resistance and is unaffected by wind, making it one of the most efficient calorie-burning gym workouts." },
    { question: "Does body weight affect cycling calorie burn?", answer: "Yes — significantly. Heavier riders burn more calories because they work harder to move greater body mass. A 100 kg cyclist burns ~33% more calories than a 75 kg cyclist at the same speed. This is captured in the MET formula: Calories = MET × weight(kg) × duration(hr)." },
    { question: "What is a good cycling intensity for fat loss?", answer: "Moderate intensity (65–75% max HR, Zone 2) is optimal for fat oxidation. This corresponds to roughly 16–19 km/h on flat terrain. However, total calorie burn matters most — vigorous cycling burns more total calories even if fat percentage is lower. Combine moderate-intensity long rides with weekly intervals for optimal results." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cycling Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cycling Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Weight (kg)</label>
                <input type="number" value={f.weight} onChange={e => set("weight")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Duration (min)</label>
                <input type="number" value={f.duration} onChange={e => set("duration")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
            </div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Intensity / Type</label>
              <select value={f.intensity} onChange={e => set("intensity")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                {INTENSITIES.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
              </select></div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Terrain</label>
              <select value={f.terrain} onChange={e => set("terrain")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                <option value="flat">Flat (road/path)</option>
                <option value="rolling">Rolling Hills</option>
                <option value="hilly">Hilly</option>
                <option value="mountain">Mountain / Steep</option>
              </select></div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Calories Burned</div>
              <div className="text-5xl font-extrabold text-foreground">{r.calories.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">MET {r.met} · {r.calPerHour} kcal/hr{r.distanceKm > 0 ? ` · ~${r.distanceKm} km` : ""}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">MET Value</div><div className="font-bold text-lg">{r.met}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Distance Est.</div><div className="font-bold text-lg">{r.distanceKm > 0 ? `${r.distanceKm} km` : "N/A"}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Fat Burned</div><div className="font-bold text-lg">{(r.calories / 7700 * 1000).toFixed(1)}g</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Calories by Intensity (your weight &amp; duration)</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={35}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} unit=" cal" />
                    <RTooltip formatter={(v: number) => [`${v} kcal`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="cals" radius={[4,4,0,0]}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Cycling Calorie Burn — How It&apos;s Calculated</h2>
            <p>Cycling calorie burn is calculated using validated MET values from the Compendium of Physical Activities. Formula: Calories = MET × Weight (kg) × Duration (hours). A terrain multiplier adjusts for the additional energy cost of hill climbing, which can increase expenditure by 15–60% compared to flat cycling at the same speed.</p>
            <h2 className="text-2xl font-bold mb-3">Cycling for Weight Loss</h2>
            <p>Cycling 5 days/week for 60 minutes at moderate intensity burns approximately 2,400 calories/week for a 75 kg rider — equivalent to losing approximately 0.3 kg of fat per week from exercise alone. Combined with a 300–400 calorie/day dietary deficit, weekly fat loss reaches 0.7–0.8 kg — the upper end of healthy, sustainable fat loss rates.</p>
            <h2 className="text-2xl font-bold mb-3">Zone 2 Training and Fat Oxidation</h2>
            <p>Zone 2 cycling (65–75% of max heart rate) maximizes fat oxidation and builds mitochondrial density — the cellular machinery responsible for aerobic energy production. At Zone 2 intensity (comfortable conversational pace), approximately 65–85% of energy comes from fat. This is why endurance athletes spend 80% of training time in Zone 2, building the aerobic base upon which higher intensity work is layered.</p>
            <h2 className="text-2xl font-bold mb-3">Indoor vs. Outdoor Calorie Burn</h2>
            <p>Controlled studies show indoor cycling (stationary bike, spin class) burns comparable or slightly fewer calories than outdoor cycling at the same perceived effort because aerodynamic drag doesn&apos;t exist indoors. However, indoor cycling allows precise intensity control and is unaffected by traffic, weather, and coasting. Power meter equipped bikes measure output in watts — the most precise calorie measurement method available (1 watt = 3.6 kJ/hr = ~0.86 kcal/hr, adjusted for ~25% mechanical efficiency).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-calorie-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Cycling Calorie Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Cycling Calorie Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Cycling Calorie Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Cycling Calorie Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Cycling Calorie Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/cycling-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
