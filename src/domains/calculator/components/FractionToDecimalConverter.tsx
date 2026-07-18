"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ArrowRight } from "lucide-react";

export default function FractionToDecimalConverter() {
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [result, setResult] = useState<{ decimal: string; steps: string } | null>(null);

  const calculate = () => {
    const num = parseFloat(numerator);
    const den = parseFloat(denominator);
    if (isNaN(num) || isNaN(den) || den === 0) {
      setResult(null);
      return;
    }
    const dec = num / den;
    setResult({
      decimal: dec.toString(),
      steps: `To convert ${num}/${den} to a decimal, divide the numerator (${num}) by the denominator (${den}).\n${num} ÷ ${den} = ${dec}`
    });
  };

  const reset = () => { setNumerator(""); setDenominator(""); setResult(null); };

  const faqs = [
    { question: "How do I convert a fraction to a decimal?", answer: "Simply divide the top number (numerator) by the bottom number (denominator). For example, for 3/4, divide 3 by 4 to get 0.75." },
    { question: "What is a repeating decimal?", answer: "A repeating decimal occurs when the division of the numerator by the denominator does not terminate, resulting in a sequence of digits that repeats infinitely. For example, 1/3 = 0.3333..." },
    { question: "How do I handle mixed numbers?", answer: "To convert a mixed number (like 1 1/2) to a decimal, convert the fractional part to a decimal (1/2 = 0.5) and add it to the whole number (1 + 0.5 = 1.5). Alternatively, convert the mixed number to an improper fraction (3/2) and divide." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Fraction to Decimal Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fraction to Decimal Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Numerator (Top Number)</label>
              <input type="number" value={numerator} onChange={e => setNumerator(e.target.value)} className="w-full h-11 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. 3" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Denominator (Bottom Number)</label>
              <input type="number" value={denominator} onChange={e => setDenominator(e.target.value)} className="w-full h-11 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. 4" />
            </div>
            
            {parseFloat(denominator) === 0 && <p className="text-xs text-destructive font-semibold">Denominator cannot be zero.</p>}

            <div className="flex gap-3 pt-2 mt-2 border-t border-border">
              <button onClick={calculate} disabled={parseFloat(denominator) === 0} className="w-full flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm transition-all shadow-sm disabled:opacity-50">
                Calculate
              </button>
              <button onClick={reset} title="Reset" className="w-11 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {result !== null && (
              <div className="card-calculator flex flex-col gap-4 !p-6 shadow-sm border border-border bg-card">
                <div className="flex items-center gap-4 text-3xl md:text-5xl font-black text-foreground tracking-tight">
                  <div className="flex flex-col items-center">
                    <span className="border-b-4 border-foreground px-2">{numerator}</span>
                    <span className="px-2">{denominator}</span>
                  </div>
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  <span className="text-primary">{result.decimal}</span>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4 mt-2">
                  <h3 className="text-sm font-bold text-foreground mb-2">Step-by-Step Conversion</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.steps}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Fractions and Decimals</h2>
            <p>Fractions and decimals are two different ways to express the same mathematical concept: a part of a whole. While fractions (like ¾) are excellent for expressing exact proportions and division without losing precision, decimals (like 0.75) are universally preferred in finance, digital computing, and science because they align perfectly with our base-10 number system.</p>
            <p>Converting a fraction to a decimal is a fundamental arithmetic operation that simply requires performing the division operation inherent in the fraction itself. The fraction bar literally translates to "divided by." Therefore, any fraction is just an unsolved division problem waiting to be calculated.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Division Method</h2>
            <p>The most direct way to convert any fraction to a decimal is to divide the numerator (the top number) by the denominator (the bottom number). For example, to convert 5/8 into a decimal, you perform the long division of 5 ÷ 8. Since 8 does not go into 5, you add a decimal point and a zero to make it 50 ÷ 8, which yields 0.625.</p>
            <p>This method works universally for proper fractions (where the numerator is smaller than the denominator, resulting in a decimal less than 1) and improper fractions (where the numerator is larger, resulting in a decimal greater than 1). For instance, converting the improper fraction 11/4 by dividing 11 by 4 gives exactly 2.75.</p>

            <h2 className="text-2xl font-bold mb-3">Terminating vs. Repeating Decimals</h2>
            <p>When you convert a fraction to a decimal, you will encounter one of two mathematical outcomes:</p>
            <ul>
              <li><strong>Terminating Decimals:</strong> These decimals end cleanly after a few decimal places. For example, 1/2 = 0.5 and 7/25 = 0.28. A mathematical rule states that a fraction in its simplest form will produce a terminating decimal if and only if the prime factors of its denominator are exclusively 2s and 5s.</li>
              <li><strong>Repeating Decimals:</strong> If the denominator contains prime factors other than 2 or 5, the division will never terminate. Instead, it will fall into an infinite repeating pattern. For example, 1/3 = 0.3333... and 5/7 = 0.714285714285... In these cases, it is common to round the result to a manageable number of decimal places (like 0.33 or 0.71) depending on the required precision of the real-world application.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Converting fractions to decimals is essential in daily life. In the United States, stock market prices were historically quoted in fractions (like 1/8 of a dollar) until 2001, when the markets underwent "decimalization" to make trading faster and more intuitive. Today, if a recipe calls for ½ cup of flour, but your digital scale only reads in decimals, you must know that ½ equals 0.5. Similarly, mechanics working with standard Imperial tools (like a 5/16 inch wrench) must frequently convert to decimals (0.3125 inches) to cross-reference sizes with metric equivalents.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fraction-to-decimal-converter" />
          <PopularCalculators exclude="/calculator/fraction-to-decimal-converter" />
        </div>
      </div>
    </>
  );
}
