"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Percent } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FractionResult {
  decimal: number;
  numerator: number;
  denominator: number;
  whole: number;
  fractionText: string;
  mixedText: string;
  percentage: string;
  chartData: { name: string; value: number }[];
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { const t = y; y = x % y; x = t; }
  return x || 1;
}

function calcFraction(input: string): FractionResult | null {
  const decimal = parseFloat(input);
  if (isNaN(decimal) || decimal < 0) return null;
  const precision = 1000000;
  const scale = Math.pow(10, Math.min(6, (input.split(".")[1] || "").length || (String(decimal).split(".")[1] || "").length));
  const rawNum = Math.round(decimal * precision);
  const g = gcd(rawNum, precision);
  let numerator = rawNum / g;
  let denominator = precision / g;
  const whole = Math.floor(numerator / denominator);
  numerator = numerator % denominator;
  if (numerator === 0) { denominator = 1; }
  const fractionText = whole === 0 ? `${numerator}/${denominator}` : numerator === 0 ? `${whole}` : `${numerator}/${denominator}`;
  const mixedText = whole === 0 ? `${numerator}/${denominator}` : numerator === 0 ? `${whole}` : `${whole} ${numerator}/${denominator}`;
  const chartData = [
    { name: "Shaded (Numerator)", value: numerator },
    { name: "Remainder", value: denominator - numerator },
  ];
  return { decimal, numerator, denominator, whole, fractionText, mixedText, percentage: `${(decimal * 100).toFixed(2)}%`, chartData };
}

const DEFAULTS = { decimal: "0.75" };

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground) / 0.25)"];

const faqs = [
  { question: "How is a decimal converted to a fraction?", answer: "The decimal is written over a power of ten (e.g., 0.75 = 75/100), then reduced to lowest terms by dividing numerator and denominator by their greatest common divisor: 75/100 → 3/4." },
  { question: "What is a mixed number?", answer: "A mixed number combines a whole part and a fraction, like 2 1/4 (= 9/4). It is shown when the decimal is greater than one (e.g., 2.25)." },
  { question: "Are repeating decimals handled?", answer: "Repeating decimals like 1/3 = 0.333… are approximated at 6 decimal places of precision. For exact results with repeating patterns, use the fraction form directly." },
];

export default function DecimalToFractionConverter() {
  const [decimal, setDecimal] = useState(DEFAULTS.decimal);
  const [result, setResult] = useState<FractionResult | null>(() => calcFraction("0.75"));

  const handleCalculate = () => {
    const r = calcFraction(decimal);
    if (r) setResult(r);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleCalculate(); }, []);

  const reset = () => { setDecimal(DEFAULTS.decimal); const r = calcFraction(DEFAULTS.decimal); if (r) setResult(r); };
  const invalid = isNaN(parseFloat(decimal)) || parseFloat(decimal) < 0;

  const breakdown = result ? [
    { label: "Decimal Input", value: `${result.decimal}` },
    { label: "Fraction", value: result.fractionText, highlight: true },
    { label: "Mixed Number", value: result.mixedText },
    { label: "Numerator", value: `${result.numerator}` },
    { label: "Denominator", value: `${result.denominator}` },
    { label: "Percentage", value: result.percentage },
  ] : [];

  const summaryStats = result ? [
    { label: "Fraction", value: result.fractionText },
    { label: "Mixed Number", value: result.mixedText },
    { label: "Numerator", value: `${result.numerator}` },
    { label: "Denominator", value: `${result.denominator}` },
    { label: "Decimal", value: `${result.decimal}` },
    { label: "Percentage", value: result.percentage },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Decimal to Fraction Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Decimal to Fraction Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="df-decimal" className="block text-sm font-medium mb-1 text-foreground">Decimal Value</label>
              <input id="df-decimal" type="number" min="0" step="0.01" value={decimal} onChange={(e) => setDecimal(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Percent className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative decimal.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Fraction</div>
                  <div className="text-4xl font-extrabold text-primary">{result.fractionText}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.decimal} = {result.percentage} · mixed form: {result.mixedText}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Numerator</div>
                    <div className="text-lg font-bold text-primary">{result.numerator}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Denominator</div>
                    <div className="text-lg font-bold text-primary">{result.denominator}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Mixed Number</div>
                    <div className="text-lg font-bold text-primary">{result.mixedText}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Form</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {breakdown.map((row) => (
                        <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                          <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Fraction as Parts of a Whole</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                        {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} part${v === 1 ? "" : "s"} of ${result.denominator}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {summaryStats.map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold">{s.value}</span>
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
            <h2 className="text-2xl font-bold mb-3">About the Decimal to Fraction Converter</h2>
            <p>Every terminating decimal is a fraction with a power of ten as the denominator: 0.75 = 75/100. Dividing both terms by the greatest common divisor yields the simplest form, 3/4. Values above one are also shown as mixed numbers (whole + fraction).</p>
            <h3>Precision Note</h3>
            <p>Conversion works at up to 6 decimal places of precision. Because 1/3 = 0.333… repeats forever, entering 0.333 gives 333/1000 — close but not exactly 1/3. For exact ratios, prefer entering the fraction directly or a terminating decimal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/decimal-to-fraction-converter" />
          <PopularCalculators exclude="/calculator/decimal-to-fraction-converter" />
        </div>
      </div>
    </>
  );
}
