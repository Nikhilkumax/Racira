"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface GCFResult {
  numbers: number[];
  gcd: number;
  steps: string[];
  isError: boolean;
  errorMsg?: string;
  primeFactorsMap: Record<number, string>;
}

const calculateGCF = (numbersStr: string): GCFResult | null => {
  const numStrs = numbersStr.split(/[\s,]+/).filter(s => s.trim() !== "");
  const numbers: number[] = [];
  
  for (const s of numStrs) {
    const num = parseInt(s, 10);
    if (isNaN(num) || num <= 0) {
      return { numbers: [], gcd: 0, steps: [], isError: true, errorMsg: "Please enter only positive whole numbers.", primeFactorsMap: {} };
    }
    numbers.push(num);
  }

  if (numbers.length < 2) {
    return { numbers, gcd: 0, steps: [], isError: true, errorMsg: "Please enter at least two numbers to find the GCF.", primeFactorsMap: {} };
  }
  if (numbers.length > 15) {
    return { numbers, gcd: 0, steps: [], isError: true, errorMsg: "Maximum of 15 numbers allowed to prevent browser freezing.", primeFactorsMap: {} };
  }

  const steps: string[] = [];
  const primeFactorsMap: Record<number, string> = {};

  // Prime factorization helper for display
  const getPrimeFactorizationString = (n: number) => {
    if (n === 1) return "1";
    let temp = n;
    const factors: number[] = [];
    while (temp % 2 === 0) { factors.push(2); temp /= 2; }
    for (let i = 3; i <= Math.sqrt(temp); i += 2) {
      while (temp % i === 0) { factors.push(i); temp /= i; }
    }
    if (temp > 2) factors.push(temp);
    return factors.join(" × ");
  };

  numbers.forEach(n => {
    primeFactorsMap[n] = getPrimeFactorizationString(n);
  });

  // Euclidean algorithm for GCD
  const getGCD = (a: number, b: number): number => {
    let stepCount = 1;
    let currentA = a;
    let currentB = b;
    // We only log the Euclidean steps if it's just 2 numbers to avoid massive clutter
    const logSteps = numbers.length === 2;
    
    while (currentB !== 0) {
      const remainder = currentA % currentB;
      const quotient = Math.floor(currentA / currentB);
      if (logSteps) {
        steps.push(`Step ${stepCount}: ${currentA} = ${currentB} × ${quotient} + ${remainder}`);
      }
      currentA = currentB;
      currentB = remainder;
      stepCount++;
    }
    if (logSteps) {
      steps.push(`Since the remainder is now 0, the last non-zero remainder (${currentA}) is the GCF.`);
    }
    return currentA;
  };

  let currentGCD = numbers[0];

  if (numbers.length === 2) {
    steps.push(`Using the Euclidean Algorithm for ${numbers[0]} and ${numbers[1]}:`);
    currentGCD = getGCD(numbers[0], numbers[1]);
  } else {
    steps.push(`Because there are more than two numbers, we calculate the GCF sequentially.`);
    for (let i = 1; i < numbers.length; i++) {
      const prevGCD = currentGCD;
      currentGCD = getGCD(currentGCD, numbers[i]);
      steps.push(`GCF of (${prevGCD}, ${numbers[i]}) = ${currentGCD}.`);
    }
  }

  return {
    numbers,
    gcd: currentGCD,
    steps,
    isError: false,
    primeFactorsMap
  };
};

const GcfCalculator = () => {
  const [inputVal, setInputVal] = useState("48, 180");
  const [result, setResult] = useState<GCFResult | null>(null);

  const calculate = () => {
    setResult(calculateGCF(inputVal));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setInputVal("48, 180");
    setResult(calculateGCF("48, 180"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full px-3 py-3 text-base bg-transparent outline-none border-none text-foreground resize-y min-h-[60px] font-mono";

  const faqs = [
    { question: "What is the Greatest Common Factor (GCF)?", answer: "The Greatest Common Factor (GCF), also known as the Greatest Common Divisor (GCD) or Highest Common Factor (HCF), is the largest positive integer that divides two or more numbers evenly without leaving a remainder." },
    { question: "Why is the GCF important?", answer: "The most common practical use of the GCF is simplifying (or reducing) fractions. To simplify a fraction to its lowest terms, you find the GCF of the numerator (top number) and denominator (bottom number), and divide both by that GCF." },
    { question: "Is GCF the same as GCD and HCF?", answer: "Yes, they all refer to the exact same mathematical concept. GCF (Greatest Common Factor), GCD (Greatest Common Divisor), and HCF (Highest Common Factor) are used interchangeably depending on regional curriculum." },
    { question: "What is the Euclidean Algorithm?", answer: "The Euclidean Algorithm is a fast and efficient method for finding the GCF of two numbers, discovered by the ancient Greek mathematician Euclid. Instead of factoring the numbers, it involves repeatedly dividing the larger number by the smaller number and tracking the remainders until the remainder is zero." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "GCF Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GCF Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Enter Numbers</span>
              </label>
              <div className={wrap}>
                <textarea value={inputVal} onChange={e => setInputVal(e.target.value.replace(/[^0-9,\s]/g, ''))} className={ci} placeholder="e.g. 48, 180" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Separate numbers with commas or spaces (max 15 numbers).</p>
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
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 text-center">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Greatest Common Factor</div>
                <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono break-all leading-tight">
                  {result.gcd.toLocaleString()}
                </div>
                <div className="mt-3 text-sm text-muted-foreground font-medium">
                  GCF({result.numbers.join(", ")})
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Calculation Logic (Euclidean)</h3>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground marker:text-primary marker:font-bold font-mono text-sm sm:text-base">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      <span className={idx === result.steps.length - 1 ? "font-bold text-foreground" : "text-foreground"}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Reference: Prime Factorization</h3>
                <div className="space-y-3">
                  {Object.entries(result.primeFactorsMap).map(([numStr, factorization], idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-md bg-secondary/30 border border-border/50 gap-2">
                      <span className="font-bold text-foreground text-lg w-20 shrink-0">{numStr}</span>
                      <span className="text-muted-foreground font-mono text-base break-all text-right w-full">{factorization}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  The GCF is the product of all prime factors that are common to every number listed above.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Greatest Common Factor (GCF)</h2>
            <p>The <strong>Greatest Common Factor (GCF)</strong>, which is entirely synonymous with the Greatest Common Divisor (GCD) and Highest Common Factor (HCF), is the largest integer that divides two or more numbers perfectly, leaving a remainder of zero. For example, the factors of 12 are 1, 2, 3, 4, 6, and 12. The factors of 16 are 1, 2, 4, 8, and 16. The common factors they share are 1, 2, and 4. The <em>greatest</em> of these is 4, making 4 the GCF.</p>

            <h2>Methods for Finding the GCF</h2>
            <p>While listing out all the factors manually works for small numbers, it becomes tedious and error-prone for larger numbers like 180 and 48. Mathematicians use two primary methods to find the GCF efficiently.</p>

            <h3>1. The Prime Factorization Method</h3>
            <p>This method requires breaking each number down into its prime building blocks. Once you have the prime factors of both numbers, you identify the prime numbers they have in common and multiply them together.</p>
            <ul>
              <li><strong>Find the GCF of 48 and 180:</strong></li>
              <li>Prime factors of 48: <code>2 × 2 × 2 × 2 × 3</code> (or 2⁴ × 3¹)</li>
              <li>Prime factors of 180: <code>2 × 2 × 3 × 3 × 5</code> (or 2² × 3² × 5¹)</li>
              <li>The common prime factors are two 2s and one 3.</li>
              <li>Multiply them: <code>2 × 2 × 3 = 12</code>. The GCF is 12.</li>
            </ul>

            <h3>2. The Euclidean Algorithm</h3>
            <p>Discovered over 2,000 years ago by the Greek mathematician Euclid, this algorithm is incredibly fast and is exactly how computer programs (including this calculator) find the GCF. It avoids factoring altogether and relies on division with remainders.</p>
            <ul>
              <li><strong>Find the GCF of 180 and 48:</strong></li>
              <li>Divide 180 by 48. The quotient is 3, with a remainder of 36. (180 = 48 × 3 + 36)</li>
              <li>Now, divide the previous divisor (48) by the previous remainder (36). The quotient is 1, with a remainder of 12. (48 = 36 × 1 + 12)</li>
              <li>Divide 36 by 12. The quotient is 3, with a remainder of 0. (36 = 12 × 3 + 0)</li>
              <li>Because the remainder is 0, the last non-zero remainder (12) is the GCF.</li>
            </ul>

            <h2>Why Do We Need the GCF?</h2>
            <p>In applied mathematics, the GCF is the crucial tool for <strong>simplifying fractions</strong>. If you have the fraction 48/180 and you need to reduce it to its lowest terms, finding the GCF (12) allows you to divide both the top and bottom number by 12 in a single step, instantly arriving at the simplified fraction 4/15.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gcf-calculator" />
          <PopularCalculators exclude="/calculator/gcf-calculator" />
        </div>
      </div>
    </>
  );
};
export default GcfCalculator;
