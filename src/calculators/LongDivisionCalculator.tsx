"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface Step {
  action: string;
  subtrahend?: number;
  remainder?: number;
  currentDividendPart: string;
  quotientDigit: string;
  isBringingDown?: boolean;
}

interface DivisionResult {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  decimalResult: number;
  steps: Step[];
}

const performLongDivision = (dividendStr: string, divisorStr: string): DivisionResult | null => {
  const dividend = parseInt(dividendStr, 10);
  const divisor = parseInt(divisorStr, 10);

  if (isNaN(dividend) || isNaN(divisor) || divisor === 0 || dividend < 0 || divisor < 0) return null;

  const steps: Step[] = [];
  const divStr = dividend.toString();
  
  let currentPartStr = "";
  let quotientStr = "";

  for (let i = 0; i < divStr.length; i++) {
    currentPartStr += divStr[i];
    const currentPart = parseInt(currentPartStr, 10);

    if (currentPart >= divisor) {
      const qDigit = Math.floor(currentPart / divisor);
      const subtrahend = qDigit * divisor;
      const rem = currentPart - subtrahend;

      steps.push({
        action: `Divide ${currentPart} by ${divisor} = ${qDigit} with remainder ${rem}`,
        currentDividendPart: currentPart.toString(),
        quotientDigit: qDigit.toString(),
        subtrahend,
        remainder: rem
      });

      quotientStr += qDigit.toString();
      currentPartStr = rem.toString();
      
      // If there are more digits, we'll "bring down" the next one in the next iteration
      if (i < divStr.length - 1) {
        steps.push({
          action: `Bring down ${divStr[i+1]} to make ${currentPartStr === "0" ? "" : currentPartStr}${divStr[i+1]}`,
          currentDividendPart: rem.toString(),
          quotientDigit: "",
          isBringingDown: true
        });
      }

    } else {
      // If we've started building the quotient, we must add a 0
      if (quotientStr.length > 0) {
        quotientStr += "0";
        steps.push({
          action: `${currentPart} is less than ${divisor}, add 0 to quotient`,
          currentDividendPart: currentPart.toString(),
          quotientDigit: "0",
          subtrahend: 0,
          remainder: currentPart
        });
        
        if (i < divStr.length - 1) {
          steps.push({
            action: `Bring down ${divStr[i+1]} to make ${currentPartStr === "0" ? "" : currentPartStr}${divStr[i+1]}`,
            currentDividendPart: currentPart.toString(),
            quotientDigit: "",
            isBringingDown: true
          });
        }
      } else {
        // Just bringing down the next digit at the very beginning
        if (i < divStr.length - 1) {
          steps.push({
            action: `${currentPart} is less than ${divisor}. Look at next digit: ${currentPartStr}${divStr[i+1]}`,
            currentDividendPart: currentPart.toString(),
            quotientDigit: "",
            isBringingDown: true
          });
        }
      }
    }
  }

  const finalQuotient = quotientStr === "" ? 0 : parseInt(quotientStr, 10);
  const finalRemainder = parseInt(currentPartStr === "" ? "0" : currentPartStr, 10);

  return {
    dividend,
    divisor,
    quotient: finalQuotient,
    remainder: finalRemainder,
    decimalResult: dividend / divisor,
    steps
  };
};

const LongDivisionCalculator = () => {
  const [dividend, setDividend] = useState("4852");
  const [divisor, setDivisor] = useState("12");

  const [result, setResult] = useState<DivisionResult | null>(null);

  const calculate = () => {
    setResult(performLongDivision(dividend, divisor));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setDividend("4852"); setDivisor("12");
    setResult(performLongDivision("4852", "12"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is long division?", answer: "Long division is a standard mathematical algorithm used to divide large numbers by breaking the problem down into a series of easier, smaller steps. It involves repeated cycles of dividing, multiplying, subtracting, and bringing down the next digit." },
    { question: "What do dividend, divisor, quotient, and remainder mean?", answer: "The Dividend is the number being divided. The Divisor is the number you are dividing by. The Quotient is the whole number answer. The Remainder is what is left over after dividing as far as possible using whole numbers." },
    { question: "Does this calculator support decimals?", answer: "This specific tool is designed to show the traditional step-by-step long division process for whole numbers, which results in a quotient and a remainder. However, we do display the exact decimal equivalent at the top of the results panel for reference." },
    { question: "How do I read the step-by-step breakdown?", answer: "The breakdown follows the classic 'DMSB' algorithm taught in schools: Divide (find how many times the divisor goes into the current part), Multiply (multiply that number by the divisor), Subtract (find the difference), and Bring down (drop the next digit of the dividend)." },
    { question: "What happens if I divide by zero?", answer: "Division by zero is undefined in mathematics. The calculator will not process a divisor of zero." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Long Division Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Long Division Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-2 flex items-center justify-center gap-4 text-2xl font-bold text-foreground">
              <span>{dividend || "?"}</span>
              <span className="text-primary">÷</span>
              <span>{divisor || "?"}</span>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Dividend</span>
                <span className="text-xs text-muted-foreground font-normal self-end mb-0.5">(Number being divided)</span>
              </label>
              <div className={wrap}><input type="number" value={dividend} onChange={e => setDividend(e.target.value)} className={ci} min={0} step={1} /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Divisor</span>
                <span className="text-xs text-muted-foreground font-normal self-end mb-0.5">(Dividing by)</span>
              </label>
              <div className={wrap}><input type="number" value={divisor} onChange={e => setDivisor(e.target.value)} className={ci} min={1} step={1} /></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Final Result</div>
                <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
                  {result.quotient} <span className="text-xl text-muted-foreground ml-1">R {result.remainder}</span>
                </div>
                <div className="text-base font-medium mt-1 text-muted-foreground">
                  Decimal equivalent: <span className="text-foreground">{result.decimalResult.toPrecision(8).replace(/\.?0+$/, '')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="p-4 text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Quotient</div>
                  <div className="text-2xl font-bold text-foreground">{result.quotient}</div>
                </div>
                <div className="p-4 text-center border-l border-border">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Remainder</div>
                  <div className="text-2xl font-bold text-foreground">{result.remainder}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Step-by-Step Breakdown</h3>
                
                {/* Visual Math Representation - ASCII style */}
                <div className="bg-secondary/20 border border-border/50 rounded-lg p-6 mb-6 font-mono text-lg flex justify-center overflow-x-auto">
                  <div className="inline-block text-right">
                    <div className="tracking-[0.5em] text-primary font-bold border-b-2 border-foreground pb-1 mb-1 pr-1">
                      {result.quotient}
                    </div>
                    <div className="flex text-foreground">
                      <div className="pr-2 border-r-2 border-foreground mr-1">{result.divisor}</div>
                      <div className="tracking-[0.5em]">{result.dividend}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                  {result.steps.map((step, idx) => (
                    <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary/20 text-primary font-bold text-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${step.isBringingDown ? 'bg-secondary/50 text-muted-foreground border-transparent w-6 h-6 ml-2 md:ml-0' : ''}`}>
                        {step.isBringingDown ? "↓" : (idx + 1)}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-3 rounded-lg shadow-sm">
                        <div className={`text-sm font-medium ${step.isBringingDown ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                          {step.action}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      ✓
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg shadow-sm">
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        Final Remainder: {result.remainder}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Long Division</h2>
            <p><strong>Long division</strong> is a foundational mathematical algorithm that breaks down the division of large numbers into a sequence of simpler, more manageable steps. By addressing the number piece by piece from left to right, we can efficiently find how many times one number (the divisor) fits into another (the dividend).</p>

            <h2>The Terminology of Division</h2>
            <p>To use the long division calculator effectively, it helps to know the correct terminology for the parts of a division equation:</p>
            <ul>
              <li><strong>Dividend:</strong> The number you are starting with, which is being divided or split up. (e.g., in 48 ÷ 12, 48 is the dividend).</li>
              <li><strong>Divisor:</strong> The number you are dividing by. It determines the size of the groups. (e.g., in 48 ÷ 12, 12 is the divisor).</li>
              <li><strong>Quotient:</strong> The final whole-number result or answer to the division problem.</li>
              <li><strong>Remainder:</strong> The amount left over after dividing as evenly as possible. If the divisor fits perfectly into the dividend, the remainder is zero.</li>
            </ul>

            <h2>The Four Steps of Long Division (DMSB)</h2>
            <p>Our calculator models its step-by-step breakdown on the classic "DMSB" method taught in schools worldwide. A common mnemonic device to remember this sequence is "Does McDonald's Sell Burgers?" or "Divide, Multiply, Subtract, Bring down."</p>
            <ol>
              <li><strong>Divide (D):</strong> Look at the first digit (or digits) of the dividend. Determine how many times the divisor can go into that number without exceeding it. Write this number on top as the first digit of your quotient.</li>
              <li><strong>Multiply (M):</strong> Multiply the digit you just wrote on top by the divisor. Write the result underneath the portion of the dividend you are currently analyzing.</li>
              <li><strong>Subtract (S):</strong> Subtract that result from the current portion of the dividend. This number must be smaller than your divisor. If it isn't, your quotient digit was too low.</li>
              <li><strong>Bring Down (B):</strong> Bring down the next digit from the original dividend and place it next to your subtraction result. This forms your new working number. Repeat steps 1-4 until you run out of digits.</li>
            </ol>

            <h2>Why Show the Remainder?</h2>
            <p>While calculating decimals is useful for precise mathematical applications, remainders are highly practical in everyday scenarios. For instance, if you have 50 cookies (dividend) to split among 12 children (divisor), the decimal result is 4.166. However, in reality, you give each child 4 whole cookies (quotient), and you have 2 cookies left over in the jar (remainder). Long division beautifully illustrates this real-world distribution logic.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/long-division-calculator" />
          <PopularCalculators exclude="/calculator/long-division-calculator" />
        </div>
      </div>
    </>
  );
};
export default LongDivisionCalculator;
