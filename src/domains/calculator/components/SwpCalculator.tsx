"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SwpInput {
  corpus: number;
  monthlyWithdrawal: number;
  annualReturn: number;
  horizonYears: number;
}

interface SwpResult {
  monthsToDeplete: number;
  yearsOfIncome: string;
  totalWithdrawn: number;
  endingBalance: number;
  depleted: boolean;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSwp(input: SwpInput): SwpResult {
  const monthlyRate = input.annualReturn / 12 / 100;
  const months = Math.min(input.horizonYears * 12, 600);
  let balance = input.corpus;
  let totalWithdrawn = 0;
  const chartData: { month: number; balance: number }[] = [{ month: 0, balance: Math.round(balance) }];
  let depleted = false;
  let monthsToDeplete = months;

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) - input.monthlyWithdrawal;
    totalWithdrawn += input.monthlyWithdrawal;
    if (balance <= 0) {
      depleted = true;
      monthsToDeplete = m;
      balance = 0;
      chartData.push({ month: m, balance: 0 });
      break;
    }
    chartData.push({ month: m, balance: Math.round(balance) });
  }

  const yearsOfIncome = depleted ? `${(monthsToDeplete / 12).toFixed(1)} years` : "Full horizon";
  const endingBalance = depleted ? 0 : Math.round(balance);

  const breakdown = [
    { label: "Initial Corpus", value: `$${input.corpus.toLocaleString()}` },
    { label: "Monthly Withdrawal", value: `$${input.monthlyWithdrawal.toLocaleString()}` },
    { label: "Annual Return", value: `${input.annualReturn.toFixed(1)}%` },
    { label: "Withdrawal Horizon", value: `${input.horizonYears} years` },
    { label: "Income Duration", value: yearsOfIncome },
    { label: "Total Withdrawn", value: `$${totalWithdrawn.toLocaleString()}` },
    { label: "Ending Balance", value: `$${endingBalance.toLocaleString()}` },
    { label: "Initial Withdrawal Rate", value: `${input.corpus > 0 ? ((input.monthlyWithdrawal * 12 / input.corpus) * 100).toFixed(1) : 0}%` },
  ];

  const summaryStats = [
    { label: "Income Duration", value: yearsOfIncome },
    { label: "Total Withdrawn", value: `$${totalWithdrawn.toLocaleString()}` },
    { label: "Ending Balance", value: `$${endingBalance.toLocaleString()}` },
    { label: "Monthly Withdrawal", value: `$${input.monthlyWithdrawal.toLocaleString()}` },
    { label: "Withdrawal Rate", value: `${input.corpus > 0 ? ((input.monthlyWithdrawal * 12 / input.corpus) * 100).toFixed(1) : 0}%` },
    { label: "Months Covered", value: `${monthsToDeplete} / ${months}` },
  ];

  return { monthsToDeplete, yearsOfIncome, totalWithdrawn, endingBalance, depleted, chartData, breakdown, summaryStats };
}

const DEFAULTS: SwpInput = { corpus: 500000, monthlyWithdrawal: 2000, annualReturn: 7, horizonYears: 20 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SwpCalculator() {
  const [corpus, setCorpus] = useState(String(DEFAULTS.corpus));
  const [withdrawal, setWithdrawal] = useState(String(DEFAULTS.monthlyWithdrawal));
  const [returnRate, setReturnRate] = useState(String(DEFAULTS.annualReturn));
  const [horizon, setHorizon] = useState(String(DEFAULTS.horizonYears));
  const [result, setResult] = useState<SwpResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSwp({ corpus: parse(corpus, DEFAULTS.corpus), monthlyWithdrawal: parse(withdrawal, DEFAULTS.monthlyWithdrawal), annualReturn: parse(returnRate, DEFAULTS.annualReturn), horizonYears: Math.max(1, parse(horizon, DEFAULTS.horizonYears)) }));
  const reset = () => {
    setCorpus(String(DEFAULTS.corpus));
    setWithdrawal(String(DEFAULTS.monthlyWithdrawal));
    setReturnRate(String(DEFAULTS.annualReturn));
    setHorizon(String(DEFAULTS.horizonYears));
    setResult(calcSwp(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSwp(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is an SWP?", answer: "A Systematic Withdrawal Plan (SWP) is a strategy for drawing a fixed amount from an investment corpus at regular intervals — typically monthly — while the remainder stays invested. It's the natural companion to a SIP (Systematic Investment Plan): SIP builds the corpus, SWP draws it down in retirement." },
    { question: "How much can I withdraw safely?", answer: "The classic 4% rule suggests withdrawing 4% of the corpus in year one, adjusted for inflation — on $500,000 that's $20,000/year ($1,667/month). At a 7% annual return, that rate keeps the corpus intact over 20 years. Withdrawing faster, like 6%+, risks depletion before the horizon ends." },
    { question: "What happens if my withdrawal exceeds returns?", answer: "When monthly withdrawals outpace monthly returns, the corpus shrinks — and as the base shrinks, the returns it generates shrink too, accelerating depletion. This calculator simulates month by month so you can see exactly when a too-high withdrawal rate runs the corpus to zero." },
    { question: "How does the return rate affect SWP longevity?", answer: "Dramatically. At 7% annual return, a 4.8% withdrawal rate survives 20 years comfortably. At 4% return, the same withdrawal rate depletes the corpus in about 15 years. Be conservative with your assumed return — actual market returns vary year to year, and sequence-of-returns risk matters." },
    { question: "Is an SWP the same as an annuity?", answer: "No. An annuity guarantees income for life through an insurance contract. An SWP is self-managed: you control the corpus, can vary withdrawals, and keep the balance invested. The tradeoff is longevity risk — you must manage the withdrawal rate yourself, and returns aren't guaranteed." },
    { question: "Should I adjust withdrawals for inflation?", answer: "Most retirement plans increase withdrawals by inflation (2–3% annually) to preserve purchasing power. That raises the depletion risk meaningfully. This calculator assumes a fixed nominal withdrawal; for inflation-adjusted plans, plan on a lower initial withdrawal rate by roughly 1–1.5%." },
  ];

  const depleteColor = result ? (result.depleted ? "text-red-500" : "text-emerald-600") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "SWP Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">SWP Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Corpus</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={corpus} onChange={(e) => setCorpus(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Withdrawal</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={withdrawal} onChange={(e) => setWithdrawal(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Expected Annual Return</label>
                <div className={inp}><input type="number" value={returnRate} onChange={(e) => setReturnRate(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Withdrawal Horizon</label>
                <div className={inp}><input type="number" value={horizon} onChange={(e) => setHorizon(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Income Duration</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${depleteColor}`}>{result.yearsOfIncome}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total withdrawn: ${result.totalWithdrawn.toLocaleString()} · Ending balance: ${result.endingBalance.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Monthly Income", `$${result.breakdown[1].value}`], ["Total Withdrawn", `$${result.totalWithdrawn.toLocaleString()}`], ["Ending Balance", `$${result.endingBalance.toLocaleString()}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Withdrawal Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Corpus Balance Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} />
                      <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                    </AreaChart>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Systematic Withdrawal Plan?</h2>
            <p>An SWP converts a lump-sum investment into a steady monthly income stream. Each month the plan redeems a fixed amount from the corpus while the remainder continues earning returns. It's the standard way retirees and long-term investors fund living expenses without selling everything at once.</p>
            <h2 className="text-2xl font-bold mb-3">The Withdrawal Rate Math</h2>
            <p>The sustainable withdrawal rate depends on the gap between your withdrawal and your return. Withdraw 4.8% per year against a 7% return and the corpus grows. Withdraw 8% against 5% and depletion is inevitable. This calculator runs the month-by-month simulation so you can see the depletion month precisely.</p>
            <h2 className="text-2xl font-bold mb-3">Planning for the Long Run</h2>
            <p>Keep the initial withdrawal rate at or below 4–5% for a 20+ year horizon. Model conservative returns (5–6%) to stress-test your plan, and consider inflation-indexed withdrawals only after confirming the base rate is sustainable. A well-planned SWP should survive both bear markets and rising costs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swp-calculator" />
          <PopularCalculators exclude="/calculator/swp-calculator" />
        </div>
      </div>
    </>
  );
}
