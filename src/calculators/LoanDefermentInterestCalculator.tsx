"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Clock, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface DeferResult {
  defermentPeriodMonths: number;
  interestAccrued: number;
  newBalance: number;
  originalMonthlyPayment: number;
  newMonthlyPayment: number;
  extraInterestCost: number;
  extraMonthsToPayoff: number;
  chartData: { month: number; withDeferment: number; withoutDeferment: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcDeferment(loanBalance: number, interestRate: number, remainingTermMonths: number, defermentMonths: number, interestSubsidized: boolean): DeferResult {
  const r = interestRate / 100 / 12;

  // Original payment
  const origPayment = loanBalance > 0 && remainingTermMonths > 0
    ? (r > 0 ? loanBalance * r * Math.pow(1 + r, remainingTermMonths) / (Math.pow(1 + r, remainingTermMonths) - 1) : loanBalance / remainingTermMonths)
    : 0;

  // During deferment: interest accrues (unless subsidized)
  const interestAccrued = interestSubsidized ? 0 : loanBalance * r * defermentMonths;
  const newBalance = loanBalance + interestAccrued;

  // New payment after deferment (same remaining term)
  const newPayment = newBalance > 0 && remainingTermMonths > 0
    ? (r > 0 ? newBalance * r * Math.pow(1 + r, remainingTermMonths) / (Math.pow(1 + r, remainingTermMonths) - 1) : newBalance / remainingTermMonths)
    : 0;

  const origTotalCost = origPayment * remainingTermMonths;
  const newTotalCost = newPayment * remainingTermMonths;
  const extraInterestCost = Math.max(0, newTotalCost - origTotalCost + interestAccrued);

  // Chart: balance comparison over time
  const chartData = [];
  let balWith = newBalance;
  let balWithout = loanBalance;
  const totalMonths = remainingTermMonths + defermentMonths;
  for (let m = 0; m <= totalMonths; m += Math.ceil(totalMonths / 20)) {
    // Without deferment: paying from month 1
    const mWithout = Math.min(m, remainingTermMonths);
    let bWithout = loanBalance;
    for (let i = 0; i < mWithout && bWithout > 0.01; i++) {
      const int = bWithout * r;
      bWithout = Math.max(0, bWithout - (origPayment - int));
    }
    // With deferment
    let bWith = loanBalance;
    if (m <= defermentMonths) {
      bWith = interestSubsidized ? loanBalance : loanBalance * Math.pow(1 + r, m);
    } else {
      const payMonths = m - defermentMonths;
      bWith = newBalance;
      for (let i = 0; i < payMonths && bWith > 0.01; i++) {
        const int = bWith * r;
        bWith = Math.max(0, bWith - (newPayment - int));
      }
    }
    chartData.push({ month: m, withDeferment: Math.round(Math.max(0, bWith)), withoutDeferment: Math.round(Math.max(0, bWithout)) });
  }

  const summaryStats = [
    { label: "Original Balance", value: `$${loanBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Deferment Period", value: `${defermentMonths} months` },
    { label: "Interest Type", value: interestSubsidized ? "Subsidized (Gov. pays interest)" : "Unsubsidized (interest accrues)" },
    { label: "Interest Accrued", value: `$${interestAccrued.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Balance After Deferment", value: `$${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Original Monthly Payment", value: `$${origPayment.toFixed(2)}` },
    { label: "New Monthly Payment", value: `$${newPayment.toFixed(2)}` },
    { label: "Extra Total Interest Cost", value: `$${extraInterestCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { defermentPeriodMonths: defermentMonths, interestAccrued, newBalance, originalMonthlyPayment: origPayment, newMonthlyPayment: newPayment, extraInterestCost, extraMonthsToPayoff: defermentMonths, chartData, summaryStats };
}

const DEFAULTS = { loanBalance: "35000", interestRate: "5.5", remainingTermMonths: "120", defermentMonths: "12", interestSubsidized: false };

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

export default function LoanDefermentInterestCalculator() {
  const [loanBalance, setLoanBalance] = useState(DEFAULTS.loanBalance);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [remainingTermMonths, setRemainingTermMonths] = useState(DEFAULTS.remainingTermMonths);
  const [defermentMonths, setDefermentMonths] = useState(DEFAULTS.defermentMonths);
  const [interestSubsidized, setInterestSubsidized] = useState(DEFAULTS.interestSubsidized);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<DeferResult | null>(null);

  const calc = () => setResults(calcDeferment(parseFloat(loanBalance)||0, parseFloat(interestRate)||0, parseFloat(remainingTermMonths)||0, parseFloat(defermentMonths)||0, interestSubsidized));
  const reset = () => { setLoanBalance(DEFAULTS.loanBalance); setInterestRate(DEFAULTS.interestRate); setRemainingTermMonths(DEFAULTS.remainingTermMonths); setDefermentMonths(DEFAULTS.defermentMonths); setInterestSubsidized(false); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is loan deferment?", answer: "Loan deferment is a temporary postponement of your loan payments, granted by your lender during periods of financial hardship such as unemployment, returning to school, or military service. During deferment, you are not required to make principal or interest payments—but on unsubsidized loans, interest continues to accumulate and is added to your principal balance." },
    { question: "What is the difference between subsidized and unsubsidized deferment?", answer: "For federal student loans, subsidized loans have their interest paid by the government during qualifying deferment periods, so your balance doesn't grow. Unsubsidized loans accrue interest during deferment which capitalizes (is added to the principal) when the deferment ends, permanently increasing your balance and future payments." },
    { question: "How does interest capitalization work?", answer: "Capitalization occurs when accrued interest is added to your principal balance. Once capitalized, you begin paying interest on a larger balance, which means you are effectively paying interest on interest. On a $35,000 loan at 5.5% over a 12-month deferment, approximately $1,925 of interest accrues, raising your balance to $36,925 and increasing all future interest charges." },
    { question: "Should I defer my loan if I can avoid it?", answer: "Deferment should be a last resort. If you can make even partial payments during deferment—especially interest-only payments—you prevent capitalization and protect your long-term financial health. Many lenders allow interest-only payment arrangements that are more manageable than full payments while preventing balance growth." },
    { question: "What types of loans offer deferment?", answer: "Federal student loans offer deferment for unemployment, economic hardship, school enrollment, military service, and other qualifying conditions. Most private student loans and personal loans also offer deferment or forbearance programs, though terms vary significantly by lender. Mortgage loans do not typically offer deferment, though COVID-era forbearance programs set a precedent for future hardship programs." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Loan Deferment Interest Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Deferment Interest Accumulation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="balance" label="Loan Balance" value={loanBalance} onChange={setLoanBalance} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Remaining Term" value={remainingTermMonths} onChange={setRemainingTermMonths} suffix="months" />
              <CompactInput id="defer" label="Deferment Period" value={defermentMonths} onChange={setDefermentMonths} suffix="months" />
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/20 border border-border">
              <label className="text-sm font-semibold text-foreground">Interest Type During Deferment</label>
              <div className="flex gap-3">
                {[["false", "Unsubsidized (accrues)"], ["true", "Subsidized (Gov. paid)"]].map(([v, l]) => (
                  <button key={v} onClick={() => setInterestSubsidized(v === "true")} className={`flex-1 h-10 rounded-md border text-xs font-medium transition-colors px-2 text-center ${(interestSubsidized ? "true" : "false") === v ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
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
            {results && (<>
              <div className={`border-l-4 rounded-lg p-5 ${results.interestAccrued > 0 ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${results.interestAccrued > 0 ? "text-amber-600" : "text-primary"}`}>Interest Accrued During Deferment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.interestAccrued.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">New balance: ${results.newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · Extra lifetime cost: ${results.extraInterestCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Original Payment", `$${results.originalMonthlyPayment.toFixed(2)}/mo`], ["New Payment After Deferment", `$${results.newMonthlyPayment.toFixed(2)}/mo`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===1&&results.newMonthlyPayment>results.originalMonthlyPayment?"text-amber-600":""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Deferment Impact Summary</h3>
                <div className="space-y-2.5">
                  {results.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                      <span className="text-sm text-muted-foreground">{s.label}:</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance: With vs. Without Deferment</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={results.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="withDeferment" name="With Deferment" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="withoutDeferment" name="Without Deferment" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Loan Deferment Interest</h2>
            <p>Loan deferment offers a financial lifeline during periods of hardship—but it comes with a critical hidden cost that most borrowers fail to fully understand. While deferment relieves you of the obligation to make monthly payments, interest continues to accumulate on most loan types during the deferment period. When the deferment ends, this accumulated interest is capitalized (added to your principal balance), permanently increasing your loan balance and all future interest charges.</p>
            <p>This calculator reveals the true long-term cost of deferment, showing exactly how much interest accrues during your pause, how your balance changes, and how much your monthly payment increases afterward. This information is essential for making an informed decision about whether deferment is the right choice or whether alternative options are more cost-effective.</p>

            <h2 className="text-2xl font-bold mb-3">The Capitalization Effect</h2>
            <p>Capitalization is the most misunderstood aspect of loan deferment. When your deferment period ends, the accrued interest is not simply added to a separate balance—it becomes part of your principal. From that point forward, you are paying interest on both the original principal and the previously accrued interest. This compounding effect means the true long-term cost of deferment significantly exceeds the simple interest calculation.</p>
            <p>Consider a $35,000 student loan at 5.5% with a 12-month deferment. Interest accrues at approximately $160 per month, accumulating $1,925 over the year. After capitalization, your new balance is $36,925. Over the remaining 10-year repayment period, you will pay additional interest not just on the $1,925 capitalized amount, but interest on that $1,925 too—adding hundreds of extra dollars to your lifetime loan cost.</p>

            <h2 className="text-2xl font-bold mb-3">Subsidized vs. Unsubsidized Deferment</h2>
            <p>For federal student loans, the deferment treatment differs based on loan type. <strong>Subsidized Direct Loans</strong> have their interest covered by the Department of Education during qualifying deferment periods—including in-school deferment, unemployment deferment, and economic hardship deferment. Your balance remains exactly the same as when you started the deferment. <strong>Unsubsidized Direct Loans</strong> and <strong>PLUS Loans</strong> receive no such government subsidy; interest accrues throughout the deferment period and capitalizes at its conclusion.</p>

            <h2 className="text-2xl font-bold mb-3">Alternatives to Full Deferment</h2>
            <p>If your primary goal is reducing your monthly cash outflow during a hardship period, consider these alternatives that are less costly than full deferment. <strong>Interest-only payments</strong> prevent capitalization by paying the monthly interest as it accrues, even while skipping principal payments—your balance stays flat rather than growing. <strong>Income-driven repayment (IDR) plans</strong> for student loans cap payments at 5-20% of discretionary income. <strong>Extended repayment plans</strong> stretch the term to lower monthly payments without pausing entirely. All of these options preserve more of your financial health than a full deferment on an unsubsidized loan.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-deferment-interest-accumulation-calculator" />
          <PopularCalculators exclude="/calculator/loan-deferment-interest-accumulation-calculator" />
        </div>
      </div>
    </>
  );
}
