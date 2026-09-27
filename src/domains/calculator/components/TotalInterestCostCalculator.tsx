"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DebtInputs {
  balance: number;
  apr: number;
  monthlyPayment: number;
  extraMonthly: number;
  oneTime: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: DebtInputs = {
  balance: 8000,
  apr: 22.99,
  monthlyPayment: 300,
  extraMonthly: 0,
  oneTime: 0,
  startMonth: CURRENT_MONTH,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function addMonths(startMonth: string, months: number): string {
  const parts = startMonth.split("-");
  const y = Number(parts[0]) || now.getFullYear();
  const m = Number(parts[1]) || 1;
  const total = y * 12 + (m - 1) + Math.round(months);
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${MONTHS[nm]} ${ny}`;
}

interface DebtResult {
  totalInterest: number;
  months: number;
  totalPaid: number;
  baselineInterest: number;
  baselineMonths: number;
  interestSaved: number;
  monthsSaved: number;
  interestPer100: number;
  payoffDate: string;
  baselinePayoffDate: string;
  neverPaysOff: boolean;
  valid: boolean;
  errorMsg: string;
}

function simulate(balance: number, r: number, pay: number, oneTime: number) {
  let bal = Math.max(0, balance - oneTime);
  let interest = 0;
  let m = 0;
  let stalled = false;
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    if (pay <= int) {
      stalled = true;
      // Project the capped horizon so the cost of a stalled balance is still visible.
      bal += pay - int;
      interest += int;
      m += 1;
      continue;
    }
    const p = Math.min(pay, bal + int);
    bal -= p - int;
    interest += int;
    m += 1;
  }
  return { interest, months: m, stalled };
}

function computeDebt(i: DebtInputs): DebtResult {
  const invalid = i.balance <= 0 || i.apr < 0 || i.monthlyPayment <= 0 || i.extraMonthly < 0 || i.oneTime < 0;
  const r = i.apr / 100 / 12;

  const base = simulate(i.balance, r, i.monthlyPayment, 0);
  const withExtra = simulate(i.balance, r, i.monthlyPayment + i.extraMonthly, i.oneTime);

  const totalInterest = withExtra.interest;
  const totalPaid = i.balance + totalInterest;

  return {
    totalInterest,
    months: withExtra.months,
    totalPaid,
    baselineInterest: base.interest,
    baselineMonths: base.months,
    interestSaved: Math.max(0, base.interest - totalInterest),
    monthsSaved: Math.max(0, base.months - withExtra.months),
    interestPer100: i.balance > 0 ? (totalInterest / i.balance) * 100 : 0,
    payoffDate: addMonths(i.startMonth, withExtra.months),
    baselinePayoffDate: addMonths(i.startMonth, base.months),
    neverPaysOff: withExtra.stalled || base.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance above zero, a non-negative APR, and a payment above zero."
      : "",
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

export default function TotalInterestCostCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [oneTime, setOneTime] = useState(String(DEFAULTS.oneTime));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DebtInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    oneTime: parseFloat(oneTime) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<DebtInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DebtResult>(() => computeDebt(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDebt(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setOneTime(String(DEFAULTS.oneTime));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeDebt(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is the total interest cost on a carried balance calculated?",
      answer:
        "Interest is charged each month on the outstanding balance at the monthly rate, which is the APR divided by twelve. The payment covers that interest first, and whatever remains reduces the principal. The calculator repeats that step month by month until the balance reaches zero, then sums the interest column. The total is smaller than APR × balance × years would suggest only because the balance falls along the way; for a slow repayment it is still dramatically larger than the amount borrowed.",
    },
    {
      question: "Why does a higher monthly payment reduce total interest so much?",
      answer:
        "A larger payment attacks principal faster, and every dollar of principal removed stops generating interest for all remaining months. The effect compounds: paying $400 instead of $300 on an $8,000 balance at 22.99% can cut the interest bill by more than half and shorten the repayment by years. This is why the payment you choose matters more than almost anything else when carrying revolving debt.",
    },
    {
      question: "What happens if my payment does not cover the interest?",
      answer:
        "The balance grows every month instead of shrinking, a situation called negative amortisation. On a credit card this happens when the minimum payment is below the monthly interest charge, which is possible when a balance is close to the limit and the rate is high. The calculator flags this state and projects the capped horizon cost, but the honest answer is that no schedule pays off a balance whose interest exceeds every payment.",
    },
    {
      question: "Should I pay extra monthly or make a single lump-sum payment?",
      answer:
        "Both reduce interest, but a lump sum paid now is worth more than the same dollars spread over time, because it removes principal earlier and stops interest from accruing on it for longer. A lump sum also cuts the balance immediately, which lowers every future interest charge. Use the one-time payment field to model a bonus or tax refund, and the extra monthly field to model a permanent increase in your payment.",
    },
    {
      question: "Does this calculator include credit card fees and penalties?",
      answer:
        "No — it models pure interest on the balance you enter. Late fees, annual fees, cash advance fees, over-limit fees and penalty APRs are separate costs that can add materially to the true price of carrying debt. If a penalty APR has replaced your normal rate, enter the penalty rate instead, because that is the rate the balance is actually charging you.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Total Interest Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Total Interest Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rate">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Outstanding balance being carried."
                />
                <CompactInput
                  id="apr"
                  label="APR"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Annual percentage rate charged on the balance."
                />
              </div>
            </SubSection>

            <SubSection title="Repayment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="monthly-payment"
                  label="Monthly Payment"
                  value={monthlyPayment}
                  onChange={setMonthlyPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="1"
                  tooltip="Amount paid every month towards the balance."
                />
                <CompactInput
                  id="start-month"
                  label="First Payment Month"
                  value={startMonth}
                  onChange={setStartMonth}
                  onEnter={runCalculate}
                  type="month"
                  tooltip="Month of the first payment, used to derive payoff dates."
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
                  <SubSection title="Extra Payments">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra-monthly"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional amount paid every month."
                      />
                      <CompactInput
                        id="one-time"
                        label="One-Time Payment"
                        value={oneTime}
                        onChange={setOneTime}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="A single lump sum applied to the balance at the start."
                      />
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
            {results.valid && results.neverPaysOff && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Payment too low</div>
                <div className="text-base font-medium text-foreground">
                  The payment does not cover the monthly interest, so the balance never falls. Figures below are
                  projections capped at 100 years — no schedule pays this balance off.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Interest Cost</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.totalInterest, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.interestPer100, 0)} in interest for every $100 of balance carried
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Months to Payoff
                </span>
                <span className="font-extrabold text-foreground">{results.months}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Monthly Payment
                </span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.monthlyPayment + calcInputs.extraMonthly)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPaid, 0)}</span>
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
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Balance (Principal)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.balance, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalPaid > 0 ? (calcInputs.balance / results.totalPaid) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalPaid > 0 ? (results.totalInterest / results.totalPaid) * 100 : 0, 1)}%
                    </td>
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest Without Extras
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.baselineInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest Saved With Extras
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.interestSaved, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Date</span>
                  <span className="text-base font-bold text-foreground">{results.payoffDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved > 0 ? `${results.monthsSaved} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest as % of Balance
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.interestPer100, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payoff Without Extras
                  </span>
                  <span className="text-base font-bold text-foreground">{results.baselinePayoffDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Total Interest Cost Calculator?</h2>
            <p>
              A total interest cost calculator adds up every interest charge you will pay on a carried balance until it
              is fully repaid, and reports the result as a single figure. It answers the question that a monthly payment
              quietly hides: not what you owe today, but what the debt will cost you in total. Because interest is
              charged on the outstanding balance every month, the total depends far more on how long the balance lasts
              than on the size of the balance alone — a modest debt repaid slowly can cost more than a larger debt
              repaid quickly.
            </p>
            <p>
              The figure is most useful as a comparison tool. It lets you see what a higher monthly payment, a lump sum
              from a bonus, or a consolidation to a lower rate would save, and it exposes the trap of minimum payments,
              where the interest share of your money can exceed the principal share for years. On revolving debt such as
              a credit card or a store card, where the APR commonly sits between 20% and 30%, the total interest bill is
              frequently one of the largest numbers in a household budget that nobody ever adds up.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator converts the APR to a monthly rate by dividing it by twelve, then walks the balance forward
              one month at a time. Each month it charges interest on the current balance, applies your payment to that
              interest first, and reduces the principal by whatever is left. It records the interest charge and repeats
              the process until the balance reaches zero, then sums the interest column to produce the total interest
              cost and the total paid.
            </p>
            <p>
              It runs the same simulation twice: once with your stated payment alone to establish a baseline, and again
              with any extra monthly payment or one-time lump sum included. Subtracting the two interest totals gives
              the interest saved by the extras, and subtracting the two payoff durations gives the months removed from
              the schedule. A guard detects the negative-amortisation case where the payment does not cover the monthly
              interest, and reports it rather than pretending the debt can be repaid.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows total interest with the cost per $100 of balance beneath it, which translates the
              total into an intuitive frame: if it reads $80, you are paying eighty dollars of interest for every
              hundred dollars you borrow. The three-stat bar gives the months to payoff, the effective monthly payment
              including extras, and the total amount paid. The breakdown table splits the total paid into principal and
              interest with each component&apos;s share, so the true price of the debt is visible in one row.
            </p>
            <p>
              Summary Statistics compares the interest without extras against the interest with extras, and shows both
              payoff dates side by side, making the value of the extra payment explicit. Treat the results as a planning
              estimate: a constant APR and steady payment schedule are assumed, while real accounts move with the prime
              rate, add fees and penalties, and may carry balances at different rates. The
              most reliable way to cut total interest is to raise the payment — and to raise it early, because principal
              removed in the first months is principal that never generates interest again.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-interest-cost-calculator" />
          <PopularCalculators exclude="/calculator/total-interest-cost-calculator" />
        </div>
      </div>
    </>
  );
}
