"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Bone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type StageKey = "neutered" | "intact" | "weightLoss" | "active" | "puppy" | "senior";

interface DogCalorieResult {
  weightKg: number;
  rer: number;
  stage: StageKey;
  multiplier: number;
  mer: number;
  cups: number;
  kcalPerCup: number;
  chartData: { name: string; value: number }[];
}

const STAGES: Record<StageKey, { label: string; multiplier: number }> = {
  neutered: { label: "Neutered / spayed adult", multiplier: 1.6 },
  intact: { label: "Intact adult", multiplier: 1.8 },
  weightLoss: { label: "Weight loss", multiplier: 1.0 },
  active: { label: "Active / working dog", multiplier: 2.0 },
  puppy: { label: "Puppy (under 1 year)", multiplier: 2.0 },
  senior: { label: "Senior / inactive", multiplier: 1.4 },
};

function calcDogCalories(weightLb: number, stage: StageKey, kcalPerCup: number): DogCalorieResult {
  const weightKg = weightLb / 2.20462;
  const rer = 70 * Math.pow(weightKg, 0.75);
  const multiplier = STAGES[stage].multiplier;
  const mer = rer * multiplier;
  const cups = kcalPerCup > 0 ? mer / kcalPerCup : 0;
  const chartData = [
    { name: "RER (rest)", value: rer },
    { name: "MER (maintenance)", value: mer },
  ];
  return { weightKg, rer, stage, multiplier, mer, cups, kcalPerCup, chartData };
}

const DEFAULTS = { weight: "30", stage: "neutered" as StageKey, kcal: "350" };

const faqs = [
  { question: "What is RER and how is it calculated?", answer: "Resting Energy Requirement is the calories a dog burns at rest: RER = 70 × (weight in kg)^0.75. It is the standard veterinary baseline before adjusting for life stage." },
  { question: "What is the difference between RER and MER?", answer: "Maintenance Energy Requirement (MER) multiplies RER by a life-stage factor: 1.6 for neutered adults, 1.8 intact, 2.0 for puppies and active dogs, 1.0 for weight loss. Feed to MER, not RER." },
  { question: "How accurate is the cup estimate?", answer: "Cups = MER ÷ kcal per cup of food, using the calorie density printed on the bag (typically 300–400 kcal/cup). Kibble density varies by brand — check the label and adjust." },
];

export default function DogCalorieCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [stage, setStage] = useState<StageKey>(DEFAULTS.stage);
  const [kcal, setKcal] = useState(DEFAULTS.kcal);
  const [result, setResult] = useState<DogCalorieResult>(() => calcDogCalories(30, "neutered", 350));

  useEffect(() => {
    const w = parseFloat(weight);
    const k = parseFloat(kcal);
    if (!isNaN(w) && !isNaN(k) && w > 0 && k > 0) setResult(calcDogCalories(w, stage, k));
  }, []);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const k = parseFloat(kcal);
    if (!isNaN(w) && !isNaN(k) && w > 0 && k > 0) setResult(calcDogCalories(w, stage, k));
  };
  const reset = () => { setWeight(DEFAULTS.weight); setStage(DEFAULTS.stage); setKcal(DEFAULTS.kcal); setResult(calcDogCalories(30, "neutered", 350)); };
  const invalid = isNaN(parseFloat(weight)) || isNaN(parseFloat(kcal)) || parseFloat(weight) <= 0 || parseFloat(kcal) <= 0;

  const breakdown = [
    { label: "Body Weight", value: `${result.weightKg.toFixed(1)} kg (${(result.weightKg * 2.20462).toFixed(0)} lb)` },
    { label: "Life Stage", value: `${STAGES[result.stage].label} (×${result.multiplier})` },
    { label: "RER — Resting Energy", value: `${result.rer.toFixed(0)} kcal/day` },
    { label: "MER — Maintenance Energy", value: `${result.mer.toFixed(0)} kcal/day`, highlight: true },
    { label: "Food Density", value: `${result.kcalPerCup.toFixed(0)} kcal/cup` },
    { label: "Food per Day", value: `${result.cups.toFixed(2)} cups` },
    { label: "Food per Week", value: `${(result.cups * 7).toFixed(1)} cups` },
  ];

  const summaryStats = [
    { label: "MER", value: `${result.mer.toFixed(0)} kcal/day` },
    { label: "RER", value: `${result.rer.toFixed(0)} kcal/day` },
    { label: "Cups per Day", value: `${result.cups.toFixed(2)}` },
    { label: "Cups per Week", value: `${(result.cups * 7).toFixed(1)}` },
    { label: "Multiplier", value: `×${result.multiplier}` },
    { label: "Weight", value: `${result.weightKg.toFixed(1)} kg` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dog Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dogc-w" className="block text-sm font-medium mb-1 text-foreground">Dog Weight (lb)</label>
              <input id="dogc-w" type="number" min="1" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="dogc-stage" className="block text-sm font-medium mb-1 text-foreground">Life Stage</label>
              <select id="dogc-stage" value={stage} onChange={(e) => setStage(e.target.value as StageKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(STAGES).map(([key, s]) => <option key={key} value={key}>{s.label} (×{s.multiplier})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dogc-kcal" className="block text-sm font-medium mb-1 text-foreground">Food Density (kcal per cup)</label>
              <input id="dogc-kcal" type="number" min="1" step="10" value={kcal} onChange={(e) => setKcal(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Check the bag label — typically 300–400 kcal/cup</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Bone className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive weight and calorie density.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Daily Calorie Needs (MER)</div>
              <div className="text-4xl font-extrabold text-primary">{result.mer.toFixed(0)} kcal/day</div>
              <div className="text-sm text-muted-foreground mt-1">{result.cups.toFixed(2)} cups of food · RER {result.rer.toFixed(0)} × {result.multiplier}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">RER (Rest)</div>
                <div className="text-lg font-bold text-primary">{result.rer.toFixed(0)} kcal</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cups / Day</div>
                <div className="text-lg font-bold text-primary">{result.cups.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cups / Week</div>
                <div className="text-lg font-bold text-primary">{(result.cups * 7).toFixed(1)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Resting vs Maintenance Energy</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(0)} kcal/day`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Dog Calorie Calculator</h2>
            <p>Veterinary nutrition starts from the Resting Energy Requirement: RER = 70 × (body weight in kg)^0.75. The exponent means calories scale sub-linearly with weight — a 30 lb dog needs about 420 kcal at rest, not double a 15 lb dog's needs.</p>
            <h3>Adjusting for Life Stage</h3>
            <p>MER multiplies RER by activity and life-stage factors: neutered adults 1.6, intact 1.8, puppies and working dogs 2.0, weight-loss plans 1.0. These are starting points — monitor body condition monthly and adjust portion sizes by 10% as needed.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-calorie-calculator" />
          <PopularCalculators exclude="/calculator/dog-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
