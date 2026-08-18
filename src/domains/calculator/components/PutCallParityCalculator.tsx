"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ParityInput {
  stockPrice: number;
  strikePrice: number;
  monthsToExpiry: number;
  riskFreeRate: number;
  callPrice: number;
  putPrice: number;
}

interface ParityResult {
  pvStrike: number;
  callSide: number;
  putSide: number;
  discrepancy: number;
  opportunity: string;
  opportunityColor: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcParity(input: ParityInput): ParityResult {
  const years = input.monthsToExpiry / 12;
  const pvStrike = input.strikePrice / Math.pow(1 + input.riskFreeRate / 100, years);
  const callSide = input.callPrice + pvStrike;
  const putSide = input.putPrice + input.stockPrice;
  const discrepancy = callSide - putSide;

  const absD = Math.abs(discrepancy);
  const tolerance = 0.05;
  let opportunity = "In Parity";
  let opportunityColor = "text-emerald-600";
  if (absD > tolerance) {
    opportunity = discrepancy > 0 ? "Put Overpriced / Call Cheap" : "Call Overpriced / Put Cheap";
    opportunityColor = discrepancy > 0 ? "text-amber-500" : "text-red-500";
  }

  const chartData = [
    { name: "Call + PV(Strike)", value: Number(callSide.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Put + Stock", value: Number(putSide.toFixed(2)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Stock Price", value: `$${input.stockPrice.toFixed(2)}` },
    { label: "Strike Price", value: `$${input.strikePrice.toFixed(2)}` },
    { label: "Time to Expiry", value: `${input.monthsToExpiry} months` },
    { label: "Risk-Free Rate", value: `${input.riskFreeRate.toFixed(1)}%` },
    { label: "Call Price", value: `$${input.callPrice.toFixed(2)}` },
    { label: "Put Price", value: `$${input.putPrice.toFixed(2)}` },
    { label: "PV of Strike", value: `$${pvStrike.toFixed(2)}` },
    { label: "Call Side (C + PV(K))", value: `$${callSide.toFixed(2)}` },
    { label: "Put Side (P + S)", value: `$${putSide.toFixed(2)}` },
    { label: "Discrepancy", value: `${discrepancy >= 0 ? "+" : "−"}$${Math.abs(discrepancy).toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Parity Status", value: opportunity },
    { label: "Call Side", value: `$${callSide.toFixed(2)}` },
    { label: "Put Side", value: `$${putSide.toFixed(2)}` },
    { label: "Discrepancy", value: `${discrepancy >= 0 ? "+" : "−"}$${Math.abs(discrepancy).toFixed(2)}` },
    { label: "PV of Strike", value: `$${pvStrike.toFixed(2)}` },
    { label: "Implied Call if P = 0", value: `$${Math.max(0, input.stockPrice - pvStrike).toFixed(2)}` },
  ];

  return { pvStrike, callSide, putSide, discrepancy, opportunity, opportunityColor, chartData, breakdown, summaryStats };
}

const DEFAULTS: ParityInput = { stockPrice: 100, strikePrice: 100, monthsToExpiry: 6, riskFreeRate: 4, callPrice: 5, putPrice: 4 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function PutCallParityCalculator() {
  const [stock, setStock] = useState(String(DEFAULTS.stockPrice));
  const [strike, setStrike] = useState(String(DEFAULTS.strikePrice));
  const [months, setMonths] = useState(String(DEFAULTS.monthsToExpiry));
  const [rate, setRate] = useState(String(DEFAULTS.riskFreeRate));
  const [call, setCall] = useState(String(DEFAULTS.callPrice));
  const [put, setPut] = useState(String(DEFAULTS.putPrice));
  const [result, setResult] = useState<ParityResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcParity({ stockPrice: parse(stock, DEFAULTS.stockPrice), strikePrice: parse(strike, DEFAULTS.strikePrice), monthsToExpiry: Math.max(0.1, parse(months, DEFAULTS.monthsToExpiry)), riskFreeRate: parse(rate, DEFAULTS.riskFreeRate), callPrice: parse(call, DEFAULTS.callPrice), putPrice: parse(put, DEFAULTS.putPrice) }));
  const reset = () => {
    setStock(String(DEFAULTS.stockPrice));
    setStrike(String(DEFAULTS.strikePrice));
    setMonths(String(DEFAULTS.monthsToExpiry));
    setRate(String(DEFAULTS.riskFreeRate));
    setCall(String(DEFAULTS.callPrice));
    setPut(String(DEFAULTS.putPrice));
    setResult(calcParity(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcParity(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is put-call parity?", answer: "Put-call parity is the fundamental relationship between European call and put options on the same underlying, strike, and expiry: Call + PV(Strike) = Put + Stock. It holds because a call plus a risk-free bond paying the strike replicates a put plus the stock — identical payoffs must have identical prices." },
    { question: "How does the relationship work?", answer: "The formula is C + K/(1+r)^t = P + S. The left side (call + present value of the strike) and the right side (put + stock) produce identical payoffs at expiry, so they must trade at the same price. When they diverge, an arbitrageur can lock in a riskless profit." },
    { question: "Why does the formula use PV of strike?", answer: "The strike is paid in the future, so it's discounted at the risk-free rate: K/(1+r)^t. Over 6 months at 4%, the PV of a $100 strike is about $98.06. For deep analysis, use continuous compounding: K × e^(−rt)." },
    { question: "What happens when parity is violated?", answer: "A discrepancy larger than transaction costs signals arbitrage. If Call + PV(K) > Put + Stock, sell the call, buy the put, buy the stock, and lend PV(K) — a riskless profit locked at expiry. In practice, real markets keep violations tiny; persistent gaps mean costs or dividends aren't being modeled." },
    { question: "Does parity apply to American options?", answer: "Only as inequalities. American options can be exercised early, so parity becomes C ≥ S − PV(K) and P ≥ PV(K) − S rather than an exact equality. For European options (no early exercise), exact parity holds. Most index options are European; most equity options are American." },
    { question: "How do dividends affect parity?", answer: "Dividends change the equation to C + PV(K) = P + S − PV(Dividends). The stock's future dividend stream must be subtracted, since the put holder misses dividends during the option's life. Ignoring dividends creates apparent — but unspreadable — violations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Put-Call Parity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Put-Call Parity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Stock Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Strike Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={strike} onChange={(e) => setStrike(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time to Expiry</label>
                <div className={inp}><input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Risk-Free Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Call Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={call} onChange={(e) => setCall(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Put Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={put} onChange={(e) => setPut(e.target.value)} step={0.01} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Parity Status</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.opportunityColor}`}>{result.opportunity}</div>
                  <div className="text-sm text-muted-foreground mt-1">Call side: ${result.callSide.toFixed(2)} · Put side: ${result.putSide.toFixed(2)} · Discrepancy: {result.discrepancy >= 0 ? "+" : "−"}${Math.abs(result.discrepancy).toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Call + PV(K)", `$${result.callSide.toFixed(2)}`], ["Put + Stock", `$${result.putSide.toFixed(2)}`], ["PV of Strike", `$${result.pvStrike.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Parity Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Both Sides of the Equation</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, ""]} />
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
            <h2 className="text-2xl font-bold mb-3">The Parity Equation</h2>
            <p>Put-call parity — C + PV(K) = P + S — is the arbitrage-free pricing relationship between European calls and puts. A portfolio of a call plus a zero-coupon bond paying the strike replicates a portfolio of a put plus the underlying stock. Since both have identical payoffs at expiry, they must trade at identical prices.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Discrepancy</h2>
            <p>When the call side exceeds the put side, the call is relatively cheap or the put expensive — sell the put, buy the call, buy the stock, and lend PV(K) to capture the difference risklessly. In efficient markets, transaction costs and bid-ask spreads keep discrepancies under a few cents. This calculator flags gaps above a $0.05 tolerance.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond the Basics</h2>
            <p>Real-world adjustments: American options replace the equality with inequalities, dividends subtract PV(D) from the right side, and interest rates use continuous compounding for precision. Parity is also the foundation of synthetic positions — a synthetic long stock is call minus put — used by traders to build exposures without trading the underlying.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/put-call-parity-calculator" />
          <PopularCalculators exclude="/calculator/put-call-parity-calculator" />
        </div>
      </div>
    </>
  );
}
