"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface UtilInputs {
  creditLimit: number;
  balance: number;
  plannedPayment: number;
  targetUtil: number;
}

const DEFAULTS: UtilInputs = {
  creditLimit: 20000,
  balance: 6000,
  plannedPayment: 1000,
  targetUtil: 30,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function band(u: number): { label: string; tone: string } {
  if (u <= 9.9) return { label: "Excellent", tone: "text-emerald-600" };
  if (u <= 29.9) return { label: "Good", tone: "text-emerald-600" };
  if (u <= 49.9) return { label: "Fair", tone: "text-amber-600" };
  if (u <= 74.9) return { label: "High", tone: "text-orange-600" };
  return { label: "Very High", tone: "text-red-600" };
}

interface UtilResult {
  utilization: number;
  afterPayment: number;
  available: number;
  targetBalance: number;
  paymentToTarget: number;
  paymentToTen: number;
  totalLimit: number;
  balance: number;
  valid: boolean;
  errorMsg: string;
}

function computeUtil(i: UtilInputs): UtilResult {
  const invalid =
    i.creditLimit <= 0 || i.balance < 0 || i.plannedPayment < 0 || i.targetUtil < 0 || i.targetUtil > 100;

  const utilization = i.creditLimit > 0 ? (i.balance / i.creditLimit) * 100 : 0;
  const afterPayment = i.creditLimit > 0 ? (Math.max(0, i.balance - i.plannedPayment) / i.creditLimit) * 100 : 0;
  const available = Math.max(0, i.creditLimit - i.balance);
  const targetBalance = i.creditLimit * (i.targetUtil / 100);
  const paymentToTarget = Math.max(0, i.balance - targetBalance);
  const paymentToTen = Math.max(0, i.balance - i.creditLimit * 0.1);

  return {
    utilization,
    afterPayment,
    available,
    targetBalance,
    paymentToTarget,
    paymentToTen,
    totalLimit: i.creditLimit,
    balance: i.balance,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a credit limit above zero, a non-negative balance and planned payment, and a target between 0% and 100%."
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

export default function CreditUtilizationRatioCalculator() {
  const [creditLimit, setCreditLimit] = useState(String(DEFAULTS.creditLimit));
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [plannedPayment, setPlannedPayment] = useState(String(DEFAULTS.plannedPayment));
  const [targetUtil, setTargetUtil] = useState(String(DEFAULTS.targetUtil));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): UtilInputs => ({
    creditLimit: parseFloat(creditLimit) || 0,
    balance: parseFloat(balance) || 0,
    plannedPayment: parseFloat(plannedPayment) || 0,
    targetUtil: parseFloat(targetUtil) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<UtilInputs>(() => DEFAULTS);
  const [results, setResults] = useState<UtilResult>(() => computeUtil(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeUtil(inputs));
  };

  const reset = () => {
    setCreditLimit(String(DEFAULTS.creditLimit));
    setBalance(String(DEFAULTS.balance));
    setPlannedPayment(String(DEFAULTS.plannedPayment));
    setTargetUtil(String(DEFAULTS.targetUtil));
    setCalcInputs(DEFAULTS);
    setResults(computeUtil(DEFAULTS));
  };

  const currentBand = band(results.utilization);
  const afterBand = band(results.afterPayment);
  const balanceShare = results.totalLimit > 0 ? (results.balance / results.totalLimit) * 100 : 0;

  const faqs = [
    {
      question: "What is a good credit utilization ratio?",
      answer:
        "Most scoring models treat a utilization ratio below 30% as healthy, and below 10% as excellent. The 30% figure is a widely used guideline rather than a rule: scoring models look at both your overall utilization across all accounts and the utilization of each individual card, so one maxed-out card can hurt even when your total is low. Keeping every card below 30% and your overall ratio below 10% is the safest target.",
    },
    {
      question: "How is credit utilization ratio calculated?",
      answer:
        "Utilization is your balance divided by your credit limit, expressed as a percentage. If you have a $6,000 balance across cards with a combined $20,000 limit, your utilization is 6,000 / 20,000 = 30%. The balance used by most scoring models is the statement balance reported by each issuer, not your current balance at any moment, so paying before the statement closes is what actually lowers the reported figure.",
    },
    {
      question: "Does paying off a card immediately improve my score?",
      answer:
        "It can, but timing matters. Scoring models use the balance reported on your statement, so paying before the statement date means a lower balance is reported and the improvement can appear within one billing cycle. Paying after the statement date still reduces the next month's reported balance. Because utilization has no memory — only the most recent reported balance counts — it is one of the fastest score factors to fix.",
    },
    {
      question: "Should I close a card I no longer use?",
      answer:
        "Usually not. Closing a card reduces your total available credit, which raises your utilization ratio immediately, and it shortens the average age of your accounts over time. If the card has no annual fee, keeping it open and using it lightly for a small recurring charge paid in full each month keeps the limit working in your favour. If it charges an annual fee you do not use, closing may still be the better financial decision.",
    },
    {
      question: "Does requesting a credit limit increase help my utilization?",
      answer:
        "Yes, as long as you do not increase spending. A higher limit lowers the ratio for the same balance: a $6,000 balance against a $20,000 limit is 30%, but against a $30,000 limit it is 20%. Some issuers do a soft inquiry for limit increases, but others record a hard inquiry, which can cost a few points temporarily. Ask whether the increase requires a hard pull before accepting it.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Credit Utilization Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Credit Utilization Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Revolving Balances">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="credit-limit"
                  label="Total Credit Limit"
                  value={creditLimit}
                  onChange={setCreditLimit}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Combined limit across all revolving accounts."
                />
                <CompactInput
                  id="balance"
                  label="Current Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance reported on your latest statements."
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
                  <SubSection title="Planned Payment">
                    <CompactInput
                      id="planned-payment"
                      label="Payment Before Statement"
                      value={plannedPayment}
                      onChange={setPlannedPayment}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Amount paid before the next statement closes, which lowers the reported balance."
                    />
                  </SubSection>
                  <SubSection title="Targets">
                    <CompactInput
                      id="target-util"
                      label="Target Utilization"
                      value={targetUtil}
                      onChange={setTargetUtil}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      tooltip="The utilization level you want to reach, typically 30% or lower."
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

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Credit Utilization Ratio
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.utilization, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Risk band: <span className={`font-bold ${currentBand.tone}`}>{currentBand.label}</span> — under 30% is
                the standard guideline
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Limit
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.totalLimit, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Balance</span>
                <span className="font-extrabold text-foreground">${fmt(results.balance, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Available Credit
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.available, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share of Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Balance Used</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.balance, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(balanceShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Available Credit</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.available, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(100 - balanceShare, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Credit Limit</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalLimit, 0)}</td>
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
                    After Planned Payment
                  </span>
                  <span className={`text-base font-bold ${afterBand.tone}`}>
                    {fmt(results.afterPayment, 1)}% ({afterBand.label})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Balance at {fmt(calcInputs.targetUtil, 0)}% Target
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.targetBalance, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payment to Reach Target
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.paymentToTarget, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payment to Reach 10%
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.paymentToTen, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Utilization Change
                  </span>
                  <span className="text-base font-bold text-foreground">
                    −{fmt(Math.max(0, results.utilization - results.afterPayment), 1)} pts
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Headroom Used</span>
                  <span className="text-base font-bold text-foreground">{fmt(balanceShare, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Credit Utilization Ratio Calculator?</h2>
            <p>
              A credit utilization ratio calculator divides the balances you carry on revolving accounts by the total
              credit limit available to you and expresses the result as a percentage. That single figure is one of the
              most influential inputs in modern credit scoring: it describes how much of your available credit you are
              actually using. A ratio of 30% means you owe thirty cents for every dollar of limit the issuers have
              extended to you, while a ratio of 90% suggests you are close to the ceiling of your borrowing capacity.
            </p>
            <p>
              The ratio matters because it is both powerful and quick to change. Payment history and account age move
              slowly, but utilization reflects whatever balance each issuer reported on your most recent statement, so
              paying a card down before the statement closes can improve the number within a single billing cycle.
              Tracking the ratio, and knowing exactly how much you need to pay to move from one risk band to another,
              gives you direct control over a score factor that many borrowers only discover after a denial.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The core formula is straightforward: utilization equals balance divided by credit limit, multiplied by
              one hundred. If your combined limits are $20,000 and your balances total $6,000, the utilization ratio is
              6,000 / 20,000 × 100 = 30%. The calculator applies that formula to the figures you enter, then compares
              the result against the conventional risk bands: below 10% is excellent, 10% to 29% is good, 30% to 49% is
              fair, 50% to 74% is high, and 75% or above is very high.
            </p>
            <p>
              It also models two forward-looking scenarios. First, it subtracts any payment you plan to make before the
              next statement closes and recomputes the ratio, showing the band you would land in once that payment is
              reported. Second, it works backwards from your target utilization: the target balance is the limit
              multiplied by the target percentage, and the payment required is simply your current balance minus that
              target balance, floored at zero. The same calculation for a 10% target shows what it would take to reach
              the excellent band.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports your current utilization ratio with its risk band. Beneath it, the three-stat bar
              summarises the raw ingredients — total limit, balance and available credit — so you can see how much
              headroom remains before the ratio reaches 100%. The breakdown table shows the balance and the unused limit
              as shares of the total, which makes it obvious that the ratio and the headroom used are two views of the
              same number.
            </p>
            <p>
              Summary Statistics adds the practical detail: the ratio after your planned payment, the balance that
              corresponds to your target percentage, the exact payment needed to reach it, and the payment needed to
              reach 10%. Treat the target figures as planning guides. Scoring models also look at each card
              individually, so a single card above 30% can weigh on a score even when the overall ratio looks healthy,
              and new accounts, inquiries and account age all move the score independently of utilization. The most
              reliable approach is to pay statement balances in full where possible, spread balances so no single card
              is heavily used, and keep total utilization comfortably below the 30% guideline.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-utilization-ratio-calculator" />
          <PopularCalculators exclude="/calculator/credit-utilization-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
