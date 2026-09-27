"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PointsInputs {
  loanAmount: number;
  baseRate: number;
  reductionPerPoint: number;
  points: number;
  termYears: number;
  holdMonths: number;
}

const DEFAULTS: PointsInputs = {
  loanAmount: 300000,
  baseRate: 7,
  reductionPerPoint: 0.25,
  points: 2,
  termYears: 30,
  holdMonths: 60,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

const yearsMonths = (months: number) => {
  if (!Number.isFinite(months)) return "Never";
  const m = Math.ceil(months);
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} mo`;
  return mo === 0 ? `${y} yr` : `${y} yr ${mo} mo`;
};

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface PointsResult {
  pointsCost: number;
  effectiveRate: number;
  basePayment: number;
  loweredPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  savingsOverHold: number;
  netBenefit: number;
  returnOnCost: number;
  totalInterestBase: number;
  totalInterestLowered: number;
  valid: boolean;
  errorMsg: string;
}

function computePoints(i: PointsInputs): PointsResult {
  const invalid =
    i.loanAmount <= 0 ||
    i.baseRate < 0 ||
    i.reductionPerPoint < 0 ||
    i.points < 0 ||
    i.termYears <= 0 ||
    i.holdMonths <= 0;

  const months = Math.round(i.termYears * 12);
  const pointsCost = (i.loanAmount * i.points) / 100;
  const effectiveRate = Math.max(0, i.baseRate - i.points * i.reductionPerPoint);

  const basePayment = payment(i.loanAmount, i.baseRate, months);
  const loweredPayment = payment(i.loanAmount, effectiveRate, months);
  const monthlySavings = basePayment - loweredPayment;
  const breakEvenMonths = monthlySavings > 0 ? pointsCost / monthlySavings : Infinity;
  const savingsOverHold = monthlySavings * Math.round(i.holdMonths);
  const netBenefit = savingsOverHold - pointsCost;
  const returnOnCost = pointsCost > 0 ? (netBenefit / pointsCost) * 100 : 0;

  return {
    pointsCost,
    effectiveRate,
    basePayment,
    loweredPayment,
    monthlySavings,
    breakEvenMonths,
    savingsOverHold,
    netBenefit,
    returnOnCost,
    totalInterestBase: basePayment * months - i.loanAmount,
    totalInterestLowered: loweredPayment * months - i.loanAmount,
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive loan amount and term, and non-negative rate, reduction and points." : "",
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

export default function BuyDownPointsCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [baseRate, setBaseRate] = useState(String(DEFAULTS.baseRate));
  const [reductionPerPoint, setReductionPerPoint] = useState(String(DEFAULTS.reductionPerPoint));
  const [points, setPoints] = useState(String(DEFAULTS.points));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [holdMonths, setHoldMonths] = useState(String(DEFAULTS.holdMonths));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PointsInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    baseRate: parseFloat(baseRate) || 0,
    reductionPerPoint: parseFloat(reductionPerPoint) || 0,
    points: parseFloat(points) || 0,
    termYears: parseFloat(termYears) || 0,
    holdMonths: parseFloat(holdMonths) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<PointsInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PointsResult>(() => computePoints(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePoints(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setBaseRate(String(DEFAULTS.baseRate));
    setReductionPerPoint(String(DEFAULTS.reductionPerPoint));
    setPoints(String(DEFAULTS.points));
    setTermYears(String(DEFAULTS.termYears));
    setHoldMonths(String(DEFAULTS.holdMonths));
    setCalcInputs(DEFAULTS);
    setResults(computePoints(DEFAULTS));
  };

  const faqs = [
    {
      question: "What are mortgage discount points?",
      answer:
        "A discount point is a fee equal to one percent of the loan amount, paid at closing in exchange for a lower interest rate. Points are effectively prepaid interest, so they reduce the monthly payment for as long as you hold the loan. The lender quotes how much rate reduction each point buys, commonly a quarter of a percentage point.",
    },
    {
      question: "How do I know whether points are worth it?",
      answer:
        "Divide the cost of the points by the monthly payment saving to get the break-even month. If you expect to keep the loan longer than that, the points pay for themselves and then produce a return. If you may sell or refinance before that month, the fee is simply lost, which is why the expected holding period is the decisive input.",
    },
    {
      question: "Are points tax deductible?",
      answer:
        "Points paid on a loan used to buy or improve a principal residence are generally deductible in the year paid, subject to limits and to the fee being a customary charge. Points on a refinance are usually deducted over the life of the loan instead. Rules and thresholds change, so confirm the treatment with a tax professional for your situation.",
    },
    {
      question: "Should I buy points or make a larger down payment?",
      answer:
        "Both reduce your payment, but they work differently. Points lower the rate for the life of the loan, while a larger down payment lowers the balance and can eliminate mortgage insurance. If loan-to-value is above eighty percent, attacking the down payment first is usually the higher-value move because it removes insurance as well as interest.",
    },
    {
      question: "Do points always reduce the rate by the same amount?",
      answer:
        "No. The rate reduction per point varies with market conditions, the loan type and the lender, and the schedule is rarely linear, so the second point often buys less than the first. Ask for the full pricing grid rather than assuming a fixed reduction, and use the actual quoted figures in the calculation.",
    },
  ];

  const breakdownRows = [
    { label: "Base Rate", value: `${fmt(calcInputs.baseRate, 3)}%`, note: "No points paid" },
    { label: "Rate After Points", value: `${fmt(results.effectiveRate, 3)}%`, note: `${fmt(calcInputs.points, 2)} points` },
    { label: "Monthly Payment Before", value: money(results.basePayment), note: "At the base rate" },
    { label: "Monthly Payment After", value: money(results.loweredPayment), note: "At the bought-down rate" },
    { label: "Points Cost", value: money(results.pointsCost), note: "Paid at closing" },
    { label: "Monthly Saving", value: money(results.monthlySavings), note: "Difference in payment" },
    { label: "Savings Over Hold Period", value: money(results.savingsOverHold), note: `${Math.round(calcInputs.holdMonths)} months` },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Buy-Down Points Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Buy-Down Points Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Principal being borrowed, before adding the points."
                />
                <CompactInput
                  id="base"
                  label="Base Interest Rate"
                  value={baseRate}
                  onChange={setBaseRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Rate quoted before any discount points."
                />
              </div>
            </SubSection>

            <SubSection title="Points Purchased">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="points"
                  label="Discount Points"
                  value={points}
                  onChange={setPoints}
                  onEnter={runCalculate}
                  min="0"
                  step="0.25"
                  tooltip="Each point costs one percent of the loan amount."
                />
                <CompactInput
                  id="reduction"
                  label="Rate Cut Per Point"
                  value={reductionPerPoint}
                  onChange={setReductionPerPoint}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.05"
                  tooltip="Rate reduction the lender offers for each point, commonly 0.25%."
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
                  <SubSection title="Hold Period & Term">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="term"
                        label="Loan Term"
                        value={termYears}
                        onChange={setTermYears}
                        onEnter={runCalculate}
                        suffix="yrs"
                        min="1"
                        tooltip="Full amortisation period of the mortgage."
                      />
                      <CompactInput
                        id="hold"
                        label="Expected Hold"
                        value={holdMonths}
                        onChange={setHoldMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="How long you expect to keep this loan before selling or refinancing."
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

            {results.pointsCost > 0 && Number.isFinite(results.breakEvenMonths) && (
              <div
                className={`border-l-4 rounded-lg p-5 ${
                  results.breakEvenMonths <= calcInputs.holdMonths
                    ? "bg-emerald-500/10 border-emerald-600"
                    : "bg-amber-500/10 border-amber-600"
                }`}
              >
                <div className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Break-even verdict</div>
                <div className="text-base font-medium text-foreground">
                  {results.breakEvenMonths <= calcInputs.holdMonths
                    ? `The points pay for themselves in ${yearsMonths(results.breakEvenMonths)}, inside your expected hold period.`
                    : `The points need ${yearsMonths(results.breakEvenMonths)}, longer than the ${Math.round(calcInputs.holdMonths)} months you expect to hold the loan.`}
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment Saving</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.monthlySavings)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.effectiveRate, 3)}% instead of {fmt(calcInputs.baseRate, 3)}% &middot;{" "}
                {money(results.pointsCost)} in points
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even</span>
                <span className="font-extrabold text-foreground">{yearsMonths(results.breakEvenMonths)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Benefit</span>
                <span className={`font-extrabold ${results.netBenefit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {money(results.netBenefit)}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Return on Cost</span>
                <span className="font-extrabold text-primary">{fmt(results.returnOnCost, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 text-right w-[150px]">Value</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.value}</td>
                      <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net Benefit Over Hold</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.netBenefit)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.breakEvenMonths <= calcInputs.holdMonths ? "Worth it" : "Not worth it"}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Amount</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.loanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Points Cost</span>
                  <span className="text-base font-bold text-foreground">{money(results.pointsCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment Before</span>
                  <span className="text-base font-bold text-foreground">{money(results.basePayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment After</span>
                  <span className="text-base font-bold text-primary">{money(results.loweredPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest Before</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalInterestBase)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest After</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalInterestLowered)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lifetime Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">
                    {money(results.totalInterestBase - results.totalInterestLowered)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-Even Month</span>
                  <span className="text-base font-bold text-foreground">
                    {Number.isFinite(results.breakEvenMonths) ? Math.ceil(results.breakEvenMonths) : "Never"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Buy-Down Points Calculator?</h2>
            <p>
              A buy-down points calculator works out whether paying discount points at closing is worth the cost. One point
              equals one percent of the loan amount, paid upfront in exchange for a permanently lower interest rate. Because
              the fee is paid immediately but the benefit arrives month by month, the decision turns on a single question:
              how long will you keep this loan?
            </p>
            <p>
              The calculator answers that by computing the break-even month, which is the point at which the accumulated
              monthly savings equal the cost of the points. Hold the loan longer than that and the points produce a genuine
              return; sell or refinance before it and the fee is money spent for nothing. That is why the expected holding
              period matters more than the size of the rate cut.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Break-Even Is Calculated</h2>
            <p>
              The cost of the points is the loan amount multiplied by the number of points and divided by one hundred. The
              bought-down rate is the base rate less the number of points multiplied by the reduction the lender offers per
              point. Payments at both rates come from the standard amortisation formula: the loan amount multiplied by the
              monthly rate, divided by one minus the quantity one plus the monthly rate raised to the negative number of
              payments.
            </p>
            <p>
              Subtracting the lower payment from the higher one gives the monthly saving, and dividing the cost of the points
              by that saving gives the number of months needed to recover the fee. Multiplying the monthly saving by the
              expected holding period and subtracting the cost produces the net benefit, which is the figure to compare
              against simply keeping the cash.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the monthly payment saving, the bought-down rate and the cost of the points. The
              three statistics beside it give the break-even period, the net benefit over your expected holding period and
              the return on the points cost. The breakdown table sets out both rates, both payments, the fee, the monthly
              saving and the total saving over the hold period.
            </p>
            <p>
              Summary Statistics collects the loan amount, points cost, both payments, the lifetime interest at each rate
              and the difference between them, along with the exact break-even month. Two practical notes: the second point
              usually buys less rate reduction than the first because pricing grids are not linear, and points on a
              refinance are generally deducted over the loan's life rather than in the year paid. Confirm the actual pricing
              grid with the lender before committing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/buy-down-points-calculator" />
          <PopularCalculators exclude="/calculator/buy-down-points-calculator" />
        </div>
      </div>
    </>
  );
}
