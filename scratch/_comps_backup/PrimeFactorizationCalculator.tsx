"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const MAX_N = 9000000000000000; // 9e15, safe integer range

interface Inputs {
  number: string;
  showSteps: boolean;
  showTests: boolean;
}

interface PrimeFactor {
  base: number;
  exp: number;
}

interface Result {
  number: number;
  factors: PrimeFactor[];
  equation: string;
  divisorCount: number;
  sumDivisors: number;
  distinctCount: number;
  totalPrimeCount: number;
  largestPrime: number;
  isPrime: boolean;
  steps: string[];
  tests: { label: string; result: string; pass: boolean }[];
  valid: boolean;
  errorMsg: string;
}

function calculate(i: Inputs): Result {
  const n = Math.round(parseFloat(i.number) || 0);
  if (isNaN(n) || n < 2 || n > MAX_N) {
    return {
      number: n,
      factors: [],
      equation: "",
      divisorCount: 0,
      sumDivisors: 0,
      distinctCount: 0,
      totalPrimeCount: 0,
      largestPrime: 0,
      isPrime: false,
      steps: [],
      tests: [],
      valid: false,
      errorMsg: "Enter a whole number between 2 and 9,000,000,000,000,000.",
    };
  }

  let m = n;
  const factors: PrimeFactor[] = [];
  const steps: string[] = [];
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    let exp = 0;
    while (m % p === 0) {
      m /= p;
      exp++;
    }
    factors.push({ base: p, exp });
    steps.push(`${n} ÷ ${p}${exp > 1 ? ` repeated ${exp}×` : ""} → removes ${fmt(p ** exp)} (${fmt(p)}^${exp})`);
  }
  if (m > 1) {
    factors.push({ base: m, exp: 1 });
    steps.push(`${n} ÷ ${m} → prime remainder ${fmt(m)}`);
  }

  const divisorCount = factors.reduce((acc, f) => acc * (f.exp + 1), 1);
  const sumDivisors = factors.reduce((acc, f) => acc * ((Math.pow(f.base, f.exp + 1) - 1) / (f.base - 1)), 1);
  const distinctCount = factors.length;
  const totalPrimeCount = factors.reduce((acc, f) => acc + f.exp, 0);
  const largestPrime = factors.length ? factors[factors.length - 1].base : 0;
  const isPrime = factors.length === 1 && factors[0].exp === 1;

  const equation = factors.map(f => `${f.base}${f.exp > 1 ? `^${f.exp}` : ""}`).join(" × ");
  const tests: { label: string; result: string; pass: boolean }[] = [];
  if (i.showTests) {
    const digitSum = n.toString().split("").reduce((a, d) => a + parseInt(d, 10), 0);
    tests.push({ label: "Divisible by 2", result: n % 2 === 0 ? "Yes — ends in an even digit" : "No — odd last digit", pass: n % 2 === 0 });
    tests.push({ label: "Divisible by 3", result: digitSum % 3 === 0 ? "Yes — digit sum divisible by 3" : `No — digit sum ${digitSum} not divisible by 3`, pass: digitSum % 3 === 0 });
    tests.push({ label: "Divisible by 5", result: n % 5 === 0 ? "Yes — ends in 0 or 5" : "No — last digit is not 0 or 5", pass: n % 5 === 0 });
  }

  return {
    number: n,
    factors,
    equation,
    divisorCount,
    sumDivisors,
    distinctCount,
    totalPrimeCount,
    largestPrime,
    isPrime,
    steps,
    tests,
    valid: true,
    errorMsg: "",
  };
}

const DEFAULTS: Inputs = { number: "360", showSteps: true, showTests: false };

function validate(i: Inputs): string[] {
  const n = Math.round(parseFloat(i.number) || 0);
  if (i.number.trim() === "" || isNaN(n)) return ["Enter a whole number to factor."];
  if (n < 2 || n > MAX_N) return ["Number must be between 2 and 9,000,000,000,000,000."];
  return [];
}

export default function PrimeFactorizationCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  useEffect(() => { setResult(calculate(inputs)); }, []);

  const errors = validate(inputs);
  const valid = errors.length === 0;
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));
  const toggle = (k: keyof Inputs) => () => setInputs(prev => ({ ...prev, [k]: !prev[k] as boolean }));
  const calc = () => { if (valid) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const chartData = result.factors.map((f, i) => ({
    name: String(f.base),
    value: f.exp,
    fill: i === 0 ? "hsl(var(--primary))" : ["#f59e0b", "#10b981", "#8b5cf6", "#ef4444"][(i - 1) % 4],
  }));

  const faqs = [
    { question: "What is prime factorization?", answer: "Prime factorization rewrites a number as a product of its prime factors, such as 360 = 2³ × 3² × 5. Because primes are the multiplicative building blocks of every integer, this representation is unique for each number — the fundamental theorem of arithmetic." },
    { question: "How is the factorization found?", answer: "Trial division: divide by 2 while it divides evenly, then 3, 5, and every following prime up to the square root of the remaining value. Anything left over after the square root is itself prime." },
    { question: "What are the divisor count and sum of divisors?", answer: "If n = p₁^e₁ × p₂^e₂ × …, the number of divisors is (e₁+1)(e₂+1)… and the sum of divisors is the product of (pᵢ^(eᵢ+1) − 1)/(pᵢ − 1). For 360 = 2³·3²·5 that gives 24 divisors summing to 1,170." },
    { question: "Why is factorization useful?", answer: "It underpins divisor problems, least common multiples and greatest common factors, simplifying radicals, and number-theory questions like perfect numbers. In cryptography it is also the presumed-hard problem behind RSA key security." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Prime Factorization Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Prime Factorization Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Number to factor</label>
              <input type="number" min={2} step={1} value={inputs.number} onChange={e => set("number")(e.target.value)} className={inp} placeholder="360" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Output Options</div>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                        <input type="checkbox" checked={inputs.showSteps} onChange={toggle("showSteps")} className="h-4 w-4 rounded border-input accent-primary" />
                        Show step-by-step division
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                        <input type="checkbox" checked={inputs.showTests} onChange={toggle("showTests")} className="h-4 w-4 rounded border-input accent-primary" />
                        Show divisibility tests for 2, 3, and 5
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!valid && (
              <div className="space-y-1">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{e}</p>)}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} disabled={!valid} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Every whole number above 1 has a unique prime factorization — trial division finds it.</p>
          </div>

          <div className="flex flex-col gap-4">
            {!result.valid ? (
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Prime Factorization</div>
                <div className="text-xl font-extrabold text-foreground mb-1 tracking-tight">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Prime Factorization of {fmt(result.number)}</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-1 tracking-tight break-all">{result.equation}</div>
                  <div className="text-sm text-muted-foreground font-medium">{result.isPrime ? `${fmt(result.number)} is prime — it factors only as itself.` : `${result.distinctCount} distinct prime${result.distinctCount === 1 ? "" : "s"} · ${result.totalPrimeCount} prime factors with multiplicity`}</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Distinct Primes</span>
                    <span className="font-extrabold text-foreground">{result.distinctCount}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Factors</span>
                    <span className="font-extrabold text-foreground">{fmt(result.divisorCount)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sum of Divisors</span>
                    <span className="font-extrabold text-foreground">{fmt(result.sumDivisors)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Largest Prime</span>
                    <span className="font-extrabold text-foreground">{fmt(result.largestPrime)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Prime</th>
                        <th className="p-2.5 text-right w-[90px]">Exponent</th>
                        <th className="p-2.5 pr-3 text-right w-[140px]">Contributes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.factors.map((f, idx) => (
                        <tr key={idx} className={`hover:bg-secondary/20 transition-colors ${f.base === result.largestPrime ? "bg-amber-500/10" : ""}`}>
                          <td className={`p-2.5 pl-3 font-semibold ${f.base === result.largestPrime ? "text-amber-700" : "text-foreground"}`}>{f.base}<sup>{f.exp}</sup></td>
                          <td className={`p-2.5 text-right ${f.base === result.largestPrime ? "text-amber-700 font-bold" : "text-foreground"}`}>{f.exp}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${f.base === result.largestPrime ? "text-amber-700" : "text-foreground"}`}>{fmt(Math.pow(f.base, f.exp))}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                        <td className="p-2.5 pl-3">Total factors of {fmt(result.number)}</td>
                        <td className="p-2.5 text-right">{fmt(result.divisorCount)}</td>
                        <td className="p-2.5 pr-3 text-right">{fmt(result.sumDivisors)} (sum)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {inputs.showSteps && result.steps.length > 0 && (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Step-by-Step Division</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {result.steps.map((s, i) => <li key={i} className="flex gap-2"><span className="font-bold text-primary">{i + 1}.</span> {s}</li>)}
                    </ol>
                  </div>
                )}

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Prime Exponents</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [fmt(Number(v)), "exponent"]} />
                      <Bar dataKey="value" name="Exponent" radius={[6, 6, 0, 0]}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-muted-foreground mt-1">Each bar shows how many times the prime divides {fmt(result.number)}</p>
                </div>

                {inputs.showTests && result.tests.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-2.5 pl-3">Divisibility Test</th>
                          <th className="p-2.5 pr-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.tests.map((t, i) => (
                          <tr key={i} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-2.5 pl-3 font-semibold text-foreground">{t.label}</td>
                            <td className={`p-2.5 pr-3 text-right font-semibold ${t.pass ? "text-emerald-600" : "text-muted-foreground"}`}>{t.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Factorization Summary</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Factorization:</span><span className="font-semibold">{result.equation}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Distinct primes:</span><span className="font-semibold">{result.distinctCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Prime factors (with multiplicity):</span><span className="font-semibold">{result.totalPrimeCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total divisors:</span><span className="font-semibold">{fmt(result.divisorCount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Sum of divisors:</span><span className="font-semibold">{fmt(result.sumDivisors)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Largest prime factor:</span><span className="font-semibold">{fmt(result.largestPrime)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Is prime:</span><span className="font-semibold">{result.isPrime ? "Yes" : "No"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Original number:</span><span className="font-semibold">{fmt(result.number)}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Unique Building Blocks of a Number</h2>
            <p>Every whole number greater than one can be written as a product of primes in exactly one way — the fundamental theorem of arithmetic. This <strong>prime factorization calculator</strong> applies trial division to find that unique form, from simple cases like 360 = 2³ × 3² × 5 to numbers up to nine quadrillion.</p>
            <h2 className="text-2xl font-bold mb-3">More Than a String of Factors</h2>
            <p>The exponent pattern immediately yields the number of divisors, their sum, and the largest prime factor. These flow straight from the factorization: each exponent e contributes a factor of (e + 1) to the divisor count and (p^(e+1) − 1)/(p − 1) to the divisor sum.</p>
            <h2 className="text-2xl font-bold mb-3">Why Prime Factors Matter</h2>
            <p>Factorization sits beneath GCD and LCM work, radical simplification, and perfect-number checks. It is also the mathematical heart of RSA encryption — large numbers are easy to multiply together but hard to factor back apart.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/prime-factorization-calculator" />
          <PopularCalculators exclude="/calculator/prime-factorization-calculator" />
        </div>
      </div>
    </>
  );
}
