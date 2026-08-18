"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface OptResult {
  type: string;
  strike: number;
  premium: number;
  contracts: number;
  currentPrice: number;
  breakEven: number;
  maxLoss: number;
  maxGain: string;
  profit: number;
  roc: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { price: number; pl: number }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function calcOpt(type: string, strike: number, premium: number, contracts: number, currentPrice: number): OptResult {
  const multiplier = 100;
  const cost = premium * multiplier * contracts;
  let profit: number;
  if (type === "call") {
    profit = (Math.max(0, currentPrice - strike) - premium) * multiplier * contracts;
  } else {
    profit = (Math.max(0, strike - currentPrice) - premium) * multiplier * contracts;
  }
  const breakEven = type === "call" ? strike + premium : strike - premium;
  const maxLoss = cost;
  const maxGain = type === "call" ? "Unlimited" : money((strike - premium) * multiplier * contracts);
  const roc = (profit / Math.max(1, cost)) * 100;
  const breakdown = [
    { label: "Type", value: type === "call" ? "Call Option" : "Put Option" },
    { label: "Strike Price", value: money(strike) },
    { label: "Premium per Share", value: `$${fmt(premium)}` },
    { label: "Contracts (×100 shares)", value: `${contracts}` },
    { label: "Cost to Open", value: money(cost) },
    { label: "Price at Expiry", value: money(currentPrice) },
    { label: "Intrinsic Value", value: money(type === "call" ? Math.max(0, currentPrice - strike) : Math.max(0, strike - currentPrice)) },
    { label: "Profit / Loss", value: `${profit >= 0 ? "+" : "−"} ${money(Math.abs(profit))}` },
    { label: "Return on Capital", value: `${fmt(roc)}%` },
    { label: "Break-Even Price", value: money(breakEven) },
    { label: "Max Loss", value: money(maxLoss) },
    { label: "Max Gain", value: maxGain },
  ];
  const summaryStats = [
    { label: "P/L at Expiry", value: `${profit >= 0 ? "+" : "−"} ${money(Math.abs(profit))}` },
    { label: "Break-Even", value: money(breakEven) },
    { label: "Max Loss", value: money(maxLoss) },
    { label: "Max Gain", value: maxGain },
    { label: "ROI", value: `${fmt(roc)}%` },
  ];
  const chartData: { price: number; pl: number }[] = [];
  const lo = Math.min(strike, currentPrice) * 0.6;
  const hi = Math.max(strike, currentPrice) * 1.4;
  for (let p = lo; p <= hi; p += Math.max(1, (hi - lo) / 40)) {
    const pl = type === "call"
      ? (Math.max(0, p - strike) - premium) * multiplier * contracts
      : (Math.max(0, strike - p) - premium) * multiplier * contracts;
    chartData.push({ price: Number(p.toFixed(2)), pl: Number(pl.toFixed(0)) });
  }
  return { type, strike, premium, contracts, currentPrice, breakEven, maxLoss, maxGain, profit, roc, breakdown, summaryStats, chartData };
}

const DEFAULTS = { type: "call", strike: "100", premium: "4.5", contracts: "1", price: "110" };

export default function OptionsProfitCalculator() {
  const [type, setType] = useState<string>(DEFAULTS.type);
  const [strike, setStrike] = useState(DEFAULTS.strike);
  const [premium, setPremium] = useState(DEFAULTS.premium);
  const [contracts, setContracts] = useState(DEFAULTS.contracts);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<OptResult | null>(null);

  const s = parseFloat(strike);
  const p = parseFloat(premium);
  const c = parseFloat(contracts);
  const cp = parseFloat(price);
  const errs: string[] = [];
  if (!s || s <= 0) errs.push("Strike price must be greater than 0.");
  if (isNaN(p) || p <= 0) errs.push("Premium must be greater than 0.");
  if (!c || c <= 0) errs.push("Contracts must be greater than 0.");
  if (isNaN(cp) || cp <= 0) errs.push("Price at expiry must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOpt(type, s, p, c, cp)); };
  const reset = () => {
    setType(DEFAULTS.type); setStrike(DEFAULTS.strike); setPremium(DEFAULTS.premium); setContracts(DEFAULTS.contracts); setPrice(DEFAULTS.price);
    setResult(calcOpt("call", 100, 4.5, 1, 110));
  };
  useEffect(() => { setResult(calcOpt("call", 100, 4.5, 1, 110)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is options profit calculated at expiry?", answer: "A call's value at expiry is max(0, price − strike); a put's is max(0, strike − price). Subtract the premium paid and multiply by 100 shares per contract to get the total dollar profit or loss." },
    { question: "What is the break-even price?", answer: "The underlying price at which you neither gain nor lose: strike + premium for a call, strike − premium for a put. Below break-even for a call (above for a put) the position loses money up to the premium paid." },
    { question: "What is the risk profile?", answer: "Buying options caps your loss at the premium — the maximum you can lose is the cost to open. Gains are unlimited for calls and large but bounded for puts (strike − premium). That asymmetry is why options are used for defined-risk speculation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Options Profit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Options Profit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Option Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inp}>
                <option value="call">Call Option</option>
                <option value="put">Put Option</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Strike Price ($)</label>
                <input type="number" value={strike} onChange={e => setStrike(e.target.value)} className={inp} placeholder="100" />
              </div>
              <div>
                <label className={lbl}>Premium ($/share)</label>
                <input type="number" value={premium} onChange={e => setPremium(e.target.value)} className={inp} placeholder="4.50" />
              </div>
              <div>
                <label className={lbl}>Contracts (×100)</label>
                <input type="number" value={contracts} onChange={e => setContracts(e.target.value)} className={inp} placeholder="1" />
              </div>
              <div>
                <label className={lbl}>Stock Price at Expiry ($)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inp} placeholder="110" />
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`${result.profit >= 0 ? "bg-primary/10 border-l-4 border-primary" : "bg-destructive/10 border-l-4 border-destructive"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.profit >= 0 ? "text-primary" : "text-destructive"}`}>Profit / Loss at Expiry</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.profit >= 0 ? "+" : "−"} {money(Math.abs(result.profit))}</div>
                <div className="text-sm text-muted-foreground mt-1">ROI {fmt(result.roc)}% · break-even {money(result.breakEven)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Break-Even", money(result.breakEven)], ["Max Loss", money(result.maxLoss)], ["Max Gain", result.maxGain]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">P/L Across Expiry Prices</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="price" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Stock Price at Expiry", position: "insideBottom", offset: -2, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), "P/L"]} labelFormatter={(l) => `Price $${l}`} />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                    <ReferenceLine x={result.breakEven} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Break-even", position: "top", fontSize: 12 }} />
                    <Line type="monotone" dataKey="pl" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Loss is capped at the premium; the line's slope is ±100/share beyond the strike</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Payoff Diagram, Computed</h2>
            <p>An option's value at expiry is a simple piecewise function — intrinsic value minus premium. This <strong>options profit calculator</strong> computes the exact profit or loss for calls and puts at any stock price, and draws the classic payoff diagram.</p>
            <h2 className="text-2xl font-bold mb-3">The Three Key Prices</h2>
            <p>The strike defines where the option gains value; the break-even (strike ± premium) defines where you stop losing; and the chart shows the whole line in between. Each contract represents 100 shares, so premiums compound by a factor of 100 × contracts.</p>
            <h2 className="text-2xl font-bold mb-3">Risk in One Look</h2>
            <p>Buying options is defined-risk: the maximum loss is the premium paid, visible as the flat floor of the payoff line. The chart's slope beyond the strike shows the leverage — every dollar of stock movement translates one-for-one into option value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/options-profit-calculator" />
          <PopularCalculators exclude="/calculator/options-profit-calculator" />
        </div>
      </div>
    </>
  );
}
