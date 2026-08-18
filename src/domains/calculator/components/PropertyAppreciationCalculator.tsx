"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PropertyAppreciationCalculator() {
  const [currentValue, setCurrentValue] = useState("350000");
  const [appreciationRate, setAppreciationRate] = useState("4");
  const [years, setYears] = useState("10");
  const [inflationRate, setInflationRate] = useState("3");
  const [showResults, setShowResults] = useState(false);

  const val = parseFloat(currentValue) || 0;
  const rate = (parseFloat(appreciationRate) || 0) / 100;
  const yrs = parseFloat(years) || 0;
  const inflation = (parseFloat(inflationRate) || 0) / 100;

  const futureValue = val * Math.pow(1 + rate, yrs);
  const realReturnRate = (1 + rate) / (1 + inflation) - 1;
  const realFutureValue = val * Math.pow(1 + realReturnRate, yrs);
  const totalGain = futureValue - val;
  const realGain = realFutureValue - val;
  const valueMultiple = val > 0 ? futureValue / val : 0;
  const annualGain = yrs > 0 ? totalGain / yrs : 0;

  const chartData = [];
  for (let y = 0; y <= yrs; y++) {
    chartData.push({
      year: y,
      nominal: Math.round(val * Math.pow(1 + rate, y)),
      real: Math.round(val * Math.pow(1 + realReturnRate, y)),
    });
  }

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setCurrentValue("350000");
    setAppreciationRate("4");
    setYears("10");
    setInflationRate("3");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is property appreciation?", answer: "The increase in a home's value over time, driven by location demand, inflation, and local market conditions. It is typically quoted as an annual percentage — the US long-run average is roughly 3–4% per year, matching or slightly beating inflation." },
    { question: "What is the difference between nominal and real appreciation?", answer: "Nominal appreciation is the raw dollar increase in the sticker price. Real appreciation strips out inflation using the Fisher relation: (1 + nominal) ÷ (1 + inflation) − 1. At 4% nominal with 3% inflation, the real gain is only about 0.97% per year — most of the headline gain just keeps pace with rising prices." },
    { question: "Is home appreciation guaranteed?", answer: "No. National averages hide wild local variation — some metros compound at 8%+ while others stagnate or fall for a decade. Appreciation is a lever, not a promise; buying decisions should stand on their own merits, with appreciation as a bonus rather than the plan." },
    { question: "How does leverage amplify appreciation?", answer: "A 20% down payment means 5× leverage: a 4% gain on the home's value is a ~20% gain on your cash. On $350,000 with $70,000 down, the $168,000 gain in the example becomes a ~240% return on cash — before financing costs, which eat heavily into it." },
    { question: "When does renting beat buying?", answer: "When you stay less than ~5 years (closing costs and selling fees eat the gains), when appreciation is weak, or when the same down payment can earn more invested elsewhere. This calculator's rent-vs-buy sibling compares the two paths directly over your horizon." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Property Appreciation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Property Appreciation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Home className="w-4 h-4" /> Nominal vs. Real
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Current Value ($)</label>
                <input id="pa-value" type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Annual Appreciation (%)</label>
                <input id="pa-rate" type="number" value={appreciationRate} onChange={(e) => setAppreciationRate(e.target.value)} min={0} max={25} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Years</label>
                <input id="pa-years" type="number" value={years} onChange={(e) => setYears(e.target.value)} min={1} max={50} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Inflation Rate (%)</label>
                <input id="pa-inflation" type="number" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} min={0} max={15} className="input-calc" />
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Future Value (Nominal)</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(futureValue)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(realFutureValue)} real · {fmt(totalGain)} nominal gain over {yrs} years
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Real Value</p>
                    <p className="text-2xl font-bold text-primary">{fmt(realFutureValue)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Real Return</p>
                    <p className="text-2xl font-bold text-orange-500">{realReturnRate * 100 > 0 ? "+" : ""}{(realReturnRate * 100).toFixed(2)}%/yr</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Value Multiple</p>
                    <p className="text-2xl font-bold text-green-600">{valueMultiple.toFixed(2)}×</p>
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
                        <td className="py-2.5 px-3 font-medium">Future Value (Nominal)</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(futureValue)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Gain</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalGain)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Real Value (After Inflation)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(realFutureValue)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Real Gain (After Inflation)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(realGain)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Real Return Rate</td>
                        <td className="py-2.5 px-3 text-right">{realReturnRate * 100 > 0 ? "+" : ""}{(realReturnRate * 100).toFixed(2)}%/yr</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Average Annual Gain</td>
                        <td className="py-2.5 px-3 text-right">{fmt(annualGain)}/yr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Nominal vs. Real Value Over Time</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"} />
                        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Year ${l}`} />
                        <Line type="monotone" dataKey="nominal" name="Nominal" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="real" name="Real (infl-adj)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Current Value</span>
                      <span className="font-medium">{fmt(val)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Appreciation Rate</span>
                      <span className="font-medium">{rate * 100}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Horizon</span>
                      <span className="font-medium">{yrs} years</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Inflation</span>
                      <span className="font-medium">{inflation * 100}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Nominal Gain</span>
                      <span className="font-medium">{fmt(totalGain)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Real Gain</span>
                      <span className="font-medium">{fmt(realGain)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your property value, appreciation rate, and horizon, then click <strong className="text-foreground">Calculate</strong> to see the nominal and real future value.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Home Appreciation Adds Up</h2>
            <p>A $350,000 home appreciating 4%/year for 10 years is worth about $518,000 — a $168,000 gain. After 3% inflation, the real value is closer to $385,000, so roughly a third of the headline gain is inflation, not wealth. Mortgage leverage amplifies this: a 20% down payment turns that gain into a ~240% return on cash invested (before financing costs).</p>
            <h3>Inflation Is Not Your Friend Here</h3>
            <p>The nominal number feels good on paper, but a home that merely keeps pace with inflation has produced zero real return. The gap between the two lines on the chart is the true wealth created. Most US homes have appreciated at roughly the rate of inflation over the long run — the outliers, not the average, are what made homeowners rich.</p>
            <h3>Use the Real Number for Planning</h3>
            <p>When estimating what your home will be worth at retirement or how much equity you'll have to downsize with, use the inflation-adjusted figure. It tells you the actual purchasing power you'll have, which is what your future spending cares about.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/property-appreciation-calculator" />
          <PopularCalculators exclude="/calculator/property-appreciation-calculator" />
        </div>
      </div>
    </>
  );
}
