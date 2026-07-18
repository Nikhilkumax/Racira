"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, AlertTriangle, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

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
  groupCounts: number[];
  significant: boolean;
  interpretation: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { group: string; mean: number; fill: string }[];
}

// Regularized incomplete beta function for F-distribution CDF
function logGamma(x: number): number {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (y + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 100;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
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
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betacf(a, b, x) / a;
  } else {
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
}

// F-distribution CDF: P(F <= f) with df1, df2 degrees of freedom
function fCDF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  const x = df2 / (df2 + df1 * f);
  return 1 - betai(df2 / 2, df1 / 2, x);
}

function calcAnova(inputs: { groups: string[]; alpha: number }): AnovaResult | null {
  const { groups, alpha } = inputs;
  const parsedGroups: number[][] = [];
  for (const g of groups) {
    if (!g.trim()) continue;
    const vals = g.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (vals.length > 0) parsedGroups.push(vals);
  }
  if (parsedGroups.length < 2) return null;

  const k = parsedGroups.length;
  const groupMeans = parsedGroups.map(g => g.reduce((a, b) => a + b, 0) / g.length);
  const groupCounts = parsedGroups.map(g => g.length);
  const N = groupCounts.reduce((a, b) => a + b, 0);
  const grandMean = parsedGroups.flat().reduce((a, b) => a + b, 0) / N;

  let ssBetween = 0;
  for (let i = 0; i < k; i++) {
    ssBetween += groupCounts[i] * Math.pow(groupMeans[i] - grandMean, 2);
  }

  let ssWithin = 0;
  for (let i = 0; i < k; i++) {
    for (const val of parsedGroups[i]) {
      ssWithin += Math.pow(val - groupMeans[i], 2);
    }
  }

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const dfTotal = N - 1;
  const msBetween = dfBetween > 0 ? ssBetween / dfBetween : 0;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0;
  const fStatistic = msWithin > 0 ? msBetween / msWithin : 0;
  const pValue = fCDF(fStatistic, dfBetween, dfWithin);
  const pValOneTail = 1 - pValue;
  const significant = pValOneTail < alpha;

  let interpretation = "";
  if (significant) {
    interpretation = `The p-value (${pValOneTail.toFixed(4)}) is less than α (${alpha}). Reject the null hypothesis — there is a statistically significant difference between group means.`;
  } else {
    interpretation = `The p-value (${pValOneTail.toFixed(4)}) is greater than or equal to α (${alpha}). Fail to reject the null hypothesis — no statistically significant difference between group means was found.`;
  }

  const r = (n: number) => parseFloat(n.toFixed(4));
  const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1"];

  const breakdown = [
    { label: "F-Statistic", value: `${r(fStatistic)}` },
    { label: "P-Value", value: `${r(pValOneTail)}` },
    { label: "Significance Level (α)", value: `${alpha}` },
    { label: "Result", value: significant ? "Significant" : "Not Significant" },
    { label: "Degrees of Freedom (Between)", value: `${dfBetween}` },
    { label: "Degrees of Freedom (Within)", value: `${dfWithin}` },
    { label: "Sum of Squares (Between)", value: `${r(ssBetween)}` },
    { label: "Sum of Squares (Within)", value: `${r(ssWithin)}` },
    { label: "Mean Square (Between)", value: `${r(msBetween)}` },
    { label: "Mean Square (Within)", value: `${r(msWithin)}` },
    { label: "Grand Mean", value: `${r(grandMean)}` },
    { label: "Total Observations", value: `${N}` },
  ];

  const summaryStats = [
    { label: "F-Statistic", value: `${r(fStatistic)}` },
    { label: "P-Value", value: `${r(pValOneTail)}` },
    { label: "Significant", value: significant ? "Yes" : "No" },
    { label: "DF Between", value: `${dfBetween}` },
    { label: "DF Within", value: `${dfWithin}` },
    { label: "SS Between", value: `${r(ssBetween)}` },
    { label: "SS Within", value: `${r(ssWithin)}` },
    { label: "MS Between", value: `${r(msBetween)}` },
    { label: "MS Within", value: `${r(msWithin)}` },
    { label: "Grand Mean", value: `${r(grandMean)}` },
  ];

  const chartData = groupMeans.map((m, i) => ({
    group: `Group ${i + 1}`,
    mean: r(m),
    fill: colors[i % colors.length],
  }));

  return {
    fStatistic: r(fStatistic), pValue: r(pValOneTail), dfBetween, dfWithin, dfTotal,
    ssBetween: r(ssBetween), ssWithin: r(ssWithin), ssTotal: r(ssTotal),
    msBetween: r(msBetween), msWithin: r(msWithin), grandMean: r(grandMean),
    groupMeans: groupMeans.map(m => r(m)), groupCounts, significant, interpretation,
    breakdown, summaryStats, chartData,
  };
}

const DEFAULTS = {
  group1: "10, 12, 14, 11, 13",
  group2: "15, 17, 16, 14, 18",
  group3: "20, 22, 19, 21, 23",
  group4: "",
  group5: "",
  alpha: "0.05",
};

export default function AnovaCalculator() {
  const [group1, setGroup1] = useState(DEFAULTS.group1);
  const [group2, setGroup2] = useState(DEFAULTS.group2);
  const [group3, setGroup3] = useState(DEFAULTS.group3);
  const [group4, setGroup4] = useState(DEFAULTS.group4);
  const [group5, setGroup5] = useState(DEFAULTS.group5);
  const [alpha, setAlpha] = useState(DEFAULTS.alpha);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<AnovaResult | null>(null);

  const calculate = () => {
    setErrorMsg("");
    const groups = [group1, group2, group3, group4, group5];
    const validGroups = groups.filter(g => g.trim() && g.split(",").map(v => parseFloat(v.trim())).some(v => !isNaN(v)));
    if (validGroups.length < 2) { setErrorMsg("Please enter at least 2 groups with valid data."); return; }
    const a = parseFloat(alpha);
    if (isNaN(a) || a <= 0 || a >= 1) { setErrorMsg("Significance level must be between 0 and 1 (e.g., 0.05)."); return; }
    const res = calcAnova({ groups, alpha: a });
    if (!res) setErrorMsg("Unable to calculate. Please check your inputs.");
    else setResult(res);
  };

  const reset = () => {
    setGroup1(DEFAULTS.group1); setGroup2(DEFAULTS.group2); setGroup3(DEFAULTS.group3);
    setGroup4(DEFAULTS.group4); setGroup5(DEFAULTS.group5); setAlpha(DEFAULTS.alpha);
    setErrorMsg(""); setShowAdvanced(false);
    setResult(calcAnova({ groups: [DEFAULTS.group1, DEFAULTS.group2, DEFAULTS.group3, "", ""], alpha: 0.05 }));
  };

  useEffect(() => { setResult(calcAnova({ groups: [DEFAULTS.group1, DEFAULTS.group2, DEFAULTS.group3, "", ""], alpha: 0.05 })); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const ta = "w-full min-h-[40px] px-3 py-2 text-base bg-transparent outline-none border border-input rounded-md shadow-sm focus:ring-2 focus:ring-primary/20 resize-none";

  const faqs = [
    { question: "What is a one-way ANOVA?", answer: "A one-way ANOVA (Analysis of Variance) tests whether the means of three or more independent groups are statistically different from each other. It compares the variance between groups to the variance within groups using the F-statistic." },
    { question: "What does the p-value mean in ANOVA?", answer: "The p-value represents the probability of observing an F-statistic as extreme as the one calculated, assuming the null hypothesis (all group means are equal) is true. A p-value below your significance level (typically 0.05) indicates a statistically significant difference between at least one pair of group means." },
    { question: "What are the assumptions of ANOVA?", answer: "ANOVA assumes: (1) Independence of observations, (2) Normal distribution of residuals, (3) Homogeneity of variance (equal variances across groups), and (4) Continuous dependent variable. Violations of these assumptions may require non-parametric alternatives like the Kruskal-Wallis test." },
    { question: "How do I interpret the F-statistic?", answer: "The F-statistic is the ratio of between-group variance to within-group variance. A larger F-value indicates greater differences between group means relative to within-group variability. The F-value alone is not sufficient — you must compare the associated p-value to your significance level to determine statistical significance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "ANOVA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ANOVA Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Group 1 Data (comma-separated)</label>
                <textarea value={group1} onChange={e => setGroup1(e.target.value)} className={ta} placeholder="e.g., 10, 12, 14, 11, 13" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Group 2 Data (comma-separated)</label>
                <textarea value={group2} onChange={e => setGroup2(e.target.value)} className={ta} placeholder="e.g., 15, 17, 16, 14, 18" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Group 3 Data</label>
                <textarea value={group3} onChange={e => setGroup3(e.target.value)} className={ta} placeholder="e.g., 20, 22, 19" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Significance Level (α)</label>
                <div className={inp}><input type="number" step="0.01" value={alpha} onChange={e => setAlpha(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-primary font-medium flex items-center gap-1 self-start">
              Advanced Options <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Additional Groups</div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Group 4 Data</label>
                  <textarea value={group4} onChange={e => setGroup4(e.target.value)} className={ta} placeholder="e.g., 18, 20, 19" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Group 5 Data</label>
                  <textarea value={group5} onChange={e => setGroup5(e.target.value)} className={ta} placeholder="e.g., 12, 14, 13" />
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />{errorMsg}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">F-Statistic</div>
                <div className="text-4xl font-extrabold tracking-tight text-primary">{result.fStatistic}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.interpretation}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["P-Value", result.pValue.toFixed(4)], ["DF Between", `${result.dfBetween}`], ["DF Within", `${result.dfWithin}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">ANOVA Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Group Means Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v, "Mean"]} />
                    <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an ANOVA Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An ANOVA (Analysis of Variance) calculator is a statistical tool that tests whether the means of three or more independent groups are significantly different from each other. Developed by Ronald Fisher in the early 20th century, ANOVA compares the variance between groups to the variance within groups to determine if observed differences are likely due to chance or reflect true population differences. The one-way ANOVA is the most common form, analyzing a single independent variable across multiple groups. It produces an F-statistic and a p-value that tell you whether to reject the null hypothesis that all group means are equal.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator works by partitioning total variance into two components: between-group variance (SSB) and within-group variance (SSW). The F-statistic is calculated as F = MSB / MSW, where MSB = SSB / (k−1) and MSW = SSW / (N−k), with k being the number of groups and N the total number of observations. SSB measures how much the group means differ from the grand mean, weighted by group size. SSW measures the variability of individual data points around their respective group means. The p-value is derived from the F-distribution with degrees of freedom (k−1, N−k). If the p-value is less than your chosen significance level (α, typically 0.05), you reject the null hypothesis and conclude that at least one group mean differs significantly from the others.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result card displays the F-statistic along with an interpretation of whether the result is statistically significant. The 3-stat bar shows the p-value and degrees of freedom for between and within groups. The breakdown table provides all ANOVA components including sum of squares, mean squares, and the grand mean. The bar chart compares the means of each group visually, helping you identify which groups differ most. The summary statistics mirror the breakdown table for quick reference. Remember that a significant ANOVA result tells you that at least one group differs, but does not identify which specific pairs differ — for that, you need post-hoc tests like Tukey's HSD or Bonferroni correction.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/anova-calculator" />
          <PopularCalculators exclude="/calculator/anova-calculator" />
        </div>
      </div>
    </>
  );
}