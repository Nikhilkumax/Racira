"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, PiggyBank } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TraditionalIraCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [annualContribution, setAnnualContribution] = useState("7000");
  const [currentBalance, setCurrentBalance] = useState("5000");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [taxRate, setTaxRate] = useState("22");
  const [showResults, setShowResults] = useState(false);

  const age = parseFloat(currentAge) || 0;
  const retAge = parseFloat(retirementAge) || 0;
  const contribution = parseFloat(annualContribution) || 0;
  const balance = parseFloat(currentBalance) || 0;
  const r = (parseFloat(annualReturn) || 0) / 100;
  const tax = (parseFloat(taxRate) || 0) / 100;
  const years = Math.max(0, retAge - age);

  const fvCurrentBalance = balance * Math.pow(1 + r, years);
  const fvContributions = r > 0 ? contribution * ((Math.pow(1 + r, years) - 1) / r) : contribution * years;
  const totalFV = fvCurrentBalance + fvContributions;
  const afterTaxValue = totalFV * (1 - tax);
  const annualWithdrawal = afterTaxValue * 0.04;
  const monthlyWithdrawal = annualWithdrawal / 12;
  const annualTaxSavings = contribution * tax;
  const totalContributed = balance + contribution * years;

  const chartData = [];
  for (let y = 0; y <= years; y++) {
    const bal = balance * Math.pow(1 + r, y) + (r > 0 ? contribution * ((Math.pow(1 + r, y) - 1) / r) : contribution * y);
    chartData.push({ age: Math.round(age + y), balance: Math.round(bal) });
  }

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setCurrentAge("30");
    setRetirementAge("65");
    setAnnualContribution("7000");
    setCurrentBalance("5000");
    setAnnualReturn("7");
    setTaxRate("22");
    setShowResults(false);
  };

  const faqs = [
    { question: "How does a Traditional IRA work?", answer: "Contributions are made with pre-tax dollars (deductible if you meet income limits), grow tax-deferred, and withdrawals in retirement are taxed as ordinary income. You get a tax break today and pay later — ideal if you expect a lower tax rate in retirement." },
    { question: "What are the contribution limits?", answer: "For 2024 the limit is $7,000 ($8,000 if age 50+). Contributions must be earned income, and deductibility phases out above certain incomes if you also have a workplace plan — for a single filer with a 401(k), the phase-out starts at $77,000." },
    { question: "What is the 4% rule?", answer: "A retirement withdrawal heuristic: drawing 4% of your portfolio in year one, then adjusting for inflation, historically sustains a 30-year retirement. This calculator applies it to the after-tax balance to estimate sustainable annual income." },
    { question: "When must I withdraw?", answer: "Required Minimum Distributions (RMDs) begin at age 73 for Traditional IRAs — you must withdraw a percentage of the balance each year or face a 25% penalty. Roth IRAs have no RMDs, which is a major reason to hold both account types." },
    { question: "Traditional or Roth — which is better?", answer: "Traditional wins when your tax rate now is higher than in retirement; Roth wins when it is lower or when you want tax-free withdrawals and no RMDs. Many people split contributions to hedge — the calculator lets you compare the after-tax outcomes side by side with its sibling Roth calculator." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Traditional IRA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Traditional IRA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <PiggyBank className="w-4 h-4" /> Tax-Deferred Growth
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Current Age</label>
                <input id="tira-age" type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} min={16} max={80} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Retirement Age</label>
                <input id="tira-retire" type="number" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} min={50} max={75} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Annual Contribution ($)</label>
                <input id="tira-contrib" type="number" value={annualContribution} onChange={(e) => setAnnualContribution(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Current Balance ($)</label>
                <input id="tira-balance" type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Expected Annual Return (%)</label>
                <input id="tira-return" type="number" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} min={0} max={25} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Retirement Tax Rate (%)</label>
                <input id="tira-tax" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} min={0} max={40} className="input-calc" />
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Projected Balance at {retAge}</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(totalFV)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(afterTaxValue)} after {taxRate}% tax · {fmt(annualWithdrawal)}/yr via the 4% rule
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">After-Tax Value</p>
                    <p className="text-2xl font-bold text-primary">{fmt(afterTaxValue)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Withdrawal</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(monthlyWithdrawal)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax Savings Today</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(annualTaxSavings)}/yr</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Metric</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Pre-Tax Balance</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(totalFV)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Years of Growth</td>
                        <td className="py-2.5 px-3 text-right">{years} yrs</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Contributed</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalContributed)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">After-Tax Value</td>
                        <td className="py-2.5 px-3 text-right">{fmt(afterTaxValue)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">4% Rule Annual Withdrawal</td>
                        <td className="py-2.5 px-3 text-right">{fmt(annualWithdrawal)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Annual Tax Savings Today</td>
                        <td className="py-2.5 px-3 text-right">{fmt(annualTaxSavings)}/yr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Projected Growth to Age {retAge}</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="age" tick={{ fontSize: 10 }} label={{ value: "Age", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"} />
                        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Age ${l}`} />
                        <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Contribution / Year</span>
                      <span className="font-medium">{fmt(contribution)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual Return</span>
                      <span className="font-medium">{r * 100}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Total Contributed</span>
                      <span className="font-medium">{fmt(totalContributed)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Growth Multiple</span>
                      <span className="font-medium">{(totalFV / Math.max(1, totalContributed)).toFixed(2)}×</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Withdrawal (4% Rule)</span>
                      <span className="font-medium">{fmt(annualWithdrawal)}/yr</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Monthly Income</span>
                      <span className="font-medium">{fmt(monthlyWithdrawal)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your age, contributions, and expected return, then click <strong className="text-foreground">Calculate</strong> to project your tax-deferred balance and retirement income.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How a Traditional IRA Grows</h2>
            <p>Contributions grow tax-deferred, so you pay ordinary income tax only on withdrawals. A $7,000/year contribution at 22% saves about $1,540 in taxes now. From age 30 to 65, a $5,000 balance plus $7,000/year at 7% grows to roughly $1.02M — about $796K after a 22% tax, funding ~$31,900/year under the 4% rule.</p>
            <h3>The Tax Arbitrage</h3>
            <p>The Traditional IRA's entire value proposition is rate arbitrage: deduct contributions at today's rate, withdraw at retirement's rate. If you retire in a lower bracket (as most people do, with less income), every dollar of difference is pure savings. The deduction also frees cash today — $1,540/year on a maxed contribution — that can itself be invested.</p>
            <h3>Watch the RMDs</h3>
            <p>Unlike a Roth, a Traditional IRA forces withdrawals starting at age 73, whether you need the money or not. High balances can push you into higher tax brackets late in life. Converting to a Roth in low-income years — paying tax now at a low rate — is a common strategy to dodge RMDs entirely.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/traditional-ira-calculator" />
          <PopularCalculators exclude="/calculator/traditional-ira-calculator" />
        </div>
      </div>
    </>
  );
}
