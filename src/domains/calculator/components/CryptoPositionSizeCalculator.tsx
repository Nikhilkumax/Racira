"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PositionResult {
  balance: number;
  riskPct: number;
  entry: number;
  stop: number;
  riskAmount: number;
  stopDistancePct: number;
  positionSize: number;
  units: number;
  reward: number;
  rrRatio: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPosition(balance: number, riskPct: number, entry: number, stop: number, target: number): PositionResult {
  const riskAmount = balance * (riskPct / 100);
  const stopDistancePct = entry > 0 ? Math.abs((entry - stop) / entry) * 100 : 0;
  const positionSize = stopDistancePct > 0 ? riskAmount / (stopDistancePct / 100) : 0;
  const units = entry > 0 ? positionSize / entry : 0;
  const reward = target > entry ? (target - entry) * units : 0;
  const rrRatio = riskAmount > 0 ? reward / riskAmount : 0;

  const chartData = [
    { name: "Risk Amount", value: riskAmount },
    { name: "Position Size", value: positionSize },
    { name: "Potential Reward", value: reward },
  ];

  const breakdown = [
    { label: "Account Balance", value: `$${balance.toLocaleString()}` },
    { label: "Risk per Trade", value: `${riskPct}% ($${riskAmount.toLocaleString()})` },
    { label: "Entry Price", value: `$${entry.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Stop Loss", value: `$${stop.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Stop Distance", value: `${stopDistancePct.toFixed(2)}%` },
    { label: "Position Size", value: `$${positionSize.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Units to Buy", value: `${units.toFixed(6)}` },
    { label: "Reward / Risk (R:R)", value: `${rrRatio.toFixed(2)} : 1` },
  ];

  const summaryStats = [
    { label: "Position Size", value: `$${positionSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Units", value: `${units.toFixed(6)}` },
    { label: "Risk $", value: `$${riskAmount.toLocaleString()}` },
    { label: "Stop Distance", value: `${stopDistancePct.toFixed(2)}%` },
    { label: "R:R", value: `${rrRatio.toFixed(2)} : 1` },
    { label: "Max Loss", value: `$${riskAmount.toLocaleString()}` },
  ];

  return { balance, riskPct, entry, stop, riskAmount, stopDistancePct, positionSize, units, reward, rrRatio, chartData, breakdown, summaryStats };
}

const DEFAULTS = { balance: "10000", risk: "1", entry: "60000", stop: "58000", target: "66000" };

export default function CryptoPositionSizeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PositionResult>(() => calcPosition(10000, 1, 60000, 58000, 66000));

  useEffect(() => {
    const v = Object.values(inputs).map(parseFloat);
    if (v.every((n) => !isNaN(n)) && v[0] > 0 && v[2] > 0 && v[3] > 0 && v[2] !== v[3]) setResult(calcPosition(v[0], v[1], v[2], v[3], v[4]));
  }, [inputs]);

  const set = (k: keyof typeof DEFAULTS) => (val: string) => setInputs((p) => ({ ...p, [k]: val }));
  const reset = () => setInputs(DEFAULTS);
  const v = Object.values(inputs).map(parseFloat);
  const invalid = v.some((n) => isNaN(n)) || v[0] <= 0 || v[2] <= 0 || v[3] <= 0 || v[2] === v[3];

  const faqs = [
    { question: "How should I size a crypto trade?", answer: "Risk a fixed percentage of your account (1–2% is common) rather than a fixed dollar amount. Position size = risk amount ÷ stop-loss distance, so the stop loss determines how much you can buy." },
    { question: "What is a stop-loss distance?", answer: "It is the percentage gap between your entry and stop-loss price. A tighter stop means a smaller position for the same dollar risk; a wider stop means a larger position risk." },
    { question: "What is a good risk-reward ratio?", answer: "Most traders look for at least 1.5:1 or 2:1 — risking $1 to make $1.50–$2. Even with a 50% win rate, a 2:1 ratio is profitable over many trades." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Crypto Position Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Crypto Position Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="psbal" className="block text-sm font-medium mb-1 text-foreground">Account Balance ($)</label>
                <input id="psbal" type="number" min="1" value={inputs.balance} onChange={(e) => set("balance")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="psrisk" className="block text-sm font-medium mb-1 text-foreground">Risk per Trade (%)</label>
                <input id="psrisk" type="number" min="0.1" max="10" step="0.1" value={inputs.risk} onChange={(e) => set("risk")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="psentry" className="block text-sm font-medium mb-1 text-foreground">Entry Price ($)</label>
                <input id="psentry" type="number" min="0.000001" step="any" value={inputs.entry} onChange={(e) => set("entry")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="psstop" className="block text-sm font-medium mb-1 text-foreground">Stop Loss ($)</label>
                <input id="psstop" type="number" min="0.000001" step="any" value={inputs.stop} onChange={(e) => set("stop")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="pstarget" className="block text-sm font-medium mb-1 text-foreground">Target Price ($, for R:R)</label>
              <input id="pstarget" type="number" min="0.000001" step="any" value={inputs.target} onChange={(e) => set("target")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Scale className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid values — entry and stop must differ.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Position Size</div>
              <div className="text-4xl font-extrabold text-primary">${result.positionSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.units.toFixed(6)} units · risking ${result.riskAmount.toLocaleString()} ({result.riskPct}%) · R:R {result.rrRatio.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Risk $</div>
                <div className="text-lg font-bold text-primary">${result.riskAmount.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Stop Distance</div>
                <div className="text-lg font-bold text-primary">{result.stopDistancePct.toFixed(2)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Reward</div>
                <div className="text-lg font-bold text-primary">${result.reward.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Risk, Position &amp; Reward</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val: number) => [`$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {result.chartData.map((e, i) => <Cell key={i} fill={e.name === "Position Size" ? "hsl(var(--primary))" : "hsl(var(--primary)/0.45)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Crypto Position Size Calculator</h2>
            <p>Position sizing is the discipline that keeps a losing streak from wiping out an account. Risk a fixed percentage per trade (1–2%), set a stop loss, and size the position so that hitting the stop loses exactly that amount.</p>
            <h3>The Formula</h3>
            <p>Risk amount = balance × risk%. Stop distance = |entry − stop| ÷ entry. Position size = risk amount ÷ stop distance. Units = position size ÷ entry price. Add a target to measure the reward-to-risk ratio of the trade.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/crypto-position-size-calculator" />
          <PopularCalculators exclude="/calculator/crypto-position-size-calculator" />
        </div>
      </div>
    </>
  );
}
