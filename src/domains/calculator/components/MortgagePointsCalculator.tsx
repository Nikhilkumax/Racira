"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PointsInputs {
  loanAmount: number;
  rate: number;
  points: number;
  termYears: number;
  yearsStay: number;
  altRate: number;
  extraMonthly: number;
  decimals: number;
}

const DEFAULTS: PointsInputs = {
  loanAmount: 350000,
  rate: 6.125,
  points: 1,
  termYears: 30,
  yearsStay: 7,
  altRate: 6.5,
  extraMonthly: 0,
  decimals: 2,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const money = (v: number) => (Number.isFinite(v) ? "$" + fmt(v, 2) : "—");

const TERM_OPTIONS = [
  { value: "15", label: "15-year fixed" },
  { value: "20", label: "20-year fixed" },
  { value: "30", label: "30-year fixed" },
];

const DECIMAL_OPTIONS = [
  { value: "0", label: "Whole dollars" },
  { value: "2", label: "2 decimals" },
];

/** Standard amortising payment. */
function paymentFor(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r <= 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

interface PointsResult {
  valid: boolean;
  errorMsg: string;
  pointsCost: number;
  payment: number;
  paymentAlt: number;
  monthlySaving: number;
  breakEvenMonths: number;
  monthsAtStay: number;
  savedAtStay: number;
  netAtStay: number;
  totalInterest: number;
  totalInterestAlt: number;
  interestSaved: number;
  verdict: string;
  verdictColor: string;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculatePoints(i: PointsInputs): PointsResult {
  const blank = (errorMsg: string): PointsResult => ({
    valid: false,
    errorMsg,
    pointsCost: 0,
    payment: 0,
    paymentAlt: 0,
    monthlySaving: 0,
    breakEvenMonths: 0,
    monthsAtStay: 0,
    savedAtStay: 0,
    netAtStay: 0,
    totalInterest: 0,
    totalInterestAlt: 0,
    interestSaved: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [i.loanAmount, i.rate, i.points, i.termYears, i.yearsStay, i.altRate, i.extraMonthly, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field.");
  if (i.loanAmount < 50000 || i.loanAmount > 5000000) return blank("Loan amount should be between $50,000 and $5,000,000.");
  if (i.rate <= 0 || i.rate > 20) return blank("The with-points rate should be between 0.1% and 20%.");
  if (i.points < 0 || i.points > 5) return blank("Points should be between 0 and 5.");
  if (i.altRate <= 0 || i.altRate > 20) return blank("The no-points rate should be between 0.1% and 20%.");
  if (i.altRate <= i.rate) return blank("The no-points rate must be higher than the with-points rate for the comparison to mean anything.");
  if (i.termYears < 5 || i.termYears > 40) return blank("Term should be between 5 and 40 years.");
  if (i.yearsStay < 1 || i.yearsStay > i.termYears) return blank("Years in the home should be at least 1 and no more than the term.");
  if (i.extraMonthly < 0) return blank("Extra monthly payment cannot be negative.");

  const months = Math.round(i.termYears * 12);
  const monthsAtStay = Math.round(i.yearsStay * 12);
  const pointsCost = i.loanAmount * (i.points / 100);

  const payment = paymentFor(i.loanAmount, i.rate, months);
  const paymentAlt = paymentFor(i.loanAmount, i.altRate, months);
  const monthlySaving = paymentAlt - payment;
  if (monthlySaving <= 0) return blank("The with-points rate must produce a lower payment than the no-points rate.");

  const breakEvenMonths = pointsCost / monthlySaving;
  const savedAtStay = monthlySaving * Math.min(monthsAtStay, months);
  const netAtStay = savedAtStay - pointsCost;

  // Full-term interest under both rates, on the same balance.
  const totalInterest = payment * months - i.loanAmount + i.extraMonthly * 0;
  const totalInterestAlt = paymentAlt * months - i.loanAmount;
  const interestSaved = totalInterestAlt - totalInterest;

  const good = netAtStay > 0;
  const verdict = good
    ? `Break-even lands at ${fmt(breakEvenMonths, 0)} months — about ${fmt(breakEvenMonths / 12, 1)} years. Staying ${fmt(i.yearsStay, 0)} years nets ${money(netAtStay)} after the points`
    : `Break-even needs ${fmt(breakEvenMonths, 0)} months (${fmt(breakEvenMonths / 12, 1)} years) but you plan ${fmt(i.yearsStay, 0)} years — paying points loses ${money(Math.abs(netAtStay))}`;
  const verdictColor = good ? "text-emerald-600" : "text-orange-600";

  const breakdown = [
    { label: "Loan amount", value: money(i.loanAmount) },
    { label: `${fmt(i.points, i.points === Math.round(i.points) ? 0 : 2)} point${i.points === 1 ? "" : "s"} — upfront cost`, value: money(pointsCost), highlight: true },
    { label: `Payment at ${fmt(i.rate, 3)}% with points`, value: money(payment) },
    { label: `Payment at ${fmt(i.altRate, 3)}% with no points`, value: money(paymentAlt) },
    { label: "Monthly saving from points", value: money(monthlySaving), highlight: true },
    { label: "Break-even time", value: `${fmt(breakEvenMonths, 0)} months (${fmt(breakEvenMonths / 12, 1)} years)` },
    { label: `Saved after ${fmt(i.yearsStay, 0)} years in the home`, value: money(savedAtStay) },
    { label: "Net position at your horizon", value: money(netAtStay), highlight: true },
    { label: `Interest over the full ${fmt(i.termYears, 0)}-year term with points`, value: money(totalInterest) },
    { label: "Full-term interest without points", value: money(totalInterestAlt) },
    { label: "Interest saved over the full term", value: money(interestSaved) },
  ];

  return {
    valid: true,
    errorMsg: "",
    pointsCost,
    payment,
    paymentAlt,
    monthlySaving,
    breakEvenMonths,
    monthsAtStay,
    savedAtStay,
    netAtStay,
    totalInterest,
    totalInterestAlt,
    interestSaved,
    verdict,
    verdictColor,
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

export default function MortgagePointsCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [points, setPoints] = useState(String(DEFAULTS.points));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [yearsStay, setYearsStay] = useState(String(DEFAULTS.yearsStay));
  const [altRate, setAltRate] = useState(String(DEFAULTS.altRate));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PointsInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    rate: parseFloat(rate) || 0,
    points: parseFloat(points) || 0,
    termYears: parseFloat(termYears) || 0,
    yearsStay: parseFloat(yearsStay) || 0,
    altRate: parseFloat(altRate) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<PointsInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PointsResult>(() => calculatePoints(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculatePoints(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setRate(String(DEFAULTS.rate));
    setPoints(String(DEFAULTS.points));
    setTermYears(String(DEFAULTS.termYears));
    setYearsStay(String(DEFAULTS.yearsStay));
    setAltRate(String(DEFAULTS.altRate));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculatePoints(DEFAULTS));
  };

  const loanNum = parseFloat(loanAmount);
  const rateNum = parseFloat(rate);
  const altNum = parseFloat(altRate);

  const errors = {
    loanAmount: !Number.isFinite(loanNum) || loanNum < 50000 ? "Enter $50,000 or more" : "",
    rate: !Number.isFinite(rateNum) || rateNum <= 0 || rateNum > 20 ? "Enter 0.1–20%" : "",
    altRate: !Number.isFinite(altNum) || altNum <= 0 || altNum > 20 ? "Enter 0.1–20%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const d = Math.max(0, Math.min(2, calcInputs.decimals || 0));

  const faqs = [
    {
      question: "What exactly is a mortgage point?",
      answer:
        "One point is one percent of the loan amount, paid upfront at closing in exchange for a lower interest rate. On a $350,000 loan a point costs $3,500, and the rate reduction it buys is whatever the lender's price sheet offers that day — commonly an eighth to a quarter of a percent per point. Points paid on a purchase or refinance of a primary home are often tax-deductible, but the core question is always the same: does the monthly saving eventually repay the upfront cost before you sell or refinance?",
    },
    {
      question: "How long does it take to break even on points?",
      answer:
        "Break-even is the upfront cost divided by the monthly saving, and on typical pricing it lands between four and seven years. Pay $3,500 to save $70 a month and you need 50 months to get your money back; every month after that is profit, and every month before it is a loss. That is why your honest estimate of how long you will keep the loan — not the rate headline — is the single input that decides whether points make sense. Moving or refinancing early turns points into wasted money.",
    },
    {
      question: "Should I buy points or put the money toward the down payment?",
      answer:
        "Cash is fungible at closing, so the honest comparison is points against the same dollars as a bigger down payment. Extra down payment lowers the payment with no break-even clock at all and builds equity from day one, while points only win if you stay past break-even. As a rough rule, if the rate reduction per point is small — an eighth of a percent — and you are not certain to stay past break-even, the down payment route usually wins; a quarter-point-per-point offer is where points start to compete seriously.",
    },
    {
      question: "Do points still make sense if I plan to stay for the full term?",
      answer:
        "They can, and the arithmetic is at its most favourable there: thirty years of monthly savings against one upfront payment is a large return if you never refinance. The risk is that the full term rarely runs — most mortgages end early through sale or refinance, with the median closer to seven or eight years. Run the years-in-home field at your realistic horizon rather than the full term, and treat the full-term interest saving in the breakdown as the best case rather than the expected case.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Mortgage Points Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Points Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan & Points">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  min="50000"
                  max="5000000"
                  step="5000"
                  suffix="$"
                  error={errors.loanAmount}
                  hint="Principal before points."
                  tooltip="Mortgage principal the points will be charged against."
                />
                <CompactInput
                  id="points"
                  label="Points Bought"
                  value={points}
                  onChange={setPoints}
                  onEnter={runCalculate}
                  min="0"
                  max="5"
                  step="0.25"
                  suffix="pts"
                  hint="1 point = 1% of the loan."
                  tooltip="Discount points as a percentage of the loan amount."
                />
              </div>
            </SubSection>

            <SubSection title="Rates & Term">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Rate With Points"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  min="0.1"
                  max="20"
                  step="0.001"
                  suffix="%"
                  error={errors.rate}
                  tooltip="Rate the lender offers after buying the points."
                />
                <CompactInput
                  id="altrate"
                  label="Rate No Points"
                  value={altRate}
                  onChange={setAltRate}
                  onEnter={runCalculate}
                  min="0.1"
                  max="20"
                  step="0.001"
                  suffix="%"
                  error={errors.altRate}
                  tooltip="The rate on the same loan with zero points — the comparison offer."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="term"
                  label="Term"
                  value={termYears}
                  onChange={setTermYears}
                  options={TERM_OPTIONS}
                  tooltip="Both rates are quoted for the same term."
                />
                <CompactInput
                  id="stay"
                  label="Years In Home"
                  value={yearsStay}
                  onChange={setYearsStay}
                  onEnter={runCalculate}
                  min="1"
                  max="40"
                  step="1"
                  suffix="yrs"
                  hint="Your honest horizon."
                  tooltip="How long you expect to keep this loan before selling or refinancing."
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
                  <SubSection title="Extras & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        min="0"
                        step="25"
                        suffix="$"
                        tooltip="Voluntary extra principal, identical on either loan, shown for reference."
                      />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Break-Even on Points</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.breakEvenMonths, 0)} mo` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(results.pointsCost)} upfront saves ${money(results.monthlySaving)} a month · ${fmt(results.breakEvenMonths / 12, 1)} years to break even`
                  : "Compare the with-points rate against the no-points rate"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Points Cost</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.pointsCost) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Saving</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.monthlySaving) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net at Your Horizon</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? money(results.netAtStay) : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Points Item</th>
                    <th className="p-2.5 pr-3 text-right w-[230px]">Value</th>
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
                        Enter the loan and both rate quotes to price the points.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Verdict for your time horizon</td>
                      <td className={`p-2.5 pr-3 text-right ${results.verdictColor}`}>{results.verdict.split("—")[0].trim()}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment with points</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.payment) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment without points</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.paymentAlt) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest saved, full term</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.interestSaved) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-even months</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.breakEvenMonths, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Years in home
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.yearsStay, 0)} of ${fmt(calcInputs.termYears, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net gain if you stay full term</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.interestSaved - results.pointsCost) : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Mortgage Points Calculator?</h2>
            <p>
              A mortgage points calculator weighs an upfront fee against a lower interest rate. Discount points are prepaid interest: one
              point costs one percent of the loan amount and buys a rate reduction set by the lender's price sheet. The calculator prices
              the point purchase, computes the payment at both the discounted and the no-points rate, and derives the break-even month —
              the point at which the accumulated monthly savings have repaid the upfront cost.
            </p>
            <p>
              The decision the calculator settles is entirely about time. Points are a bet that you will keep the loan past break-even;
              sell the house or refinance earlier and the bet loses, no matter how attractive the reduced rate looked. Because the median
              American mortgage lasts well under a decade before being refinanced or paid off through a sale, the honest break-even test
              against a realistic holding period is the heart of the analysis.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The points cost is the loan amount multiplied by the point count — $3,500 per point on a $350,000 loan. Each rate is
              converted to a monthly payment with the standard amortising formula over the chosen term, and the monthly saving is the
              difference between the no-points payment and the with-points payment. Dividing the upfront cost by that saving gives the
              break-even in months.
            </p>
            <p>
              The horizon figure is where the decision lives. The calculator multiplies the monthly saving by the months you expect to
              stay, subtracts the upfront cost, and reports the net position at your horizon — green if the points have paid for
              themselves, orange if they have not. It also runs the full-term comparison: total interest at both rates across the whole
              term, which is the best case for points and typically runs to five figures. The gap between the full-term saving and the
              horizon net is the price of the refinance risk you are accepting.
            </p>
            <p>
              A useful discipline is to test the sensitivity of the verdict to your holding period: run the years-in-home field at five,
              seven and ten years and watch the net figure swing. If points only win in the full-term case, treat them as a bet on never
              refinancing, which history says is a bold bet. If they win by year six, the purchase is robust to most realistic paths — and
              the monthly saving is guaranteed for as long as you keep the loan, which is more than can be said for most investments
              claiming a similar return.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the break-even time in months. The three-stat bar shows what the points cost, what they save each month
              and the net position at your expected move-out, colour-coded green or orange. The breakdown table prices both loans, places
              the break-even against your horizon, and ends with a verdict line; the summary panel adds the payment pair, the full-term
              interest saved and the net gain if you never refinanced at all.
            </p>
            <p>
              Compare offers on the break-even month rather than the rate headline: a quarter-point reduction that costs one point breaks
              even far sooner than an eighth-point reduction that costs two, even when the advertised rates look similar. And remember the
              alternative use of the cash — the same dollars as a larger down payment lower the payment immediately with no break-even
              clock, so points only win when their break-even is comfortably shorter than your realistic time in the home.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-points-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-points-calculator" />
        </div>
      </div>
    </>
  );
}
