"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, AlertTriangle, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ErrorBar,
} from "recharts";

// ---------- Pure calculate function (zero React, fully typed) ----------

interface AnovaInputs {
  groupA: string;
  groupB: string;
  groupC: string;
  alpha: number;
}

interface AnovaResult {
  fStatistic: number;
  pValue: number;
  dfBetween: number;
  dfWithin: number;
  dfTotal: number;
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  msBetween: number;
  msWithin: number;
  grandMean: number;
  groupMeans: number[];
  groupStd: number[];
  groupCounts: number[];
  alpha: number;
  significant: boolean;
  interpretation: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { group: string; mean: number; std: number; fill: string }[];
}

function parseGroup(raw: string): number[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(",")
    .map((v) => {
      const n = parseFloat(v.trim());
      return isNaN(n) ? NaN : n;
    })
    .filter((n) => !isNaN(n));
}

// Log-gamma (Lanczos approximation)
function logGamma(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (y + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function betai(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

// F-distribution CDF: P(F <= f) with df1, df2 degrees of freedom
function fCDF(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0) return 0;
  const x = df2 / (df2 + df1 * f);
  return 1 - betai(df2 / 2, df1 / 2, x);
}

function stdDev(vals: number[], mean: number): number {
  if (vals.length < 2) return 0;
  const v = vals.reduce((s, x) => s + (x - mean) ** 2, 0) / (vals.length - 1);
  return Math.sqrt(v);
}

function calculate(inputs: AnovaInputs): AnovaResult {
  const groups: number[][] = [
    parseGroup(inputs.groupA),
    parseGroup(inputs.groupB),
    parseGroup(inputs.groupC),
  ].filter((g) => g.length > 0);

  const k = groups.length;
  const groupCounts = groups.map((g) => g.length);
  const groupMeans = groups.map((g) => g.reduce((a, b) => a + b, 0) / Math.max(g.length, 1));
  const groupStd = groups.map((g, i) => stdDev(g, groupMeans[i]));

  const N = groupCounts.reduce((a, b) => a + b, 0);
  const grandMean = N > 0 ? groups.flat().reduce((a, b) => a + b, 0) / N : 0;

  let ssBetween = 0;
  for (let i = 0; i < k; i++) {
    ssBetween += groupCounts[i] * (groupMeans[i] - grandMean) ** 2;
  }

  let ssWithin = 0;
  for (let i = 0; i < k; i++) {
    for (const x of groups[i]) {
      ssWithin += (x - groupMeans[i]) ** 2;
    }
  }

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const dfTotal = N - 1;
  const msBetween = dfBetween > 0 ? ssBetween / dfBetween : 0;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0;
  const fStatistic = msWithin > 0 ? msBetween / msWithin : 0;

  // Upper-tail p-value for the F-test
  const pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
  const alpha = isNaN(inputs.alpha) || inputs.alpha <= 0 || inputs.alpha >= 1 ? 0.05 : inputs.alpha;
  const significant = pValue < alpha;

  let interpretation = "";
  if (k < 2 || N < 2) {
    interpretation = "Enter at least two groups with valid numeric data to run the ANOVA.";
  } else if (significant) {
    interpretation = `The p-value (${pValue.toFixed(4)}) is below α (${alpha}). Reject the null hypothesis — at least one group mean differs significantly. Run a post-hoc test (e.g., Tukey's HSD) to find which groups differ.`;
  } else {
    interpretation = `The p-value (${pValue.toFixed(4)}) is not below α (${alpha}). Fail to reject the null hypothesis — no statistically significant difference between group means was detected.`;
  }

  const r = (n: number) => (isFinite(n) ? parseFloat(n.toFixed(4)) : 0);
  const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899"];

  const breakdown = [
    { label: "F-Statistic", value: `${r(fStatistic)}` },
    { label: "P-Value", value: `${r(pValue)}` },
    { label: "Significance Level (α)", value: `${alpha}` },
    { label: "Result", value: significant ? "Significant" : "Not Significant" },
    { label: "DF Between (k-1)", value: `${dfBetween}` },
    { label: "DF Within (N-k)", value: `${dfWithin}` },
    { label: "SS Between (SSB)", value: `${r(ssBetween)}` },
    { label: "SS Within (SSW)", value: `${r(ssWithin)}` },
    { label: "MS Between (MSB)", value: `${r(msBetween)}` },
    { label: "MS Within (MSW)", value: `${r(msWithin)}` },
    { label: "Grand Mean", value: `${r(grandMean)}` },
    { label: "Total Observations", value: `${N}` },
  ];

  const summaryStats = [
    { label: "F-Statistic", value: `${r(fStatistic)}` },
    { label: "P-Value", value: `${r(pValue)}` },
    { label: "Significant", value: significant ? "Yes" : "No" },
    { label: "DF Between", value: `${dfBetween}` },
    { label: "DF Within", value: `${dfWithin}` },
    { label: "SS Between", value: `${r(ssBetween)}` },
    { label: "SS Within", value: `${r(ssWithin)}` },
    { label: "MS Between", value: `${r(msBetween)}` },
    { label: "MS Within", value: `${r(msWithin)}` },
    { label: "Grand Mean", value: `${r(grandMean)}` },
  ];

  const groupLabels = ["Group A", "Group B", "Group C"];
  const chartData = groups.map((_, i) => ({
    group: groupLabels[i],
    mean: r(groupMeans[i]),
    std: r(groupStd[i]),
    fill: colors[i % colors.length],
  }));

  return {
    fStatistic: r(fStatistic),
    pValue: r(pValue),
    dfBetween,
    dfWithin,
    dfTotal,
    ssBetween: r(ssBetween),
    ssWithin: r(ssWithin),
    ssTotal: r(ssTotal),
    msBetween: r(msBetween),
    msWithin: r(msWithin),
    grandMean: r(grandMean),
    groupMeans: groupMeans.map((m) => r(m)),
    groupStd: groupStd.map((s) => r(s)),
    groupCounts,
    alpha,
    significant,
    interpretation,
    breakdown,
    summaryStats,
    chartData,
  };
}

const DEFAULTS: AnovaInputs = {
  groupA: "12,15,18,11,14",
  groupB: "22,25,19,24,20",
  groupC: "30,28,35,32,29",
  alpha: 0.05,
};

// ---------- Component ----------

export default function AnovaCalculator() {
  const [inputs, setInputs] = useState<AnovaInputs>(DEFAULTS);
  const [result, setResult] = useState<AnovaResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setResult(calculate(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inp =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const ta =
    "w-full min-h-[44px] px-3 py-2 text-base bg-transparent outline-none border border-input rounded-md shadow-sm focus:ring-2 focus:ring-primary/20 resize-none";

  const handleCalculate = () => {
    setErrorMsg("");
    const groups = [inputs.groupA, inputs.groupB, inputs.groupC]
      .map((g) => parseGroup(g))
      .filter((g) => g.length > 0);
    if (groups.length < 2) {
      setErrorMsg("Enter at least two groups with valid comma-separated numbers.");
      return;
    }
    const total = groups.reduce((a, g) => a + g.length, 0);
    if (total < 3) {
      setErrorMsg("Need at least 3 total observations across the groups.");
      return;
    }
    setResult(calculate(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setErrorMsg("");
    setShowAdvanced(false);
    setResult(calculate(DEFAULTS));
  };

  const setValue = (key: keyof AnovaInputs, value: string | number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const faqs = [
    {
      question: "What is a one-way ANOVA?",
      answer:
        "A one-way ANOVA (Analysis of Variance) tests whether the means of three or more independent groups differ significantly. It compares the variance between groups to the variance within groups using the F-statistic.",
    },
    {
      question: "What does the p-value mean in ANOVA?",
      answer:
        "The p-value is the probability of observing an F-statistic as extreme as yours if all group means were truly equal. A p-value below your significance level (typically 0.05) means at least one group mean differs significantly.",
    },
    {
      question: "What are the assumptions of ANOVA?",
      answer:
        "ANOVA assumes independence of observations, approximately normal residuals, and homogeneity of variance (equal group variances). When assumptions are violated, use a non-parametric alternative like the Kruskal-Wallis test.",
    },
    {
      question: "How do I interpret the F-statistic?",
      answer:
        "The F-statistic is the ratio of between-group variance to within-group variance (F = MSB / MSW). A larger F means group means differ more relative to within-group spread, but you still compare the p-value to α for significance.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "ANOVA Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          ANOVA Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: inputs + second tier + Calculate + Reset */}
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Group A (comma-separated)
                </label>
                <textarea
                  value={inputs.groupA}
                  onChange={(e) => setValue("groupA", e.target.value)}
                  className={ta}
                  placeholder="12,15,18,11,14"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Group B (comma-separated)
                </label>
                <textarea
                  value={inputs.groupB}
                  onChange={(e) => setValue("groupB", e.target.value)}
                  className={ta}
                  placeholder="22,25,19,24,20"
                />
              </div>
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary font-medium flex items-center gap-1 self-start"
            >
              Advanced Options{" "}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAdvanced && (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Statistical Parameters
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Significance Level (α)
                  </label>
                  <div className={inp}>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.alpha}
                      onChange={(e) =>
                        setValue("alpha", e.target.value === "" ? NaN : parseFloat(e.target.value))
                      }
                      className={ci}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Threshold for rejecting the null hypothesis.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Group C (comma-separated)
                  </label>
                  <textarea
                    value={inputs.groupC}
                    onChange={(e) => setValue("groupC", e.target.value)}
                    className={ta}
                    placeholder="30,28,35,32,29"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Third sample group for one-way ANOVA.
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: result components */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                F-Statistic
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-primary">
                {result.fStatistic}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.interpretation}
              </div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["P-Value", result.pValue.toFixed(4)],
                ["DF Between", `${result.dfBetween}`],
                ["DF Within", `${result.dfWithin}`],
              ].map(([l, v], i) => (
                <div
                  key={i}
                  className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}
                >
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
                    {l}
                  </div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">ANOVA Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 last:border-0 ${
                        i === 0 ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recharts BarChart with error bars */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Group Means (± Std Dev)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={result.chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v: number, n: string) =>
                      n === "mean" ? [v, "Mean"] : [v, "Std Dev"]
                    }
                  />
                  <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <ErrorBar dataKey="std" width={6} strokeWidth={2} stroke="var(--foreground)" direction="y" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO content (~400 words, 3 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                What Is an ANOVA Calculator?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                An ANOVA (Analysis of Variance) calculator is a statistical tool that
                tests whether the means of three or more independent groups are
                significantly different from each other. Introduced by Ronald Fisher,
                ANOVA partitions the total variation in your data into the variation
                between group means and the variation within each group. The one-way
                ANOVA examines a single factor across multiple groups and produces an
                F-statistic plus a p-value, which together tell you whether to reject
                the null hypothesis that all group means are equal. It is widely used in
                science, engineering, medicine, and business to compare treatments,
                processes, or populations without running many pairwise t-tests, which
                would inflate the risk of false positives.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The calculator splits total variance into two parts: between-group
                variance (SSB) and within-group variance (SSW). It computes the grand
                mean as the average of all values, then SSB = Σ n_i (mean_i − grand_mean)²
                and SSW = ΣΣ (x_ij − mean_i)². Dividing by degrees of freedom gives the
                mean squares MSB = SSB / (k−1) and MSW = SSW / (N−k), where k is the
                number of groups and N is the total sample size. The F-statistic is the
                ratio F = MSB / MSW. The associated p-value comes from the F-distribution
                with (k−1, N−k) degrees of freedom. You set a significance level α
                (commonly 0.05); if p &lt; α you reject the null hypothesis and conclude
                that at least one group mean differs. Because the F-test is sensitive to
                variance assumptions, the tool also displays group means and standard
                deviations so you can sanity-check your data.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                The primary result card shows the F-statistic with a plain-language
                interpretation of significance. The three-stat bar reports the p-value and
                the between/within degrees of freedom, while the breakdown table lists
                SSB, SSW, MSB, MSW, the grand mean, and totals for a full audit trail.
                The bar chart plots each group mean with error bars for the standard
                deviation, giving a quick visual of which groups sit apart. Summary
                statistics recap the key figures side by side. Remember that a significant
                ANOVA only proves that some group differs — it does not name the pair. To
                pinpoint differences, follow a significant result with a post-hoc test
                such as Tukey's HSD or Bonferroni correction, and confirm assumptions of
                normality and equal variance before drawing firm conclusions.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/anova-calculator" />
          <PopularCalculators exclude="/calculator/anova-calculator" />
        </div>
      </div>
    </>
  );
}
