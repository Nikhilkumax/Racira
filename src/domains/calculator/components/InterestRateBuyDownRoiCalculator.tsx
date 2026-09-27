"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BuyDownInputs {
  loanAmount: number;
  baseRate: number;
  boughtDownRate: number;
  years: number;
  pointsPct: number;
  otherCosts: number;
}

const DEFAULTS: BuyDownInputs = {
  loanAmount: 400000,
  baseRate: 6.75,
  boughtDownRate: 6.0,
  years: 30,
  pointsPct: 1.5,
  otherCosts: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

interface BuyDownResult {
  basePayment: number;
  newPayment: number;
  monthlySavings: number;
  upfrontCost: number;
  breakEvenMonths: number;
  lifetimeSavings: number;
  baseInterest: number;
  newInterest: number;
  roiPct: number;
  valid: boolean;
  errorMsg: string;
}

function computeBuyDown(i: BuyDownInputs): BuyDownResult {
  const invalid =
    i.loanAmount <= 0 || i.years <= 0 || i.baseRate < 0 || i.boughtDownRate < 0 || i.pointsPct < 0 || i.otherCosts < 0;

  const n = Math.round(i.years * 12);
  const basePayment = paymentFor(i.loanAmount, i.baseRate / 100 / 12, n);
  const newPayment = paymentFor(i.loanAmount, i.boughtDownRate / 100 / 12, n);
  const monthlySavings = basePayment - newPayment;
  const upfrontCost = (i.loanAmount * i.pointsPct) / 100 + i.otherCosts;
  const baseInterest = basePayment * n - i.loanAmount;
  const newInterest = newPayment * n - i.loanAmount;
  const breakEvenMonths = monthlySavings > 0 ? upfrontCost / monthlySavings : 0;
  const lifetimeSavings = monthlySavings * n - upfrontCost;
  const roiPct = upfrontCost > 0 ? (lifetimeSavings / upfrontCost) * 100 : 0;

  return {
    basePayment,
    newPayment,
    monthlySavings,
    upfrontCost,
    breakEvenMonths,
    lifetimeSavings,
    baseInterest,
    newInterest,
    roiPct,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount and term, non-negative rates, and non-negative point/cost figures."
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

export default function InterestRateBuyDownRoiCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [baseRate, setBaseRate] = useState(String(DEFAULTS.baseRate));
  const [boughtDownRate, setBoughtDownRate] = useState(String(DEFAULTS.boughtDownRate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [pointsPct, setPointsPct] = useState(String(DEFAULTS.pointsPct));
  const [otherCosts, setOtherCosts] = useState(String(DEFAULTS.otherCosts));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BuyDownInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    baseRate: parseFloat(baseRate) || 0,
    boughtDownRate: parseFloat(boughtDownRate) || 0,
    years: parseFloat(years) || 0,
    pointsPct: parseFloat(pointsPct) || 0,
    otherCosts: parseFloat(otherCosts) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<BuyDownInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BuyDownResult>(() => computeBuyDown(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBuyDown(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setBaseRate(String(DEFAULTS.baseRate));
    setBoughtDownRate(String(DEFAULTS.boughtDownRate));
    setYears(String(DEFAULTS.years));
    setPointsPct(String(DEFAULTS.pointsPct));
    setOtherCosts(String(DEFAULTS.otherCosts));
    setCalcInputs(DEFAULTS);
    setResults(computeBuyDown(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does it mean to buy down an interest rate?",
      answer:
        "Buying down a rate means paying discount points at closing in exchange for a lower interest rate for the life of the loan. One point costs 1% of the loan amount and typically reduces the rate by roughly 0.25 percentage points, though the exact reduction depends on the lender and market. Permanent buy-downs reduce the rate for the whole term; temporary buy-downs, common with builder incentives, lower the rate only for the first few years.",
    },
    {
      question: "How is the break-even point calculated?",
      answer:
        "Break-even is the upfront cost of the points divided by the monthly payment saving. If you pay $6,000 in points to reduce your payment by $150 a month, you break even after 40 months, or just over three years. Anything you save after that month is profit, so the decision hinges on whether you expect to keep this loan longer than the break-even period.",
    },
    {
      question: "Are discount points tax deductible?",
      answer:
        "Points paid on a loan used to buy or improve your main home are often deductible in the year paid, subject to the same itemising requirements as mortgage interest, while points on a refinance are generally deducted over the life of the loan. Because many households now take the standard deduction, the tax value of points may be zero. Confirm your specific situation with a tax professional before relying on a deduction.",
    },
    {
      question: "When does buying down the rate make sense?",
      answer:
        "It makes the most sense when you plan to hold the loan well past the break-even month, when you have cash available that would otherwise earn less than the effective return on the buy-down, and when the lender's rate reduction per point is generous. It makes little sense if you expect to sell, refinance, or pay the loan off before you cross break-even, because the saving never materialises.",
    },
    {
      question: "Can I compare a buy-down against investing the same cash?",
      answer:
        "Yes, and the ROI figure in the Summary is the place to start. The calculator expresses lifetime savings as a percentage of the upfront cost, which is effectively the return on the money you tie up in points. Compare that figure with the after-tax return you could earn elsewhere, and remember that the buy-down return is risk-free and realised gradually over the term rather than immediately.",
    },
  ];

  const breakdownRows = [
    {
      label: "Base Loan",
      rate: `${fmt(calcInputs.baseRate, 3)}%`,
      payment: `$${fmt(results.basePayment)}`,
      interest: `$${fmt(results.baseInterest, 0)}`,
    },
    {
      label: "Bought-Down Loan",
      rate: `${fmt(calcInputs.boughtDownRate, 3)}%`,
      payment: `$${fmt(results.newPayment)}`,
      interest: `$${fmt(results.newInterest, 0)}`,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Interest Rate Buy-Down ROI Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Interest Rate Buy-Down ROI Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan & Rates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Principal being financed."
                />
                <CompactInput
                  id="base-rate"
                  label="Base Interest Rate"
                  value={baseRate}
                  onChange={setBaseRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Rate offered with no discount points."
                />
              </div>
            </SubSection>

            <SubSection title="Buy-Down Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="bought-rate"
                  label="Bought-Down Rate"
                  value={boughtDownRate}
                  onChange={setBoughtDownRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Lower rate after paying discount points."
                />
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Amortisation term in years."
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
                  <SubSection title="Points & Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="points"
                        label="Discount Points"
                        value={pointsPct}
                        onChange={setPointsPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.25"
                        min="0"
                        tooltip="Cost of the points as a percentage of the loan (1 point = 1%)."
                      />
                      <CompactInput
                        id="other-costs"
                        label="Other Upfront Costs"
                        value={otherCosts}
                        onChange={setOtherCosts}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Any additional lender costs tied to the buy-down."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Break-Even Period</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.monthlySavings > 0 ? `${fmt(results.breakEvenMonths, 1)} months` : "No saving"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                ${fmt(results.upfrontCost, 0)} up front to save ${fmt(results.monthlySavings)} / month
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Saving</span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlySavings)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Upfront Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.upfrontCost, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lifetime Saving</span>
                <span className="font-extrabold text-foreground">${fmt(results.lifetimeSavings, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scenario</th>
                    <th className="p-2.5 text-right w-[90px]">Rate</th>
                    <th className="p-2.5 text-right w-[110px]">Payment</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Total Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.rate}</td>
                      <td className="p-2.5 text-right text-foreground">{row.payment}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.interest}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Difference</td>
                    <td className="p-2.5 text-right text-foreground">
                      {fmt(calcInputs.baseRate - calcInputs.boughtDownRate, 3)}%
                    </td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.monthlySavings)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      ${fmt(results.baseInterest - results.newInterest, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Base Payment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.basePayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bought-Down Payment</span>
                  <span className="text-base font-bold text-primary">${fmt(results.newPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Points + Costs</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.upfrontCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-Even</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.breakEvenMonths, 1)} months</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lifetime Net Saving</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.lifetimeSavings, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ROI on Points</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.roiPct, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Interest Rate Buy-Down ROI Calculator?</h2>
            <p>
              A rate buy-down is a trade: you hand the lender cash at closing, and in return your interest rate falls for
              the life of the loan. The cash takes the form of discount points, where one point equals one percent of the
              loan amount, and the reward is a smaller monthly payment and less interest over the term. The question the
              trade really asks is whether the money you hand over earns back more than it costs, and this calculator
              answers that by computing the break-even period, the lifetime saving, and the return on the cash you commit.
            </p>
            <p>
              The decision is not automatic in either direction. A buy-down that pays for itself in three years is
              attractive to a borrower who intends to stay put, while the same buy-down is poor value to someone who
              expects to refinance or sell within two years. Turning the choice into a rate of return, and comparing that
              return against the alternatives for your cash, is the point of the calculation.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator computes two loan schedules from the standard amortisation formula
              PMT = P x r / (1 - (1 + r)^-n): one at your base rate and one at the bought-down rate, using the same
              principal and term. The monthly saving is the difference between the two payments, and the upfront cost is
              the points percentage applied to the loan amount plus any additional costs you entered. Dividing the
              upfront cost by the monthly saving gives the break-even period in months.
            </p>
            <p>
              Lifetime saving is the monthly saving multiplied by the number of payments, minus the upfront cost, so it
              represents the net benefit if you keep the loan to maturity. ROI expresses that net benefit as a percentage
              of the upfront cost, which is the effective return on the cash you tied up in points. Total interest under
              each scenario is also reported so the interest reduction is visible directly.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the break-even period, with the monthly saving, upfront cost, and lifetime saving
              beside it. If break-even lands inside the time you expect to hold the loan, the buy-down is working in your
              favour; if it lands outside, you would sell or refinance before recovering the cost. The breakdown table
              compares payment and total interest under both rates, and the difference row shows the interest reduction
              the points purchase.
            </p>
            <p>
              Summary Statistics adds both payments, the total upfront cost, the break-even month, the net lifetime
              saving, and the ROI on the points. Remember that the return is realised gradually and only if you hold the
              loan, that points may or may not be tax deductible depending on how you itemise and how the funds are used,
              and that a temporary buy-down reverts after its introductory period, which changes the arithmetic
              completely. Treat the output as a planning estimate and confirm the exact point cost and rate reduction
              with your lender before deciding.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-rate-buy-down-roi-calculator" />
          <PopularCalculators exclude="/calculator/interest-rate-buy-down-roi-calculator" />
        </div>
      </div>
    </>
  );
}
