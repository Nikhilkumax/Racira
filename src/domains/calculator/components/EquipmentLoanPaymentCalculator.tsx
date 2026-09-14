"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  equipmentCost: number;
  interestRate: number;
  termYears: number;
  downPct: number;
  tradeIn: number;
  residualPct: number;
}

interface Result {
  amountFinanced: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  residualValue: number;
  chartData: { label: string; principal: number; interest: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const down = (inp.equipmentCost * inp.downPct) / 100;
  const amountFinanced = Math.max(0, inp.equipmentCost - down - inp.tradeIn);
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const residualValue = (inp.equipmentCost * inp.residualPct) / 100;

  // Payment with an optional residual (balloon): standard annuity formula
  let monthlyPayment: number;
  if (r <= 0) {
    monthlyPayment = (amountFinanced - residualValue) / n;
  } else {
    monthlyPayment = ((amountFinanced - residualValue / Math.pow(1 + r, n)) * r) / (1 - Math.pow(1 + r, -n));
  }
  const totalPayments = monthlyPayment * n;

  // Interest paid over the loan; the residual is paid (or refinanced) separately at the end
  const totalInterest = Math.max(0, monthlyPayment * n - (amountFinanced - residualValue));
  const totalCost = down + inp.tradeIn + totalPayments + residualValue; // all cash outlays

  const chartMap = new Map<number, { principal: number; interest: number }>();
  let bal = amountFinanced;
  for (let m = 1; m <= n; m++) {
    const int = bal * r;
    const prin = monthlyPayment - int;
    bal = Math.max(0, bal - prin);
    const yr = Math.floor((m - 1) / 12);
    const cur = chartMap.get(yr) || { principal: 0, interest: 0 };
    cur.principal += prin;
    cur.interest += int;
    chartMap.set(yr, cur);
  }
  const chartData = [...chartMap.entries()].map(([yr, v]) => ({
    label: "Yr " + (yr + 1),
    principal: Math.round(v.principal),
    interest: Math.round(v.interest),
  }));

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Equipment Cost", value: fmt(inp.equipmentCost) },
    { label: "Down Payment (" + inp.downPct + "%)", value: fmt(down) },
    { label: "Trade-In / Rebate", value: fmt(inp.tradeIn) },
    { label: "Amount Financed", value: fmt(amountFinanced), highlight: true },
    { label: "Interest Rate", value: inp.interestRate + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Residual Value (" + inp.residualPct + "%)", value: fmt(residualValue) },
    { label: "Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Total of Payments", value: fmt(totalPayments) },
    { label: "Total Interest", value: fmt(totalInterest), isTotal: true },
  ];

  const summaryStats = [
    { label: "Amount Financed", value: fmt(amountFinanced) },
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Down Payment", value: fmt(down) },
    { label: "Trade-In / Rebate", value: fmt(inp.tradeIn) },
    { label: "Residual Value", value: fmt(residualValue) },
    { label: "Total of Payments", value: fmt(totalPayments) },
    { label: "Total Interest", value: fmt(totalInterest) },
  ];

  return { amountFinanced, monthlyPayment, totalPayments, totalInterest, totalCost, residualValue, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { equipmentCost: 50000, interestRate: 8, termYears: 5, downPct: 10, tradeIn: 0, residualPct: 0 };

export default function EquipmentLoanPaymentCalculator() {
  const [equipmentCost, setEquipmentCost] = useState(String(DEFAULTS.equipmentCost));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [tradeIn, setTradeIn] = useState(String(DEFAULTS.tradeIn));
  const [residualPct, setResidualPct] = useState(String(DEFAULTS.residualPct));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    equipmentCost: parseFloat(equipmentCost) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 0,
    downPct: parseFloat(downPct) || 0,
    tradeIn: parseFloat(tradeIn) || 0,
    residualPct: parseFloat(residualPct) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setEquipmentCost(String(DEFAULTS.equipmentCost));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setDownPct(String(DEFAULTS.downPct));
    setTradeIn(String(DEFAULTS.tradeIn));
    setResidualPct(String(DEFAULTS.residualPct));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const cost = parseFloat(equipmentCost) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const down = parseFloat(downPct) || 0;
  const trade = parseFloat(tradeIn) || 0;
  const residual = parseFloat(residualPct) || 0;

  const valErrors: Record<string, string> = {};
  if (!equipmentCost || cost <= 0) valErrors.equipmentCost = "Equipment cost must be greater than $0";
  if (rate < 0 || rate > 25) valErrors.interestRate = "Interest rate must be 0–25%";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 10) valErrors.termYears = "Equipment terms rarely exceed 10 years";
  if (down < 0 || down >= 100) valErrors.downPct = "Down payment must be 0–99%";
  if (trade < 0) valErrors.tradeIn = "Trade-in must be $0 or more";
  else if (trade >= cost) valErrors.tradeIn = "Trade-in must be less than the equipment cost";
  if (residual < 0 || residual > 60) valErrors.residualPct = "Residual must be 0–60%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Equipment Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Equipment Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Equipment Cost ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={equipmentCost} onChange={e => setEquipmentCost(e.target.value)} className={c} /></div>{valErrors.equipmentCost && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.equipmentCost}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Financing Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPct} onChange={e => setDownPct(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Trade-In / Rebate ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={tradeIn} onChange={e => setTradeIn(e.target.value)} className={c} /></div>{valErrors.tradeIn && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.tradeIn}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Residual Value (%)</label><div className={i}><input type="number" value={residualPct} onChange={e => setResidualPct(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.residualPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.residualPct}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Financing {result.amountFinanced.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} over {term} years at {rate}%{residual > 0 ? " with a " + result.residualValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + " residual" : ""}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Amount Financed", "$" + Math.round(result.amountFinanced).toLocaleString("en-US"), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Total of Payments", "$" + Math.round(result.totalPayments).toLocaleString("en-US"), "text-emerald-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Principal vs Interest by Year</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "principal" ? "Principal" : "Interest", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "principal" ? "Principal" : "Interest")} />
                  <Bar dataKey="principal" stackId="a" fill="#2563eb" />
                  <Bar dataKey="interest" stackId="a" fill="#f59e0b" />
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
          <h2 className="text-2xl font-bold mb-3">How Equipment Financing Is Priced</h2>
          <p>Equipment loans for business — from excavators to MRI machines to bakery ovens — are usually secured by the equipment itself, which keeps rates below unsecured business credit. Lenders quote a rate and term, then compute a fixed payment on the amount financed after your down payment and any trade-in. Some structures add a residual: a balloon equal to a percentage of the original cost that you pay (or refinance) at the end, which lowers the monthly payment because you are only financing the depreciation. That is the same logic as a car lease, and it means two loans with identical rates and terms can have very different payments depending on the residual — always compare the total interest, not just the monthly number.</p>
        </section>
        <FAQSection faqs={[
          { question: "What credit is needed for equipment financing?", answer: "Because the equipment secures the loan, lenders accept lower scores than for unsecured business credit — FICO scores around 600 and above can qualify, though rates rise as scores fall. Newer businesses may need a personal guarantee or a larger down payment." },
          { question: "What is a residual or balloon on equipment?", answer: "A residual is a fixed percentage of the original cost due at the end of the term — often 10–30% for vehicles and heavy equipment. Financing only the depreciated portion lowers monthly payments; at maturity you pay the residual, refinance it, or trade the equipment in." },
          { question: "What terms and rates are typical?", answer: "Terms usually run 2–7 years, matching the equipment's useful life, with rates from roughly 6% for strong borrowers to the high teens for startups or lower credit. Section 179 depreciation can also reduce the after-tax cost of the purchase." },
        ]} pageUrl="https://racira.com/calculator/equipment-loan-payment-calculator" />
        <PopularCalculators exclude="/calculator/equipment-loan-payment-calculator" />
      </div>
    </div>
  </>);
}
