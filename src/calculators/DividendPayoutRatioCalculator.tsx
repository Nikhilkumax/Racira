"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n) >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toFixed(2)}`;

function calcDPR(netIncome: number, dividendsPaid: number, earningsPerShare: number, dividendPerShare: number) {
  const dpr = netIncome > 0 ? (dividendsPaid / netIncome) * 100 : 0;
  const dprPerShare = earningsPerShare > 0 ? (dividendPerShare / earningsPerShare) * 100 : 0;
  const retentionRatio = 100 - dpr;
  const retentionRatioPerShare = 100 - dprPerShare;
  const retainedEarnings = netIncome - dividendsPaid;
  return { dpr, dprPerShare, retentionRatio, retentionRatioPerShare, retainedEarnings, dividendsPaid, netIncome };
}

const COLORS = ["hsl(var(--primary))", "#10b981"];

export default function DividendPayoutRatioCalculator() {
  const [netIncome, setNetIncome] = useState("5000000");
  const [dividendsPaid, setDividendsPaid] = useState("2000000");
  const [eps, setEps] = useState("2.50");
  const [dps, setDps] = useState("1.00");
  const [res, setRes] = useState<ReturnType<typeof calcDPR> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcDPR(parseFloat(netIncome) || 0, parseFloat(dividendsPaid) || 0, parseFloat(eps) || 0, parseFloat(dps) || 0));
  const reset = () => { setNetIncome("5000000"); setDividendsPaid("2000000"); setEps("2.50"); setDps("1.00"); setRes(calcDPR(5000000, 2000000, 2.50, 1.00)); };

  const faqs = [
    { question: "What is the Dividend Payout Ratio?", answer: "The Dividend Payout Ratio (DPR) is the percentage of net income paid to shareholders as dividends. Formula: DPR = Total Dividends Paid ÷ Net Income × 100. A 40% payout ratio means 40 cents of every dollar earned goes to dividends; 60 cents is retained for reinvestment." },
    { question: "What is a good dividend payout ratio?", answer: "It varies by industry and growth stage. Mature, stable companies (utilities, REITs, telecoms) often pay 60-90%. Growth companies may pay 0-30%, reinvesting most earnings. Consumer staples average 40-60%. A payout ratio above 100% means dividends are paid from sources other than current earnings — often unsustainable." },
    { question: "What is the retention ratio and how is it related?", answer: "Retention Ratio = 1 - Dividend Payout Ratio. It represents the fraction of earnings reinvested in the business. High retention ratios suggest management prioritizes internal growth. The Sustainable Growth Rate = ROE × Retention Ratio — a key formula linking payout policy to long-term growth capacity." },
    { question: "How do I calculate DPR per share?", answer: "Per-share DPR = Dividends Per Share ÷ Earnings Per Share × 100. This is often more useful than total-dollar DPR because it's directly visible from published financial data. Example: EPS = $3.00, DPS = $1.20 → DPR = 40%. This should match the total-dollar calculation if share counts are consistent." },
    { question: "What does a very high payout ratio signal?", answer: "Very high payout ratios (>80%) can signal maturity and stability (utilities) or potential distress (earning quality issues). If the ratio exceeds 100%, the company is paying more than it earns — sustainable only temporarily through cash reserves or borrowing. Dividend investors monitor payout ratios to assess dividend safety." },
    { question: "Should I prefer high or low payout stocks?", answer: "Income investors (retirees, pension funds) prefer high-payout stocks for current income. Growth investors prefer low-payout stocks for capital appreciation potential. Young investors often favor low-payout companies in high-growth industries. Neither is universally better — match your portfolio to your income needs and time horizon." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Dividend Payout Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dividend Payout Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold pb-2 border-b border-border">Earnings & Dividends</h2>
            <div className="grid grid-cols-2 gap-4">
              <CI id="ni" label="Net Income" value={netIncome} onChange={setNetIncome} prefix="$" />
              <CI id="div" label="Total Dividends Paid" value={dividendsPaid} onChange={setDividendsPaid} prefix="$" />
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Per Share Data</p>
              <div className="grid grid-cols-2 gap-4">
                <CI id="eps" label="Earnings Per Share (EPS)" value={eps} onChange={setEps} prefix="$" />
                <CI id="dps" label="Dividends Per Share (DPS)" value={dps} onChange={setDps} prefix="$" />
              </div>
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold">Payout Analysis</h2>
                  <PieChartIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Dividend Payout Ratio</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.dpr)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Retention: {fmt(res.retentionRatio)}% · Per Share: {fmt(res.dprPerShare)}%</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { l: "Net Income", v: fmtM(res.netIncome) },
                        { l: "Total Dividends Paid", v: fmtM(res.dividendsPaid) },
                        { l: "Retained Earnings", v: fmtM(res.retainedEarnings) },
                        { l: "Payout Ratio (total)", v: `${fmt(res.dpr)}%`, b: true },
                        { l: "Payout Ratio (per share)", v: `${fmt(res.dprPerShare)}%`, b: true },
                        { l: "Retention Ratio", v: `${fmt(res.retentionRatio)}%` },
                      ].map(r => (
                        <tr key={r.l} className={`hover:bg-secondary/20 ${r.b ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.l}</td>
                          <td className="p-2.5 pr-3 text-right">{r.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Dividends vs Retained Earnings</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={[{ name: "Dividends Paid", value: res.dividendsPaid }, { name: "Retained Earnings", value: Math.max(0, res.retainedEarnings) }]}
                          cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => fmtM(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    { label: "Payout Ratio", value: `${fmt(res.dpr)}%` },
                    { label: "Retention Ratio", value: `${fmt(res.retentionRatio)}%` },
                    { label: "EPS", value: `$${fmt(parseFloat(eps) || 0)}` },
                    { label: "DPS", value: `$${fmt(parseFloat(dps) || 0)}` },
                    { label: "Dividends Paid", value: fmtM(res.dividendsPaid) },
                    { label: "Retained Earnings", value: fmtM(res.retainedEarnings) },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>What Is the Dividend Payout Ratio?</h2>
            <p>The Dividend Payout Ratio (DPR) measures what fraction of a company's net income is distributed to shareholders as cash dividends. The formula is DPR = Total Dividends ÷ Net Income × 100, or equivalently DPR = Dividends Per Share ÷ Earnings Per Share × 100. This metric is fundamental to dividend investing, equity valuation, and understanding a company's capital allocation strategy.</p>
            <p>Every dollar a company earns must be allocated somewhere — dividends or retained earnings. High payout companies return capital to shareholders directly; low payout companies reinvest for future growth. Neither is inherently superior. What matters is whether the chosen payout ratio aligns with the company's growth opportunities, financial health, and shareholder preferences.</p>
            <h2>Payout Ratio and Dividend Sustainability</h2>
            <p>Dividend sustainability analysis is one of the most important applications of DPR. A payout ratio of 40-60% is generally considered healthy for most industries — providing meaningful income while retaining sufficient earnings for growth and financial resilience. A payout ratio consistently above 80-90% for a non-REIT company may signal dividend risk: any earnings decline could force a dividend cut. REITs are required by law to distribute 90%+ of taxable income, making high payout ratios normal for this sector.</p>
            <h2>Retention Ratio and the Sustainable Growth Rate</h2>
            <p>The retention ratio (1 - payout ratio) determines how much of earnings fund internal growth. Combined with Return on Equity (ROE), it yields the Sustainable Growth Rate formula: SGR = ROE × Retention Ratio. A company with 15% ROE retaining 60% of earnings can sustainably grow at 9% per year without external financing. This is why dividend policy and growth strategy are fundamentally linked in financial management.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-payout-ratio-calculator" />
          <PopularCalculators exclude="/calculator/dividend-payout-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
