"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { amortize, totalInterest, totalPaid, type AmortRow } from "@/lib/auto/autoFinance";

interface PayoffInputs {
  balance: number;
  aprPct: number;
  remainingMonths: number;
  extraMonthly: number;
  oneTimeExtra: number;
}

interface PayoffResults {
  originalMonths: number;
  acceleratedMonths: number;
  monthsSaved: number;
  yearsSaved: number;
  remainingYears: number;
  remainingMonthsOnly: number;
  originalInterest: number;
  acceleratedInterest: number;
  interestSaved: number;
  originalTotal: number;
  acceleratedTotal: number;
  totalSaved: number;
  originalRows: AmortRow[];
  acceleratedRows: AmortRow[];
}

const DEFAULTS: PayoffInputs = {
  balance: 18000,
  aprPct: 7.2,
  remainingMonths: 54,
  extraMonthly: 150,
  oneTimeExtra: 2000,
};

function calculate(input: PayoffInputs): PayoffResults {
  const balance = Math.max(0, input.balance);
  const apr = Math.max(0, input.aprPct);
  const months = Math.max(1, Math.round(input.remainingMonths));
  const years = months / 12;

  const originalRows = amortize(balance, apr, years);
  const acceleratedRows = amortize(balance, apr, years, {
    extraMonthly: Math.max(0, input.extraMonthly),
    oneTimeExtra: Math.max(0, input.oneTimeExtra),
    oneTimeAtPeriod: 1,
  });

  const originalInterest = totalInterest(originalRows);
  const acceleratedInterest = totalInterest(acceleratedRows);
  const originalTotal = totalPaid(originalRows);
  const acceleratedTotal = totalPaid(acceleratedRows);

  const monthsSaved = originalRows.length - acceleratedRows.length;
  return {
    originalMonths: originalRows.length,
    acceleratedMonths: acceleratedRows.length,
    monthsSaved,
    yearsSaved: monthsSaved / 12,
    remainingYears: Math.floor(acceleratedRows.length / 12),
    remainingMonthsOnly: acceleratedRows.length % 12,
    originalInterest,
    acceleratedInterest,
    interestSaved: originalInterest - acceleratedInterest,
    originalTotal,
    acceleratedTotal,
    totalSaved: originalTotal - acceleratedTotal,
    originalRows,
    acceleratedRows,
  };
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const EarlyLoanPayoffSavingsCalculator = () => {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [aprPct, setAprPct] = useState(String(DEFAULTS.aprPct));
  const [remainingMonths, setRemainingMonths] = useState(String(DEFAULTS.remainingMonths));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [oneTimeExtra, setOneTimeExtra] = useState(String(DEFAULTS.oneTimeExtra));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<PayoffResults | null>(null);

  const inputs: PayoffInputs = useMemo(
    () => ({
      balance: parseFloat(balance) || 0,
      aprPct: parseFloat(aprPct) || 0,
      remainingMonths: parseFloat(remainingMonths) || 0,
      extraMonthly: parseFloat(extraMonthly) || 0,
      oneTimeExtra: parseFloat(oneTimeExtra) || 0,
    }),
    [balance, aprPct, remainingMonths, extraMonthly, oneTimeExtra]
  );

  useEffect(() => {
    setResults(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setAprPct(String(DEFAULTS.aprPct));
    setRemainingMonths(String(DEFAULTS.remainingMonths));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setOneTimeExtra(String(DEFAULTS.oneTimeExtra));
    setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: "Original Plan", interest: Math.round(results.originalInterest), principal: Math.round(inputs.balance), fill: "#f87171" },
      { name: "Accelerated", interest: Math.round(results.acceleratedInterest), principal: Math.round(inputs.balance), fill: "#34d399" },
    ];
  }, [results, inputs.balance]);

  const pieData = results
    ? [
        { name: "Principal", value: Math.round(inputs.balance), color: "#3b82f6" },
        { name: "Interest Saved", value: Math.round(results.interestSaved), color: "#10b981" },
        { name: "Interest Still Owed", value: Math.round(results.acceleratedInterest), color: "#f59e0b" },
      ]
    : [];
  const activePieData = pieData.filter((d) => d.value > 0);

  const faqs = [
    { question: "How does paying off a loan early save money?", answer: "Every dollar you pay above your scheduled payment goes straight to reducing the principal balance. Because interest is charged on the remaining principal, a smaller balance means less interest accrues each month — compounding your savings across every remaining period of the loan." },
    { question: "Will my lender charge a prepayment penalty?", answer: "Most auto and personal loans in the U.S. do not carry prepayment penalties, but it is not universal. Check your loan agreement or ask your lender before making large lump-sum payments. Federal credit unions are prohibited from charging prepayment penalties on many loan types." },
    { question: "Is it better to make extra monthly payments or one lump sum?", answer: "Both reduce principal and save interest. A lump sum applied early in the loan has the largest impact because it cuts interest accrual for the longest period. Monthly extras are easier to budget and still produce meaningful savings. Combining the two is the most powerful approach." },
    { question: "How is interest saved calculated?", answer: "We run two full amortization schedules from your current balance: one with only scheduled payments, and one with your extra payments applied. The difference between the total interest paid in each schedule is your interest saved." },
    { question: "Does this work for any type of loan?", answer: "Yes. The calculator works for any fixed-rate amortizing loan — auto, personal, student, mortgage, or RV. It assumes level monthly payments and a fixed APR. Variable-rate loans will see slightly different real-world results as the rate changes." },
    { question: "How accurate are the time-saved estimates?", answer: "The time saved is exact for the modeled scenario. Your actual payoff date can shift slightly if you miss payments, change your extra-payment amount, or if your lender applies payments differently. Always confirm your payoff quote with the lender before the final payment." },
    { question: "Should I pay off my loan early or invest the money?", answer: "It depends on your loan's APR versus the return you expect from investing. As a rule of thumb, if your loan APR is higher than a conservative investment return (say, 6–7%), paying it off early is the better financial move. Below that, investing may win — but factor in the peace of mind of being debt-free." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Early Loan Payoff Savings" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Early Loan Payoff Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="balance" label="Current Balance" value={balance} onChange={setBalance} prefix="$" />
              <CompactInput id="apr" label="Interest Rate" value={aprPct} onChange={setAprPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="months" label="Remaining Term" value={remainingMonths} onChange={setRemainingMonths} suffix="months" />
              <CompactInput id="extra" label="Extra / Month" value={extraMonthly} onChange={setExtraMonthly} prefix="$" />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="one-time" label="One-Time Lump Sum" value={oneTimeExtra} onChange={setOneTimeExtra} prefix="$" />
                  <div className="flex flex-col justify-end">
                    <p className="text-xs text-muted-foreground leading-relaxed">Applied at month 1. Combine with monthly extras for the biggest savings.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <div className="flex justify-end">
                    <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>

                  {/* Primary Result */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Interest Saved</div>
                    <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                      ${Math.round(results.interestSaved).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      And finish <strong className="text-foreground">{results.yearsSaved >= 1 ? `${Math.floor(results.yearsSaved)} yr ` : ""}{results.monthsSaved % 12} mo</strong> earlier
                    </div>
                  </div>

                  {/* 3-Stat Bar */}
                  <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                    <div className="p-3 text-center border-r border-border">
                      <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Months Saved</div>
                      <div className="text-lg font-bold text-foreground">{results.monthsSaved}</div>
                    </div>
                    <div className="p-3 text-center border-r border-border">
                      <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">New Payoff</div>
                      <div className="text-lg font-bold text-foreground">{results.remainingYears}y {results.remainingMonthsOnly}m</div>
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Saved</div>
                      <div className="text-lg font-bold text-emerald-600">${Math.round(results.totalSaved).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-2.5 pl-3">Scenario</th>
                          <th className="p-2.5 text-right w-[110px]">Months</th>
                          <th className="p-2.5 text-right w-[130px]">Interest</th>
                          <th className="p-2.5 pr-3 text-right w-[130px]">Total Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">Original Schedule</td>
                          <td className="p-2.5 text-right text-foreground">{results.originalMonths}</td>
                          <td className="p-2.5 text-right text-red-600 font-medium">${Math.round(results.originalInterest).toLocaleString()}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground font-semibold">${Math.round(results.originalTotal).toLocaleString()}</td>
                        </tr>
                        <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">With Extra Payments</td>
                          <td className="p-2.5 text-right text-foreground">{results.acceleratedMonths}</td>
                          <td className="p-2.5 text-right text-emerald-600 font-medium">${Math.round(results.acceleratedInterest).toLocaleString()}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground font-semibold">${Math.round(results.acceleratedTotal).toLocaleString()}</td>
                        </tr>
                        <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                          <td className="p-2.5 pl-3">You Save</td>
                          <td className="p-2.5 text-right">{results.monthsSaved}</td>
                          <td className="p-2.5 text-right text-emerald-600">${Math.round(results.interestSaved).toLocaleString()}</td>
                          <td className="p-2.5 pr-3 text-right">${Math.round(results.totalSaved).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Bar Chart: Interest comparison */}
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Interest Paid: Original vs Accelerated</h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          <Bar dataKey="interest" name="Interest" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, i) => (
                              <Cell key={`bar-${i}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="bg-muted/30 rounded-lg p-5">
                    <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                      <div className="flex justify-between"><span className="text-muted-foreground">Original loan balance:</span><span className="font-medium text-foreground">${Math.round(inputs.balance).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Annual rate:</span><span className="font-medium text-foreground">{inputs.aprPct.toFixed(2)}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Original term:</span><span className="font-medium text-foreground">{results.originalMonths} mo</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">New term:</span><span className="font-medium text-foreground">{results.acceleratedMonths} mo</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Extra / month:</span><span className="font-medium text-foreground">${Math.round(inputs.extraMonthly).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Lump sum:</span><span className="font-medium text-foreground">${Math.round(inputs.oneTimeExtra).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Original interest:</span><span className="font-medium text-foreground">${Math.round(results.originalInterest).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">New interest:</span><span className="font-medium text-foreground">${Math.round(results.acceleratedInterest).toLocaleString()}</span></div>
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
                      <span className="font-semibold text-foreground">Total interest saved:</span>
                      <span className="font-bold text-primary">${Math.round(results.interestSaved).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Early Loan Payoff Savings Calculator?</h2>
            <p>The Early Loan Payoff Savings Calculator shows you exactly how much money and time you can save by adding extra payments to an existing loan. Whether you have an auto loan, personal loan, student loan, or any other fixed-rate installment debt, this tool runs two complete amortization schedules — one with your scheduled payments and one with your extra contributions — and reports the interest savings, time savings, and new payoff date.</p>
            <p>Borrowers use this calculator to decide whether a tax refund, work bonus, or small monthly overpayment is worth applying to their loan. Even modest extra payments made early in the loan's life can eliminate thousands of dollars in interest, because every extra dollar reduces the principal balance that future interest is calculated against.</p>

            <h2>How It Works</h2>
            <p>Installment loans use a standard amortization formula. Each scheduled payment is split between interest (charged on the remaining balance) and principal (which reduces the balance). At the start of a loan, most of each payment is interest; near the end, most is principal. The monthly payment for a fixed-rate loan is:</p>
            <p><strong>M = P × r(1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)</strong></p>
            <p>where P is the principal, r is the monthly interest rate (APR ÷ 12), and n is the number of remaining months. When you add an extra payment, that entire amount is applied to principal (after the scheduled interest is covered), so next month's interest is computed on a smaller balance — and the cycle repeats, snowballing your savings.</p>
            <p>This calculator builds the original schedule from your current balance and remaining term, then rebuilds it with your extra monthly payment and any one-time lump sum (applied at month 1). The difference in total interest between the two schedules is your <strong>interest saved</strong>. The difference in length is your <strong>time saved</strong>.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result card shows the total interest you will avoid paying by following your accelerated plan. The 3-stat bar beneath it translates that into the number of months you finish early, your new payoff timeline (years and months), and your total out-of-pocket savings — which includes both interest saved and principal you would have paid during the eliminated months.</p>
            <p>The breakdown table compares the two scenarios side-by-side so you can see exactly where the savings come from. The bar chart visualizes the dramatic gap in interest paid between the original schedule and the accelerated plan. Finally, the summary statistics recap every input and output in one place for easy reference.</p>

            <h2>Key Factors That Drive Your Savings</h2>
            <ul>
              <li><strong>Current balance:</strong> The larger the balance, the more interest every dollar of principal reduction saves you. High-balance loans benefit most from acceleration.</li>
              <li><strong>Interest rate (APR):</strong> Higher rates amplify savings because each principal dollar was being charged more interest. A 15% APR loan benefits roughly three times as much from extra payments as a 5% loan.</li>
              <li><strong>Remaining term:</strong> The longer the term left, the more periods over which saved interest compounds. Early in a loan, extra payments are far more valuable than late in a loan.</li>
              <li><strong>Extra monthly payment:</strong> The single most flexible lever. Even $50–$100/month produces meaningful savings on a multi-year loan.</li>
              <li><strong>One-time lump sum:</strong> A lump sum applied early has the largest impact because it reduces the balance for the maximum number of remaining periods.</li>
              <li><strong>Timing:</strong> An extra dollar paid in month 3 saves far more interest than the same dollar paid in month 50, because it has longer to compound.</li>
            </ul>

            <h2>Advanced Features</h2>
            <p>The Advanced Options panel lets you add a one-time lump sum on top of your recurring monthly extra. This models real-world situations like applying a tax refund, year-end bonus, or inheritance to the loan. The lump sum is applied at month 1 for maximum effect — if you plan to apply it later, your savings will be slightly lower, so use the calculator conservatively.</p>

            <h2>Practical Examples</h2>
            <h3>Example 1: Modest extra on an auto loan</h3>
            <p>Suppose you have a $18,000 auto loan balance at 7.2% APR with 54 months remaining. Your scheduled payment is about $378/month. Adding just $150/month extra and a $2,000 year-end bonus applied immediately saves roughly $1,500 in interest and finishes the loan about 11 months early. That is a remarkable return for less than $5/day.</p>
            <h3>Example 2: Lump sum on a personal loan</h3>
            <p>A $10,000 personal loan at 12% APR with 36 months remaining carries about $1,950 in remaining interest. A single $3,000 lump sum paid now reduces total interest to roughly $1,150 and shortens the loan by 13 months. The effective return on that $3,000 — measured in avoided interest — exceeds 25% on an annualized basis.</p>
            <h3>Example 3: Comparing strategies</h3>
            <p>If you have $200/month to spare, you can either pay it as a recurring extra or save it and apply a $2,400 lump sum at year-end. The recurring approach saves slightly more interest because each dollar reduces principal from the moment it is paid. This calculator lets you model both by toggling the inputs.</p>

            <h2>Tips & Best Practices</h2>
            <ul>
              <li><strong>Confirm prepayment terms first.</strong> Most U.S. consumer loans have no prepayment penalty, but always verify with your lender before sending large payments.</li>
              <li><strong>Apply extras to principal, not next month's payment.</strong> Some servicers default to advancing your due date, which does not save interest. Specify &quot;apply to principal.&quot;</li>
              <li><strong>Build an emergency fund first.</strong> Don't lock every spare dollar into an illiquid loan payoff; keep 3–6 months of expenses accessible.</li>
              <li><strong>Compare APR to investment returns.</strong> If your loan APR is below ~6%, you may earn more investing the cash than paying down the loan — but peace of mind has value too.</li>
              <li><strong>Round up payments.</strong> Rounding a $378 payment up to $400 is painless and saves real money over the life of a loan.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This tool removes the guesswork from extra-payment decisions. Instead of wondering whether $100/month &quot;matters,&quot; you see the exact dollar figure saved and months eliminated. It runs instantly, works for any fixed-rate installment loan, and helps you make confident, math-backed choices about your debt. Used alongside a budget, it can shave years off your path to being debt-free.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/early-loan-payoff-savings-calculator" />
          <PopularCalculators exclude="/calculator/early-loan-payoff-savings-calculator" />
        </div>
      </div>
    </>
  );
};

export default EarlyLoanPayoffSavingsCalculator;
