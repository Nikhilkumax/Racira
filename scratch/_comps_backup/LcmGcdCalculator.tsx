"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LcmGcdResult {
  numbers: number[];
  lcm: number;
  gcd: number;
  factors: { num: number; text: string }[];
  primeData: { prime: string; gcdExp: number; lcmExp: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = a % b; a = b; b = t; }
  return a;
}

function lcm(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : (a / gcd(a, b)) * b;
}

function primeFactors(n: number): Map<number, number> {
  const map = new Map<number, number>();
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) { map.set(p, (map.get(p) || 0) + 1); x /= p; }
  }
  if (x > 1) map.set(x, (map.get(x) || 0) + 1);
  return map;
}

function sup(n: number): string {
  return n.toString().split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(d, 10)]).join("");
}

function calcLcmGcd(nums: number[]): LcmGcdResult {
  const n = nums.length;
  let g = nums[0];
  let l = nums[0];
  for (let i = 1; i < n; i++) { g = gcd(g, nums[i]); l = lcm(l, nums[i]); }
  const factors = nums.map((num) => {
    const f = primeFactors(num);
    const text = [...f.entries()].map(([p, e]) => e === 1 ? `${p}` : `${p}${sup(e)}`).join(" × ");
    return { num, text: text || "prime" };
  });
  // union of primes across all numbers
  const allPrimes = new Set<number>();
  nums.forEach((num) => primeFactors(num).forEach((_, p) => allPrimes.add(p)));
  const primeData = [...allPrimes].sort((a, b) => a - b).map((p) => {
    let gcdExp = Infinity;
    nums.forEach((num) => { const e = primeFactors(num).get(p) || 0; gcdExp = Math.min(gcdExp, e); });
    let lcmExp = 0;
    nums.forEach((num) => { const e = primeFactors(num).get(p) || 0; lcmExp = Math.max(lcmExp, e); });
    return { prime: `${p}`, gcdExp: gcdExp === Infinity ? 0 : gcdExp, lcmExp };
  });
  const product = nums.reduce((s, v) => s * v, 1);
  const breakdown = [
    ...factors.map((f) => ({ label: `${fmt(f.num)} =`, value: f.text })),
    { label: "Greatest Common Divisor", value: fmt(g) },
    { label: "Least Common Multiple", value: fmt(l) },
    { label: "Product of Inputs", value: fmt(product) },
    { label: "LCM × GCD Check", value: n === 2 ? `= ${fmt(g * l)} (matches product for two numbers)` : "—" },
    { label: "LCM / GCD", value: g > 0 ? fmt(l / g) : "—" },
  ];
  const summaryStats = [
    { label: "LCM", value: fmt(l) },
    { label: "GCD", value: fmt(g) },
    { label: "LCM ÷ GCD", value: g > 0 ? fmt(l / g) : "—" },
    { label: "Numbers", value: nums.map(fmt).join(", ") },
    { label: "Product", value: fmt(product) },
    { label: "GCD of All", value: fmt(g) },
    { label: "Distinct Primes", value: `${primeData.length}` },
    { label: "Pairwise (a×b = LCM×GCD)", value: n === 2 ? "Holds" : "n > 2 — n/a" },
  ];
  return { numbers: nums, lcm: l, gcd: g, factors, primeData, breakdown, summaryStats };
}

const DEFAULTS = { a: "12", b: "18", c: "24" };

export default function LcmGcdCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [result, setResult] = useState<LcmGcdResult | null>(null);

  const na = parseInt(a, 10) || 0;
  const nb = parseInt(b, 10) || 0;
  const nc = parseInt(c, 10) || 0;
  const errs: string[] = [];
  if (na <= 0 || nb <= 0 || nc <= 0) errs.push("Enter three positive integers (2 and 3 are the minimum count — set the third to 1 to use two).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLcmGcd([na, nb, nc])); };
  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c);
    setResult(calcLcmGcd([12, 18, 24]));
  };
  useEffect(() => { setResult(calcLcmGcd([12, 18, 24])); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the GCD?", answer: "The greatest common divisor is the largest integer that divides every input without remainder. For 12, 18, and 24 the GCD is 6. The Euclidean algorithm computes it by repeated division." },
    { question: "What is the LCM?", answer: "The least common multiple is the smallest positive integer divisible by every input — 72 for 12, 18, and 24. It is found from the highest power of each prime that appears in any factorization." },
    { question: "Why does LCM × GCD equal a × b for two numbers?", answer: "For a pair of numbers, multiplying the LCM and GCD always reproduces their product — the calculator verifies this identity. With three or more inputs no such simple relation holds, so the LCM is built prime by prime." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "LCM and GCD Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">LCM and GCD Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Number 1</label>
                <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Number 2</label>
                <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Number 3</label>
                <div className={inp}><input type="number" value={c} onChange={e => setC(e.target.value)} className={ci} /></div>
              </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Least Common Multiple</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.lcm)}</div>
                <div className="text-sm text-muted-foreground mt-1">of {result.numbers.map(fmt).join(", ")} · GCD = {fmt(result.gcd)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`LCM`, fmt(result.lcm)], ["GCD", fmt(result.gcd)], ["LCM ÷ GCD", result.gcd > 0 ? fmt(result.lcm / result.gcd) : "—"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Prime Factorization</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.numbers.length ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === result.numbers.length ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === result.numbers.length ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Prime Exponents in GCD vs LCM</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.primeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="prime" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Prime factor", position: "insideBottom", offset: -4, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="gcdExp" name="GCD exponent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lcmExp" name="LCM exponent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">GCD takes the minimum exponent, LCM the maximum, for each prime</p>
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
            <h2 className="text-2xl font-bold mb-3">Prime Factorization View</h2>
            <p>This <strong>LCM and GCD calculator</strong> factors each input into primes — 12 = 2²·3, 18 = 2·3², 24 = 2³·3. The GCD collects the minimum exponent of every shared prime (2¹·3¹ = 6); the LCM collects the maximum (2³·3² = 72).</p>
            <h2 className="text-2xl font-bold mb-3">The Euclidean Algorithm</h2>
            <p>The GCD is also computed by repeated division — the Euclidean algorithm — which works for arbitrarily large integers without factoring. The LCM then follows from the identity a·b = gcd(a,b)·lcm(a,b), applied pairwise.</p>
            <h2 className="text-2xl font-bold mb-3">Where They Matter</h2>
            <p>LCM and GCD appear everywhere in fractions, ratios, gear ratios, scheduling cycles, and periodic events. Knowing both for a set of numbers also lets you verify your factorization work at a glance.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lcm-gcd-calculator" />
          <PopularCalculators exclude="/calculator/lcm-gcd-calculator" />
        </div>
      </div>
    </>
  );
}
