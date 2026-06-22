"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface RoundingResult {
  original: string;
  rounded: string;
  difference: string;
  direction: "up" | "down" | "none";
  steps: string[];
}

const performRounding = (numStr: string, mode: string, precision: string): RoundingResult | null => {
  const num = parseFloat(numStr);
  if (isNaN(num)) return null;

  let roundedNum = num;
  const steps: string[] = [];

  // Parse precision level
  // e.g. "0.01" (hundredths), "1" (whole number), "10" (tens)
  const prec = parseFloat(precision);
  if (isNaN(prec) || prec <= 0) return null;

  steps.push(`Original number: ${numStr}`);
  steps.push(`Rounding interval: ${prec}`);

  // Calculate rounding
  if (mode === "nearest") {
    roundedNum = Math.round(num / prec) * prec;
    steps.push(`Standard rounding to nearest multiple of ${prec}.`);
  } else if (mode === "up") {
    roundedNum = Math.ceil(num / prec) * prec;
    steps.push(`Rounding up (ceiling) to next multiple of ${prec}.`);
  } else if (mode === "down") {
    roundedNum = Math.floor(num / prec) * prec;
    steps.push(`Rounding down (floor) to previous multiple of ${prec}.`);
  } else if (mode === "half_up") {
    // Math.round does half up for positive numbers, but for negative numbers, Math.round(-1.5) -> -1 (which is half-up in terms of value, but some definitions of half-up mean away from zero).
    // Standard Math.round logic usually suffices for "Round Half Up" which is common arithmetic rounding.
    // For away from zero: Math.sign(num) * Math.floor(Math.abs(num) + 0.5)
    roundedNum = Math.sign(num) * Math.floor(Math.abs(num / prec) + 0.5) * prec;
    steps.push(`Rounding half away from zero to multiple of ${prec}.`);
  } else if (mode === "half_even") {
    // Banker's rounding
    const ratio = num / prec;
    const roundedRatio = Math.round(ratio);
    if (Math.abs(ratio % 1) === 0.5) {
      // It's exactly halfway. Round to nearest even.
      const floorRatio = Math.floor(ratio);
      roundedNum = (floorRatio % 2 === 0 ? floorRatio : floorRatio + 1) * prec;
      steps.push(`Value is exactly halfway. Applying Banker's Rounding (to nearest even).`);
    } else {
      roundedNum = Math.round(ratio) * prec;
      steps.push(`Value is not exactly halfway. Rounding to nearest multiple.`);
    }
  }

  // Fix floating point errors (e.g. 1.0000000000000002)
  // We determine the number of decimal places in the precision string
  let decimalPlaces = 0;
  if (precision.includes(".")) {
    decimalPlaces = precision.split(".")[1].length;
  } else if (prec < 1) {
    decimalPlaces = Math.abs(Math.floor(Math.log10(prec)));
  }

  const roundedStr = roundedNum.toFixed(decimalPlaces);
  // Ensure we drop trailing zeros if precision is whole numbers
  const finalStr = prec >= 1 ? parseFloat(roundedStr).toString() : roundedStr;

  const difference = (parseFloat(finalStr) - num).toPrecision(10);
  const cleanDiff = parseFloat(difference);

  let direction: "up" | "down" | "none" = "none";
  if (cleanDiff > 0) direction = "up";
  else if (cleanDiff < 0) direction = "down";

  steps.push(`Result: ${finalStr}`);

  return {
    original: numStr,
    rounded: finalStr,
    difference: (cleanDiff > 0 ? "+" : "") + cleanDiff.toString(),
    direction,
    steps
  };
};

const RoundingCalculator = () => {
  const [number, setNumber] = useState("142.645");
  const [precision, setPrecision] = useState("0.01"); // Hundredths
  const [mode, setMode] = useState("nearest");

  const [result, setResult] = useState<RoundingResult | null>(null);

  const calculate = () => {
    setResult(performRounding(number, mode, precision));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setNumber("142.645"); setPrecision("0.01"); setMode("nearest");
    setResult(performRounding("142.645", "nearest", "0.01"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What are the common rounding modes?", answer: "The most common mode is 'Nearest/Half Up', where 4 and below rounds down, and 5 and above rounds up. 'Ceiling' always rounds up to the next interval, and 'Floor' always rounds down." },
    { question: "What is Banker's Rounding (Half Even)?", answer: "Banker's Rounding, or 'Round Half to Even', is a method used heavily in financial and statistical systems. If a number is exactly halfway between two intervals (like 2.5), it rounds to the nearest EVEN number (so 2.5 becomes 2, and 3.5 becomes 4). This prevents statistical bias from always rounding .5 upwards." },
    { question: "Can I round to tens, hundreds, or thousands?", answer: "Yes! In the 'Round to' dropdown, select 'Tens (10)', 'Hundreds (100)', etc. For example, rounding 1,452 to the nearest Hundred will result in 1,500." },
    { question: "Why do we round numbers?", answer: "Rounding simplifies numbers, making them easier to read, communicate, and perform mental math with, especially when exact precision is not necessary for the context." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Rounding Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rounding Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Number to Round</label>
              <div className={wrap}><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={ci} step="any" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Round To (Precision)</label>
              <div className={wrap}>
                <select value={precision} onChange={e => setPrecision(e.target.value)} className={ci}>
                  <optgroup label="Decimal Places">
                    <option value="0.000001">Millionths (6 decimal places)</option>
                    <option value="0.00001">Hundred Thousandths (5 decimal places)</option>
                    <option value="0.0001">Ten Thousandths (4 decimal places)</option>
                    <option value="0.001">Thousandths (3 decimal places)</option>
                    <option value="0.01">Hundredths (2 decimal places)</option>
                    <option value="0.1">Tenths (1 decimal place)</option>
                  </optgroup>
                  <optgroup label="Whole Numbers">
                    <option value="1">Whole Number (Ones)</option>
                    <option value="10">Tens</option>
                    <option value="100">Hundreds</option>
                    <option value="1000">Thousands</option>
                    <option value="10000">Ten Thousands</option>
                    <option value="100000">Hundred Thousands</option>
                    <option value="1000000">Millions</option>
                  </optgroup>
                  <optgroup label="Fractions">
                    <option value="0.5">Half (0.5)</option>
                    <option value="0.25">Quarter (0.25)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Rounding Mode</label>
              <div className={wrap}>
                <select value={mode} onChange={e => setMode(e.target.value)} className={ci}>
                  <option value="nearest">Standard (Nearest, Half Up)</option>
                  <option value="half_even">Banker's (Half to Even)</option>
                  <option value="up">Round Up (Ceiling)</option>
                  <option value="down">Round Down (Floor)</option>
                  <option value="half_up">Round Half Away From Zero</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-5 w-5" /> Calculate
              </button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Rounded Result</div>
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
                  {result.rounded}
                </div>
                <div className="text-base font-medium mt-1 text-muted-foreground">
                  Original: <span className="text-foreground">{result.original}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="p-4 text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Difference</div>
                  <div className={`text-2xl font-bold ${result.direction === 'up' ? 'text-emerald-500' : (result.direction === 'down' ? 'text-red-500' : 'text-muted-foreground')}`}>
                    {result.difference}
                  </div>
                </div>
                <div className="p-4 text-center border-l border-border flex flex-col justify-center items-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Direction</div>
                  {result.direction === "up" && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold mt-1 border border-emerald-500/20">Rounded Up ↑</span>}
                  {result.direction === "down" && <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-bold mt-1 border border-red-500/20">Rounded Down ↓</span>}
                  {result.direction === "none" && <span className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm font-bold mt-1">Unchanged</span>}
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Calculation Logic</h3>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground marker:text-primary marker:font-bold">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      <span className={idx === result.steps.length - 1 ? "font-bold text-foreground" : ""}>{step}</span>
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
            <h2>The Importance of Rounding</h2>
            <p><strong>Rounding</strong> is a mathematical technique used to reduce the number of digits in a figure while keeping its value relatively similar to the original. This is done to make numbers simpler, more readable, and easier to use in mental calculations, particularly when extreme precision is unnecessary. For instance, stating that a distance is "about 15 miles" is usually more helpful than stating it is "14.8392 miles."</p>

            <h2>Understanding Rounding Modes</h2>
            <p>Our calculator supports several distinct rounding modes, as different disciplines require different mathematical logic:</p>
            <ul>
              <li><strong>Standard (Nearest, Half-Up):</strong> This is the method taught in most primary schools. You look at the digit to the right of your target precision. If it is 5 or higher, you round up. If it is 4 or lower, you round down. Example: 2.5 rounds to 3.</li>
              <li><strong>Banker's Rounding (Half to Even):</strong> This is the standard used in bookkeeping, finance, and most computer programming languages (like Python and C#). When a number is exactly halfway between two intervals (ending in .5), it rounds to the nearest <em>even</em> number. This eliminates the slight upward bias that occurs if you always round .5 up. Example: 2.5 rounds to 2, but 3.5 rounds to 4.</li>
              <li><strong>Ceiling (Round Up):</strong> Regardless of the digit, if the number is not already an exact multiple of the precision interval, it is forced upward. Example: 2.1 rounds to 3.</li>
              <li><strong>Floor (Round Down):</strong> The opposite of Ceiling; the number is always forced downward. Example: 2.9 rounds to 2.</li>
            </ul>

            <h2>Precision Levels Explained</h2>
            <p>You can round to decimal places (tenths, hundredths, thousandths) or to whole numbers (tens, hundreds, thousands). Here is a quick reference for decimal precision:</p>
            <ul>
              <li><strong>Tenths (0.1):</strong> One digit after the decimal point. Often used for measuring weight or distance.</li>
              <li><strong>Hundredths (0.01):</strong> Two digits after the decimal point. The standard precision for almost all global fiat currencies (dollars and cents).</li>
              <li><strong>Thousandths (0.001):</strong> Three digits after the decimal point. Commonly used in science, manufacturing, and sports statistics (like a baseball batting average).</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rounding-calculator" />
          <PopularCalculators exclude="/calculator/rounding-calculator" />
        </div>
      </div>
    </>
  );
};
export default RoundingCalculator;
