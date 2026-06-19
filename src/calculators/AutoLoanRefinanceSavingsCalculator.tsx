"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Car, Target, TrendingDown, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface RefiInputs {
  currentBalance: number;
  currentRate: number;
  currentMonthsRemaining: number;
  newRate: number;
  newTermMonths: number;
  refiFees: number;
}

interface RefiResult {
  currentMonthly: number;
  currentTotalInterest: number;
  currentTotalCost: number;
  
  newMonthly: number;
  newTotalInterest: number;
  newTotalCost: number;
  
  monthlySavings: number;
  interestSavings: number;
  netSavings: number;
  
  breakEvenMonths: number | null;
  shouldRefinance: boolean;
  
  chartData: { name: string; "Current Loan": number; "New Loan": number }[];
}

const DEFAULTS = {
  currentBalance: "25000",
  currentRate: "8.5",
  currentMonthsRemaining: "48",
  newRate: "5.5",
  newTermMonths: "48",
  refiFees: "150",
};

const calculateRefinance = (inputs: RefiInputs): RefiResult => {
  const { currentBalance, currentRate, currentMonthsRemaining, newRate, newTermMonths, refiFees } = inputs;
  
  const cRate = currentRate / 100 / 12;
  const nRate = newRate / 100 / 12;
  
  // Current Loan Calculations
  let currentMonthly = 0;
  if (cRate > 0 && currentMonthsRemaining > 0) {
    currentMonthly = currentBalance * (cRate * Math.pow(1 + cRate, currentMonthsRemaining)) / (Math.pow(1 + cRate, currentMonthsRemaining) - 1);
  } else if (currentMonthsRemaining > 0) {
    currentMonthly = currentBalance / currentMonthsRemaining;
  }
  const currentTotalCost = currentMonthly * currentMonthsRemaining;
  const currentTotalInterest = currentTotalCost - currentBalance;

  // New Loan Calculations
  const newBalance = currentBalance + refiFees; // Assume fees are rolled in
  let newMonthly = 0;
  if (nRate > 0 && newTermMonths > 0) {
    newMonthly = newBalance * (nRate * Math.pow(1 + nRate, newTermMonths)) / (Math.pow(1 + nRate, newTermMonths) - 1);
  } else if (newTermMonths > 0) {
    newMonthly = newBalance / newTermMonths;
  }
  const newTotalCostRaw = newMonthly * newTermMonths;
  const newTotalInterest = newTotalCostRaw - newBalance;
  const newTotalCost = newTotalCostRaw; // Including fees implicitly via new balance

  // Savings
  const monthlySavings = currentMonthly - newMonthly;
  const interestSavings = currentTotalInterest - newTotalInterest;
  const netSavings = currentTotalCost - newTotalCost; // Net savings automatically accounts for the rolled-in fees
  
  // Break-even
  let breakEvenMonths: number | null = null;
  if (monthlySavings > 0 && refiFees > 0) {
    breakEvenMonths = Math.ceil(refiFees / monthlySavings);
  } else if (refiFees === 0) {
    breakEvenMonths = 0;
  }

  const shouldRefinance = netSavings > 0;

  const chartData = [
    { name: "Monthly Payment", "Current Loan": Math.round(currentMonthly), "New Loan": Math.round(newMonthly) },
    { name: "Total Interest", "Current Loan": Math.round(currentTotalInterest), "New Loan": Math.round(newTotalInterest) },
  ];

  return {
    currentMonthly,
    currentTotalInterest,
    currentTotalCost,
    newMonthly,
    newTotalInterest,
    newTotalCost,
    monthlySavings,
    interestSavings,
    netSavings,
    breakEvenMonths,
    shouldRefinance,
    chartData
  };
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function AutoLoanRefinanceSavingsCalculator() {
  const [currentBalance, setCurrentBalance] = useState(DEFAULTS.currentBalance);
  const [currentRate, setCurrentRate] = useState(DEFAULTS.currentRate);
  const [currentMonthsRemaining, setCurrentMonthsRemaining] = useState(DEFAULTS.currentMonthsRemaining);
  const [newRate, setNewRate] = useState(DEFAULTS.newRate);
  const [newTermMonths, setNewTermMonths] = useState(DEFAULTS.newTermMonths);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refiFees, setRefiFees] = useState(DEFAULTS.refiFees);

  const [result, setResult] = useState<RefiResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setResult(calculateRefinance({
      currentBalance: parseFloat(currentBalance) || 0,
      currentRate: parseFloat(currentRate) || 0,
      currentMonthsRemaining: parseInt(currentMonthsRemaining) || 0,
      newRate: parseFloat(newRate) || 0,
      newTermMonths: parseInt(newTermMonths) || 0,
      refiFees: parseFloat(refiFees) || 0,
    }));
  };

  const reset = () => {
    setCurrentBalance(DEFAULTS.currentBalance);
    setCurrentRate(DEFAULTS.currentRate);
    setCurrentMonthsRemaining(DEFAULTS.currentMonthsRemaining);
    setNewRate(DEFAULTS.newRate);
    setNewTermMonths(DEFAULTS.newTermMonths);
    setRefiFees(DEFAULTS.refiFees);
    setShowAdvanced(false);
    setResult(calculateRefinance({
      currentBalance: parseFloat(DEFAULTS.currentBalance),
      currentRate: parseFloat(DEFAULTS.currentRate),
      currentMonthsRemaining: parseInt(DEFAULTS.currentMonthsRemaining),
      newRate: parseFloat(DEFAULTS.newRate),
      newTermMonths: parseInt(DEFAULTS.newTermMonths),
      refiFees: parseFloat(DEFAULTS.refiFees),
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "When does it make sense to refinance an auto loan?", answer: "It makes sense to refinance if your credit score has significantly improved since you bought the car, if general interest rates have dropped, or if you were given a terrible rate by a dealership markup. The goal is to lower your interest rate without stretching the term out so far that you end up paying more total interest." },
    { question: "Will refinancing hurt my credit score?", answer: "When you apply for a new loan, the lender will perform a 'hard pull' on your credit report, which typically dings your score by a few points temporarily (usually less than 5 points). However, if refinancing lowers your payment and helps you make consistent on-time payments, your score will improve in the long run." },
    { question: "Should I extend my loan term when I refinance?", answer: "Extending your loan term (e.g., from 36 months left to a new 60-month loan) will drastically reduce your monthly payment, which helps with cash flow. However, it will usually cost you significantly more in total interest over the life of the loan, and it increases the risk of becoming 'underwater' (owing more than the car is worth)." },
    { question: "Can I refinance if my car is 'underwater'?", answer: "It is very difficult to refinance an underwater (negative equity) car. Lenders usually have strict Loan-To-Value (LTV) limits for auto refinancing, often capping at 100% to 125% of the car's current book value. If you owe more than the car is worth, you may need to bring cash to the table to pay down the balance before a lender will approve the refinance." },
    { question: "Are there hidden fees to refinance a car?", answer: "Auto refinance fees are usually quite low compared to mortgages. However, you should watch out for title transfer fees, state registration fees, and lender origination fees. Some previous loans also have a prepayment penalty. You should factor all these costs into the 'Refinance Fees' box to ensure the refinance is actually saving you money." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Auto Loan Refinance Savings Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan Refinance Savings Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <h3 className="text-sm font-bold text-primary border-b border-border pb-2">Current Auto Loan</h3>
            <CompactInput id="currentBalance" label="Remaining Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" />
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="currentRate" label="Current Rate" value={currentRate} onChange={setCurrentRate} suffix="%" step="0.1" />
              <CompactInput id="currentMonthsRemaining" label="Months Left" value={currentMonthsRemaining} onChange={setCurrentMonthsRemaining} />
            </div>

            <h3 className="text-sm font-bold text-primary border-b border-border pb-2 mt-2">New Auto Loan</h3>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="newRate" label="New Rate" value={newRate} onChange={setNewRate} suffix="%" step="0.1" />
              <CompactInput id="newTermMonths" label="New Term" value={newTermMonths} onChange={setNewTermMonths} suffix="mo" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Refinance Costs
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="refiFees" label="Total Refinance Fees & Costs" value={refiFees} onChange={setRefiFees} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <RefreshCw className="h-4 w-4" /> Calculate Savings
              </button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className={`border-l-4 rounded-lg p-5 ${result.shouldRefinance ? 'bg-green-500/10 border-green-500' : 'bg-destructive/10 border-destructive'}`}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">
                    {result.shouldRefinance ? "Total Net Savings" : "Total Net Cost (Do Not Refinance)"}
                  </p>
                  <p className={`text-4xl font-black ${result.shouldRefinance ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    {formatCurrency(Math.abs(result.netSavings))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.shouldRefinance 
                      ? "This is the total amount you will save over the life of the new loan, including all fees."
                      : "This refinance will cost you more money in the long run. Consider keeping your current loan."}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-y md:divide-y-0 divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Current Monthly</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(result.currentMonthly)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-primary font-bold mb-1">New Monthly</p>
                    <p className="text-sm font-black text-primary">{formatCurrency(result.newMonthly)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Monthly Difference</p>
                    <p className={`text-sm font-bold ${result.monthlySavings > 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {result.monthlySavings > 0 ? '-' : '+'}{formatCurrency(Math.abs(result.monthlySavings))}
                    </p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Break-Even Point</p>
                    <p className="text-sm font-bold text-foreground">
                      {result.breakEvenMonths !== null ? `${result.breakEvenMonths} Months` : 'Instant'}
                    </p>
                  </div>
                </div>

                {mounted && (
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4">Current vs New Loan Comparison</p>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(val) => `$${(val)}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="Current Loan" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="New Loan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>Why Consider Auto Loan Refinancing?</h2>
            <p>Auto loan refinancing involves taking out a new loan to pay off your existing car loan, typically to lower the interest rate, reduce the monthly payment, or shorten the term. Unlike a mortgage refinance — which can take weeks and cost thousands in closing fees — auto refinancing is fast, inexpensive, and can often be completed entirely online. If you bought your car through a dealership, there is a high probability you were subjected to a dealer markup on your rate. Dealerships routinely add 1% to 3% to the interest rate the bank actually approved you for as their commission. Refinancing directly with a credit union or online lender lets you bypass that markup.</p>

            <h2>When Does Refinancing Make Sense?</h2>
            <p>Three primary scenarios make auto loan refinancing a mathematically sound move. First, if your credit score has improved significantly since you bought the car — say, you had subprime credit at purchase and have since built a solid payment history — you may now qualify for a rate tier that cuts your interest costs by thousands. Second, if macroeconomic conditions have caused market interest rates to fall, the general rate environment may now be more favorable than when you took out the original loan. Third, if you are facing a cash-flow emergency, refinancing to a longer term can lower your required monthly payment and prevent a repossession, even if it costs more in total interest over the life of the loan.</p>

            <h2>The Danger of Extending the Term</h2>
            <p>Our calculator computes "Net Savings" rather than just monthly payment difference — and that distinction is critical. Many lenders advertise a lower payment by simply extending your loan term, not by reducing your rate. If you have 36 months left on a $20,000 loan at 7%, your payment is roughly $617. A new 72-month loan at the same 7% drops the payment to $341, but you pay approximately $2,000 more in total interest and spend an extra three years in debt. Extending the term also dramatically increases the risk of going underwater, meaning you owe more than the depreciating car is worth.</p>

            <h2>Understanding the Break-Even Point</h2>
            <p>Auto refinance fees are low but rarely zero. You may owe state title transfer fees, registration fees, or a lender origination charge. The break-even point tells you exactly how many months of monthly savings are required to recover those upfront costs. If fees total $150 and you save $50 a month, you break even after 3 months. If you plan to sell or trade the car before that point, the refinance is a net loss. Always confirm the break-even period before signing and ensure you intend to keep the car long enough to benefit.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/auto-loan-refinance-savings-calculator" />
          <PopularCalculators exclude="/calculator/auto-loan-refinance-savings-calculator" />
        </div>
      </div>
    </>
  );
}
