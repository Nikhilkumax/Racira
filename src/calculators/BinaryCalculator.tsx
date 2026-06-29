"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ArrowLeftRight } from "lucide-react";

interface BinaryResult {
  operation: string;
  num1Bin: string;
  num2Bin?: string;
  resultBin: string;
  resultDec: string;
  resultHex: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateBinary = (val1: string, val2: string, op: string): BinaryResult | null => {
  // Clean inputs
  const b1 = val1.replace(/[^01]/g, "");
  const b2 = val2.replace(/[^01]/g, "");

  if (!b1) return null;

  try {
    const dec1 = BigInt("0b" + b1);
    let resultDec = BigInt(0);
    
    if (["+", "-", "*", "/", "AND", "OR", "XOR"].includes(op)) {
      if (!b2) return null;
      const dec2 = BigInt("0b" + b2);
      
      switch (op) {
        case "+": resultDec = dec1 + dec2; break;
        case "-": resultDec = dec1 - dec2; break; // Note: BigInt allows negative, but standard binary usually uses Two's Complement. We'll show absolute binary with minus sign for simplicity if negative.
        case "*": resultDec = dec1 * dec2; break;
        case "/": 
          if (dec2 === BigInt(0)) return { operation: op, num1Bin: b1, num2Bin: b2, resultBin: "", resultDec: "", resultHex: "", isError: true, errorMsg: "Cannot divide by zero." };
          resultDec = dec1 / dec2; 
          break;
        case "AND": resultDec = dec1 & dec2; break;
        case "OR": resultDec = dec1 | dec2; break;
        case "XOR": resultDec = dec1 ^ dec2; break;
      }
    } else if (op === "NOT") {
      // Bitwise NOT depends on bit width. 
      // If user inputs 1010 (4 bits), NOT is 0101.
      // We do a string manipulation for precise width matching to user input length.
      let notStr = "";
      for (let i = 0; i < b1.length; i++) {
        notStr += b1[i] === "1" ? "0" : "1";
      }
      resultDec = BigInt("0b" + notStr);
      return {
        operation: op,
        num1Bin: b1,
        resultBin: notStr,
        resultDec: resultDec.toString(),
        resultHex: resultDec.toString(16).toUpperCase(),
        isError: false
      };
    } else if (op === "LSHIFT") {
      // Left shift by 1
      resultDec = dec1 << BigInt(1);
    } else if (op === "RSHIFT") {
      // Right shift by 1
      resultDec = dec1 >> BigInt(1);
    }

    const isNeg = resultDec < BigInt(0);
    const absDec = isNeg ? -resultDec : resultDec;
    
    const resultBin = (isNeg ? "-" : "") + absDec.toString(2);
    const resultHex = (isNeg ? "-" : "") + absDec.toString(16).toUpperCase();

    return {
      operation: op,
      num1Bin: b1,
      num2Bin: b2,
      resultBin,
      resultDec: resultDec.toString(),
      resultHex,
      isError: false
    };

  } catch (e) {
    return { operation: op, num1Bin: b1, resultBin: "", resultDec: "", resultHex: "", isError: true, errorMsg: "Calculation error. Input may be too large." };
  }
};

const BinaryCalculator = () => {
  const [val1, setVal1] = useState("1010");
  const [val2, setVal2] = useState("0110");
  const [op, setOp] = useState("+");
  const [result, setResult] = useState<BinaryResult | null>(null);

  const calculate = () => {
    setResult(calculateBinary(val1, val2, op));
  };

  useEffect(() => { calculate(); }, [val1, val2, op]); // auto-calc on change for this one since it's fast string ops mostly

  const reset = () => {
    setVal1("1010"); setVal2("0110"); setOp("+");
  };

  const isUnary = ["NOT", "LSHIFT", "RSHIFT"].includes(op);

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono tracking-[0.2em]";

  const formatBinary = (binStr: string) => {
    // Add spaces every 4 characters from the right
    const isNeg = binStr.startsWith('-');
    const absStr = isNeg ? binStr.slice(1) : binStr;
    const spaced = absStr.split('').reverse().join('').replace(/(.{4})/g, '$1 ').split('').reverse().join('').trim();
    return (isNeg ? '-' : '') + spaced;
  };

  const faqs = [
    { question: "What is the Binary numeral system?", answer: "Binary (Base-2) is a numerical system that uses only two symbols: 0 and 1. It is the fundamental language of all modern computers. Every piece of data on your computer, from this text to high-definition video, is ultimately stored as a massive sequence of 0s and 1s representing electrical on/off states." },
    { question: "How does binary math work?", answer: "Binary addition follows four simple rules: 0+0=0, 1+0=1, 0+1=1, and 1+1=10 (which means write down 0 and carry over the 1). It works exactly like standard decimal addition, but instead of carrying over when you hit 10, you carry over when you hit 2." },
    { question: "What are bitwise operations (AND, OR, XOR)?", answer: "Bitwise operations compare two binary numbers bit-by-bit. AND outputs 1 only if both bits are 1. OR outputs 1 if either bit is 1. XOR (Exclusive OR) outputs 1 only if the bits are different (one is 0, the other is 1)." },
    { question: "What do Shift operations do?", answer: "A Left Shift (<<) moves all bits one space to the left, adding a 0 to the right side. Mathematically, this is identical to multiplying the number by 2. A Right Shift (>>) moves all bits one space right, effectively dividing the number by 2." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Binary Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Binary Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Binary Number 1</span>
              </label>
              <div className={wrap}><input type="text" value={val1} onChange={e => setVal1(e.target.value.replace(/[^01]/g, ''))} className={ci} placeholder="e.g. 1010" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Operation</label>
              <div className="grid grid-cols-4 gap-1">
                {['+', '-', '*', '/'].map((o) => (
                  <button key={o} type="button" onClick={() => setOp(o)} className={`h-10 rounded text-base font-bold transition-colors border border-input ${op === o ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                    {o === '*' ? '×' : o === '/' ? '÷' : o}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {['AND', 'OR', 'XOR', 'NOT'].map((o) => (
                  <button key={o} type="button" onClick={() => setOp(o)} className={`h-10 rounded text-xs font-bold transition-colors border border-input ${op === o ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                    {o}
                  </button>
                ))}
                <div className="col-span-1 flex gap-1">
                  <button type="button" onClick={() => setOp('LSHIFT')} className={`flex-1 h-10 rounded text-xs font-bold transition-colors border border-input ${op === 'LSHIFT' ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>&lt;&lt;</button>
                  <button type="button" onClick={() => setOp('RSHIFT')} className={`flex-1 h-10 rounded text-xs font-bold transition-colors border border-input ${op === 'RSHIFT' ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>&gt;&gt;</button>
                </div>
              </div>
            </div>

            <div className={`flex flex-col transition-opacity ${isUnary ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Binary Number 2</span>
              </label>
              <div className={wrap}><input type="text" value={val2} onChange={e => setVal2(e.target.value.replace(/[^01]/g, ''))} className={ci} placeholder="e.g. 0110" disabled={isUnary} /></div>
            </div>

            <div className="flex gap-3 mt-2">
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
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Binary Result</div>
                <div className="text-3xl md:text-5xl font-extrabold text-foreground tracking-[0.1em] font-mono break-all leading-tight">
                  {formatBinary(result.resultBin)}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="flex-1 bg-background border border-border/50 rounded p-3">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Decimal (Base-10)</div>
                    <div className="text-xl font-bold text-foreground font-mono">{result.resultDec}</div>
                  </div>
                  <div className="flex-1 bg-background border border-border/50 rounded p-3">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Hexadecimal (Base-16)</div>
                    <div className="text-xl font-bold text-foreground font-mono">{result.resultHex}</div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Bitwise Breakdown</h3>
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 overflow-x-auto">
                  <div className="font-mono text-lg min-w-max flex flex-col items-end">
                    <div className="tracking-[0.3em]">{formatBinary(result.num1Bin)}</div>
                    {!isUnary && (
                      <div className="flex w-full items-center justify-end">
                        <span className="mr-4 text-primary font-bold">{result.operation}</span>
                        <span className="tracking-[0.3em]">{formatBinary(result.num2Bin || "")}</span>
                      </div>
                    )}
                    {isUnary && (
                      <div className="text-primary font-bold text-sm uppercase self-start w-full text-right mt-1 mb-1">
                        {result.operation}
                      </div>
                    )}
                    <div className="w-full border-b-2 border-foreground my-2"></div>
                    <div className="tracking-[0.3em] font-bold text-primary">{formatBinary(result.resultBin)}</div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Foundation of Computing</h2>
            <p>Every digital device—from your smartphone to supercomputers—operates fundamentally on <strong>binary code</strong>. The binary numeral system (Base-2) uses only two symbols: <code>0</code> and <code>1</code>. In physical hardware, a 1 represents a microscopic transistor being "ON" (allowing electricity to flow), while a 0 represents it being "OFF." By stringing millions of these binary switches together, computers can perform complex arithmetic and logic instantly.</p>

            <h2>Arithmetic Operations</h2>
            <p>Binary arithmetic works identically to standard decimal (Base-10) math, but with fewer digits.</p>
            <ul>
              <li><strong>Addition (+):</strong> <code>0+0=0</code>, <code>1+0=1</code>, <code>0+1=1</code>. The only trick is <code>1+1=10</code> (Write down 0, carry the 1 to the next column).</li>
              <li><strong>Subtraction (-):</strong> Works exactly like decimal subtraction, including "borrowing" from the next column if you try to subtract 1 from 0.</li>
              <li><strong>Multiplication (×):</strong> Extremely simple in binary. You multiply by 1 (copy the number) or multiply by 0 (write zeros). Then add the staggered results together.</li>
            </ul>

            <h2>Bitwise Logic Operations</h2>
            <p>Instead of doing arithmetic, computers often use Logic Gates to compare binary numbers bit-by-bit. This is the core of computer programming and networking (like subnet masking).</p>
            <ul>
              <li><strong>AND:</strong> Compares two bits. The result is 1 <em>only</em> if both bits are 1. Otherwise, it is 0.</li>
              <li><strong>OR:</strong> The result is 1 if <em>either</em> (or both) bits are 1.</li>
              <li><strong>XOR (Exclusive OR):</strong> The result is 1 only if the bits are <em>different</em> (one is 1, the other is 0). If they match, the result is 0. Used heavily in cryptography.</li>
              <li><strong>NOT:</strong> A unary operation that simply flips the bits. Every 1 becomes a 0, and every 0 becomes a 1.</li>
            </ul>

            <h2>Bit Shifting</h2>
            <p>Bit shifting literally moves the entire binary string left or right.</p>
            <ul>
              <li><strong>Left Shift (&lt;&lt;):</strong> Moves bits to the left, appending a 0 to the right. Mathematically, this is a highly efficient way to multiply an integer by 2. (e.g., <code>0011</code> [3 in decimal] shifted left becomes <code>0110</code> [6 in decimal]).</li>
              <li><strong>Right Shift (&gt;&gt;):</strong> Moves bits to the right, discarding the final bit. This effectively divides an integer by 2, dropping any remainder.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/binary-calculator" />
          <PopularCalculators exclude="/calculator/binary-calculator" />
        </div>
      </div>
    </>
  );
};
export default BinaryCalculator;
