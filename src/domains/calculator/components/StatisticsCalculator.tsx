"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const DEFAULT_DATA = "12, 15, 11, 18, 15, 22, 9, 15, 14, 20, 13, 17";

interface StatRow {
  label: string;
  value: string;
  emphasis: boolean;
}

interface FrequencyRow {
  value: number;
  count: number;
  percent: number;
  cumulative: number;
  zScore: number;
}

interface StatsResult {
  valid: boolean;
  errorMsg: string;
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  modeText: string;
  range: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  varianceSample: number;
  variancePopulation: number;
  sdSample: number;
  sdPopulation: number;
  cv: number;
  skewness: number;
  sortedValues: number[];
  stats: StatRow[];
  frequencies: FrequencyRow[];
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

function medianOf(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  return n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[(n - 1) / 2];
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function computeStats(raw: string): StatsResult {
  const values = parseValues(raw);

  const blank: StatsResult = {
    valid: false,
    errorMsg: "",
    count: 0,
    sum: 0,
    mean: 0,
    median: 0,
    modes: [],
    modeText: "",
    range: 0,
    min: 0,
    max: 0,
    q1: 0,
    q3: 0,
    iqr: 0,
    varianceSample: 0,
    variancePopulation: 0,
    sdSample: 0,
    sdPopulation: 0,
    cv: 0,
    skewness: 0,
    sortedValues: [],
    stats: [],
    frequencies: [],
  };

  if (values.length === 0) {
    return { ...blank, errorMsg: "Enter at least one number, separated by commas, spaces or new lines." };
  }

  const n = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = medianOf(sorted);
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;
  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const iqr = q3 - q1;

  const squaredSum = values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0);
  const variancePopulation = squaredSum / n;
  const varianceSample = n > 1 ? squaredSum / (n - 1) : 0;
  const sdPopulation = Math.sqrt(variancePopulation);
  const sdSample = Math.sqrt(varianceSample);
  const cv = mean !== 0 ? (sdSample / Math.abs(mean)) * 100 : 0;
  const skewness =
    n > 2 && sdPopulation > 0
      ? (n / ((n - 1) * (n - 2))) * values.reduce((acc, v) => acc + Math.pow((v - mean) / sdPopulation, 3), 0)
      : 0;

  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let maxCount = 0;
  counts.forEach((c) => {
    if (c > maxCount) maxCount = c;
  });
  const modes: number[] = [];
  counts.forEach((c, v) => {
    if (c === maxCount && maxCount > 1) modes.push(v);
  });
  modes.sort((a, b) => a - b);
  const modeText =
    modes.length === 0
      ? "No value repeats"
      : modes.length === 1
        ? `${modes[0]} (appears ${maxCount} times)`
        : `${modes.join(", ")} (each appears ${maxCount} times)`;

  let running = 0;
  const frequencies: FrequencyRow[] = [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => {
      running += count;
      return {
        value,
        count,
        percent: Number(((count / n) * 100).toFixed(4)),
        cumulative: Number(((running / n) * 100).toFixed(4)),
        zScore: sdPopulation > 0 ? Number(((value - mean) / sdPopulation).toFixed(4)) : 0,
      };
    });

  const stats: StatRow[] = [
    { label: "Count (n)", value: String(n), emphasis: false },
    { label: "Sum", value: fmt(sum, 4), emphasis: false },
    { label: "Mean", value: fmt(mean, 4), emphasis: true },
    { label: "Median", value: fmt(median, 4), emphasis: true },
    { label: "Mode", value: modeText, emphasis: false },
    { label: "Minimum", value: fmt(min, 4), emphasis: false },
    { label: "Maximum", value: fmt(max, 4), emphasis: false },
    { label: "Range", value: fmt(range, 4), emphasis: false },
    { label: "First quartile (Q1)", value: fmt(q1, 4), emphasis: false },
    { label: "Third quartile (Q3)", value: fmt(q3, 4), emphasis: false },
    { label: "Interquartile range", value: fmt(iqr, 4), emphasis: false },
    { label: "Variance (sample)", value: fmt(varianceSample, 4), emphasis: false },
    { label: "Variance (population)", value: fmt(variancePopulation, 4), emphasis: false },
    { label: "Std deviation (sample)", value: fmt(sdSample, 4), emphasis: true },
    { label: "Std deviation (population)", value: fmt(sdPopulation, 4), emphasis: false },
    { label: "Coefficient of variation", value: `${fmt(cv, 2)}%`, emphasis: false },
    { label: "Skewness", value: fmt(skewness, 4), emphasis: false },
  ];

  return {
    valid: true,
    errorMsg: "",
    count: n,
    sum: Number(sum.toFixed(6)),
    mean: Number(mean.toFixed(6)),
    median: Number(median.toFixed(6)),
    modes,
    modeText,
    range: Number(range.toFixed(6)),
    min,
    max,
    q1: Number(q1.toFixed(6)),
    q3: Number(q3.toFixed(6)),
    iqr: Number(iqr.toFixed(6)),
    varianceSample: Number(varianceSample.toFixed(6)),
    variancePopulation: Number(variancePopulation.toFixed(6)),
    sdSample: Number(sdSample.toFixed(6)),
    sdPopulation: Number(sdPopulation.toFixed(6)),
    cv: Number(cv.toFixed(4)),
    skewness: Number(skewness.toFixed(6)),
    sortedValues: sorted,
    stats,
    frequencies,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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

export default function StatisticsCalculator() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [decimals, setDecimals] = useState("4");
  const [showAdv, setShowAdv] = useState(false);

  const [calcInputs, setCalcInputs] = useState(() => ({ raw: DEFAULT_DATA, decimals: 4 }));
  const [results, setResults] = useState<StatsResult>(() => computeStats(DEFAULT_DATA));

  const runCalculate = () => {
    const inputs = { raw: data, decimals: Math.max(0, Math.min(8, parseFloat(decimals) || 4)) };
    setCalcInputs(inputs);
    setResults(computeStats(inputs.raw));
  };

  const reset = () => {
    setData(DEFAULT_DATA);
    setDecimals("4");
    setCalcInputs({ raw: DEFAULT_DATA, decimals: 4 });
    setResults(computeStats(DEFAULT_DATA));
  };

  const faqs = [
    {
      question: "What is the difference between mean, median and mode?",
      answer:
        "The mean is the arithmetic average, the median is the middle value once the data is ordered, and the mode is the value that appears most often. The mean uses every observation and is pulled by extreme values, the median ignores how far the extremes sit from the middle, and the mode is the only one that works for labels as well as numbers.",
    },
    {
      question: "When should I use the median instead of the mean?",
      answer:
        "Use the median whenever the data contains outliers or is heavily skewed. House prices, incomes and hospital waiting times are classic examples: one very large value can drag the mean well above the typical case while the median stays anchored to the middle of the list. Reporting both together is the clearest practice.",
    },
    {
      question: "What do the quartiles and interquartile range show?",
      answer:
        "Quartiles split the ordered data into four equal parts, so a quarter of the values sit below the first quartile and a quarter above the third. The interquartile range is the gap between them and covers the middle half of the data, which makes it a robust measure of spread that ignores the extremes entirely.",
    },
    {
      question: "What is a z-score?",
      answer:
        "A z-score states how many standard deviations a value sits above or below the mean. A score of plus two means the value is unusually high, and minus two unusually low, for that data set. The frequency table in the results gives a z-score for each distinct value, which is how outliers are usually identified.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Statistics Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Statistics Calculator</h1>

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
                      tooltip="How many digits to show after the decimal point in the tables."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Mean</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.mean, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid ? `${results.count} values with a total of ${fmt(results.sum, calcInputs.decimals)}` : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Median</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.median, calcInputs.decimals) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Std Deviation</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.sdSample, calcInputs.decimals) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Range</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.range, calcInputs.decimals) : "—"}</span>
              </div>
            </div>

            {/* DESCRIPTIVE STATISTICS TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Statistic</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.stats.map((row) => (
                    <tr key={row.label} className={row.emphasis ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FREQUENCY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Value</th>
                    <th className="p-2.5 text-right">Count</th>
                    <th className="p-2.5 text-right">Share</th>
                    <th className="p-2.5 text-right">Cumulative</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">z-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.frequencies.map((row) => (
                    <tr key={row.value} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{fmt(row.value, 4)}</td>
                      <td className="p-2.5 text-right text-foreground">{row.count}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.percent, 2)}%`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.cumulative, 2)}%`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.zScore, calcInputs.decimals)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{results.count}</td>
                    <td className="p-2.5 text-right text-foreground">100.00%</td>
                    <td className="p-2.5 text-right text-foreground">100.00%</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">—</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Five-Number Summary</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? `${fmt(results.min, 2)} / ${fmt(results.q1, 2)} / ${fmt(results.median, 2)} / ${fmt(results.q3, 2)} / ${fmt(results.max, 2)}`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interquartile Range</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.iqr, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mode</span>
                  <span className="text-base font-bold text-foreground">{results.modeText || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Coefficient of Variation</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.cv, 2)}%`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Population Variance</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.variancePopulation, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Skewness</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.skewness, calcInputs.decimals)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Statistics Calculator?</h2>
            <p>
              A statistics calculator summarises a list of numbers in one pass. Paste in the data and it reports the count,
              sum, mean, median, mode, range, quartiles, interquartile range, sample and population variance, both standard
              deviations, the coefficient of variation and a skewness measure, plus a frequency table with z-scores for every
              distinct value.
            </p>
            <p>
              Descriptive statistics are the first step of almost every analysis. They reveal whether the data is symmetric or
              lopsided, whether a single reading is distorting the average, and whether the spread is small enough for a
              conclusion to be meaningful. Doing this before any modelling saves a great deal of later confusion.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator counts the values, adds them for a sum and divides by the count for the mean. It then sorts the
              data to find the middle value and, for an even count, averages the two central values. Quartiles come from the
              same ordered list using interpolation, which gives a consistent answer regardless of how the sample size divides
              into four.
            </p>
            <p>
              Spread measures build on the mean. Each value has its distance from the mean squared and averaged; dividing by
              the count gives population variance and dividing by one less gives sample variance, the two options differing
              only because a sample tends to understate the true spread. The square roots of those figures are the standard
              deviations.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the mean, and the three-stat bar reports the median, the sample standard deviation and the
              range. The first table lists every statistic in order, marking the headline figures, and the second table groups
              repeated values so the shape of the distribution can be read directly, with each distinct value carrying its own
              z-score.
            </p>
            <p>
              Compare the mean and the median to judge symmetry. When they sit close together the data is roughly balanced, and
              when the mean sits well above the median a few large values are pulling it upwards, which is exactly the pattern
              seen in income and property data. The skewness figure quantifies that same effect on a standard scale.
            </p>
            <p>
              Use the frequency table to spot clusters and gaps. Large cumulative jumps identify the range where most of the
              data sits, while a value with a z-score beyond plus or minus two deserves a second look as a possible outlier.
              Deciding whether to keep or exclude such a value depends on how it was measured, not on the statistics alone.
            </p>
            <p>
              Finally, remember that summary statistics compress the data and can hide important structure. Two very different
              distributions can share the same mean and standard deviation, one clustered in two groups and one spread evenly.
              Always look at the frequency table alongside the summary, and for anything important plot the values before
              drawing conclusions from the numbers alone. Keep the raw data set saved alongside any summary you publish, and
              note how many values it contains, because a standard deviation from five readings and one from five hundred
              carry very different weight even when they print identically.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/statistics-calculator" />
          <PopularCalculators exclude="/calculator/statistics-calculator" />
        </div>
      </div>
    </>
  );
}
