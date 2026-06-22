"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Car, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface PaymentResults {
  monthlyPayment: number;
  totalFinanced: number;
  totalInterestPaid: number;
  totalCostOfCar: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculatePayment = (inputs: typeof DEFAULTS): PaymentResults => {
  const carPrice = parseFloat(inputs.carPrice) || 0;
  const downPayment = parseFloat(inputs.downPayment) || 0;
  const tradeIn = parseFloat(inputs.tradeIn) || 0;
  const loanTerm = parseFloat(inputs.loanTerm) || 0;
  const interestRate = parseFloat(inputs.interestRate) || 0;
  
  // Advanced
  const salesTaxRate = parseFloat(inputs.salesTaxRate) / 100 || 0;
  const dealerFees = parseFloat(inputs.dealerFees) || 0;

  if (carPrice <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0, totalFinanced: 0, totalInterestPaid: 0, totalCostOfCar: 0,
      chartData: [], schedule: [],
      isError: true, errorMsg: "Car price and loan term must be greater than zero."
    };
  }

  // Calculate Tax (Tax is usually calculated on price minus trade-in in many states, but we'll use a standard approach)
  // Standard: (Price - TradeIn) * TaxRate + Fees
  const taxableAmount = Math.max(0, carPrice - tradeIn);
  const taxAmount = taxableAmount * salesTaxRate;
  
  const totalOutTheDoor = carPrice + taxAmount + dealerFees;
  const totalFinanced = Math.max(0, totalOutTheDoor - downPayment - tradeIn);

  let monthlyPayment = 0;
  let totalInterestPaid = 0;
  let schedule = [];
  let chartData = [];

  const r = interestRate / 100 / 12;
  const n = loanTerm;

  if (r > 0) {
    monthlyPayment = (totalFinanced * r) / (1 - Math.pow(1 + r, -n));
  } else {
    monthlyPayment = totalFinanced / n;
  }

  let balance = totalFinanced;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= n; month++) {
    const interestPayment = balance * r;
    const principalPayment = monthlyPayment - interestPayment;
    
    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;
    balance -= principalPayment;
    
    if (balance < 0) balance = 0;

    // Save yearly data for chart and schedule
    if (month % 12 === 0 || month === n) {
      const year = Math.ceil(month / 12);
      schedule.push({
        year,
        interestPaid: cumulativeInterest,
        principalPaid: cumulativePrincipal,
        balance: balance
      });
      chartData.push({
        year: `Year ${year}`,
        Balance: balance,
        "Total Interest": cumulativeInterest
      });
    }
  }

  totalInterestPaid = cumulativeInterest;
  const totalCostOfCar = totalFinanced + totalInterestPaid + downPayment + tradeIn;

  return {
    monthlyPayment,
    totalFinanced,
    totalInterestPaid,
    totalCostOfCar,
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  carPrice: "30000",
  downPayment: "3000",
  tradeIn: "2000",
  loanTerm: "60",
  interestRate: "6.5",
  // Advanced
  salesTaxRate: "7.0",
  dealerFees: "895"
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
export default function MonthlyCarPaymentCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<PaymentResults>(calculatePayment(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculatePayment(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculatePayment(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "How is the monthly payment calculated?", answer: "The monthly payment is calculated using a standard amortization formula. It takes the total amount financed (Car Price + Taxes + Fees - Down Payment - Trade In) and spreads it across the loan term, applying the annual interest rate compounded monthly. Every payment covers a portion of interest and a portion of principal." },
    { question: "Why is the Total Cost higher than the Car Price?", answer: "The sticker price of a car is just the starting point. Before you drive off the lot, you must pay state sales tax and dealership documentation fees. Then, unless you pay cash, you must pay interest to the bank every month for borrowing the money. A $30,000 car financed at 7% over 5 years easily costs over $37,000 in reality." },
    { question: "Does my trade-in lower my sales tax?", answer: "In the vast majority of US states, yes. If you buy a $30,000 car and trade in a $10,000 car, the state only charges you sales tax on the $20,000 difference. Our calculator automatically applies this tax advantage when computing your total amount financed." },
    { question: "Should I choose a 72-month loan for a lower payment?", answer: "Financial experts strongly advise against 72- or 84-month auto loans. While they lower your monthly payment, they drastically increase the total interest you pay to the bank. More dangerously, because cars depreciate rapidly, a 72-month loan almost guarantees you will be 'underwater' (owing more than the car is worth) for the first 4-5 years of ownership." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Monthly Car Payment Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Monthly Car Payment Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="price" label="Vehicle Price (MSRP)" value={inputs.carPrice} onChange={(v: string) => handleChange("carPrice", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="down" label="Cash Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
              <CompactInput id="trade" label="Trade-in Value" value={inputs.tradeIn} onChange={(v: string) => handleChange("tradeIn", v)} prefix="$" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3">Loan Details</div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="mos" options={[
                { label: "36 Months (3 Yrs)", value: "36" },
                { label: "48 Months (4 Yrs)", value: "48" },
                { label: "60 Months (5 Yrs)", value: "60" },
                { label: "72 Months (6 Yrs)", value: "72" },
                { label: "84 Months (7 Yrs)", value: "84" }
              ]} />
              <CompactInput id="rate" label="Interest Rate (APR)" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Taxes & Fees) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="State Sales Tax Rate" value={inputs.salesTaxRate} onChange={(v: string) => handleChange("salesTaxRate", v)} suffix="%" />
                  <CompactInput id="fees" label="Dealer / Doc Fees" value={inputs.dealerFees} onChange={(v: string) => handleChange("dealerFees", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Car className="h-4 w-4" /> Calculate Payment
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Monthly Payment</div>
                  <div className="flex items-end gap-2 mb-1">
                    <div className="text-5xl font-bold text-primary">{formatCurrency(results.monthlyPayment)}</div>
                    <div className="text-xl font-medium text-muted-foreground mb-1">/ mo</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Based on {inputs.loanTerm} months at {inputs.interestRate}% APR.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Amount Financed</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.totalFinanced)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-[#f59e0b]">{formatCurrency(results.totalInterestPaid)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Cost (All-in)</div>
                    <div className="text-lg font-bold text-destructive">{formatCurrency(results.totalCostOfCar)}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Amortization Trajectory</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', marginTop: '10px' }} />
                        
                        <Area type="monotone" dataKey="Total Interest" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorInterest)" />
                        <Area type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Yearly Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Year</th>
                          <th className="px-4 py-3 font-semibold text-right">Interest Paid</th>
                          <th className="px-4 py-3 font-semibold text-right">Principal Paid</th>
                          <th className="px-4 py-3 font-semibold text-right">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.year} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">Year {row.year}</td>
                            <td className="px-4 py-3 text-right text-[#f59e0b] font-medium">{formatCurrency(row.interestPaid)}</td>
                            <td className="px-4 py-3 text-right text-emerald-500 font-medium">{formatCurrency(row.principalPaid)}</td>
                            <td className="px-4 py-3 text-right text-foreground font-bold">{formatCurrency(row.balance)}</td>
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
            <h2>What Is a Monthly Car Payment Calculator?</h2>
            <p>A Monthly Car Payment Calculator is a financial tool that simulates an auto loan amortization schedule. When you buy a car, the dealership negotiates based on the sticker price of the vehicle. However, your actual monthly obligation is determined by a combination of the vehicle price, state sales tax, dealership fees, your cash down payment, and the interest rate charged by the bank. This calculator synthesizes all of these variables into a single, accurate monthly payment figure.</p>

            <h2>Understanding Amortization</h2>
            <p>Car loans are "amortized," meaning your monthly payment stays exactly the same for the entire duration of the loan, but the <em>composition</em> of that payment changes over time. In the first year of your loan, a large portion of your monthly payment goes toward paying off the interest charged by the bank. By the final year of your loan, almost your entire payment goes toward reducing the principal balance. Our <strong>Amortization Trajectory</strong> chart visually tracks this relationship, showing how your balance decays over time while your total interest paid accumulates.</p>

            <h2>The Danger of the 72-Month Loan</h2>
            <p>Dealerships frequently push buyers toward 72-month or 84-month loan terms. Stretching the loan out over 6 or 7 years artificially lowers the monthly payment, making expensive cars feel affordable. This is a financial trap for two reasons: First, longer loan terms carry higher interest rates, drastically increasing the <strong>Total Interest</strong> you pay. Second, cars are depreciating assets. If you take a 72-month loan, the value of the car will drop faster than your loan balance for the first four years. If you total the car or try to trade it in during this period, you will be "underwater" (owing the bank more than the car is worth).</p>

            <h2>How Taxes and Fees Impact Your Loan</h2>
            <p>If you have a $30,000 budget and look at $30,000 cars, you will be unable to afford the vehicle. In most states, purchasing a car triggers a 6% to 8% sales tax, plus hundreds of dollars in mandatory state registration and dealership documentation fees. A $30,000 car easily becomes a $32,500 car "out-the-door." Our <strong>Advanced Options</strong> allow you to input your local tax rate and dealer fees so the calculator can accurately model your true Amount Financed.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Impact of Interest.</strong> John finances a $35,000 truck over 60 months at a high 9% APR. His payment is roughly $725 a month. When looking at the Yearly Breakdown, he realizes he will pay over $8,500 in pure interest to the bank by the end of the loan. The total cost of the truck is actually $43,500.</p>
            <p><strong>Example 2: The Power of a Down Payment.</strong> Sarah wants the same $35,000 truck but brings a $10,000 cash down payment and secures a 5% APR for 48 months. Her payment is slightly lower at $575, but because she borrowed less money for a shorter amount of time, she only pays $2,600 in total interest. The down payment saved her thousands of dollars in bank fees.</p>

            <h2>Tips & Best Practices</h2>
            <p>Always secure financing from a local credit union or bank <em>before</em> walking into a dealership. Dealerships often act as middlemen, taking the bank's interest rate and adding 1% or 2% on top of it as pure profit for themselves. If you walk in with a pre-approved 5% rate from your bank, the dealer is forced to beat that rate to win your financing business. Furthermore, aim to put down at least 20% in cash or trade equity to protect yourself from immediate negative equity depreciation.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/monthly-car-payment-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
