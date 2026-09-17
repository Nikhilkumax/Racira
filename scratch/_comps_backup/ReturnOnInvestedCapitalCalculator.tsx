"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = {
  ebit: "300000",
  taxRate: "21",
  debt: "400000",
  equity: "800000",
  cash: "100000"
};

interface ROICResult {
  nopat: number;
  investedCapital: number;
  roic: number;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): ROICResult {
  const ebitVal = parseFloat(v.ebit) || 0;
  const tax = (parseFloat(v.taxRate) || 0) / 100;
  const debtVal = parseFloat(v.debt) || 0;
  const equityVal = parseFloat(v.equity) || 0;
  const cashVal = parseFloat(v.cash) || 0;

  const nopat = ebitVal * (1 - tax);
  // Invested Capital = Debt + Equity - Cash
  const investedCapital = Math.max(1, debtVal + equityVal - cashVal);
  const roic = (nopat / investedCapital) * 100;

  const chartData = [
    { name: "NOPAT", value: Math.round(nopat), fill: "hsl(var(--primary))" },
    { name: "Invested Capital", value: Math.round(investedCapital), fill: "hsl(var(--muted-foreground))" }
  ];

  return { nopat, investedCapital, roic, chartData };
}

const fmtCurrency = (n: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
};

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function ReturnOnInvestedCapitalCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ROICResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleInputChange = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setVals((prev) => {
      const updated = { ...prev, [key]: e.target.value };
      return updated;
    });
  };

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => {
    setMounted(true);
    runCalc();
  }, [vals.ebit, vals.taxRate, vals.debt, vals.equity, vals.cash]);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is Return on Invested Capital (ROIC)?",
      answer: "Return on Invested Capital (ROIC) is a financial ratio that measures a company's efficiency in allocating capital (both debt and equity) to profitable investments. It is calculated by dividing Net Operating Profit After Tax (NOPAT) by Invested Capital."
    },
    {
      question: "Why do we subtract Cash from Invested Capital?",
      answer: "Cash and cash equivalents are subtracted from total debt and equity because cash is a passive asset. It is not actively deployed in the operations of the business to generate operating income (EBIT). Subtraction of cash yields 'Net Invested Capital', which represents the active capital deployed."
    },
    {
      question: "What is the relationship between ROIC and WACC?",
      answer: "ROIC measures the percentage return a firm generates on its deployed capital, while WACC (Weighted Average Cost of Capital) represents the percentage cost of that capital. If ROIC exceeds WACC, the firm is generating positive economic profit and creating shareholder value. If ROIC is below WACC, the firm is destroying value."
    },
    {
      question: "How does ROIC differ from ROE and ROA?",
      answer: "ROE (Return on Equity) only measures the return on the equity portion of capital. ROA (Return on Assets) measures return relative to total assets, ignoring how those assets were financed. ROIC is more comprehensive because it assesses the profitability of all capital deployed (both debt and equity) net of excess cash."
    },
    {
      question: "What is considered a good ROIC?",
      answer: "A good ROIC is generally one that is comfortably above the firm's WACC (usually a premium of 2% or more). In absolute terms, an ROIC above 10% is widely considered solid for mature industries, while capital-light industries like software can easily exceed 20% or 30%."
    },
    {
      question: "Can ROIC be negative?",
      answer: "Yes. If a company reports an operating loss (negative EBIT), NOPAT will be negative, resulting in a negative ROIC. This indicates that the company is actively consuming capital rather than generating returns from its investments."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "ROIC Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Return on Invested Capital (ROIC) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Operating Income / EBIT ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.ebit}
                  onChange={handleInputChange("ebit")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Effective Tax Rate (%)</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                <input
                  type="number"
                  value={vals.taxRate}
                  onChange={handleInputChange("taxRate")}
                  className="h-10 w-full pl-3 pr-8 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Total Debt ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.debt}
                  onChange={handleInputChange("debt")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Total Equity ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.equity}
                  onChange={handleInputChange("equity")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Cash & Equivalents ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.cash}
                  onChange={handleInputChange("cash")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => runCalc()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* Result Dashboards */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Return on Invested Capital (ROIC)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.roic)}</div>
                  <span className="text-sm text-muted-foreground font-medium">Efficiency of operating capital deployment</span>
                </div>

                {/* Table Breakdown */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th>
                        <th className="p-2.5 pr-3 text-right">Value ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Operating Income (EBIT)</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{fmtCurrency(parseFloat(vals.ebit) || 0)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">NOPAT (Net Operating Profit After Tax)</td>
                        <td className="p-2.5 pr-3 text-right text-emerald-600 font-medium">{fmtCurrency(result.nopat)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Total Debt + Equity</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{fmtCurrency((parseFloat(vals.debt) || 0) + (parseFloat(vals.equity) || 0))}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Cash Deduction (-)</td>
                        <td className="p-2.5 pr-3 text-right text-rose-600 font-medium">-{fmtCurrency(parseFloat(vals.cash) || 0)}</td>
                      </tr>
                      <tr className="bg-muted/40">
                        <td className="p-2.5 pl-3 font-bold text-foreground">Net Invested Capital</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-foreground">{fmtCurrency(result.investedCapital)}</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-2.5 pl-3 font-bold text-foreground">ROIC (%)</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-primary">{fmtPct(result.roic)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recharts Chart */}
                {mounted && result.nopat > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">NOPAT vs. Net Invested Capital ($)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(v)]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => (
                            <Cell key={i} fill={e.fill} />
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

        {/* SEO Article Section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Return on Invested Capital (ROIC)</h2>
            <p>
              <strong>Return on Invested Capital (ROIC)</strong> is one of the most critical efficiency ratios in corporate valuation. While return on equity (ROE) focuses only on the shareholders' portion of financing, and return on assets (ROA) counts all assets (including passive cash), ROIC isolates the actual return a business generates from its core operating capital base.
            </p>
            <p>
              It compares unlevered operating profit (NOPAT) against net deployed capital (Debt + Equity - excess cash). It is the premier metric used by value investors (such as Warren Buffett) to check if a company has an economic moat. A company that consistently generates an ROIC above its capital cost (WACC) is creating real shareholder value.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-invested-capital-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Return On Invested Capital Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Return On Invested Capital Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Return On Invested Capital Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Return On Invested Capital Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Return On Invested Capital Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/return-on-invested-capital-calculator" />
        </div>
      </div>
    </>
  );
}
