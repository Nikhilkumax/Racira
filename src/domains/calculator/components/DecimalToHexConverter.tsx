"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Binary } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BaseResult {
  decimal: number;
  hex: string;
  binary: string;
  octal: string;
  hexDigits: number;
  binaryDigits: number;
  octalDigits: number;
  decimalDigits: number;
  chartData: { name: string; value: number }[];
}

function calcBases(input: string): BaseResult | null {
  const decimal = parseInt(input, 10);
  if (isNaN(decimal) || decimal < 0) return null;
  const hex = decimal.toString(16).toUpperCase();
  const binary = decimal.toString(2);
  const octal = decimal.toString(8);
  const chartData = [
    { name: "Decimal", value: String(decimal).length },
    { name: "Hex", value: hex.length },
    { name: "Octal", value: octal.length },
    { name: "Binary", value: binary.length },
  ];
  return { decimal, hex, binary, octal, hexDigits: hex.length, binaryDigits: binary.length, octalDigits: octal.length, decimalDigits: String(decimal).length, chartData };
}

const DEFAULTS = { decimal: "255" };

const faqs = [
  { question: "How do I convert decimal to hex?", answer: "Repeatedly divide by 16, collecting remainders from last to first: 255 ÷ 16 = 15 remainder 15, so 255₁₀ = FF₁₆. Remainders 10–15 map to A–F." },
  { question: "Why does the number of digits differ between bases?", answer: "Each base needs fewer digits as it grows: base 2 stores one bit per digit, base 16 stores four. 255 is 3 decimal digits, 2 hex digits, 3 octal digits, and 8 binary digits." },
  { question: "What is hexadecimal used for?", answer: "Hex is compact and maps cleanly to bytes (two digits per byte). It is standard in CSS colors (#FF0000), memory addresses, and machine code listings." },
];

export default function DecimalToHexConverter() {
  const [decimal, setDecimal] = useState(DEFAULTS.decimal);
  const [result, setResult] = useState<BaseResult | null>(() => calcBases("255"));

  useEffect(() => {
    const r = calcBases(decimal);
    if (r) setResult(r);
  }, [decimal]);

  const reset = () => { setDecimal(DEFAULTS.decimal); };
  const invalid = isNaN(parseInt(decimal, 10)) || parseInt(decimal, 10) < 0;

  const breakdown = result ? [
    { label: "Decimal Input", value: `${result.decimal}` },
    { label: "Hexadecimal", value: `0x${result.hex}`, highlight: true },
    { label: "Binary", value: `${result.binary}` },
    { label: "Octal", value: `0o${result.octal}` },
    { label: "Hex Digits", value: `${result.hexDigits}` },
    { label: "Binary Digits (bits)", value: `${result.binaryDigits}` },
    { label: "Decimal Digits", value: `${result.decimalDigits}` },
  ] : [];

  const summaryStats = result ? [
    { label: "Hex", value: `0x${result.hex}` },
    { label: "Binary", value: `${result.binary}` },
    { label: "Octal", value: `0o${result.octal}` },
    { label: "Decimal", value: `${result.decimal}` },
    { label: "Bits", value: `${result.binaryDigits}` },
    { label: "Hex Digits", value: `${result.hexDigits}` },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Decimal to Hex Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Decimal to Hex Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dh-decimal" className="block text-sm font-medium mb-1 text-foreground">Decimal Number</label>
              <input id="dh-decimal" type="number" min="0" step="1" value={decimal} onChange={(e) => setDecimal(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Binary className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative integer.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Hexadecimal</div>
                  <div className="text-4xl font-extrabold text-primary break-all">0x{result.hex}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.decimal}₁₀ = 0x{result.hex} · {result.binaryDigits} bits</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Binary</div>
                    <div className="text-lg font-bold text-primary break-all">{result.binary}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Octal</div>
                    <div className="text-lg font-bold text-primary">0o{result.octal}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Bits</div>
                    <div className="text-lg font-bold text-primary">{result.binaryDigits}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
                          <td className="p-2.5 pr-3 text-right font-semibold break-all">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Digits Needed in Each Base</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [`${v} digits`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {summaryStats.map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold break-all">{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">About the Decimal to Hex Converter</h2>
            <p>Base conversion rewrites the same quantity in a different positional system. Hex uses base 16 with digits 0–9 then A–F, so each hex digit encodes exactly four bits. Converting 255₁₀: 255 ÷ 16 = 15 remainder 15 → FF₁₆.</p>
            <h3>Why Convert?</h3>
            <p>Hex is the human-readable shorthand for binary: a byte is always two hex digits, and grouping binary into nibbles makes long bit patterns legible. Octal (base 8) is the legacy grouping for 3-bit chunks, still used in Unix file permissions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/decimal-to-hex-converter" />
          <PopularCalculators exclude="/calculator/decimal-to-hex-converter" />
        </div>
      </div>
    </>
  );
}
