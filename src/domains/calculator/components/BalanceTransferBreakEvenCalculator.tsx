"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TransferInputs {
  balance: number;
  currentApr: number;
  promoApr: number;
  promoMonths: number;
  postPromoApr: number;
  monthlyPayment: number;
  transferFeePct: number;
}

const DEFAULTS: TransferInputs = {
  balance: 6000,
  currentApr: 24.99,
  promoApr: 0,
  promoMonths: 12,
  postPromoApr: 19.99,
  monthlyPayment: 250,
  transferFeePct: 3,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface Schedule {
  interest: number;
  months: number;
  cumInterest: number[];
  balanceAtMonth: number[];
  stalled: boolean;
}

function simulateTransfer(balance: number, monthlyRate: (m: number) => number, pay: number) {
  let bal = balance;
  let interest = 0;
  let m = 0;
  let stalled = false;
  const cumInterest: number[] = [];
  const balanceAtMonth: number[] = [];
  while (bal > 0.005 && m < 1200) {
    const r = monthlyRate(m);
    const int = bal * r;
    if (pay <= int) {
      stalled = true;
      bal += pay - int;
      interest += int;
      m += 1;
      cumInterest.push(interest);
      balanceAtMonth.push(bal);
      continue;
    }
    const p = Math.min(pay, bal + int);
    bal -= p - int;
    interest += int;
    m += 1;
    cumInterest.push(interest);
    balanceAtMonth.push(bal);
  }
  return { interest, months: m, cumInterest, balanceAtMonth, stalled } as Schedule;
}

interface TransferResult {
  currentInterest: number;
  transferInterest: number;
  fee: number;
  netSavings: number;
  breakEvenMonths: number | null;
  monthsCurrent: number;
  monthsTransfer: number;
  promoInterestSaved: number;
  postPromoInterest: number;
  balanceAtPromoEnd: number;
  clearsInPromo: boolean;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeTransfer(i: TransferInputs): TransferResult {
  const invalid =
    i.balance <= 0 ||
    i.currentApr < 0 ||
    i.promoApr < 0 ||
    i.promoMonths < 0 ||
    i.postPromoApr < 0 ||
    i.monthlyPayment <= 0 ||
    i.transferFeePct < 0;

  const fee = i.balance * (i.transferFeePct / 100);
  const promoM = Math.round(i.promoMonths);

  const a = simulateTransfer(i.balance, () => i.currentApr / 100 / 12, i.monthlyPayment);
  const b = simulateTransfer(
    i.balance + fee,
    (m) => (m < promoM ? i.promoApr : i.postPromoApr) / 100 / 12,
    i.monthlyPayment
  );

  let breakEvenMonths: number | null = null;
  const n = Math.min(a.cumInterest.length, b.cumInterest.length);
  for (let m = 0; m < n; m++) {
    if (a.cumInterest[m] - b.cumInterest[m] >= fee) {
      breakEvenMonths = m + 1;
      break;
    }
  }

  const promoIdx = Math.min(promoM, Math.max(0, a.cumInterest.length - 1));
  const promoInterestSaved =
    a.cumInterest.length > 0 && b.cumInterest.length > 0
      ? Math.max(0, a.cumInterest[promoIdx] - b.cumInterest[promoIdx])
      : 0;
  const transferPromoInterest = b.cumInterest.length > 0 ? b.cumInterest[promoIdx] : 0;

  return {
    currentInterest: a.interest,
    transferInterest: b.interest,
    fee,
    netSavings: a.interest - b.interest - fee,
    breakEvenMonths,
    monthsCurrent: a.months,
    monthsTransfer: b.months,
    promoInterestSaved,
    postPromoInterest: Math.max(0, b.interest - transferPromoInterest),
    balanceAtPromoEnd: b.balanceAtMonth.length > 0 ? b.balanceAtMonth[Math.min(promoM, b.balanceAtMonth.length) - 1] || 0 : 0,
    clearsInPromo: b.months <= promoM,
    stalled: a.stalled || b.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance and payment above zero, and non-negative rates, fees and promo length."
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

export default function BalanceTransferBreakEvenCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [currentApr, setCurrentApr] = useState(String(DEFAULTS.currentApr));
  const [promoApr, setPromoApr] = useState(String(DEFAULTS.promoApr));
  const [promoMonths, setPromoMonths] = useState(String(DEFAULTS.promoMonths));
  const [postPromoApr, setPostPromoApr] = useState(String(DEFAULTS.postPromoApr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [transferFeePct, setTransferFeePct] = useState(String(DEFAULTS.transferFeePct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TransferInputs => ({
    balance: parseFloat(balance) || 0,
    currentApr: parseFloat(currentApr) || 0,
    promoApr: parseFloat(promoApr) || 0,
    promoMonths: parseFloat(promoMonths) || 0,
    postPromoApr: parseFloat(postPromoApr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    transferFeePct: parseFloat(transferFeePct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TransferInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TransferResult>(() => computeTransfer(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTransfer(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setCurrentApr(String(DEFAULTS.currentApr));
    setPromoApr(String(DEFAULTS.promoApr));
    setPromoMonths(String(DEFAULTS.promoMonths));
    setPostPromoApr(String(DEFAULTS.postPromoApr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setTransferFeePct(String(DEFAULTS.transferFeePct));
    setCalcInputs(DEFAULTS);
    setResults(computeTransfer(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the break-even point on a balance transfer?",
      answer:
        "Break-even is the month in which the interest you have avoided at the lower rate equals the fee you paid to move the balance. Before that month the transfer has cost more than it has saved; after it, every month adds to your gain. On a typical 3% fee against a high-rate card, the break-even arrives within two to four months — but if your promo period is shorter than break-even, or the post-promo rate is high, the transfer can lose money overall.",
    },
    {
      question: "How does the post-promotional rate affect the deal?",
      answer:
        "It can decide the whole outcome. A 0% promo for twelve months followed by a 19.99% standard rate is only cheaper than staying at 24.99% if your balance actually shrinks during the promo window — ideally to zero. If you make no progress and the balance rolls into the post-promo rate, the savings shrink sharply; if the post-promo rate is at or above your current rate, the transfer is worse than doing nothing once the fee is counted.",
    },
    {
      question: "Should the transfer fee be paid upfront or financed?",
      answer:
        "Paying the fee in cash is cheaper if you can afford it, because financing the fee means paying interest on it as well. This calculator assumes the fee is added to the transferred balance, which is the common arrangement and the conservative assumption. If you pay the fee separately, reduce the transfer fee input to zero after adding the fee to the balance, or simply note that your real savings will be slightly higher than shown.",
    },
    {
      question: "What payment should I make during the promotional period?",
      answer:
        "As much as you can afford, and never less than the amount that clears the balance before the promo ends. The savings are largest when the balance reaches zero while the promotional rate still applies, because any residual balance is then repriced at the standard rate. Setting the payment so that the projected payoff falls inside the promo window is the single decision that determines whether the transfer is a win.",
    },
    {
      question: "Does a balance transfer affect my credit score?",
      answer:
        "A new card usually means a hard inquiry and a lower average account age, both mild negatives, while the transfer often improves utilization because the balance moves to a fresh limit and the original card reports zero. Most borrowers see a small dip followed by a net improvement. The more important risk is behavioural: transferring the balance and then continuing to spend on the cleared card simply recreates the problem at a higher total cost.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Balance Transfer Break-Even Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Balance Transfer Break-Even Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance to Transfer"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance moving to the promotional card."
                />
                <CompactInput
                  id="current-apr"
                  label="Current APR"
                  value={currentApr}
                  onChange={setCurrentApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Rate on the existing card today."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="promo-apr"
                  label="Promo APR"
                  value={promoApr}
                  onChange={setPromoApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Introductory rate, often 0%."
                />
                <CompactInput
                  id="post-promo-apr"
                  label="Post-Promo APR"
                  value={postPromoApr}
                  onChange={setPostPromoApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Standard rate the balance reverts to after the promo window."
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
                  <SubSection title="Promo Period">
                    <CompactInput
                      id="promo-months"
                      label="Promo Length"
                      value={promoMonths}
                      onChange={setPromoMonths}
                      onEnter={runCalculate}
                      suffix="months"
                      min="0"
                      tooltip="How long the promotional rate lasts."
                    />
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
                        tooltip="Payment made in both scenarios."
                      />
                      <CompactInput
                        id="transfer-fee"
                        label="Transfer Fee"
                        value={transferFeePct}
                        onChange={setTransferFeePct}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.1"
                        tooltip="One-time fee on the transferred balance, financed into the new balance."
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
            {results.valid && results.stalled && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Payment too low</div>
                <div className="text-base font-medium text-foreground">
                  The payment does not cover the monthly interest in one of the scenarios, so that balance never falls.
                </div>
              </div>
            )}
            {results.valid && !results.stalled && results.netSavings <= 0 && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Transfer loses money</div>
                <div className="text-base font-medium text-foreground">
                  After the fee, this transfer costs more than it saves — shorten the promo window or raise the payment.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Net Savings After Fee
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.netSavings, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.clearsInPromo
                  ? "Balance clears inside the promo window"
                  : `Balance rolls over with $${fmt(results.balanceAtPromoEnd, 0)} remaining`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Transfer Fee
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.fee, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Saved in Promo Window
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.promoInterestSaved, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Break-Even
                </span>
                <span className="font-extrabold text-primary">
                  {results.breakEvenMonths ? `Month ${results.breakEvenMonths}` : "Not reached"}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest if no transfer</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.currentInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{results.monthsCurrent} months</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      Interest with transfer ({fmt(calcInputs.promoMonths, 0)} mo promo, then {fmt(calcInputs.postPromoApr, 2)}%)
                    </td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.transferInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{results.monthsTransfer} months</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Transfer fee</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.fee, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">Upfront</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net savings</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netSavings, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">
                      {results.monthsCurrent - results.monthsTransfer > 0
                        ? `${results.monthsCurrent - results.monthsTransfer} mo sooner`
                        : "—"}
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
                    Interest Saved During Promo
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.promoInterestSaved, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest After Promo
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.postPromoInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Balance at Promo End
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.balanceAtPromoEnd, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Months to Payoff
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsTransfer} vs {results.monthsCurrent}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rate Reduction</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(Math.max(0, calcInputs.currentApr - calcInputs.promoApr), 2)} pts (promo)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Post-Promo vs Current
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.postPromoApr - calcInputs.currentApr, 2)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Balance Transfer Break-Even Calculator?</h2>
            <p>
              A balance transfer break-even calculator answers one question before you move a balance: how long will it
              take for the interest you avoid to outweigh the fee you pay? Transfers usually carry a one-time fee of 2%
              to 5% of the amount moved, and a promotional rate — often 0% — that lasts for a fixed window before the
              balance reverts to a standard APR. Whether the deal wins depends on the size of the fee, the length of the
              promo window, the rate the balance would otherwise carry, and how fast you repay.
            </p>
            <p>
              The break-even month is the decision rule. If it arrives well inside the promotional period and you can
              clear the balance before the rate reverts, the transfer is a straightforward saving. If the promotional
              period is shorter than break-even, or if the balance rolls into a post-promo rate that is no better than
              the rate you started with, the transfer can cost more than doing nothing — a result that is easy to miss
              when the headline says &quot;0% for 12 months&quot;.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator simulates two repayment schedules with the same monthly payment. In the first, the balance
              is repaid at your current APR throughout. In the second, the transfer fee is added to the balance and the
              balance is charged the promotional rate for the promo window, then the post-promotional rate on whatever
              remains. Both schedules record each month&apos;s interest charge and cumulative interest.
            </p>
            <p>
              Break-even is found by comparing the cumulative interest difference month by month: the first month in
              which the interest avoided exceeds the fee is the break-even point. Net savings is the interest paid at the
              current rate minus the interest paid on the transfer path, minus the fee. The calculator also reports the
              balance remaining when the promo window ends, so you can see whether the plan actually clears inside it,
              and separates the interest saved during the promo from interest paid afterwards.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports net savings after the fee, with a note on whether the balance clears within the
              promotional window. The three-stat bar shows the fee, the interest saved during the promo period and the
              break-even month, and the breakdown table lines up both paths — interest with and without the transfer,
              the fee and the net saving — with the payoff timeline for each.
            </p>
            <p>
              Summary Statistics adds the interest split between the promo and post-promo periods, the balance remaining
              at the promo end, the two payoff durations and both rate comparisons. Treat the post-promo rate as the
              number that decides the trade: a transfer only wins if you make real progress during the promotional
              window, and the fastest way to guarantee that is to set the payment so the projected payoff lands inside
              it. If the numbers say break-even comes after the promo expires, the honest answer is that this transfer is
              not worth the fee. Test the sensitivity before committing: nudging the payment up a little, or the promo
              period down a month, often flips a marginal offer from a small win to a clear loss.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/balance-transfer-break-even-calculator" />
          <PopularCalculators exclude="/calculator/balance-transfer-break-even-calculator" />
        </div>
      </div>
    </>
  );
}
