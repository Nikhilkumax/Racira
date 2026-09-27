"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ArmInputs {
  loanAmount: number;
  fixedRate: number;
  armStartRate: number;
  fixedPeriod: number;
  termYears: number;
  indexRate: number;
  margin: number;
  adjustmentYears: number;
  periodicCap: number;
  lifetimeCap: number;
  holdYears: number;
}

const DEFAULTS: ArmInputs = {
  loanAmount: 400000,
  fixedRate: 6.5,
  armStartRate: 5.5,
  fixedPeriod: 5,
  termYears: 30,
  indexRate: 4.25,
  margin: 2.75,
  adjustmentYears: 1,
  periodicCap: 2,
  lifetimeCap: 5,
  holdYears: 7,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const duration = (months: number) => {
  const m = Math.max(0, Math.round(months));
  if (m <= 0) return "now";
  if (m < 12) return `${m} mo`;
  return `${Math.floor(m / 12)} yr ${m % 12} mo`;
};

/** Standard amortising payment for a constant rate. */
function payment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRatePct / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface RateSegment {
  year: number;
  rate: number;
  payment: number;
  balance: number;
}

interface Run {
  segments: RateSegment[];
  cumPaid: number[];
  cumBalance: number[];
  totalPaid: number;
  totalInterest: number;
  maxRate: number;
  maxPayment: number;
  firstResetPayment: number;
  firstResetRate: number;
  segmentRows: RateSegment[];
}

/**
 * Month-by-month amortisation. The ARM re-prices the outstanding balance over the
 * remaining term at each adjustment date, applying the periodic cap and the
 * lifetime ceiling to the fully indexed rate (index + margin).
 */
function runLoan(i: ArmInputs, arm: boolean, pinAtCap = false): Run {
  const termMonths = Math.max(1, Math.round(i.termYears * 12));
  const fixedMonths = Math.max(0, Math.round(i.fixedPeriod * 12));
  const adjustMonths = Math.max(1, Math.round(i.adjustmentYears * 12));
  const lifetimeCeiling = i.armStartRate + i.lifetimeCap;

  let balance = Math.max(0, i.loanAmount);
  let rate = arm ? i.armStartRate : i.fixedRate;
  let pay = payment(balance, rate, termMonths);
  let interestTotal = 0;
  const cumPaid: number[] = [0];
  const cumBalance: number[] = [balance];
  const segmentRows: RateSegment[] = [
    { year: 0, rate, payment: pay, balance },
  ];
  let firstResetRate = 0;
  let firstResetPayment = 0;
  let maxRate = rate;
  let maxPayment = pay;
  const firstPayment = pay;

  for (let month = 1; month <= termMonths; month++) {
    if (arm && month > fixedMonths && (month - fixedMonths - 1) % adjustMonths === 0) {
      const remaining = termMonths - (month - 1);
      let candidate = i.indexRate + i.margin;
      if (pinAtCap) {
        candidate = lifetimeCeiling;
      } else {
        candidate = Math.min(Math.max(candidate, rate - i.periodicCap), rate + i.periodicCap);
        candidate = Math.min(candidate, lifetimeCeiling);
      }
      rate = Math.max(0, candidate);
      pay = payment(balance, rate, remaining);
      if (firstResetRate === 0) {
        firstResetRate = rate;
        firstResetPayment = pay;
      }
      segmentRows.push({ year: Math.round((month - 1) / 12), rate, payment: pay, balance });
    }

    const interest = balance * (rate / 100 / 12);
    let principalPaid = pay - interest;
    if (principalPaid > balance) principalPaid = balance;
    interestTotal += interest;
    balance = Math.max(0, balance - principalPaid);
    cumPaid.push(cumPaid[month - 1] + principalPaid + interest);
    cumBalance.push(balance);
    maxRate = Math.max(maxRate, rate);
    maxPayment = Math.max(maxPayment, pay);
    if (balance <= 0.005) {
      for (let k = month + 1; k <= termMonths; k++) {
        cumPaid.push(cumPaid[month]);
        cumBalance.push(0);
      }
      break;
    }
  }

  const finalPaid = cumPaid[cumPaid.length - 1];
  return {
    segments: segmentRows,
    cumPaid,
    cumBalance,
    totalPaid: finalPaid,
    totalInterest: interestTotal,
    maxRate,
    maxPayment,
    firstResetPayment: firstResetPayment || firstPayment,
    firstResetRate: firstResetRate || i.armStartRate,
    segmentRows,
  };
}

interface ArmResult {
  fixedPayment: number;
  armPayment: number;
  monthlySaving: number;
  breakEvenMonth: number;
  breakEvenLabel: string;
  armCheaperAtHold: boolean;
  cumulativeAtFixedPeriod: number;
  holdFixedPaid: number;
  holdArmPaid: number;
  holdAdvantage: number;
  fixedBalanceAtHold: number;
  armBalanceAtHold: number;
  fixedInterest: number;
  armInterest: number;
  fixedPaid: number;
  armPaid: number;
  lifetimeAdvantage: number;
  worstInterest: number;
  worstPayment: number;
  cappedRate: number;
  firstResetRate: number;
  firstResetPayment: number;
  paymentShock: number;
  rows: { year: number; armRate: number; armPayment: number; fixedPayment: number; cumulative: number }[];
  valid: boolean;
  errorMsg: string;
}

function computeArm(i: ArmInputs): ArmResult {
  const fixed = runLoan(i, false);
  const arm = runLoan(i, true);
  const worst = runLoan(i, true, true);
  const termMonths = Math.max(1, Math.round(i.termYears * 12));
  const holdMonths = Math.min(termMonths, Math.max(0, Math.round(i.holdYears * 12)));

  const fixedPayment = payment(i.loanAmount, i.fixedRate, termMonths);
  const armPayment = payment(i.loanAmount, i.armStartRate, termMonths);

  // Break-even: the first month at which the fixed loan's cumulative payments stop
  // exceeding the ARM's. Before it the ARM is cheaper, after it the fixed rate wins.
  let breakEvenMonth = 0;
  for (let m = 1; m <= termMonths; m++) {
    const f = fixed.cumPaid[m] ?? fixed.cumPaid[fixed.cumPaid.length - 1];
    const a = arm.cumPaid[m] ?? arm.cumPaid[arm.cumPaid.length - 1];
    if (f <= a) {
      breakEvenMonth = m;
      break;
    }
  }

  const holdFixedPaid = fixed.cumPaid[holdMonths] ?? fixed.totalPaid;
  const holdArmPaid = arm.cumPaid[holdMonths] ?? arm.totalPaid;
  const fixedBalanceAtHold = fixed.cumBalance[holdMonths] ?? 0;
  const armBalanceAtHold = arm.cumBalance[holdMonths] ?? 0;
  const fixedPeriodMonths = Math.min(termMonths, Math.max(0, Math.round(i.fixedPeriod * 12)));
  const cumulativeAtFixedPeriod =
    (fixed.cumPaid[fixedPeriodMonths] ?? fixed.totalPaid) - (arm.cumPaid[fixedPeriodMonths] ?? arm.totalPaid);

  const rows = arm.segmentRows
    .filter((s) => s.year > 0)
    .map((s) => {
      const month = s.year * 12;
      const cum = (arm.cumPaid[month] ?? arm.totalPaid) - (fixed.cumPaid[month] ?? fixed.totalPaid);
      return {
        year: s.year,
        armRate: s.rate,
        armPayment: s.payment,
        fixedPayment,
        cumulative: cum,
      };
    });

  const invalid =
    i.loanAmount <= 0 ||
    i.fixedRate <= 0 ||
    i.armStartRate <= 0 ||
    i.termYears <= 0 ||
    i.fixedPeriod < 0 ||
    i.indexRate < 0 ||
    i.margin < 0 ||
    i.adjustmentYears <= 0 ||
    i.periodicCap < 0 ||
    i.lifetimeCap < 0 ||
    i.holdYears <= 0 ||
    i.fixedPeriod > i.termYears;
  const errorMsg = invalid
    ? "Enter a positive loan amount, term, fixed rate and start rate, with a fixed period shorter than the term, and non-negative index, margin and caps."
    : "";

  return {
    fixedPayment,
    armPayment,
    monthlySaving: fixedPayment - armPayment,
    breakEvenMonth,
    breakEvenLabel: breakEvenMonth > 0 ? duration(breakEvenMonth) : `beyond ${i.termYears} years`,
    armCheaperAtHold: holdArmPaid < holdFixedPaid,
    cumulativeAtFixedPeriod,
    holdFixedPaid,
    holdArmPaid,
    holdAdvantage: holdFixedPaid - holdArmPaid,
    fixedBalanceAtHold,
    armBalanceAtHold,
    fixedInterest: fixed.totalInterest,
    armInterest: arm.totalInterest,
    fixedPaid: fixed.totalPaid,
    armPaid: arm.totalPaid,
    lifetimeAdvantage: fixed.totalPaid - arm.totalPaid,
    worstInterest: worst.totalInterest,
    worstPayment: worst.maxPayment,
    cappedRate: i.armStartRate + i.lifetimeCap,
    firstResetRate: arm.firstResetRate,
    firstResetPayment: arm.firstResetPayment,
    paymentShock: armPayment > 0 ? ((arm.firstResetPayment - armPayment) / armPayment) * 100 : 0,
    rows,
    valid: !invalid,
    errorMsg,
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
  type?: string;
  min?: string;
  max?: string;
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
  type = "number",
  min,
  max,
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
        max={max}
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ArmVsFixedRateComparisonCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [fixedRate, setFixedRate] = useState(String(DEFAULTS.fixedRate));
  const [armStartRate, setArmStartRate] = useState(String(DEFAULTS.armStartRate));
  const [fixedPeriod, setFixedPeriod] = useState(String(DEFAULTS.fixedPeriod));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [indexRate, setIndexRate] = useState(String(DEFAULTS.indexRate));
  const [margin, setMargin] = useState(String(DEFAULTS.margin));
  const [adjustmentYears, setAdjustmentYears] = useState(String(DEFAULTS.adjustmentYears));
  const [periodicCap, setPeriodicCap] = useState(String(DEFAULTS.periodicCap));
  const [lifetimeCap, setLifetimeCap] = useState(String(DEFAULTS.lifetimeCap));
  const [holdYears, setHoldYears] = useState(String(DEFAULTS.holdYears));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ArmInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    fixedRate: parseFloat(fixedRate) || 0,
    armStartRate: parseFloat(armStartRate) || 0,
    fixedPeriod: parseFloat(fixedPeriod) || 0,
    termYears: parseFloat(termYears) || 0,
    indexRate: parseFloat(indexRate) || 0,
    margin: parseFloat(margin) || 0,
    adjustmentYears: parseFloat(adjustmentYears) || 0,
    periodicCap: parseFloat(periodicCap) || 0,
    lifetimeCap: parseFloat(lifetimeCap) || 0,
    holdYears: parseFloat(holdYears) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ArmInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ArmResult>(() => computeArm(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeArm(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setFixedRate(String(DEFAULTS.fixedRate));
    setArmStartRate(String(DEFAULTS.armStartRate));
    setFixedPeriod(String(DEFAULTS.fixedPeriod));
    setTermYears(String(DEFAULTS.termYears));
    setIndexRate(String(DEFAULTS.indexRate));
    setMargin(String(DEFAULTS.margin));
    setAdjustmentYears(String(DEFAULTS.adjustmentYears));
    setPeriodicCap(String(DEFAULTS.periodicCap));
    setLifetimeCap(String(DEFAULTS.lifetimeCap));
    setHoldYears(String(DEFAULTS.holdYears));
    setCalcInputs(DEFAULTS);
    setResults(computeArm(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is an ARM versus fixed rate comparison?",
      answer:
        "It prices the same loan amount on two contracts: a fixed rate that never changes, and an adjustable rate mortgage that starts below it and then re-prices against an index. The comparison answers one question — how long do you have to keep the loan before the certainty of the fixed rate is worth more than the discount the ARM gave you at the start?",
    },
    {
      question: "How is the fully indexed rate worked out?",
      answer:
        "The fully indexed rate is the index value plus the lender's margin. If the index is 4.25 percent and the margin is 2.75 percent, the loan re-prices towards 7.00 percent at its first adjustment. Caps then limit how fast it gets there: a 2 percent periodic cap holds the first move to two points, and the lifetime ceiling, usually the start rate plus five points, sets the absolute maximum.",
    },
    {
      question: "What is payment shock?",
      answer:
        "Payment shock is the jump in your monthly payment at the first adjustment. On a 5/1 ARM the payment is recalculated over the remaining term at the new rate, so both a higher rate and a shorter amortisation period push the figure up. The calculator reports the first reset payment and the percentage rise against the start payment.",
    },
    {
      question: "Should I use the break-even month?",
      answer:
        "Yes, as a discipline test rather than a prediction. If you are confident of staying in the home and keeping the loan for less time than the break-even month, the ARM is the cheaper contract on the assumptions you entered. If your plans are uncertain, the fixed rate buys certainty for exactly the period where the model is least reliable.",
    },
    {
      question: "Why does the ARM lose over a full term?",
      answer:
        "Because the discount at the start is small relative to the years that remain. A rate that resets upward compounds against a much larger balance than the one the discount was applied to. That is why the projection includes a worst case with the rate pinned at the lifetime ceiling: it shows the cost of the contract at its contractual limit rather than at a forecast of the index.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "ARM vs Fixed Rate Comparison Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          ARM vs Fixed Rate Comparison Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="The Loan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The amount financed, after your down payment."
                />
                <CompactInput
                  id="term"
                  label="Loan Term"
                  value={termYears}
                  onChange={setTermYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  step="1"
                  tooltip="Amortisation period. Both contracts are compared over the same term."
                />
              </div>
            </SubSection>

            <SubSection title="Rate Options">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="fixed-rate"
                  label="Fixed Rate"
                  value={fixedRate}
                  onChange={setFixedRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="The rate on the fixed contract, held constant for the whole term."
                />
                <CompactInput
                  id="arm-start"
                  label="ARM Start Rate"
                  value={armStartRate}
                  onChange={setArmStartRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="The introductory ARM rate, fixed for the initial period."
                />
                <CompactInput
                  id="fixed-period"
                  label="Fixed Period"
                  value={fixedPeriod}
                  onChange={setFixedPeriod}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="0"
                  step="1"
                  tooltip="Years before the ARM first adjusts. A 5/1 ARM has a five year fixed period."
                />
                <CompactInput
                  id="hold-years"
                  label="Hold Period"
                  value={holdYears}
                  onChange={setHoldYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  step="1"
                  tooltip="How long you expect to keep the loan. Costs are compared over this window."
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
                  <SubSection title="Index and Margin">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="index"
                        label="Index Rate"
                        value={indexRate}
                        onChange={setIndexRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.05"
                        tooltip="The reference rate the ARM tracks. Edit it to match your lender's index."
                      />
                      <CompactInput
                        id="margin"
                        label="Margin"
                        value={margin}
                        onChange={setMargin}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.125"
                        tooltip="The lender's fixed add-on. Index plus margin is the fully indexed rate."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Caps and Interval">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="adjustment"
                        label="Adjust Every"
                        value={adjustmentYears}
                        onChange={setAdjustmentYears}
                        onEnter={runCalculate}
                        suffix="yr"
                        min="1"
                        step="1"
                        tooltip="Years between adjustments after the fixed period ends."
                      />
                      <CompactInput
                        id="periodic-cap"
                        label="Periodic Cap"
                        value={periodicCap}
                        onChange={setPeriodicCap}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.5"
                        tooltip="Maximum change in rate at each single adjustment."
                      />
                      <CompactInput
                        id="lifetime-cap"
                        label="Lifetime Cap"
                        value={lifetimeCap}
                        onChange={setLifetimeCap}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.5"
                        tooltip="Points above the start rate the loan can never exceed."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      At every adjustment the outstanding balance is re-amortised over the months remaining, so the payment
                      reflects both the new rate and the shorter repayment window. The first adjustment moves towards index plus
                      margin but is limited by the periodic cap; later adjustments are limited by the same cap and by the
                      lifetime ceiling.
                    </p>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Break-Even Point</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{results.breakEvenLabel}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.monthlySaving >= 0
                  ? `${money2(results.monthlySaving)}/mo cheaper on the ARM at the start`
                  : `${money2(Math.abs(results.monthlySaving))}/mo more expensive on the ARM`}
                {results.breakEvenMonth > 0 ? " · fixed rate wins after that" : ""}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  ARM Payment
                </span>
                <span className="font-extrabold text-foreground">{money2(results.armPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Fixed Payment
                </span>
                <span className="font-extrabold text-foreground">{money2(results.fixedPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  After Fixed Period
                </span>
                <span
                  className={`font-extrabold ${results.paymentShock > 5 ? "text-destructive" : "text-foreground"}`}
                >
                  {fmt(results.firstResetRate, 3)}% ({results.paymentShock >= 0 ? "+" : "−"}
                  {fmt(Math.abs(results.paymentShock), 1)}%)
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">After Year</th>
                    <th className="p-2.5 text-right w-[90px]">ARM Rate</th>
                    <th className="p-2.5 text-right w-[110px]">ARM Payment</th>
                    <th className="p-2.5 text-right w-[110px]">Fixed Payment</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">ARM Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Start</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.armStartRate, 3)}%</td>
                    <td className="p-2.5 text-right text-foreground">{money2(results.armPayment)}</td>
                    <td className="p-2.5 text-right text-foreground">{money2(results.fixedPayment)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {money(results.cumulativeAtFixedPeriod)}
                    </td>
                  </tr>
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.armRate, 3)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.armPayment)}</td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.fixedPayment)}</td>
                      <td
                        className={`p-2.5 pr-3 text-right font-semibold ${
                          row.cumulative > 0 ? "text-emerald-600" : "text-destructive"
                        }`}
                      >
                        {row.cumulative > 0 ? "" : "−"}
                        {money(Math.abs(row.cumulative))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Amount</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.loanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Term</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.termYears} years</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fixed Rate Payment</span>
                  <span className="text-base font-bold text-foreground">{money2(results.fixedPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ARM Start Payment</span>
                  <span className="text-base font-bold text-foreground">{money2(results.armPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fully Indexed Rate</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.indexRate + calcInputs.margin, 3)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Reset Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.firstResetRate, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Reset Payment</span>
                  <span className="text-base font-bold text-destructive">{money2(results.firstResetPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maximum ARM Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.cappedRate, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost Over {calcInputs.holdYears} Years (Fixed)
                  </span>
                  <span className="text-base font-bold text-foreground">{money(results.holdFixedPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost Over {calcInputs.holdYears} Years (ARM)
                  </span>
                  <span className="text-base font-bold text-foreground">{money(results.holdArmPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Advantage at Hold</span>
                  <span className={`text-base font-bold ${results.holdAdvantage >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {results.holdAdvantage >= 0 ? "ARM " : "Fixed "}
                    {money(Math.abs(results.holdAdvantage))}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-Even Month</span>
                  <span className="text-base font-bold text-foreground">
                    {results.breakEvenMonth > 0 ? `Month ${results.breakEvenMonth}` : "None"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest, Fixed</span>
                  <span className="text-base font-bold text-foreground">{money(results.fixedInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest, ARM</span>
                  <span className="text-base font-bold text-foreground">{money(results.armInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lifetime Difference</span>
                  <span className={`text-base font-bold ${results.lifetimeAdvantage >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {results.lifetimeAdvantage >= 0 ? "ARM " : "Fixed "}
                    {money(Math.abs(results.lifetimeAdvantage))}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Worst Case Payment</span>
                  <span className="text-base font-bold text-destructive">{money2(results.worstPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Worst Case Interest</span>
                  <span className="text-base font-bold text-destructive">{money(results.worstInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance at Hold (Fixed)</span>
                  <span className="text-base font-bold text-foreground">{money(results.fixedBalanceAtHold)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance at Hold (ARM)</span>
                  <span className="text-base font-bold text-foreground">{money(results.armBalanceAtHold)}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Index Assumption (Static Default)
                  </span>
                  <span className="text-base font-bold text-foreground">
                    Index {fmt(calcInputs.indexRate, 2)}% + margin {fmt(calcInputs.margin, 2)}% ={" "}
                    {fmt(calcInputs.indexRate + calcInputs.margin, 2)}% fully indexed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an ARM vs Fixed Rate Comparison Calculator?</h2>
            <p>
              An ARM versus fixed rate comparison calculator prices the same loan amount under two contracts. The fixed rate
              agreement holds one interest rate for the entire term, so the payment never changes. The adjustable rate mortgage
              begins below that rate for a set period, commonly three, five, seven or ten years, and then re-prices against a
              published index plus the lender&apos;s margin.
            </p>
            <p>
              The trade is simple to describe and hard to judge. The ARM hands you a lower payment now in exchange for
              uncertainty later; the fixed rate hands you a higher payment now in exchange for certainty for decades. What
              decides which wins is not the size of the opening discount but how long you actually keep the loan, which is why
              the calculator reports the month at which the two contracts cross over.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Both loans are amortised month by month from the same principal over the same term, so the only differences are
              the rate path and the payment resets. The fixed contract uses the standard amortising payment formula: the
              principal multiplied by the periodic rate, divided by one minus one plus the periodic rate raised to the power
              of the negative number of payments remaining.
            </p>
            <p>
              The ARM starts on its discounted rate, then at each adjustment date the outstanding balance is re-amortised over
              the months that remain. The target rate is the index plus the margin, but it cannot move by more than the
              periodic cap in a single adjustment, and it can never exceed the start rate plus the lifetime cap. If the index
              sits below where the loan already is, the same cap limits how far the rate can fall, which is why a capped
              downward move can leave the payment above the market rate.
            </p>
            <p>
              Two cumulative payment streams are then compared. The break-even month is the first month at which the fixed
              loan has charged less in total than the ARM has, meaning the discount has been fully given back. A third
              projection pins the rate at the lifetime ceiling from the first adjustment onward and re-runs the schedule, which
              produces the contractual worst case rather than a forecast of where the index will go.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the break-even point, the month at which the fixed rate overtakes the ARM on cumulative cost,
              with the monthly saving the ARM delivers at the outset underneath. The three statistics beside it show the ARM
              start payment, the fixed payment and the first reset rate with the size of the payment shock it causes.
            </p>
            <p>
              The breakdown table walks the adjustment dates year by year, showing the rate that applies, the recalculated ARM
              payment, the unchanged fixed payment and the cumulative advantage one contract holds over the other at that
              point. Summary Statistics collects the fully indexed rate, the first reset rate and payment, the maximum rate the
              contract allows, the total cost of each loan over the holding period you entered, the break-even month, the
              lifetime interest for each and the worst-case payment and interest with the rate pinned at the cap.
            </p>
            <p className="text-sm text-muted-foreground italic mt-4">
              The index value is a static default rather than a live quote, because no external data is fetched. Edit it to
              match the index your lender uses, such as the Secured Overnight Financing Rate or the one year Constant Maturity
              Treasury, and re-run the projection; the caps and margin carry more weight than the index assumption does in the
              early years, but over a full term the index path dominates.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/arm-vs-fixed-rate-comparison-calculator" />
          <PopularCalculators exclude="/calculator/arm-vs-fixed-rate-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
