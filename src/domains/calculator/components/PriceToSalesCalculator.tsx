"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getPSRating = (ps: number) => {
  if (ps < 1) return { label: "Deep Value / Low Growth", color: "#10b981", desc: "Trading below 1x revenue — often signals undervaluation or distress." };
  if (ps <= 3) return { label: "Reasonable Valuation", color: "#3b82f6", desc: "Typical for mature, profitable companies with steady revenues." };
  if (ps <= 8) return { label: "Growth Premium", color: "#f59e0b", desc: "Market pricing in above-average revenue growth expectations." };
  return { label: "High Growth Premium", color: "#ef4444", desc: "Aggressive growth expectations baked in — requires strong execution." };
};

const PriceToSalesCalculator = () => {
  const DEFAULTS = { stockPrice: "120", shares: "50000", revenue: "2000000", useQuarterly: false };
  const [stockPrice, setStockPrice] = useState(DEFAULTS.stockPrice);
  const [shares, setShares] = useState(DEFAULTS.shares);
  const [revenue, setRevenue] = useState(DEFAULTS.revenue);
  const [useQuarterly, setUseQuarterly] = useState(DEFAULTS.useQuarterly);
  const [result, setResult] = useState<any>(null);

  const calculate = (sp = stockPrice, sh = shares, rev = revenue, uq = useQuarterly) => {
    const SP = parseFloat(sp) || 0;
    const SH = parseFloat(sh) || 0;
    const REV = parseFloat(rev) || 0;
    if (!SP || !SH || !REV || SH <= 0 || REV <= 0) return;
    const annualRev = uq ? REV * 4 : REV;
    const marketCap = SP * SH;
    const rps = annualRev / SH;
    const ps = SP / rps;
    const rating = getPSRating(ps);
    const chartData = [
      { name: "Market Cap", value: parseFloat(marketCap.toFixed(0)) },
      { name: "Annual Revenue", value: parseFloat(annualRev.toFixed(0)) },
    ];
    setResult({ SP, SH, REV, annualRev, marketCap, rps, ps, rating, chartData, uq });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setStockPrice(DEFAULTS.stockPrice); setShares(DEFAULTS.shares);
    setRevenue(DEFAULTS.revenue); setUseQuarterly(DEFAULTS.useQuarterly);
    calculate(DEFAULTS.stockPrice, DEFAULTS.shares, DEFAULTS.revenue, DEFAULTS.useQuarterly);
  };

  const faqs = [
    { question: "What is the price-to-sales (P/S) ratio?", answer: "The price-to-sales ratio compares a company's market capitalization to its total revenue. It shows how much investors are willing to pay for every dollar of sales the company generates. A P/S of 3x means the company's market cap is 3 times its annual revenue." },
    { question: "What is the P/S ratio formula?", answer: "P/S Ratio = Stock Price / Revenue Per Share. Equivalently: P/S = Market Capitalization / Annual Revenue. Revenue Per Share = Annual Revenue / Shares Outstanding." },
    { question: "What is a good P/S ratio?", answer: "It depends heavily on growth rate, profitability, and industry. Mature profitable companies often trade at 1–3x revenue. High-growth SaaS companies may trade at 10–50x revenue. Unprofitable early-stage companies may command very high P/S ratios based on future revenue expectations. Always compare within the same industry and growth profile." },
    { question: "Why use P/S instead of P/E for growth companies?", answer: "Many growth companies — especially in tech, biotech, and e-commerce — are unprofitable during their expansion phase, making P/E ratio meaningless (negative earnings). The P/S ratio allows investors to value these companies on revenue scale, which is visible and comparable even when profits are negative." },
    { question: "What are the limitations of P/S ratio?", answer: "P/S ignores profitability entirely. A company with $1B in revenue and 60% gross margins is far more valuable than one with $1B in revenue and 10% margins — yet both may show the same P/S. Always pair P/S with gross margin analysis, revenue growth rate, and path to profitability." },
    { question: "How does P/S relate to P/E?", answer: "P/S × Net Profit Margin ≈ P/E (approximately). A company with a 5x P/S ratio and 20% net margin would have an implied P/E of about 25x. This relationship helps bridge between revenue-based and earnings-based valuation frameworks." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Price to Sales Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Price to Sales Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Stock Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={stockPrice} onChange={(e) => setStockPrice(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="120" min="0.01" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Shares Outstanding</label>
              <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="50000" min="1" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">{useQuarterly ? "Quarterly Revenue" : "Annual Revenue"}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="2000000" min="1" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={useQuarterly} onChange={(e) => setUseQuarterly(e.target.checked)} className="rounded" />
              Use quarterly revenue (will annualize × 4)
            </label>
            <div className="flex gap-3">
              <button onClick={() => calculate(stockPrice, shares, revenue, useQuarterly)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Price to Sales (P/S) Ratio</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.ps)}x</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">P/S Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Stock Price", value: `$${fmt(result.SP)}` },
                    { label: "Shares Outstanding", value: fmt(result.SH, 0) },
                    { label: "Market Capitalization", value: `$${fmt(result.marketCap)}` },
                    { label: result.uq ? "Quarterly Revenue" : "Annual Revenue", value: `$${fmt(result.REV)}` },
                    ...(result.uq ? [{ label: "Annualized Revenue (×4)", value: `$${fmt(result.annualRev)}` }] : []),
                    { label: "Revenue Per Share (RPS)", value: `$${fmt(result.rps)}` },
                    { label: "P/S Ratio", value: `${fmt(result.ps)}x` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Market Cap vs Annual Revenue</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Valuation Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Stock Price", value: `$${fmt(result.SP)}` },
                    { label: "Revenue Per Share", value: `$${fmt(result.rps)}` },
                    { label: "Market Cap", value: `$${fmt(result.marketCap)}` },
                    { label: "Annual Revenue", value: `$${fmt(result.annualRev)}` },
                    { label: "P/S Ratio", value: `${fmt(result.ps)}x`, border: true, bold: true },
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Price to Sales Ratio Calculator?</h2>
            <p>A price-to-sales (P/S) ratio calculator compares a company's market capitalization to its total revenue, showing investors how much they are paying for each dollar of sales. Pre-filled with a $120 stock price, 50,000 shares, and $2,000,000 in annual revenue, the P/S ratio is 3.00x — typical for a mature company with predictable revenue streams.</p>
            <h2 className="text-2xl font-bold mb-3">The P/S Ratio Formula</h2>
            <p><strong>P/S Ratio = Stock Price / Revenue Per Share = Market Capitalization / Annual Revenue</strong></p>
            <p>For our defaults: Market Cap = $120 × 50,000 = $6,000,000. Revenue Per Share = $2,000,000 / 50,000 = $40.00. P/S = $120 / $40.00 = 3.00x.</p>
            <h2 className="text-2xl font-bold mb-3">Why P/S Matters for Growth Companies</h2>
            <p>The P/S ratio is especially valuable for early-stage and high-growth companies that are not yet profitable. Unlike the P/E ratio (which is undefined for loss-making companies), P/S can be calculated and compared even when earnings are negative. During the SaaS boom, companies like Salesforce and Shopify were consistently valued at 15–30x revenue, reflecting expectations of massive future profit margins.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>P/S ratios vary widely: Grocery retail: 0.1–0.5x (thin margins, high volume). Auto manufacturing: 0.3–1.0x. Banking: 1.0–3.0x. Consumer packaged goods: 2.0–5.0x. Software (SaaS): 5.0–20.0x. Pharmaceutical: 3.0–15.0x (unpredictable revenue from drug approvals). Biotech: can exceed 50x based on pipeline expectations.</p>
            <h2 className="text-2xl font-bold mb-3">P/S and Gross Margin</h2>
            <p>The P/S ratio must be evaluated alongside gross margin. A company with $1B revenue and 80% gross margins (software) is fundamentally different from one with 15% gross margins (hardware). High-margin businesses can support much higher P/S multiples because more of each revenue dollar eventually flows to the bottom line. A framework: P/S / Gross Margin = Price-to-Gross Profit, which normalizes the ratio for margin differences.</p>
            <h2 className="text-2xl font-bold mb-3">The Rule of 40 Connection</h2>
            <p>For SaaS companies, the "Rule of 40" states that a healthy SaaS company should have Revenue Growth Rate + EBITDA Margin ≥ 40%. Companies exceeding Rule of 40 typically command P/S ratios of 10–20x or more. Below-Rule-of-40 companies are often valued at 3–8x revenue regardless of the absolute revenue size.</p>
            <h2 className="text-2xl font-bold mb-3">Annualizing Quarterly Revenue</h2>
            <p>When using the most recent quarterly revenue figure (as reported by public companies), multiply by 4 to get a run-rate annual estimate. This is common in equity research models but can distort seasonal businesses — retail companies may have very high Q4 revenue that doesn't represent a sustainable quarterly run rate. The checkbox option on this calculator automatically annualizes quarterly inputs for convenience.</p>
            <h2 className="text-2xl font-bold mb-3">P/S vs EV/Revenue</h2>
            <p>A more precise version of P/S uses Enterprise Value (EV = Market Cap + Debt − Cash) instead of market cap: EV/Revenue. This accounts for capital structure differences between companies — a company with $500M market cap but $2B debt is very differently leveraged than a pure-equity company with $500M market cap. EV/Revenue is the preferred metric in investment banking for M&A valuation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/price-to-sales-calculator" />
          <PopularCalculators exclude="/calculator/price-to-sales-calculator" />
        </div>
      </div>
    </>
  );
};

export default PriceToSalesCalculator;
