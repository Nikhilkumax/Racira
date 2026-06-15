"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Wallet, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface BudgetResults {
  maxCarPrice: number;
  totalFinanced: number;
  totalInterestPaid: number;
  totalPaidOverLife: number;
  taxAmount: number;
  netTradeIn: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBudget = (inputs: typeof DEFAULTS): BudgetResults => {
  const monthlyBudget = parseFloat(inputs.monthlyBudget) || 0;
  const downPayment = parseFloat(inputs.downPayment) || 0;
  const tradeInValue = parseFloat(inputs.tradeInValue) || 0;
  const loanTermMonths = parseFloat(inputs.loanTermMonths) || 0;
  const interestRate = parseFloat(inputs.interestRate) || 0;
  
  // Advanced
  const salesTaxRate = parseFloat(inputs.salesTaxRate) / 100 || 0;
  const dealerFees = parseFloat(inputs.dealerFees) || 0;

  if (monthlyBudget <= 0 || loanTermMonths <= 0) {
    return {
      maxCarPrice: 0, totalFinanced: 0, totalInterestPaid: 0, totalPaidOverLife: 0,
      taxAmount: 0, netTradeIn: 0, chartData: [],
      isError: true, errorMsg: "Monthly budget and loan term must be greater than zero."
    };
  }

  // Monthly interest rate
  const r = interestRate / 100 / 12;
  const n = loanTermMonths;

  // Calculate the maximum amount that can be financed based on the monthly budget
  let maxFinanced = 0;
  if (r > 0) {
    maxFinanced = (monthlyBudget / r) * (1 - Math.pow(1 + r, -n));
  } else {
    maxFinanced = monthlyBudget * n;
  }

  // Calculate net trade-in
  const netTradeIn = Math.max(0, tradeInValue);

  // The total purchasing power
  const totalPurchasingPower = maxFinanced + downPayment + netTradeIn;

  // Back out the taxes and fees to find Max Car Price (MSRP)
  let maxCarPrice = (totalPurchasingPower - dealerFees) / (1 + salesTaxRate);

  if (maxCarPrice < 0) {
    return {
      maxCarPrice: 0, totalFinanced: 0, totalInterestPaid: 0, totalPaidOverLife: 0,
      taxAmount: 0, netTradeIn: 0, chartData: [],
      isError: true, errorMsg: "Budget is too low to cover dealer fees and taxes."
    };
  }

  // Verify the math
  const taxAmount = maxCarPrice * salesTaxRate;
  const totalCost = maxCarPrice + taxAmount + dealerFees;
  const totalFinanced = totalCost - downPayment - netTradeIn;

  let totalPaidOverLife = 0;
  let totalInterestPaid = 0;

  if (r > 0) {
    totalPaidOverLife = (monthlyBudget * n) + downPayment + tradeInValue;
    totalInterestPaid = (monthlyBudget * n) - totalFinanced;
  } else {
    totalPaidOverLife = totalCost;
    totalInterestPaid = 0;
  }

  const chartData = [
    { name: "Car Value (Price)", value: maxCarPrice, color: "#3b82f6" },
    { name: "Interest Paid", value: totalInterestPaid, color: "#f59e0b" },
    { name: "Taxes & Fees", value: taxAmount + dealerFees, color: "#ef4444" }
  ];

  return {
    maxCarPrice,
    totalFinanced,
    totalInterestPaid,
    totalPaidOverLife,
    taxAmount,
    netTradeIn,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  monthlyBudget: "400",
  downPayment: "5000",
  tradeInValue: "0",
  loanTermMonths: "60",
  interestRate: "6.5",
  // Advanced
  salesTaxRate: "6.0",
  dealerFees: "1000"
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
export default function CarBuyingBudgetCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BudgetResults>(calculateBudget(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateBudget(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBudget(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "How do I set a realistic car buying budget?", answer: "A realistic budget should not be based solely on the sticker price of the car. It must account for sales tax, dealership fees, and the interest you will pay on the loan. Financial experts often recommend spending no more than 10% to 15% of your take-home pay on a monthly car payment." },
    { question: "Why is the max budget lower than I thought?", answer: "Taxes and interest are silent wealth killers. If you budget $400 a month for 5 years, you are willing to spend $24,000 total. However, if interest takes $4,000 and taxes/fees take $2,000, your actual buying power for the vehicle itself is only $18,000." },
    { question: "Does a larger down payment help?", answer: "Absolutely. A larger down payment reduces the total amount you need to borrow, which directly reduces the total interest you will pay over the life of the loan. It also protects you from becoming 'underwater' (owing more than the car is worth) when the vehicle rapidly depreciates in its first two years." },
    { question: "How long should my loan term be?", answer: "Ideally, 36 to 48 months. If you must stretch a loan to 72 or 84 months to make the monthly payment fit into your budget, it means you cannot afford the car. Long loan terms drastically increase the total interest paid and keep you in debt long after the car's warranty has expired." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Buying Budget Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Buying Budget Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex items-center gap-1.5">Maximum Monthly Budget</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-xl">$</span>
                <input type="number" value={inputs.monthlyBudget} onChange={e => handleChange("monthlyBudget", e.target.value)} className="w-full h-full px-2 text-2xl font-bold bg-transparent outline-none border-none text-foreground" />
                <span className="pr-4 text-primary font-bold text-sm uppercase">/ mo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="down-payment" label="Cash Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
              <CompactInput id="trade-in" label="Trade-in Equity" value={inputs.tradeInValue} onChange={(v: string) => handleChange("tradeInValue", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mt-1">
              <CompactInput id="loan-term" label="Loan Term" value={inputs.loanTermMonths} onChange={(v: string) => handleChange("loanTermMonths", v)} suffix="mos" options={[
                { label: "36 Months (3 Yrs)", value: "36" },
                { label: "48 Months (4 Yrs)", value: "48" },
                { label: "60 Months (5 Yrs)", value: "60" },
                { label: "72 Months (6 Yrs)", value: "72" },
                { label: "84 Months (7 Yrs)", value: "84" }
              ]} />
              <CompactInput id="interest" label="Interest Rate (APR)" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Taxes & Fees) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax-rate" label="Sales Tax Rate" value={inputs.salesTaxRate} onChange={(v: string) => handleChange("salesTaxRate", v)} suffix="%" />
                  <CompactInput id="fees" label="Dealer Fees" value={inputs.dealerFees} onChange={(v: string) => handleChange("dealerFees", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Wallet className="h-4 w-4" /> Calculate Budget
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
                <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Max Recommended Budget</div>
                  <div className="text-5xl font-bold text-[#3b82f6] mb-1">
                    {formatCurrency(results.maxCarPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">The maximum sticker price (MSRP) you should look for on the lot.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Loan Amount</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.totalFinanced)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-[#f59e0b]">{formatCurrency(results.totalInterestPaid)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Cost</div>
                    <div className="text-lg font-bold text-destructive">{formatCurrency(results.totalPaidOverLife)}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col md:flex-row items-center gap-4">
                  <div className="h-[200px] w-full md:w-[250px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Purchase Breakdown</h3>
                    <div className="flex flex-col gap-2.5">
                      {results.chartData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            {item.name}
                          </div>
                          <div className="font-semibold text-foreground">{formatCurrency(item.value)}</div>
                        </div>
                      ))}
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
            <h2>What Is a Car Buying Budget Calculator?</h2>
            <p>A Car Buying Budget Calculator is designed to tell you exactly how much car you can afford based on the monthly payment you are comfortable making. It takes the guesswork out of the financing process by working backward. You supply your maximum monthly budget, the amount of cash you have for a down payment, and the estimated interest rate, and the calculator mathematically strips away taxes, fees, and interest to reveal the exact sticker price you should target on the dealership lot.</p>

            <h2>Why Work Backwards?</h2>
            <p>Dealerships love it when buyers negotiate based solely on the monthly payment. If you walk in and say "I can afford $400 a month," the dealer will happily sell you a $25,000 car. They do this by stretching the loan out to 72 or 84 months, making the car appear affordable while trapping you in years of high-interest debt. By using this calculator to work backwards, you find your <strong>Max Recommended Budget</strong> beforehand. You can then negotiate the total out-the-door price of the vehicle, which is the only number that truly matters.</p>

            <h2>The Impact of Taxes and Fees</h2>
            <p>Many buyers are shocked to learn that a $20,000 car does not actually cost $20,000. In most states, you must pay a 6% to 8% sales tax, plus hundreds of dollars in dealership documentation fees and state registration fees. These hidden costs can easily add $2,000 to the price of the vehicle. Our calculator automatically reserves a portion of your purchasing power to cover these mandatory fees, ensuring that your final budget is realistic and accurate.</p>

            <h2>The Role of the Down Payment</h2>
            <p>Your cash down payment is arguably the most important factor in buying a car safely. A larger down payment drastically increases your total purchasing power without increasing your monthly payment. More importantly, it protects you from negative equity. New cars depreciate by roughly 20% in the first year. If you finance 100% of the vehicle, you will owe the bank more than the car is worth the second you drive it off the lot. Putting down at least 15% to 20% absorbs this initial depreciation hit.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The First-Time Buyer.</strong> Sarah wants to buy her first car. She has $3,000 saved and can afford $350 a month. She expects an 8% interest rate over 60 months. The calculator reveals that her total purchasing power is roughly $20,000. After backing out sales tax and fees, her true max car budget is about $18,000. If she looks at cars priced at $20,000 on the lot, she will be unable to afford the monthly payment.</p>
            <p><strong>Example 2: Upgrading the Commute.</strong> John has a $500 monthly budget and a trade-in worth $8,000. With a 5% interest rate over 48 months, his total purchasing power is massive. After fees, he can afford a $28,000 vehicle. The pie chart shows that because of his large trade-in and short loan term, very little of his money is wasted on interest.</p>

            <h2>Tips & Best Practices</h2>
            <p>Never take a 72 or 84-month auto loan. If a 60-month loan pushes the monthly payment above your budget, it means you simply cannot afford the vehicle. Furthermore, try to secure financing from your local credit union or bank <em>before</em> you go to the dealership. Dealerships often markup the interest rate they get from the bank, pocketing the difference as extra profit. Having a pre-approved rate forces the dealer to beat it to win your business.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-buying-budget-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
