"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BizLoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  effectiveRate: number;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBizLoan(loanAmount: number, annualRate: number, termMonths: number, originationPct: number): BizLoanResult {
  const origFee = loanAmount * (originationPct / 100);
  const netProceeds = loanAmount - origFee;
  const r = annualRate / 100 / 12;
  const payment = r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths)) : loanAmount / termMonths;
  const totalPaid = payment * termMonths + origFee;
  const totalInterest = totalPaid - loanAmount;

  // APR (effective) accounting for origination fee
  let lo = 0, hi = 1, effectiveRate = annualRate;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const rMid = mid / 12;
    const pmtMid = rMid > 0 ? (loanAmount * rMid) / (1 - Math.pow(1 + rMid, -termMonths)) : loanAmount / termMonths;
    if (pmtMid * termMonths < totalPaid) lo = mid; else hi = mid;
    effectiveRate = mid * 100;
  }

  let balance = loanAmount;
  const chartData = [{ month: 0, balance: Math.round(balance) }];
  for (let m = 1; m <= termMonths; m++) {
    const int = balance * r;
    balance = balance - (payment - int);
    if (m % Math.ceil(termMonths / 20) === 0 || m === termMonths) {
      chartData.push({ month: m, balance: Math.max(0, Math.round(balance)) });
    }
  }

  const breakdown = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString()}` },
    { label: "Annual Interest Rate", value: `${annualRate}%` },
    { label: "Loan Term", value: `${termMonths} months (${(termMonths / 12).toFixed(1)} yrs)` },
    { label: "Origination Fee", value: `$${origFee.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${originationPct}%)` },
    { label: "Net Proceeds", value: `$${netProceeds.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Payment", value: `$${payment.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective APR", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Total Cost of Loan", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective APR", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Origination Fee", value: `$${origFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest % of Principal", value: `${((totalInterest / loanAmount) * 100).toFixed(1)}%` },
  ];

  return { monthlyPayment: payment, totalPaid, totalInterest, effectiveRate, chartData, breakdown, summaryStats };
}

const DEFAULTS = { amount: "150000", rate: "8.5", term: "60", origination: "1" };

export default function BusinessLoanCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [origination, setOrigination] = useState(DEFAULTS.origination);
  const [result, setResult] = useState<BizLoanResult | null>(null);

  const calculate = () => setResult(calcBizLoan(parseFloat(amount)||150000, parseFloat(rate)||8.5, parseInt(term)||60, parseFloat(origination)||1));
  const reset = () => { setAmount(DEFAULTS.amount); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setOrigination(DEFAULTS.origination); setResult(calcBizLoan(150000,8.5,60,1)); };
  useEffect(() => { setResult(calcBizLoan(150000,8.5,60,1)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What are typical business loan interest rates?", answer: "SBA 7(a) loans: 6.5–9.5% (2024). Traditional bank loans: 6–12%. Online lenders: 10–25%. Microloans: 8–13%. Your rate depends on credit score, business age, revenue, and collateral. Businesses with 700+ personal credit and 2+ years of operation qualify for the best rates." },
    { question: "What loan terms are typical for business loans?", answer: "Working capital loans: 1–3 years. Equipment financing: 2–7 years. SBA 7(a) loans: up to 10 years (25 for real estate). Commercial real estate: 5–25 years. Shorter terms mean higher monthly payments but less total interest." },
    { question: "What documents do lenders require?", answer: "Typically: 2 years of business tax returns, 2 years of personal tax returns, recent bank statements (3–6 months), profit & loss statements, balance sheet, business licenses, and a business plan for larger loans. SBA loans require additional forms." },
    { question: "What is an origination fee?", answer: "An origination fee is a one-time upfront charge by the lender to process the loan, typically 0.5–3% of the loan amount. It's deducted from loan proceeds, meaning you receive less than the full loan amount but repay the full principal. Always factor origination fees into the true cost of borrowing." },
    { question: "SBA loan vs conventional business loan?", answer: "SBA loans offer lower rates (government-backed) but require more paperwork and longer approval times (30–90 days). Conventional bank loans are faster (2–4 weeks) but stricter qualifications. Online lenders approve in 1–3 days but charge significantly higher rates. Match the loan type to your time urgency and financial profile." },
    { question: "How much can a small business borrow?", answer: "SBA 7(a): up to $5 million. SBA Microloans: up to $50,000. Bank term loans: $25,000–$5 million. Online lenders: $5,000–$500,000. Lenders typically allow borrowing up to 10–20% of annual revenue, or require debt service coverage ratio of 1.25x (business income covers payments with 25% buffer)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Business Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Business Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Loan Amount</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Interest Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Loan Term</label>
                <div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Origination Fee</label>
              <div className={inp}><input type="number" value={origination} onChange={e => setOrigination(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Total interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Effective APR: {result.effectiveRate.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Paid", `$${result.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Effective APR", `${result.effectiveRate.toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Cost of Loan" ? "font-bold border-t-2 border-border text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Business Loan Calculator?</h2>
            <p>A <strong>business loan calculator</strong> estimates your monthly payment, total interest, and true borrowing cost for commercial financing. Whether you&apos;re funding equipment, inventory, expansion, or working capital, understanding the full cost of a business loan is critical for cash flow planning and profitability analysis.</p>
            <h2>How Business Loan Payments Are Calculated</h2>
            <p>Monthly Payment = P × [r(1+r)^n] ÷ [(1+r)^n − 1]. Where P = loan principal, r = monthly interest rate (annual ÷ 12), n = term in months. The effective APR accounts for origination fees by solving for the rate that makes the payment stream equal the net loan proceeds received.</p>
            <h2>Types of Business Loans</h2>
            <p>SBA 7(a) loans offer the lowest rates (government-backed) for amounts up to $5M. Equipment financing uses the equipment as collateral. Business lines of credit provide revolving access to funds. Invoice financing advances against outstanding receivables. Each has different rate structures, terms, and qualification requirements.</p>
            <h2>Qualifying for the Best Rates</h2>
            <p>Credit score 700+: qualifies for prime rates. 2+ years in business: most banks require this. $100K+ annual revenue: minimum for most term loans. Debt service coverage ratio (DSCR) above 1.25: net operating income must exceed debt payments by 25%.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/business-loan-calculator" />
          <PopularCalculators exclude="/calculator/business-loan-calculator" />
        </div>
      </div>
    </>
  );
}
