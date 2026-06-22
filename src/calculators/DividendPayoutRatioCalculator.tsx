"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface DPRResult { dpr: number; retentionRatio: number; dividendPerShare: number; eps: number; sustainableGrowth: number; }
const DEFAULTS = { dividendsTotal: "1200000000", netIncome: "5800000000", sharesOutstanding: "3000000000", stockPrice: "145", roe: "24" };

function calculate(d: typeof DEFAULTS): DPRResult {
  const divs = parseFloat(d.dividendsTotal) || 0;
  const ni = parseFloat(d.netIncome) || 1;
  const shares = parseFloat(d.sharesOutstanding) || 1;
  const roe = parseFloat(d.roe) || 0;
  const dpr = divs / ni;
  const retentionRatio = 1 - dpr;
  const eps = ni / shares;
  const dividendPerShare = divs / shares;
  const sustainableGrowth = roe * retentionRatio;
  return { dpr, retentionRatio, dividendPerShare, eps, sustainableGrowth };
}

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
const f2 = (n: number) => `$${n.toFixed(2)}`;
const fB = (n: number) => Math.abs(n) >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(0)}M`;

export default function DividendPayoutRatioCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<DPRResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const barData = [
    { name: "Dividends Paid", value: +(r.dpr * 100).toFixed(1), fill: "hsl(var(--primary))" },
    { name: "Retained Earnings", value: +(r.retentionRatio * 100).toFixed(1), fill: "#10b981" },
  ];

  const faqs = [
    { question: "What is the dividend payout ratio?", answer: "The dividend payout ratio = Dividends Paid ÷ Net Income. It shows what percentage of earnings is returned to shareholders as dividends. The remainder (retention ratio = 1 − payout ratio) is reinvested in the business for growth." },
    { question: "What is a good dividend payout ratio?", answer: "It depends on industry and growth stage. Mature, stable companies (utilities, consumer staples): 60–80% payout. Growth companies: 0–20%. Mid-cycle industrials: 30–50%. A payout above 100% means dividends are funded by debt or asset sales — unsustainable without income growth." },
    { question: "What is the retention ratio?", answer: "Retention Ratio = 1 − Payout Ratio = Retained Earnings ÷ Net Income. It measures what fraction of earnings is kept within the business. Combined with ROE, it drives the sustainable growth rate: g = ROE × Retention Ratio." },
    { question: "What is the sustainable growth rate?", answer: "Sustainable Growth Rate = ROE × Retention Ratio. It is the maximum rate at which a company can grow earnings and dividends without changing its capital structure (debt/equity ratio). A company with 20% ROE and 60% retention ratio has an 12% sustainable growth rate." },
    { question: "What is the dividend yield vs. payout ratio difference?", answer: "Payout ratio = Dividends ÷ Net Income (earnings-based). Dividend yield = Annual DPS ÷ Stock Price (price-based). Both are important: payout ratio assesses sustainability (can earnings support this dividend?); yield assesses income relative to investment cost." },
    { question: "Can a company pay dividends with a payout ratio above 100%?", answer: "Yes, temporarily — but it is unsustainable. Companies can fund dividends with cash reserves, asset sales, or debt. Persistent payout above 100% without earnings growth leads to dividend cuts. Investors should monitor this trend closely, especially in income-focused sectors like REITs and MLPs." },
    { question: "Why do growth companies pay no dividends?", answer: "High-growth companies reinvest all earnings at high rates of return (high ROE). Paying dividends would forfeit these high-return reinvestment opportunities. Shareholders benefit more from capital appreciation than income. As growth slows and reinvestment opportunities diminish, initiating dividends becomes optimal (the lifecycle theory of dividends)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Dividend Payout Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dividend Payout Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              { label: "Total Dividends Paid ($)", key: "dividendsTotal", tip: "Annual common dividends declared" },
              { label: "Net Income ($)", key: "netIncome", tip: "Annual net income from income statement" },
              { label: "Shares Outstanding", key: "sharesOutstanding", tip: "Weighted avg shares for per-share calcs" },
              { label: "Return on Equity (%)", key: "roe", tip: "For sustainable growth rate calculation" },
              { label: "Stock Price ($)", key: "stockPrice", tip: "For dividend yield calculation" },
            ] as const).map(({ label, key, tip }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Dividend Payout Ratio</div>
              <div className="text-5xl font-extrabold text-foreground">{pct(r.dpr)}</div>
              <div className="text-sm text-muted-foreground mt-1">Retention Ratio: {pct(r.retentionRatio)}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">DPS</div><div className="font-bold text-lg">{f2(r.dividendPerShare)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">EPS</div><div className="font-bold text-lg">{f2(r.eps)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Sust. Growth</div><div className="font-bold text-lg text-emerald-600">{r.sustainableGrowth.toFixed(1)}%</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Earnings Allocation</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={60}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <RTooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Complete Analysis</h3></div>
              {[
                { label: "Net Income", val: fB(parseFloat(f.netIncome) || 0) },
                { label: "Total Dividends Paid", val: fB(parseFloat(f.dividendsTotal) || 0) },
                { label: "Retained Earnings", val: fB((parseFloat(f.netIncome) || 0) - (parseFloat(f.dividendsTotal) || 0)) },
                { label: "Dividend Payout Ratio", val: pct(r.dpr), bold: true, highlight: true },
                { label: "Retention Ratio", val: pct(r.retentionRatio), bold: true },
                { label: "Earnings Per Share (EPS)", val: f2(r.eps) },
                { label: "Dividends Per Share (DPS)", val: f2(r.dividendPerShare), bold: true },
                { label: "Dividend Yield", val: parseFloat(f.stockPrice) > 0 ? `${(r.dividendPerShare / parseFloat(f.stockPrice) * 100).toFixed(2)}%` : "N/A" },
                { label: "Return on Equity (ROE)", val: `${f.roe}%` },
                { label: "Sustainable Growth Rate", val: `${r.sustainableGrowth.toFixed(2)}%`, bold: true },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Dividend Payout Ratio?</h2>
            <p>The dividend payout ratio measures what percentage of a company&apos;s net income is distributed to common shareholders as dividends. It is a fundamental metric for income investors, equity analysts, and corporate finance professionals assessing a company&apos;s capital allocation policy, dividend sustainability, and long-term growth prospects. Formula: Payout Ratio = Total Dividends ÷ Net Income.</p>
            <h2>Payout Ratio vs. Retention Ratio</h2>
            <p>These two ratios sum to 100%: Payout Ratio + Retention Ratio = 1.0. Payout ratio = percentage of earnings distributed to shareholders. Retention ratio = percentage of earnings reinvested in the business for growth. High retention is characteristic of growth companies; high payout is characteristic of mature, dividend-focused businesses. Neither is inherently better — the optimal balance depends on available reinvestment opportunities at attractive returns.</p>
            <h2>Sustainable Growth Rate</h2>
            <p><strong>g = ROE × Retention Ratio</strong> (the Gordon Growth Model implication). A company with 25% ROE and 60% retention ratio has an sustainable growth rate of 15%. This is the rate at which earnings, dividends, and book value per share can grow indefinitely without changing the capital structure. Growth above this rate requires external equity or debt financing; growth below it generates excess capital that should be returned to shareholders.</p>
            <h2>Dividend Sustainability Analysis</h2>
            <p>A payout ratio below 50% is generally considered safe. 50–75% is moderate risk. Above 80% leaves little margin for earnings variability before dividend cuts become necessary. Above 100% means dividends are not covered by earnings — a red flag unless temporary. Always analyze payout relative to free cash flow (FCF payout ratio = Dividends ÷ Free Cash Flow) rather than just net income, since earnings can include non-cash items.</p>
            <h2>Sector Patterns</h2>
            <p>Utilities: 60–80% payout (regulated, stable income). REITs: 90%+ (legally required to distribute 90% of taxable income). Consumer staples: 40–60% (mature businesses with steady cash flows). Technology: 0–25% (reinvestment-focused). Banks: 30–50% (regulated minimum capital requirements constrain payout). Healthcare: 30–50%. Cyclicals (energy, materials): 20–50% with significant variability through cycles.</p>
            <h2>Dividend Per Share (DPS) and Yield</h2>
            <p>DPS = Total Dividends ÷ Shares Outstanding. Dividend Yield = DPS ÷ Stock Price × 100%. Yield provides the income return per dollar invested. A 3% yield on a stock at $50 means $1.50 DPS annually. Investors often compare dividend yield to bond yields — when yields are similar, the dividend&apos;s growth potential makes equities attractive. Beware of high yields caused by falling stock prices (the "yield trap") rather than growing dividends.</p>
            <h2>Dividend Growth Investing</h2>
            <p>The "Dividend Aristocrats" are S&amp;P 500 companies that have increased dividends for 25+ consecutive years. These companies demonstrate consistent earnings power, disciplined capital allocation, and long-term business durability. DPS growth tracking (5-year CAGR) is often more important than current yield for long-term investors, as compounding dividend increases create substantial income growth over decades. The payout ratio trend over time reveals whether dividend growth is sustainable.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-payout-ratio-calculator" />
          <PopularCalculators exclude="/calculator/dividend-payout-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
