"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RecipeInputs {
  origServings: number;
  newServings: number;
  ingA: number;
  ingB: number;
  ingC: number;
  ingD: number;
}

interface RecipeResults {
  scale: number;
  aScaled: number;
  bScaled: number;
  cScaled: number;
  dScaled: number;
  chartData: { name: string; original: number; scaled: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcRecipe(i: RecipeInputs): RecipeResults {
  const scale = i.origServings > 0 ? i.newServings / i.origServings : 1;
  const aScaled = i.ingA * scale;
  const bScaled = i.ingB * scale;
  const cScaled = i.ingC * scale;
  const dScaled = i.ingD * scale;

  const chartData = [
    { name: "Flour", original: i.ingA, scaled: +aScaled.toFixed(2) },
    { name: "Sugar", original: i.ingB, scaled: +bScaled.toFixed(2) },
    { name: "Butter", original: i.ingC, scaled: +cScaled.toFixed(2) },
    { name: "Milk", original: i.ingD, scaled: +dScaled.toFixed(2) },
  ];

  const breakdown = [
    { label: `Servings (${i.origServings} → ${i.newServings})`, value: `${scale.toFixed(2)}×`, highlight: true, isTotal: true },
    { label: "Flour", value: `${i.ingA} → ${aScaled.toFixed(2)} cups` },
    { label: "Sugar", value: `${i.ingB} → ${bScaled.toFixed(2)} cups` },
    { label: "Butter", value: `${i.ingC} → ${cScaled.toFixed(2)} cups` },
    { label: "Milk", value: `${i.ingD} → ${dScaled.toFixed(2)} cups` },
    { label: "Scale Factor", value: `${scale.toFixed(2)}×` },
    { label: "New Serving Count", value: `${i.newServings}` },
  ];

  const summaryStats = [
    { label: "Scale Factor", value: `${scale.toFixed(2)}×` },
    { label: "Original Servings", value: `${i.origServings}` },
    { label: "New Servings", value: `${i.newServings}` },
    { label: "Flour (scaled)", value: `${aScaled.toFixed(2)} cups` },
    { label: "Sugar (scaled)", value: `${bScaled.toFixed(2)} cups` },
    { label: "Butter (scaled)", value: `${cScaled.toFixed(2)} cups` },
    { label: "Milk (scaled)", value: `${dScaled.toFixed(2)} cups` },
    { label: "Adjustment", value: scale < 1 ? "Reduce" : scale > 1 ? "Increase" : "No change" },
  ];

  return { scale, aScaled, bScaled, cScaled, dScaled, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  origServings: "4",
  newServings: "6",
  ingA: "2",
  ingB: "1",
  ingC: "0.5",
  ingD: "1",
};

// 4. Component
export default function RecipeScaleCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RecipeResults>(() => calcRecipe({ origServings: 4, newServings: 6, ingA: 2, ingB: 1, ingC: 0.5, ingD: 1 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcRecipe({ origServings: 4, newServings: 6, ingA: 2, ingB: 1, ingC: 0.5, ingD: 1 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcRecipe({
        origServings: parseFloat(inputs.origServings) || 0,
        newServings: parseFloat(inputs.newServings) || 0,
        ingA: parseFloat(inputs.ingA) || 0,
        ingB: parseFloat(inputs.ingB) || 0,
        ingC: parseFloat(inputs.ingC) || 0,
        ingD: parseFloat(inputs.ingD) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRecipe({ origServings: 4, newServings: 6, ingA: 2, ingB: 1, ingC: 0.5, ingD: 1 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const origServings = parseFloat(inputs.origServings) || 0;
  const newServings = parseFloat(inputs.newServings) || 0;
  if (origServings <= 0) errors.origServings = "Must be greater than 0";
  if (newServings <= 0) errors.newServings = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I scale a recipe?", answer: "Divide the desired servings by the original servings to get a scale factor, then multiply every ingredient by it. Scaling a 4-serving recipe to 6 servings means a 1.5× factor: 2 cups of flour becomes 3 cups. The calculator scales all entered ingredients at once — no arithmetic per ingredient." },
    { question: "Does baking scale linearly?", answer: "Quantities scale linearly, but time and pan size don't. A doubled cake batter needs a larger pan and often cooks only slightly longer — the center of a thick batter takes disproportionately long. For baking, scale ingredients by the factor but expect to check doneness early and often rather than doubling the timer." },
    { question: "What about eggs when scaling?", answer: "Eggs are the rounding problem: scaling 2 eggs by 1.5 gives 3 (clean), but 3 eggs by 1.33 gives 4 (fine), while 1 egg by 1.5 needs half an egg. Beat the egg and measure half by volume, or round to the nearest whole egg and adjust liquid slightly — a half-egg is roughly 2 tablespoons of beaten egg." },
    { question: "Should I scale spices and salt linearly?", answer: "Yes for most ingredients, but salt is the exception — it seasons by concentration, and scaling errors compound. Start with the linearly scaled amount but season to taste at the end; spices can also be added in stages. For subtle seasonings, err slightly under and adjust." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Recipe Scale Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Recipe Scale Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="origServings" className={lbl}>Original Servings</label>
                <div className={inp}>
                  <input id="origServings" type="number" min="1" max="50" value={inputs.origServings} onChange={(e) => set("origServings")(e.target.value)} className={ci} />
                </div>
                {errors.origServings && <p className="text-xs text-red-500 font-medium mt-1">{errors.origServings}</p>}
              </div>
              <div>
                <label htmlFor="newServings" className={lbl}>Desired Servings</label>
                <div className={inp}>
                  <input id="newServings" type="number" min="1" max="200" value={inputs.newServings} onChange={(e) => set("newServings")(e.target.value)} className={ci} />
                </div>
                {errors.newServings && <p className="text-xs text-red-500 font-medium mt-1">{errors.newServings}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ingA" className={lbl}>Flour (cups)</label>
                <div className={inp}>
                  <input id="ingA" type="number" min="0" step="0.25" value={inputs.ingA} onChange={(e) => set("ingA")(e.target.value)} className={ci} />
                </div>
              </div>
              <div>
                <label htmlFor="ingB" className={lbl}>Sugar (cups)</label>
                <div className={inp}>
                  <input id="ingB" type="number" min="0" step="0.25" value={inputs.ingB} onChange={(e) => set("ingB")(e.target.value)} className={ci} />
                </div>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">More Ingredients</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="ingC" className={lbl}>Butter (cups)</label>
                        <div className={inp}>
                          <input id="ingC" type="number" min="0" step="0.25" value={inputs.ingC} onChange={(e) => set("ingC")(e.target.value)} className={ci} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="ingD" className={lbl}>Milk (cups)</label>
                        <div className={inp}>
                          <input id="ingD" type="number" min="0" step="0.25" value={inputs.ingD} onChange={(e) => set("ingD")(e.target.value)} className={ci} />
                        </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Scale Factor</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.scale.toFixed(2)}<span className="text-2xl">×</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {inputs.origServings} servings → {inputs.newServings} servings · every ingredient below is multiplied by {result.scale.toFixed(2)}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Original", `${parseFloat(inputs.origServings)} servings`],
                ["Scaled To", `${parseFloat(inputs.newServings)} servings`],
                ["Flour →", `${result.aScaled.toFixed(2)} cups`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Ingredient Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Original vs Scaled</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="original" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scaled" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Every ingredient scales by the same factor — light bars are original, dark bars are scaled.</p>
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
            <h2 className="text-2xl font-bold mb-3">One Factor, Every Ingredient</h2>
            <p>Recipe scaling is a single division: desired servings ÷ original servings, then multiply every ingredient by that factor. A recipe for 4 scaled to 6 gets a 1.5× factor — every ingredient grows by half. The calculator applies it across all entered ingredients instantly, so the only arithmetic left is yours in the kitchen.</p>
            <h2 className="text-2xl font-bold mb-3">Volume Ingredients Scale Cleanly</h2>
            <p>Cups, tablespoons, and grams all scale linearly — that's the easy part. The subtlety lives in eggs (beaten half-eggs), salt (season to taste), and baking times (never linear). The calculator handles the deterministic quantities; the cook's judgment handles the rest. When scaling down, note that small quantities like a quarter teaspoon are hard to halve — measure by volume instead.</p>
            <h2 className="text-2xl font-bold mb-3">Scale Down With the Same Rules</h2>
            <p>Halving a recipe works by the same factor — 0.5× — but rounding matters more: a half-teaspoon of salt rounds up in practice, and a single egg can't be quartered. When shrinking recipes, keep the pan size proportional (a 9×13 pan for the original becomes an 8×8 for the half) or the thinner batter will bake faster than the factor suggests.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/recipe-scale-calculator" />
          <PopularCalculators exclude="/calculator/recipe-scale-calculator" />
        </div>
      </div>
    </>
  );
}
