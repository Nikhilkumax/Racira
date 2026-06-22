"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PersonalLoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  apr: number;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPersonalLoan(loanAmount: number, annualRate: number, termMonths: number, originationPct: number): PersonalLoanResult {
  const origFee = loanAmount * (originationPct / 100);
  const r = annualRate / 100 / 12;
  const payment = r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths)) : loanAmount / termMonths;
  const totalPaid = payment * termMonths + origFee;
  const totalInterest = payment * termMonths - loanAmount;

  // Effective APR calculation
  const netProceeds = loanAmount - origFee;
  let lo = 0, hi = 2, apr = annualRate;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const rM = mid / 12;
    const p = rM > 0 ? (netProceeds * rM) / (1 - Math.pow(1 + rM, -termMonths)) : netProceeds / termMonths;
    if (p < payment) lo = mid; else hi = mid;
    apr = mid * 100;
  }

  let balance = loanAmount;
  const chartData = [{ month: 0, balance: Math.round(balance) }];
  for (let m = 1; m <= termMonths; m++) {
    const int = balance * r;
    balance -= (payment - int);
    if (m % Math.ceil(termMonths / 20) === 0 || m === termMonths)
      chartData.push({ month: m, balance: Math.max(0, Math.round(balance)) });
  }

  const breakdown = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString()}` },
    { label: "Annual Interest Rate", value: `${annualRate}%` },
    { label: "Loan Term", value: `${termMonths} months` },
    { label: "Origination Fee", value: `${originationPct}% ($${origFee.toLocaleString("en-US", { maximumFractionDigits: 0 })})` },
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective APR (with fees)", value: `${apr.toFixed(2)}%` },
    { label: "Total Cost of Loan", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective APR", value: `${apr.toFixed(2)}%` },
    { label: "Interest % of Principal", value: `${((totalInterest / loanAmount) * 100).toFixed(1)}%` },
    { label: "Origination Fee", value: `$${origFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment: payment, totalPaid, totalInterest, apr, chartData, breakdown, summaryStats };
}

const DEFAULTS = { amount: "15000", rate: "11.5", term: "36", origination: "2" };

export default function PersonalLoanCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [origination, setOrigination] = useState(DEFAULTS.origination);
  const [result, setResult] = useState<PersonalLoanResult | null>(null);

  const calculate = () => setResult(calcPersonalLoan(parseFloat(amount) || 15000, parseFloat(rate) || 11.5, parseInt(term) || 36, parseFloat(origination) || 2));
  const reset = () => { setAmount(DEFAULTS.amount); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setOrigination(DEFAULTS.origination); setResult(calcPersonalLoan(15000, 11.5, 36, 2)); };
  useEffect(() => { setResult(calcPersonalLoan(15000, 11.5, 36, 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the average personal loan interest rate?", answer: "Average personal loan rates in 2024: Excellent credit (720+): 7–12%. Good credit (660–719): 12–18%. Fair credit (580–659): 18–28%. Poor credit (below 580): 28–36%+. Credit unions often offer 2–5% lower rates than banks. Online lenders compete heavily, with rates as low as 6% for excellent credit borrowers." },
    { question: "How much can I borrow with a personal loan?", answer: "Personal loans typically range from $1,000 to $100,000. Most lenders cap at $40,000–$50,000 for unsecured loans. Loan amount depends on credit score, income, existing debt (debt-to-income ratio), and lender policies. Secured personal loans (backed by collateral) may allow higher amounts." },
    { question: "Personal loan vs. credit card — which is cheaper?", answer: "Personal loans almost always have lower APRs than credit cards. Average credit card rate in 2024: 21%+. Average personal loan rate: 11–12%. For a $10,000 balance, choosing a personal loan over a credit card typically saves $2,000–$4,000 in interest over 3 years. Use a personal loan to consolidate high-interest credit card debt." },
    { question: "What credit score do I need for a personal loan?", answer: "580+: most online lenders will approve, but rates will be high. 660+: good rates available from banks and credit unions. 720+: best rates across all lender types. Some credit unions offer loans to members with lower scores based on relationship history. Hard credit inquiries from applications temporarily lower your score by 5–10 points." },
    { question: "What is the debt-to-income ratio for personal loans?", answer: "Most lenders want DTI below 36%. Some accept up to 43%. DTI = (Total Monthly Debt Payments ÷ Gross Monthly Income) × 100. Example: $2,000 monthly debt on $6,000 income = 33.3% DTI. A personal loan payment that pushes your DTI above 43% will likely result in denial." },
    { question: "Are personal loan fees tax-deductible?", answer: "Generally no — personal loan interest is not tax-deductible for personal use. Exceptions: if the loan proceeds are used for business purposes, the interest may be deductible as a business expense. Consult a tax advisor for your specific situation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Personal Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Personal Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Loan Amount</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Loan Term</label>
                <div className="grid grid-cols-3 gap-1">
                  {[["24", "24mo"], ["36", "36mo"], ["60", "60mo"]].map(([v, l]) => (
                    <button key={v} onClick={() => setTerm(v)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${term === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Origination Fee</label><div className={inp}><input type="number" value={origination} onChange={e => setOrigination(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
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
                <div className="text-sm text-muted-foreground mt-1">Total interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} · APR: {result.apr.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Paid", `$${result.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Effective APR", `${result.apr.toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Cost of Loan" ? "font-bold border-t-2 border-border text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} /><Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
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
            <h2>What Is a Personal Loan Calculator?</h2>
            <p>A <strong>personal loan calculator</strong> estimates your monthly payment, total interest, and effective APR for an unsecured personal loan. Whether you&apos;re consolidating credit card debt, financing a major purchase, or covering an emergency expense, understanding your true borrowing cost is critical. This calculator also factors in origination fees, which can significantly raise the effective APR above the stated interest rate.</p>
            <h2>How Personal Loan Payments Are Calculated</h2>
            <p>Monthly Payment = P × [r(1+r)^n] ÷ [(1+r)^n − 1]. Where P = loan principal, r = monthly rate (APR ÷ 12), n = term in months. Effective APR with fees: solve for the rate r where payment × n = net proceeds (loan minus origination fee). The effective APR is always higher than the stated rate when fees exist.</p>
            <h2>Types of Personal Loans</h2>
            <p>Unsecured personal loans (most common): no collateral required, rate based on creditworthiness. Secured personal loans: backed by a savings account or CD, typically 2–4% lower rates. Debt consolidation loans: specifically for paying off multiple debts, often with autopay discounts. Credit union personal loans: typically 2–5% lower rates than banks for members.</p>
            <h2>How to Get the Best Personal Loan Rate</h2>
            <p>Improve your credit score before applying — even small improvements matter. Get pre-qualified from multiple lenders (soft pull, no credit impact). Compare total cost, not just monthly payment. Enroll in autopay for 0.25–0.5% rate discount. Choose shortest term you can comfortably afford — less interest overall.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/personal-loan-calculator" />
          <PopularCalculators exclude="/calculator/personal-loan-calculator" />
        </div>
      </div>
    </>
  );
}
