"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = { annualDividend: "3.80", stockPrice: "95.00", sharesOutstanding: "1000000", growthRate: "4" };

interface DYResult {
  dividendYield: number;
  payoutFrequency: number;
  totalAnnualDividends: number;
  forwardYield: number;
  yieldCategory: string;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): DYResult {
  const div = parseFloat(v.annualDividend) || 0;
  const price = parseFloat(v.stockPrice) || 0;
  const shares = parseFloat(v.sharesOutstanding) || 0;
  const g = parseFloat(v.growthRate) / 100;

  // Dividend Yield = Annual Dividend Per Share / Stock Price
  const dividendYield = price > 0 ? div / price : 0;
  const payoutFrequency = div / 4; // quarterly assumption
  const totalAnnualDividends = div * shares;
  const forwardYield = price > 0 ? (div * (1 + g)) / price : 0; // 1-year forward yield

  let yieldCategory =
    dividendYield >= 0.08 ? "Very High Yield — verify sustainability"
    : dividendYield >= 0.05 ? "High Yield — income-focused stock"
    : dividendYield >= 0.03 ? "Moderate Yield — balanced dividend"
    : dividendYield >= 0.01 ? "Low Yield — growth-oriented"
    : "No Significant Yield";

  const chartData = [
    { name: "Current Yield", value: parseFloat((dividendYield * 100).toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Forward Yield (1yr)", value: parseFloat((forwardYield * 100).toFixed(2)), fill: "#10b981" },
    { name: "Growth Rate", value: parseFloat((g * 100).toFixed(2)), fill: "#f59e0b" },
  ];

  return { dividendYield, payoutFrequency, totalAnnualDividends, forwardYield, yieldCategory, chartData };
}

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function DividendYieldCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<DYResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is Dividend Yield?", answer: "Dividend Yield = Annual Dividend Per Share ÷ Current Stock Price × 100. It measures the annual cash income an investor receives relative to the stock's price. A 4% yield on a $95 stock means you earn $3.80 per share annually — a real cash return regardless of price movements." },
    { question: "What is a good Dividend Yield?", answer: "Context-dependent: S&P 500 average is ~1.5–2%. REITs and utilities often yield 4–7%. Yields above 8% warrant scrutiny — they may indicate an unsustainable payout or an impending dividend cut. A consistently growing dividend from a profitable company is more valuable than a high but volatile yield." },
    { question: "What is Forward Dividend Yield?", answer: "Forward Dividend Yield uses the projected next 12 months' dividend (current annual dividend × expected growth rate) as the numerator. It's more forward-looking than trailing yield, useful for stocks with growing dividends. If a company pays $3.80/share with expected 4% growth, the forward dividend is $3.95 and the forward yield at $95/share is 4.16%." },
    { question: "How often are dividends paid?", answer: "Most US stocks pay dividends quarterly. Some pay monthly (often REITs and CEFs), semi-annually (some international stocks), or annually. The ex-dividend date is when you must own the stock to receive the upcoming payment. Buy before ex-date to qualify; selling after ex-date still earns you the dividend." },
    { question: "What is dividend yield trap?", answer: "A dividend yield trap occurs when a stock's high yield results from a falling stock price rather than rising dividends. If a $100 stock with $4 annual dividend drops to $50 due to financial problems, the yield appears to double to 8% — but the dividend is likely to be cut, leaving investors with capital losses and reduced income." },
    { question: "How does dividend growth affect total return?", answer: "Dividend growth (DRIP investing) is one of the most powerful wealth-building strategies. Reinvesting dividends into additional shares compounds returns significantly. A $10,000 investment in a 4% yield stock growing dividends at 6%/year, reinvested over 20 years, produces dramatically higher total returns than just price appreciation alone due to compounding." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Dividend Yield Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dividend Yield Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Annual Dividend / Share ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals.annualDividend} onChange={set("annualDividend")}
                    className="h-10 w-full pl-7 pr-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Stock Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals.stockPrice} onChange={set("stockPrice")}
                    className="h-10 w-full pl-7 pr-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.01" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Shares Outstanding</label>
                <input type="number" value={vals.sharesOutstanding} onChange={set("sharesOutstanding")}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Dividend Growth (%)</label>
                <div className="relative">
                  <input type="number" value={vals.growthRate} onChange={set("growthRate")}
                    className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Dividend Yield</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.dividendYield)}</div>
                  <div className="text-sm text-muted-foreground font-medium">{result.yieldCategory}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Dividend Yield (Trailing)", value: fmtPct(result.dividendYield) },
                        { label: "Forward Dividend Yield (1yr)", value: fmtPct(result.forwardYield) },
                        { label: "Annual Dividend / Share", value: `$${parseFloat(vals.annualDividend).toFixed(2)}` },
                        { label: "Quarterly Dividend / Share", value: `$${result.payoutFrequency.toFixed(2)}` },
                        { label: "Forward Annual Dividend", value: `$${(parseFloat(vals.annualDividend) * (1 + parseFloat(vals.growthRate) / 100)).toFixed(2)}` },
                        { label: "Total Annual Dividends Paid", value: `$${fmt(result.totalAnnualDividends)}`, bold: true },
                        { label: "Stock Price", value: `$${parseFloat(vals.stockPrice).toFixed(2)}` },
                      ].map((r) => (
                        <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.bold ? "bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Yield Comparison</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={result.chartData} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v: any) => [`${v}%`, "Rate"]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Dividend Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Current Yield", value: fmtPct(result.dividendYield) },
                      { label: "Forward Yield", value: fmtPct(result.forwardYield) },
                      { label: "Annual Div/Share", value: `$${parseFloat(vals.annualDividend).toFixed(2)}` },
                      { label: "Quarterly Div/Share", value: `$${result.payoutFrequency.toFixed(2)}` },
                      { label: "Total Annual Payout", value: `$${fmt(result.totalAnnualDividends)}` },
                      { label: "Category", value: result.dividendYield >= 0.05 ? "High Yield" : result.dividendYield >= 0.03 ? "Moderate" : "Low Yield", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={`text-base font-bold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Dividend Yield?</h2>
            <p><strong>Dividend Yield = Annual Dividend Per Share ÷ Current Stock Price × 100.</strong> It tells you the annual cash return from a stock relative to its price. Our pre-filled example: $3.80 annual dividend ÷ $95.00 stock price = 4.00% yield — meaning for every $95 invested, you receive $3.80 in cash per year, regardless of stock price movements.</p>

            <h2>Trailing vs. Forward Dividend Yield</h2>
            <p><strong>Trailing Yield</strong> uses the last 12 months of actual dividends paid — the most commonly quoted figure. <strong>Forward Yield</strong> projects the next 12 months based on the most recent dividend announcement, annualized. If a company just raised its quarterly dividend from $0.90 to $0.95, the trailing yield reflects the old rate while the forward yield captures the new, higher payout. For growing dividend stocks, forward yield is more useful.</p>

            <h2>Dividend Yield Benchmarks</h2>
            <p>S&P 500 average: ~1.5–2%. Consumer staples: 2.5–4%. Utilities: 3–5%. REITs: 4–7%. Energy MLPs: 6–9%. High-yield stocks (&gt;7%) warrant scrutiny — an unusually high yield often signals a dividend at risk of being cut, or a stock in distress. The dividend yield trap is real: a stock yielding 10% may look attractive until the company cuts its dividend and the stock drops 30%.</p>

            <h2>Dividend Growth Investing</h2>
            <p>The Dividend Growth Investing (DGI) strategy focuses on companies that consistently increase dividends — the "Dividend Aristocrats" (25+ years of consecutive increases) and "Dividend Kings" (50+ years). A stock bought at 4% yield that grows its dividend 6% annually sees your yield-on-cost rise to 7.2% in 10 years and 12.9% in 20 years — powerful income compounding over time. Reinvesting dividends (DRIP) accelerates compounding by buying additional shares with each payment.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-yield-calculator" />
          <PopularCalculators exclude="/calculator/dividend-yield-calculator" />
        </div>
      </div>
    </>
  );
}
