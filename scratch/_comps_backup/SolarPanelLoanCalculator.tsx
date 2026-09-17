"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  systemCost: number;
  apr: number;
  termYears: number;
  downPayment: number;
  taxCreditPct: number;
  monthlySavings: number;
  annualMaintenance: number;
}

interface Result {
  amountFinanced: number;
  monthlyPayment: number;
  totalInterest: number;
  taxCredit: number;
  netCost: number;
  monthlySavings: number;
  monthlyNet: number;
  paybackYears: number;
  chartData: { label: string; loanCost: number; utility: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const amountFinanced = inp.systemCost - inp.downPayment;
  const r = inp.apr / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = (amountFinanced * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalInterest = monthlyPayment * n - amountFinanced;
  const taxCredit = (inp.systemCost * inp.taxCreditPct) / 100;
  const netCost = Math.max(0, inp.systemCost - taxCredit);
  const monthlyMaintenance = inp.annualMaintenance / 12;
  const monthlyNet = monthlyPayment - inp.monthlySavings + monthlyMaintenance;
  const paybackYears = inp.monthlySavings > 0 ? netCost / (inp.monthlySavings * 12) : Infinity;

  const chartData: { label: string; loanCost: number; utility: number }[] = [];
  for (let y = 1; y <= inp.termYears; y++) {
    chartData.push({
      label: "Yr " + y,
      loanCost: Math.round(monthlyPayment * 12),
      utility: Math.round(inp.monthlySavings * 12),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "System Cost", value: fmt(inp.systemCost) },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Amount Financed", value: fmt(amountFinanced) },
    { label: "Loan APR", value: inp.apr + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Loan Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Federal Tax Credit (" + inp.taxCreditPct + "%)", value: fmt(taxCredit), highlight: true },
    { label: "Net Cost After Credit", value: fmt(netCost) },
    { label: "Monthly Utility Savings", value: fmtD(inp.monthlySavings) },
    { label: "Maintenance", value: fmtD(monthlyMaintenance) + "/mo" },
    { label: "Net Monthly Cash Flow", value: fmtD(monthlyNet), isTotal: true, highlight: true },
    { label: "Payback Period", value: paybackYears === Infinity ? "—" : paybackYears.toFixed(1) + " years" },
    { label: "Total Interest", value: fmt(totalInterest) },
  ];

  const summaryStats = [
    { label: "Monthly Loan Payment", value: fmtD(monthlyPayment) },
    { label: "Utility Savings", value: fmtD(inp.monthlySavings) + "/mo" },
    { label: "Maintenance", value: fmtD(monthlyMaintenance) + "/mo" },
    { label: "Net Monthly Cash Flow", value: fmtD(monthlyNet) },
    { label: "Federal Tax Credit", value: fmt(taxCredit) },
    { label: "Net Cost After Credit", value: fmt(netCost) },
    { label: "Payback Period", value: paybackYears === Infinity ? "—" : paybackYears.toFixed(1) + " years" },
    { label: "Total Interest", value: fmt(totalInterest) },
  ];

  return { amountFinanced, monthlyPayment, totalInterest, taxCredit, netCost, monthlySavings: inp.monthlySavings, monthlyNet, paybackYears, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { systemCost: 28000, apr: 6.5, termYears: 20, downPayment: 0, taxCreditPct: 30, monthlySavings: 120, annualMaintenance: 100 };

export default function SolarPanelLoanCalculator() {
  const [systemCost, setSystemCost] = useState(String(DEFAULTS.systemCost));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [taxCreditPct, setTaxCreditPct] = useState(String(DEFAULTS.taxCreditPct));
  const [monthlySavings, setMonthlySavings] = useState(String(DEFAULTS.monthlySavings));
  const [annualMaintenance, setAnnualMaintenance] = useState(String(DEFAULTS.annualMaintenance));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    systemCost: parseFloat(systemCost) || 0,
    apr: parseFloat(apr) || 0,
    termYears: parseInt(termYears) || 0,
    downPayment: parseFloat(downPayment) || 0,
    taxCreditPct: parseFloat(taxCreditPct) || 0,
    monthlySavings: parseFloat(monthlySavings) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setSystemCost(String(DEFAULTS.systemCost));
    setApr(String(DEFAULTS.apr));
    setTermYears(String(DEFAULTS.termYears));
    setDownPayment(String(DEFAULTS.downPayment));
    setTaxCreditPct(String(DEFAULTS.taxCreditPct));
    setMonthlySavings(String(DEFAULTS.monthlySavings));
    setAnnualMaintenance(String(DEFAULTS.annualMaintenance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const cost = parseFloat(systemCost) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termYears) || 0;
  const down = parseFloat(downPayment) || 0;
  const credit = parseFloat(taxCreditPct) || 0;
  const savings = parseFloat(monthlySavings) || 0;
  const maint = parseFloat(annualMaintenance) || 0;

  const valErrors: Record<string, string> = {};
  if (!systemCost || cost <= 0) valErrors.systemCost = "System cost must be greater than $0";
  if (!apr || rate <= 0) valErrors.apr = "APR must be greater than 0%";
  else if (rate > 15) valErrors.apr = "Solar loan APRs rarely exceed 15%";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 25) valErrors.termYears = "Term must be 25 years or less";
  if (down < 0 || down >= cost) valErrors.downPayment = "Down payment must be $0 and below the system cost";
  if (credit < 0 || credit > 30) valErrors.taxCreditPct = "Tax credit must be 0–30%";
  if (savings < 0) valErrors.monthlySavings = "Utility savings must be $0 or more";
  if (maint < 0) valErrors.annualMaintenance = "Maintenance must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Solar Panel Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solar Panel Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">System Cost ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={systemCost} onChange={e => setSystemCost(e.target.value)} className={c} /></div>{valErrors.systemCost && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.systemCost}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div>{valErrors.downPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPayment}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Incentives & Savings</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Federal Tax Credit (%)</label><div className={i}><input type="number" value={taxCreditPct} onChange={e => setTaxCreditPct(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.taxCreditPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.taxCreditPct}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Monthly Utility Savings ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlySavings} onChange={e => setMonthlySavings(e.target.value)} className={c} /></div>{valErrors.monthlySavings && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlySavings}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Annual Maintenance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualMaintenance} onChange={e => setAnnualMaintenance(e.target.value)} className={c} /></div>{valErrors.annualMaintenance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualMaintenance}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Loan Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlyNet >= 0 ? "Net of " + result.monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo utility savings, you pay " + result.monthlyNet.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo" : "Utility savings of " + result.monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo exceed the payment — net cash flow is " + result.monthlyNet.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Federal Tax Credit", "$" + Math.round(result.taxCredit).toLocaleString("en-US"), "text-emerald-600"],
                ["Net Cost After Credit", "$" + Math.round(result.netCost).toLocaleString("en-US"), "text-primary"],
                ["Payback Period", result.paybackYears === Infinity ? "—" : result.paybackYears.toFixed(1) + " years", "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Loan Cost vs Utility Savings by Year</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(result.chartData.length / 10) - 1)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "loanCost" ? "Loan Cost" : "Utility Savings", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "loanCost" ? "Loan Cost" : "Utility Savings")} />
                  <Bar dataKey="loanCost" name="loanCost" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utility" name="utility" fill="#22c55e" radius={[4, 4, 0, 0]} />
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
          <h2 className="text-2xl font-bold mb-3">Financing Solar Without Overpaying</h2>
          <p>Most homeowners finance solar panels rather than paying cash, and the loan structure decides whether the deal is a good one. The two things that move the math most are the federal investment tax credit — 30% of the system cost, claimed on your taxes the year after installation — and your actual utility savings. If the monthly loan payment lands below your old electric bill, the panels pay for themselves from day one; if it's above, you're betting that utility inflation will close the gap. Watch for dealers who mark up the system price to absorb the credit, and compare loan APRs — solar-specific loans can run from 4% to 12%, and the interest is not tax-deductible like a home equity loan's can be. A home equity loan or HELOC is often the cheaper way to finance the same system.</p>
        </section>
        <FAQSection faqs={[
          { question: "How does the solar tax credit work?", answer: "The federal Investment Tax Credit is 30% of the system cost, claimed on your federal tax return for the year the system goes live. It offsets tax you owe; if your liability is smaller, the remainder carries forward to future years." },
          { question: "Are solar loans cheaper than home equity financing?", answer: "Sometimes — promotional solar loans can start around 4–5%, but dealer fees often hide in the price. Home equity loans and HELOCs typically offer 6–9% with deductible interest. Compare APRs and total system price, not just the monthly pitch." },
          { question: "What is a good payback period for solar?", answer: "With the 30% credit, most systems pay back in 6–12 years depending on your utility rates and sun exposure. A 20-year loan paid off in that window starts generating free electricity for the remaining life of the panels, which typically exceed 25 years." },
        ]} pageUrl="https://racira.com/calculator/solar-panel-loan-calculator" />
        <PopularCalculators exclude="/calculator/solar-panel-loan-calculator" />
      </div>
    </div>
  </>);
}