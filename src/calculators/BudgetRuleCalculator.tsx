"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const BUDGET_CATEGORIES = {
  needs: [
    { name: "Housing (rent/mortgage)", key: "housing", pct: 0.30 },
    { name: "Groceries & Food", key: "groceries", pct: 0.10 },
    { name: "Utilities", key: "utilities", pct: 0.04 },
    { name: "Transportation", key: "transport", pct: 0.06 },
  ],
  wants: [
    { name: "Dining Out", key: "dining", pct: 0.08 },
    { name: "Entertainment", key: "entertainment", pct: 0.06 },
    { name: "Shopping", key: "shopping", pct: 0.08 },
    { name: "Subscriptions", key: "subscriptions", pct: 0.04 },
    { name: "Personal Care", key: "personal", pct: 0.04 },
  ],
  savings: [
    { name: "Emergency Fund", key: "emergency", pct: 0.08 },
    { name: "Retirement (401k/IRA)", key: "retirement", pct: 0.08 },
    { name: "Debt Repayment", key: "debt", pct: 0.04 },
  ],
};

const COLORS = { needs: "#3b82f6", wants: "#f59e0b", savings: "#10b981" };

export default function BudgetRuleCalculator() {
  const [income, setIncome] = useState("6000");
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const [res, setRes] = useState<{ monthly: number; needs: number; wants: number; savings: number; annual: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const raw = parseFloat(income) || 0;
    const monthly = period === "monthly" ? raw : raw / 12;
    setRes({
      monthly,
      needs: monthly * 0.5,
      wants: monthly * 0.3,
      savings: monthly * 0.2,
      annual: monthly * 12,
    });
  };

  const reset = () => { setIncome("6000"); setPeriod("monthly"); };

  const pieData = res ? [
    { name: "Needs (50%)", value: +res.needs.toFixed(0), color: COLORS.needs },
    { name: "Wants (30%)", value: +res.wants.toFixed(0), color: COLORS.wants },
    { name: "Savings (20%)", value: +res.savings.toFixed(0), color: COLORS.savings },
  ] : [];

  const faqs = [
    { question: "What is the 50/30/20 budget rule?", answer: "The 50/30/20 rule is a simple budgeting framework popularized by Senator Elizabeth Warren in her book 'All Your Worth.' It recommends allocating your after-tax income as follows: 50% to needs (essential expenses you can't avoid), 30% to wants (discretionary spending that enhances your lifestyle), and 20% to savings and debt repayment. It's designed to be simple enough to follow without detailed expense tracking." },
    { question: "What counts as 'needs' vs 'wants'?", answer: "Needs are expenses required for basic living and work: rent/mortgage, utilities, groceries, minimum debt payments, basic insurance, transportation to work. Wants are non-essential spending you choose to have: dining out, entertainment, streaming services, gym memberships, vacations, upgraded phone plans. The line isn't always clear — an internet connection may be a need for remote workers but a want for others." },
    { question: "Should I use gross or after-tax income?", answer: "Use after-tax (take-home) income. This is the money actually available to you after federal, state, and FICA taxes are withheld. If your gross salary is $80,000 but you take home $62,000, use $62,000 as your base. Don't include pre-tax 401(k) contributions in your take-home — those should be counted in the 20% savings category separately." },
    { question: "What if 50% isn't enough for needs?", answer: "In high cost-of-living cities (New York, San Francisco, London), housing alone can exceed 30–40% of take-home pay. If needs exceed 50%, prioritize: look for lower-cost housing, eliminate discretionary needs, maximize income, or temporarily reduce the savings percentage to 10–15% until income increases. The 50/30/20 rule is a guideline, not a rigid constraint." },
    { question: "Is 20% savings enough for retirement?", answer: "It depends on when you start and your retirement goals. Starting at 25 and saving 20% of a $60,000 income for 40 years at 7% average return produces approximately $1.8M — sufficient for a comfortable retirement. Starting at 40 may require 30–40% savings to reach similar results. The rule is a solid baseline, but early savers can afford to save less while late starters need to save more." },
    { question: "How does this differ from the envelope system or zero-based budgeting?", answer: "The 50/30/20 rule is macro-level budgeting — it divides spending into three broad categories without tracking every expense. The envelope system allocates specific cash amounts to spending categories, requiring cash discipline. Zero-based budgeting assigns every dollar a job, giving maximum control but requiring the most effort. The 50/30/20 rule is best for people who want structure without spreadsheet obsession." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "50/30/20 Budget Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">50/30/20 Budget Rule Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Your Income</h2>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Income Period</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["monthly", "annual"] as const).map(p => (
                  <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {p === "monthly" ? "Monthly" : "Annual"}
                  </button>
                ))}
              </div>
            </div>
            <CompactInput id="income" label={`${period === "monthly" ? "Monthly" : "Annual"} After-Tax Income`} value={income} onChange={setIncome} prefix="$" />
            <div className="bg-secondary/30 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-bold text-foreground">The 50/30/20 Framework</p>
              <div className="flex justify-between"><span className="text-blue-500 font-semibold">50% Needs</span><span className="text-muted-foreground">Essentials: housing, food, transport</span></div>
              <div className="flex justify-between"><span className="text-amber-500 font-semibold">30% Wants</span><span className="text-muted-foreground">Lifestyle: dining, fun, shopping</span></div>
              <div className="flex justify-between"><span className="text-emerald-500 font-semibold">20% Savings</span><span className="text-muted-foreground">Future: emergency fund, retirement, debt</span></div>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Your Monthly Budget</h2>
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "50% Needs", value: fmt(res.needs), cls: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600" },
                    { label: "30% Wants", value: fmt(res.wants), cls: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-600" },
                    { label: "20% Savings", value: fmt(res.savings), cls: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-600" },
                  ].map(item => (
                    <div key={item.label} className={`bg-gradient-to-br ${item.cls.split(" text-")[0]} border rounded-xl p-4 text-center`}>
                      <div className={`text-[11px] font-bold mb-1 uppercase tracking-wider ${item.cls.split("border-")[0].split("text-")[1] ? "text-" + item.cls.split(" text-")[1] : "text-muted-foreground"}`}>{item.label}</div>
                      <div className="text-xl font-extrabold text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">per month</div>
                    </div>
                  ))}
                </div>
                {/* Detailed breakdown */}
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Category</th><th className="p-2.5 pr-3 text-right">Monthly</th><th className="p-2.5 pr-3 text-right">Annual</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="bg-blue-500/5"><td colSpan={3} className="p-2 pl-3 text-xs font-bold text-blue-600 uppercase tracking-wider">NEEDS (50%)</td></tr>
                      {BUDGET_CATEGORIES.needs.map(cat => (
                        <tr key={cat.key} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 text-muted-foreground">{cat.name}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(res.monthly * cat.pct)}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(res.monthly * cat.pct * 12)}</td>
                        </tr>
                      ))}
                      <tr className="bg-amber-500/5"><td colSpan={3} className="p-2 pl-3 text-xs font-bold text-amber-600 uppercase tracking-wider">WANTS (30%)</td></tr>
                      {BUDGET_CATEGORIES.wants.map(cat => (
                        <tr key={cat.key} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 text-muted-foreground">{cat.name}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(res.monthly * cat.pct)}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(res.monthly * cat.pct * 12)}</td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-500/5"><td colSpan={3} className="p-2 pl-3 text-xs font-bold text-emerald-600 uppercase tracking-wider">SAVINGS (20%)</td></tr>
                      {BUDGET_CATEGORIES.savings.map(cat => (
                        <tr key={cat.key} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 text-muted-foreground">{cat.name}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(res.monthly * cat.pct)}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(res.monthly * cat.pct * 12)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-1">Budget Allocation</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                        <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Monthly Income", value: fmt(res.monthly) },
                    { label: "Annual Income", value: fmt(res.annual) },
                    { label: "Annual Savings", value: fmt(res.savings * 12) },
                    { label: "10-yr Savings*", value: fmt(res.savings * 12 * 10 * 1.07) },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">*10-year savings estimate assumes 7% average annual investment return.</p>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the 50/30/20 Budget Rule?</h2>
            <p>The 50/30/20 rule is a simple, powerful budgeting framework that divides your after-tax income into three broad categories: 50% for needs, 30% for wants, and 20% for savings and debt repayment. First popularized by U.S. Senator Elizabeth Warren and her daughter Amelia Warren Tyagi in their 2005 book "All Your Worth: The Ultimate Lifetime Money Plan," this framework provides a starting point for anyone who wants financial structure without the complexity of tracking every dollar.</p>
            <p>Unlike detailed budgeting systems that require itemizing every expense, the 50/30/20 rule works at the macro level — giving you three clear buckets to allocate your income into. This simplicity is its greatest strength, making it sustainable for long-term financial planning rather than a strict regimen that's abandoned after a few months.</p>

            <h2 className="text-2xl font-bold mb-3">The 50%: Needs</h2>
            <p>Needs are essential expenses you must pay to maintain your basic standard of living. These are non-negotiable costs that remain relatively fixed from month to month. Examples include: rent or mortgage payments, utility bills (electricity, gas, water, internet for remote workers), groceries and basic food, health insurance premiums, minimum debt payments on loans and credit cards, transportation costs to work (car payment, insurance, fuel, or public transit), and childcare if required to work.</p>
            <p>The goal of keeping needs below 50% creates a financial buffer. If you spend 80% on needs, any income disruption immediately creates a crisis. Keeping needs at 50% means you have 50% of income for life enrichment and future security.</p>

            <h2 className="text-2xl font-bold mb-3">The 30%: Wants</h2>
            <p>Wants are discretionary expenses that improve quality of life but aren't essential for survival. This category is often the most flexible and the first to be adjusted when financial circumstances change. Examples include: dining out and restaurant meals, entertainment (movies, concerts, sports), streaming subscriptions (Netflix, Spotify), gym memberships, travel and vacations, shopping for clothing beyond basics, hobbies, and upgraded versions of necessary items (a more expensive car when a basic one would suffice).</p>
            <p>Many people struggle to identify what's a want vs. need. A useful test: could you survive without it for 30 days without significant hardship? If yes, it's a want. Having a car might be a need; having a luxury car is a want. Internet may be a need; streaming services are wants.</p>

            <h2 className="text-2xl font-bold mb-3">The 20%: Savings and Debt Repayment</h2>
            <p>The savings bucket covers your future self. This includes: emergency fund contributions (target 3–6 months of expenses), retirement account contributions (401(k), IRA, Roth IRA), investment accounts, additional debt repayments above minimums (especially high-interest debt), college savings funds (529 plans), and other goal-based savings. Financial experts recommend prioritizing in this order: 401(k) to employer match (free money), high-interest debt payoff, emergency fund, then additional retirement and investment savings.</p>

            <h2 className="text-2xl font-bold mb-3">Adapting the 50/30/20 Rule to Your Situation</h2>
            <p>The 50/30/20 rule is a starting point, not a rigid law. In high cost-of-living cities where rent exceeds 40% of take-home pay, the framework may need to be adjusted to 60/20/20 temporarily until income increases or you relocate. Those with high debt loads might use 50/20/30, directing more to debt payoff. Aggressive savers pursuing financial independence often flip the framework to 50/20/30 (30% savings) or even more. Those close to retirement may increase savings to 30–40%. The key insight is keeping a structured balance between living today and securing tomorrow.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/50-30-20-budget-calculator" />
          <PopularCalculators exclude="/calculator/50-30-20-budget-calculator" />
        </div>
      </div>
    </>
  );
}
