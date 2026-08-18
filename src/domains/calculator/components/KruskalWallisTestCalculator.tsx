"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ---- Incomplete gamma helpers for the chi-square survival function ----
const GAMMA_COEFF = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function logGamma(z: number): number {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < 8; i++) x += GAMMA_COEFF[i] / (z + i + 1);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function gser(a: number, x: number): number {
  const ITMAX = 200, EPS = 3e-12;
  if (x <= 0) return 0;
  let ap = a, sum = 1 / a, del = sum;
  for (let n = 0; n < ITMAX; n++) {
    ap += 1; del *= x / ap; sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}
function gcf(a: number, x: number): number {
  const ITMAX = 200, EPS = 3e-12, FPMIN = 1e-300;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}
function chi2Survival(x: number, df: number): number {
  const a = df / 2, xx = x / 2;
  if (xx < a + 1) return 1 - gser(a, xx);
  return gcf(a, xx);
}

const CRITICAL_05: Record<number, number> = { 1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.07, 6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307, 11: 19.675, 12: 21.026 };

interface KwResult {
  groups: number[][];
  groupStats: { label: string; n: number; rankSum: number; meanRank: number }[];
  n: number;
  k: number;
  h: number;
  hAdj: number;
  tieCorrection: number;
  df: number;
  pValue: number;
  critical: number;
  significant: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; meanRank: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcKw(groups: number[][]): KwResult {
  const k = groups.length;
  const n = groups.reduce((s, g) => s + g.length, 0);
  // pool and rank (average ranks for ties)
  const pooled = groups.flatMap((g, gi) => g.map((v) => ({ v, gi }))).sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(pooled.length);
  let i = 0;
  while (i < pooled.length) {
    let j = i;
    while (j + 1 < pooled.length && pooled[j + 1].v === pooled[i].v) j++;
    const avg = (i + j) / 2 + 1;
    for (let t = i; t <= j; t++) ranks[t] = avg;
    i = j + 1;
  }
  const rankSums = new Array<number>(k).fill(0);
  for (let t = 0; t < pooled.length; t++) rankSums[pooled[t].gi] += ranks[t];
  // tie correction
  let tieSum = 0;
  i = 0;
  while (i < pooled.length) {
    let j = i;
    while (j + 1 < pooled.length && pooled[j + 1].v === pooled[i].v) j++;
    const t = j - i + 1;
    if (t > 1) tieSum += t * t * t - t;
    i = j + 1;
  }
  const tieCorrection = 1 - tieSum / (n * n * n - n);
  let sum = 0;
  groups.forEach((g, gi) => { sum += (rankSums[gi] * rankSums[gi]) / g.length; });
  const h = (12 / (n * (n + 1))) * sum - 3 * (n + 1);
  const hAdj = tieCorrection > 0 ? h / tieCorrection : h;
  const df = k - 1;
  const pValue = chi2Survival(hAdj, df);
  const critical = CRITICAL_05[df] ?? 3.841;
  const significant = pValue < 0.05;
  const groupStats = groups.map((g, gi) => ({
    label: `Group ${String.fromCharCode(65 + gi)}`,
    n: g.length,
    rankSum: rankSums[gi],
    meanRank: rankSums[gi] / g.length,
  }));
  const breakdown = [
    ...groupStats.map((g) => ({ label: `${g.label} (n = ${g.n})`, value: `Rank sum ${fmt(g.rankSum, 2)} · mean ${fmt(g.meanRank, 2)}` })),
    { label: "Total Observations (N)", value: `${n}` },
    { label: "Number of Groups (k)", value: `${k}` },
    { label: "Tie Correction Factor", value: fmt(tieCorrection, 6) },
    { label: "H Statistic (uncorrected)", value: fmt(h) },
    { label: "H Statistic (tie-corrected)", value: fmt(hAdj) },
    { label: "Degrees of Freedom", value: `${df}` },
    { label: "P-Value", value: fmt(pValue) },
    { label: "Critical Value (α = 0.05)", value: `${critical}` },
    { label: "Conclusion", value: significant ? "Reject H₀ — medians differ" : "Fail to reject H₀ — no evidence medians differ" },
  ];
  const summaryStats = [
    { label: "H Statistic", value: fmt(hAdj) },
    { label: "P-Value", value: fmt(pValue) },
    { label: "Degrees of Freedom", value: `${df}` },
    { label: "Critical Value (0.05)", value: `${critical}` },
    { label: "Conclusion", value: significant ? "Significant" : "Not significant" },
    { label: "Sample Size", value: `${n}` },
    { label: "Groups", value: `${k}` },
    { label: "Tie Correction", value: fmt(tieCorrection, 6) },
  ];
  const chartData = groupStats.map((g, i) => ({ name: g.label, meanRank: Number(g.meanRank.toFixed(2)), fill: i === 0 ? "hsl(var(--primary))" : i === 1 ? "#8b5cf6" : "#f59e0b" }));
  return { groups, groupStats, n, k, h, hAdj, tieCorrection, df, pValue, critical, significant, breakdown, summaryStats, chartData };
}

const DEFAULTS = { g1: "85, 70, 90, 78, 92", g2: "60, 55, 65, 58, 62", g3: "40, 45, 42, 38, 48" };

export default function KruskalWallisTestCalculator() {
  const [g1, setG1] = useState(DEFAULTS.g1);
  const [g2, setG2] = useState(DEFAULTS.g2);
  const [g3, setG3] = useState(DEFAULTS.g3);
  const [result, setResult] = useState<KwResult | null>(null);

  const parse = (t: string) => t.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const groups = [parse(g1), parse(g2), parse(g3)];
  const errs: string[] = [];
  if (groups.some((g) => g.length < 2)) errs.push("Each group needs at least two values.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcKw(groups)); };
  const reset = () => {
    setG1(DEFAULTS.g1); setG2(DEFAULTS.g2); setG3(DEFAULTS.g3);
    setResult(calcKw([[85, 70, 90, 78, 92], [60, 55, 65, 58, 62], [40, 45, 42, 38, 48]]));
  };
  useEffect(() => { setResult(calcKw([[85, 70, 90, 78, 92], [60, 55, 65, 58, 62], [40, 45, 42, 38, 48]])); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[64px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the Kruskal-Wallis test?", answer: "It is the non-parametric alternative to one-way ANOVA. Instead of comparing means, it compares the average ranks of two or more independent groups and tests whether at least one group's population tends to produce larger values than the others." },
    { question: "When should I use it instead of ANOVA?", answer: "Use Kruskal-Wallis when the data is ordinal, strongly skewed, or fails the normality assumption of ANOVA. It is also robust to outliers because it works on ranks rather than raw values." },
    { question: "How is the H statistic corrected for ties?", answer: "When values repeat, average ranks are assigned and a tie-correction factor — one minus the sum of (t³ − t) divided by (N³ − N) — is applied in the denominator. Without it, H would be slightly inflated by tied data." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Kruskal-Wallis Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Kruskal-Wallis Test Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              {[["Group A", g1, setG1], ["Group B", g2, setG2], ["Group C", g3, setG3]].map(([label, val, set], i) => (
                <div key={i}>
                  <label className={lbl}>{label as string}</label>
                  <textarea value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className={ta} placeholder="85, 70, 90 ..." />
                </div>
              ))}
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">H Statistic (tie-corrected)</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.hAdj)}</div>
                <div className="text-sm text-muted-foreground mt-1">p = {fmt(result.pValue)} on {result.df} df · {result.significant ? "significant" : "not significant"} at α = 0.05</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`P-Value`, fmt(result.pValue)], ["Df", `${result.df}`], ["Sample Size", `${result.n}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Rank Summary and Test Output</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.k + 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === result.k + 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === result.k + 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Mean Rank by Group</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v, 2), "Mean rank"]} />
                    <Bar dataKey="meanRank" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Groups with clearly separated mean ranks drive a larger H</p>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The H Statistic</h2>
            <p>This <strong>Kruskal-Wallis test calculator</strong> pools all observations, ranks them from smallest to largest (averaging ranks for ties), and computes the H statistic from each group's rank sum: H = 12/(N(N+1)) · Σ(Rᵢ²/nᵢ) − 3(N+1). A tie-correction factor is applied when repeated values are present.</p>
            <h2 className="text-2xl font-bold mb-3">The P-Value</h2>
            <p>Under the null hypothesis that all groups share the same distribution, H follows a chi-square distribution with k − 1 degrees of freedom. The p-value — computed here from the incomplete gamma function — is the probability of an H this large by chance alone.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Result</h2>
            <p>If the p-value falls below 0.05, the test rejects the null and concludes that at least one group's values tend to rank higher or lower than the others. It does not say which groups differ — follow-up pairwise comparisons do that.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/kruskal-wallis-test-calculator" />
          <PopularCalculators exclude="/calculator/kruskal-wallis-test-calculator" />
        </div>
      </div>
    </>
  );
}
