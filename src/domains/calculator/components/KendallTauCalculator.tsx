"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

interface TauResult {
  x: number[];
  y: number[];
  n: number;
  pairs: number;
  concordant: number;
  discordant: number;
  tiedX: number;
  tiedY: number;
  tau: number;
  strength: string;
  direction: string;
  scatter: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcTau(x: number[], y: number[]): TauResult {
  const n = x.length;
  let concordant = 0;
  let discordant = 0;
  let tiedX = 0;
  let tiedY = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = Math.sign(x[j] - x[i]);
      const dy = Math.sign(y[j] - y[i]);
      if (dx === 0 && dy === 0) continue;
      if (dx === 0) tiedX++;
      else if (dy === 0) tiedY++;
      else if (dx === dy) concordant++;
      else discordant++;
    }
  }
  const pairs = (n * (n - 1)) / 2;
  const denom = Math.sqrt((concordant + discordant + tiedX) * (concordant + discordant + tiedY));
  const tau = denom > 0 ? (concordant - discordant) / denom : 0;
  const absTau = Math.abs(tau);
  const strength = absTau >= 0.8 ? "Very Strong" : absTau >= 0.6 ? "Strong" : absTau >= 0.4 ? "Moderate" : absTau >= 0.2 ? "Weak" : "Very Weak";
  const direction = tau > 0 ? "Positive" : tau < 0 ? "Negative" : "No Monotonic";
  const scatter = x.map((xv, i) => ({ x: xv, y: y[i] }));
  const breakdown = [
    { label: "Sample Size (n)", value: `${n}` },
    { label: "Total Pair Comparisons", value: `${pairs}` },
    { label: "Concordant Pairs (P)", value: `${concordant}` },
    { label: "Discordant Pairs (Q)", value: `${discordant}` },
    { label: "Pairs Tied on X Only", value: `${tiedX}` },
    { label: "Pairs Tied on Y Only", value: `${tiedY}` },
    { label: "Kendall's Tau (b)", value: fmt(tau) },
    { label: "Interpretation", value: `${strength} ${direction}` },
  ];
  const summaryStats = [
    { label: "Kendall's Tau", value: fmt(tau) },
    { label: "Concordant Pairs", value: `${concordant}` },
    { label: "Discordant Pairs", value: `${discordant}` },
    { label: "Sample Size", value: `${n}` },
    { label: "Strength", value: strength },
    { label: "Direction", value: direction },
    { label: "Pairs Tied on X", value: `${tiedX}` },
    { label: "Pairs Tied on Y", value: `${tiedY}` },
  ];
  return { x, y, n, pairs, concordant, discordant, tiedX, tiedY, tau, strength, direction, scatter, breakdown, summaryStats };
}

const DEFAULTS = { x: "1, 2, 3, 4, 5, 6, 7, 8", y: "1, 3, 2, 5, 4, 7, 6, 8" };

export default function KendallTauCalculator() {
  const [xText, setXText] = useState(DEFAULTS.x);
  const [yText, setYText] = useState(DEFAULTS.y);
  const [result, setResult] = useState<TauResult | null>(null);

  const x = xText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const y = yText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const errs: string[] = [];
  if (x.length < 2 || y.length < 2) errs.push("Enter at least two values in each list.");
  if (x.length !== y.length) errs.push("Both lists must contain the same number of values.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcTau(x, y)); };
  const reset = () => {
    setXText(DEFAULTS.x); setYText(DEFAULTS.y);
    setResult(calcTau([1, 2, 3, 4, 5, 6, 7, 8], [1, 3, 2, 5, 4, 7, 6, 8]));
  };
  useEffect(() => { setResult(calcTau([1, 2, 3, 4, 5, 6, 7, 8], [1, 3, 2, 5, 4, 7, 6, 8])); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[72px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is Kendall's tau?", answer: "Kendall's tau is a rank correlation coefficient measuring the strength and direction of a monotonic relationship between two variables. It compares every pair of observations and counts how often they rank in the same order (concordant) versus opposite order (discordant)." },
    { question: "How is tau-b different from tau-a?", answer: "Tau-b includes a tie correction in its denominator, making it valid when the data contains tied ranks — the version computed here. Tau-a assumes no ties and is a special case of tau-b." },
    { question: "When should I use Kendall's tau instead of Pearson or Spearman?", answer: "Kendall's tau is more robust with small samples and heavy ties, and its interpretation as a probability — the chance a random pair agrees in ordering — is intuitive. For normally distributed data with no ties, Pearson's r is more powerful." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Kendall Tau Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Kendall Tau Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>X Values</label>
                <textarea value={xText} onChange={e => setXText(e.target.value)} className={ta} placeholder="1, 2, 3, 4, 5 ..." />
              </div>
              <div>
                <label className={lbl}>Y Values</label>
                <textarea value={yText} onChange={e => setYText(e.target.value)} className={ta} placeholder="2, 4, 5, 7, 8 ..." />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Kendall's Tau</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.tau)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.strength} {result.direction.toLowerCase()} correlation across {result.n} observations</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Concordant`, `${result.concordant}`], ["Discordant", `${result.discordant}`], ["Sample Size", `${result.n}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pair-Wise Comparison</h3>
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
                <h3 className="text-base font-bold mb-4">Scatter Plot</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" name="X" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="number" dataKey="y" name="Y" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <ZAxis range={[60, 60]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, n: string) => [fmt(v), n === "X" ? "X value" : "Y value"]} />
                    <Scatter data={result.scatter} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Each point pairs one X with its corresponding Y</p>
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
            <h2 className="text-2xl font-bold mb-3">The Kendall Tau Formula</h2>
            <p>This <strong>Kendall tau calculator</strong> compares every pair of observations (i, j). A pair is concordant when both values move in the same direction and discordant when they move oppositely. Tau-b, the version computed here, divides the difference of concordant minus discordant pairs by a tie-adjusted denominator.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Coefficient</h2>
            <p>Tau ranges from −1 (perfect inverse ordering) through 0 (no monotonic relationship) to +1 (perfect agreement). Its magnitude reflects how consistently the two variables rank together; unlike Pearson's r it detects any monotonic trend, not just linear ones.</p>
            <h2 className="text-2xl font-bold mb-3">Ties and Small Samples</h2>
            <p>The tau-b correction keeps the coefficient within [−1, 1] when ranks repeat. With small samples Kendall's tau is also less sensitive to outliers than Pearson's r, making it a dependable choice for survey data and ranked judgments.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/kendall-tau-calculator" />
          <PopularCalculators exclude="/calculator/kendall-tau-calculator" />
        </div>
      </div>
    </>
  );
}
