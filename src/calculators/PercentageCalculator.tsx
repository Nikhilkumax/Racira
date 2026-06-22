"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PercentageCalculator = () => {
  const DEFAULTS = { value: "250", percent: "15" };
  const [value, setValue] = useState(DEFAULTS.value);
  const [percent, setPercent] = useState(DEFAULTS.percent);
  const [result, setResult] = useState<any>(null);

  const calculate = (vV = value, pV = percent) => {
    const v = parseFloat(vV), p = parseFloat(pV);
    if (isNaN(v) || isNaN(p)) return;
    const result1 = (p / 100) * v;
    const resultIncrease = v * (1 + p / 100);
    const resultDecrease = v * (1 - p / 100);
    const reversePercent = v !== 0 ? (p / v) * 100 : 0;
    const chartData = [
      { name: `${p}% of ${v}`, value: parseFloat(result1.toFixed(4)) },
      { name: `+${p}%`, value: parseFloat(resultIncrease.toFixed(4)) },
      { name: `-${p}%`, value: parseFloat(resultDecrease.toFixed(4)) },
    ];
    setResult({
      primary: result1.toFixed(4),
      subtitle: `${p}% of ${v} = ${result1.toFixed(4)}`,
      rows: [
        { label: `${p}% of ${v}`, value: result1.toFixed(4) },
        { label: `${v} increased by ${p}%`, value: resultIncrease.toFixed(4) },
        { label: `${v} decreased by ${p}%`, value: resultDecrease.toFixed(4) },
        { label: `${p} is what % of ${v}?`, value: `${reversePercent.toFixed(4)}%` },
        { label: `${v} is ${p}% of what?`, value: v !== 0 && p !== 0 ? (v / (p / 100)).toFixed(4) : "N/A" },
        { label: "% difference: ${p} vs ${v}", value: `${v !== 0 ? Math.abs((p - v) / v * 100).toFixed(4) : "N/A"}%` },
      ],
      chartData,
      summary: [
        { label: "Input value", value: v },
        { label: "Percentage", value: `${p}%` },
        { label: `${p}% of ${v}`, value: result1.toFixed(4) },
        { label: `${v} + ${p}%`, value: resultIncrease.toFixed(4), border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValue(DEFAULTS.value); setPercent(DEFAULTS.percent); calculate(DEFAULTS.value, DEFAULTS.percent); };

  const faqs = [
    { question: "How do I calculate a percentage of a number?", answer: "Percentage of a number = (Percent / 100) × Number. For 15% of 250: (15/100) × 250 = 37.5." },
    { question: "How do I find what percentage one number is of another?", answer: "Percentage = (Part / Whole) × 100. For example, 37.5 is what percent of 250? (37.5 / 250) × 100 = 15%." },
    { question: "How do I calculate percentage increase/decrease?", answer: "Percentage change = ((New − Old) / Old) × 100. A price rising from $80 to $100: ((100−80)/80) × 100 = 25% increase." },
    { question: "How do I add a percentage to a number?", answer: "New value = Original × (1 + percent/100). For 250 + 15%: 250 × 1.15 = 287.5. To subtract: 250 × (1 − 0.15) = 212.5." },
    { question: "What is the percentage formula?", answer: "P% of X = (P/100) × X. To find the whole from a part: X = Part / (P/100). To find the percent: P% = (Part/Whole) × 100." },
    { question: "How do percentage points differ from percentages?", answer: "A percentage point is an absolute difference between two percentages. If interest rates rise from 5% to 8%, that is 3 percentage points but a 60% relative increase. These are not the same!" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Percentage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Percentage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number (Value)</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="250" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Percentage</label>
              <div className="relative">
                <input type="number" value={percent} onChange={e => setPercent(e.target.value)}
                  className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="15" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{percent}% of {value}</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">All Percentage Calculations</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Visual Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Percentage Calculator?</h2>
            <p>A percentage calculator solves all common percentage problems in one place: finding a percentage of a number, increasing or decreasing a value by a percentage, finding what percentage one number is of another, and working backwards to find the whole. Pre-filled with 15% of 250, the calculator shows 37.5 along with all related calculations including increase (287.5) and decrease (212.5) results.</p>
            <p>Percentage calculations are among the most frequently needed in everyday life: calculating tips and discounts, understanding tax rates, tracking investment returns, analyzing test scores, interpreting statistics, and comparing quantities across different scales.</p>
            <h2>The Core Percentage Formula</h2>
            <p><strong>Percentage of a Number: Result = (P / 100) × N</strong></p>
            <p>For 15% of 250: (15/100) × 250 = 0.15 × 250 = 37.5. The multiplier 0.15 is the decimal form of 15%. This calculator shows the multiplier-based approach that makes mental math faster — "15% off" means multiply by 0.85, "25% more" means multiply by 1.25.</p>
            <h2>Percentage Change Formula</h2>
            <p><strong>Percentage Change = ((New − Old) / |Old|) × 100</strong></p>
            <p>For a stock rising from $80 to $100: ((100 − 80) / 80) × 100 = 25% increase. For a salary cut from $60,000 to $54,000: ((54,000 − 60,000) / 60,000) × 100 = −10% decrease.</p>
            <h2>Reverse Percentage: Finding the Original</h2>
            <p>If a discounted price is $85 after a 15% reduction, what was the original? Original = $85 / (1 − 0.15) = $85 / 0.85 = $100. This "reverse percentage" calculation is essential for verifying advertised discounts and working out pre-tax prices from tax-inclusive amounts.</p>
            <h2>Percentage Points vs Percentages</h2>
            <p>This distinction trips up many people. If unemployment rises from 5% to 8%, that is an increase of 3 percentage points, but a 60% relative increase ((8−5)/5 × 100 = 60%). Politicians and media often confuse or deliberately conflate these two measures. "The interest rate doubled" (from 1% to 2%) sounds more dramatic than "the interest rate increased by 1 percentage point."</p>
            <h2>Practical Examples</h2>
            <p><strong>Restaurant tip:</strong> 15% tip on $250 bill: 0.15 × 250 = $37.50. Total with tip: $287.50. Quick mental math: 10% = $25, add half of that ($12.50) = $37.50. <strong>Sales tax:</strong> 8% tax on $250 purchase: 250 × 1.08 = $270. Tax amount = $20. <strong>Investment return:</strong> Portfolio grows from $10,000 to $12,500. Return: ((12,500 − 10,000) / 10,000) × 100 = 25%. Use the <a href="/calculator/investment-calculator">investment calculator</a> for compound return analysis.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>The breakdown table solves six common percentage problems simultaneously so you don&apos;t need to run separate calculations for each scenario. The bar chart visually compares the base value, percentage-of value, increased value, and decreased value for quick comprehension. Pair with the <a href="/calculator/discount-calculator">discount calculator</a> for shopping scenarios or the <a href="/calculator/tip-calculator">tip calculator</a> for restaurant math.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentage-calculator" />
          <PopularCalculators exclude="/calculator/percentage-calculator" />
        </div>
      </div>
    </>
  );
};
export default PercentageCalculator;
