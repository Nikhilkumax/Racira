"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Bitcoin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${fmt(n)}`;
const fmtPct = (n: number) => `${fmt(n)}%`;

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface CryptoResult {
  profitLoss: number;
  profitLossPct: number;
  totalBuyCost: number;
  totalSellValue: number;
  totalFees: number;
  netProfitLoss: number;
  roi: number;
  breakEvenPrice: number;
  chartData: { price: number; pl: number }[];
}

export default function CryptoProfitCalculator() {
  const [investmentType, setInvestmentType] = useState<"amount" | "coins">("amount");
  const [investmentAmount, setInvestmentAmount] = useState("5000");
  const [coinCount, setCoinCount] = useState("0.1");
  const [buyPrice, setBuyPrice] = useState("50000");
  const [sellPrice, setSellPrice] = useState("65000");
  const [investmentFee, setInvestmentFee] = useState("0.5");
  const [exitFee, setExitFee] = useState("0.5");
  const [res, setRes] = useState<CryptoResult | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const bp = parseFloat(buyPrice) || 50000;
    const sp = parseFloat(sellPrice) || 65000;
    const buyFee = parseFloat(investmentFee) / 100 || 0.005;
    const sellFee = parseFloat(exitFee) / 100 || 0.005;

    let coins: number, totalBuyCost: number;
    if (investmentType === "amount") {
      const amt = parseFloat(investmentAmount) || 5000;
      const buyFeeAmt = amt * buyFee;
      coins = (amt - buyFeeAmt) / bp;
      totalBuyCost = amt;
    } else {
      coins = parseFloat(coinCount) || 0.1;
      const coinCost = coins * bp;
      totalBuyCost = coinCost + coinCost * buyFee;
    }

    const grossSellValue = coins * sp;
    const sellFeeAmt = grossSellValue * sellFee;
    const totalSellValue = grossSellValue - sellFeeAmt;
    const totalFees = (totalBuyCost * buyFee) + sellFeeAmt;
    const netProfitLoss = totalSellValue - totalBuyCost;
    const profitLossPct = ((sp - bp) / bp) * 100;
    const roi = (netProfitLoss / totalBuyCost) * 100;
    const breakEvenPrice = bp * (1 + buyFee) / (1 - sellFee);

    const range = bp * 1.5;
    const chartData = Array.from({ length: 50 }, (_, i) => {
      const price = bp * 0.25 + (i / 49) * range;
      const gross = coins * price;
      const fee = gross * sellFee;
      const pl = gross - fee - totalBuyCost;
      return { price: parseFloat(price.toFixed(0)), pl: parseFloat(pl.toFixed(2)) };
    });

    setRes({ profitLoss: netProfitLoss, profitLossPct, totalBuyCost, totalSellValue, totalFees, netProfitLoss, roi, breakEvenPrice, chartData });
  };

  const reset = () => {
    setInvestmentType("amount"); setInvestmentAmount("5000"); setCoinCount("0.1");
    setBuyPrice("50000"); setSellPrice("65000"); setInvestmentFee("0.5"); setExitFee("0.5");
    setTimeout(calculate, 0);
  };

  const isProfit = res && res.netProfitLoss >= 0;

  const faqs = [
    { question: "How is cryptocurrency profit calculated?", answer: "Crypto profit = (Sell Price × Coins Sold) − (Buy Price × Coins Bought) − Total Fees. If you bought 0.1 BTC at $50,000 ($5,000 total) and sold at $65,000 ($6,500), your gross profit is $1,500 (30%). After fees (typically 0.1-1% per transaction), your net profit is slightly less. This calculator handles both amount-based and coin-count-based calculations." },
    { question: "What fees should I account for?", answer: "Major fee types: Trading fees (0.1-1% per trade on most exchanges), Network/gas fees (especially for Ethereum), Spread (difference between buy/sell price on some exchanges), Withdrawal fees (flat fee to move crypto off exchange). On Coinbase, fees can be 1.5-2.5%. On Binance, 0.1% with BNB. Gas fees on Ethereum can be $5-$50+. Always include fees for accurate profit calculation." },
    { question: "How do I calculate ROI for cryptocurrency?", answer: "ROI = (Net Profit / Total Investment) × 100. If you invested $5,000 and netted $1,450 after fees, your ROI = 29%. Compare this to holding index funds (10% historical annual return) to evaluate if the crypto risk was worth the reward. Remember: crypto volatility means both outsized gains and losses are possible." },
    { question: "What is the break-even price?", answer: "The break-even price is the minimum price at which you must sell to recover your total investment including buy fees. If you bought at $50,000 with 0.5% buy fee and face a 0.5% sell fee, your break-even price is approximately $50,503 — you must sell above this to profit. Our calculator shows you this exact figure." },
    { question: "Do I owe taxes on crypto profits?", answer: "In most countries, yes. In the US, cryptocurrency is treated as property. Short-term gains (held <1 year) are taxed as ordinary income (10-37%). Long-term gains (held >1 year) are taxed at preferential rates (0%, 15%, or 20%). Every trade is a taxable event. Use crypto tax software (CoinTracker, Koinly) to track your basis accurately." },
    { question: "What's the difference between realized and unrealized profit?", answer: "Unrealized profit (or paper profit) is the gain on crypto you still hold — it exists only on paper until you sell. Realized profit is what you actually pocket after selling. Only realized gains are taxable events. Many investors fall into the trap of celebrating unrealized gains without accounting for the tax liability they'll face when selling." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Crypto Profit Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cryptocurrency Profit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Trade Details</h2>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Investment Type</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["amount", "coins"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setInvestmentType(t)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${investmentType === t ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {t === "amount" ? "By Dollar Amount" : "By Coin Count"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {investmentType === "amount"
                ? <Inp id="invest-amt" label="Investment Amount" value={investmentAmount} onChange={setInvestmentAmount} prefix="$" />
                : <Inp id="coins" label="Number of Coins" value={coinCount} onChange={setCoinCount} />
              }
              <Inp id="buy-price" label="Buy Price (per coin)" value={buyPrice} onChange={setBuyPrice} prefix="$" />
              <Inp id="sell-price" label="Sell Price (per coin)" value={sellPrice} onChange={setSellPrice} prefix="$" />
              <div className="grid grid-cols-2 gap-3">
                <Inp id="buy-fee" label="Buy Fee" value={investmentFee} onChange={setInvestmentFee} suffix="%" />
                <Inp id="sell-fee" label="Sell Fee" value={exitFee} onChange={setExitFee} suffix="%" />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
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
                  <h2 className="text-lg font-bold text-foreground">Results</h2>
                  <Bitcoin className="h-5 w-5 text-primary" />
                </div>

                <div className={`bg-gradient-to-br border rounded-xl p-5 text-center ${isProfit ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : "from-red-500/10 to-red-500/5 border-red-500/20"}`}>
                  <div className={`text-[13px] font-bold mb-1 uppercase tracking-wider ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
                    {isProfit ? "Net Profit" : "Net Loss"}
                  </div>
                  <div className={`text-4xl font-extrabold mb-1 tracking-tight ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
                    {res.netProfitLoss >= 0 ? "+" : ""}{fmtUSD(res.netProfitLoss)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    ROI: {res.roi >= 0 ? "+" : ""}{fmtPct(res.roi)}  |  Price Change: {res.profitLossPct >= 0 ? "+" : ""}{fmtPct(res.profitLossPct)}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Item</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Total Buy Cost", value: fmtUSD(res.totalBuyCost) },
                        { label: "Total Sell Value", value: fmtUSD(res.totalSellValue) },
                        { label: "Total Fees Paid", value: fmtUSD(res.totalFees) },
                        { label: "Net Profit / Loss", value: `${res.netProfitLoss >= 0 ? "+" : ""}${fmtUSD(res.netProfitLoss)}` },
                        { label: "Price Change", value: `${res.profitLossPct >= 0 ? "+" : ""}${fmtPct(res.profitLossPct)}` },
                        { label: "ROI (net of fees)", value: `${res.roi >= 0 ? "+" : ""}${fmtPct(res.roi)}` },
                        { label: "Break-Even Price", value: fmtUSD(res.breakEvenPrice) },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Profit / Loss at Different Sell Prices</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="price" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                      <Tooltip formatter={(v: any) => [fmtUSD(v), "P&L"]} labelFormatter={l => `Sell at $${parseInt(l).toLocaleString()}`} />
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Break-even", fontSize: 9 }} />
                      <Line type="monotone" dataKey="pl" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="P&L" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Buy Cost", value: fmtUSD(res.totalBuyCost) },
                    { label: "Net P&L", value: `${res.netProfitLoss >= 0 ? "+" : ""}${fmtUSD(res.netProfitLoss)}` },
                    { label: "ROI", value: `${res.roi >= 0 ? "+" : ""}${fmtPct(res.roi)}` },
                    { label: "Break-Even", value: fmtUSD(res.breakEvenPrice) },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
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
            <h2>What Is a Cryptocurrency Profit Calculator?</h2>
            <p>A cryptocurrency profit calculator determines your exact gain or loss from a crypto trade, accounting for both buy and sell prices and all associated transaction fees. Whether you're trading Bitcoin, Ethereum, Solana, or any other cryptocurrency, accurately calculating profit requires more than just subtracting the buy price from the sell price. Exchange fees, network gas fees, and spread all erode your actual return.</p>
            <p>This calculator handles all scenarios: investing a fixed dollar amount (how many coins did you get?), or tracking a specific number of coins (what were they worth to buy?). It also shows your break-even price and a profit/loss curve across different sell prices so you can see exactly where your trade becomes profitable.</p>

            <h2>Understanding Crypto Profit Metrics</h2>
            <p>The <strong>price change percentage</strong> is the simple percentage change in the coin's price from buy to sell. A $50,000 → $65,000 move = +30%. However, this ignores fees. The <strong>ROI (Return on Investment)</strong> is your actual return after all fees — typically 0.5-2% lower than the raw price change due to exchange fees on both sides of the trade.</p>
            <p>The <strong>break-even price</strong> is critical: it's the minimum sell price to recover your full investment including buy fees. With typical fees, this is slightly above your buy price. If fees are 0.5% each way, your break-even is approximately buy price × 1.01 (1% total round-trip cost).</p>

            <h2>Cryptocurrency Fees Explained</h2>
            <p>Exchange fees vary widely: Coinbase charges 0.6% for most trades (higher for market orders), Binance charges 0.1% (0.075% with BNB), Kraken charges 0.16-0.26%. DeFi platforms charge swap fees (typically 0.3%) plus network gas fees which can be $1-$100+ on Ethereum depending on congestion. Always factor the total round-trip cost (buy + sell fees) when evaluating trade viability.</p>

            <h2>Tax Implications of Crypto Trading</h2>
            <p>In the United States, every cryptocurrency trade is a taxable event — even crypto-to-crypto swaps. Short-term capital gains (assets held less than one year) are taxed as ordinary income at your marginal rate (10-37%). Long-term gains (held more than one year) benefit from reduced rates (0%, 15%, or 20% depending on income). Keeping detailed records of every transaction, including fees, is essential. The IRS treats cryptocurrency as property, not currency.</p>

            <h2>Practical Crypto Trading Examples</h2>
            <p><strong>Example 1 (Profit):</strong> Buy 0.1 BTC at $50,000 ($5,000 investment, 0.5% fee = $25 cost, so $5,025 total). Sell at $65,000 (0.1 × $65,000 = $6,500, 0.5% fee = $32.50, net $6,467.50). Profit: $6,467.50 - $5,025 = $1,442.50. ROI: 28.7%.</p>
            <p><strong>Example 2 (Break-Even Analysis):</strong> Same trade — break-even price = $50,000 × (1.005) / (1-0.005) = $50,503. You need to sell above $50,503 just to recover your investment. This is why high-fee exchanges significantly hurt small trades.</p>

            <h2>Tips for Maximizing Crypto Returns</h2>
            <p>Use low-fee exchanges for active trading — 0.1% vs 1% fees make a massive difference on frequent trades. Consider tax-loss harvesting: if some crypto is underwater, selling at a loss offsets gains elsewhere. Use a hardware wallet for long-term holdings instead of exchange storage. Never invest more than you can afford to lose in speculative assets. Dollar-cost averaging (buying fixed amounts regularly) reduces timing risk compared to lump-sum investments.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cryptocurrency-profit-calculator" />
          <PopularCalculators exclude="/calculator/cryptocurrency-profit-calculator" />
        </div>
      </div>
    </>
  );
}
