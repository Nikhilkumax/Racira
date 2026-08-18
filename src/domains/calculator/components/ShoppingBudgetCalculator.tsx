"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface ShoppingInputs {
  income: number;      // $ monthly
  budgetPct: number;   // % of income for shopping
  months: number;      // planning period
  essentialsPct: number; // % of budget for essential items
  bigTicketPct: number;  // % of budget set aside for large purchases
}

interface ShoppingResults {
  monthlyBudget: number;
  essentials: number;
  wants: number;
  bigTicket: number;
  periodTotal: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const COLORS = ["#2563eb", "#f59e0b", "#10b981"];

function calcShopping(i: ShoppingInputs): ShoppingResults {
  const monthlyBudget = i.income * (i.budgetPct / 100);
  const essentials = monthlyBudget * (i.essentialsPct / 100);
  const bigTicket = monthlyBudget * (i.bigTicketPct / 100);
  const wants = monthlyBudget - essentials - bigTicket;
  const periodTotal = monthlyBudget * i.months;

  const chartData = [
    { name: "Essentials", value: Math.round(essentials) },
    { name: "Wants", value: Math.round(wants) },
    { name: "Big-Ticket Savings", value: Math.round(bigTicket) },
  ];

  const breakdown = [
    { label: "Monthly Income", value: `$${i.income.toLocaleString()}` },
    { label: `Shopping Budget (${i.budgetPct}% of income)`, value: `$${monthlyBudget.toFixed(2)}/mo` },
    { label: "Essentials", value: `$${essentials.toFixed(2)}/mo` },
    { label: "Wants / Discretionary", value: `$${wants.toFixed(2)}/mo` },
    { label: "Big-Ticket Savings", value: `$${bigTicket.toFixed(2)}/mo` },
    { label: `Total (${i.months} mo)`, value: `$${periodTotal.toFixed(2)}`, highlight: true, isTotal: true },
  ];

  const summaryStats = [
    { label: "Total Shopping Budget", value: `$${periodTotal.toFixed(2)}` },
    { label: "Monthly Budget", value: `$${monthlyBudget.toFixed(2)}` },
    { label: "Essentials / Month", value: `$${essentials.toFixed(2)}` },
    { label: "Wants / Month", value: `$${wants.toFixed(2)}` },
    { label: "Big-Ticket / Month", value: `$${bigTicket.toFixed(2)}` },
    { label: "Budget % of Income", value: `${i.budgetPct}%` },
    { label: "Planning Period", value: `${i.months} month(s)` },
    { label: "Savings Over Period", value: `$${(bigTicket * i.months).toFixed(2)}` },
  ];

  return { monthlyBudget, essentials, wants, bigTicket, periodTotal, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  income: "4000",
  budgetPct: "10",
  months: "3",
  essentialsPct: "60",
  bigTicketPct: "15",
};

// 4. Component
export default function ShoppingBudgetCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ShoppingResults>(() => calcShopping({ income: 4000, budgetPct: 10, months: 3, essentialsPct: 60, bigTicketPct: 15 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcShopping({ income: 4000, budgetPct: 10, months: 3, essentialsPct: 60, bigTicketPct: 15 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcShopping({
        income: parseFloat(inputs.income) || 0,
        budgetPct: parseFloat(inputs.budgetPct) || 0,
        months: parseFloat(inputs.months) || 0,
        essentialsPct: parseFloat(inputs.essentialsPct) || 0,
        bigTicketPct: parseFloat(inputs.bigTicketPct) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcShopping({ income: 4000, budgetPct: 10, months: 3, essentialsPct: 60, bigTicketPct: 15 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const income = parseFloat(inputs.income) || 0;
  const budgetPct = parseFloat(inputs.budgetPct) || 0;
  const months = parseFloat(inputs.months) || 0;
  const essentialsPct = parseFloat(inputs.essentialsPct) || 0;
  const bigTicketPct = parseFloat(inputs.bigTicketPct) || 0;
  if (income <= 0) errors.income = "Must be greater than 0";
  if (budgetPct < 1 || budgetPct > 100) errors.budgetPct = "Must be 1–100%";
  if (months < 1 || months > 24) errors.months = "Must be 1–24 months";
  if (essentialsPct + bigTicketPct > 100) errors.essentialsPct = "Essentials + big-ticket must be ≤ 100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What percentage of income should go to shopping?", answer: "A common guideline is to keep discretionary non-essential spending — shopping, dining, hobbies — to 10–30% of take-home income depending on your savings goals. Shopping alone typically sits in the 5–15% band. The 50/30/20 rule puts wants (including shopping) at 30% overall, of which shopping is usually half or less." },
    { question: "What counts as an essential shopping purchase?", answer: "Essentials are functional items you genuinely need: work clothing, shoes that are worn out, household basics like towels or storage. Wants are the upgrades and extras — fashion beyond necessity, gadgets, decor. A 60/25/15 split (essentials / wants / big-ticket savings) is a solid default that keeps the budget honest." },
    { question: "Why set aside a big-ticket savings share?", answer: "Large purchases — a laptop, a winter coat, a furniture piece — wreck budgets when they arrive unplanned. Setting aside 10–20% of the shopping budget each month builds a fund that pays for them in cash. Over a year at 15% of a $400 budget, that's $720 ready for the next big item." },
    { question: "How do I stick to a shopping budget?", answer: "Track spending against the monthly number before you shop, not after — check the balance as part of checkout. Use a separate card or account for the shopping budget, wait 48 hours on non-essential purchases over a set amount, and treat the big-ticket fund as off-limits for impulse buys." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Shopping Budget Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Shopping Budget Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="income" className={lbl}>Monthly Income</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="income" type="number" min="1" step="100" value={inputs.income} onChange={(e) => set("income")(e.target.value)} className={ci} />
                </div>
                {errors.income && <p className="text-xs text-red-500 font-medium mt-1">{errors.income}</p>}
              </div>
              <div>
                <label htmlFor="budgetPct" className={lbl}>Shopping Budget</label>
                <div className={inp}>
                  <input id="budgetPct" type="number" min="1" max="100" step="1" value={inputs.budgetPct} onChange={(e) => set("budgetPct")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.budgetPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.budgetPct}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="months" className={lbl}>Planning Period</label>
              <div className={inp}>
                <input id="months" type="number" min="1" max="24" value={inputs.months} onChange={(e) => set("months")(e.target.value)} className={ci} />
                <span className="pr-3 text-muted-foreground text-sm">months</span>
              </div>
              {errors.months && <p className="text-xs text-red-500 font-medium mt-1">{errors.months}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Allocation Plan</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="essentialsPct" className={lbl}>Essentials</label>
                        <div className={inp}>
                          <input id="essentialsPct" type="number" min="0" max="100" step="5" value={inputs.essentialsPct} onChange={(e) => set("essentialsPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.essentialsPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.essentialsPct}</p>}
                      </div>
                      <div>
                        <label htmlFor="bigTicketPct" className={lbl}>Big-Ticket Savings</label>
                        <div className={inp}>
                          <input id="bigTicketPct" type="number" min="0" max="100" step="5" value={inputs.bigTicketPct} onChange={(e) => set("bigTicketPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Shopping Budget ({inputs.months} mo)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.periodTotal.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.monthlyBudget.toFixed(2)}/month · {inputs.budgetPct}% of ${parseFloat(inputs.income).toLocaleString()} income
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Budget", `$${result.monthlyBudget.toFixed(2)}`],
                ["Essentials", `$${result.essentials.toFixed(2)}`],
                ["Wants", `$${result.wants.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Budget Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Monthly Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`$${v}/mo`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Essentials get the largest share; big-ticket savings keeps large purchases out of the wants column.</p>
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
            <h2 className="text-2xl font-bold mb-3">Budget Shopping Before You Shop</h2>
            <p>A shopping budget starts from income, not from desire: pick a percentage of monthly income — 5–15% is typical — and commit to it for a planning period. The calculator converts that into a monthly dollar figure and a period total, so a $4,000 income at 10% over three months is a $1,200 plan, not a string of impulse purchases.</p>
            <h2 className="text-2xl font-bold mb-3">Three Buckets Keep It Honest</h2>
            <p>Splitting the budget into essentials (60%), wants (25%), and big-ticket savings (15%) does two things: it legitimizes the fun spending so you don't feel deprived, and it quarantines large purchases so they can't blow up the month they arrive. The percentages are adjustable in Advanced Options — the important part is that every dollar has a bucket.</p>
            <h2 className="text-2xl font-bold mb-3">The Period Is the Plan</h2>
            <p>Budgets fail when they're abstract monthly numbers. Planning over a concrete period — the next season, the next quarter, the run-up to a holiday — turns the budget into a finite pot you can track. At the end of each period, review what each bucket actually bought and adjust the percentages; a budget that adapts is one you'll keep.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/shopping-budget-calculator" />
          <PopularCalculators exclude="/calculator/shopping-budget-calculator" />
        </div>
      </div>
    </>
  );
}
