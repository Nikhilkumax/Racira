"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ---- Incomplete gamma / normal CDF helpers ----
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
function gammp(a: number, x: number): number {
  if (x < a + 1) return gser(a, x);
  return 1 - gcf(a, x);
}
function normalCdf(z: number): number {
  return 0.5 * (1 + (z >= 0 ? gammp(0.5, (z * z) / 2) : -gammp(0.5, (z * z) / 2)));
}

interface MwResult {
  n1: number;
  n2: number;
  u1: number;
  u2: number;
  u: number;
  rankSum1: number;
  rankSum2: number;
  mu: number;
  sigma: number;
  z: number;
  pValue: number;
  significant: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMw(g1: number[], g2: number[]): MwResult {
  const n1 = g1.length, n2 = g2.length;
  const pooled = [
    ...g1.map((v) => ({ v, g: 0 })),
    ...g2.map((v) => ({ v, g: 1 })),
  ].sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(pooled.length);
  let i = 0;
  while (i < pooled.length) {
    let j = i;
    while (j + 1 < pooled.length && pooled[j + 1].v === pooled[i].v) j++;
    const avg = (i + j) / 2 + 1;
    for (let t = i; t <= j; t++) ranks[t] = avg;
    i = j + 1;
  }
  let rankSum1 = 0, rankSum2 = 0;
  for (let t = 0; t < pooled.length; t++) {
    if (pooled[t].g === 0) rankSum1 += ranks[t];
    else rankSum2 += ranks[t];
  }
  const u1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - rankSum1;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);
  const mu = (n1 * n2) / 2;
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
  const n = n1 + n2;
  const sigma = Math.sqrt((n1 * n2 / 12) * ((n + 1) - tieSum / (n * (n - 1))));
  const z = sigma > 0 ? (u - mu) / sigma : 0;
  const pValue = Math.min(1, 2 * (1 - normalCdf(Math.abs(z))));
  const significant = pValue < 0.05;
  const breakdown = [
    { label: "Group 1 (n₁)", value: `${n1} values` },
    { label: "Group 2 (n₂)", value: `${n2} values` },
    { label: "Rank Sum Group 1", value: `${fmt(rankSum1, 2)}` },
    { label: "Rank Sum Group 2", value: `${fmt(rankSum2, 2)}` },
    { label: "U₁", value: `${fmt(u1, 2)}` },
    { label: "U₂", value: `${fmt(u2, 2)}` },
    { label: "U = min(U₁, U₂)", value: `${fmt(u, 2)}` },
    { label: "Mean of U (μ)", value: `${fmt(mu, 2)}` },
    { label: "Std Deviation (σ)", value: `${fmt(sigma, 4)}` },
    { label: "z-Score", value: `${fmt(z)}` },
    { label: "P-Value (two-tailed)", value: `${fmt(pValue)}` },
    { label: "Conclusion", value: significant ? "Reject H₀ — distributions differ" : "Fail to reject H₀ — no evidence distributions differ" },
  ];
  const summaryStats = [
    { label: "U Statistic", value: `${fmt(u, 2)}` },
    { label: "U₁ / U₂", value: `${fmt(u1, 2)} / ${fmt(u2, 2)}` },
    { label: "z-Score", value: `${fmt(z)}` },
    { label: "P-Value", value: `${fmt(pValue)}` },
    { label: "Conclusion", value: significant ? "Significant" : "Not significant" },
    { label: "n₁ / n₂", value: `${n1} / ${n2}` },
    { label: "Mean of U", value: `${fmt(mu, 2)}` },
    { label: "Std Dev", value: `${fmt(sigma, 4)}` },
  ];
  const chartData = [
    { name: "U₁ (group 1)", value: Number(u1.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "U₂ (group 2)", value: Number(u2.toFixed(2)), fill: "#f59e0b" },
  ];
  return { n1, n2, u1, u2, u, rankSum1, rankSum2, mu, sigma, z, pValue, significant, breakdown, summaryStats, chartData };
}

const DEFAULTS = { g1: "15, 20, 22, 24, 27", g2: "10, 12, 14, 16, 18" };

export default function MannWhitneyUTestCalculator() {
  const [g1, setG1] = useState(DEFAULTS.g1);
  const [g2, setG2] = useState(DEFAULTS.g2);
  const [result, setResult] = useState<MwResult | null>(null);

  const parse = (t: string) => t.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const a = parse(g1);
  const b = parse(g2);
  const errs: string[] = [];
  if (a.length < 3 || b.length < 3) errs.push("Each group needs at least three values.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMw(a, b)); };
  const reset = () => {
    setG1(DEFAULTS.g1); setG2(DEFAULTS.g2);
    setResult(calcMw([15, 20, 22, 24, 27], [10, 12, 14, 16, 18]));
  };
  useEffect(() => { setResult(calcMw([15, 20, 22, 24, 27], [10, 12, 14, 16, 18])); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[64px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the Mann-Whitney U test?", answer: "It compares two independent samples to test whether one tends to produce larger values than the other — the non-parametric counterpart to the two-sample t-test. It works on ranks, so it needs no normality assumption." },
    { question: "How is U computed?", answer: "Pool both groups and rank every value, averaging ranks for ties. U₁ counts how many group-1 values rank before each group-2 value (equivalently from the rank sums), and U is the smaller of U₁ and U₂." },
    { question: "How is the p-value found?", answer: "For moderate samples the normal approximation applies: z = (U − n₁n₂/2)/σ with a tie-corrected standard deviation. The two-tailed p-value follows from the normal distribution. Exact tables are preferable for very small samples." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Mann-Whitney U Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mann-Whitney U Test Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>Group 1 Values</label>
                <textarea value={g1} onChange={e => setG1(e.target.value)} className={ta} placeholder="15, 20, 22, 24, 27 ..." />
              </div>
              <div>
                <label className={lbl}>Group 2 Values</label>
                <textarea value={g2} onChange={e => setG2(e.target.value)} className={ta} placeholder="10, 12, 14, 16, 18 ..." />
              </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">U Statistic</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.u, 2)}</div>
                <div className="text-sm text-muted-foreground mt-1">p = {fmt(result.pValue)} · {result.significant ? "significant" : "not significant"} at α = 0.05 · z = {fmt(result.z)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`U₁`, fmt(result.u1, 2)], ["U₂", fmt(result.u2, 2)], ["P-Value", fmt(result.pValue)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Test Output</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">U₁ vs U₂</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v, 2), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The smaller U drives the test — large gaps signal a real difference</p>
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
            <h2 className="text-2xl font-bold mb-3">Ranks Instead of Means</h2>
            <p>This <strong>Mann-Whitney U test calculator</strong> pools two independent samples, ranks every observation (averaging ties), and sums the ranks per group. U derives directly from those rank sums — no normality assumption needed, and outliers can't dominate.</p>
            <h2 className="text-2xl font-bold mb-3">The Normal Approximation</h2>
            <p>U is centered at n₁n₂/2 with a tie-corrected standard deviation, so z = (U − μ)/σ follows the standard normal for moderate samples. The two-tailed p-value comes from the normal CDF — computed here exactly via the incomplete gamma function.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Result</h2>
            <p>A small p-value means the groups' value distributions differ — one tends to rank higher. The test says nothing about the size of the difference, only that it is unlikely to be chance. Report the U statistic and p-value together.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mann-whitney-u-test-calculator" />
          <PopularCalculators exclude="/calculator/mann-whitney-u-test-calculator" />
        </div>
      </div>
    </>
  );
}
