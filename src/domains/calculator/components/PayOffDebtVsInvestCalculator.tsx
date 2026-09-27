"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface CompareInputs {
  debtBalance: number;
  debtApr: number;
  monthlyAmount: number;
  minimumPayment: number;
  expectedReturn: number;
  horizonYears: number;
  marginalTaxRate: number;
}

const DEFAULTS: CompareInputs = {
  debtBalance: 12000,
  debtApr: 19.99,
  monthlyAmount: 500,
  minimumPayment: 250,
  expectedReturn: 7,
  horizonYears: 5,
  marginalTaxRate: 22,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function payoffFirstLong(
  balance: number,
  apr: number,
  monthly: number,
  investReturn: number,
  taxRate: number,
  horizon: number,
) {
  const r = apr / 100 / 12;
  const ri = ((investReturn / 100) * (1 - taxRate / 100)) / 12;
  let bal = balance;
  let interest = 0;
  let portfolio = 0;
  let payoffMonth = 0;
  let stalled = false;

  for (let m = 1; m <= horizon; m++) {
    if (bal > 0.005) {
      const i = bal * r;
      const pay = Math.min(monthly, bal + i);
      if (pay <= i) stalled = true;
      bal -= pay - i;
      interest += i;
      portfolio = portfolio * (1 + ri) + Math.max(0, monthly - pay);
      if (bal <= 0.005 && payoffMonth === 0) payoffMonth = m;
    } else {
      portfolio = portfolio * (1 + ri) + monthly;
    }
  }
  return { interest, portfolio, payoffMonth, debtLeft: Math.max(0, bal), stalled };
}

function investDifferenceLong(
  balance: number,
  apr: number,
  minimum: number,
  monthly: number,
  investReturn: number,
  taxRate: number,
  horizon: number,
) {
  const r = apr / 100 / 12;
  const ri = ((investReturn / 100) * (1 - taxRate / 100)) / 12;
  const investAmt = Math.max(0, monthly - minimum);
  let bal = balance;
  let interest = 0;
  let portfolio = 0;
  let payoffMonth = 0;
  let stalled = false;

  for (let m = 1; m <= horizon; m++) {
    if (bal > 0.005) {
      const i = bal * r;
      if (minimum <= i) {
        stalled = true;
        bal += minimum - i;
        interest += i;
      } else {
        const pay = Math.min(minimum, bal + i);
        bal -= pay - i;
        interest += i;
        if (bal <= 0.005 && payoffMonth === 0) payoffMonth = m;
      }
    }
    portfolio = portfolio * (1 + ri) + investAmt;
  }
  return { interest, portfolio, payoffMonth, debtLeft: Math.max(0, bal), stalled };
}

interface CompareResult {
  horizonMonths: number;
  debtFirstMonths: number;
  debtFirstInterest: number;
  debtFirstPortfolio: number;
  debtFirstNet: number;
  investInterest: number;
  investPortfolio: number;
  investDebtLeft: number;
  investNet: number;
  advantage: number;
  breakEvenReturn: number;
  afterTaxReturn: number;
  guaranteedReturn: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeCompare(i: CompareInputs): CompareResult {
  const invalid =
    i.debtBalance < 0 ||
    i.debtApr < 0 ||
    i.monthlyAmount <= 0 ||
    i.minimumPayment < 0 ||
    i.expectedReturn < 0 ||
    i.horizonYears <= 0 ||
    i.marginalTaxRate < 0 ||
    i.marginalTaxRate > 100;

  const horizon = Math.round(i.horizonYears * 12);
  const first = payoffFirstLong(
    i.debtBalance,
    i.debtApr,
    i.monthlyAmount,
    i.expectedReturn,
    i.marginalTaxRate,
    horizon,
  );
  const second = investDifferenceLong(
    i.debtBalance,
    i.debtApr,
    i.minimumPayment,
    i.monthlyAmount,
    i.expectedReturn,
    i.marginalTaxRate,
    horizon,
  );

  const debtFirstNet = first.portfolio;
  const investNet = second.portfolio - second.debtLeft;
  const advantage = debtFirstNet - investNet;

  // Break-even: the after-tax investment return at which investing the
  // difference matches attacking the debt first.
  let lo = 0;
  let hi = 60;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    const f = payoffFirstLong(i.debtBalance, i.debtApr, i.monthlyAmount, mid, i.marginalTaxRate, horizon);
    const s = investDifferenceLong(
      i.debtBalance,
      i.debtApr,
      i.minimumPayment,
      i.monthlyAmount,
      mid,
      i.marginalTaxRate,
      horizon,
    );
    if (f.portfolio - (s.portfolio - s.debtLeft) > 0) lo = mid;
    else hi = mid;
  }

  return {
    horizonMonths: horizon,
    debtFirstMonths: first.payoffMonth,
    debtFirstInterest: first.interest,
    debtFirstPortfolio: first.portfolio,
    debtFirstNet,
    investInterest: second.interest,
    investPortfolio: second.portfolio,
    investDebtLeft: second.debtLeft,
    investNet,
    advantage,
    breakEvenReturn: (lo + hi) / 2,
    afterTaxReturn: i.expectedReturn * (1 - i.marginalTaxRate / 100),
    guaranteedReturn: i.debtApr,
    stalled: first.stalled || second.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a non-negative balance and rate, a monthly amount above zero, and a horizon above zero."
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

export default function PayOffDebtVsInvestCalculator() {
  const [debtBalance, setDebtBalance] = useState(String(DEFAULTS.debtBalance));
  const [debtApr, setDebtApr] = useState(String(DEFAULTS.debtApr));
  const [monthlyAmount, setMonthlyAmount] = useState(String(DEFAULTS.monthlyAmount));
  const [minimumPayment, setMinimumPayment] = useState(String(DEFAULTS.minimumPayment));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [horizonYears, setHorizonYears] = useState(String(DEFAULTS.horizonYears));
  const [marginalTaxRate, setMarginalTaxRate] = useState(String(DEFAULTS.marginalTaxRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CompareInputs => ({
    debtBalance: parseFloat(debtBalance) || 0,
    debtApr: parseFloat(debtApr) || 0,
    monthlyAmount: parseFloat(monthlyAmount) || 0,
    minimumPayment: parseFloat(minimumPayment) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    horizonYears: parseFloat(horizonYears) || 0,
    marginalTaxRate: parseFloat(marginalTaxRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<CompareInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CompareResult>(() => computeCompare(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeCompare(inputs));
  };

  const reset = () => {
    setDebtBalance(String(DEFAULTS.debtBalance));
    setDebtApr(String(DEFAULTS.debtApr));
    setMonthlyAmount(String(DEFAULTS.monthlyAmount));
    setMinimumPayment(String(DEFAULTS.minimumPayment));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setHorizonYears(String(DEFAULTS.horizonYears));
    setMarginalTaxRate(String(DEFAULTS.marginalTaxRate));
    setCalcInputs(DEFAULTS);
    setResults(computeCompare(DEFAULTS));
  };

  const faqs = [
    {
      question: "Should I pay off debt or invest?",
      answer:
        "Compare the guaranteed return of eliminating the debt with the after-tax return you expect from investing. Paying off a 20% credit card delivers a risk-free 20% return, which almost no portfolio reliably matches. Paying off a 3% fixed mortgage delivers 3%, which a diversified portfolio has historically beaten over long horizons. The rate on the debt, not the size of the balance, is the deciding factor.",
    },
    {
      question: "How does the after-tax return change the comparison?",
      answer:
        "Investment gains face taxes, so the return that actually competes with debt payoff is the expected return reduced by your marginal rate on those gains. Interest on most consumer debt is not deductible, which means the payoff return stays untaxed and full-strength. That asymmetry is why a modest-looking card rate can still outcompete a higher headline market return.",
    },
    {
      question: "Is the debt payoff return really risk-free?",
      answer:
        "It is as close as investing gets. Every dollar of principal retired stops accruing interest with certainty, so the return does not depend on markets, earnings or luck. The one caveat is opportunity: money sent to a low-rate debt is money that misses market growth, and money sent to a high-rate debt is money that avoids a certain loss. Only the rate decides which effect dominates.",
    },
    {
      question: "What should I do with the freed-up payment after the debt is gone?",
      answer:
        "Redirect the entire amount into investments immediately. The calculator assumes this: once the balance clears, the full monthly amount goes to the portfolio for the rest of the horizon. Treating the former payment as new spending quietly gives back the advantage the payoff created, and it is the single most common way people lose the benefit of becoming debt-free.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Pay Off Debt vs Invest Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Pay Off Debt vs Invest Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="The Debt">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="debt-balance"
                  label="Debt Balance"
                  value={debtBalance}
                  onChange={setDebtBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total balance you could attack."
                />
                <CompactInput
                  id="debt-apr"
                  label="Debt Rate (APR)"
                  value={debtApr}
                  onChange={setDebtApr}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="The guaranteed return of eliminating this debt."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="monthly-amount"
                  label="Monthly to Deploy"
                  value={monthlyAmount}
                  onChange={setMonthlyAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Cash you can send to debt or investments each month."
                />
                <CompactInput
                  id="minimum-payment"
                  label="Required Minimum"
                  value={minimumPayment}
                  onChange={setMinimumPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The minimum you must keep paying while investing the difference."
                />
              </div>
            </SubSection>

            <SubSection title="The Investment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="expected-return"
                  label="Expected Return"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Annual pre-tax return you expect from investing."
                />
                <CompactInput
                  id="horizon-years"
                  label="Horizon in Years"
                  value={horizonYears}
                  onChange={setHorizonYears}
                  onEnter={runCalculate}
                  tooltip="How long you will compare the two strategies."
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
                  <SubSection title="Tax Treatment">
                    <CompactInput
                      id="marginal-tax"
                      label="Tax on Investment Gains"
                      value={marginalTaxRate}
                      onChange={setMarginalTaxRate}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      tooltip="Marginal rate applied to investment returns in the comparison."
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
                {results.advantage >= 0 ? "Debt-First Advantage" : "Investing Advantage"}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(Math.abs(results.advantage), 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.advantage >= 0
                  ? `Clearing the ${fmt(calcInputs.debtApr, 2)}% balance first wins over ${fmt(calcInputs.horizonYears, 0)} years`
                  : `Investing the difference outruns the ${fmt(calcInputs.debtApr, 2)}% payoff over ${fmt(calcInputs.horizonYears, 0)} years`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Debt-First Net</span>
                <span className="font-extrabold text-foreground">${fmt(results.debtFirstNet, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Invest Net</span>
                <span className="font-extrabold text-foreground">${fmt(results.investNet, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.breakEvenReturn, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Strategy Line</th>
                    <th className="p-2.5 text-right w-[130px]">Debt First</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Invest Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Months to clear the balance</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.debtFirstMonths, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.investDebtLeft <= 0.005 ? "Cleared" : "Still open"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest paid on debt</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.debtFirstInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.investInterest, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Portfolio at horizon</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.debtFirstPortfolio, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.investPortfolio, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt still owed at horizon</td>
                    <td className="p-2.5 text-right text-foreground">$0</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.investDebtLeft, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net position (portfolio less debt)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.debtFirstNet, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.investNet, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Guaranteed Payoff Return</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.guaranteedReturn, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">After-Tax Market Return</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.afterTaxReturn, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Comparison Horizon</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.horizonMonths, 0)} months</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Deployed</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.monthlyAmount, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Required Return to Match</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.breakEvenReturn, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Verdict</span>
                  <span className={`text-base font-bold ${results.advantage >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.advantage >= 0 ? "Attack the debt" : "Invest the difference"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Pay Off Debt vs Invest Calculator?</h2>
            <p>
              A pay off debt vs invest calculator settles a question most households answer by instinct: should spare
              cash go to a balance or a portfolio? The calculator runs both paths side by side over a fixed horizon and
              compares the net position each one produces — portfolio value minus any debt still owed. The winner is
              decided by the debt rate, the expected return and the tax treatment of investment gains, not by which choice
              feels more disciplined.
            </p>
            <p>
              Paying off debt earns a rate you can see and rely on. Investing earns a rate you hope for, taxed when
              realized. Because those two returns are not equivalent, comparing them requires care: the honest comparison
              is between the debt&apos;s guaranteed rate and the investment&apos;s after-tax expectation.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The first strategy sends the full monthly amount at the balance until it clears, then invests the same
              amount every month for the rest of the horizon. No interest accrues after payoff, so the portfolio begins
              compounding from that month. The second strategy keeps paying only the required minimum on the debt and
              invests the difference each month, leaving the loan to amortize on its own schedule.
            </p>
            <p>
              Each month both paths charge interest on the outstanding balance, tax the investment return at your
              marginal rate, and roll the results forward. At the horizon the calculator subtracts any remaining debt from
              the portfolio to get a net position for each strategy, then solves for the investment return at which the
              two are equal. That break-even return is the number to remember: above it, investing wins; below it, payoff
              wins.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card displays the winning strategy and the dollar advantage it carries. The three-stat bar sets
              the two net positions against each other and adds the break-even return, while the table breaks each
              strategy into months to clear, interest paid, portfolio value, remaining debt and final net position.
            </p>
            <p>
              Compare the guaranteed payoff return with the after-tax market return first. If the debt rate is higher, the
              math is decided unless you expect an unusually strong market run; if it is lower, the balance of probability
              favors investing while paying the minimum. Note that the model assumes the freed payment is redirected, not
              spent. Skipping that step removes most of the payoff advantage and is the most common way this comparison
              fails in practice.
            </p>
            <p>
              Finally, remember what the model cannot price: peace of mind, flexibility and risk. A guaranteed return is
              worth more than an uncertain one of the same size, so when the rates are close, the certain option usually
              deserves the tiebreak. Liquidity matters too — keeping a cash buffer while attacking debt prevents a small
              emergency from turning back into new borrowing. Re-run the comparison after any rate change, refinance or
              shift in your expected return, since the break-even point moves with every input, and a decision that was
              correct last year may no longer be the correct approach for your situation today.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pay-off-debt-vs-invest-calculator" />
          <PopularCalculators exclude="/calculator/pay-off-debt-vs-invest-calculator" />
        </div>
      </div>
    </>
  );
}
