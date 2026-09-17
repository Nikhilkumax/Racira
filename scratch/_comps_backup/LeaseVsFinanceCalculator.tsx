"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Key, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface LeaseVsBuyResults {
  recommendation: string;
  recommendationReason: string;
  leaseTotalCost: number;
  buyTotalCost: number;
  buyNetCost: number; // Cost minus equity
  buyEquity: number;
  leaseMonthly: number;
  buyMonthly: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateLeaseVsBuy = (inputs: typeof DEFAULTS): LeaseVsBuyResults => {
  const carPrice = parseFloat(inputs.carPrice) || 0;
  const downPayment = parseFloat(inputs.downPayment) || 0;
  
  // Finance
  const loanTerm = parseFloat(inputs.loanTerm) || 0;
  const loanRate = parseFloat(inputs.loanRate) / 100 / 12 || 0;
  
  // Lease
  const leaseTerm = parseFloat(inputs.leaseTerm) || 0;
  // Money factor is roughly APR / 2400
  const moneyFactor = parseFloat(inputs.moneyFactor) || 0;
  const residualValuePct = parseFloat(inputs.residualValuePct) / 100 || 0;
  
  // Advanced
  const salesTaxRate = parseFloat(inputs.salesTaxRate) / 100 || 0;
  const leaseFees = parseFloat(inputs.leaseFees) || 0;

  if (carPrice <= 0 || loanTerm <= 0 || leaseTerm <= 0) {
    return {
      recommendation: "", recommendationReason: "",
      leaseTotalCost: 0, buyTotalCost: 0, buyNetCost: 0, buyEquity: 0, leaseMonthly: 0, buyMonthly: 0,
      chartData: [], isError: true, errorMsg: "Car price and terms must be greater than zero."
    };
  }

  // --- BUY CALCULATIONS ---
  // Tax is usually applied to the full purchase price when buying
  const totalBuyAmount = carPrice + (carPrice * salesTaxRate);
  const loanPrincipal = totalBuyAmount - downPayment;
  
  let buyMonthly = 0;
  if (loanRate > 0) {
    buyMonthly = (loanPrincipal * loanRate) / (1 - Math.pow(1 + loanRate, -loanTerm));
  } else {
    buyMonthly = loanPrincipal / loanTerm;
  }
  
  // Total out of pocket for buying (over the lease term duration for apples-to-apples)
  // Or over the whole term? We must compare them over the SAME time horizon.
  // The standard is to compare them at the end of the LEASE term.
  const comparisonMonths = leaseTerm;
  
  // Calculate remaining loan balance at end of lease term
  let remainingLoanBalance = 0;
  if (loanRate > 0) {
    remainingLoanBalance = loanPrincipal * (Math.pow(1 + loanRate, comparisonMonths) - (Math.pow(1 + loanRate, comparisonMonths) - 1) / ((1 + loanRate) - 1) * loanRate);
    // actually standard formula for remaining balance:
    remainingLoanBalance = loanPrincipal * Math.pow(1 + loanRate, comparisonMonths) - (buyMonthly / loanRate) * (Math.pow(1 + loanRate, comparisonMonths) - 1);
  } else {
    remainingLoanBalance = Math.max(0, loanPrincipal - (buyMonthly * comparisonMonths));
  }
  
  const residualValueActual = carPrice * residualValuePct;
  const buyEquity = Math.max(0, residualValueActual - remainingLoanBalance);
  
  const buyTotalCostAtComparison = downPayment + (buyMonthly * comparisonMonths);
  const buyNetCost = buyTotalCostAtComparison - buyEquity; // True cost of ownership

  // --- LEASE CALCULATIONS ---
  // Depreciation fee
  const capitalizedCost = carPrice - downPayment; // Capitalized cost reduction
  const depreciationFee = (capitalizedCost - residualValueActual) / leaseTerm;
  
  // Finance fee
  const financeFee = (capitalizedCost + residualValueActual) * moneyFactor;
  
  // Base monthly lease
  const baseMonthlyLease = depreciationFee + financeFee;
  
  // Lease Tax (Taxed on the monthly payment in most states)
  const leaseMonthly = baseMonthlyLease * (1 + salesTaxRate);
  
  const leaseTotalCost = downPayment + leaseFees + (leaseMonthly * leaseTerm);

  // --- RECOMMENDATION ---
  let recommendation = "";
  let recommendationReason = "";
  if (buyNetCost < leaseTotalCost) {
    recommendation = "Buy / Finance";
    recommendationReason = `Buying builds equity. After ${leaseTerm} months, your net cost to buy is lower than leasing by $${(leaseTotalCost - buyNetCost).toLocaleString(undefined, {maximumFractionDigits:0})}.`;
  } else {
    recommendation = "Lease";
    recommendationReason = `Leasing is cheaper over ${leaseTerm} months. The heavy depreciation and loan interest make buying more expensive in the short term.`;
  }

  // --- CHART DATA ---
  // Generate cumulative cost month by month up to the comparison point
  const chartData = [];
  let cumLease = downPayment + leaseFees;
  let cumBuy = downPayment; // Not including tax upfront if it's rolled into loan, wait, tax is in loan
  
  for (let m = 0; m <= comparisonMonths; m++) {
    if (m > 0) {
      cumLease += leaseMonthly;
      cumBuy += buyMonthly;
    }
    
    // Calculate equity for the buy line to show NET cost
    let mLoanBalance = 0;
    if (loanRate > 0) {
      mLoanBalance = loanPrincipal * Math.pow(1 + loanRate, m) - (buyMonthly / loanRate) * (Math.pow(1 + loanRate, m) - 1);
    } else {
      mLoanBalance = Math.max(0, loanPrincipal - (buyMonthly * m));
    }
    // Approximate depreciation over time (straight line from car price to residual value)
    const mValue = carPrice - ((carPrice - residualValueActual) * (m / leaseTerm));
    const mEquity = Math.max(0, mValue - mLoanBalance);
    
    const mNetBuyCost = cumBuy - mEquity;

    chartData.push({
      month: m,
      "Lease Total Cost": cumLease,
      "Buy Net Cost": mNetBuyCost
    });
  }

  return {
    recommendation,
    recommendationReason,
    leaseTotalCost,
    buyTotalCost: buyTotalCostAtComparison,
    buyNetCost,
    buyEquity,
    leaseMonthly,
    buyMonthly,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  carPrice: "35000",
  downPayment: "3000",
  loanTerm: "60",
  loanRate: "6.5",
  leaseTerm: "36",
  moneyFactor: "0.0025", // roughly 6% APR
  residualValuePct: "55", // 55% of original value after 36 months
  // Advanced
  salesTaxRate: "7.0",
  leaseFees: "695" // Acquisition / Disposition fees
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
export default function LeaseVsFinanceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<LeaseVsBuyResults>(calculateLeaseVsBuy(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateLeaseVsBuy(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateLeaseVsBuy(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "What is a Money Factor?", answer: "In leasing, the interest rate is expressed as a 'Money Factor'. To convert a money factor to a standard APR percentage, multiply it by 2,400. For example, a money factor of 0.0025 equals an APR of roughly 6.0%." },
    { question: "What is Residual Value?", answer: "Residual Value is the estimated worth of the vehicle at the end of the lease term, set by the leasing bank. It is usually expressed as a percentage of the MSRP. If a $35,000 car has a 55% residual value after 36 months, the bank estimates it will be worth $19,250. You only pay for the depreciation ($35,000 - $19,250) during the lease." },
    { question: "Why do you compare 'Net Cost' for buying?", answer: "When you buy a car, your monthly payments are higher than leasing. However, at the end of 36 months, you own a significant chunk of the car's equity. To accurately compare leasing vs buying, we must subtract the equity you built from the total cash you paid. This reveals the true 'Net Cost' of ownership." },
    { question: "Is leasing a waste of money?", answer: "Not necessarily. If you trade in your financed cars every 3 years anyway, leasing is often cheaper mathematically because you avoid taking the massive upfront hit on full sales tax (in most states) and you aren't paying interest on the entire value of the car. However, if you keep your cars for 7-10 years, buying is vastly cheaper." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Lease vs Finance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lease vs Finance Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Vehicle Price (MSRP)" value={inputs.carPrice} onChange={(v: string) => handleChange("carPrice", v)} prefix="$" />
              <CompactInput id="down" label="Cash Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3 text-emerald-600 dark:text-emerald-500">Finance Details</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan-term" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="mos" />
              <CompactInput id="loan-rate" label="Interest Rate (APR)" value={inputs.loanRate} onChange={(v: string) => handleChange("loanRate", v)} suffix="%" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3 text-blue-600 dark:text-blue-500">Lease Details</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="lease-term" label="Lease Term" value={inputs.leaseTerm} onChange={(v: string) => handleChange("leaseTerm", v)} suffix="mos" />
              <CompactInput id="residual" label="Residual Value" value={inputs.residualValuePct} onChange={(v: string) => handleChange("residualValuePct", v)} suffix="%" tooltip="Percentage of MSRP the car is worth at end of lease." />
            </div>
            <div className="grid grid-cols-1 mt-1">
              <CompactInput id="money-factor" label="Money Factor" value={inputs.moneyFactor} onChange={(v: string) => handleChange("moneyFactor", v)} type="number" tooltip="Multiply by 2400 to get the APR percentage." />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Taxes & Fees) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="col-span-2 text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Taxes & Lease Fees</div>
                  <CompactInput id="tax" label="Sales Tax Rate" value={inputs.salesTaxRate} onChange={(v: string) => handleChange("salesTaxRate", v)} suffix="%" />
                  <CompactInput id="fees" label="Lease Acq. Fees" value={inputs.leaseFees} onChange={(v: string) => handleChange("leaseFees", v)} prefix="$" />
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
                <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Mathematical Recommendation</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {results.recommendation}
                  </div>
                  <div className="text-sm text-foreground">{results.recommendationReason}</div>
                </div>

                {/* 2. Side by Side Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {/* FINANCE CARD */}
                  <div className="bg-card border-2 border-emerald-500/20 rounded-lg p-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-bl-lg">BUY</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Monthly Payment</div>
                    <div className="text-3xl font-bold text-foreground mb-4">{formatCurrency(results.buyMonthly)}</div>
                    
                    <div className="space-y-2 text-sm border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash Spent ({inputs.leaseTerm} mo)</span>
                        <span className="font-semibold">{formatCurrency(results.buyTotalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equity Built</span>
                        <span className="font-semibold text-emerald-500">-{formatCurrency(results.buyEquity)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-border/50 pt-2">
                        <span>True Net Cost</span>
                        <span>{formatCurrency(results.buyNetCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* LEASE CARD */}
                  <div className="bg-card border-2 border-blue-500/20 rounded-lg p-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-bl-lg">LEASE</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Monthly Payment</div>
                    <div className="text-3xl font-bold text-foreground mb-4">{formatCurrency(results.leaseMonthly)}</div>
                    
                    <div className="space-y-2 text-sm border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash Spent ({inputs.leaseTerm} mo)</span>
                        <span className="font-semibold">{formatCurrency(results.leaseTotalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equity Built</span>
                        <span className="font-semibold text-muted-foreground">$0</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-border/50 pt-2">
                        <span>True Net Cost</span>
                        <span>{formatCurrency(results.leaseTotalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cumulative Net Cost Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `Mo ${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={[0, 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [formatCurrency(value), name]}
                          labelFormatter={(label) => `Month ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', marginTop: '10px' }} />
                        <Line type="monotone" dataKey="Lease Total Cost" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="Buy Net Cost" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">Notice how the "Buy Net Cost" drops over time as you build equity in the vehicle, while Lease costs climb linearly.</p>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Should You Lease or Finance Your Next Car?</h2>
            <p>The decision to lease or finance a vehicle is one of the most hotly debated topics in personal finance. A Lease vs Finance Calculator objectively compares the true cost of both options by analyzing monthly payments, interest rates, taxes, depreciation, and the equity you build. By projecting these variables over the exact same time horizon (typically 36 months), you can see mathematically which option drains less cash from your net worth.</p>

            <h2 className="text-2xl font-bold mb-3">How Financing Works (Buying)</h2>
            <p>When you finance a car, you are taking out a loan to purchase the entire asset. Your monthly payments are generally higher than a lease because you are paying off the full MSRP of the car plus interest. However, every time you make a payment, a portion goes toward the principal balance, building <strong>Equity</strong>. At the end of 36 months, you might have paid $25,000 in cash, but the car is still worth $20,000 and you only owe $10,000 to the bank. That $10,000 in positive equity acts like a savings account, heavily reducing your true <strong>Net Cost</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">How Leasing Works</h2>
            <p>Leasing is essentially renting a car long-term. You are not buying the car; you are only paying for the amount of value the car loses (depreciation) while you drive it. This is why lease payments are almost always cheaper than finance payments. At the end of the 36-month lease, you hand the keys back to the dealer. You have paid $15,000 in cash over three years, but you have $0 in equity. Your Net Cost is exactly equal to the cash you spent.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Variables</h2>
            <ul>
              <li><strong>Money Factor:</strong> This is the interest rate of a lease. Dealerships express it as a tiny decimal to confuse buyers. Multiply the Money Factor by 2,400 to find the true APR percentage.</li>
              <li><strong>Residual Value:</strong> The estimated value of the car at the end of the lease. A car with a high residual value (like a Toyota Tacoma) will have incredibly cheap lease payments because you are paying for very little depreciation.</li>
              <li><strong>Lease Fees:</strong> Leasing involves hidden acquisition fees upfront and disposition fees at the end. These are factored into our Total Cost calculations.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">When Does Leasing Make Sense?</h2>
            <p>Mathematically, buying a car and keeping it for 10 years is always the cheapest option. However, if you are someone who trades in your car for a brand new model every 3 years regardless of logic, leasing is actually cheaper. When you buy and trade in every 3 years, you absorb the massive initial depreciation hit and you pay full sales tax on the entire vehicle multiple times. Leasing shields you from fluctuating used-car markets and limits your sales tax exposure.</p>

            <h2 className="text-2xl font-bold mb-3">When Does Financing Make Sense?</h2>
            <p>If you drive more than 15,000 miles a year, you must buy. Leases come with strict mileage limits, and the penalties for going over (often $0.25 per mile) will destroy any financial benefit the lease offered. Furthermore, if you plan to keep the car long after it is paid off, financing is the undisputed winner. Once the loan is gone, your monthly payment drops to $0, allowing you to maximize the value of the asset.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lease-vs-finance-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
