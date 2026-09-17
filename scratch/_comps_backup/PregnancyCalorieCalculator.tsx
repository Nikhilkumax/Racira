"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PregnancyInputs {
  age: number;
  heightIn: number;
  weightLb: number;
  activity: "sedentary" | "light" | "moderate" | "active";
  trimester: 1 | 2 | 3;
  multiples: 1 | 2 | 3;
}

interface PregnancyResult {
  bmr: number;
  tdee: number;
  trimesterExtra: number;
  dailyCalories: number;
  weeklyGainTarget: number;
  trimesterCalories: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const ACTIVITY_FACTORS: Record<PregnancyInputs["activity"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const TRIMESTER_EXTRA: Record<PregnancyInputs["trimester"], number> = {
  1: 0,
  2: 340,
  3: 452,
};

const MULTIPLES_EXTRA: Record<PregnancyInputs["multiples"], number> = {
  1: 0,
  2: 300,
  3: 600,
};

function calcPregnancy(inputs: PregnancyInputs): PregnancyResult {
  const weightKg = inputs.weightLb * 0.453592;
  const heightCm = inputs.heightIn * 2.54;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * inputs.age - 161;
  const tdee = bmr * ACTIVITY_FACTORS[inputs.activity];
  const trimesterExtra = TRIMESTER_EXTRA[inputs.trimester] + MULTIPLES_EXTRA[inputs.multiples];
  const dailyCalories = tdee + trimesterExtra;
  const weeklyGainTarget = inputs.trimester === 1 ? 0.5 : 1;

  const trimesterNames: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
  const trimesterCalories = ([1, 2, 3] as const).map((t) => ({
    name: trimesterNames[t],
    value: Math.round(tdee + TRIMESTER_EXTRA[t] + MULTIPLES_EXTRA[inputs.multiples]),
    fill: t === inputs.trimester ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Age", value: `${inputs.age} yrs` },
    { label: "Height", value: `${Math.floor(inputs.heightIn / 12)}'${inputs.heightIn % 12}"` },
    { label: "Pre-Pregnancy Weight", value: `${inputs.weightLb} lb (${weightKg.toFixed(1)} kg)` },
    { label: "Activity Level", value: inputs.activity },
    { label: "BMR (Mifflin-St Jeor)", value: `${bmr.toFixed(0)} kcal` },
    { label: "TDEE (Maintenance)", value: `${tdee.toFixed(0)} kcal` },
    { label: `Trimester ${inputs.trimester} Extra`, value: `+${trimesterExtra} kcal` },
    { label: "Daily Calories Needed", value: `${dailyCalories.toFixed(0)} kcal`, highlight: true },
    { label: "Weekly Gain Target (2nd/3rd)", value: `${weeklyGainTarget} lb/wk` },
    { label: "Multiples Adjustment", value: inputs.multiples > 1 ? `+${MULTIPLES_EXTRA[inputs.multiples]} kcal (${inputs.multiples} fetuses)` : "None" },
  ];

  const summaryStats = [
    { label: "Daily Calories", value: `${dailyCalories.toFixed(0)} kcal` },
    { label: "BMR", value: `${bmr.toFixed(0)} kcal` },
    { label: "TDEE (Maintenance)", value: `${tdee.toFixed(0)} kcal` },
    { label: "Trimester Extra", value: `+${trimesterExtra} kcal` },
    { label: "Activity Multiplier", value: `${ACTIVITY_FACTORS[inputs.activity].toFixed(3)}` },
    { label: "Weekly Gain Target", value: `${weeklyGainTarget} lb/wk` },
  ];

  return { bmr, tdee, trimesterExtra, dailyCalories, weeklyGainTarget, trimesterCalories, breakdown, summaryStats };
}

const DEFAULTS: PregnancyInputs = { age: 30, heightIn: 66, weightLb: 150, activity: "light", trimester: 2, multiples: 1 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">Trimester {label}</p>
    <p className="text-primary font-extrabold text-sm">{payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day</p>
  </div>
) : null;

export default function PregnancyCalorieCalculator() {
  const [age, setAge] = useState("30");
  const [heightIn, setHeightIn] = useState("66");
  const [weightLb, setWeightLb] = useState("150");
  const [activity, setActivity] = useState<PregnancyInputs["activity"]>("light");
  const [trimester, setTrimester] = useState<"1" | "2" | "3">("2");
  const [multiples, setMultiples] = useState<"1" | "2" | "3">("1");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<PregnancyResult | null>(null);

  const calculate = () =>
    setResult(calcPregnancy({
      age: parseFloat(age) || 0,
      heightIn: parseFloat(heightIn) || 0,
      weightLb: parseFloat(weightLb) || 0,
      activity,
      trimester: parseInt(trimester, 10) as 1 | 2 | 3,
      multiples: parseInt(multiples, 10) as 1 | 2 | 3,
    }));
  const reset = () => { setAge(DEFAULTS.age.toString()); setHeightIn(DEFAULTS.heightIn.toString()); setWeightLb(DEFAULTS.weightLb.toString()); setActivity(DEFAULTS.activity); setTrimester("2"); setMultiples("1"); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "How many extra calories do I need during pregnancy?", answer: "The ACOG guidelines add roughly 340 calories per day in the second trimester and 452 per day in the third, on top of your normal maintenance needs. The first trimester usually requires no extra calories. These amounts support healthy fetal growth without excessive gain." },
    { question: "How is my baseline calorie need calculated?", answer: "The calculator uses the Mifflin-St Jeor equation for basal metabolic rate — 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161 — then multiplies by an activity factor of 1.2 to 1.725. That gives your maintenance calories before pregnancy." },
    { question: "What is a healthy weight gain during pregnancy?", answer: "For a normal starting BMI (18.5–24.9), the recommended total gain is 25–35 lb: roughly 1–4.5 lb in the first trimester and about 1 lb per week in the second and third. Targets are higher for underweight and lower for overweight or obese starting BMIs." },
    { question: "Do twins change the calorie needs?", answer: "Yes. The ACOG recommends about 300 additional calories per day beyond the singleton amount for twins, with 35–54 lb of total gain recommended depending on starting BMI. This calculator adds 300 kcal per additional fetus in the second and third trimesters." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Pregnancy Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="yrs" />
              <CompactInput id="height" label="Height" value={heightIn} onChange={setHeightIn} suffix="in" />
              <CompactInput id="weight" label="Pre-Pregnancy Weight" value={weightLb} onChange={setWeightLb} suffix="lb" />
            </div>
            <div>
              <label htmlFor="activity" className="text-sm font-medium text-foreground mb-1 block">Activity Level</label>
              <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value as PregnancyInputs["activity"])} className="w-full h-10 px-3 text-base border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                <option value="sedentary">Sedentary (little exercise)</option>
                <option value="light">Lightly Active (1–3 days/week)</option>
                <option value="moderate">Moderately Active (3–5 days/week)</option>
                <option value="active">Very Active (6–7 days/week)</option>
              </select>
            </div>
            <div>
              <label htmlFor="trimester" className="text-sm font-medium text-foreground mb-1 block">Current Trimester</label>
              <select id="trimester" value={trimester} onChange={(e) => setTrimester(e.target.value as "1" | "2" | "3")} className="w-full h-10 px-3 text-base border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                <option value="1">First Trimester</option>
                <option value="2">Second Trimester</option>
                <option value="3">Third Trimester</option>
              </select>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Multiple Pregnancy</label>
                    <select value={multiples} onChange={(e) => setMultiples(e.target.value as "1" | "2" | "3")} className="w-full h-10 px-3 text-base border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="1">Singleton</option>
                      <option value="2">Twins (+300 kcal)</option>
                      <option value="3">Triplets (+600 kcal)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Daily Calories — Trimester {trimester}</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{result.dailyCalories.toFixed(0)} kcal</div>
                <div className="text-sm text-muted-foreground font-medium">{result.tdee.toFixed(0)} kcal maintenance + {result.trimesterExtra} kcal pregnancy extra</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["BMR", `${result.bmr.toFixed(0)} kcal`], ["TDEE (Maintenance)", `${result.tdee.toFixed(0)} kcal`], ["Trimester Extra", `+${result.trimesterExtra} kcal`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calories Across Trimesters</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.trimesterCalories} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Highlighted bar: your current trimester. Values assume the same activity level throughout.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Calories for Two — With Precision</h2>
            <p>Pregnancy raises energy needs, but not by a flat amount. Your baseline is set by your age, height, pre-pregnancy weight, and activity; pregnancy adds a defined increment per trimester. This <strong>pregnancy calorie calculator</strong> uses the Mifflin-St Jeor equation with the ACOG trimester guidelines to produce a daily target you can actually use.</p>
            <h2 className="text-2xl font-bold mb-3">The ACOG Trimester Increments</h2>
            <p>The American College of Obstetricians and Gynecologists recommends no extra calories in the first trimester, about +340 per day in the second, and +452 per day in the third for a singleton pregnancy. Multiples add roughly 300 more per day per additional fetus. These numbers support the recommended 25–35 lb total gain for a normal starting BMI.</p>
            <h2 className="text-2xl font-bold mb-3">Guidance, Not a Prescription</h2>
            <p>Energy needs vary with body composition, medical conditions, and activity changes during pregnancy. Treat the calculator's number as a starting point and let your obstetric provider adjust it — especially if you are underweight, overweight, carrying multiples, or managing conditions like gestational diabetes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-calorie-calculator" />
          <PopularCalculators exclude="/calculator/pregnancy-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
