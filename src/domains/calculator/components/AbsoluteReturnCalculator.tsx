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
  cashFlows: "0",
  startDate: "2023-01",
  endDate: "2024-01",
};

interface ResultType {
  absoluteReturnPct: number;
  absoluteReturnAmt: number;
  annualizedReturn: number;
  totalValueChange: number;
  totalInflows: number;
  years: number;
  chartData: { name: string; value: number }[];
}

function calculate(v: typeof DEFAULTS): ResultType {
  const initial = parseFloat(v.initialValue);
  const ending = parseFloat(v.endingValue);
  const cashFlows = parseFloat(v.cashFlows);

  const safeInitial = isNaN(initial) || initial === 0 ? 0 : initial;
  const safeEnding = isNaN(ending) ? 0 : ending;
  const safeCash = isNaN(cashFlows) ? 0 : cashFlows;

  const absoluteReturnAmt = safeEnding - safeInitial + safeCash;
  const absoluteReturnPct = safeInitial !== 0 ? (absoluteReturnAmt / safeInitial) * 100 : 0;
  const totalValueChange = safeEnding - safeInitial;
  const totalInflows = safeCash;

  let annualizedReturn = 0;
  let years = 0;

  const start = new Date(v.startDate + "-01");
  const end = new Date(v.endDate + "-01");
  const startValid = !isNaN(start.getTime());
  const endValid = !isNaN(end.getTime());

  if (startValid && endValid) {
    const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    years = diffYears;
    if (diffYears > 0 && safeInitial > 0) {
      annualizedReturn = (Math.pow((safeEnding + safeCash) / safeInitial, 1 / diffYears) - 1) * 100;
    }
  }

  const growth = totalValueChange - safeCash;

  const chartData = [
    { name: "Initial", value: safeInitial },
    { name: "Cash Flows", value: safeCash },
    { name: "Growth", value: growth },
    { name: "Ending", value: safeEnding }
  ];

  return {
    absoluteReturnPct,
    absoluteReturnAmt,
    annualizedReturn,
    totalValueChange,
    totalInflows,
    years,
    chartData
  };
}

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

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
  const [result, setResult] = useState<ResultType>(calculate(DEFAULTS));
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
    { question: "How does absolute return differ from annualized return?", answer: "Absolute return tells you the total gain or loss regardless of time, whereas annualized return tells you what the return would be if distributed evenly over a year. A 25% absolute return over 2 years is roughly a 11.8% annualized return." },
    { question: "Why include cash flows?", answer: "Cash flows like dividends, interest, or distributions are part of your total gain. If a stock's price stays the same but pays a $500 dividend, your absolute return is positive even though the price did not move." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Absolute Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absolute Return Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Left Column - Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
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
                  <CompactInput id="cashflows" label="Cash Flows Received" value={vals.cashFlows} onChange={(v: string) => updateVal('cashFlows', v)} prefix="$" />
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
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Absolute Return</div>
              <div className="text-4xl font-bold text-primary my-1">{result.absoluteReturnPct.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground">Total Gain/Loss: {fmtCurrency(result.absoluteReturnAmt)}</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Annualized</div>
                <div className={`text-lg font-bold ${result.annualizedReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {result.years > 0 && result.annualizedReturn > 0 ? result.annualizedReturn.toFixed(2) + "%" : "N/A"}
                </div>
              </div>
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Value Change</div>
                <div className="text-lg font-bold text-foreground">{fmtCurrency(result.totalValueChange)}</div>
              </div>
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Total Inflows</div>
                <div className="text-lg font-bold text-foreground">{fmtCurrency(result.totalInflows)}</div>
              </div>
            </div>

            {/* Breakdown Table */}
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
                    <td className="text-base py-2.5 px-3 text-right">{fmtCurrency(parseFloat(vals.initialValue) || 0)}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">Ending Value</td>
                    <td className="text-base py-2.5 px-3 text-right">{fmtCurrency(parseFloat(vals.endingValue) || 0)}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">Cash Flows</td>
                    <td className="text-base py-2.5 px-3 text-right">{fmtCurrency(result.totalInflows)}</td>
                  </tr>
                  <tr className="bg-secondary/20 font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3">Total Absolute Return</td>
                    <td className="text-base py-2.5 px-3 text-right">{fmtCurrency(result.absoluteReturnAmt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recharts Bar Chart */}
            {mounted && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Value Components</h3>
                <LazyView minHeight={250}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.value < 0 ? "#ef4444" : "hsl(var(--primary))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </LazyView>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Initial Value</span>
                  <span className="text-base font-bold text-foreground">{fmtCurrency(parseFloat(vals.initialValue) || 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ending Value</span>
                  <span className="text-base font-bold text-foreground">{fmtCurrency(parseFloat(vals.endingValue) || 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Absolute Return</span>
                  <span className="text-base font-bold text-primary">{result.absoluteReturnPct.toFixed(2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Gain/Loss</span>
                  <span className="text-base font-bold text-foreground">{fmtCurrency(result.absoluteReturnAmt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annualized Return</span>
                  <span className="text-base font-bold text-foreground">{result.years > 0 && result.annualizedReturn > 0 ? result.annualizedReturn.toFixed(2) + "%" : "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cash Flows</span>
                  <span className="text-base font-bold text-foreground">{fmtCurrency(result.totalInflows)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Article section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Absolute Return Calculator?</h2>
            <p>
              An absolute return calculator measures the total appreciation or depreciation of an investment over a chosen period, expressed as a percentage of the initial investment. Unlike relative return, which compares performance against a benchmark such as the S&amp;P 500, absolute return focuses solely on the raw gain or loss you actually realized. This makes it the clearest way to answer the most basic investing question: did this investment make or lose money? The absolute return formula takes the ending value, subtracts the initial value, adds any cash flows received such as dividends or interest, and divides that sum by the initial value before multiplying by 100.
            </p>
            <p>
              This metric is essential for quickly gauging the profitability of a single asset, a portfolio, or an entire strategy without the complexity of market comparisons or time-weighted adjustments. By entering just two numbers — your starting and ending values — you instantly see your true return, and with the advanced options you can layer in dividends and holding-period dates for a richer picture.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works and What the Outputs Mean</h2>
            <p>
              The primary output is the <strong>Absolute Return %</strong>, which captures your total gain or loss relative to the starting capital. Beneath it, the calculator breaks the result into three supporting figures: the raw <strong>Value Change</strong> (price appreciation only), the <strong>Total Inflows</strong> from cash flows, and the <strong>Annualized Return (CAGR)</strong> when valid start and end dates are supplied. The CAGR annualizes your result over the actual holding period, revealing the steady yearly rate your investment would need to compound at to reach the same ending value.
            </p>
            <p>
              The bar chart visualizes how your initial capital grew into the ending value, separating capital appreciation from distributed cash flows. The breakdown table then reconciles every component so you can confirm that the sum of value change and cash inflows equals the total absolute return amount.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results and Next Steps</h2>
            <p>
              A positive absolute return means your investment created wealth, while a negative one signals a loss — but the number alone hides the timeline. A 25% absolute return sounds impressive, yet if it took ten years to achieve, the annualized return is a far more modest figure. That is why the annualized (CAGR) result matters: it standardizes performance so you can compare investments held for different lengths of time on equal footing. Use the absolute return to confirm profitability, then rely on the annualized return to judge efficiency and to compare against alternative opportunities such as savings accounts, bonds, or index funds before deciding where to allocate capital next.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/absolute-return-calculator" />
          <PopularCalculators exclude="/calculator/absolute-return-calculator" />
        </div>
      </div>
    </>
  );
}
