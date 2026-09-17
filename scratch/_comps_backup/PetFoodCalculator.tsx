"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PetFoodInputs {
  petType: string;   // "dog" | "cat"
  weight: number;    // lb
  foodType: string;  // "dry" | "wet"
  pricePerLb: number; // $/lb
  activity: string;  // "low" | "moderate" | "high"
  lifeStage: string; // "adult" | "growing" | "senior"
}

interface PetFoodResults {
  dailyKcal: number;
  dailyCups: number;
  dailyOz: number;
  monthlyLb: number;
  monthlyCost: number;
  chartData: { name: string; cups: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const KCAL_PER_CUP: Record<string, number> = { dog: 375, cat: 300 };
const CUPS_PER_LB: Record<string, number> = { dog: 4, cat: 4.5 };
const ACTIVITY_FACTOR: Record<string, { label: string; factor: number }> = {
  low: { label: "Low", factor: 1.4 },
  moderate: { label: "Moderate", factor: 1.6 },
  high: { label: "High", factor: 2.0 },
};
const CAT_ACTIVITY_FACTOR: Record<string, { label: string; factor: number }> = {
  low: { label: "Low", factor: 1.1 },
  moderate: { label: "Moderate", factor: 1.2 },
  high: { label: "High", factor: 1.4 },
};
const LIFE_STAGE_FACTOR: Record<string, { label: string; factor: number }> = {
  adult: { label: "Adult", factor: 1.0 },
  growing: { label: "Puppy / Kitten", factor: 2.0 },
  senior: { label: "Senior", factor: 0.9 },
};

function calcPetFood(i: PetFoodInputs): PetFoodResults {
  const kg = i.weight * 0.453592;
  const rer = 70 * Math.pow(kg, 0.75);
  const act = i.petType === "cat" ? CAT_ACTIVITY_FACTOR[i.activity] : ACTIVITY_FACTOR[i.activity];
  const stage = LIFE_STAGE_FACTOR[i.lifeStage];
  const dailyKcal = rer * (act?.factor ?? 1.6) * (stage?.factor ?? 1.0);
  const kcalPerCup = KCAL_PER_CUP[i.petType] ?? 375;
  const dailyCups = dailyKcal / kcalPerCup;
  const dailyOz = i.foodType === "dry" ? (dailyCups / (CUPS_PER_LB[i.petType] ?? 4)) * 16 : dailyKcal / 25;
  const monthlyLb = (dailyCups * 30) / (CUPS_PER_LB[i.petType] ?? 4);
  const monthlyCost = monthlyLb * i.pricePerLb;

  const chartData = [
    { name: "Low", cups: +((rer * (i.petType === "cat" ? CAT_ACTIVITY_FACTOR.low.factor : ACTIVITY_FACTOR.low.factor) * (stage?.factor ?? 1)) / kcalPerCup).toFixed(2), selected: i.activity === "low" },
    { name: "Moderate", cups: +((rer * (i.petType === "cat" ? CAT_ACTIVITY_FACTOR.moderate.factor : ACTIVITY_FACTOR.moderate.factor) * (stage?.factor ?? 1)) / kcalPerCup).toFixed(2), selected: i.activity === "moderate" },
    { name: "High", cups: +((rer * (i.petType === "cat" ? CAT_ACTIVITY_FACTOR.high.factor : ACTIVITY_FACTOR.high.factor) * (stage?.factor ?? 1)) / kcalPerCup).toFixed(2), selected: i.activity === "high" },
  ];

  const breakdown = [
    { label: "Pet", value: `${i.petType === "dog" ? "Dog" : "Cat"} · ${i.weight} lb` },
    { label: "Resting Energy (RER)", value: `${rer.toFixed(0)} kcal/day` },
    { label: `Activity (${act?.label})`, value: `${act?.factor.toFixed(1)}×` },
    { label: `Life Stage (${stage?.label})`, value: `${stage?.factor.toFixed(1)}×` },
    { label: "Daily Energy Need", value: `${dailyKcal.toFixed(0)} kcal` },
    { label: `Daily Food (${i.foodType === "dry" ? "dry" : "wet"})`, value: `${i.foodType === "dry" ? `${dailyCups.toFixed(2)} cups` : `${dailyOz.toFixed(1)} oz`}`, highlight: true, isTotal: true },
    { label: "Monthly Food", value: `${monthlyLb.toFixed(1)} lb` },
    { label: `Monthly Cost ($${i.pricePerLb.toFixed(2)}/lb)`, value: `$${monthlyCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Daily Food", value: i.foodType === "dry" ? `${dailyCups.toFixed(2)} cups` : `${dailyOz.toFixed(1)} oz` },
    { label: "Daily Calories", value: `${dailyKcal.toFixed(0)} kcal` },
    { label: "Monthly Food", value: `${monthlyLb.toFixed(1)} lb` },
    { label: "Monthly Cost", value: `$${monthlyCost.toFixed(2)}` },
    { label: "Resting Energy", value: `${rer.toFixed(0)} kcal` },
    { label: "Activity", value: act?.label ?? "—" },
    { label: "Life Stage", value: stage?.label ?? "—" },
    { label: "Price per Pound", value: `$${i.pricePerLb.toFixed(2)}` },
  ];

  return { dailyKcal, dailyCups, dailyOz, monthlyLb, monthlyCost, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  petType: "dog",
  weight: "40",
  foodType: "dry",
  pricePerLb: "3.00",
  activity: "moderate",
  lifeStage: "adult",
};

// 4. Component
export default function PetFoodCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PetFoodResults>(() => calcPetFood({ petType: "dog", weight: 40, foodType: "dry", pricePerLb: 3, activity: "moderate", lifeStage: "adult" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPetFood({ petType: "dog", weight: 40, foodType: "dry", pricePerLb: 3, activity: "moderate", lifeStage: "adult" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const selectPet = (p: string) => setInputs((s) => ({ ...s, petType: p, weight: p === "cat" ? "10" : "40" }));

  const calculate = () =>
    setResult(
      calcPetFood({
        petType: inputs.petType,
        weight: parseFloat(inputs.weight) || 0,
        foodType: inputs.foodType,
        pricePerLb: parseFloat(inputs.pricePerLb) || 0,
        activity: inputs.activity,
        lifeStage: inputs.lifeStage,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPetFood({ petType: "dog", weight: 40, foodType: "dry", pricePerLb: 3, activity: "moderate", lifeStage: "adult" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const weight = parseFloat(inputs.weight) || 0;
  const pricePerLb = parseFloat(inputs.pricePerLb) || 0;
  if (weight < 2 || weight > 200) errors.weight = "Must be 2–200 lb";
  if (pricePerLb <= 0) errors.pricePerLb = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much food should I feed my dog?", answer: "Use the veterinary standard: resting energy requirement (RER = 70 × kg^0.75) scaled by activity — about 1.4× for low, 1.6× for moderate, 2.0× for active dogs. A 40 lb moderately active dog needs about 988 kcal/day, roughly 2.6 cups of dry food. Adjust by body condition: visible ribs mean more, a hidden waist means less." },
    { question: "How much should I feed my cat?", answer: "Cats need RER × 1.2 (moderate) — about 261 kcal/day for a 10 lb cat, roughly 0.87 cups of dry food or 3.7 oz of wet. Indoor neutered cats trend toward the low end; kittens need 2× adult energy during growth. Cats are prone to obesity, so measuring every portion is the single best habit." },
    { question: "What is RER and why does it matter?", answer: "RER — resting energy requirement — is the calories a pet burns at rest: 70 × (body weight in kg)^0.75. It's the industry-standard starting point for feeding because it scales with metabolic mass, not just pounds. Activity and life stage multipliers then adjust it to real life. This is the same formula veterinarians use for nutrition plans." },
    { question: "How much does pet food cost per month?", answer: "A 40 lb dog on mid-priced dry food eats about 20 lb a month — roughly $60 at $3/lb. Cats are cheaper: a 10 lb cat eats about 6 lb monthly, around $18. Premium foods cost 2–3× per pound but often have higher calorie density, so cost per day rises less than the bag price suggests." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pets", href: "/calculator#pets" }, { label: "Pet Food Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pet Food Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="petType" className={lbl}>Pet Type</label>
                <select id="petType" value={inputs.petType} onChange={(e) => selectPet(e.target.value)} className={sel}>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
              </div>
              <div>
                <label htmlFor="weight" className={lbl}>Pet Weight</label>
                <div className={inp}>
                  <input id="weight" type="number" min="2" max="200" step="1" value={inputs.weight} onChange={(e) => set("weight")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
                {errors.weight && <p className="text-xs text-red-500 font-medium mt-1">{errors.weight}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="foodType" className={lbl}>Food Type</label>
                <select id="foodType" value={inputs.foodType} onChange={(e) => set("foodType")(e.target.value)} className={sel}>
                  <option value="dry">Dry (kibble)</option>
                  <option value="wet">Wet (canned)</option>
                </select>
              </div>
              <div>
                <label htmlFor="pricePerLb" className={lbl}>Food Price</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="pricePerLb" type="number" min="0.5" step="0.25" value={inputs.pricePerLb} onChange={(e) => set("pricePerLb")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/lb</span>
                </div>
                {errors.pricePerLb && <p className="text-xs text-red-500 font-medium mt-1">{errors.pricePerLb}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Activity & Life Stage</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="activity" className={lbl}>Activity Level</label>
                        <select id="activity" value={inputs.activity} onChange={(e) => set("activity")(e.target.value)} className={sel}>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="lifeStage" className={lbl}>Life Stage</label>
                        <select id="lifeStage" value={inputs.lifeStage} onChange={(e) => set("lifeStage")(e.target.value)} className={sel}>
                          <option value="adult">Adult</option>
                          <option value="growing">Puppy / Kitten</option>
                          <option value="senior">Senior</option>
                        </select>
                      </div>
                    </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Daily Food</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">
                {inputs.foodType === "dry" ? `${result.dailyCups.toFixed(2)} cups` : `${result.dailyOz.toFixed(1)} oz`}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.dailyKcal.toFixed(0)} kcal/day · ${result.monthlyCost.toFixed(2)}/month · {result.monthlyLb.toFixed(1)} lb/mo
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Daily Calories", `${result.dailyKcal.toFixed(0)} kcal`],
                ["Monthly Food", `${result.monthlyLb.toFixed(1)} lb`],
                ["Monthly Cost", `$${result.monthlyCost.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Feeding Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
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
              <h3 className="text-base font-bold mb-4">Daily Food by Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} cups`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="cups" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Activity swings daily intake by 40%+ — match portions to the pet's real lifestyle, not the bag's generic guide.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
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
            <h2 className="text-2xl font-bold mb-3">The Veterinary Formula Behind Feeding</h2>
            <p>Pet nutrition starts from resting energy requirement: RER = 70 × (weight in kg)^0.75. This is the same formula veterinarians use, and it exists because calorie need scales with metabolic mass, not pounds — a 10 lb cat needs proportionally more than a 100 lb dog. Activity (1.4–2.0× for dogs, 1.1–1.4× for cats) and life stage (2× for growing animals, 0.9× for seniors) then adjust the baseline.</p>
            <h2 className="text-2xl font-bold mb-3">Calories, Not Cups</h2>
            <p>Feeding guides on bags assume a generic pet, but calorie density varies widely: dry dog food runs 350–450 kcal per cup, wet food is far lower per ounce because of water content. The calculator converts your pet's true calorie need into cups or ounces using standard calorie densities — the honest way to compare two different foods is calories, not portion size.</p>
            <h2 className="text-2xl font-bold mb-3">Budget the Bag</h2>
            <p>Monthly food cost is monthly pounds × price per pound: about 20 lb and $60 for a 40 lb dog on mid-priced food, 6 lb and $18 for a 10 lb cat. Premium foods cost more per pound but are calorie-dense, so the cost per day climbs less than the sticker suggests. The calculator's price field makes any bag comparable on monthly dollars.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pet-food-calculator" />
          <PopularCalculators exclude="/calculator/pet-food-calculator" />
        </div>
      </div>
    </>
  );
}
