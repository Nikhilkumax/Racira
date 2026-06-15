"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface RoadTaxResults {
  annualTotal: number;
  monthlyEquivalent: number;
  fiveYearCost: number;
  tenYearCost: number;
  breakdown: {
    baseFee: number;
    weightSurcharge: number;
    evSurcharge: number;
    localTax: number;
    otherFees: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateRoadTax = (inputs: typeof DEFAULTS): RoadTaxResults => {
  const baseFee = parseFloat(inputs.baseFee) || 0;
  const weight = parseFloat(inputs.weight) || 0;
  const vehicleType = inputs.vehicleType as "gas" | "hybrid" | "ev";
  const localTax = parseFloat(inputs.localTax) || 0;
  
  // Advanced
  const vanityFee = parseFloat(inputs.vanityFee) || 0;
  const emissionsFee = parseFloat(inputs.emissionsFee) || 0;

  if (baseFee < 0 || weight < 0) {
    return {
      annualTotal: 0, monthlyEquivalent: 0, fiveYearCost: 0, tenYearCost: 0,
      breakdown: { baseFee: 0, weightSurcharge: 0, evSurcharge: 0, localTax: 0, otherFees: 0 },
      isError: true, errorMsg: "Fees and weight cannot be negative."
    };
  }

  // Weight Surcharge (Hypothetical average model: $0.02 per lb over 4000 lbs)
  let weightSurcharge = 0;
  if (weight > 4000) {
    weightSurcharge = (weight - 4000) * 0.02;
  }

  // EV/Hybrid Surcharge (Many states charge this to make up for lost gas tax)
  let evSurcharge = 0;
  if (vehicleType === "ev") evSurcharge = 150;
  else if (vehicleType === "hybrid") evSurcharge = 50;

  const otherFees = vanityFee + emissionsFee;

  const annualTotal = baseFee + weightSurcharge + evSurcharge + localTax + otherFees;

  return {
    annualTotal,
    monthlyEquivalent: annualTotal / 12,
    fiveYearCost: annualTotal * 5,
    tenYearCost: annualTotal * 10,
    breakdown: {
      baseFee,
      weightSurcharge,
      evSurcharge,
      localTax,
      otherFees
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  baseFee: "50",
  weight: "4500",
  vehicleType: "gas", // gas, hybrid, ev
  localTax: "25",
  // Advanced
  vanityFee: "0",
  emissionsFee: "0"
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
export default function RoadTaxCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RoadTaxResults>(calculateRoadTax(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateRoadTax(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateRoadTax(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

  const barData = results.isError ? [] : [
    { name: "Base Fee", value: results.breakdown.baseFee, color: "#3b82f6" },
    { name: "Weight", value: results.breakdown.weightSurcharge, color: "#8b5cf6" },
    { name: "EV/Hybrid", value: results.breakdown.evSurcharge, color: "#10b981" },
    { name: "Local Tax", value: results.breakdown.localTax, color: "#f59e0b" },
    { name: "Other Fees", value: results.breakdown.otherFees, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const faqs = [
    { question: "What is Road Tax?", answer: "Road Tax (often called Vehicle Registration Fee or Vehicle License Fee) is an annual tax levied by state and local governments. The revenue is typically used to fund highway maintenance, infrastructure projects, and the department of motor vehicles." },
    { question: "Why do Electric Vehicles (EVs) pay a surcharge?", answer: "Historically, road maintenance has been funded by the gas tax (a tax applied to every gallon of fuel you buy). Because EVs do not buy gas, they avoid this tax. To ensure EV owners still contribute to road infrastructure, many states have implemented a flat annual EV surcharge." },
    { question: "Why is vehicle weight a factor?", answer: "Heavier vehicles cause exponentially more damage to asphalt and road infrastructure. A 6,000-pound truck wears down the road much faster than a 3,000-pound sedan. Therefore, many jurisdictions add a weight surcharge to registration fees to offset this disproportionate damage." },
    { question: "Are road taxes tax-deductible?", answer: "In the United States, you can typically only deduct the portion of your annual vehicle registration fee that is based on the value of your car (ad valorem tax) on your federal income taxes. Flat fees or weight-based fees are usually not deductible." },
    { question: "How often do I have to pay this?", answer: "Road tax / registration fees are almost universally assessed annually. You must pay this fee every year to receive your updated license plate sticker and legally drive on public roads." },
    { question: "Do local counties add their own taxes?", answer: "Yes, in many states, individual counties or cities have the authority to add their own local vehicle tax (often called a 'wheel tax') on top of the state's base registration fee." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Road Tax Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Road Tax Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">State Base Registration Fee</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-lg">$</span>
                <input type="number" value={inputs.baseFee} onChange={e => handleChange("baseFee", e.target.value)} className="w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="weight" label="Vehicle Weight" value={inputs.weight} onChange={(v: string) => handleChange("weight", v)} suffix="lbs" />
              <CompactInput id="vehicle-type" label="Engine Type" value={inputs.vehicleType} onChange={(v: string) => handleChange("vehicleType", v)} options={[
                { label: "Gasoline / Diesel", value: "gas" },
                { label: "Hybrid", value: "hybrid" },
                { label: "Full Electric (EV)", value: "ev" }
              ]} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="local-tax" label="Local / County Tax (Wheel Tax)" value={inputs.localTax} onChange={(v: string) => handleChange("localTax", v)} prefix="$" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="vanity-fee" label="Vanity Plate Fee" value={inputs.vanityFee} onChange={(v: string) => handleChange("vanityFee", v)} prefix="$" />
                  <CompactInput id="emissions-fee" label="Emissions Surcharge" value={inputs.emissionsFee} onChange={(v: string) => handleChange("emissionsFee", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Road Tax
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Annual Road Tax</div>
                  <div className="text-5xl font-bold text-primary mb-1">{formatCurrency(results.annualTotal)}</div>
                  <div className="text-sm text-muted-foreground">This is the estimated amount you will pay every year to register your vehicle.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Monthly Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.monthlyEquivalent)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">5-Year Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.fiveYearCost)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">10-Year Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.tenYearCost)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Fee Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">State Base Fee</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.baseFee)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Weight Surcharge</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.weightSurcharge)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">EV/Hybrid Surcharge</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.evSurcharge)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Local / County Tax</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.localTax)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">Other Fees (Vanity, Emissions)</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.otherFees)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Annual Payment</span>
                      <span className="text-primary">{formatCurrency(results.annualTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cost Distribution</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Vehicle Assessment Summary</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Vehicle Type:</span><span className="font-medium capitalize">{inputs.vehicleType}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Reported Weight:</span><span className="font-medium">{parseInt(inputs.weight).toLocaleString()} lbs</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">EV Surcharge Hit:</span><span className="font-medium">{results.breakdown.evSurcharge > 0 ? "Yes" : "No"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Weight Surcharge Hit:</span><span className="font-medium">{results.breakdown.weightSurcharge > 0 ? "Yes" : "No"}</span></div>
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
            <h2>What Is Road Tax?</h2>
            <p>Road Tax, commonly referred to as Vehicle Registration Fees in the United States, is an annual tax levied by state and local governments. This tax is the legal requirement to operate your vehicle on public roads. The revenue generated is typically earmarked for maintaining state highways, funding local infrastructure projects, and supporting the operations of the Department of Motor Vehicles (DMV). Knowing your annual road tax is crucial for calculating the true Total Cost of Ownership of your vehicle.</p>

            <h2>How It Works</h2>
            <p>Our Road Tax Calculator simulates the multi-layered fee structure used by most DMVs. It starts with a <strong>State Base Fee</strong>, which is a flat rate charged to all vehicles. Then, it assesses a <strong>Weight Surcharge</strong>. Since heavier vehicles cause exponentially more damage to roads, many states charge extra for vehicles over a certain threshold (our model assumes an extra $0.02 per pound over 4,000 lbs). Next, it applies an <strong>EV/Hybrid Surcharge</strong>. Because EVs do not pay the gas tax that traditionally funds road repairs, states now levy a flat fee ($50-$200) on electric and hybrid vehicles. Finally, <strong>Local Taxes</strong> and <strong>Other Fees</strong> (like vanity plates) are added to calculate the total annual bill.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Total Annual Road Tax</strong> is the amount you will need to write a check for every year to receive your registration sticker. We also provide a <strong>Monthly Equivalent</strong>—while you cannot pay road tax monthly, breaking it down helps you budget for this massive annual hit alongside your car loan and insurance. The <strong>10-Year Cost</strong> puts into perspective exactly how much "rent" you are paying the state simply to own a car over a decade.</p>

            <h2>Key Factors</h2>
            <p>The most shocking factor for many modern buyers is the <strong>Engine Type</strong>. Buying a fully electric vehicle (EV) saves you money on gas, but you will be hit with a significant EV surcharge when registration is due. <strong>Vehicle Weight</strong> is also becoming a major factor as Americans shift from sedans to massive SUVs and trucks. A 6,500-pound heavy-duty truck will incur much higher weight surcharges than a 3,000-pound compact car.</p>

            <h2>Advanced Features</h2>
            <p>The calculator allows for the inclusion of <strong>Vanity Plate Fees</strong> and <strong>Emissions Surcharges</strong>. Personalized license plates often carry an additional $30 to $80 annual fee on top of the base registration. In certain counties with poor air quality, older gasoline vehicles may be hit with an emissions surcharge to discourage their use.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Gas Sedan.</strong> Mark drives a 3,200-pound gasoline Honda Civic. His state base fee is $50. He is under the weight limit, pays no EV surcharge, and has a $25 local county tax. His annual road tax is a very affordable $75.</p>
            <p><strong>Example 2: The Heavy EV.</strong> Sarah drives a 5,500-pound luxury electric SUV. Her state base fee is $50. Because it is so heavy, she gets hit with a $30 weight surcharge. Because it is an EV, she gets hit with a $150 EV surcharge to offset the lost gas tax. With her $25 local tax, her annual road tax skyrockets to $255.</p>

            <h2>Tips & Best Practices</h2>
            <p>While you cannot avoid road tax, you can make smarter purchasing decisions. If you are debating between an SUV and a crossover, compare their weights; staying under your state's weight surcharge threshold can save you hundreds of dollars over the vehicle's lifespan. Furthermore, always budget for your registration fee—set aside 1/12th of the total cost every month so you aren't blindsided when the DMV bill arrives in the mail.</p>

            <h2>Benefits</h2>
            <p>Using a Road Tax Calculator prevents sticker shock at the DMV. It provides a realistic estimate of your annual vehicle holding costs. For buyers considering an EV, it clearly highlights the "hidden" electric vehicle surcharges that dealerships rarely mention, allowing you to accurately compare the long-term savings of electricity versus gasoline.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/road-tax-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
