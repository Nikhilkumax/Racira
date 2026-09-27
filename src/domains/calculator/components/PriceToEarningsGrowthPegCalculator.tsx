"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getPEGRating = (peg: number) => {
  if (peg <= 0) return { label: "Invalid / Negative Growth", color: "#94a3b8", desc: "PEG ratio is not meaningful with negative or zero growth." };
  if (peg < 0.5) return { label: "Deeply Undervalued", color: "#10b981", desc: "Very cheap relative to growth — potential strong buy signal." };
  if (peg <= 1.0) return { label: "Undervalued to Fair Value", color: "#22c55e", desc: "Peter Lynch's sweet spot — paying fairly for growth." };
  if (peg <= 2.0) return { label: "Fairly Valued to Slightly Rich", color: "#f59e0b", desc: "Reasonable if growth materially exceeds peers." };
  return { label: "Overvalued / Priced for Perfection", color: "#ef4444", desc: "Paying a significant premium above growth rate — high execution risk." };
};

const PEGBenchmarks = [
  { name: "Deeply Undervalued", threshold: 0.5, color: "#10b981" },
  { name: "Fair Value (Lynch)", threshold: 1.0, color: "#22c55e" },
  { name: "Fairly Rich", threshold: 2.0, color: "#f59e0b" },
  { name: "Overvalued", threshold: 3.0, color: "#ef4444" },
];

const PriceToEarningsGrowthPegCalculator = () => {
  const DEFAULTS = { stockPrice: "150", eps: "7.50", growthRate: "15", useForward: false };
  const [stockPrice, setStockPrice] = useState(DEFAULTS.stockPrice);
  const [eps, setEps] = useState(DEFAULTS.eps);
  const [growthRate, setGrowthRate] = useState(DEFAULTS.growthRate);
  const [useForward, setUseForward] = useState(DEFAULTS.useForward);
  const [result, setResult] = useState<any>(null);

  const calculate = (sp = stockPrice, e = eps, gr = growthRate, uf = useForward) => {
    const SP = parseFloat(sp) || 0;
    const EPS = parseFloat(e) || 0;
    const GR = parseFloat(gr) || 0;
    if (!SP || !EPS || !GR || EPS <= 0) return;
    const pe = SP / EPS;
    const peg = GR > 0 ? pe / GR : 0;
    const rating = getPEGRating(peg);
    const fairValuePEG1 = EPS * GR;
    const fairValuePEG2 = EPS * GR * 2;
    const upDownside = peg > 0 ? ((fairValuePEG1 - SP) / SP) * 100 : 0;
    const chartData = PEGBenchmarks.map((b) => ({
      name: b.name,
      "Implied Fair Price": parseFloat((EPS * GR * b.threshold / 1).toFixed(2)),
      color: b.color,
    }));
    setResult({ SP, EPS, GR, pe, peg, rating, fairValuePEG1, fairValuePEG2, upDownside, chartData, uf });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setStockPrice(DEFAULTS.stockPrice); setEps(DEFAULTS.eps);
    setGrowthRate(DEFAULTS.growthRate); setUseForward(DEFAULTS.useForward);
    calculate(DEFAULTS.stockPrice, DEFAULTS.eps, DEFAULTS.growthRate, DEFAULTS.useForward);
  };

  const faqs = [
    { question: "What is the PEG ratio?", answer: "The Price/Earnings-to-Growth (PEG) ratio adjusts the classic P/E ratio for the company's expected earnings growth rate. It was popularized by Peter Lynch, who argued that a 'fairly valued' stock should have a PEG of 1.0 — meaning you're paying exactly 1x the earnings growth rate. PEG < 1 suggests undervaluation; PEG > 2 suggests overvaluation." },
    { question: "What is the PEG ratio formula?", answer: "PEG Ratio = (P/E Ratio) / Annual EPS Growth Rate (%). For example: Stock at $150, EPS = $7.50 (P/E = 20x), Growth Rate = 15%: PEG = 20 / 15 = 1.33. This means you're paying 1.33x the growth rate — slightly above Peter Lynch's fair value benchmark of 1.0." },
    { question: "What is a good PEG ratio?", answer: "Peter Lynch defined a PEG of 1.0 as fair value — you're paying exactly 1x for each unit of growth. PEG below 1.0 suggests undervaluation (growth is faster than the price reflects). PEG above 2.0 is generally considered overvalued. However, context matters: fast-growing companies may deserve PEGs of 2–3x if growth acceleration is credible." },
    { question: "What is the difference between trailing and forward PEG?", answer: "Trailing PEG uses the most recent 12-month actual EPS and historical growth rate. Forward PEG uses next-year analyst EPS estimates and projected growth rates. Forward PEG is more forward-looking and commonly used by analysts. Trailing PEG is more conservative and based on confirmed historical performance." },
    { question: "What are the limitations of the PEG ratio?", answer: "The PEG ratio is highly sensitive to the growth rate assumption, which is inherently uncertain. A small change in projected growth rate can dramatically shift PEG. It also ignores capital structure, dividend yield, and differences in business model quality. The PEG ratio is most reliable for steady growth companies with predictable earnings — it breaks down for highly cyclical, capital-intensive, or unprofitable businesses." },
    { question: "Who invented the PEG ratio?", answer: "The PEG ratio was popularized by Peter Lynch, the legendary manager of Fidelity's Magellan Fund, who described it in his books 'One Up on Wall Street' and 'Beating the Street.' Lynch used PEG as a quick screen to identify 'fairly priced' growth stocks. He specifically looked for companies with PEG ratios below 1.0 as potential undervalued opportunities." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "PEG Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PEG Ratio Calculator (Price/Earnings-to-Growth)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Stock Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={stockPrice} onChange={(e) => setStockPrice(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="150" min="0.01" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">{useForward ? "Forward" : "Trailing"} Earnings Per Share (EPS)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={eps} onChange={(e) => setEps(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="7.50" min="0.01" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Expected Annual EPS Growth Rate</label>
              <div className="relative">
                <input type="number" value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} className="h-10 w-full pl-3 pr-7 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="15" step="0.1" min="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={useForward} onChange={(e) => setUseForward(e.target.checked)} className="rounded" />
              Use Forward EPS (next-year analyst estimate)
            </label>
            <div className="flex gap-3">
              <button onClick={() => calculate(stockPrice, eps, growthRate, useForward)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">PEG Ratio (Price/Earnings-to-Growth)</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{result.peg > 0 ? fmt(result.peg) : "N/A"}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">PEG Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Stock Price", value: `$${fmt(result.SP)}` },
                    { label: `${result.uf ? "Forward" : "Trailing"} EPS`, value: `$${fmt(result.EPS)}` },
                    { label: "P/E Ratio", value: `${fmt(result.pe)}x` },
                    { label: "Expected EPS Growth Rate", value: `${fmt(result.GR)}%` },
                    { label: "PEG Ratio", value: result.peg > 0 ? `${fmt(result.peg)}` : "N/A" },
                    { label: "Fair Value @ PEG 1.0", value: `$${fmt(result.fairValuePEG1)}` },
                    { label: "Fair Value @ PEG 2.0", value: `$${fmt(result.fairValuePEG2)}` },
                    { label: "Upside / Downside to PEG 1.0", value: `${result.upDownside >= 0 ? "+" : ""}${fmt(result.upDownside)}%` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-2">Implied Fair Price by PEG Benchmark</h3>
                <p className="text-xs text-muted-foreground mb-3">Current price ${fmt(result.SP)} shown as reference line.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 35 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-12} textAnchor="end" />
                    <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                    <ReferenceLine y={result.SP} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: `Current $${fmt(result.SP)}`, position: "insideTopRight", fontSize: 10 }} />
                    <Bar dataKey="Implied Fair Price" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Valuation Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "P/E Ratio", value: `${fmt(result.pe)}x` },
                    { label: "Growth Rate", value: `${fmt(result.GR)}%` },
                    { label: "Fair Value (PEG = 1.0)", value: `$${fmt(result.fairValuePEG1)}` },
                    { label: "PEG Ratio", value: result.peg > 0 ? `${fmt(result.peg)}` : "N/A", border: true, bold: true },
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
            <h2 className="text-2xl font-bold mb-3">What Is a PEG Ratio Calculator?</h2>
            <p>A PEG ratio calculator divides the price-to-earnings (P/E) ratio by the annual earnings growth rate to create a growth-adjusted valuation metric. Popularized by legendary investor Peter Lynch, the PEG ratio solves a key limitation of the P/E ratio: it doesn't account for how fast the company is growing. Pre-filled with a $150 stock, $7.50 EPS, and 15% growth, the P/E is 20x and the PEG is 1.33 — slightly above Lynch's "fair value" benchmark of 1.0.</p>
            <h2 className="text-2xl font-bold mb-3">The PEG Ratio Formula</h2>
            <p><strong>PEG Ratio = P/E Ratio / Annual EPS Growth Rate (%)</strong></p>
            <p>Step 1: P/E = Stock Price / EPS = $150 / $7.50 = 20.0x. Step 2: PEG = P/E / Growth Rate = 20.0 / 15 = 1.33. A PEG of 1.33 means you're paying 33% more than Peter Lynch's fair value benchmark for each unit of growth.</p>
            <h2 className="text-2xl font-bold mb-3">Peter Lynch's PEG Framework</h2>
            <p>Peter Lynch defined PEG = 1.0 as the dividing line between fair value and overvaluation. He argued that a company growing earnings at 15% per year should, at fair value, trade at a P/E of 15x — giving a PEG of exactly 1.0. Companies with PEG below 1.0 were attractive; above 2.0 were expensive regardless of absolute growth rate. Lynch used this rule to discover multi-bagger investments in his Magellan Fund during the 1970s–90s.</p>
            <h2 className="text-2xl font-bold mb-3">Trailing vs. Forward PEG</h2>
            <p>Trailing PEG uses historically confirmed EPS and realized historical growth rates — conservative and reliable. Forward PEG uses analyst consensus estimates for next-year EPS and projected growth — more forward-looking but dependent on forecast accuracy. Investment banks and professional analysts typically use the Forward PEG for growth stock analysis. Use the checkbox to toggle between both perspectives on this calculator.</p>
            <h2 className="text-2xl font-bold mb-3">Implied Fair Value Calculation</h2>
            <p>At PEG = 1.0 (Peter Lynch's fair value): Implied Price = EPS × Growth Rate. For defaults: $7.50 × 15 = $112.50. At PEG = 2.0 (upper reasonable limit): $7.50 × 15 × 2 = $225.00. The current $150 price falls between these bounds, confirming a fair-to-moderately-rich valuation.</p>
            <h2 className="text-2xl font-bold mb-3">Industry and Growth Stage Considerations</h2>
            <p>The PEG ratio is most reliable for companies growing earnings at 10–30% annually with predictable cash flows. It is less reliable for: (1) hypergrowth companies (50%+ growth) where a PEG of 3–5 may still represent reasonable value if growth sustains, (2) cyclical companies with volatile earnings, (3) mature companies with near-zero or negative growth, and (4) unprofitable companies where EPS is negative. For high-quality compounders (consistent 20%+ ROE, 15–20% EPS growth), a PEG of 1.5–2.0 is often justified by the quality premium.</p>
            <h2 className="text-2xl font-bold mb-3">PEG vs P/E: When to Use Each</h2>
            <p>Use P/E alone for mature, slow-growth businesses where earnings stability matters more than growth rate. Use PEG for mid-cap and large-cap growth companies where earnings growth is the primary driver of future returns. Use neither for unprofitable companies — instead use P/S, EV/Revenue, or discounted cash flow analysis. The best equity analysts use all three metrics together to triangulate a comprehensive valuation picture.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Stock A:</strong> P/E = 30x, Growth = 30% → PEG = 1.0x. Fairly valued by Lynch's standard despite high absolute P/E. <strong>Stock B:</strong> P/E = 15x, Growth = 5% → PEG = 3.0x. Looks cheap but growth-adjusted is expensive. <strong>Stock C:</strong> P/E = 40x, Growth = 50% → PEG = 0.8x. Expensive P/E but growth-adjusted is actually undervalued if growth sustains. The PEG ratio reveals hidden value and hidden risk that absolute P/E misses.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/price-to-earnings-growth-peg-calculator" />
          <PopularCalculators exclude="/calculator/price-to-earnings-growth-peg-calculator" />
        </div>
      </div>
    </>
  );
};

export default PriceToEarningsGrowthPegCalculator;
