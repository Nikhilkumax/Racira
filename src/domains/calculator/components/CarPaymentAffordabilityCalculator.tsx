"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Car, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface AffordabilityResults {
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
const calculateAffordability = (inputs: typeof DEFAULTS): AffordabilityResults => {
  const monthlyBudget = parseFloat(inputs.monthlyBudget) || 0;
  const downPayment = parseFloat(inputs.downPayment) || 0;
  const tradeInValue = parseFloat(inputs.tradeInValue) || 0;
  const loanTermMonths = parseFloat(inputs.loanTermMonths) || 0;
  const interestRate = parseFloat(inputs.interestRate) || 0;
  
  // Advanced
  const salesTaxRate = parseFloat(inputs.salesTaxRate) / 100 || 0;
  const dealerFees = parseFloat(inputs.dealerFees) || 0;
  const tradeInOwed = parseFloat(inputs.tradeInOwed) || 0;

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
  // Formula: P = (A / r) * (1 - (1 + r)^-n)
  let maxFinanced = 0;
  if (r > 0) {
    maxFinanced = (monthlyBudget / r) * (1 - Math.pow(1 + r, -n));
  } else {
    maxFinanced = monthlyBudget * n;
  }

  // Calculate net trade-in
  const netTradeIn = Math.max(0, tradeInValue - tradeInOwed);
  const negativeEquity = tradeInOwed > tradeInValue ? (tradeInOwed - tradeInValue) : 0;

  // The total purchasing power (money available for the car, taxes, and fees)
  // Cash on hand + Financed Amount - Negative Equity
  const totalPurchasingPower = maxFinanced + downPayment + netTradeIn - negativeEquity;

  // Now we must back out the taxes and fees to find the actual Max Car Price (MSRP)
  // totalPurchasingPower = MaxCarPrice + (MaxCarPrice * salesTaxRate) + dealerFees
  // totalPurchasingPower - dealerFees = MaxCarPrice * (1 + salesTaxRate)
  let maxCarPrice = (totalPurchasingPower - dealerFees) / (1 + salesTaxRate);

  if (maxCarPrice < 0) {
    return {
      maxCarPrice: 0, totalFinanced: 0, totalInterestPaid: 0, totalPaidOverLife: 0,
      taxAmount: 0, netTradeIn: 0, chartData: [],
      isError: true, errorMsg: "Budget is too low to cover dealer fees and negative equity."
    };
  }

  // Verify the math backwards
  const taxAmount = maxCarPrice * salesTaxRate;
  const totalCost = maxCarPrice + taxAmount + dealerFees + negativeEquity;
  const totalFinanced = totalCost - downPayment - netTradeIn;

  let totalPaidOverLife = 0;
  let totalInterestPaid = 0;

  if (r > 0) {
    totalPaidOverLife = (monthlyBudget * n) + downPayment + tradeInValue; // what you actually paid over life
    totalInterestPaid = (monthlyBudget * n) - totalFinanced;
  } else {
    totalPaidOverLife = totalCost;
    totalInterestPaid = 0;
  }

  const chartData = [
    { name: "Car Value (Price)", value: maxCarPrice, color: "#10b981" },
    { name: "Interest Paid", value: totalInterestPaid, color: "#f59e0b" },
    { name: "Taxes & Fees", value: taxAmount + dealerFees, color: "#ef4444" }
  ];
  
  if (negativeEquity > 0) {
    chartData.push({ name: "Negative Equity", value: negativeEquity, color: "#8b5cf6" });
  }

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
  monthlyBudget: "500",
  downPayment: "3000",
  tradeInValue: "0",
  loanTermMonths: "60",
  interestRate: "7.0",
  // Advanced
  salesTaxRate: "7.0",
  dealerFees: "800",
  tradeInOwed: "0"
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
export default function CarPaymentAffordabilityCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AffordabilityResults>(calculateAffordability(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateAffordability(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAffordability(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "How much car can I afford?", answer: "Financial experts recommend the '20/4/10' rule. Put down at least 20%, finance the car for no more than 4 years (48 months), and ensure your total monthly vehicle expenses (payment, insurance, gas) do not exceed 10% of your gross monthly income." },
    { question: "Why is the max car price lower than my budget times months?", answer: "When you buy a car, a significant chunk of your money immediately vanishes to sales tax, dealership documentation fees, registration fees, and interest paid to the bank. If you have a $500/month budget for 60 months ($30,000 total), you cannot buy a $30,000 car. You can only buy a ~$23,000 car, because the remaining $7,000 is consumed by taxes and interest." },
    { question: "What happens if I owe more on my trade-in than it's worth?", answer: "This is called 'negative equity' or being 'underwater.' If you trade in a car worth $10,000 but you owe $15,000 on its loan, the dealer will roll that $5,000 deficit into your new car loan. This drastically reduces the maximum price of the new car you can afford and forces you to pay interest on a car you no longer own." },
    { question: "Should I take a 72 or 84-month loan?", answer: "Generally, no. While stretching the loan out to 72 or 84 months lowers your monthly payment and makes an expensive car look 'affordable,' it drastically increases the total interest you will pay over the life of the loan. Furthermore, cars depreciate rapidly. With an 84-month loan, you will almost certainly owe more than the car is worth for the first 5 years of ownership." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Payment Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Payment Affordability Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex items-center gap-1.5">Target Monthly Budget</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-xl">$</span>
                <input type="number" value={inputs.monthlyBudget} onChange={e => handleChange("monthlyBudget", e.target.value)} className="w-full h-full px-2 text-2xl font-bold bg-transparent outline-none border-none text-foreground" />
                <span className="pr-4 text-primary font-bold text-sm uppercase">/ mo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="down-payment" label="Cash Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
              <CompactInput id="trade-in" label="Trade-in Value" value={inputs.tradeInValue} onChange={(v: string) => handleChange("tradeInValue", v)} prefix="$" />
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
                  <CompactInput id="fees" label="Dealer / Doc Fees" value={inputs.dealerFees} onChange={(v: string) => handleChange("dealerFees", v)} prefix="$" />
                  <div className="col-span-2">
                    <CompactInput id="trade-owed" label="Amount Owed on Trade-in" value={inputs.tradeInOwed} onChange={(v: string) => handleChange("tradeInOwed", v)} prefix="$" tooltip="If you owe more than it's worth, it's negative equity." />
                  </div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Max Recommended Car Price</div>
                  <div className="text-4xl font-bold text-primary mb-1">
                    {formatCurrency(results.maxCarPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">This is the sticker price (MSRP) you can afford before taxes and fees are added.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Financed</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.totalFinanced)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-[#f59e0b]">{formatCurrency(results.totalInterestPaid)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total You Pay</div>
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
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Where Your Money Goes</h3>
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
                    <p className="text-xs text-muted-foreground mt-4 italic">Notice how much of your total spending goes to things other than the actual car itself.</p>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Loan Structure Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Max Car Price (MSRP)</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.maxCarPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Sales Tax ({inputs.salesTaxRate}%)</span>
                      <span className="font-medium text-red-500">+{formatCurrency(results.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Dealer Fees</span>
                      <span className="font-medium text-red-500">+{formatCurrency(parseFloat(inputs.dealerFees) || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 bg-muted/5">
                      <span className="text-muted-foreground font-semibold">Total Out-the-Door Price</span>
                      <span className="font-bold text-foreground">{formatCurrency(results.maxCarPrice + results.taxAmount + (parseFloat(inputs.dealerFees) || 0))}</span>
                    </div>

                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Cash Down Payment</span>
                      <span className="font-medium text-emerald-500">-{formatCurrency(parseFloat(inputs.downPayment) || 0)}</span>
                    </div>

                    {parseFloat(inputs.tradeInOwed) > parseFloat(inputs.tradeInValue) ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Negative Equity (Rolled into loan)</span>
                        <span className="font-medium text-red-500">+{formatCurrency(parseFloat(inputs.tradeInOwed) - parseFloat(inputs.tradeInValue))}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Net Trade-In Value</span>
                        <span className="font-medium text-emerald-500">-{formatCurrency(results.netTradeIn)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Loan Amount (Financed)</span>
                      <span className="text-primary">{formatCurrency(results.totalFinanced)}</span>
                    </div>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Car Payment Affordability Calculator?</h2>
            <p>A Car Payment Affordability Calculator is a reverse-engineering tool designed to protect car buyers from predatory dealership math. While a standard auto loan calculator asks "Here is the car price, what is my payment?", this affordability calculator asks "Here is my monthly budget, exactly how much car can I afford to buy?" It strips away the hidden costs by working backward, deducting taxes, fees, and interest from your total budget to reveal the true maximum vehicle sticker price you can negotiate for.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematical logic behind this tool is complex because it must solve for a variable (the car's price) that is buried inside multiple compounding factors. First, we use your monthly budget, interest rate, and loan term to calculate the maximum amount the bank will lend you. Then, we add your cash down payment and trade-in value to find your total purchasing power. Crucially, we then mathematically strip out the sales tax and dealer fees. The number left over is the true maximum MSRP you can afford to pay on the lot.</p>

            <h2 className="text-2xl font-bold mb-3">Why Dealership "Monthly Payment" Math is Dangerous</h2>
            <p>When you walk into a dealership, the salesperson's first question is usually, "What monthly payment are you looking for?" <strong>Never answer this question.</strong> If you say $500, they will happily sell you a $25,000 car. But to hit your $500 payment, they will stretch the loan out to 72 or 84 months and pack the loan with hidden fees and warranties. You get your $500 payment, but you end up paying $42,000 for a $25,000 car over 7 years. Use this calculator to find your max price <em>before</em> you arrive, and negotiate strictly on the out-the-door price of the vehicle.</p>

            <h2 className="text-2xl font-bold mb-3">The Impact of Negative Equity</h2>
            <p>If you owe more on your current car than the dealer is willing to give you for a trade-in, you have "negative equity" (also known as being underwater). For example, if you owe $15,000 but the car is only worth $10,000, you have $5,000 in negative equity. If you trade that car in, the dealer will take that $5,000 debt and roll it into your new car loan. This is catastrophic. It means you are paying interest on a car you no longer own, and it drastically reduces the price of the new car you can actually afford. Our advanced options allow you to model this exact scenario.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Illusion of Affordability.</strong> John has $500 a month and $3,000 down. He assumes he can afford a $33,000 car ($500 x 60 months + $3000). But when he uses the calculator (assuming a 7% interest rate and 7% sales tax), he realizes his true max car price is only $23,400. Nearly $10,000 of his budget will vanish to interest and taxes over the next 5 years.</p>
            <p><strong>Example 2: Changing the Loan Term.</strong> Sarah wants a $35,000 car but only has a $500 monthly budget. At 60 months, she can't afford it. She considers extending the loan to 84 months to make the payment fit. While the monthly payment drops, the calculator's pie chart shows her total interest paid skyrockets from $4,000 to over $8,500. She decides to buy a cheaper car instead.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Follow the <strong>20/4/10 Rule</strong> of car buying. Put down at least 20% to avoid immediate negative equity due to depreciation. Finance the car for no more than 4 years (48 months); if you have to stretch the loan to 72 or 84 months to afford the payment, you cannot afford the car. Finally, ensure your total transportation costs (payment, insurance, fuel, and maintenance) do not exceed 10% of your gross monthly income.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-payment-affordability-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
