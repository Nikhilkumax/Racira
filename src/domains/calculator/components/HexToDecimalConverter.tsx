"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Binary } from "lucide-react";

interface BaseResult {
  hex: string;
  decimal: string;
  binary: string;
  octal: string;
  valid: boolean;
}

function normalizeHex(input: string): string {
  return input.trim().toLowerCase().replace(/^0x/, "").replace(/\s+/g, "");
}

function fromHex(input: string): BaseResult {
  const hex = normalizeHex(input);
  const valid = /^[0-9a-f]+$/.test(hex);
  if (!valid) return { hex, decimal: "—", binary: "—", octal: "—", valid: false };
  const dec = parseInt(hex, 16);
  return {
    hex: hex.toUpperCase(),
    decimal: dec.toLocaleString("en-US"),
    binary: dec.toString(2).padStart(Math.ceil(dec.toString(2).length / 4) * 4, "0"),
    octal: dec.toString(8),
    valid: true,
  };
}

const DEFAULTS = { hex: "FF" };

const faqs = [
  { question: "What is hexadecimal?", answer: "Base-16 uses digits 0–9 plus A–F for 10–15. Each hex digit encodes 4 binary bits, so FF = 15×16 + 15 = 255. Hex is the standard shorthand for bytes — two digits per byte — in programming, color codes, and memory addresses." },
  { question: "How do I convert hex to decimal by hand?", answer: "Multiply each digit by 16 raised to its position (from the right, starting at 0) and sum: 2F = 2×16 + 15 = 47. Position values are 1, 16, 256, 4096… moving left." },
  { question: "Why do programmers use hex?", answer: "A byte is 8 bits, which is exactly two hex digits — 0xFF = 11111111 = 255. Hex is compact and maps cleanly to binary, unlike decimal, which doesn't align with bit boundaries. Memory addresses and color values are naturally written in hex." },
];

export default function HexToDecimalConverter() {
  const [hex, setHex] = useState(DEFAULTS.hex);
  const [result, setResult] = useState<BaseResult>(() => fromHex("FF"));

  const handleCalculate = () => {
    setResult(fromHex(hex));
  };

  const reset = () => {
    setHex(DEFAULTS.hex);
    setResult(fromHex("FF"));
  };

  const breakdown = [
    { label: "Hexadecimal", value: result.valid ? `0x${result.hex}` : "Invalid input", highlight: false },
    { label: "Decimal", value: result.decimal, highlight: true },
    { label: "Binary", value: result.binary, highlight: false },
    { label: "Octal", value: result.octal, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hex to Decimal Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hex to Decimal Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Binary className="w-4 h-4" /> Base Conversion
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Hexadecimal Value</label>
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="input-calc font-mono"
                placeholder="FF or 0xFF"
              />
              <p className="text-xs text-muted-foreground mt-1">Accepts 0x prefix, case-insensitive.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Binary className="w-4 h-4 text-primary" /> DECIMAL VALUE
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary font-mono">{result.decimal}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.valid ? `0x${result.hex} = ${result.binary}₂ in binary.` : "Enter valid hex digits (0–9, A–F)."}
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">All Representations</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Base</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold font-mono">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Common Byte Values</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "0x00", value: "0 (all bits off)" },
                  { label: "0x0F", value: "15 (low nibble set)" },
                  { label: "0x7F", value: "127 (max signed byte)" },
                  { label: "0xFF", value: "255 (max byte)" },
                  { label: "0x100", value: "256" },
                  { label: "0xFFFF", value: "65,535 (max 16-bit)" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-mono">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Hex to Decimal Converter</h2>
            <p>Hexadecimal is base 16: digits 0–9 cover zero through nine, and A–F stand for ten through fifteen. Because 16 is a power of two, every hex digit maps to exactly four binary bits — 0xF = 1111, 0xA = 1010 — which is why hex is the lingua franca of computing. A byte is two hex digits, a 16-bit word is four, and so on.</p>
            <h3>Converting by hand</h3>
            <p>To read a hex number, multiply each digit by powers of 16 from the right: 2F = 2×16 + 15 = 47; A3 = 10×16 + 3 = 163; FF = 15×16 + 15 = 255. The "0x" prefix simply marks the number as hex — 0xFF and FF are the same value. This converter handles arbitrary-length inputs and reports the same number in decimal, binary (nibble-padded), and octal, so you can cross-check any base conversion.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hex-to-decimal-converter" />
          <PopularCalculators exclude="/calculator/hex-to-decimal-converter" />
        </div>
      </div>
    </>
  );
}
