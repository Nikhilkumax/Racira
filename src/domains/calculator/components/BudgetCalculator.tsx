"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BudgetResult {
  housing: number;
  transportation: number;
  food: number;
  utilities: number;
  insurance: number;
  healthcare: number;
  savings: number;
  entertainment: number;
  personalCare: number;
  debt: number;
  other: number;
  totalAllocated: number;
  surplusDeficit: number;
  savingsRate: number;
  breakdown: { category: string; amount: number; pct: number; color: string; status: string }[];
  summaryStats: { label: string; value: string }[];
}

const BUDGET_RULES = {
  housing: { recommended: 25, max: 30, label: "Housing (rent/mortgage)" },
  transportation: { recommended: 10, max: 15, label: "Transportation" },
  food: { recommended: 10, max: 15, label: "Food & Groceries" },
  utilities: { recommended: 5, max: 10, label: "Utilities & Bills" },
  insurance: { recommended: 5, max: 8, label: "Insurance Premiums" },
  healthcare: { recommended: 5, max: 8, label: "Healthcare" },
  savings: { recommended: 20, max: 100, label: "Savings & Investments" },
  entertainment: { recommended: 5, max: 10, label: "Entertainment" },
  personalCare: { recommended: 3, max: 5, label: "Personal Care" },
  debt: { recommended: 5, max: 15, label: "Debt Payments" },
  other: { recommended: 7, max: 10, label: "Other / Miscellaneous" },
};

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#ec4899", "#64748b", "#84cc16"];

function calcBudget(monthlyIncome: number, expenses: Record<string, number>): BudgetResult {
  const housing = expenses.housing ?? 0;
  const transportation = expenses.transportation ?? 0;
  const food = expenses.food ?? 0;
  const utilities = expenses.utilities ?? 0;
  const insurance = expenses.insurance ?? 0;
  const healthcare = expenses.healthcare ?? 0;
  const savings = expenses.savings ?? 0;
  const entertainment = expenses.entertainment ?? 0;
  const personalCare = expenses.personalCare ?? 0;
  const debt = expenses.debt ?? 0;
  const other = expenses.other ?? 0;

  const totalAllocated = housing + transportation + food + utilities + insurance + healthcare + savings + entertainment + personalCare + debt + other;
  const surplusDeficit = monthlyIncome - totalAllocated;
  const savingsRate = monthlyIncome > 0 ? ((savings + Math.max(0, surplusDeficit)) / monthlyIncome) * 100 : 0;

  const expenseMap: Record<string, number> = { housing, transportation, food, utilities, insurance, healthcare, savings, entertainment, personalCare, debt, other };

  const breakdown = Object.entries(BUDGET_RULES).map(([key, rule], i) => {
    const amount = expenseMap[key] ?? 0;
    const pct = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;
    const status = pct <= rule.recommended ? "✓ Good" : pct <= rule.max ? "⚠ High" : "✗ Over";
    return { category: rule.label, amount, pct, color: COLORS[i], status };
  }).filter(b => b.amount > 0);

  const summaryStats = [
    { label: "Monthly Income", value: `$${monthlyIncome.toLocaleString()}` },
    { label: "Total Expenses", value: `$${totalAllocated.toFixed(0)}` },
    { label: "Surplus / Deficit", value: `${surplusDeficit >= 0 ? "+" : ""}$${surplusDeficit.toFixed(0)}` },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%` },
    { label: "Housing %", value: `${monthlyIncome > 0 ? ((housing / monthlyIncome) * 100).toFixed(1) : 0}%` },
    { label: "Debt %", value: `${monthlyIncome > 0 ? ((debt / monthlyIncome) * 100).toFixed(1) : 0}%` },
  ];

  return { housing, transportation, food, utilities, insurance, healthcare, savings, entertainment, personalCare, debt, other, totalAllocated, surplusDeficit, savingsRate, breakdown, summaryStats };
}

export default function BudgetCalculator() {
  const [income, setIncome] = useState("6000");
  const [expenses, setExpenses] = useState<Record<string, string>>({
    housing: "1500", transportation: "400", food: "600", utilities: "200",
    insurance: "300", healthcare: "150", savings: "600", entertainment: "200",
    personalCare: "100", debt: "300", other: "200",
  });
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const [incomeFreq, setIncomeFreq] = useState<"monthly" | "annual">("monthly");

  const setExpense = (key: string, value: string) => setExpenses(prev => ({ ...prev, [key]: value }));

  const calculate = () => {
    const rawInc = parseFloat(income) || 0;
    const inc = incomeFreq === "annual" ? rawInc / 12 : rawInc;
    const expNums = Object.fromEntries(Object.entries(expenses).map(([k, v]) => [k, parseFloat(v) || 0]));
    setResult(calcBudget(inc, expNums));
  };

  const defaults = { housing: "1500", transportation: "400", food: "600", utilities: "200", insurance: "300", healthcare: "150", savings: "600", entertainment: "200", personalCare: "100", debt: "300", other: "200" };

  useEffect(() => {
    const expNums = Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, parseFloat(v) || 0]));
    setResult(calcBudget(6000, expNums));
  }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-sm bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the 50/30/20 budgeting rule?", answer: "The 50/30/20 rule (popularized by Senator Elizabeth Warren's book) splits after-tax income into: 50% Needs (housing, food, utilities, insurance, minimum debt payments, transportation for work). 30% Wants (entertainment, dining out, hobbies, subscriptions, new clothing beyond essentials). 20% Savings and debt repayment (emergency fund, retirement, extra debt payments). It's a simplified starting framework — adjust percentages based on your income level and cost of living." },
    { question: "How much should I spend on housing?", answer: "Two common rules: 28% rule (front-end ratio): housing costs should not exceed 28% of gross monthly income. 30% rule: spend no more than 30% of gross income on rent. Many financial experts now recommend 25% or less given rising costs. At $6,000/month gross: 25% = $1,500 max housing. At $8,000/month: $2,000 max. Note: these are gross income percentages — after taxes, you may have significantly less available. High cost-of-living cities often force compromises." },
    { question: "What savings rate should I aim for?", answer: "Minimum: 10–15% of gross income for retirement only (this may not be sufficient for early retirement). Good: 15–20% (covers retirement plus an emergency fund and other goals). Excellent: 25%+ (substantially accelerates wealth building and financial independence). FIRE (Financial Independence) community: 40–60%+ savings rates. The savings rate is the single biggest lever — every percentage point saved increases financial independence timeline dramatically." },
    { question: "What is the 'debt-to-income' ratio and what's healthy?", answer: "Debt-to-Income (DTI) = Total Monthly Debt Payments ÷ Gross Monthly Income. Front-end DTI: housing costs only (target under 28%). Back-end DTI: all debt payments including housing, auto, student loans, credit cards (target under 36%). Mortgage lenders typically require back-end DTI under 43% (conventional) or 50% (FHA). High DTI constrains your ability to save and respond to financial emergencies — a back-end DTI above 35% is a warning sign." },
    { question: "How do I create a budget from scratch?", answer: "1. Calculate true after-tax monthly income (all sources). 2. List all fixed expenses (rent, loan payments, subscriptions — amounts don't change). 3. List all variable expenses (food, utilities, entertainment — track for 3 months for accuracy). 4. Total all expenses and compare to income. 5. Identify areas to cut. 6. Set spending targets by category. 7. Track and review monthly. Tools: budgeting apps (YNAB, Mint, Copilot), bank categorization, or manual spreadsheet. Zero-based budgeting assigns every dollar a job." },
    { question: "How much should I have in an emergency fund?", answer: "Standard recommendation: 3–6 months of essential living expenses in a liquid, high-yield savings account (not invested). Essential expenses = housing + food + utilities + minimum debt payments + insurance. For a family with $4,000/month in essential expenses: $12,000–$24,000 emergency fund. When to go higher (6–12 months): variable income (freelancer, commission-based), single income household, industry susceptible to layoffs, or health issues. Keep emergency funds in HYSA (5%+ interest rates in 2024) to minimize opportunity cost." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Monthly Budget Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Monthly Budget Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Monthly Take-Home Income</label>
              <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 text-muted-foreground">$</span>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Expenses</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {Object.entries(BUDGET_RULES).map(([key, rule]) => (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">{rule.label}</label>
                  <div className={inp}><span className="pl-2 text-muted-foreground text-sm">$</span><input type="number" value={expenses[key] ?? ""} onChange={e => setExpense(key, e.target.value)} className={ci} /></div>
                </div>
              ))}
            </div>
            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="mt-2 p-3 rounded-lg bg-secondary/20 border border-border animate-fade-in-up">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Income Frequency</label>
                  <div className="flex gap-2">
                    {(["monthly", "annual"] as const).map(f => (
                      <button key={f} type="button" onClick={() => setIncomeFreq(f)} className={`flex-1 rounded-md border text-sm py-1.5 font-semibold transition-colors ${incomeFreq === f ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background text-muted-foreground hover:bg-secondary"}` }>
                        {f === "monthly" ? "Monthly" : "Annual (÷12)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setIncome("6000"); setExpenses(defaults); setShowAdv(false); const expNums = Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, parseFloat(v) || 0])); setResult(calcBudget(6000, expNums)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.surplusDeficit >= 0 ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.surplusDeficit >= 0 ? "text-green-600" : "text-red-600"}`}>{result.surplusDeficit >= 0 ? "Monthly Surplus" : "Monthly Deficit"}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.surplusDeficit >= 0 ? "+" : ""}${result.surplusDeficit.toFixed(0)}</div>
                <div className="text-base text-muted-foreground mt-1">Total expenses: ${result.totalAllocated.toFixed(0)} · Savings rate: {result.savingsRate.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Expenses", `$${result.totalAllocated.toFixed(0)}`], ["Savings Rate", `${result.savingsRate.toFixed(1)}%`], ["Housing %", `${parseFloat(income) > 0 ? ((result.housing / parseFloat(income)) * 100).toFixed(1) : 0}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Category Analysis</h3>
                <table className="w-full text-sm"><thead><tr className="border-b border-border text-muted-foreground text-xs"><th className="py-2 text-left">Category</th><th className="py-2 text-right">Amount</th><th className="py-2 text-right">%</th><th className="py-2 text-right">Status</th></tr></thead><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />{r.category}</td>
                      <td className="py-2 text-right font-semibold">${r.amount.toFixed(0)}</td>
                      <td className="py-2 text-right">{r.pct.toFixed(1)}%</td>
                      <td className={`py-2 text-right text-xs font-bold ${r.status.startsWith("✓") ? "text-green-600" : r.status.startsWith("⚠") ? "text-amber-500" : "text-red-500"}`}>{r.status}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.breakdown.length > 0 && (
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Budget Allocation</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="amount" paddingAngle={2}>
                        {result.breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(0)}`, ""]} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className={`font-semibold ${s.label === "Surplus / Deficit" ? (result.surplusDeficit >= 0 ? "text-green-600" : "text-red-600") : ""}`}>{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Build a Monthly Budget</h2>
              <p className="text-muted-foreground leading-relaxed">This monthly budget calculator compares your actual spending against recommended percentages for each category, instantly flagging areas where you are over budget. The status indicators (Good, High, or Over) are based on the widely accepted 50/30/20 framework and standard lender debt-to-income guidelines. Your savings rate, which is money saved plus any monthly surplus, is the single most important metric to optimize over time.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">The 50/30/20 Framework</h2>
              <p className="text-muted-foreground leading-relaxed">The 50/30/20 rule divides after-tax income into three categories. Fifty percent goes to needs: housing, food, utilities, insurance, minimum debt payments, and essential transportation. Thirty percent goes to wants: dining out, entertainment, hobbies, subscriptions, and clothing above essentials. Twenty percent goes to financial goals: retirement contributions, emergency fund building, extra debt paydown, and savings for specific objectives. Adjust these percentages based on your income level and local cost of living.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">The Most Impactful Budget Levers</h2>
              <p className="text-muted-foreground leading-relaxed">Housing is the single largest expense for most households. Every $100 per month saved on housing saves $1,200 per year. Consider roommates, a longer commute, or downsizing to free up significant budget capacity. Transportation is the second-largest expense, with car ownership averaging over $12,000 per year all-in when accounting for loan payments, insurance, gas, maintenance, and depreciation. Food offers one of the highest returns on any budget category: cooking at home versus dining out can save hundreds of dollars each month with only moderate effort.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Setting and Achieving Your Savings Rate</h2>
              <p className="text-muted-foreground leading-relaxed">A minimum savings rate of 10 to 15 percent of gross income covers only basic retirement needs. A rate of 15 to 20 percent is considered good and covers retirement plus an emergency fund and other goals. A rate of 25 percent or higher substantially accelerates wealth building and the path to financial independence. Each additional percentage point saved permanently improves your financial future. The difference between a 10 percent savings rate and a 25 percent savings rate can mean retiring a decade earlier.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/budget-calculator" />
          <PopularCalculators exclude="/calculator/budget-calculator" />
        </div>
      </div>
    </>
  );
}
