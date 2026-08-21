"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  homePrice: number;
  downPaymentPct: number;
  interestRate: number;
  termYears: number;
  loanType: "conventional" | "fha" | "va" | "usda";
  creditScore: number;
}

interface Result {
  loanAmount: number;
  downPayment: number;
  ltv: number;
  monthlyPayment: number;
  monthlyPmi: number;
  totalMonthly: number;
  totalPmiCost: number;
  upfrontMip: number;
  annualMipRate: number;
  pmiRate: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getPmiRate(ltv: number, creditScore: number): number {
  if (ltv <= 80) return 0;
  if (ltv <= 90) {
    if (creditScore >= 760) return 0.2;
    if (creditScore >= 720) return 0.3;
    if (creditScore >= 680) return 0.5;
    if (creditScore >= 640) return 0.7;
    return 0.9;
  }
  // >90% LTV
  if (creditScore >= 760) return 0.3;
  if (creditScore >= 720) return 0.4;
  if (creditScore >= 680) return 0.6;
  if (creditScore >= 640) return 0.9;
  return 1.1;
}

function getFhaMipRate(ltv: number, termYears: number): number {
  if (termYears <= 15) return ltv <= 90 ? 0.35 : 0.7;
  // 30-year
  if (ltv <= 90) return 0.5;
  return 0.55;
}

function calc(inp: Inputs): Result {
  const P = inp.homePrice;
  const dp = P * (inp.downPaymentPct / 100);
  const loanAmount = P - dp;
  const ltv = P > 0 ? (loanAmount / P) * 100 : 0;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;

  let pmiRate = 0;
  let monthlyPmi = 0;
  let totalPmiCost = 0;
  let upfrontMip = 0;
  let annualMipRate = 0;

  if (inp.loanType === "conventional") {
    pmiRate = getPmiRate(ltv, inp.creditScore);
    monthlyPmi = loanAmount * (pmiRate / 100) / 12;
    // Estimate PMI duration: until LTV reaches 78% through payments
    const monthsTo78 = Math.ceil(Math.log(0.78 / (ltv / 100)) / Math.log(1 + r));
    totalPmiCost = monthlyPmi * Math.min(monthsTo78, n);
  } else if (inp.loanType === "fha") {
    upfrontMip = loanAmount * 0.0175;
    annualMipRate = getFhaMipRate(ltv, inp.termYears);
    monthlyPmi = loanAmount * (annualMipRate / 100) / 12;
    // FHA MIP for >90% LTV lasts life of loan
    totalPmiCost = ltv > 90 ? monthlyPmi * n : monthlyPmi * Math.min(Math.ceil(Math.log(0.78 / (ltv / 100)) / Math.log(1 + r)), n);
  }
  // VA and USDA: no PMI

  const totalMonthly = monthlyPayment + monthlyPmi;

  const breakdown = [
    { label: "Home Price", value: fmt(P) },
    { label: "Down Payment", value: fmt(dp) + " (" + inp.downPaymentPct + "%)" },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "LTV", value: ltv.toFixed(1) + "%" },
    { label: "Monthly P&I", value: "$" + fmtD(monthlyPayment) },
    { label: inp.loanType === "fha" ? "Monthly MIP" : "Monthly PMI", value: "$" + fmtD(monthlyPmi), highlight: true },
    { label: "Total Monthly", value: "$" + fmtD(totalMonthly), highlight: true },
    { label: inp.loanType === "fha" ? "Upfront MIP (1.75%)" : "PMI Rate", value: inp.loanType === "fha" ? fmt(upfrontMip) : pmiRate.toFixed(2) + "%" },
    { label: "Total PMI/MIP Cost", value: fmt(totalPmiCost), highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly PMI/MIP", value: "$" + fmtD(monthlyPmi) + "/mo" },
    { label: "Total PMI/MIP Cost", value: fmt(totalPmiCost) },
    { label: "LTV", value: ltv.toFixed(1) + "%" },
    { label: "PMI Rate", value: pmiRate.toFixed(2) + "%" },
    { label: "Monthly P&I", value: "$" + fmtD(monthlyPayment) },
    { label: "Total Monthly", value: "$" + fmtD(totalMonthly) },
    { label: "Upfront MIP", value: inp.loanType === "fha" ? fmt(upfrontMip) : "N/A" },
    { label: "Loan Type", value: inp.loanType.toUpperCase() },
  ];

  const PIE = ["hsl(var(--primary))", "#f59e0b"];
  const chartData = [
    { name: "Principal & Interest", value: Math.round(monthlyPayment), color: PIE[0] },
    { name: "PMI/MIP", value: Math.round(monthlyPmi), color: PIE[1] },
  ].filter((d) => d.value > 0);

  return { loanAmount, downPayment: dp, ltv, monthlyPayment, monthlyPmi, totalMonthly, totalPmiCost, upfrontMip, annualMipRate, pmiRate, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { homePrice: 400000, downPaymentPct: 10, interestRate: 6.5, termYears: 30, loanType: "conventional", creditScore: 720 };

export default function MortgageInsurancePremiumCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPaymentPct, setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [loanType, setLoanType] = useState(DEFAULTS.loanType);
  const [creditScore, setCreditScore] = useState(String(DEFAULTS.creditScore));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPaymentPct: parseFloat(downPaymentPct) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 30,
    loanType,
    creditScore: parseInt(creditScore) || 720,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPaymentPct(String(DEFAULTS.downPaymentPct));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setLoanType(DEFAULTS.loanType);
    setCreditScore(String(DEFAULTS.creditScore));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(homePrice) <= 0 || v(downPaymentPct) < 0 || v(interestRate) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Insurance Premium Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Insurance Premium Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(e.target.value)} step="0.5" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Type</label>
              <div className="relative h-10"><select value={loanType} onChange={e => setLoanType(e.target.value as Inputs["loanType"])} className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium">
                <option value="conventional">Conventional</option>
                <option value="fha">FHA</option>
                <option value="va">VA</option>
                <option value="usda">USDA</option>
              </select></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Credit Score</label><div className={i}><input type="number" value={creditScore} onChange={e => setCreditScore(e.target.value)} className={c} /></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">PMI Information</div>
                <p className="text-sm text-muted-foreground">Conventional PMI rates are based on LTV and credit score. FHA MIP rates are set by HUD. VA and USDA loans do not require monthly mortgage insurance.</p>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{loanType === "fha" ? "Monthly MIP" : "Monthly PMI"}</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.monthlyPmi)}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Monthly: ${fmtD(result.totalMonthly)} · LTV: {result.ltv.toFixed(1)}%</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["PMI/MIP", "$" + result.monthlyPmi.toFixed(2) + "/mo"], ["LTV", result.ltv.toFixed(1) + "%"], ["Total Cost", fmt(result.totalPmiCost)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0"><div className="w-[160px] h-[160px] relative"><ResponsiveContainer width="100%" height="100%"><RPie><Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">{result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /></RPie></ResponsiveContainer></div></div>
              <div className="flex-1 flex flex-col gap-2"><h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Monthly Payment Split</h4>{result.chartData.map(item => (<div key={item.name} className="flex items-center justify-between text-[13px]"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><span className="font-semibold text-muted-foreground">{item.name}</span></div><span className="font-bold text-foreground">${item.value.toLocaleString()}</span></div>))}</div>
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
          <h2 className="text-2xl font-bold mb-3">Understanding Mortgage Insurance</h2>
          <p>Mortgage insurance protects the lender if you default on your loan. Conventional loans require Private Mortgage Insurance (PMI) when LTV exceeds 80%. FHA loans require a Mortgage Insurance Premium (MIP) regardless of down payment. VA and USDA loans do not require monthly mortgage insurance, though they have their own fee structures.</p>
        </section>
        <PopularCalculators exclude="/calculator/mortgage-insurance-premium-calculator" />
      </div>
    </div>
  </>);
}
