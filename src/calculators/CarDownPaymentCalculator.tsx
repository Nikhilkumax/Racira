"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, PiggyBank, RotateCcw, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface DownPaymentResults {
  adjustedMonthlyPayment: number;
  zeroDownMonthlyPayment: number;
  monthlySavings: number;
  totalInterestSavings: number;
  recommendedDownPayment: number;
  newLoanBalance: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDownPayment = (inputs: typeof DEFAULTS): DownPaymentResults => {
  const carPrice = parseFloat(inputs.carPrice) || 0;
  const downPaymentInput = parseFloat(inputs.downPayment) || 0;
  const isDownPaymentPct = inputs.downPaymentType === "percent";
  const tradeIn = parseFloat(inputs.tradeIn) || 0;
  const loanTerm = parseFloat(inputs.loanTerm) || 0;
  const interestRate = parseFloat(inputs.interestRate) || 0;
  
  // Advanced
  const salesTaxRate = parseFloat(inputs.salesTaxRate) / 100 || 0;

  if (carPrice <= 0 || loanTerm <= 0) {
    return {
      adjustedMonthlyPayment: 0, zeroDownMonthlyPayment: 0, monthlySavings: 0,
      totalInterestSavings: 0, recommendedDownPayment: 0, newLoanBalance: 0,
      chartData: [], isError: true, errorMsg: "Car price and loan term must be greater than zero."
    };
  }

  // Calculate actual down payment dollars
  let actualDownPayment = isDownPaymentPct ? carPrice * (downPaymentInput / 100) : downPaymentInput;
  
  // Recommended is 20%
  const recommendedDownPayment = carPrice * 0.20;

  // Calculate Tax
  const taxableAmount = Math.max(0, carPrice - tradeIn);
  const taxAmount = taxableAmount * salesTaxRate;
  const totalOutTheDoor = carPrice + taxAmount;

  const calculateLoan = (downPayDollars: number) => {
    const principal = Math.max(0, totalOutTheDoor - downPayDollars - tradeIn);
    const r = interestRate / 100 / 12;
    const n = loanTerm;
    
    let payment = 0;
    if (r > 0) {
      payment = (principal * r) / (1 - Math.pow(1 + r, -n));
    } else {
      payment = principal / n;
    }
    
    const totalInterest = (payment * n) - principal;
    return { principal, payment, totalInterest };
  };

  const currentLoan = calculateLoan(actualDownPayment);
  const zeroDownLoan = calculateLoan(0);
  
  const tenPercentDownLoan = calculateLoan(carPrice * 0.10);
  const twentyPercentDownLoan = calculateLoan(carPrice * 0.20);
  const thirtyPercentDownLoan = calculateLoan(carPrice * 0.30);

  const monthlySavings = zeroDownLoan.payment - currentLoan.payment;
  const totalInterestSavings = zeroDownLoan.totalInterest - currentLoan.totalInterest;

  const chartData = [
    { name: "0% Down", payment: zeroDownLoan.payment, isCurrent: actualDownPayment === 0 },
    { name: "10% Down", payment: tenPercentDownLoan.payment, isCurrent: Math.abs(actualDownPayment - carPrice*0.1) < 100 },
    { name: "Your Down Pmt", payment: currentLoan.payment, isCurrent: true },
    { name: "20% Down", payment: twentyPercentDownLoan.payment, isCurrent: Math.abs(actualDownPayment - carPrice*0.2) < 100 },
    { name: "30% Down", payment: thirtyPercentDownLoan.payment, isCurrent: Math.abs(actualDownPayment - carPrice*0.3) < 100 },
  ];

  // Deduplicate "Your Down Pmt" if it matches exactly to an existing bar
  const filteredChartData = chartData.filter((d, index, self) => {
    if (d.name === "Your Down Pmt") {
      // Don't show if it's too close to 0%, 10%, 20%, or 30%
      const isDuplicate = self.some(s => s.name !== "Your Down Pmt" && Math.abs(s.payment - d.payment) < 5);
      return !isDuplicate;
    }
    return true;
  }).sort((a, b) => b.payment - a.payment);

  return {
    adjustedMonthlyPayment: currentLoan.payment,
    zeroDownMonthlyPayment: zeroDownLoan.payment,
    monthlySavings,
    totalInterestSavings,
    recommendedDownPayment,
    newLoanBalance: currentLoan.principal,
    chartData: filteredChartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  carPrice: "35000",
  downPaymentType: "percent", // 'dollars' or 'percent'
  downPayment: "15", 
  tradeIn: "0",
  loanTerm: "60",
  interestRate: "7.5",
  // Advanced
  salesTaxRate: "7.0",
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
export default function CarDownPaymentCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DownPaymentResults>(calculateDownPayment(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateDownPayment(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDownPayment(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "Why is a 20% down payment recommended?", answer: "Cars are depreciating assets that lose roughly 10-15% of their value the moment you drive them off the lot, and another 10% by the end of the first year. A 20% down payment acts as an equity buffer. It guarantees that you will never owe the bank more money than the car is worth (being 'underwater')." },
    { question: "Does a trade-in count as a down payment?", answer: "Yes. Any positive equity in your trade-in is applied directly to the purchase of the new car, functioning exactly like a cash down payment. Furthermore, in most states, trading in a car reduces your sales tax liability, providing an additional financial benefit." },
    { question: "Is $0 down a bad idea?", answer: "Generally, yes. If you put $0 down, you are financing the entire price of the car plus sales tax and fees. Because of depreciation, you will immediately be deeply underwater on the loan. If the car is totaled a month later, your insurance will only pay the market value of the car, and you will be forced to pay the bank the remaining thousands of dollars out of pocket to close the loan." },
    { question: "How does a down payment affect interest?", answer: "A down payment reduces the total principal amount of your loan. Because interest is calculated as a percentage of the principal balance, borrowing less money means you pay significantly less interest over the life of the loan. Some lenders also offer lower interest rates to buyers who bring substantial down payments because they represent less risk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Down Payment Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Down Payment Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="price" label="Vehicle Price" value={inputs.carPrice} onChange={(v: string) => handleChange("carPrice", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1">Down Payment Type</label>
                <div className="flex bg-muted/50 p-1 rounded-md border border-border h-9">
                  <button type="button" onClick={() => handleChange("downPaymentType", "percent")} className={`flex-1 text-xs font-semibold rounded ${inputs.downPaymentType === "percent" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Percent (%)</button>
                  <button type="button" onClick={() => handleChange("downPaymentType", "dollars")} className={`flex-1 text-xs font-semibold rounded ${inputs.downPaymentType === "dollars" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Dollars ($)</button>
                </div>
              </div>
              <CompactInput id="down" label="Down Payment Amount" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix={inputs.downPaymentType === "dollars" ? "$" : undefined} suffix={inputs.downPaymentType === "percent" ? "%" : undefined} />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3 text-emerald-600 dark:text-emerald-500">Loan & Trade Details</div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="trade" label="Trade-in Equity" value={inputs.tradeIn} onChange={(v: string) => handleChange("tradeIn", v)} prefix="$" tooltip="Net value of trade-in (after paying off its loan)" />
              <CompactInput id="term" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="mos" options={[
                { label: "36 Months (3 Yrs)", value: "36" },
                { label: "48 Months (4 Yrs)", value: "48" },
                { label: "60 Months (5 Yrs)", value: "60" },
                { label: "72 Months (6 Yrs)", value: "72" },
                { label: "84 Months (7 Yrs)", value: "84" }
              ]} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate (APR)" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Taxes) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="State Sales Tax Rate" value={inputs.salesTaxRate} onChange={(v: string) => handleChange("salesTaxRate", v)} suffix="%" />
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">New Monthly Payment</div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className="text-5xl font-bold text-primary">{formatCurrency(results.adjustedMonthlyPayment)}</div>
                    <div className="text-xl font-medium text-muted-foreground mb-1">/ mo</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-500 font-medium">
                    <TrendingDown className="h-4 w-4" />
                    Drops {formatCurrency(results.monthlySavings)}/mo compared to zero down.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-card border-2 border-emerald-500/20 rounded-lg p-4 text-center relative overflow-hidden shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Interest Saved</div>
                    <div className="text-2xl font-bold text-emerald-500">{formatCurrency(results.totalInterestSavings)}</div>
                    <div className="text-xs text-muted-foreground mt-1">vs $0 down payment</div>
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">New Loan Balance</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(results.newLoanBalance)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Amount actually financed</div>
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Recommended (20%)</div>
                    <div className="text-2xl font-bold text-blue-500">{formatCurrency(results.recommendedDownPayment)}</div>
                    <div className="text-xs text-muted-foreground mt-1">To avoid negative equity</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Payment Impact by Down Payment</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `$${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} width={90} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="payment" radius={[0, 4, 4, 0]} maxBarSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isCurrent ? "hsl(var(--primary))" : "hsl(var(--primary)/0.3)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
            <h2>Why Use a Car Down Payment Calculator?</h2>
            <p>A Car Down Payment Calculator allows you to visualize the direct mathematical impact of bringing cash to the closing table. Many buyers fixate entirely on the monthly payment negotiated at the dealership without realizing the massive downstream effects of a down payment. Dropping cash upfront doesn't just lower your monthly bill; it drastically reduces the total amount of interest you will pay to the bank over the life of the loan.</p>

            <h2>The 20% Down Payment Rule</h2>
            <p>Financial experts universally recommend a 20% down payment when purchasing a new car. Why 20%? Vehicles are heavily depreciating assets. A new car loses roughly 10% of its value the second you drive it off the lot, and another 10% by the end of its first year. If you finance the entire car ($0 down), you will immediately be "underwater" (owing more than the car is worth). A 20% down payment acts as a protective equity buffer. It ensures that if you are in a crash and the car is totaled, the insurance payout will cover your remaining loan balance.</p>

            <h2>How Down Payments Attack Interest</h2>
            <p>Interest is calculated as a percentage of your principal balance. By making a large down payment, you slash the principal balance before the interest meter even starts ticking. For example, if you finance a $40,000 car at 8% over 60 months with $0 down, you will pay over $8,600 in pure interest. If you put 20% down ($8,000), your total interest drops to $6,900. Your $8,000 upfront investment just yielded a guaranteed return of $1,700 in saved interest.</p>

            <h2>Trading In vs. Cash Down</h2>
            <p>A trade-in vehicle acts identically to a cash down payment. If you own a car outright that is worth $10,000, that $10,000 is applied directly against the principal of the new car. Even better, in most states, trading in a vehicle reduces your sales tax burden. If you buy a $30,000 car and trade in a $10,000 car, you are only taxed on the $20,000 difference. This double-benefit makes trade-ins an incredibly powerful form of down payment.</p>

            <h2>Should You Empty Your Savings?</h2>
            <p>While a large down payment is mathematically optimal, it shouldn't come at the cost of your emergency fund. If putting 20% down drains your entire bank account, it is a bad move. You are transferring liquid cash into an illiquid, depreciating asset. If an emergency strikes, you cannot easily extract cash from a car. Aim for the 20% mark, but ensure you retain 3 to 6 months of living expenses in a high-yield savings account.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-down-payment-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
