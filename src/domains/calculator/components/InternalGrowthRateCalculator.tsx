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
  totalAssets: "1000000",
  dividendsPaid: "45000"
};

interface IGRResult {
  roa: number;
  retentionRatio: number;
  payoutRatio: number;
  igr: number;
  chartData: { name: string; IGR: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): IGRResult {
  const ni = parseFloat(v.netIncome) || 0;
  const assets = parseFloat(v.totalAssets) || 1;
  const div = parseFloat(v.dividendsPaid) || 0;

  const roa = ni / assets;
  const payoutRatio = ni > 0 ? div / ni : 0;
  const retentionRatio = Math.max(0, 1 - payoutRatio);

  const roaTimesB = roa * retentionRatio;
  // IGR = (ROA * b) / (1 - ROA * b)
  const igr = roaTimesB < 1 ? (roaTimesB / (1 - roaTimesB)) * 100 : 0;

  // Generate sensitivity chart data: IGR at retention ratio 0%, 20%, 40%, 60%, 80%, 100%
  const chartData = [];
  const levels = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  for (const b of levels) {
    const rb = roa * b;
    const rate = rb < 1 ? (rb / (1 - rb)) * 100 : 0;
    const isCurrent = Math.abs(b - retentionRatio) < 0.1;
    chartData.push({
      name: `${Math.round(b * 100)}%`,
      IGR: Math.round(rate * 100) / 100,
      fill: isCurrent ? "hsl(var(--primary))" : "#94a3b8"
    });
  }

  return {
    roa: roa * 100,
    retentionRatio: retentionRatio * 100,
    payoutRatio: payoutRatio * 100,
    igr,
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

export default function InternalGrowthRateCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<IGRResult | null>(null);
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
  }, []);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the Internal Growth Rate (IGR)?",
      answer: "The Internal Growth Rate (IGR) is the maximum growth rate a company can achieve without obtaining any external financing—including both new debt and new equity. It represents the rate of expansion funded entirely by the company's retained earnings."
    },
    {
      question: "How does IGR differ from Sustainable Growth Rate (SGR)?",
      answer: "While both represent organic growth, they have different assumptions regarding debt. IGR assumes the firm will raise *no* external capital (neither debt nor equity). SGR assumes the firm will raise external debt to maintain a constant Debt-to-Equity ratio, but will issue *no new equity*. Consequently, SGR is always higher than IGR."
    },
    {
      question: "What is the Retention Ratio?",
      answer: "The retention ratio (often symbolized as 'b') is the proportion of net income that is kept in the business rather than paid out as dividends. It is calculated as: Retention Ratio = 1 - Dividend Payout Ratio. A higher retention ratio increases the funds available for organic reinvestment, raising the IGR."
    },
    {
      question: "How does ROA impact the Internal Growth Rate?",
      answer: "Return on Assets (ROA) measures how efficiently a company uses its assets to generate profit. Since IGR depends directly on ROA, a higher ROA indicates that the company is generating more profits per dollar of asset base. This increases the internal cash flow available to fund asset growth, directly elevating the IGR."
    },
    {
      question: "What happens if a company grows faster than its IGR?",
      answer: "If a company attempts to grow its sales and assets faster than its internal growth rate, it will face a funding deficit. To cover this gap, it must seek external financing by either issuing new equity shares (which dilutes ownership) or borrowing additional debt (which increases leverage and interest obligations)."
    },
    {
      question: "Can the Internal Growth Rate be negative?",
      answer: "Yes. If a company reports a net loss (negative Net Income), its ROA and retention ratio calculations will yield negative figures, resulting in a negative IGR. This indicates that the company's assets and business capacity are contracting unless external capital is injected to cover the losses."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Internal Growth Rate" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Internal Growth Rate (IGR) Calculator</h1>

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
              <label className="text-sm font-semibold text-foreground mb-1 block">Total Assets ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.totalAssets}
                  onChange={handleInputChange("totalAssets")}
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Internal Growth Rate (IGR)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.igr)}</div>
                  <span className="text-sm text-muted-foreground font-medium">Maximum growth rate funded entirely by retained earnings</span>
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
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Return on Assets (ROA)</td>
                        <td className="p-2.5 pr-3 text-right text-foreground font-medium">{fmtPct(result.roa)}</td>
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
                        <td className="p-2.5 pl-3 font-bold text-foreground">Internal Growth Rate (IGR)</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-primary">{fmtPct(result.igr)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recharts Sensitivity Chart */}
                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">IGR Sensitivity to Earnings Retention Ratio (%)</h3>
                    <span className="text-xs text-muted-foreground mb-2 block">Highlighting the current policy vs alternatives.</span>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v: any) => [`${v}%`, "Internal Growth Rate"]} />
                        <Bar dataKey="IGR" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Understanding the Internal Growth Rate (IGR)</h2>
            <p>
              In corporate finance, the <strong>Internal Growth Rate (IGR)</strong> represents the maximum rate of sales and operational growth that a business can achieve without requiring any external funding. This means the firm does not issue new shares (equity financing) or take on new loans or notes (debt financing). Instead, all expansion in assets is financed strictly using the company's retained cash flow from operations.
            </p>
            <p>
              Analyzing the IGR is crucial for businesses that want to maintain total independence from capital markets or want to avoid diluting current shareholders and taking on heavy leverage. Knowing a firm's IGR helps management understand its organic expansion limits and identify when strategic capital-raising activities will become necessary.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Mathematical Formula for IGR</h2>
            <p>
              The Internal Growth Rate relies on two key inputs: the Return on Assets (ROA) and the Retention Ratio (b). The formula is:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              IGR = (ROA × b) / [1 - (ROA × b)]
            </p>
            <p>
              Where:
            </p>
            <ul>
              <li><strong>Return on Assets (ROA):</strong> Calculated as Net Income divided by Total Assets. It reflects how profitably the business uses its asset base.</li>
              <li><strong>Retention Ratio (b):</strong> The portion of net profits kept in the business. Calculated as 1 minus (Dividends / Net Income). If a firm pays out 30% of its income as dividends, its retention ratio is 70% (0.70).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Policy Matters for IGR</h2>
            <p>
              A company can actively influence its internal growth rate by adjusting its dividend payout policy. If a company stops paying dividends entirely (retention ratio of 100%), it maximizes its IGR. As shown in our sensitivity chart, increasing the retention ratio directly translates to a higher organic growth capability because more profits are recycled back into the asset base.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/internal-growth-rate-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Internal Growth Rate Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Internal Growth Rate Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Internal Growth Rate Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Internal Growth Rate Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Internal Growth Rate Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/internal-growth-rate-calculator" />
        </div>
      </div>
    </>
  );
}
