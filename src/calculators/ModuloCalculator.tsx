"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const ModuloCalculator = () => {
  const DEFAULTS = { dividend: "17", divisor: "5" };
  const [dividend, setDividend] = useState(DEFAULTS.dividend);
  const [divisor, setDivisor] = useState(DEFAULTS.divisor);
  const [result, setResult] = useState<any>(null);

  const calculate = (a = dividend, b = divisor) => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    if (isNaN(A) || isNaN(B) || B === 0) return;
    const remainder = A % B;
    const quotient = Math.trunc(A / B);
    const floorDiv = Math.floor(A / B);
    const floorMod = A - floorDiv * B;
    const euclideanMod = ((A % B) + Math.abs(B)) % Math.abs(B);
    const isEven = remainder === 0;
    const divisors: number[] = [];
    if (Number.isInteger(A) && A > 0) {
      for (let i = 1; i <= Math.min(Math.abs(A), 50); i++) {
        if (A % i === 0) divisors.push(i);
      }
    }
    const chartData = [];
    for (let i = 1; i <= Math.min(12, Math.abs(B) > 0 ? 12 : 1); i++) {
      chartData.push({ divisor: i, remainder: A % i === 0 ? 0 : parseFloat((A % i).toFixed(2)) });
    }
    setResult({ A, B, remainder, quotient, floorDiv, floorMod, euclideanMod, isEven, divisors, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setDividend(DEFAULTS.dividend); setDivisor(DEFAULTS.divisor); calculate(DEFAULTS.dividend, DEFAULTS.divisor); };

  const faqs = [
    { question: "What is modulo?", answer: "Modulo (mod) is the remainder after integer division. Written as a mod b or a % b, it returns the remainder when a is divided by b. For example: 17 mod 5 = 2 (because 17 = 5×3 + 2). The result always satisfies: a = b×quotient + remainder. Modulo is one of the fundamental operations in computer science and number theory." },
    { question: "What is the difference between modulo and remainder?", answer: "In mathematics, modulo always returns a non-negative result (Euclidean definition). In most programming languages, the % operator returns a remainder with the sign of the dividend. For -17 % 5: C/JavaScript = -2, Python = 3. This calculator shows both the truncated remainder (%) and the Euclidean modulo." },
    { question: "What are common uses of modulo?", answer: "Even/odd detection: n % 2 === 0. Circular buffers: index % size. Clock arithmetic: (hour + offset) % 12. Hash tables: key % tableSize. Cryptography (RSA): modular exponentiation. Leap year: year % 4 === 0. Color cycling: frame % numColors. Pagination: totalItems % pageSize. Day of week: daysSinceEpoch % 7." },
    { question: "What is modular arithmetic?", answer: "Modular arithmetic treats numbers as wrapping around at a modulus. In mod 12 (clock): 10 + 5 = 3 (15 mod 12 = 3). Properties: (a+b) mod n = ((a mod n) + (b mod n)) mod n. Same for multiplication. Division requires modular inverse. Used in cryptography, computer science, and number theory. Gauss formalized it as 'congruences.'" },
    { question: "What is the modular inverse?", answer: "The modular inverse of a (mod n) is a value x such that a×x ≡ 1 (mod n). It exists only when gcd(a,n) = 1 (a and n are coprime). Example: inverse of 3 (mod 7) = 5, because 3×5 = 15 ≡ 1 (mod 7). Found using the Extended Euclidean Algorithm. Essential for RSA decryption and solving modular equations." },
    { question: "Can modulo work with decimals?", answer: "Yes — modulo works with floating-point numbers. 7.5 % 2.5 = 0 (because 7.5 = 2.5 × 3 + 0). 10.3 % 3 = 1.3 (because 10.3 = 3 × 3 + 1.3). However, floating-point precision issues may cause unexpected results: 0.1 + 0.2 = 0.30000000000000004 in IEEE 754. Use integers when precision matters." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Modulo Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Modulo Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Dividend (a)</label>
              <input type="number" value={dividend} onChange={(e) => setDividend(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="17" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Divisor (b)</label>
              <input type="number" value={divisor} onChange={(e) => setDivisor(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5" step="any" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{fmt(result.A)} mod {fmt(result.B)}</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.remainder)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {fmt(result.A)} = {fmt(result.B)} × {fmt(result.quotient)} + {fmt(result.remainder)}
                  {result.isEven && " (evenly divisible)"}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Detailed Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Dividend (a)", value: fmt(result.A) },
                    { label: "Divisor (b)", value: fmt(result.B) },
                    { label: "Quotient (trunc a/b)", value: fmt(result.quotient) },
                    { label: "Remainder (a % b)", value: fmt(result.remainder) },
                    { label: "Floor Division (⌊a/b⌋)", value: fmt(result.floorDiv) },
                    { label: "Floor Mod (Python-style)", value: fmt(result.floorMod) },
                    { label: "Euclidean Mod", value: fmt(result.euclideanMod) },
                    { label: "Evenly Divisible?", value: result.isEven ? "Yes ✓" : "No" },
                    ...(result.divisors.length > 0 ? [{ label: `Divisors of ${fmt(result.A)}`, value: result.divisors.join(", ") }] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium break-all">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">{fmt(result.A)} mod 1–12</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="divisor" tick={{ fontSize: 10 }} label={{ value: "Divisor", position: "insideBottom", offset: -2, fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: "Rem", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => fmt(Number(v))} labelFormatter={(l) => `${fmt(result.A)} mod ${l}`} />
                    <Bar dataKey="remainder" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Modulo Calculator?</h2>
            <p>A modulo calculator computes the remainder of integer division: a mod b. Pre-filled with 17 mod 5, the result is 2 (because 17 = 5 × 3 + 2). This calculator shows three mod variants — truncated remainder (C/JS), floor mod (Python), and Euclidean mod — along with a visual chart of remainders across divisors 1–12.</p>
            <h2>The Division Algorithm</h2>
            <p><strong>a = b × q + r</strong>, where q = quotient (integer part of a/b), r = remainder (a mod b). For any integers a, b (b ≠ 0), there exist unique q and r such that 0 ≤ r &lt; |b| (Euclidean definition). This is the foundation of modular arithmetic, number theory, and countless algorithms.</p>
            <h2>Modulo in Programming</h2>
            <p>The % operator in C, Java, JavaScript, and Go returns the truncated remainder (sign of dividend). Python{"'"}s % returns floor mod (sign of divisor). This difference matters for negative numbers: -17 % 5 = -2 in JavaScript but 3 in Python. This calculator displays both for comparison. Always test edge cases with negative numbers when using modulo.</p>
            <h2>Applications of Modulo</h2>
            <p>Even/odd: n % 2 === 0. Clock arithmetic: (hour + 5) % 12. Hash tables: key % bucketCount (distributes keys). Cryptography: RSA uses modular exponentiation (m^e mod n). Circular arrays: index % array.length. Check digits: ISBN, credit cards (Luhn algorithm). Random number generators: linear congruential method uses mod.</p>
            <h2>Modular Arithmetic Properties</h2>
            <p>Addition: (a + b) mod n = ((a mod n) + (b mod n)) mod n. Multiplication: (a × b) mod n = ((a mod n) × (b mod n)) mod n. Exponentiation: a^b mod n can be computed efficiently via repeated squaring. Division requires the modular inverse: a/b mod n = a × b⁻¹ mod n (where b⁻¹ exists only if gcd(b, n) = 1).</p>
            <h2>Modulo in Cryptography</h2>
            <p>RSA encryption: ciphertext = message^e mod n. Decryption: message = ciphertext^d mod n. The security relies on the difficulty of factoring n (product of two large primes). Diffie-Hellman key exchange: g^a mod p. Elliptic curve cryptography operates over finite fields defined by modular arithmetic. All modern secure communication depends fundamentally on modular arithmetic.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/modulo-calculator" />
          <PopularCalculators exclude="/calculator/modulo-calculator" />
        </div>
      </div>
    </>
  );
};

export default ModuloCalculator;
