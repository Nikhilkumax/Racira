"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SavingsInputs {
  balance: number;
  currentApr: number;
  newApr: number;
  monthlyPayment: number;
  transferFeePct: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: SavingsInputs = {
  balance: 10000,
  currentApr: 24.99,
  newApr: 9.99,
  monthlyPayment: 350,
  transferFeePct: 3,
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

interface Schedule {
  interest: number;
  months: number;
  stalled: boolean;
  cumInterest: number[];
}

function simulate(balance: number, apr: number, pay: number): Schedule {
  const r = apr / 100 / 12;
  let bal = balance;
  let interest = 0;
  let m = 0;
  let stalled = false;
  const cumInterest: number[] = [];
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    if (pay <= int) {
      stalled = true;
      bal += pay - int;
      interest += int;
      m += 1;
      cumInterest.push(interest);
      continue;
    }
    const p = Math.min(pay, bal + int);
    bal -= p - int;
    interest += int;
    m += 1;
    cumInterest.push(interest);
  }
  return { interest, months: m, stalled, cumInterest };
}

interface SavingsResult {
  currentInterest: number;
  newInterest: number;
  fee: number;
  netSavings: number;
  monthsCurrent: number;
  monthsNew: number;
  monthsSaved: number;
  breakEvenMonths: number | null;
  totalCurrent: number;
  totalNew: number;
  payoffCurrent: string;
  payoffNew: string;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeSavings(i: SavingsInputs): SavingsResult {
  const invalid = i.balance <= 0 || i.currentApr < 0 || i.newApr < 0 || i.monthlyPayment <= 0 || i.transferFeePct < 0;
  const fee = i.balance * (i.transferFeePct / 100);

  const a = simulate(i.balance, i.currentApr, i.monthlyPayment);
  const b = simulate(i.balance + fee, i.newApr, i.monthlyPayment);

  let breakEvenMonths: number | null = null;
  const n = Math.min(a.cumInterest.length, b.cumInterest.length);
  for (let m = 0; m < n; m++) {
    if (a.cumInterest[m] - b.cumInterest[m] >= fee) {
      breakEvenMonths = m + 1;
      break;
    }
  }

  const netSavings = a.interest - b.interest - fee;

  return {
    currentInterest: a.interest,
    newInterest: b.interest,
    fee,
    netSavings,
    monthsCurrent: a.months,
    monthsNew: b.months,
    monthsSaved: Math.max(0, a.months - b.months),
    breakEvenMonths,
    totalCurrent: i.balance + a.interest,
    totalNew: i.balance + fee + b.interest,
    payoffCurrent: addMonths(i.startMonth, a.months),
    payoffNew: addMonths(i.startMonth, b.months),
    stalled: a.stalled || b.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance above zero, a payment above zero, and non-negative rates and fees."
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

export default function InterestSavingsCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [currentApr, setCurrentApr] = useState(String(DEFAULTS.currentApr));
  const [newApr, setNewApr] = useState(String(DEFAULTS.newApr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [transferFeePct, setTransferFeePct] = useState(String(DEFAULTS.transferFeePct));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SavingsInputs => ({
    balance: parseFloat(balance) || 0,
    currentApr: parseFloat(currentApr) || 0,
    newApr: parseFloat(newApr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    transferFeePct: parseFloat(transferFeePct) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<SavingsInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SavingsResult>(() => computeSavings(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSavings(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setCurrentApr(String(DEFAULTS.currentApr));
    setNewApr(String(DEFAULTS.newApr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setTransferFeePct(String(DEFAULTS.transferFeePct));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeSavings(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much can a balance transfer actually save?",
      answer:
        "The saving is the difference between the interest you would pay at your current rate and the interest you will pay at the new rate, minus any transfer fee. On a $10,000 balance at 24.99% repaid at $350 a month, moving to 9.99% with a 3% fee ($300) typically saves well over $1,000 in interest and removes a year or more from the repayment schedule. The lower the new rate and the longer the remaining term, the larger the saving.",
    },
    {
      question: "What is a balance transfer fee and how should I treat it?",
      answer:
        "A balance transfer fee is a one-time charge, usually 3% to 5% of the amount moved, added to the new balance or billed separately. It is the price of the lower rate, and it is why a transfer only makes sense if you intend to keep the balance long enough for the interest saving to exceed the fee. This calculator finances the fee into the new balance, which is how most issuers apply it, and reports the month in which the fee is recovered.",
    },
    {
      question: "What is break-even on a balance transfer?",
      answer:
        "Break-even is the point at which the interest saved at the lower rate equals the fee you paid to move the balance. Before that month the transfer has cost you money; after it, every month is a net saving. A typical 3% fee on a balance at a high rate breaks even within the first few months. If you expect to repay the balance before break-even, the transfer is not worth doing.",
    },
    {
      question: "Should I keep paying the same amount after a transfer?",
      answer:
        "Yes — that is where most of the saving comes from. Many people transfer a balance and then reduce their payment because the minimum drops with the lower rate, which stretches the repayment and can wipe out the interest saving entirely. Keeping the payment unchanged means the lower rate converts directly into faster principal reduction, shortening the schedule and cutting total interest.",
    },
    {
      question: "Does a balance transfer hurt my credit score?",
      answer:
        "Applying for a new card usually involves a hard inquiry, which can cost a few points temporarily, and a new account lowers the average age of your credit history. The transfer itself, however, often improves utilization because the balance moves to a card with a fresh limit and the old card reports zero. On balance, most borrowers see a small short-term dip followed by an improvement if total utilization falls.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Interest Savings Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Interest Savings Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance to Move"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance being transferred or refinanced."
                />
                <CompactInput
                  id="current-apr"
                  label="Current APR"
                  value={currentApr}
                  onChange={setCurrentApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Rate you pay today on the balance."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="new-apr"
                  label="New APR"
                  value={newApr}
                  onChange={setNewApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Promotional or consolidation rate the balance would move to."
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
                        tooltip="Payment you will make towards the balance in both scenarios."
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
                  <SubSection title="Transfer Terms">
                    <CompactInput
                      id="transfer-fee"
                      label="Balance Transfer Fee"
                      value={transferFeePct}
                      onChange={setTransferFeePct}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      step="0.1"
                      tooltip="One-time fee charged on the transferred balance, financed into the new balance."
                    />
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
            {results.valid && results.stalled && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Payment too low</div>
                <div className="text-base font-medium text-foreground">
                  At the current rate the payment does not cover the monthly interest, so that balance never falls.
                  Increase the payment or the comparison is incomplete.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Interest Savings</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.netSavings, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                After the {fmt(calcInputs.transferFeePct, 2)}% transfer fee of ${fmt(results.fee, 0)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Interest at Current APR
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.currentInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Interest at New APR
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.newInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Transfer Fee</span>
                <span className="font-extrabold text-foreground">${fmt(results.fee, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest at current rate</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.currentInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{results.monthsCurrent} months</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest at new rate</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.newInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{results.monthsNew} months</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Balance transfer fee</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.fee, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">Upfront</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net savings</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netSavings, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">
                      {results.monthsSaved > 0 ? `${results.monthsSaved} mo sooner` : "—"}
                    </td>
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
                    Total Cost at Current Rate
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalCurrent, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Cost at New Rate
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalNew, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff at Current</span>
                  <span className="text-base font-bold text-foreground">{results.payoffCurrent}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff at New Rate</span>
                  <span className="text-base font-bold text-foreground">{results.payoffNew}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fee Break-Even</span>
                  <span className="text-base font-bold text-primary">
                    {results.breakEvenMonths ? `Month ${results.breakEvenMonths}` : "Not reached"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Rate Reduction
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(Math.max(0, calcInputs.currentApr - calcInputs.newApr), 2)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Interest Savings Calculator?</h2>
            <p>
              An interest savings calculator measures what you would save by moving a balance from one interest rate to
              a lower one, after accounting for the fee that usually comes with the move. Balance transfers, debt
              consolidation loans and refinancing all follow the same logic: you trade a one-time cost for a lower rate,
              and the question is whether the interest you avoid over the remaining repayment is worth more than the fee
              you pay today.
            </p>
            <p>
              The answer is not obvious from the rates alone, because it depends on the balance, the payment you make,
              and how long the balance would otherwise last. A small rate reduction on a balance repaid in a few months
              may save less than the transfer fee, while a large reduction on a balance repaid over years can save
              thousands. This calculator runs both scenarios side by side with identical payments, so the comparison is
              like for like, and it identifies the month in which the fee is recovered.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator simulates two repayment schedules using the same monthly payment. In the first, the balance
              is repaid at your current APR. In the second, the balance plus the transfer fee is repaid at the new APR,
              which reflects the common practice of adding the fee to the transferred balance. For each schedule it
              records the monthly interest charge, accumulates them, and stops when the balance reaches zero, producing
              the total interest and the number of months for both paths.
            </p>
            <p>
              The fee is calculated as the balance multiplied by the transfer fee percentage. Net savings is the interest
              at the current rate minus the interest at the new rate, minus that fee — the fee is a real cost, so it is
              subtracted rather than ignored. Break-even is found by comparing the cumulative interest difference month
              by month: the first month in which the interest saved exceeds the fee is the point at which the transfer
              turns profitable.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows net interest savings after the fee, which is the number that determines whether the
              move is worthwhile. The three-stat bar separates the three ingredients — interest at the current rate,
              interest at the new rate, and the fee — so you can see exactly where the saving comes from. The breakdown
              table adds the timeline: the months required under each rate and the months removed by the lower rate.
            </p>
            <p>
              Summary Statistics gives both total costs, both payoff dates, the fee break-even month and the size of the
              rate reduction. Use the break-even month as your decision rule: if you expect to clear the balance before
              that month, the transfer costs more than it saves. Treat the results as estimates — promotional rates
              expire and revert to a standard APR, some issuers charge fees separately rather than financing them, and
              the payment is assumed to stay constant. The single most important behaviour after a transfer is to keep
              the payment at its original level, because a lower minimum payment quietly stretches the schedule and can
              consume the entire saving.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-savings-calculator" />
          <PopularCalculators exclude="/calculator/interest-savings-calculator" />
        </div>
      </div>
    </>
  );
}
