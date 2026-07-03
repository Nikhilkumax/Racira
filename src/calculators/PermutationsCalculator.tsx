"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PermutationsCalculator = () => {
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
    if (isNaN(nN) || isNaN(rN) || nN < 0 || rN < 0 || rN > nN || nN > 20) return;
    const perm = fact(nN) / fact(nN - rN);
    const comb = fact(nN) / (fact(rN) * fact(nN - rN));
    const chartData = Array.from({ length: Math.min(rN + 1, 8) }, (_, k) => ({
      name: `P(${nN},${k})`,
      value: k === 0 ? 1 : fact(nN) / fact(nN - k),
    }));
    setResult({
      primary: Math.round(perm).toLocaleString(),
      subtitle: `P(${nN}, ${rN}) = ${nN}! / (${nN}−${rN})! = ${nN}! / ${nN - rN}!`,
      rows: [
        { label: "n (total items)", value: nN },
        { label: "r (items arranged)", value: rN },
        { label: "n! (n factorial)", value: fact(nN).toLocaleString() },
        { label: "(n−r)! factorial", value: fact(nN - rN).toLocaleString() },
        { label: "P(n,r) — Permutations", value: Math.round(perm).toLocaleString() },
        { label: "C(n,r) — Combinations", value: Math.round(comb).toLocaleString() },
        { label: "P/C ratio (= r!)", value: fact(rN).toLocaleString() },
      ],
      chartData,
      summary: [
        { label: "Permutations P(n,r)", value: Math.round(perm).toLocaleString() },
        { label: "Combinations C(n,r)", value: Math.round(comb).toLocaleString() },
        { label: "r! (ordering factor)", value: fact(rN).toLocaleString() },
        { label: "1-in probability", value: `1 in ${Math.round(perm).toLocaleString()}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setN(DEFAULTS.n); setR(DEFAULTS.r); calculate(DEFAULTS.n, DEFAULTS.r); };

  const faqs = [
    { question: "What is the permutations formula?", answer: "P(n, r) = n! / (n−r)! where n is total items and r is items being arranged in order. For P(10,3) = 10!/7! = 720." },
    { question: "When do I use permutations vs combinations?", answer: "Permutations: when order matters (race rankings, PIN codes, seating arrangements). Combinations: when order doesn't matter (committees, card hands, lottery)." },
    { question: "What is P(n,n)?", answer: "P(n,n) = n! — the number of ways to arrange all n items. For 5 books: P(5,5) = 5! = 120 different arrangements." },
    { question: "What is P(n,1)?", answer: "P(n,1) = n. There are n ways to choose and arrange just 1 item from n — simply pick any one of them." },
    { question: "How does P(n,r) relate to C(n,r)?", answer: "P(n,r) = C(n,r) × r!. For every combination of r items, there are r! ways to arrange them in order, giving the permutation count." },
    { question: "Real world example of permutations?", answer: "A sprint race has 8 runners. The number of ways to assign gold, silver, bronze medals: P(8,3) = 8!/5! = 336 different podium results." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Permutations Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Permutations Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">n — Total Number of Items</label>
              <input type="number" value={n} onChange={e => setN(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0" max="20" step="1" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">r — Items to Arrange</label>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Permutations P(n, r)</div>
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
                  <h3 className="text-base font-semibold mb-3">P(n, r) Growth as r Increases</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [v?.toLocaleString(), "Permutations"]} />
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Permutations Calculator?</h2>
            <p>A permutations calculator computes P(n, r) — the number of ordered arrangements of r items chosen from n distinct items. Unlike combinations (where order doesn't matter), permutations count each different ordering as a separate outcome. This calculator shows both the permutation count and the corresponding combination count, plus a bar chart showing how permutations grow as r increases from 0 to the entered value.</p>
            <p>Pre-filled with P(10, 3) = 720, the calculator shows that there are 720 different ways to arrange 3 items chosen from 10 when the order matters — for example, awarding gold, silver, and bronze medals to 3 of 10 athletes.</p>
            <h2>The Permutations Formula</h2>
            <p><strong>P(n, r) = n! / (n − r)!</strong></p>
            <p>For P(10, 3): P = 10! / 7! = (10 × 9 × 8 × 7!) / 7! = 10 × 9 × 8 = 720. Notice you can cancel the (n−r)! factorial and just multiply n × (n−1) × (n−2) × … for r terms. This shortcut avoids computing large factorials.</p>
            <h2>Permutations vs Combinations</h2>
            <p>The key relationship: P(n, r) = C(n, r) × r!. For every unordered combination of r items, there are r! ways to arrange them. So permutations always exceed combinations (when r &gt; 1). P(10,3) = 720 while C(10,3) = 120. The ratio 720/120 = 6 = 3! = the number of orderings of 3 items.</p>
            <p><strong>Use permutations when order matters:</strong> Race placements (1st ≠ 2nd), PIN combinations (1234 ≠ 4321), phone number arrangements, seating arrangements, scheduling ordered lists.</p>
            <p><strong>Use combinations when order doesn't matter:</strong> Choosing committee members, card hands, lottery picks, pizza topping selections.</p>
            <h2>Counting with Repetition</h2>
            <p>Standard permutations assume no repetition — each item can only appear once. If repetition is allowed (like a 4-digit PIN where digits can repeat), the count is simply n^r. For a 4-digit PIN from digits 0–9: 10⁴ = 10,000 possible codes. The permutations formula P(10,4) = 5,040 gives only the count where each digit appears at most once.</p>
            <h2>Practical Examples</h2>
            <p><strong>Olympics medals:</strong> 8 swimmers compete; how many ways can gold/silver/bronze be awarded? P(8,3) = 8!/5! = 336 possible podium results.</p>
            <p><strong>Seating arrangement:</strong> 6 people seated in a row: P(6,6) = 6! = 720 arrangements. At a round table (circular permutations): (6−1)! = 120, since rotations of the same arrangement are identical.</p>
            <p><strong>Password strength:</strong> An 8-character password from 26 lowercase letters without repetition: P(26,8) = 26!/(26-8)! = 62,990,928,000 — about 63 billion combinations. Pair with the <a href="/calculator/combinations-calculator">combinations calculator</a> for complete counting analysis.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Enter n and r as non-negative integers with r ≤ n. Maximum n = 20 due to integer overflow. The growth chart shows how rapidly permutations increase as r grows — a powerful visual for understanding combinatorial explosion. For larger values, use Stirling's approximation or logarithms to estimate factorial-based formulas.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/permutations-calculator" />
          <PopularCalculators exclude="/calculator/permutations-calculator" />
        </div>
      </div>
    </>
  );
};
export default PermutationsCalculator;
