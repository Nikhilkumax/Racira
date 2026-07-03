"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

interface HexResult {
  operation: string;
  num1Hex: string;
  num2Hex?: string;
  resultHex: string;
  resultDec: string;
  resultBin: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateHex = (val1: string, val2: string, op: string): HexResult | null => {
  // Clean inputs
  const h1 = val1.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const h2 = val2.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();

  if (!h1) return null;

  try {
    const dec1 = BigInt("0x" + h1);
    let resultDec = BigInt(0);
    
    if (["+", "-", "*", "/", "AND", "OR", "XOR"].includes(op)) {
      if (!h2) return null;
      const dec2 = BigInt("0x" + h2);
      
      switch (op) {
        case "+": resultDec = dec1 + dec2; break;
        case "-": resultDec = dec1 - dec2; break;
        case "*": resultDec = dec1 * dec2; break;
        case "/": 
          if (dec2 === BigInt(0)) return { operation: op, num1Hex: h1, num2Hex: h2, resultHex: "", resultDec: "", resultBin: "", isError: true, errorMsg: "Cannot divide by zero." };
          resultDec = dec1 / dec2; 
          break;
        case "AND": resultDec = dec1 & dec2; break;
        case "OR": resultDec = dec1 | dec2; break;
        case "XOR": resultDec = dec1 ^ dec2; break;
      }
    } else if (op === "NOT") {
      // Bitwise NOT for hex - pad to nearest 4 bits matching input length
      // 1 hex char = 4 bits
      const bitLength = h1.length * 4;
      let binStr = dec1.toString(2).padStart(bitLength, '0');
      let notBin = "";
      for (let i = 0; i < binStr.length; i++) {
        notBin += binStr[i] === "1" ? "0" : "1";
      }
      resultDec = BigInt("0b" + notBin);
      
      return {
        operation: op,
        num1Hex: h1,
        resultHex: resultDec.toString(16).toUpperCase().padStart(h1.length, '0'),
        resultDec: resultDec.toString(),
        resultBin: resultDec.toString(2).padStart(bitLength, '0'),
        isError: false
      };
    } else if (op === "LSHIFT") {
      resultDec = dec1 << BigInt(1);
    } else if (op === "RSHIFT") {
      resultDec = dec1 >> BigInt(1);
    }

    const isNeg = resultDec < BigInt(0);
    const absDec = isNeg ? -resultDec : resultDec;
    
    const resultHex = (isNeg ? "-" : "") + absDec.toString(16).toUpperCase();
    const resultBin = (isNeg ? "-" : "") + absDec.toString(2);

    return {
      operation: op,
      num1Hex: h1,
      num2Hex: h2,
      resultHex,
      resultDec: resultDec.toString(),
      resultBin,
      isError: false
    };

  } catch (e) {
    return { operation: op, num1Hex: h1, resultHex: "", resultDec: "", resultBin: "", isError: true, errorMsg: "Calculation error. Input may be too large." };
  }
};

const HexCalculator = () => {
  const [val1, setVal1] = useState("A5");
  const [val2, setVal2] = useState("3F");
  const [op, setOp] = useState("+");
  const [result, setResult] = useState<HexResult | null>(null);

  const calculate = () => {
    setResult(calculateHex(val1, val2, op));
  };

  useEffect(() => { calculate(); }, [val1, val2, op]);

  const reset = () => {
    setVal1("A5"); setVal2("3F"); setOp("+");
  };

  const isUnary = ["NOT", "LSHIFT", "RSHIFT"].includes(op);

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono uppercase tracking-widest";

  const faqs = [
    { question: "What is Hexadecimal?", answer: "Hexadecimal (Base-16) is a numbering system that uses 16 distinct symbols. It uses the standard numbers 0-9 to represent values zero to nine, and the letters A, B, C, D, E, and F to represent values ten to fifteen." },
    { question: "Why do computers use Hexadecimal?", answer: "Hex is incredibly efficient for human programmers to read binary data. Because 16 is a power of 2 (2⁴), exactly one hexadecimal digit represents exactly four binary digits (bits), known as a 'nibble'. A standard 8-bit byte (e.g., 10100101) can be written perfectly as a 2-digit hex code (A5), making large strings of binary much shorter and easier to debug." },
    { question: "What are common uses for Hex?", answer: "You will frequently see hex codes used to define colors in web design (e.g., #FFFFFF is pure white, #FF0000 is red). Hex is also used extensively in networking to represent MAC addresses, IPv6 addresses, and in memory addresses when debugging computer crashes." },
    { question: "How does Hex addition work?", answer: "It works just like decimal addition, but you carry over at 16 instead of 10. For example, 9 + 1 in decimal is 10. In hex, 9 + 1 is A. If you add F (15) + 1, you hit the Base-16 ceiling, so you write 0 and carry the 1, resulting in 10 (which represents 16 in decimal)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Hex Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hex Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Hex Number 1</label>
              <div className={wrap}><input type="text" value={val1} onChange={e => setVal1(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))} className={ci} placeholder="e.g. A5" /></div>
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
              <label className="text-base font-medium text-foreground mb-1.5">Hex Number 2</label>
              <div className={wrap}><input type="text" value={val2} onChange={e => setVal2(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))} className={ci} placeholder="e.g. 3F" disabled={isUnary} /></div>
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
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Hexadecimal Result</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-muted-foreground font-mono mt-1">0x</span>
                  <div className="text-3xl md:text-5xl font-extrabold text-foreground tracking-widest font-mono break-all leading-tight">
                    {result.resultHex}
                  </div>
                </div>
                
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background border border-border/50 rounded p-4">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Decimal (Base-10)</div>
                    <div className="text-xl font-bold text-foreground font-mono break-all">{result.resultDec}</div>
                  </div>
                  <div className="bg-background border border-border/50 rounded p-4">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Binary (Base-2)</div>
                    <div className="text-xl font-bold text-foreground font-mono break-all">{result.resultBin}</div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Equation Breakdown</h3>
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-5 overflow-x-auto">
                  <div className="font-mono text-xl min-w-max flex flex-col items-end">
                    <div className="tracking-[0.2em]">{result.num1Hex}</div>
                    {!isUnary && (
                      <div className="flex w-full items-center justify-end">
                        <span className="mr-4 text-primary font-bold">{result.operation}</span>
                        <span className="tracking-[0.2em]">{result.num2Hex || ""}</span>
                      </div>
                    )}
                    {isUnary && (
                      <div className="text-primary font-bold text-sm uppercase self-start w-full text-right mt-1 mb-2">
                        {result.operation}
                      </div>
                    )}
                    <div className="w-full border-b-2 border-foreground my-2"></div>
                    <div className="tracking-[0.2em] font-bold text-primary">{result.resultHex}</div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Power of Hexadecimal</h2>
            <p><strong>Hexadecimal (Base-16)</strong> is a numbering system designed to make raw binary code significantly more human-readable. Computers only understand binary (Base-2), meaning long strings of 0s and 1s. However, writing out millions of binary digits is incredibly prone to error for human programmers.</p>
            <p>Hexadecimal solves this problem elegantly. Because 16 is exactly 2⁴, one single hexadecimal digit maps perfectly to four binary digits (a "nibble"). Therefore, an 8-bit byte (like <code>1101 0101</code>) can be compressed down to just two hex characters (<code>D5</code>). This drastically shortens code while retaining an exact, mathematical link to the underlying binary.</p>

            <h2>Counting in Base-16</h2>
            <p>Standard numbers only have 10 digits (0 through 9). Since Base-16 requires 16 unique symbols, mathematicians borrowed the first six letters of the alphabet to fill the gaps:</p>
            <ul>
              <li><strong>0 - 9</strong> represent values zero to nine.</li>
              <li><strong>A</strong> = 10</li>
              <li><strong>B</strong> = 11</li>
              <li><strong>C</strong> = 12</li>
              <li><strong>D</strong> = 13</li>
              <li><strong>E</strong> = 14</li>
              <li><strong>F</strong> = 15</li>
            </ul>
            <p>When counting in hex, you go: 8, 9, A, B, C, D, E, F. Once you run out of symbols at F, you carry the 1 over to the next column, making the next number <strong>10</strong> (which equals 16 in decimal).</p>

            <h2>Where is Hex Used?</h2>
            <p>You interact with hexadecimal code daily without realizing it. The most common applications include:</p>
            <ul>
              <li><strong>Web Colors:</strong> HTML/CSS color codes use hex to define red, green, and blue values. <code>#FF0000</code> means maximum Red (FF), no Green (00), and no Blue (00).</li>
              <li><strong>MAC Addresses:</strong> The unique physical identifier burned into your computer's network card is written in hex (e.g., <code>00:1A:2B:3C:4D:5E</code>).</li>
              <li><strong>Memory Addresses:</strong> When software crashes and displays an error code (like <code>0x000000FF</code>), it is telling the developer the exact physical memory location in RAM where the error occurred, written in hex.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hex-calculator" />
          <PopularCalculators exclude="/calculator/hex-calculator" />
        </div>
      </div>
    </>
  );
};
export default HexCalculator;
