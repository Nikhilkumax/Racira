"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Black-Scholes standard normal CDF (Abramowitz & Stegun 7.1.26)
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-0.5 * x * x);
  let p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
}

function normPdf(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

interface GreeksResult {
  S: number;
  K: number;
  T: number;
  r: number;
  sigma: number;
  type: "call" | "put";
  d1: number;
  d2: number;
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  chartData: { name: string; value: number }[];
}

function calcGreeks(S: number, K: number, T: number, r: number, sigma: number, type: "call" | "put"): GreeksResult {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normCdf(d1);
  const Nd2 = normCdf(d2);
  const Nmd1 = normCdf(-d1);
  const Nmd2 = normCdf(-d2);
  const pdf = normPdf(d1);
  const disc = Math.exp(-r * T);
  const price = type === "call"
    ? S * Nd1 - K * disc * Nd2
    : K * disc * Nmd2 - S * Nmd1;
  const delta = type === "call" ? Nd1 : Nd1 - 1;
  const gamma = pdf / (S * sigma * Math.sqrt(T));
  const theta = type === "call"
    ? (-S * pdf * sigma) / (2 * Math.sqrt(T)) - r * K * disc * Nd2
    : (-S * pdf * sigma) / (2 * Math.sqrt(T)) + r * K * disc * Nmd2;
  const vega = (S * pdf * Math.sqrt(T)) / 100; // per 1% vol point
  const rho = type === "call"
    ? (K * T * disc * Nd2) / 100
    : (-K * T * disc * Nmd2) / 100;
  const chartData = [
    { name: "Delta", value: Number(delta.toFixed(4)) },
    { name: "Gamma", value: Number(gamma.toFixed(4)) },
    { name: "Theta", value: Number(theta.toFixed(4)) },
    { name: "Vega", value: Number(vega.toFixed(4)) },
    { name: "Rho", value: Number(rho.toFixed(4)) },
  ];
  return { S, K, T, r, sigma, type, d1, d2, price, delta, gamma, theta, vega, rho, chartData };
}

const DEFAULTS = { S: "100", K: "100", T: "0.5", r: "0.05", sigma: "0.20", type: "call" as "call" | "put" };

const faqs = [
  { question: "What are the option Greeks?", answer: "They measure how an option's price responds to its inputs: Delta (price change per $1 in underlying), Gamma (delta change per $1), Theta (decay per day), Vega (change per 1% volatility point), and Rho (change per 1% interest rate)." },
  { question: "How are the Greeks calculated?", answer: "From the Black-Scholes model: Delta is the normal CDF of d₁ (N(d₁) for calls, N(d₁)−1 for puts), Gamma is the PDF of d₁ divided by S·σ·√T, and Vega, Theta, and Rho follow from the same partial derivatives." },
  { question: "What does a Greek sign tell me?", answer: "Positive delta means the option gains with the stock (calls); negative means it loses (puts). Theta is almost always negative — options lose value daily as time decays. Vega is positive for both: more volatility raises option prices." },
];

export default function GreeksCalculator() {
  const [S, setS] = useState(DEFAULTS.S);
  const [K, setK] = useState(DEFAULTS.K);
  const [T, setT] = useState(DEFAULTS.T);
  const [r, setR] = useState(DEFAULTS.r);
  const [sigma, setSigma] = useState(DEFAULTS.sigma);
  const [type, setType] = useState<"call" | "put">(DEFAULTS.type);
  const [result, setResult] = useState<GreeksResult>(() => calcGreeks(100, 100, 0.5, 0.05, 0.2, "call"));

  const handleCalculate = () => {
    const s = parseFloat(S);
    const k = parseFloat(K);
    const t = parseFloat(T);
    const rr = parseFloat(r);
    const v = parseFloat(sigma);
    if (isNaN(s) || isNaN(k) || isNaN(t) || isNaN(rr) || isNaN(v) || s <= 0 || k <= 0 || t <= 0 || v <= 0) return;
    setResult(calcGreeks(s, k, t, rr, v, type));
  };

  const reset = () => {
    setS(DEFAULTS.S); setK(DEFAULTS.K); setT(DEFAULTS.T); setR(DEFAULTS.r); setSigma(DEFAULTS.sigma);
    setType(DEFAULTS.type);
    setResult(calcGreeks(100, 100, 0.5, 0.05, 0.2, "call"));
  };

  const breakdown = [
    { label: "Option Price (Black-Scholes)", value: `$${result.price.toFixed(2)}`, highlight: true },
    { label: "Delta", value: `${result.delta.toFixed(4)}`, highlight: false },
    { label: "Gamma", value: `${result.gamma.toFixed(4)}`, highlight: false },
    { label: "Theta (per day)", value: `${(result.theta / 365).toFixed(4)}`, highlight: false },
    { label: "Vega (per 1% vol)", value: `${result.vega.toFixed(4)}`, highlight: false },
    { label: "Rho (per 1% rate)", value: `${result.rho.toFixed(4)}`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Options Greeks Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Options Greeks Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <TrendingUp className="w-4 h-4" /> Black-Scholes Greeks
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Spot Price (S)</label>
                <input type="number" value={S} onChange={(e) => setS(e.target.value)} className="input-calc" placeholder="100" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Strike Price (K)</label>
                <input type="number" value={K} onChange={(e) => setK(e.target.value)} className="input-calc" placeholder="100" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Time to Expiry (yr)</label>
                <input type="number" value={T} onChange={(e) => setT(e.target.value)} className="input-calc" placeholder="0.5" min={0} step="0.05" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Risk-Free Rate (r)</label>
                <input type="number" value={r} onChange={(e) => setR(e.target.value)} className="input-calc" placeholder="0.05" step="0.01" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Volatility (σ)</label>
                <input type="number" value={sigma} onChange={(e) => setSigma(e.target.value)} className="input-calc" placeholder="0.20" min={0} step="0.01" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Option Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as "call" | "put")} className="input-calc">
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-primary" /> OPTION PRICE & GREEKS
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">${result.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">fair value ({type === "call" ? "call" : "put"})</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                d₁ = {result.d1.toFixed(4)}, d₂ = {result.d2.toFixed(4)} — Greeks computed from the Black-Scholes partial derivatives.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Greek</th>
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
              <h3 className="text-base font-bold mb-3">Greek Exposure</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(4), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Moneyness", value: result.type === "call" ? (S >= K ? "In the money" : "Out of the money") : (K >= S ? "In the money" : "Out of the money") },
                  { label: "Delta Interpretation", value: `≈ ${(Math.abs(result.delta) * 100).toFixed(0)} shares of exposure` },
                  { label: "Theta Sign", value: result.theta < 0 ? "Time decay (negative)" : "Positive (unusual)" },
                  { label: "Model", value: "Black-Scholes (no dividends)" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Options Greeks Calculator</h2>
            <p>The Greeks describe how an option's price moves when each input changes by one unit. Delta (N(d₁) for a call) says the option behaves like that many shares of stock; Gamma says how fast Delta itself changes; Vega is the sensitivity to a 1% move in implied volatility; Theta is the daily time decay; and Rho is the interest-rate sensitivity. Together they tell a trader exactly what risk an options position carries.</p>
            <h3>Reading the risk</h3>
            <p>An at-the-money call typically shows Delta ≈ 0.5 — half a share of exposure — with Gamma peaking right at the strike. Theta is the quiet tax on every option position: at-the-money options decay fastest, which is why sellers love them and buyers dread the final weeks. Vega explains why options prices spike before earnings — the market prices in a volatility jump. This calculator evaluates all five Greeks from the Black-Scholes formula for any call or put.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/greeks-calculator" />
          <PopularCalculators exclude="/calculator/greeks-calculator" />
        </div>
      </div>
    </>
  );
}
