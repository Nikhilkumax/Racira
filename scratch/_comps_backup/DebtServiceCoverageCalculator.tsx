"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const BAR_COLORS = ["hsl(var(--primary))", "#ef4444"];

const NumInput = ({ id, label, value, onChange, prefix, suffix, min }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; min?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs {
  grossIncome: string;
  opex: string;
  principal: string;
  interest: string;
}

interface Result {
  noi: number;
  debtService: number;
  dscr: number;
  rating: string;
  ratingTone: "good" | "warn" | "bad";
  cashBuffer: number;
}

const DEFAULTS: Inputs = { grossIncome: "180000", opex: "45000", principal: "50000", interest: "40000" };

function calculate(inputs: Inputs): Result {
  const gi = Math.max(0, parseFloat(inputs.grossIncome) || 0);
  const op = Math.max(0, parseFloat(inputs.opex) || 0);
  const pr = Math.max(0, parseFloat(inputs.principal) || 0);
  const intr = Math.max(0, parseFloat(inputs.interest) || 0);
  const noi = gi - op;
  const debtService = pr + intr;
  const dscr = debtService > 0 ? noi / debtService : 0;
  let rating = "Strong (Excellent)";
  let ratingTone: Result["ratingTone"] = "good";
  if (dscr < 1.0) { rating = "Negative Cash Flow (Unacceptable)"; ratingTone = "bad"; }
  else if (dscr < 1.2) { rating = "Marginal / Risky"; ratingTone = "warn"; }
  else if (dscr < 1.4) { rating = "Good (Standard)"; ratingTone = "warn"; }
  return { noi, debtService, dscr, rating, ratingTone, cashBuffer: debtService > 0 ? noi - debtService : 0 };
}

const DebtServiceCoverageCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.grossIncome) <= 0 || num(inputs.opex) < 0 || num(inputs.principal) < 0 || num(inputs.interest) < 0 || (num(inputs.principal) + num(inputs.interest)) <= 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const toneColor = (t: Result["ratingTone"]) => t === "good" ? "text-emerald-600" : t === "warn" ? "text-amber-600" : "text-red-600";

  const rows = [
    { label: "Gross Operating Income", value: result.noi + Math.max(0, num(inputs.opex)), display: fmtMoney(result.noi + Math.max(0, num(inputs.opex))) },
    { label: "Operating Expenses", value: Math.max(0, num(inputs.opex)), display: fmtMoney(Math.max(0, num(inputs.opex))) },
    { label: "Net Operating Income (NOI)", value: result.noi, display: fmtMoney(result.noi), highlight: true },
    { label: "Annual Principal Payments", value: Math.max(0, num(inputs.principal)), display: fmtMoney(Math.max(0, num(inputs.principal))) },
    { label: "Annual Interest Payments", value: Math.max(0, num(inputs.interest)), display: fmtMoney(Math.max(0, num(inputs.interest))) },
    { label: "Total Debt Service", value: result.debtService, display: fmtMoney(result.debtService), total: true },
    { label: "Debt Service Coverage Ratio", value: result.dscr, display: result.dscr.toFixed(2) + "x", highlight: true },
  ];

  const faqs = [
    { question: "What is the Debt Service Coverage Ratio (DSCR)?", answer: "DSCR measures how much cash flow a business or property generates relative to its debt obligations. It is calculated as Net Operating Income divided by Total Debt Service (principal + interest). Lenders use it to decide whether an asset can comfortably repay a loan." },
    { question: "What is a good DSCR?", answer: "A DSCR of 1.0 means cash flow exactly covers debt payments with zero buffer. Lenders typically require 1.20–1.25 or higher so there is a safety margin for vacancies or unexpected expenses. A ratio below 1.0 means the operation is cash-flow negative." },
    { question: "How can I improve my DSCR?", answer: "Increase Net Operating Income (raise revenue, cut operating expenses) or reduce debt service (larger down payment, lower interest rate, longer amortization). Refinancing at a lower rate is one of the fastest ways to move the ratio." },
    { question: "What is Net Operating Income (NOI)?", answer: "NOI is gross operating revenue minus operating expenses, calculated before interest and taxes. For real estate it excludes debt service and capital expenditures; it represents the cash an asset produces from its core operation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Debt Service Coverage Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Service Coverage Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="gross-income" label="Gross Operating Income" value={inputs.grossIncome} onChange={set("grossIncome")} prefix="$" />
              <NumInput id="opex" label="Operating Expenses" value={inputs.opex} onChange={set("opex")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="principal" label="Annual Principal" value={inputs.principal} onChange={set("principal")} prefix="$" />
              <NumInput id="interest" label="Annual Interest" value={inputs.interest} onChange={set("interest")} prefix="$" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Enter a positive gross income and total debt service (principal + interest &gt; 0).</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Debt Service Coverage Ratio</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.dscr.toFixed(2)}x</div>
              <div className={`text-sm font-semibold ${toneColor(result.ratingTone)}`}>{result.rating}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Operating Income</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.noi)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Debt Service</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.debtService)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cash Buffer</span>
                <span className={`font-extrabold ${result.cashBuffer >= 0 ? "text-foreground" : "text-red-600"}`}>{fmtMoney(result.cashBuffer)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Financial Metric</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.display}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Net Operating Income vs Total Debt Service</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: "Net Operating Income", value: result.noi }, { name: "Total Debt Service", value: result.debtService }]} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => "$" + fmt(Math.round(v / 1000)) + "k"} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip formatter={(v: number) => [fmtMoney(v), ""]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>{[{ name: "a", value: 1 }, { name: "b", value: 2 }].map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: BAR_COLORS[0] }} />Net Operating Income</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: BAR_COLORS[1] }} />Total Debt Service</span>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Gross Operating Income", value: fmtMoney(result.noi + Math.max(0, num(inputs.opex))) },
                  { label: "Operating Expenses", value: fmtMoney(Math.max(0, num(inputs.opex))) },
                  { label: "Net Operating Income", value: fmtMoney(result.noi) },
                  { label: "Total Debt Service", value: fmtMoney(result.debtService) },
                  { label: "Cash Buffer", value: fmtMoney(result.cashBuffer) },
                  { label: "DSCR", value: result.dscr.toFixed(2) + "x", bold: true },
                  { label: "Coverage Status", value: result.rating },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding DSCR</h2>
            <p>The Debt Service Coverage Ratio is the gold standard for measuring leverage risk in commercial lending. It tells you whether a business or income property generates enough cash to cover its debt payments. While residential mortgages rely on personal income, commercial loans are approved based on the asset's own ability to cover its debts — and DSCR is how lenders measure that.</p>
            <p>With the defaults on this page, the company earns $180,000 in gross operating income, spends $45,000 on operating expenses, and carries $90,000 in total annual debt service. That produces a Net Operating Income of $135,000 and a DSCR of 135,000 ÷ 90,000 = <strong>1.50x</strong> — comfortably above the 1.25x threshold most lenders require.</p>
            <h2 className="text-2xl font-bold mb-3">DSCR Benchmarks</h2>
            <p><strong>Below 1.0x:</strong> cash-flow negative; the operation cannot cover its debt payments. <strong>1.0–1.2x:</strong> marginal — most lenders will decline or require additional equity. <strong>1.2–1.4x:</strong> generally acceptable; some lenders require 1.25x minimum. <strong>Above 1.4x:</strong> strong coverage with a healthy buffer against vacancies and expense shocks.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-service-coverage-ratio-calculator" />
          <PopularCalculators exclude="/calculator/debt-service-coverage-ratio-calculator" />
        </div>
      </div>
    </>
  );
};
export default DebtServiceCoverageCalculator;
