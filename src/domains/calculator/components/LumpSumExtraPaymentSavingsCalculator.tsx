"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface LumpSumInputs {
  loanAmount: number;
  rate: number;
  termYears: number;
  lumpSum: number;
  applyMonth: number;
  extraMonthly: number;
}

const DEFAULTS: LumpSumInputs = {
  loanAmount: 300000,
  rate: 6.5,
  termYears: 30,
  lumpSum: 20000,
  applyMonth: 12,
  extraMonthly: 100,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface ScheduleResult {
  months: number;
  interest: number;
  totalPaid: number;
}

function simulate(
  principal: number,
  annualRate: number,
  paymentAmount: number,
  extraMonthly: number,
  lumpSum: number,
  lumpMonth: number,
): ScheduleResult {
  const i = annualRate / 100 / 12;
  const monthly = paymentAmount + extraMonthly;
  let bal = principal;
  let interest = 0;
  let m = 0;

  while (bal > 0.005 && m < 1200) {
    m++;
    if (lumpSum > 0 && m === lumpMonth) bal = Math.max(0, bal - lumpSum);
    if (bal <= 0.005) break;
    const int = bal * i;
    interest += int;
    let principalPart = monthly - int;
    if (principalPart <= 0) {
      return { months: Infinity, interest: Infinity, totalPaid: Infinity };
    }
    if (principalPart > bal) principalPart = bal;
    bal -= principalPart;
  }

  return { months: m, interest, totalPaid: principal + interest };
}

const payoffDate = (months: number) => {
  if (!Number.isFinite(months) || months > 720) return "Beyond 60 years";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(months));
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const yearsMonths = (months: number) => {
  if (!Number.isFinite(months)) return "—";
  const y = Math.floor(months / 12);
  const mo = Math.round(months % 12);
  if (y === 0) return `${mo} mo`;
  return mo === 0 ? `${y} yr` : `${y} yr ${mo} mo`;
};

interface LumpSumResult {
  months: number;
  basePayment: number;
  base: ScheduleResult;
  strategy: ScheduleResult;
  interestSaved: number;
  monthsSaved: number;
  valid: boolean;
  errorMsg: string;
}

function computeLumpSum(i: LumpSumInputs): LumpSumResult {
  const applyMonth = Math.max(1, Math.min(Math.round(i.applyMonth), Math.round(i.termYears * 12)));
  const invalid =
    i.loanAmount <= 0 ||
    i.rate < 0 ||
    i.termYears <= 0 ||
    i.lumpSum < 0 ||
    i.applyMonth < 1 ||
    i.extraMonthly < 0;

  const months = Math.round(i.termYears * 12);
  const basePayment = payment(i.loanAmount, i.rate, months);
  const base = simulate(i.loanAmount, i.rate, basePayment, 0, 0, 0);
  const strategy = simulate(i.loanAmount, i.rate, basePayment, i.extraMonthly, i.lumpSum, applyMonth);

  return {
    months,
    basePayment,
    base,
    strategy,
    interestSaved: base.interest - strategy.interest,
    monthsSaved: base.months - strategy.months,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount and term, a non-negative rate, and a lump sum at or after month one."
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

export default function LumpSumExtraPaymentSavingsCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [lumpSum, setLumpSum] = useState(String(DEFAULTS.lumpSum));
  const [applyMonth, setApplyMonth] = useState(String(DEFAULTS.applyMonth));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): LumpSumInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    lumpSum: parseFloat(lumpSum) || 0,
    applyMonth: parseFloat(applyMonth) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<LumpSumInputs>(() => DEFAULTS);
  const [results, setResults] = useState<LumpSumResult>(() => computeLumpSum(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeLumpSum(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setLumpSum(String(DEFAULTS.lumpSum));
    setApplyMonth(String(DEFAULTS.applyMonth));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setCalcInputs(DEFAULTS);
    setResults(computeLumpSum(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much interest does a lump sum payment save?",
      answer:
        "It depends on three things: how large the lump sum is, when it is applied, and the rate on the loan. Because mortgage interest is charged on the outstanding balance, every dollar of principal removed stops accruing interest for the entire remaining term. A large lump sum applied early in the schedule therefore saves far more than the same amount applied late, which is why timing matters as much as size.",
    },
    {
      question: "Is a lump sum better than higher monthly payments?",
      answer:
        "A lump sum produces its saving immediately by shrinking the balance on which interest is calculated, while extra monthly payments accumulate the same effect gradually. If the cash is genuinely surplus and no better use exists, the lump sum wins because it starts saving from the day it is applied. If liquidity matters, spreading the same total across monthly payments keeps the money available while still reducing interest.",
    },
    {
      question: "Will my lender apply a lump sum to principal automatically?",
      answer:
        "Not always. Many servicers apply a payment smaller than the scheduled amount as a partial prepayment toward the next instalment, which advances the due date but does not reduce the balance. You generally need to instruct the servicer in writing that the amount is to be applied to principal, and you should confirm the balance online afterwards. Applying it to principal is what produces the interest saving and the shorter payoff.",
    },
    {
      question: "Does paying extra shorten the loan or lower the payment?",
      answer:
        "By default it shortens the loan. The scheduled payment stays exactly the same, so every extra dollar goes straight to principal and the balance is retired sooner. Some lenders will instead recast the loan, which re-amortises the reduced balance over the remaining term and lowers the monthly payment. Recasting usually carries a fee and leaves the payoff date unchanged, so it trades time savings for cash flow.",
    },
    {
      question: "Should I invest the lump sum instead of prepaying?",
      answer:
        "Compare the after-tax expected return of the investment with the mortgage rate you would otherwise be avoiding. Prepaying earns a guaranteed, tax-free return equal to the loan rate, which is difficult to beat on a risk-adjusted basis. Investing wins if the expected return clearly exceeds the rate and you are comfortable with the volatility, and splitting the sum between both is a common compromise that preserves some liquidity.",
    },
  ];

  const breakdownRows = [
    {
      label: "Monthly Payment",
      base: money(results.basePayment),
      strategy: money(results.basePayment + calcInputs.extraMonthly),
    },
    {
      label: "Lump Sum Applied",
      base: "—",
      strategy: calcInputs.lumpSum > 0 ? `${money(calcInputs.lumpSum)} @ mo ${Math.round(calcInputs.applyMonth)}` : "—",
    },
    {
      label: "Months to Payoff",
      base: results.base.months >= 1200 ? "—" : String(results.base.months),
      strategy: results.strategy.months >= 1200 ? "—" : String(results.strategy.months),
    },
    {
      label: "Time to Payoff",
      base: yearsMonths(results.base.months),
      strategy: yearsMonths(results.strategy.months),
    },
    {
      label: "Total Interest",
      base: money(results.base.interest),
      strategy: money(results.strategy.interest),
    },
    {
      label: "Total Paid",
      base: money(results.base.totalPaid),
      strategy: money(results.strategy.totalPaid),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Lump Sum Extra Payment Savings Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Lump Sum Extra Payment Savings Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Current Loan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan"
                  label="Loan Balance"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Outstanding principal on the mortgage."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Annual interest rate on the loan."
                />
              </div>
            </SubSection>

            <SubSection title="Payoff Strategy">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="term"
                  label="Remaining Term"
                  value={termYears}
                  onChange={setTermYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  min="1"
                  tooltip="Years left on the amortisation schedule."
                />
                <CompactInput
                  id="lump"
                  label="Lump Sum Payment"
                  value={lumpSum}
                  onChange={setLumpSum}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="One-time principal reduction."
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
                  <SubSection title="Timing & Recurring Extra">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="month"
                        label="Apply at Month"
                        value={applyMonth}
                        onChange={setApplyMonth}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="Month in which the lump sum hits the balance."
                      />
                      <CompactInput
                        id="extra"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional principal paid every month alongside the lump sum."
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

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Interest Saved</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.interestSaved)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(calcInputs.lumpSum)} lump sum at month {Math.round(calcInputs.applyMonth)} &middot;{" "}
                {yearsMonths(results.monthsSaved)} earlier payoff
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Time Saved</span>
                <span className="font-extrabold text-emerald-600">{yearsMonths(results.monthsSaved)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Payoff</span>
                <span className="font-extrabold text-foreground">{payoffDate(results.strategy.months)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest With Lump Sum</span>
                <span className="font-extrabold text-foreground">{money(results.strategy.interest)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 text-right w-[130px]">No Extra</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">With Lump Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.base}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.strategy}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Difference</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{money(results.interestSaved)} saved</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Balance</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.loanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.basePayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lump Sum Applied</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.lumpSum)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Monthly</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.extraMonthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Without Extra</span>
                  <span className="text-base font-bold text-foreground">{money(results.base.interest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest With Lump Sum</span>
                  <span className="text-base font-bold text-primary">{money(results.strategy.interest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.interestSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved >= 1200 ? "—" : Math.round(results.monthsSaved)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Lump Sum Extra Payment Savings Calculator?</h2>
            <p>
              A lump sum extra payment savings calculator shows what happens when a single large principal payment is
              applied to a mortgage, and how much interest and time that payment removes from the schedule. Mortgage
              interest is charged on the outstanding balance, so reducing the balance immediately reduces every future
              interest charge. The difference between the original schedule and the accelerated one is the saving.
            </p>
            <p>
              This is the calculation to run before applying a bonus, an inheritance, or the proceeds from selling another
              asset. The result is rarely intuitive: a twenty thousand dollar payment early in a thirty-year loan can remove
              well over twice that amount in interest, because the saving compounds month after month for the remainder of
              the term. Applying the same payment five years later produces a noticeably smaller benefit.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Saving Is Calculated</h2>
            <p>
              The scheduled payment is first derived from the standard amortisation formula, and the full term is walked
              month by month to total the interest that the original schedule would charge. The same walk is then repeated
              with the lump sum subtracted from the balance in the chosen month, and with any recurring extra monthly payment
              added to each instalment. Interest is accumulated month by month in both runs, and the difference is the
              interest saved.
            </p>
            <p>
              Because the accelerated balance retires sooner, the payoff month arrives earlier and the payoff date moves
              forward accordingly. The calculator reports both the dollar saving and the time saving, along with the
              remaining balance at each stage. Note that a lump sum applied in month one produces the largest possible
              saving, since every dollar removed then avoids interest for the entire remaining term.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports total interest saved, with the lump sum, the month it is applied and the payoff
              acceleration beneath it. The three statistics beside it show the time saved, the new payoff month, and the
              interest that remains with the strategy in place. The breakdown table sets the original schedule against the
              accelerated one across monthly payment, lump sum timing, months to payoff, total interest and total paid.
            </p>
            <p>
              Summary Statistics collects the balance, the scheduled payment, the lump sum, the recurring extra, both
              interest totals and the months saved. Two practical points follow from the figures. First, instruct the
              servicer in writing that the money is to be applied to principal; otherwise it may simply be treated as an
              early instalment and the balance will not fall. Second, check whether your note carries a prepayment penalty,
              because a large principal reduction inside the penalty window can trigger a fee that offsets part of the
              saving.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lump-sum-extra-payment-savings-calculator" />
          <PopularCalculators exclude="/calculator/lump-sum-extra-payment-savings-calculator" />
        </div>
      </div>
    </>
  );
}
