"use client";
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { RotateCcw, Calculator, Printer, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MicroResult {
  periodicPayment: number;
  totalInterest: number;
  totalPaid: number;
  effectiveApr: number;
  rows: AmortRow[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcMicrofinance(loanAmount: number, interestRate: number, interestType: "flat" | "declining", termValue: number, termUnit: "weeks" | "months", repaymentFreq: "weekly" | "biweekly" | "monthly"): MicroResult {
  let totalInterest = 0;
  let periodicPayment = 0;
  let totalPaid = 0;
  const rows: AmortRow[] = [];
  
  // Convert term to months for standard rate calculations if rate is usually annual
  const periodsPerYear = repaymentFreq === "weekly" ? 52 : repaymentFreq === "biweekly" ? 26 : 12;
  const totalPeriods = termUnit === "weeks" 
    ? (repaymentFreq === "weekly" ? termValue : repaymentFreq === "biweekly" ? termValue / 2 : termValue / 4.33)
    : (repaymentFreq === "weekly" ? termValue * 4.33 : repaymentFreq === "biweekly" ? termValue * 2.16 : termValue);
  
  const n = Math.max(1, Math.round(totalPeriods));
  
  if (interestType === "flat") {
    // Flat rate usually quoted per month or year. Assume rate is annual flat rate.
    const annualFlatRate = interestRate / 100;
    const termYears = termUnit === "weeks" ? termValue / 52 : termValue / 12;
    totalInterest = loanAmount * annualFlatRate * termYears;
    totalPaid = loanAmount + totalInterest;
    periodicPayment = totalPaid / n;
    
    let balance = loanAmount;
    const principalPortion = loanAmount / n;
    const interestPortion = totalInterest / n;
    
    for (let i = 1; i <= n; i++) {
      balance -= principalPortion;
      rows.push({ period: i, payment: periodicPayment, principal: principalPortion, interest: interestPortion, balance: Math.max(0, balance) });
    }
  } else {
    // Declining balance (standard amortization)
    const r = (interestRate / 100) / periodsPerYear;
    periodicPayment = loanAmount > 0 && n > 0
      ? (r > 0 ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loanAmount / n)
      : 0;
    
    totalInterest = Math.max(0, periodicPayment * n - loanAmount);
    totalPaid = loanAmount + totalInterest;
    
    let balance = loanAmount;
    for (let i = 1; i <= n && balance > 0.01; i++) {
      const interest = balance * r;
      let principal = periodicPayment - interest;
      if (principal > balance) principal = balance;
      balance -= principal;
      rows.push({ period: i, payment: interest + principal, principal, interest, balance: Math.max(0, balance) });
    }
  }

  // Calculate effective APR
  // For declining balance, it's roughly the stated interest rate.
  // For flat rate, it's roughly 1.8 to 2.0 times the flat rate.
  let effectiveApr = interestRate;
  if (interestType === "flat" && loanAmount > 0 && periodicPayment > 0) {
    let guess = 0.05;
    for (let i = 0; i < 20; i++) {
      const f = loanAmount - periodicPayment * ((1 - Math.pow(1 + guess, -n)) / guess);
      const fPrime = periodicPayment * ((1 - Math.pow(1 + guess, -n)) / (guess * guess) - (n * Math.pow(1 + guess, -n - 1)) / guess);
      const newGuess = guess - f / fPrime;
      if (Math.abs(newGuess - guess) < 1e-7) { guess = newGuess; break; }
      guess = newGuess;
    }
    effectiveApr = guess * periodsPerYear * 100;
  }

  const chartData = [
    { name: "Principal", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Cost", value: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Payments", value: `${n} ${repaymentFreq} payments` },
    { label: "Effective APR", value: `${effectiveApr.toFixed(2)}%` },
  ];

  return { periodicPayment, totalInterest, totalPaid, effectiveApr, rows, chartData, summaryStats };
}

const DEFAULTS = { loanAmount: "1500", interestRate: "15", interestType: "declining" as const, termValue: "6", termUnit: "months" as const, repaymentFreq: "weekly" as const };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function MicrofinanceLoanRepaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [interestType, setInterestType] = useState<"flat" | "declining">(DEFAULTS.interestType);
  const [termValue, setTermValue] = useState(DEFAULTS.termValue);
  const [termUnit, setTermUnit] = useState<"weeks" | "months">(DEFAULTS.termUnit);
  const [repaymentFreq, setRepaymentFreq] = useState<"weekly" | "biweekly" | "monthly">(DEFAULTS.repaymentFreq);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<MicroResult | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const calc = () => setResults(calcMicrofinance(parseFloat(loanAmount)||0, parseFloat(interestRate)||0, interestType, parseFloat(termValue)||0, termUnit, repaymentFreq));
  const reset = () => { setLoanAmount(DEFAULTS.loanAmount); setInterestRate(DEFAULTS.interestRate); setInterestType(DEFAULTS.interestType); setTermValue(DEFAULTS.termValue); setTermUnit(DEFAULTS.termUnit); setRepaymentFreq(DEFAULTS.repaymentFreq); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const handlePrint = () => { if (!printRef.current) return; const w = window.open("","_blank"); if (!w) return; w.document.write(`<html><head><title>Microfinance Schedule</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`); w.document.write(printRef.current.innerHTML); w.document.write("</body></html>"); w.document.close(); w.print(); };

  const faqs = [
    { question: "What is microfinance?", answer: "Microfinance involves providing small loans (microcredit) and financial services to low-income individuals or entrepreneurs who lack access to traditional banking services. These loans are typically short-term, uncollateralized, and feature frequent repayment schedules (like weekly installments)." },
    { question: "What is the difference between Flat Rate and Declining Balance?", answer: "A Flat Rate is calculated on the original loan principal for the entire term. If you borrow $1,000 at a 10% flat rate for a year, you pay $100 in interest, regardless of your repayments. A Declining Balance rate calculates interest only on the remaining unpaid principal. As you make payments and the principal drops, the interest charged drops too. Flat rates are mathematically much more expensive than declining balance rates." },
    { question: "Why is the Effective APR higher than the Flat Rate?", answer: "When you pay off a flat-rate loan in installments, you don't have use of the full principal for the entire year. By the last month, you've paid back almost all the money, but you're still being charged interest as if you held the full $1,000. This makes the true cost of borrowing (the Effective APR) almost double the stated flat rate." },
    { question: "Why do microfinance loans use weekly repayments?", answer: "Weekly or bi-weekly repayments are common in microfinance because they align with the cash flow of small traders and informal businesses. Frequent, smaller payments are often easier for low-income borrowers to manage than a large monthly lump sum, and they allow lenders to detect repayment issues early." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Microfinance Loan Repayment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Microfinance Loan Repayment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Annual Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/20 border border-border">
              <label className="text-sm font-semibold text-foreground">Interest Calculation Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[["declining", "Declining Balance"], ["flat", "Flat Rate"]].map(([v, l]) => (
                  <button key={v} onClick={() => setInterestType(v as "declining"|"flat")} className={`h-10 rounded-md border text-xs font-medium transition-colors ${interestType === v ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <div className="flex">
                  <input type="number" value={termValue} onChange={e => setTermValue(e.target.value)} className="w-16 h-10 px-3 text-sm border border-input border-r-0 rounded-l-md bg-background outline-none focus:ring-2 focus:ring-primary/20" />
                  <select value={termUnit} onChange={e => setTermUnit(e.target.value as "weeks"|"months")} className="flex-1 h-10 px-2 text-sm border border-input rounded-r-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Repayment Frequency</label>
                <select value={repaymentFreq} onChange={e => setRepaymentFreq(e.target.value as "weekly"|"biweekly"|"monthly")} className="h-10 px-3 text-sm border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary print:hidden" aria-label="Print"><Printer className="h-4 w-4" /></button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Periodic Payment ({repaymentFreq})</div>
                  <div className="text-4xl font-bold text-foreground">${results.periodicPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">For {termValue} {termUnit} at {interestRate}% {interestType === "flat" ? "Flat Rate" : "Declining Balance"}</div>
                </div>
                
                {interestType === "flat" && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <p className="text-sm text-destructive font-medium">⚠️ <strong>Warning:</strong> You selected a Flat Rate. While the stated rate is {interestRate}%, the true cost of borrowing (Effective APR) is approximately <strong>{results.effectiveApr.toFixed(1)}%</strong> because you pay interest on the full amount even as you pay it down.</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Total Principal", `$${(parseFloat(loanAmount)||0).toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`], ["Total Cost", `$${results.totalPaid.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`]].map(([l,v],i) => (
                    <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-lg font-bold ${i===1?"text-amber-600":""}`}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Loan Summary</h3>
                    <div className="space-y-2.5">
                      {results.summaryStats.map((s, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                          <span className="text-sm text-muted-foreground">{s.label}:</span>
                          <span className="text-sm font-semibold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Cost Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                          {results.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                      {results.chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 card-calculator !p-5 border border-border bg-card max-h-[500px] overflow-y-auto">
                  <h3 className="text-base font-bold mb-4">Repayment Schedule</h3>
                  <AmortizationTable rows={results.rows} yearly={false} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Microfinance Loans</h2>
            <p>Microfinance institutions (MFIs) provide crucial capital to small business owners, traders, and individuals who lack access to traditional banking infrastructure. Because microloans are typically uncollateralized and carry higher administrative costs relative to their size, their structure differs significantly from standard personal loans. The <strong>Microfinance Loan Repayment Calculator</strong> is designed to handle these unique structures, including short weekly repayment terms and the critical distinction between flat and declining interest rates.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Flat Interest Rates</h2>
            <p>The most important concept to understand in microfinance is the difference between a <strong>Declining Balance</strong> rate and a <strong>Flat Rate</strong>. Traditional bank loans use a declining balance: interest is only charged on the principal amount you still owe. As you make payments, your balance decreases, and the interest portion of your payment shrinks.</p>
            <p>Many microfinance institutions quote a Flat Rate because it is easy to explain and calculate without a computer. If you borrow $1,000 at a 15% flat rate for a year, you owe $150 in interest. Your total payback is $1,150. However, this is deceptive. Because you are paying the loan back in installments throughout the year, you do not have the use of the full $1,000 for the entire year. By month 11, you only owe a fraction of the principal, yet you are still effectively paying interest on the original $1,000. Mathematically, a 15% flat rate equals a true Annual Percentage Rate (APR) of roughly 27% to 29%. This calculator exposes that hidden cost by computing the true Effective APR.</p>

            <h2 className="text-2xl font-bold mb-3">Why Repayment Frequencies Matter</h2>
            <p>Microfinance loans frequently utilize weekly or bi-weekly repayment schedules rather than standard monthly payments. For a trader who earns revenue daily at a market stall, setting aside a small amount weekly is far more manageable than accumulating a large lump sum at the end of the month. Weekly payments also allow the lender to monitor the borrower's financial health closely—a missed $15 weekly payment is an early warning sign that can be addressed before it becomes a missed $60 monthly payment.</p>
            <p>From a mathematical perspective, more frequent compounding can slightly alter the total interest paid, but the primary impact is on cash flow management. Use this calculator to compare exactly how a weekly vs. monthly schedule impacts your out-of-pocket obligation.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/microfinance-loan-repayment-calculator" />
          <PopularCalculators exclude="/calculator/microfinance-loan-repayment-calculator" />
        </div>
      </div>
    </>
  );
}
