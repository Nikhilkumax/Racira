"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  homePrice: number;
  downPayment: number;
  teaserRate: number;
  teaserYears: number;
  fullyIndexedRate: number;
  margin: number;
  term: number;
  indexRate: number;
}

interface Result {
  teaserPayment: number;
  adjustedPayment: number;
  paymentShock: number;
  maxPayment: number;
  totalInterest: number;
  canAffordAdjusted: boolean;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; payment: number; rate: number }[];
}

function calcPMT(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return r > 0 ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;
}

function calc(inp: Inputs): Result {
  const loanAmount = inp.homePrice - inp.downPayment;
  
  // Teaser phase
  const teaserPayment = calcPMT(loanAmount, inp.teaserRate, inp.term);
  
  // After teaser: fully indexed rate = index rate + margin
  const adjustedRate = Math.max(inp.fullyIndexedRate, inp.indexRate + inp.margin);
  const remainingTerm = inp.term - inp.teaserYears;
  const adjustedPayment = calcPMT(loanAmount, adjustedRate, remainingTerm);
  
  const paymentShock = adjustedPayment - teaserPayment;
  
  // Worst case: max rate cap (typically 2% above initial)
  const maxRate = inp.teaserRate + 2;
  const maxPayment = calcPMT(loanAmount, maxRate, remainingTerm);
  
  // Total interest calculation
  const teaserInterest = teaserPayment * inp.teaserYears * 12 - (loanAmount - calcPMT(loanAmount, inp.teaserRate, inp.term) * 12 * inp.teaserYears);
  const adjustedInterest = adjustedPayment * remainingTerm * 12;
  const totalInterest = teaserPayment * inp.teaserYears * 12 + adjustedPayment * remainingTerm * 12 - loanAmount;
  
  const canAffordAdjusted = true; // Would need income data to determine

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Home Price", value: fmt(inp.homePrice) },
    { label: "Down Payment", value: fmt(inp.downPayment) + " (" + (inp.homePrice > 0 ? ((inp.downPayment / inp.homePrice) * 100).toFixed(1) : 0) + "%)" },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Teaser Rate", value: inp.teaserRate + "%/yr", highlight: true },
    { label: "Teaser Period", value: inp.teaserYears + " years" },
    { label: "Teaser Monthly Payment", value: "$" + fmtD(teaserPayment), highlight: true },
    { label: "Fully Indexed Rate", value: adjustedRate.toFixed(2) + "%/yr" },
    { label: "Index Rate", value: inp.indexRate + "%" + " + Margin " + inp.margin + "%" },
    { label: "Adjusted Monthly Payment", value: "$" + fmtD(adjustedPayment), highlight: true },
    { label: "Payment Shock", value: "$" + fmtD(paymentShock) + "/mo (+" + ((paymentShock / teaserPayment) * 100).toFixed(1) + "%)", highlight: true },
    { label: "Max Rate Cap", value: maxRate + "%/yr" },
    { label: "Max Monthly Payment", value: "$" + fmtD(maxPayment) },
    { label: "Total Interest", value: fmt(totalInterest) },
  ];

  const summaryStats = [
    { label: "Teaser Payment", value: "$" + fmtD(teaserPayment) + "/mo" },
    { label: "Adjusted Payment", value: "$" + fmtD(adjustedPayment) + "/mo" },
    { label: "Payment Shock", value: "$" + fmtD(paymentShock) + "/mo" },
    { label: "Shock %", value: "+" + ((paymentShock / teaserPayment) * 100).toFixed(1) + "%" },
    { label: "Adjusted Rate", value: adjustedRate.toFixed(2) + "%" },
    { label: "Max Payment", value: "$" + fmtD(maxPayment) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Loan Amount", value: fmt(loanAmount) },
  ];

  // Payment chart showing teaser → adjusted → max
  const chartData: { year: string; payment: number; rate: number }[] = [];
  for (let yr = 1; yr <= inp.term; yr++) {
    if (yr <= inp.teaserYears) {
      chartData.push({ year: "Yr " + yr, payment: Math.round(teaserPayment), rate: inp.teaserRate });
    } else {
      chartData.push({ year: "Yr " + yr, payment: Math.round(adjustedPayment), rate: adjustedRate });
    }
  }

  return { teaserPayment, adjustedPayment, paymentShock, maxPayment, totalInterest, canAffordAdjusted, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { homePrice: 400000, downPayment: 80000, teaserRate: 3.5, teaserYears: 3, fullyIndexedRate: 7.5, margin: 2.75, term: 30, indexRate: 4.75 };

export default function TeaserRateMortgageCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [teaserRate, setTeaserRate] = useState(String(DEFAULTS.teaserRate));
  const [teaserYears, setTeaserYears] = useState(String(DEFAULTS.teaserYears));
  const [fullyIndexedRate, setFullyIndexedRate] = useState(String(DEFAULTS.fullyIndexedRate));
  const [margin, setMargin] = useState(String(DEFAULTS.margin));
  const [term, setTerm] = useState(String(DEFAULTS.term));
  const [indexRate, setIndexRate] = useState(String(DEFAULTS.indexRate));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPayment: parseFloat(downPayment) || 0,
    teaserRate: parseFloat(teaserRate) || 0,
    teaserYears: parseInt(teaserYears) || 3,
    fullyIndexedRate: parseFloat(fullyIndexedRate) || 0,
    margin: parseFloat(margin) || 0,
    term: parseInt(term) || 30,
    indexRate: parseFloat(indexRate) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPayment(String(DEFAULTS.downPayment));
    setTeaserRate(String(DEFAULTS.teaserRate));
    setTeaserYears(String(DEFAULTS.teaserYears));
    setFullyIndexedRate(String(DEFAULTS.fullyIndexedRate));
    setMargin(String(DEFAULTS.margin));
    setTerm(String(DEFAULTS.term));
    setIndexRate(String(DEFAULTS.indexRate));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is a teaser rate mortgage?", answer: "A teaser rate mortgage offers a below-market introductory interest rate for the first 1–5 years. After the teaser period, the rate adjusts to the fully indexed rate (index rate + margin). The teaser rate is typically 1–3% below the standard rate, resulting in significantly lower initial payments." },
    { question: "What is the payment shock?", answer: "Payment shock is the difference between the teaser payment and the adjusted payment. For example, a $320,000 loan at 3.5% teaser pays ~$1,436/mo, but adjusts to 7.5% = ~$2,237/mo — an increase of $801/mo (56%). This is the primary risk of teaser rate mortgages." },
    { question: "Are teaser rate mortgages still available?", answer: "Traditional teaser rate (2/28, 3/27) ARMs are less common since the 2008 financial crisis. However, 5/1, 7/1, and 10/1 ARMs still feature lower initial fixed rates that adjust later. The Consumer Financial Protection Bureau requires lenders to qualify borrowers at the fully indexed rate, reducing but not eliminating payment shock risk." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Teaser Rate Mortgage Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Teaser Rate Mortgage Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Teaser Rate (%)</label><div className={i}><input type="number" value={teaserRate} onChange={e => setTeaserRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Teaser Period</label><div className={i}><input type="number" value={teaserYears} onChange={e => setTeaserYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">ARM Parameters</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Fully Indexed Rate (%)</label><div className={i}><input type="number" value={fullyIndexedRate} onChange={e => setFullyIndexedRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                <div><label className="text-sm font-medium mb-1 block">Index Rate (%)</label><div className={i}><input type="number" value={indexRate} onChange={e => setIndexRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Margin (%)</label><div className={i}><input type="number" value={margin} onChange={e => setMargin(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Teaser → Adjusted Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.teaserPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} → ${result.adjustedPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Payment shock: +${result.paymentShock.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo · Max at cap: ${result.maxPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Teaser", "$" + result.teaserPayment.toFixed(2)], ["Adjusted", "$" + result.adjustedPayment.toFixed(2)], ["Shock", "+$" + result.paymentShock.toFixed(2)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Annual Payment Schedule</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(1) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString() + "/mo", ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="payment" fill="hsl(var(--primary))" name="Monthly Payment" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Understanding Teaser Rate Mortgages</h2><p>Teaser rate mortgages (ARMs) offer below-market introductory rates for 1–5 years before adjusting to the fully indexed rate. While the initial payment is attractive, the subsequent adjustment can cause significant "payment shock." Post-2008 regulations require lenders to qualify borrowers at the fully indexed rate, but understanding the payment trajectory remains critical for financial planning.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/teaser-rate-mortgage-calculator" /><PopularCalculators exclude="/calculator/teaser-rate-mortgage-calculator" /></div>
    </div>
  </>);
}
