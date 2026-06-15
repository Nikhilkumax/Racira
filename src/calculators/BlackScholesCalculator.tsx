"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// Normal cumulative distribution function
function cnd(x: number) {
  const a1 = 0.31938153;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const l = Math.abs(x);
  const k = 1.0 / (1.0 + 0.2316419 * l);
  let w = 1.0 - 1.0 / Math.sqrt(2 * Math.PI) * Math.exp(-l * l / 2) * (a1 * k + a2 * k * k + a3 * Math.pow(k, 3) + a4 * Math.pow(k, 4) + a5 * Math.pow(k, 5));
  if (x < 0) {
    w = 1.0 - w;
  }
  return w;
}

// Normal probability density function
function ndf(x: number) {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

// 1. TypeScript interfaces
interface BlackScholesResults {
  callPrice: number;
  putPrice: number;
  callDelta: number;
  putDelta: number;
  gamma: number; // Gamma is same for Call and Put
  callTheta: number;
  putTheta: number;
  vega: number; // Vega is same for Call and Put
  callRho: number;
  putRho: number;
  d1: number;
  d2: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBlackScholes = (inputs: typeof DEFAULTS): BlackScholesResults => {
  const S = parseFloat(inputs.stockPrice); // Spot price
  const K = parseFloat(inputs.strikePrice); // Strike price
  const T = parseFloat(inputs.timeToMaturity); // Time to maturity in years
  const r = parseFloat(inputs.riskFreeRate) / 100; // Risk-free rate
  const v = parseFloat(inputs.volatility) / 100; // Volatility
  const q = parseFloat(inputs.dividendYield) / 100; // Dividend yield

  if ([S, K, T, r, v, q].some(val => isNaN(val) || val < 0)) {
    return { callPrice: 0, putPrice: 0, callDelta: 0, putDelta: 0, gamma: 0, callTheta: 0, putTheta: 0, vega: 0, callRho: 0, putRho: 0, d1: 0, d2: 0, chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }
  if (T === 0 || v === 0) {
    return { callPrice: 0, putPrice: 0, callDelta: 0, putDelta: 0, gamma: 0, callTheta: 0, putTheta: 0, vega: 0, callRho: 0, putRho: 0, d1: 0, d2: 0, chartData: [], isError: true, errorMsg: "Time to maturity and volatility must be greater than 0." };
  }

  const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
  const d2 = d1 - v * Math.sqrt(T);

  // Prices
  const callPrice = S * Math.exp(-q * T) * cnd(d1) - K * Math.exp(-r * T) * cnd(d2);
  const putPrice = K * Math.exp(-r * T) * cnd(-d2) - S * Math.exp(-q * T) * cnd(-d1);

  // Greeks
  const callDelta = Math.exp(-q * T) * cnd(d1);
  const putDelta = -Math.exp(-q * T) * cnd(-d1);
  
  const gamma = (Math.exp(-q * T) * ndf(d1)) / (S * v * Math.sqrt(T));
  
  // Theta is usually expressed per day (/ 365)
  const callThetaAnnual = -(S * v * Math.exp(-q * T) * ndf(d1)) / (2 * Math.sqrt(T)) 
                          - r * K * Math.exp(-r * T) * cnd(d2) 
                          + q * S * Math.exp(-q * T) * cnd(d1);
  const putThetaAnnual = -(S * v * Math.exp(-q * T) * ndf(d1)) / (2 * Math.sqrt(T)) 
                         + r * K * Math.exp(-r * T) * cnd(-d2) 
                         - q * S * Math.exp(-q * T) * cnd(-d1);
  const callTheta = callThetaAnnual / 365;
  const putTheta = putThetaAnnual / 365;

  // Vega is usually expressed for a 1% change (/ 100)
  const vegaAnnual = S * Math.sqrt(T) * ndf(d1) * Math.exp(-q * T);
  const vega = vegaAnnual / 100;

  // Rho is usually expressed for a 1% change (/ 100)
  const callRhoAnnual = K * T * Math.exp(-r * T) * cnd(d2);
  const putRhoAnnual = -K * T * Math.exp(-r * T) * cnd(-d2);
  const callRho = callRhoAnnual / 100;
  const putRho = putRhoAnnual / 100;

  // Chart data: Option price vs Stock Price at current time
  const chartData = [];
  const minPrice = S * 0.5;
  const maxPrice = S * 1.5;
  const step = (maxPrice - minPrice) / 20;

  for (let price = minPrice; price <= maxPrice; price += step) {
    const d1_t = (Math.log(price / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
    const d2_t = d1_t - v * Math.sqrt(T);
    const cPrice = price * Math.exp(-q * T) * cnd(d1_t) - K * Math.exp(-r * T) * cnd(d2_t);
    const pPrice = K * Math.exp(-r * T) * cnd(-d2_t) - price * Math.exp(-q * T) * cnd(-d1_t);
    
    chartData.push({
      stockPrice: Math.round(price),
      Call: Number(cPrice.toFixed(2)),
      Put: Number(pPrice.toFixed(2))
    });
  }

  return {
    callPrice: Number(callPrice.toFixed(4)),
    putPrice: Number(putPrice.toFixed(4)),
    callDelta: Number(callDelta.toFixed(4)),
    putDelta: Number(putDelta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    callTheta: Number(callTheta.toFixed(4)),
    putTheta: Number(putTheta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    callRho: Number(callRho.toFixed(4)),
    putRho: Number(putRho.toFixed(4)),
    d1: Number(d1.toFixed(4)),
    d2: Number(d2.toFixed(4)),
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  stockPrice: "100",
  strikePrice: "100",
  timeToMaturity: "1.0", // years
  volatility: "20", // %
  riskFreeRate: "5", // %
  dividendYield: "0", // %
  showAdvanced: true
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", step = "any" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function BlackScholesCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BlackScholesResults>(calculateBlackScholes(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateBlackScholes(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBlackScholes(DEFAULTS));
  };

  const faqs = [
    { question: "What is the Black-Scholes model?", answer: "The Black-Scholes model is a mathematical model for pricing an options contract. It estimates the theoretical value of European-style options based on current stock price, expected dividends, the option's strike price, expected interest rates, time to expiration, and expected volatility." },
    { question: "What are 'The Greeks'?", answer: "The Greeks (Delta, Gamma, Theta, Vega, Rho) are mathematical derivatives of the Black-Scholes formula. They measure the sensitivity of the option's price to various factors. For example, Delta measures sensitivity to changes in the stock price, while Theta measures sensitivity to the passage of time (time decay)." },
    { question: "Why is Volatility so important?", answer: "Volatility (Sigma) represents the expected fluctuation of the stock price over the life of the option. Higher volatility means the stock is more likely to experience large price swings, increasing the chance the option will finish in-the-money. Therefore, higher volatility always increases the price of both call and put options." },
    { question: "Can this price American options?", answer: "Strictly speaking, the standard Black-Scholes model is designed for European options (which can only be exercised on the expiration date). American options can be exercised at any time before expiration, meaning their theoretical value is often slightly higher, especially for dividend-paying stocks. However, Black-Scholes is still widely used as a baseline estimate for American options." },
    { question: "What is the Risk-Free Rate?", answer: "The risk-free rate is the theoretical return of an investment with zero risk. In practice, traders typically use the yield on a US Treasury bill (like the 3-month or 1-year yield) that closely matches the expiration date of the option." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Black-Scholes Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Black-Scholes Options Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Price theoretical European call and put options and calculate the Greeks.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="stockPrice" label="Stock Price (S)" value={inputs.stockPrice} onChange={(v: string) => handleChange("stockPrice", v)} prefix="$" />
              <CompactInput id="strikePrice" label="Strike Price (K)" value={inputs.strikePrice} onChange={(v: string) => handleChange("strikePrice", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="timeToMaturity" label="Time (Years)" value={inputs.timeToMaturity} onChange={(v: string) => handleChange("timeToMaturity", v)} />
              <CompactInput id="volatility" label="Volatility (σ)" value={inputs.volatility} onChange={(v: string) => handleChange("volatility", v)} suffix="%" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Rates & Dividends</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="riskFreeRate" label="Risk-Free Rate" value={inputs.riskFreeRate} onChange={(v: string) => handleChange("riskFreeRate", v)} suffix="%" />
                  <CompactInput id="dividendYield" label="Dividend Yield" value={inputs.dividendYield} onChange={(v: string) => handleChange("dividendYield", v)} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Call Option Price</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-primary tracking-tighter">${results.callPrice}</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 border-destructive`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Put Option Price</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-destructive tracking-tighter">${results.putPrice}</div>
                    </div>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Option Greeks</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Greek</th>
                          <th className="px-4 py-3 font-semibold text-right">Call Option</th>
                          <th className="px-4 py-3 font-semibold text-right">Put Option</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold">Δ</span> Delta
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">{results.callDelta}</td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">{results.putDelta}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold">Γ</span> Gamma
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{results.gamma}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{results.gamma}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold">Θ</span> Theta (Daily)
                          </td>
                          <td className="px-4 py-3 text-right text-destructive">{results.callTheta}</td>
                          <td className="px-4 py-3 text-right text-destructive">{results.putTheta}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold">ν</span> Vega (1%)
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500">{results.vega}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500">{results.vega}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold">ρ</span> Rho (1%)
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{results.callRho}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{results.putRho}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Price Sensitivity to Stock Price</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="stockPrice" tickFormatter={(val) => `$${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} minTickGap={20} />
                        <YAxis tickFormatter={(val) => `$${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={40} />
                        <RechartsTooltip formatter={(value: number) => `$${value}`} labelFormatter={(label) => `Stock Price: $${label}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" dataKey="Call" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                        <Area type="monotone" dataKey="Put" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Black-Scholes Option Pricing Model</h2>
            <p>Developed by Fischer Black, Myron Scholes, and Robert Merton in 1973, the Black-Scholes model revolutionized modern finance by providing a mathematical framework for pricing options contracts. It is widely considered one of the most important concepts in financial engineering and earned its creators the Nobel Prize in Economics.</p>
            
            <h2>How the Formula Works</h2>
            <p>The model prices a theoretical European call or put option by creating a risk-neutral portfolio. It asserts that you can perfectly hedge an option by buying and selling the underlying asset in specific proportions. The formula inputs five key variables:</p>
            <ul>
              <li><strong>Spot Price (S):</strong> The current market price of the underlying asset.</li>
              <li><strong>Strike Price (K):</strong> The price at which the option can be exercised.</li>
              <li><strong>Time to Maturity (T):</strong> The time remaining until the option expires, expressed in years (e.g., 6 months = 0.5).</li>
              <li><strong>Volatility (σ):</strong> The standard deviation of the asset's returns. Higher volatility dramatically increases option prices because the probability of the option expiring deep in the money increases.</li>
              <li><strong>Risk-Free Rate (r):</strong> The theoretical return of an investment with zero risk, often represented by the yield on US Treasury Bills.</li>
            </ul>
            
            <h2>Understanding "The Greeks"</h2>
            <p>While the Black-Scholes formula gives you the fair value of an option, traders heavily rely on the derivatives of the formula, known as "The Greeks," to manage risk in their portfolios:</p>
            <ul>
              <li><strong>Delta (Δ):</strong> Measures the rate of change of the option's price with respect to a $1 change in the underlying asset's price. A call delta of 0.50 means if the stock goes up $1, the call option goes up $0.50.</li>
              <li><strong>Gamma (Γ):</strong> Measures the rate of change of Delta. It shows how much Delta will change for a $1 move in the stock.</li>
              <li><strong>Theta (Θ):</strong> Measures time decay. It tells you how much value the option loses each day as it approaches expiration, assuming all else remains equal.</li>
              <li><strong>Vega (ν):</strong> Measures sensitivity to volatility. A Vega of 0.15 means the option's price will increase by $0.15 for every 1% increase in implied volatility.</li>
              <li><strong>Rho (ρ):</strong> Measures sensitivity to interest rate changes. It is the least used Greek for short-term retail trading but matters for long-term options (LEAPS).</li>
            </ul>
            
            <h2>Limitations of the Model</h2>
            <p>While foundational, the Black-Scholes model has known limitations. It assumes that stock prices follow a lognormal distribution (a random walk), which implies that extreme market crashes are mathematically impossible, despite them happening in reality (fat tails). It also assumes that volatility and the risk-free rate remain perfectly constant over the life of the option, and it does not account for the early exercise premium of American options.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/black-scholes-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
