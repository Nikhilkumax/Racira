"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HexResult {
  a: number;
  b: number;
  op: string;
  result: number;
  resultHex: string;
  resultDec: string;
  resultBin: string;
  resultOct: string;
  bitLength: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function parseHex(s: string): number | null {
  const clean = s.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length === 0) return null;
  if (clean.length > 13) return null;
  return parseInt(clean, 16);
}

function opLabel(op: string): string {
  return op === "add" ? "+" : op === "sub" ? "−" : op === "mul" ? "×" : "÷";
}

function toHex(v: number): string {
  return v < 0 ? `−${Math.abs(v).toString(16).toUpperCase()}` : v.toString(16).toUpperCase();
}

function toBin(v: number): string {
  return v < 0 ? `−${Math.abs(v).toString(2)}` : v.toString(2);
}

function toOct(v: number): string {
  return v < 0 ? `−${Math.abs(v).toString(8)}` : v.toString(8);
}

function calcHex(aHex: string, bHex: string, op: string): HexResult {
  const a = parseHex(aHex)!;
  const b = parseHex(bHex)!;
  let result = 0;
  if (op === "add") result = a + b;
  else if (op === "sub") result = a - b;
  else if (op === "mul") result = a * b;
  else result = Math.trunc(a / b);
  const absBitLength = Math.abs(Math.trunc(result)).toString(2).length;

  const breakdown = [
    { label: "First Operand (A)", value: `0x${toHex(a)}` },
    { label: "Second Operand (B)", value: `0x${toHex(b)}` },
    { label: "Operation", value: `A ${opLabel(op)} B` },
    { label: "Result (Hex)", value: `0x${toHex(result)}` },
    { label: "Result (Decimal)", value: result.toString() },
    { label: "Result (Binary)", value: toBin(result) },
    { label: "Result (Octal)", value: toOct(result) },
    { label: "Bit Length", value: `${absBitLength} bits` },
  ];
  const summaryStats = [
    { label: "Hex", value: `0x${toHex(result)}` },
    { label: "Decimal", value: result.toString() },
    { label: "Binary", value: toBin(result) },
    { label: "Octal", value: toOct(result) },
    { label: "A (dec)", value: a.toString() },
    { label: "B (dec)", value: b.toString() },
    { label: "Operation", value: opLabel(op) },
    { label: "Bits", value: `${absBitLength}` },
  ];
  const chartData = [
    { name: "A", value: a, fill: "#8b5cf6" },
    { name: "B", value: b, fill: "#f59e0b" },
    { name: "Result", value: result, fill: "hsl(var(--primary))" },
  ];
  return { a, b, op, result, resultHex: toHex(result), resultDec: result.toString(), resultBin: toBin(result), resultOct: toOct(result), bitLength: absBitLength, breakdown, summaryStats, chartData };
}

const DEFAULTS = { a: "2A", b: "1F", op: "add" };

export default function HexCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [op, setOp] = useState(DEFAULTS.op);
  const [result, setResult] = useState<HexResult | null>(null);

  const errs: string[] = [];
  if (!parseHex(a)) errs.push("First value must be valid hex (0–9, A–F, up to 13 digits).");
  if (!parseHex(b)) errs.push("Second value must be valid hex (0–9, A–F, up to 13 digits).");
  if (op === "div" && parseHex(b) === 0) errs.push("Division by zero is undefined.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHex(a, b, op)); };
  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b); setOp(DEFAULTS.op);
    setResult(calcHex("2A", "1F", "add"));
  };
  useEffect(() => { setResult(calcHex("2A", "1F", "add")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Why use hexadecimal?", answer: "Each hex digit maps exactly to four bits, so hex is a compact, readable shorthand for binary. Memory addresses, color codes, and packet headers are all conventionally written in hex." },
    { question: "How do I convert hex to decimal?", answer: "Each position is a power of 16: 2A = 2×16 + 10 = 42. The calculator shows every result in hex, decimal, binary, and octal simultaneously." },
    { question: "What is the size limit?", answer: "Values up to 13 hex digits (≈ 2⁵²) are supported, which covers every practical use — addresses, colors, and protocol fields. Larger values should be handled with dedicated arbitrary-precision tools." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Hex Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hex Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>First Hex Value</label>
                <div className={inp}><input value={a} onChange={e => setA(e.target.value)} placeholder="e.g. 2A" className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Second Hex Value</label>
                <div className={inp}><input value={b} onChange={e => setB(e.target.value)} placeholder="e.g. 1F" className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Operation</label>
                <select value={op} onChange={e => setOp(e.target.value)} className={sel}>
                  <option value="add">Add (+)</option>
                  <option value="sub">Subtract (−)</option>
                  <option value="mul">Multiply (×)</option>
                  <option value="div">Divide (÷)</option>
                </select>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Result</div>
                <div className="text-4xl font-extrabold tracking-tight break-all">0x{result.resultHex}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.resultDec} decimal · {result.bitLength} bits</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Decimal`, result.resultDec], ["Binary", result.resultBin], ["Octal", result.resultOct]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold break-all">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold break-all ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Operands and Result</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Hexadecimal Arithmetic</h2>
            <p>This <strong>hex calculator</strong> performs addition, subtraction, multiplication, and division on hexadecimal operands, then reports the result in hex, decimal, binary, and octal. Each hex digit stands for exactly four binary bits, which is why hex is the natural shorthand for binary data.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Conversions</h2>
            <p>0x2A equals 42 in decimal: 2×16 plus 10. Binary 101010 and octal 52 encode the same value. Negative results are displayed with a minus sign, and division uses integer truncation like most low-level operations.</p>
            <h2 className="text-2xl font-bold mb-3">Where Hex Appears</h2>
            <p>Memory addresses and debuggers, CSS colors (#RRGGBB), MAC addresses, opcodes, and checksums all use hex. Converting between bases by hand is tedious — this tool makes the round trips instant.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hex-calculator" />
          <PopularCalculators exclude="/calculator/hex-calculator" />
        </div>
      </div>
    </>
  );
}
