"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = {
  netIncome: "150000",
  totalEquity: "600000",
  dividendsPaid: "45000"
};

interface SGRResult {
  roe: number;
  retentionRatio: number;
  payoutRatio: number;
  sgr: number;
  chartData: { name: string; SGR: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): SGRResult {
  const ni = parseFloat(v.netIncome) || 0;
  const equity = parseFloat(v.totalEquity) || 1;
  const div = parseFloat(v.dividendsPaid) || 0;

  const roe = ni / equity;
  const payoutRatio = ni > 0 ? div / ni : 0;
  const retentionRatio = Math.max(0, 1 - payoutRatio);

  const roeTimesB = roe * retentionRatio;
  // SGR = (ROE * b) / (1 - ROE * b)
  const sgr = roeTimesB < 1 ? (roeTimesB / (1 - roeTimesB)) * 100 : 0;

  // Generate sensitivity chart data: SGR at payout ratio 0%, 20%, 40%, 60%, 80%, 100%
  const chartData = [];
  const levels = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
  for (const p of levels) {
    const b = 1 - p;
    const rb = roe * b;
    const rate = rb < 1 ? (rb / (1 - rb)) * 100 : 0;
    const isCurrent = Math.abs(p - payoutRatio) < 0.1;
    chartData.push({
      name: `${Math.round(p * 100)}% Payout`,
      SGR: Math.round(rate * 100) / 100,
      fill: isCurrent ? "hsl(var(--primary))" : "#94a3b8"
    });
  }

  return {
    roe: roe * 100,
    retentionRatio: retentionRatio * 100,
    payoutRatio: payoutRatio * 100,
    sgr,
    chartData
  };
}

const fmtPct = (n: number) => `${n.toFixed(2)}%`;
const fmtCurrency = (n: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
};

export default function SustainableGrowthRateCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<SGRResult | null>(null);
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
  }, [vals.netIncome, vals.totalEquity, vals.dividendsPaid]);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the Sustainable Growth Rate (SGR)?",
      answer: "The Sustainable Growth Rate (SGR) is the maximum rate at which a company can grow its sales, assets, and profits without issuing new equity or changing its financial leverage (Debt-to-Equity ratio). It represents growth funded by retained earnings and matching debt capacity."
    },
    {
      question: "How is SGR calculated?",
      answer: "The formula for SGR is: SGR = (ROE * b) / [1 - (ROE * b)]. Where ROE is Return on Equity (Net Income / Total Equity) and 'b' is the Retention Ratio (1 - Dividend Payout Ratio)."
    },
    {
      question: "How does SGR differ from Internal Growth Rate (IGR)?",
      answer: "The key difference is debt: IGR assumes the firm takes on no external financing at all (neither debt nor equity). SGR assumes the company will take on additional debt to maintain a constant Debt-to-Equity ratio, but will issue no new equity. SGR is always higher than IGR."
    },
    {
      question: "What happens if a firm grows faster than its SGR?",
      answer: "If a company's sales grow faster than its SGR, it will eventually run out of capital to fund the expansion of its inventory, receivables, and equipment. The firm must then issue new equity (diluting shareholders), increase its leverage ratio (raising risk), improve asset turnover, or raise profit margins."
    },
    {
      question: "What happens if a company's growth is below its SGR?",
      answer: "If a company grows slower than its SGR, it will accumulate excess cash. In this case, management can choose to distribute the surplus cash to shareholders (through dividends or buybacks), pay down debt, or search for external mergers and acquisitions."
    },
    {
      question: "Can SGR be negative?",
      answer: "Yes. If a company reports a net loss, its ROE is negative, resulting in a negative SGR. This implies that the equity of the firm is shrinking and operations must contract unless new equity is raised."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Sustainable Growth Rate" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sustainable Growth Rate (SGR) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Net Income ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.netIncome}
                  onChange={handleInputChange("netIncome")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Total Shareholder Equity ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.totalEquity}
                  onChange={handleInputChange("totalEquity")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Dividends Paid ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.dividendsPaid}
                  onChange={handleInputChange("dividendsPaid")}
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
                {/* Result Dashboard */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Sustainable Growth Rate (SGR)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.sgr)}</div>
                  <span className="text-sm text-muted-foreground font-medium">Maximum growth rate without issuing new equity or changing leverage</span>
                </div>

                {/* Table Breakdown */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Ratio / Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Return on Equity (ROE)</td>
                        <td className="p-2.5 pr-3 text-right text-foreground font-medium">{fmtPct(result.roe)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Dividend Payout Ratio</td>
                        <td className="p-2.5 pr-3 text-right text-rose-600 font-medium">{fmtPct(result.payoutRatio)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Earnings Retention Ratio (b)</td>
                        <td className="p-2.5 pr-3 text-right text-emerald-600 font-medium">{fmtPct(result.retentionRatio)}</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-2.5 pl-3 font-bold text-foreground">Sustainable Growth Rate (SGR)</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-primary">{fmtPct(result.sgr)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recharts Sensitivity Chart */}
                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">SGR Sensitivity to Payout Ratio (%)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v: any) => [`${v}%`, "Sustainable Growth Rate"]} />
                        <Bar dataKey="SGR" radius={[4, 4, 0, 0]}>
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
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Sustainable Growth Rate (SGR)</h2>
            <p>
              The <strong>Sustainable Growth Rate (SGR)</strong> is a foundational indicator in business planning and financial analysis. It represents the maximum annual growth in sales and assets a company can support without issuing new shares of stock (equity dilution) or altering its established capital leverage policy (debt-to-equity ratio).
            </p>
            <p>
              By retaining a portion of earnings and raising a matching amount of debt to keep leverage constant, a company can grow organically. Knowing the SGR helps management prevent the common pitfall of overtrading, which occurs when a business grows faster than its cash capacity can handle, causing cash crises.
            </p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sustainable-growth-rate-calculator" />
          <PopularCalculators exclude="/calculator/sustainable-growth-rate-calculator" />
        </div>
      </div>
    </>
  );
}
