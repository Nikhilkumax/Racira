"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  wrapAmount: number;
  wrapRate: number;
  wrapTermYears: number;
  underBalance: number;
  underRate: number;
  underRemainingYears: number;
}

interface Result {
  wrapPayment: number;
  underPayment: number;
  monthlySpread: number;
  buyerTotalInterest: number;
  buyerTotalPayment: number;
  sellerGrossProfit: number;
  chartData: { year: string; wrapReceived: number; underPaid: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(principal: number, r: number, n: number): number {
  if (r <= 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

function calc(inp: Inputs): Result {
  const rW = inp.wrapRate / 100 / 12;
  const nW = inp.wrapTermYears * 12;
  const wrapPayment = pmt(inp.wrapAmount, rW, nW);

  const rU = inp.underRate / 100 / 12;
  const nU = inp.underRemainingYears * 12;
  const underPayment = pmt(inp.underBalance, rU, nU);

  const monthlySpread = wrapPayment - underPayment;
  const buyerTotalPayment = wrapPayment * nW;
  const buyerTotalInterest = Math.max(0, buyerTotalPayment - inp.wrapAmount);

  // Seller's cumulative gross profit: wrap receipts until wrap term ends, minus
  // underlying payments until the underlying loan is retired.
  const chartData: { year: string; wrapReceived: number; underPaid: number }[] = [];
  let cumWrap = 0;
  let cumUnder = 0;
  const years = Math.max(inp.wrapTermYears, inp.underRemainingYears);
  const maxYears = Math.min(years, 40);
  for (let y = 1; y <= maxYears; y++) {
    cumWrap += wrapPayment * 12;
    if (y <= inp.underRemainingYears) cumUnder += underPayment * 12;
    chartData.push({
      year: "Yr " + y,
      wrapReceived: Math.round(cumWrap),
      underPaid: Math.round(cumUnder),
    });
  }
  const sellerGrossProfit = cumWrap - cumUnder;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Wrap Loan Amount", value: fmt(inp.wrapAmount) },
    { label: "Wrap Interest Rate", value: inp.wrapRate + "%" },
    { label: "Wrap Term", value: inp.wrapTermYears + " years" },
    { label: "Buyer's Monthly Payment (Wrap)", value: fmtD(wrapPayment), highlight: true },
    { label: "Underlying Loan Balance", value: fmt(inp.underBalance) },
    { label: "Underlying Rate", value: inp.underRate + "%" },
    { label: "Underlying Remaining Term", value: inp.underRemainingYears + " years" },
    { label: "Seller's Underlying Payment", value: fmtD(underPayment) },
    { label: "Seller's Monthly Spread", value: fmtD(monthlySpread) + "/mo", highlight: true },
    { label: "Buyer's Total Interest (Wrap)", value: fmt(buyerTotalInterest) },
    { label: "Buyer's Total Payment", value: fmt(buyerTotalPayment), isTotal: true },
    { label: "Seller's Gross Profit (to Wrap End)", value: fmt(sellerGrossProfit), isTotal: true },
  ];

  const summaryStats = [
    { label: "Wrap Payment", value: fmtD(wrapPayment) },
    { label: "Underlying Payment", value: fmtD(underPayment) },
    { label: "Monthly Spread", value: fmtD(monthlySpread) },
    { label: "Buyer Total Interest", value: fmt(buyerTotalInterest) },
    { label: "Buyer Total Payment", value: fmt(buyerTotalPayment) },
    { label: "Seller Gross Profit", value: fmt(sellerGrossProfit) },
    { label: "Wrap Term", value: inp.wrapTermYears + " years" },
    { label: "Underlying Retired In", value: inp.underRemainingYears + " years" },
  ];

  return { wrapPayment, underPayment, monthlySpread, buyerTotalInterest, buyerTotalPayment, sellerGrossProfit, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { wrapAmount: 250000, wrapRate: 7, wrapTermYears: 30, underBalance: 180000, underRate: 4.5, underRemainingYears: 20 };

export default function WraparoundMortgageCalculator() {
  const [wrapAmount, setWrapAmount] = useState(String(DEFAULTS.wrapAmount));
  const [wrapRate, setWrapRate] = useState(String(DEFAULTS.wrapRate));
  const [wrapTermYears, setWrapTermYears] = useState(String(DEFAULTS.wrapTermYears));
  const [underBalance, setUnderBalance] = useState(String(DEFAULTS.underBalance));
  const [underRate, setUnderRate] = useState(String(DEFAULTS.underRate));
  const [underRemainingYears, setUnderRemainingYears] = useState(String(DEFAULTS.underRemainingYears));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    wrapAmount: parseFloat(wrapAmount) || 0,
    wrapRate: parseFloat(wrapRate) || 0,
    wrapTermYears: parseInt(wrapTermYears) || 1,
    underBalance: parseFloat(underBalance) || 0,
    underRate: parseFloat(underRate) || 0,
    underRemainingYears: parseInt(underRemainingYears) || 1,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setWrapAmount(String(DEFAULTS.wrapAmount));
    setWrapRate(String(DEFAULTS.wrapRate));
    setWrapTermYears(String(DEFAULTS.wrapTermYears));
    setUnderBalance(String(DEFAULTS.underBalance));
    setUnderRate(String(DEFAULTS.underRate));
    setUnderRemainingYears(String(DEFAULTS.underRemainingYears));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const wAmt = parseFloat(wrapAmount) || 0;
  const wRate = parseFloat(wrapRate) || 0;
  const wTerm = parseInt(wrapTermYears) || 0;
  const uBal = parseFloat(underBalance) || 0;
  const uRate = parseFloat(underRate) || 0;
  const uTerm = parseInt(underRemainingYears) || 0;

  const valErrors: Record<string, string> = {};
  if (!wrapAmount || wAmt <= 0) valErrors.wrapAmount = "Wrap Amount must be greater than $0";
  if (!wrapRate || wRate <= 0) valErrors.wrapRate = "Wrap rate must be greater than 0%";
  else if (wRate > 25) valErrors.wrapRate = "Wrap rate must be 25% or less";
  if (!wrapTermYears || wTerm <= 0) valErrors.wrapTermYears = "Wrap term must be greater than 0 years";
  else if (wTerm > 40) valErrors.wrapTermYears = "Wrap term must be 40 years or less";
  if (uBal < 0) valErrors.underBalance = "Underlying balance must be $0 or more";
  else if (uBal >= wAmt) valErrors.underBalance = "Underlying balance must be less than the Wrap Amount";
  if (!underRate || uRate <= 0) valErrors.underRate = "Underlying rate must be greater than 0%";
  else if (uRate > 25) valErrors.underRate = "Underlying rate must be 25% or less";
  if (!underRemainingYears || uTerm <= 0) valErrors.underRemainingYears = "Remaining term must be greater than 0 years";
  else if (uTerm > 40) valErrors.underRemainingYears = "Remaining term must be 40 years or less";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Wraparound Mortgage Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wraparound Mortgage Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Wrap Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={wrapAmount} onChange={e => setWrapAmount(e.target.value)} className={c} /></div>{valErrors.wrapAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.wrapAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Wrap Interest Rate (%)</label><div className={i}><input type="number" value={wrapRate} onChange={e => setWrapRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.wrapRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.wrapRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Wrap Term (Years)</label><div className={i}><input type="number" value={wrapTermYears} onChange={e => setWrapTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.wrapTermYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.wrapTermYears}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Underlying First Mortgage</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Underlying Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={underBalance} onChange={e => setUnderBalance(e.target.value)} className={c} /></div>{valErrors.underBalance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.underBalance}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Underlying Rate (%)</label><div className={i}><input type="number" value={underRate} onChange={e => setUnderRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.underRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.underRate}</p>}</div>
                  <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Underlying Remaining Term (Years)</label><div className={i}><input type="number" value={underRemainingYears} onChange={e => setUnderRemainingYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.underRemainingYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.underRemainingYears}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Buyer's Monthly Payment (Wrap)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.wrapPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{wAmt.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} at {wrapRate}% for {wrapTermYears} years</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Seller's Monthly Spread", "$" + Math.round(result.monthlySpread).toLocaleString("en-US") + "/mo", result.monthlySpread >= 0 ? "text-emerald-600" : "text-red-500"],
                ["Seller's Underlying Payment", "$" + Math.round(result.underPayment).toLocaleString("en-US"), "text-foreground"],
                ["Seller's Gross Profit", "$" + Math.round(result.sellerGrossProfit).toLocaleString("en-US"), "text-primary"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cumulative Cash: Buyer Payments vs Seller's Underlying Cost</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "wrapReceived" ? "Cumulative Wrap Payments" : "Cumulative Underlying Paid", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "wrapReceived" ? "Wrap Payments Received" : "Underlying Payments Made")} />
                  <Area type="monotone" dataKey="wrapReceived" name="wrapReceived" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="underPaid" name="underPaid" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">The vertical gap between the two lines is the seller's cumulative gross spread. After the underlying loan is retired (year {underRemainingYears}), the seller keeps the full wrap payment.</p>
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
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Understanding Wraparound Mortgages</h2>
          <p>A wraparound mortgage lets a seller keep financing in place while the buyer makes a single "wrap" payment that covers both loans: the buyer's new financing and the seller's underlying first mortgage. The seller pockets the difference each month. Because the wrap rate typically exceeds the underlying rate, the seller earns a spread — and once the underlying loan is retired, the seller keeps the full payment until the wrap term ends. Wraps are most common in seller-financed transactions where the buyer cannot qualify for bank financing; due-on-sale clauses in the underlying note can make them risky without lender consent.</p>
        </section>
        <FAQSection faqs={[
          { question: "How does a wraparound mortgage work?", answer: "The seller keeps the existing first mortgage and writes a new, larger loan to the buyer at a higher rate. The buyer pays one monthly wrap payment; the seller forwards the underlying payment to the original lender and keeps the difference." },
          { question: "Who benefits from the spread?", answer: "The seller earns the difference between the wrap rate and the underlying rate on the full wrap balance. After the underlying loan is paid off (usually sooner than the wrap term), the seller keeps the entire wrap payment." },
          { question: "What are the risks?", answer: "Most conventional mortgages carry a due-on-sale clause that can accelerate the underlying loan when the property changes hands without lender consent. Buyers should confirm title and payment priorities, and both parties should use a closing agent to protect their interests." },
        ]} pageUrl="https://racira.com/calculator/wraparound-mortgage-calculator" />
        <PopularCalculators exclude="/calculator/wraparound-mortgage-calculator" />
      </div>
    </div>
  </>);
}
