"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface StockInput {
  shares: number;
  buyPrice: number;
  sellPrice: number;
  buyCommission: number;
  sellCommission: number;
  dividends: number;
  holdingYears: number;
}

interface StockResult {
  costBasis: number;
  proceeds: number;
  profit: number;
  roi: number;
  annualizedRoi: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcStock(input: StockInput): StockResult {
  const costBasis = input.shares * input.buyPrice + input.buyCommission;
  const proceeds = input.shares * input.sellPrice - input.sellCommission;
  const profit = proceeds - costBasis + input.dividends;
  const roi = costBasis > 0 ? (profit / costBasis) * 100 : 0;
  const annualizedRoi = input.holdingYears > 0 && profit > -costBasis ? (Math.pow(1 + roi / 100, 1 / input.holdingYears) - 1) * 100 : roi;

  const chartData = [
    { name: "Cost Basis", value: Number(costBasis.toFixed(0)), fill: "#94a3b8" },
    { name: "Sale Proceeds", value: Number(proceeds.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Dividends", value: Number(input.dividends.toFixed(0)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Shares", value: `${input.shares.toLocaleString()}` },
    { label: "Buy Price", value: `$${input.buyPrice.toFixed(2)}` },
    { label: "Sell Price", value: `$${input.sellPrice.toFixed(2)}` },
    { label: "Cost Basis (incl. buy fee)", value: `$${costBasis.toLocaleString()}` },
    { label: "Sale Proceeds (net)", value: `$${proceeds.toLocaleString()}` },
    { label: "Dividends Received", value: `$${input.dividends.toLocaleString()}` },
    { label: "Total Profit / Loss", value: `${profit >= 0 ? "+" : "−"}$${Math.abs(profit).toLocaleString()}` },
    { label: "Total Return (ROI)", value: `${roi >= 0 ? "+" : "−"}${Math.abs(roi).toFixed(1)}%` },
    { label: "Annualized Return", value: `${annualizedRoi >= 0 ? "+" : "−"}${Math.abs(annualizedRoi).toFixed(1)}%/yr` },
  ];

  const summaryStats = [
    { label: "Total Profit", value: `${profit >= 0 ? "+" : "−"}$${Math.abs(profit).toLocaleString()}` },
    { label: "ROI", value: `${roi >= 0 ? "+" : "−"}${Math.abs(roi).toFixed(1)}%` },
    { label: "Annualized", value: `${annualizedRoi >= 0 ? "+" : "−"}${Math.abs(annualizedRoi).toFixed(1)}%/yr` },
    { label: "Cost Basis", value: `$${costBasis.toLocaleString()}` },
    { label: "Dividends", value: `$${input.dividends.toLocaleString()}` },
    { label: "Holding Period", value: `${input.holdingYears} years` },
  ];

  return { costBasis, proceeds, profit, roi, annualizedRoi, chartData, breakdown, summaryStats };
}

const DEFAULTS: StockInput = { shares: 100, buyPrice: 50, sellPrice: 75, buyCommission: 10, sellCommission: 10, dividends: 150, holdingYears: 2 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function StockCalculator() {
  const [shares, setShares] = useState(String(DEFAULTS.shares));
  const [buyPrice, setBuyPrice] = useState(String(DEFAULTS.buyPrice));
  const [sellPrice, setSellPrice] = useState(String(DEFAULTS.sellPrice));
  const [buyCommission, setBuyCommission] = useState(String(DEFAULTS.buyCommission));
  const [sellCommission, setSellCommission] = useState(String(DEFAULTS.sellCommission));
  const [dividends, setDividends] = useState(String(DEFAULTS.dividends));
  const [holdingYears, setHoldingYears] = useState(String(DEFAULTS.holdingYears));
  const [result, setResult] = useState<StockResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcStock({ shares: parse(shares, DEFAULTS.shares), buyPrice: parse(buyPrice, DEFAULTS.buyPrice), sellPrice: parse(sellPrice, DEFAULTS.sellPrice), buyCommission: parse(buyCommission, DEFAULTS.buyCommission), sellCommission: parse(sellCommission, DEFAULTS.sellCommission), dividends: parse(dividends, DEFAULTS.dividends), holdingYears: Math.max(0.1, parse(holdingYears, DEFAULTS.holdingYears)) }));
  const reset = () => {
    setShares(String(DEFAULTS.shares));
    setBuyPrice(String(DEFAULTS.buyPrice));
    setSellPrice(String(DEFAULTS.sellPrice));
    setBuyCommission(String(DEFAULTS.buyCommission));
    setSellCommission(String(DEFAULTS.sellCommission));
    setDividends(String(DEFAULTS.dividends));
    setHoldingYears(String(DEFAULTS.holdingYears));
    setResult(calcStock(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcStock(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I calculate stock profit?", answer: "Profit = (Sell Price × Shares − Sell Fees) − (Buy Price × Shares + Buy Fees) + Dividends. The result is your total return after all costs. For a 100-share trade bought at $50 and sold at $75 with $10 commissions and $150 dividends: ($7,490) − ($5,010) + $150 = $2,630 profit." },
    { question: "What is ROI on a stock?", answer: "Return on Investment = Profit ÷ Cost Basis × 100. It tells you the percentage gain relative to what you put in. A $2,630 profit on a $5,010 cost basis is a 52.5% return — before considering how long you held the position." },
    { question: "How is annualized return different?", answer: "Annualized return normalizes total return to a yearly rate so different holding periods can be compared. A 52.5% gain over 2 years is about 23.5% per year. The formula is (1 + Total ROI)^(1/years) − 1. Always compare investments on an annualized basis." },
    { question: "Do commissions matter?", answer: "More than most investors realize. On a $5,000 purchase, a $10 commission is 0.2% of cost — small. But frequent trading with $5–$10 fees on both sides can consume 1–2% of a small account per round trip. Include fees in your calculation; this calculator does." },
    { question: "How are dividends counted?", answer: "Dividends are cash payments per share that add to total return. They're counted as income in the profit calculation and often reinvested to compound growth. Over long holding periods, dividends can represent 30–50% of total return for value and blue-chip stocks." },
    { question: "Does this account for taxes?", answer: "No — this calculator reports pre-tax returns. Short-term gains (held under a year) are taxed as ordinary income; long-term gains are taxed at preferential rates. Dividends may be qualified or ordinary. Subtract your marginal tax rate to estimate after-tax profit." },
  ];

  const profitColor = result ? (result.profit >= 0 ? "text-emerald-600" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Stock Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Stock Return Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Shares</label>
                <div className={inp}><input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Buy Price per Share</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sell Price per Share</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Buy Commission</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={buyCommission} onChange={(e) => setBuyCommission(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sell Commission</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={sellCommission} onChange={(e) => setSellCommission(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Dividends Received</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={dividends} onChange={(e) => setDividends(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Holding Period</label>
                <div className={inp}><input type="number" value={holdingYears} onChange={(e) => setHoldingYears(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Profit / Loss</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${profitColor}`}>{result.profit >= 0 ? "+" : "−"}${Math.abs(result.profit).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">ROI: {result.roi >= 0 ? "+" : "−"}{Math.abs(result.roi).toFixed(1)}% · Annualized: {result.annualizedRoi >= 0 ? "+" : "−"}{Math.abs(result.annualizedRoi).toFixed(1)}%/yr</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["ROI", `${result.roi >= 0 ? "+" : "−"}${Math.abs(result.roi).toFixed(1)}%`], ["Annualized", `${result.annualizedRoi >= 0 ? "+" : "−"}${Math.abs(result.annualizedRoi).toFixed(1)}%`], ["Dividends", `$${result.breakdown[5].value}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Trade Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Capital Flows</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Calculating True Stock Returns</h2>
            <p>Total stock return has three components: price appreciation, dividends, and the drag of transaction costs. Most investors track only the price change, which can overstate results dramatically for small, frequently traded positions. This calculator nets buy and sell commissions and adds dividends to produce the true total return.</p>
            <h2 className="text-2xl font-bold mb-3">ROI vs Annualized Return</h2>
            <p>ROI answers "how much did I make on my money?" Annualized return answers "how fast did it grow per year?" They diverge with time: a 100% gain over 5 years is a modest 14.9% per year, while the same gain in 1 year is exceptional. Use annualized return to compare investments held for different periods.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmark Your Performance</h2>
            <p>Compare your annualized return against the S&P 500's long-run average of roughly 10% (before inflation). Beating the market is the exception, not the rule — most active traders underperform. If your strategy can't clear the index after costs, low-cost index funds remain the rational default.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stock-calculator" />
          <PopularCalculators exclude="/calculator/stock-calculator" />
        </div>
      </div>
    </>
  );
}
