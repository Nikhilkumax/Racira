"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface ForexResult {
  pnl: number;
  pnlPct: number;
  pipValue: number;
  totalPips: number;
  requiredMargin: number;
  leveragedExposure: number;
  riskReward: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcForex(
  entryPrice: number, exitPrice: number, lotSize: number,
  lots: number, leverage: number, accountCurrency: string,
  stopLoss: number, takeProfit: number
): ForexResult {
  const units = lotSize * lots;
  const pipSize = 0.0001;
  const totalPips = Math.abs((exitPrice - entryPrice) / pipSize);
  const direction = exitPrice >= entryPrice ? 1 : -1;
  
  // Pip value in USD for XXX/USD pairs
  const pipValue = (pipSize / exitPrice) * units; 
  // Simplified calculation for demo purposes (assumes USD base/counter logic)
  const actualPipValue = (accountCurrency === "USD" ? (pipSize * units) : pipValue);

  const pnl = direction * totalPips * actualPipValue;
  const pnlPct = (pnl / (units / leverage)) * 100;
  
  const requiredMargin = (entryPrice * units) / leverage;
  const leveragedExposure = entryPrice * units;
  
  const slPips = Math.abs((entryPrice - stopLoss) / pipSize);
  const tpPips = Math.abs((takeProfit - entryPrice) / pipSize);
  const riskReward = slPips > 0 ? tpPips / slPips : 0;

  const chartData = [
    { name: "Profit/Loss", value: Math.abs(pnl), color: pnl >= 0 ? "#10b981" : "#ef4444" },
    { name: "Margin Used", value: requiredMargin, color: "#3b82f6" },
  ];

  const breakdown = [
    { label: "Entry Price", value: entryPrice.toFixed(5) },
    { label: "Exit Price", value: exitPrice.toFixed(5) },
    { label: "Trade Direction", value: exitPrice >= entryPrice ? "Long (Buy)" : "Short (Sell)" },
    { label: "Total Pips Captured", value: totalPips.toFixed(1) },
    { label: "Pip Value", value: `$${actualPipValue.toFixed(2)}` },
    { label: "Required Margin", value: `$${requiredMargin.toFixed(2)}` },
    { label: "Total Leveraged Exposure", value: `$${leveragedExposure.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Gross P&L", value: `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` },
    { label: "Return on Margin", value: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%` },
    { label: "Total Pips", value: totalPips.toFixed(1) },
    { label: "Pip Value", value: `$${actualPipValue.toFixed(2)}` },
    { label: "Risk/Reward Ratio", value: `1 : ${riskReward.toFixed(2)}` },
    { label: "Stop Loss Pips", value: slPips.toFixed(1) },
  ];

  return { pnl, pnlPct, pipValue: actualPipValue, totalPips, requiredMargin, leveragedExposure, riskReward, chartData, breakdown, summaryStats };
}

const DEFAULTS = { entry: "1.08500", exit: "1.09200", lots: "1", leverage: "100", stopLoss: "1.08000", takeProfit: "1.09500" };
const STANDARD_LOT = 100000;

export default function ForexProfitCalculator() {
  const [entry, setEntry] = useState(DEFAULTS.entry);
  const [exitP, setExitP] = useState(DEFAULTS.exit);
  const [lots, setLots] = useState(DEFAULTS.lots);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leverage, setLeverage] = useState(DEFAULTS.leverage);
  const [stopLoss, setStopLoss] = useState(DEFAULTS.stopLoss);
  const [takeProfit, setTakeProfit] = useState(DEFAULTS.takeProfit);
  
  const [result, setResult] = useState<ForexResult | null>(null);

  const calculate = () => setResult(calcForex(
    parseFloat(entry) || 0, parseFloat(exitP) || 0, STANDARD_LOT, parseFloat(lots) || 0, 
    parseFloat(leverage) || 1, "USD", parseFloat(stopLoss) || 0, parseFloat(takeProfit) || 0
  ));
  
  const reset = () => { 
    setEntry(DEFAULTS.entry); setExitP(DEFAULTS.exit); setLots(DEFAULTS.lots);
    setLeverage(DEFAULTS.leverage); setStopLoss(DEFAULTS.stopLoss); setTakeProfit(DEFAULTS.takeProfit);
    setShowAdvanced(false);
    setResult(calcForex(1.085, 1.092, STANDARD_LOT, 1, 100, "USD", 1.08, 1.095)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "How is forex profit calculated?", answer: "Forex Profit/Loss is calculated by multiplying the number of pips gained or lost by the pip value, and then multiplying that by the number of lots traded. For example, if you buy 1 standard lot (100,000 units) of EUR/USD, the pip value is roughly $10. If the price moves in your favor by 50 pips, your profit is 50 * $10 = $500." },
    { question: "What exactly is a 'pip' in forex?", answer: "A pip (Percentage In Point) is the smallest standardized price move in a currency pair. For most major pairs like EUR/USD or GBP/USD, a pip is the 4th decimal place (0.0001). However, for pairs involving the Japanese Yen (JPY), a pip is the 2nd decimal place (0.01). Many modern brokers also display a 5th decimal place, known as a 'pipette' or fractional pip." },
    { question: "What is a standard lot size?", answer: "In forex, trade sizes are measured in lots. A 'Standard Lot' represents 100,000 units of the base currency. A 'Mini Lot' is 10,000 units (0.1 lots), and a 'Micro Lot' is 1,000 units (0.01 lots). The lot size you choose directly dictates your pip value and overall risk per trade." },
    { question: "How does leverage affect my margin?", answer: "Leverage allows you to control a large position with a small amount of capital (margin). If you use 100:1 leverage, you only need $1,000 in your account to control a $100,000 standard lot. Required Margin is calculated as: (Position Size / Leverage). While leverage amplifies your potential profits, it equally amplifies your potential losses." },
    { question: "What is a Risk/Reward (R:R) ratio?", answer: "The Risk/Reward ratio compares how much capital you are risking on a trade versus how much you expect to gain. It is calculated by dividing your Take Profit pips by your Stop Loss pips. Professional traders generally aim for a minimum 1:2 ratio, meaning they risk $100 to make $200. With a 1:2 ratio, you only need to win 34% of your trades to be profitable." },
    { question: "Does my account currency matter?", answer: "Yes. If your trading account is denominated in USD, and you are trading a pair where USD is the quote currency (like EUR/USD), your pip value is fixed at $10 per standard lot. However, if you are trading a pair like USD/CAD, the pip value fluctuates based on the current exchange rate, because the profit is calculated in CAD and then converted back to USD." },
    { question: "What is a margin call?", answer: "A margin call occurs when your floating losses reduce your account equity below the broker's required margin level. If the market moves against you aggressively, the broker will automatically close your positions (a stop-out) to prevent your account balance from falling below zero." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Forex Profit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Forex Profit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Entry Price</label><div className={inp}><input type="number" value={entry} onChange={e => setEntry(e.target.value)} step={0.00001} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Exit Price</label><div className={inp}><input type="number" value={exitP} onChange={e => setExitP(e.target.value)} step={0.00001} className={ci} /></div></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Trade Size (Lots)</label><div className={inp}><input type="number" value={lots} onChange={e => setLots(e.target.value)} min={0.01} step={0.01} className={ci} /><span className={suf}>lots</span></div><p className="text-xs text-muted-foreground mt-1">1 Lot = 100,000 units (Standard Lot)</p></div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Risk Management & Margin {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div className="col-span-2"><label className="text-sm font-medium mb-1.5 block">Leverage Ratio</label><div className={inp}><input type="number" value={leverage} onChange={e => setLeverage(e.target.value)} className={ci} /><span className={suf}>:1</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Stop Loss</label><div className={inp}><input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} step={0.00001} className={ci} /></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Take Profit</label><div className={inp}><input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} step={0.00001} className={ci} /></div></div>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-5 ${result.pnl >= 0 ? "border-green-500" : "border-red-500"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>Estimated {result.pnl >= 0 ? "Profit" : "Loss"}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{result.pnl >= 0 ? "+" : ""}${Math.abs(result.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.totalPips.toFixed(1)} Pips Gained · {result.pnlPct >= 0 ? "+" : ""}{result.pnlPct.toFixed(2)}% Return on Margin</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Pip Value", `$${result.pipValue.toFixed(2)}`], ["Margin Req.", `$${result.requiredMargin.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Exposure", `$${(result.leveragedExposure / 1000).toFixed(0)}K`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-lg font-bold font-mono">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Trade Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Total Leveraged") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold font-mono">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Capital Allocation</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>{result.chartData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Forex Profit Calculator?</h2>
            <p>A forex profit calculator is an indispensable risk management tool for currency traders operating in the global foreign exchange market. Unlike trading physical stocks, where calculating profit is as simple as subtracting your buy price from your sell price, forex trading involves complex, leveraged contracts based on exchange rates and standardized lot sizes. Because currencies are traded in pairs (like EUR/USD or USD/JPY), calculating your exact monetary gain or loss requires a deep understanding of pip values, contract units, and margin requirements.</p>
            <p>This calculator removes the mathematical friction from trade planning. By instantly computing your total pip movement, your pip value based on your lot size, and your required margin based on your leverage ratio, it allows you to see the precise financial outcome of any trade scenario before you ever risk a single dollar in the live markets. It is the ultimate tool for enforcing strict position sizing and money management rules.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics behind forex profit calculations rely on determining the value of a single price movement (a pip) and multiplying it by the total size of your position. Here is how the calculator processes your inputs.</p>
            <p>First, it determines your <strong>Total Pips</strong>. A pip is the 4th decimal place for most major currency pairs (0.0001). The calculator subtracts your Entry Price from your Exit Price and divides by the pip size. Formula: <code>Total Pips = (Exit Price - Entry Price) / 0.0001</code>. If you buy EUR/USD at 1.08500 and sell at 1.09200, you have gained 70 pips.</p>
            <p>Next, it determines your <strong>Pip Value</strong>. The pip value is dictated by your Trade Size (Lots). A standard lot controls 100,000 units of currency. A mini lot controls 10,000 units, and a micro lot controls 1,000 units. For pairs where USD is the quote currency (like EUR/USD), the pip value is exactly $10 per standard lot. If you trade 0.5 lots (50,000 units), your pip value is $5.</p>
            <p>Finally, it calculates your <strong>Total Profit/Loss</strong> by multiplying the Total Pips by the Pip Value. Formula: <code>P&L = Total Pips * Pip Value</code>. In our example, 70 pips multiplied by a $10 pip value equals a $700 profit.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you execute a calculation, the tool provides five distinct analytical sections designed to give you total visibility into your trade's risk and reward profile.</p>
            <p><strong>Primary Result Card:</strong> This boldly displays your Estimated Profit or Loss. Crucially, it also displays your Return on Margin (the percentage return based specifically on the capital you had to lock up to open the trade, not the total leveraged exposure).</p>
            <p><strong>3-Stat Bar:</strong> This section highlights your Pip Value, the Margin Required to open the trade, and your Total Leveraged Exposure. Knowing your exposure is vital; controlling $100,000 of currency with a $1,000 account means a tiny 1% market swing equals a 100% swing in your account equity.</p>
            <p><strong>Trade Breakdown Table:</strong> A comprehensive, line-by-line accounting that tracks exactly how your entry and exit prices resulted in your final P&L, providing transparency into the underlying math.</p>
            <p><strong>Capital Allocation Chart:</strong> A visual bar chart comparing your Margin Used against your Gross Profit/Loss. This instantly illustrates how much capital you are putting at risk relative to your expected return.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating your risk metrics, prominently featuring your Risk/Reward (R:R) ratio if you utilized the advanced stop loss and take profit inputs.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors: Leverage and Margin</h2>
            <p>To successfully navigate the forex market, you must understand the double-edged sword of leverage and how it dictates your margin requirements.</p>
            <p><strong>Leverage:</strong> Leverage is essentially a loan from your broker that allows you to control a massive position with a tiny deposit. If your broker offers 100:1 leverage, it means for every $1 in your account, you can control $100 in the market. While leverage is necessary to make meaningful profits from tiny decimal movements in currency prices, it mathematically guarantees that losses will be amplified just as aggressively.</p>
            <p><strong>Required Margin:</strong> This is the exact dollar amount your broker will "lock" in your account to hold the trade open. Formula: <code>Required Margin = (Position Size * Exchange Rate) / Leverage Ratio</code>. If you buy 1 standard lot of EUR/USD (100,000 units) at 1.08500 with 100:1 leverage, the required margin is (100,000 * 1.08500) / 100 = $1,085. You cannot use this $1,085 to open other trades until you close this position.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features: Risk Management</h2>
            <p>The Advanced Options tab elevates this calculator from a simple P&L tool into a professional risk assessment terminal by introducing Stop Loss and Take Profit modeling.</p>
            <p>By inputting your intended <strong>Stop Loss</strong> and <strong>Take Profit</strong> levels, the calculator computes your exact <strong>Risk/Reward (R:R) Ratio</strong>. This is the cornerstone of professional trading. If your stop loss is 20 pips away and your take profit is 60 pips away, your R:R ratio is 1:3. This means you are risking $1 to make $3.</p>
            <p>With a 1:3 ratio, you can lose 7 out of 10 trades and still be highly profitable. Amateur traders focus entirely on win rate; professional traders focus entirely on their Risk/Reward ratio and strict position sizing. This calculator forces you to visualize that ratio before you execute the trade.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how utilizing this calculator can prevent disastrous over-leveraging and ensure disciplined position sizing.</p>
            <p><strong>Example 1: The Amateur Gambler.</strong> You have a $2,000 account. You see EUR/USD moving up, so you buy 1 standard lot (100,000 units) at 1.08500. Your leverage is 100:1, requiring $1,085 in margin. The price drops against you by 50 pips to 1.08000. Because your pip value is $10, you are instantly down $500. You just lost 25% of your entire account balance on a single trade because your lot size was far too large for your account equity.</p>
            <p><strong>Example 2: The Disciplined Professional.</strong> You also have a $2,000 account. You want to buy EUR/USD at 1.08500, with a stop loss at 1.08000 (50 pips of risk). Your strict risk management rule dictates you never risk more than 2% of your account ($40) on a single trade. Using the calculator, you determine you must trade 0.08 lots (8,000 units). At 0.08 lots, your pip value is $0.80. If the trade hits your 50-pip stop loss, you lose exactly $40. You live to trade another day.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Forex trading is inherently risky. Survival depends on mathematical discipline, not predicting the future. Follow these absolute best practices.</p>
            <p>First, never risk more than 1% to 2% of your total account equity on a single trade setup. Your stop loss distance should dictate your lot size, not the other way around. Decide where your stop loss belongs based on technical analysis, then use the calculator to shrink your lot size until that stop loss distance equals your 1% risk threshold.</p>
            <p>Second, always verify your broker's specific pip values for cross pairs (like GBP/JPY or EUR/AUD). While pairs ending in USD have a static $10 pip value per standard lot (if your account is in USD), cross pairs have fluctuating pip values based on the current exchange rate of the quote currency. The math changes dynamically.</p>
            <p>Third, beware of holding trades over the weekend or during major news events (like Non-Farm Payrolls or Central Bank rate decisions). Brokers can widen their spreads dramatically or "gap" prices past your stop loss, causing you to lose significantly more money than your calculated risk parameters.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Utilizing a comprehensive Forex Profit Calculator bridges the gap between chaotic gambling and structured, professional trading. It removes the emotional component of market speculation by forcing you to confront the exact financial consequences of your actions.</p>
            <p>By defining your required margin, calculating your exact pip values, and enforcing strict Risk/Reward ratios, this tool empowers you to protect your capital, optimize your position sizing, and ultimately build a sustainable, mathematically sound trading career.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/forex-profit-calculator" />
          <PopularCalculators exclude="/calculator/forex-profit-calculator" />
        </div>
      </div>
    </>
  );
}
