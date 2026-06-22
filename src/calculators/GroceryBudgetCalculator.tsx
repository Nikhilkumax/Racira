"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart as RPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface GroceryResult {
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  perPersonPerDay: number;
  breakdown: { category: string; amount: number; pct: number }[];
  topCategory: string;
  savingsTip: number;
}

const DEFAULTS = {
  produce: "120",
  meat: "180",
  dairy: "80",
  pantry: "150",
  frozen: "60",
  snacks: "50",
  beverages: "40",
  household: "30",
  people: "3",
  frequency: "weekly",
};

function calculate(d: typeof DEFAULTS): GroceryResult {
  const produce = parseFloat(d.produce) || 0;
  const meat = parseFloat(d.meat) || 0;
  const dairy = parseFloat(d.dairy) || 0;
  const pantry = parseFloat(d.pantry) || 0;
  const frozen = parseFloat(d.frozen) || 0;
  const snacks = parseFloat(d.snacks) || 0;
  const beverages = parseFloat(d.beverages) || 0;
  const household = parseFloat(d.household) || 0;
  const people = parseFloat(d.people) || 1;
  const freq = d.frequency;

  const cats = [
    { category: "Produce", amount: produce },
    { category: "Meat & Seafood", amount: meat },
    { category: "Dairy & Eggs", amount: dairy },
    { category: "Pantry & Dry Goods", amount: pantry },
    { category: "Frozen Foods", amount: frozen },
    { category: "Snacks & Sweets", amount: snacks },
    { category: "Beverages", amount: beverages },
    { category: "Household Items", amount: household },
  ];

  const tripTotal = cats.reduce((s, c) => s + c.amount, 0);
  let weeklyTotal = 0;
  if (freq === "weekly") weeklyTotal = tripTotal;
  else if (freq === "biweekly") weeklyTotal = tripTotal / 2;
  else if (freq === "monthly") weeklyTotal = tripTotal / 4.33;

  const monthlyTotal = weeklyTotal * 4.33;
  const yearlyTotal = weeklyTotal * 52;
  const perPersonPerDay = yearlyTotal / people / 365;

  const breakdown = cats
    .filter(c => c.amount > 0)
    .map(c => ({ ...c, pct: tripTotal > 0 ? (c.amount / tripTotal) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = breakdown[0]?.category || "";
  const savingsTip = yearlyTotal * 0.1;

  return { weeklyTotal, monthlyTotal, yearlyTotal, perPersonPerDay, breakdown, topCategory, savingsTip };
}

const fmt = (n: number) => `$${n.toFixed(2)}`;
const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#6366f1"];

export default function GroceryBudgetCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [result, setResult] = useState<GroceryResult>(() => calculate(DEFAULTS));

  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const Label = ({ children }: { children: string }) => (
    <label className="text-sm font-semibold text-foreground mb-1 block">{children}</label>
  );
  const NumInput = ({ field, prefix = "$" }: { field: keyof typeof DEFAULTS; prefix?: string }) => (
    <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
      <input type="number" value={f[field]} onChange={e => set(field)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
    </div>
  );

  const faqs = [
    { question: "What is a grocery budget calculator?", answer: "A grocery budget calculator helps you estimate your weekly, monthly, and annual grocery spending by category. It lets you see which categories consume the most of your food budget and where you can potentially save." },
    { question: "What is a reasonable grocery budget per person?", answer: "The USDA's Thrifty Food Plan suggests roughly $250–$350 per person per month for a single adult. The Liberal plan allows $500+. Families often spend less per person due to bulk buying. Our calculator shows your cost per person per day for easy benchmarking." },
    { question: "How can I reduce my grocery spending?", answer: "Common strategies include meal planning before shopping, using loyalty card discounts, buying store brands, shopping weekly sales, buying in bulk for non-perishables, using cashback apps, and reducing pre-packaged convenience foods. Our calculator shows a 10% savings estimate as a baseline target." },
    { question: "Should household items be included in the grocery budget?", answer: "It depends on your personal budgeting approach. Many people combine groceries and household consumables (cleaning supplies, paper goods) into a single 'household' budget. Tracking them separately gives more detail about food spending specifically." },
    { question: "What is the 50/30/20 rule and how does it apply to groceries?", answer: "The 50/30/20 rule allocates 50% of income to needs (including groceries), 30% to wants, and 20% to savings. Groceries are a 'need' but can vary widely. Tracking your spending with this calculator helps ensure groceries stay within your needs budget." },
    { question: "How often should I adjust my grocery budget?", answer: "Review your grocery budget quarterly or whenever there is a significant life change (new household member, dietary change, relocation). Food inflation also makes regular reviews important — USDA data shows grocery prices can shift 3–7% annually." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Grocery Budget Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Grocery Budget Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Fresh Produce", field: "produce" },
                { label: "Meat & Seafood", field: "meat" },
                { label: "Dairy & Eggs", field: "dairy" },
                { label: "Pantry & Dry Goods", field: "pantry" },
                { label: "Frozen Foods", field: "frozen" },
                { label: "Snacks & Sweets", field: "snacks" },
                { label: "Beverages", field: "beverages" },
                { label: "Household Items", field: "household" },
              ].map(({ label, field }) => (
                <div key={field} className="flex flex-col">
                  <Label>{label}</Label>
                  <NumInput field={field as keyof typeof DEFAULTS} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <Label>Household Size</Label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f.people} onChange={e => set("people")(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 text-sm text-muted-foreground">people</span>
                </div>
              </div>
              <div className="flex flex-col">
                <Label>Shopping Frequency</Label>
                <select value={f.frequency} onChange={e => set("frequency")(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-3">
            {/* Primary card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Annual Grocery Spend</div>
              <div className="text-5xl font-extrabold text-foreground">{fmt(result.yearlyTotal)}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(result.perPersonPerDay)} per person per day</div>
            </div>

            {/* 3-stat */}
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Weekly</div><div className="font-bold text-lg">{fmt(result.weeklyTotal)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Monthly</div><div className="font-bold text-lg">{fmt(result.monthlyTotal)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">10% Savings</div><div className="font-bold text-lg text-emerald-600">{fmt(result.savingsTip)}/yr</div></div>
              </div>
            </div>

            {/* Pie chart */}
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Spending Breakdown</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={result.breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={85} innerRadius={45}>
                      {result.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50">
                <h3 className="font-bold text-foreground text-sm">Category Details</h3>
              </div>
              {result.breakdown.map((row, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-2.5 hover:bg-secondary/20 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground text-sm">{row.category}</span>
                  </div>
                  <div className="text-center font-semibold text-sm">{fmt(row.amount)}</div>
                  <div className="text-right text-sm text-muted-foreground">{row.pct.toFixed(1)}%</div>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-primary/5 grid grid-cols-3 font-bold border-t border-border">
                <span>Total Per Trip</span>
                <span className="text-center text-primary">{fmt(result.breakdown.reduce((s, r) => s + r.amount, 0))}</span>
                <span className="text-right">100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>About the Grocery Budget Calculator</h2>
            <p>This grocery budget calculator gives you a clear picture of your household food spending across eight categories. Enter your typical spend per shopping trip and select your frequency — weekly, bi-weekly, or monthly — to see your projected weekly, monthly, and annual totals. The built-in cost-per-person-per-day metric benchmarks your spending against USDA dietary plans and national averages.</p>
            <h2>How the Calculation Works</h2>
            <p>The calculator converts your trip spending to a weekly equivalent: weekly trips are taken at face value, bi-weekly totals are halved, and monthly totals are divided by 4.33 (average weeks per month). Annual spend = weekly spend × 52. Per-person-per-day = annual spend ÷ household size ÷ 365.</p>
            <h2>Grocery Budget Benchmarks by Household Size</h2>
            <p>The USDA publishes four food plan cost tiers: Thrifty, Low-Cost, Moderate-Cost, and Liberal. A family of four on the Thrifty plan spends roughly $900–$1,100 per month; the Liberal plan allows $1,600–$1,900. Single adults on the Thrifty plan average $250–$310/month. This calculator shows your spending relative to the "per person per day" metric to make benchmarking effortless.</p>
            <h2>Category-by-Category Savings Strategies</h2>
            <p><strong>Produce:</strong> Shop seasonal; buy frozen vegetables for non-seasonal produce. Visit farmers markets near closing time for discounts. <strong>Meat & Seafood:</strong> Buy in bulk and freeze portions; choose cheaper cuts; incorporate plant-based proteins 2–3 days per week. <strong>Dairy:</strong> Store brands often match name brands in quality at 20–30% less cost. <strong>Pantry:</strong> Buy staples (rice, beans, pasta, canned tomatoes) in bulk. <strong>Snacks:</strong> Limit impulse purchases; meal-prep snacks at home.</p>
            <h2>The 10% Savings Rule</h2>
            <p>Research consistently shows that households can reduce grocery spending by 10–20% simply by planning meals in advance, using a written shopping list, and reviewing weekly circulars before shopping. Our calculator shows your potential 10% savings as a concrete dollar amount to motivate behavioral change.</p>
            <h2>Coupons, Loyalty Programs, and Cashback Apps</h2>
            <p>Modern grocery savings extend beyond paper coupons. Loyalty programs (Kroger Plus, Safeway Club, Target Circle) offer significant per-item discounts. Cashback apps like Ibotta, Fetch, and Checkout 51 return $15–$50/month for regular shoppers. Credit cards with grocery category bonuses (3–5% back) add another layer of savings. Combining all three strategies can realistically cut annual grocery costs by 15–25%.</p>
            <h2>Building a Sustainable Grocery Budget</h2>
            <p>Track actual spending for 4–6 weeks before setting firm targets. Most households underestimate grocery spending by 15–20%. Use this calculator after each shopping trip to update your estimates and identify category drift. Set a specific weekly budget and carry a running total on your phone while shopping to avoid over-spending at the store.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grocery-budget-calculator" />
          <PopularCalculators exclude="/calculator/grocery-budget-calculator" />
        </div>
      </div>
    </>
  );
}
