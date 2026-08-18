"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WeightedInput {
  values: number[];
  weights: number[];
}

interface WeightedResult {
  weightedAvg: number;
  sumWeights: number;
  sumWeighted: number;
  simpleAvg: number;
  chartData: { name: string; contribution: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWeighted(input: WeightedInput): WeightedResult {
  const { values, weights } = input;
  const sumWeights = weights.reduce((a, b) => a + b, 0);
  const sumWeighted = values.reduce((acc, v, i) => acc + v * weights[i], 0);
  const weightedAvg = sumWeights > 0 ? sumWeighted / sumWeights : 0;
  const simpleAvg = values.reduce((a, b) => a + b, 0) / values.length;

  const colors = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6"];
  const chartData = values.map((v, i) => ({
    name: `Item ${i + 1}`,
    contribution: sumWeights > 0 ? (v * weights[i]) / sumWeights : 0,
    fill: colors[i % colors.length],
  }));

  const breakdown = [
    ...values.map((v, i) => ({
      label: `Item ${i + 1} — Value ${v} × Weight ${weights[i]}`,
      value: (v * weights[i]).toFixed(2),
    })),
    { label: "Sum of Weights", value: sumWeights.toFixed(2) },
    { label: "Sum of (Value × Weight)", value: sumWeighted.toFixed(2) },
    { label: "Weighted Average", value: weightedAvg.toFixed(2) },
    { label: "Simple (Unweighted) Average", value: simpleAvg.toFixed(2) },
  ];

  const summaryStats = [
    { label: "Weighted Average", value: weightedAvg.toFixed(2) },
    { label: "Sum of Weights", value: sumWeights.toFixed(2) },
    { label: "Σ (Value × Weight)", value: sumWeighted.toFixed(2) },
    { label: "Simple Average", value: simpleAvg.toFixed(2) },
    { label: "Number of Items", value: `${values.length}` },
    { label: "Formula", value: "Σ(wᵢ·xᵢ) ÷ Σwᵢ" },
  ];

  return { weightedAvg, sumWeights, sumWeighted, simpleAvg, chartData, breakdown, summaryStats };
}

const DEFAULT_VALUES = [85, 90, 78, 92];
const DEFAULT_WEIGHTS = [30, 40, 20, 10];

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WeightedAverageCalculator() {
  const [values, setValues] = useState(DEFAULT_VALUES.map(String));
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS.map(String));
  const [result, setResult] = useState<WeightedResult | null>(null);

  const parseArr = (arr: string[], fallback: number[]) =>
    arr.map((s, i) => {
      const n = parseFloat(s);
      return Number.isFinite(n) && n >= 0 ? n : fallback[i];
    });

  const calculate = () =>
    setResult(
      calcWeighted({
        values: parseArr(values, DEFAULT_VALUES),
        weights: parseArr(weights, DEFAULT_WEIGHTS),
      })
    );
  const reset = () => {
    setValues(DEFAULT_VALUES.map(String));
    setWeights(DEFAULT_WEIGHTS.map(String));
    setResult(calcWeighted({ values: DEFAULT_VALUES, weights: DEFAULT_WEIGHTS }));
  };
  useEffect(() => {
    setResult(calcWeighted({ values: DEFAULT_VALUES, weights: DEFAULT_WEIGHTS }));
  }, []);

  const faqs = [
    { question: "What is a weighted average?", answer: "A weighted average multiplies each value by its weight before summing, then divides by the total weight. Unlike a simple average, it lets some items count more than others — the standard method for grades, portfolio returns, and survey scores where categories have different importance." },
    { question: "When should I use a weighted average instead of a simple average?", answer: "Use a weighted average whenever your data points contribute unequally — for example, a final grade where exams are worth more than homework, a stock portfolio where holdings differ in size, or customer satisfaction where segments have different sizes. A simple average treats every item as equally important, which is wrong in these cases." },
    { question: "What if my weights don't add up to 100?", answer: "No problem. The formula divides by the actual sum of weights, so weights of 3, 4, and 3 work exactly like 30%, 40%, and 30%. The only requirement is that weights are non-negative and at least one is greater than zero." },
    { question: "How is this different from the simple average?", answer: "The simple average is Σxᵢ ÷ n — every value counts equally. The weighted average is Σ(wᵢ·xᵢ) ÷ Σwᵢ. When all weights are equal, the two formulas produce the same result; the weighted version generalizes the simple average." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Weighted Average Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Weighted Average Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Value {i + 1}</label>
                  <div className={inp}><input type="number" value={values[i]} onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))} className={ci} /></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Weight {i + 1}</label>
                  <div className={inp}><input type="number" value={weights[i]} onChange={(e) => setWeights((w) => w.map((x, j) => (j === i ? e.target.value : x)))} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Weighted Average</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.weightedAvg.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">vs simple average: {result.simpleAvg.toFixed(2)} · sum of weights: {result.sumWeights.toFixed(0)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Weighted Avg", result.weightedAvg.toFixed(2)], ["Σ (Value × Weight)", result.sumWeighted.toFixed(1)], ["Sum of Weights", result.sumWeights.toFixed(1)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Weighted Contribution Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === values.length + 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Per-Item Contribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "Contribution"]} />
                      <Bar dataKey="contribution" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Each bar is that item's weighted share (value × weight ÷ Σ weights). The bars add up to exactly the weighted average.</p>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Weighted Average?</h2>
            <p>A weighted average assigns each value a weight that reflects its relative importance, then computes Σ(wᵢ·xᵢ) ÷ Σwᵢ. It appears everywhere: final grades (exams worth more than quizzes), stock portfolios (large holdings move returns more), and economics (price indices weight goods by how much people buy).</p>
            <h2 className="text-2xl font-bold mb-3">How to Calculate a Weighted Average</h2>
            <p><strong>Weighted Average = Σ(wᵢ × xᵢ) ÷ Σwᵢ</strong> — multiply each value by its weight, add the products, then divide by the total weight. If weights are percentages summing to 100, the division is simply by 100. The weights do not need to sum to 100; they just need to be positive.</p>
            <h2 className="text-2xl font-bold mb-3">Weighted vs Simple Average</h2>
            <p>The simple average treats every observation equally. The weighted average is the same formula with all weights set equal. When your data is naturally unequal — larger accounts, heavier assignments, bigger market segments — the weighted average is the honest summary, because a 10% gain in a position that is half your portfolio matters far more than the same gain in a tiny holding.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weighted-average-calculator" />
          <PopularCalculators exclude="/calculator/weighted-average-calculator" />
        </div>
      </div>
    </>
  );
}
