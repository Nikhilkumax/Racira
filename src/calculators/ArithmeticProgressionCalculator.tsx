"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const ArithmeticProgressionCalculator = () => {
  const DEFAULTS = { a: "2", d: "5", n: "10" };
  const [a, setA] = useState(DEFAULTS.a);
  const [d, setD] = useState(DEFAULTS.d);
  const [n, setN] = useState(DEFAULTS.n);
  const [findMode, setFindMode] = useState<"nth" | "sum" | "both">("both");
  const [result, setResult] = useState<any>(null);

  const calculate = (ra = a, rd = d, rn = n) => {
    const na = parseFloat(ra);
    const nd = parseFloat(rd);
    const nn = parseInt(rn);
    if (isNaN(na) || isNaN(nd) || isNaN(nn) || nn < 1) return;

    // nth term: a_n = a + (n-1)*d
    const nth = na + (nn - 1) * nd;
    // Sum: S_n = n/2 * (2a + (n-1)*d) = n/2 * (a + a_n)
    const Sn = (nn / 2) * (2 * na + (nn - 1) * nd);
    // Last term
    const lastTerm = nth;
    // Mean of AP = (a + a_n) / 2
    const mean = (na + lastTerm) / 2;

    // Generate terms sequence
    const terms = Array.from({ length: Math.min(nn, 30) }, (_, i) => ({
      position: i + 1,
      value: na + i * nd,
    }));

    // Chart: all terms as a line
    const chartData = terms.map((t) => ({ n: `a${t.position}`, value: t.value }));

    // Running sum chart
    const runningSum: number[] = [];
    let cumSum = 0;
    terms.forEach((t) => {
      cumSum += t.value;
      runningSum.push(parseFloat(cumSum.toFixed(4)));
    });
    const sumChartData = terms.map((t, i) => ({ n: `a${t.position}`, sum: runningSum[i] }));

    setResult({ na, nd, nn, nth, Sn, mean, terms, chartData, sumChartData, lastTerm });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setA(DEFAULTS.a); setD(DEFAULTS.d); setN(DEFAULTS.n);
    calculate(DEFAULTS.a, DEFAULTS.d, DEFAULTS.n);
  };

  const faqs = [
    { question: "What is an arithmetic progression?", answer: "An arithmetic progression (AP) is a sequence where the difference between consecutive terms is constant. This constant difference is called the common difference (d). General form: a, a+d, a+2d, a+3d, ... For example, {2, 7, 12, 17, 22, ...} has a=2, d=5. The nth term: aₙ = a + (n−1)d. Sum of n terms: Sₙ = n/2 × (2a + (n−1)d)." },
    { question: "What is the nth term formula?", answer: "aₙ = a + (n−1) × d, where a = first term, d = common difference, n = position. Example: AP with a=2, d=5. 10th term = 2 + (10−1)×5 = 2 + 45 = 47. This formula allows finding any term without listing all previous terms. It is linear in n, confirming that APs are linear sequences." },
    { question: "What is the sum of an AP formula?", answer: "Sₙ = n/2 × (2a + (n−1)d) = n/2 × (first term + last term). This is Gauss's formula — the young Gauss supposedly discovered this by pairing the first and last terms of 1 to 100: (1+100) + (2+99) + ... = 50 × 101 = 5050. For any AP, the sum equals (number of terms) × (average of first and last term)." },
    { question: "How do you find the common difference?", answer: "Common difference d = aₙ₊₁ − aₙ = any term minus the previous term. If given two non-consecutive terms: d = (aₘ − aₙ) / (m − n). Example: if a₃ = 11 and a₇ = 27, then d = (27−11)/(7−3) = 16/4 = 4. To verify, first term a = a₃ − 2d = 11 − 8 = 3, and the sequence is 3, 7, 11, 15, 19, 23, 27..." },
    { question: "What are real-world examples of arithmetic progressions?", answer: "Salary increments: annual raises by a fixed amount. Depreciation (straight-line): car loses $2,000 in value each year. Seat rows in a theater: row 1 has 30 seats, each subsequent row has 2 more. Floors in a building counted from the top. Monthly savings with fixed additions. Compound interest uses geometric progression, but simple interest payments form an AP." },
    { question: "How does AP differ from GP?", answer: "Arithmetic Progression (AP): constant addition. aₙ = a + (n−1)d. Graph = straight line. Sₙ grows quadratically. Geometric Progression (GP): constant multiplication. aₙ = a × r^(n−1). Graph = exponential curve. Sₙ = a(rⁿ−1)/(r−1) grows exponentially. APs model linear growth; GPs model exponential growth. Population growth, compound interest, and exponential decay are GPs." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Arithmetic Progression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Arithmetic Progression Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">First Term (a)</label>
                <input type="number" value={a} onChange={(e) => setA(e.target.value)} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Common Difference (d)</label>
                <input type="number" value={d} onChange={(e) => setD(e.target.value)} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">No. of Terms (n)</label>
                <input type="number" value={n} onChange={(e) => setN(e.target.value)} min={1} max={200} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">nth Term (a{result.nn})</div>
                  <div className="text-3xl font-bold text-primary">{fmt(result.nth)}</div>
                  <div className="text-xs text-muted-foreground mt-1">a + (n−1)d = {fmt(result.na)} + {result.nn - 1}×{fmt(result.nd)}</div>
                </div>
                <div className="bg-green-500/10 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Sum of {result.nn} Terms (S{result.nn})</div>
                  <div className="text-3xl font-bold text-green-600">{fmt(result.Sn)}</div>
                  <div className="text-xs text-muted-foreground mt-1">n/2 × (a + aₙ) = {result.nn}/2 × ({fmt(result.na)} + {fmt(result.nth)})</div>
                </div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">AP Properties</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "First Term (a₁)", value: fmt(result.na) },
                    { label: "Common Difference (d)", value: fmt(result.nd) },
                    { label: "Last Term (aₙ)", value: fmt(result.lastTerm) },
                    { label: "nth Term Formula", value: `${fmt(result.na)} + (n−1) × ${fmt(result.nd)}` },
                    { label: "Sum Formula", value: `n/2 × (${fmt(2 * result.na + (result.nn - 1) * result.nd, 2)})` },
                    { label: "Mean of AP", value: fmt(result.mean) },
                    { label: "Count (n)", value: String(result.nn) },
                    { label: "Total Sum (Sₙ)", value: fmt(result.Sn) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              {result.chartData.length > 1 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">AP Terms (Linear Sequence)</h3>
                  <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="n" tick={{ fontSize: 8 }} interval={Math.floor(result.chartData.length / 8)} />
                      <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                      <Tooltip formatter={(v: any) => [Number(v).toLocaleString(), "Term value"]} />
                      <Line type="linear" dataKey="value" stroke="#3b82f6" dot={result.chartData.length <= 20} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2">First {Math.min(result.nn, 15)} Terms</h3>
                <div className="flex flex-wrap gap-2">
                  {result.terms.slice(0, 15).map((t: any) => (
                    <div key={t.position} className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm">
                      <span className="text-muted-foreground text-xs">a{t.position}</span>
                      <span className="font-semibold ml-1">{fmt(t.value)}</span>
                    </div>
                  ))}
                  {result.nn > 15 && <div className="text-sm text-muted-foreground self-center">...and {result.nn - 15} more</div>}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Arithmetic Progression Calculator?</h2>
            <p>An arithmetic progression calculator finds the nth term, sum, and sequence of an AP given the first term, common difference, and number of terms. Pre-filled with a=2, d=5, n=10: the 10th term is 47, sum is 245, mean is 24.5. The linear term chart confirms that APs always form a straight line — their defining characteristic.</p>
            <h2>Key Formulas</h2>
            <p><strong>nth term:</strong> aₙ = a + (n−1)d. <strong>Sum of n terms:</strong> Sₙ = n/2 × (2a + (n−1)d) = n/2 × (a₁ + aₙ). <strong>Mean of AP:</strong> (a₁ + aₙ) / 2 = arithmetic mean. The mean of an AP equals the middle term (or average of two middle terms for even n). <strong>Common difference:</strong> d = aₙ − aₙ₋₁ (constant for any two adjacent terms).</p>
            <h2>Gauss's Sum Formula</h2>
            <p>The sum formula Sₙ = n/2 × (a + l) was reportedly discovered by Carl Friedrich Gauss at age 9 when his teacher asked the class to sum 1 to 100. Gauss noticed: 1+100=101, 2+99=101, 3+98=101, ... 50 pairs each summing to 101. So S₁₀₀ = 50 × 101 = 5050. This pairing insight generalizes to any AP: pair the first and last terms, which always sum to a₁ + aₙ.</p>
            <h2>APs vs Geometric Progressions</h2>
            <p>An AP adds a constant (d) to each term; a GP multiplies by a constant (r). APs model linear phenomena: salary with fixed raises, simple interest, linear depreciation. GPs model exponential phenomena: compound interest, population growth, radioactive decay. The term chart of an AP is a straight line; a GP is exponential. Real-world data can often be classified by which fits better.</p>
            <h2>Applications in Finance</h2>
            <p>Simple interest payments form an AP: if you borrow $10,000 at 5% simple interest, interest = $500/year, and total payments after n years = principal + n × $500. This contrasts with compound interest (geometric sequence). Annuities with equal payments and no growth are AP-based. Straight-line depreciation: asset loses $D per year, so book value after n years = original cost − n × D (an AP with negative d).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/arithmetic-progression-calculator" />
          <PopularCalculators exclude="/calculator/arithmetic-progression-calculator" />
        </div>
      </div>
    </>
  );
};

export default ArithmeticProgressionCalculator;
