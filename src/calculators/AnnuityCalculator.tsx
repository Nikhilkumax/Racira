"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AnnuityResult {
  presentValue: number;
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  periodicPayment: number;
  chartData: { year: number; balance: number; contributions: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcAnnuity(
  payment: number, rate: number, periods: number,
  type: "ordinary" | "due", mode: "pv" | "fv"
): AnnuityResult {
  const r = rate / 100 / 12;
  const n = periods * 12;
  const typeAdj = type === "due" ? (1 + r) : 1;

  const pv = r > 0
    ? payment * ((1 - Math.pow(1 + r, -n)) / r) * typeAdj
    : payment * n;
  const fv = r > 0
    ? payment * ((Math.pow(1 + r, n) - 1) / r) * typeAdj
    : payment * n;

  const totalContributions = payment * n;
  const totalInterest = fv - totalContributions;

  const chartData: { year: number; balance: number; contributions: number }[] = [];
  let balance = 0;
  for (let y = 1; y <= periods; y++) {
    const monthsIn = y * 12;
    balance = r > 0
      ? payment * ((Math.pow(1 + r, monthsIn) - 1) / r) * typeAdj
      : payment * monthsIn;
    chartData.push({ year: y, balance: Math.round(balance), contributions: payment * monthsIn });
  }

  const breakdown = [
    { label: "Periodic Payment", value: `$${payment.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Annual Interest Rate", value: `${rate}%` },
    { label: "Investment Period", value: `${periods} years` },
    { label: "Payment Timing", value: type === "due" ? "Annuity Due (Start of Period)" : "Ordinary Annuity (End of Period)" },
    { label: "Total Contributions", value: `$${totalContributions.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: "Total Interest Earned", value: `$${totalInterest.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: "Present Value", value: `$${pv.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Future Value", value: `$${fv.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${payment.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Annual Payment", value: `$${(payment * 12).toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: "Future Value", value: `$${fv.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: "Present Value", value: `$${pv.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: "Interest % of Total", value: `${totalContributions > 0 ? ((totalInterest / fv) * 100).toFixed(1) : 0}%` },
  ];

  return { presentValue: pv, futureValue: fv, totalContributions, totalInterest, periodicPayment: payment, chartData, breakdown, summaryStats };
}

const DEFAULTS = { payment: "500", rate: "7", periods: "20", type: "ordinary" as "ordinary" | "due" };

export default function AnnuityCalculator() {
  const [payment, setPayment] = useState(DEFAULTS.payment);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [periods, setPeriods] = useState(DEFAULTS.periods);
  const [annType, setAnnType] = useState<"ordinary" | "due">(DEFAULTS.type);
  const [result, setResult] = useState<AnnuityResult | null>(null);

  const calculate = () => {
    setResult(calcAnnuity(parseFloat(payment) || 500, parseFloat(rate) || 7, parseInt(periods) || 20, annType, "fv"));
  };

  const reset = () => {
    setPayment(DEFAULTS.payment); setRate(DEFAULTS.rate); setPeriods(DEFAULTS.periods); setAnnType(DEFAULTS.type);
    setResult(calcAnnuity(500, 7, 20, "ordinary", "fv"));
  };

  useEffect(() => { setResult(calcAnnuity(500, 7, 20, "ordinary", "fv")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is an annuity?", answer: "An annuity is a series of equal payments made at regular intervals. Common types include ordinary annuities (payments at end of period) and annuity-due (payments at start). Annuities are used for retirement income, mortgage payments, and savings plans." },
    { question: "What is the difference between ordinary annuity and annuity due?", answer: "In an ordinary annuity, payments are made at the end of each period. In an annuity due, payments are made at the beginning. Annuity due is worth slightly more because each payment has one extra period to compound." },
    { question: "How is future value of an annuity calculated?", answer: "FV = PMT × [(1 + r)^n − 1] / r, where PMT is the periodic payment, r is the periodic interest rate, and n is the total number of periods. For annuity due, multiply by (1 + r)." },
    { question: "What is a good annuity return rate?", answer: "Fixed annuities typically offer 3–5% annually. Variable annuities tied to markets may return 6–9% long-term. Index annuities offer 4–7%. Always compare to alternatives like index funds (7–10% historical average) when evaluating annuity products." },
    { question: "Should I buy an annuity for retirement?", answer: "Annuities work best for people who want guaranteed income they can't outlive. They're less suitable if you have other income sources, need liquidity, or are in poor health. Generally, annuities make sense after maxing out 401(k) and IRA contributions." },
    { question: "What is present value of an annuity?", answer: "Present value is the current worth of all future payments discounted at a given interest rate. PV = PMT × [1 − (1 + r)^−n] / r. It answers: 'How much money do I need today to fund these future payments?'" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Annuity Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Annuity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Monthly Payment</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Period (Years)</label>
                <div className={inp}><input type="number" value={periods} onChange={e => setPeriods(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Payment Timing</label>
              <div className="grid grid-cols-2 gap-2">
                {(["ordinary", "due"] as const).map(t => (
                  <button key={t} onClick={() => setAnnType(t)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${annType === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>
                    {t === "ordinary" ? "Ordinary (End)" : "Due (Start)"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Future Value</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.futureValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Present Value: ${result.presentValue.toLocaleString("en-US", { minimumFractionDigits: 0 })} · Interest earned: ${result.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Contributions", `$${result.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Future Value", `$${result.futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Annuity Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Growth Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                    <Bar dataKey="contributions" name="Contributions" fill="hsl(var(--primary)/0.4)" />
                    <Bar dataKey="balance" name="Total Value" fill="hsl(var(--primary))" />
                  </BarChart>
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
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is an Annuity?</h2>
            <p>An <strong>annuity</strong> is a financial product that provides a series of equal periodic payments over time. Used widely in retirement planning, insurance products, and loan structures, annuities offer predictable cash flows that help individuals plan their financial future. This <strong>annuity calculator</strong> computes both present value and future value based on your payment amount, interest rate, and investment horizon.</p>
            <h2>How Annuity Calculations Work</h2>
            <p>Future Value: FV = PMT × [(1 + r)^n − 1] / r. Present Value: PV = PMT × [1 − (1 + r)^−n] / r. For annuity-due (payments at start of period), multiply the result by (1 + r). Where PMT = periodic payment, r = periodic rate (annual rate ÷ 12 for monthly), n = total periods.</p>
            <h2>Understanding Your Results</h2>
            <p>Future value shows the total amount your payments will grow to by the end of the investment period — including compound interest. Present value shows what that stream of payments is worth in today's dollars. The difference between future value and total contributions is pure interest earned through compounding.</p>
            <h2>Key Factors That Affect Annuity Value</h2>
            <p>Interest rate has the largest impact over long periods. A 7% rate doubles roughly every 10 years. Payment amount and frequency directly scale the result. Time horizon amplifies compounding — starting 10 years earlier can more than double the final value. Payment timing (ordinary vs. due) affects value by one period of growth.</p>
            <h2>Tips and Best Practices</h2>
            <p>Compare annuity returns against index funds (historical 7–10% average) before purchasing insurance-based annuities. Max out tax-advantaged accounts (401k, IRA) before buying annuity products. Fixed annuities offer guaranteed rates; variable annuities carry market risk but higher potential returns.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annuity-calculator" />
          <PopularCalculators exclude="/calculator/annuity-calculator" />
        </div>
      </div>
    </>
  );
}
