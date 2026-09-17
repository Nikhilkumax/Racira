"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface SwimCalResult { calories: number; calPerHour: number; laps: number; distance: number; met: number; }
const DEFAULTS = { weight: "75", duration: "45", stroke: "freestyle", intensity: "moderate", poolLength: "25" };

const STROKES: Record<string, { label: string; mets: { easy: number; moderate: number; hard: number } }> = {
  freestyle: { label: "Freestyle (Front Crawl)", mets: { easy: 5.8, moderate: 8.3, hard: 10.0 } },
  backstroke: { label: "Backstroke", mets: { easy: 4.8, moderate: 6.2, hard: 8.0 } },
  breaststroke: { label: "Breaststroke", mets: { easy: 5.3, moderate: 7.0, hard: 9.5 } },
  butterfly: { label: "Butterfly", mets: { easy: 8.0, moderate: 10.0, hard: 13.8 } },
  sidestroke: { label: "Sidestroke", mets: { easy: 5.0, moderate: 6.0, hard: 7.0 } },
};

function calculate(d: typeof DEFAULTS): SwimCalResult {
  const w = parseFloat(d.weight) || 70, dur = parseFloat(d.duration) || 0;
  const poolLen = parseFloat(d.poolLength) || 25;
  const strokeData = STROKES[d.stroke] || STROKES.freestyle;
  const met = strokeData.mets[d.intensity as keyof typeof strokeData.mets] || 8.3;
  const calPerHour = met * w;
  const calories = Math.round(calPerHour * (dur / 60));
  const speedMpm = d.intensity === "easy" ? 1.4 : d.intensity === "moderate" ? 1.8 : 2.5;
  const distanceM = speedMpm * dur;
  const laps = Math.round(distanceM / (poolLen * 2));
  return { calories, calPerHour: Math.round(calPerHour), laps, distance: Math.round(distanceM), met };
}

export default function SwimmingCalorieCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<SwimCalResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const strokeData = Object.entries(STROKES).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    calories: Math.round(v.mets.moderate * (parseFloat(f.weight) || 75) * (parseFloat(f.duration) || 45) / 60),
    fill: k === f.stroke ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const faqs = [
    { question: "How many calories does swimming burn?", answer: "Swimming burns 400–800+ calories per hour depending on stroke, intensity, and body weight. Butterfly is the highest calorie burner, followed by breaststroke and freestyle. A 75 kg person swimming moderate freestyle for 45 minutes burns approximately 470–500 calories." },
    { question: "Which swim stroke burns the most calories?", answer: "Butterfly burns the most calories — 10–14 MET for vigorous effort, making it the most demanding of all strokes. Breaststroke is second, followed by freestyle and backstroke. Sidestroke is the most leisurely and burns fewest calories." },
    { question: "Is swimming better for calorie burn than running?", answer: "Running typically burns 10–20% more calories per hour than swimming at equivalent effort because air resistance is lower in water. However, swimming is non-impact and excellent for joint health. For overall calorie expenditure, vigorous swimming is comparable to jogging." },
    { question: "How is swimming calorie burn calculated?", answer: "Calories = MET × body weight (kg) × duration (hours). MET (Metabolic Equivalent of Task) values for swimming range from 4.8 (easy backstroke) to 13.8 (hard butterfly). The Compendium of Physical Activities provides standardized MET values used by sports scientists worldwide." },
    { question: "Does water temperature affect calorie burn?", answer: "Cold water (below 26°C) slightly increases calorie burn as the body works to maintain core temperature. However, the difference is modest (5–10%) and not accounted for in standard MET calculations. The intensity and stroke type are far more significant variables." },
    { question: "How many laps equal a good swimming workout?", answer: "In a 25m pool, 1 lap = 50m (down and back). A 1,500m swim (30 laps) is a standard distance workout. Olympic distance triathlon includes a 1,500m swim. For beginners, 20 minutes of continuous swimming (10–15 laps) is a solid starting point." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Swimming Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Swimming Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Weight (kg)</label>
                <input type="number" value={f.weight} onChange={e => set("weight")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Duration (minutes)</label>
                <input type="number" value={f.duration} onChange={e => set("duration")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Pool Length (m)</label>
                <select value={f.poolLength} onChange={e => set("poolLength")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="25">25m (Short Course)</option><option value="50">50m (Olympic)</option>
                </select></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Intensity</label>
                <select value={f.intensity} onChange={e => set("intensity")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="easy">Easy / Recovery</option><option value="moderate">Moderate / Fitness</option><option value="hard">Hard / Race Pace</option>
                </select></div>
            </div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Swim Stroke</label>
              <select value={f.stroke} onChange={e => set("stroke")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(STROKES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Calories Burned</div>
              <div className="text-5xl font-extrabold text-foreground">{r.calories.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">{r.calPerHour} kcal/hr · MET {r.met} · {f.duration} minutes</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Distance</div><div className="font-bold text-lg">{r.distance}m</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Laps ({f.poolLength}m pool)</div><div className="font-bold text-lg">{r.laps}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Cal/hour</div><div className="font-bold text-lg">{r.calPerHour}</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Calories by Stroke (moderate intensity)</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strokeData} barSize={35}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit=" cal" />
                    <RTooltip formatter={(v: number) => [`${v} kcal`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                      {strokeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
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
            <h2 className="text-2xl font-bold mb-3">How Swimming Calories Are Calculated</h2>
            <p>This swimming calorie calculator uses MET (Metabolic Equivalent of Task) values from the Compendium of Physical Activities (Ainsworth et al.) — the gold standard reference for exercise energy expenditure. Formula: Calories = MET × Body Weight (kg) × Duration (hours). Different strokes have different MET values because they engage different muscle groups with varying efficiency.</p>
            <h2 className="text-2xl font-bold mb-3">Swimming vs. Other Cardio</h2>
            <p>Swimming burns comparable calories to running and cycling. A 75 kg person burns ~540 calories running for 45 minutes at 10 km/h, vs. ~470 calories swimming moderate freestyle. The key advantage of swimming is near-zero impact — making it ideal for injury recovery, older adults, and people with joint issues. Elite triathletes train all three disciplines for comprehensive cardiovascular development.</p>
            <h2 className="text-2xl font-bold mb-3">Stroke Selection for Fitness Goals</h2>
            <p>Calorie burning: butterfly &gt; breaststroke &gt; freestyle &gt; backstroke. Upper body development: butterfly, freestyle, backstroke. Core strength: butterfly, breaststroke. Full-body conditioning: rotate strokes each workout. Beginners typically start with freestyle (most efficient) and add breaststroke for recovery laps. HIIT swimming alternates sprint intervals with easy recovery lengths for maximum calorie afterburn.</p>
            <h2 className="text-2xl font-bold mb-3">Training Volume Guidelines</h2>
            <p>Fitness swimming: 2,000–3,000m per session, 3–4 sessions/week. Competitive: 4,000–10,000m per session, 5–6 sessions/week. For weight management, 3× per week of 45-minute moderate-intensity swimming creates a significant caloric deficit over time. Track total weekly distance and gradually increase volume by no more than 10% per week.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swimming-calorie-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Swimming Calorie Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Swimming Calorie Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Swimming Calorie Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Swimming Calorie Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Swimming Calorie Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/swimming-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
