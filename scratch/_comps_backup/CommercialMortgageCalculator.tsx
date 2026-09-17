"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  amortYears: number;
  termYears: number;
  annualTaxes: number;
  annualInsurance: number;
}

interface Result {
  monthlyPi: number;
  balloonBalance: number;
  interestToMaturity: number;
  paymentsToMaturity: number;
  totalInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyOutlay: number;
  chartData: { label: string; principal: number; interest: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.amortYears * 12;
  const monthlyPi = (inp.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // Amortization to maturity (balloon) and full-term totals
  let bal = inp.loanAmount;
  let intToMaturity = 0;
  const maturityMonths = inp.termYears * 12;
  const chartMap = new Map<number, { principal: number; interest: number }>();
  for (let m = 1; m <= n; m++) {
    const int = bal * r;
    const prin = monthlyPi - int;
    bal = Math.max(0, bal - prin);
    if (m <= maturityMonths) intToMaturity += int;
    const yr = Math.floor((m - 1) / 12);
    const cur = chartMap.get(yr) || { principal: 0, interest: 0 };
    if (m <= maturityMonths) {
      cur.principal += prin;
      cur.interest += int;
    }
    chartMap.set(yr, cur);
  }
  const balloonBalance = bal;
  const paymentsToMaturity = monthlyPi * maturityMonths;
  const totalInterest = n * monthlyPi - inp.loanAmount;

  const monthlyTaxes = inp.annualTaxes / 12;
  const monthlyInsurance = inp.annualInsurance / 12;
  const monthlyOutlay = monthlyPi + monthlyTaxes + monthlyInsurance;

  const chartData = [...chartMap.entries()].map(([yr, v]) => ({
    label: "Yr " + (yr + 1),
    principal: Math.round(v.principal),
    interest: Math.round(v.interest),
  }));

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%" },
    { label: "Amortization Period", value: inp.amortYears + " years" },
    { label: "Maturity (Loan Term)", value: inp.termYears + " years" },
    { label: "Monthly Payment (P&I)", value: fmtD(monthlyPi), highlight: true },
    { label: "Balloon Balance at Maturity", value: fmt(balloonBalance), highlight: true },
    { label: "Interest Paid to Maturity", value: fmt(intToMaturity) },
    { label: "Total Payments to Maturity", value: fmt(paymentsToMaturity) },
    { label: "Property Taxes", value: fmtD(monthlyTaxes) + "/mo" },
    { label: "Property Insurance", value: fmtD(monthlyInsurance) + "/mo" },
    { label: "Total Monthly Outlay", value: fmtD(monthlyOutlay), isTotal: true, highlight: true },
    { label: "Full-Term Interest (if held)", value: fmt(totalInterest) },
  ];

  const summaryStats = [
    { label: "Monthly Payment (P&I)", value: fmtD(monthlyPi) },
    { label: "Property Taxes", value: fmtD(monthlyTaxes) + "/mo" },
    { label: "Property Insurance", value: fmtD(monthlyInsurance) + "/mo" },
    { label: "Total Monthly Outlay", value: fmtD(monthlyOutlay) },
    { label: "Balloon Balance", value: fmt(balloonBalance) },
    { label: "Interest to Maturity", value: fmt(intToMaturity) },
    { label: "Payments to Maturity", value: fmt(paymentsToMaturity) },
    { label: "Full-Term Interest", value: fmt(totalInterest) },
  ];

  return { monthlyPi, balloonBalance, interestToMaturity: intToMaturity, paymentsToMaturity, totalInterest, monthlyTaxes, monthlyInsurance, monthlyOutlay, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 1000000, interestRate: 7.0, amortYears: 25, termYears: 10, annualTaxes: 12000, annualInsurance: 4000 };

export default function CommercialMortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [amortYears, setAmortYears] = useState(String(DEFAULTS.amortYears));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [annualTaxes, setAnnualTaxes] = useState(String(DEFAULTS.annualTaxes));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    amortYears: parseInt(amortYears) || 0,
    termYears: parseInt(termYears) || 0,
    annualTaxes: parseFloat(annualTaxes) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setAmortYears(String(DEFAULTS.amortYears));
    setTermYears(String(DEFAULTS.termYears));
    setAnnualTaxes(String(DEFAULTS.annualTaxes));
    setAnnualInsurance(String(DEFAULTS.annualInsurance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const amort = parseInt(amortYears) || 0;
  const term = parseInt(termYears) || 0;
  const taxes = parseFloat(annualTaxes) || 0;
  const insurance = parseFloat(annualInsurance) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (!interestRate || rate <= 0) valErrors.interestRate = "Interest rate must be greater than 0%";
  else if (rate > 25) valErrors.interestRate = "Interest rate must be 25% or less";
  if (!amortYears || amort <= 0) valErrors.amortYears = "Amortization must be greater than 0 years";
  else if (amort > 40) valErrors.amortYears = "Amortization must be 40 years or less";
  if (!termYears || term <= 0) valErrors.termYears = "Maturity must be greater than 0 years";
  else if (term > amort) valErrors.termYears = "Maturity cannot exceed the amortization period";
  if (taxes < 0) valErrors.annualTaxes = "Taxes must be $0 or more";
  if (insurance < 0) valErrors.annualInsurance = "Insurance must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Commercial Mortgage Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Commercial Mortgage Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Amortization (Years)</label><div className={i}><input type="number" value={amortYears} onChange={e => setAmortYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.amortYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.amortYears}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Maturity (Loan Term, Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Property Expenses</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Annual Property Taxes ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualTaxes} onChange={e => setAnnualTaxes(e.target.value)} className={c} /></div>{valErrors.annualTaxes && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualTaxes}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Annual Insurance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualInsurance} onChange={e => setAnnualInsurance(e.target.value)} className={c} /></div>{valErrors.annualInsurance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualInsurance}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment (P&I)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPi.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Amortized over {amort} years · {result.balloonBalance.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} balloon due at maturity in year {term}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Balloon Balance", result.balloonBalance.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Interest to Maturity", "$" + Math.round(result.interestToMaturity).toLocaleString("en-US"), "text-amber-600"],
                ["Total Monthly Outlay", result.monthlyOutlay.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-red-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Principal vs Interest by Year (to Maturity)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(result.chartData.length / 12) - 1)} />
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
          <h2 className="text-2xl font-bold mb-3">Commercial Loans Amortize Differently</h2>
          <p>Unlike a 30-year home mortgage, commercial real estate loans pair a long amortization schedule — often 20 to 30 years — with a much shorter maturity, usually 5 to 15 years. Your monthly payment is set by the amortization period, but the entire remaining balance comes due as a balloon at maturity unless you refinance. That means the payment number alone understates the real obligation: you also need to plan for refinancing risk when rates have moved, and for the property taxes and insurance that lenders often require you to carry. This calculator shows both the amortization path and the balloon that awaits at your loan's maturity date.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a balloon payment on a commercial loan?", answer: "Commercial loans amortize over a longer period than their maturity. When the maturity date arrives, whatever principal remains is due in one lump — the balloon. Borrowers typically refinance or sell the property before then." },
          { question: "How is the monthly payment calculated?", answer: "The payment is a standard amortizing payment based on the loan amount, rate, and the full amortization period — not the shorter maturity. A $1,000,000 loan at 7% amortized over 25 years pays about $7,067 per month regardless of whether it matures in 5 or 15 years." },
          { question: "What else affects my total monthly cost?", answer: "Lenders usually require property taxes and insurance to be paid, either through an escrow account or directly by you. Adding those to your P&I payment gives the true monthly outlay, which is the number that should be tested against your property's income." },
        ]} pageUrl="https://racira.com/calculator/commercial-mortgage-calculator" />
        <PopularCalculators exclude="/calculator/commercial-mortgage-calculator" />
      </div>
    </div>
  </>);
}
