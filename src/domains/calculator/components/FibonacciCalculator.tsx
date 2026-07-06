"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FibonacciCalculator = () => {
  const DEFAULTS = { count: "15" };
  const [count, setCount] = useState(DEFAULTS.count);
  const [result, setResult] = useState<any>(null);

  const calculate = (cVal = count) => {
    const n = Math.min(Math.max(parseInt(cVal) || 1, 2), 40);
    const seq: number[] = [0, 1];
    for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
    const last = seq[seq.length - 1];
    const ratio = seq.length > 1 ? (seq[seq.length - 1] / seq[seq.length - 2]).toFixed(6) : "N/A";
    const chartData = seq.map((v, i) => ({ name: `F${i}`, value: v }));
    const rows = seq.slice(0, Math.min(n, 20)).map((v, i) => ({
      label: `F(${i})`,
      value: v.toLocaleString(),
    }));
    setResult({
      primary: last.toLocaleString(),
      subtitle: `F(${n - 1}) — the ${n}th Fibonacci number`,
      rows,
      chartData,
      summary: [
        { label: "Terms generated", value: n },
        { label: `F(${n - 1}) (last term)`, value: last.toLocaleString() },
        { label: "Golden ratio approx.", value: ratio },
        { label: "Sum of all terms", value: seq.reduce((a, b) => a + b, 0).toLocaleString(), border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setCount(DEFAULTS.count); calculate(DEFAULTS.count); };

  const faqs = [
    { question: "What is the Fibonacci sequence?", answer: "The Fibonacci sequence starts with 0 and 1, then each subsequent number is the sum of the two preceding numbers: 0, 1, 1, 2, 3, 5, 8, 13, 21…" },
    { question: "What is the golden ratio?", answer: "As the Fibonacci sequence progresses, the ratio of consecutive terms converges to φ (phi) ≈ 1.6180339887, known as the golden ratio." },
    { question: "Where does the Fibonacci sequence appear in nature?", answer: "Fibonacci numbers appear in the spiral patterns of sunflowers, pinecones, nautilus shells, and galaxy formations. Many plants grow leaves, petals, and branches in Fibonacci numbers." },
    { question: "What is the formula for Fibonacci numbers?", answer: "Binet's formula: F(n) = (φⁿ − ψⁿ) / √5, where φ = (1+√5)/2 ≈ 1.618 and ψ = (1−√5)/2 ≈ −0.618. For large n, F(n) ≈ φⁿ/√5." },
    { question: "What is F(0) and F(1)?", answer: "By the standard definition used in mathematics, F(0) = 0 and F(1) = 1. Some sources start with F(1) = 1 and F(2) = 1." },
    { question: "How many Fibonacci terms can I calculate?", answer: "This calculator supports up to 40 terms. F(40) = 102,334,155. Larger values require big-integer arithmetic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Fibonacci Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fibonacci Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number of Terms (2–40)</label>
              <input type="number" value={count} onChange={e => setCount(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="15" min="2" max="40" step="1" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Last Fibonacci Number</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Fibonacci Sequence</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Fibonacci Growth</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Fibonacci Sequence?</h2>
            <p>The Fibonacci sequence is one of mathematics' most famous number patterns, appearing throughout nature, art, architecture, and finance. Each number in the sequence is the sum of the two numbers before it, starting with 0 and 1: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144… This seemingly simple rule produces a sequence with profound mathematical properties and surprising real-world occurrences.</p>
            <p>Named after the Italian mathematician Leonardo Bonacci (circa 1170–1250), who introduced the sequence to Western mathematics in his book Liber Abaci, Fibonacci numbers have been studied for centuries and remain a rich area of mathematical research and application.</p>

            <h2 className="text-2xl font-bold mb-3">How Fibonacci Numbers Are Calculated</h2>
            <p>The iterative definition: F(0) = 0, F(1) = 1, and for n ≥ 2: F(n) = F(n−1) + F(n−2). This gives us the sequence directly by addition. For a closed-form formula, Binet's equation computes any Fibonacci number directly without iteration:</p>
            <p><strong>F(n) = (φⁿ − ψⁿ) / √5</strong></p>
            <p>where φ = (1 + √5) / 2 ≈ 1.6180339887 (the golden ratio) and ψ = (1 − √5) / 2 ≈ −0.6180339887. For large n, ψⁿ approaches zero, so F(n) ≈ φⁿ / √5, rounded to the nearest integer.</p>

            <h2 className="text-2xl font-bold mb-3">The Golden Ratio Connection</h2>
            <p>As you progress through the Fibonacci sequence, the ratio of consecutive terms converges to the golden ratio φ ≈ 1.618033: 1/1 = 1.000, 2/1 = 2.000, 3/2 = 1.500, 5/3 = 1.667, 8/5 = 1.600, 13/8 = 1.625, 21/13 = 1.615, 34/21 = 1.619, 55/34 = 1.618… The convergence is exponentially fast. By F(15)/F(14) = 610/377, the ratio is accurate to 5 decimal places.</p>
            <p>The golden ratio has been called the "most irrational number" because it is the hardest to approximate with fractions. This property makes it optimal for plant growth patterns — maximizing sunlight exposure by spacing leaves at φ-related angles around a stem.</p>

            <h2 className="text-2xl font-bold mb-3">Fibonacci in Nature and Art</h2>
            <p>Fibonacci numbers appear throughout the natural world. Sunflower seeds arrange in two interlocking spiral families — clockwise and counterclockwise — with counts that are always consecutive Fibonacci numbers (typically 34 and 55, or 55 and 89). Pinecone scales, pineapple sections, and artichoke bracts follow the same pattern. Romanesco broccoli forms a fractal spiral that is a textbook example of Fibonacci growth.</p>
            <p>In art and architecture, the golden ratio and Fibonacci proportions have been used by artists from ancient Greece through the Renaissance and into modern design. Whether or not these applications are mathematically rigorous, the aesthetic appeal of Fibonacci proportions is widely recognized.</p>

            <h2 className="text-2xl font-bold mb-3">Fibonacci in Finance and Trading</h2>
            <p>Technical analysts use Fibonacci retracement levels to predict potential support and resistance zones in financial markets. The key retracement levels are 23.6%, 38.2%, 50%, 61.8%, and 78.6% — derived from ratios of Fibonacci numbers. For example, 38.2% ≈ 1 − 0.618 and 61.8% ≈ 1/1.618. Traders draw these levels between price highs and lows to identify where a trend might pause or reverse. Use this alongside the <a href="/calculator/percentage-calculator">percentage calculator</a> for retracement computation.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>With 15 terms (n=0 to 14): the sequence is 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377. The sum of these 15 terms is 992, and F(14)/F(13) = 377/233 ≈ 1.61802. With 20 terms, F(19) = 4,181 and the ratio reaches 6 decimal accuracy. These are commonly used in algorithm analysis where recursive programs have Fibonacci time complexity.</p>

            <h2 className="text-2xl font-bold mb-3">Tips for Using This Calculator</h2>
            <p>Enter a count between 2 and 40. The table shows the complete sequence (up to 20 terms displayed). The line chart shows the exponential growth curve clearly — even at 15 terms, the dramatic acceleration is visible. Combine with the <a href="/calculator/combinations-calculator">combinations calculator</a> or <a href="/calculator/factorial-calculator">factorial calculator</a> for combinatorics work. For financial applications, use Fibonacci retracements alongside technical analysis tools.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fibonacci-calculator" />
          <PopularCalculators exclude="/calculator/fibonacci-calculator" />
        </div>
      </div>
    </>
  );
};
export default FibonacciCalculator;
