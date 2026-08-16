"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ConvResult {
  binary: string;
  decimal: string;
  hex: string;
  octal: string;
  bitCount: number;
  error: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function binToDec(binary: string): ConvResult {
  const clean = binary.replace(/[^01]/g, "");
  if (!clean) return { binary: "", decimal: "", hex: "", octal: "", bitCount: 0, error: "Enter a valid binary number (0s and 1s only).", chartData: [], breakdown: [], summaryStats: [] };
  const dec = BigInt("0b" + clean);
  const bits = clean.split("").map((ch, i) => ({ name: `2^${clean.length - 1 - i}`, value: ch === "1" ? (clean.length - 1 - i <= 50 ? 2 ** (clean.length - 1 - i) : Number.MAX_SAFE_INTEGER) : 0 })).filter(b => b.value > 0);
  return {
    binary: clean,
    decimal: dec.toString(),
    hex: dec.toString(16).toUpperCase(),
    octal: dec.toString(8),
    bitCount: clean.length,
    error: "",
    chartData: bits.length > 0 ? bits : [{ name: "0", value: 0 }],
    breakdown: [
      { label: "Binary", value: clean },
      { label: "Decimal", value: dec.toString() },
      { label: "Hexadecimal", value: dec.toString(16).toUpperCase() },
      { label: "Octal", value: dec.toString(8) },
      { label: "Number of Bits", value: `${clean.length}` },
      { label: "Largest Bit Value", value: `2^${clean.length - 1} = ${(BigInt(2) ** BigInt(clean.length - 1)).toString()}` },
    ],
    summaryStats: [
      { label: "Decimal", value: dec.toString().slice(0, 40) + (dec.toString().length > 40 ? "…" : "") },
      { label: "Hex", value: dec.toString(16).toUpperCase() },
      { label: "Octal", value: dec.toString(8) },
      { label: "Bit Count", value: `${clean.length}` },
      { label: "Max Value", value: `2^${clean.length} − 1` },
      { label: "Binary Length", value: `${clean.length} digits` },
    ],
  };
}

function decToBin(decimal: string): ConvResult {
  const clean = decimal.trim().replace(/[^0-9]/g, "");
  if (!clean) return { binary: "", decimal: "", hex: "", octal: "", bitCount: 0, error: "Enter a valid decimal number (digits only).", chartData: [], breakdown: [], summaryStats: [] };
  let dec: bigint;
  try {
    dec = BigInt(clean);
  } catch {
    return { binary: "", decimal: "", hex: "", octal: "", bitCount: 0, error: "Number is too large to convert.", chartData: [], breakdown: [], summaryStats: [] };
  }
  if (dec < BigInt(0)) return { binary: "", decimal: "", hex: "", octal: "", bitCount: 0, error: "Enter a positive decimal number.", chartData: [], breakdown: [], summaryStats: [] };
  const bin = dec.toString(2);
  const bits = bin.split("").map((ch, i) => ({ name: `2^${bin.length - 1 - i}`, value: ch === "1" ? (bin.length - 1 - i <= 50 ? 2 ** (bin.length - 1 - i) : Number.MAX_SAFE_INTEGER) : 0 })).filter(b => b.value > 0);
  return {
    binary: bin,
    decimal: dec.toString(),
    hex: dec.toString(16).toUpperCase(),
    octal: dec.toString(8),
    bitCount: bin.length,
    error: "",
    chartData: bits.length > 0 ? bits : [{ name: "0", value: 0 }],
    breakdown: [
      { label: "Decimal", value: dec.toString() },
      { label: "Binary", value: bin },
      { label: "Hexadecimal", value: dec.toString(16).toUpperCase() },
      { label: "Octal", value: dec.toString(8) },
      { label: "Number of Bits", value: `${bin.length}` },
      { label: "Max Value at Bit Count", value: `2^${bin.length} − 1 = ${(BigInt(2) ** BigInt(bin.length) - BigInt(1)).toString()}` },
    ],
    summaryStats: [
      { label: "Binary", value: bin.length > 40 ? `${bin.slice(0, 40)}…` : bin },
      { label: "Hex", value: dec.toString(16).toUpperCase() },
      { label: "Octal", value: dec.toString(8) },
      { label: "Bit Count", value: `${bin.length}` },
      { label: "Bytes", value: `${Math.ceil(bin.length / 8)}` },
      { label: "Nibbles", value: `${Math.ceil(bin.length / 4)}` },
    ],
  };
}

const DEFAULTS = { mode: "bin-to-dec" as "bin-to-dec" | "dec-to-bin", value: "101010" };

export default function BinaryDecimalCalculator() {
  const [mode, setMode] = useState<"bin-to-dec" | "dec-to-bin">(DEFAULTS.mode);
  const [value, setValue] = useState(DEFAULTS.value);
  const [result, setResult] = useState<ConvResult>(() => binToDec(DEFAULTS.value));

  const calculate = () => setResult(mode === "bin-to-dec" ? binToDec(value) : decToBin(value));
  const reset = () => { setMode(DEFAULTS.mode); setValue(DEFAULTS.value); setResult(binToDec(DEFAULTS.value)); };
  useEffect(() => { setResult(mode === "bin-to-dec" ? binToDec(value) : decToBin(value)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "How do you convert binary to decimal?", answer: "Each binary digit represents a power of two, counting from the rightmost bit (2⁰). Multiply each 1 bit by its power of two and add them together. For example, 1010₂ = 8 + 0 + 2 + 0 = 10." },
    { question: "How do you convert decimal to binary?", answer: "Repeatedly divide the decimal number by 2, recording the remainders, then read the remainders in reverse order. For example, 10 ÷ 2 = 5 remainder 0, 5 ÷ 2 = 2 remainder 1, 2 ÷ 2 = 1 remainder 0, 1 ÷ 2 = 0 remainder 1, giving 1010₂." },
    { question: "Why does computing use binary?", answer: "Computers use two states — on and off — which map perfectly to the digits 1 and 0. Transistors act as tiny switches, and by grouping them into 8-bit bytes, 16-bit words, and larger units, computers can represent any number, character, or instruction." },
    { question: "What is the largest number N bits can hold?", answer: "With N bits you can represent values from 0 to 2^N − 1. An 8-bit byte holds 0–255, a 16-bit word holds 0–65,535, and a 32-bit integer holds 0–4,294,967,295." },
    { question: "Why show hexadecimal and octal too?", answer: "Hex and octal are compact shorthands for binary — one hex digit equals exactly 4 bits and one octal digit equals 3 bits. Programmers use them to read binary values without long strings of 1s and 0s." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Binary Decimal Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Binary Decimal Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
              {([["bin-to-dec", "Binary → Decimal"], ["dec-to-bin", "Decimal → Binary"]] as const).map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)} className={`h-9 rounded-md text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{label}</button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{mode === "bin-to-dec" ? "Binary Number" : "Decimal Number"}</label>
              <div className={inp}><input type="text" value={value} onChange={e => setValue(e.target.value)} className={ci} placeholder={mode === "bin-to-dec" ? "e.g. 101010" : "e.g. 42"} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{mode === "bin-to-dec" ? "Decimal Value" : "Binary Value"}</div>
                  <div className="text-2xl md:text-3xl font-bold text-primary break-all font-mono">{mode === "bin-to-dec" ? result.decimal : result.binary}</div>
                  <div className="text-sm text-muted-foreground mt-1">{mode === "bin-to-dec" ? `From ${result.bitCount} binary digits` : `${result.bitCount} bits · ${Math.ceil(result.bitCount / 8)} bytes`}</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Hex", result.hex], ["Octal", result.octal], ["Bits", `${result.bitCount}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold font-mono break-all">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Conversion Details</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 text-right font-semibold font-mono break-all">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Bit Values (Powers of Two)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(), "Value"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold font-mono break-all">{s.value}</span></div>
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
            <h2 className="text-2xl font-bold mb-3">Binary and Decimal Number Systems</h2>
            <p>A <strong>binary decimal calculator</strong> converts between the base-2 system computers use internally and the base-10 system humans use every day. Binary uses only 0 and 1, where each position represents a power of two; decimal uses ten digits, where each position represents a power of ten. Understanding the conversion is foundational for programming, networking, and computer architecture.</p>
            <h2 className="text-2xl font-bold mb-3">The Conversion Formulas</h2>
            <p>To convert binary to decimal, sum each 1 bit multiplied by 2 raised to its position, counting from the right at 2⁰. To convert decimal to binary, divide by 2 repeatedly and read the remainders in reverse. The calculator also shows the hexadecimal (base-16) and octal (base-8) equivalents — compact shorthands where one hex digit equals four bits and one octal digit equals three.</p>
            <h2 className="text-2xl font-bold mb-3">Why This Matters</h2>
            <p>Every file, image, and program on your computer is ultimately binary. IP addresses are binary converted to dotted decimal, memory addresses are shown in hex, and file permissions use octal. Being able to move fluently between these systems makes debugging and low-level development dramatically easier.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/binary-decimal-calculator" />
          <PopularCalculators exclude="/calculator/binary-decimal-calculator" />
        </div>
      </div>
    </>
  );
}
