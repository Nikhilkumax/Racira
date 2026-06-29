"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface CarAffordabilityResults {
  maxPurchasePrice: number;
  totalFinanced: number;
  totalInterest: number;
  salesTaxAmount: number;
  totalCost: number;
  monthlyPayment: number;
  isError: boolean;
  errorMsg?: string;
  monthlyRows: { label: string; value: number }[];
}

// 2. Pure calculation function
const calculateCarAffordability = (inputs: typeof DEFAULTS): CarAffordabilityResults => {
  const budget = parseFloat(inputs.budget) || 0;
  const downPayment = parseFloat(inputs.downPayment) || 0;
  const tradeIn = parseFloat(inputs.tradeIn) || 0;
  const term = parseFloat(inputs.term) || 1;
  const rate = parseFloat(inputs.rate) || 0;
  const taxRate = parseFloat(inputs.tax) / 100 || 0;
  const amountOwed = parseFloat(inputs.amountOwed) || 0;
  const fees = parseFloat(inputs.fees) || 0;

  if (budget <= 0 || term <= 0) {
    return {
      maxPurchasePrice: 0, totalFinanced: 0, totalInterest: 0, salesTaxAmount: 0, totalCost: 0,
      monthlyPayment: 0, isError: true, errorMsg: "Budget and Term must be greater than zero.",
      monthlyRows: []
    };
  }

  const netTradeIn = tradeIn - amountOwed;
  const upfrontCash = downPayment + netTradeIn;

  let maxLoanAmount = 0;
  if (rate === 0) {
    maxLoanAmount = budget * term;
  } else {
    const r = (rate / 100) / 12;
    maxLoanAmount = budget * ((Math.pow(1 + r, term) - 1) / (r * Math.pow(1 + r, term)));
  }

  const totalBuyingPower = maxLoanAmount + upfrontCash - fees;
  const maxPurchasePrice = totalBuyingPower / (1 + taxRate);
  const salesTaxAmount = maxPurchasePrice * taxRate;
  
  if (maxLoanAmount < 0 || maxPurchasePrice < 0) {
    return {
      maxPurchasePrice: 0, totalFinanced: 0, totalInterest: 0, salesTaxAmount: 0, totalCost: 0,
      monthlyPayment: 0, isError: true, errorMsg: "Budget is not enough to cover negative equity on the trade-in or fees.",
      monthlyRows: []
    };
  }

  const financedAmount = (maxPurchasePrice + salesTaxAmount + fees) - upfrontCash;
  let totalInterest = 0;
  if (rate > 0) {
    const totalPaid = budget * term;
    totalInterest = totalPaid - financedAmount;
  }
  
  const totalCost = maxPurchasePrice + salesTaxAmount + fees + totalInterest;

  return {
    maxPurchasePrice,
    totalFinanced: financedAmount,
    totalInterest,
    salesTaxAmount,
    totalCost,
    monthlyPayment: budget,
    isError: false,
    monthlyRows: [
      { label: "Purchase Price", value: maxPurchasePrice },
      { label: "Sales Tax", value: salesTaxAmount },
      { label: "Title & Fees", value: fees },
      { label: "Down Payment", value: -downPayment },
      { label: "Net Trade-In", value: -netTradeIn },
      { label: "Total Financed", value: financedAmount },
      { label: "Total Interest Paid", value: totalInterest },
    ]
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  budget: "450",
  downPayment: "3000",
  tradeIn: "5000",
  term: "60",
  rate: "6.5",
  tax: "7.0",
  amountOwed: "0",
  fees: "500"
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
export default function CarAffordabilityCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<CarAffordabilityResults>(calculateCarAffordability(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateCarAffordability(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateCarAffordability(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const pieData = [
    { name: "Vehicle Price", value: results.maxPurchasePrice, color: "#10b981" },
    { name: "Interest", value: results.totalInterest, color: "#f59e0b" },
    { name: "Sales Tax", value: results.salesTaxAmount, color: "#ef4444" },
    { name: "Fees", value: parseFloat(inputs.fees) || 0, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const faqs = [
    { question: "What is the 20/4/10 rule?", answer: "The 20/4/10 rule states you should put down at least 20%, finance for no more than 4 years (48 months), and keep total vehicle expenses under 10% of gross income." },
    { question: "Should I focus on the monthly payment or total price?", answer: "Always focus on the total out-the-door price. Dealers can easily manipulate loan terms to match your desired monthly payment while increasing the total cost through higher interest." },
    { question: "What does rolling over negative equity mean?", answer: "If you owe more on your trade-in than it's worth, the difference (negative equity) is added to your new loan. You end up paying interest on a car you no longer own." },
    { question: "Are taxes included in the loan?", answer: "Yes, dealerships often roll state sales tax, registration, and documentation fees into the loan. This calculator accounts for that by reducing your maximum purchase price." },
    { question: "Why is a 72-month loan dangerous?", answer: "Cars depreciate rapidly. With a 72-month (6-year) loan, you will likely owe more than the car is worth for the first 4-5 years, making it difficult to sell or trade in." },
    { question: "Does my credit score affect car affordability?", answer: "Absolutely. A higher credit score qualifies you for a lower interest rate, which means more of your monthly payment goes toward the actual car rather than interest." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Affordability Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Affordability Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Target Monthly Payment</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-lg">$</span>
                <input type="number" value={inputs.budget} onChange={e => handleChange("budget", e.target.value)} className="w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="down-payment" label="Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
              <CompactInput id="trade-in" label="Trade-In Value" value={inputs.tradeIn} onChange={(v: string) => handleChange("tradeIn", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={inputs.term} onChange={(v: string) => handleChange("term", v)} options={[
                { label: "36 Months (3 yrs)", value: "36" },
                { label: "48 Months (4 yrs)", value: "48" },
                { label: "60 Months (5 yrs)", value: "60" },
                { label: "72 Months (6 yrs)", value: "72" },
                { label: "84 Months (7 yrs)", value: "84" }
              ]} />
              <CompactInput id="rate" label="Interest Rate" value={inputs.rate} onChange={(v: string) => handleChange("rate", v)} suffix="%" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="Sales Tax" value={inputs.tax} onChange={(v: string) => handleChange("tax", v)} suffix="%" />
                  <CompactInput id="fees" label="Title & Fees" value={inputs.fees} onChange={(v: string) => handleChange("fees", v)} prefix="$" />
                  <CompactInput id="amount-owed" label="Amount Owed on Trade" value={inputs.amountOwed} onChange={(v: string) => handleChange("amountOwed", v)} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Max Purchase Price</div>
                  <div className="text-4xl font-bold text-primary mb-1">{formatCurrency(results.maxPurchasePrice)}</div>
                  <div className="text-sm text-muted-foreground">This is the maximum sticker price you can afford.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Financed</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.totalFinanced)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-500">{formatCurrency(results.totalInterest)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Sales Tax</div>
                    <div className="text-lg font-bold text-red-500">{formatCurrency(results.salesTaxAmount)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Purchase Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    {results.monthlyRows.map((row, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">
                          {row.value < 0 ? "-" : ""}{formatCurrency(Math.abs(row.value))}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Cost of Vehicle</span>
                      <span className="text-primary">{formatCurrency(results.totalCost)}</span>
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
                  <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Monthly Payment:</span><span className="font-medium">{formatCurrency(results.monthlyPayment)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Months:</span><span className="font-medium">{inputs.term}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Paid:</span><span className="font-medium">{formatCurrency(results.monthlyPayment * parseFloat(inputs.term))}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Interest Rate:</span><span className="font-medium">{inputs.rate}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Sales Tax Rate:</span><span className="font-medium">{inputs.tax}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Cash Down:</span><span className="font-medium">{formatCurrency(parseFloat(inputs.downPayment) || 0)}</span></div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 font-bold text-primary">
                    <span>Effective Total Cost</span>
                    <span>{formatCurrency(results.totalCost)}</span>
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
            <h2>What Is a Car Affordability Calculator?</h2>
            <p>A Car Affordability Calculator is an essential financial tool designed to help you determine exactly how much car you can afford based on your monthly budget, rather than getting tricked into a predatory loan at the dealership. Dealerships often manipulate the loan term to match a specific monthly payment, which can result in you paying thousands more in interest. By calculating your maximum purchase price beforehand, you can shop with confidence and negotiate strictly on the out-the-door price of the vehicle. This tool is perfect for anyone looking to finance a new or used vehicle while adhering to a strict monthly budget.</p>

            <h2>How It Works</h2>
            <p>Our calculator reverses the standard loan amortization formula. The standard formula is <code>M = P * [r(1+r)^n] / [(1+r)^n - 1]</code>, where M is the monthly payment, P is the principal, r is the monthly interest rate, and n is the number of months. By reversing this, we solve for P (the principal): <code>P = M * [(1+r)^n - 1] / [r(1+r)^n]</code>. This calculates the maximum loan amount you can afford. We then add your upfront cash (down payment plus net trade-in value) and subtract any fees. Finally, we account for state sales tax by dividing this total buying power by <code>1 + Tax Rate</code> to find the maximum sticker price you should negotiate.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Maximum Purchase Price</strong> is the absolute highest sticker price you can agree to at the dealership without exceeding your budget. The <strong>Total Financed</strong> represents the actual loan you will take out from the bank, which includes the car price, taxes, and fees, minus your down payment and trade-in. The <strong>Total Interest</strong> shows the cost of borrowing this money over the loan term. Minimizing this number should be a key financial goal. <strong>Sales Tax</strong> is the mandatory state tax calculated on the vehicle price, which is often rolled into the loan if not paid in cash.</p>

            <h2>Key Factors</h2>
            <p>Several inputs heavily influence your buying power. <strong>Monthly Budget</strong> is your starting point; be realistic and ensure it doesn't exceed 10% of your gross income. <strong>Interest Rate</strong> depends on your credit score; excellent credit can secure rates below 5%, while poor credit can push rates above 15%, drastically reducing affordability. <strong>Loan Term</strong> is crucial; while a 72-month loan increases buying power, it also increases total interest and the risk of negative equity. <strong>Down Payment</strong> and <strong>Trade-In Value</strong> add directly to your buying power dollar-for-dollar, shielding you from financing taxes and fees.</p>

            <h2>Advanced Features</h2>
            <p>By toggling the Advanced Options, you can include real-world hidden costs that dealerships love to sneak in. <strong>State Sales Tax</strong> varies wildly by state and can easily add thousands to the final price. <strong>Title & Registration Fees</strong> are mandatory state fees, plus the dealer's documentation fee. Most importantly, the <strong>Amount Owed on Trade</strong> field handles negative equity. If you owe more on your trade-in than the dealer offers, this deficit is rolled into your new loan, which immediately and severely reduces how much new car you can afford.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Responsible Buyer.</strong> Sarah wants to spend $400/month. She has $5,000 to put down and excellent credit (5% interest for 48 months). Sales tax is 6%. Her maximum purchase price is roughly $20,800. She will pay about $2,000 in interest.</p>
            <p><strong>Example 2: The Negative Equity Trap.</strong> John wants to spend $400/month. He has no down payment and wants to trade in a car worth $10,000, but he still owes $13,000 on it. With a 7% interest rate for 60 months, his maximum purchase price plummets to just $16,000, because $3,000 of his buying power is immediately consumed by paying off his old loan.</p>

            <h2>Tips & Best Practices</h2>
            <p>Never negotiate a car based on the monthly payment. Always negotiate the total out-the-door price. Aim for a loan term of 48 months or less; anything longer means you are paying interest on a rapidly depreciating asset and will likely be underwater on the loan. Try to put down at least 20% to cover the initial depreciation hit that occurs the moment you drive off the lot. Shop for financing at a credit union or bank <em>before</em> going to the dealership, so you have a baseline interest rate to compare against the dealer's offer.</p>

            <h2>Benefits</h2>
            <p>Using this Car Affordability Calculator empowers you as a buyer. It strips away the smoke and mirrors of dealership financing, providing an accurate, mathematically sound budget. It saves you time by narrowing down your vehicle search to cars you can actually afford, and it saves you thousands of dollars by preventing you from rolling taxes and negative equity into a high-interest, long-term loan.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-affordability-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
