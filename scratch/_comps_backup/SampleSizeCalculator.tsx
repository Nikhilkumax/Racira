"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SampleSizeInput {
  population: number; // 0 = infinite
  confidenceLevel: number;
  marginOfError: number; // percent
  proportion: number; // percent
}

interface SampleSizeResult {
  sampleSize: number;
  zScore: number;
  n0: number;
  chartData: { name: string; n: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function zForConfidence(cl: number): number {
  if (cl === 80) return 1.282;
  if (cl === 85) return 1.44;
  if (cl === 90) return 1.645;
  if (cl === 95) return 1.96;
  if (cl === 98) return 2.326;
  if (cl === 99) return 2.576;
  return 1.96;
}

function cochranN(z: number, p: number, e: number): number {
  return (z * z * p * (1 - p)) / (e * e);
}

function calcSampleSize(input: SampleSizeInput): SampleSizeResult {
  const z = zForConfidence(input.confidenceLevel);
  const e = input.marginOfError / 100;
  const p = input.proportion / 100;
  const n0 = cochranN(z, p, e);
  const sampleSize =
    input.population > 0
      ? Math.ceil((n0 * input.population) / (n0 + (input.population - 1)))
      : Math.ceil(n0);

  // Educational chart: sample size required at increasingly tight margins
  const chartData = [5, 3, 2, 1].map((m, i) => ({
    name: `±${m}%`,
    n: Math.ceil(cochranN(z, p, m / 100)),
    fill: m === input.marginOfError ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Population Size", value: input.population > 0 ? input.population.toLocaleString() : "Infinite" },
    { label: "Confidence Level", value: `${input.confidenceLevel}%` },
    { label: "Z-score", value: z.toFixed(3) },
    { label: "Margin of Error", value: `±${input.marginOfError}%` },
    { label: "Population Proportion (p)", value: `${input.proportion}%` },
    { label: "Uncorrected Sample (n₀)", value: n0.toFixed(1) },
    { label: "Final Correction Applied", value: input.population > 0 ? "Finite population correction" : "None (infinite)" },
    { label: "Required Sample Size", value: sampleSize.toLocaleString() },
  ];

  const summaryStats = [
    { label: "Required Sample Size", value: sampleSize.toLocaleString() },
    { label: "Confidence Level", value: `${input.confidenceLevel}%` },
    { label: "Margin of Error", value: `±${input.marginOfError}%` },
    { label: "Z-score Used", value: z.toFixed(3) },
    { label: "Population", value: input.population > 0 ? input.population.toLocaleString() : "Infinite" },
    { label: "Rule of Thumb", value: input.population === 0 || input.population > 100000 ? "Population size is irrelevant" : "Finite correction applied" },
  ];

  return { sampleSize, zScore: z, n0, chartData, breakdown, summaryStats };
}

const DEFAULTS: SampleSizeInput = { population: 0, confidenceLevel: 95, marginOfError: 5, proportion: 50 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SampleSizeCalculator() {
  const [population, setPopulation] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("95");
  const [marginOfError, setMarginOfError] = useState("5");
  const [proportion, setProportion] = useState("50");
  const [result, setResult] = useState<SampleSizeResult | null>(null);

  const calculate = () => {
    const popVal = population.trim() === "" ? 0 : Math.max(0, Math.round(parseFloat(population) || 0));
    const cl = [80, 85, 90, 95, 98, 99].includes(parseInt(confidenceLevel, 10)) ? parseInt(confidenceLevel, 10) : 95;
    const moe = Math.min(50, Math.max(0.1, parseFloat(marginOfError) || 5));
    const prop = Math.min(99, Math.max(1, parseFloat(proportion) || 50));
    setResult(calcSampleSize({ population: popVal, confidenceLevel: cl, marginOfError: moe, proportion: prop }));
  };

  useEffect(() => {
    setResult(calcSampleSize(DEFAULTS));
  }, []);

  const reset = () => {
    setPopulation("");
    setConfidenceLevel("95");
    setMarginOfError("5");
    setProportion("50");
    setResult(calcSampleSize(DEFAULTS));
  };

  const faqs = [
    { question: "What is a Sample Size?", answer: "Sample size is the number of individuals you need to survey or test from a larger population to achieve statistically significant results. You rarely need to survey everyone in a population to get an accurate read on their opinions or traits." },
    { question: "What is Confidence Level?", answer: "Confidence level tells you how sure you can be that your results are accurate. A 95% confidence level means that if you repeated your survey 100 times, 95 of those times the results would match the true population. 95% is the industry standard." },
    { question: "What is Margin of Error (Confidence Interval)?", answer: "Margin of error is the plus-or-minus figure you often see in polls (e.g. '± 3%'). If your survey finds that 60% of people like a product, and your margin of error is 5%, you can be confident the true population figure is between 55% and 65%." },
    { question: "What is Population Proportion?", answer: "This is the estimated percentage of the population that exhibits the trait you are testing for. If you don't know, leave it at 50%. A proportion of 50% represents the maximum variance and yields the safest (largest) recommended sample size." },
    { question: "Do I need to know the exact Population Size?", answer: "No. If your population is very large (e.g. all adults in the US), the mathematics of sampling stabilize. Surveying a population of 1 million or 300 million requires almost the exact same sample size. If you don't know your population, leave the field blank (infinite)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Sample Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sample Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Population Size</label>
                <div className={inp}><input type="number" value={population} onChange={(e) => setPopulation(e.target.value)} className={ci} placeholder="Infinite" /></div>
                <p className="text-xs text-muted-foreground mt-1">Leave blank if unknown.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Confidence Level</label>
                <div className={inp}>
                  <select value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} className={ci}>
                    <option value="80">80%</option>
                    <option value="85">85%</option>
                    <option value="90">90%</option>
                    <option value="95">95%</option>
                    <option value="98">98%</option>
                    <option value="99">99%</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Margin of Error (%)</label>
                <div className={inp}><input type="number" value={marginOfError} onChange={(e) => setMarginOfError(e.target.value)} className={ci} min={0.1} max={50} step={0.1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Population Proportion (%)</label>
                <div className={inp}><input type="number" value={proportion} onChange={(e) => setProportion(e.target.value)} className={ci} min={1} max={99} step={1} /></div>
                <p className="text-xs text-muted-foreground mt-1">Use 50% if unknown.</p>
              </div>
            </div>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Required Sample Size</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.sampleSize.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">Respondents / tests needed at ±{marginOfError}% margin of error</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Sample Size", result.sampleSize.toLocaleString()], ["Confidence", `${confidenceLevel}%`], ["Margin of Error", `±${marginOfError}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sample Size vs Margin of Error</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(), "Sample size"]} labelFormatter={(l) => `Margin of error ${l}`} />
                      <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Tightening the margin of error from ±5% to ±1% forces the required sample up ~25×. This is why national polls rarely exceed 1,000 respondents.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Science of Statistical Sampling</h2>
            <p>If a polling agency wants to know who will win a presidential election, they do not ask all 160 million registered voters. That would cost billions of dollars and take months. Instead, they ask a few thousand people. How can asking 2,000 people accurately predict the behavior of 160 million people? The answer is <strong>Statistical Sampling</strong>.</p>
            <p>Sampling mathematics proves that if you select a group of people truly at random, the traits of that small group will mirror the traits of the massive population with astonishing accuracy. This calculator uses Cochran's formula to determine exactly how many people you need to test to guarantee that accuracy.</p>

            <h2 className="text-2xl font-bold mb-3">Key Metrics Explained</h2>

            <h3>1. Margin of Error</h3>
            <p>No sample is perfectly accurate. The margin of error dictates how much "wiggle room" you are allowing your results to have. If your survey shows 55% of people prefer Brand A over Brand B, and your margin of error is 5%, you can confidently state that the true population preference is somewhere between 50% and 60%.</p>

            <h3>2. Confidence Level</h3>
            <p>Confidence level measures the certainty of your margin of error. A 95% confidence level indicates that if you ran your exact survey 100 different times with 100 different randomly selected groups, 95 of those surveys would yield results within your margin of error. 95% is the standard for business and political polling. 99% is often used for medical and scientific research.</p>

            <h3>3. Population Proportion</h3>
            <p>This is the expected variance in the answers. If you know that 80% of your population is male, the variance is low. If you have no idea what the split will be, you use 50%. A 50% proportion represents maximum variance, which mathematically requires the largest possible sample size. When in doubt, always leave this at 50% to ensure your sample size is large enough to be safe.</p>

            <h2 className="text-2xl font-bold mb-3">The Infinite Population Paradox</h2>
            <p>One of the most counter-intuitive rules of statistics is that once a population is "large enough" (usually over 100,000), the population size no longer matters. To achieve a 5% margin of error at a 95% confidence level, you need to survey exactly 385 people — whether your total population is 100,000 people, 1 million people, or the entire planet Earth. The math stabilizes, which is why national polls rarely survey more than 1,000 respondents.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sample-size-calculator" />
          <PopularCalculators exclude="/calculator/sample-size-calculator" />
        </div>
      </div>
    </>
  );
}
