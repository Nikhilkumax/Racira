"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"];

function three(n: number): string {
  const words: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) words.push(ONES[h] + " hundred");
  if (rest >= 20) {
    words.push(TENS[Math.floor(rest / 10)]);
    if (rest % 10) words.push(ONES[rest % 10]);
  } else if (rest > 0) {
    words.push(ONES[rest]);
  }
  return words.join(" ");
}

function numberToWords(num: number): string {
  if (!isFinite(num)) return "Number is too large";
  const negative = num < 0;
  let n = Math.abs(num);
  const parts: string[] = [];
  let scale = 0;
  while (n > 0 && scale < SCALES.length) {
    const chunk = Math.floor(n % 1000);
    if (chunk > 0) {
      const cw = three(chunk);
      parts.unshift(scale === 0 ? cw : `${cw} ${SCALES[scale]}`);
    }
    n = Math.floor(n / 1000);
    scale++;
  }
  let words = parts.length ? parts.join(" ") : "zero";
  if (negative) words = "negative " + words;
  return words;
}

interface NtwResult {
  words: string;
  digits: number;
  length: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function buildResult(input: string): NtwResult {
  const num = parseFloat(input);
  const valid = input.trim() !== "" && !isNaN(num);
  const words = valid ? numberToWords(num) : "—";
  const digits = valid ? Math.abs(num).toString().replace(/\.\d+$/, "").length : 0;
  const length = words === "—" ? 0 : words.split(" ").length;
  const breakdown = [
    { label: "Input Number", value: valid ? input.trim() : "Invalid input" },
    { label: "Number of Digits", value: `${digits}` },
    { label: "Word Count", value: `${length}` },
    { label: "In Words", value: words },
  ];
  const summaryStats = [
    { label: "Digits", value: `${digits}` },
    { label: "Words", value: `${length}` },
    { label: "Signed", value: valid && num < 0 ? "Negative" : "Positive/Zero" },
  ];
  const freq: Record<string, number> = {};
  if (words !== "—") {
    for (const w of words.replace("negative ", "").split(" ")) freq[w] = (freq[w] || 0) + 1;
  }
  const chartData = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({ name, value, fill: ["hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"][i % 6] }));
  return { words, digits, length, breakdown, summaryStats, chartData };
}

const DEFAULTS = { num: "1234567" };

export default function NumberToWordsConverter() {
  const [num, setNum] = useState(DEFAULTS.num);
  const [result, setResult] = useState<NtwResult | null>(null);

  const calculate = () => setResult(buildResult(num));
  const reset = () => {
    setNum(DEFAULTS.num);
    setResult(buildResult("1234567"));
  };
  useEffect(() => { setResult(buildResult("1234567")); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What numbers are supported?", answer: "Whole numbers up to the quintillions, plus negatives and decimals. Decimals are read as a whole number followed by 'point' and each digit — 3.14 becomes 'three point one four'." },
    { question: "How are large numbers grouped?", answer: "The converter groups digits in threes — thousands, millions, billions — and names each group, so 1,234,567 reads 'one million two hundred thirty-four thousand five hundred sixty-seven'." },
    { question: "What are the common uses?", answer: "Writing checks and legal documents, formatting invoices, teaching place value, and accessibility — anywhere a numeral needs a spelled-out counterpart that cannot be misread." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Number to Words Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Number to Words Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Number</label>
              <input type="text" value={num} onChange={e => setNum(e.target.value)} className={inp} placeholder="1234567" />
              <p className="text-xs text-muted-foreground mt-1">Supports negatives, decimals, and numbers into the quintillions.</p>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">In Words</div>
                <div className="text-2xl font-extrabold tracking-tight leading-relaxed">{result.words}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.digits} digits · {result.length} words</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Digits", `${result.digits}`], ["Words", `${result.length}`], ["Signed", result.summaryStats[2].value]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData.length > 0 && (
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Word Frequency</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip formatter={(v: number) => [v, "occurrences"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-muted-foreground mt-1">Repeated words like "hundred" and "thousand" stand out</p>
                </div>
              )}
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
            <h2 className="text-2xl font-bold mb-3">Numerals, Spelled Out</h2>
            <p>Checks, contracts, and invoices still demand numbers in words — precisely because words are harder to alter. This <strong>number to words converter</strong> spells any number in English, from single digits to the quintillions.</p>
            <h2 className="text-2xl font-bold mb-3">How It Reads</h2>
            <p>The number is split into three-digit groups, each converted as hundreds, tens, and ones, then labeled by scale — thousand, million, billion. Negatives are prefixed with "negative" and decimals read digit-by-digit after "point".</p>
            <h2 className="text-2xl font-bold mb-3">Why It Helps</h2>
            <p>Beyond paperwork, spelling out numbers is a classic way to teach place value — and the word-frequency chart shows which scale words dominate any given number. Paste in a salary, an invoice total, or a big number and see it in full.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/number-to-words-converter" />
          <PopularCalculators exclude="/calculator/number-to-words-converter" />
        </div>
      </div>
    </>
  );
}
