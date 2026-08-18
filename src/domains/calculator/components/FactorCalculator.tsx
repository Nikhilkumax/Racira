"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FactorResult {
  number: number;
  factors: number[];
  factorCount: number;
  factorPairs: [number, number][];
  sumOfFactors: number;
  primeFactorization: string;
  evenCount: number;
  oddCount: number;
  isPrime: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function getFactors(n: number): number[] {
  const factors: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) factors.push(n / i);
    }
  }
  return factors.sort((a, b) => a - b);
}

function getPrimeFactorization(n: number): string {
  let x = n;
  const parts: string[] = [];
  for (let p = 2; p * p <= x; p++) {
    let count = 0;
    while (x % p === 0) { x /= p; count++; }
    if (count > 0) parts.push(count > 1 ? `${p}${superscript(count)}` : `${p}`);
  }
  if (x > 1) parts.push(`${x}`);
  return parts.join(" × ");
}

function superscript(n: number): string {
  const map: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return String(n).split("").map(c => map[c]).join("");
}

function calcFactors(n: number): FactorResult {
  const factors = getFactors(n);
  const factorPairs: [number, number][] = [];
  for (let i = 0; i < factors.length; i++) {
    const a = factors[i];
    const b = n / a;
    if (a > b) break;
    factorPairs.push([a, b]);
  }
  const sumOfFactors = factors.reduce((s, f) => s + f, 0);
  const evenCount = factors.filter(f => f % 2 === 0).length;
  const oddCount = factors.length - evenCount;
  const isPrime = factors.length === 2;

  const breakdown = [
    { label: "Number", value: `${n.toLocaleString()}` },
    { label: "Total Factors", value: `${factorCount(n)}` },
    { label: "Factors", value: factors.join(", ") },
    { label: "Factor Pairs", value: factorPairs.map(p => `${p[0]} × ${p[1]}`).join(" · ") },
    { label: "Sum of Factors", value: sumOfFactors.toLocaleString() },
    { label: "Prime Factorization", value: getPrimeFactorization(n) },
    { label: "Even / Odd Factors", value: `${evenCount} / ${oddCount}` },
    { label: "Primality", value: isPrime ? "Prime number" : "Composite number" },
  ];
  const summaryStats = [
    { label: "Factor Count", value: `${factorCount(n)}` },
    { label: "Sum of Factors", value: sumOfFactors.toLocaleString() },
    { label: "Smallest Factor", value: `${factors[0]}` },
    { label: "Largest Factor", value: `${factors[factors.length - 1]}` },
    { label: "Even Factors", value: `${evenCount}` },
    { label: "Odd Factors", value: `${oddCount}` },
    { label: "Factorization", value: getPrimeFactorization(n) },
    { label: "Primality", value: isPrime ? "Prime" : "Composite" },
  ];
  const chartData = [
    { name: "Even", value: evenCount, fill: "hsl(var(--primary))" },
    { name: "Odd", value: oddCount, fill: "#f59e0b" },
  ];
  return { number: n, factors, factorCount: factorCount(n), factorPairs, sumOfFactors, primeFactorization: getPrimeFactorization(n), evenCount, oddCount, isPrime, breakdown, summaryStats, chartData };
}

function factorCount(n: number): number {
  let count = 0;
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) count += i === n / i ? 1 : 2;
  }
  return count;
}

const DEFAULTS = { num: "72" };

export default function FactorCalculator() {
  const [num, setNum] = useState(DEFAULTS.num);
  const [result, setResult] = useState<FactorResult | null>(null);

  const n = parseInt(num) || 0;
  const errs: string[] = [];
  if (!/^\d+$/.test(num.trim())) errs.push("Enter a whole number to factor.");
  else if (n < 1 || n > 1000000) errs.push("Number must be between 1 and 1,000,000.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcFactors(n)); };
  const reset = () => {
    setNum(DEFAULTS.num);
    setResult(calcFactors(72));
  };
  useEffect(() => { setResult(calcFactors(72)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a factor?", answer: "A factor of a number n is any whole number that divides n exactly with no remainder. For example, the factors of 12 are 1, 2, 3, 4, 6, and 12." },
    { question: "How do I find factors quickly?", answer: "Check divisors only up to the square root of n. Each divisor you find pairs with a larger divisor, so you never need to test beyond √n." },
    { question: "What is prime factorization?", answer: "Every composite number can be written uniquely as a product of primes, e.g., 72 = 2³ × 3². This representation is the basis for GCD, LCM, and many number-theory operations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Factor Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Factor Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Number to Factor</label>
              <div className={inp}><input value={num} onChange={e => setNum(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Factors</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.factorCount}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.number.toLocaleString()} = {result.primeFactorization} · {result.isPrime ? "prime" : "composite"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Sum of Factors`, result.sumOfFactors.toLocaleString()], ["Factor Pairs", `${result.factorPairs.length}`], ["Even / Odd", `${result.evenCount} / ${result.oddCount}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Factor Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Factor Parity</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} factors`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Share of factors that are even vs odd</p>
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
            <h2 className="text-2xl font-bold mb-3">Finding All Factors</h2>
            <p>This <strong>factor calculator</strong> finds every divisor of a number by testing only up to its square root — each divisor found below the root pairs with one above it. The results include the factor list, factor pairs, the sum of factors, and the prime factorization.</p>
            <h2 className="text-2xl font-bold mb-3">Why Factorization Matters</h2>
            <p>Prime factorization is the foundation of GCD and LCM computations, simplifying fractions, modular arithmetic, and cryptography. Knowing the divisor structure of a number also reveals properties like perfect numbers (sum of factors equals 2n) and abundant or deficient numbers.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Pairs</h2>
            <p>Every factor pair multiplies back to the original number: for 72, pairs run 1 × 72 up to 8 × 9. When a number is a perfect square, the middle pair is a single factor repeated (e.g., 8 × 8 for 64).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/factor-calculator" />
          <PopularCalculators exclude="/calculator/factor-calculator" />
        </div>
      </div>
    </>
  );
}
