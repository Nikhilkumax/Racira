"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  systemCost: number;
  loanRate: number;
  loanTerm: number;
  annualSavings: number;
  federalTaxCredit: number;
  stateIncentive: number;
  electricityRateIncrease: number;
  systemLifespan: number;
}

interface Result {
  loanPayment: number;
  totalLoanCost: number;
  totalInterest: number;
  netSystemCost: number;
  paybackYears: number;
  lifetimeSavings: number;
  netROI: number;
  savingsInYear1: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; cumSavings: number; cumLoanCost: number }[];
}

function calc(inp: Inputs): Result {
  const netSystemCost = inp.systemCost - inp.systemCost * (inp.federalTaxCredit / 100) - inp.stateIncentive;
  const r = inp.loanRate / 100 / 12;
  const n = inp.loanTerm * 12;
  const loanPayment = r > 0 ? (netSystemCost * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : netSystemCost / n;
  const totalLoanCost = loanPayment * n;
  const totalInterest = totalLoanCost - netSystemCost;

  // Cumulative savings accounting for electricity rate increases
  const chartData: { year: string; cumSavings: number; cumLoanCost: number }[] = [];
  let cumSavings = 0;
  let cumLoanCost = 0;
  let annualSavingsCurrent = inp.annualSavings;
  let paybackYears = Infinity;
  let lifetimeSavings = 0;

  const maxYears = Math.max(inp.systemLifespan, inp.loanTerm);

  for (let yr = 1; yr <= maxYears; yr++) {
    cumSavings += annualSavingsCurrent;
    if (yr <= inp.loanTerm) {
      cumLoanCost += loanPayment * 12;
    }
    lifetimeSavings += annualSavingsCurrent;

    if (cumSavings >= cumLoanCost && paybackYears === Infinity) {
      paybackYears = yr;
    }

    chartData.push({
      year: "Yr " + yr,
      cumSavings: Math.round(cumSavings),
      cumLoanCost: Math.round(cumLoanCost),
    });

    annualSavingsCurrent *= 1 + inp.electricityRateIncrease / 100;
  }

  lifetimeSavings -= totalLoanCost;
  const netROI = netSystemCost > 0 ? ((lifetimeSavings / netSystemCost) * 100) : 0;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "System Cost", value: fmt(inp.systemCost) },
    { label: "Federal Tax Credit (" + inp.federalTaxCredit + "%)", value: "-" + fmt(inp.systemCost * inp.federalTaxCredit / 100) },
    { label: "State Incentive", value: "-" + fmt(inp.stateIncentive) },
    { label: "Net System Cost", value: fmt(netSystemCost), highlight: true },
    { label: "Loan Rate", value: inp.loanRate + "%/yr" },
    { label: "Loan Term", value: inp.loanTerm + " years" },
    { label: "Monthly Payment", value: "$" + fmtD(loanPayment), highlight: true },
    { label: "Total Loan Cost", value: fmt(totalLoanCost) },
    { label: "Total Interest Paid", value: fmt(totalInterest) },
    { label: "Annual Energy Savings (Yr 1)", value: fmt(inp.annualSavings) },
    { label: "System Lifespan", value: inp.systemLifespan + " years" },
    { label: "Payback Period", value: paybackYears === Infinity ? "Never" : paybackYears + " years", highlight: true },
    { label: "Lifetime Net Savings", value: fmt(lifetimeSavings), highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(loanPayment) + "/mo" },
    { label: "Total Loan Cost", value: fmt(totalLoanCost) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Payback Period", value: paybackYears === Infinity ? "N/A" : paybackYears + " years" },
    { label: "Yr 1 Savings", value: fmt(inp.annualSavings) + "/yr" },
    { label: "Lifetime Savings", value: fmt(lifetimeSavings) },
    { label: "Net ROI", value: netROI.toFixed(1) + "%" },
    { label: "Net System Cost", value: fmt(netSystemCost) },
  ];

  return { loanPayment, totalLoanCost, totalInterest, netSystemCost, paybackYears, lifetimeSavings, netROI, savingsInYear1: inp.annualSavings, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { systemCost: 25000, loanRate: 5.9, loanTerm: 10, annualSavings: 3000, federalTaxCredit: 30, stateIncentive: 0, electricityRateIncrease: 3, systemLifespan: 25 };

export default function GreenEnergyLoanCalculator() {
  const [systemCost, setSystemCost] = useState(String(DEFAULTS.systemCost));
  const [loanRate, setLoanRate] = useState(String(DEFAULTS.loanRate));
  const [loanTerm, setLoanTerm] = useState(String(DEFAULTS.loanTerm));
  const [annualSavings, setAnnualSavings] = useState(String(DEFAULTS.annualSavings));
  const [federalTaxCredit, setFederalTaxCredit] = useState(String(DEFAULTS.federalTaxCredit));
  const [stateIncentive, setStateIncentive] = useState(String(DEFAULTS.stateIncentive));
  const [electricityRateIncrease, setElectricityRateIncrease] = useState(String(DEFAULTS.electricityRateIncrease));
  const [systemLifespan, setSystemLifespan] = useState(String(DEFAULTS.systemLifespan));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    systemCost: parseFloat(systemCost) || 0,
    loanRate: parseFloat(loanRate) || 0,
    loanTerm: parseInt(loanTerm) || 10,
    annualSavings: parseFloat(annualSavings) || 0,
    federalTaxCredit: parseFloat(federalTaxCredit) || 0,
    stateIncentive: parseFloat(stateIncentive) || 0,
    electricityRateIncrease: parseFloat(electricityRateIncrease) || 0,
    systemLifespan: parseInt(systemLifespan) || 25,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setSystemCost(String(DEFAULTS.systemCost));
    setLoanRate(String(DEFAULTS.loanRate));
    setLoanTerm(String(DEFAULTS.loanTerm));
    setAnnualSavings(String(DEFAULTS.annualSavings));
    setFederalTaxCredit(String(DEFAULTS.federalTaxCredit));
    setStateIncentive(String(DEFAULTS.stateIncentive));
    setElectricityRateIncrease(String(DEFAULTS.electricityRateIncrease));
    setSystemLifespan(String(DEFAULTS.systemLifespan));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "How does a green energy loan work?", answer: "A green energy loan (also called a solar loan or clean energy loan) finances renewable energy installations like solar panels, heat pumps, or energy-efficient upgrades. Many lenders offer lower rates for energy improvements. The federal Investment Tax Credit (ITC) currently provides a 30% tax credit for solar installations." },
    { question: "What incentives are available for green energy?", answer: "The federal government offers a 30% Investment Tax Credit (ITC) for solar installations through 2032. Many states offer additional rebates, tax credits, or performance-based incentives. Utility companies may also offer net metering or solar renewable energy credits (SRECs)." },
    { question: "How long until a solar loan pays for itself?", answer: "The typical payback period for a solar loan is 6–12 years, depending on your system cost, energy savings, available incentives, and loan terms. After the loan is paid off, you continue receiving free electricity for the remaining 15–20+ years of the system's lifespan." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Green Energy Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Green Energy Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">System Cost ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={systemCost} onChange={e => setSystemCost(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Rate (%)</label><div className={i}><input type="number" value={loanRate} onChange={e => setLoanRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Annual Energy Savings ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualSavings} onChange={e => setAnnualSavings(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">System Lifespan</label><div className={i}><input type="number" value={systemLifespan} onChange={e => setSystemLifespan(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Incentives</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Federal Tax Credit (%)</label><div className={i}><input type="number" value={federalTaxCredit} onChange={e => setFederalTaxCredit(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                <div><label className="text-sm font-medium mb-1 block">State Incentive ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={stateIncentive} onChange={e => setStateIncentive(e.target.value)} className={c} /></div></div>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Projections</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Electricity Rate Increase (%/yr)</label><div className={i}><input type="number" value={electricityRateIncrease} onChange={e => setElectricityRateIncrease(e.target.value)} step="0.5" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              </div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Loan Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.loanPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Payback: {result.paybackYears === Infinity ? "Never" : result.paybackYears + " years"} · Lifetime Net Savings: ${result.lifetimeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + result.loanPayment.toFixed(2)], ["Payback", result.paybackYears === Infinity ? "N/A" : result.paybackYears + " yrs"], ["Lifetime ROI", result.netROI.toFixed(1) + "%"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Cumulative Savings vs Loan Cost</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="cumSavings" fill="#22c55e" name="Cumulative Savings" radius={[4, 4, 0, 0]} /><Bar dataKey="cumLoanCost" fill="hsl(var(--primary))" name="Cumulative Loan Cost" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Green Energy Loans</h2><p>Green energy loans finance renewable energy systems like solar panels, heat pumps, and energy-efficient upgrades. With the federal 30% Investment Tax Credit and rising electricity costs, many homeowners find that solar loan payments are offset by energy savings from day one — and the system continues generating free electricity long after the loan is repaid.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/green-energy-loan-calculator" /><PopularCalculators exclude="/calculator/green-energy-loan-calculator" /></div>
    </div>
  </>);
}
