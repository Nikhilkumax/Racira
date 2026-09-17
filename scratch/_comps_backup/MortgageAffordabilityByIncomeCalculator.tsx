"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  grossIncome: number;
  dtiRatio: number;
  interestRate: number;
  termYears: number;
  downPaymentPct: number;
  propertyTax: number;
  insurance: number;
}

interface Result {
  maxLoan: number;
  maxHomePrice: number;
  monthlyPayment: number;
  totalMonthly: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const monthlyIncome = inp.grossIncome / 12;
  const maxHousingPayment = monthlyIncome * (inp.dtiRatio / 100);
  const monthlyTax = inp.propertyTax / 12;
  const monthlyInsurance = inp.insurance / 12;
  const maxPAndI = maxHousingPayment - monthlyTax - monthlyInsurance;

  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const maxLoan = r > 0 ? maxPAndI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : maxPAndI * n;
  const maxHomePrice = maxLoan / (1 - inp.downPaymentPct / 100);

  const breakdown = [
    { label: "Gross Annual Income", value: fmt(inp.grossIncome) },
    { label: "Monthly Gross Income", value: "$" + fmtD(monthlyIncome) },
    { label: "Max Housing Payment (" + inp.dtiRatio + "%)", value: "$" + fmtD(maxHousingPayment), highlight: true },
    { label: "Property Tax (monthly)", value: "$" + fmtD(monthlyTax) },
    { label: "Insurance (monthly)", value: "$" + fmtD(monthlyInsurance) },
    { label: "Max P&I Payment", value: "$" + fmtD(maxPAndI) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Down Payment", value: inp.downPaymentPct + "%" },
    { label: "Max Loan Amount", value: fmt(maxLoan), highlight: true },
    { label: "Max Home Price", value: fmt(maxHomePrice), highlight: true },
  ];

  const summaryStats = [
    { label: "Max Home Price", value: fmt(maxHomePrice) },
    { label: "Max Loan", value: fmt(maxLoan) },
    { label: "Monthly P&I", value: "$" + fmtD(maxPAndI) },
    { label: "Total Monthly", value: "$" + fmtD(maxHousingPayment) },
    { label: "DTI Ratio", value: inp.dtiRatio + "%" },
    { label: "Down Payment", value: fmt(maxHomePrice * inp.downPaymentPct / 100) },
    { label: "Total Interest (est.)", value: fmt(maxPAndI * n - maxLoan) },
    { label: "Cost per $1000 Loan", value: "$" + fmtD((maxPAndI * n) / maxLoan * 1000) },
  ];

  const PIE = ["hsl(var(--primary))", "#10b981", "#f59e0b"];
  const chartData = [
    { name: "P&I", value: Math.round(maxPAndI), color: PIE[0] },
    { name: "Property Tax", value: Math.round(monthlyTax), color: PIE[1] },
    { name: "Insurance", value: Math.round(monthlyInsurance), color: PIE[2] },
  ].filter((d) => d.value > 0);

  return { maxLoan, maxHomePrice, monthlyPayment: maxPAndI, totalMonthly: maxHousingPayment, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { grossIncome: 90000, dtiRatio: 28, interestRate: 6.5, termYears: 30, downPaymentPct: 20, propertyTax: 3600, insurance: 1200 };

export default function MortgageAffordabilityByIncomeCalculator() {
  const [grossIncome, setGrossIncome] = useState(String(DEFAULTS.grossIncome));
  const [dtiRatio, setDtiRatio] = useState(String(DEFAULTS.dtiRatio));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [downPaymentPct, setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULTS.propertyTax));
  const [insurance, setInsurance] = useState(String(DEFAULTS.insurance));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    grossIncome: parseFloat(grossIncome) || 0,
    dtiRatio: parseFloat(dtiRatio) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 30,
    downPaymentPct: parseFloat(downPaymentPct) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    insurance: parseFloat(insurance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setGrossIncome(String(DEFAULTS.grossIncome));
    setDtiRatio(String(DEFAULTS.dtiRatio));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setDownPaymentPct(String(DEFAULTS.downPaymentPct));
    setPropertyTax(String(DEFAULTS.propertyTax));
    setInsurance(String(DEFAULTS.insurance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(grossIncome) <= 0 || v(interestRate) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Affordability by Income Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Affordability by Income Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Gross Annual Income ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={grossIncome} onChange={e => setGrossIncome(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">DTI Ratio (%)</label><div className={i}><input type="number" value={dtiRatio} onChange={e => setDtiRatio(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Housing Costs</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Property Tax (Annual)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={propertyTax} onChange={e => setPropertyTax(e.target.value)} className={c} /></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Insurance (Annual)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={insurance} onChange={e => setInsurance(e.target.value)} className={c} /></div></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            <button onClick={calc_} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
            <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" ref={printRef}>
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3"><button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Printer className="h-3.5 w-3.5" /> Print</button></div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Maximum Home Price</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmt(result.maxHomePrice)}</div>
              <div className="text-sm text-muted-foreground mt-1">Max Loan: ${fmt(result.maxLoan)} · Monthly: ${fmtD(result.totalMonthly)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Home Price", fmt(result.maxHomePrice)], ["Max Loan", fmt(result.maxLoan)], ["Monthly", "$" + result.totalMonthly.toFixed(2)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0"><div className="w-[160px] h-[160px] relative"><ResponsiveContainer width="100%" height="100%"><RPie><Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">{result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /></RPie></ResponsiveContainer></div></div>
              <div className="flex-1 flex flex-col gap-2"><h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Monthly Housing Costs</h4>{result.chartData.map(item => (<div key={item.name} className="flex items-center justify-between text-[13px]"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><span className="font-semibold text-muted-foreground">{item.name}</span></div><span className="font-bold text-foreground">${item.value.toLocaleString()}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
              <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">How Much House Can You Afford?</h2>
          <p>Lenders typically use the 28/36 rule: your housing payment (PITI) should not exceed 28% of gross monthly income, and total debt payments should not exceed 36%. This calculator uses the front-end DTI ratio to determine the maximum home price you can afford based on your income.</p>
        </section>
        <PopularCalculators exclude="/calculator/mortgage-affordability-by-income-calculator" />
      </div>
    </div>
  </>);
}
