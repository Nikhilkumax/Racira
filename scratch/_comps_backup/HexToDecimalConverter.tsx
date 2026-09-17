"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HexToDecResult {
  hex: string;
  decimal: bigint;
  binary: string;
  octal: string;
  bitLength: number;
  byteLength: number;
  highByte: number;
  lowByte: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function parseHex(s: string): bigint | null {
  const clean = s.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length === 0) return null;
  return BigInt(`0x${clean}`);
}

function calcHexToDec(s: string): HexToDecResult {
  const clean = s.trim().replace(/^0x/i, "").toUpperCase();
  const decimal = parseHex(s)!;
  const binary = decimal.toString(2);
  const octal = decimal.toString(8);
  const bitLength = binary.length;
  const byteLength = Math.ceil(bitLength / 8);
  const num = Number(decimal);
  const highByte = byteLength <= 2 ? Math.floor(num / 256) : 0;
  const lowByte = byteLength <= 2 ? num % 256 : 0;

  const breakdown = [
    { label: "Hexadecimal", value: `0x${clean}` },
    { label: "Decimal", value: decimal.toString() },
    { label: "Binary", value: binary },
    { label: "Octal", value: octal },
    { label: "Bit Length", value: `${bitLength} bits (${byteLength} byte${byteLength > 1 ? "s" : ""})` },
    { label: "High Byte", value: byteLength <= 2 ? `0x${highByte.toString(16).toUpperCase()} (${highByte})` : "—" },
    { label: "Low Byte", value: byteLength <= 2 ? `0x${lowByte.toString(16).toUpperCase()} (${lowByte})` : "—" },
    { label: "Signed 16-bit", value: byteLength <= 4 ? `${num > 32767 ? num - 65536 : num}` : "—" },
  ];
  const summaryStats = [
    { label: "Decimal", value: decimal.toString() },
    { label: "Binary", value: binary },
    { label: "Octal", value: octal },
    { label: "Bits", value: `${bitLength}` },
    { label: "Bytes", value: `${byteLength}` },
    { label: "Hex", value: `0x${clean}` },
    { label: "High Byte", value: byteLength <= 2 ? `0x${highByte.toString(16).toUpperCase()}` : "—" },
    { label: "Low Byte", value: byteLength <= 2 ? `0x${lowByte.toString(16).toUpperCase()}` : "—" },
  ];
  const chartData = byteLength <= 2
    ? [
        { name: "High Byte", value: highByte, fill: "#8b5cf6" },
        { name: "Low Byte", value: lowByte, fill: "hsl(var(--primary))" },
      ]
    : [{ name: "Value", value: Math.min(Number(decimal), 1000000), fill: "hsl(var(--primary))" }];
  return { hex: `0x${clean}`, decimal, binary, octal, bitLength, byteLength, highByte, lowByte, breakdown, summaryStats, chartData };
}

const DEFAULTS = { hex: "1A3F" };

export default function HexToDecimalConverter() {
  const [hex, setHex] = useState(DEFAULTS.hex);
  const [result, setResult] = useState<HexToDecResult | null>(null);

  const errs: string[] = [];
  if (!parseHex(hex)) errs.push("Enter a valid hexadecimal number (0–9, A–F).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHexToDec(hex)); };
  const reset = () => {
    setHex(DEFAULTS.hex);
    setResult(calcHexToDec("1A3F"));
  };
  useEffect(() => { setResult(calcHexToDec("1A3F")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I convert hex to decimal?", answer: "Treat each position as a power of 16. For 1A3F: 1×4096 + 10×256 + 3×16 + 15 = 6719. This calculator does the expansion for you." },
    { question: "Why does hex map so cleanly to binary?", answer: "Sixteen is a power of two, so every hex digit equals exactly four bits: 0x1A3F → 0001 1010 0011 1111. Reading binary in hex is like reading it in 4-bit groups." },
    { question: "What does the signed 16-bit row mean?", answer: "A 16-bit value can be interpreted as unsigned (0–65,535) or two's-complement signed (−32,768 to 32,767). Values above 32,767 wrap negative in the signed interpretation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Hex to Decimal Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hex to Decimal Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Hexadecimal Value</label>
              <div className={inp}><input value={hex} onChange={e => setHex(e.target.value)} placeholder="e.g. 1A3F" className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Decimal Value</div>
                <div className="text-4xl font-extrabold tracking-tight break-all">{result.decimal.toString()}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.hex} · {result.bitLength} bits / {result.byteLength} bytes</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Binary`, result.binary.length > 24 ? `${result.binary.slice(0, 24)}…` : result.binary], ["Octal", result.octal], ["Bits", `${result.bitLength}`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold break-all ${i === 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Byte Breakdown</h3>
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
            <h2 className="text-2xl font-bold mb-3">Hex to Decimal Expansion</h2>
            <p>This <strong>hex to decimal converter</strong> expands each hex digit as a power of 16 — 1A3F = 1×16³ + A×16² + 3×16 + F — and reports the result in decimal, binary, and octal simultaneously. The arithmetic uses arbitrary precision, so even hundreds of hex digits convert exactly.</p>
            <h2 className="text-2xl font-bold mb-3">The 4-Bit Mapping</h2>
            <p>Because 16 = 2⁴, every hex digit is exactly four bits. 0x1A3F reads as binary 0001 1010 0011 1111, which is why hex is the standard notation for firmware dumps, color values, and memory addresses.</p>
            <h2 className="text-2xl font-bold mb-3">Byte and Word Views</h2>
            <p>For values up to two bytes, the calculator splits the high and low bytes and shows the signed 16-bit interpretation — useful when checking endianness, struct layouts, or protocol fields.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hex-to-decimal-converter" />
          <PopularCalculators exclude="/calculator/hex-to-decimal-converter" />
        </div>
      </div>
    </>
  );
}
