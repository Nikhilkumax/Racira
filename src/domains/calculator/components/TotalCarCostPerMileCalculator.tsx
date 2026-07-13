"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface CostPerMileResults {
  costPerMile: number;
  totalAnnualCost: number;
  monthlyCost: number;
  dailyCost: number;
  breakdown: {
    depreciation: number;
    financing: number;
    taxesAndFees: number;
    fuel: number;
    insurance: number;
    maintenance: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateCostPerMile = (inputs: typeof DEFAULTS): CostPerMileResults => {
  const annualMiles = parseFloat(inputs.annualMiles) || 15000;
  const price = parseFloat(inputs.price) || 0;
  const mpg = parseFloat(inputs.mpg) || 25;
  const gasPrice = parseFloat(inputs.gasPrice) || 3.50;
  const annualInsurance = parseFloat(inputs.annualInsurance) || 1200;
  const annualMaintenance = parseFloat(inputs.annualMaintenance) || 800;
  const loanPayment = parseFloat(inputs.loanPayment) || 500;
  const registrationFee = parseFloat(inputs.registrationFee) || 200;
  
  if (annualMiles <= 0) {
    return {
      costPerMile: 0, totalAnnualCost: 0, monthlyCost: 0, dailyCost: 0,
      breakdown: { depreciation: 0, financing: 0, taxesAndFees: 0, fuel: 0, insurance: 0, maintenance: 0 },
      isError: true, errorMsg: "Annual Miles must be greater than zero."
    };
  }

  // 1. Depreciation (Assume roughly 15% loss per year on average for simplicity, or calculated off price)
  const depreciation = price * 0.15;

  // 2. Financing (Using simple monthly payment * 12 for the cashflow perspective, though technically it's mixed principal/interest. For cashflow cost-per-mile, total cash out is often used, but we'll stick to a standard model)
  const annualFinancing = loanPayment * 12;

  // 3. Taxes and Fees
  const annualFees = registrationFee;

  // 4. Fuel
  const annualFuel = (annualMiles / mpg) * gasPrice;

  const totalAnnualCost = depreciation + annualFinancing + annualFees + annualFuel + annualInsurance + annualMaintenance;

  return {
    costPerMile: totalAnnualCost / annualMiles,
    totalAnnualCost,
    monthlyCost: totalAnnualCost / 12,
    dailyCost: totalAnnualCost / 365,
    breakdown: {
      depreciation,
      financing: annualFinancing,
      taxesAndFees: annualFees,
      fuel: annualFuel,
      insurance: annualInsurance,
      maintenance: annualMaintenance
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  annualMiles: "15000",
  price: "30000",
  loanPayment: "500",
  mpg: "25",
  gasPrice: "3.50",
  annualInsurance: "1200",
  annualMaintenance: "800",
  registrationFee: "200"
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
export default function TotalCarCostPerMileCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<CostPerMileResults>(calculateCostPerMile(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateCostPerMile(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateCostPerMile(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatCents = (val: number) => `$${val.toFixed(2)}`;

  const pieData = results.isError ? [] : [
    { name: "Depreciation", value: results.breakdown.depreciation, color: "#10b981" },
    { name: "Fuel", value: results.breakdown.fuel, color: "#f59e0b" },
    { name: "Insurance", value: results.breakdown.insurance, color: "#3b82f6" },
    { name: "Maintenance", value: results.breakdown.maintenance, color: "#8b5cf6" },
    { name: "Financing (Cashflow)", value: results.breakdown.financing, color: "#ef4444" },
    { name: "Taxes & Fees", value: results.breakdown.taxesAndFees, color: "#64748b" },
  ].filter(d => d.value > 0);

  const faqs = [
    { question: "Why calculate cost per mile?", answer: "Cost per mile breaks down the massive expense of vehicle ownership into a micro-metric. It helps you understand exactly how much every trip to the grocery store or daily commute is pulling from your bank account, enabling better budgeting and decision-making." },
    { question: "What is the average cost per mile to drive a car?", answer: "According to the IRS and AAA, the average cost per mile to own and operate a new vehicle is typically between 60 to 75 cents per mile, depending heavily on the type of vehicle and annual mileage." },
    { question: "Why does driving more miles lower my cost per mile?", answer: "Fixed costs like insurance, registration, and calendar-time depreciation stay the same regardless of how much you drive. If you drive more, these fixed costs are spread over a larger number of miles, lowering your per-mile cost (even though your total annual cost increases)." },
    { question: "Is this the same as the IRS mileage rate?", answer: "No. The IRS standard mileage rate is a generalized national average used for tax deductions. This calculator provides your personalized, exact cost per mile based on your specific vehicle and driving habits." },
    { question: "Why is my loan payment included?", answer: "From a cashflow perspective, your monthly loan payment is money leaving your bank account to support the vehicle. While a portion goes to principal (building equity), the cashflow cost per mile helps you understand your immediate out-of-pocket expenses for driving." },
    { question: "How can I reduce my cost per mile?", answer: "The fastest way to reduce cost per mile is to buy a cheaper, older vehicle (reducing depreciation and loan costs) and keeping it maintained to avoid major repairs. Buying a highly fuel-efficient vehicle also drastically reduces the per-mile fuel expense." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Total Car Cost Per Mile Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Car Cost Per Mile Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Annual Miles Driven</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={inputs.annualMiles} onChange={e => handleChange("annualMiles", e.target.value)} className="w-full h-full px-4 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
                <span className="pr-4 text-primary font-bold text-sm uppercase">Miles</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Car Value / Price" value={inputs.price} onChange={(v: string) => handleChange("price", v)} prefix="$" />
              <CompactInput id="loan-payment" label="Monthly Loan Pmt" value={inputs.loanPayment} onChange={(v: string) => handleChange("loanPayment", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="mpg" label="Vehicle MPG" value={inputs.mpg} onChange={(v: string) => handleChange("mpg", v)} suffix="mpg" />
              <CompactInput id="gas-price" label="Gas Price" value={inputs.gasPrice} onChange={(v: string) => handleChange("gasPrice", v)} prefix="$" suffix="/gal" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="annual-insurance" label="Insurance / Year" value={inputs.annualInsurance} onChange={(v: string) => handleChange("annualInsurance", v)} prefix="$" />
              <CompactInput id="annual-maintenance" label="Maint. / Year" value={inputs.annualMaintenance} onChange={(v: string) => handleChange("annualMaintenance", v)} prefix="$" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="registration-fee" label="Annual Registration & Fees" value={inputs.registrationFee} onChange={(v: string) => handleChange("registrationFee", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">True Cost Per Mile</div>
                  <div className="text-5xl font-bold text-primary mb-1">{formatCents(results.costPerMile)}</div>
                  <div className="text-sm text-muted-foreground">Every mile you drive costs you exactly {formatCents(results.costPerMile)} in fuel, wear, and fixed costs.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Annual Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.totalAnnualCost)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Monthly Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.monthlyCost)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Daily Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCents(results.dailyCost)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Annual Cashflow Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Loan Payments</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.financing)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Depreciation (Value Loss)</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.depreciation)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> Fuel</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.fuel)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> Insurance</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.insurance)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div> Maintenance & Repairs</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.maintenance)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#64748b]"></div> Registration & Fees</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.taxesAndFees)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Annual Cash Outflow</span>
                      <span className="text-primary">{formatCurrency(results.totalAnnualCost)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cost Distribution</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Trip Cost Examples</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">5-Mile Commute:</span><span className="font-medium text-red-500">-{formatCents(results.costPerMile * 5)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">10-Mile Grocery Run:</span><span className="font-medium text-red-500">-{formatCents(results.costPerMile * 10)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">50-Mile Road Trip:</span><span className="font-medium text-red-500">-{formatCents(results.costPerMile * 50)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">100-Mile Drive:</span><span className="font-medium text-red-500">-{formatCents(results.costPerMile * 100)}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Cost Per Mile Calculator?</h2>
            <p>A Total Car Cost Per Mile Calculator breaks down the massive, terrifying annual expense of owning a vehicle into a simple, microscopic metric: exactly how much money it costs you to drive one single mile. Many drivers think driving is cheap because they only look at the cost of gas. But gas is just the tip of the iceberg. Every mile you drive incurs invisible costs in depreciation, maintenance, insurance, and financing. Understanding your true cost per mile is crucial for budgeting, deciding whether to drive or fly on a trip, or determining if taking a gig-economy job (like Uber or Doordash) is actually profitable.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Our algorithm aggregates all of your vehicle-related expenses into an annual snapshot. The primary formula is simple: <code>Cost Per Mile = Total Annual Cost / Annual Miles Driven</code>. The complexity lies in calculating the Total Annual Cost. We sum your fixed costs (insurance, registration, loan payments) and your variable costs (fuel, maintenance). We also estimate your annual depreciation by taking a standard 15% reduction of your vehicle's current value. By combining these, we find exactly how much cash is leaving your pocket every year to support the car, and divide it by the miles you drive.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The <strong>True Cost Per Mile</strong> is the headline number. If your result is $0.65, it means that driving 10 miles to a restaurant and back doesn't just cost you $1.50 in gas—it actually costs you $6.50 in total vehicle expenses. <strong>Annual Cost</strong> shows the frightening reality of how much of your yearly income goes entirely to transportation. <strong>Monthly and Daily Costs</strong> break this down further, revealing that you might be spending $25 a day just to have a car sitting in your driveway.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p><strong>Annual Miles Driven</strong> heavily skews the result. Because fixed costs (like insurance and loan payments) stay the same regardless of mileage, driving more miles spreads those costs out, lowering your per-mile rate (even though your total out-of-pocket cash increases). <strong>Car Value</strong> dictates depreciation, which is usually the largest hidden expense. <strong>Loan Payments</strong> represent a massive cashflow drain that significantly spikes the cost per mile for anyone financing a newer vehicle.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The calculator allows you to input exact figures for Annual Insurance, Maintenance, and Registration Fees. Getting these numbers exact is vital for an accurate reading. A sports car might have cheap payments but exorbitant insurance, drastically increasing its per-mile cost compared to an economy sedan.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Commuter.</strong> John has a $20,000 sedan, pays $350 a month on his loan, and drives 15,000 miles a year. With $1,000 in insurance and $3/gal gas, his total annual cost is around $9,500. His cost per mile is roughly $0.63.</p>
            <p><strong>Example 2: The Garage Queen.</strong> Sarah has a $50,000 luxury SUV. She pays $800 a month on her loan, but works from home and only drives 5,000 miles a year. Her depreciation is massive ($7,500), and her fixed costs are high. Her total annual cost is $18,000. Because she barely drives, her cost per mile is a staggering $3.60.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>If you want to lower your cost per mile, the absolute best strategy is to pay off your vehicle loan. Eliminating that $500/month payment instantly slashes your annual transportation budget by $6,000. Second, buy reliable vehicles that hold their value well to minimize the invisible thief of depreciation. Finally, perform preventative maintenance; skipping a $50 oil change can lead to a $5,000 engine replacement, which ruins your per-mile metrics for years.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Knowing your exact cost per mile empowers you to make hyper-rational transportation decisions. If you are considering driving for a rideshare app, you can compare your earnings against your True Cost Per Mile to see if you are actually turning a profit or just liquidating your car's equity. It also helps you accurately compare the cost of road-tripping versus flying, factoring in the true wear-and-tear on your vehicle.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-car-cost-per-mile-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
