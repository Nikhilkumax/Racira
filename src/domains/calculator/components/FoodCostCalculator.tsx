"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, UtensilsCrossed } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FoodCostResult {
  ingredientCost: number;
  menuPrice: number;
  foodCostPct: number;
  grossProfit: number;
  profitMargin: number;
  markup: number;
  chartData: { name: string; value: number }[];
}

function calcFoodCost(ingredientCost: number, menuPrice: number): FoodCostResult {
  const foodCostPct = menuPrice > 0 ? (ingredientCost / menuPrice) * 100 : 0;
  const grossProfit = menuPrice - ingredientCost;
  const profitMargin = menuPrice > 0 ? (grossProfit / menuPrice) * 100 : 0;
  const markup = ingredientCost > 0 ? menuPrice / ingredientCost : 0;
  const chartData = [
    { name: "Food Cost", value: ingredientCost },
    { name: "Gross Profit", value: grossProfit },
  ];
  return { ingredientCost, menuPrice, foodCostPct, grossProfit, profitMargin, markup, chartData };
}

const DEFAULTS = { cost: "3.50", price: "12" };

const COLORS = ["hsl(0 72% 51%)", "hsl(var(--primary))"];

const faqs = [
  { question: "What is food cost percentage?", answer: "Food cost % = ingredient cost ÷ menu price × 100. A dish with $3.50 of ingredients sold for $12 has a 29.2% food cost — the industry target is typically 25–35%." },
  { question: "What is a good food cost?", answer: "Most restaurants target 28–32% of menu price. Fine dining runs 30–35% (premium ingredients, higher prices), quick service 25–30%. Below ~25% may signal portions too small; above 35% erodes profit." },
  { question: "How is markup related?", answer: "Markup = menu price ÷ ingredient cost. At 29.2% food cost the markup is 3.43× — the classic pricing heuristic is 'food cost × 3 to 3.5'. Track both: the percentage tells you profitability, the markup tells you pricing." },
];

export default function FoodCostCalculator() {
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<FoodCostResult>(() => calcFoodCost(3.5, 12));

  useEffect(() => {
    const c = parseFloat(cost);
    const p = parseFloat(price);
    if (!isNaN(c) && !isNaN(p) && c >= 0 && p > 0) setResult(calcFoodCost(c, p));
  }, []);

  const handleCalculate = () => {
    const c = parseFloat(cost);
    const p = parseFloat(price);
    if (!isNaN(c) && !isNaN(p) && c >= 0 && p > 0) setResult(calcFoodCost(c, p));
  };
  const reset = () => { setCost(DEFAULTS.cost); setPrice(DEFAULTS.price); setResult(calcFoodCost(parseFloat(DEFAULTS.cost), parseFloat(DEFAULTS.price))); };
  const invalid = isNaN(parseFloat(cost)) || isNaN(parseFloat(price)) || parseFloat(cost) < 0 || parseFloat(price) <= 0;

  const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

  const breakdown = [
    { label: "Ingredient Cost", value: fmtMoney(result.ingredientCost) },
    { label: "Menu Price", value: fmtMoney(result.menuPrice) },
    { label: "Food Cost %", value: `${result.foodCostPct.toFixed(1)}%`, highlight: true },
    { label: "Gross Profit per Dish", value: fmtMoney(result.grossProfit) },
    { label: "Profit Margin", value: `${result.profitMargin.toFixed(1)}%` },
    { label: "Markup (×)", value: `${result.markup.toFixed(2)}×` },
    { label: "Target Check", value: result.foodCostPct > 35 ? "Above target — raise price or cut cost" : result.foodCostPct < 25 ? "Below target — consider smaller portions or premium pricing" : "In target range (25–35%)" },
  ];

  const summaryStats = [
    { label: "Food Cost %", value: `${result.foodCostPct.toFixed(1)}%` },
    { label: "Profit / Dish", value: fmtMoney(result.grossProfit) },
    { label: "Margin", value: `${result.profitMargin.toFixed(1)}%` },
    { label: "Markup", value: `${result.markup.toFixed(2)}×` },
    { label: "Ingredient Cost", value: fmtMoney(result.ingredientCost) },
    { label: "Menu Price", value: fmtMoney(result.menuPrice) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Food Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Food Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="fc-cost" className="block text-sm font-medium mb-1 text-foreground">Ingredient Cost ($)</label>
              <input id="fc-cost" type="number" min="0" step="0.05" value={cost} onChange={(e) => setCost(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="fc-price" className="block text-sm font-medium mb-1 text-foreground">Menu Price ($)</label>
              <input id="fc-price" type="number" min="0.01" step="0.25" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <UtensilsCrossed className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative cost and a positive menu price.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Food Cost Percentage</div>
              <div className="text-4xl font-extrabold text-primary">{result.foodCostPct.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtMoney(result.ingredientCost)} ÷ {fmtMoney(result.menuPrice)} · profit {fmtMoney(result.grossProfit)}/dish</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Profit / Dish</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.grossProfit)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Margin</div>
                <div className="text-lg font-bold text-primary">{result.profitMargin.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Markup</div>
                <div className="text-lg font-bold text-primary">{result.markup.toFixed(2)}×</div>
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
              <h3 className="text-base font-bold mb-3">Where the Menu Price Goes</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${fmtMoney(v)} (${((v / result.menuPrice) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
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
            <h2 className="text-2xl font-bold mb-3">About the Food Cost Calculator</h2>
            <p>Food cost percentage is the single most watched number in restaurant operations: ingredient cost divided by menu price. At $3.50 of ingredients on a $12 dish, food cost is 29.2% — inside the healthy 25–35% band — leaving $8.50 of gross profit before labor, rent, and overhead.</p>
            <h3>Using the Numbers</h3>
            <p>Price a menu from cost upward (cost × 3 to 3.5 for ~28–33%), then verify with the percentage after the fact. Watch for ingredient inflation creeping food cost past 35% — that is the trigger to reprice, reformulate, or renegotiate suppliers, not to quietly shrink portions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/food-cost-calculator" />
          <PopularCalculators exclude="/calculator/food-cost-calculator" />
        </div>
      </div>
    </>
  );
}
