"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SnowflakeInputs {
  balance: number;
  apr: number;
  minimumPayment: number;
  monthlySnowflake: number;
  oneTimeSnowflake: number;
}

const DEFAULTS: SnowflakeInputs = {
  balance: 4200,
  apr: 21.99,
  minimumPayment: 105,
  monthlySnowflake: 75,
  oneTimeSnowflake: 250,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface SnowflakeResult {
  snowMonths: number;
  baseMonths: number;
  snowInterest: number;
  baseInterest: number;
  interestSaved: number;
  monthsSaved: number;
  totalSnowflakes: number;
  snowflakeSharePct: number;
  finalPayment: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function simulateSnow(balance: number, r: number, base: number, snow: number, oneTime: number) {
  let bal = balance;
  let interest = 0;
  let m = 0;
  let stalled = false;
  let finalPayment = 0;
  let lastPayment = 0;

  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    const pay = base + snow + (m === 0 ? oneTime : 0);
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
    finalPayment = p;
    lastPayment = p;
  }
  return { months: m, interest, stalled, finalPayment, lastPayment };
}

function computeSnowflake(i: SnowflakeInputs): SnowflakeResult {
  const invalid =
    i.balance <= 0 ||
    i.apr < 0 ||
    i.minimumPayment <= 0 ||
    i.monthlySnowflake < 0 ||
    i.oneTimeSnowflake < 0;

  const r = i.apr / 100 / 12;
  const snow = simulateSnow(i.balance, r, i.minimumPayment, i.monthlySnowflake, i.oneTimeSnowflake);
  const base = simulateSnow(i.balance, r, i.minimumPayment, 0, 0);

  const totalSnowflakes = i.monthlySnowflake * Math.max(0, snow.months - 1) + i.oneTimeSnowflake;
  const totalPaidSnow = i.balance + snow.interest;

  return {
    snowMonths: snow.months,
    baseMonths: base.months,
    snowInterest: snow.interest,
    baseInterest: base.interest,
    interestSaved: Math.max(0, base.interest - snow.interest),
    monthsSaved: Math.max(0, base.months - snow.months),
    totalSnowflakes,
    snowflakeSharePct: totalPaidSnow > 0 ? (totalSnowflakes / totalPaidSnow) * 100 : 0,
    finalPayment: snow.finalPayment,
    stalled: snow.stalled || base.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance and minimum payment above zero, a non-negative rate, and non-negative snowflake amounts."
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

export default function DebtSnowflakeCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [minimumPayment, setMinimumPayment] = useState(String(DEFAULTS.minimumPayment));
  const [monthlySnowflake, setMonthlySnowflake] = useState(String(DEFAULTS.monthlySnowflake));
  const [oneTimeSnowflake, setOneTimeSnowflake] = useState(String(DEFAULTS.oneTimeSnowflake));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SnowflakeInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    minimumPayment: parseFloat(minimumPayment) || 0,
    monthlySnowflake: parseFloat(monthlySnowflake) || 0,
    oneTimeSnowflake: parseFloat(oneTimeSnowflake) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<SnowflakeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SnowflakeResult>(() => computeSnowflake(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSnowflake(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setMinimumPayment(String(DEFAULTS.minimumPayment));
    setMonthlySnowflake(String(DEFAULTS.monthlySnowflake));
    setOneTimeSnowflake(String(DEFAULTS.oneTimeSnowflake));
    setCalcInputs(DEFAULTS);
    setResults(computeSnowflake(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a debt snowflake?",
      answer:
        "A snowflake is any small, irregular payment you throw at a debt on top of the required minimum — a $17 refund on a canceled subscription, $40 from a marketplace sale, a $5 bill found in a coat pocket. Each one is tiny. The point is frequency and direction: every snowflake goes straight to principal, so it earns the card's interest rate as an instant return and shortens the payoff by weeks or months it would otherwise take.",
    },
    {
      question: "How is a snowflake different from a snowball or avalanche?",
      answer:
        "The snowball and avalanche methods decide which debt gets your spare money. Snowflaking is about where the spare money comes from in the first place. You can snowflake on top of either method: the payment ordering rules still apply, and snowflakes simply enlarge whatever payment that ordering already sends to the target balance.",
    },
    {
      question: "Do snowflakes really make a difference?",
      answer:
        "Because interest compounds on a declining balance, a snowflake paid early does more work than the same dollars paid later. On a 21.99% card, $75 a month in snowflakes can cut more than a year of payments compared with minimums alone, and every dollar of interest you never accrue is money you keep. The effect is largest on high-rate revolving debt, where interest is calculated from the average daily balance.",
    },
    {
      question: "How should I track snowflakes?",
      answer:
        "Keep a single running list and apply the money the day it arrives rather than holding it until the due date — most issuers apply payments to the current balance immediately, and earlier payments reduce the balance interest is charged on. If you have multiple debts, keep snowflaking into the target account until it reaches zero, then roll its whole payment, snowflakes included, onto the next balance.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Snowflake Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Snowflake Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Debt & Minimums">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Debt Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The balance you are paying down."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate (APR)"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Annual rate on the debt."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="minimum-payment"
                  label="Minimum Payment"
                  value={minimumPayment}
                  onChange={setMinimumPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The required monthly payment you make no matter what."
                />
                <CompactInput
                  id="monthly-snowflake"
                  label="Monthly Snowflakes"
                  value={monthlySnowflake}
                  onChange={setMonthlySnowflake}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Average extra found money applied each month."
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
                  <SubSection title="One-Time Snowflakes">
                    <CompactInput
                      id="one-time"
                      label="One-Time Snowflake"
                      value={oneTimeSnowflake}
                      onChange={setOneTimeSnowflake}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="A lump snowflake applied in the first month — tax refund, bonus, sale proceeds."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Months to Debt-Free</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.snowMonths, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.stalled
                  ? "Payment does not cover interest — add to the minimum"
                  : `With $${fmt(calcInputs.minimumPayment + calcInputs.monthlySnowflake, 0)} of monthly payments versus ${fmt(results.baseMonths, 0)} months on minimums alone`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Saved</span>
                <span className="font-extrabold text-emerald-600">${fmt(results.interestSaved, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months Saved</span>
                <span className="font-extrabold text-foreground">{fmt(results.monthsSaved, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Snowflakes Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalSnowflakes, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scenario</th>
                    <th className="p-2.5 text-right w-[130px]">Months</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Minimums only</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.baseMonths, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.baseInterest, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">With snowflakes</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.snowMonths, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.snowInterest, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Snowflake dollars applied</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-emerald-600">${fmt(results.totalSnowflakes, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Interest difference</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.monthsSaved, 0)} fewer</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">-${fmt(results.interestSaved, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Baseline Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.baseInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest With Snowflakes</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.snowInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Snowflake Share of Payments</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.snowflakeSharePct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid With Snowflakes</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.balance + results.snowInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Payment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.finalPayment, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Signal</span>
                  <span className={`text-base font-bold ${results.stalled ? "text-red-600" : "text-emerald-600"}`}>
                    {results.stalled ? "Payment too low" : "On track"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Snowflake Calculator?</h2>
            <p>
              A debt snowflake calculator measures what small, irregular extra payments actually do to a payoff
              schedule. Snowflaking is the habit of sending any found money — a refund, a resale, a skipped subscription
              — straight to a debt balance the day it appears, on top of the required minimum. Individually these amounts
              look trivial. Collectively they attack principal earlier and more often than a single monthly payment can.
            </p>
            <p>
              The appeal is that snowflaking requires no raise, no refinance and no new income stream. It recycles money
              you were already spending and redirects every recovered dollar to the highest-cost balance. Because
              interest accrues on the outstanding balance, every dollar of principal removed early stops generating
              finance charges for every month that follows, which is why small payments made sooner can outperform
              larger payments made later.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator simulates two payoff timetables side by side. The baseline applies only the minimum payment
              until the balance clears. The snowflake scenario adds your average monthly snowflake, plus any one-time
              snowflake in the first month, on top of the same minimum. Each month the growing balance is charged
              interest at the APR, the payment is applied to interest first and principal second, and the remaining
              balance carries forward. The difference in months and interest between the two runs is the value of the
              snowflakes.
            </p>
            <p>
              Enter a realistic monthly snowflake average rather than a best-case figure; a modest, repeatable amount
              produces a schedule you can actually keep. The one-time field covers windfalls like tax refunds or bonus
              checks, which do their heaviest work in the first month because the balance they reduce would have accrued
              interest for the entire remaining term. If the minimum payment does not cover accrued interest, the tool
              flags it, because at that point no amount of snowflaking can outrun a growing balance until the payment
              rises above the interest line.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the months to debt-free under the snowflake plan and compares it with the
              minimum-only schedule. The three-stat bar reports the interest saved, the months saved and the total
              snowflake dollars contributed, while the table lines up both scenarios so you can see where the difference
              comes from.
            </p>
            <p>
              Notice how large the snowflake share of total payments can grow while each individual snowflake stays
              small — that is the mechanic worth internalizing. Also treat the result as a floor rather than a ceiling:
              if a month yields more snowflakes than the average you entered, apply them anyway, and consider re-running
              the numbers periodically. Once the target balance reaches zero, roll the entire payment — minimum plus
              snowflakes — onto the next debt, so the amount that clears one balance starts attacking the next. A
              dedicated sub-account for snowflake money, emptied to the debt each payday, keeps the habit on schedule
              instead of letting recovered cash quietly drift back into ordinary spending.
            </p>
            <p>
              Every extra dollar of principal also compounds in reverse: interest not charged this month becomes principal
              reduction next month. That reversal is why the total snowflake dollars contributed in the summary usually
              looks smaller than the interest saved, and why the ratio between them widens the earlier the snowflakes
              land.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-snowflake-calculator" />
          <PopularCalculators exclude="/calculator/debt-snowflake-calculator" />
        </div>
      </div>
    </>
  );
}
