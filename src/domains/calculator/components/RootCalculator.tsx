"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ArrowLeftRight } from "lucide-react";

interface RootResult {
  base: number;
  n: number;
  result: number;
  isImaginary: boolean;
  equation: string;
  fractionalExponent: string;
  steps: string[];
}

const calculateRoot = (baseStr: string, nStr: string): RootResult | null => {
  const base = parseFloat(baseStr);
  const n = parseInt(nStr, 10);

  if (isNaN(base) || isNaN(n) || n === 0) return null;

  const steps: string[] = [];
  let result = 0;
  let isImaginary = false;

  steps.push(`Calculate the ${n}${getOrdinalSuffix(n)} root of ${base}.`);

  if (base < 0 && n % 2 === 0) {
    // Even root of a negative number is imaginary
    isImaginary = true;
    // We'll calculate the positive root and append 'i' in the UI
    result = Math.pow(Math.abs(base), 1 / n);
    steps.push(`The base is negative and the root degree (${n}) is even. This results in an imaginary/complex number.`);
    steps.push(`Calculate the root of the absolute value: ${n}√${Math.abs(base)} = ${result.toPrecision(10).replace(/\.?0+$/, '')}`);
    steps.push(`Append 'i' to represent the imaginary unit (√-1).`);
  } else if (base < 0 && n % 2 !== 0) {
    // Odd root of negative number
    result = -Math.pow(Math.abs(base), 1 / n);
    steps.push(`The base is negative and the root degree (${n}) is odd. This results in a real, negative number.`);
    steps.push(`Calculate: -(${n}√${Math.abs(base)}) = ${result.toPrecision(10).replace(/\.?0+$/, '')}`);
  } else {
    // Standard positive root
    result = Math.pow(base, 1 / n);
    steps.push(`Using the fractional exponent rule, this is equivalent to ${base}^(1/${n}).`);
    steps.push(`Result: ${result.toPrecision(10).replace(/\.?0+$/, '')}`);
  }

  // Handle tiny float inaccuracies (e.g. cube root of 27 yielding 3.0000000000000004)
  result = parseFloat(result.toPrecision(12));

  return {
    base,
    n,
    result,
    isImaginary,
    equation: `${n}√${base}`,
    fractionalExponent: `${base}^(1/${n})`,
    steps
  };
};

const getOrdinalSuffix = (i: number) => {
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const RootCalculator = () => {
  const [baseVal, setBaseVal] = useState("125");
  const [nVal, setNVal] = useState("3");
  const [result, setResult] = useState<RootResult | null>(null);

  const calculate = () => {
    setResult(calculateRoot(baseVal, nVal));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setBaseVal("125"); setNVal("3");
    setResult(calculateRoot("125", "3"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "What is a root in math?", answer: "A root is the inverse operation of an exponent. If you know that 5³ (5 cubed) is 125, then the 'cube root' of 125 asks you to work backwards to find what number, multiplied by itself 3 times, equals 125. The answer is 5." },
    { question: "What is a square root vs cube root?", answer: "A square root (n=2) asks what number multiplied by itself once (x²) equals the base. A cube root (n=3) asks what number multiplied by itself twice (x³) equals the base. You can have 4th roots, 5th roots, and so on." },
    { question: "Can you take the root of a negative number?", answer: "It depends on the 'n' value (degree). If 'n' is an odd number (like a cube root), yes. The cube root of -8 is -2, because (-2) × (-2) × (-2) = -8. If 'n' is an even number (like a square root), no real number works, because multiplying two negatives always makes a positive. The result involves 'i' (imaginary numbers)." },
    { question: "What are fractional exponents?", answer: "Taking the n-th root of a number is mathematically identical to raising that number to the power of 1/n. For example, the square root of 16 is exactly the same as calculating 16^(1/2). This is how computers calculate roots behind the scenes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Root Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Root Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col mb-2">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Degree (n)</span>
                <span className="text-xs text-muted-foreground font-normal self-end">e.g. 2 for Square, 3 for Cube</span>
              </label>
              <div className={wrap}><input type="number" value={nVal} onChange={e => setNVal(e.target.value)} className={ci} step="1" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Radicand (Base Number)</span>
                <span className="text-xs text-muted-foreground font-normal self-end">The number inside the root</span>
              </label>
              <div className={wrap}><input type="number" value={baseVal} onChange={e => setBaseVal(e.target.value)} className={ci} step="any" /></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result ? (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-bold text-primary uppercase tracking-wider">Calculated Result</div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xl font-bold text-muted-foreground italic font-mono pr-2 border-r border-border/50">
                      <sup>{result.n}</sup>√<span className="overline decoration-1 underline-offset-[-2px]">{result.base}</span>
                    </span>
                    <span className="text-base font-bold text-muted-foreground font-mono">
                      {result.fractionalExponent}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono break-all leading-tight">
                    {result.result.toString()}
                  </span>
                  {result.isImaginary && (
                    <span className="text-4xl md:text-5xl font-extrabold text-indigo-500 italic ml-1 font-mono">i</span>
                  )}
                </div>

                {result.isImaginary && (
                  <p className="mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded border border-indigo-500/20 inline-block">
                    Complex / Imaginary Result Detected
                  </p>
                )}
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

            </>) : (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Invalid Input</div>
                  <div className="text-base font-medium text-foreground">Please enter valid numbers. The degree (n) cannot be 0.</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Mathematical Roots</h2>
            <p>In mathematics, calculating a <strong>root</strong> is the inverse operation of exponentiation. When you raise a number to a power (like 4³ = 64), you multiply that number by itself repeatedly. When you take the root of a number, you are working backward. The "cube root" of 64 asks the question: <em>What number, multiplied by itself 3 times, equals 64?</em> The answer is 4.</p>

            <h2 className="text-2xl font-bold mb-3">Anatomy of a Root Equation</h2>
            <p>A standard root equation (often called a radical expression) consists of three parts:</p>
            <ul>
              <li><strong>The Radical Symbol (√):</strong> The mathematical symbol indicating a root operation.</li>
              <li><strong>The Radicand:</strong> The number placed inside or under the radical symbol. This is the value you are trying to break down.</li>
              <li><strong>The Degree (Index):</strong> The small number written to the upper left of the radical symbol. It tells you which root you are finding. If no degree is written, it is universally understood to be a square root (degree 2).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Roots and Fractional Exponents</h2>
            <p>As you progress in algebra and calculus, the radical symbol (√) is often replaced with <strong>fractional exponents</strong>. They are mathematically identical but easier to type and manipulate in complex equations. Taking the <em>n</em>-th root of a number <em>x</em> is exactly the same as calculating <code>x^(1/n)</code>.</p>
            <p>For example, the square root of 25 can be written as <code>25^(1/2)</code>. The cube root of 27 can be written as <code>27^(1/3)</code>. This is the exact mathematical method computers and modern calculators use to process roots behind the scenes.</p>

            <h2 className="text-2xl font-bold mb-3">Imaginary Numbers and Negative Roots</h2>
            <p>Can you find the root of a negative number? The answer depends on the degree (n) of the root.</p>
            <p>If the degree is <strong>odd</strong> (like a cube root or 5th root), the answer is yes, and it is a real number. The cube root of -8 is -2, because <code>(-2) × (-2) × (-2) = -8</code>.</p>
            <p>If the degree is <strong>even</strong> (like a square root or 4th root), the answer cannot be a real number. Why? Because multiplying any real number by itself an even number of times always results in a positive number. Therefore, to solve the square root of a negative number, mathematicians created <strong>Imaginary Numbers</strong>, denoted by the letter <em>i</em> (where <em>i</em> = √-1). Our calculator automatically detects this scenario and appends <em>i</em> to your result.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/root-calculator" />
          <PopularCalculators exclude="/calculator/root-calculator" />
        </div>
      </div>
    </>
  );
};
export default RootCalculator;
