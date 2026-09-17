"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

// ---------- Student's t distribution helpers (for the significance test) ----------
function lgamma(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) x += C[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-10;
  const FPMIN = 1e-30;
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
    lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

function tCdf(t: number, df: number): number {
  if (df <= 0) return 0.5;
  const x = df / (df + t * t);
  const ib = betai(df / 2, 0.5, x);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

// ---------- Spearman ----------
function rankWithTies(values: number[]): number[] {
  const sorted = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v);
  const ranks = new Array(values.length);
  let idx = 0;
  while (idx < sorted.length) {
    let j = idx;
    while (j + 1 < sorted.length && sorted[j + 1].v === sorted[idx].v) j++;
    const avgRank = (idx + j) / 2 + 1;
    for (let k = idx; k <= j; k++) ranks[sorted[k].i] = avgRank;
    idx = j + 1;
  }
  return ranks;
}

interface SpearmanResult {
  rho: number | null;
  tStat: number | null;
  pValue: number | null;
  n: number;
  verdict: string;
  verdictColor: string;
  chartData: { name: string; xRank: number; yRank: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSpearman(xs: number[], ys: number[]): SpearmanResult {
  const n = xs.length;
  const rx = rankWithTies(xs);
  const ry = rankWithTies(ys);

  let rho: number | null = null;
  const meanX = rx.reduce((a, b) => a + b, 0) / n;
  const meanY = ry.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - meanX) * (ry[i] - meanY);
    dx += (rx[i] - meanX) ** 2;
    dy += (ry[i] - meanY) ** 2;
  }
  if (dx > 0 && dy > 0) {
    rho = num / Math.sqrt(dx * dy);
  }

  let tStat: number | null = null;
  let pValue: number | null = null;
  if (rho !== null && n > 2 && rho * rho < 1) {
    tStat = rho * Math.sqrt((n - 2) / (1 - rho * rho));
    pValue = 2 * (1 - tCdf(Math.abs(tStat), n - 2));
  }

  const verdict =
    pValue === null
      ? "Insufficient data"
      : pValue < 0.05
      ? "Statistically Significant"
      : "Not Significant";
  const verdictColor =
    pValue === null
      ? "text-muted-foreground"
      : pValue < 0.05
      ? "text-emerald-600"
      : "text-amber-500";

  const chartData = xs.map((_, i) => ({
    name: `Pair ${i + 1}`,
    xRank: rx[i],
    yRank: ry[i],
  }));

  const breakdown = [
    ...xs.map((_, i) => ({
      label: `Pair ${i + 1} — x: ${xs[i]}, y: ${ys[i]}`,
      value: `rx ${rx[i].toFixed(1)} · ry ${ry[i].toFixed(1)}`,
    })),
    { label: "Number of Pairs (n)", value: `${n}` },
    { label: "Spearman ρ (rank correlation)", value: rho !== null ? rho.toFixed(4) : "—" },
    { label: "t-statistic", value: tStat !== null ? tStat.toFixed(3) : "—" },
    { label: "Degrees of Freedom", value: `${n - 2}` },
    { label: "p-value (two-tailed)", value: pValue !== null ? pValue.toFixed(4) : "—" },
    { label: "Verdict (α = 0.05)", value: verdict },
  ];

  const summaryStats = [
    { label: "Spearman ρ", value: rho !== null ? rho.toFixed(4) : "—" },
    { label: "Strength", value: rho === null ? "—" : Math.abs(rho) >= 0.8 ? "Very strong" : Math.abs(rho) >= 0.6 ? "Strong" : Math.abs(rho) >= 0.4 ? "Moderate" : Math.abs(rho) >= 0.2 ? "Weak" : "Very weak" },
    { label: "p-value", value: pValue !== null ? pValue.toFixed(4) : "—" },
    { label: "Pairs (n)", value: `${n}` },
    { label: "Verdict", value: verdict },
    { label: "Method", value: "Pearson correlation on ranks" },
  ];

  return { rho, tStat, pValue, n, verdict, verdictColor, chartData, breakdown, summaryStats };
}

const DEFAULT_X = [1, 2, 3, 4, 5];
const DEFAULT_Y = [2, 4, 5, 4, 7];

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SpearmanRankCorrelationCalculator() {
  const [xs, setXs] = useState(DEFAULT_X.map(String));
  const [ys, setYs] = useState(DEFAULT_Y.map(String));
  const [result, setResult] = useState<SpearmanResult | null>(null);

  const parseArr = (arr: string[], fallback: number[]) =>
    arr.map((s, i) => {
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : fallback[i];
    });

  const calculate = () =>
    setResult(calcSpearman(parseArr(xs, DEFAULT_X), parseArr(ys, DEFAULT_Y)));
  const reset = () => {
    setXs(DEFAULT_X.map(String));
    setYs(DEFAULT_Y.map(String));
    setResult(calcSpearman(DEFAULT_X, DEFAULT_Y));
  };
  useEffect(() => {
    setResult(calcSpearman(DEFAULT_X, DEFAULT_Y));
  }, []);

  const faqs = [
    { question: "What is Spearman's rank correlation (ρ)?", answer: "Spearman's rho measures the strength of a monotonic relationship between two variables. It converts each variable to ranks and computes the Pearson correlation on those ranks, so it detects a consistently increasing or decreasing relationship — not just straight-line ones — and is robust to outliers." },
    { question: "Spearman vs Pearson — which should I use?", answer: "Use Spearman when the relationship may be curved but monotonic (e.g. exponential growth), when the data has strong outliers, or when the scale is ordinal (rankings, Likert scores). Use Pearson when the relationship is genuinely linear and the data is roughly normal. Spearman is Pearson applied to ranks — it only cares about ordering." },
    { question: "How are ties in the data handled?", answer: "Tied values receive the average of the ranks they would occupy. This calculator uses the exact Pearson-on-ranks definition of Spearman's rho, which handles ties correctly — it does not rely on the simpler 1 − 6Σd²/(n(n²−1)) shortcut, which is only valid when there are no ties." },
    { question: "What does the significance test tell me?", answer: "The calculator converts ρ to a t-statistic with n−2 degrees of freedom and computes a two-tailed p-value from the Student's t distribution. A p-value below 0.05 means the correlation is statistically significant — unlikely to be a chance pattern — given your number of pairs." },
    { question: "How many pairs do I need?", answer: "This calculator accepts five pairs of data points. For significance testing, more pairs give more power — with only five pairs, only very large correlations (roughly |ρ| > 0.9) will reach significance. In practice, aim for at least 10–15 pairs when studying a real relationship." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Spearman Rank Correlation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Spearman Rank Correlation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Pair {i + 1} — x</label>
                  <div className={inp}><input type="number" value={xs[i]} onChange={(e) => setXs((v) => v.map((x, j) => (j === i ? e.target.value : x)))} className={ci} /></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Pair {i + 1} — y</label>
                  <div className={inp}><input type="number" value={ys[i]} onChange={(e) => setYs((v) => v.map((x, j) => (j === i ? e.target.value : x)))} className={ci} /></div>
                </div>
              </div>
            ))}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Spearman Rank Correlation (ρ)</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.verdictColor}`}>{result.rho !== null ? result.rho.toFixed(4) : "—"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Verdict: {result.verdict} · p = {result.pValue !== null ? result.pValue.toFixed(4) : "—"}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["ρ", result.rho !== null ? result.rho.toFixed(4) : "—"], ["t-statistic", result.tStat !== null ? result.tStat.toFixed(3) : "—"], ["p-value", result.pValue !== null ? result.pValue.toFixed(4) : "—"]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Rank Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.n + 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Ranks by Pair</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, result.n]} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="xRank" name="x rank" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="yRank" name="y rank" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">When the two rank profiles track each other, ρ is high; when they move in opposite directions, ρ is negative.</p>
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
            <h2 className="text-2xl font-bold mb-3">What Is Spearman's Rank Correlation?</h2>
            <p>Spearman's rank correlation coefficient (ρ or rho) measures how well the relationship between two variables can be described by a monotonic function — one that consistently increases or decreases. It is computed by ranking each variable separately and then correlating the ranks, which makes it immune to outliers and non-linear but monotonic patterns that would defeat Pearson's linear correlation.</p>
            <h2 className="text-2xl font-bold mb-3">How the Calculation Works</h2>
            <p>Each variable is ranked from smallest (1) to largest, with ties receiving the average rank. Pearson's correlation formula is then applied to the two rank columns. When there are no ties, this simplifies to the familiar shortcut <strong>ρ = 1 − 6Σd² / (n(n² − 1))</strong>, where d is the difference between each pair's two ranks. The tie-aware rank-based computation used here is the general and exact version.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting ρ and Its Significance</h2>
            <p>ρ ranges from −1 to +1. A value near +1 means the ranks move together; near −1 they move in opposite directions; near 0 there is no monotonic relationship. The significance test converts ρ into a t-statistic with n − 2 degrees of freedom and reports a two-tailed p-value, telling you whether the observed association could plausibly be a random pattern for your sample size.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/spearman-rank-correlation-calculator" />
          <PopularCalculators exclude="/calculator/spearman-rank-correlation-calculator" />
        </div>
      </div>
    </>
  );
}
