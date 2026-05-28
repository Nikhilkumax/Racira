"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PrimeFactorizationCalculator = () => {
  const DEFAULTS = { number: "360" };
  const [number, setNumber] = useState(DEFAULTS.number);
  const [result, setResult] = useState<any>(null);

  const primeFactors = (n: number) => {
    const factors: Record<number, number> = {};
    let d = 2;
    while (d * d <= n) {
      while (n % d === 0) { factors[d] = (factors[d] || 0) + 1; n = Math.floor(n / d); }
      d++;
    }
    if (n > 1) factors[n] = (factors[n] || 0) + 1;
    return factors;
  };

  const isPrime = (n: number) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };

  const calculate = (val = number) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 2 || n > 1e9) return;
    const factors = primeFactors(n);
    const primes = Object.keys(factors).map(Number);
    const expression = primes.map(p => factors[p] > 1 ? `${p}^${factors[p]}` : `${p}`).join(" × ");
    const expanded = primes.flatMap(p => Array(factors[p]).fill(p)).join(" × ");
    const numDivisors = Object.values(factors).reduce((acc, e) => acc * (e + 1), 1);
    const chartData = primes.map(p => ({ name: `${p}`, value: factors[p] }));
    const rows = [
      { label: "Number", value: n.toLocaleString() },
      { label: "Is Prime?", value: isPrime(n) ? "Yes ✓" : "No" },
      { label: "Prime Factorization", value: expression },
      { label: "Expanded Form", value: expanded },
      { label: "Number of Prime Factors", value: primes.length },
      { label: "Total Prime Factor Count", value: Object.values(factors).reduce((a, b) => a + b, 0) },
      { label: "Number of Divisors", value: numDivisors },
    ];
    setResult({
      primary: expression,
      subtitle: `${n.toLocaleString()} = ${expanded}`,
      rows, chartData,
      summary: [
        { label: "Input", value: n.toLocaleString() },
        { label: "Unique prime factors", value: primes.length },
        { label: "Total divisors", value: numDivisors },
        { label: "Largest prime factor", value: Math.max(...primes), border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setNumber(DEFAULTS.number); calculate(DEFAULTS.number); };

  const faqs = [
    { question: "What is prime factorization?", answer: "Prime factorization is expressing a number as a product of its prime factors. Every integer greater than 1 has a unique prime factorization — this is the Fundamental Theorem of Arithmetic." },
    { question: "What is the prime factorization of 360?", answer: "360 = 2³ × 3² × 5. Breaking it down: 360 ÷ 2 = 180, 180 ÷ 2 = 90, 90 ÷ 2 = 45, 45 ÷ 3 = 15, 15 ÷ 3 = 5, 5 is prime." },
    { question: "How do I find the number of divisors?", answer: "If n = p₁^a₁ × p₂^a₂ × ... × pₖ^aₖ, then the number of divisors is (a₁+1)(a₂+1)...(aₖ+1). For 360 = 2³×3²×5¹: divisors = (3+1)(2+1)(1+1) = 24." },
    { question: "How is prime factorization used in LCM and GCD?", answer: "LCM takes the highest power of each prime across both numbers. GCD takes the lowest power. For example, GCD(360, 48) uses the common prime factors: 2³ × 3 = 24." },
    { question: "What numbers have many divisors?", answer: "Highly composite numbers — like 360, 720, 1260 — have more divisors than any smaller number. They are useful in scheduling, music, and ancient measurement systems." },
    { question: "Can I factorize very large numbers?", answer: "This calculator handles numbers up to 1 billion. For larger numbers, trial division becomes slow and specialized algorithms like Pollard's rho are used." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Prime Factorization Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Prime Factorization Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number (2 – 1,000,000,000)</label>
              <input type="number" value={number} onChange={e => setNumber(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="360" min="2" max="1000000000" step="1" />
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Prime Factorization</div>
                <div className="text-3xl font-bold text-primary break-words">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1 break-words">{result.subtitle}</div>
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
              {result.chartData?.length > 0 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Prime Factor Exponents</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" label={{ value: "Prime", position: "insideBottom", offset: -2 }} tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} label={{ value: "Exponent", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [v, "Exponent"]} />
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
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is Prime Factorization?</h2>
            <p>Prime factorization is the process of expressing any integer greater than 1 as a product of prime numbers. A prime number is a number greater than 1 that has exactly two divisors: 1 and itself (2, 3, 5, 7, 11, 13…). The Fundamental Theorem of Arithmetic states that every integer greater than 1 has a unique prime factorization — no two different combinations of primes multiply to give the same result.</p>
            <p>For example, 360 = 2³ × 3² × 5. This means 360 = 8 × 9 × 5, and there is no other set of primes that multiplies to 360. This uniqueness property makes prime factorization foundational to number theory, cryptography, and many computational algorithms.</p>
            <h2>How Prime Factorization Is Calculated</h2>
            <p>The standard method is trial division: divide the number repeatedly by the smallest possible prime (starting with 2) until the quotient becomes 1. For 360: 360 ÷ 2 = 180 → 180 ÷ 2 = 90 → 90 ÷ 2 = 45 → 45 ÷ 3 = 15 → 15 ÷ 3 = 5 → 5 is prime. Result: 2³ × 3² × 5. This calculator uses optimized trial division up to √n, making it efficient for numbers up to 1 billion.</p>
            <h2>Counting Divisors</h2>
            <p>If n = p₁^a₁ × p₂^a₂ × … × pₖ^aₖ, the total number of positive divisors is (a₁+1)(a₂+1)…(aₖ+1). For 360 = 2³ × 3² × 5¹: divisors = (3+1)(2+1)(1+1) = 4 × 3 × 2 = 24. This means 360 has exactly 24 divisors: 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180, 360.</p>
            <h2>Applications of Prime Factorization</h2>
            <p><strong>LCM and GCD:</strong> The least common multiple (LCM) takes the highest power of each prime across both numbers. GCD takes the lowest. For GCD(360, 48): 48 = 2⁴ × 3. GCD = 2³ × 3 = 24. LCM = 2⁴ × 3² × 5 = 720.</p>
            <p><strong>RSA Cryptography:</strong> The security of RSA encryption relies on the computational difficulty of factorizing very large numbers (hundreds of digits). Multiplying two large primes is fast; factorizing their product is computationally infeasible with current technology.</p>
            <p><strong>Simplifying fractions:</strong> To simplify 360/48, find GCD(360,48) = 24. Then 360/48 = 15/2. Prime factorization makes GCD computation systematic.</p>
            <h2>Highly Composite Numbers</h2>
            <p>360 is a highly composite number — it has more divisors (24) than any smaller positive integer. This is why 360 was chosen for degrees in a circle (divisible by 2, 3, 4, 5, 6, 8, 9, 10, 12…), why clocks use 12 and 60 (both highly composite), and why ancient Babylonians used a base-60 number system.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Enter any integer from 2 to 1,000,000,000. The bar chart shows each prime's exponent — taller bars indicate primes that divide the number more times. Pair with the <a href="/calculator/lcm-gcd-calculator">LCM/GCD calculator</a> for practical number theory applications, or use results with the <a href="/calculator/combinations-calculator">combinations calculator</a> in counting problems.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/prime-factorization-calculator" />
          <PopularCalculators exclude="/calculator/prime-factorization-calculator" />
        </div>
      </div>
    </>
  );
};
export default PrimeFactorizationCalculator;
