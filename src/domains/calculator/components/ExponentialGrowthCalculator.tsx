"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface GrowthResult {
  principal: number;
  rate: number;
  periods: number;
  final: number;
  growthFactor: number;
  increase: number;
  increasePct: number;
  doublingTime: number;
  chartData: { t: number; amount: number }[];
}

function calcGrowth(principal: number, ratePct: number, periods: number): GrowthResult {
  const rate = ratePct / 100;
  const growthFactor = 1 + rate;
  const final = principal * Math.pow(growthFactor, periods);
  const increase = final - principal;
  const increasePct = principal > 0 ? (increase / principal) * 100 : 0;
  const doublingTime = rate > 0 ? Math.log(2) / Math.log(growthFactor) : Infinity;
  const chartData: { t: number; amount: number }[] = [];
  const steps = Math.max(periods, 1);
  for (let i = 0; i <= steps; i++) {
    chartData.push({ t: i, amount: Number((principal * Math.pow(growthFactor, i)).toFixed(2)) });
  }
  return { principal, rate: ratePct, periods, final, growthFactor, increase, increasePct, doublingTime, chartData };
}

const DEFAULTS = { principal: "1000", rate: "5", periods: "10" };

const faqs = [
  { question: "What is exponential growth?", answer: "Exponential growth multiplies by a constant factor each period: A = P(1 + r)ᵗ. Unlike linear growth, the increase itself grows — which is why 5% compounding beats 5% simple interest over time." },
  { question: "What is doubling time?", answer: "The time to double is t = ln(2) ÷ ln(1 + r). At 5% growth it is ~14.2 periods; at 10%, ~7.3. The Rule of 72 approximates it as 72 ÷ (rate in %) — 72/5 ≈ 14.4, very close." },
  { question: "Where does exponential growth appear?", answer: "Compound interest, population growth, viral spread, Moore's law, and inflation. It is also why small percentage differences compound into enormous gaps over decades." },
];

export default function ExponentialGrowthCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [periods, setPeriods] = useState(DEFAULTS.periods);
  const [result, setResult] = useState<GrowthResult>(() => calcGrowth(1000, 5, 10));

  useEffect(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(periods);
    if (!isNaN(p) && !isNaN(r) && !isNaN(t) && p >= 0 && t >= 0) setResult(calcGrowth(p, r, t));
  }, [principal, rate, periods]);

  const reset = () => { setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setPeriods(DEFAULTS.periods); };
  const invalid = isNaN(parseFloat(principal)) || isNaN(parseFloat(rate)) || isNaN(parseFloat(periods)) || parseFloat(principal) < 0 || parseFloat(periods) < 0;

  const fmtMoney = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Starting Amount", value: fmtMoney(result.principal) },
    { label: "Growth Rate", value: `${result.rate.toFixed(2)}% per period` },
    { label: "Periods", value: `${result.periods}` },
    { label: "Growth Factor (1 + r)", value: `${result.growthFactor.toFixed(4)}` },
    { label: "Final Amount", value: fmtMoney(result.final), highlight: true },
    { label: "Total Increase", value: `+${fmtMoney(result.increase)}` },
    { label: "Increase (%)", value: `+${result.increasePct.toFixed(1)}%` },
    { label: "Doubling Time", value: result.doublingTime === Infinity ? "— (0% rate)" : `${result.doublingTime.toFixed(2)} periods` },
  ];

  const summaryStats = [
    { label: "Final Amount", value: fmtMoney(result.final) },
    { label: "Total Increase", value: `+${fmtMoney(result.increase)}` },
    { label: "Growth Factor", value: `${result.growthFactor.toFixed(4)}` },
    { label: "Doubling Time", value: result.doublingTime === Infinity ? "—" : `${result.doublingTime.toFixed(2)}` },
    { label: "Rate", value: `${result.rate.toFixed(2)}%` },
    { label: "Periods", value: `${result.periods}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Exponential Growth Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Exponential Growth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="xg-p" className="block text-sm font-medium mb-1 text-foreground">Starting Amount</label>
              <input id="xg-p" type="number" min="0" step="100" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="xg-r" className="block text-sm font-medium mb-1 text-foreground">Growth Rate (%)</label>
                <input id="xg-r" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="xg-t" className="block text-sm font-medium mb-1 text-foreground">Periods</label>
                <input id="xg-t" type="number" min="0" step="1" value={periods} onChange={(e) => setPeriods(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative starting amount and periods.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Final Amount</div>
              <div className="text-4xl font-extrabold text-primary">${fmtMoney(result.final)}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtMoney(result.principal)} × {result.growthFactor.toFixed(2)}^{result.periods} · doubling every {result.doublingTime === Infinity ? "—" : `${result.doublingTime.toFixed(1)} periods`}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Increase</div>
                <div className="text-lg font-bold text-primary">+${fmtMoney(result.increase)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Increase (%)</div>
                <div className="text-lg font-bold text-primary">+{result.increasePct.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Doubling Time</div>
                <div className="text-lg font-bold text-primary">{result.doublingTime === Infinity ? "—" : `${result.doublingTime.toFixed(1)}`}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Growth Curve</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} label={{ value: "period", position: "insideBottom", fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`$${fmtMoney(v)}`, "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Exponential Growth Calculator</h2>
            <p>Compounding growth follows A = P(1 + r)ᵗ. At 5% over 10 periods, $1,000 becomes $1,000 × 1.05¹⁰ ≈ $1,628.89 — a 62.9% gain, well above the 50% that simple interest would give, because each period's interest earns interest itself.</p>
            <h3>The Power of Doubling Time</h3>
            <p>Growth rate maps directly to a doubling time: ln(2) ÷ ln(1 + r). A 1% advantage in annual growth shortens the doubling time meaningfully — and because growth is exponential, that advantage compounds into a many-times-larger final gap over a career or a century.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exponential-growth-calculator" />
          <PopularCalculators exclude="/calculator/exponential-growth-calculator" />
        </div>
      </div>
    </>
  );
}
