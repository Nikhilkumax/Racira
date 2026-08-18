"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface LcmResult {
  numbers: number[];
  lcm: number;
  factors: { num: number; text: string }[];
  chartData: { name: string; lcmRatio: number; fill: string }[];
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

function calcLcm(nums: number[]): LcmResult {
  let l = nums[0];
  for (let i = 1; i < nums.length; i++) l = lcm(l, nums[i]);
  const factors = nums.map((num) => {
    const f = primeFactors(num);
    const text = [...f.entries()].map(([p, e]) => e === 1 ? `${p}` : `${p}${sup(e)}`).join(" × ");
    return { num, text: text || "prime" };
  });
  const chartData = nums.map((num, i) => ({ name: `${fmt(num)}`, lcmRatio: Number((l / num).toFixed(2)), fill: i === 0 ? "hsl(var(--primary))" : i === 1 ? "#8b5cf6" : i === 2 ? "#f59e0b" : "#10b981" }));
  const breakdown = [
    ...factors.map((f) => ({ label: `${fmt(f.num)} =`, value: f.text })),
    { label: "Least Common Multiple", value: fmt(l) },
    { label: "LCM ÷ Each Input", value: nums.map((n) => fmt(l / n)).join(", ") },
    { label: "Product of Inputs", value: fmt(nums.reduce((s, v) => s * v, 1)) },
    { label: "Divisible by All Inputs?", value: nums.every((n) => l % n === 0) ? "Yes" : "No" },
  ];
  const summaryStats = [
    { label: "LCM", value: fmt(l) },
    { label: "Numbers", value: nums.map(fmt).join(", ") },
    { label: "Count", value: `${nums.length}` },
    { label: "LCM ÷ Input 1", value: fmt(l / nums[0]) },
    { label: "Product", value: fmt(nums.reduce((s, v) => s * v, 1)) },
    { label: "Divisible by All", value: nums.every((n) => l % n === 0) ? "Yes" : "No" },
  ];
  return { numbers: nums, lcm: l, factors, chartData, breakdown, summaryStats };
}

const DEFAULTS = { a: "4", b: "6", c: "8", d: "1", e: "1" };

export default function LcmCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [d, setD] = useState(DEFAULTS.d);
  const [e, setE] = useState(DEFAULTS.e);
  const [result, setResult] = useState<LcmResult | null>(null);

  const nums = [a, b, c, d, e].map((s) => parseInt(s, 10) || 0);
  const errs: string[] = [];
  if (nums.filter((n) => n > 0).length < 2) errs.push("Enter at least two positive integers.");
  if (nums.some((n) => n < 0)) errs.push("Numbers cannot be negative.");
  const valid = errs.length === 0;
  const active = nums.filter((n) => n > 0);

  const calculate = () => { if (valid) setResult(calcLcm(active)); };
  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c); setD(DEFAULTS.d); setE(DEFAULTS.e);
    setResult(calcLcm([4, 6, 8]));
  };
  useEffect(() => { setResult(calcLcm([4, 6, 8])); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the least common multiple?", answer: "The LCM of a set of integers is the smallest positive integer divisible by every member of the set. For 4, 6, and 8 the LCM is 24 — it appears in all three multiplication tables." },
    { question: "Why include numbers set to 1?", answer: "Setting an unused slot to 1 leaves the LCM unchanged, since 1 divides everything and its factorization contributes nothing. That lets the calculator handle anywhere from two to five numbers." },
    { question: "How large can the inputs be?", answer: "The Euclidean-algorithm-based LCM stays exact for any integers JavaScript can represent precisely — up to about 2⁵³. Factoring is only used for the display, so even large inputs remain safe." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "LCM Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">LCM Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {[["Number 1", a, setA], ["Number 2", b, setB], ["Number 3", c, setC], ["Number 4", d, setD], ["Number 5", e, setE]].map(([lbl2, val, set], i) => (
                <div key={i}>
                  <label className={lbl}>{lbl2 as string}</label>
                  <div className={inp}><input type="number" value={val as string} onChange={(ev) => (set as (v: string) => void)(ev.target.value)} className={ci} /></div>
                </div>
              ))}
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
                <div className="text-sm text-muted-foreground mt-1">of {result.numbers.map(fmt).join(", ")}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`LCM`, fmt(result.lcm)], ["Inputs", result.numbers.map(fmt).join(", ")], ["Divisible by All", result.numbers.every((n) => result.lcm % n === 0) ? "Yes" : "No"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold break-all">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Factorization and Result</h3>
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
                <h3 className="text-base font-bold mb-4">How Many Times LCM Contains Each Input</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, _n: string, p: { payload?: { name?: string } }) => [`LCM is ${fmt(v)}× the input ${p?.payload?.name ?? ""}`, ""]} />
                    <Bar dataKey="lcmRatio" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">LCM ÷ each input — every bar must be a whole number ≥ 1</p>
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
            <h2 className="text-2xl font-bold mb-3">Computing the LCM</h2>
            <p>This <strong>LCM calculator</strong> combines inputs pairwise using the identity lcm(a, b) = a·b / gcd(a, b), with the GCD from the Euclidean algorithm. The result is exact for any integers up to JavaScript's safe-integer range.</p>
            <h2 className="text-2xl font-bold mb-3">Prime Factorization</h2>
            <p>Each input is broken into primes for display — 4 = 2², 6 = 2·3, 8 = 2³ — and the LCM takes the highest exponent of every prime involved: 2³·3 = 24. The two approaches always agree, which the calculator demonstrates side by side.</p>
            <h2 className="text-2xl font-bold mb-3">Why the LCM Matters</h2>
            <p>Common denominators, gear teeth, repeating schedules, and synchronization problems all reduce to finding an LCM. Add fractions, plan repeating events, or check divisibility — the answer is the smallest number all inputs divide evenly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lcm-calculator" />
          <PopularCalculators exclude="/calculator/lcm-calculator" />
        </div>
      </div>
    </>
  );
}
