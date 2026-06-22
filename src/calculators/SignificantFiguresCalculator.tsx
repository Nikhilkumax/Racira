"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface SigFigResult {
  original: string;
  count: number;
  scientificNotation: string;
  rulesApplied: string[];
}

const countSignificantFigures = (numStr: string): SigFigResult | null => {
  const cleanStr = numStr.trim().toLowerCase();
  
  // Basic validation
  if (!cleanStr || cleanStr === "." || cleanStr === "-") return null;
  // Make sure it's a valid number format (allow scientific notation e.g., 1.23e4)
  if (isNaN(Number(cleanStr))) return null;

  const rulesApplied: string[] = [];
  let sigFigCount = 0;
  let sciNot = "";

  // Handle scientific notation directly
  if (cleanStr.includes('e')) {
    const [coefficient, exponent] = cleanStr.split('e');
    const coeffNum = parseFloat(coefficient);
    
    // For scientific notation, all digits in the coefficient are significant
    const coeffStr = coefficient.replace(/^-/, '').replace('.', '');
    sigFigCount = coeffStr.length;
    
    rulesApplied.push("Number is in scientific notation.");
    rulesApplied.push("All digits in the coefficient (the number before 'e') are considered significant.");
    
    sciNot = `${coeffNum} × 10^${exponent}`;
    
    return {
      original: numStr,
      count: sigFigCount,
      scientificNotation: sciNot,
      rulesApplied
    };
  }

  // Handle normal numbers
  const isNegative = cleanStr.startsWith('-');
  const absStr = isNegative ? cleanStr.slice(1) : cleanStr;
  const hasDecimal = absStr.includes('.');
  
  const digitsOnly = absStr.replace('.', '');
  
  // Check for all zeros
  if (/^0+$/.test(digitsOnly)) {
    return {
      original: numStr,
      count: 0,
      scientificNotation: "0",
      rulesApplied: ["Zero holds no significant figures unless specifically indicated by context."]
    };
  }

  rulesApplied.push("Non-zero digits are always significant.");

  if (hasDecimal) {
    rulesApplied.push("Number contains a decimal point.");
    // In a decimal number, leading zeros are NOT significant
    // Trailing zeros ARE significant
    
    // Find the first non-zero digit
    let firstNonZeroIndex = -1;
    for (let i = 0; i < absStr.length; i++) {
      if (absStr[i] !== '0' && absStr[i] !== '.') {
        firstNonZeroIndex = i;
        break;
      }
    }
    
    if (firstNonZeroIndex > 0) {
      rulesApplied.push("Leading zeros (zeros to the left of the first non-zero digit) are NOT significant. They are just placeholders.");
    }

    // Count significant digits: from the first non-zero digit to the end
    // excluding the decimal point itself
    let sigDigits = "";
    for (let i = firstNonZeroIndex; i < absStr.length; i++) {
      if (absStr[i] !== '.') {
        sigDigits += absStr[i];
      }
    }
    
    sigFigCount = sigDigits.length;

    // Check for trailing zeros
    if (absStr.endsWith('0')) {
      rulesApplied.push("Trailing zeros to the right of the decimal point ARE significant because they indicate precision.");
    }

    // Check for captive zeros
    if (/0[1-9]/.test(sigDigits.slice(1))) { // Rough check if there are zeros between non-zeros
      rulesApplied.push("Captive zeros (zeros between non-zero digits) are always significant.");
    }

  } else {
    rulesApplied.push("Number does NOT contain a decimal point.");
    // No decimal point
    // Leading zeros are not significant (e.g., 0012)
    // Trailing zeros are generally NOT significant unless specified (we assume not significant)
    
    let firstNonZero = -1;
    let lastNonZero = -1;
    
    for (let i = 0; i < absStr.length; i++) {
      if (absStr[i] !== '0') {
        if (firstNonZero === -1) firstNonZero = i;
        lastNonZero = i;
      }
    }

    if (firstNonZero > 0) {
      rulesApplied.push("Leading zeros are NOT significant.");
    }

    if (lastNonZero < absStr.length - 1) {
      rulesApplied.push("Trailing zeros in a whole number with no decimal point are assumed to be NOT significant placeholders.");
    }

    sigFigCount = lastNonZero - firstNonZero + 1;
    
    // Check for captive zeros
    const sigDigits = absStr.substring(firstNonZero, lastNonZero + 1);
    if (sigDigits.includes('0')) {
      rulesApplied.push("Captive zeros (zeros between non-zero digits) are always significant.");
    }
  }

  // Generate scientific notation for normal numbers
  const val = Number(numStr);
  if (val !== 0) {
    const sciStr = val.toExponential(sigFigCount - 1);
    const [coeff, exp] = sciStr.split('e');
    sciNot = `${coeff} × 10^${exp.replace('+', '')}`;
  } else {
    sciNot = "0";
  }

  return {
    original: numStr,
    count: sigFigCount,
    scientificNotation: sciNot,
    rulesApplied
  };
};

const SignificantFiguresCalculator = () => {
  const [number, setNumber] = useState("0.004050");
  const [result, setResult] = useState<SigFigResult | null>(null);

  const calculate = () => {
    setResult(countSignificantFigures(number));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setNumber("0.004050");
    setResult(countSignificantFigures("0.004050"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What are significant figures?", answer: "Significant figures (or sig figs) are the digits in a number that carry meaning contributing to its measurement resolution. They include all non-zero digits, any zeros between non-zero digits, and any trailing zeros in a decimal number." },
    { question: "Are leading zeros significant?", answer: "No. Leading zeros (zeros before the first non-zero digit) are never significant. They simply serve as placeholders to indicate the position of the decimal point. For example, 0.004 has only one significant figure." },
    { question: "Are trailing zeros significant?", answer: "It depends. If the number has a decimal point, trailing zeros ARE significant (e.g., 4.500 has four sig figs). If the number does NOT have a decimal point, trailing zeros are generally considered NOT significant placeholders (e.g., 4500 has two sig figs)." },
    { question: "What are 'captive' zeros?", answer: "Captive zeros are zeros caught between two non-zero digits. They are always significant. For example, in the number 4005, the two middle zeros are captive, making all four digits significant." },
    { question: "Why do we use significant figures?", answer: "In science and engineering, no measurement is perfectly exact. Significant figures are used to ensure that the mathematical results of a calculation do not appear to have more precision than the original measured data allowed." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Significant Figures Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Significant Figures Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Enter Number</label>
              <div className={wrap}><input type="text" value={number} onChange={e => setNumber(e.target.value)} className={ci} placeholder="e.g. 0.004050 or 1.23e4" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">You can enter standard decimals or scientific notation (e.g. <code>4.5e-3</code>).</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-5 w-5" /> Calculate Sig Figs
              </button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result ? (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Significant Figures</div>
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
                  {result.count}
                </div>
                <div className="text-base font-medium mt-1 text-muted-foreground">
                  Scientific Notation: <span className="text-foreground font-mono bg-background px-2 py-0.5 rounded border border-border">{result.scientificNotation}</span>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Rules Applied</h3>
                <ul className="space-y-3">
                  {result.rulesApplied.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-bold mt-0.5">•</span> 
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </>) : (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Invalid Input</div>
                <div className="text-base font-medium text-foreground">
                  Please enter a valid number or scientific notation format to calculate significant figures.
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Significant Figures</h2>
            <p><strong>Significant figures</strong> (often called "sig figs" or "significant digits") are the digits in a measured or calculated number that carry reliable, meaningful information about the precision of that measurement. In science, chemistry, and engineering, no measurement is perfectly exact. Significant figures ensure that the mathematical results of a calculation do not imply a false sense of precision that wasn't present in the original data.</p>

            <h2>The Core Rules of Significant Figures</h2>
            <p>Determining how many significant figures are in a number comes down to a few standardized rules. Our calculator applies these rules instantly to any number you input:</p>
            <ul>
              <li><strong>Rule 1: Non-zero digits.</strong> Every digit from 1 to 9 is always considered significant. In the number <code>456</code>, there are 3 significant figures.</li>
              <li><strong>Rule 2: Captive zeros.</strong> Any zeros trapped between two non-zero digits are always significant. In <code>4005</code>, there are 4 significant figures.</li>
              <li><strong>Rule 3: Leading zeros.</strong> Zeros that appear before the first non-zero digit are <em>never</em> significant. They are simply placeholders indicating the position of the decimal point. In <code>0.0025</code>, there are only 2 significant figures.</li>
              <li><strong>Rule 4: Trailing zeros with a decimal.</strong> Zeros at the end of a number <em>are</em> significant if the number contains a decimal point. This is because they were deliberately placed there to indicate precision. In <code>4.500</code>, there are 4 significant figures.</li>
              <li><strong>Rule 5: Trailing zeros without a decimal.</strong> If a number ends in zeros but does not have a decimal point, those trailing zeros are generally considered not significant; they are just placeholders for scale. In <code>4500</code>, there are only 2 significant figures.</li>
            </ul>

            <h2>Why Scientific Notation Matters</h2>
            <p>The ambiguity of Rule 5 (trailing zeros without a decimal) is exactly why scientists prefer <strong>scientific notation</strong>. If a researcher measures exactly 4,500 meters and wants to prove that those trailing zeros are precise measurements, not just estimates, they would write it as <code>4.500 × 10³</code>. In scientific notation, all digits written in the coefficient (the front part) are always significant.</p>

            <h2>Applying Sig Figs in Calculations</h2>
            <p>When performing math with measured numbers, the result cannot be more precise than your least precise measurement. When multiplying or dividing, the final answer must be rounded to the same number of significant figures as the measurement with the <em>fewest</em> significant figures. When adding or subtracting, the result is rounded to the same number of <em>decimal places</em> as the measurement with the fewest decimal places.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/significant-figures-calculator" />
          <PopularCalculators exclude="/calculator/significant-figures-calculator" />
        </div>
      </div>
    </>
  );
};
export default SignificantFiguresCalculator;
