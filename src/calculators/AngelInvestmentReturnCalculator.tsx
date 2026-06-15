"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface AngelReturnResults {
  ownershipAtInvestment: number;
  ownershipAtExit: number;
  totalReturnValue: number;
  netProfit: number;
  roi: number;
  moic: number;
  irr: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateAngelReturn = (inputs: typeof DEFAULTS): AngelReturnResults => {
  const initialInvestment = parseFloat(inputs.initialInvestment);
  const totalRoundSize = parseFloat(inputs.totalRoundSize);
  const preMoneyValuation = parseFloat(inputs.preMoneyValuation);
  const expectedExitValuation = parseFloat(inputs.expectedExitValuation);
  const timeToExitYears = parseFloat(inputs.timeToExitYears);
  const futureDilution = parseFloat(inputs.futureDilution) / 100;

  if ([initialInvestment, totalRoundSize, preMoneyValuation, expectedExitValuation, timeToExitYears, futureDilution].some(v => isNaN(v) || v < 0)) {
    return { ownershipAtInvestment: 0, ownershipAtExit: 0, totalReturnValue: 0, netProfit: 0, roi: 0, moic: 0, irr: 0, chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }
  if (timeToExitYears === 0) {
    return { ownershipAtInvestment: 0, ownershipAtExit: 0, totalReturnValue: 0, netProfit: 0, roi: 0, moic: 0, irr: 0, chartData: [], isError: true, errorMsg: "Time to exit must be greater than 0." };
  }
  if (initialInvestment > totalRoundSize && totalRoundSize > 0) {
    return { ownershipAtInvestment: 0, ownershipAtExit: 0, totalReturnValue: 0, netProfit: 0, roi: 0, moic: 0, irr: 0, chartData: [], isError: true, errorMsg: "Initial investment cannot exceed total round size." };
  }

  // Post-Money Valuation = Pre-Money + Total Round Size
  const postMoneyValuation = preMoneyValuation + totalRoundSize;
  
  // Ownership at Investment = Initial Investment / Post-Money Valuation
  const ownershipAtInvestment = (initialInvestment / postMoneyValuation) * 100;
  
  // Ownership at Exit = Ownership at Investment * (1 - Future Dilution)
  const ownershipAtExit = ownershipAtInvestment * (1 - futureDilution);
  
  // Total Return Value = Expected Exit Valuation * (Ownership at Exit / 100)
  const totalReturnValue = expectedExitValuation * (ownershipAtExit / 100);
  
  const netProfit = totalReturnValue - initialInvestment;
  const roi = (netProfit / initialInvestment) * 100;
  
  // Multiple on Invested Capital (MOIC)
  const moic = totalReturnValue / initialInvestment;
  
  // Internal Rate of Return (IRR) = (Total Return / Initial Investment) ^ (1 / Years) - 1
  const irr = (Math.pow(moic, 1 / timeToExitYears) - 1) * 100;

  // Chart data showing the theoretical growth of the investment value over time
  const chartData = [];
  for (let year = 0; year <= timeToExitYears; year++) {
    // Assuming a linear compound growth rate based on IRR
    const currentValue = initialInvestment * Math.pow(1 + (irr / 100), year);
    chartData.push({
      year: `Year ${year}`,
      "Investment Value": Math.round(currentValue),
      "Original Capital": initialInvestment
    });
  }

  return {
    ownershipAtInvestment: Number(ownershipAtInvestment.toFixed(4)),
    ownershipAtExit: Number(ownershipAtExit.toFixed(4)),
    totalReturnValue: Math.round(totalReturnValue),
    netProfit: Math.round(netProfit),
    roi: Number(roi.toFixed(2)),
    moic: Number(moic.toFixed(2)),
    irr: Number(irr.toFixed(2)),
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  initialInvestment: "50000",
  totalRoundSize: "1000000",
  preMoneyValuation: "4000000",
  expectedExitValuation: "50000000",
  timeToExitYears: "7",
  futureDilution: "20",
  showAdvanced: false
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
export default function AngelInvestmentReturnCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AngelReturnResults>(calculateAngelReturn(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateAngelReturn(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAngelReturn(DEFAULTS));
  };

  const faqs = [
    { question: "What is MOIC?", answer: "MOIC stands for Multiple on Invested Capital. It is a metric used in private equity and venture capital to measure the return on an investment relative to its initial cost. An MOIC of 3.0x means you made three times your original investment back." },
    { question: "What is IRR?", answer: "IRR is Internal Rate of Return. It is the annualized percentage rate earned on an investment. While MOIC tells you how much money you made, IRR factors in the time value of money—how quickly you made it. Earning a 3x MOIC in 3 years results in a much higher IRR than earning a 3x MOIC in 10 years." },
    { question: "What is future dilution?", answer: "When a startup raises subsequent rounds of funding, they issue new shares to new investors. This increases the total number of shares in the company, decreasing (diluting) the percentage ownership of existing shareholders unless they continue to invest their pro-rata rights." },
    { question: "What is the difference between Pre-Money and Post-Money Valuation?", answer: "Pre-money valuation is the value of the company before the new investment round is added. Post-money valuation is the pre-money valuation plus the total amount raised in the round. Your ownership percentage is calculated based on the post-money valuation." },
    { question: "What is a good IRR for an angel investment?", answer: "Because angel investing is highly risky (many startups fail entirely), angel investors typically target a very high IRR on their successful investments—often 30% to 50% or more—to compensate for the total losses in the rest of their portfolio." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Angel Investment Return Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Angel Investment Return Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Estimate your startup investment returns, equity dilution, MOIC, and IRR.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="initialInvestment" label="Your Investment" value={inputs.initialInvestment} onChange={(v: string) => handleChange("initialInvestment", v)} prefix="$" />
              <CompactInput id="preMoneyValuation" label="Pre-Money Valuation" value={inputs.preMoneyValuation} onChange={(v: string) => handleChange("preMoneyValuation", v)} prefix="$" />
              <CompactInput id="totalRoundSize" label="Total Round Size" value={inputs.totalRoundSize} onChange={(v: string) => handleChange("totalRoundSize", v)} prefix="$" />
              <div className="flex flex-col justify-center bg-muted/20 border border-border rounded-md px-3 h-9 mt-[22px]">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Post-Money</div>
                <div className="text-sm font-bold text-foreground leading-none mt-1">${(parseFloat(inputs.preMoneyValuation) + parseFloat(inputs.totalRoundSize)).toLocaleString()}</div>
              </div>
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Exit & Dilution Expectations</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="expectedExitValuation" label="Expected Exit Valuation" value={inputs.expectedExitValuation} onChange={(v: string) => handleChange("expectedExitValuation", v)} prefix="$" />
                  <CompactInput id="timeToExitYears" label="Time to Exit" value={inputs.timeToExitYears} onChange={(v: string) => handleChange("timeToExitYears", v)} suffix="Years" />
                  <CompactInput id="futureDilution" label="Expected Future Dilution" value={inputs.futureDilution} onChange={(v: string) => handleChange("futureDilution", v)} suffix="%" />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Return Value</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.totalReturnValue.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-semibold text-muted-foreground uppercase">Initial Equity</div>
                      <div className="text-lg font-bold text-foreground">{results.ownershipAtInvestment}%</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-muted-foreground uppercase">Exit Equity (Diluted)</div>
                      <div className="text-lg font-bold text-destructive">{results.ownershipAtExit}%</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Multiple (MOIC)</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{results.moic}x</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">IRR (Annualized)</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{results.irr}%</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Net Profit</div>
                    <div className="text-2xl font-bold text-foreground">${results.netProfit.toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Investment Value Growth Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" dataKey="Investment Value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.8} />
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
            <h2>What Is Angel Investment Return?</h2>
            <p>Angel investing involves providing capital to early-stage startups in exchange for equity ownership. Because these investments carry a massive risk of total failure, successful exits must generate outsized returns to compensate the investor. An angel investment return calculator helps forecast the potential financial upside of a successful liquidity event (like an acquisition or IPO) based on the startup's valuation and equity dilution.</p>
            
            <h2>How Valuation and Equity Work</h2>
            <p>When you invest in a startup, your equity ownership is calculated based on the <strong>Post-Money Valuation</strong>. The formula is: <code>Ownership % = Your Investment / (Pre-Money Valuation + Total Round Size)</code>. For example, if you invest $50,000 in a $1,000,000 round at a $4,000,000 pre-money valuation, the post-money valuation is $5,000,000. Your ownership is $50,000 / $5,000,000 = 1.0%.</p>
            
            <h2>Understanding Dilution</h2>
            <p>Startups rarely reach an exit on a single round of funding. As they grow, they raise Series A, B, C, etc. Each time new shares are issued to new investors, your ownership percentage decreases (dilutes). If you start with 1.0% and experience 20% future dilution, your ownership at exit will be 0.8%. Calculating returns based on your initial equity without accounting for dilution will result in vastly overestimating your payout.</p>
            
            <h2>Key Metrics: MOIC and IRR</h2>
            <p>Two primary metrics are used to measure private market returns: <strong>MOIC (Multiple on Invested Capital)</strong> and <strong>IRR (Internal Rate of Return)</strong>. MOIC is simply how many times you multiplied your money (e.g., $50k turning into $500k is a 10x MOIC). However, MOIC ignores time. IRR calculates the annualized percentage return. Earning a 10x MOIC over 3 years yields a staggering ~115% IRR, whereas earning a 10x MOIC over 12 years yields a ~21% IRR.</p>
            
            <h2>Practical Examples</h2>
            <p>Imagine investing $25,000 at a $9M pre-money valuation (with a $1M total round, making post-money $10M). You own 0.25%. Over 7 years, the company raises more capital, diluting you by 30%. Your final ownership is 0.175%. If the company exits for $100 Million, your 0.175% is worth $175,000. Your net profit is $150,000. Your MOIC is 7.0x, and your IRR is an impressive 32.04%.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/angel-investment-return-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
