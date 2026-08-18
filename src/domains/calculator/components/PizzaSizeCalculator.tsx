"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PizzaInputs {
  dia1: number;
  price1: number;
  dia2: number;
  price2: number;
  crust: number; // inches of crust width removed from edible radius
}

interface PizzaResults {
  area1: number;
  area2: number;
  edible1: number;
  edible2: number;
  ppsi1: number;
  ppsi2: number;
  better: 1 | 2;
  savingsPct: number;
  sizeRatio: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcPizza(i: PizzaInputs): PizzaResults {
  const area1 = Math.PI * Math.pow(i.dia1 / 2, 2);
  const area2 = Math.PI * Math.pow(i.dia2 / 2, 2);
  const edible1 = Math.PI * Math.pow(Math.max(0, i.dia1 / 2 - i.crust), 2);
  const edible2 = Math.PI * Math.pow(Math.max(0, i.dia2 / 2 - i.crust), 2);
  const ppsi1 = i.price1 > 0 ? i.price1 / edible1 : 0;
  const ppsi2 = i.price2 > 0 ? i.price2 / edible2 : 0;
  let better: 1 | 2 = 1;
  if (ppsi2 < ppsi1) better = 2;
  const cheaper = Math.min(ppsi1, ppsi2);
  const dearer = Math.max(ppsi1, ppsi2);
  const savingsPct = dearer > 0 ? ((dearer - cheaper) / dearer) * 100 : 0;
  const sizeRatio = area2 / area1;

  const chartData = [
    { name: `Pizza 1 (${i.dia1}")`, value: Math.round(edible1) },
    { name: `Pizza 2 (${i.dia2}")`, value: Math.round(edible2) },
  ];

  const breakdown = [
    { label: "Better Deal", value: `Pizza ${better}`, highlight: true, isTotal: true },
    { label: "Diameter", value: `${i.dia1}" vs ${i.dia2}"` },
    { label: "Total Area (πr²)", value: `${area1.toFixed(1)} vs ${area2.toFixed(1)} in²` },
    { label: `Edible Area (${i.crust}" crust)`, value: `${edible1.toFixed(1)} vs ${edible2.toFixed(1)} in²` },
    { label: "Price", value: `$${i.price1.toFixed(2)} vs $${i.price2.toFixed(2)}` },
    { label: "Price per Edible in²", value: `$${ppsi1.toFixed(3)} vs $${ppsi2.toFixed(3)}` },
    { label: "Size Ratio (2 ÷ 1)", value: `${sizeRatio.toFixed(2)}×` },
    { label: "Savings on Winner", value: `${savingsPct.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Pizza 1 Cost per in²", value: `$${ppsi1.toFixed(3)}` },
    { label: "Pizza 2 Cost per in²", value: `$${ppsi2.toFixed(3)}` },
    { label: "Pizza 1 Edible Area", value: `${edible1.toFixed(1)} in²` },
    { label: "Pizza 2 Edible Area", value: `${edible2.toFixed(1)} in²` },
    { label: "Total Area", value: `${(area1 + area2).toFixed(1)} in²` },
    { label: "Area Ratio (2 ÷ 1)", value: `${sizeRatio.toFixed(2)}×` },
    { label: "Savings on Winner", value: `${savingsPct.toFixed(1)}%` },
    { label: "Best Value", value: `Pizza ${better}` },
  ];

  return { area1, area2, edible1, edible2, ppsi1, ppsi2, better, savingsPct, sizeRatio, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  dia1: "10",
  price1: "12",
  dia2: "14",
  price2: "18",
  crust: "0.5",
};

const COLORS = ["#2563eb", "#f59e0b"];

// 4. Component
export default function PizzaSizeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PizzaResults>(() => calcPizza({ dia1: 10, price1: 12, dia2: 14, price2: 18, crust: 0.5 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPizza({ dia1: 10, price1: 12, dia2: 14, price2: 18, crust: 0.5 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcPizza({
        dia1: parseFloat(inputs.dia1) || 0,
        price1: parseFloat(inputs.price1) || 0,
        dia2: parseFloat(inputs.dia2) || 0,
        price2: parseFloat(inputs.price2) || 0,
        crust: parseFloat(inputs.crust) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPizza({ dia1: 10, price1: 12, dia2: 14, price2: 18, crust: 0.5 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const dia1 = parseFloat(inputs.dia1) || 0;
  const dia2 = parseFloat(inputs.dia2) || 0;
  const price1 = parseFloat(inputs.price1) || 0;
  const price2 = parseFloat(inputs.price2) || 0;
  const crust = parseFloat(inputs.crust) || 0;
  if (dia1 < 4 || dia1 > 40) errors.dia1 = "Must be 4–40 in";
  if (dia2 < 4 || dia2 > 40) errors.dia2 = "Must be 4–40 in";
  if (price1 <= 0) errors.price1 = "Must be greater than 0";
  if (price2 <= 0) errors.price2 = "Must be greater than 0";
  if (crust < 0 || crust > 5) errors.crust = "Must be 0–5 in";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "Why is a 14-inch pizza so much more than a 10-inch?", answer: "Area grows with the square of the radius: a 14\" pizza is π × 7² = 153.9 in², while a 10\" is π × 5² = 78.5 in². That's 96% more food — nearly double — for typically only 50% more money. Diameter increases deceive; area is what fills you up." },
    { question: "How do I compare two different pizzas?", answer: "Divide each price by its area (or edible area, after subtracting the crust) to get dollars per square inch. The pizza with the lower $/in² is the better value. In the defaults, the 14\" at $18 costs $0.12/in² vs $0.16/in² for the 10\" at $12 — about 24% cheaper per bite." },
    { question: "Does crust thickness change the comparison?", answer: "Yes — a thick crust eats into the cheese-and-topping zone. This calculator lets you subtract a crust ring (0.5–1 in typical) and compares price per edible square inch, which rewards the pizza with more actual topping per dollar." },
    { question: "Is the biggest pizza always the best deal?", answer: "Usually, but not always. A small pizza with a deep discount, or a large pizza priced at a premium, can flip the math. Always compute price per square inch — the calculator does it for both total and edible area so you can see both views." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Pizza Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pizza Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Pizza 1</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dia1" className={lbl}>Diameter</label>
                  <div className={inp}>
                    <input id="dia1" type="number" min="4" max="40" value={inputs.dia1} onChange={(e) => set("dia1")(e.target.value)} className={ci} />
                    <span className="pr-3 text-muted-foreground text-sm">in</span>
                  </div>
                  {errors.dia1 && <p className="text-xs text-red-500 font-medium mt-1">{errors.dia1}</p>}
                </div>
                <div>
                  <label htmlFor="price1" className={lbl}>Price</label>
                  <div className={inp}>
                    <span className="pl-3 text-muted-foreground text-sm">$</span>
                    <input id="price1" type="number" min="1" step="0.5" value={inputs.price1} onChange={(e) => set("price1")(e.target.value)} className={ci} />
                  </div>
                  {errors.price1 && <p className="text-xs text-red-500 font-medium mt-1">{errors.price1}</p>}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Pizza 2</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dia2" className={lbl}>Diameter</label>
                  <div className={inp}>
                    <input id="dia2" type="number" min="4" max="40" value={inputs.dia2} onChange={(e) => set("dia2")(e.target.value)} className={ci} />
                    <span className="pr-3 text-muted-foreground text-sm">in</span>
                  </div>
                  {errors.dia2 && <p className="text-xs text-red-500 font-medium mt-1">{errors.dia2}</p>}
                </div>
                <div>
                  <label htmlFor="price2" className={lbl}>Price</label>
                  <div className={inp}>
                    <span className="pl-3 text-muted-foreground text-sm">$</span>
                    <input id="price2" type="number" min="1" step="0.5" value={inputs.price2} onChange={(e) => set("price2")(e.target.value)} className={ci} />
                  </div>
                  {errors.price2 && <p className="text-xs text-red-500 font-medium mt-1">{errors.price2}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Crust & Comparison</div>
                    <div>
                      <label htmlFor="crust" className={lbl}>Crust Width (subtracted from radius)</label>
                      <div className={inp}>
                        <input id="crust" type="number" min="0" max="5" step="0.25" value={inputs.crust} onChange={(e) => set("crust")(e.target.value)} className={ci} />
                        <span className="pr-3 text-muted-foreground text-sm">in</span>
                      </div>
                      {errors.crust && <p className="text-xs text-red-500 font-medium mt-1">{errors.crust}</p>}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Better Deal</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">Pizza {result.better}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.savingsPct.toFixed(1)}% cheaper per in² — ${Math.min(result.ppsi1, result.ppsi2).toFixed(3)}/in² vs ${Math.max(result.ppsi1, result.ppsi2).toFixed(3)}/in²
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Pizza 1 Area", `${result.area1.toFixed(1)} in²`],
                ["Pizza 2 Area", `${result.area2.toFixed(1)} in²`],
                ["Size Ratio", `${result.sizeRatio.toFixed(2)}×`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${i === 2 ? "text-green-600" : "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Comparison Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Edible Area Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v} in²`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Pizza 2 is {result.sizeRatio.toFixed(2)}× the area of Pizza 1 — a {parseFloat(inputs.dia2) - parseFloat(inputs.dia1)}" diameter increase more than doubles the food.
              </p>
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
            <h2 className="text-2xl font-bold mb-3">The Pizza Area Theorem</h2>
            <p>Pizza area follows A = πr², so doubling the diameter quadruples the area. A 14-inch pizza (153.9 in²) is 96% larger than a 10-inch (78.5 in²) — nearly double the food for typically 50% more money. That's why the biggest pie is usually, but not always, the best value.</p>
            <h2 className="text-2xl font-bold mb-3">Price per Square Inch</h2>
            <p>The fair comparison is price divided by area: dollars per square inch. A 10-inch at $12 costs $0.153/in²; a 14-inch at $18 costs $0.117/in² — the 14-inch is 23.5% cheaper per bite. Adding crust width makes the comparison stricter, measuring only the cheese-and-topping zone you actually want.</p>
            <h2 className="text-2xl font-bold mb-3">When the Big Pizza Loses</h2>
            <p>Deals can flip the math. A discounted small pizza or a premium-priced large one will show up as the worse value once you compute $/in². This calculator also reports savings as a percentage of the more expensive option, so you can see exactly how much the winner saves you.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pizza-size-calculator" />
          <PopularCalculators exclude="/calculator/pizza-size-calculator" />
        </div>
      </div>
    </>
  );
}
