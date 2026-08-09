"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface TCOResults {
  totalCost5Years: number;
  costPerYear: number;
  costPerMonth: number;
  costPerMile: number;
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
const calculateTCO = (inputs: typeof DEFAULTS): TCOResults => {
  const price = parseFloat(inputs.price) || 0;
  const downPayment = parseFloat(inputs.downPayment) || 0;
  const loanTerm = parseFloat(inputs.loanTerm) || 60;
  const interestRate = parseFloat(inputs.interestRate) || 0;
  const annualMiles = parseFloat(inputs.annualMiles) || 15000;
  const mpg = parseFloat(inputs.mpg) || 25;
  const gasPrice = parseFloat(inputs.gasPrice) || 3.50;
  const annualInsurance = parseFloat(inputs.annualInsurance) || 1200;
  const annualMaintenance = parseFloat(inputs.annualMaintenance) || 800;
  
  // Advanced
  const salesTaxRate = parseFloat(inputs.salesTax) / 100 || 0;
  const yearlyRegistration = parseFloat(inputs.registrationFee) || 200;
  
  if (price <= 0 || mpg <= 0 || annualMiles <= 0) {
    return {
      totalCost5Years: 0, costPerYear: 0, costPerMonth: 0, costPerMile: 0,
      breakdown: { depreciation: 0, financing: 0, taxesAndFees: 0, fuel: 0, insurance: 0, maintenance: 0 },
      isError: true, errorMsg: "Price, MPG, and Annual Miles must be greater than zero."
    };
  }

  const years = 5;

  // 1. Depreciation (Assume roughly 60% loss over 5 years for standard car)
  const depreciation = price * 0.60;

  // 2. Financing (Total Interest Paid)
  const financedAmount = price * (1 + salesTaxRate) - downPayment;
  let totalInterest = 0;
  if (interestRate > 0 && financedAmount > 0) {
    const r = (interestRate / 100) / 12;
    const monthlyPayment = financedAmount * (r * Math.pow(1 + r, loanTerm)) / (Math.pow(1 + r, loanTerm) - 1);
    const totalPaidOnLoan = monthlyPayment * loanTerm;
    totalInterest = totalPaidOnLoan - financedAmount;
  }
  // If loan term is less than 5 years, we still only paid that much interest.
  // If loan term is > 5 years, we just take the proportional interest for simplicity, 
  // though mathematically it's front-loaded. For 5-year TCO standard, we'll cap at total interest if term < 5,
  // or take 5/Term of total interest if term > 5.
  const interest5Years = loanTerm <= 60 ? totalInterest : (totalInterest * (60 / loanTerm));

  // 3. Taxes and Fees
  const salesTax = price * salesTaxRate;
  const registration5Years = yearlyRegistration * years;
  const taxesAndFees = salesTax + registration5Years;

  // 4. Fuel
  const gallonsPerYear = annualMiles / mpg;
  const fuelCost5Years = gallonsPerYear * gasPrice * years;

  // 5. Insurance
  const insurance5Years = annualInsurance * years;

  // 6. Maintenance & Repairs
  const maintenance5Years = annualMaintenance * years;

  const totalCost5Years = depreciation + interest5Years + taxesAndFees + fuelCost5Years + insurance5Years + maintenance5Years;

  return {
    totalCost5Years,
    costPerYear: totalCost5Years / 5,
    costPerMonth: totalCost5Years / 60,
    costPerMile: totalCost5Years / (annualMiles * 5),
    breakdown: {
      depreciation,
      financing: interest5Years,
      taxesAndFees,
      fuel: fuelCost5Years,
      insurance: insurance5Years,
      maintenance: maintenance5Years
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  price: "35000",
  downPayment: "5000",
  loanTerm: "60",
  interestRate: "6.5",
  annualMiles: "15000",
  mpg: "25",
  gasPrice: "3.50",
  annualInsurance: "1200",
  annualMaintenance: "800",
  // Advanced
  salesTax: "7.0",
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
export default function TotalCostOfOwnershipCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TCOResults>(calculateTCO(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateTCO(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateTCO(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const pieData = results.isError ? [] : [
    { name: "Depreciation", value: results.breakdown.depreciation, color: "#10b981" },
    { name: "Fuel", value: results.breakdown.fuel, color: "#f59e0b" },
    { name: "Insurance", value: results.breakdown.insurance, color: "#3b82f6" },
    { name: "Maintenance", value: results.breakdown.maintenance, color: "#8b5cf6" },
    { name: "Financing", value: results.breakdown.financing, color: "#ef4444" },
    { name: "Taxes & Fees", value: results.breakdown.taxesAndFees, color: "#64748b" },
  ].filter(d => d.value > 0);

  const faqs = [
    { question: "What is Total Cost of Ownership (TCO)?", answer: "TCO is the comprehensive financial estimate of the direct and indirect costs associated with owning a vehicle over a specific period, typically 5 years. It goes far beyond the sticker price or monthly loan payment." },
    { question: "Why is TCO important?", answer: "Two cars with the exact same sticker price can have vastly different TCOs. A cheap car with terrible gas mileage, high insurance rates, and rapid depreciation will ultimately cost you far more than a slightly more expensive car that holds its value and gets 40 MPG." },
    { question: "What is the biggest expense in TCO?", answer: "For almost all new and late-model used cars, depreciation is the largest expense. A new car can lose 60% of its value in the first 5 years. This 'invisible' cost is realized when you sell or trade in the vehicle." },
    { question: "Does fuel or maintenance cost more?", answer: "Usually, fuel costs more than maintenance over a 5-year period for a reliable vehicle. However, for luxury European vehicles, out-of-warranty maintenance and repairs can quickly eclipse fuel costs." },
    { question: "How can I lower my TCO?", answer: "Buy a reliable 3-year-old used car to avoid the steepest depreciation. Choose a vehicle with high MPG. Pay cash or make a large down payment to minimize financing interest. Shop around for insurance annually." },
    { question: "Is this calculator perfectly accurate?", answer: "TCO calculators are estimates. While financing, taxes, and fuel can be calculated with high precision, depreciation and maintenance are projections based on industry averages and historical data." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Total Cost of Ownership Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Cost of Ownership Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Purchase Price</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-lg">$</span>
                <input type="number" value={inputs.price} onChange={e => handleChange("price", e.target.value)} className="w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="down-payment" label="Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
              <CompactInput id="interest-rate" label="Interest Rate" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="annual-miles" label="Annual Miles" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="mi" />
              <CompactInput id="mpg" label="Vehicle MPG" value={inputs.mpg} onChange={(v: string) => handleChange("mpg", v)} suffix="mpg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="gas-price" label="Gas Price" value={inputs.gasPrice} onChange={(v: string) => handleChange("gasPrice", v)} prefix="$" suffix="/gal" />
              <CompactInput id="loan-term" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="months" />
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
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="sales-tax" label="Sales Tax" value={inputs.salesTax} onChange={(v: string) => handleChange("salesTax", v)} suffix="%" />
                  <CompactInput id="registration-fee" label="Reg. Fee / Year" value={inputs.registrationFee} onChange={(v: string) => handleChange("registrationFee", v)} prefix="$" />
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
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">5-Year True Cost to Own</div>
                  <div className="text-4xl font-bold text-primary mb-1">{formatCurrency(results.totalCost5Years)}</div>
                  <div className="text-sm text-muted-foreground">This is the total amount you will spend to own and operate this vehicle over 5 years.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cost Per Year</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.costPerYear)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cost Per Month</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.costPerMonth)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cost Per Mile</div>
                    <div className="text-lg font-bold text-primary">${results.costPerMile.toFixed(2)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">5-Year Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Depreciation</span>
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
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div> Maintenance</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.maintenance)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Financing Interest</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.financing)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#64748b]"></div> Taxes & Fees</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.taxesAndFees)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total 5-Year Cost</span>
                      <span className="text-primary">{formatCurrency(results.totalCost5Years)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Where Your Money Goes</h3>
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
                  <h3 className="text-base font-semibold text-foreground mb-3">Vehicle Usage Summary</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Miles Driven:</span><span className="font-medium">{(parseFloat(inputs.annualMiles) * 5).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Gallons Used:</span><span className="font-medium">{Math.round((parseFloat(inputs.annualMiles) * 5) / parseFloat(inputs.mpg)).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Loan Monthly Payment:</span><span className="font-medium">{
                      formatCurrency(((parseFloat(inputs.price) * (1 + parseFloat(inputs.salesTax) / 100) - parseFloat(inputs.downPayment)) * (((parseFloat(inputs.interestRate) / 100) / 12) * Math.pow(1 + ((parseFloat(inputs.interestRate) / 100) / 12), parseFloat(inputs.loanTerm)))) / (Math.pow(1 + ((parseFloat(inputs.interestRate) / 100) / 12), parseFloat(inputs.loanTerm)) - 1))
                    }</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">TCO Monthly Impact:</span><span className="font-medium text-primary">{formatCurrency(results.costPerMonth)}</span></div>
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
            <h2 className="text-2xl font-bold mb-3">What Is Total Cost of Ownership (TCO)?</h2>
            <p>Total Cost of Ownership (TCO) is the ultimate metric for understanding vehicle affordability. When buying a car, it is incredibly easy to focus solely on the sticker price or the monthly loan payment. However, these figures represent only a fraction of what the vehicle will actually cost you. TCO combines the direct costs (financing, taxes, fuel, insurance, and maintenance) with the indirect costs (depreciation) over a standard 5-year period. By calculating the TCO, you can accurately compare the long-term financial impact of different vehicles.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Our TCO algorithm breaks down the six pillars of car ownership. <strong>Depreciation</strong> is estimated at a standard 60% loss over 5 years. <strong>Financing</strong> calculates the total interest paid using the standard amortization formula <code>M = P * [r(1+r)^n] / [(1+r)^n - 1]</code>. <strong>Taxes and Fees</strong> multiply your state sales tax rate by the purchase price and add your annual registration fees. <strong>Fuel</strong> divides your total 5-year mileage by your MPG, then multiplies by the gas price. <strong>Insurance</strong> and <strong>Maintenance</strong> simply project your annual estimates over 5 years. These six pillars are summed to reveal your True Cost to Own.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The <strong>5-Year True Cost to Own</strong> is a massive number that often shocks buyers—it is not uncommon for a $35,000 car to cost $50,000+ to own over 5 years. The <strong>Cost Per Month</strong> metric is crucial; while your bank loan might be $500/month, your TCO Cost Per Month (which includes gas, insurance, and depreciation) might be $900/month. This is the true impact on your monthly budget. <strong>Cost Per Mile</strong> tells you exactly how many cents evaporate from your wallet for every mile driven.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p><strong>Depreciation</strong> is universally the largest expense for new cars. <strong>Fuel Economy (MPG)</strong> and <strong>Annual Miles</strong> work in tandem; a gas-guzzling truck driven 20,000 miles a year will have fuel costs that rival depreciation. <strong>Insurance</strong> varies wildly based on your age, driving record, and the specific vehicle model. <strong>Interest Rate</strong> and <strong>Down Payment</strong> control your financing costs; putting $0 down on a 7-year loan at 8% interest will result in devastating TCO increases.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>Under Advanced Options, you can fine-tune the mandatory state costs. <strong>Sales Tax</strong> is a major upfront cost that is often rolled into the loan, meaning you pay interest on your taxes. <strong>Registration Fee / Year</strong> accounts for states that charge exorbitant yearly fees based on the vehicle's value or weight. Accurate local inputs here will make your final TCO projection significantly more reliable.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Cheap Gas Guzzler.</strong> You buy a used V8 truck for $25,000. It seems affordable. However, it gets 14 MPG, and you drive 18,000 miles a year. Over 5 years, you spend $22,500 on gas alone, plus higher maintenance and insurance. Your 5-year TCO exceeds $55,000.</p>
            <p><strong>Example 2: The Expensive Hybrid.</strong> You buy a new hybrid sedan for $35,000. It feels expensive upfront. But it gets 50 MPG. Over 5 years, you only spend $6,300 on gas, maintenance is minimal, and insurance is cheap. Your 5-year TCO is $48,000. The "expensive" car is actually $7,000 cheaper to own over 5 years.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>To drastically lower your TCO, buy a slightly used car (3 years old) to avoid the 40% initial depreciation hit. Pay in cash or use a large down payment to eliminate financing interest. Research insurance rates for specific models <em>before</em> buying; sports cars and commonly stolen vehicles carry massive premiums. Finally, consider a hybrid or EV if you commute long distances, as the fuel savings will rapidly offset a higher purchase price.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using a Total Cost of Ownership Calculator protects you from buying a vehicle that will slowly drain your bank account. It shifts your perspective from short-term payment thinking to long-term wealth preservation. By understanding the true financial footprint of a vehicle, you can confidently choose a car that fits both your lifestyle and your long-term financial goals.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-cost-of-ownership-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
