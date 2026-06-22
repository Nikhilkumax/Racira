"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HomeEquityResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  loanAmount: number;
  availableEquity: number;
  ltv: number;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHomeEquity(homeValue: number, mortgageBalance: number, loanAmount: number, rate: number, termYears: number): HomeEquityResult {
  const availableEquity = Math.max(0, homeValue * 0.85 - mortgageBalance);
  const actualLoan = Math.min(loanAmount, availableEquity);
  const ltv = homeValue > 0 ? ((mortgageBalance + actualLoan) / homeValue) * 100 : 0;
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const payment = r > 0 ? (actualLoan * r) / (1 - Math.pow(1 + r, -n)) : actualLoan / n;
  const totalPaid = payment * n;
  const totalInterest = totalPaid - actualLoan;

  let bal = actualLoan;
  const chartData = [{ month: 0, balance: Math.round(bal) }];
  for (let m = 1; m <= n; m++) {
    const int = bal * r;
    bal -= (payment - int);
    if (m % Math.ceil(n / 20) === 0 || m === n)
      chartData.push({ month: m, balance: Math.max(0, Math.round(bal)) });
  }

  const breakdown = [
    { label: "Home Value", value: `$${homeValue.toLocaleString()}` },
    { label: "Mortgage Balance", value: `$${mortgageBalance.toLocaleString()}` },
    { label: "Available Equity (85% LTV)", value: `$${availableEquity.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Loan Amount", value: `$${actualLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Combined LTV", value: `${ltv.toFixed(1)}%` },
    { label: "Interest Rate (Fixed)", value: `${rate}%` },
    { label: "Loan Term", value: `${termYears} years` },
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Loan Amount", value: `$${actualLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Combined LTV", value: `${ltv.toFixed(1)}%` },
    { label: "Available Equity", value: `$${availableEquity.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment: payment, totalPaid, totalInterest, loanAmount: actualLoan, availableEquity, ltv, chartData, breakdown, summaryStats };
}

const DEFAULTS = { homeValue: "450000", mortgage: "200000", loan: "80000", rate: "8.0", term: "15" };

export default function HomeEquityLoanCalculator() {
  const [homeValue, setHomeValue] = useState(DEFAULTS.homeValue);
  const [mortgage, setMortgage] = useState(DEFAULTS.mortgage);
  const [loan, setLoan] = useState(DEFAULTS.loan);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [result, setResult] = useState<HomeEquityResult | null>(null);

  const calculate = () => setResult(calcHomeEquity(parseFloat(homeValue) || 450000, parseFloat(mortgage) || 200000, parseFloat(loan) || 80000, parseFloat(rate) || 8.0, parseInt(term) || 15));
  const reset = () => { setHomeValue(DEFAULTS.homeValue); setMortgage(DEFAULTS.mortgage); setLoan(DEFAULTS.loan); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setResult(calcHomeEquity(450000, 200000, 80000, 8.0, 15)); };
  useEffect(() => { setResult(calcHomeEquity(450000, 200000, 80000, 8.0, 15)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a home equity loan?", answer: "A home equity loan lets you borrow a lump sum against your home's equity — the difference between its market value and your outstanding mortgage balance. Unlike a HELOC, it has a fixed rate and fixed monthly payments for the entire term, making it predictable and easy to budget." },
    { question: "How much can I borrow with a home equity loan?", answer: "Most lenders allow combined loan-to-value (CLTV) up to 80–85%. Formula: Max Loan = (Home Value × 85%) − Mortgage Balance. Example: $450,000 home, $200,000 mortgage → Max = $182,500. Your actual approval depends on credit score, income, and debt-to-income ratio." },
    { question: "What are current home equity loan rates?", answer: "Home equity loan rates in 2024 range from 7.5–9.5% for qualified borrowers. They're fixed for the life of the loan, unlike HELOC rates which are variable. Rates depend on credit score, LTV ratio, loan term, and lender. Credit unions often offer 0.5–1% lower rates than banks." },
    { question: "Home equity loan vs. HELOC — which is better?", answer: "Home equity loan: fixed rate, lump sum, fixed monthly payments, better for one-time large expenses. HELOC: variable rate, revolving credit, flexible draws, better for ongoing or uncertain costs. If rates are expected to rise, lock in with a home equity loan. If you need flexibility, choose a HELOC." },
    { question: "What can I use a home equity loan for?", answer: "Best uses: home renovations (adds value, potentially tax-deductible interest), debt consolidation at lower rate, major medical expenses, education. Avoid: consumer spending, vacations, depreciating assets. The risk is real — defaulting means foreclosure. Only borrow what you need and can repay." },
    { question: "Is home equity loan interest tax-deductible?", answer: "Interest is tax-deductible when the loan is used to 'buy, build, or substantially improve' your home — per the Tax Cuts and Jobs Act. It is NOT deductible for debt consolidation, education, or personal expenses. Consult a tax professional for your specific situation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Equity Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Home Equity Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Home Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homeValue} onChange={e => setHomeValue(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Mortgage Balance</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mortgage} onChange={e => setMortgage(e.target.value)} className={ci} /></div></div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Loan Amount</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Loan Term</label><div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Total interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} · CLTV: {result.ltv.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Loan Amount", `$${result.loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Available Equity", `$${result.availableEquity.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Paid" ? "font-bold border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} /><Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Home Equity Loan?</h2>
            <p>A <strong>home equity loan</strong> allows homeowners to borrow a fixed lump sum against their home&apos;s equity at a fixed interest rate with fixed monthly payments. Unlike a HELOC, there are no surprises — your payment never changes. This <strong>home equity loan calculator</strong> shows your exact monthly payment, total interest cost, combined LTV, and available equity based on your home value and existing mortgage balance.</p>
            <h2>How Home Equity Loan Payments Are Calculated</h2>
            <p>Monthly Payment = Loan Amount × [r(1+r)^n] ÷ [(1+r)^n − 1]. Maximum Loan = (Home Value × 85%) − Mortgage Balance. Combined LTV = (Mortgage Balance + Loan Amount) ÷ Home Value × 100. Most lenders cap CLTV at 80–85%.</p>
            <h2>Understanding Your Results</h2>
            <p>Your monthly payment is fixed for the full term — unlike a HELOC which changes with the prime rate. The combined LTV tells lenders your total leverage against the property. Total interest shows the true cost of the loan over its life. Higher equity (lower LTV) typically earns lower rates.</p>
            <h2>Key Factors and Benchmarks</h2>
            <p>Credit score 720+ qualifies for best rates. CLTV below 80% gets premium pricing. Debt-to-income ratio below 43% is typically required. Terms range 5–30 years; shorter terms mean higher payments but dramatically less interest. Rates in 2024 range 7.5–9.5% fixed.</p>
            <h2>Best Uses for Home Equity Loans</h2>
            <p>Home renovation projects that increase property value. Debt consolidation replacing 20%+ credit card debt with 8% home equity interest. Major medical or education expenses. The interest may be tax-deductible for qualifying home improvements. Never use home equity for consumer spending — your home is at risk.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-equity-loan-calculator" />
          <PopularCalculators exclude="/calculator/home-equity-loan-calculator" />
        </div>
      </div>
    </>
  );
}
