"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RomanInputs {
  number: string;
}

interface RomanResults {
  number: number;
  roman: string;
  valid: boolean;
  symbolCount: number;
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const ROMAN_SYMBOLS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],
  [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number): string {
  let num = Math.floor(Math.abs(n));
  let out = "";
  for (const [val, sym] of ROMAN_SYMBOLS) {
    while (num >= val) {
      out += sym;
      num -= val;
    }
  }
  return out;
}

function romanToNumber(s: string): number | null {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (const ch of s.toUpperCase()) {
    const v = map[ch];
    if (!v) return null;
    total += v;
    if (v > prev) total -= 2 * prev;
    prev = v;
  }
  return total;
}

function calcRoman(i: RomanInputs): RomanResults {
  const raw = i.number.trim();
  const isNumeric = /^-?\d+$/.test(raw);
  let number = 0;
  let roman = "";
  let valid = true;

  if (isNumeric) {
    number = parseInt(raw, 10);
    if (number < 1 || number > 3999) {
      valid = false;
    } else {
      roman = toRoman(number);
    }
  } else if (raw.length > 0) {
    const parsed = romanToNumber(raw);
    if (parsed === null || parsed < 1 || parsed > 3999 || toRoman(parsed) !== raw.toUpperCase()) {
      valid = false;
    } else {
      number = parsed;
      roman = raw.toUpperCase();
    }
  } else {
    valid = false;
  }

  const thousands = Math.floor(number / 1000);
  const hundreds = Math.floor((number % 1000) / 100);
  const tens = Math.floor((number % 100) / 10);
  const ones = number % 10;

  const breakdown = valid
    ? [
        { label: "Roman Numeral", value: roman, highlight: true, isTotal: true },
        { label: "Arabic Value", value: `${number}` },
        { label: "Thousands", value: `${thousands} = ${toRoman(thousands * 1000)}` },
        { label: "Hundreds", value: `${hundreds} = ${toRoman(hundreds * 100)}` },
        { label: "Tens", value: `${tens} = ${toRoman(tens * 10)}` },
        { label: "Ones", value: `${ones} = ${toRoman(ones)}` },
        { label: "Symbol Count", value: `${roman.length}` },
      ]
    : [{ label: "Input", value: `${raw}`, highlight: true, isTotal: true }];

  const summaryStats = valid
    ? [
        { label: "Roman Numeral", value: roman },
        { label: "Arabic Value", value: `${number}` },
        { label: "Symbol Count", value: `${roman.length}` },
        { label: "Thousands", value: `${thousands}` },
        { label: "Hundreds", value: `${hundreds}` },
        { label: "Tens", value: `${tens}` },
        { label: "Ones", value: `${ones}` },
        { label: "Range", value: "1–3,999" },
      ]
    : [
        { label: "Status", value: "Invalid input" },
        { label: "Accepted", value: "1–3,999 or valid Roman" },
        { label: "Examples", value: "1988, MCMXCVIII" },
        { label: "Range", value: "1–3,999" },
      ];

  return { number, roman, valid, symbolCount: roman.length, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = { number: "1988" };

// 4. Component
export default function RomanNumeralConverter() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RomanResults>(() => calcRoman({ number: "1988" }));

  useEffect(() => {
    setResult(calcRoman({ number: "1988" }));
  }, []);

  const calculate = () => setResult(calcRoman(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRoman({ number: "1988" }));
  };

  const errors: Record<string, string> = {};
  const raw = inputs.number.trim();
  const isNumeric = /^-?\d+$/.test(raw);
  if (!isNumeric && raw.length > 0) {
    const parsed = romanToNumber(raw);
    if (parsed === null || parsed < 1 || parsed > 3999 || toRoman(parsed) !== raw.toUpperCase()) {
      errors.number = "Not a valid Roman numeral (1–3,999)";
    }
  } else if (isNumeric) {
    const n = parseInt(raw, 10);
    if (n < 1 || n > 3999) errors.number = "Must be 1–3,999";
  } else {
    errors.number = "Enter a number or Roman numeral";
  }
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const chartData = result.valid
    ? [
        { name: "Thousands", value: Math.floor(result.number / 1000) },
        { name: "Hundreds", value: Math.floor((result.number % 1000) / 100) },
        { name: "Tens", value: Math.floor((result.number % 100) / 10) },
        { name: "Ones", value: result.number % 10 },
      ]
    : [];

  const faqs = [
    { question: "How do I convert numbers to Roman numerals?", answer: "Break the number into thousands, hundreds, tens, and ones, then map each place to its symbols using subtractive notation: 4 = IV, 9 = IX, 40 = XL, 90 = XC, 400 = CD, 900 = CM. 1988 becomes MCMLXXXVIII — M + CM + LXXX + VIII." },
    { question: "Why is 4 written IV instead of IIII?", answer: "Subtractive notation: a smaller symbol before a larger one means 'subtract', so IV = 5 − 1 = 4. The Romans themselves used IIII on clocks well into the medieval era, but the subtractive standard (IX, XL, XC, CD, CM) is what's taught and expected today." },
    { question: "What's the largest number I can write in Roman numerals?", answer: "With standard symbols, 3,999 (MMMCMXCIX) is the practical maximum — there's no standard symbol for 5,000. The classical system handled millions only by drawing bars over symbols (each bar multiplies by 1,000), which isn't part of everyday conversion." },
    { question: "Can the converter read Roman numerals back to numbers?", answer: "Yes — enter a Roman numeral like MCMXCVIII and the calculator returns 1998. It parses left to right, adding each symbol's value and subtracting when a smaller symbol precedes a larger one. It also validates that the numeral follows proper form, rejecting sequences like IIV or VX." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Roman Numeral Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Roman Numeral Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="number" className={lbl}>Number or Roman Numeral</label>
              <div className={inp}>
                <input id="number" value={inputs.number} onChange={(e) => setInputs({ number: e.target.value })} className={ci} placeholder="e.g. 1988 or MCMLXXXVIII" />
              </div>
              {errors.number && <p className="text-xs text-red-500 font-medium mt-1">{errors.number}</p>}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.valid ? (isNumeric ? "Roman Numeral" : "Arabic Value") : "Conversion Result"}</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight break-all">{result.valid ? (isNumeric ? result.roman : `${result.number}`) : "Invalid input"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.valid ? (isNumeric ? `${result.number} → ${result.roman}` : `${result.roman} → ${result.number}`) : "Enter 1–3,999 or a valid Roman numeral"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {result.valid
                ? [
                    ["Value", `${result.number}`],
                    ["Symbols", `${result.symbolCount}`],
                    ["Thousands", `${Math.floor(result.number / 1000)}`],
                  ].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold text-foreground">{v}</div>
                    </div>
                  ))
                : ["1–3,999", "I, V, X, L, C, D, M", "Subtractive form"].map((v, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{i === 0 ? "Range" : i === 1 ? "Symbols" : "Format"}</div>
                      <div className="text-base font-bold text-foreground">{v}</div>
                    </div>
                  ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Conversion Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Place Values</h3>
              {result.valid ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip formatter={(v: number) => `${v}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Each place converts independently — thousands, hundreds, tens, and ones each become their own symbols.</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Enter a valid input to see the place-value breakdown.</p>
              )}
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Seven Symbols, Additive and Subtractive</h2>
            <p>Roman numerals use just seven symbols — I (1), V (5), X (10), L (50), C (100), D (500), M (1,000) — combined by two rules: add when symbols descend (VI = 6), subtract when a smaller one precedes a larger one (IV = 4). The converter applies both rules in both directions, so 1,988 becomes M + CM + LXXX + VIII = MCMLXXXVIII.</p>
            <h2 className="text-2xl font-bold mb-3">Why Subtract?</h2>
            <p>Subtractive notation (IX instead of VIIII) was the Romans' compression scheme: it shortens numerals and removes ambiguity. The rules are strict — only I, X, and C may precede the next two symbols up (IV, IX, XL, XC, CD, CM) — which is why sequences like IIV or VX are invalid. The converter enforces these exact rules when parsing.</p>
            <h2 className="text-2xl font-bold mb-3">The 3,999 Ceiling</h2>
            <p>With the standard seven symbols, the largest writable number is 3,999 (MMMCMXCIX). Larger numbers required the vinculum — a bar over a symbol multiplying it by 1,000 — which complicates everyday notation. For dates, years, and classic numbering, 1–3,999 covers virtually every practical use, and that's the converter's accepted range.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roman-numeral-converter" />
          <PopularCalculators exclude="/calculator/roman-numeral-converter" />
        </div>
      </div>
    </>
  );
}
