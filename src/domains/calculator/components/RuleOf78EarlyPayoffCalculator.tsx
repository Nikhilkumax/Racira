"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface Rule78Inputs {
  amountFinanced: number;
  financeCharge: number;
  termMonths: number;
  monthsPaid: number;
}

const DEFAULTS: Rule78Inputs = {
  amountFinanced: 12000,
  financeCharge: 1450,
  termMonths: 48,
  monthsPaid: 18,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function impliedApr(principal: number, payment: number, n: number): number {
  if (principal <= 0 || payment <= 0 || n <= 0) return 0;
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 120; k++) {
    const mid = (lo + hi) / 2;
    const f = Math.pow(1 + mid, n);
    const pv = mid === 0 ? payment * n : (payment * (1 - 1 / f)) / mid;
    if (pv > principal) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

interface Rule78Result {
  monthlyPayment: number;
  totalOfPayments: number;
  totalDigits: number;
  earnedInterest: number;
  rebate78: number;
  proRataRebate: number;
  payoff78: number;
  payoffProRata: number;
  rule78Cost: number;
  interestPaidPct: number;
  rebateSharePct: number;
  remainingPayments: number;
  impliedAprValue: number;
  valid: boolean;
  errorMsg: string;
}

function computeRule78(i: Rule78Inputs): Rule78Result {
  const n = Math.round(i.termMonths);
  const m = Math.min(Math.max(0, Math.round(i.monthsPaid)), n);
  const invalid =
    i.amountFinanced <= 0 || i.financeCharge < 0 || i.termMonths <= 0 || i.monthsPaid < 0 || i.monthsPaid > i.termMonths;

  const monthlyPayment = n > 0 ? (i.amountFinanced + i.financeCharge) / n : 0;
  const totalOfPayments = monthlyPayment * n;
  const totalDigits = (n * (n + 1)) / 2;
  const earnedParts = (m * (2 * n - m + 1)) / 2;
  const earnedInterest = totalDigits > 0 ? i.financeCharge * (earnedParts / totalDigits) : 0;
  const rebate78 = i.financeCharge - earnedInterest;
  const proRataRebate = n > 0 ? i.financeCharge * ((n - m) / n) : 0;
  const remainingPayments = n - m;
  const unpaidPayments = remainingPayments * monthlyPayment;
  const payoff78 = unpaidPayments - rebate78;
  const payoffProRata = unpaidPayments - proRataRebate;

  return {
    monthlyPayment,
    totalOfPayments,
    totalDigits,
    earnedInterest,
    rebate78: Math.max(0, rebate78),
    proRataRebate: Math.max(0, proRataRebate),
    payoff78: Math.max(0, payoff78),
    payoffProRata: Math.max(0, payoffProRata),
    rule78Cost: Math.max(0, payoff78 - payoffProRata),
    interestPaidPct: i.financeCharge > 0 ? (earnedInterest / i.financeCharge) * 100 : 0,
    rebateSharePct: i.financeCharge > 0 ? (Math.max(0, rebate78) / i.financeCharge) * 100 : 0,
    remainingPayments,
    impliedAprValue: n > 0 ? impliedApr(i.amountFinanced, monthlyPayment, n) : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an amount financed and term above zero, a non-negative finance charge, and months paid between zero and the term."
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

export default function RuleOf78EarlyPayoffCalculator() {
  const [amountFinanced, setAmountFinanced] = useState(String(DEFAULTS.amountFinanced));
  const [financeCharge, setFinanceCharge] = useState(String(DEFAULTS.financeCharge));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [monthsPaid, setMonthsPaid] = useState(String(DEFAULTS.monthsPaid));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): Rule78Inputs => ({
    amountFinanced: parseFloat(amountFinanced) || 0,
    financeCharge: parseFloat(financeCharge) || 0,
    termMonths: parseFloat(termMonths) || 0,
    monthsPaid: parseFloat(monthsPaid) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<Rule78Inputs>(() => DEFAULTS);
  const [results, setResults] = useState<Rule78Result>(() => computeRule78(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeRule78(inputs));
  };

  const reset = () => {
    setAmountFinanced(String(DEFAULTS.amountFinanced));
    setFinanceCharge(String(DEFAULTS.financeCharge));
    setTermMonths(String(DEFAULTS.termMonths));
    setMonthsPaid(String(DEFAULTS.monthsPaid));
    setCalcInputs(DEFAULTS);
    setResults(computeRule78(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the Rule of 78?",
      answer:
        "The Rule of 78 — also called the sum-of-the-digits method — is a formula for allocating precomputed interest across the months of a loan. Instead of charging interest in proportion to the balance outstanding, it assigns more interest to the earliest months. The name comes from a twelve-month loan: the digits one through twelve sum to seventy-eight, and the first month carries twelve of those parts while the last carries one. A payoff early in the term therefore returns less unearned interest than a balance-based method would.",
    },
    {
      question: "Why does the Rule of 78 cost me money on an early payoff?",
      answer:
        "Because the lender has already counted most of the finance charge as earned. If you settle in month eighteen of a forty-eight-month loan, the rule has credited roughly sixty percent of the total interest to the lender, while a pro-rata method would credit only about thirty-eight percent. The gap is the extra amount you pay for the privilege of paying off early. This calculator shows both figures so the difference is explicit rather than buried in a payoff quote.",
    },
    {
      question: "Is the Rule of 78 still legal?",
      answer:
        "For consumer credit, the United States prohibited the Rule of 78 for loans with a term longer than sixty months in 1992, and several states restrict or prohibit it outright. Many short-term installment contracts, some auto loans and certain personal loans still use it. The practical step is to read the prepayment terms before signing: a contract that mentions sum-of-the-digits, precomputed interest or a rebate formula is the one where an early payoff behaves differently.",
    },
    {
      question: "How do I compare an early payoff under both methods?",
      answer:
        "Divide total payments into interest and principal using each method. Under the Rule of 78, the earned interest to date is the finance charge multiplied by the sum of the digits used so far, divided by the sum of all digits. Under the pro-rata method, earned interest is simply the finance charge times the share of the term that has elapsed. Subtract each from the unpaid payments to get the two payoff amounts; the lower one is what a fairer method would charge.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Rule of 78 Early Payoff Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Rule of 78 Early Payoff Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Precomputed Loan Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount-financed"
                  label="Amount Financed"
                  value={amountFinanced}
                  onChange={setAmountFinanced}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The principal you borrowed, before any finance charge."
                />
                <CompactInput
                  id="finance-charge"
                  label="Finance Charge"
                  value={financeCharge}
                  onChange={setFinanceCharge}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total precomputed interest and fees built into the contract."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="term-months"
                  label="Term in Months"
                  value={termMonths}
                  onChange={setTermMonths}
                  onEnter={runCalculate}
                  min="1"
                  tooltip="Scheduled number of monthly payments."
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
                  <SubSection title="Payoff Timing">
                    <CompactInput
                      id="months-paid"
                      label="Months Paid Before Payoff"
                      value={monthsPaid}
                      onChange={setMonthsPaid}
                      onEnter={runCalculate}
                      min="0"
                      tooltip="How many scheduled payments you will have made before settling the loan."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Rule of 78 Rebate</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.rebate78, 2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`Unearned finance charge returned after ${fmt(calcInputs.monthsPaid, 0)} of ${fmt(calcInputs.termMonths, 0)} payments`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payoff Today</span>
                <span className="font-extrabold text-foreground">${fmt(results.payoff78, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pro-Rata Payoff</span>
                <span className="font-extrabold text-foreground">${fmt(results.payoffProRata, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra Cost</span>
                <span className={`font-extrabold ${results.rule78Cost > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  ${fmt(results.rule78Cost, 0)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Rebate Line</th>
                    <th className="p-2.5 text-right w-[140px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Monthly payment</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.monthlyPayment, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(calcInputs.termMonths, 0)} payments</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total of payments</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalOfPayments, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">Principal + charge</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest earned by lender</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.earnedInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.interestPaidPct, 1)}% of charge</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Rule of 78 rebate</td>
                    <td className="p-2.5 text-right font-semibold text-foreground">${fmt(results.rebate78, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">remaining digits</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Pro-rata rebate</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.proRataRebate, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">unused term share</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Payoff amount (Rule of 78)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.payoff78, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">settlement today</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Extra cost of Rule of 78</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.rule78Cost, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">versus pro-rata</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Implied APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.impliedAprValue, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sum of Digits</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.totalDigits, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rebate Share of Charge</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.rebateSharePct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining Payments</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.remainingPayments, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Finance Charge</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.financeCharge, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Signal</span>
                  <span className={`text-base font-bold ${results.rule78Cost > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {results.rule78Cost > 0 ? "Rebate underpaid" : "Level with pro-rata"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Rule of 78 Early Payoff Calculator?</h2>
            <p>
              A Rule of 78 early payoff calculator shows how much unearned interest a precomputed loan returns when you
              settle it before the final payment. Precomputed loans fold the entire finance charge into the contract up
              front and then decide how much of it the lender has earned by any given month. The Rule of 78 is one such
              allocation method, and it front-loads interest heavily — so paying off early refunds less than many
              borrowers expect.
            </p>
            <p>
              The calculator applies the rule and a straight pro-rata method to the same loan, then reports both payoff
              amounts and the difference between them. That gap is the real price of the early payoff, and seeing it in
              dollars is far more useful than reading a contract clause about a rebate formula.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The Rule of 78 assigns each month a weight equal to its position counted backward from the end of the term.
              A twelve-month loan gives the first month twelve shares of interest, the second eleven, and so on down to
              one for the final month. Those weights sum to seventy-eight — hence the name. To find the interest earned
              after a given number of payments, the calculator multiplies the finance charge by the weights consumed so
              far and divides by the total weight; the remainder is the rebate.
            </p>
            <p>
              Under a pro-rata method the finance charge is spread evenly, so earned interest is simply the share of the
              term already completed. The payoff amount in each case is the unpaid scheduled payments minus the
              corresponding rebate. The calculator also solves for the implied APR — the rate at which the scheduled
              payments would have to be discounted to equal the amount financed — which for a precomputed loan often
              lands above the advertised rate.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the Rule of 78 rebate, the amount the contract recognizes as unearned after the
              payments you have made. The three-stat bar compares the settlement under the rule with the pro-rata figure
              and highlights the extra cost between them, while the table walks through every step from the monthly
              payment to both payoff amounts.
            </p>
            <p>
              A large extra cost is worth challenging. Ask the lender for a written payoff quote and a breakdown of the
              rebate, then check whether your state restricts the Rule of 78 for the loan type in question. Many
              consumer contracts above sixty months are already barred from using it, and a written request sometimes
              produces a recalculated payoff that reflects a fairer method.
            </p>
            <p>
              Finally, weigh the payoff against the alternatives. If the loan is on a schedule you can afford, the rebate
              penalty can make early settlement uneconomic compared with simply keeping the payments and investing the
              cash elsewhere. If the rate is punishing and the term is long, the rebate may still be worth paying to
              eliminate the obligation. Running both figures side by side, with the implied APR in view, is the only way
              to know which case you are in.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rule-of-78-early-payoff-calculator" />
          <PopularCalculators exclude="/calculator/rule-of-78-early-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
