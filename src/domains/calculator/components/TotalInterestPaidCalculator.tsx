"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface InterestInputs {
  loanAmount: number;
  rate: number;
  years: number;
  extraMonthly: number;
  startMonth: string;
}

const DEFAULTS: InterestInputs = {
  loanAmount: 250000,
  rate: 6.5,
  years: 30,
  extraMonthly: 0,
  startMonth: "2026-01",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function addMonths(startMonth: string, months: number): string {
  const parts = startMonth.split("-");
  const y = Number(parts[0]) || 2026;
  const m = Number(parts[1]) || 1;
  const total = y * 12 + (m - 1) + Math.round(months);
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${MONTHS[nm]} ${ny}`;
}

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

interface InterestResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
  interestSharePct: number;
  extraInterest: number;
  extraMonths: number;
  extraPayoffDate: string;
  valid: boolean;
  errorMsg: string;
}

function computeInterest(i: InterestInputs): InterestResult {
  const invalid = i.loanAmount <= 0 || i.rate < 0 || i.years <= 0 || i.extraMonthly < 0;

  const n = Math.round(i.years * 12);
  const r = i.rate / 100 / 12;
  const monthlyPayment = paymentFor(i.loanAmount, r, n);
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - i.loanAmount;

  // Re-amortise with the extra payment to show the interest saved.
  let bal = i.loanAmount;
  let cum = 0;
  let m = 0;
  while (bal > 0.005 && m < 1500) {
    const int = bal * r;
    let pay = monthlyPayment + i.extraMonthly;
    if (pay > bal + int) pay = bal + int;
    bal -= pay - int;
    cum += int;
    m += 1;
  }

  return {
    monthlyPayment,
    totalInterest,
    totalPaid,
    payoffDate: addMonths(i.startMonth, n),
    interestSharePct: totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0,
    extraInterest: Math.max(0, totalInterest - cum),
    extraMonths: Math.max(0, n - m),
    extraPayoffDate: addMonths(i.startMonth, m),
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive loan amount and term, a non-negative rate, and a non-negative extra payment." : "",
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  hint?: string;
  type?: string;
  min?: string;
  step?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  suffix,
  tooltip,
  hint,
  type = "number",
  min,
  step,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function TotalInterestPaidCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): InterestInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    rate: parseFloat(rate) || 0,
    years: parseFloat(years) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<InterestInputs>(() => DEFAULTS);
  const [results, setResults] = useState<InterestResult>(() => computeInterest(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeInterest(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeInterest(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is total interest on a loan calculated?",
      answer:
        "Total interest is the sum of every interest charge across the life of the loan. It cannot be found by multiplying the rate by the principal, because the balance falls as you repay. Each month the interest charge is the outstanding balance multiplied by the monthly rate, which is the annual rate divided by twelve, and the payment covers that interest first and reduces principal with the remainder. Summing the interest portion of every payment gives the total.",
    },
    {
      question: "Why is total interest so much larger than the loan amount on a long mortgage?",
      answer:
        "Because interest is charged on the balance for as long as it is outstanding. A 30-year loan at 6.5% on $250,000 costs roughly $319,000 in interest, more than the amount borrowed, because the balance falls slowly at first and interest accumulates for three decades. Shortening the term raises the monthly payment but cuts the interest dramatically, which is why a 15-year loan usually costs far less in total despite the bigger instalment.",
    },
    {
      question: "How much does an extra monthly payment save?",
      answer:
        "Every extra dollar goes directly to principal, so it removes all the future interest that dollar would have generated. The saving compounds: a modest extra payment applied from the first month can cut years off the term and tens of thousands from the interest total. This calculator re-amortises the loan with your extra payment so you can see the reduced interest, earlier payoff date and shortened term side by side.",
    },
    {
      question: "Does paying extra early beat paying extra later?",
      answer:
        "Yes, always. Interest is charged on the outstanding balance, so an extra payment made in year one removes more future interest than the same payment made in year ten, because it stops the charge on that principal for longer. If you have a lump sum, applying it at the start of the loan maximises the interest saved, even though the effect on your monthly payment is the same.",
    },
    {
      question: "What is an interest share percentage?",
      answer:
        "It is the proportion of your total payments that goes to interest rather than principal. On a long, high-rate loan the interest share often exceeds fifty percent, meaning more than half of every dollar you pay is rent on the money rather than repayment of it. Watching that figure fall as you shorten the term or add extra payments is the clearest way to judge whether a loan structure is working for you.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Total Interest Paid Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Total Interest Paid Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Principal borrowed."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Fixed annual rate on the loan."
                />
              </div>
            </SubSection>

            <SubSection title="Term">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Amortisation term in years."
                />
                <CompactInput
                  id="start-month"
                  label="First Payment Month"
                  value={startMonth}
                  onChange={setStartMonth}
                  onEnter={runCalculate}
                  type="month"
                  tooltip="Month of the first payment, used to derive the payoff date."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Prepayment">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra"
                        label="Extra Monthly Payment"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional principal paid each month."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Interest share: {fmt(results.interestSharePct, 1)}%
                        </div>
                      </div>
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Interest Paid</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.totalInterest, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.interestSharePct, 1)}% of every dollar paid goes to interest
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Payment</span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPaid, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payoff</span>
                <span className="font-extrabold text-foreground">{results.payoffDate}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Principal</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.loanAmount, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(100 - results.interestSharePct, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.interestSharePct, 1)}%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Paid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalPaid, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.loanAmount, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.rate, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payments</span>
                  <span className="text-base font-bold text-foreground">{Math.round(calcInputs.years * 12)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as % of Loan</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.loanAmount > 0 ? (results.totalInterest / calcInputs.loanAmount) * 100 : 0, 1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved (extra)</span>
                  <span className="text-base font-bold text-primary">${fmt(results.extraInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff with Extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.extraMonths > 0 ? `${results.extraPayoffDate} (${results.extraMonths} mo sooner)` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Total Interest Paid Calculator?</h2>
            <p>
              A total interest paid calculator adds up every interest charge you will make over the life of a loan and
              reports it as a single figure. It answers the question borrowers most often underestimate: not what the
              monthly payment is, but what the loan actually costs. Because interest is charged on the outstanding balance
              every period, the total is far larger than the rate multiplied by the principal, and it grows with both the
              rate and, more powerfully, the term.
            </p>
            <p>
              Seeing the total reframes the decision. Two loans with the same rate but different terms can differ by
              hundreds of thousands of dollars in interest, and an extra payment that looks trivial month to month can
              remove years and tens of thousands from the total. The calculator also reports the interest share, the
              proportion of each dollar paid that is interest rather than principal, which is the most direct measure of
              how expensive a loan structure is.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator first computes the level payment from the amortisation formula
              PMT = P x r / (1 - (1 + r)^-n), where P is the principal, r is the monthly interest rate and n is the number
              of payments. Total paid is that payment multiplied by n, and total interest is total paid minus the
              principal. The interest share is the interest divided by total paid, expressed as a percentage.
            </p>
            <p>
              It then walks the amortisation schedule month by month, splitting each payment into interest and principal,
              to do two things. First, it confirms the total interest by summing the interest column directly. Second, it
              re-runs the schedule with any extra monthly payment you enter, so the interest saved, the term shortened and
              the earlier payoff date are computed from the actual repayment path rather than an approximation.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows total interest with the interest share beneath it, and the three statistics beside it
              give the monthly payment, total paid and payoff date. The breakdown table splits total paid into principal
              and interest with their respective shares, which makes the true cost visible in a single line: on a
              thirty-year mortgage at today&apos;s typical rates the interest share often exceeds half of everything you
              pay.
            </p>
            <p>
              Summary Statistics adds the payment count, the interest expressed as a percentage of the amount borrowed, and,
              when you model an extra payment, the interest saved and the months removed from the term. Treat the numbers
              as a planning estimate that assumes a constant rate and a level payment schedule; adjustable-rate loans,
              bi-weekly payment plans and variable extra payments will change the totals. The most reliable way to reduce
              total interest is to shorten the term or pay extra principal early, because both stop interest from
              accruing on money you no longer owe.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-interest-paid-calculator" />
          <PopularCalculators exclude="/calculator/total-interest-paid-calculator" />
        </div>
      </div>
    </>
  );
}
