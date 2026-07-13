"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw, ChevronDown } from "lucide-react";

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
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function AngelInvestmentReturnCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AngelReturnResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResults(calculateAngelReturn(DEFAULTS));
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    const r = calculateAngelReturn(inputs);
    if (!r.isError) setResults(r);
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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Angel Investment Return Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="initialInvestment" label="Your Investment" value={inputs.initialInvestment} onChange={(v: string) => handleChange("initialInvestment", v)} prefix="$" />
              <CompactInput id="preMoneyValuation" label="Pre-Money Valuation" value={inputs.preMoneyValuation} onChange={(v: string) => handleChange("preMoneyValuation", v)} prefix="$" />
              <CompactInput id="totalRoundSize" label="Total Round Size" value={inputs.totalRoundSize} onChange={(v: string) => handleChange("totalRoundSize", v)} prefix="$" />
              <div className="flex flex-col justify-center bg-muted/20 border border-border rounded-md px-3 h-10 mt-[26px]">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Post-Money</div>
                <div className="text-sm font-bold text-foreground leading-none mt-1">${(parseFloat(inputs.preMoneyValuation || "0") + parseFloat(inputs.totalRoundSize || "0")).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Exit & Dilution Expectations <ChevronDown className={`h-3 w-3 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="expectedExitValuation" label="Expected Exit Valuation" value={inputs.expectedExitValuation} onChange={(v: string) => handleChange("expectedExitValuation", v)} prefix="$" />
                  <CompactInput id="timeToExitYears" label="Time to Exit" value={inputs.timeToExitYears} onChange={(v: string) => handleChange("timeToExitYears", v)} suffix="Years" />
                  <div className="col-span-2">
                    <CompactInput id="futureDilution" label="Expected Future Dilution" value={inputs.futureDilution} onChange={(v: string) => handleChange("futureDilution", v)} suffix="%" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results && (
              results.isError ? (
                <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                  <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Return Value</div>
                      <div className="flex items-end gap-3 mb-1">
                        <div className="text-4xl font-bold text-primary tracking-tighter">${results.totalReturnValue.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-5 relative shadow-sm flex flex-col justify-center">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                    <div className="p-4 text-center">
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Multiple (MOIC)</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">{results.moic}x</div>
                    </div>
                    <div className="p-4 text-center border-l border-border">
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">IRR (Annualized)</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">{results.irr}%</div>
                    </div>
                    <div className="p-4 text-center border-l border-border">
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Net Profit</div>
                      <div className="text-lg font-bold text-foreground">${results.netProfit.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                    <h3 className="text-base font-bold text-foreground mb-4">Investment Value Growth Over Time</h3>
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
              )
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <section className="mt-12 space-y-8 text-base text-foreground">
              <div>
                <h2 className="text-2xl font-bold mb-3">Understanding Angel Investment Returns</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Angel investing represents the highest-risk, highest-reward asset class available to private investors. Unlike public equities, where massive corporations aim for single-digit annual growth, angel investments involve deploying capital into unproven, early-stage startups. Because the failure rate of startups is notoriously high—often exceeding 90%—the few investments that do succeed must generate exponential, outsized returns to offset the total losses incurred across an investor's portfolio.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Calculating the potential return on an angel investment requires a deep understanding of venture mathematics. It is rarely as simple as dividing an exit price by an entry price. An accurate return calculation must account for the startup's pre-money and post-money valuations, the total size of the initial funding round, the expected time horizon before a liquidity event (like an acquisition or an IPO), and the critical factor of ongoing equity dilution as the company raises subsequent rounds of capital over several years.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">The Mechanics of Valuation and Equity</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you write a check to a startup, the percentage of the company you are actually purchasing is determined by the "Post-Money Valuation." To calculate this, you must know both the "Pre-Money Valuation" (what the company is agreed to be worth prior to receiving cash) and the total size of the funding round being raised. The post-money valuation is simply the pre-money valuation plus the total round size.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  For example, if you invest $50,000 in a seed round where the startup is raising $1,000,000 at a $4,000,000 pre-money valuation, the post-money valuation is $5,000,000. Your initial ownership percentage is calculated by dividing your $50,000 investment by the $5,000,000 post-money valuation. In this scenario, you have acquired exactly 1.0% of the company's equity. This baseline ownership percentage is the foundation upon which all future returns—and future dilutions—are built.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">The Reality of Future Dilution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  One of the most dangerous mistakes an amateur angel investor can make is calculating their future payout based on their initial ownership percentage. Startups burn capital quickly to fuel hyper-growth, meaning they will almost certainly need to raise a Series A, Series B, and potentially a Series C round of funding before they are mature enough to exit.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Every time a startup raises a new round of capital, they issue brand new shares to the new investors. This drastically increases the total pool of outstanding shares. As the total denominator grows, your fixed number of shares represents a smaller and smaller piece of the total pie. This is known as dilution. Unless you possess "pro-rata rights" and continually deploy more capital in every subsequent round to maintain your ownership percentage, your 1.0% stake will steadily shrink. If a company raises multiple major rounds, it is not uncommon for an angel investor to suffer 30%, 40%, or even 50% dilution over an eight-year journey to an exit.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">MOIC vs. IRR: Measuring Private Returns</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Venture capital and angel returns are measured using two primary metrics: Multiple on Invested Capital (MOIC) and Internal Rate of Return (IRR). MOIC is the simplest metric. It answers the question: "How many times did I multiply my money?" If you invest $50,000 and receive a $500,000 payout at exit, you achieved a 10.0x MOIC. While MOIC is easy to understand, it ignores a critical factor: the time value of money.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This is where IRR comes in. IRR calculates your annualized percentage return, acting as a great equalizer that allows you to compare a venture investment against traditional asset classes like real estate or the S&P 500. Time radically impacts IRR. Earning a 10x MOIC over a rapid 3-year timeline yields a staggering ~115% IRR. However, earning that exact same 10x MOIC over a sluggish 12-year timeline yields a much more modest ~21% IRR. Professional angels aim for high IRRs, as capital locked in an illiquid startup for a decade carries an immense opportunity cost.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Modeling a Realistic Exit Scenario</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To utilize this calculator effectively, you must model realistic scenarios. Let’s say you invest $25,000 at a $9,000,000 pre-money valuation into a $1,000,000 round (a $10,000,000 post-money valuation). You own 0.25%. You estimate it will take the company 7 years to reach an exit. You assume they will raise two more rounds, diluting you by 30% total. This drops your final ownership to 0.175%.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  If the startup defies the odds and successfully exits for $100,000,000, your 0.175% stake is worth $175,000. Subtracting your initial $25,000 investment leaves you with $150,000 in pure net profit. This represents a 7.0x MOIC and a 32.04% IRR. While these numbers look spectacular in isolation, remember that this single successful "home run" may have to financially cover five or six other startups in your portfolio that went completely bankrupt and returned nothing.
                </p>
              </div>
            </section>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/angel-investment-return-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
