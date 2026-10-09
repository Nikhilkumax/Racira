"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Strategy = "fixed" | "min2" | "min3";

interface PayoffInputs {
  balance: number;
  apr: number;
  payment: number;
  extra: number;
  annualFee: number;
  strategy: Strategy;
  decimals: number;
}

const DEFAULTS: PayoffInputs = {
  balance: 12000,
  apr: 18.99,
  payment: 350,
  extra: 50,
  annualFee: 0,
  strategy: "fixed",
  decimals: 2,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const money = (v: number) => (Number.isFinite(v) ? "$" + fmt(v, 2) : "—");

const STRATEGY_OPTIONS = [
  { value: "fixed", label: "Fixed monthly payment" },
  { value: "min2", label: "Card minimum (2% of balance)" },
  { value: "min3", label: "Card minimum (3% of balance)" },
];

const DECIMAL_OPTIONS = [
  { value: "0", label: "Whole dollars" },
  { value: "1", label: "1 decimal" },
  { value: "2", label: "2 decimals" },
];

interface PayoffResult {
  valid: boolean;
  errorMsg: string;
  months: number;
  monthsBase: number;
  totalInterest: number;
  totalCost: number;
  interestShare: number;
  monthsSaved: number;
  interestSaved: number;
  firstInterest: number;
  firstPrincipal: number;
  payoffYears: number;
  minPayment: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

const MAX_MONTHS = 1200;

/** Amortise the balance month by month, applying the strategy's payment rule. */
function amortise(balance: number, r: number, fixedPay: number, extra: number, annualFee: number, strategy: Strategy) {
  let bal = balance;
  let interest = 0;
  let months = 0;
  while (bal > 0.005 && months < MAX_MONTHS) {
    const mInterest = bal * r;
    if (strategy === "fixed") {
      const pay = fixedPay + extra;
      if (pay <= mInterest) return { stuck: true, months: MAX_MONTHS, interest: Infinity };
      const principal = pay - mInterest;
      interest += mInterest;
      bal = bal + mInterest - pay - annualFee / 12;
      if (bal < 0) bal = 0;
      months++;
      if (bal <= 0.005) break;
    } else {
      const pct = strategy === "min2" ? 0.02 : 0.03;
      const pay = Math.max(bal * pct, 25) + extra;
      if (pay <= mInterest && extra === 0) return { stuck: true, months: MAX_MONTHS, interest: Infinity };
      const applied = Math.min(pay, bal + mInterest);
      interest += mInterest;
      bal = bal + mInterest - applied - annualFee / 12;
      if (bal < 0) bal = 0;
      months++;
      if (bal <= 0.005) break;
    }
  }
  return { stuck: false, months, interest };
}

function calculatePayoff(i: PayoffInputs): PayoffResult {
  const blankMsg = (errorMsg: string): PayoffResult => ({
    valid: false,
    errorMsg,
    months: 0,
    monthsBase: 0,
    totalInterest: 0,
    totalCost: 0,
    interestShare: 0,
    monthsSaved: 0,
    interestSaved: 0,
    firstInterest: 0,
    firstPrincipal: 0,
    payoffYears: 0,
    minPayment: 0,
    breakdown: [],
  });

  const nums = [i.balance, i.apr, i.payment, i.extra, i.annualFee, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blankMsg("Enter a number in every field.");
  if (i.balance < 100 || i.balance > 1000000) return blankMsg("Balance should be between $100 and $1,000,000.");
  if (i.apr <= 0 || i.apr > 40) return blankMsg("APR should be between 0.1% and 40%.");
  if (i.payment < 10) return blankMsg("Monthly payment should be at least $10.");
  if (i.extra < 0 || i.annualFee < 0) return blankMsg("Extra payment and annual fee cannot be negative.");

  const r = i.apr / 100 / 12;
  const firstInterest = i.balance * r;
  const minPayment = Math.max(i.balance * 0.02, 25);
  if (i.strategy === "fixed" && i.payment + i.extra <= firstInterest)
    return blankMsg(
      `The payment does not cover the first month's interest (${money(firstInterest)}) — the balance would never fall. Increase the payment.`
    );

  const base = amortise(i.balance, r, i.payment, 0, i.annualFee, i.strategy);
  if (base.stuck)
    return blankMsg("At this payment the balance never clears — raise the monthly payment above the monthly interest.");
  const withExtra = i.extra > 0 ? amortise(i.balance, r, i.payment, i.extra, i.annualFee, i.strategy) : base;
  if (withExtra.stuck) return blankMsg("At this payment the balance never clears — raise the monthly payment.");

  const months = base.months;
  const totalInterest = base.interest;
  const totalCost = i.balance + totalInterest + (i.annualFee * months) / 12;
  const interestShare = totalCost > 0 ? (totalInterest / totalCost) * 100 : 0;
  const monthsSaved = Math.max(0, months - withExtra.months);
  const interestSaved = Math.max(0, totalInterest - withExtra.interest);
  const firstPrincipal = i.strategy === "fixed" ? Math.max(0, i.payment - firstInterest) : Math.max(0, minPayment - firstInterest);

  const breakdown = [
    { label: "Starting balance", value: money(i.balance) },
    { label: `APR ${fmt(i.apr, 2)}% — first month interest`, value: money(firstInterest) },
    {
      label: i.strategy === "fixed" ? "Scheduled payment" : "Initial minimum payment",
      value: i.strategy === "fixed" ? money(i.payment) : money(minPayment),
    },
    i.extra > 0
      ? { label: "Extra principal each month", value: money(i.extra), highlight: true }
      : { label: "Extra principal each month", value: "$0.00" },
    i.annualFee > 0
      ? { label: `Annual fee, ${money(i.annualFee)} per year`, value: money((i.annualFee * months) / 12) }
      : { label: "Annual fee", value: "$0.00" },
    { label: "First month principal", value: money(firstPrincipal) },
    { label: `Payoff time at the scheduled payment`, value: `${fmt(months, 0)} months (${fmt(months / 12, 1)} years)` },
    { label: "Total interest paid", value: money(totalInterest), highlight: true },
    { label: "Total amount paid", value: money(totalCost), highlight: true },
    { label: "Interest as share of what you pay", value: `${fmt(interestShare, 1)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    months,
    monthsBase: months,
    totalInterest,
    totalCost,
    interestShare,
    monthsSaved,
    interestSaved,
    firstInterest,
    firstPrincipal,
    payoffYears: months / 12,
    minPayment,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function PersonalLoanPayoffCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [payment, setPayment] = useState(String(DEFAULTS.payment));
  const [extra, setExtra] = useState(String(DEFAULTS.extra));
  const [annualFee, setAnnualFee] = useState(String(DEFAULTS.annualFee));
  const [strategy, setStrategy] = useState(String(DEFAULTS.strategy));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PayoffInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    payment: parseFloat(payment) || 0,
    extra: parseFloat(extra) || 0,
    annualFee: parseFloat(annualFee) || 0,
    strategy: (strategy as Strategy) || "fixed",
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<PayoffInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PayoffResult>(() => calculatePayoff(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculatePayoff(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setPayment(String(DEFAULTS.payment));
    setExtra(String(DEFAULTS.extra));
    setAnnualFee(String(DEFAULTS.annualFee));
    setStrategy(String(DEFAULTS.strategy));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculatePayoff(DEFAULTS));
  };

  const balanceNum = parseFloat(balance);
  const aprNum = parseFloat(apr);

  const errors = {
    balance: !Number.isFinite(balanceNum) || balanceNum < 100 ? "Enter $100 or more" : "",
    apr: !Number.isFinite(aprNum) || aprNum <= 0 || aprNum > 40 ? "Enter 0.1–40% APR" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "Why does the payoff time matter more than the monthly payment?",
      answer:
        "Lenders and card issuers quote monthly payments because that is the number you feel each month, but the total cost of a loan is the payment multiplied by how many months it takes. A $12,000 balance at 19% APR clears in 40 months at $350 but takes 83 months at $200 — and the interest roughly triples from $2,600 to $7,700. The calculator's breakdown table shows both sides: the payment you asked about and the months and interest that come with it, which is the pair of numbers to weigh together.",
    },
    {
      question: "How is a card minimum different from a fixed payment?",
      answer:
        "A card minimum is a percentage of the current balance, usually 2 to 3% with a small floor, so the payment shrinks as the balance shrinks — and so does the speed of repayment. Paying the minimum on a typical card stretches the payoff to well over a decade and can cost more in interest than the original purchases. Switching the strategy to the 2% or 3% option shows that effect directly against a fixed payment of the same starting size, which stays level and clears far sooner.",
    },
    {
      question: "What happens if my payment only covers the interest?",
      answer:
        "The balance never falls, so the loan never ends. The calculator refuses to amortise that case and tells you the first month's interest — for a $12,000 balance at 19.99% APR that is about $200. Any payment at or below that figure, on a fixed-payment plan, is treading water. Raising the payment by even $50 above the interest line starts reducing principal, and the model shows how quickly the payoff follows from there.",
    },
    {
      question: "Is it worth paying extra every month?",
      answer:
        "On high-APR consumer debt, almost always yes. Extra principal removes months from the end of the loan, which are the most interest-heavy months, so the saving compounds. The default comparison here puts $50 extra against the scheduled payment: on the $12,000 / 19% example it cuts roughly a year off the payoff and about $1,300 from the interest. The only situations where holding back wins are when the alternative is an emergency fund shortfall or a matched retirement contribution, both of which beat almost any APR.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Personal Loan Payoff Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Personal Loan Payoff Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rate">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance Owed"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  min="100"
                  max="1000000"
                  step="100"
                  suffix="$"
                  error={errors.balance}
                  hint="Current payoff balance."
                  tooltip="What you owe today on the personal loan, credit card or line of credit."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  min="0.1"
                  max="40"
                  step="0.01"
                  suffix="% APR"
                  error={errors.apr}
                  tooltip="Annual percentage rate on the account."
                />
              </div>
            </SubSection>

            <SubSection title="Payment Plan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="payment"
                  label="Monthly Payment"
                  value={payment}
                  onChange={setPayment}
                  onEnter={runCalculate}
                  min="10"
                  step="10"
                  suffix="$"
                  hint="Ignored if a minimum strategy is selected."
                  tooltip="The amount you plan to pay each month on a fixed schedule."
                />
                <CompactSelect
                  id="strategy"
                  label="Strategy"
                  value={strategy}
                  onChange={setStrategy}
                  options={STRATEGY_OPTIONS}
                  tooltip="Fixed payment stays level; the card minimum options shrink with the balance each month."
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
                  <SubSection title="Extra & Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra"
                        label="Extra Monthly"
                        value={extra}
                        onChange={setExtra}
                        onEnter={runCalculate}
                        min="0"
                        step="10"
                        suffix="$"
                        hint="Added on top of every payment."
                        tooltip="Additional principal paid each month, which shortens the payoff and cuts interest."
                      />
                      <CompactInput
                        id="fee"
                        label="Annual Fee"
                        value={annualFee}
                        onChange={setAnnualFee}
                        onEnter={runCalculate}
                        min="0"
                        step="5"
                        suffix="$"
                        tooltip="Yearly account fee, applied monthly to the balance."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        options={DECIMAL_OPTIONS}
                        tooltip="Decimal places shown on money figures."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Months to Pay Off</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.months, 0) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.payoffYears, 1)} years at ${money(calcInputs.payment + calcInputs.extra)} per month · total interest ${money(results.totalInterest)}`
                  : "Raise the payment above the monthly interest to clear the balance"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalInterest) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalCost) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">First Mo. Interest</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.firstInterest) : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Payoff Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter a balance, rate and payment to schedule the payoff.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Extra $ shortens payoff by</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {results.monthsSaved > 0
                          ? `${fmt(results.monthsSaved, 0)} months · saves ${money(results.interestSaved)}`
                          : "no extra payment entered"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff time</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.months, 0)} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest share of payments</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.interestShare, 1)}%` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First month principal</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.firstPrincipal) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Card minimum (2%)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.minPayment) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months saved by extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && results.monthsSaved > 0 ? fmt(results.monthsSaved, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest saved by extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && results.interestSaved > 0 ? money(results.interestSaved) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Personal Loan Payoff Calculator?</h2>
            <p>
              A personal loan payoff calculator takes the balance you owe, the interest rate and the payment you can afford, and works out
              how long the debt will take to clear and what it will cost in total. It runs the loan month by month: each month the balance
              accrues interest at the monthly rate, your payment covers that interest first, and whatever is left reduces the principal.
              The month the balance reaches zero is the payoff date, and the sum of all the interest charges is the true price of the
              borrowing.
            </p>
            <p>
              The same arithmetic answers the practical questions that matter when you are deciding how to attack a debt: whether the
              payment you are making will ever finish the job, what a slightly larger payment buys you, and how a card-style minimum
              payment — which shrinks as the balance falls — compares with holding your payment level. Those comparisons are where the
              big differences hide, because a payment that feels only slightly larger can remove years from the schedule.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each simulated month, interest equals the balance multiplied by the APR divided by twelve. A fixed payment stays the same
              until the balance is gone; the card-minimum strategies instead pay the greater of a percentage of the current balance — 2%
              or 3% — and a $25 floor, which is how most card agreements actually compute the minimum. If the payment you entered is not
              enough to cover a month's interest, the balance would grow rather than shrink, and the calculator tells you the interest
              figure you need to beat instead of showing a meaningless schedule.
            </p>
            <p>
              Total interest is accumulated across the months until payoff, and the total cost adds the balance and any annual fee on top.
              The extra-payment field reruns the entire schedule with your additional amount applied every month, then reports the months
              saved and interest saved next to the base plan. Because the final months of a loan are nearly all principal, removing them
              saves disproportionately: the last year of a long payoff schedule contributes surprisingly little interest, which is why
              $50 a month can cut the total by four figures on a 19% APR balance.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the payoff time in months, with years and total interest underneath. The three-stat bar carries the
              total interest, the total amount paid and the first month's interest — the floor your payment has to clear. The breakdown
              table walks the plan line by line and ends with the extra-payment effect, and the summary panel lists the interest share,
              first-month principal split and the 2% card minimum for reference.
            </p>
            <p>
              Two readings are worth pausing on. First, the interest share: on high-rate consumer debt it is common for interest to be a
              fifth to a third of everything you pay, and that share is the money that bought nothing. Second, the fixed-versus-minimum
              comparison: if you switch the strategy to a 2% minimum with the same starting payment, the payoff typically stretches by
              years, because the shrinking payment keeps the balance alive longer. Level payments are the single cheapest habit in
              consumer debt, and the numbers here show why.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/personal-loan-payoff-calculator" />
          <PopularCalculators exclude="/calculator/personal-loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
