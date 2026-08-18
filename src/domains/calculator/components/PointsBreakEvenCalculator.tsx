"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PbeResult {
  basePayment: number;
  ptsPayment: number;
  monthlySavings: number;
  pointsCost: number;
  ptsRate: number;
  breakEvenMonths: number;
  breakEvenYears: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { month: number; noPoints: number; withPoints: number }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function paymentFor(loan: number, ratePct: number, years: number): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

function calcPbe(loan: number, baseRate: number, points: number, ratePerPoint: number, years: number): PbeResult {
  const ptsRate = baseRate - points * ratePerPoint;
  const basePayment = paymentFor(loan, baseRate, years);
  const ptsPayment = paymentFor(loan, ptsRate, years);
  const monthlySavings = basePayment - ptsPayment;
  const pointsCost = (points / 100) * loan;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(pointsCost / monthlySavings) : Infinity;
  const beYears = breakEvenMonths === Infinity ? "Never" : `${Math.floor(breakEvenMonths / 12)} yr ${breakEvenMonths % 12} mo`;
  const breakdown = [
    { label: "Loan Amount", value: money(loan) },
    { label: "Base Interest Rate", value: `${fmt(baseRate)}%` },
    { label: "Points Purchased", value: `${fmt(points)} pt` },
    { label: "Rate Reduction per Point", value: `${fmt(ratePerPoint)}%` },
    { label: "New Interest Rate", value: `${fmt(ptsRate)}%` },
    { label: "Points Cost (1% of loan each)", value: money(pointsCost) },
    { label: "Monthly Payment (no points)", value: money(basePayment) },
    { label: "Monthly Payment (with points)", value: money(ptsPayment) },
    { label: "Monthly Savings", value: money(monthlySavings) },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "Never — rates equal or higher" : `${breakEvenMonths} months (${beYears})` },
  ];
  const summaryStats = [
    { label: "Monthly Savings", value: money(monthlySavings) },
    { label: "Points Cost", value: money(pointsCost) },
    { label: "Break-Even", value: beYears },
    { label: "New Rate", value: `${fmt(ptsRate)}%` },
  ];
  const chartData: { month: number; noPoints: number; withPoints: number }[] = [];
  const horizon = breakEvenMonths === Infinity ? 240 : Math.max(60, breakEvenMonths + 60);
  for (let m = 0; m <= horizon; m += Math.max(1, Math.floor(horizon / 24))) {
    chartData.push({
      month: m,
      noPoints: Number((basePayment * m).toFixed(0)),
      withPoints: Number((pointsCost + ptsPayment * m).toFixed(0)),
    });
  }
  return { basePayment, ptsPayment, monthlySavings, pointsCost, ptsRate, breakEvenMonths, breakEvenYears: beYears, breakdown, summaryStats, chartData };
}

const DEFAULTS = { loan: "300000", rate: "6.5", points: "1", perPoint: "0.25", years: "30" };

export default function PointsBreakEvenCalculator() {
  const [loan, setLoan] = useState(DEFAULTS.loan);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [points, setPoints] = useState(DEFAULTS.points);
  const [perPoint, setPerPoint] = useState(DEFAULTS.perPoint);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<PbeResult | null>(null);

  const l = parseFloat(loan);
  const r = parseFloat(rate);
  const p = parseFloat(points);
  const pp = parseFloat(perPoint);
  const y = parseFloat(years);
  const errs: string[] = [];
  if (!l || l <= 0) errs.push("Loan amount must be greater than 0.");
  if (isNaN(r) || r < 0) errs.push("Interest rate must be 0 or greater.");
  if (isNaN(p) || p < 0) errs.push("Points must be 0 or greater.");
  if (isNaN(pp) || pp < 0) errs.push("Rate reduction per point must be 0 or greater.");
  if (!y || y <= 0 || y > 50) errs.push("Loan term must be between 1 and 50 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPbe(l, r, p, pp, y)); };
  const reset = () => {
    setLoan(DEFAULTS.loan); setRate(DEFAULTS.rate); setPoints(DEFAULTS.points); setPerPoint(DEFAULTS.perPoint); setYears(DEFAULTS.years);
    setResult(calcPbe(300000, 6.5, 1, 0.25, 30));
  };
  useEffect(() => { setResult(calcPbe(300000, 6.5, 1, 0.25, 30)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What are mortgage discount points?", answer: "Points are prepaid interest: each point costs 1% of the loan amount and lowers the interest rate by roughly 0.25 percentage points. A $300,000 loan with 1 point costs $3,000 upfront for a lower monthly payment." },
    { question: "What is the break-even point?", answer: "The moment your monthly savings have repaid the upfront cost of the points. If points cost $3,000 and save $60/month, you break even at 50 months. Live in the house longer than that and points pay off; sell sooner and they do not." },
    { question: "Should I buy points?", answer: "It depends on how long you will keep the mortgage. Short horizon — plan to refinance or sell within a few years — skip points. Long horizon — 7+ years — points usually win. Tax treatment also differs since points are deductible as mortgage interest in the year paid." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Points Break-Even Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mortgage Points Break-Even Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Loan Amount ($)</label>
                <input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inp} placeholder="300000" />
              </div>
              <div>
                <label className={lbl}>Base Interest Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className={inp} placeholder="6.5" />
              </div>
              <div>
                <label className={lbl}>Points to Buy</label>
                <input type="number" value={points} onChange={e => setPoints(e.target.value)} className={inp} placeholder="1" />
              </div>
              <div>
                <label className={lbl}>Rate Cut per Point (%)</label>
                <input type="number" value={perPoint} onChange={e => setPerPoint(e.target.value)} className={inp} placeholder="0.25" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Loan Term (years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} className={inp} placeholder="30" />
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Break-Even Point</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.breakEvenMonths === Infinity ? "Never" : `${result.breakEvenMonths} months`}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.breakEvenYears} · saves {money(result.monthlySavings)}/mo after paying {money(result.pointsCost)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Savings", money(result.monthlySavings)], ["Points Cost", money(result.pointsCost)], ["New Rate", `${fmt(result.ptsRate)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cumulative Cost: Points vs No Points</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), ""]} labelFormatter={(l) => `Month ${l}`} />
                    <Line type="monotone" dataKey="noPoints" name="No points" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="withPoints" name="With points" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    {result.breakEvenMonths !== Infinity && <ReferenceLine x={result.breakEvenMonths} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">{result.breakEvenMonths === Infinity ? "No break-even — the points never pay back" : "The lines cross at the break-even month; below it, no-points wins"}</p>
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
            <h2 className="text-2xl font-bold mb-3">Pay Upfront, Save Monthly</h2>
            <p>Mortgage points are prepaid interest: one point costs 1% of the loan and typically shaves 0.25 points off the rate. This <strong>points break-even calculator</strong> finds how long the lower payment takes to repay the upfront cost — the single number that decides whether points are worth it.</p>
            <h2 className="text-2xl font-bold mb-3">The Break-Even Logic</h2>
            <p>Compare the amortized monthly payments with and without points. The savings each month chip away at the points' cost; the break-even month is when cumulative savings equal that cost. The chart draws both cumulative-cost lines so the crossing point is visible.</p>
            <h2 className="text-2xl font-bold mb-3">The Decision Rule</h2>
            <p>Points pay if you keep the mortgage past break-even — typically 4–7 years. If you plan to sell, refinance, or pay off early, the upfront money is usually better kept as cash. Buyers who itemize can also deduct points in the purchase year, sweetening the deal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/points-break-even-calculator" />
          <PopularCalculators exclude="/calculator/points-break-even-calculator" />
        </div>
      </div>
    </>
  );
}
