"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const AbsoluteValueCalculator = () => {
  const DEFAULTS = { number: "-47.5" };
  const [number, setNumber] = useState(DEFAULTS.number);
  const [result, setResult] = useState<{abs: number; original: number; isNeg: boolean} | null>(null);

  const calculate = (n = number) => {
    const v = parseFloat(n);
    if (isNaN(v)) return;
    setResult({ abs: Math.abs(v), original: v, isNeg: v < 0 });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => { setNumber(DEFAULTS.number); calculate(DEFAULTS.number); };

  const chartData = result ? [
    { name: "Original", value: result.original },
    { name: "Absolute Value", value: result.abs },
  ] : [];

  const faqs = [
    { question: "What is the absolute value of a number?", answer: "The absolute value of a number is its distance from zero on the number line, always non-negative. |5| = 5 and |-5| = 5." },
    { question: "Can the absolute value be negative?", answer: "No. Absolute value is always zero or positive, by definition." },
    { question: "What is |-47.5|?", answer: "|-47.5| = 47.5. The absolute value strips the negative sign." },
    { question: "How is absolute value used in real life?", answer: "Absolute value is used in error calculations, distance computations, signal processing, and financial risk analysis." },
    { question: "What is the absolute value of 0?", answer: "|0| = 0. Zero is its own absolute value." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Absolute Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absolute Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number</label>
              <input type="number" value={number} onChange={e => setNumber(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="-47.5" step="any" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Absolute Value</div>
                  <div className="text-4xl font-bold text-primary">|{result.original}| = {result.abs}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.isNeg ? "Negative number → positive result" : "Already non-negative"}</div>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      <tr className="border-b"><td className="py-2 text-muted-foreground">Original Number</td><td className="text-right font-medium">{result.original}</td></tr>
                      <tr className="border-b"><td className="py-2 text-muted-foreground">Absolute Value</td><td className="text-right font-medium">{result.abs}</td></tr>
                      <tr className="border-b"><td className="py-2 text-muted-foreground">Sign</td><td className="text-right font-medium">{result.original < 0 ? "Negative" : result.original > 0 ? "Positive" : "Zero"}</td></tr>
                      <tr><td className="py-2 text-muted-foreground">Distance from zero</td><td className="text-right font-bold">{result.abs} units</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Visual Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#666" />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base"><span className="text-muted-foreground">Input:</span><span className="font-medium">{result.original}</span></div>
                    <div className="flex justify-between text-base"><span className="text-muted-foreground">|Input|:</span><span className="font-medium">{result.abs}</span></div>
                    <div className="flex justify-between text-base border-t pt-3"><span className="text-muted-foreground font-semibold">Negation (-x):</span><span className="font-bold">{-result.original}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Absolute Value Calculator?</h2>
            <p>An absolute value calculator computes |x| — the distance of a real number from zero on the number line — for any positive, negative, or fractional input. The result is always non-negative. Absolute value appears throughout mathematics, physics, engineering, and finance as a fundamental operation that measures magnitude without regard to sign.</p>
            <p>Whether you are working through algebra homework, computing error bounds in statistics, or analyzing signal amplitudes in electronics, this calculator delivers the result instantly. Simply type any real number and click Calculate.</p>
            <h2>How Absolute Value Is Calculated</h2>
            <p>The mathematical definition is straightforward:</p>
            <ul>
              <li>If x ≥ 0, then |x| = x</li>
              <li>If x &lt; 0, then |x| = −x (negate the sign)</li>
            </ul>
            <p>For example: |-47.5| = 47.5 because −(−47.5) = 47.5. And |22| = 22 because 22 is already non-negative.</p>
            <h2>Understanding Your Results</h2>
            <p>The primary result card shows the absolute value alongside the original number. The bar chart compares the original number and its absolute value, which is especially useful for negative inputs — you can visually see how the sign is stripped. The summary panel also shows the negation (−x) for reference.</p>
            <h2>Key Properties of Absolute Value</h2>
            <p><strong>Non-negativity:</strong> |x| ≥ 0 for all real numbers x. <strong>Identity:</strong> |x| = 0 if and only if x = 0. <strong>Symmetry:</strong> |x| = |−x|. <strong>Triangle inequality:</strong> |x + y| ≤ |x| + |y| — a critical inequality in analysis. <strong>Multiplicativity:</strong> |xy| = |x| × |y|.</p>
            <h2>Practical Applications</h2>
            <p>Absolute value is used across dozens of real-world fields. In statistics, the mean absolute error (MAE) uses absolute values to measure forecast accuracy without positive and negative errors cancelling out. In signal processing, amplitudes of AC voltages are expressed using absolute values. In finance, value-at-risk (VaR) and drawdown calculations rely on absolute magnitudes. In geometry, the distance between two points on a line is |x₂ − x₁|.</p>
            <h2>Absolute Value in Equations and Inequalities</h2>
            <p>When solving |x| = a (where a ≥ 0), there are two solutions: x = a and x = −a. For |x| &lt; a, the solution set is −a &lt; x &lt; a. For |x| &gt; a, the solution is x &lt; −a or x &gt; a. This calculator focuses on evaluation, not equation solving, but understanding these properties helps interpret results.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Enter any real number including decimals and negatives. The calculator handles large numbers and fractions equally well. Use this alongside the <a href="/calculator/percentage-calculator">percentage calculator</a> or <a href="/calculator/fraction-calculator">fraction calculator</a> for combined operations.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/absolute-value-calculator" />
          <PopularCalculators exclude="/calculator/absolute-value-calculator" />
        </div>
      </div>
    </>
  );
};
export default AbsoluteValueCalculator;