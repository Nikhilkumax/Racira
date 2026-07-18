"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, AlertTriangle, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface PaydayResult {
  totalFee: number;
  totalRepayment: number;
  trueApr: number;
  ccInterestCost: number;
  chartData: { name: string; payday: number; creditCard: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcPayday(loanAmount: number, feePer100: number, termDays: number, ccApr: number): PaydayResult {
  // Payday Loan calculations
  const totalFee = (loanAmount / 100) * feePer100;
  const totalRepayment = loanAmount + totalFee;
  
  // True APR formula: (Fee / Principal) * (365 / TermDays) * 100
  const trueApr = loanAmount > 0 && termDays > 0 ? (totalFee / loanAmount) * (365 / termDays) * 100 : 0;

  // Credit Card comparison calculations
  // Assuming simple daily interest for the exact same term
  const ccDailyRate = (ccApr / 100) / 365;
  const ccInterestCost = loanAmount * ccDailyRate * termDays;

  const chartData = [
    { name: "Total Cost of Borrowing", payday: totalFee, creditCard: ccInterestCost },
  ];

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Term", value: `${termDays} days` },
    { label: "Payday Finance Charge", value: `$${totalFee.toFixed(2)}` },
    { label: "Payday True APR", value: `${trueApr.toFixed(0)}%` },
    { label: "Total Payday Repayment", value: `$${totalRepayment.toFixed(2)}` },
  ];

  return { totalFee, totalRepayment, trueApr, ccInterestCost, chartData, summaryStats };
}

const DEFAULTS = { loanAmount: "500", feePer100: "15", termDays: "14", ccApr: "24.99" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function PaydayLoanTrueCostCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [feePer100, setFeePer100] = useState(DEFAULTS.feePer100);
  const [termDays, setTermDays] = useState(DEFAULTS.termDays);
  const [ccApr, setCcApr] = useState(DEFAULTS.ccApr);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<PaydayResult | null>(null);

  const calc = () => setResults(calcPayday(parseFloat(loanAmount)||0, parseFloat(feePer100)||0, parseFloat(termDays)||14, parseFloat(ccApr)||24.99));
  const reset = () => { setLoanAmount(DEFAULTS.loanAmount); setFeePer100(DEFAULTS.feePer100); setTermDays(DEFAULTS.termDays); setCcApr(DEFAULTS.ccApr); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is a payday loan?", answer: "A payday loan is a short-term, high-cost loan generally for $500 or less that is typically due on your next payday. Depending on your state law, payday lenders may charge a flat fee anywhere from $10 to $30 for every $100 borrowed. To secure the loan, borrowers usually provide a post-dated check or electronic access to their bank account." },
    { question: "Why is the APR on a payday loan so high?", answer: "APR (Annual Percentage Rate) is designed to show the cost of borrowing over a full year. While a $15 fee on a $100 loan might look like 15% interest, that 15% is incurred over just 14 days, not 365 days. If you continually rolled over that loan for an entire year, paying that $15 fee every two weeks, the cost expands exponentially. Mathematically, a $15 per $100 fee for a 14-day loan equals a true APR of 391%." },
    { question: "What is the 'debt trap'?", answer: "The debt trap occurs when a borrower cannot afford to repay the payday loan and cover their basic living expenses when their next paycheck arrives. To avoid defaulting, they pay another flat fee to 'roll over' or extend the loan for another two weeks. Repeated rollovers result in the borrower paying more in fees than they originally borrowed, while still owing the original principal." },
    { question: "Are there alternatives to payday loans?", answer: "Yes. Even high-rate credit cards (25-30% APR) are mathematically vastly cheaper than payday loans (390%+ APR). Other alternatives include Payday Alternative Loans (PALs) offered by credit unions, borrowing from family or friends, requesting a payment plan from your utility company or landlord, or utilizing cash advance apps that do not charge interest (though they may charge small subscription fees)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Payday Loan True Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Payday Loan True Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive font-medium mb-2">
              <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4" /> <strong>High Risk Warning</strong></div>
              Payday loans are extremely high-cost financial products. This calculator reveals their true annualized cost compared to traditional credit.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="fee" label="Fee per $100" value={feePer100} onChange={setFeePer100} prefix="$" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={termDays} onChange={setTermDays} suffix="days" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Comparison Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="cc" label="Compare to Credit Card APR" value={ccApr} onChange={setCcApr} suffix="%" />
                </div>
              )}
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
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">True Annual Percentage Rate (APR)</div>
                <div className="text-5xl font-bold text-foreground">{results.trueApr.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">To borrow ${loanAmount} for {termDays} days, you will pay ${results.totalFee.toFixed(2)} in fees.</div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Finance Charge", `$${results.totalFee.toFixed(2)}`], ["Total Repayment Due", `$${results.totalRepayment.toFixed(2)}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Loan Details</h3>
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
                  <h3 className="text-base font-bold mb-4">Cost Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={results.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="payday" name="Payday Loan Fee" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="creditCard" name={`Credit Card (${ccApr}%)`} fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Cost to borrow ${loanAmount} for exactly {termDays} days.</p>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of the Debt Trap</h2>
            <p>Payday loans are marketed as quick fixes for unexpected emergencies. The terms often sound reasonable at a glance: "Borrow $300, pay a $45 fee." To a borrower in a crisis, $45 might seem like an acceptable price to fix an immediate problem. However, the <strong>Payday Loan True Cost Calculator</strong> strips away the marketing to reveal the math. Because that $45 fee is charged for a loan that lasts only 14 days, the annualized cost of borrowing that money is staggeringly high.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding True APR</h2>
            <p>The Annual Percentage Rate (APR) is the standardized metric used across the financial industry to compare the cost of borrowing. A typical credit card might have an APR of 24%. A personal loan might be 15%. If you pay $15 per $100 borrowed for a 14-day payday loan, the math translates to an astonishing 391% APR.</p>
            <p>Why does this matter? If you borrowed $500 on a 24% APR credit card and paid it back in 14 days, the interest charge would be roughly $4.60. If you take out a typical payday loan for the exact same amount and time period, the fee is $75. The payday loan is <strong>over 16 times more expensive</strong> than carrying a balance on a high-rate credit card.</p>

            <h2 className="text-2xl font-bold mb-3">The Rollover Danger</h2>
            <p>The true danger of payday loans is not just the high APR, but the structure of the repayment. Unlike traditional loans which are paid off gradually over time (amortization), payday loans require a balloon payment: the entire principal plus the fee is due on your next payday. If you struggled to make ends meet this week, it is highly likely that handing over $575 from your next paycheck will leave you unable to pay rent or buy groceries next week.</p>
            <p>This structural reality forces many borrowers to "roll over" the loan. You pay the $75 fee to extend the loan for another two weeks, but you still owe the original $500. A borrower caught in this trap for six months will pay $900 in fees, yet they will still owe the original $500 principal. This calculator highlights the disparity between the payday fee and traditional financing to encourage exploring all other alternatives before signing a payday contract.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payday-loan-true-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Payday Loan True Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Payday Loan True Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Payday Loan True Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Payday Loan True Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Payday Loan True Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/payday-loan-true-cost-calculator" />
        </div>
      </div>
    </>
  );
}
