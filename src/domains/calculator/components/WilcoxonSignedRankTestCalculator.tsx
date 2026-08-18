"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WilcoxonInput {
  diffs: number[]; // paired differences (post - pre)
  alpha: number;
}

interface WilcoxonResult {
  wPlus: number;
  wMinus: number;
  n: number;
  pValue: number | null;
  significant: boolean | null;
  verdict: string;
  verdictColor: string;
  meanW: number;
  sdW: number;
  chartData: { name: string; diff: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// Rank a list of absolute values with tie averaging
function rankAbs(values: number[]): { rank: number; sign: number }[] {
  const items = values
    .map((v, i) => ({ v: Math.abs(v), sign: v > 0 ? 1 : v < 0 ? -1 : 0, i }))
    .filter((x) => x.sign !== 0)
    .sort((a, b) => a.v - b.v);
  const out: { rank: number; sign: number }[] = [];
  let idx = 0;
  while (idx < items.length) {
    let j = idx;
    while (j + 1 < items.length && items[j + 1].v === items[idx].v) j++;
    const avgRank = (idx + j) / 2 + 1; // 1-based average rank
    for (let k = idx; k <= j; k++) out.push({ rank: avgRank, sign: items[k].sign });
    idx = j + 1;
  }
  return out;
}

// Exact two-tailed p-value: enumerate all 2^n sign assignments of the ranks
function exactWilcoxonP(ranks: { rank: number; sign: number }[]): { wPlus: number; wMinus: number; p: number } {
  let wPlus = 0;
  let wMinus = 0;
  for (const r of ranks) {
    if (r.sign > 0) wPlus += r.rank;
    else wMinus += r.rank;
  }
  const w = Math.min(wPlus, wMinus);
  const n = ranks.length;
  const total = 1 << n;
  let count = 0;
  for (let mask = 0; mask < total; mask++) {
    let s = 0;
    for (let b = 0; b < n; b++) if (mask & (1 << b)) s += ranks[b].rank;
    if (s <= w) count++;
  }
  const p = Math.min(1, (2 * count) / total);
  return { wPlus, wMinus, p };
}

function calcWilcoxon(input: WilcoxonInput): WilcoxonResult {
  const { alpha } = input;
  const ranked = rankAbs(input.diffs);
  const n = ranked.length;

  let pValue: number | null = null;
  let wPlus = 0;
  let wMinus = 0;
  if (n > 0) {
    const res = exactWilcoxonP(ranked);
    wPlus = res.wPlus;
    wMinus = res.wMinus;
    pValue = res.p;
  }

  const meanW = (n * (n + 1)) / 4;
  const sdW = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);

  const significant = pValue !== null ? pValue < alpha : null;
  const verdict =
    significant === null
      ? "No non-zero differences"
      : significant
      ? "Statistically Significant"
      : "Not Significant";
  const verdictColor =
    significant === null
      ? "text-muted-foreground"
      : significant
      ? "text-emerald-600"
      : "text-amber-500";

  const chartData = input.diffs.map((d, i) => ({
    name: `d${i + 1}`,
    diff: d,
    fill: d > 0 ? "#10b981" : d < 0 ? "#ef4444" : "#d4d4d4",
  }));

  const breakdown = [
    ...input.diffs.map((d, i) => ({ label: `Difference d${i + 1} (post − pre)`, value: d > 0 ? `+${d}` : `${d}` })),
    { label: "Non-zero Differences (n)", value: `${n}` },
    { label: "W⁺ (sum of positive ranks)", value: wPlus.toFixed(1) },
    { label: "W⁻ (sum of negative ranks)", value: wMinus.toFixed(1) },
    { label: "Expected W⁺ under null", value: meanW.toFixed(1) },
    { label: "Std. Dev. of W⁺", value: sdW.toFixed(2) },
    { label: `p-value (two-tailed, α = ${alpha.toFixed(2)})`, value: pValue !== null ? pValue.toFixed(4) : "—" },
    { label: "Verdict", value: verdict },
  ];

  const summaryStats = [
    { label: "W statistic (min tail)", value: Math.min(wPlus, wMinus).toFixed(1) },
    { label: "Sample Size (n)", value: `${n}` },
    { label: "p-value (exact)", value: pValue !== null ? pValue.toFixed(4) : "—" },
    { label: "Verdict", value: verdict },
    { label: "Method", value: "Exact enumeration of sign assignments" },
    { label: "Test Type", value: "Paired / one-sample Wilcoxon" },
  ];

  return { wPlus, wMinus, n, pValue, significant, verdict, verdictColor, meanW, sdW, chartData, breakdown, summaryStats };
}

const DEFAULT_DIFFS = [4, -2, 6, 1, 3, -1, 5, 0];

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WilcoxonSignedRankTestCalculator() {
  const [diffs, setDiffs] = useState(DEFAULT_DIFFS.map(String));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [alpha, setAlpha] = useState("0.05");
  const [result, setResult] = useState<WilcoxonResult | null>(null);

  const parseArr = () =>
    diffs.map((s) => {
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : 0;
    });

  const calculate = () =>
    setResult(
      calcWilcoxon({
        diffs: parseArr(),
        alpha: Math.min(0.5, Math.max(0.001, parseFloat(alpha) || 0.05)),
      })
    );
  const reset = () => {
    setDiffs(DEFAULT_DIFFS.map(String));
    setAlpha("0.05");
    setResult(calcWilcoxon({ diffs: DEFAULT_DIFFS, alpha: 0.05 }));
  };
  useEffect(() => {
    setResult(calcWilcoxon({ diffs: DEFAULT_DIFFS, alpha: 0.05 }));
  }, []);

  const faqs = [
    { question: "What is the Wilcoxon signed-rank test?", answer: "It is a non-parametric alternative to the paired t-test. Instead of assuming the differences are normally distributed, it ranks the absolute differences and checks whether the positive and negative ranks are balanced. It only assumes the differences are symmetric around the median." },
    { question: "When should I use it instead of a paired t-test?", answer: "Use the Wilcoxon signed-rank test when the paired differences are clearly non-normal, contain strong outliers, or come from an ordinal scale. The paired t-test is more powerful when the data is truly normal; Wilcoxon is the safer choice otherwise and loses little power." },
    { question: "How are ties handled?", answer: "Zero differences are dropped from the analysis. Ties in the absolute values share the average of the ranks they would occupy (for example, two tied values in positions 2 and 3 each receive rank 2.5). The exact p-value is computed by enumerating all sign assignments of the averaged ranks." },
    { question: "What does the p-value mean here?", answer: "It is the probability of seeing a W⁺ this far from its expected value if the true median difference were zero. A p-value below your significance level (0.05 by default) means the shift is statistically significant. The exact p-value is used, not the normal approximation, so small samples are handled correctly." },
    { question: "What inputs should I enter?", answer: "Enter the paired differences (after minus before, or treatment minus control) for each subject. Positive values mean an increase, negative values a decrease. If your data is in two columns, subtract the before column from the after column first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Wilcoxon Signed-Rank Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Wilcoxon Signed-Rank Test Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Paired differences (after − before) for each subject:</div>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="grid grid-cols-2 gap-3">
                {[0, 1].map((col) => {
                  const i = row * 2 + col;
                  return (
                    <div key={col}>
                      <label className="text-sm font-medium mb-1 block">Subject {i + 1} difference</label>
                      <div className={inp}><input type="number" value={diffs[i]} onChange={(e) => setDiffs((v) => v.map((x, j) => (j === i ? e.target.value : x)))} className={ci} /></div>
                    </div>
                  );
                })}
              </div>
            ))}

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-sm text-primary font-medium text-left self-start"
            >
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Significance Level (α)</label>
                  <div className={inp}><input type="number" value={alpha} onChange={(e) => setAlpha(e.target.value)} step={0.01} min={0.001} max={0.5} className={ci} /></div>
                  <p className="text-xs text-muted-foreground mt-1">Standard: 0.05 (5%).</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">W statistic (smaller of W⁺, W⁻)</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.verdictColor}`}>{Math.min(result.wPlus, result.wMinus).toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Verdict: {result.verdict} · p = {result.pValue !== null ? result.pValue.toFixed(4) : "—"}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["W⁺", result.wPlus.toFixed(1)], ["W⁻", result.wMinus.toFixed(1)], ["n (non-zero)", `${result.n}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Test Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === diffs.length + 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Paired Differences</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v > 0 ? `+${v}` : `${v}`, "Difference"]} />
                      <Bar dataKey="diff" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Wilcoxon Signed-Rank Test?</h2>
            <p>Developed by Frank Wilcoxon in 1945, the signed-rank test compares a sample of paired measurements against a hypothesized median (usually zero). It is the standard non-parametric counterpart to the paired t-test: rather than assuming normality, it ranks the absolute differences and asks whether positive and negative ranks occur in roughly equal proportions.</p>
            <h2 className="text-2xl font-bold mb-3">How the Calculation Works</h2>
            <p>Zero differences are discarded. The remaining absolute differences are ranked from smallest to largest, with ties receiving the average rank. The ranks of positive differences are summed to give W⁺, and the ranks of negative differences give W⁻. Under the null hypothesis of no shift, W⁺ follows a known distribution centered at n(n+1)/4.</p>
            <p>This calculator computes the exact two-tailed p-value by enumerating every possible sign assignment of the observed ranks — the same logic as the textbook exact test — so results are correct even for small samples where the normal approximation would be unreliable.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Result</h2>
            <p>If the p-value falls below your significance level, the median difference is significantly different from zero. The smaller of W⁺ and W⁻ is the reported statistic, matching the convention used in most tables. Report the sample size and the direction of the shift (which tail is larger) alongside the p-value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wilcoxon-signed-rank-test-calculator" />
          <PopularCalculators exclude="/calculator/wilcoxon-signed-rank-test-calculator" />
        </div>
      </div>
    </>
  );
}
