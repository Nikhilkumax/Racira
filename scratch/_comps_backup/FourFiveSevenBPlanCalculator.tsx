"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface Inputs {
  currentBalance: number;
  annualContribution: number;
  employerMatch: number;
  yearsToRetirement: number;
  expectedReturn: number;
  taxRateWithdrawal: number;
  inflationRate: number;
  catchUpContributions: boolean;
}

interface Result {
  projectedBalance: number;
  totalContributions: number;
  totalGrowth: number;
  realBalance: number;
  annualWithdrawal4pct: number;
  monthlyWithdrawal4pct: number;
  taxDeferralSavings: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; balance: number; contributions: number; realBalance: number }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calc457(inp: Inputs): Result {
  const monthlyRate = inp.expectedReturn / 100 / 12;
  const totalMonths = inp.yearsToRetirement * 12;
  const maxContribution2024 = inp.catchUpContributions ? 31000 : 23500;
  const effectiveContribution = Math.min(inp.annualContribution, maxContribution2024);
  const monthlyContrib = effectiveContribution / 12;
  const employerMonthly = (effectiveContribution * (inp.employerMatch / 100)) / 12;

  let balance = inp.currentBalance;
  let totalContrib = inp.currentBalance;
  const chartData: { year: number; balance: number; contributions: number; realBalance: number }[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContrib + employerMonthly;
    totalContrib += monthlyContrib + employerMonthly;
    if (m % 12 === 0) {
      const yr = m / 12;
      const real = inp.inflationRate > 0 ? balance / Math.pow(1 + inp.inflationRate / 100, yr) : balance;
      chartData.push({ year: yr, balance: Math.round(balance), contributions: Math.round(totalContrib), realBalance: Math.round(real) });
    }
  }

  const projectedBalance = balance;
  const totalGrowth = projectedBalance - totalContrib;
  const realBalance = inp.inflationRate > 0 ? projectedBalance / Math.pow(1 + inp.inflationRate / 100, inp.yearsToRetirement) : projectedBalance;
  const annualWithdrawal4pct = projectedBalance * 0.04;
  const monthlyWithdrawal4pct = annualWithdrawal4pct / 12;

  // Tax deferral savings: compare growth in 457b vs taxable account
  const afterTaxReturn = inp.expectedReturn * (1 - inp.taxRateWithdrawal / 100);
  let taxableBalance = inp.currentBalance;
  const taxableMonthlyRate = afterTaxReturn / 100 / 12;
  for (let m = 1; m <= totalMonths; m++) {
    taxableBalance = taxableBalance * (1 + taxableMonthlyRate) + monthlyContrib * (1 - inp.taxRateWithdrawal / 100) + employerMonthly * (1 - inp.taxRateWithdrawal / 100);
  }
  const taxDeferralSavings = projectedBalance - taxableBalance;

  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Current Balance", value: `$${fmt(inp.currentBalance)}` },
    { label: "Annual Contribution", value: `$${fmt(effectiveContribution)}/yr` },
    { label: "Employer Match", value: `${inp.employerMatch}% ($${fmt(effectiveContribution * inp.employerMatch / 100)}/yr)` },
    { label: "Expected Return", value: `${inp.expectedReturn}%/yr` },
    { label: "Years to Retirement", value: `${inp.yearsToRetirement} years` },
    { label: "Total Contributions", value: `$${fmt(totalContrib)}` },
    { label: "Investment Growth", value: `$${fmt(totalGrowth)}`, highlight: true },
    { label: "Projected Balance", value: `$${fmt(projectedBalance)}`, highlight: true },
    { label: "Tax-Deferred Savings vs Taxable", value: `$${fmt(taxDeferralSavings)}` },
  ];

  const summaryStats = [
    { label: "Projected Balance", value: `$${fmt(projectedBalance)}` },
    { label: "Real Balance (Inflation-Adj)", value: `$${fmt(realBalance)}` },
    { label: "Total Contributions", value: `$${fmt(totalContrib)}` },
    { label: "Total Growth", value: `$${fmt(totalGrowth)}` },
    { label: "4% Annual Withdrawal", value: `$${fmt(annualWithdrawal4pct)}/yr` },
    { label: "4% Monthly Withdrawal", value: `$${fmt(monthlyWithdrawal4pct)}/mo` },
    { label: "Tax-Deferred Advantage", value: `$${fmt(taxDeferralSavings)}` },
    { label: "Balance Multiple", value: `${totalContrib > 0 ? (projectedBalance / totalContrib).toFixed(2) : "0"}x` },
  ];

  return { projectedBalance, totalContributions: totalContrib, totalGrowth, realBalance, annualWithdrawal4pct, monthlyWithdrawal4pct, taxDeferralSavings, breakdown, summaryStats, chartData };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: Inputs = {
  currentBalance: 50000, annualContribution: 19500, employerMatch: 0,
  yearsToRetirement: 20, expectedReturn: 7, taxRateWithdrawal: 22,
  inflationRate: 3, catchUpContributions: false,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function FourFiveSevenBPlanCalculator() {
  const [currentBalance, setCurrentBalance] = useState(String(DEFAULTS.currentBalance));
  const [annualContribution, setAnnualContribution] = useState(String(DEFAULTS.annualContribution));
  const [employerMatch, setEmployerMatch] = useState(String(DEFAULTS.employerMatch));
  const [yearsToRetirement, setYearsToRetirement] = useState(String(DEFAULTS.yearsToRetirement));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRateWithdrawal));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflationRate));
  const [catchUp, setCatchUp] = useState(DEFAULTS.catchUpContributions);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const getInputs = (): Inputs => ({
    currentBalance: parseFloat(currentBalance) || 0,
    annualContribution: parseFloat(annualContribution) || 0,
    employerMatch: parseFloat(employerMatch) || 0,
    yearsToRetirement: parseInt(yearsToRetirement) || 1,
    expectedReturn: parseFloat(expectedReturn) || 0,
    taxRateWithdrawal: parseFloat(taxRate) || 0,
    inflationRate: parseFloat(inflation) || 0,
    catchUpContributions: catchUp,
  });

  const calculate = () => setResult(calc457(getInputs()));
  const reset = () => {
    setCurrentBalance(String(DEFAULTS.currentBalance)); setAnnualContribution(String(DEFAULTS.annualContribution));
    setEmployerMatch(String(DEFAULTS.employerMatch)); setYearsToRetirement(String(DEFAULTS.yearsToRetirement));
    setExpectedReturn(String(DEFAULTS.expectedReturn)); setTaxRate(String(DEFAULTS.taxRateWithdrawal));
    setInflation(String(DEFAULTS.inflationRate)); setCatchUp(DEFAULTS.catchUpContributions);
    setResult(calc457(DEFAULTS));
  };

  useEffect(() => { setResult(calc457(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is a 457(b) plan?", answer: "A 457(b) is a tax-deferred retirement savings plan available to state/local government employees and some nonprofit workers. Contributions reduce your taxable income now, and you pay taxes on withdrawals in retirement. Unlike 401(k) plans, 457(b) plans have no 10% early withdrawal penalty — you can withdraw at any age without penalty (though income tax still applies)." },
    { question: "What is the 457(b) contribution limit?", answer: "For 2024, the annual contribution limit is $23,500 (or your full compensation if less). If you're age 50 or older, you can contribute an additional $7,500 in catch-up contributions, bringing the total to $31,000. Some 457(b) plans also offer a special catch-up in the 3 years before normal retirement age." },
    { question: "How does 457(b) differ from 401(k)?", answer: "Key differences: 457(b) has no 10% early withdrawal penalty (401(k) does before age 59½). 457(b) plans are for government/nonprofit employees. 457(b) has separate contribution limits from 401(k) — you can potentially contribute to both. 457(b) funds are subject to creditors of the employer (unlike 401(k) which is federally protected)." },
    { question: "Should I use the 4% rule with my 457(b)?", answer: "The 4% rule suggests withdrawing 4% of your retirement balance in year 1, then adjusting for inflation each year. Historically, this strategy has sustained portfolios for 30+ years. For a $500K balance, that's $20,000/year or ~$1,667/month. Your actual withdrawal rate should depend on your expenses, other income sources, and life expectancy." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "457(b) Plan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">457(b) Plan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Current Balance ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Annual Contribution ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualContribution} onChange={e => setAnnualContribution(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Expected Return (%)</label>
                <div className={inp}><input type="number" value={expectedReturn} onChange={e => setExpectedReturn(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Years to Retirement</label>
                <div className={inp}><input type="number" value={yearsToRetirement} onChange={e => setYearsToRetirement(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Tax & Inflation</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tax Rate at Withdrawal (%)</label>
                      <div className={inp}><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} step="1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Inflation Rate (%)</label>
                      <div className={inp}><input type="number" value={inflation} onChange={e => setInflation(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold mt-2">Employer Match</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Employer Match (%)</label>
                      <div className={inp}><input type="number" value={employerMatch} onChange={e => setEmployerMatch(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input type="checkbox" checked={catchUp} onChange={e => setCatchUp(e.target.checked)} className="rounded border-input" />
                        Catch-Up (50+) — extra $7,500/yr
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Projected Balance at Retirement</div>
                <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.projectedBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">4% Withdrawal: ${result.annualWithdrawal4pct.toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr · Real Value: ${result.realBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Contributions", `$${result.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Growth", `$${result.totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Tax Savings", `$${result.taxDeferralSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">457(b) Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Growth Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Nominal Balance" />
                    <Line type="monotone" dataKey="realBalance" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Real (Inflation-Adj)" />
                    <Line type="monotone" dataKey="contributions" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Contributions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a 457(b) Plan?</h2>
            <p>A 457(b) is a tax-deferred retirement savings plan available to state, local, and some nonprofit government employees. Contributions are made pre-tax, reducing your current taxable income. Investments grow tax-free, and you pay ordinary income tax only on withdrawals in retirement.</p>
            <h2 className="text-2xl font-bold mb-3">Key Advantage: No Early Withdrawal Penalty</h2>
            <p>Unlike 401(k) and IRA plans, the 457(b) has <strong>no 10% early withdrawal penalty</strong> before age 59½. You can access your funds at any age — only regular income tax applies. This makes the 457(b) uniquely flexible as both a retirement and emergency backup plan.</p>
            <h2 className="text-2xl font-bold mb-3">457(b) vs 401(k)</h2>
            <p>Both are tax-deferred, but the 457(b) offers: no early withdrawal penalty, separate contribution limits (you can contribute to both), and access for government/nonprofit employees. The 401(k) offers: employer match in more plans, creditor protection under ERISA, and broader availability in the private sector.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/457b-plan-calculator" />
          <PopularCalculators exclude="/calculator/457b-plan-calculator" />
        </div>
      </div>
    </>
  );
}
