"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  homePrice: number;
  downPaymentPct: number;
  interestRate: number;
  termYears: number;
  guaranteeFeePct: number;
  annualMipPct: number;
}

interface Result {
  loanAmount: number;
  downPayment: number;
  monthlyPayment: number;
  monthlyMip: number;
  totalMonthly: number;
  upfrontGuaranteeFee: number;
  totalInterest: number;
  totalMipCost: number;
  totalCost: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const downPayment = inp.homePrice * (inp.downPaymentPct / 100);
  const loanAmount = inp.homePrice - downPayment;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
  const monthlyMip = loanAmount * (inp.annualMipPct / 100) / 12;
  const totalMonthly = monthlyPayment + monthlyMip;
  const upfrontGuaranteeFee = loanAmount * (inp.guaranteeFeePct / 100);
  const totalInterest = monthlyPayment * n - loanAmount;
  const totalMipCost = monthlyMip * n;
  const totalCost = monthlyPayment * n + totalMipCost + upfrontGuaranteeFee + downPayment;

  const breakdown = [
    { label: "Home Price", value: fmt(inp.homePrice) },
    { label: "Down Payment (" + inp.downPaymentPct + "%)", value: fmt(downPayment) },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Term", value: inp.termYears + " years" },
    { label: "Monthly P&I", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Monthly MIP (" + inp.annualMipPct + "%)", value: "$" + fmtD(monthlyMip) },
    { label: "Total Monthly", value: "$" + fmtD(totalMonthly), highlight: true },
    { label: "Upfront Guarantee Fee (" + inp.guaranteeFeePct + "%)", value: fmt(upfrontGuaranteeFee) },
    { label: "Total MIP Cost", value: fmt(totalMipCost) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost), highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Monthly MIP", value: "$" + fmtD(monthlyMip) + "/mo" },
    { label: "Total Monthly", value: "$" + fmtD(totalMonthly) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total MIP Cost", value: fmt(totalMipCost) },
    { label: "Upfront Fee", value: fmt(upfrontGuaranteeFee) },
    { label: "Total Cost", value: fmt(totalCost) },
    { label: "Down Payment", value: fmt(downPayment) },
  ];

  const chartData = [
    { name: "P&I Payment", value: Math.round(monthlyPayment) },
    { name: "MIP", value: Math.round(monthlyMip) },
    { name: "Down Payment (÷12)", value: Math.round(downPayment / 12) },
  ];

  return { loanAmount, downPayment, monthlyPayment, monthlyMip, totalMonthly, upfrontGuaranteeFee, totalInterest, totalMipCost, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { homePrice: 250000, downPaymentPct: 0, interestRate: 6.5, termYears: 30, guaranteeFeePct: 1, annualMipPct: 0.35 };

export default function UsdaLoanPaymentCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPaymentPct, setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [guaranteeFeePct, setGuaranteeFeePct] = useState(String(DEFAULTS.guaranteeFeePct));
  const [annualMipPct, setAnnualMipPct] = useState(String(DEFAULTS.annualMipPct));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPaymentPct: parseFloat(downPaymentPct) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 30,
    guaranteeFeePct: parseFloat(guaranteeFeePct) || 0,
    annualMipPct: parseFloat(annualMipPct) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPaymentPct(String(DEFAULTS.downPaymentPct));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setGuaranteeFeePct(String(DEFAULTS.guaranteeFeePct));
    setAnnualMipPct(String(DEFAULTS.annualMipPct));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(homePrice) <= 0 || v(interestRate) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "USDA Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">USDA Loan Payment Calculator</h1>
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

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">USDA Fees</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Guarantee Fee (%)</label><div className={i}><input type="number" value={guaranteeFeePct} onChange={e => setGuaranteeFeePct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Annual MIP (%)</label><div className={i}><input type="number" value={annualMipPct} onChange={e => setAnnualMipPct(e.target.value)} step="0.05" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                </div>
                <p className="text-xs text-muted-foreground">USDA loans require a 1% upfront guarantee fee and 0.35% annual MIP for the life of the loan.</p>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.totalMonthly)}</div>
              <div className="text-sm text-muted-foreground mt-1">P&I: ${fmtD(result.monthlyPayment)} + MIP: ${fmtD(result.monthlyMip)} · No down payment required</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["P&I", "$" + result.monthlyPayment.toFixed(2)], ["MIP", "$" + result.monthlyMip.toFixed(2)], ["Total", "$" + result.totalMonthly.toFixed(2)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Monthly Payment Split</h3>
              <ResponsiveContainer width="100%" height={180}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => "$" + v} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString() + "/mo", ""]} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
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
          <h2 className="text-2xl font-bold mb-3">USDA Rural Housing Loans</h2>
          <p>USDA loans offer 0% down payment for eligible rural and suburban homebuyers. They require a 1% upfront guarantee fee (financed into the loan) and a 0.35% annual mortgage insurance premium for the life of the loan. Income limits apply — borrowers must earn less than 115% of the area median income.</p>
        </section>
        <PopularCalculators exclude="/calculator/usda-loan-payment-calculator" />
      </div>
    </div>
  </>);
}
