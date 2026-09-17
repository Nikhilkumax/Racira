"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ArrowLeftRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface NotationResult {
  scientific: string;
  standard: string;
  eNotation: string;
  engineering: string;
  coefficient: number;
  exponent: number;
  steps: string[];
}

const parseNumber = (input: string): number | null => {
  // Allow normal numbers and standard scientific notation like "1.23e4" or "1.23 * 10^4" or "1.23 x 10^4"
  let clean = input.trim().toLowerCase();
  
  // Replace 'x' and '*' with 'e' if it follows the 10^ format
  clean = clean.replace(/\s*[\*x]\s*10\s*\^\s*/g, 'e');
  
  const num = Number(clean);
  if (isNaN(num)) return null;
  return num;
};

const convertToNotation = (input: string): NotationResult | null => {
  const num = parseNumber(input);
  if (num === null) return null;

  if (num === 0) {
    return {
      scientific: "0 × 10⁰",
      standard: "0",
      eNotation: "0e0",
      engineering: "0 × 10⁰",
      coefficient: 0,
      exponent: 0,
      steps: ["Number is zero.", "Coefficient is 0, exponent is 0."]
    };
  }

  const steps: string[] = [];
  steps.push(`Original input parsed as: ${num}`);

  // Calculate Scientific Notation
  // Need to get the exponent (log10 of absolute value)
  const absNum = Math.abs(num);
  let exponent = Math.floor(Math.log10(absNum));
  
  // Handle edge cases where Math.log10(1000) might return 2.99999...
  let coefficient = num / Math.pow(10, exponent);
  
  // Adjust if coefficient is exactly 10 or slightly off due to float precision
  if (Math.abs(coefficient) >= 10) {
    coefficient /= 10;
    exponent += 1;
  } else if (Math.abs(coefficient) < 1) {
    coefficient *= 10;
    exponent -= 1;
  }

  // Format the coefficient nicely (remove weird float artifacts)
  let coeffStr = parseFloat(coefficient.toPrecision(15)).toString();
  
  steps.push(`1. Move the decimal point so there is exactly one non-zero digit to the left of the decimal.`);
  steps.push(`2. The resulting number is the coefficient: ${coeffStr}`);
  if (exponent > 0) {
    steps.push(`3. The decimal moved ${Math.abs(exponent)} places to the left, so the exponent is positive ${exponent}.`);
  } else if (exponent < 0) {
    steps.push(`3. The decimal moved ${Math.abs(exponent)} places to the right, so the exponent is negative ${exponent}.`);
  } else {
    steps.push(`3. The decimal did not move, so the exponent is 0.`);
  }

  const scientific = `${coeffStr} × 10${formatSuperscript(exponent)}`;
  const eNotation = `${coeffStr}e${exponent >= 0 ? '+' : ''}${exponent}`;

  // Standard notation
  let standard = num.toString();
  // If javascript already converted it to 'e' notation because it's too big/small, expand it
  if (standard.includes('e')) {
    // A quick hacky way to format full standard without scientific notation using Intl.NumberFormat 
    // or BigInt for large integers. For decimals, we can write a small string builder.
    if (Math.abs(exponent) < 21) {
      // JS can handle up to e20 natively without forcing sci notation if we format it right
      standard = num.toLocaleString('fullwide', { useGrouping: false, maximumSignificantDigits: 21 });
    } else {
      // Very large/small numbers
      standard = "Too large/small to display natively, use E-notation.";
    }
  }

  // Engineering Notation (exponent must be a multiple of 3)
  let engExponent = Math.floor(exponent / 3) * 3;
  let engCoefficient = num / Math.pow(10, engExponent);
  
  // Fix float issues
  let engCoeffStr = parseFloat(engCoefficient.toPrecision(15)).toString();
  const engineering = `${engCoeffStr} × 10${formatSuperscript(engExponent)}`;

  return {
    scientific,
    standard,
    eNotation,
    engineering,
    coefficient: parseFloat(coeffStr),
    exponent,
    steps
  };
};

const formatSuperscript = (num: number): string => {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
    '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
  };
  return num.toString().split('').map(char => map[char] || char).join('');
};

const ScientificNotationCalculator = () => {
  const [inputVal, setInputVal] = useState("0.000452");
  const [result, setResult] = useState<NotationResult | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const res = convertToNotation(inputVal);
    if (!res) {
      setError("Please enter a valid number or standard scientific notation format.");
      setResult(null);
    } else {
      setResult(res);
    }
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setInputVal("0.000452"); setError("");
    setResult(convertToNotation("0.000452"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is scientific notation?", answer: "Scientific notation is a standardized way of writing numbers that are too exceptionally large or too exceptionally small to be conveniently written in standard decimal form. It expresses numbers as a product of a coefficient (a number between 1 and 10) and a power of 10." },
    { question: "How do you read scientific notation?", answer: "A number like 4.52 × 10³ is read as 'four point five two times ten to the third power'. The coefficient is 4.52, and the exponent is 3. This tells you to move the decimal point 3 places to the right, resulting in the standard number 4,520." },
    { question: "What does E-Notation mean?", answer: "E-notation (or exponential notation) is just a way to type scientific notation on a standard computer keyboard or basic calculator. The 'e' or 'E' stands for 'times ten raised to the power of'. So, 4.52e3 is mathematically identical to 4.52 × 10³." },
    { question: "What is Engineering Notation?", answer: "Engineering notation is similar to scientific notation, but it has a strict rule: the exponent of 10 must be a multiple of three (e.g., 10³, 10⁶, 10⁻³). This aligns perfectly with metric prefixes like kilo-, mega-, and milli-, making it highly useful for engineers." },
    { question: "What happens if the exponent is negative?", answer: "A negative exponent indicates a very small number (a fraction or decimal between 0 and 1). For example, 10⁻³ means you are dividing by 10³, which is the same as moving the decimal point three places to the left." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Scientific Notation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Scientific Notation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-muted-foreground flex items-start gap-2 mb-2">
              <ArrowLeftRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>This calculator is bidirectional. Enter a standard decimal number to convert to scientific notation, or enter scientific notation (using 'e' format) to see the standard decimal.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Enter Number</label>
              <div className={wrap}><input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} className={ci} placeholder="e.g. 0.000452 or 4.52e-4" /></div>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">Accepts formats: 150000, 0.003, 1.5e5, 3 * 10^-3</p>
            </div>

            {error && (
              <div className="text-sm font-bold text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && !error && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Scientific Notation</div>
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-1 tracking-tight font-mono py-2 break-all">
                  {result.scientific}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 border-b border-border/50 pb-2">Standard Decimal Notation</div>
                  <div className="text-xl font-bold text-foreground font-mono break-all">{result.standard}</div>
                </div>
                
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 border-b border-border/50 pb-2">E-Notation (Computer format)</div>
                  <div className="text-xl font-bold text-foreground font-mono break-all">{result.eNotation}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h3 className="text-base font-bold text-foreground">Engineering Notation</h3>
                  <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground font-medium">Exponent is multiple of 3</span>
                </div>
                <div className="text-2xl font-bold text-foreground font-mono">{result.engineering}</div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Exponents in Each Notation</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[{ name: "Scientific", value: result.exponent, fill: "hsl(var(--primary))" }, { name: "Engineering", value: Math.floor(result.exponent / 3) * 3, fill: "#10b981" }]} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v, "Exponent"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {[{ name: "Scientific", value: result.exponent }, { name: "Engineering", value: Math.floor(result.exponent / 3) * 3 }].map((d, i) => <Cell key={i} fill={d.name === "Scientific" ? "hsl(var(--primary))" : "#10b981"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Engineering rounds the exponent down to a multiple of 3, so the coefficient grows up to 100×.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4 text-foreground">Conversion Steps</h3>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground marker:text-primary marker:font-bold">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Use Scientific Notation?</h2>
            <p><strong>Scientific notation</strong> is an essential mathematical tool for dealing with extreme numbers. In fields like astronomy and quantum physics, scientists frequently work with figures that are staggeringly large or incredibly small. For instance, the mass of the Earth is approximately 5,972,000,000,000,000,000,000,000 kg. The mass of an electron is roughly 0.0000000000000000000000000000009109 kg. Writing these standard decimals out by hand is not only tedious but highly prone to counting errors. Scientific notation condenses these numbers into a clean, universally readable format.</p>

            <h2 className="text-2xl font-bold mb-3">The Anatomy of Scientific Notation</h2>
            <p>A number written in scientific notation consists of two main parts multiplied together:</p>
            <ul>
              <li><strong>The Coefficient:</strong> Also known as the mantissa or significand, this is a real number greater than or equal to 1, and strictly less than 10. It contains all the significant figures of the original number.</li>
              <li><strong>The Base and Exponent:</strong> The coefficient is multiplied by a base of 10 raised to an integer power (the exponent). The exponent tells you how many places to move the decimal point to return the coefficient back to its standard form.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Rules for Converting to Scientific Notation</h2>
            <ol>
              <li>Move the decimal point in your original number until there is exactly one non-zero digit to its left. This new number becomes your coefficient.</li>
              <li>Count the number of places you moved the decimal point. This count becomes your exponent.</li>
              <li>Determine the sign of the exponent:
                <ul>
                  <li>If you moved the decimal point to the <strong>left</strong> (because your original number was large, like 4,500), the exponent is <strong>positive</strong>.</li>
                  <li>If you moved the decimal point to the <strong>right</strong> (because your original number was small, like 0.0045), the exponent is <strong>negative</strong>.</li>
                </ul>
              </li>
            </ol>

            <h2 className="text-2xl font-bold mb-3">Engineering Notation vs. Scientific Notation</h2>
            <p>While standard scientific notation requires the coefficient to be between 1 and 10, <strong>Engineering notation</strong> has a different rule: the exponent must always be a multiple of three (e.g., 3, 6, 9, -3, -6). Consequently, the coefficient can be anywhere between 1 and 1000. This system perfectly aligns with SI metric prefixes. For example, 5.5 × 10³ Hz translates instantly to 5.5 kiloHertz, while 5.5 × 10⁶ translates to 5.5 megaHertz.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/scientific-notation-calculator" />
          <PopularCalculators exclude="/calculator/scientific-notation-calculator" />
        </div>
      </div>
    </>
  );
};
export default ScientificNotationCalculator;
