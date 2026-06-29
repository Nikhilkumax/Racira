"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CombinationsCalculator = () => {
  const DEFAULTS = { n: "10", r: "3" };
  const [n, setN] = useState(DEFAULTS.n);
  const [r, setR] = useState(DEFAULTS.r);
  const [result, setResult] = useState<any>(null);

  const fact = (num: number): number => {
    if (num <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  };

  const calculate = (nV = n, rV = r) => {
    const nN = parseInt(nV), rN = parseInt(rV);
    if (isNaN(nN) || isNaN(rN) || nN < 0 || rN < 0 || rN > nN) return;
    const comb = fact(nN) / (fact(rN) * fact(nN - rN));
    const perm = fact(nN) / fact(nN - rN);
    const chartData = [
      { name: `Choose ${rN}`, value: Math.round(comb) },
      { name: `Not chosen`, value: Math.round(perm - comb) },
    ];
    const rows = [
      { label: "n (total items)", value: nN },
      { label: "r (items chosen)", value: rN },
      { label: "n! (n factorial)", value: fact(nN).toLocaleString() },
      { label: "r! (r factorial)", value: fact(rN).toLocaleString() },
      { label: "(n−r)! factorial", value: fact(nN - rN).toLocaleString() },
      { label: "C(n,r) — Combinations", value: Math.round(comb).toLocaleString() },
      { label: "P(n,r) — Permutations", value: Math.round(perm).toLocaleString() },
    ];
    setResult({
      primary: Math.round(comb).toLocaleString(),
      subtitle: `C(${nN}, ${rN}) = ${nN}! / (${rN}! × ${nN - rN}!)`,
      rows,
      chartData,
      summary: [
        { label: "Combinations C(n,r)", value: Math.round(comb).toLocaleString() },
        { label: "Permutations P(n,r)", value: Math.round(perm).toLocaleString() },
        { label: "Ratio P/C", value: fact(rN).toLocaleString() },
        { label: "Probability (1 in ...)", value: `1 in ${Math.round(comb).toLocaleString()}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setN(DEFAULTS.n); setR(DEFAULTS.r); calculate(DEFAULTS.n, DEFAULTS.r); };

  const COLORS = ["hsl(var(--primary))", "#10b981"];

  const faqs = [
    { question: "What is the difference between combinations and permutations?", answer: "Combinations count selections where order doesn't matter — choosing 3 people from 10 for a committee. Permutations count arrangements where order matters — selecting 3 people for President, VP, and Secretary." },
    { question: "What is the combinations formula?", answer: "C(n, r) = n! / (r! × (n−r)!) where n is total items and r is items chosen. Also written as nCr or 'n choose r'." },
    { question: "What does C(10, 3) = 120 mean?", answer: "There are 120 different ways to choose 3 items from a group of 10 when the order of selection doesn't matter." },
    { question: "What is the relationship between C(n,r) and Pascal's Triangle?", answer: "C(n,r) corresponds exactly to the value at row n, position r of Pascal's Triangle. Each entry is the sum of the two entries above it." },
    { question: "When should I use combinations vs permutations?", answer: "Use combinations when order doesn't matter (lottery, committee selection, card hands). Use permutations when order matters (race rankings, PIN codes, seating arrangements)." },
    { question: "What is C(n, 0) and C(n, n)?", answer: "Both equal 1. There is exactly one way to choose nothing from n items, and exactly one way to choose all n items." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Combinations Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Combinations Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">n — Total Number of Items</label>
              <input type="number" value={n} onChange={e => setN(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0" max="20" step="1" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">r — Items to Choose</label>
              <input type="number" value={r} onChange={e => setR(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="3" min="0" max="20" step="1" />
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Combinations C(n, r)</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
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
                  <h3 className="text-base font-semibold mb-3">Combinations vs Permutations</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }: any) => `${name}: ${value?.toLocaleString()}`}>
                        {result.chartData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
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
            <h2>What Is a Combinations Calculator?</h2>
            <p>A combinations calculator computes C(n, r) — the number of ways to choose r items from a group of n items without regard to the order of selection. Also called "n choose r" and written nCr or C(n,r), this is one of the most-used formulas in probability, statistics, card games, lottery analysis, genetics, and computer science. This calculator simultaneously computes both combinations and permutations so you can compare the two at a glance.</p>
            <p>For example, choosing 3 members for a committee from 10 candidates: the order in which they are chosen doesn't matter, so we use combinations. C(10, 3) = 120 means there are exactly 120 distinct possible committees.</p>

            <h2>How Combinations Are Calculated</h2>
            <p>The formula is: <strong>C(n, r) = n! / (r! × (n − r)!)</strong></p>
            <p>For C(10, 3): C(10,3) = 10! / (3! × 7!) = 3,628,800 / (6 × 5,040) = 3,628,800 / 30,240 = 120.</p>
            <p>The key distinction from permutations: P(n, r) = n! / (n − r)! = 720 for P(10, 3). The relationship is C(n,r) = P(n,r) / r!, which means permutations count each combination r! times (once for each ordering of the r items).</p>

            <h2>Combinations vs Permutations</h2>
            <p><strong>Use combinations when order does NOT matter:</strong> Lottery numbers (1-2-3-4-5 is the same as 5-4-3-2-1), committee selection, poker hands (the order of dealing doesn't matter), choosing pizza toppings, selecting items from a menu.</p>
            <p><strong>Use permutations when order DOES matter:</strong> Race rankings (1st, 2nd, 3rd are different), PIN codes, arranging books on a shelf, selecting officers from a club (President ≠ Vice President), anagrams.</p>
            <p>The ratio P/C = r! tells you how many times more permutations there are than combinations. For r = 3: P/C = 6. So for every 1 combination, there are 6 ordered permutations.</p>

            <h2>Applications of Combinations</h2>
            <p><strong>Lottery probability:</strong> Powerball selects 5 numbers from 69. The number of possible tickets is C(69, 5) = 11,238,513. With the additional Powerball from 26, total combinations = 292,201,338. Your probability of winning: 1 in 292 million.</p>
            <p><strong>Poker hands:</strong> A 5-card hand from a 52-card deck: C(52, 5) = 2,598,960 possible hands. The probability of a royal flush is C(4,1)/C(52,5) = 4/2,598,960 ≈ 1 in 649,740.</p>
            <p><strong>Genetics:</strong> The number of ways to inherit r traits from n possible traits — genetic diversity calculations use combinations extensively in population genetics.</p>

            <h2>Pascal's Triangle and Combinations</h2>
            <p>Pascal's Triangle is a triangular array where entry C(n, r) appears at row n, position r (both 0-indexed). Each entry equals the sum of the two entries directly above it: C(n,r) = C(n−1,r−1) + C(n−1,r). This recursive property makes Pascal's Triangle useful for expanding binomial expressions: (a+b)^n = Σ C(n,k) × a^(n-k) × b^k.</p>

            <h2>Tips for This Calculator</h2>
            <p>Enter n (total items) and r (items to choose) as non-negative integers with r ≤ n. The maximum supported is n = 20 due to integer overflow at larger factorials. For very large values, use logarithms or Stirling's approximation. Pair with the <a href="/calculator/permutations-calculator">permutations calculator</a> for order-sensitive counting, or the <a href="/calculator/probability-calculator">probability calculator</a> for full probability distributions.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/combinations-calculator" />
          <PopularCalculators exclude="/calculator/combinations-calculator" />
        </div>
      </div>
    </>
  );
};
export default CombinationsCalculator;
