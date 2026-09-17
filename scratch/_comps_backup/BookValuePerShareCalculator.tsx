"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BvpsResult {
  bookValuePerShare: number;
  tangibleBvps: number;
  equityRatio: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBvps(equity: number, shares: number, intangibles: number, marketPrice: number): BvpsResult {
  const sh = Math.max(1, shares);
  const bookValuePerShare = equity / sh;
  const tangibleBvps = (equity - intangibles) / sh;
  const equityRatio = equity > 0 ? (tangibleBvps / bookValuePerShare) * 100 : 0;

  return {
    bookValuePerShare,
    tangibleBvps,
    equityRatio,
    chartData: [
      { name: "Book Value/Share", value: +bookValuePerShare.toFixed(2) },
      { name: "Tangible BVPS", value: +tangibleBvps.toFixed(2) },
      { name: "Market Price", value: +marketPrice.toFixed(2) },
    ],
    breakdown: [
      { label: "Total Shareholder Equity", value: `$${equity.toLocaleString()}` },
      { label: "Shares Outstanding", value: `${sh.toLocaleString()}` },
      { label: "Intangible Assets", value: `$${intangibles.toLocaleString()}` },
      { label: "Book Value per Share", value: `$${bookValuePerShare.toFixed(2)}` },
      { label: "Tangible Book Value/Share", value: `$${tangibleBvps.toFixed(2)}` },
      { label: "Tangible Share of BVPS", value: `${equityRatio.toFixed(1)}%` },
      { label: "Market Price", value: `$${marketPrice.toFixed(2)}` },
      { label: "P/B Ratio (if price given)", value: marketPrice > 0 ? `${(marketPrice / bookValuePerShare).toFixed(2)}×` : "—" },
    ],
    summaryStats: [
      { label: "Book Value/Share", value: `$${bookValuePerShare.toFixed(2)}` },
      { label: "Tangible BVPS", value: `$${tangibleBvps.toFixed(2)}` },
      { label: "P/B Ratio", value: marketPrice > 0 ? `${(marketPrice / bookValuePerShare).toFixed(2)}×` : "—" },
      { label: "Intangibles %", value: `${equity > 0 ? ((intangibles / equity) * 100).toFixed(1) : 0}%` },
      { label: "Shares", value: `${sh.toLocaleString()}` },
      { label: "Total Equity", value: `$${equity.toLocaleString()}` },
    ],
  };
}

const DEFAULTS = { equity: "5000000", shares: "1000000", intangibles: "500000", price: "8.5" };

export default function BookValuePerShareCalculator() {
  const [equity, setEquity] = useState(DEFAULTS.equity);
  const [shares, setShares] = useState(DEFAULTS.shares);
  const [intangibles, setIntangibles] = useState(DEFAULTS.intangibles);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<BvpsResult>(() => calcBvps(5000000, 1000000, 500000, 8.5));

  const calculate = () => setResult(calcBvps(parseFloat(equity) || 0, parseFloat(shares) || 1, parseFloat(intangibles) || 0, parseFloat(price) || 0));
  const reset = () => { setEquity(DEFAULTS.equity); setShares(DEFAULTS.shares); setIntangibles(DEFAULTS.intangibles); setPrice(DEFAULTS.price); setResult(calcBvps(5000000, 1000000, 500000, 8.5)); };
  useEffect(() => { setResult(calcBvps(5000000, 1000000, 500000, 8.5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is book value per share?", answer: "Book value per share (BVPS) is total shareholder equity divided by the number of outstanding shares. It represents the accounting value of each share — what shareholders would receive per share if the company were liquidated at book value." },
    { question: "What is tangible book value?", answer: "Tangible book value subtracts intangible assets (goodwill, patents, trademarks) from equity. It is a more conservative measure because intangibles may not convert to cash in liquidation." },
    { question: "What is the price-to-book (P/B) ratio?", answer: "P/B = market price ÷ book value per share. A P/B above 1 means the market values the company above its accounting value; below 1 suggests the stock may be undervalued (or that the company is troubled)." },
    { question: "Why does book value differ from market value?", answer: "Book value reflects historical accounting costs, while market value reflects what investors expect the company to earn in the future. Growth companies often trade far above book value because their assets (people, brands, IP) are understated on the balance sheet." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Book Value per Share Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Book Value per Share Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Total Shareholder Equity</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={equity} onChange={e => setEquity(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Shares Outstanding</label>
                <div className={inp}><input type="number" value={shares} onChange={e => setShares(e.target.value)} className={ci} min={1} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Intangible Assets</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={intangibles} onChange={e => setIntangibles(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Market Price (for P/B)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} min={0} /></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Book Value per Share</div>
              <div className="text-4xl font-extrabold text-primary">${result.bookValuePerShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Tangible: ${result.tangibleBvps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · P/B: {parseFloat(price) > 0 ? `${(parseFloat(price) / result.bookValuePerShare).toFixed(2)}×` : "—"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Tangible BVPS", `$${result.tangibleBvps.toFixed(2)}`], ["P/B Ratio", parseFloat(price) > 0 ? `${(parseFloat(price) / result.bookValuePerShare).toFixed(2)}×` : "—"], ["Intangibles %", `${(parseFloat(intangibles) / (parseFloat(equity) || 1)) * 100 > 0 ? (((parseFloat(intangibles) || 0) / (parseFloat(equity) || 1)) * 100).toFixed(1) + "%" : "0%"}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Valuation Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Value per Share Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Book Value per Share?</h2>
            <p><strong>Book value per share</strong> is a company's total shareholder equity divided by its outstanding shares. It shows the accounting value backing each share — the per-share amount owners would receive if the company were liquidated at balance-sheet values. It is one of the oldest and most conservative valuation metrics.</p>
            <h2 className="text-2xl font-bold mb-3">Book Value vs. Market Value</h2>
            <p>Book value is built from historical costs recorded on the balance sheet; market value reflects what investors expect the company to earn in the future. The gap between the two is captured by the price-to-book ratio. A P/B below 1 may signal an undervalued or distressed company; a very high P/B usually reflects intangible value — brands, technology, growth — that accounting does not capture.</p>
            <h2 className="text-2xl font-bold mb-3">Tangible Book Value</h2>
            <p>Subtracting intangible assets such as goodwill and patents yields tangible book value, a stricter liquidation proxy. Comparing the two shows how much of the company's recorded equity is intangible — useful when evaluating asset-heavy businesses like banks versus knowledge-intensive ones.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/book-value-per-share-calculator" />
          <PopularCalculators exclude="/calculator/book-value-per-share-calculator" />
        </div>
      </div>
    </>
  );
}
