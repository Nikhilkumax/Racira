"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function LcmGcdCalculator() {
  const [num1, setNum1] = useState("12");
  const [num2, setNum2] = useState("18");
  const [num3, setNum3] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ lcm: number; gcd: number; factorsA: string[]; factorsB: string[] }>({
    lcm: 0, gcd: 0, factorsA: [], factorsB: [],
  });

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

  const getPrimeFactors = (n: number): string[] => {
    const factors: number[] = [];
    let d = 2;
    while (n > 1) { while (n % d === 0) { factors.push(d); n /= d; } d++; }
    return factors.map(String);
  };

  const handleCalculate = () => {
    const a = Math.abs(Math.round(parseFloat(num1) || 0));
    const b = Math.abs(Math.round(parseFloat(num2) || 0));
    const c = num3 ? Math.abs(Math.round(parseFloat(num3) || 0)) : 0;
    if (a === 0 || b === 0) return;

    let gcdResult = gcd(a, b);
    let lcmResult = lcm(a, b);

    if (c > 0) {
      gcdResult = gcd(gcdResult, c);
      lcmResult = lcm(lcmResult, c);
    }

    setResults({
      lcm: lcmResult,
      gcd: gcdResult,
      factorsA: getPrimeFactors(a),
      factorsB: getPrimeFactors(b),
    });
    setShowResults(true);
  };

  const reset = () => { setNum1("12"); setNum2("18"); setNum3(""); setShowResults(false); };

  const faqs = [
    { question: "What is GCD?", answer: "The Greatest Common Divisor (GCD), also called the Greatest Common Factor (GCF), is the largest positive integer that divides each of the given numbers without a remainder." },
    { question: "What is LCM?", answer: "The Least Common Multiple (LCM) is the smallest positive integer that is divisible by each of the given numbers. It is essential for adding or subtracting fractions with different denominators." },
    { question: "How do you calculate GCD?", answer: "The most efficient method is the Euclidean algorithm: repeatedly replace the larger number with the remainder of dividing the larger by the smaller until the remainder is 0. The last non-zero remainder is the GCD." },
    { question: "What is the relationship between GCD and LCM?", answer: "For two numbers a and b: LCM(a,b) = (a × b) / GCD(a,b). This fundamental relationship allows you to compute LCM from GCD efficiently." },
    { question: "How is LCM used in real life?", answer: "LCM is used when finding common denominators for fractions, scheduling recurring events (when will two events next occur simultaneously), and in music theory for rhythm patterns." },
    { question: "What is prime factorization?", answer: "Prime factorization is the expression of a number as a product of its prime factors. GCD is found by multiplying common prime factors; LCM is found by multiplying all prime factors taking the highest power of each." },
    { question: "Can GCD or LCM be computed for more than 2 numbers?", answer: "Yes. For multiple numbers, compute GCD or LCM iteratively: GCD(a,b,c) = GCD(GCD(a,b), c). The same applies to LCM for any number of inputs." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "LCM and GCD Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">LCM and GCD Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate the Least Common Multiple (LCM) and Greatest Common Divisor (GCD) of two or three numbers instantly.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="num1" label="First Number" value={num1} onChange={setNum1} tooltip="Enter a positive integer." />
                <InputField id="num2" label="Second Number" value={num2} onChange={setNum2} tooltip="Enter a positive integer." />
                <InputField id="num3" label="Third Number (Optional)" value={num3} onChange={setNum3} tooltip="Optionally enter a third number." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate LCM & GCD</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Results</h2>
                <ResultDisplay items={[
                  { label: "LCM (Least Common Multiple)", value: 0, textValue: results.lcm.toString(), highlight: true },
                  { label: "GCD (Greatest Common Divisor)", value: 0, textValue: results.gcd.toString(), highlight: true },
                  { label: `Prime factors of ${num1}`, value: 0, textValue: results.factorsA.join(" × ") || "1" },
                  { label: `Prime factors of ${num2}`, value: 0, textValue: results.factorsB.join(" × ") || "1" },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>Understanding GCD and LCM</h2>
              <p>Greatest Common Divisor (GCD) and Least Common Multiple (LCM) are two of the most fundamental concepts in number theory. They appear in everything from simplifying fractions to scheduling systems and cryptography. Understanding these concepts is essential for any student of mathematics.</p>
              <h2>The Euclidean Algorithm for GCD</h2>
              <p>The Euclidean algorithm is the most efficient method for computing GCD. It is based on the principle that GCD(a, b) = GCD(b, a mod b). For example, GCD(48, 18): GCD(48, 18) = GCD(18, 12) = GCD(12, 6) = GCD(6, 0) = 6. This algorithm runs in O(log(min(a,b))) time — extraordinarily efficient for large numbers.</p>
              <h2>Computing LCM from GCD</h2>
              <p>The relationship LCM(a, b) = (a × b) / GCD(a, b) allows efficient LCM computation. For example, LCM(12, 18) = (12 × 18) / GCD(12, 18) = 216 / 6 = 36. This approach avoids the need for full prime factorization.</p>
              <h2>Prime Factorization Method</h2>
              <p>An alternative approach uses prime factorization: write each number as a product of primes. GCD uses common factors with the minimum exponent; LCM uses all factors with the maximum exponent. For 12 = 2² × 3 and 18 = 2 × 3²: GCD = 2¹ × 3¹ = 6; LCM = 2² × 3² = 36.</p>
              <h2>Real-World Applications</h2>
              <p>LCM is used to find common denominators when adding fractions. If adding 1/12 + 1/18, the LCM (36) becomes the common denominator. LCM also solves scheduling problems: if event A occurs every 12 days and event B every 18 days, they coincide every 36 days. GCD is used to simplify fractions to lowest terms and in cryptographic algorithms like RSA.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lcm-gcd-calculator" />
            <PopularCalculators exclude="/calculator/lcm-gcd-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
}
