"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, PiggyBank } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SavingsCalculator() {
  const [initialDeposit, setInitialDeposit] = useState("5000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [annualRate, setAnnualRate] = useState("7");
  const [years, setYears] = useState("20");
  const [compoundFreq, setCompoundFreq] = useState("12");
  const [inflationRate, setInflationRate] = useState("3");
  const [showResults, setShowResults] = useState(false);

  const P = parseFloat(initialDeposit) || 0;
  const PMT = parseFloat(monthlyContribution) || 0;
  const r = (parseFloat(annualRate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const n = parseInt(compoundFreq) || 12;
  const inf = (parseFloat(inflationRate) || 0) / 100;

  const rn = r / n;
  const periods = n * t;
  const fvInitial = P * Math.pow(1 + rn, periods);
  const contributionPerPeriod = PMT * (12 / n);
  const fvContributions = rn > 0 ? contributionPerPeriod * ((Math.pow(1 + rn, periods) - 1) / rn) : contributionPerPeriod * periods;
  const totalSavings = fvInitial + fvContributions;
  const totalContributions = P + PMT * 12 * t;
  const interestEarned = totalSavings - totalContributions;
  const inflationAdjusted = totalSavings / Math.pow(1 + inf, t);
  const contributionShare = totalSavings > 0 ? (totalContributions / totalSavings) * 100 : 0;
  const interestShare = totalSavings > 0 ? (interestEarned / totalSavings) * 100 : 0;

  const chartData = [];
  for (let y = 0; y <= t; y++) {
    const p2 = n * y;
    const bal = P * Math.pow(1 + rn, p2) + (rn > 0 ? contributionPerPeriod * ((Math.pow(1 + rn, p2) - 1) / rn) : contributionPerPeriod * p2);
    chartData.push({ year: y, balance: Math.round(bal), contributed: Math.round(P + PMT * 12 * y) });
  }

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setInitialDeposit("5000");
    setMonthlyContribution("500");
    setAnnualRate("7");
    setYears("20");
    setCompoundFreq("12");
    setInflationRate("3");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is compound interest?", answer: "Interest earned on both your principal and previously earned interest. The frequency matters: monthly compounding (this calculator's default) adds interest 12 times a year, so each month's interest begins earning interest itself — the engine behind long-term growth." },
    { question: "How much should I save each month?", answer: "A common target is 15–20% of gross income including any employer match. What matters more than the percentage is consistency — $500/month at 7% for 20 years becomes $280,000, while waiting five years to start halves the compounding runway." },
    { question: "What is a realistic long-term return?", answer: "The S&P 500 has historically averaged about 10% per year before inflation, roughly 7% after. CDs and high-yield savings pay 4–5% today but are effectively risk-free. Use 7% for a diversified stock-heavy portfolio and 3–5% for conservative goals." },
    { question: "How does inflation affect my savings?", answer: "A 7% nominal return with 3% inflation is only a 4% real return. $280,000 in 20 years buys roughly what $155,000 buys today at 3% inflation. This calculator shows both numbers so your goal is measured in today's dollars, not tomorrow's." },
    { question: "Should I invest or keep it in savings?", answer: "Keep 3–6 months of expenses in liquid savings for emergencies, then invest the rest according to your time horizon. Money needed within 3–5 years belongs in savings or bonds; money for retirement decades away belongs in equities, where compounding does the heavy lifting." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <PiggyBank className="w-4 h-4" /> Compound Growth
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Initial Deposit ($)</label>
                <input id="sv-initial" type="number" value={initialDeposit} onChange={(e) => setInitialDeposit(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Monthly Contribution ($)</label>
                <input id="sv-monthly" type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Annual Interest Rate (%)</label>
                <input id="sv-rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} min={0} max={25} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Time Period (years)</label>
                <input id="sv-years" type="number" value={years} onChange={(e) => setYears(e.target.value)} min={1} max={60} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Compounding Frequency</label>
                <select value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value)} className="input-calc">
                  <option value="365">Daily</option>
                  <option value="12">Monthly</option>
                  <option value="4">Quarterly</option>
                  <option value="2">Semi-annual</option>
                  <option value="1">Annual</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Inflation Rate (%)</label>
                <input id="sv-inflation" type="number" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} min={0} max={15} className="input-calc" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Savings</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(totalSavings)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(interestEarned)} interest earned · {fmt(inflationAdjusted)} in today's dollars
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Contributed</p>
                    <p className="text-2xl font-bold text-primary">{fmt(totalContributions)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Interest Earned</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(interestEarned)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Inflation-Adjusted</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(inflationAdjusted)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Component</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                        <th className="py-2.5 px-3 font-medium text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Total Savings</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(totalSavings)}</td>
                        <td className="py-2.5 px-3 text-right">100%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">From Initial Deposit</td>
                        <td className="py-2.5 px-3 text-right">{fmt(fvInitial)}</td>
                        <td className="py-2.5 px-3 text-right">{totalSavings > 0 ? ((fvInitial / totalSavings) * 100).toFixed(0) : 0}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">From Monthly Contributions</td>
                        <td className="py-2.5 px-3 text-right">{fmt(fvContributions)}</td>
                        <td className="py-2.5 px-3 text-right">{totalSavings > 0 ? ((fvContributions / totalSavings) * 100).toFixed(0) : 0}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Contributed</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalContributions)}</td>
                        <td className="py-2.5 px-3 text-right">{contributionShare.toFixed(0)}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Interest Earned</td>
                        <td className="py-2.5 px-3 text-right font-medium">{fmt(interestEarned)}</td>
                        <td className="py-2.5 px-3 text-right">{interestShare.toFixed(0)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Balance vs. Contributions Over Time</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"} />
                        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Year ${l}`} />
                        <Line type="monotone" dataKey="balance" name="Balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="contributed" name="Contributed" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">The gap between the two lines is the compounding payoff.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Initial Deposit</span>
                      <span className="font-medium">{fmt(P)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Monthly Contribution</span>
                      <span className="font-medium">{fmt(PMT)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual Rate</span>
                      <span className="font-medium">{r * 100}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Compounding</span>
                      <span className="font-medium capitalize">{n === 365 ? "Daily" : n === 12 ? "Monthly" : n === 4 ? "Quarterly" : n === 2 ? "Semi-annual" : "Annual"}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Interest Share</span>
                      <span className="font-medium">{interestShare.toFixed(0)}% of total</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Inflation-Adjusted</span>
                      <span className="font-medium">{fmt(inflationAdjusted)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your deposit, monthly contribution, and rate, then click <strong className="text-foreground">Calculate</strong> to project your savings with compound interest.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Compound Interest Works</h2>
            <p>$5,000 growing at 7% for 20 years with $500/month reaches about $280,000 — more than double the $125,000 contributed, with compounding doing the heavy lifting. Inflation at 3% trims the real purchasing power to roughly $155,000 in today's dollars.</p>
            <h3>The Eighth Wonder</h3>
            <p>Compounding rewards time more than amount: the same $500/month for 40 years at 7% produces about $1.3M, roughly five times the 20-year result — even though you only doubled your contributions. Starting early is the single most powerful lever in personal finance, because the last decade of growth dwarfs the first.</p>
            <h3>Nominal vs. Real</h3>
            <p>Always compare goals in real (inflation-adjusted) dollars. A $280,000 nominal balance in 2044 buys what $155,000 buys today at 3% inflation. Planning with the real number prevents the classic error of hitting your nominal target and discovering it funds far less than expected.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/savings-calculator" />
          <PopularCalculators exclude="/calculator/savings-calculator" />
        </div>
      </div>
    </>
  );
}
