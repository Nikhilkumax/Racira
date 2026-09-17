"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NumInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

function NumInput({ label, value, onChange, min = 0, max = 99999999, step = 1, suffix, prefix }: NumInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(min);
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className={`input-calc ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

const fmt = (n: number) => "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function RoiCalculator() {
  const [initial, setInitial] = useState(10000);
  const [finalValue, setFinalValue] = useState(15000);
  const [years, setYears] = useState(3);
  const [costs, setCosts] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const totalCost = initial + costs;
  const valid = totalCost > 0;
  const netProfit = finalValue - totalCost;
  const roi = valid ? (netProfit / totalCost) * 100 : 0;
  const annualized = valid && years > 0 && finalValue > 0 ? (Math.pow(finalValue / totalCost, 1 / years) - 1) * 100 : 0;
  const multiple = valid ? finalValue / totalCost : 0;

  const chartData = [
    { name: "Cost", value: Math.round(totalCost) },
    { name: "Net Profit", value: Math.round(netProfit) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setInitial(10000);
    setFinalValue(15000);
    setYears(3);
    setCosts(0);
    setShowResults(false);
  };

  const faqs = [
    { question: "What is ROI?", answer: "Return on Investment measures the gain or loss on an investment relative to its cost: (final value − total cost) ÷ total cost × 100. A $15,000 sale on a $10,000 investment is a 50% ROI — it tells you how efficiently your money worked, not just how much it grew." },
    { question: "What is annualized ROI (CAGR)?", answer: "It converts total ROI into a per-year compound rate: (final ÷ cost)^(1/years) − 1. A 50% total return over 3 years is only 14.5% per year. Annualizing is the only fair way to compare investments held for different lengths of time." },
    { question: "What costs count in the denominator?", answer: "Everything you put in: the purchase price plus commissions, fees, taxes, renovation, and carrying costs. Forgetting fees is the most common ROI mistake — a $10,000 stock purchase with $500 of fees is really an $10,500 cost, lowering your return." },
    { question: "What is a good ROI?", answer: "It depends on risk and time. The S&P 500 has historically returned about 10% per year (7% after inflation); doubling that is exceptional. Real estate and startups demand higher expected returns because they carry more risk, illiquidity, and effort." },
    { question: "What is the difference between ROI and multiple?", answer: "Multiple is final value ÷ cost — a 2.0× multiple means you got back double your money. ROI expresses the same thing as a percentage over 100%: 2.0× equals 100% ROI. Venture capitalists quote multiples; retail investors usually quote ROI or CAGR." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <TrendingUp className="w-4 h-4" /> Return on Investment
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Initial Investment" value={initial} onChange={setInitial} min={0} max={99999999} step={100} prefix="$" />
              <NumInput label="Final Value" value={finalValue} onChange={setFinalValue} min={0} max={99999999} step={100} prefix="$" />
              <NumInput label="Investment Period" value={years} onChange={setYears} min={1} max={50} step={1} suffix="yrs" />
              <NumInput label="Additional Costs" value={costs} onChange={setCosts} min={0} max={99999999} step={100} prefix="$" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total ROI</p>
                  <p className="text-4xl font-bold text-primary mt-1">{roi.toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(netProfit)} net profit on {fmt(totalCost)} · {annualized.toFixed(2)}% annualized
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold text-primary">{fmt(netProfit)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Annualized ROI</p>
                    <p className="text-2xl font-bold text-orange-500">{annualized.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Return Multiple</p>
                    <p className="text-2xl font-bold text-green-600">{multiple.toFixed(2)}×</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Total ROI</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{roi.toFixed(2)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Initial Investment</td>
                        <td className="py-2.5 px-3 text-right">{fmt(initial)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Additional Costs</td>
                        <td className="py-2.5 px-3 text-right">{fmt(costs)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Cost Basis</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalCost)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Final Value</td>
                        <td className="py-2.5 px-3 text-right">{fmt(finalValue)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Net Profit</td>
                        <td className="py-2.5 px-3 text-right">{fmt(netProfit)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Annualized ROI (CAGR)</td>
                        <td className="py-2.5 px-3 text-right">{annualized.toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Cost vs. Profit</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Cost Basis</span>
                      <span className="font-medium">{fmt(totalCost)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Final Value</span>
                      <span className="font-medium">{fmt(finalValue)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Total ROI</span>
                      <span className="font-medium">{roi.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annualized</span>
                      <span className="font-medium">{annualized.toFixed(2)}%/yr</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Holding Period</span>
                      <span className="font-medium">{years} years</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Multiple</span>
                      <span className="font-medium">{multiple.toFixed(2)}×</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your investment, final value, and holding period, then click <strong className="text-foreground">Calculate</strong> to see your total and annualized ROI.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Measure Return on Investment</h2>
            <p>Total ROI = (final value − total cost) ÷ total cost × 100, where total cost includes the initial investment plus any additional costs. Annualized ROI converts that into a per-year CAGR — (final ÷ cost)^(1/years) − 1 — so investments held for different periods can be compared fairly.</p>
            <h3>Worked Example</h3>
            <p>Buying $10,000 of stock and selling for $15,000 three years later is a 50% total ROI but only a 14.5% annualized return. A 60% return over 2 years (26.5% annualized) is actually the better investment despite the lower headline number.</p>
            <h3>Common Pitfalls</h3>
            <p>Ignore fees and taxes and you overstate returns; ignore holding period and you cannot compare assets. Always annualize, always include every cost, and remember ROI says nothing about risk — a 20% return on a startup and a 20% return on Treasury bonds are not equivalent achievements.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roi-calculator" />
          <PopularCalculators exclude="/calculator/roi-calculator" />
        </div>
      </div>
    </>
  );
}
