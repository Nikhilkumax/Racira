"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface BudgetInputs {
  income: number;
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  textbooks: number;
  entertainment: number;
  other: number;
}

interface Slice {
  name: string;
  value: number;
  pct: number;
}

interface BudgetResults {
  totalExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  needs: number;
  wants: number;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  chartData: Slice[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function calcBudget(i: BudgetInputs): BudgetResults {
  const totalExpenses = i.rent + i.food + i.transport + i.utilities + i.textbooks + i.entertainment + i.other;
  const monthlySavings = i.income - totalExpenses;
  const savingsRate = i.income > 0 ? (monthlySavings / i.income) * 100 : 0;
  const needs = i.rent + i.food + i.transport + i.utilities;
  const wants = i.entertainment + i.other;
  const needsPct = i.income > 0 ? (needs / i.income) * 100 : 0;
  const wantsPct = i.income > 0 ? (wants / i.income) * 100 : 0;
  const savingsPct = i.income > 0 ? (monthlySavings / i.income) * 100 : 0;

  const pieRaw = [
    { name: "Rent", value: i.rent },
    { name: "Food", value: i.food },
    { name: "Transport", value: i.transport },
    { name: "Utilities", value: i.utilities },
    { name: "Textbooks", value: i.textbooks },
    { name: "Entertainment", value: i.entertainment },
    { name: "Other", value: i.other },
  ].filter((d) => d.value > 0);
  const total = pieRaw.reduce((p, d) => p + d.value, 0);
  let acc = 0;
  const pcts = pieRaw.map((d) => {
    const p = total > 0 ? (d.value / total) * 100 : 0;
    acc += p;
    return p;
  });
  if (total > 0 && pieRaw.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < pcts.length; i++) if (pcts[i] > pcts[maxIdx]) maxIdx = i;
    pcts[maxIdx] += 100 - acc;
  }
  const chartData: Slice[] = pieRaw.map((d, idx) => ({ name: d.name, value: d.value, pct: pcts[idx] }));

  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  const breakdown = [
    { label: "Monthly Income", value: fmt(i.income) },
    { label: "Rent", value: fmt(i.rent) },
    { label: "Food & Groceries", value: fmt(i.food) },
    { label: "Transportation", value: fmt(i.transport) },
    { label: "Utilities", value: fmt(i.utilities) },
    { label: "Textbooks & Supplies", value: fmt(i.textbooks) },
    { label: "Entertainment", value: fmt(i.entertainment) },
    { label: "Other Expenses", value: fmt(i.other) },
    { label: "Total Expenses", value: fmt(totalExpenses) },
    { label: "Monthly Savings", value: fmt(monthlySavings), highlight: true, isTotal: true },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Monthly Income", value: fmt(i.income) },
    { label: "Total Expenses", value: fmt(totalExpenses) },
    { label: "Monthly Savings", value: fmt(monthlySavings) },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%` },
    { label: "Needs (Rent/Food/Util)", value: fmt(needs) },
    { label: "Wants (Fun/Other)", value: fmt(wants) },
    { label: "Needs % of Income", value: `${needsPct.toFixed(1)}%` },
    { label: "Wants % of Income", value: `${wantsPct.toFixed(1)}%` },
  ];

  return { totalExpenses, monthlySavings, savingsRate, needs, wants, needsPct, wantsPct, savingsPct, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  income: "1500",
  rent: "600",
  food: "300",
  transport: "100",
  utilities: "80",
  textbooks: "50",
  entertainment: "100",
  other: "50",
};

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// 4. Component
export default function StudentBudgetCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<BudgetResults>(() =>
    calcBudget({ income: 1500, rent: 600, food: 300, transport: 100, utilities: 80, textbooks: 50, entertainment: 100, other: 50 })
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcBudget({ income: 1500, rent: 600, food: 300, transport: 100, utilities: 80, textbooks: 50, entertainment: 100, other: 50 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const buildInputs = (): BudgetInputs => ({
    income: parseFloat(inputs.income) || 0,
    rent: parseFloat(inputs.rent) || 0,
    food: parseFloat(inputs.food) || 0,
    transport: parseFloat(inputs.transport) || 0,
    utilities: parseFloat(inputs.utilities) || 0,
    textbooks: parseFloat(inputs.textbooks) || 0,
    entertainment: parseFloat(inputs.entertainment) || 0,
    other: parseFloat(inputs.other) || 0,
  });

  const calculate = () => setResult(calcBudget(buildInputs()));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcBudget({ income: 1500, rent: 600, food: 300, transport: 100, utilities: 80, textbooks: 50, entertainment: 100, other: 50 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const income = parseFloat(inputs.income) || 0;
  if (inputs.income.trim() === "") errors.income = "Income is required";
  else if (income < 0) errors.income = "Income cannot be negative";
  (Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).forEach((k) => {
    if (k === "income") return;
    const v = parseFloat(inputs[k]) || 0;
    if (v < 0) errors[k] = "Cannot be negative";
  });
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const MoneyInput = ({ id, label, value, onChange, err }: { id: string; label: string; value: string; onChange: (v: string) => void; err?: string }) => (
    <div>
      <label htmlFor={id} className={lbl}>{label}</label>
      <div className={inp}>
        <span className="pl-3 text-muted-foreground text-sm">$</span>
        <input id={id} type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className={ci} />
      </div>
      {err && <p className="text-xs text-red-500 font-medium mt-1">{err}</p>}
    </div>
  );

  const faqs = [
    { question: "How much should a student budget for rent?", answer: "As a general rule, keep housing at or below 30% of monthly income. If your income is $1,500 a month, aim for rent under $450 — though in expensive cities students often share apartments to reach this. Many campuses recommend that total costs (rent, food, transport, utilities) stay under 50% of income." },
    { question: "What is the 50/30/20 rule for students?", answer: "The 50/30/20 rule allocates 50% of income to needs (rent, food, utilities, transport), 30% to wants (entertainment, eating out), and 20% to savings and debt repayment. Students often can't hit 20% savings — even 5-10% builds a valuable emergency fund and savings habit." },
    { question: "How can I cut student expenses?", answer: "Buy used textbooks or rent them, cook at home, use student discounts (transit, software, entertainment), live with roommates, and track spending for a month to find leaks. Meal planning alone typically saves $50-100/month versus eating out." },
    { question: "What if my expenses exceed my income?", answer: "The monthly savings figure goes negative, which means you are borrowing or drawing down savings. First reduce discretionary spending (entertainment, eating out), then renegotiate fixed costs like rent by moving or finding a roommate, and finally consider part-time work or additional financial aid." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Student Budget Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Budget Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput id="income" label="Monthly Income" value={inputs.income} onChange={set("income")} err={errors.income} />
              <MoneyInput id="rent" label="Rent" value={inputs.rent} onChange={set("rent")} err={errors.rent} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput id="food" label="Food & Groceries" value={inputs.food} onChange={set("food")} err={errors.food} />
              <MoneyInput id="transport" label="Transportation" value={inputs.transport} onChange={set("transport")} err={errors.transport} />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Living & Study Costs</div>
                    <div className="grid grid-cols-2 gap-3">
                      <MoneyInput id="utilities" label="Utilities" value={inputs.utilities} onChange={set("utilities")} err={errors.utilities} />
                      <MoneyInput id="textbooks" label="Textbooks & Supplies" value={inputs.textbooks} onChange={set("textbooks")} err={errors.textbooks} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Discretionary</div>
                    <div className="grid grid-cols-2 gap-3">
                      <MoneyInput id="entertainment" label="Entertainment" value={inputs.entertainment} onChange={set("entertainment")} err={errors.entertainment} />
                      <MoneyInput id="other" label="Other" value={inputs.other} onChange={set("other")} err={errors.other} />
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Savings</div>
              <div className={`text-4xl font-extrabold tracking-tight ${result.monthlySavings >= 0 ? "text-primary" : "text-red-500"}`}>
                {result.monthlySavings >= 0 ? "" : "−"}{fmtMoney(Math.abs(result.monthlySavings))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Savings rate: {result.savingsRate.toFixed(1)}% of income · {fmtMoney(result.totalExpenses)} in expenses
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Income", fmtMoney(result.totalExpenses + result.monthlySavings)],
                ["Total Expenses", fmtMoney(result.totalExpenses)],
                ["Savings Rate", `${result.savingsRate.toFixed(1)}%`],
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
              <h3 className="text-base font-bold mb-4">Where Your Money Goes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RPie>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`$${Math.round(v).toLocaleString()}`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                </RPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {result.chartData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name} · {d.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
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
            <h2 className="text-2xl font-bold mb-3">Budgeting on a Student Income</h2>
            <p>Student budgets are tight by design — most students live on grants, loans, part-time wages, and family support. The first step is knowing exactly where the money goes. This calculator totals your monthly expenses, shows what is left to save, and breaks spending into needs versus wants using the widely used 50/30/20 framework.</p>
            <h2 className="text-2xl font-bold mb-3">The 50/30/20 Framework</h2>
            <p>Needs — rent, food, utilities, and transportation — should stay near 50% of income. Wants — entertainment, eating out, hobbies — near 30%. Savings and debt repayment should take the remaining 20%. Few students hit these targets perfectly, but the gap itself is informative: if wants exceed 30%, that is the first place to trim.</p>
            <h2 className="text-2xl font-bold mb-3">Build the Habit Early</h2>
            <p>Even $25-50 saved per month builds the emergency fund that will cover a broken laptop or an unexpected trip home. Track your actual spending for one month and compare it to this plan — most students find the biggest leaks in food delivery and impulse purchases, not in the big fixed costs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-budget-calculator" />
          <PopularCalculators exclude="/calculator/student-budget-calculator" />
        </div>
      </div>
    </>
  );
}
