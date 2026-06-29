"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface LCMResult {
  numbers: number[];
  lcm: number;
  gcd: number; // useful for formulas
  steps: string[];
  isError: boolean;
  errorMsg?: string;
}

const calculateLCMAndGCD = (numbersStr: string): LCMResult | null => {
  // Parse input string into an array of integers
  const numStrs = numbersStr.split(/[\s,]+/).filter(s => s.trim() !== "");
  const numbers: number[] = [];
  
  for (const s of numStrs) {
    const num = parseInt(s, 10);
    if (isNaN(num) || num <= 0) {
      return { numbers: [], lcm: 0, gcd: 0, steps: [], isError: true, errorMsg: "Please enter only positive whole numbers." };
    }
    numbers.push(num);
  }

  if (numbers.length < 2) {
    return { numbers, lcm: 0, gcd: 0, steps: [], isError: true, errorMsg: "Please enter at least two numbers to find the LCM." };
  }
  if (numbers.length > 15) {
    return { numbers, lcm: 0, gcd: 0, steps: [], isError: true, errorMsg: "Maximum of 15 numbers allowed to prevent browser freezing." };
  }

  const steps: string[] = [];
  
  // Helper for GCD using Euclidean algorithm
  const getGCD = (a: number, b: number): number => {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  // Helper for LCM
  const getLCM = (a: number, b: number): number => {
    // Formula: LCM(a, b) = |a * b| / GCD(a, b)
    if (a === 0 || b === 0) return 0;
    return (a * b) / getGCD(a, b);
  };

  steps.push(`Numbers entered: ${numbers.join(", ")}`);

  let currentLCM = numbers[0];
  let currentGCD = numbers[0];

  if (numbers.length === 2) {
    currentGCD = getGCD(numbers[0], numbers[1]);
    currentLCM = getLCM(numbers[0], numbers[1]);
    steps.push(`Step 1: Find the Greatest Common Divisor (GCD) of ${numbers[0]} and ${numbers[1]}, which is ${currentGCD}.`);
    steps.push(`Step 2: Use the formula LCM(a,b) = (a × b) / GCD. (${numbers[0]} × ${numbers[1]}) / ${currentGCD} = ${currentLCM}.`);
  } else {
    // For more than 2 numbers, LCM is associative: LCM(a, b, c) = LCM(LCM(a, b), c)
    steps.push(`Because there are more than two numbers, we calculate the LCM sequentially.`);
    for (let i = 1; i < numbers.length; i++) {
      const prevLCM = currentLCM;
      currentGCD = getGCD(currentGCD, numbers[i]); // Overall GCD
      currentLCM = getLCM(currentLCM, numbers[i]);
      steps.push(`LCM of (${prevLCM}, ${numbers[i]}) = ${currentLCM}.`);
    }
  }

  return {
    numbers,
    lcm: currentLCM,
    gcd: currentGCD,
    steps,
    isError: false
  };
};

const LcmCalculator = () => {
  const [inputVal, setInputVal] = useState("12, 15, 20");
  const [result, setResult] = useState<LCMResult | null>(null);

  const calculate = () => {
    setResult(calculateLCMAndGCD(inputVal));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setInputVal("12, 15, 20");
    setResult(calculateLCMAndGCD("12, 15, 20"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full px-3 py-3 text-base bg-transparent outline-none border-none text-foreground resize-y min-h-[60px] font-mono";

  const faqs = [
    { question: "What is the Least Common Multiple (LCM)?", answer: "The Least Common Multiple (LCM) of two or more numbers is the smallest positive integer that is perfectly divisible by each of the given numbers. For example, the LCM of 4 and 6 is 12, because 12 is the smallest number that both 4 and 6 divide into evenly." },
    { question: "Why is the LCM important?", answer: "In everyday math, the LCM is crucial for working with fractions. Specifically, when you want to add or subtract fractions with different denominators (bottom numbers), you must first find their Least Common Denominator (LCD). The LCD is exactly the same mathematical concept as the LCM." },
    { question: "What is the relationship between LCM and GCD?", answer: "The LCM and the Greatest Common Divisor (GCD) are intimately connected by a simple mathematical formula for any two numbers (a and b): LCM(a,b) = (a × b) ÷ GCD(a,b). Our calculator uses this exact formula behind the scenes for maximum efficiency." },
    { question: "How does the calculator handle more than two numbers?", answer: "The LCM is an associative operation. This means if you want to find the LCM of 12, 15, and 20, the calculator first finds the LCM of 12 and 15 (which is 60). It then takes that result (60) and finds the LCM of 60 and the next number, 20. The LCM of 60 and 20 is 60, which is your final answer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "LCM Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">LCM Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Enter Numbers</span>
              </label>
              <div className={wrap}>
                <textarea value={inputVal} onChange={e => setInputVal(e.target.value.replace(/[^0-9,\s]/g, ''))} className={ci} placeholder="e.g. 12, 15, 20" />
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
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Least Common Multiple</div>
                <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono break-all leading-tight">
                  {result.lcm.toLocaleString()}
                </div>
                <div className="mt-3 text-sm text-muted-foreground font-medium">
                  LCM({result.numbers.join(", ")})
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Greatest Common Divisor</div>
                  <div className="text-3xl font-extrabold text-foreground font-mono">{result.gcd.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">GCD of the same numbers</div>
                </div>
                
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Numbers</div>
                  <div className="text-3xl font-extrabold text-foreground">{result.numbers.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Analyzed successfully</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Calculation Logic</h3>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground marker:text-primary marker:font-bold">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      <span className={idx === result.steps.length - 1 ? "font-bold text-foreground" : "text-foreground"}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Least Common Multiple (LCM)</h2>
            <p>The <strong>Least Common Multiple (LCM)</strong>, sometimes referred to as the Lowest Common Multiple, is a foundational mathematical concept used heavily when working with fractions. By definition, the LCM of two integers (let's say <em>a</em> and <em>b</em>) is the smallest positive integer that is perfectly divisible by both <em>a</em> and <em>b</em> without leaving a remainder.</p>

            <h2>Methods for Finding the LCM</h2>
            <p>There are three primary methods for finding the LCM. While our calculator uses the fastest computational method behind the scenes, understanding the manual methods is critical for math students.</p>

            <h3>Method 1: Listing the Multiples (Best for small numbers)</h3>
            <p>This is the most straightforward visual method. You simply list the multiples of each number until you find the first match.</p>
            <ul>
              <li><strong>Find the LCM of 4 and 6:</strong></li>
              <li>Multiples of 4: 4, 8, <strong>12</strong>, 16, 20, 24...</li>
              <li>Multiples of 6: 6, <strong>12</strong>, 18, 24, 30...</li>
              <li>The first number that appears in both lists is <strong>12</strong>. Therefore, the LCM is 12.</li>
            </ul>

            <h3>Method 2: Prime Factorization</h3>
            <p>This method breaks each number down into its prime building blocks. You then multiply each unique prime factor by the highest power it appears in either number.</p>
            <ul>
              <li><strong>Find the LCM of 12 and 15:</strong></li>
              <li>Prime factors of 12: 2² × 3¹</li>
              <li>Prime factors of 15: 3¹ × 5¹</li>
              <li>Take the highest powers of all unique primes: 2², 3¹, 5¹.</li>
              <li>Multiply them together: 4 × 3 × 5 = <strong>60</strong>.</li>
            </ul>

            <h3>Method 3: The GCD Formula (How this calculator works)</h3>
            <p>Computers calculate the LCM extremely fast using the Greatest Common Divisor (GCD) formula. The relationship between LCM and GCD is absolute: <code>LCM(a,b) = (a × b) ÷ GCD(a,b)</code>. The computer uses the Euclidean Algorithm to find the GCD almost instantly, and then applies this formula to yield the LCM without ever having to "list out" multiples or prime factors.</p>

            <h2>The LCM and Fractions</h2>
            <p>You cannot add or subtract fractions unless their bottom numbers (denominators) match. The fastest way to make them match without inflating the numbers to unmanageable sizes is to find their Least Common Denominator (LCD). The LCD is exactly the same thing as the LCM of the bottom numbers.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lcm-calculator" />
          <PopularCalculators exclude="/calculator/lcm-calculator" />
        </div>
      </div>
    </>
  );
};
export default LcmCalculator;
