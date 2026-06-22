"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Delete } from "lucide-react";

// Helper to determine string mathematical operations using BigInt
const calculateBigNumber = (num1: string, num2: string, operation: string): { result: string, sciNot: string, error: string } => {
  let result = "";
  let sciNot = "";
  let error = "";

  try {
    // BigInt does not support decimals. For a pure "Big Number" calculator, 
    // we handle large integers. Decimals require a specialized arbitrary-precision library (like decimal.js).
    // The prompt is Big Number Calculator, so we focus on massive integers.
    
    // Quick validate
    if (!num1 || !num2) throw new Error("Missing input");
    if (num1.includes('.') || num2.includes('.')) throw new Error("Decimals are not supported in native BigInt operations. Please use whole integers only.");
    
    const a = BigInt(num1);
    const b = BigInt(num2);
    let res: bigint;

    switch (operation) {
      case "+":
        res = a + b;
        break;
      case "-":
        res = a - b;
        break;
      case "*":
        res = a * b;
        break;
      case "/":
        if (b === BigInt(0)) throw new Error("Division by zero");
        res = a / b;
        break;
      case "%":
        if (b === BigInt(0)) throw new Error("Modulo by zero");
        res = a % b;
        break;
      case "^":
        if (b < BigInt(0)) throw new Error("Negative exponent not supported for integers");
        if (b > BigInt(100000)) throw new Error("Exponent too large for browser memory limit.");
        res = a ** b;
        break;
      default:
        throw new Error("Invalid operation");
    }

    result = res.toString();

    // Calculate approximate scientific notation
    if (result.length > 15) {
      const isNeg = result.startsWith('-');
      const absResStr = isNeg ? result.slice(1) : result;
      const exponent = absResStr.length - 1;
      let coefficient = absResStr.slice(0, 5); // take first 5 digits
      // insert decimal
      coefficient = coefficient[0] + "." + coefficient.slice(1);
      sciNot = `${isNeg ? '-' : ''}${coefficient} × 10^${exponent}`;
    } else {
      sciNot = result;
    }

  } catch (err: any) {
    error = err.message || "An unknown error occurred.";
  }

  return { result, sciNot, error };
};

const BigNumberCalculator = () => {
  const [num1, setNum1] = useState("12345678901234567890");
  const [num2, setNum2] = useState("98765432109876543210");
  const [operation, setOperation] = useState("+");
  
  const [result, setResult] = useState<string>("");
  const [sciNot, setSciNot] = useState<string>("");
  const [error, setError] = useState<string>("");

  const calculate = () => {
    const { result: res, sciNot: sci, error: err } = calculateBigNumber(num1, num2, operation);
    setResult(res);
    setSciNot(sci);
    setError(err);
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setNum1("12345678901234567890");
    setNum2("98765432109876543210");
    setOperation("+");
    const res = calculateBigNumber("12345678901234567890", "98765432109876543210", "+");
    setResult(res.result);
    setSciNot(res.sciNot);
    setError(res.error);
  };

  const wrap = "flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full px-3 py-3 text-base bg-transparent outline-none border-none text-foreground resize-y min-h-[60px] font-mono";

  const faqs = [
    { question: "What is a 'Big Number' in computing?", answer: "In standard computer programming (specifically JavaScript), numbers are stored as 64-bit floating-point values. This means they can only maintain perfect integer precision up to 9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER). If you try to do math with numbers larger than this natively, the browser will start rounding the ends of the number and losing data. A 'Big Number' calculator uses specialized arbitrary-precision logic to bypass this limit." },
    { question: "How large of a number can this calculator handle?", answer: "This calculator utilizes modern BigInt functionality, allowing it to handle integers with thousands or even millions of digits, limited only by your browser's available memory. However, for operations like exponents (A^B), we intentionally limit the exponent to 100,000 to prevent your browser from freezing while attempting to render millions of digits on screen." },
    { question: "Why does it say decimals are not supported?", answer: "Native arbitrary-precision in modern browsers (BigInt) is currently restricted strictly to whole integers. Processing decimals to infinite precision requires massive external libraries, which slows down the tool. If you need precise decimal math, use our Standard or Scientific calculators." },
    { question: "What is the Modulo (%) operation?", answer: "Modulo is an arithmetic operation that finds the remainder after division of one number by another. For example, 10 % 3 = 1, because 10 divided by 3 is 3, with 1 left over." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Big Number Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Big Number Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Number A</span>
                <span className="text-xs text-muted-foreground font-normal self-end">Length: {num1.replace(/[^0-9]/g, '').length} digits</span>
              </label>
              <div className={wrap}>
                <textarea value={num1} onChange={e => setNum1(e.target.value.replace(/[^0-9-]/g, ''))} className={ci} placeholder="Enter a massive integer" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Operation</label>
              <div className="flex rounded-md border border-input overflow-hidden h-12 w-full">
                {['+', '-', '*', '/', '%', '^'].map((op) => (
                  <button key={op} type="button" onClick={() => setOperation(op)} className={`flex-1 text-lg font-bold transition-colors border-r last:border-0 border-input ${operation === op ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Number B</span>
                <span className="text-xs text-muted-foreground font-normal self-end">Length: {num2.replace(/[^0-9]/g, '').length} digits</span>
              </label>
              <div className={wrap}>
                <textarea value={num2} onChange={e => setNum2(e.target.value.replace(/[^0-9-]/g, ''))} className={ci} placeholder="Enter another massive integer" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-5 w-5" /> Calculate
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {error ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Calculation Error</div>
                  <div className="text-base font-medium text-foreground">{error}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-bold text-primary uppercase tracking-wider">Exact Result</div>
                  <div className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                    {result.replace(/[^0-9]/g, '').length.toLocaleString()} digits
                  </div>
                </div>
                
                <div className="bg-card border border-border/50 rounded-lg p-4 mt-2 max-h-[300px] overflow-y-auto shadow-inner custom-scrollbar relative">
                  <p className="text-lg md:text-xl font-mono text-foreground break-all leading-relaxed">
                    {result}
                  </p>
                </div>
                
                <button onClick={() => { navigator.clipboard.writeText(result); alert("Result copied to clipboard!"); }} className="mt-3 text-xs font-bold text-primary hover:underline focus:outline-none">
                  Copy Entire Number to Clipboard
                </button>
              </div>

              {result.length > 15 && (
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 border-b border-border/50 pb-2">Scientific Notation (Approximate)</div>
                  <div className="text-2xl font-bold text-foreground font-mono break-all">{sciNot}</div>
                </div>
              )}

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Limit of Normal Calculators</h2>
            <p>If you have ever typed a massive equation into a standard pocket calculator or your phone app, you've likely seen the screen output an error or revert to E-notation (like <code>4.5e12</code>). This happens because standard computational hardware allocates a fixed amount of memory (typically 64 bits) to store a number. Once a number exceeds roughly 15 digits (specifically 9,007,199,254,740,991 in JavaScript), the computer can no longer guarantee the precision of the integers at the end of the number. It will start rounding them off to zeroes to save memory.</p>
            
            <h2>How the Big Number Calculator Works</h2>
            <p>Our <strong>Big Number Calculator</strong> bypasses these hardware limitations by using arbitrary-precision arithmetic (specifically the modern BigInt data type). Instead of storing the number in a fixed-size hardware register, it stores the number dynamically in the system's RAM, stringing together memory blocks as the number grows. This allows the calculator to maintain absolute, perfect precision down to the final digit, even if the result is thousands of digits long.</p>

            <h2>Supported Operations</h2>
            <ul>
              <li><strong>Addition (+) and Subtraction (-):</strong> Add or subtract numbers of any length with perfect precision.</li>
              <li><strong>Multiplication (×):</strong> Rapidly multiply massive matrices of integers.</li>
              <li><strong>Division (÷):</strong> Returns the whole number quotient (no decimals/remainders) of dividing A by B.</li>
              <li><strong>Modulo (%):</strong> Returns the exact integer remainder after dividing A by B. Highly useful in cryptography.</li>
              <li><strong>Exponentiation (^):</strong> Raises A to the power of B. <em>Note: To protect your browser from freezing due to lack of RAM, we restrict the exponent B to a maximum of 100,000.</em></li>
            </ul>

            <h2>Use Cases for Arbitrary-Precision Math</h2>
            <p>While the average person rarely needs to calculate beyond trillions (12 digits), big number math is the backbone of modern cybersecurity. The encryption protecting your bank accounts, emails, and internet traffic (like RSA encryption) relies on generating and factoring prime numbers that are hundreds of digits long. Cryptographers use arbitrary-precision calculators constantly to verify these massive prime factoring algorithms.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/big-number-calculator" />
          <PopularCalculators exclude="/calculator/big-number-calculator" />
        </div>
      </div>
    </>
  );
};
export default BigNumberCalculator;
