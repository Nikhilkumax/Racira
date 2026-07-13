"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

const DEFAULTS = {
  initialValue: "10000",
  endingValue: "12500",
  showAdvanced: false,
  cashFlows: "500",
  startDate: "2023-01",
  endDate: "2024-01",
};

interface ResultType {
  absoluteReturnPct: number;
  absoluteReturnAmt: number;
  annualizedReturn: number;
  totalValueChange: number;
  totalInflows: number;
  chartData: any[];
}

function calculate(v: typeof DEFAULTS): ResultType {
  const initial = parseFloat(v.initialValue) || 0;
  const ending = parseFloat(v.endingValue) || 0;
  const cashFlows = parseFloat(v.cashFlows) || 0;

  const absoluteReturnAmt = ending - initial + cashFlows;
  const absoluteReturnPct = initial !== 0 ? (absoluteReturnAmt / initial) * 100 : 0;
  const totalValueChange = ending - initial;
  const totalInflows = cashFlows;

  let annualizedReturn = 0;
  const start = new Date(v.startDate + "-01");
  const end = new Date(v.endDate + "-01");
  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (years > 0 && initial > 0) {
      // CAGR
      annualizedReturn = (Math.pow((ending + cashFlows) / initial, 1 / years) - 1) * 100;
  }

  const chartData = [
    { name: "Initial", value: initial },
    { name: "Cash Flows", value: cashFlows },
    { name: "Growth", value: totalValueChange - cashFlows },
    { name: "Ending", value: ending }
  ];

  return {
    absoluteReturnPct,
    absoluteReturnAmt,
    annualizedReturn,
    totalValueChange,
    totalInflows,
    chartData
  };
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-base font-medium mb-1.5 text-foreground">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </div>
);

export default function AbsoluteReturnCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ResultType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(vals));
  }, []);

  const handleCalculate = () => setResult(calculate(vals));
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const updateVal = (key: keyof typeof DEFAULTS, val: any) => setVals(prev => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is an absolute return?", answer: "Absolute return is the total return that an asset achieves over a certain period of time. This measure looks at the appreciation or depreciation (expressed as a percentage) that an asset achieves over a given period." },
    { question: "How does absolute return differ from annualized return?", answer: "Absolute return tells you the total gain or loss regardless of time, whereas annualized return tells you what the return would be if distributed evenly over a year. A 20% absolute return over 2 years is roughly a 9.5% annualized return." },
    { question: "Why include cash flows?", answer: "Cash flows like dividends, interest, or distributions are part of your total gain. If a stock's price stays the same but pays a $500 dividend, your absolute return is positive." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Absolute Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absolute Return Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Left Column - Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid gap-4">
              <CompactInput id="initial" label="Initial Value" value={vals.initialValue} onChange={(v: string) => updateVal('initialValue', v)} prefix="$" />
              <CompactInput id="ending" label="Ending Value" value={vals.endingValue} onChange={(v: string) => updateVal('endingValue', v)} prefix="$" />
            </div>

            {/* Advanced Tier */}
            <div>
              <button
                type="button"
                onClick={() => updateVal('showAdvanced', !vals.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-3"
              >
                Advanced Options {vals.showAdvanced ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              
              {vals.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cash Flows & Timing</div>
                  <CompactInput id="cashflows" label="Dividends / Distributions Received" value={vals.cashFlows} onChange={(v: string) => updateVal('cashFlows', v)} prefix="$" />
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="start" label="Start Date" type="month" value={vals.startDate} onChange={(v: string) => updateVal('startDate', v)} />
                    <CompactInput id="end" label="End Date" type="month" value={vals.endDate} onChange={(v: string) => updateVal('endDate', v)} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button onClick={handleCalculate} className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Absolute Return</div>
                  <div className="text-4xl font-bold text-primary my-1">{result.absoluteReturnPct.toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">Total Gain/Loss: ${result.absoluteReturnAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Annualized</div>
                    <div className={`text-lg font-bold ${result.annualizedReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.annualizedReturn > 0 ? result.annualizedReturn.toFixed(2) : "N/A"}%
                    </div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Value Change</div>
                    <div className="text-lg font-bold text-foreground">${result.totalValueChange.toLocaleString()}</div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Total Inflows</div>
                    <div className="text-lg font-bold text-foreground">${result.totalInflows.toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="text-base py-2.5 px-3 font-medium">Initial Value</td>
                        <td className="text-base py-2.5 px-3 text-right">${(parseFloat(vals.initialValue)||0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 font-medium">Ending Value</td>
                        <td className="text-base py-2.5 px-3 text-right">${(parseFloat(vals.endingValue)||0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 font-medium">Cash Flows (Dividends)</td>
                        <td className="text-base py-2.5 px-3 text-right">${result.totalInflows.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-secondary/20 font-bold border-t-2 border-border">
                        <td className="text-base py-2.5 px-3">Total Absolute Return</td>
                        <td className="text-base py-2.5 px-3 text-right">${result.absoluteReturnAmt.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Value Components</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {result.chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.value < 0 ? "#ef4444" : "hsl(var(--primary))"} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
          <AdPlaceholder />
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is an Absolute Return Calculator?</h2>
            <p className="text-muted-foreground leading-relaxed">
              An absolute return calculator is a tool designed to measure the total appreciation or depreciation of an investment over a specific period, expressed as a percentage of the initial investment. Unlike relative return, which compares performance against a benchmark, absolute return focuses solely on the raw gain or loss. This metric is essential for investors who want to quickly gauge the overall profitability of an asset, portfolio, or strategy without the complexities of market comparisons or time-weighted adjustments.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed">
              The absolute return formula is straightforward. It takes the ending value of the investment, subtracts the initial value, adds any cash flows received (such as dividends or distributions), and divides that sum by the initial value. This resulting decimal is multiplied by one hundred to get the percentage return. The core calculation focuses entirely on the total dollar amount generated by the investment relative to the starting capital, ignoring the timeline over which the growth occurred.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your results provide a clear breakdown of your investment's performance. The primary result card highlights the absolute return percentage, representing your total gain or loss. The summary statistics below show the annualized return (if dates are provided), the raw change in value, and total inflows from cash flows. The breakdown table reconciles these figures, proving that the sum of value change and cash inflows matches the total absolute return amount.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p className="text-muted-foreground leading-relaxed">
              The core factors influencing your absolute return are the initial investment value and the ending value. Accurate tracking of these two figures is crucial. Additionally, incorporating cash flows such as dividends or interest payments is vital because they represent real returns generated by the asset, even if the underlying price remains stagnant. Ignoring cash flows can lead to a significant underestimation of your true return.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              The advanced options in our calculator allow you to input cash flows and specific start and end dates. By entering dates, the calculator unlocks the ability to compute an annualized return, known as the Compound Annual Growth Rate (CAGR). This secondary metric is incredibly useful for comparing the absolute return of investments held for different timeframes, providing a standardized rate that assumes compounding over time.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p className="text-muted-foreground leading-relaxed">
              Imagine you invest ten thousand dollars in a stock. After three years, the stock is worth twelve thousand dollars, and you received five hundred dollars in dividends. Your absolute return is the two thousand dollar capital gain plus the five hundred dollar dividend, totaling two thousand five hundred dollars, or twenty-five percent. While the absolute return is twenty-five percent, the advanced options would reveal that your annualized return is approximately seven point seven percent per year.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p className="text-muted-foreground leading-relaxed">
              When using absolute return to evaluate investments, always consider the timeframe. A twenty percent absolute return might look impressive, but if it took ten years to achieve, the annualized performance is poor. Always use the advanced options to calculate annualized return for a more complete picture. Additionally, ensure you account for all cash flows, including reinvested dividends and capital gains distributions, to accurately reflect the total wealth generated by your investment strategy.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p className="text-muted-foreground leading-relaxed">
              The primary benefit of calculating absolute return is its simplicity and transparency. It provides an unfiltered view of whether an investment made or lost money, which is the ultimate goal of investing. By providing both absolute and annualized metrics, this calculator empowers you to assess performance accurately, compare different investments effectively, and make informed decisions about your financial future without relying solely on complex relative benchmarks.
            </p>
          </div>
        </section>
        <FAQSection faqs={faqs} />
        <PopularCalculators />
      </div>
    </>
  );
}
