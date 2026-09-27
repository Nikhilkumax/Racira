"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PercentageInputs {
  value: number;
  percent: number;
  compareValue: number;
}

const DEFAULTS: PercentageInputs = {
  value: 250,
  percent: 15,
  compareValue: 300,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const fmtNum = (v: number, d: number) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d }) : "—";

interface LadderRow {
  percent: number;
  amount: number;
}

interface PercentageResult {
  valid: boolean;
  errorMsg: string;
  base: number;
  increased: number;
  decreased: number;
  reversePercent: number;
  whole: number;
  percentOfCompare: number;
  difference: number;
  percentChange: number;
  ratio: number;
  multiplierUp: number;
  multiplierDown: number;
  ladder: LadderRow[];
}

const LADDER_LEVELS = [1, 5, 10, 20, 25, 50, 75, 100];

function computePercentage(input: PercentageInputs): PercentageResult {
  const { value, percent, compareValue } = input;

  const blank: PercentageResult = {
    valid: false,
    errorMsg: "",
    base: 0,
    increased: 0,
    decreased: 0,
    reversePercent: 0,
    whole: 0,
    percentOfCompare: 0,
    difference: 0,
    percentChange: 0,
    ratio: 0,
    multiplierUp: 1,
    multiplierDown: 1,
    ladder: [],
  };

  if (!Number.isFinite(value) || !Number.isFinite(percent) || !Number.isFinite(compareValue)) {
    return { ...blank, errorMsg: "Enter a number in each field to run the percentage calculation." };
  }
  if (value === 0 && compareValue === 0) {
    return { ...blank, errorMsg: "Both the value and the comparison value are zero, so no ratio can be formed." };
  }

  const base = (percent / 100) * value;
  const multiplierUp = 1 + percent / 100;
  const multiplierDown = 1 - percent / 100;
  const increased = value * multiplierUp;
  const decreased = value * multiplierDown;
  const reversePercent = value !== 0 ? (percent / value) * 100 : 0;
  const whole = percent !== 0 ? value / (percent / 100) : 0;
  const percentOfCompare = compareValue !== 0 ? (value / compareValue) * 100 : 0;
  const difference = compareValue - value;
  const percentChange = value !== 0 ? (difference / value) * 100 : 0;
  const ratio = compareValue !== 0 ? value / compareValue : 0;

  const ladder: LadderRow[] = LADDER_LEVELS.map((p) => {
    const raw = (p / 100) * value;
    return { percent: p, amount: Number(raw.toFixed(6)) };
  });

  return {
    valid: true,
    errorMsg: "",
    base: Number(base.toFixed(6)),
    increased: Number(increased.toFixed(6)),
    decreased: Number(decreased.toFixed(6)),
    reversePercent: Number(reversePercent.toFixed(6)),
    whole: Number(whole.toFixed(6)),
    percentOfCompare: Number(percentOfCompare.toFixed(6)),
    difference: Number(difference.toFixed(6)),
    percentChange: Number(percentChange.toFixed(6)),
    ratio: Number(ratio.toFixed(6)),
    multiplierUp: Number(multiplierUp.toFixed(6)),
    multiplierDown: Number(multiplierDown.toFixed(6)),
    ladder,
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

export default function PercentageCalculator() {
  const [value, setValue] = useState(String(DEFAULTS.value));
  const [percent, setPercent] = useState(String(DEFAULTS.percent));
  const [compareValue, setCompareValue] = useState(String(DEFAULTS.compareValue));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PercentageInputs => ({
    value: parseFloat(value) || 0,
    percent: parseFloat(percent) || 0,
    compareValue: parseFloat(compareValue) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<PercentageInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PercentageResult>(() => computePercentage(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePercentage(inputs));
  };

  const reset = () => {
    setValue(String(DEFAULTS.value));
    setPercent(String(DEFAULTS.percent));
    setCompareValue(String(DEFAULTS.compareValue));
    setCalcInputs(DEFAULTS);
    setResults(computePercentage(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do I calculate a percentage of a number?",
      answer:
        "Multiply the number by the percentage expressed as a decimal. Fifteen percent of 250 is 0.15 × 250, which equals 37.5. The quick mental version is to find ten percent by moving the decimal point one place and then take halves or doubles of that figure until you reach the percentage you need.",
    },
    {
      question: "How do I find what percentage one number is of another?",
      answer:
        "Divide the part by the whole and multiply by one hundred. If 37.5 is the part and 250 is the whole, then 37.5 ÷ 250 = 0.15, and 0.15 × 100 = 15 percent. This is the calculation behind test scores, market share, body fat and almost every progress figure you will meet.",
    },
    {
      question: "How do I calculate percentage increase or decrease?",
      answer:
        "Subtract the old value from the new value, divide by the old value, then multiply by one hundred. A price rising from 80 to 100 gives (100 − 80) ÷ 80 = 0.25, or a 25 percent increase. Always divide by the starting value, because the same absolute change is a much bigger percentage move on a small base than on a large one.",
    },
    {
      question: "What is the difference between percentage points and percent?",
      answer:
        "A percentage point is the plain difference between two percentages, while a percent change compares them relative to the starting figure. An interest rate moving from 5 percent to 8 percent rises by 3 percentage points but by 60 percent in relative terms. Mixing the two up is one of the most common errors in financial reporting.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Percentage Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Percentage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Percentage">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="value"
                  label="Value"
                  value={value}
                  onChange={setValue}
                  onEnter={runCalculate}
                  tooltip="The base number you are taking a percentage of."
                />
                <CompactInput
                  id="percent"
                  label="Percent"
                  value={percent}
                  onChange={setPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="The percentage to apply to the value."
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
                  <SubSection title="Comparison">
                    <CompactInput
                      id="compare-value"
                      label="Comparison Value"
                      value={compareValue}
                      onChange={setCompareValue}
                      onEnter={runCalculate}
                      hint="Used to work out the percentage change from the value to this number."
                      tooltip="Second number for the percent-change and share calculations."
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
                {`${fmtNum(calcInputs.percent, 4)}% of ${fmtNum(calcInputs.value, 4)}`}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmtNum(results.base, 6) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmtNum(calcInputs.value, 4)} × ${fmt(calcInputs.percent / 100, 4)} = ${fmtNum(results.base, 6)}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Increased</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmtNum(results.increased, 6) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Decreased</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmtNum(results.decreased, 6) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Share</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmtNum(results.percentOfCompare, 4)}%` : "—"}
                </span>
              </div>
            </div>

            {/* DERIVED RESULTS TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Question</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Answer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      {`${fmtNum(calcInputs.percent, 4)}% of ${fmtNum(calcInputs.value, 4)}`}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmtNum(results.base, 6)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      {`${fmtNum(calcInputs.value, 4)} increased by ${fmtNum(calcInputs.percent, 4)}%`}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmtNum(results.increased, 6)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      {`${fmtNum(calcInputs.value, 4)} decreased by ${fmtNum(calcInputs.percent, 4)}%`}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmtNum(results.decreased, 6)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      {`${fmtNum(calcInputs.percent, 4)} is what percent of ${fmtNum(calcInputs.value, 4)}?`}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${fmtNum(results.reversePercent, 4)}%`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      {`${fmtNum(calcInputs.value, 4)} is ${fmtNum(calcInputs.percent, 4)}% of what?`}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.whole !== 0 ? fmtNum(results.whole, 6) : "Not defined at 0%"}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">
                      {`Change from ${fmtNum(calcInputs.value, 4)} to ${fmtNum(calcInputs.compareValue, 4)}`}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {`${results.percentChange >= 0 ? "+" : ""}${fmtNum(results.percentChange, 4)}%`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PERCENTAGE LADDER */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Percent of Value</th>
                    <th className="p-2.5 text-right">Multiplier</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.ladder.map((row) => (
                    <tr
                      key={row.percent}
                      className={row.percent === calcInputs.percent ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.percent}%</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.percent / 100, 2)}×</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmtNum(row.amount, 6)}</td>
                    </tr>
                  ))}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Base Value</span>
                  <span className="text-base font-bold text-foreground">{fmtNum(calcInputs.value, 6)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Percent as Decimal</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.percent / 100, 4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Increase Multiplier</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.multiplierUp, 4)}×</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Decrease Multiplier</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.multiplierDown, 4)}×</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value vs Comparison</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.ratio, 4)} : 1`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Absolute Difference</span>
                  <span className="text-base font-bold text-foreground">{fmtNum(results.difference, 6)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Percentage Calculator?</h2>
            <p>
              A percentage calculator turns the most common proportional questions into a single answer. It will find a
              percentage of a number, work out what percentage one number is of another, add or subtract a percentage, and
              reverse the calculation to recover the original figure from the percentage alone. Every result is reported in
              several forms so you can see the same quantity as an amount, a ratio and a multiplier.
            </p>
            <p>
              Percentages matter because they make numbers comparable across different scales. Comparing an increase of
              twenty dollars on a thirty dollar item with one of twenty dollars on a three hundred dollar item is confusing
              in dollars but obvious in percent. That is why interest rates, tax rates, discounts, tips, test scores, body
              composition and growth statistics are all reported as percentages.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The core rule is that a percent is a fraction with one hundred on the bottom. To take a percentage of a value,
              divide the percent by one hundred and multiply. To find what share one number is of another, divide the part
              by the whole and multiply by one hundred. Reversing the calculation divides the known amount by the decimal
              percent, which recovers the original total the percentage was applied to.
            </p>
            <p>
              Adding and subtracting a percentage uses multipliers rather than separate steps: a fifteen percent increase is
              the original value times 1.15, and a fifteen percent decrease is the original value times 0.85. This matters
              because the two operations are not symmetric. Raising a price by twenty percent and then cutting it by twenty
              percent leaves it four percent cheaper, not unchanged.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card answers the headline question, and the three-stat bar puts the increased, decreased and
              proportional figures side by side. The first table lists each question with its answer, including the share
              one value represents of the comparison figure, and the second table is a ladder of common percentages so you
              can read off five, ten, twenty-five or fifty percent of the same base without recalculating.
            </p>
            <p>
              Use the comparison field to test growth or shrinkage. It reports the absolute difference and the percentage
              change measured from the base value, so a move from 250 to 300 shows as fifty points and a twenty percent
              increase. The same table reveals the trap in percentage changes: a fall from 300 back to 250 is a sixteen and
              a half percent decline, not twenty percent, because the two changes are measured against different bases.
            </p>
            <p>
              For everyday use, remember that percentage points and percent are different units. Moving a rate from five
              percent to eight percent is three percentage points, but sixty percent in relative terms, and news stories
              often switch between the two without warning. Keep the base value in view whenever a percentage is quoted on
              its own, because a large percentage of a tiny number is still a tiny number. Write the base, the rate and the
              resulting amount down together when you compare two offers, since reversing a change and rebuilding the
              original total is far easier when the starting figure is still visible.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentage-calculator" />
          <PopularCalculators exclude="/calculator/percentage-calculator" />
        </div>
      </div>
    </>
  );
}
