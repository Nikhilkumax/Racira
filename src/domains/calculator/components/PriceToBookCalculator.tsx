"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getPBRating = (pb: number) => {
  if (pb < 1) return { label: "Undervalued / Below Book", color: "#10b981", desc: "Trading below book value — may indicate deep value opportunity or distress." };
  if (pb <= 2) return { label: "Fair Value", color: "#3b82f6", desc: "Price is reasonable relative to book value. Common in stable sectors." };
  if (pb <= 5) return { label: "Premium Valuation", color: "#f59e0b", desc: "Market assigns premium for brand, growth, or competitive moat." };
  return { label: "Highly Valued / Growth Premium", color: "#ef4444", desc: "Very high premium to book — typical of high-growth tech or consumer companies." };
};

const PriceToBookCalculator = () => {
  const DEFAULTS = { stockPrice: "50", totalAssets: "1000000", totalLiabilities: "400000", shares: "20000", goodwill: "0", showTangible: false };
  const [stockPrice, setStockPrice] = useState(DEFAULTS.stockPrice);
  const [totalAssets, setTotalAssets] = useState(DEFAULTS.totalAssets);
  const [totalLiabilities, setTotalLiabilities] = useState(DEFAULTS.totalLiabilities);
  const [shares, setShares] = useState(DEFAULTS.shares);
  const [goodwill, setGoodwill] = useState(DEFAULTS.goodwill);
  const [showTangible, setShowTangible] = useState(DEFAULTS.showTangible);
  const [result, setResult] = useState<any>(null);

  const calculate = (sp = stockPrice, ta = totalAssets, tl = totalLiabilities, sh = shares, gw = goodwill, st = showTangible) => {
    const SP = parseFloat(sp) || 0;
    const TA = parseFloat(ta) || 0;
    const TL = parseFloat(tl) || 0;
    const SH = parseFloat(sh) || 0;
    const GW = parseFloat(gw) || 0;
    if (!SP || !TA || !SH || SH <= 0) return;
    const bookValue = TA - TL;
    const bvps = bookValue / SH;
    const pb = bvps > 0 ? SP / bvps : 0;
    const tangibleBV = bookValue - GW;
    const tbvps = tangibleBV / SH;
    const ptbv = tbvps > 0 ? SP / tbvps : 0;
    const marketCap = SP * SH;
    const rating = getPBRating(pb);
    const chartData = [
      { name: "Stock Price", value: SP, fill: "#3b82f6" },
      { name: "Book Value / Share", value: parseFloat(bvps.toFixed(2)), fill: "#10b981" },
      ...(st && GW > 0 ? [{ name: "Tangible BV / Share", value: parseFloat(tbvps.toFixed(2)), fill: "#f59e0b" }] : []),
    ];
    setResult({ SP, TA, TL, SH, GW, bookValue, bvps, pb, tangibleBV, tbvps, ptbv, marketCap, rating, chartData, st });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setStockPrice(DEFAULTS.stockPrice); setTotalAssets(DEFAULTS.totalAssets);
    setTotalLiabilities(DEFAULTS.totalLiabilities); setShares(DEFAULTS.shares);
    setGoodwill(DEFAULTS.goodwill); setShowTangible(DEFAULTS.showTangible);
    calculate(DEFAULTS.stockPrice, DEFAULTS.totalAssets, DEFAULTS.totalLiabilities, DEFAULTS.shares, DEFAULTS.goodwill, DEFAULTS.showTangible);
  };

  const faqs = [
    { question: "What is the price-to-book (P/B) ratio?", answer: "The price-to-book ratio compares a company's market capitalization to its book value (shareholders' equity). A P/B of 1.0 means the market values the company at exactly its accounting book value. A P/B above 1.0 means the market assigns a premium above net assets — typically for growth, brand, or competitive moat." },
    { question: "What is the P/B ratio formula?", answer: "P/B Ratio = Stock Price / Book Value Per Share (BVPS). BVPS = (Total Assets − Total Liabilities) / Shares Outstanding. Equivalently: P/B = Market Capitalization / Total Shareholders' Equity." },
    { question: "What is a good P/B ratio?", answer: "It depends heavily on the industry. Capital-intensive sectors (banks, utilities, industrial) typically trade at 1–3x book. Technology and consumer companies often trade at 5–30x book because their most valuable assets (brands, software, patents) are not fully captured in accounting book value. A P/B below 1.0 may indicate deep value or distress." },
    { question: "What is tangible book value?", answer: "Tangible book value excludes intangible assets like goodwill, patents, and trademarks from the book value calculation. The Price-to-Tangible Book Value (PTBV) ratio gives a more conservative view of what shareholders would receive in a liquidation scenario, since intangibles may have little realizable value." },
    { question: "When is the P/B ratio most useful?", answer: "The P/B ratio is most informative for asset-heavy businesses: banks, insurance companies, real estate, and industrial manufacturers. It is less meaningful for software, service, or pharmaceutical companies where the most valuable assets are intellectual property and human capital — not reflected on the balance sheet." },
    { question: "Can a company have a negative book value?", answer: "Yes. If total liabilities exceed total assets, shareholders' equity is negative — making the P/B ratio meaningless. This occurs with highly leveraged companies, companies with years of accumulated losses, or businesses that have returned massive capital via share buybacks (Starbucks, McDonald's). Negative book value does not necessarily mean the company is in distress." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Price to Book Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Price to Book Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Stock Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={stockPrice} onChange={(e) => setStockPrice(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="50" min="0.01" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Total Assets</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={totalAssets} onChange={(e) => setTotalAssets(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1000000" min="0" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Total Liabilities</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={totalLiabilities} onChange={(e) => setTotalLiabilities(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="400000" min="0" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Shares Outstanding</label>
              <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="20000" min="1" />
            </div>
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
                <input type="checkbox" checked={showTangible} onChange={(e) => setShowTangible(e.target.checked)} className="rounded" />
                Calculate Tangible Book Value (exclude goodwill)
              </label>
              {showTangible && (
                <div>
                  <label className="text-base font-medium block mb-1.5">Goodwill &amp; Intangibles</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input type="number" value={goodwill} onChange={(e) => setGoodwill(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0" min="0" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate(stockPrice, totalAssets, totalLiabilities, shares, goodwill, showTangible)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Price to Book (P/B) Ratio</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.pb)}x</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">P/B Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Stock Price", value: `$${fmt(result.SP)}` },
                    { label: "Total Assets", value: `$${fmt(result.TA)}` },
                    { label: "Total Liabilities", value: `$${fmt(result.TL)}` },
                    { label: "Book Value (Equity)", value: `$${fmt(result.bookValue)}` },
                    { label: "Shares Outstanding", value: fmt(result.SH, 0) },
                    { label: "Book Value Per Share (BVPS)", value: `$${fmt(result.bvps)}` },
                    { label: "Market Capitalization", value: `$${fmt(result.marketCap)}` },
                    { label: "P/B Ratio", value: `${fmt(result.pb)}x` },
                    ...(result.st && result.GW > 0 ? [
                      { label: "Goodwill & Intangibles", value: `$${fmt(result.GW)}` },
                      { label: "Tangible Book Value / Share", value: `$${fmt(result.tbvps)}` },
                      { label: "Price to Tangible Book (PTBV)", value: `${fmt(result.ptbv)}x` },
                    ] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Price vs Book Value Per Share</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                    <ReferenceLine x={result.SP} stroke="#94a3b8" strokeDasharray="4 2" />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Valuation Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Stock Price", value: `$${fmt(result.SP)}` },
                    { label: "Book Value Per Share", value: `$${fmt(result.bvps)}` },
                    { label: "Market Cap", value: `$${fmt(result.marketCap)}` },
                    { label: "P/B Ratio", value: `${fmt(result.pb)}x`, border: true, bold: true },
                    ...(result.st && result.GW > 0 ? [{ label: "PTBV Ratio", value: `${fmt(result.ptbv)}x` }] : []),
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
            <h2 className="text-2xl font-bold mb-3">What Is a Price to Book Ratio Calculator?</h2>
            <p>A price-to-book (P/B) ratio calculator compares a company's current stock price to its book value per share — the net accounting value of its assets after subtracting all liabilities. Pre-filled with a $50 stock price, $1,000,000 in total assets, $400,000 in liabilities, and 20,000 shares outstanding, the book value per share is $30.00 and the P/B ratio is 1.67x — a fair valuation for most established businesses.</p>
            <h2 className="text-2xl font-bold mb-3">The P/B Ratio Formula</h2>
            <p><strong>P/B Ratio = Stock Price / Book Value Per Share</strong></p>
            <p>Where: Book Value Per Share (BVPS) = (Total Assets − Total Liabilities) / Shares Outstanding. For our defaults: BVPS = ($1,000,000 − $400,000) / 20,000 = $30.00. P/B = $50.00 / $30.00 = 1.67x.</p>
            <h2 className="text-2xl font-bold mb-3">Tangible Book Value (PTBV)</h2>
            <p>The Price-to-Tangible Book Value (PTBV) ratio is a more conservative variant that strips out intangible assets like goodwill, patents, and trademarks: Tangible BVPS = (Total Assets − Total Liabilities − Goodwill &amp; Intangibles) / Shares Outstanding. PTBV is particularly important when analyzing financial institutions or evaluating acquisition targets at potential liquidation value.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>P/B benchmarks vary by industry. Banking and financial services: 0.5–2.0x (asset-heavy, regulated). Manufacturing and industrial: 1.5–4.0x. Consumer goods / retail: 2.0–8.0x. Technology and software: 5.0–30.0x (most value is human capital and IP, not reflected on the balance sheet). Real estate (REITs): 0.8–2.5x (asset-heavy but with appreciation above historical cost).</p>
            <h2 className="text-2xl font-bold mb-3">When P/B Below 1.0 Is a Warning Sign</h2>
            <p>A P/B below 1.0 can mean: (1) the market believes the company's assets are overstated or declining in value, (2) the company is facing operational difficulties, (3) the assets require significant capital to maintain (impairment risk), or (4) it's a genuine deep value opportunity. Benjamin Graham's classic value investing framework often targeted companies trading below tangible book value as margin-of-safety investments.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations of the P/B Ratio</h2>
            <p>Book value is an accounting construct based on historical cost, not fair market value. Assets like real estate, inventory, and equipment are often worth more (or less) than their balance sheet values. The P/B ratio is essentially meaningless for software companies, consulting firms, or pharmaceutical companies where human capital, patents, and brand equity — not recorded on the balance sheet — represent the majority of value. Always use P/B in conjunction with P/E, EV/EBITDA, and ROE analysis.</p>
            <h2 className="text-2xl font-bold mb-3">P/B and Return on Equity Connection</h2>
            <p>The P/B ratio has a fundamental relationship with ROE: P/B = (ROE × Retention Ratio) / (Cost of Equity − Sustainable Growth Rate). Companies with high ROEs typically deserve higher P/B multiples because they generate more value per dollar of book assets. Conversely, companies with ROE below their cost of equity may deserve to trade at a discount to book value — the market anticipates value destruction.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/price-to-book-calculator" />
          <PopularCalculators exclude="/calculator/price-to-book-calculator" />
        </div>
      </div>
    </>
  );
};

export default PriceToBookCalculator;
