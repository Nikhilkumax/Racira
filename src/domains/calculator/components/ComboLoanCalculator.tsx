"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";

interface Inputs {
  homePrice: number;
  firstRate: number;
  secondRate: number;
  termYears: number;
  firstLtv: number;
  secondLtv: number;
  pmiRate: number;
}

interface Result {
  downPayment: number;
  firstAmount: number;
  secondAmount: number;
  firstPayment: number;
  secondPayment: number;
  combinedPayment: number;
  singlePayment: number;
  pmiMonthly: number;
  monthlySavings: number;
  totalInterest: number;
  totalCost: number;
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; amount: number }[];
}

function pmt(p: number, r: number, n: number): number {
  if (r <= 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calc(inp: Inputs): Result {
  const r1 = inp.firstRate / 100 / 12;
  const r2 = inp.secondRate / 100 / 12;
  const n = inp.termYears * 12;
  const firstAmount = (inp.homePrice * inp.firstLtv) / 100;
  const secondAmount = (inp.homePrice * inp.secondLtv) / 100;
  const downPayment = inp.homePrice - firstAmount - secondAmount;
  const firstPayment = pmt(firstAmount, r1, n);
  const secondPayment = pmt(secondAmount, r2, n);
  const combinedPayment = firstPayment + secondPayment;

  // Comparison: one first-lien loan on the same total financed amount, with PMI
  const financed = firstAmount + secondAmount;
  const pmiMonthly = (financed * inp.pmiRate) / 100 / 12;
  const singlePayment = pmt(financed, r1, n) + pmiMonthly;
  const monthlySavings = singlePayment - combinedPayment;

  let totalInterest = 0;
  let b1 = firstAmount;
  for (let m = 0; m < n; m++) {
    const int = b1 * r1;
    totalInterest += int;
    b1 = b1 + int - firstPayment;
  }
  let b2 = secondAmount;
  for (let m = 0; m < n; m++) {
    const int = b2 * r2;
    totalInterest += int;
    b2 = b2 + int - secondPayment;
  }
  const totalCost = firstAmount + secondAmount + totalInterest;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Home Price", value: fmt(inp.homePrice) },
    { label: "Down Payment", value: fmt(downPayment) + " (" + Math.round((downPayment / inp.homePrice) * 100) + "%)" },
    { label: "First Mortgage (" + inp.firstLtv + "%)", value: fmt(firstAmount) },
    { label: "Second Mortgage (" + inp.secondLtv + "%)", value: fmt(secondAmount) },
    { label: "First Mortgage Payment", value: fmtD(firstPayment) },
    { label: "Second Mortgage Payment", value: fmtD(secondPayment) },
    { label: "Combined Payment", value: fmtD(combinedPayment), highlight: true },
    { label: "PMI Avoided", value: fmtD(pmiMonthly) + "/mo", highlight: true },
    { label: "Single Loan + PMI Payment", value: fmtD(singlePayment) },
    { label: "Monthly Savings vs Single Loan", value: fmtD(monthlySavings) },
    { label: "Total Interest (Both Loans)", value: fmt(totalInterest) },
    { label: "Total Cost Over Term", value: fmt(totalCost), isTotal: true },
  ];

  const summaryStats = [
    { label: "First Mortgage Payment", value: fmtD(firstPayment) },
    { label: "Second Mortgage Payment", value: fmtD(secondPayment) },
    { label: "Combined Payment", value: fmtD(combinedPayment) },
    { label: "PMI Avoided", value: fmtD(pmiMonthly) + "/mo" },
    { label: "Single Loan + PMI", value: fmtD(singlePayment) },
    { label: "Monthly Savings", value: fmtD(monthlySavings) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost Over Term", value: fmt(totalCost) },
  ];

  const chartData = [
    { name: "Single Loan + PMI", amount: Math.round(singlePayment) },
    { name: "Combo Loan", amount: Math.round(combinedPayment) },
    { name: "Savings", amount: Math.round(Math.max(0, monthlySavings)) },
  ];

  return { downPayment, firstAmount, secondAmount, firstPayment, secondPayment, combinedPayment, singlePayment, pmiMonthly, monthlySavings, totalInterest, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { homePrice: 400000, firstRate: 6.5, secondRate: 8.75, termYears: 30, firstLtv: 80, secondLtv: 10, pmiRate: 0.55 };

export default function ComboLoanCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [firstRate, setFirstRate] = useState(String(DEFAULTS.firstRate));
  const [secondRate, setSecondRate] = useState(String(DEFAULTS.secondRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [firstLtv, setFirstLtv] = useState(String(DEFAULTS.firstLtv));
  const [secondLtv, setSecondLtv] = useState(String(DEFAULTS.secondLtv));
  const [pmiRate, setPmiRate] = useState(String(DEFAULTS.pmiRate));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    firstRate: parseFloat(firstRate) || 0,
    secondRate: parseFloat(secondRate) || 0,
    termYears: parseInt(termYears) || 0,
    firstLtv: parseFloat(firstLtv) || 0,
    secondLtv: parseFloat(secondLtv) || 0,
    pmiRate: parseFloat(pmiRate) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setFirstRate(String(DEFAULTS.firstRate));
    setSecondRate(String(DEFAULTS.secondRate));
    setTermYears(String(DEFAULTS.termYears));
    setFirstLtv(String(DEFAULTS.firstLtv));
    setSecondLtv(String(DEFAULTS.secondLtv));
    setPmiRate(String(DEFAULTS.pmiRate));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const price = parseFloat(homePrice) || 0;
  const r1 = parseFloat(firstRate) || 0;
  const r2 = parseFloat(secondRate) || 0;
  const term = parseInt(termYears) || 0;
  const ltv1 = parseFloat(firstLtv) || 0;
  const ltv2 = parseFloat(secondLtv) || 0;
  const pmi = parseFloat(pmiRate) || 0;

  const valErrors: Record<string, string> = {};
  if (!homePrice || price <= 0) valErrors.homePrice = "Home price must be greater than $0";
  if (!firstRate || r1 <= 0) valErrors.firstRate = "First mortgage rate must be greater than 0%";
  else if (r1 > 25) valErrors.firstRate = "Rate must be 25% or less";
  if (!secondRate || r2 <= 0) valErrors.secondRate = "Second mortgage rate must be greater than 0%";
  else if (r2 > 25) valErrors.secondRate = "Rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (ltv1 <= 0 || ltv1 > 95) valErrors.firstLtv = "First LTV must be 1–95%";
  if (ltv2 < 0 || ltv2 > 95) valErrors.secondLtv = "Second LTV must be 0–95%";
  if (ltv1 + ltv2 > 100) valErrors.secondLtv = "First + second LTV cannot exceed 100%";
  if (pmi < 0 || pmi > 3) valErrors.pmiRate = "PMI rate must be 0–3%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Combo Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Combo Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div>{valErrors.homePrice && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.homePrice}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">First Mortgage Rate (%)</label><div className={i}><input type="number" value={firstRate} onChange={e => setFirstRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.firstRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.firstRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Second Mortgage Rate (%)</label><div className={i}><input type="number" value={secondRate} onChange={e => setSecondRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.secondRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.secondRate}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Loan Structure</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">First Mortgage LTV (%)</label><div className={i}><input type="number" value={firstLtv} onChange={e => setFirstLtv(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.firstLtv && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.firstLtv}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Second Mortgage LTV (%)</label><div className={i}><input type="number" value={secondLtv} onChange={e => setSecondLtv(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.secondLtv && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.secondLtv}</p>}</div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Comparison</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">PMI Annual Rate (%)</label><div className={i}><input type="number" value={pmiRate} onChange={e => setPmiRate(e.target.value)} step="0.05" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.pmiRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.pmiRate}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Combined Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.combinedPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlySavings >= 0 ? result.monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo cheaper than a single loan with PMI" : result.monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo more than a single loan with PMI"} · PMI avoided</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["First Mortgage", result.firstPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-primary"],
                ["Second Mortgage", result.secondPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-amber-600"],
                ["Monthly Savings", (result.monthlySavings >= 0 ? "+" : "") + result.monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), result.monthlySavings >= 0 ? "text-emerald-600" : "text-red-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Combo Loan vs Single Loan + PMI</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 100) + "00"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "amount" ? "Monthly Payment" : name, "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="amount" name="Monthly Payment" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <ReferenceLine y={result.combinedPayment} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Combo Payment", fontSize: 10, position: "right", fill: "#f59e0b" }} />
                </BarChart>
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
          <h2 className="text-2xl font-bold mb-3">How a Combo Loan Works</h2>
          <p>A combo loan splits your purchase into a first mortgage (typically 80% of the home's value) and a second mortgage (usually 10–15%), with the rest as your down payment. Because the first mortgage stays at or below 80% loan-to-value, you avoid private mortgage insurance — historically the whole point of the structure. The trade-off is that the second mortgage carries a higher rate than the first, so whether a combo beats a single loan with PMI depends on the gap between those rates and how long you keep the loan. When the second mortgage rate is far above the first, PMI can actually be cheaper; when the gap is small, the combo wins. Run both scenarios here before you commit.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is an 80/10/10 combo loan?", answer: "An 80/10/10 loan uses an 80% first mortgage, a 10% second mortgage, and a 10% down payment. The first mortgage stays under the 80% PMI threshold, so you pay no private mortgage insurance while still financing 90% of the home." },
          { question: "When does a combo loan beat a single loan with PMI?", answer: "When the second mortgage's rate is close to the first mortgage's rate, the PMI savings outweigh the second lien's higher rate. If the second rate runs several points higher, or you expect to drop PMI quickly, a single loan with PMI is often cheaper." },
          { question: "Can I deduct interest on both loans?", answer: "Interest on a second mortgage used to buy, build, or improve your home is generally deductible as home acquisition debt up to the IRS limits — the same $750,000 cap that applies across your combined acquisition debt. Confirm your situation with a tax professional." },
        ]} pageUrl="https://racira.com/calculator/combo-loan-calculator" />
        <PopularCalculators exclude="/calculator/combo-loan-calculator" />
      </div>
    </div>
  </>);
}
