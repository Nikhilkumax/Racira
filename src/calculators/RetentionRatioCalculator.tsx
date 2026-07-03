"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = (n: number) => `${fmt(n)}%`;

const RetentionRatioCalculator = () => {
  const DEFAULTS = { netIncome: "100000", dividends: "30000", roe: "15" };
  const [netIncome, setNetIncome] = useState(DEFAULTS.netIncome);
  const [dividends, setDividends] = useState(DEFAULTS.dividends);
  const [roe, setRoe] = useState(DEFAULTS.roe);
  const [showSGR, setShowSGR] = useState(true);
  const [result, setResult] = useState<any>(null);

  const calculate = (ni = netIncome, div = dividends, r = roe) => {
    const NI = parseFloat(ni) || 0;
    const DIV = Math.min(parseFloat(div) || 0, NI);
    const ROE = parseFloat(r) || 0;
    if (!NI || NI <= 0) return;
    const retained = NI - DIV;
    const retentionRatio = retained / NI;
    const payoutRatio = 1 - retentionRatio;
    const sgr = retentionRatio * (ROE / 100);
    const pieData = [
      { name: "Retained Earnings", value: retained, color: "#10b981" },
      { name: "Dividends Paid", value: DIV, color: "#3b82f6" },
    ].filter((d) => d.value > 0);
    setResult({ NI, retained, DIV, retentionRatio, payoutRatio, sgr, ROE, pieData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setNetIncome(DEFAULTS.netIncome); setDividends(DEFAULTS.dividends); setRoe(DEFAULTS.roe);
    calculate(DEFAULTS.netIncome, DEFAULTS.dividends, DEFAULTS.roe);
  };

  const faqs = [
    { question: "What is the retention ratio?", answer: "The retention ratio (also called the plowback ratio) measures the proportion of net income a company keeps and reinvests into its operations rather than distributing to shareholders as dividends. A ratio of 0.70 means the company retains 70% of its earnings." },
    { question: "What is the retention ratio formula?", answer: "Retention Ratio = (Net Income − Dividends Paid) / Net Income. Equivalently: Retention Ratio = 1 − Dividend Payout Ratio." },
    { question: "What is a good retention ratio?", answer: "There is no universal 'good' value — it depends on the company's growth stage. High-growth tech companies may retain 90–100% of earnings. Mature dividend-paying companies (utilities, REITs) may retain only 30–50%." },
    { question: "What is the sustainable growth rate (SGR)?", answer: "SGR = Retention Ratio × Return on Equity (ROE). It represents the maximum rate a company can grow sales using only internally generated profits — without issuing new equity or increasing leverage." },
    { question: "How does the retention ratio relate to the dividend payout ratio?", answer: "They are exact complements: Dividend Payout Ratio = 1 − Retention Ratio. A retention ratio of 0.70 implies a dividend payout ratio of 0.30 (30%)." },
    { question: "Why do growth companies have higher retention ratios?", answer: "Growth companies have abundant high-return investment opportunities. Retaining more earnings allows them to fund R&D, market expansion, and acquisitions without issuing dilutive equity." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Retention Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Retention Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Net Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={netIncome} onChange={(e) => setNetIncome(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="100000" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Dividends Paid</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={dividends} onChange={(e) => setDividends(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="30000" min="0" />
              </div>
            </div>
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
                <input type="checkbox" checked={showSGR} onChange={(e) => setShowSGR(e.target.checked)} className="rounded" />
                Calculate Sustainable Growth Rate (SGR)
              </label>
              {showSGR && (
                <div>
                  <label className="text-base font-medium block mb-1.5">Return on Equity (ROE)</label>
                  <div className="relative">
                    <input type="number" value={roe} onChange={(e) => setRoe(e.target.value)} className="h-10 w-full pl-3 pr-7 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="15" step="0.1" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Retention Ratio (Plowback Ratio)</div>
                <div className="text-4xl font-bold text-primary">{fmtPct(result.retentionRatio * 100)}</div>
                <div className="text-sm text-muted-foreground mt-1">Dividend Payout Ratio: <span className="font-semibold text-foreground">{fmtPct(result.payoutRatio * 100)}</span></div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Earnings Allocation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Net Income", value: `$${fmt(result.NI)}` },
                    { label: "Dividends Paid", value: `$${fmt(result.DIV)}` },
                    { label: "Retained Earnings", value: `$${fmt(result.retained)}` },
                    { label: "Retention Ratio", value: fmtPct(result.retentionRatio * 100) },
                    { label: "Dividend Payout Ratio", value: fmtPct(result.payoutRatio * 100) },
                    ...(showSGR && result.ROE > 0 ? [{ label: "Sustainable Growth Rate (SGR)", value: fmtPct(result.sgr * 100) }] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.pieData.length > 0 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Net Income Allocation</h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {result.pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary Statistics</h3>
                <div className="space-y-3">
                  {[
                    { label: "Net Income", value: `$${fmt(result.NI)}` },
                    { label: "Retained Earnings", value: `$${fmt(result.retained)}` },
                    { label: "Retention Ratio", value: fmtPct(result.retentionRatio * 100) },
                    { label: "Payout Ratio", value: fmtPct(result.payoutRatio * 100) },
                    ...(showSGR && result.ROE > 0 ? [{ label: "Sustainable Growth Rate", value: fmtPct(result.sgr * 100), border: true, bold: true }] : []),
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Retention Ratio Calculator?</h2>
            <p>A retention ratio calculator computes what fraction of a company's net income is retained and reinvested into the business rather than paid to shareholders as dividends. Also known as the plowback ratio, it is a fundamental corporate finance metric used by analysts, investors, and CFOs to understand how a company deploys its profits. Pre-filled with $100,000 net income and $30,000 dividends paid, the retention ratio is 70% — the company keeps $70,000 for reinvestment while returning $30,000 to shareholders.</p>
            <h2>The Retention Ratio Formula</h2>
            <p><strong>Retention Ratio = (Net Income − Dividends Paid) / Net Income</strong></p>
            <p>Equivalently: Retention Ratio = 1 − Dividend Payout Ratio. For our defaults: ($100,000 − $30,000) / $100,000 = 70%. This means 70 cents of every dollar earned is retained within the business.</p>
            <h2>Sustainable Growth Rate (SGR)</h2>
            <p><strong>SGR = Retention Ratio × Return on Equity (ROE)</strong></p>
            <p>The SGR represents the maximum rate a company can grow using only its internally generated cash flows. With a 70% retention ratio and 15% ROE: SGR = 0.70 × 15% = 10.5%. This company can sustainably grow at 10.5% annually from profits alone.</p>
            <h2>Industry Benchmarks</h2>
            <p>Retention ratios vary dramatically by industry. Technology companies typically retain 80–100% of earnings. Consumer staples companies retain 40–60%. Utilities and REITs retain as little as 10–30% due to regulatory requirements to distribute 90%+ of taxable income. Growth-stage companies often retain 100% of earnings to fund expansion — Amazon maintained a near-zero dividend for decades.</p>
            <h2>What the Ratio Tells You</h2>
            <p>A high retention ratio signals a growth-oriented company that reinvests aggressively. A low ratio signals maturity and income distribution. Neither is inherently superior — what matters is whether retained earnings are deployed into investments that generate returns above the company's cost of capital. Always pair the retention ratio with ROE, ROIC, and free cash flow yield analysis to assess the quality of capital reinvestment.</p>
            <h2>Connection to Earnings Growth</h2>
            <p>The retention ratio directly fuels future EPS growth. When a company retains earnings at high returns on equity, book value per share compounds, which drives earnings growth. Companies with high sustainable ROEs and appropriate retention ratios represent the most powerful compounding machines in equity markets.</p>
            <h2>Limitations</h2>
            <p>A company can retain 90% of earnings but deploy them into low-return acquisitions or excess working capital — destroying shareholder value. High retention alone does not guarantee value creation. Always verify that the company earns a return on retained earnings above its cost of equity (WACC). A declining retention ratio is not automatically negative — it may signal optimal capital return to shareholders when reinvestment opportunities are exhausted.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retention-ratio-calculator" />
          <PopularCalculators exclude="/calculator/retention-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default RetentionRatioCalculator;
