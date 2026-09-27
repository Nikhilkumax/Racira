"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const DEFAULT_DATA = "12, 15, 11, 18, 15, 22, 9, 15, 14, 20, 13, 17";

interface FreqRow {
  value: number;
  count: number;
  percent: number;
  cumulative: number;
}

interface CompareRow {
  measure: string;
  value: string;
  note: string;
}

interface MmmResult {
  valid: boolean;
  errorMsg: string;
  count: number;
  sum: number;
  mean: number;
  median: number;
  modeText: string;
  modeCount: number;
  modes: number[];
  range: number;
  min: number;
  max: number;
  midrange: number;
  trimMean: number;
  geometricMean: number;
  frequencies: FreqRow[];
  compares: CompareRow[];
  sorted: number[];
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

function computeMmm(raw: string): MmmResult {
  const values = parseValues(raw);

  const blank: MmmResult = {
    valid: false,
    errorMsg: "",
    count: 0,
    sum: 0,
    mean: 0,
    median: 0,
    modeText: "",
    modeCount: 0,
    modes: [],
    range: 0,
    min: 0,
    max: 0,
    midrange: 0,
    trimMean: 0,
    geometricMean: 0,
    frequencies: [],
    compares: [],
    sorted: [],
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
  const midrange = (min + max) / 2;

  // Trimmed mean: drop the single highest and lowest value when the sample allows it.
  const trimCount = n >= 5 ? Math.floor(n * 0.1) : 0;
  const trimmedSet = sorted.slice(trimCount, n - trimCount);
  const trimMean = trimmedSet.length > 0 ? trimmedSet.reduce((a, b) => a + b, 0) / trimmedSet.length : mean;

  // Geometric mean only makes sense for strictly positive data.
  const allPositive = values.every((v) => v > 0);
  const geometricMean = allPositive ? Math.exp(values.reduce((acc, v) => acc + Math.log(v), 0) / n) : 0;

  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let modeCount = 0;
  counts.forEach((c) => {
    if (c > modeCount) modeCount = c;
  });
  const modes: number[] = [];
  counts.forEach((c, v) => {
    if (c === modeCount && modeCount > 1) modes.push(v);
  });
  modes.sort((a, b) => a - b);

  const modeText =
    modes.length === 0
      ? "No value repeats"
      : modes.length === 1
        ? `${modes[0]} (${modeCount} times)`
        : `${modes.join(", ")} (each ${modeCount} times)`;

  let running = 0;
  const frequencies: FreqRow[] = [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => {
      running += count;
      return {
        value,
        count,
        percent: Number(((count / n) * 100).toFixed(4)),
        cumulative: Number(((running / n) * 100).toFixed(4)),
      };
    });

  const spread = `${fmt(min, 2)} to ${fmt(max, 2)}`;
  const compares: CompareRow[] = [
    {
      measure: "Mean",
      value: fmt(mean, 4),
      note: "Every value included. Sensitive to extreme readings.",
    },
    {
      measure: "Median",
      value: fmt(median, 4),
      note: "Middle of the ordered list. Unaffected by how far outliers sit.",
    },
    {
      measure: "Mode",
      value: modeText,
      note: modes.length <= 1 ? "Most frequent value or set of values." : "Multiple modes — the data is multimodal.",
    },
    {
      measure: "Trimmed mean",
      value: fmt(trimMean, 4),
      note:
        trimCount > 0
          ? `${trimCount} lowest and ${trimCount} highest value(s) discarded.`
          : "Needs at least 5 values to trim.",
    },
    {
      measure: "Geometric mean",
      value: allPositive ? fmt(geometricMean, 4) : "—",
      note: allPositive ? "Useful for growth rates and ratios." : "Requires every value to be positive.",
    },
    {
      measure: "Midrange",
      value: fmt(midrange, 4),
      note: "Halfway between the min and the max. Uses only two values.",
    },
    {
      measure: "Range",
      value: spread,
      note: `Total spread of ${fmt(range, 2)}.`,
    },
  ];

  return {
    valid: true,
    errorMsg: "",
    count: n,
    sum: Number(sum.toFixed(6)),
    mean: Number(mean.toFixed(6)),
    median: Number(median.toFixed(6)),
    modeText,
    modeCount,
    modes,
    range: Number(range.toFixed(6)),
    min,
    max,
    midrange: Number(midrange.toFixed(6)),
    trimMean: Number(trimMean.toFixed(6)),
    geometricMean: Number(geometricMean.toFixed(6)),
    frequencies,
    compares,
    sorted,
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

export default function MeanMedianModeCalculator() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [decimals, setDecimals] = useState("4");
  const [showAdv, setShowAdv] = useState(false);

  const [calcInputs, setCalcInputs] = useState(() => ({ raw: DEFAULT_DATA, decimals: 4 }));
  const [results, setResults] = useState<MmmResult>(() => computeMmm(DEFAULT_DATA));

  const runCalculate = () => {
    const inputs = { raw: data, decimals: Math.max(0, Math.min(8, parseFloat(decimals) || 4)) };
    setCalcInputs(inputs);
    setResults(computeMmm(inputs.raw));
  };

  const reset = () => {
    setData(DEFAULT_DATA);
    setDecimals("4");
    setCalcInputs({ raw: DEFAULT_DATA, decimals: 4 });
    setResults(computeMmm(DEFAULT_DATA));
  };

  const faqs = [
    {
      question: "What is the difference between the mean, the median and the mode?",
      answer:
        "The mean is the arithmetic average of every value, the median is the middle value once the data is sorted, and the mode is the value that appears most often. The mean reacts to extreme readings, the median ignores how far extremes sit from the middle, and the mode is the only one of the three that can also describe non-numeric data such as the most common shoe size or delivery route.",
    },
    {
      question: "When should I report the median instead of the mean?",
      answer:
        "Report the median whenever the data is skewed or contains outliers. Incomes, house prices and hospital waiting times are the classic cases: a single very large value can lift the mean well above the typical case while the median stays anchored to the middle of the list. Publishing both together is the clearest and most honest practice.",
    },
    {
      question: "What does it mean when there is no mode?",
      answer:
        "When every value in the set appears exactly once there is no mode at all, and the calculator says so rather than inventing one. When two or more values tie for the highest count the data is multimodal and every tied value is reported. With continuous measurements a mode rarely appears unless the readings are rounded to a common grid.",
    },
    {
      question: "What is a trimmed mean and when is it useful?",
      answer:
        "A trimmed mean removes a small percentage of the lowest and highest values before averaging, which softens the influence of outliers while still using most of the data. It sits between the ordinary mean and the median: it uses more information than the median, and is far less fragile than the raw mean. Sports scoring and judged competitions often use it for exactly that reason.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Mean, Median, Mode Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mean, Median, Mode Calculator</h1>

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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Mean (Average)</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.mean, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.count} values with a total of ${fmt(results.sum, calcInputs.decimals)}`
                  : "Fix the highlighted inputs to see an answer"}
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mode</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? (results.modes.length > 0 ? results.modes.join(", ") : "None") : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Range</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.range, calcInputs.decimals) : "—"}</span>
              </div>
            </div>

            {/* MEASURE COMPARISON TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measure</th>
                    <th className="p-2.5 text-right">Value</th>
                    <th className="p-2.5 pr-3 hidden sm:table-cell">What It Tells You</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.compares.map((row) => (
                    <tr key={row.measure} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.measure}</td>
                      <td className="p-2.5 text-right font-bold text-foreground">{row.value}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground hidden sm:table-cell">{row.note}</td>
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
                    <th className="p-2.5 pr-3 text-right w-[130px]">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.frequencies.map((row) => (
                    <tr
                      key={row.value}
                      className={`hover:bg-secondary/20 transition-colors ${row.count === results.modeCount && results.modeCount > 1 ? "bg-secondary/20" : ""}`}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{fmt(row.value, 4)}</td>
                      <td className="p-2.5 text-right text-foreground">{row.count}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.percent, 2)}%`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.cumulative, 2)}%`}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{results.count}</td>
                    <td className="p-2.5 text-right text-foreground">100.00%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">100.00%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mean − Median Gap</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.mean - results.median, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Skew Reading</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? Math.abs(results.mean - results.median) < 0.01
                        ? "Symmetric"
                        : results.mean > results.median
                          ? "Right-skewed"
                          : "Left-skewed"
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Minimum / Maximum</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.min, 2)} / ${fmt(results.max, 2)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Trimmed Mean (10%)</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.trimMean, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Distinct Values</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.frequencies.length} of ${results.count}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Geometric Mean</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && results.geometricMean > 0 ? fmt(results.geometricMean, calcInputs.decimals) : "n/a"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Mean, Median, Mode Calculator?</h2>
            <p>
              A mean, median, mode calculator summarises a list of numbers with the three averages that matter most. Paste in
              the data and it reports the arithmetic mean, the median taken from the ordered list, and the mode, which is the
              value appearing most often. Alongside them you get the count, sum, range, minimum, maximum, midrange, a trimmed
              mean and the geometric mean where the data allows it, plus a frequency table showing how often each distinct
              value occurs.
            </p>
            <p>
              These three averages answer different questions about the same numbers. The mean tells you what each item would
              get if the total were split evenly, the median tells you what the typical item looks like once everything is
              lined up, and the mode tells you which value is most common. Reading them together is the quickest way to
              understand the shape of a data set before doing anything more complicated with it.
            </p>
            <p>
              The calculator is useful for homework, for studying a report before a meeting and for checking data you have
              already worked out by hand. Statisticians, teachers, analysts and anyone dealing with survey results or
              measurements can use it to confirm that their manual figures agree with the standard definitions.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The values are parsed into an array, however you choose to separate them, and any value that is not a number is
              skipped. The sum is divided by the count to give the mean. The array is then sorted ascending, and the median is
              the middle entry: with an odd count it is the centre value exactly, and with an even count it is the average of
              the two central values. That average is the convention used in virtually every textbook.
            </p>
            <p>
              For the mode, the calculator counts how many times each distinct value appears. The highest count wins; if that
              count is one, no value repeats and the calculator reports that there is no mode rather than naming an arbitrary
              one. If several values tie on the highest count the set is multimodal and every tied value is listed, which
              matters because multimodal data often hides two separate populations inside a single sample.
            </p>
            <p>
              The extra measures follow from the same foundations. The trimmed mean discards a tenth of the values at each end
              when the sample is large enough to allow it, so outlying readings carry less weight. The geometric mean
              multiplies the values, takes the n-th root and is only offered when every value is positive, since it is
              designed for growth rates and ratios rather than raw quantities that can go negative.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the mean, and the three-stat bar reports the median, the mode and the range. The first
              table lines up every average with a short note about what it reveals, so you can see at a glance whether the
              mean and median agree. The frequency table below shows each distinct value with its count, its share and a
              running cumulative percentage, and it highlights any value that ties for the highest count.
            </p>
            <p>
              The gap between the mean and the median is the clearest signal in the whole report. When the two nearly match,
              the data is close to symmetric and the mean is a fair summary. When the mean sits well above the median a few
              large readings are pulling it upward, giving the familiar right-skewed pattern of incomes, house prices and
              waiting times. When the mean sits below the median the tails run the other way, which happens with scores that
              hit a ceiling or measurements bounded below.
            </p>
            <p>
              Use the mode to find repeats and clusters. A strong single mode points to a common value or a rounded
              measurement grid, several modes suggest mixed groups in the data, and no mode at all tells you the readings are
              spread thinly. Consult the frequency table before trusting any single average, because summary figures can hide
              two quite different groups sitting under one number.
            </p>
            <p>
              Keep the raw list saved next to any summary you publish and note the count, since a mean taken from five values
              and one taken from five hundred carry very different weight even when they print identically. When teaching or
              checking homework, it also helps to sort the data yourself and verify the middle value, because the median is
              the one figure most often misread when a list has an even number of entries and no single centre value exists.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mean-median-mode-calculator" />
          <PopularCalculators exclude="/calculator/mean-median-mode-calculator" />
        </div>
      </div>
    </>
  );
}
