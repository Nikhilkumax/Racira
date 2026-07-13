"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

const INDUSTRY_ROE = [
  { industry: "Technology", median: 25, high: 45 },
  { industry: "Healthcare", median: 18, high: 35 },
  { industry: "Financials", median: 12, high: 20 },
  { industry: "Consumer", median: 15, high: 28 },
  { industry: "Energy", median: 10, high: 22 },
  { industry: "Industrials", median: 14, high: 25 },
  { industry: "Utilities", median: 10, high: 14 },
];

export default function ReturnOnEquityCalculator() {
  const [netIncome, setNetIncome] = useState("8500000");
  const [beginEquity, setBeginEquity] = useState("40000000");
  const [endEquity, setEndEquity] = useState("45000000");
  const [industry, setIndustry] = useState("Technology");
  const [res, setRes] = useState<{ roe: number; avgEquity: number; benchmark: number; benchmarkHigh: number; ratingLabel: string; chartData: { industry: string; median: number; high: number; company: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const ni = parseFloat(netIncome) || 0;
    const be = parseFloat(beginEquity) || 0;
    const ee = parseFloat(endEquity) || 0;
    const avgEquity = (be + ee) / 2;
    const roe = avgEquity > 0 ? (ni / avgEquity) * 100 : 0;
    const bench = INDUSTRY_ROE.find(r => r.industry === industry) || INDUSTRY_ROE[0];
    const ratingLabel = roe >= bench.high ? "Excellent" : roe >= bench.median ? "Good" : roe >= bench.median * 0.7 ? "Average" : "Below Average";
    const chartData = INDUSTRY_ROE.map(r => ({ ...r, company: parseFloat(industry) === parseFloat(r.industry) ? roe : 0 }));
    setRes({ roe, avgEquity, benchmark: bench.median, benchmarkHigh: bench.high, ratingLabel, chartData });
  };

  const reset = () => { setNetIncome("8500000"); setBeginEquity("40000000"); setEndEquity("45000000"); setIndustry("Technology"); };

  const fmtM = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toLocaleString()}`;
  const ratingColor = (r: string) => ({ Excellent: "text-emerald-600", Good: "text-primary", Average: "text-amber-600", "Below Average": "text-red-600" }[r] || "text-foreground");

  const faqs = [
    { question: "What is Return on Equity (ROE)?", answer: "Return on Equity (ROE) measures how efficiently a company uses shareholders' equity to generate profit. It is calculated as Net Income ÷ Average Shareholders' Equity × 100. An ROE of 15% means the company generates $15 in profit for every $100 of shareholder equity. ROE is one of the most widely used metrics by investors to assess management effectiveness and business quality." },
    { question: "What is a good ROE?", answer: "ROE benchmarks vary significantly by industry. As a general rule: above 15–20% is considered good for most industries. Technology companies often achieve 20–40%+. Utilities and financial companies typically show lower ROEs (8–15%) due to capital intensity. Warren Buffett specifically looks for companies with consistent ROE above 15% over multiple years as a sign of durable competitive advantage." },
    { question: "What is the DuPont analysis of ROE?", answer: "DuPont analysis breaks ROE into three components: ROE = Net Profit Margin × Asset Turnover × Financial Leverage (Equity Multiplier). This decomposition reveals whether ROE is driven by superior profitability, efficient asset use, or high leverage. A high ROE driven primarily by high leverage (debt) is less sustainable than one driven by high margins and asset turnover." },
    { question: "Why use average equity instead of ending equity?", answer: "Using average equity (beginning + ending ÷ 2) is more accurate because equity changes throughout the year due to earnings retention and share issuances or buybacks. If a company raised significant capital late in the year, using only ending equity would understate true ROE. For quarterly calculations, analysts sometimes use a rolling 4-quarter average." },
    { question: "What are the limitations of ROE?", answer: "ROE can be misleadingly high when: the company has high debt (borrowed money increases equity returns artificially), after share buybacks (reducing equity base), or when losses create negative equity. A company with 50% ROE due to 90% debt financing is far riskier than one with 20% ROE and no debt. Always examine the debt-to-equity ratio alongside ROE." },
    { question: "How does ROE relate to sustainable growth rate?", answer: "The sustainable growth rate (SGR) is the maximum rate a company can grow using only retained earnings without additional debt or equity: SGR = ROE × Retention Ratio, where Retention Ratio = 1 − Dividend Payout Ratio. A company with 20% ROE that retains 75% of earnings has an SGR of 15% — it can organically grow at 15% annually without raising external capital." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Return on Equity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Return on Equity (ROE) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Company Financials</h2>
            <CompactInput id="ni" label="Net Income" value={netIncome} onChange={setNetIncome} prefix="$" />
            <CompactInput id="be" label="Beginning Shareholders' Equity" value={beginEquity} onChange={setBeginEquity} prefix="$" />
            <CompactInput id="ee" label="Ending Shareholders' Equity" value={endEquity} onChange={setEndEquity} prefix="$" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Industry Benchmark</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {INDUSTRY_ROE.map(r => <option key={r.industry} value={r.industry}>{r.industry} (Median: {r.median}%)</option>)}
              </select>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">ROE Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Return on Equity</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(res.roe)}</div>
                  <div className={`text-sm font-bold ${ratingColor(res.ratingLabel)}`}>{res.ratingLabel} vs {industry} industry median of {res.benchmark}%</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Net Income", value: fmtM(parseFloat(netIncome) || 0) },
                        { label: "Beginning Equity", value: fmtM(parseFloat(beginEquity) || 0) },
                        { label: "Ending Equity", value: fmtM(parseFloat(endEquity) || 0) },
                        { label: "Average Equity", value: fmtM(res.avgEquity) },
                        { label: "Return on Equity (ROE)", value: fmtPct(res.roe), bold: true },
                        { label: "Industry Median ROE", value: fmtPct(res.benchmark) },
                        { label: "Industry High ROE", value: fmtPct(res.benchmarkHigh) },
                        { label: "Rating", value: res.ratingLabel },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-bold ${r.label === "Rating" ? ratingColor(res.ratingLabel) : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">ROE vs Industry Benchmarks</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={INDUSTRY_ROE.map(r => ({ name: r.industry, median: r.median, high: r.high, your: r.industry === industry ? res.roe : null }))} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                        <Tooltip formatter={(v: any, n: string) => [`${Number(v).toFixed(1)}%`, n]} />
                        <ReferenceLine y={res.roe} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Your ROE: ${res.roe.toFixed(1)}%`, position: "right", fontSize: 10, fill: "#f59e0b" }} />
                        <Bar dataKey="median" fill="hsl(var(--primary) / 0.4)" name="Industry Median" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="high" fill="hsl(var(--primary) / 0.15)" name="Industry High" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "ROE", value: fmtPct(res.roe) },
                    { label: "Industry Median", value: fmtPct(res.benchmark) },
                    { label: "vs Median", value: `${res.roe >= res.benchmark ? "+" : ""}${(res.roe - res.benchmark).toFixed(2)}pp` },
                    { label: "Rating", value: res.ratingLabel },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className={`text-base font-extrabold ${item.label === "Rating" ? ratingColor(res.ratingLabel) : "text-foreground"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Return on Equity (ROE)?</h2>
            <p>Return on Equity (ROE) is one of the most important metrics in fundamental stock analysis. It measures how effectively a company uses the money shareholders have invested to generate profit. The formula is straightforward: ROE = Net Income ÷ Average Shareholders' Equity × 100. An ROE of 20% means the company generates $20 in annual profit for every $100 of shareholders' equity on its balance sheet.</p>
            <p>ROE is particularly powerful as a tool for comparing companies within the same industry. It cuts through differences in company size, age, and accounting choices to reveal the fundamental question: how good are management at turning shareholders' capital into profit? Companies that consistently maintain high ROE over multiple years — without relying on excessive debt — typically command premium valuations in the stock market.</p>

            <h2 className="text-2xl font-bold mb-3">The ROE Formula and Using Average Equity</h2>
            <p>ROE = Net Income / Average Shareholders' Equity × 100. Average shareholders' equity is calculated as (Beginning Equity + Ending Equity) ÷ 2. Using average equity is more accurate than simply using year-end equity because equity changes throughout the year. If a company raises $500M in a secondary offering in December, using only year-end equity would significantly understate the true ROE. The average smooths these fluctuations.</p>

            <h2 className="text-2xl font-bold mb-3">DuPont Analysis: Decomposing ROE</h2>
            <p>The DuPont formula breaks ROE into three components: ROE = Net Profit Margin × Asset Turnover × Equity Multiplier. Net Profit Margin (Net Income ÷ Revenue) measures profitability. Asset Turnover (Revenue ÷ Total Assets) measures operational efficiency. Equity Multiplier (Total Assets ÷ Shareholders' Equity) measures financial leverage. This decomposition is critical for understanding the quality of ROE. A company achieving 25% ROE through high margins and efficient asset use is a superior business compared to one achieving 25% ROE primarily through high leverage (borrowed money amplifying equity returns).</p>

            <h2 className="text-2xl font-bold mb-3">Industry ROE Benchmarks</h2>
            <p>ROE varies dramatically by industry based on capital requirements and business model. Capital-light technology and software companies routinely achieve ROEs of 25–50% or more because they can generate enormous profits with minimal physical assets. Asset-heavy utilities and manufacturing companies typically show ROEs of 8–14% because they require massive capital investment. Financial companies (banks, insurance) show intermediate ROEs of 10–20% because regulations require large equity cushions. Always compare ROE within the same industry for meaningful analysis.</p>

            <h2 className="text-2xl font-bold mb-3">Limitations of ROE</h2>
            <p>ROE can be artificially inflated by high financial leverage (debt increases returns to equity but also increases bankruptcy risk), aggressive share buybacks (reducing the equity base), or one-time gains. Negative equity (from large share buybacks or cumulative losses) makes ROE meaningless or misleading. A company with ROE of 50% funded by 90% debt is far riskier than one with ROE of 18% and zero debt. Always examine ROE alongside the debt-to-equity ratio and interest coverage ratio.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-equity-calculator" />
          <PopularCalculators exclude="/calculator/return-on-equity-calculator" />
        </div>
      </div>
    </>
  );
}
