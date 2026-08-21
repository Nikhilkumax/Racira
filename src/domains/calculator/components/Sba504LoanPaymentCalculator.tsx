"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs { projectCost: number; bankLoanPct: number; bankRate: number; sbaDebentureRate: number; sbaDebentureTerm: number; downPaymentPct: number; }
interface Result { bankPayment: number; sbaPayment: number; totalMonthly: number; bankAmount: number; sbaAmount: number; downPayment: number; totalInterest: number; breakdown: { label: string; value: string; highlight?: boolean }[]; summaryStats: { label: string; value: string }[]; chartData: { name: string; payment: number }[]; }
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const downPayment = inp.projectCost * (inp.downPaymentPct / 100);
  const financed = inp.projectCost - downPayment;
  const bankAmount = financed * (inp.bankLoanPct / 100);
  const sbaAmount = financed - bankAmount;
  const rBank = inp.bankRate / 100 / 12; const nBank = 25 * 12;
  const rSba = inp.sbaDebentureRate / 100 / 12; const nSba = inp.sbaDebentureTerm * 12;
  const bankPayment = rBank > 0 ? (bankAmount * rBank * Math.pow(1 + rBank, nBank)) / (Math.pow(1 + rBank, nBank) - 1) : bankAmount / nBank;
  const sbaPayment = rSba > 0 ? (sbaAmount * rSba * Math.pow(1 + rSba, nSba)) / (Math.pow(1 + rSba, nSba) - 1) : sbaAmount / nSba;
  const totalMonthly = bankPayment + sbaPayment;
  const totalInterest = bankPayment * nBank + sbaPayment * nSba - financed;
  const breakdown = [{ label: "Project Cost", value: fmt(inp.projectCost) }, { label: "Down Payment (" + inp.downPaymentPct + "%)", value: fmt(downPayment) }, { label: "Bank Loan (" + inp.bankLoanPct + "%)", value: fmt(bankAmount) }, { label: "SBA 504 Debenture", value: fmt(sbaAmount) }, { label: "Bank Rate", value: inp.bankRate + "%/yr" }, { label: "SBA Debenture Rate", value: inp.sbaDebentureRate + "%/yr" }, { label: "Bank Monthly Payment", value: "$" + fmtD(bankPayment), highlight: true }, { label: "SBA Monthly Payment", value: "$" + fmtD(sbaPayment), highlight: true }, { label: "Total Monthly Payment", value: "$" + fmtD(totalMonthly), highlight: true }, { label: "Total Interest", value: fmt(totalInterest) }];
  const summaryStats = [{ label: "Total Monthly", value: "$" + fmtD(totalMonthly) + "/mo" }, { label: "Bank Payment", value: "$" + fmtD(bankPayment) + "/mo" }, { label: "SBA Payment", value: "$" + fmtD(sbaPayment) + "/mo" }, { label: "Down Payment", value: fmt(downPayment) }, { label: "Total Interest", value: fmt(totalInterest) }, { label: "Bank Amount", value: fmt(bankAmount) }, { label: "SBA Amount", value: fmt(sbaAmount) }, { label: "Debenture Term", value: inp.sbaDebentureTerm + " years" }];
  const chartData = [{ name: "Bank Loan", payment: Math.round(bankPayment) }, { name: "SBA 504", payment: Math.round(sbaPayment) }];
  return { bankPayment, sbaPayment, totalMonthly, bankAmount, sbaAmount, downPayment, totalInterest, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { projectCost: 1200000, bankLoanPct: 50, bankRate: 7.0, sbaDebentureRate: 6.2, sbaDebentureTerm: 25, downPaymentPct: 10 };

export default function Sba504LoanPaymentCalculator() {
  const [projectCost, setProjectCost] = useState(String(DEFAULTS.projectCost));
  const [bankLoanPct, setBankLoanPct] = useState(String(DEFAULTS.bankLoanPct));
  const [bankRate, setBankRate] = useState(String(DEFAULTS.bankRate));
  const [sbaDebentureRate, setSbaDebentureRate] = useState(String(DEFAULTS.sbaDebentureRate));
  const [sbaDebentureTerm, setSbaDebentureTerm] = useState(String(DEFAULTS.sbaDebentureTerm));
  const [downPaymentPct, setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const g = (): Inputs => ({ projectCost: parseFloat(projectCost) || 0, bankLoanPct: parseFloat(bankLoanPct) || 0, bankRate: parseFloat(bankRate) || 0, sbaDebentureRate: parseFloat(sbaDebentureRate) || 0, sbaDebentureTerm: parseInt(sbaDebentureTerm) || 25, downPaymentPct: parseFloat(downPaymentPct) || 0 });
  const calc_ = () => setResult(calc(g()));
  const reset = () => { setProjectCost(String(DEFAULTS.projectCost)); setBankLoanPct(String(DEFAULTS.bankLoanPct)); setBankRate(String(DEFAULTS.bankRate)); setSbaDebentureRate(String(DEFAULTS.sbaDebentureRate)); setSbaDebentureTerm(String(DEFAULTS.sbaDebentureTerm)); setDownPaymentPct(String(DEFAULTS.downPaymentPct)); setResult(calc(DEFAULTS)); };
  useEffect(() => { setResult(calc(DEFAULTS)); }, []);
  const hasErrors = (parseFloat(projectCost) || 0) <= 0;
  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "SBA 504 Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SBA 504 Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Project Cost ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={projectCost} onChange={e => setProjectCost(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Bank Loan (%)</label><div className={i}><input type="number" value={bankLoanPct} onChange={e => setBankLoanPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Bank Rate (%)</label><div className={i}><input type="number" value={bankRate} onChange={e => setBankRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">SBA Debenture Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">SBA Rate (%)</label><div className={i}><input type="number" value={sbaDebentureRate} onChange={e => setSbaDebentureRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                  <div><label className="text-sm font-medium mb-1 block">SBA Term</label><div className={i}><input type="number" value={sbaDebentureTerm} onChange={e => setSbaDebentureTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.totalMonthly)}</div>
              <div className="text-sm text-muted-foreground mt-1">Bank: ${fmtD(result.bankPayment)} + SBA: ${fmtD(result.sbaPayment)} · Down: ${fmt(result.downPayment)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Total", "$" + result.totalMonthly.toFixed(2)], ["Bank", "$" + result.bankPayment.toFixed(2)], ["SBA 504", "$" + result.sbaPayment.toFixed(2)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Payment Split</h3>
              <ResponsiveContainer width="100%" height={180}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => "$" + v} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString() + "/mo", ""]} /><Bar dataKey="payment" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">SBA 504 Loan Structure</h2>
          <p>The SBA 504 program provides long-term, fixed-rate financing for major assets. The structure is: 50% from a bank, 40% from a Certified Development Company (CDC) via SBA debentures, and 10% from the borrower. This gives small businesses access to below-market fixed rates for real estate and equipment.</p>
        </section>
        <PopularCalculators exclude="/calculator/sba-504-loan-payment-calculator" />
      </div>
    </div>
  </>);
}
