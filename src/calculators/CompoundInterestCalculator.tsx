"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompoundInterestCalculator = () => {
  const DEFAULTS = { principal: "10000", rate: "7", years: "20", frequency: "12", contribution: "200" };
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [contribution, setContribution] = useState(DEFAULTS.contribution);
  const [result, setResult] = useState<any>(null);

  const calculate = (pV = principal, rV = rate, yV = years, fV = frequency, cV = contribution) => {
    const P = parseFloat(pV), r = parseFloat(rV) / 100, y = parseFloat(yV);
    const n = parseFloat(fV), c = parseFloat(cV);
    if ([P, r, y, n, c].some(isNaN) || P <= 0 || y <= 0 || n <= 0) return;

    const rN = r / n;
    const periods = n * y;
    const principalGrowth = P * Math.pow(1 + rN, periods);
    const contribGrowth = c * ((Math.pow(1 + rN, periods) - 1) / rN);
    const total = principalGrowth + contribGrowth;
    const totalContrib = c * periods;
    const totalInterest = total - P - totalContrib;

    const chartData = Array.from({ length: Math.min(Math.ceil(y) + 1, 21) }, (_, i) => {
      const t = (y / Math.min(y, 20)) * i;
      const pg = P * Math.pow(1 + rN, n * t);
      const cg = c * ((Math.pow(1 + rN, n * t) - 1) / rN);
      return {
        name: `Yr ${Math.round(t)}`,
        principal: parseFloat(P.toFixed(0)),
        contributions: parseFloat((c * n * t).toFixed(0)),
        interest: parseFloat((pg + cg - P - c * n * t).toFixed(0)),
        total: parseFloat((pg + cg).toFixed(0)),
      };
    });

    setResult({
      primary: `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      subtitle: `After ${y} years at ${(r * 100).toFixed(1)}% compounded ${n === 12 ? "monthly" : n === 4 ? "quarterly" : n === 1 ? "annually" : `${n}×/yr`}`,
      rows: [
        { label: "Initial Principal", value: `$${P.toLocaleString()}` },
        { label: "Monthly Contribution", value: `$${c.toLocaleString()}` },
        { label: "Annual Interest Rate", value: `${(r * 100).toFixed(2)}%` },
        { label: "Compound Frequency", value: `${n}× per year` },
        { label: "Time Period", value: `${y} years` },
        { label: "Total Contributions", value: `$${totalContrib.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        { label: "Total Interest Earned", value: `$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        { label: "Final Balance", value: `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
      ],
      chartData,
      summary: [
        { label: "Principal invested", value: `$${P.toLocaleString()}` },
        { label: "Contributions", value: `$${totalContrib.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        { label: "Interest earned", value: `$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        { label: "Final balance", value: `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setYears(DEFAULTS.years);
    setFrequency(DEFAULTS.frequency); setContribution(DEFAULTS.contribution);
    calculate(DEFAULTS.principal, DEFAULTS.rate, DEFAULTS.years, DEFAULTS.frequency, DEFAULTS.contribution);
  };

  const freqOptions = [["1", "Annually"], ["4", "Quarterly"], ["12", "Monthly"], ["365", "Daily"]];

  const faqs = [
    { question: "What is the compound interest formula?", answer: "A = P(1 + r/n)^(nt) where P = principal, r = annual rate (decimal), n = compounds per year, t = years. With regular contributions: add C × [(1+r/n)^(nt)−1]/(r/n) where C is the contribution per period." },
    { question: "How does compound frequency affect returns?", answer: "More frequent compounding = slightly higher returns. $10,000 at 7% for 20 years: annual compounding = $38,697; monthly = $40,064; daily = $40,136. The difference between monthly and daily is minimal." },
    { question: "What is the Rule of 72?", answer: "Divide 72 by the annual interest rate to estimate years to double. At 7%: 72/7 ≈ 10.3 years. At 10%: 72/10 ≈ 7.2 years. This is a quick mental approximation." },
    { question: "What does 'compounding' mean?", answer: "Compounding means interest is calculated on the accumulated interest from previous periods, not just the original principal. This creates exponential — rather than linear — growth." },
    { question: "How much difference do regular contributions make?", answer: "Enormous. $10,000 at 7% for 20 years grows to ~$40,000. Adding just $200/month grows to over $150,000 — contributions account for more than the initial principal in long-term growth." },
    { question: "What is the difference between APR and APY?", answer: "APR (Annual Percentage Rate) is the stated rate. APY (Annual Percentage Yield) accounts for compounding. APY = (1 + APR/n)^n − 1. Monthly compounding at 7% APR gives 7.229% APY." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Compound Interest Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Compound Interest Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Initial Principal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10000" min="0" step="any" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Annual Interest Rate</label>
              <div className="relative">
                <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                  className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="7" min="0" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Time Period</label>
              <div className="relative">
                <input type="number" value={years} onChange={e => setYears(e.target.value)}
                  className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="20" min="1" step="1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Compound Frequency</label>
              <div className="flex gap-2 flex-wrap">
                {freqOptions.map(([val, label]) => (
                  <button key={val} onClick={() => { setFrequency(val); calculate(principal, rate, years, val, contribution); }}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${frequency === val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Monthly Contribution</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={contribution} onChange={e => setContribution(e.target.value)}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="200" min="0" step="any" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Final Balance</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Balance Growth Over Time</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={result.chartData}>
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={3} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                      <ReferenceLine y={parseFloat(principal)} stroke="#f59e0b" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#totalGrad)" strokeWidth={2} name="Total Balance" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Compound Interest Calculator?</h2>
            <p>A compound interest calculator computes how an investment grows when interest is earned on both the initial principal and the accumulated interest from previous periods. This "interest on interest" effect — compounding — is the most powerful force in personal finance. Pre-filled with $10,000 invested at 7% for 20 years with $200/month contributions, the calculator shows the final balance, the breakdown of principal vs contributions vs interest, and a growth chart showing how the balance accelerates over time.</p>
            <p>Understanding compound interest is essential for retirement planning, savings goal-setting, loan comparison, and investment analysis. Albert Einstein allegedly called compound interest "the eighth wonder of the world" — whether or not the quote is authentic, the math is undeniably powerful.</p>
            <h2>The Compound Interest Formula</h2>
            <p><strong>Without contributions:</strong> A = P × (1 + r/n)^(n×t)</p>
            <p><strong>With regular contributions:</strong> A = P(1 + r/n)^(nt) + C × [(1 + r/n)^(nt) − 1] / (r/n)</p>
            <p>Where P = principal, r = annual rate (decimal), n = compounds per year, t = years, C = contribution per period. For the default: A = 10000(1 + 0.07/12)^240 + 200 × [(1.00583)^240 − 1] / 0.00583 ≈ $152,000+.</p>
            <h2>The Rule of 72</h2>
            <p>A quick mental math shortcut: divide 72 by your annual interest rate to estimate the years needed to double your money. At 7%: 72/7 ≈ 10.3 years. At 10%: 72/10 = 7.2 years. At 1% (savings account): 72/1 = 72 years. This approximation works because ln(2) ≈ 0.693, and at typical interest rates, the continuous compounding formula simplifies to this ratio.</p>
            <h2>Compound Frequency Comparison</h2>
            <p>More frequent compounding produces higher effective yields. $10,000 at 7% for 20 years: Annual (n=1): $38,697. Quarterly (n=4): $39,858. Monthly (n=12): $40,064. Daily (n=365): $40,136. The effective annual yield (APY) for 7% monthly compounded: (1 + 0.07/12)^12 − 1 = 7.229%. The difference between monthly and daily compounding is less than $75 over 20 years — frequency matters most when you compare annual vs monthly.</p>
            <h2>The Power of Regular Contributions</h2>
            <p>The contribution term in the formula grows explosively. With $10,000 at 7% for 20 years (no contributions): ~$40,000. Add $200/month: ~$152,000. The $48,000 in contributions ($200 × 240 months) generates over $60,000 in interest — more than the original $10,000 principal generated. Starting early matters even more: $200/month for 30 years at 7% grows to over $242,000.</p>
            <h2>Real-World Applications</h2>
            <p><strong>Retirement planning:</strong> A 25-year-old investing $500/month at 7% for 40 years accumulates over $1.3 million. A 35-year-old investing the same amount for 30 years accumulates only $567,000 — the 10-year head start more than doubles the outcome. <strong>Emergency fund:</strong> Keeping $10,000 in a 4.5% high-yield savings account for 5 years grows to about $12,462. <strong>Debt payoff:</strong> The same formula works in reverse for credit card debt at 20% APR. Pair with the <a href="/calculator/loan-calculator">loan calculator</a> for debt analysis.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Use the frequency toggle to compare compounding intervals. Adjust the contribution field to model different savings scenarios. The orange dashed line on the chart marks your initial principal, showing clearly when the compounding effect begins to dominate. For retirement-specific planning including employer match and tax-advantaged accounts, see the <a href="/calculator/retirement-calculator">retirement calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/compound-interest-calculator" />
          <PopularCalculators exclude="/calculator/compound-interest-calculator" />
        </div>
      </div>
    </>
  );
};
export default CompoundInterestCalculator;
