"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

// ---------- Math helpers: Student's t distribution ----------
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

// P(T <= t) for Student's t with df degrees of freedom
function tCdf(t: number, df: number): number {
  if (df <= 0) return 0.5;
  const x = df / (df + t * t);
  const ib = betai(df / 2, 0.5, x);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

// Critical value t* such that two-tailed P(|T| > t*) = alpha (via bisection)
function tCritical(df: number, alpha: number): number {
  const target = 1 - alpha / 2;
  let lo = 0;
  let hi = 100;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------- Calculator ----------
interface TTestInput {
  n1: number;
  mean1: number;
  sd1: number;
  n2: number;
  mean2: number;
  sd2: number;
  alpha: number;
}

interface TTestResult {
  tStat: number | null;
  df: number | null;
  pValue: number | null;
  meanDiff: number;
  se: number | null;
  ciLo: number | null;
  ciHi: number | null;
  significant: boolean | null;
  verdict: string;
  verdictColor: string;
  chartData: { name: string; mean: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTTest(input: TTestInput): TTestResult {
  const { n1, mean1, sd1, n2, mean2, sd2, alpha } = input;
  const v1 = (sd1 * sd1) / n1;
  const v2 = (sd2 * sd2) / n2;
  const meanDiff = mean1 - mean2;
  const se = Math.sqrt(v1 + v2);

  let tStat: number | null = null;
  let df: number | null = null;
  let pValue: number | null = null;
  let ciLo: number | null = null;
  let ciHi: number | null = null;

  const validN = n1 >= 2 && n2 >= 2;

  if (validN && se > 0) {
    tStat = meanDiff / se;
    // Welch–Satterthwaite degrees of freedom
    const wdf =
      (v1 + v2) ** 2 / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1));
    df = Number.isFinite(wdf) && wdf > 0 ? wdf : n1 + n2 - 2;
    pValue = 2 * (1 - tCdf(Math.abs(tStat), df));
    const tc = tCritical(df, alpha);
    ciLo = meanDiff - tc * se;
    ciHi = meanDiff + tc * se;
  }

  const significant = pValue !== null ? pValue < alpha : null;
  const verdict =
    significant === null
      ? "Insufficient data"
      : significant
      ? "Statistically Significant"
      : "Not Significant";
  const verdictColor =
    significant === null
      ? "text-muted-foreground"
      : significant
      ? "text-emerald-600"
      : "text-amber-500";

  const chartData = [
    { name: "Group 1 Mean", mean: mean1, fill: "hsl(var(--primary))" },
    { name: "Group 2 Mean", mean: mean2, fill: "#f59e0b" },
  ];

  const pct = pValue !== null ? (pValue * 100).toFixed(2) : "—";
  const ci =
    ciLo !== null && ciHi !== null
      ? `${ciLo.toFixed(2)} to ${ciHi.toFixed(2)}`
      : "—";

  const breakdown = [
    { label: "Group 1 — Sample Size", value: `${n1}` },
    { label: "Group 1 — Mean", value: mean1.toFixed(2) },
    { label: "Group 1 — Std. Deviation", value: sd1.toFixed(2) },
    { label: "Group 2 — Sample Size", value: `${n2}` },
    { label: "Group 2 — Mean", value: mean2.toFixed(2) },
    { label: "Group 2 — Std. Deviation", value: sd2.toFixed(2) },
    { label: "Mean Difference", value: meanDiff.toFixed(2) },
    { label: "Standard Error", value: se !== null && se > 0 ? se.toFixed(3) : "—" },
    { label: "t-statistic", value: tStat !== null ? tStat.toFixed(3) : "—" },
    { label: "Degrees of Freedom", value: df !== null ? df.toFixed(1) : "—" },
    { label: `p-value (α = ${alpha.toFixed(2)})`, value: pct },
    { label: "Verdict", value: verdict },
  ];

  const summaryStats = [
    { label: "t-statistic", value: tStat !== null ? tStat.toFixed(3) : "—" },
    { label: "Degrees of Freedom", value: df !== null ? df.toFixed(1) : "—" },
    { label: "p-value", value: pct },
    { label: "Mean Difference", value: meanDiff.toFixed(2) },
    { label: "95% Confidence Interval", value: ci },
    { label: "Verdict", value: verdict },
  ];

  return { tStat, df, pValue, meanDiff, se, ciLo, ciHi, significant, verdict, verdictColor, chartData, breakdown, summaryStats };
}

const DEFAULTS: TTestInput = { n1: 10, mean1: 85, sd1: 8, n2: 10, mean2: 75, sd2: 10, alpha: 0.05 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TTestCalculator() {
  const [n1, setN1] = useState(String(DEFAULTS.n1));
  const [mean1, setMean1] = useState(String(DEFAULTS.mean1));
  const [sd1, setSd1] = useState(String(DEFAULTS.sd1));
  const [n2, setN2] = useState(String(DEFAULTS.n2));
  const [mean2, setMean2] = useState(String(DEFAULTS.mean2));
  const [sd2, setSd2] = useState(String(DEFAULTS.sd2));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [alpha, setAlpha] = useState(String(DEFAULTS.alpha));
  const [result, setResult] = useState<TTestResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcTTest({
        n1: Math.round(parse(n1, DEFAULTS.n1, 2)),
        mean1: parse(mean1, DEFAULTS.mean1),
        sd1: parse(sd1, DEFAULTS.sd1),
        n2: Math.round(parse(n2, DEFAULTS.n2, 2)),
        mean2: parse(mean2, DEFAULTS.mean2),
        sd2: parse(sd2, DEFAULTS.sd2),
        alpha: Math.min(0.5, Math.max(0.001, parse(alpha, DEFAULTS.alpha, 0.001))),
      })
    );
  const reset = () => {
    setN1(String(DEFAULTS.n1));
    setMean1(String(DEFAULTS.mean1));
    setSd1(String(DEFAULTS.sd1));
    setN2(String(DEFAULTS.n2));
    setMean2(String(DEFAULTS.mean2));
    setSd2(String(DEFAULTS.sd2));
    setAlpha(String(DEFAULTS.alpha));
    setResult(calcTTest(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcTTest(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a t-test?", answer: "A t-test compares the means of two groups to determine whether the difference between them is statistically significant — i.e. unlikely to have occurred by random chance. It is the most widely used hypothesis test in science, medicine, and business analysis." },
    { question: "Which t-test does this calculator use?", answer: "This calculator performs an independent (unpaired) two-sample t-test using the Welch correction. Unlike the pooled t-test, Welch's method does not assume the two groups have equal variances, and it adjusts the degrees of freedom via the Satterthwaite approximation. It is the safer default for real-world data." },
    { question: "How do I read the p-value?", answer: "The p-value is the probability of observing a difference at least as large as yours if the two groups truly had the same mean. Conventionally, a p-value below 0.05 (5%) is called statistically significant. A significant result does not prove the difference is large or important — only that it is unlikely to be random." },
    { question: "What is the 95% confidence interval?", answer: "The interval around the mean difference shows the range of true differences consistent with your data. If it excludes zero, the difference is significant at the 5% level. Wider intervals reflect smaller samples or higher variance and mean less precision." },
    { question: "When should I use a paired t-test instead?", answer: "If your two sets of measurements come from the same subjects (before/after, left/right), the observations are paired and a paired t-test is more powerful. This calculator is for two independent groups — use it only when each subject belongs to exactly one group." },
    { question: "What sample size do I need?", answer: "Small samples (below 30 per group) require the t distribution rather than the normal, which this calculator handles automatically through the degrees of freedom. Very small samples (under 5) produce low power — a non-significant result then says little about whether a true difference exists." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "T Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">T Test Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Group 1 — Sample Size</label>
                <div className={inp}><input type="number" value={n1} onChange={(e) => setN1(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Group 1 — Mean</label>
                <div className={inp}><input type="number" value={mean1} onChange={(e) => setMean1(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Group 1 — Std. Deviation</label>
                <div className={inp}><input type="number" value={sd1} onChange={(e) => setSd1(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Group 2 — Sample Size</label>
                <div className={inp}><input type="number" value={n2} onChange={(e) => setN2(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Group 2 — Mean</label>
                <div className={inp}><input type="number" value={mean2} onChange={(e) => setMean2(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Group 2 — Std. Deviation</label>
                <div className={inp}><input type="number" value={sd2} onChange={(e) => setSd2(e.target.value)} className={ci} /></div>
              </div>
            </div>

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
                  <p className="text-xs text-muted-foreground mt-1">Standard: 0.05 (5%). Lower values demand stronger evidence.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">t-statistic</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.verdictColor}`}>{result.tStat !== null ? result.tStat.toFixed(3) : "—"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Verdict: {result.verdict} · p = {result.pValue !== null ? result.pValue.toFixed(4) : "—"}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["t-statistic", result.tStat !== null ? result.tStat.toFixed(3) : "—"], ["Degrees of Freedom", result.df !== null ? result.df.toFixed(1) : "—"], ["p-value", result.pValue !== null ? result.pValue.toFixed(4) : "—"]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 10 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Group Means</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "Mean"]} />
                      <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">What Is a T Test?</h2>
            <p>The t-test is the standard tool for comparing the means of two independent groups. It answers a precise question: given the observed difference and the variability within each group, how likely is it that this difference arose purely by chance? The answer is the p-value — the probability of seeing a difference this large if the two groups actually share the same mean.</p>
            <h2 className="text-2xl font-bold mb-3">How the Calculation Works</h2>
            <p>This calculator uses the Welch two-sample t-test. The t-statistic is the mean difference divided by its standard error:</p>
            <p><strong>t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)</strong></p>
            <p>The degrees of freedom are adjusted with the Welch–Satterthwaite equation rather than the simpler n₁+n₂−2, because the two samples are not assumed to share a common variance. The p-value is then computed exactly from the Student's t distribution using the regularized incomplete beta function — no normal approximation is used, even for small samples.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Result</h2>
            <p>If the p-value falls below your significance level (typically 0.05), the difference is declared statistically significant: it is unlikely to be explained by sampling noise. Remember that significance is not the same as importance — a significant result only tells you the difference is real, not that it is large. Report the mean difference and its 95% confidence interval alongside the p-value to convey both.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/t-test-calculator" />
          <PopularCalculators exclude="/calculator/t-test-calculator" />
        </div>
      </div>
    </>
  );
}
