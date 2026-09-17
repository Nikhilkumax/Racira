"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  homePrice: number;
  loanAmount: number;
  samRate: number;
  termYears: number;
  appreciationShare: number;
  growthRate: number;
  yearsToExit: number;
  marketRate: number;
}

interface Result {
  samPayment: number;
  marketPayment: number;
  monthlySavings: number;
  futureValue: number;
  totalAppreciation: number;
  lenderShareDue: number;
  interestSaved: number;
  netPosition: number;
  chartData: { year: string; samPayment: number; marketPayment: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(principal: number, r: number, n: number): number {
  if (r <= 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

function calc(inp: Inputs): Result {
  const n = inp.termYears * 12;
  const rSam = inp.samRate / 100 / 12;
  const rMkt = inp.marketRate / 100 / 12;

  const samPayment = pmt(inp.loanAmount, rSam, n);
  const marketPayment = pmt(inp.loanAmount, rMkt, n);
  const monthlySavings = marketPayment - samPayment;

  const y = Math.max(1, inp.yearsToExit);
  const futureValue = inp.homePrice * Math.pow(1 + inp.growthRate / 100, y);
  const totalAppreciation = Math.max(0, futureValue - inp.homePrice);
  const lenderShareDue = totalAppreciation * (inp.appreciationShare / 100);

  const interestSaved = monthlySavings * 12 * y;
  const netPosition = interestSaved - lenderShareDue;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const years = Math.min(y, 40);
  const chartData = Array.from({ length: years }, (_, i) => ({
    year: "Yr " + (i + 1),
    samPayment: Math.round(samPayment * 12),
    marketPayment: Math.round(marketPayment * 12),
  }));

  const breakdown = [
    { label: "Home Value Today", value: fmt(inp.homePrice) },
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "SAM Interest Rate", value: inp.samRate + "%" },
    { label: "Monthly Payment (SAM)", value: fmtD(samPayment), highlight: true },
    { label: "Market Rate Comparison", value: inp.marketRate + "%" },
    { label: "Standard Monthly Payment", value: fmtD(marketPayment) },
    { label: "Monthly Savings vs Market", value: fmtD(monthlySavings) + "/mo", highlight: true },
    { label: "Projected Home Value (" + y + " yrs)", value: fmt(futureValue) },
    { label: "Total Appreciation", value: fmt(totalAppreciation) },
    { label: "Lender Appreciation Share (" + inp.appreciationShare + "%)", value: fmt(lenderShareDue), highlight: true },
    { label: "Interest Saved Over " + y + " Years", value: fmt(interestSaved) },
    { label: "Net Position (Saved − Lender Share)", value: (netPosition >= 0 ? "" : "−") + fmt(Math.abs(netPosition)), isTotal: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment (SAM)", value: fmtD(samPayment) },
    { label: "Monthly Savings", value: fmtD(monthlySavings) + "/mo" },
    { label: "Due to Lender at Exit", value: fmt(lenderShareDue) },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Net Position", value: (netPosition >= 0 ? "" : "−") + fmt(Math.abs(netPosition)) },
    { label: "Projected Home Value", value: fmt(futureValue) },
    { label: "Total Appreciation", value: fmt(totalAppreciation) },
    { label: "Lender Share", value: inp.appreciationShare + "%" },
  ];

  return { samPayment, marketPayment, monthlySavings, futureValue, totalAppreciation, lenderShareDue, interestSaved, netPosition, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { homePrice: 400000, loanAmount: 320000, samRate: 4.5, termYears: 30, appreciationShare: 30, growthRate: 3.5, yearsToExit: 10, marketRate: 6.5 };

export default function SharedAppreciationMortgageCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [samRate, setSamRate] = useState(String(DEFAULTS.samRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [appreciationShare, setAppreciationShare] = useState(String(DEFAULTS.appreciationShare));
  const [growthRate, setGrowthRate] = useState(String(DEFAULTS.growthRate));
  const [yearsToExit, setYearsToExit] = useState(String(DEFAULTS.yearsToExit));
  const [marketRate, setMarketRate] = useState(String(DEFAULTS.marketRate));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    loanAmount: parseFloat(loanAmount) || 0,
    samRate: parseFloat(samRate) || 0,
    termYears: parseInt(termYears) || 1,
    appreciationShare: parseFloat(appreciationShare) || 0,
    growthRate: parseFloat(growthRate) || 0,
    yearsToExit: parseInt(yearsToExit) || 1,
    marketRate: parseFloat(marketRate) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setLoanAmount(String(DEFAULTS.loanAmount));
    setSamRate(String(DEFAULTS.samRate));
    setTermYears(String(DEFAULTS.termYears));
    setAppreciationShare(String(DEFAULTS.appreciationShare));
    setGrowthRate(String(DEFAULTS.growthRate));
    setYearsToExit(String(DEFAULTS.yearsToExit));
    setMarketRate(String(DEFAULTS.marketRate));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const price = parseFloat(homePrice) || 0;
  const loan = parseFloat(loanAmount) || 0;
  const samR = parseFloat(samRate) || 0;
  const term = parseInt(termYears) || 0;
  const share = parseFloat(appreciationShare) || 0;
  const growth = parseFloat(growthRate) || 0;
  const exitY = parseInt(yearsToExit) || 0;
  const mktR = parseFloat(marketRate) || 0;

  const valErrors: Record<string, string> = {};
  if (!homePrice || price <= 0) valErrors.homePrice = "Home Value must be greater than $0";
  if (!loanAmount || loan <= 0) valErrors.loanAmount = "Loan Amount must be greater than $0";
  else if (loan >= price) valErrors.loanAmount = "Loan Amount must be less than Home Value";
  if (!samRate || samR <= 0) valErrors.samRate = "SAM rate must be greater than 0%";
  else if (samR > 25) valErrors.samRate = "SAM rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (share < 0 || share > 100) valErrors.appreciationShare = "Appreciation share must be 0%–100%";
  if (growth < 0 || growth > 20) valErrors.growthRate = "Growth must be 0%–20%";
  if (!yearsToExit || exitY <= 0) valErrors.yearsToExit = "Exit year must be greater than 0";
  else if (exitY > 40) valErrors.yearsToExit = "Exit must be within 40 years";
  if (!marketRate || mktR <= 0) valErrors.marketRate = "Market rate must be greater than 0%";
  else if (mktR > 25) valErrors.marketRate = "Market rate must be 25% or less";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Shared Appreciation Mortgage Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Shared Appreciation Mortgage Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Home Value ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div>{valErrors.homePrice && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.homePrice}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">SAM Interest Rate (%)</label><div className={i}><input type="number" value={samRate} onChange={e => setSamRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.samRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.samRate}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Appreciation Sharing</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium mb-1 block">Lender Share of Appreciation (%)</label><div className={i}><input type="number" value={appreciationShare} onChange={e => setAppreciationShare(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.appreciationShare && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.appreciationShare}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Annual Appreciation (%)</label><div className={i}><input type="number" value={growthRate} onChange={e => setGrowthRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.growthRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.growthRate}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Exit After (Years)</label><div className={i}><input type="number" value={yearsToExit} onChange={e => setYearsToExit(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.yearsToExit && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.yearsToExit}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Standard Market Rate (%)</label><div className={i}><input type="number" value={marketRate} onChange={e => setMarketRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.marketRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.marketRate}</p>}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Due to Lender at Exit ({yearsToExit} Years)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.lenderShareDue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{share}% of {result.totalAppreciation.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} appreciation — vs {result.monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo saved on interest</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment (SAM)", "$" + Math.round(result.samPayment).toLocaleString("en-US"), "text-primary"],
                ["Monthly Savings vs Market", "$" + Math.round(result.monthlySavings).toLocaleString("en-US"), result.monthlySavings >= 0 ? "text-emerald-600" : "text-red-500"],
                ["Net Position at Exit", (result.netPosition >= 0 ? "" : "−") + "$" + Math.round(Math.abs(result.netPosition)).toLocaleString("en-US"), result.netPosition >= 0 ? "text-emerald-600" : "text-red-500"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Annual Payments: SAM vs Standard Market</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "samPayment" ? "SAM Annual Payment" : "Market Annual Payment", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "samPayment" ? "SAM Payment" : "Market Payment")} />
                  <Bar dataKey="samPayment" name="samPayment" radius={[3, 3, 0, 0]}><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="marketPayment" name="marketPayment" radius={[3, 3, 0, 0]}><Cell fill="#94a3b8" /></Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">The shaded gap is your monthly interest saving; weigh it against the appreciation share due when you sell or refinance.</p>
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
          <h2 className="text-2xl font-bold mb-3">How Shared Appreciation Mortgages Work</h2>
          <p>A shared appreciation mortgage (SAM) trades a below-market interest rate for a share of the home's future appreciation. At sale or refinance, the lender collects its percentage of the gain above the original value. The math is a trade-off: lower monthly payments now versus a lump-sum obligation later. If the home appreciates slowly or you hold it for decades, the interest savings can exceed the appreciation share; if values surge, the lender's share can be large. This calculator compares the SAM payment against a standard market-rate loan and nets the interest saved against the appreciation due at your planned exit.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a shared appreciation mortgage?", answer: "A mortgage where the lender offers a below-market interest rate in exchange for a contractual share of the home's appreciation when you sell, refinance, or reach a maturity date. Typical lender shares run 20%–50% of the gain." },
          { question: "When is the appreciation share paid?", answer: "Usually at sale, refinance, payoff, or a set maturity (often 10 years). Some programs also cap the total the lender can collect. Always read the triggering events and caps in the note." },
          { question: "Is a SAM a good deal?", answer: "It depends on how long you stay and how fast values grow. Short hold + modest appreciation favors the borrower; strong appreciation or a very long hold can make the lender's share exceed the interest saved. This calculator nets both sides at your chosen exit year." },
        ]} pageUrl="https://racira.com/calculator/shared-appreciation-mortgage-calculator" />
        <PopularCalculators exclude="/calculator/shared-appreciation-mortgage-calculator" />
      </div>
    </div>
  </>);
}
