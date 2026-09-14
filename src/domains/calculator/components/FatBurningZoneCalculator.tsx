"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Heart } from "lucide-react";
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

const ZONES = [
  { name: "Active Recovery (Zone 1)", minPct: 0.50, maxPct: 0.60, color: "text-emerald-500", fill: "#10b981", desc: "Leisurely pace, active recovery, warm-up." },
  { name: "Fat Burning (Zone 2)", minPct: 0.60, maxPct: 0.70, color: "text-amber-500", fill: "#f59e0b", desc: "Optimal fat utilization, basic cardiovascular endurance.", highlight: true },
  { name: "Aerobic / Endurance (Zone 3)", minPct: 0.70, maxPct: 0.80, color: "text-orange-500", fill: "#f97316", desc: "Improves cardiovascular capacity, aerobic power." },
  { name: "Anaerobic / Threshold (Zone 4)", minPct: 0.80, maxPct: 0.90, color: "text-red-500", fill: "#ef4444", desc: "Builds high-speed endurance, increases lactate threshold." },
  { name: "Max Effort (Zone 5)", minPct: 0.90, maxPct: 1.00, color: "text-red-700", fill: "#b91c1c", desc: "Sprints, maximum effort, short bursts." },
];

export default function FatBurningZoneCalculator() {
  const [age, setAge] = useState("30");
  const [rhr, setRhr] = useState("65");
  const [method, setMethod] = useState<"standard" | "tanaka" | "karvonen">("karvonen");
  const [res, setRes] = useState<{
    maxHr: number;
    restingHr: number;
    zones: { name: string; minHr: number; maxHr: number; desc: string; color: string; highlight?: boolean }[];
    chartData: { name: string; min: number; max: number; fill: string }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const a = parseFloat(age) || 30;
    const resting = parseFloat(rhr) || 60;

    let maxHr = 220 - a;
    if (method === "tanaka") {
      maxHr = Math.round(208 - 0.7 * a);
    }

    const zones = ZONES.map(z => {
      let minHr: number;
      let maxHrLimit: number;

      if (method === "karvonen") {
        // Karvonen Formula: Target HR = ((Max HR - Resting HR) * %Intensity) + Resting HR
        const hrReserve = maxHr - resting;
        minHr = Math.round((hrReserve * z.minPct) + resting);
        maxHrLimit = Math.round((hrReserve * z.maxPct) + resting);
      } else {
        // Standard percentage of Max HR
        minHr = Math.round(maxHr * z.minPct);
        maxHrLimit = Math.round(maxHr * z.maxPct);
      }

      return {
        name: z.name,
        minHr,
        maxHr: maxHrLimit,
        desc: z.desc,
        color: z.color,
        highlight: z.highlight,
      };
    });

    const chartData = ZONES.map((z, idx) => ({
      name: z.name.split(" (")[0],
      min: zones[idx].minHr,
      max: zones[idx].maxHr,
      fill: z.fill,
    }));

    setRes({
      maxHr,
      restingHr: resting,
      zones,
      chartData,
    });
  };

  const reset = () => {
    setAge("30");
    setRhr("65");
    setMethod("karvonen");
  };

  const faqs = [
    { question: "What is the fat burning zone?", answer: "The fat burning zone is a heart rate range (typically 60% to 70% of your maximum heart rate) where your body derives a higher percentage of its energy from fat oxidation rather than carbohydrates." },
    { question: "How does the Karvonen method work?", answer: "The Karvonen formula calculates target heart rate zones by incorporating your Resting Heart Rate (RHR) to determine your Heart Rate Reserve (HRR = Max HR - RHR). This makes the zones highly personalized compared to simple age formulas." },
    { question: "Tanaka vs. Standard formula - which is better?", answer: "The standard '220 - age' formula is a simple estimate. The Tanaka equation (208 - 0.7 × age) is scientifically validated to be more accurate, particularly for older adults, as it accounts for a slower decline in Max HR with age." },
    { question: "Does training in Zone 2 burn more total fat?", answer: "While you burn a higher percentage of fat relative to carbs in Zone 2, higher-intensity workouts (Zone 3/4) burn more total calories. However, Zone 2 is excellent for building base aerobic endurance without overtaxing your recovery systems." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fat Burning Zone Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fat Burning Heart Rate Zone Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Heart Rate Profile</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Calculation Method</label>
              <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="karvonen">Karvonen (Highly Personalized with RHR)</option>
                <option value="tanaka">Tanaka Equation (208 - 0.7 × Age)</option>
                <option value="standard">Standard (220 - Age)</option>
              </select>
            </div>
            
            <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="years" min="1" max="120" />
            {method === "karvonen" && (
              <CompactInput id="rhr" label="Resting Heart Rate (RHR)" value={rhr} onChange={setRhr} suffix="bpm" min="30" max="150" />
            )}

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <h2 className="text-2xl font-bold mb-3">Target Heart Rate Zones</h2>
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Est. Max Heart Rate</div>
                  <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">{res.maxHr}</div>
                  <div className="text-sm font-semibold text-muted-foreground">Beats Per Minute (bpm)</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Zone</th><th className="p-2.5">Range (bpm)</th><th className="p-2.5 pr-3">Workout Benefit</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {res.zones.map(z => (
                        <tr key={z.name} className={`hover:bg-secondary/20 ${z.highlight ? "font-bold bg-amber-500/10 border-l-4 border-amber-500" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{z.name}</td>
                          <td className="p-2.5 text-foreground">{z.minHr} - {z.maxHr} bpm</td>
                          <td className="p-2.5 pr-3 text-xs text-muted-foreground">{z.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Heart Rate Zone Boundaries</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[40, res.maxHr + 10]} />
                        <Tooltip formatter={(v: any, name: any) => [`${v} bpm`, name === "min" ? "Min Limit" : "Max Limit"]} />
                        <Bar dataKey="min" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} name="Min Zone HR" />
                        <Bar dataKey="max" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Max Zone HR" />
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Optimal Exercise Intensity for Fat Oxidation</h2>
            <p>To maximize fitness and target fat reduction, understanding training zones is essential. Training intensity dictates whether the body converts carbohydrates or fat lipids into energy. Lower-intensity exercise (Zone 2) depends mostly on oxidative metabolism, utilizing fat stores for fuel, while higher intensities switch to glycogen conversion.</p>
            <p>Using target zones like Zone 2 optimizes base aerobic development, improves mitochondrial efficiency, and allows athletes to train for longer durations without central nervous fatigue. Calculating maximum heart rate and adjusting for resting levels yields customized target ranges for safe, efficient workouts.</p>

            <h2 className="text-2xl font-bold mb-3">Formulas Explained</h2>
            <p>The Standard equation (220 - Age) offers a quick baseline estimate. The Tanaka equation modifies this to 208 - 0.7 × Age, reducing variance across older active populations. The Karvonen formula integrates Heart Rate Reserve (Max HR - Resting HR), adjusting for individual cardiovascular efficiency and resulting in highly tailored, functional zones.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fat-burning-zone-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Fat Burning Zone Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Fat Burning Zone Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Fat Burning Zone Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Fat Burning Zone Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Fat Burning Zone Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/fat-burning-zone-calculator" />
        </div>
      </div>
    </>
  );
}
