"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface GcfResult {
  numbers: number[];
  gcf: number;
  lcm: number;
  steps: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

function calcGcf(nums: number[]): GcfResult {
  let g = nums[0];
  const steps: string[] = [];
  for (let i = 1; i < nums.length; i++) {
    g = gcd(g, nums[i]);
    steps.push(`gcd(${nums.slice(0, i + 1).join(", ")}) = ${g}`);
  }
  let l = nums[0];
  for (let i = 1; i < nums.length; i++) l = lcm(l, nums[i]);
  const gcf = g;
  const lcmValue = Math.round(l);

  const breakdown = [
    { label: "Numbers", value: nums.join(", ") },
    { label: "Greatest Common Factor", value: `${gcf}` },
    { label: "Least Common Multiple", value: `${lcmValue}` },
    { label: "Euclidean Steps", value: steps.join(" → ") },
    { label: "GCF as Product of Primes", value: primeProduct(gcf) },
    { label: "Count of Numbers", value: `${nums.length}` },
    { label: "Product of Numbers", value: nums.reduce((p, n) => p * n, 1).toLocaleString() },
    { label: "Largest Input", value: `${Math.max(...nums)}` },
  ];
  const summaryStats = [
    { label: "GCF", value: `${gcf}` },
    { label: "LCM", value: `${lcmValue}` },
    { label: "Numbers", value: `${nums.length}` },
    { label: "Smallest", value: `${Math.min(...nums)}` },
    { label: "Largest", value: `${Math.max(...nums)}` },
    { label: "Product", value: nums.reduce((p, n) => p * n, 1).toLocaleString() },
    { label: "Factorization", value: primeProduct(gcf) },
    { label: "Algorithm", value: "Euclidean" },
  ];
  const chartData = nums.map((n, i) => ({ name: `N${i + 1}`, value: n, fill: i === nums.length - 1 ? "hsl(var(--primary))" : "#8b5cf6" }));
  return { numbers: nums, gcf, lcm: lcmValue, steps: steps.join(" → "), breakdown, summaryStats, chartData };
}

function primeProduct(n: number): string {
  if (n <= 1) return n === 1 ? "1" : "—";
  let x = n;
  const parts: string[] = [];
  for (let p = 2; p * p <= x; p++) {
    let count = 0;
    while (x % p === 0) { x /= p; count++; }
    if (count > 0) parts.push(count > 1 ? `${p}²` : `${p}`);
  }
  if (x > 1) parts.push(`${x}`);
  return parts.join(" × ");
}

const DEFAULTS = { n1: "48", n2: "72", n3: "36", n4: "60" };

export default function GcfCalculator() {
  const [n1, setN1] = useState(DEFAULTS.n1);
  const [n2, setN2] = useState(DEFAULTS.n2);
  const [n3, setN3] = useState(DEFAULTS.n3);
  const [n4, setN4] = useState(DEFAULTS.n4);
  const [result, setResult] = useState<GcfResult | null>(null);

  const vals = [parseInt(n1) || 0, parseInt(n2) || 0, parseInt(n3) || 0, parseInt(n4) || 0];
  const errs: string[] = [];
  if (vals.some(v => !/^\d+$/.test(String(v)) && v <= 0)) errs.push("Enter whole numbers greater than 0.");
  if (vals.some(v => v <= 0)) errs.push("All numbers must be greater than 0.");
  if (vals.some(v => v > 1000000)) errs.push("Numbers must be 1,000,000 or less.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcGcf(vals)); };
  const reset = () => {
    setN1(DEFAULTS.n1); setN2(DEFAULTS.n2); setN3(DEFAULTS.n3); setN4(DEFAULTS.n4);
    setResult(calcGcf([48, 72, 36, 60]));
  };
  useEffect(() => { setResult(calcGcf([48, 72, 36, 60])); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the greatest common factor?", answer: "The GCF is the largest number that divides every input evenly. For 48, 72, 36, and 60, the shared factors are 1, 2, 3, 4, 6, and 12 — so the GCF is 12." },
    { question: "How does the Euclidean algorithm work?", answer: "Repeatedly replace the larger number with the remainder of dividing the two: gcd(48, 72) → gcd(48, 24) → gcd(24, 0) = 24. It is the fastest known method and works for huge numbers." },
    { question: "Why does the LCM matter too?", answer: "The least common multiple is the smallest number all inputs divide into — needed for adding fractions and synchronizing repeating schedules. GCF and LCM are linked: lcm(a, b) × gcd(a, b) = a × b." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "GCF Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">GCF Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Number 1</label>
                <div className={inp}><input value={n1} onChange={e => setN1(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Number 2</label>
                <div className={inp}><input value={n2} onChange={e => setN2(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Number 3</label>
                <div className={inp}><input value={n3} onChange={e => setN3(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Number 4</label>
                <div className={inp}><input value={n4} onChange={e => setN4(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Greatest Common Factor</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.gcf}</div>
                <div className="text-sm text-muted-foreground mt-1">of {result.numbers.join(", ")} · LCM {result.lcm}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`LCM`, `${result.lcm}`], ["Factorization", primeProduct(result.gcf)], ["Count", `${result.numbers.length}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">GCF Details</h3>
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
                <h3 className="text-base font-bold mb-4">Input Numbers</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">Greatest Common Factor</h2>
            <p>This <strong>GCF calculator</strong> finds the largest number dividing all inputs, using the Euclidean algorithm — the oldest algorithm still in common use. The LCM is computed alongside via the identity lcm(a, b) × gcd(a, b) = a × b.</p>
            <h2 className="text-2xl font-bold mb-3">The Euclidean Algorithm</h2>
            <p>Instead of listing every factor, Euclid's method replaces the larger number with the division remainder until one reaches zero: gcd(48, 72) = gcd(48, 24) = gcd(24, 0) = 24, then gcd(24, 36) = 12, and gcd(12, 60) = 12. Each step shrinks the numbers dramatically, so even large inputs resolve in a handful of iterations.</p>
            <h2 className="text-2xl font-bold mb-3">Where GCF Shows Up</h2>
            <p>Simplifying fractions, factoring expressions, finding common denominators, distributing items into equal groups, and solving modular arithmetic problems all reduce to finding the GCF first.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gcf-calculator" />
          <PopularCalculators exclude="/calculator/gcf-calculator" />
        </div>
      </div>
    </>
  );
}
