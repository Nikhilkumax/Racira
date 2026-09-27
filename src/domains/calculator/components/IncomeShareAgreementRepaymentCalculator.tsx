"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface IsaInputs {
  funding: number;
  incomeShare: number;
  annualIncome: number;
  incomeGrowth: number;
  capMultiple: number;
  termMonths: number;
  threshold: number;
}

const DEFAULTS: IsaInputs = {
  funding: 30000,
  incomeShare: 5,
  annualIncome: 60000,
  incomeGrowth: 3,
  capMultiple: 1.5,
  termMonths: 120,
  threshold: 0,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface IsaResult {
  monthlyPayment: number;
  totalPaid: number;
  monthsToComplete: number;
  capReached: boolean;
  capAmount: number;
  effectiveMultiple: number;
  effectiveApr: number;
  premium: number;
  schedule: { year: number; income: number; annualPayment: number; cumulative: number }[];
  valid: boolean;
  errorMsg: string;
}

function computeIsa(i: IsaInputs): IsaResult {
  const invalid =
    i.funding <= 0 ||
    i.incomeShare <= 0 ||
    i.incomeShare >= 100 ||
    i.annualIncome < 0 ||
    i.capMultiple <= 0 ||
    i.termMonths <= 0;

  const capAmount = i.funding * i.capMultiple;
  const term = Math.round(i.termMonths);

  const paymentAt = (income: number) =>
    Math.max(0, ((income - i.threshold) / 12) * (i.incomeShare / 100));

  let cumulative = 0;
  let monthsToComplete = term;
  let capReached = false;
  const payments: number[] = [];

  for (let m = 1; m <= term; m++) {
    const income = i.annualIncome * Math.pow(1 + i.incomeGrowth / 100, (m - 1) / 12);
    let pay = paymentAt(income);
    if (cumulative + pay >= capAmount) {
      pay = capAmount - cumulative;
      payments.push(pay);
      cumulative += pay;
      monthsToComplete = m;
      capReached = true;
      break;
    }
    payments.push(pay);
    cumulative += pay;
  }

  // Effective annualised cost: discount the payment stream at the rate that
  // makes its present value equal the original funding.
  const pv = (r: number) => payments.reduce((acc, p, idx) => acc + p / Math.pow(1 + r, idx + 1), 0);
  let lo = 0;
  let hi = 1;
  if (pv(hi) > i.funding) {
    for (let k = 0; k < 120; k++) {
      const mid = (lo + hi) / 2;
      if (pv(mid) > i.funding) lo = mid;
      else hi = mid;
    }
  }
  const monthlyRate = (lo + hi) / 2;
  const effectiveApr = monthlyRate * 12 * 100;

  const schedule: { year: number; income: number; annualPayment: number; cumulative: number }[] = [];
  const years = Math.min(Math.ceil(monthsToComplete / 12), 12);
  let running = 0;
  for (let y = 1; y <= years; y++) {
    let annual = 0;
    for (let m = (y - 1) * 12; m < Math.min(y * 12, monthsToComplete); m++) annual += payments[m];
    running += annual;
    schedule.push({
      year: y,
      income: i.annualIncome * Math.pow(1 + i.incomeGrowth / 100, y - 1),
      annualPayment: annual,
      cumulative: running,
    });
  }

  return {
    monthlyPayment: payments.length > 0 ? payments[0] : 0,
    totalPaid: cumulative,
    monthsToComplete,
    capReached,
    capAmount,
    effectiveMultiple: i.funding > 0 ? cumulative / i.funding : 0,
    effectiveApr,
    premium: cumulative - i.funding,
    schedule,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive funding amount, an income share below 100%, and a positive cap and term."
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

export default function IncomeShareAgreementRepaymentCalculator() {
  const [funding, setFunding] = useState(String(DEFAULTS.funding));
  const [incomeShare, setIncomeShare] = useState(String(DEFAULTS.incomeShare));
  const [annualIncome, setAnnualIncome] = useState(String(DEFAULTS.annualIncome));
  const [incomeGrowth, setIncomeGrowth] = useState(String(DEFAULTS.incomeGrowth));
  const [capMultiple, setCapMultiple] = useState(String(DEFAULTS.capMultiple));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [threshold, setThreshold] = useState(String(DEFAULTS.threshold));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): IsaInputs => ({
    funding: parseFloat(funding) || 0,
    incomeShare: parseFloat(incomeShare) || 0,
    annualIncome: parseFloat(annualIncome) || 0,
    incomeGrowth: parseFloat(incomeGrowth) || 0,
    capMultiple: parseFloat(capMultiple) || 0,
    termMonths: parseFloat(termMonths) || 0,
    threshold: parseFloat(threshold) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<IsaInputs>(() => DEFAULTS);
  const [results, setResults] = useState<IsaResult>(() => computeIsa(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeIsa(inputs));
  };

  const reset = () => {
    setFunding(String(DEFAULTS.funding));
    setIncomeShare(String(DEFAULTS.incomeShare));
    setAnnualIncome(String(DEFAULTS.annualIncome));
    setIncomeGrowth(String(DEFAULTS.incomeGrowth));
    setCapMultiple(String(DEFAULTS.capMultiple));
    setTermMonths(String(DEFAULTS.termMonths));
    setThreshold(String(DEFAULTS.threshold));
    setCalcInputs(DEFAULTS);
    setResults(computeIsa(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is an income share agreement?",
      answer:
        "An income share agreement funds education or training in exchange for a fixed percentage of your future income for a set number of months. Unlike a loan there is no interest rate, but repayment continues until a cap is reached or the term expires, so the total cost depends entirely on how much you earn during the repayment window.",
    },
    {
      question: "How is the monthly payment calculated?",
      answer:
        "The payment is the income share percentage applied to your monthly income, less any income protection threshold written into the agreement. If you earn below the threshold you owe nothing that month, and the missed months do not usually extend the term, which is the main borrower protection built into the structure.",
    },
    {
      question: "What does the payment cap mean?",
      answer:
        "Most agreements stop payments once you have repaid a multiple of the original funding, commonly one and a half times. Reaching that cap early ends the obligation even if months remain on the term. High earners reach the cap quickly and end up paying considerably more than the amount advanced, which is where the effective cost of the agreement becomes visible.",
    },
    {
      question: "How does the effective APR compare with a student loan?",
      answer:
        "The effective annual rate discounts your actual payment stream back to the funding amount, so it is directly comparable with a loan rate. Low earners often see a very low effective rate while high earners can see a double-digit one, because the cap is triggered sooner. Run both your expected and a higher salary through the calculator before signing.",
    },
    {
      question: "What happens if my income is low for years?",
      answer:
        "With a threshold in place, low-income months generate little or no payment, and the agreement typically expires at the end of the term with the remaining balance forgiven. That downside protection is the strongest argument in favour of the structure, but it is paired with the upside cost of paying the full cap if your career earnings accelerate.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Income Share Agreement Repayment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Income Share Agreement Repayment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Agreement Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="funding"
                  label="Amount Funded"
                  value={funding}
                  onChange={setFunding}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Money advanced under the agreement."
                />
                <CompactInput
                  id="share"
                  label="Income Share"
                  value={incomeShare}
                  onChange={setIncomeShare}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.5"
                  tooltip="Percentage of income paid each month."
                />
              </div>
            </SubSection>

            <SubSection title="Income Assumptions">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="income"
                  label="Starting Income"
                  value={annualIncome}
                  onChange={setAnnualIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Annual income in the first year of repayment."
                />
                <CompactInput
                  id="growth"
                  label="Income Growth"
                  value={incomeGrowth}
                  onChange={setIncomeGrowth}
                  onEnter={runCalculate}
                  suffix="%/yr"
                  step="0.5"
                  tooltip="Expected annual increase in income."
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
                  <SubSection title="Cap & Protections">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="cap"
                        label="Payment Cap"
                        value={capMultiple}
                        onChange={setCapMultiple}
                        onEnter={runCalculate}
                        suffix="x"
                        min="1"
                        step="0.1"
                        tooltip="Maximum multiple of the funded amount you can repay."
                      />
                      <CompactInput
                        id="term"
                        label="Term"
                        value={termMonths}
                        onChange={setTermMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="Months of repayment in the agreement."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="threshold"
                        label="Income Protection"
                        value={threshold}
                        onChange={setThreshold}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Annual income below which no payment is due."
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

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Repaid</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.totalPaid)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.effectiveMultiple, 2)}x the {money(calcInputs.funding)} advanced &middot;{" "}
                {results.capReached ? "cap reached" : "term completed"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months to Complete</span>
                <span className="font-extrabold text-foreground">{results.monthsToComplete}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Cost</span>
                <span className="font-extrabold text-foreground">{money(results.premium)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective APR</span>
                <span className="font-extrabold text-primary">{fmt(results.effectiveApr, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[110px]">Income</th>
                    <th className="p-2.5 text-right w-[110px]">Paid</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.income)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.annualPayment)}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{money(row.cumulative)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.totalPaid)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Amount Funded</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.funding)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment Cap</span>
                  <span className="text-base font-bold text-foreground">{money(results.capAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cap Reached</span>
                  <span className="text-base font-bold text-foreground">{results.capReached ? "Yes" : "No"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Repaid</span>
                  <span className="text-base font-bold text-primary">{money(results.totalPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Multiple</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveMultiple, 2)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost Above Funding</span>
                  <span className="text-base font-bold text-foreground">{money(results.premium)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Term Length</span>
                  <span className="text-base font-bold text-foreground">{Math.round(calcInputs.termMonths)} mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Income Share Agreement Repayment Calculator?</h2>
            <p>
              An income share agreement repayment calculator projects what you will actually pay under a contract that
              funds your education in exchange for a percentage of your income. There is no interest rate in the usual
              sense, so the familiar loan comparison does not apply. Instead the cost depends on how much you earn, for how
              long, and at what point the contract's repayment cap stops the obligation.
            </p>
            <p>
              That makes the calculator useful before signing rather than after. The same agreement can be cheap for a
              graduate who spends years on a modest salary and expensive for one whose earnings climb quickly, because the
              cap is triggered sooner and the payments are correspondingly larger. Running a low, expected and high income
              scenario side by side is the only reliable way to judge whether the terms are reasonable.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Repayment Is Calculated</h2>
            <p>
              The payment in any month is the income share percentage applied to that month's income, less the income
              protection threshold written into the contract. Income is grown at the assumed annual rate, so the payment
              rises gradually rather than staying flat. Payments accumulate month by month until either the term expires or
              the cumulative total reaches the cap, which is set as a multiple of the amount originally funded. Reaching the
              cap ends the obligation immediately, even if months remain.
            </p>
            <p>
              To make the agreement comparable with a loan, the calculator also derives an effective annual rate. It finds the
              discount rate that makes the present value of the projected payment stream equal the funding amount, using a
              numeric search because the payments are uneven. That figure can be checked directly against the interest rate
              quoted on a private student loan with the same repayment horizon.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total repaid with the effective multiple of the funding and whether the cap or the
              term ended the obligation. The three statistics beside it give the number of months to completion, the cost
              above the amount advanced, and the effective annual rate. The breakdown table shows the year-by-year projection
              of income, annual payment and cumulative total, which makes the point at which the cap binds easy to spot.
            </p>
            <p>
              Summary Statistics collects the amount funded, the first payment, the cap value, whether the cap was reached,
              the total repaid, the effective multiple, the premium over the funding and the term. Treat the effective rate
              as the headline comparison: if it exceeds the rate on an available student loan without an income-linked
              obligation, the loan is the cheaper instrument. If your likely earnings are low for several years, the
              protection threshold and the eventual forgiveness at term end can make the agreement the safer choice despite a
              higher notional cost.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-share-agreement-repayment-calculator" />
          <PopularCalculators exclude="/calculator/income-share-agreement-repayment-calculator" />
        </div>
      </div>
    </>
  );
}
