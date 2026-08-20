"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  bikePrice: number;
  downPayment: number;
  interestRate: number;
  term: number;
  salesTax: number;
  registrationFees: number;
  monthlyInsurance: number;
}

interface Result {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  totalMonthly: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; principal: number; interest: number }[];
}

function calc(inp: Inputs): Result {
  const taxes = inp.bikePrice * (inp.salesTax / 100);
  const totalVehicleCost = inp.bikePrice + taxes + inp.registrationFees;
  const loanAmount = totalVehicleCost - inp.downPayment;
  const r = inp.interestRate / 100 / 12;
  const n = inp.term * 12;
  const monthlyPayment = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
  const totalInterest = monthlyPayment * n - loanAmount;
  const totalCost = loanAmount + totalInterest + inp.downPayment;
  const totalMonthly = monthlyPayment + inp.monthlyInsurance;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Bike Price", value: fmt(inp.bikePrice) },
    { label: "Sales Tax (" + inp.salesTax + "%)", value: fmt(taxes) },
    { label: "Registration & Fees", value: fmt(inp.registrationFees) },
    { label: "Total Vehicle Cost", value: fmt(totalVehicleCost), highlight: true },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Loan Term", value: inp.term + " years (" + n + " months)" },
    { label: "Monthly P&I Payment", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Monthly Insurance", value: "$" + fmtD(inp.monthlyInsurance) },
    { label: "Total Monthly", value: "$" + fmtD(totalMonthly), highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost (all-in)", value: fmt(totalCost + inp.downPayment), highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Total Monthly (incl. insurance)", value: "$" + fmtD(totalMonthly) + "/mo" },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost + inp.downPayment) },
    { label: "APR Effective", value: inp.interestRate + "%" },
    { label: "Payoff Date", value: inp.term + " years" },
  ];

  // Year-by-year amortization chart
  const chartData: { year: string; principal: number; interest: number }[] = [];
  let bal = loanAmount;
  for (let yr = 1; yr <= inp.term; yr++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      const intPay = bal * r;
      const princPay = monthlyPayment - intPay;
      yearInterest += intPay;
      yearPrincipal += princPay;
      bal = Math.max(0, bal - princPay);
    }
    chartData.push({ year: "Yr " + yr, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest) });
  }

  return { loanAmount, monthlyPayment, totalInterest, totalCost, totalMonthly, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { bikePrice: 12000, downPayment: 2000, interestRate: 6.9, term: 5, salesTax: 7, registrationFees: 350, monthlyInsurance: 150 };

export default function MotorcycleLoanPaymentCalculator() {
  const [bikePrice, setBikePrice] = useState(String(DEFAULTS.bikePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [term, setTerm] = useState(String(DEFAULTS.term));
  const [salesTax, setSalesTax] = useState(String(DEFAULTS.salesTax));
  const [registrationFees, setRegistrationFees] = useState(String(DEFAULTS.registrationFees));
  const [monthlyInsurance, setMonthlyInsurance] = useState(String(DEFAULTS.monthlyInsurance));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    bikePrice: parseFloat(bikePrice) || 0,
    downPayment: parseFloat(downPayment) || 0,
    interestRate: parseFloat(interestRate) || 0,
    term: parseInt(term) || 5,
    salesTax: parseFloat(salesTax) || 0,
    registrationFees: parseFloat(registrationFees) || 0,
    monthlyInsurance: parseFloat(monthlyInsurance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setBikePrice(String(DEFAULTS.bikePrice));
    setDownPayment(String(DEFAULTS.downPayment));
    setInterestRate(String(DEFAULTS.interestRate));
    setTerm(String(DEFAULTS.term));
    setSalesTax(String(DEFAULTS.salesTax));
    setRegistrationFees(String(DEFAULTS.registrationFees));
    setMonthlyInsurance(String(DEFAULTS.monthlyInsurance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "What credit score do I need for a motorcycle loan?", answer: "Most motorcycle lenders require a credit score of 620+ for favorable rates. Scores below 600 may still qualify but at higher interest rates. Some lenders specialize in subprime motorcycle loans for scores as low as 500, but expect APRs above 15%." },
    { question: "How much should I put down on a motorcycle?", answer: "Aim for 10–20% down payment. Larger down payments reduce your monthly payment, total interest, and help avoid being 'underwater' on the loan. Some lenders require minimum 10% down for new motorcycles and 20% for used." },
    { question: "Is motorcycle insurance included in the loan?", answer: "No, motorcycle insurance is separate from the loan payment. Most lenders require comprehensive and collision coverage for the life of the loan. Budget $50–$300+/month depending on the bike, your riding history, and coverage level." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Motorcycle Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Motorcycle Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Motorcycle Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={bikePrice} onChange={e => setBikePrice(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Monthly Insurance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyInsurance} onChange={e => setMonthlyInsurance(e.target.value)} className={c} /></div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Fees & Taxes</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Sales Tax (%)</label><div className={i}><input type="number" value={salesTax} onChange={e => setSalesTax(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                <div><label className="text-sm font-medium mb-1 block">Registration/Fees ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={registrationFees} onChange={e => setRegistrationFees(e.target.value)} className={c} /></div></div>
              </div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Loan: ${result.loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Total Interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Total: ${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + result.monthlyPayment.toFixed(2)], ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString()], ["All-In Cost", "$" + Math.round(result.totalCost).toLocaleString()]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Annual Principal vs Interest</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="principal" fill="hsl(var(--primary))" name="Principal" radius={[4, 4, 0, 0]} /><Bar dataKey="interest" fill="#f59e0b" name="Interest" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Motorcycle Financing Guide</h2><p>Motorcycle loans typically carry higher interest rates than auto loans due to the higher risk of loss and theft. Rates range from 4.99% for excellent credit to 18%+ for subprime. Most terms are 36–72 months. Remember to factor in insurance, maintenance, gear, and registration — the true cost of ownership extends well beyond the monthly loan payment.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/motorcycle-loan-payment-calculator" /><PopularCalculators exclude="/calculator/motorcycle-loan-payment-calculator" /></div>
    </div>
  </>);
}
