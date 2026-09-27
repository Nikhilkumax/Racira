"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type SolveMode = "term" | "principal" | "rate";

interface ReverseInputs {
  loanAmount: number;
  annualRate: number;
  payment: number;
  termMonths: number;
  extra: number;
  annualIncrease: number;
  startMonth: number;
  startYear: number;
}

const DEFAULTS: ReverseInputs = {
  loanAmount: 25000,
  annualRate: 9.5,
  payment: 520,
  termMonths: 60,
  extra: 0,
  annualIncrease: 0,
  startMonth: 9,
  startYear: 2026,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const duration = (months: number) => {
  const m = Math.max(0, Math.round(months));
  if (m < 12) return `${m} mo`;
  return `${Math.floor(m / 12)} yr ${m % 12} mo`;
};

/** The level payment that amortises principal over months at a monthly rate. */
function levelPayment(principal: number, monthlyRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/** Exact number of payments for a level payment, or Infinity if it never clears. */
function paymentsFor(principal: number, monthlyRate: number, payment: number): number {
  if (principal <= 0 || payment <= 0) return Infinity;
  if (monthlyRate <= 0) return principal / payment;
  const first = monthlyRate * principal;
  if (payment <= first) return Infinity;
  return -Math.log(1 - first / payment) / Math.log(1 + monthlyRate);
}

interface YearRow {
  year: number;
  paid: number;
  interest: number;
  principal: number;
  balance: number;
}

interface SimResult {
  months: number;
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
  finalPayment: number;
  neverPaysOff: boolean;
  rows: YearRow[];
}

/**
 * Month-by-month projection. The payment can step up once a year by the annual
 * increase percentage, and any extra monthly amount is added on top of the step.
 */
function simulate(i: ReverseInputs, principal: number, monthlyRate: number, basePayment: number, extra: number): SimResult {
  const rows: YearRow[] = [];
  let balance = Math.max(0, principal);
  let payment = basePayment;
  let totalPaid = 0;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let month = 0;
  let yearPaid = 0;
  let yearInterest = 0;
  let yearPrincipal = 0;
  let finalPayment = 0;
  let neverPaysOff = false;

  const hardStop = 1200;
  while (balance > 0.005 && month < hardStop) {
    if (month > 0 && month % 12 === 0) {
      payment = payment * (1 + Math.max(0, i.annualIncrease) / 100);
      rows.push({
        year: month / 12,
        paid: yearPaid,
        interest: yearInterest,
        principal: yearPrincipal,
        balance,
      });
      yearPaid = 0;
      yearInterest = 0;
      yearPrincipal = 0;
    }
    month++;

    const interest = balance * monthlyRate;
    let pay = payment + extra;
    if (pay > balance + interest) pay = balance + interest;
    const principalPaid = Math.max(0, pay - interest);
    totalInterest += interest;
    totalPrincipal += principalPaid;
    totalPaid += pay;
    balance = Math.max(0, balance + interest - pay);
    yearPaid += pay;
    yearInterest += interest;
    yearPrincipal += principalPaid;
    finalPayment = pay;
    if (balance <= 0.005) break;
  }

  rows.push({
    year: Math.max(1, Math.ceil(month / 12)),
    paid: yearPaid,
    interest: yearInterest,
    principal: yearPrincipal,
    balance,
  });

  // A payment that never overtakes the interest charge leaves a balance standing
  // after the full simulation horizon; that is reported as never clearing.
  if (balance > 0.005) neverPaysOff = true;

  return {
    months: month,
    totalPaid,
    totalInterest,
    totalPrincipal,
    finalPayment,
    neverPaysOff,
    rows: rows.filter((r) => r.paid > 0 || r.balance > 0),
  };
}

interface ReverseResult {
  mode: SolveMode;
  principal: number;
  solvedValue: number;
  solvedLabel: string;
  solvedDisplay: string;
  monthlyRate: number;
  nominalRate: number;
  effectiveRate: number;
  payment: number;
  extra: number;
  months: number;
  termLabel: string;
  payoffDate: string;
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
  interestShare: number;
  finalPayment: number;
  baselineMonths: number;
  monthsSaved: number;
  baselineInterest: number;
  interestSaved: number;
  neverPaysOff: boolean;
  rows: YearRow[];
  valid: boolean;
  errorMsg: string;
  solveNote: string;
}

function computeReverse(i: ReverseInputs, mode: SolveMode): ReverseResult {
  const startMonth = Math.min(12, Math.max(1, Math.round(i.startMonth)));
  const startYear = Math.round(i.startYear);

  let principal = Math.max(0, i.loanAmount);
  let monthlyRate = Math.max(0, i.annualRate) / 100 / 12;
  let payment = Math.max(0, i.payment);
  let months = Math.max(1, Math.round(i.termMonths));
  let solveNote = "";
  let solvedLabel = "";
  let solvedDisplay = "";
  let solvedValue = 0;

  if (mode === "term") {
    const n = paymentsFor(principal, monthlyRate, payment + Math.max(0, i.extra));
    if (!Number.isFinite(n)) {
      months = 0;
      solvedLabel = "Payoff Term";
      solvedDisplay = "Never clears";
      solvedValue = 0;
      solveNote = "The payment does not cover the monthly interest, so the balance never falls.";
    } else {
      months = Math.max(1, Math.ceil(n - 1e-9));
      solvedLabel = "Payoff Term";
      solvedValue = months;
      solvedDisplay = duration(months);
      solveNote = `Solved for the payment required: ${money2(payment)} (in arrears), with ${money2(
        Math.max(0, i.extra)
      )} extra each month.`;
    }
  } else if (mode === "principal") {
    principal = Math.max(0, levelPayment(Math.max(0, i.payment + Math.max(0, i.extra)), monthlyRate, months));
    solvedLabel = "Loan Principal";
    solvedValue = principal;
    solvedDisplay = money2(principal);
    solveNote = `Solved for the principal that ${money2(payment)} plus ${money2(
      Math.max(0, i.extra)
    )} extra clears in ${months} payments at ${fmt(i.annualRate, 3)}%.`;
  } else {
    // Bisection on the monthly rate: annuity payment is strictly increasing in the
    // rate, so the sign of (payment for rate) minus (target payment) changes once.
    const target = payment + Math.max(0, i.extra);
    let lo = 1e-9;
    let hi = 0.1;
    const f = (r: number) => levelPayment(principal, r, months) - target;
    if (f(lo) > 0) {
      solveNote = "The payment is too small to amortise this principal over the term at any rate, so the rate cannot be solved.";
      solvedLabel = "Interest Rate";
      solvedValue = 0;
      solvedDisplay = "No solution";
      monthlyRate = 0;
    } else if (f(hi) < 0) {
      solveNote = "The implied rate is above 120% a year, which is outside the range this tool solves.";
      solvedLabel = "Interest Rate";
      solvedValue = 0;
      solvedDisplay = "Above range";
      monthlyRate = 0;
    } else {
      for (let iter = 0; iter < 200; iter++) {
        const mid = (lo + hi) / 2;
        if (f(mid) > 0) hi = mid;
        else lo = mid;
      }
      monthlyRate = (lo + hi) / 2;
      solvedValue = monthlyRate * 12 * 100;
      solvedLabel = "Interest Rate";
      solvedDisplay = fmt(solvedValue, 3) + "%";
      solveNote = `Solved for the annual rate that makes ${money2(target)} clear ${money(principal)} over ${months} payments.`;
    }
  }

  const run = simulate(i, principal, monthlyRate, mode === "principal" ? payment + Math.max(0, i.extra) : payment, mode === "principal" ? 0 : Math.max(0, i.extra));
  const baseline = simulate(i, principal, monthlyRate, mode === "principal" ? payment + Math.max(0, i.extra) : payment, 0);

  const effMonths = run.neverPaysOff ? 0 : run.months;
  const totalMonthsForDate = run.neverPaysOff ? 0 : run.months;
  const dateMonth = (startMonth - 1 + totalMonthsForDate) % 12;
  const dateYear = startYear + Math.floor((startMonth - 1 + totalMonthsForDate) / 12);
  const payoffDate = run.neverPaysOff ? "Never" : `${MONTHS[dateMonth]} ${dateYear}`;

  const nominalRate = monthlyRate * 12 * 100;
  const effectiveRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;

  const invalid =
    i.loanAmount <= 0 ||
    i.annualRate < 0 ||
    i.payment <= 0 ||
    i.termMonths <= 0 ||
    i.extra < 0 ||
    i.annualIncrease < 0 ||
    i.startMonth < 1 ||
    i.startMonth > 12 ||
    i.startYear < 1900 ||
    i.startYear > 2200;
  const errorMsg = invalid
    ? "Enter a positive principal, payment and term, a start month between 1 and 12, and non-negative rate, extra payment and annual increase."
    : "";

  return {
    mode,
    principal,
    solvedValue,
    solvedLabel,
    solvedDisplay,
    monthlyRate,
    nominalRate,
    effectiveRate,
    payment,
    extra: Math.max(0, i.extra),
    months: effMonths,
    termLabel: run.neverPaysOff ? "Never clears" : duration(run.months),
    payoffDate,
    totalPaid: run.totalPaid,
    totalInterest: run.totalInterest,
    totalPrincipal: run.totalPrincipal,
    interestShare: principal > 0 ? (run.totalInterest / principal) * 100 : 0,
    finalPayment: run.finalPayment,
    baselineMonths: baseline.neverPaysOff ? 0 : baseline.months,
    monthsSaved: baseline.neverPaysOff ? 0 : Math.max(0, baseline.months - run.months),
    baselineInterest: baseline.totalInterest,
    interestSaved: Math.max(0, baseline.totalInterest - run.totalInterest),
    neverPaysOff: run.neverPaysOff,
    rows: run.rows,
    valid: !invalid,
    errorMsg,
    solveNote,
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ReverseAmortizationCalculator() {
  const [mode, setMode] = useState<SolveMode>("term");
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [annualRate, setAnnualRate] = useState(String(DEFAULTS.annualRate));
  const [payment, setPayment] = useState(String(DEFAULTS.payment));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [extra, setExtra] = useState(String(DEFAULTS.extra));
  const [annualIncrease, setAnnualIncrease] = useState(String(DEFAULTS.annualIncrease));
  const [startMonth, setStartMonth] = useState(String(DEFAULTS.startMonth));
  const [startYear, setStartYear] = useState(String(DEFAULTS.startYear));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ReverseInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    annualRate: parseFloat(annualRate) || 0,
    payment: parseFloat(payment) || 0,
    termMonths: parseFloat(termMonths) || 0,
    extra: parseFloat(extra) || 0,
    annualIncrease: parseFloat(annualIncrease) || 0,
    startMonth: parseFloat(startMonth) || 1,
    startYear: parseFloat(startYear) || 2026,
  });

  const [calcInputs, setCalcInputs] = useState<ReverseInputs>(() => DEFAULTS);
  const [calcMode, setCalcMode] = useState<SolveMode>("term");
  const [results, setResults] = useState<ReverseResult>(() => computeReverse(DEFAULTS, "term"));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setCalcMode(mode);
    setResults(computeReverse(inputs, mode));
  };

  const reset = () => {
    setMode("term");
    setLoanAmount(String(DEFAULTS.loanAmount));
    setAnnualRate(String(DEFAULTS.annualRate));
    setPayment(String(DEFAULTS.payment));
    setTermMonths(String(DEFAULTS.termMonths));
    setExtra(String(DEFAULTS.extra));
    setAnnualIncrease(String(DEFAULTS.annualIncrease));
    setStartMonth(String(DEFAULTS.startMonth));
    setStartYear(String(DEFAULTS.startYear));
    setCalcInputs(DEFAULTS);
    setCalcMode("term");
    setResults(computeReverse(DEFAULTS, "term"));
  };

  const faqs = [
    {
      question: "What is reverse amortization?",
      answer:
        "Reverse amortization means running the standard loan equation backwards. Instead of starting with a principal and a rate and calculating the payment, you supply the payment and solve for whichever unknown is missing: how many months the loan takes to clear, how much principal a given payment supports, or the interest rate implied by the payment and term.",
    },
    {
      question: "How is the payoff term solved?",
      answer:
        "Rearranging the amortising payment formula gives the number of payments as the negative natural logarithm of one minus the monthly rate times the principal divided by the payment, itself divided by the natural logarithm of one plus the monthly rate. The payment must exceed the first month's interest, otherwise the logarithm has no solution and the balance never falls.",
    },
    {
      question: "How is the implied interest rate found?",
      answer:
        "The payment formula has no closed-form inverse for the rate, so the calculator solves it by bisection: it evaluates what the payment would be at a low rate and a high rate, confirms the target sits between them, then halves the interval two hundred times, which converges to far more precision than any loan contract needs.",
    },
    {
      question: "Why does the final payment differ?",
      answer:
        "Because an amortising loan rarely divides exactly into whole payments. The last payment is whatever balance and interest remain, so it is normally smaller than the scheduled amount. The projection caps the final instalment at the outstanding balance rather than overpaying the loan, and reports that final figure separately from the scheduled payment.",
    },
    {
      question: "Does the projection use simple or compound interest?",
      answer:
        "Compound interest on a monthly cycle, which is how consumer instalment loans are amortised. Interest each month is the outstanding balance multiplied by the annual rate divided by twelve, charged before the payment is applied, with the interest paid first and the remainder reducing principal. The effective annual rate reported applies twelve months of that monthly compounding to the nominal rate.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Reverse Amortization Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Reverse Amortization Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Solve For">
              <div className="flex rounded-md border border-input overflow-hidden h-9 w-full">
                <button
                  type="button"
                  onClick={() => setMode("term")}
                  className={`flex-1 text-xs font-semibold transition-colors ${
                    mode === "term" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Term
                </button>
                <button
                  type="button"
                  onClick={() => setMode("principal")}
                  className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${
                    mode === "principal"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => setMode("rate")}
                  className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${
                    mode === "rate" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Interest Rate
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {mode === "term"
                  ? "Solving for the number of payments. The term field is used only by the other two modes."
                  : mode === "principal"
                  ? "Solving for the principal. Your loan amount field is shown for reference and ignored."
                  : "Solving for the rate. The rate field is shown for reference and ignored."}
              </p>
            </SubSection>

            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Principal borrowed. Ignored when solving for the principal."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={annualRate}
                  onChange={setAnnualRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.05"
                  tooltip="Nominal annual rate. Ignored when solving for the rate."
                />
                <CompactInput
                  id="payment"
                  label="Monthly Payment"
                  value={payment}
                  onChange={setPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Scheduled instalment, excluding any extra payment you add below."
                />
                <CompactInput
                  id="term"
                  label="Term"
                  value={termMonths}
                  onChange={setTermMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="1"
                  tooltip="Number of scheduled payments. Used when solving for principal or rate."
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
                  <SubSection title="Payment Changes">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra"
                        label="Extra Monthly"
                        value={extra}
                        onChange={setExtra}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Added to every instalment, which shortens the schedule and the interest bill."
                      />
                      <CompactInput
                        id="increase"
                        label="Annual Increase"
                        value={annualIncrease}
                        onChange={setAnnualIncrease}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.5"
                        tooltip="Step-up applied to the payment once a year, as used by some wage-linked loans."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="First Payment Date">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="start-month"
                        label="Start Month"
                        value={startMonth}
                        onChange={setStartMonth}
                        onEnter={runCalculate}
                        min="1"
                        step="1"
                        tooltip="Month of the first payment, 1 for January through 12 for December."
                      />
                      <CompactInput
                        id="start-year"
                        label="Start Year"
                        value={startYear}
                        onChange={setStartYear}
                        onEnter={runCalculate}
                        min="1900"
                        step="1"
                        tooltip="Year of the first payment, used to date the payoff."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Payments are treated as made in arrears, so interest is charged on the opening balance each month and the
                      payment is applied immediately afterwards. A step-up or extra payment is re-tested against the interest
                      charge every month, which is why a payment that starts below the monthly interest never amortises no
                      matter how long it runs.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">{results.solvedLabel}</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{results.solvedDisplay}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.payment > 0 ? `${money2(results.payment)} per month` : "No scheduled payment"}
                {results.extra > 0 ? ` + ${money2(results.extra)} extra` : ""} · payoff {results.payoffDate}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-destructive">{money(results.totalInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payments</span>
                <span className="font-extrabold text-foreground">{results.neverPaysOff ? "—" : results.months}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Rate</span>
                <span className="font-extrabold text-foreground">{fmt(results.effectiveRate, 3)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[105px]">Paid</th>
                    <th className="p-2.5 text-right w-[105px]">Interest</th>
                    <th className="p-2.5 text-right w-[105px]">Principal</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.slice(0, 30).map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.paid)}</td>
                      <td className="p-2.5 text-right text-destructive">{money(row.interest)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money(row.principal)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalPaid)}</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.totalInterest)}</td>
                    <td className="p-2.5 text-right text-emerald-600">{money(results.totalPrincipal)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">$0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Principal</span>
                  <span className="text-base font-bold text-foreground">{money2(results.principal)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Nominal Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.nominalRate, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Annual Rate</span>
                  <span className="text-base font-bold text-primary">{fmt(results.effectiveRate, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.monthlyRate * 100, 4)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled Payment</span>
                  <span className="text-base font-bold text-foreground">{money2(results.payment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Per Month</span>
                  <span className="text-base font-bold text-foreground">{money2(results.extra)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Term</span>
                  <span className="text-base font-bold text-foreground">{results.termLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Date</span>
                  <span className="text-base font-bold text-foreground">{results.payoffDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-destructive">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as % of Principal</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.interestShare, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Payment</span>
                  <span className="text-base font-bold text-foreground">{money2(results.finalPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Term Without Extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.baselineMonths > 0 ? duration(results.baselineMonths) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-emerald-600">{results.monthsSaved}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Without Extra</span>
                  <span className="text-base font-bold text-foreground">{money(results.baselineInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.interestSaved)}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Solving For</span>
                  <span className="text-base font-bold text-primary">{results.solveNote}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Reverse Amortization Calculator?</h2>
            <p>
              A reverse amortization calculator works the loan equation backwards. An ordinary amortisation schedule starts with
              three knowns, the principal, the rate and the term, and produces the payment. A reverse amortisation solves the
              opposite problem: you already know what you can pay, or what the lender is asking, and you need to know how long
              the loan will last, how much it supports, or what rate is really being charged.
            </p>
            <p>
              The three questions are the ones borrowers and analysts ask most often. How many payments before this is clear?
              What size loan does this payment support at this rate? And what interest rate is implied by a quoted payment and
              term? All three rest on the same amortising payment relationship, rearranged for a different unknown, and all
              three are exactly solvable except the rate.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The core relationship is the standard amortising payment: the principal multiplied by the periodic rate, divided
              by one minus one plus the periodic rate raised to the power of the negative number of payments. Solving it for
              the term rearranges to the negative natural logarithm of one minus the monthly rate times the principal divided by
              the payment, all divided by the natural logarithm of one plus the monthly rate.
            </p>
            <p>
              Solving for the principal simply multiplies the payment by one minus one plus the monthly rate to the power of the
              negative term, divided by the monthly rate. Solving for the rate has no algebraic inverse, so the calculator uses
              bisection: it checks that the target payment lies between what a very low rate and a very high rate would require,
              then repeatedly halves the interval. Two hundred halvings converge to a precision far beyond anything a contract
              needs.
            </p>
            <p>
              Every solution is then projected month by month rather than left as a formula. Each month the outstanding balance
              is charged interest at the monthly rate, the payment is applied to that interest first and to principal second,
              and any extra payment or annual step-up is added before the balance is recalculated. A final part-payment is
              capped at the remaining balance, which is why the last instalment shown differs from the scheduled amount.
            </p>
            <p>
              Two guards matter in practice. If the payment is smaller than the first month&apos;s interest, the balance grows
              rather than shrinks and no term exists, so the calculator reports that the loan never clears instead of returning
              a huge number. And when the implied rate falls outside a plausible range, the tool says so rather than presenting
              an answer it cannot support.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the value being solved for: the payoff term, the principal the payment supports, or the
              implied annual rate, with the scheduled payment and the date the loan finishes underneath. The three statistics
              beside it give the total interest, the number of payments, and the effective annual rate, which is the nominal
              monthly rate compounded twelve times and is always slightly above the nominal figure you entered.
            </p>
            <p>
              The breakdown table projects the loan year by year, showing what was paid, how it split between interest and
              principal, and the balance still outstanding, with a total row at the bottom. Summary Statistics collects the
              principal, nominal, monthly and effective rates, the scheduled and extra payments, the term and payoff date, the
              total paid, the total interest and its share of the principal, the final instalment, and the comparison against
              making no extra payments at all: the months and the interest that the extra money saves.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reverse-amortization-calculator" />
          <PopularCalculators exclude="/calculator/reverse-amortization-calculator" />
        </div>
      </div>
    </>
  );
}
