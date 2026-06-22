"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FactorialCalculator = () => {
  const DEFAULTS = { n: "10" };
  const [n, setN] = useState(DEFAULTS.n);
  const [result, setResult] = useState<any>(null);

  const factOf = (num: number): number => {
    if (num <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= num; i++) r *= i;
    return r;
  };

  const calculate = (nVal = n) => {
    const num = parseInt(nVal);
    if (isNaN(num) || num < 0 || num > 20) return;
    const fact = factOf(num);
    const rows = Array.from({ length: num + 1 }, (_, i) => ({
      label: `${i}!`,
      value: factOf(i).toLocaleString(),
    }));
    const chartData = Array.from({ length: Math.min(num + 1, 11) }, (_, i) => ({
      name: `${i}!`,
      value: factOf(i),
    }));
    setResult({
      primary: fact.toLocaleString(),
      subtitle: `${num}! = ${num > 0 ? Array.from({ length: num }, (_, i) => i + 1).join(" × ") : "1"}`,
      rows,
      chartData,
      summary: [
        { label: "Input (n)", value: num },
        { label: "n! Result", value: fact.toLocaleString() },
        { label: "Digits in result", value: fact.toString().length },
        { label: "(n-1)!", value: num > 0 ? factOf(num - 1).toLocaleString() : "N/A", border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setN(DEFAULTS.n); calculate(DEFAULTS.n); };

  const faqs = [
    { question: "What is a factorial?", answer: "The factorial of n (written n!) is the product of all positive integers from 1 to n. For example, 5! = 5 × 4 × 3 × 2 × 1 = 120." },
    { question: "What is 0!?", answer: "By mathematical convention, 0! = 1. This is consistent with the gamma function and makes combinatorial formulas work correctly." },
    { question: "Why is the maximum input 20?", answer: "21! exceeds the safe integer range in JavaScript (2^53). For larger factorials, arbitrary-precision libraries are required." },
    { question: "Where are factorials used?", answer: "Factorials appear in permutations (nPr = n!/(n-r)!), combinations (nCr = n!/r!(n-r)!), probability, Taylor series expansions, and calculus." },
    { question: "What is 10!?", answer: "10! = 3,628,800. This is the number of ways to arrange 10 distinct objects in a sequence." },
    { question: "Is factorial defined for negative numbers?", answer: "Standard factorials are only defined for non-negative integers. The gamma function extends factorials to real and complex numbers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Factorial Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Factorial Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number (n) — max 20</label>
              <input type="number" value={n} onChange={e => setN(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="10" min="0" max="20" step="1" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Factorial Result</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1 break-words">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Factorial Table</h3>
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
                  <h3 className="text-base font-semibold mb-3">Factorial Growth</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Factorial Calculator?</h2>
            <p>A factorial calculator computes n! — the product of every positive integer from 1 up to n. Factorials are foundational to combinatorics, probability theory, algebra, and calculus. They grow extraordinarily fast: 10! = 3,628,800 while 20! = 2,432,902,008,176,640,000. This calculator shows the result instantly alongside a complete table of all factorials from 0! through n! and a bar chart that visualizes the explosive growth pattern.</p>
            <p>Students use factorial calculators when working through permutations and combinations, educators use them to illustrate mathematical growth rates, and programmers use factorials in algorithms including sorting, hashing, and recursive function design.</p>

            <h2>How Factorials Are Calculated</h2>
            <p>The definition is recursive: n! = n × (n−1)! with the base case 0! = 1. Expanded, this means:</p>
            <ul>
              <li>0! = 1</li>
              <li>1! = 1</li>
              <li>2! = 2 × 1 = 2</li>
              <li>3! = 3 × 2 × 1 = 6</li>
              <li>5! = 5 × 4 × 3 × 2 × 1 = 120</li>
              <li>10! = 3,628,800</li>
            </ul>
            <p>The iterative formula multiplies integers sequentially: n! = 1 × 2 × 3 × … × n. Both approaches yield identical results. The growth rate is super-exponential — faster than any exponential function — which is why even 20! requires 19 digits.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result card shows n! formatted with comma separators for readability. The product expansion below shows each multiplication step. The factorial table lists every value from 0! to n!, letting you see the sequence at a glance. The bar chart reveals the dramatic growth — notice how the bars for small n are nearly invisible compared to the final bar, illustrating just how rapidly factorials increase.</p>

            <h2>Key Properties of Factorials</h2>
            <p><strong>Zero factorial:</strong> 0! = 1 by definition. This is not arbitrary — it ensures the combinatorics formula C(n, 0) = 1 works correctly and aligns with the gamma function. <strong>Recursive identity:</strong> n! = n × (n−1)! This recursive structure is used in dynamic programming algorithms. <strong>Prime factorization:</strong> Every factorial n! contains all primes up to n as factors. For example, 10! is divisible by 2, 3, 5, and 7. <strong>Trailing zeros:</strong> The number of trailing zeros in n! equals the number of times 5 divides n!, computed as ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …</p>

            <h2>Applications of Factorials</h2>
            <p><strong>Permutations:</strong> The number of ways to arrange n distinct objects in a sequence is n!. For example, 4 books can be arranged on a shelf in 4! = 24 ways. When selecting r items from n in order, the formula is nPr = n! / (n−r)!.</p>
            <p><strong>Combinations:</strong> The number of ways to choose r items from n without regard to order is nCr = n! / (r! × (n−r)!). This appears in binomial expansions and probability distributions.</p>
            <p><strong>Taylor series:</strong> Many functions are expressed as infinite series involving factorials in denominators. For example, e^x = 1 + x/1! + x²/2! + x³/3! + … The factorial denominators ensure convergence.</p>
            <p><strong>Probability distributions:</strong> The Poisson, binomial, and gamma distributions all involve factorials or the gamma function in their probability mass and density functions.</p>

            <h2>Practical Examples</h2>
            <p><strong>Scheduling:</strong> A manager needs to schedule 5 meetings in a day. The number of possible orderings is 5! = 120 schedules. With 8 meetings, there are 8! = 40,320 possible schedules.</p>
            <p><strong>Password combinations:</strong> A 4-digit PIN using each digit once has 10P4 = 10!/6! = 5,040 possible values. A 6-character password using all letters A–F exactly once has 6! = 720 arrangements.</p>
            <p><strong>Card games:</strong> A standard 52-card deck can be arranged in 52! ways — a number with 68 digits, larger than the estimated number of atoms in the observable universe.</p>

            <h2>Tips for Using This Calculator</h2>
            <p>Enter any integer from 0 to 20. Values above 20 exceed JavaScript's safe integer range (2⁵³ − 1). For larger factorials, use Stirling's approximation: n! ≈ √(2πn) × (n/e)^n, which is accurate to within 1% for n ≥ 10. Combine this calculator with the <a href="/calculator/combinations-calculator">combinations calculator</a> and the <a href="/calculator/permutations-calculator">permutations calculator</a> for complete combinatorics work.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/factorial-calculator" />
          <PopularCalculators exclude="/calculator/factorial-calculator" />
        </div>
      </div>
    </>
  );
};
export default FactorialCalculator;
