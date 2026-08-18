"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RuleOf70Calculator() {
  const [growthRate, setGrowthRate] = useState("7");
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [showResults, setShowResults] = useState(false);

  const rate = parseFloat(growthRate) || 0;
  const initial = parseFloat(initialInvestment) || 0;
  const yearsToDouble = rate > 0 ? 70 / rate : 0;
  const doubledValue = initial * 2;
  const valueAfter10Years = initial * Math.pow(1 + rate / 100, 10);
  const valueAfter20Years = initial * Math.pow(1 + rate / 100, 20);
  const growthFactor = initial > 0 ? valueAfter20Years / initial : 0;

  const chartData = [];
  for (let y = 0; y <= 40; y += 2) {
    chartData.push({ year: y, value: Math.round(initial * Math.pow(1 + rate / 100, y)) });
  }

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setGrowthRate("7");
    setInitialInvestment("10000");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is the Rule of 70?", answer: "A quick mental math shortcut: divide 70 by an annual growth rate to estimate how many years it takes a value to double. At 7%, money doubles every 10 years (70 ÷ 7). It works for investments, GDP growth, population, and inflation alike." },
    { question: "Why 70 and not 72?", answer: "Both work. 72 is more accurate for rates around 8% and gives nicer numbers for common rates (72 ÷ 8 = 9), while 70 is slightly more accurate for low rates near 2%. The exact doubling time is ln(2) ÷ rate ≈ 69.3 ÷ rate — both rules round that." },
    { question: "How does the Rule of 70 apply to inflation?", answer: "Inverted: at 3% inflation, the purchasing power of cash halves in about 23 years (70 ÷ 3). At 6% it halves in under 12 years. It is a sobering way to see why cash under the mattress loses value and why long-term money belongs in investments that outpace inflation." },
    { question: "Is the rule exact?", answer: "It is an approximation. The true doubling time at 7% is 10.24 years (ln 2 ÷ 0.07), versus 10.0 from the rule — within 3%. The approximation error grows at very high rates: at 25% the rule says 2.8 years versus 3.1 actual. Fine for planning, not for precise contracts." },
    { question: "What rate should I use for stocks?", answer: "The long-run S&P 500 average is about 10% nominal (7% after inflation), implying a doubling every 7 years nominal — every 10 years in real terms. Bonds and savings accounts double slower. Use after-tax, after-inflation rates for a conservative planning figure." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rule of 70 Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rule of 70 Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <TrendingUp className="w-4 h-4" /> Doubling Time
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Annual Growth Rate (%)</label>
                <input id="r70-rate" type="number" value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} min={0.1} max={25} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Initial Investment ($)</label>
                <input id="r70-invest" type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} min={0} className="input-calc" />
              </div>
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Years to Double</p>
                  <p className="text-4xl font-bold text-primary mt-1">{yearsToDouble.toFixed(1)} <span className="text-xl font-semibold text-muted-foreground">yrs</span></p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(initial)} → {fmt(doubledValue)} at {rate}% per year (70 ÷ {rate})
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Doubled Value</p>
                    <p className="text-2xl font-bold text-primary">{fmt(doubledValue)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Value After 10 Yrs</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(valueAfter10Years)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Value After 20 Yrs</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(valueAfter20Years)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Metric</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Years to Double</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{yearsToDouble.toFixed(1)} yrs</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Doubled Value</td>
                        <td className="py-2.5 px-3 text-right">{fmt(doubledValue)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Value After 10 Years</td>
                        <td className="py-2.5 px-3 text-right">{fmt(valueAfter10Years)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Value After 20 Years</td>
                        <td className="py-2.5 px-3 text-right">{fmt(valueAfter20Years)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Growth Factor (20 yrs)</td>
                        <td className="py-2.5 px-3 text-right">{growthFactor.toFixed(2)}×</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Doubling Growth to 40 Years</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"} />
                        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Year ${l}`} />
                        <ReferenceLine y={doubledValue} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "2×", position: "insideTopRight", fontSize: 11, fill: "#b45309" }} />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Growth Rate</span>
                      <span className="font-medium">{rate}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Initial Investment</span>
                      <span className="font-medium">{fmt(initial)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Doubling Time</span>
                      <span className="font-medium">{yearsToDouble.toFixed(1)} yrs</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Doubles in 40 Years</span>
                      <span className="font-medium">{Math.round(40 / yearsToDouble)}×</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter a growth rate and initial investment, then click <strong className="text-foreground">Calculate</strong> to see how fast your money doubles.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How the Rule Works</h2>
            <p>Divide 70 by the growth rate to estimate doubling time. At 7%, money doubles every 10 years — $10,000 becomes $20,000, then $40,000, and so on, reaching $160,000 after 40 years without adding a dollar. The same rule applies to inflation: at 3%, purchasing power halves in about 23 years.</p>
            <h3>Why Doubling Compounds So Fast</h3>
            <p>Each doubling multiplies the previous total, not the original — after four doublings, $10,000 has become $160,000, sixteen times the start. The Rule of 70 makes this visible: count the doublings across your time horizon (40 years ÷ 10 = 4) and multiply by 2 each time. It turns abstract exponential growth into simple arithmetic.</p>
            <h3>Using the Rule Backward</h3>
            <p>Need $100,000 in 14 years with $50,000 saved? 70 ÷ 14 = 5% — that is the minimum return your money must earn to get there. Flipping the equation tells you the required rate for any goal and horizon, making it a planning tool as much as a curiosity.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rule-of-70-calculator" />
          <PopularCalculators exclude="/calculator/rule-of-70-calculator" />
        </div>
      </div>
    </>
  );
}
