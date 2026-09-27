"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Spread = "sample" | "population";

const DEFAULT_DATA = "4, 7, 13, 2, 1, 8, 6, 11, 5, 9";

interface DeviationRow {
  index: number;
  value: number;
  deviation: number;
  squared: number;
}

interface SdResult {
  valid: boolean;
  errorMsg: string;
  count: number;
  sum: number;
  mean: number;
  median: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  iqr: number;
  q1: number;
  q3: number;
  cv: number;
  withinOne: number;
  withinTwo: number;
  rows: DeviationRow[];
}

const fmt = (v: number, d = 4) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function parseValues(raw: string): number[] {
  return raw
    .split(/[,\s;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

function percentile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function computeSd(raw: string, spread: Spread, decimals: number): SdResult {
  const values = parseValues(raw);

  const blank: SdResult = {
    valid: false,
    errorMsg: "",
    count: 0,
    sum: 0,
    mean: 0,
    median: 0,
    variance: 0,
    stdDev: 0,
    min: 0,
    max: 0,
    range: 0,
    iqr: 0,
    q1: 0,
    q3: 0,
    cv: 0,
    withinOne: 0,
    withinTwo: 0,
    rows: [],
  };

  if (values.length === 0) {
    return { ...blank, errorMsg: "Enter at least one number, separated by commas, spaces or new lines." };
  }
  if (spread === "sample" && values.length < 2) {
    return { ...blank, errorMsg: "A sample standard deviation needs at least two values. Switch to population or add data." };
  }

  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const divisor = spread === "population" ? n : n - 1;
  const variance = values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / divisor;
  const stdDev = Math.sqrt(variance);
  const sorted = [...values].sort((a, b) => a - b);
  const median = percentile(sorted, 0.5);
  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;
  const withinOne = stdDev > 0 ? values.filter((v) => Math.abs(v - mean) <= stdDev).length : n;
  const withinTwo = stdDev > 0 ? values.filter((v) => Math.abs(v - mean) <= 2 * stdDev).length : n;

  const rows: DeviationRow[] = values
    .map((value, index) => {
      const deviation = value - mean;
      return { index: index + 1, value, deviation, squared: deviation * deviation };
    })
    .sort((a, b) => a.value - b.value)
    .map((r, i) => ({ ...r, index: i + 1 }));

  return {
    valid: true,
    errorMsg: "",
    count: n,
    sum: Number(sum.toFixed(decimals)),
    mean: Number(mean.toFixed(decimals)),
    median: Number(median.toFixed(decimals)),
    variance: Number(variance.toFixed(decimals)),
    stdDev: Number(stdDev.toFixed(decimals)),
    min: sorted[0],
    max: sorted[n - 1],
    range: Number((sorted[n - 1] - sorted[0]).toFixed(decimals)),
    iqr: Number((q3 - q1).toFixed(decimals)),
    q1: Number(q1.toFixed(decimals)),
    q3: Number(q3.toFixed(decimals)),
    cv: Number(cv.toFixed(4)),
    withinOne,
    withinTwo,
    rows,
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

const CompactTextArea = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      rows={4}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && onEnter) onEnter();
      }}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-y"
    />
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function StandardDeviationCalculator() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [spread, setSpread] = useState<Spread>("sample");
  const [decimals, setDecimals] = useState("4");
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): { raw: string; spread: Spread; decimals: number } => ({
    raw: data,
    spread,
    decimals: Math.max(0, Math.min(8, parseFloat(decimals) || 4)),
  });

  const [calcInputs, setCalcInputs] = useState(() => getInputs());
  const [results, setResults] = useState<SdResult>(() => computeSd(DEFAULT_DATA, "sample", 4));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSd(inputs.raw, inputs.spread, inputs.decimals));
  };

  const reset = () => {
    setData(DEFAULT_DATA);
    setSpread("sample");
    setDecimals("4");
    setCalcInputs({ raw: DEFAULT_DATA, spread: "sample", decimals: 4 });
    setResults(computeSd(DEFAULT_DATA, "sample", 4));
  };

  const faqs = [
    {
      question: "What is the difference between sample and population standard deviation?",
      answer:
        "Population standard deviation divides the squared deviations by the number of values, while the sample version divides by one less than the count. The sample version is larger and is the correct choice whenever the data is a subset of something bigger, because it corrects for the fact that a sample mean is never exactly the true mean.",
    },
    {
      question: "How is standard deviation calculated step by step?",
      answer:
        "Find the mean, subtract it from every value to get the deviations, square each deviation, average those squares to get the variance, then take the square root. The table in the results shows every one of those steps, so the arithmetic can be checked line by line when the answer matters.",
    },
    {
      question: "What does a standard deviation actually tell me?",
      answer:
        "It measures how far values typically sit from the average. In a roughly bell-shaped distribution about sixty-eight percent of values fall within one standard deviation of the mean and about ninety-five percent within two. A small standard deviation means the values cluster tightly, and a large one means they are spread out.",
    },
    {
      question: "When should I use the coefficient of variation instead?",
      answer:
        "The coefficient of variation divides the standard deviation by the mean, turning it into a percentage. That makes it possible to compare spread between data sets with different units or very different averages, such as the variability of two products measured in grams and kilograms. Bigger numbers mean more relative variability.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Standard Deviation Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Standard Deviation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Data Set">
              <CompactTextArea
                id="data-set"
                label="Values"
                value={data}
                onChange={setData}
                onEnter={runCalculate}
                hint="Separate numbers with commas, spaces or new lines."
              />
            </SubSection>

            <SubSection title="Spread Type">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSpread("sample")}
                  aria-pressed={spread === "sample"}
                  className={
                    spread === "sample"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Sample (n − 1)
                </button>
                <button
                  type="button"
                  onClick={() => setSpread("population")}
                  aria-pressed={spread === "population"}
                  className={
                    spread === "population"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Population (n)
                </button>
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
                  <SubSection title="Display">
                    <CompactInput
                      id="decimals"
                      label="Decimal Places"
                      value={decimals}
                      onChange={setDecimals}
                      onEnter={runCalculate}
                      min="0"
                      tooltip="How many digits to show after the decimal point in the results."
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
                {calcInputs.spread === "population" ? "Population Standard Deviation" : "Sample Standard Deviation"}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.stdDev, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.count} values with a mean of ${fmt(results.mean, calcInputs.decimals)}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Variance</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.variance, calcInputs.decimals) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mean</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.mean, calcInputs.decimals) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Coeff. of Variation</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.cv, 2)}%` : "—"}
                </span>
              </div>
            </div>

            {/* DEVIATION TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card max-h-[360px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">#</th>
                    <th className="p-2.5 text-right">Value</th>
                    <th className="p-2.5 text-right">Deviation</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Squared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.index} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.index}</td>
                      <td className="p-2.5 text-right font-semibold text-foreground">{fmt(row.value, calcInputs.decimals)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.deviation, calcInputs.decimals)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.squared, calcInputs.decimals)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Σ</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.sum, calcInputs.decimals)}</td>
                    <td className="p-2.5 text-right text-foreground">0</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {fmt(results.variance * (calcInputs.spread === "population" ? results.count : results.count - 1), calcInputs.decimals)}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Count</span>
                  <span className="text-base font-bold text-foreground">{results.count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sum</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.sum, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Median</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.median, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Range</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.range, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Quartile 1</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.q1, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Quartile 3</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.q3, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interquartile Range</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.iqr, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Min / Max</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(results.min, calcInputs.decimals)} / {fmt(results.max, calcInputs.decimals)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Within 1 SD</span>
                  <span className="text-base font-bold text-foreground">
                    {results.count > 0 ? `${results.withinOne} of ${results.count}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Within 2 SD</span>
                  <span className="text-base font-bold text-foreground">
                    {results.count > 0 ? `${results.withinTwo} of ${results.count}` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Standard Deviation Calculator?</h2>
            <p>
              A standard deviation calculator measures how widely a set of numbers spreads around its average. Paste in a
              list of values and it returns the standard deviation, the variance that sits behind it, and a full table of
              every deviation from the mean. Both the sample and population formulas are available, so the same data can be
              described either as a complete set or as a subset of a larger one.
            </p>
            <p>
              The value of the measure is comparability. Two investments can have identical average returns and completely
              different risk, and two production lines can hit the same target size with very different consistency. Standard
              deviation turns that consistency into a single number, which is why it underpins quality control, portfolio
              analysis, grading curves and scientific measurement.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculation starts with the mean of the values. Each value is then subtracted from the mean to give its
              deviation, and each deviation is squared so that negative and positive gaps cannot cancel out. Those squares are
              averaged, and the square root of that average is the standard deviation, which returns the result to the same
              units as the original data.
            </p>
            <p>
              The only difference between the two formulas is the divisor. A population divides by the number of values, while
              a sample divides by one less than the count. Dividing by the smaller number inflates the result slightly, which
              corrects for the tendency of a sample to understate the true spread. Use the population version when the data is
              the entire group you care about.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the standard deviation, with the variance, the mean and the coefficient of variation in
              the three-stat bar. The table lists every value with its deviation from the mean and the square of that
              deviation, sorted from smallest to largest, and the summary panel adds the median, quartiles, range and the
              counts of values falling within one and two standard deviations.
            </p>
            <p>
              Read the deviation column to see the shape of the data. A few large positive and negative entries mean the set
              contains outliers that pull the mean away from the middle, and the median in the summary panel will sit further
              from the mean in that case. The interquartile range ignores those extremes entirely and can be the more honest
              measure of typical spread.
            </p>
            <p>
              Finally, compare the standard deviation with the mean before drawing conclusions. A standard deviation of five
              is enormous for data averaging 20 and trivial for data averaging 5000, which is exactly what the coefficient of
              variation expresses. For roughly bell-shaped data, about two thirds of the values sit within one standard
              deviation of the mean and about nineteen in twenty within two.
            </p>
            <p>
              When you compare two data sets, keep the units and the sample size in view. A standard deviation calculated
              from five readings is far less stable than one calculated from five hundred, so treat small-sample figures as
              rough guides rather than firm limits. Running the same measurement again and averaging the results reduces the
              standard deviation of the average by roughly the square root of the number of runs, which is why repeat testing
              is such an effective way to tighten an estimate.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/standard-deviation-calculator" />
          <PopularCalculators exclude="/calculator/standard-deviation-calculator" />
        </div>
      </div>
    </>
  );
}
