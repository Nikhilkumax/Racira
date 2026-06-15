"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface EvVsGasResults {
  betterOption: "EV" | "Gas";
  savings: number;
  evTotalCost: number;
  gasTotalCost: number;
  breakEvenYear: number | null;
  chartData: any[];
  breakdown: {
    evFuel: number;
    gasFuel: number;
    evMaint: number;
    gasMaint: number;
    evDepreciation: number;
    gasDepreciation: number;
    evTaxCredit: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateEvVsGas = (inputs: typeof DEFAULTS): EvVsGasResults => {
  const evPrice = parseFloat(inputs.evPrice) || 0;
  const gasPriceCar = parseFloat(inputs.gasPriceCar) || 0;
  
  const annualMiles = parseFloat(inputs.annualMiles) || 0;
  const yearsOwned = parseFloat(inputs.yearsOwned) || 5;
  
  const electricityRate = parseFloat(inputs.electricityRate) || 0;
  const evEfficiency = parseFloat(inputs.evEfficiency) || 0;
  
  const fuelPrice = parseFloat(inputs.fuelPrice) || 0;
  const gasMpg = parseFloat(inputs.gasMpg) || 0;
  
  const taxCredit = parseFloat(inputs.taxCredit) || 0;
  
  // Advanced
  const evMaintYear = parseFloat(inputs.evMaintYear) || 0;
  const gasMaintYear = parseFloat(inputs.gasMaintYear) || 0;
  const evDepreciationRate = parseFloat(inputs.evDepreciationRate) / 100 || 0;
  const gasDepreciationRate = parseFloat(inputs.gasDepreciationRate) / 100 || 0;

  if (evPrice <= 0 || gasPriceCar <= 0 || annualMiles <= 0 || yearsOwned <= 0 || evEfficiency <= 0 || gasMpg <= 0) {
    return {
      betterOption: "EV", savings: 0, evTotalCost: 0, gasTotalCost: 0, breakEvenYear: null, chartData: [],
      breakdown: { evFuel: 0, gasFuel: 0, evMaint: 0, gasMaint: 0, evDepreciation: 0, gasDepreciation: 0, evTaxCredit: 0 },
      isError: true, errorMsg: "Prices, efficiency, and miles must be greater than zero."
    };
  }

  // Annual Fuel Costs
  const evAnnualFuel = (annualMiles / evEfficiency) * electricityRate;
  const gasAnnualFuel = (annualMiles / gasMpg) * fuelPrice;

  let chartData = [];
  let breakEvenYear: number | null = null;
  let evCumulative = evPrice - taxCredit;
  let gasCumulative = gasPriceCar;

  let currentEvValue = evPrice;
  let currentGasValue = gasPriceCar;

  for (let year = 0; year <= Math.max(10, yearsOwned); year++) {
    if (year > 0) {
      evCumulative += evAnnualFuel + evMaintYear;
      gasCumulative += gasAnnualFuel + gasMaintYear;
      
      currentEvValue *= (1 - evDepreciationRate);
      currentGasValue *= (1 - gasDepreciationRate);
    }

    chartData.push({
      year: year,
      "EV TCO": evCumulative,
      "Gas TCO": gasCumulative
    });

    if (breakEvenYear === null && year > 0 && evCumulative < gasCumulative && (evPrice - taxCredit) >= gasPriceCar) {
      breakEvenYear = year;
    }
  }

  // For the requested years owned
  const evTotalFuel = evAnnualFuel * yearsOwned;
  const gasTotalFuel = gasAnnualFuel * yearsOwned;
  
  const evTotalMaint = evMaintYear * yearsOwned;
  const gasTotalMaint = gasMaintYear * yearsOwned;

  const evFinalValue = evPrice * Math.pow(1 - evDepreciationRate, yearsOwned);
  const gasFinalValue = gasPriceCar * Math.pow(1 - gasDepreciationRate, yearsOwned);

  const evDepreciationTotal = evPrice - evFinalValue;
  const gasDepreciationTotal = gasPriceCar - gasFinalValue;

  const evTotalCost = evDepreciationTotal + evTotalFuel + evTotalMaint - taxCredit;
  const gasTotalCost = gasDepreciationTotal + gasTotalFuel + gasTotalMaint;

  const savings = Math.abs(evTotalCost - gasTotalCost);
  const betterOption = evTotalCost < gasTotalCost ? "EV" : "Gas";

  return {
    betterOption,
    savings,
    evTotalCost,
    gasTotalCost,
    breakEvenYear,
    chartData: chartData.filter(d => d.year <= Math.max(10, yearsOwned)),
    breakdown: {
      evFuel: evTotalFuel,
      gasFuel: gasTotalFuel,
      evMaint: evTotalMaint,
      gasMaint: gasTotalMaint,
      evDepreciation: evDepreciationTotal,
      gasDepreciation: gasDepreciationTotal,
      evTaxCredit: taxCredit
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  evPrice: "45000",
  gasPriceCar: "35000",
  annualMiles: "15000",
  yearsOwned: "5",
  electricityRate: "0.16",
  evEfficiency: "3.5",
  fuelPrice: "3.50",
  gasMpg: "28",
  taxCredit: "7500",
  // Advanced
  evMaintYear: "400",
  gasMaintYear: "900",
  evDepreciationRate: "15",
  gasDepreciationRate: "12"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function EvVsGasCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<EvVsGasResults>(calculateEvVsGas(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateEvVsGas(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateEvVsGas(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "Is an EV really cheaper than a gas car?", answer: "Usually, yes, over a long enough timeframe. EVs typically have a higher upfront purchase price, but their fuel (electricity) and maintenance costs are significantly lower. The 'break-even' point is the year where the fuel savings finally offset the higher initial purchase price." },
    { question: "How does the EV Tax Credit work?", answer: "In the US, the federal government offers up to a $7,500 tax credit for qualifying new EVs. This can now be applied directly at the dealership as a point-of-sale rebate, immediately lowering the purchase price of the vehicle and accelerating your break-even point." },
    { question: "Why is EV maintenance cheaper?", answer: "EVs lack internal combustion engines. This means no oil changes, no spark plugs, no timing belts, no transmission fluid, and no complex exhaust/emissions systems to repair. Furthermore, regenerative braking means EV brake pads can last over 100,000 miles." },
    { question: "Do EVs depreciate faster?", answer: "Historically, yes. Because EV battery technology is advancing so rapidly, older EVs tend to lose their value slightly faster than proven gas cars. Our calculator accounts for this by allowing you to set a higher annual depreciation rate for the EV." },
    { question: "What if I can't charge at home?", answer: "If you cannot charge at home on a cheap residential electricity rate, the math changes drastically. Public fast chargers (like Tesla Superchargers) cost 3 to 4 times as much as home electricity, which can entirely erase the 'fuel savings' advantage of an EV." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "EV vs Gas Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV vs Gas Cost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="ev-price" label="EV Purchase Price" value={inputs.evPrice} onChange={(v: string) => handleChange("evPrice", v)} prefix="$" />
              <CompactInput id="gas-price" label="Gas Car Price" value={inputs.gasPriceCar} onChange={(v: string) => handleChange("gasPriceCar", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="tax-credit" label="EV Tax Credit" value={inputs.taxCredit} onChange={(v: string) => handleChange("taxCredit", v)} prefix="$" />
              <CompactInput id="years-owned" label="Years to Own" value={inputs.yearsOwned} onChange={(v: string) => handleChange("yearsOwned", v)} suffix="yrs" />
            </div>

            <div className="flex flex-col border-t border-border pt-3 mt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Efficiency Metrics</div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput id="annual-miles" label="Annual Miles" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="mi" />
                <CompactInput id="electricity-rate" label="Electricity Rate" value={inputs.electricityRate} onChange={(v: string) => handleChange("electricityRate", v)} prefix="$" suffix="/kWh" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="ev-eff" label="EV Efficiency" value={inputs.evEfficiency} onChange={(v: string) => handleChange("evEfficiency", v)} suffix="mi/kWh" />
              <CompactInput id="fuel-price" label="Gas Price" value={inputs.fuelPrice} onChange={(v: string) => handleChange("fuelPrice", v)} prefix="$" suffix="/gal" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="gas-mpg" label="Gas Car MPG" value={inputs.gasMpg} onChange={(v: string) => handleChange("gasMpg", v)} suffix="mpg" />
              <div className="hidden"></div>
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Maintenance & Depreciation) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="ev-maint" label="EV Maint / Yr" value={inputs.evMaintYear} onChange={(v: string) => handleChange("evMaintYear", v)} prefix="$" />
                  <CompactInput id="gas-maint" label="Gas Maint / Yr" value={inputs.gasMaintYear} onChange={(v: string) => handleChange("gasMaintYear", v)} prefix="$" />
                  <CompactInput id="ev-dep" label="EV Annual Depr." value={inputs.evDepreciationRate} onChange={(v: string) => handleChange("evDepreciationRate", v)} suffix="%" />
                  <CompactInput id="gas-dep" label="Gas Annual Depr." value={inputs.gasDepreciationRate} onChange={(v: string) => handleChange("gasDepreciationRate", v)} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Compare Costs
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
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
                {/* 1. Primary Result Card */}
                <div className={`border-l-4 rounded-lg p-5 relative ${results.betterOption === 'EV' ? 'bg-[#10b981]/10 border-[#10b981]' : 'bg-[#3b82f6]/10 border-[#3b82f6]'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">The Winner: {results.betterOption}</div>
                  <div className={`text-4xl font-bold mb-1 ${results.betterOption === 'EV' ? 'text-[#10b981]' : 'text-[#3b82f6]'}`}>
                    Saves {formatCurrency(results.savings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total savings over your {inputs.yearsOwned}-year ownership period.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">EV {inputs.yearsOwned}-Yr Cost</div>
                    <div className="text-lg font-bold text-[#10b981]">{formatCurrency(results.evTotalCost)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Gas {inputs.yearsOwned}-Yr Cost</div>
                    <div className="text-lg font-bold text-[#3b82f6]">{formatCurrency(results.gasTotalCost)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Break-Even Point</div>
                    <div className="text-lg font-bold text-foreground">{results.breakEvenYear ? `Year ${results.breakEvenYear}` : 'Never / Immediate'}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cumulative Cost Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Year ${label}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="EV TCO" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="Gas TCO" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Cost shown is Cumulative Cash Outflow (Purchase - Tax Credit + Fuel + Maintenance)</p>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{inputs.yearsOwned}-Year Cost Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Depreciation (Value Loss)</span>
                      <span className="font-medium text-foreground"><span className="text-[#10b981]">{formatCurrency(results.breakdown.evDepreciation)}</span> vs <span className="text-[#3b82f6]">{formatCurrency(results.breakdown.gasDepreciation)}</span></span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Fuel (Electricity vs Gas)</span>
                      <span className="font-medium text-foreground"><span className="text-[#10b981]">{formatCurrency(results.breakdown.evFuel)}</span> vs <span className="text-[#3b82f6]">{formatCurrency(results.breakdown.gasFuel)}</span></span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Maintenance</span>
                      <span className="font-medium text-foreground"><span className="text-[#10b981]">{formatCurrency(results.breakdown.evMaint)}</span> vs <span className="text-[#3b82f6]">{formatCurrency(results.breakdown.gasMaint)}</span></span>
                    </div>
                    {results.breakdown.evTaxCredit > 0 && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Tax Incentives / Rebates</span>
                        <span className="font-medium text-emerald-600">-{formatCurrency(results.breakdown.evTaxCredit)} (EV Only)</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total True Cost to Own</span>
                      <span className="text-foreground"><span className="text-[#10b981]">{formatCurrency(results.evTotalCost)}</span> vs <span className="text-[#3b82f6]">{formatCurrency(results.gasTotalCost)}</span></span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is an EV vs Gas Cost Calculator?</h2>
            <p>An EV vs Gas Cost Calculator is a comparative financial model that determines whether an Electric Vehicle or an Internal Combustion Engine (Gas) car is mathematically cheaper over a specific period. While EVs are notorious for having higher upfront sticker prices, they counter this with significantly cheaper "fuel" (electricity), massive government tax rebates, and vastly reduced maintenance requirements. This tool simulates the total Total Cost of Ownership (TCO) for both vehicles simultaneously to reveal exactly when—and if—the EV becomes the better financial choice.</p>

            <h2>How It Works</h2>
            <p>The calculator runs a side-by-side annual simulation. It starts with the purchase price of each vehicle, immediately subtracting the <strong>EV Tax Credit</strong> from the electric car. Then, for every year of ownership, it adds the <strong>Annual Fuel Cost</strong> (calculated via your annual miles, utility rate, and gas price) and the <strong>Annual Maintenance Cost</strong>. Crucially, it also factors in <strong>Depreciation</strong>. The total cost shown is not just the cash you spent; it includes the equity you lost as the car degraded in value over time.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Winner</strong> card instantly shows which vehicle drains less wealth over your stated ownership period. The <strong>Break-Even Point</strong> is a critical metric. Because an EV usually costs more upfront, the Gas car is mathematically cheaper on Day 1. However, every mile you drive, the EV saves you money. The break-even year is the exact moment the cumulative fuel and maintenance savings eclipse the higher initial purchase price.</p>

            <h2>Key Factors</h2>
            <p><strong>Electricity Rate</strong> versus <strong>Gas Price</strong> is the primary battleground. If you live in an area with $5.00 gas and $0.10 electricity, the EV will break even incredibly fast. If you live somewhere with $3.00 gas and $0.35 electricity, the EV might never break even. <strong>Annual Miles</strong> accelerates the math; the more you drive, the faster the EV pays for itself because you are replacing expensive gas miles with cheap electric miles.</p>

            <h2>Advanced Features</h2>
            <p>By opening the Advanced Options, you can adjust <strong>Annual Depreciation Rates</strong>. Historically, early EVs depreciated faster than gas cars due to rapid advancements in battery tech and range. Setting the EV depreciation rate higher allows you to conservatively model the risk of battery obsolescence. You can also edit the <strong>Maintenance</strong> estimates, reflecting the fact that EVs have no oil changes or transmission services.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Commuter Win.</strong> John buys a $45,000 EV instead of a $35,000 gas car. He gets a $7,500 tax credit, lowering his effective EV price to $37,500. He drives 20,000 miles a year with cheap home electricity. Because he drives so much, he saves $2,000 a year on gas and maintenance. His break-even point is just Year 2. After 5 years, he has saved over $6,000 by going electric.</p>
            <p><strong>Example 2: The Low-Mileage Loss.</strong> Sarah buys a $60,000 luxury EV instead of a $45,000 gas SUV. She does not qualify for a tax credit. She only drives 5,000 miles a year and lives in California where electricity is expensive. Because she barely drives, she only saves $300 a year on fuel. Her break-even point is over 30 years. The EV is a catastrophic financial decision compared to the gas car.</p>

            <h2>Tips & Best Practices</h2>
            <p>Do not buy an EV to save money if you cannot charge at home. Relying entirely on public fast chargers (which often cost 3x to 4x more than residential electricity) destroys the financial advantage of going electric. Furthermore, always verify if your chosen EV actually qualifies for the federal tax credit, as strict battery sourcing and income limits apply. Finally, keep your vehicles longer! The longer you own an EV, the more powerful the cumulative fuel savings become.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ev-vs-gas-cost-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
