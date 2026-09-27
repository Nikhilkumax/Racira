"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface InstallmentInputs {
  amountFinanced: number;
  apr: number;
  termMonths: number;
  processingFee: number;
  extraMonthly: number;
  oneTime: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: InstallmentInputs = {
  amountFinanced: 3000,
  apr: 19.99,
  termMonths: 24,
  processingFee: 50,
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

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

// Solve the true monthly rate from the borrower's cash flows: the amount
// received today, minus the upfront fee, repaid by level instalments.
function solveMonthlyRate(netAdvance: number, payment: number, n: number): number {
  if (netAdvance <= 0 || payment <= 0 || n <= 0) return 0;
  const npv = (i: number) => {
    if (i <= 1e-12) return netAdvance - payment * n;
    const ann = (1 - Math.pow(1 + i, -n)) / i;
    return netAdvance - payment * ann;
  };
  let lo = 1e-9;
  let hi = 1;
  if (npv(hi) < 0) return hi;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface InstallmentResult {
  monthlyPayment: number;
  totalInterest: number;
  totalRepaid: number;
  costOfCredit: number;
  costPer100: number;
  effectiveApr: number;
  months: number;
  baselineInterest: number;
  interestSaved: number;
  monthsSaved: number;
  payoffDate: string;
  neverPaysOff: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeInstallment(i: InstallmentInputs): InstallmentResult {
  const basePayment = paymentFor(i.amountFinanced, i.apr / 100 / 12, Math.round(i.termMonths));
  const invalid =
    i.amountFinanced <= 0 ||
    i.apr < 0 ||
    i.termMonths <= 0 ||
    i.processingFee < 0 ||
    i.extraMonthly < 0 ||
    i.oneTime < 0 ||
    basePayment <= 0;

  const n = Math.round(i.termMonths);
  const r = i.apr / 100 / 12;
  const baselineInterest = basePayment * n - i.amountFinanced;

  let bal = Math.max(0, i.amountFinanced - i.oneTime);
  let interest = 0;
  let m = 0;
  let stalled = false;
  const pay = basePayment + i.extraMonthly;
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    if (pay <= int) {
      stalled = true;
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

  const totalInterest = interest;
  const totalRepaid = i.amountFinanced + totalInterest + i.processingFee;
  const costOfCredit = totalInterest + i.processingFee;
  const netAdvance = i.amountFinanced - i.processingFee;
  const monthlyRate = solveMonthlyRate(netAdvance, basePayment, n);

  return {
    monthlyPayment: basePayment,
    totalInterest,
    totalRepaid,
    costOfCredit,
    costPer100: i.amountFinanced > 0 ? (costOfCredit / i.amountFinanced) * 100 : 0,
    effectiveApr: monthlyRate * 12 * 100,
    months: m,
    baselineInterest,
    interestSaved: Math.max(0, baselineInterest - totalInterest),
    monthsSaved: Math.max(0, n - m),
    payoffDate: addMonths(i.startMonth, m),
    neverPaysOff: stalled,
    valid: !invalid,
    errorMsg: invalid ? "Enter an amount financed above zero, a term in months above zero, and non-negative fees and extras." : "",
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

export default function InstallmentDebtCostCalculator() {
  const [amountFinanced, setAmountFinanced] = useState(String(DEFAULTS.amountFinanced));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [processingFee, setProcessingFee] = useState(String(DEFAULTS.processingFee));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [oneTime, setOneTime] = useState(String(DEFAULTS.oneTime));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): InstallmentInputs => ({
    amountFinanced: parseFloat(amountFinanced) || 0,
    apr: parseFloat(apr) || 0,
    termMonths: parseFloat(termMonths) || 0,
    processingFee: parseFloat(processingFee) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    oneTime: parseFloat(oneTime) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<InstallmentInputs>(() => DEFAULTS);
  const [results, setResults] = useState<InstallmentResult>(() => computeInstallment(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeInstallment(inputs));
  };

  const reset = () => {
    setAmountFinanced(String(DEFAULTS.amountFinanced));
    setApr(String(DEFAULTS.apr));
    setTermMonths(String(DEFAULTS.termMonths));
    setProcessingFee(String(DEFAULTS.processingFee));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setOneTime(String(DEFAULTS.oneTime));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeInstallment(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the true cost of installment financing?",
      answer:
        "The true cost is everything you pay above the amount financed: interest plus any origination, processing or documentation fee. A $3,000 purchase at 19.99% over 24 months costs roughly $650 in interest at a level payment, and a $50 processing fee pushes the total cost of credit past $700 — more than 20% of the purchase price. The advertised APR understates the real cost whenever fees are charged, which is why the effective annual rate shown here is often a full percentage point or more above the stated APR.",
    },
    {
      question: "How is the effective APR different from the quoted APR?",
      answer:
        "The quoted APR applies only to the amount financed. The effective rate is derived from your actual cash flows: you receive the amount financed minus the fee, and you repay a fixed instalment each month. Solving for the rate that makes those cash flows balance produces a higher figure than the quoted APR whenever a fee is deducted or added upfront, because the same interest is being charged on less money. This is the same logic regulators use when they test whether a disclosed APR is accurate.",
    },
    {
      question: "Do installment plans like buy-now-pay-later charge interest?",
      answer:
        "Many shorter plans advertise 0% interest, but they often charge an upfront service fee, a late fee, or a higher purchase price that is baked into the instalments. A zero-percent plan with a 4% service fee is effectively paying 4% to borrow for a few months, which can be a high annualised rate. Enter the plan's fee as the processing fee and set the APR to zero to see the true cost of an apparently interest-free offer.",
    },
    {
      question: "Should I pay off an installment debt early?",
      answer:
        "Only if the loan does not charge a prepayment penalty, and only after comparing the interest saved against what else you could do with the money. Installment debt usually carries a higher rate than a savings account pays, so early repayment is often the better use of spare cash. Use the extra payment fields to see exactly how much interest and time an additional amount each month removes from this particular plan.",
    },
    {
      question: "Does financing a purchase affect my credit score?",
      answer:
        "An installment account adds to your credit mix and a clean repayment history helps, but it also adds a hard inquiry and raises your total debt load. The most important factor is the monthly payment relative to your income: a large installment obligation raises your debt-to-income ratio and can make a future mortgage or auto loan harder to qualify for, even when you have never missed a payment.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Installment Debt Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Installment Debt Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Financing Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount-financed"
                  label="Amount Financed"
                  value={amountFinanced}
                  onChange={setAmountFinanced}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Purchase price being financed, after any down payment."
                />
                <CompactInput
                  id="apr"
                  label="APR"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Annual percentage rate quoted on the installment plan."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="term-months"
                  label="Term"
                  value={termMonths}
                  onChange={setTermMonths}
                  onEnter={runCalculate}
                  suffix="months"
                  min="1"
                  tooltip="Number of monthly instalments."
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
                  <SubSection title="Fees & Timeline">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="processing-fee"
                        label="Processing Fee"
                        value={processingFee}
                        onChange={setProcessingFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Upfront documentation or origination fee charged by the lender."
                      />
                      <CompactInput
                        id="start-month"
                        label="First Payment Month"
                        value={startMonth}
                        onChange={setStartMonth}
                        onEnter={runCalculate}
                        type="month"
                        tooltip="Month of the first instalment, used to derive the payoff date."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Prepayment">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra-monthly"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional amount paid on top of the instalment."
                      />
                      <CompactInput
                        id="one-time"
                        label="One-Time Payment"
                        value={oneTime}
                        onChange={setOneTime}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Single lump sum applied to the balance at the start."
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
                  The instalment does not cover the monthly interest, so the balance never falls. Extend the term or
                  increase the payment.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Cost of Credit</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.costOfCredit, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                On top of the ${fmt(calcInputs.amountFinanced, 0)} financed — total repaid ${fmt(results.totalRepaid, 0)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Monthly Payment
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Interest
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.totalInterest, 0)}</span>
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
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Amount Financed</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.amountFinanced, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalRepaid > 0 ? (calcInputs.amountFinanced / results.totalRepaid) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalRepaid > 0 ? (results.totalInterest / results.totalRepaid) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Fees</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.processingFee, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalRepaid > 0 ? (calcInputs.processingFee / results.totalRepaid) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Repaid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalRepaid, 0)}</td>
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
                    Instalments
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {results.months} {results.months === 1 ? "payment" : "payments"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost per $100 Financed
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.costPer100, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Effective Annual Rate
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveApr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest Saved With Extras
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.interestSaved, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved > 0 ? `${results.monthsSaved} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest as % of Amount
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.amountFinanced > 0 ? (results.totalInterest / calcInputs.amountFinanced) * 100 : 0, 1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Installment Debt Cost Calculator?</h2>
            <p>
              An installment debt cost calculator works out what a financed purchase really costs beyond its sticker
              price. Installment plans — store financing, personal instalment loans, buy-now-pay-later arrangements and
              in-house payment plans — quote a monthly figure that feels manageable, but the total of every instalment
              can exceed the purchase price by a wide margin once interest and fees are counted. This tool totals those
              amounts and expresses them as the true cost of credit.
            </p>
            <p>
              The figure matters because installment pricing is designed to obscure it. A plan may advertise &quot;0%
              interest&quot; while charging an upfront service fee, or quote a low APR that applies only to the amount
              financed while a documentation fee is deducted from the money you actually receive. Either way you are
              paying more for less, and the only way to compare offers is to reduce each one to the same measure: the
              total cash you pay above what you borrow, and the annualised rate implied by those cash flows.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator first computes the level monthly payment using the standard amortisation formula
              PMT = P × r / (1 − (1 + r)^−n), where P is the amount financed, r is the monthly rate and n is the number
              of instalments. It then simulates the repayment month by month, charging interest on the outstanding
              balance and applying your payment, to produce total interest, the total repaid, and the true cost of
              credit, which is interest plus the processing fee.
            </p>
            <p>
              To find the effective annual rate, it solves for the interest rate that makes your actual cash flows
              balance: you receive the amount financed minus the fee today, and you pay a fixed instalment for n months.
              The monthly rate that satisfies that equation, found by bisection, is annualised to give an effective APR
              that you can compare directly against a bank loan quote. Any extra monthly payment or one-time lump sum is
              simulated against the same schedule to show the interest and months it removes.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total cost of credit — interest plus fees — with the amount financed and the
              total repaid beneath it, so the gap between the purchase price and what you actually part with is
              unmissable. The three-stat bar gives the monthly payment, total interest and payoff date, while the
              breakdown table shows each component&apos;s share of the total repaid, including the fee that a quoted APR
              hides.
            </p>
            <p>
              Summary Statistics adds the number of instalments, the cost per $100 financed, the effective annual rate,
              and the interest and months saved by prepaying. Treat the effective rate as the headline comparison number:
              if a store plan shows 19.99% quoted but 22.5% effective, the fee is costing you 2.5 percentage points, and
              a personal loan at 15% may be the cheaper route. The same logic applies when a retailer offers its own
              financing at the point of sale: price the offer against a bank loan using the effective rate, not the
              advertised one. The results assume a constant rate and level payments; promotional instalment plans with
              deferred interest, variable rates or penalties will differ, so check the contract for a prepayment penalty
              before paying early.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/installment-debt-cost-calculator" />
          <PopularCalculators exclude="/calculator/installment-debt-cost-calculator" />
        </div>
      </div>
    </>
  );
}
