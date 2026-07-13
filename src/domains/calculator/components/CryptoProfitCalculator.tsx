"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CryptoResult {
  profitLoss: number;
  profitLossPct: number;
  totalBuyValue: number;
  totalSellValue: number;
  netProfit: number;
  breakEvenPrice: number;
  roi: number;
  breakdown: { label: string; value: string }[];
  chartData: { metric: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCryptoProfit(
  buyPrice: number, sellPrice: number, amount: number,
  buyFeesPct: number, sellFeesPct: number, investmentUSD: number
): CryptoResult {
  const coinsBought = investmentUSD > 0 ? investmentUSD / buyPrice : amount;
  const totalBuyValue = coinsBought * buyPrice;
  const buyFees = totalBuyValue * (buyFeesPct / 100);
  const totalCostBasis = totalBuyValue + buyFees;

  const grossSellValue = coinsBought * sellPrice;
  const sellFees = grossSellValue * (sellFeesPct / 100);
  const totalSellValue = grossSellValue - sellFees;

  const profitLoss = totalSellValue - totalCostBasis;
  const profitLossPct = (profitLoss / totalCostBasis) * 100;
  const roi = profitLossPct;
  const netProfit = profitLoss;
  const breakEvenPrice = (totalCostBasis / coinsBought) / (1 - sellFeesPct / 100);

  const breakdown = [
    { label: "Coins / Tokens", value: coinsBought.toFixed(8) },
    { label: "Buy Price", value: `$${buyPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Total Investment", value: `$${totalCostBasis.toFixed(2)}` },
    { label: "Buy Fees", value: `$${buyFees.toFixed(2)} (${buyFeesPct}%)` },
    { label: "Sell Price", value: `$${sellPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Gross Sell Value", value: `$${grossSellValue.toFixed(2)}` },
    { label: "Sell Fees", value: `$${sellFees.toFixed(2)} (${sellFeesPct}%)` },
    { label: "Net Sell Value", value: `$${totalSellValue.toFixed(2)}` },
    { label: "Profit / Loss", value: `${profitLoss >= 0 ? "+" : ""}$${profitLoss.toFixed(2)}` },
    { label: "Break-Even Price", value: `$${breakEvenPrice.toFixed(4)}` },
  ];

  const chartData = [
    { metric: "Cost Basis", value: parseFloat(totalCostBasis.toFixed(2)), color: "hsl(var(--primary))" },
    { metric: "Gross Sale", value: parseFloat(grossSellValue.toFixed(2)), color: "#22c55e" },
    { metric: "Fees Total", value: parseFloat((buyFees + sellFees).toFixed(2)), color: "#ef4444" },
    { metric: "Net P&L", value: parseFloat(Math.abs(netProfit).toFixed(2)), color: netProfit >= 0 ? "#22c55e" : "#ef4444" },
  ];

  const summaryStats = [
    { label: "Profit / Loss", value: `${profitLoss >= 0 ? "+" : ""}$${profitLoss.toFixed(2)}` },
    { label: "ROI", value: `${profitLossPct.toFixed(2)}%` },
    { label: "Break-Even Price", value: `$${breakEvenPrice.toFixed(4)}` },
    { label: "Total Investment", value: `$${totalCostBasis.toFixed(2)}` },
    { label: "Net Proceeds", value: `$${totalSellValue.toFixed(2)}` },
    { label: "Total Fees", value: `$${(buyFees + sellFees).toFixed(2)}` },
  ];

  return { profitLoss, profitLossPct, totalBuyValue, totalSellValue, netProfit, breakEvenPrice, roi, breakdown, chartData, summaryStats };
}

export default function CryptoProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState("30000");
  const [sellPrice, setSellPrice] = useState("45000");
  const [investment, setInvestment] = useState("1000");
  const [buyFees, setBuyFees] = useState("0.5");
  const [sellFees, setSellFees] = useState("0.5");
  const [result, setResult] = useState<CryptoResult | null>(null);

  const calculate = () => {
    const bp = parseFloat(buyPrice) || 0, sp = parseFloat(sellPrice) || 0;
    const inv = parseFloat(investment) || 0;
    const bf = parseFloat(buyFees) || 0, sf = parseFloat(sellFees) || 0;
    if (bp > 0) setResult(calcCryptoProfit(bp, sp, 0, bf, sf, inv));
  };

  useEffect(() => { setResult(calcCryptoProfit(30000, 45000, 0, 0.5, 0.5, 1000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "How is crypto profit calculated?", answer: "Crypto P&L = (Sell Price × Coins Sold) − (Buy Price × Coins Bought) − All Fees. More precisely: Cost Basis = (Buy Price × Coins) + Buy Fees. Net Proceeds = (Sell Price × Coins) − Sell Fees. Profit = Net Proceeds − Cost Basis. Example: Buy $1,000 of Bitcoin at $30,000/BTC (0.0333 BTC), pay 0.5% fee ($5). Sell at $45,000 (0.0333 × $45,000 = $1,500), pay 0.5% fee ($7.50). Net profit = $1,500 − $7.50 − $1,005 = $487.50." },
    { question: "What fees do crypto exchanges charge?", answer: "Major exchange fees: Coinbase: 0.4–1.5% (maker/taker). Binance: 0.1% (maker), 0.1% (taker). Kraken: 0.16–0.26% maker/taker. Crypto.com: 0.075–0.2%. Fees can be reduced by holding the exchange's native token (e.g., BNB on Binance). Always factor fees into profit calculations — on frequent small trades, fees significantly erode returns." },
    { question: "What is the break-even price in crypto trading?", answer: "The break-even price is the sell price at which you neither profit nor lose money, after all fees. Break-Even Price = (Buy Price × (1 + Buy Fee %)) / (1 − Sell Fee %). Example: Buy at $30,000 with 0.5% fee, sell with 0.5% fee: Break-even = ($30,000 × 1.005) / (1 − 0.005) = $30,150 / 0.995 ≈ $30,302. The price must exceed $30,302 for any profit." },
    { question: "Do I need to pay taxes on crypto profits?", answer: "In most countries, yes. In the US, the IRS treats cryptocurrency as property. Short-term gains (held less than 1 year) are taxed as ordinary income (10–37%). Long-term gains (held over 1 year) are taxed at 0%, 15%, or 20% depending on income. Cost basis method (FIFO, LIFO, specific identification) significantly impacts taxable gain. Always consult a tax professional for crypto tax advice." },
    { question: "How do I calculate ROI on crypto?", answer: "Crypto ROI = (Net Profit / Total Cost Basis) × 100%. Using our example: $487.50 profit on $1,005 cost basis = 48.5% ROI. For a 2× gain (100% ROI), the price must exactly double from your break-even price (not just your buy price). ROI does not account for time — a 48% gain in 1 month is very different from a 48% gain over 5 years in terms of annualized performance." },
    { question: "What is dollar-cost averaging (DCA) in crypto?", answer: "DCA is an investment strategy where you invest a fixed dollar amount at regular intervals (weekly, monthly) regardless of price. Instead of trying to time the market, DCA reduces the impact of volatility and eliminates the emotional pressure of buy/sell timing. For example: investing $100/week in Bitcoin over 52 weeks, regardless of price. This results in buying more coins when prices are low and fewer when high, averaging out your cost basis." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Crypto Profit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Crypto Profit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Investment Amount</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={investment} onChange={e => setInvestment(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Buy Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Sell Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Buy Fee</label>
                <div className={inp}><input type="number" value={buyFees} onChange={e => setBuyFees(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Sell Fee</label>
                <div className={inp}><input type="number" value={sellFees} onChange={e => setSellFees(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setBuyPrice("30000"); setSellPrice("45000"); setInvestment("1000"); setBuyFees("0.5"); setSellFees("0.5"); setResult(calcCryptoProfit(30000, 45000, 0, 0.5, 0.5, 1000)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.profitLoss >= 0 ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>{result.profitLoss >= 0 ? "Profit" : "Loss"}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{result.profitLoss >= 0 ? "+" : ""}${result.profitLoss.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">ROI: {result.roi.toFixed(2)}% · Break-even: ${result.breakEvenPrice.toFixed(4)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["ROI", `${result.roi.toFixed(2)}%`], ["Net Proceeds", `$${result.totalSellValue.toFixed(2)}`], ["Break-Even", `$${result.breakEvenPrice.toFixed(2)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm font-bold font-mono">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Trade Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Profit / Loss" ? "font-bold border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold font-mono ${r.label === "Profit / Loss" ? (result.profitLoss >= 0 ? "text-green-600" : "text-red-600") : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">P&L Overview</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>{result.chartData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold font-mono">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Calculate Cryptocurrency Profit</h2>
            <p>This <strong>crypto profit calculator</strong> computes your exact gain or loss from a cryptocurrency trade, accounting for exchange fees on both buy and sell sides. The core formula: <strong>Net Profit = (Sell Price × Coins − Sell Fees) − (Buy Price × Coins + Buy Fees)</strong>. The break-even price is the minimum sell price needed to cover your total cost including fees. ROI is calculated as Net Profit ÷ Total Cost Basis × 100%.</p>
            <h2 className="text-2xl font-bold mb-3">The Hidden Cost of Crypto Fees</h2>
            <p>Exchange fees of 0.5% on both sides might seem small, but on a $10,000 trade, that's $100 in buy fees + $100+ in sell fees = $200+ gone before any profit. On frequent day trades, fees can consume 30–50% of gross profits. Choosing low-fee exchanges (Binance at 0.1%, Kraken Pro at 0.16%) vs. high-fee platforms (Coinbase standard at 1.5%+) makes a dramatic difference in profitability over many trades.</p>
            <h2 className="text-2xl font-bold mb-3">Crypto Tax Implications</h2>
            <p>In the US, every crypto trade is a taxable event. Short-term gains (held ≤12 months) are taxed as ordinary income (10–37%). Long-term gains (held 12+ months) are taxed at 0%, 15%, or 20%. Cost basis methods (FIFO, HIFO, specific ID) determine which coins you're "selling" and can minimize tax liability. Keep detailed records of every trade including date, amount, USD value, and fees for accurate tax reporting.</p>
            <h2 className="text-2xl font-bold mb-3">DCA vs. Lump Sum in Crypto</h2>
            <p>Dollar-cost averaging (DCA) — investing fixed amounts at regular intervals — reduces volatility risk and removes the emotional burden of timing. Studies show DCA typically underperforms lump sum investing when markets trend upward (lump sum captures the full bull run), but significantly outperforms during bear markets and high-volatility periods common in crypto. Related tools: <a href="/calculator/bitcoin-mining-calculator">Bitcoin Mining Calculator</a>, <a href="/calculator/staking-rewards-calculator">Staking Rewards Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/crypto-profit-calculator" />
          <PopularCalculators exclude="/calculator/crypto-profit-calculator" />
        </div>
      </div>
    </>
  );
}
