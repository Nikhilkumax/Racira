"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  homeValue: number;
  mortgageBalance: number;
  loanAmount: number;
  heloanRate: number;
  helocRate: number;
  heloanYears: number;
  helocDrawYears: number;
  helocRepayYears: number;
}

interface Result {
  availableEquity: number;
  combinedLtv: number;
  heloanPayment: number;
  helocDrawPayment: number;
  helocRepayPayment: number;
  heloanInterest10: number;
  heloanBalance10: number;
  helocInterest10: number;
  heloanTotalInterest: number;
  helocTotalInterest15: number;
  chartData: { label: string; heloan: number; heloc: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(p: number, r: number, n: number): number {
  if (r <= 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calc(inp: Inputs): Result {
  const rL = inp.heloanRate / 100 / 12;
  const rH = inp.helocRate / 100 / 12;
  const heloanPayment = pmt(inp.loanAmount, rL, inp.heloanYears * 12);
  const helocDrawPayment = inp.loanAmount * rH; // interest-only during draw
  const helocRepayPayment = pmt(inp.loanAmount, rH, inp.helocRepayYears * 12);

  // Home equity loan: first 10 years of amortization + totals
  let bL = inp.loanAmount;
  let heloanInterest10 = 0;
  for (let m = 1; m <= 120; m++) {
    const int = bL * rL;
    heloanInterest10 += int;
    bL = bL + int - heloanPayment;
  }
  const heloanBalance10 = Math.max(0, bL);
  const heloanTotalInterest = heloanPayment * inp.heloanYears * 12 - inp.loanAmount;

  // HELOC: 10-year draw at interest-only, then assume full balance carries into
  // repayment for a comparable picture
  const helocInterest10 = helocDrawPayment * Math.min(inp.helocDrawYears, 10) * 12;
  const helocTotalInterest15 = helocInterest10 + (helocRepayPayment * inp.helocRepayYears * 12 - inp.loanAmount);

  const availableEquity = Math.max(0, inp.homeValue - inp.mortgageBalance);
  const combinedLtv = Math.min(100, ((inp.mortgageBalance + inp.loanAmount) / inp.homeValue) * 100);

  // Cumulative interest comparison, year by year. The equity loan amortizes
  // from month one. The HELOC pays interest-only on the full drawn amount
  // during its draw period, then amortizes over the repayment period.
  const chartData: { label: string; heloan: number; heloc: number }[] = [];
  let bl = inp.loanAmount;
  let cl = 0;
  let bh = inp.loanAmount;
  let ch = 0;
  const YEARS = Math.max(inp.heloanYears, inp.helocDrawYears + inp.helocRepayYears, 15);
  for (let y = 1; y <= Math.min(YEARS, 40); y++) {
    for (let m = 1; m <= 12; m++) {
      const intL = bl * rL;
      cl += intL;
      bl = Math.max(0, bl + intL - heloanPayment);
      if (y <= inp.helocDrawYears && bh > 0.5) {
        const intH = inp.loanAmount * rH;
        ch += intH;
      } else if (bh > 0.5) {
        const intH = bh * rH;
        ch += intH;
        bh = Math.max(0, bh + intH - helocRepayPayment);
      }
    }
    chartData.push({ label: "Yr " + y, heloan: Math.round(cl), heloc: Math.round(ch) });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Home Value", value: fmt(inp.homeValue) },
    { label: "Current Mortgage Balance", value: fmt(inp.mortgageBalance) },
    { label: "Available Equity", value: fmt(availableEquity) },
    { label: "Combined Loan-to-Value", value: combinedLtv.toFixed(1) + "%" },
    { label: "Equity Loan — Monthly Payment", value: fmtD(heloanPayment), highlight: true },
    { label: "HELOC — Draw Payment (Interest-Only)", value: fmtD(helocDrawPayment), highlight: true },
    { label: "HELOC — Repayment Payment", value: fmtD(helocRepayPayment) },
    { label: "Interest Paid, First 10 Yrs (Loan)", value: fmt(heloanInterest10) },
    { label: "Interest Paid, First 10 Yrs (HELOC)", value: fmt(helocInterest10) },
    { label: "Total Interest — 15-Yr Loan", value: fmt(heloanTotalInterest), isTotal: true },
    { label: "Total Interest — HELOC Path", value: fmt(helocTotalInterest15), isTotal: true },
  ];

  const summaryStats = [
    { label: "Equity Loan Payment", value: fmtD(heloanPayment) + "/mo" },
    { label: "HELOC Draw Payment", value: fmtD(helocDrawPayment) + "/mo" },
    { label: "HELOC Repayment Payment", value: fmtD(helocRepayPayment) + "/mo" },
    { label: "Interest in 10 Yrs (Loan)", value: fmt(heloanInterest10) },
    { label: "Interest in 10 Yrs (HELOC)", value: fmt(helocInterest10) },
    { label: "Total Interest (Loan)", value: fmt(heloanTotalInterest) },
    { label: "Total Interest (HELOC Path)", value: fmt(helocTotalInterest15) },
    { label: "Combined LTV", value: combinedLtv.toFixed(1) + "%" },
  ];

  return { availableEquity, combinedLtv, heloanPayment, helocDrawPayment, helocRepayPayment, heloanInterest10, heloanBalance10, helocInterest10, heloanTotalInterest, helocTotalInterest15, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { homeValue: 500000, mortgageBalance: 250000, loanAmount: 50000, heloanRate: 7.5, helocRate: 8.5, heloanYears: 15, helocDrawYears: 10, helocRepayYears: 20 };

export default function HomeEquityLoanVsHelocComparisonCalculator() {
  const [homeValue, setHomeValue] = useState(String(DEFAULTS.homeValue));
  const [mortgageBalance, setMortgageBalance] = useState(String(DEFAULTS.mortgageBalance));
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [heloanRate, setHeloanRate] = useState(String(DEFAULTS.heloanRate));
  const [helocRate, setHelocRate] = useState(String(DEFAULTS.helocRate));
  const [heloanYears, setHeloanYears] = useState(String(DEFAULTS.heloanYears));
  const [helocDrawYears, setHelocDrawYears] = useState(String(DEFAULTS.helocDrawYears));
  const [helocRepayYears, setHelocRepayYears] = useState(String(DEFAULTS.helocRepayYears));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homeValue: parseFloat(homeValue) || 0,
    mortgageBalance: parseFloat(mortgageBalance) || 0,
    loanAmount: parseFloat(loanAmount) || 0,
    heloanRate: parseFloat(heloanRate) || 0,
    helocRate: parseFloat(helocRate) || 0,
    heloanYears: parseInt(heloanYears) || 0,
    helocDrawYears: parseInt(helocDrawYears) || 0,
    helocRepayYears: parseInt(helocRepayYears) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomeValue(String(DEFAULTS.homeValue));
    setMortgageBalance(String(DEFAULTS.mortgageBalance));
    setLoanAmount(String(DEFAULTS.loanAmount));
    setHeloanRate(String(DEFAULTS.heloanRate));
    setHelocRate(String(DEFAULTS.helocRate));
    setHeloanYears(String(DEFAULTS.heloanYears));
    setHelocDrawYears(String(DEFAULTS.helocDrawYears));
    setHelocRepayYears(String(DEFAULTS.helocRepayYears));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const value = parseFloat(homeValue) || 0;
  const mortgage = parseFloat(mortgageBalance) || 0;
  const amount = parseFloat(loanAmount) || 0;
  const rL = parseFloat(heloanRate) || 0;
  const rH = parseFloat(helocRate) || 0;
  const loanYrs = parseInt(heloanYears) || 0;
  const drawYrs = parseInt(helocDrawYears) || 0;
  const repayYrs = parseInt(helocRepayYears) || 0;
  const equity = value - mortgage;

  const valErrors: Record<string, string> = {};
  if (!homeValue || value <= 0) valErrors.homeValue = "Home value must be greater than $0";
  if (mortgage < 0 || mortgage >= value) valErrors.mortgageBalance = "Mortgage balance must be $0 and below the home value";
  if (!loanAmount || amount <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  else if (amount > equity) valErrors.loanAmount = "Loan amount exceeds available equity of " + "$" + Math.max(0, Math.round(equity)).toLocaleString("en-US");
  if (rL <= 0 || rL > 25) valErrors.heloanRate = "Equity loan rate must be 0–25%";
  if (rH <= 0 || rH > 25) valErrors.helocRate = "HELOC rate must be 0–25%";
  if (!heloanYears || loanYrs <= 0 || loanYrs > 30) valErrors.heloanYears = "Loan term must be 1–30 years";
  if (!helocDrawYears || drawYrs <= 0 || drawYrs > 15) valErrors.helocDrawYears = "Draw period must be 1–15 years";
  if (!helocRepayYears || repayYrs <= 0 || repayYrs > 30) valErrors.helocRepayYears = "Repayment must be 1–30 years";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Equity Loan vs HELOC Comparison" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Equity Loan vs HELOC Comparison</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Home Value ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homeValue} onChange={e => setHomeValue(e.target.value)} className={c} /></div>{valErrors.homeValue && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.homeValue}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Current Mortgage Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mortgageBalance} onChange={e => setMortgageBalance(e.target.value)} className={c} /></div>{valErrors.mortgageBalance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.mortgageBalance}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Amount to Borrow ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Equity Loan Term (Years)</label><div className={i}><input type="number" value={heloanYears} onChange={e => setHeloanYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.heloanYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.heloanYears}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Rates & Terms</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Equity Loan Rate (%)</label><div className={i}><input type="number" value={heloanRate} onChange={e => setHeloanRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.heloanRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.heloanRate}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">HELOC Rate (%)</label><div className={i}><input type="number" value={helocRate} onChange={e => setHelocRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.helocRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.helocRate}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">HELOC Draw Period (Years)</label><div className={i}><input type="number" value={helocDrawYears} onChange={e => setHelocDrawYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.helocDrawYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.helocDrawYears}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">HELOC Repayment (Years)</label><div className={i}><input type="number" value={helocRepayYears} onChange={e => setHelocRepayYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.helocRepayYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.helocRepayYears}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Equity Loan Monthly Payment (Fixed)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.heloanPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">vs {result.helocDrawPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo interest-only on the HELOC during the {drawYrs}-year draw — but the HELOC rate can rise</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Equity Loan Payment", result.heloanPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-primary"],
                ["HELOC Draw Payment", result.helocDrawPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-amber-600"],
                ["Interest in 10 Years", "Loan " + "$" + Math.round(result.heloanInterest10 / 1000) + "K · HELOC $" + Math.round(result.helocInterest10 / 1000) + "K", "text-emerald-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cumulative Interest: Equity Loan vs HELOC</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "heloan" ? "Equity Loan" : "HELOC (draw)", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "heloan" ? "Equity Loan" : "HELOC (draw)")} />
                  <Line type="monotone" dataKey="heloan" name="heloan" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="heloc" name="heloc" stroke="#f59e0b" strokeWidth={2} dot={false} />
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
          <h2 className="text-2xl font-bold mb-3">Two Ways to Borrow Against Your Home</h2>
          <p>A home equity loan hands you a lump sum at a fixed rate, repaid in equal installments over a set term — predictable, like a second mortgage. A HELOC is a revolving line of credit: during the draw period you can borrow, repay, and re-borrow, paying interest only on what you use, at a variable rate tied to the prime index. That flexibility makes the HELOC's minimum payment look dramatically smaller, but it is interest-only, and the rate resets — payments can jump when rates rise or when the draw period ends and the balance must be amortized. If you need one known amount for a renovation, the fixed loan is usually safer; if you need flexible access over years and can handle rate risk, the HELOC wins.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is the difference between a home equity loan and a HELOC?", answer: "A home equity loan is a fixed-rate, fixed-term installment loan for a single lump sum. A HELOC is a variable-rate revolving line of credit with a draw period (typically 10 years) when you can borrow as needed, followed by a repayment period." },
          { question: "Why is the HELOC payment lower?", answer: "During the draw period most HELOCs require interest-only payments, so the minimum payment covers no principal. The equity loan payment amortizes principal from month one — higher now, but the balance shrinks and the payment never changes." },
          { question: "Which should I choose?", answer: "Use a home equity loan for a known one-time expense when you value predictable payments and a fixed rate. Use a HELOC for ongoing or uncertain costs you can pay down quickly, accepting that the variable rate can raise your payment over time." },
        ]} pageUrl="https://racira.com/calculator/home-equity-loan-vs-heloc-comparison" />
        <PopularCalculators exclude="/calculator/home-equity-loan-vs-heloc-comparison" />
      </div>
    </div>
  </>);
}
