"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { TrendingDown, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface DepreciationResults {
  totalDepreciation: number;
  annualDepreciationFleet: number;
  annualDepreciationPerVehicle: number;
  monthlyDepreciationFleet: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDepreciation = (inputs: typeof DEFAULTS): DepreciationResults => {
  const vehicleCount = parseInt(inputs.vehicleCount);
  const purchasePrice = parseFloat(inputs.purchasePrice);
  const salvageValue = parseFloat(inputs.salvageValue);
  const usefulLifeYears = parseFloat(inputs.usefulLifeYears);

  if (isNaN(vehicleCount) || vehicleCount <= 0 || isNaN(purchasePrice) || purchasePrice <= 0 || 
      isNaN(salvageValue) || salvageValue < 0 || isNaN(usefulLifeYears) || usefulLifeYears <= 0) {
    return {
      totalDepreciation: 0, annualDepreciationFleet: 0, annualDepreciationPerVehicle: 0, monthlyDepreciationFleet: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  if (salvageValue >= purchasePrice) {
    return {
      totalDepreciation: 0, annualDepreciationFleet: 0, annualDepreciationPerVehicle: 0, monthlyDepreciationFleet: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Salvage value must be less than the purchase price."
    };
  }

  // Straight-Line Depreciation Calculation
  const totalPurchaseFleet = purchasePrice * vehicleCount;
  const totalSalvageFleet = salvageValue * vehicleCount;
  
  const totalDepreciation = totalPurchaseFleet - totalSalvageFleet;
  
  const annualDepreciationFleet = totalDepreciation / usefulLifeYears;
  const annualDepreciationPerVehicle = annualDepreciationFleet / vehicleCount;
  const monthlyDepreciationFleet = annualDepreciationFleet / 12;

  // Generate chart data: Value of the fleet over time
  const chartData = [];
  const schedule: any[] = [];
  
  for (let year = 0; year <= usefulLifeYears; year++) {
    const currentFleetValue = totalPurchaseFleet - (annualDepreciationFleet * year);
    
    chartData.push({
      Year: year,
      "Fleet Book Value": Math.round(currentFleetValue)
    });

    schedule.push({
      year: year,
      value: Math.round(currentFleetValue),
      cumulativeDepreciation: Math.round(annualDepreciationFleet * year)
    });
  }

  return {
    totalDepreciation: Math.round(totalDepreciation),
    annualDepreciationFleet: Math.round(annualDepreciationFleet),
    annualDepreciationPerVehicle: Math.round(annualDepreciationPerVehicle),
    monthlyDepreciationFleet: Math.round(monthlyDepreciationFleet),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  vehicleCount: "5",
  purchasePrice: "45000",
  salvageValue: "10000", // Value when sold at the end of its life
  usefulLifeYears: "5"
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function FleetDepreciationCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DepreciationResults>(calculateDepreciation(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateDepreciation(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDepreciation(DEFAULTS));
  };

  const faqs = [
    { question: "What is Fleet Depreciation?", answer: "Depreciation is the accounting process of spreading the cost of an expensive asset (like a delivery truck) over its useful lifespan. When a company buys a $50,000 truck, they don't count that as a $50,000 expense on day one. Instead, they write off a portion of that value every year as the truck ages and loses its physical value." },
    { question: "What is Straight-Line Depreciation?", answer: "Straight-Line Depreciation is the simplest and most common accounting method for vehicles. You take the total cost of the vehicle, subtract its estimated Salvage Value (what you can sell it for at the end), and divide the remaining number equally across the years you plan to use it. This gives you a flat, consistent deduction every single year." },
    { question: "What is Salvage Value?", answer: "Salvage Value (or Residual Value) is your best estimate of what the vehicle will be worth when you are finally done with it. If you buy a van for $40,000, use it for 5 years, and expect to sell it at auction for $10,000, then the $10,000 is the salvage value. You only depreciate the $30,000 difference that the company actually 'used up' during those 5 years." },
    { question: "Why do companies care about this?", answer: "Depreciation is a non-cash expense that drastically lowers a company's tax burden. By claiming $20,000 in fleet depreciation on their taxes, a company lowers its taxable income by $20,000 without actually having to write a check to anyone that year. It is a critical tool for managing cash flow and corporate tax strategy." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Fleet Depreciation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fleet Depreciation Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the annual straight-line depreciation expense for your commercial vehicle fleet for tax and accounting purposes.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Per-Vehicle Metrics</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Purchase Price (Each)" value={inputs.purchasePrice} onChange={(v: string) => handleChange("purchasePrice", v)} prefix="$" placeholder="45000" />
              <CompactInput id="salvage" label="Salvage Value (Each)" value={inputs.salvageValue} onChange={(v: string) => handleChange("salvageValue", v)} prefix="$" placeholder="10000" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Fleet Scale & Timeline</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="count" label="Number of Vehicles" value={inputs.vehicleCount} onChange={(v: string) => handleChange("vehicleCount", v)} placeholder="5" />
              <CompactInput id="life" label="Useful Life (Years)" value={inputs.usefulLifeYears} onChange={(v: string) => handleChange("usefulLifeYears", v)} suffix="Years" placeholder="5" />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: This calculator uses the standard Straight-Line Depreciation method, which assumes the vehicle loses value at a constant rate over its useful life.
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
                {/* 1. Primary Result Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Annual Fleet Expense</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-xl font-bold text-primary mb-1">$</div>
                      <div className="text-5xl font-black text-primary tracking-tighter">{results.annualDepreciationFleet.toLocaleString()}</div>
                      <div className="text-sm font-bold text-primary/70 mb-2">/ yr</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Lost Value</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-xl font-bold text-muted-foreground mb-1">$</div>
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.totalDepreciation.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Initial Fleet Cost</div>
                    <div className="text-2xl font-bold text-destructive">${(parseFloat(inputs.purchasePrice) * parseInt(inputs.vehicleCount)).toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Final Auction Value</div>
                    <div className="text-2xl font-bold text-emerald-500">${(parseFloat(inputs.salvageValue) * parseInt(inputs.vehicleCount)).toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Annual per Vehicle</div>
                    <div className="text-2xl font-bold text-orange-500">${results.annualDepreciationPerVehicle.toLocaleString()}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Fleet Book Value Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Year" tickFormatter={(val) => `Yr ${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fleet Book Value']}
                          labelFormatter={(label) => `End of Year ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" name="Fleet Book Value" dataKey="Fleet Book Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} activeDot={{r: 6}} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">This straight-line graph shows the accounting value of your physical assets decreasing until it hits the Salvage Value.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Depreciation Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Year</th>
                          <th className="px-4 py-3 font-semibold text-right">Annual Deduction</th>
                          <th className="px-4 py-3 font-semibold text-right">Cumulative Deduction</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">Ending Book Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.year} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-foreground font-medium">Year {row.year} {row.year === 0 ? '(Purchase)' : ''}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.year === 0 ? '-' : '$' + results.annualDepreciationFleet.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-destructive">{row.cumulativeDepreciation === 0 ? '-' : '-$' + row.cumulativeDepreciation.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-primary">${row.value.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Accounting of Aging Vehicles</h2>
            <p>For a logistics or service company, commercial vehicles are typically the largest capital assets on the balance sheet. When a company purchases ten delivery trucks for $50,000 each (a $500,000 investment), they cannot simply deduct that entire half-million dollars from their taxes in the first year. The IRS and standard accounting principles require that the cost of these vehicles be spread out over their "useful life." This spreading out of the cost is known as <strong>Depreciation</strong>.</p>

            <h2>Understanding Straight-Line Depreciation</h2>
            <p>While there are complex, accelerated depreciation methods designed to maximize early tax breaks, the foundational method used by most small to medium businesses is <strong>Straight-Line Depreciation</strong>. This method is incredibly simple: it assumes the vehicle loses the exact same amount of value every single year until it is retired.</p>
            <p>To calculate it, you need three numbers:</p>
            <ul>
              <li><strong>Purchase Price:</strong> What you paid for the vehicle.</li>
              <li><strong>Salvage Value:</strong> Your educated guess on what the vehicle will be worth when you finally sell it or scrap it at the end of its life.</li>
              <li><strong>Useful Life:</strong> How many years the company plans to use the vehicle before getting rid of it (e.g., 5 years).</li>
            </ul>

            <h2>Why the Deduction is Critical for Business</h2>
            <p>Depreciation is a unique financial metric because it is a "non-cash expense." If your annual fleet depreciation is $40,000, you do not write a $40,000 check to anyone at the end of the year. The money was already spent when you bought the trucks.</p>
            <p>However, you are legally allowed to claim that $40,000 as a business expense on your income statement. This lowers your company's taxable net income by $40,000, which drastically reduces the amount of corporate taxes you have to pay the government. Proper management of fleet depreciation is one of the most powerful tools a logistics company has to protect its cash flow.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fleet-depreciation-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
