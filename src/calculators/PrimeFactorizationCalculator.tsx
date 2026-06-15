"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface FactorizationResult {
  original: number;
  factors: number[];
  exponentsForm: { base: number; exp: number }[];
  equation: string;
  isCustomError: boolean;
  errorMsg?: string;
  isPrime: boolean;
}

const getPrimeFactorization = (numStr: string): FactorizationResult | null => {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return null;

  if (num < 2 || num > 9000000000000000) {
    return {
      original: num,
      factors: [],
      exponentsForm: [],
      equation: "",
      isCustomError: true,
      errorMsg: "Please enter a positive integer between 2 and 9,000,000,000,000,000.",
      isPrime: false
    };
  }

  // We need to use BigInt for large numbers to avoid float precision issues during math, 
  // though for up to 9 quadrillion (Number.MAX_SAFE_INTEGER is 9 quadrillion) normal numbers work fine.
  // We'll stick to standard JS numbers since we capped at 9 quadrillion (9,000,000,000,000,000).

  let n = num;
  const factors: number[] = [];

  // Divide by 2
  while (n % 2 === 0) {
    factors.push(2);
    n = n / 2;
  }

  // Divide by odd numbers
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i === 0) {
      factors.push(i);
      n = n / i;
    }
  }

  // If n is still greater than 2, then n itself is a prime
  if (n > 2) {
    factors.push(n);
  }

  // Group into exponents form
  const factorCounts: Record<number, number> = {};
  for (const f of factors) {
    factorCounts[f] = (factorCounts[f] || 0) + 1;
  }

  const exponentsForm = Object.entries(factorCounts).map(([baseStr, exp]) => ({
    base: parseInt(baseStr, 10),
    exp
  }));

  // Build equation strings
  const expandedEq = factors.join(" × ");
  
  const expEqArray = exponentsForm.map(item => {
    if (item.exp === 1) return `${item.base}`;
    return `${item.base}^${item.exp}`;
  });
  const expEq = expEqArray.join(" × ");

  const isPrime = factors.length === 1 && factors[0] === num;

  return {
    original: num,
    factors,
    exponentsForm,
    equation: isPrime ? `${num} (Prime Number)` : expEq,
    isCustomError: false,
    isPrime
  };
};

const PrimeFactorizationCalculator = () => {
  const [inputVal, setInputVal] = useState("84");
  const [result, setResult] = useState<FactorizationResult | null>(null);

  const calculate = () => {
    setResult(getPrimeFactorization(inputVal));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setInputVal("84");
    setResult(getPrimeFactorization("84"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "What is a prime number?", answer: "A prime number is a whole number greater than 1 whose only divisors are 1 and itself. Examples include 2, 3, 5, 7, 11, and 13. The number 2 is the only even prime number." },
    { question: "What is prime factorization?", answer: "Prime factorization is the process of breaking down a composite number into a series of prime numbers that, when multiplied together, equal the original number. It is essentially finding the 'building blocks' of that number." },
    { question: "Is there more than one prime factorization for a number?", answer: "No. According to the Fundamental Theorem of Arithmetic, every integer greater than 1 has a unique prime factorization. No matter how you break the number down, you will always end up with the exact same set of prime factors." },
    { question: "Why do we use exponential form?", answer: "Exponential form is a shorthand way to write repeated prime factors. Instead of writing out 2 × 2 × 2 × 3 × 3, it is much cleaner and easier to read as 2³ × 3²." },
    { question: "How large of a number can this calculator factor?", answer: "This calculator can quickly factor numbers up to 9 Quadrillion (9,000,000,000,000,000). Numbers larger than this exceed standard browser integer limits and begin losing mathematical precision." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Prime Factorization Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Prime Factorization Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground flex flex-col gap-2 mb-2">
              <p>Enter any integer between 2 and 9,000,000,000,000,000 to find its unique set of prime factors.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Enter Number</label>
              <div className={wrap}><input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} className={ci} min="2" max="9000000000000000" step="1" placeholder="e.g. 84" /></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-5 w-5" /> Factorize
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isCustomError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className={`border-l-4 rounded-lg p-6 ${result.isPrime ? 'bg-emerald-500/10 border-emerald-500' : 'bg-primary/10 border-primary'}`}>
                <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${result.isPrime ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                  {result.isPrime ? 'Prime Number Detected' : 'Prime Factorization (Exponential)'}
                </div>
                
                {result.isPrime ? (
                  <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-mono break-all leading-tight">
                    {result.original}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-2 text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.exponentsForm.map((item, idx) => (
                      <span key={idx} className="flex items-start">
                        {item.base}
                        {item.exp > 1 && <sup className="text-xl md:text-2xl mt-1 text-primary">{item.exp}</sup>}
                        {idx < result.exponentsForm.length - 1 && <span className="mx-2 text-muted-foreground">×</span>}
                      </span>
                    ))}
                  </div>
                )}
                
                {result.isPrime && (
                  <p className="mt-4 text-base font-medium text-emerald-700 dark:text-emerald-400">
                    {result.original} has no prime factors other than itself because it is already a prime number.
                  </p>
                )}
              </div>

              {!result.isPrime && (
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 border-b border-border/50 pb-2">Expanded Form (Multiplication)</div>
                  <div className="text-xl font-bold text-foreground font-mono break-all leading-relaxed">
                    {result.factors.join(" × ")}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Prime Factors</div>
                  <div className="text-3xl font-extrabold text-foreground">{result.factors.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">(Including duplicates)</div>
                </div>
                
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Distinct Prime Bases</div>
                  <div className="text-3xl font-extrabold text-foreground">{result.exponentsForm.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">(Unique numbers)</div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What is Prime Factorization?</h2>
            <p><strong>Prime Factorization</strong> is the mathematical process of breaking down a composite number into a series of prime numbers that, when multiplied together, equal the original composite number. You can think of prime numbers as the fundamental "building blocks" of all other numbers in mathematics.</p>
            <p>For example, the number 12 is a composite number. It can be factored into 3 × 4. However, 4 is not a prime number, so we must break it down further into 2 × 2. Therefore, the complete prime factorization of 12 is <strong>2 × 2 × 3</strong>.</p>

            <h2>The Fundamental Theorem of Arithmetic</h2>
            <p>Why do we care about prime factorization? It is governed by one of the most important theorems in mathematics: The Fundamental Theorem of Arithmetic. This theorem states that every integer greater than 1 either is a prime number itself, or can be represented as the product of prime numbers. More importantly, this representation is <strong>100% unique</strong> to that number (ignoring the order of the factors). Like a fingerprint, no two different composite numbers share the exact same prime factorization.</p>

            <h2>Expanded vs. Exponential Form</h2>
            <p>When factoring larger numbers, you often end up with the same prime number repeated multiple times. For instance, the expanded prime factorization of 72 is <code>2 × 2 × 2 × 3 × 3</code>. To make this easier to read and write, mathematicians use <strong>exponential form</strong>. We group the identical numbers and raise them to the power of their count. Thus, the exponential form of 72 is written cleanly as <code>2³ × 3²</code>.</p>

            <h2>Real-World Applications</h2>
            <p>While prime factoring might seem like a purely academic exercise done in middle school math classes, it is actually the foundation of modern cybersecurity. The encryption that protects your bank account, your private text messages, and all secure internet traffic (such as the RSA algorithm) relies heavily on prime factorization. These systems multiply two incredibly massive prime numbers together to create a public "key". Hackers cannot crack the code without finding the original two prime numbers, and currently, there is no known algorithm that can prime-factor a 600-digit number fast enough to be useful to a hacker—even using supercomputers.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/prime-factorization-calculator" />
          <PopularCalculators exclude="/calculator/prime-factorization-calculator" />
        </div>
      </div>
    </>
  );
};
export default PrimeFactorizationCalculator;
