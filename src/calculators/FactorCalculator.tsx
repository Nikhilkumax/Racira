"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface FactorResult {
  original: number;
  factors: number[];
  factorPairs: [number, number][];
  isPrime: boolean;
  isError: boolean;
  errorMsg?: string;
}

const calculateFactors = (numStr: string): FactorResult | null => {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return null;

  if (num < 1 || num > 10000000000) {
    return {
      original: num,
      factors: [],
      factorPairs: [],
      isPrime: false,
      isError: true,
      errorMsg: "Please enter a positive integer between 1 and 10,000,000,000."
    };
  }

  const factors: number[] = [];
  const factorPairs: [number, number][] = [];

  // We loop up to the square root of the number to find factors efficiently
  const limit = Math.sqrt(num);
  for (let i = 1; i <= limit; i++) {
    if (num % i === 0) {
      const pair = num / i;
      factors.push(i);
      if (i !== pair) {
        factors.push(pair);
      }
      factorPairs.push([i, pair]);
    }
  }

  // Sort factors in ascending order
  factors.sort((a, b) => a - b);

  // A prime number has exactly 2 factors: 1 and itself (and must be > 1)
  const isPrime = factors.length === 2 && num > 1;

  return {
    original: num,
    factors,
    factorPairs,
    isPrime,
    isError: false
  };
};

const FactorCalculator = () => {
  const [inputVal, setInputVal] = useState("144");
  const [result, setResult] = useState<FactorResult | null>(null);

  const calculate = () => {
    setResult(calculateFactors(inputVal));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setInputVal("144");
    setResult(calculateFactors("144"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "What is a factor in math?", answer: "A factor is a whole number that divides into another whole number exactly, without leaving a remainder. For example, 3 is a factor of 12 because 12 divided by 3 equals exactly 4." },
    { question: "What are factor pairs?", answer: "Factor pairs are any two numbers that, when multiplied together, produce the original number. For example, the factor pairs of 12 are (1, 12), (2, 6), and (3, 4)." },
    { question: "How can I tell if a number is prime?", answer: "A prime number is a number greater than 1 that has exactly two factors: 1 and itself. If this calculator outputs exactly two factors for your number, it will automatically flag it as a Prime Number." },
    { question: "Is this the same as prime factorization?", answer: "No. Prime factorization breaks a number down exclusively into prime numbers that multiply together to make the original (e.g., 12 = 2 × 2 × 3). This factor calculator simply lists all possible integers (both prime and composite) that divide evenly into the number." },
    { question: "Are negative numbers factors?", answer: "Technically, yes. In pure mathematics, if 3 and 4 are factors of 12, then -3 and -4 are also factors, because (-3) × (-4) = 12. However, in basic arithmetic and schooling contexts, 'factors' typically refers exclusively to positive integers, which is what this calculator displays." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Factor Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Factor Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Enter Number</label>
              <div className={wrap}><input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} className={ci} min="1" max="10000000000" step="1" placeholder="e.g. 144" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Enter an integer up to 10 billion.</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className={`border-l-4 rounded-lg p-6 ${result.isPrime ? 'bg-emerald-500/10 border-emerald-500' : 'bg-primary/10 border-primary'}`}>
                <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${result.isPrime ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                  {result.isPrime ? 'Prime Number Detected' : `All Factors of ${result.original}`}
                </div>
                
                <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight font-mono break-all leading-tight">
                  {result.factors.length} <span className="text-2xl text-muted-foreground">factors found</span>
                </div>

                {result.isPrime && (
                  <p className="mt-3 text-base font-medium text-emerald-700 dark:text-emerald-400">
                    {result.original} is a prime number. Its only factors are 1 and itself.
                  </p>
                )}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Complete Factor List</h3>
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 max-h-[300px] overflow-y-auto shadow-inner custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {result.factors.map((factor, idx) => (
                      <span key={idx} className="bg-background px-3 py-1.5 rounded-md border border-border font-mono text-base font-bold text-foreground inline-block">
                        {factor.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Factor Pairs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
                  {result.factorPairs.map((pair, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-secondary/20 px-3 py-2 rounded border border-border/50">
                      <span className="font-mono font-medium text-foreground">{pair[0].toLocaleString()}</span>
                      <span className="text-muted-foreground text-xs mx-1">×</span>
                      <span className="font-mono font-medium text-foreground">{pair[1].toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Are Factors?</h2>
            <p>In mathematics, <strong>factors</strong> are the numbers that you can multiply together to get another number. Put differently, a factor is an integer that divides evenly into a larger integer without leaving a remainder. For example, 5 is a factor of 20 because 20 divided by 5 equals exactly 4.</p>

            <h2>Understanding Factor Pairs</h2>
            <p>Because factors are determined through multiplication, they naturally come in sets of two, known as <strong>factor pairs</strong>. Every time you find one factor of a number, you automatically find another. If you know that 3 is a factor of 12, then the corresponding pair is 4 (because 3 × 4 = 12).</p>
            <p>A notable exception to visual pairs occurs with perfect squares. For the number 16, the factor pairs are (1, 16), (2, 8), and (4, 4). When creating the final list of unique factors, the number 4 is only written once: 1, 2, 4, 8, 16.</p>

            <h2>How Do You Find the Factors of a Number?</h2>
            <p>When finding factors manually, the most efficient method is to test division starting from 1 and working upwards, creating your factor pairs as you go. You can stop testing once you reach the square root of your target number, because any factors larger than the square root would have already been discovered as the "pair" to a smaller number.</p>
            <ul>
              <li><strong>Find the factors of 36:</strong></li>
              <li>1 × 36 = 36</li>
              <li>2 × 18 = 36</li>
              <li>3 × 12 = 36</li>
              <li>4 × 9 = 36</li>
              <li>(5 does not divide evenly)</li>
              <li>6 × 6 = 36. Since we reached a number multiplying by itself (the square root), we can stop. The factors are 1, 2, 3, 4, 6, 9, 12, 18, and 36.</li>
            </ul>

            <h2>Factors vs. Multiples</h2>
            <p>A common point of confusion for students is the difference between factors and multiples. <strong>Factors</strong> are the numbers that fit <em>into</em> a target number (they are smaller than or equal to the target). <strong>Multiples</strong> are the numbers you get when you multiply the target number by 1, 2, 3, etc. (they are larger than or equal to the target). The factors of 8 are 1, 2, 4, and 8. The multiples of 8 are 8, 16, 24, 32, etc.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/factor-calculator" />
          <PopularCalculators exclude="/calculator/factor-calculator" />
        </div>
      </div>
    </>
  );
};
export default FactorCalculator;
