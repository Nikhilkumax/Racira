"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";

interface Inputs {
  loanAmount: number;
  rateNoPoints: number;
  rateWithPoints: number;
  points: number;
  termYears: number;
  holdYears: number;
}

interface Result {
  pointsCost: number;
  paymentNoPoints: number;
  paymentWithPoints: number;
  monthlySavings: number;
  breakEvenMonths: number;
  interestNoPoints: number;
  interestWithPoints: number;
  interestSavedFull: number;
  interestSavedHold: number;
  netPosition: number;
  chartData: { label: string; cumulative: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(p: number, r: number, n: number): number {
  if (r <= 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function interestFirstMonths(p: number, r: number, pay: number, months: number): number {
  let bal = p;
  let intTotal = 0;
  for (let m = 0; m < months && bal > 0.5; m++) {
    const int = bal * r;
    intTotal += int;
    bal = bal + int - Math.min(pay, bal + int);
  }
  return intTotal;
}

function calc(inp: Inputs): Result {
  const rA = inp.rateNoPoints / 100 / 12;
  const rB = inp.rateWithPoints / 100 / 12;
  const n = inp.termYears * 12;
  const pointsCost = (inp.loanAmount * inp.points) / 100;
  const paymentNoPoints = pmt(inp.loanAmount, rA, n);
  const paymentWithPoints = pmt(inp.loanAmount, rB, n);
  const monthlySavings = Math.max(0, paymentNoPoints - paymentWithPoints);
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(pointsCost / monthlySavings) : Infinity;

  const interestNoPoints = paymentNoPoints * n - inp.loanAmount;
  const interestWithPoints = paymentWithPoints * n - inp.loanAmount;
  const interestSavedFull = Math.max(0, interestNoPoints - interestWithPoints);

  const holdMonths = inp.holdYears * 12;
  const interestPaidA = interestFirstMonths(inp.loanAmount, rA, paymentNoPoints, holdMonths);
  const interestPaidB = interestFirstMonths(inp.loanAmount, rB, paymentWithPoints, holdMonths);
  const interestSavedHold = Math.max(0, interestPaidA - interestPaidB);
  const netPosition = interestPaidA - interestPaidB - pointsCost;

  const chartData: { label: string; cumulative: number }[] = [];
  let cum = -pointsCost;
  chartData.push({ label: "Now", cumulative: Math.round(cum) });
  for (let y = 1; y <= Math.min(inp.termYears, 30); y++) {
    cum += monthlySavings * 12;
    chartData.push({ label: "Yr " + y, cumulative: Math.round(cum) });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakEvenLabel = breakEvenMonths === Infinity ? "Never" : breakEvenMonths + " months (~" + (breakEvenMonths / 12).toFixed(1) + " yrs)";

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Rate Without Points", value: inp.rateNoPoints + "%" },
    { label: "Rate With Points", value: inp.rateWithPoints + "%" },
    { label: "Points Charged", value: inp.points + " point" + (inp.points === 1 ? "" : "s") },
    { label: "Cost of Points", value: fmt(pointsCost), highlight: true },
    { label: "Payment Without Points", value: fmtD(paymentNoPoints) },
    { label: "Payment With Points", value: fmtD(paymentWithPoints) },
    { label: "Monthly Savings", value: fmtD(monthlySavings), highlight: true },
    { label: "Break-Even Point", value: breakEvenLabel },
    { label: "Interest Saved — Full Term", value: fmt(interestSavedFull) },
    { label: "Interest Saved — " + inp.holdYears + "-Yr Hold", value: fmt(interestSavedHold) },
    { label: "Net Position After " + inp.holdYears + " Years", value: (netPosition >= 0 ? "+" : "−") + fmt(Math.abs(netPosition)), isTotal: true, highlight: true },
  ];

  const summaryStats = [
    { label: "Cost of Points", value: fmt(pointsCost) },
    { label: "Monthly Savings", value: fmtD(monthlySavings) },
    { label: "Break-Even", value: breakEvenLabel },
    { label: "Payment (No Points)", value: fmtD(paymentNoPoints) },
    { label: "Payment (With Points)", value: fmtD(paymentWithPoints) },
    { label: "Interest Saved (Full Term)", value: fmt(interestSavedFull) },
    { label: "Interest Saved (" + inp.holdYears + " Yrs)", value: fmt(interestSavedHold) },
    { label: "Net Position (" + inp.holdYears + " Yrs)", value: (netPosition >= 0 ? "+" : "−") + fmt(Math.abs(netPosition)) },
  ];

  return { pointsCost, paymentNoPoints, paymentWithPoints, monthlySavings, breakEvenMonths, interestNoPoints, interestWithPoints, interestSavedFull, interestSavedHold, netPosition, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 250000, rateNoPoints: 6.75, rateWithPoints: 6.5, points: 1, termYears: 30, holdYears: 5 };

export default function LoanPointsBreakEvenCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [rateNoPoints, setRateNoPoints] = useState(String(DEFAULTS.rateNoPoints));
  const [rateWithPoints, setRateWithPoints] = useState(String(DEFAULTS.rateWithPoints));
  const [points, setPoints] = useState(String(DEFAULTS.points));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [holdYears, setHoldYears] = useState(String(DEFAULTS.holdYears));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    rateNoPoints: parseFloat(rateNoPoints) || 0,
    rateWithPoints: parseFloat(rateWithPoints) || 0,
    points: parseFloat(points) || 0,
    termYears: parseInt(termYears) || 0,
    holdYears: parseInt(holdYears) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setRateNoPoints(String(DEFAULTS.rateNoPoints));
    setRateWithPoints(String(DEFAULTS.rateWithPoints));
    setPoints(String(DEFAULTS.points));
    setTermYears(String(DEFAULTS.termYears));
    setHoldYears(String(DEFAULTS.holdYears));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rA = parseFloat(rateNoPoints) || 0;
  const rB = parseFloat(rateWithPoints) || 0;
  const pts = parseFloat(points) || 0;
  const term = parseInt(termYears) || 0;
  const hold = parseInt(holdYears) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (rA <= 0 || rA > 25) valErrors.rateNoPoints = "Rate must be 0–25%";
  if (rB <= 0 || rB > 25) valErrors.rateWithPoints = "Rate must be 0–25%";
  if (rB >= rA) valErrors.rateWithPoints = "The points rate must be lower than the no-points rate";
  if (pts < 0 || pts > 5) valErrors.points = "Points must be 0–5";
  if (!termYears || term <= 0 || term > 40) valErrors.termYears = "Term must be 1–40 years";
  if (!holdYears || hold <= 0 || hold > 40) valErrors.holdYears = "Holding period must be 1–40 years";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Points Break-Even Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Points Break-Even Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Rate Without Points (%)</label><div className={i}><input type="number" value={rateNoPoints} onChange={e => setRateNoPoints(e.target.value)} step="0.125" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.rateNoPoints && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rateNoPoints}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Rate With Points (%)</label><div className={i}><input type="number" value={rateWithPoints} onChange={e => setRateWithPoints(e.target.value)} step="0.125" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.rateWithPoints && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rateWithPoints}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Points Charged</label><div className={i}><input type="number" value={points} onChange={e => setPoints(e.target.value)} step="0.125" className={c} /></div>{valErrors.points && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.points}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Term & Horizon</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Expected Holding (Years)</label><div className={i}><input type="number" value={holdYears} onChange={e => setHoldYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.holdYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.holdYears}</p>}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Break-Even Point</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.breakEvenMonths === Infinity ? "Never" : result.breakEvenMonths + " months"}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.breakEvenMonths === Infinity ? "The points rate doesn't save enough to pay back its cost" : "≈ " + (result.breakEvenMonths / 12).toFixed(1) + " years to recover " + result.pointsCost.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + " of points — you must stay past this point to come out ahead"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Cost of Points", "$" + Math.round(result.pointsCost).toLocaleString("en-US"), "text-red-600"],
                ["Monthly Savings", "$" + result.monthlySavings.toFixed(2) + "/mo", "text-emerald-600"],
                ["Interest Saved (Full Term)", "$" + Math.round(result.interestSavedFull).toLocaleString("en-US"), "text-primary"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cumulative Position vs Points Cost</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number) => ["Net vs Paying Points", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="cumulative" name="Net Savings vs Cost" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, idx) => (
                    <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, idx) => (
                  <div key={idx} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Points Are a Bet on How Long You Stay</h2>
          <p>Mortgage points are prepaid interest: one point costs 1% of the loan amount and typically buys your rate down by roughly a quarter of a percentage point. Whether that trade pays off is purely a question of time. The break-even is the number of months it takes for the monthly payment savings to equal the cost of the points — and everything after that is pure profit. On a $250,000 loan, one point costs $2,500; if it cuts your payment by $42 a month, you need to stay in the home roughly five years just to break even. If you might move or refinance before that, skip the points and keep the cash. If you plan to stay a decade or more, points are one of the few guaranteed returns left in personal finance.</p>
        </section>
        <FAQSection faqs={[
          { question: "How much does one point lower my rate?", answer: "Roughly 0.25 percentage points per point, though the exact amount varies by lender and market. Some lenders quote smaller reductions for jumbo loans or let you buy down an eighth of a point at a time." },
          { question: "Are points tax deductible?", answer: "Points paid to acquire your main home are generally deductible as mortgage interest in the year you pay them, subject to IRS limits. Points on a refinance must usually be deducted ratably over the loan's life — confirm the details with a tax professional." },
          { question: "Should I always take points if I plan to stay long?", answer: "Only if the break-even is comfortably inside your expected stay and the cash isn't needed elsewhere. Points beat almost any guaranteed investment over a 10-year horizon, but they are locked into your home — you can't get them back early." },
        ]} pageUrl="https://racira.com/calculator/loan-points-break-even-calculator" />
        <PopularCalculators exclude="/calculator/loan-points-break-even-calculator" />
      </div>
    </div>
  </>);
}