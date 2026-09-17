"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BitwiseResult {
  resultDec: string;
  resultBin: string;
  resultHex: string;
  bitCount: number;
  setBits: number;
  error: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const BITS = 8;

function to8Bit(dec: bigint): string {
  const neg = dec < BigInt(0);
  const abs = neg ? -dec : dec;
  const bin = abs.toString(2).padStart(BITS, "0");
  if (!neg) return bin.slice(-BITS);
  // two's complement
  const flipped = bin.split("").map(b => (b === "0" ? "1" : "0")).join("");
  const plusOne = (BigInt("0b" + flipped) + BigInt(1)).toString(2).padStart(BITS, "0");
  return plusOne.slice(-BITS);
}

function from8Bit(bin: string): bigint {
  if (bin[0] === "0") return BigInt("0b" + bin);
  return BigInt("0b" + bin) - BigInt(256);
}

function calcBitwise(aDec: number, bDec: number, op: string): BitwiseResult {
  let a = Math.trunc(aDec) || 0;
  let b = Math.trunc(bDec) || 0;
  if (a < -128) a = -128;
  if (a > 127) a = 127;
  if (b < -128) b = -128;
  if (b > 127) b = 127;

  const binA = to8Bit(BigInt(a));
  const binB = to8Bit(BigInt(b));

  let resultDec = BigInt(0);
  let resultBin = "";

  switch (op) {
    case "AND": resultBin = (BigInt(binA) & BigInt(binB)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case "OR": resultBin = (BigInt(binA) | BigInt(binB)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case "XOR": resultBin = (BigInt(binA) ^ BigInt(binB)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case "NAND": resultBin = (~(BigInt(binA) & BigInt(binB)) & BigInt(255)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case "NOR": resultBin = (~(BigInt(binA) | BigInt(binB)) & BigInt(255)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case "NOT": resultBin = (~BigInt(binA) & BigInt(255)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case "<<1": resultBin = (BigInt(binA) << BigInt(1) & BigInt(255)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    case ">>1": resultBin = (BigInt(binA) >> BigInt(1)).toString(2).padStart(BITS, "0"); resultDec = from8Bit(resultBin); break;
    default: return { resultDec: "", resultBin: "", resultHex: "", bitCount: 0, setBits: 0, error: "Invalid operation.", chartData: [], breakdown: [], summaryStats: [] };
  }

  const bitValues = resultBin.split("").map((ch, i) => ({ name: `Bit ${BITS - 1 - i}`, value: ch === "1" ? 2 ** (BITS - 1 - i) : 0 }));

  return {
    resultDec: resultDec.toString(),
    resultBin,
    resultHex: resultDec.toString(16).toUpperCase(),
    bitCount: BITS,
    setBits: resultBin.split("").filter(ch => ch === "1").length,
    error: "",
    chartData: bitValues.filter(d => d.value > 0),
    breakdown: [
      { label: "A (8-bit)", value: binA },
      { label: "B (8-bit)", value: op === "NOT" || op === "<<1" || op === ">>1" ? "— (unary)" : binB },
      { label: "Operation", value: op },
      { label: "Result (8-bit)", value: resultBin },
      { label: "Result (Decimal)", value: resultDec.toString() },
      { label: "Result (Hex)", value: resultDec.toString(16).toUpperCase() },
      { label: "Set Bits", value: `${resultBin.split("").filter(ch => ch === "1").length} of ${BITS}` },
    ],
    summaryStats: [
      { label: "Decimal", value: resultDec.toString() },
      { label: "Hex", value: resultDec.toString(16).toUpperCase() },
      { label: "Set Bits", value: `${resultBin.split("").filter(ch => ch === "1").length}/${BITS}` },
      { label: "Unsigned Value", value: `${BigInt("0b" + resultBin).toString()}` },
      { label: "Bit Length", value: `${BITS} bits` },
      { label: "MSB", value: resultBin[0] === "1" ? "1 (negative)" : "0 (positive)" },
    ],
  };
}

const DEFAULTS = { a: "12", b: "10", op: "AND" };

export default function BitwiseOperationsCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [op, setOp] = useState(DEFAULTS.op);
  const [result, setResult] = useState<BitwiseResult>(() => calcBitwise(12, 10, "AND"));

  const isUnary = op === "NOT" || op === "<<1" || op === ">>1";

  const calculate = () => setResult(calcBitwise(parseFloat(a) || 0, parseFloat(b) || 0, op));
  const reset = () => { setA(DEFAULTS.a); setB(DEFAULTS.b); setOp(DEFAULTS.op); setResult(calcBitwise(12, 10, "AND")); };
  useEffect(() => { setResult(calcBitwise(12, 10, "AND")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "What are bitwise operations?", answer: "Bitwise operations work directly on the binary representation of numbers, comparing or transforming bits one position at a time. AND, OR, and XOR are the core logic gates; NOT flips every bit; and shifts move the whole bit pattern left or right, which multiplies or divides by powers of two." },
    { question: "What is the AND operation?", answer: "A & B produces a 1 only where both operands have a 1. It is used to mask bits — keeping the positions you want and zeroing the rest. For example, 12 & 10 = 8 because only the 8-bit position is set in both." },
    { question: "What is the XOR operation?", answer: "A XOR B produces a 1 where the operands differ. It is the basis of many checksums, encryption schemes, and the 'swap two variables without a temp' trick, because XOR is its own inverse: (A XOR B) XOR B = A." },
    { question: "What does shifting left do?", answer: "Left shift (<< 1) moves every bit one position left and appends a 0, which multiplies the number by 2. Right shift (>> 1) moves bits right and discards the lowest bit, which divides by 2 (floor)." },
    { question: "How does NOT work in 8 bits?", answer: "NOT flips every bit in the fixed-width representation. In 8 bits, NOT 00001100 (12) becomes 11110011, which represents −13 in two's complement. The 8-bit signed range is −128 to 127." },
  ];

  const ops = ["AND", "OR", "XOR", "NAND", "NOR", "NOT", "<<1", ">>1"];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Bitwise Operations Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Bitwise Operations Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Number A (−128 to 127)</label>
                <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /></div>
              </div>
              <div className={isUnary ? "opacity-40" : ""}>
                <label className="text-sm font-medium mb-1.5 block">Number B (−128 to 127)</label>
                <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} className={ci} disabled={isUnary} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Operation</label>
              <div className="grid grid-cols-4 gap-1.5">
                {ops.map(o => (
                  <button key={o} onClick={() => setOp(o)} className={`h-9 rounded-md text-xs font-bold border border-input transition-colors ${op === o ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>{o}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result.error ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                <div className="text-sm text-foreground">{result.error}</div>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Result</div>
                  <div className="text-4xl font-extrabold text-primary font-mono">{result.resultBin}</div>
                  <div className="text-sm text-muted-foreground mt-1">Decimal: {result.resultDec} · Hex: 0x{result.resultHex}</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Decimal", result.resultDec], ["Hex", `0x${result.resultHex}`], ["Set Bits", `${result.setBits}/${result.bitCount}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold font-mono">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Operation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 text-right font-semibold font-mono">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Set Bit Values</h3>
                  {result.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => [`2^${Math.round(Math.log2(v))} = ${v}`, "Value"]} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">No bits are set in the result.</p>
                  )}
                </div>
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold font-mono">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Are Bitwise Operations?</h2>
            <p>A <strong>bitwise operations calculator</strong> performs logic on the binary digits of integers. Every operation here works on 8-bit representations: AND, OR, XOR, NAND, and NOR compare the two operands bit by bit; NOT inverts all bits; and the shift operators move the pattern left or right. These are the exact primitives implemented by CPU instruction sets and used throughout low-level programming.</p>
            <h2 className="text-2xl font-bold mb-3">Two's Complement</h2>
            <p>This calculator interprets the 8-bit result as a signed two's complement value, so the range is −128 to 127. When the most significant bit is 1, the value is negative. That is why NOT 12 (00001100) gives 11110011, which reads as −13 — flipping all bits of x always yields −x − 1.</p>
            <h2 className="text-2xl font-bold mb-3">Where Bitwise Logic Is Used</h2>
            <p>Bit masking (AND) isolates flags inside a single byte, XOR powers checksums and light encryption, OR merges option flags, and shifts replace multiplication and division by powers of two. Networking uses bitwise AND for subnet masks, and graphics formats pack color channels with shifts and masks.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bitwise-operations-calculator" />
          <PopularCalculators exclude="/calculator/bitwise-operations-calculator" />
        </div>
      </div>
    </>
  );
}
