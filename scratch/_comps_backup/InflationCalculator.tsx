"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface InflationResult {
  amount: number;
  rate: number;
  years: number;
  futureValue: number;
  cumulativePct: number;
  totalIncrease: number;
  realValue: number;
  powerLossPct: number;
  curve: { year: number; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; value: number }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcInflation(amount: number, rate: number, years: number): InflationResult {
  const futureValue = amount * Math.pow(1 + rate / 100, years);
  const cumulativePct = (Math.pow(1 + rate / 100, years) - 1) * 100;
  const totalIncrease = futureValue - amount;
  const realValue = amount / Math.pow(1 + rate / 100, years);
  const powerLossPct = (1 - 1 / Math.pow(1 + rate / 100, years)) * 100;

  const curve: { year: number; value: number }[] = [];
  for (let y = 0; y <= years; y++) {
    curve.push({ year: y, value: Math.round(amount * Math.pow(1 + rate / 100, y) * 100) / 100 });
  }

  const breakdown = [
    { label: "Initial Amount", value: fmt$(amount) },
    { label: "Annual Inflation Rate", value: `${rate}%` },
    { label: "Time Period", value: `${years} years` },
    { label: "Future Buying Power", value: fmt$(futureValue) },
    { label: "Cumulative Inflation", value: `${cumulativePct.toFixed(2)}%` },
    { label: "Increase in Amount", value: fmt$(totalIncrease) },
    { label: "Today's Value of Future $", value: fmt$(realValue) },
    { label: "Purchasing Power Lost", value: `${powerLossPct.toFixed(1)}%` },
  ];
  const summaryStats = [
    { label: "Future Value", value: fmt$(futureValue) },
    { label: "Cumulative Inflation", value: `${cumulativePct.toFixed(2)}%` },
    { label: "Total Increase", value: fmt$(totalIncrease) },
    { label: "Real Value Today", value: fmt$(realValue) },
    { label: "Power Loss", value: `${powerLossPct.toFixed(1)}%` },
    { label: "Rate", value: `${rate}%` },
    { label: "Years", value: `${years}` },
    { label: "Initial", value: fmt$(amount) },
  ];
  return { amount, rate, years, futureValue, cumulativePct, totalIncrease, realValue, powerLossPct, curve, breakdown, summaryStats, chartData: curve };
}

const DEFAULTS = { amount: "10000", rate: "3", years: "10" };

export default function InflationCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<InflationResult | null>(null);

  const am = parseFloat(amount) || 0;
  const rt = parseFloat(rate) || 0;
  const yr = parseInt(years) || 0;
  const errs: string[] = [];
  if (am <= 0) errs.push("Initial amount must be greater than 0.");
  if (rt < 0 || rt > 100) errs.push("Inflation rate must be between 0% and 100%.");
  if (yr < 1 || yr > 100) errs.push("Years must be 1–100.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcInflation(am, rt, yr)); };
  const reset = () => {
    setAmount(DEFAULTS.amount); setRate(DEFAULTS.rate); setYears(DEFAULTS.years);
    setResult(calcInflation(10000, 3, 10));
  };
  useEffect(() => { setResult(calcInflation(10000, 3, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What does the future value mean?", answer: "It is the amount of money needed in the future to buy what $X buys today. At 3% inflation, $10,000 today equals $13,439 in ten years." },
    { question: "How is cumulative inflation calculated?", answer: "Cumulative inflation compounds: (1 + r)ⁿ − 1. Ten years at 3% is 34.4% total, not 30% — compounding adds the inflation on inflation." },
    { question: "Where can I find real inflation data?", answer: "The US Bureau of Labor Statistics publishes CPI figures monthly. Long-run averages hover around 2–3%, but short periods can spike well above that." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Inflation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Inflation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Initial Amount</label>
                <div className={inp}><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Annual Inflation Rate</label>
                <div className={inp}><input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Time Period</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">years</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Future Buying Power</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.futureValue)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt$(result.amount)} in {result.years} years at {result.rate}% · cumulative {result.cumulativePct.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Cumulative Inflation`, `${result.cumulativePct.toFixed(1)}%`], ["Total Increase", fmt$(result.totalIncrease)], ["Power Lost", `${result.powerLossPct.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Inflation Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Buying Power Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => [fmt$(v), "Buying power"]} labelFormatter={(l: number) => `Year ${l}`} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
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
            <h2 className="text-2xl font-bold mb-3">Compounding Inflation</h2>
            <p>This <strong>inflation calculator</strong> compounds an annual rate over the period: future value = amount × (1 + r)ⁿ. Because inflation compounds, a decade at 3% erodes 34% of buying power — noticeably more than the naive 30% sum.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Both Directions</h2>
            <p>The forward number shows what tomorrow's money buys; the reverse shows that $13,439 ten years from now is worth only $10,000 today. Retirement and savings goals need the second view — target amounts must inflate, not stay flat.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Around It</h2>
            <p>Long-term CPI averages 2–3%, so use 3% for conservative planning. Investments only grow real wealth when their return exceeds inflation — the difference is your real, after-inflation gain.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inflation-calculator" />
          <PopularCalculators exclude="/calculator/inflation-calculator" />
        </div>
      </div>
    </>
  );
}
