"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calendar, Target, TrendingDown, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface CompInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
}

interface CompResult {
  monthlyPayment: number;
  monthlyTotalInterest: number;
  monthlyTotalTime: number;
  
  biweeklyPayment: number;
  biweeklyTotalInterest: number;
  biweeklyTotalTime: number;
  
  interestSaved: number;
  timeSavedMonths: number;
  
  chartData: { name: string; Monthly: number; Biweekly: number }[];
}

const DEFAULTS = {
  loanAmount: "250000",
  interestRate: "6.5",
  loanTermYears: "30",
};

const calculateComparison = (inputs: CompInputs): CompResult => {
  const { loanAmount, interestRate, loanTermYears } = inputs;
  
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  // Monthly Calculations
  let monthlyPayment = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (totalMonths > 0) {
    monthlyPayment = loanAmount / totalMonths;
  }
  const monthlyTotalCost = monthlyPayment * totalMonths;
  const monthlyTotalInterest = monthlyTotalCost - loanAmount;

  // Biweekly Calculations (True Biweekly applies half the monthly payment every 14 days)
  const biweeklyPayment = monthlyPayment / 2;
  // Biweekly rate approximations for exact amortization: 
  // Technically, there are 26 payments a year. 
  // Let's iterate to find exact time and interest.
  let biweeklyBal = loanAmount;
  let biweeklyTotalInterest = 0;
  let biweeklyPaymentCount = 0;
  
  // Rate per biweekly period (approximate 26 periods a year)
  // Effective rate per 14 days:
  const dailyRate = interestRate / 100 / 365;
  const biRate = dailyRate * 14;

  if (biweeklyPayment > 0) {
    while (biweeklyBal > 0 && biweeklyPaymentCount < 1000) { // cap at 1000 payments to prevent infinite loop
      biweeklyPaymentCount++;
      const interest = biweeklyBal * biRate;
      biweeklyTotalInterest += interest;
      
      let principalPayment = biweeklyPayment - interest;
      if (principalPayment > biweeklyBal) principalPayment = biweeklyBal;
      biweeklyBal -= principalPayment;
    }
  }

  // Convert 26 payments/year to months for display comparison
  const biweeklyTotalMonths = (biweeklyPaymentCount / 26) * 12;
  
  const interestSaved = monthlyTotalInterest - biweeklyTotalInterest;
  const timeSavedMonths = totalMonths - biweeklyTotalMonths;

  const chartData = [
    { name: "Total Interest Paid", Monthly: Math.round(monthlyTotalInterest), Biweekly: Math.round(biweeklyTotalInterest) },
    { name: "Payoff Time (Years)", Monthly: Math.round(loanTermYears * 10) / 10, Biweekly: Math.round((biweeklyTotalMonths / 12) * 10) / 10 },
  ];

  return {
    monthlyPayment,
    monthlyTotalInterest,
    monthlyTotalTime: totalMonths,
    biweeklyPayment,
    biweeklyTotalInterest,
    biweeklyTotalTime: biweeklyTotalMonths,
    interestSaved,
    timeSavedMonths,
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

export default function BiweeklyVsMonthlyLoanComparison() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  
  const [result, setResult] = useState<CompResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setResult(calculateComparison({
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseInt(loanTermYears) || 0,
    }));
  };

  const reset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setResult(calculateComparison({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTermYears: parseInt(DEFAULTS.loanTermYears),
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatMonths = (months: number) => {
    const y = Math.floor(months / 12);
    const m = Math.round(months % 12);
    if (y > 0 && m > 0) return `${y} yrs ${m} mo`;
    if (y > 0) return `${y} years`;
    return `${m} months`;
  };

  const faqs = [
    { question: "How exactly does a biweekly payment plan save me money?", answer: "When you pay monthly, you make 12 payments a year. When you pay half your monthly amount every two weeks, you make 26 half-payments because there are 52 weeks in a year. 26 half-payments equals 13 full payments. That one extra full payment per year is applied directly to your principal balance, accelerating your payoff and severely reducing total interest." },
    { question: "Can I just make one extra payment a year instead?", answer: "Yes. Mathematically, making one extra full payment a year (e.g., adding an extra payment in December) produces very similar savings to a biweekly plan. A biweekly plan simply automates this process and aligns it with people who get paid every two weeks." },
    { question: "Will my lender charge a fee to switch to biweekly payments?", answer: "Some lenders or third-party servicers charge a setup fee or a per-transaction fee to automate a biweekly schedule. If they do, do not use their program. You can achieve the exact same mathematical result for free by simply adding 1/12th of your standard payment to your principal balance every single month." },
    { question: "Does this work for auto loans and personal loans too?", answer: "Yes, the math works identically for any simple interest amortizing loan. However, the total dollar savings on a 5-year auto loan are much smaller than on a 30-year mortgage because there is less time for the interest to compound." },
    { question: "If I switch to biweekly, can I switch back to monthly?", answer: "If you sign up for an official biweekly program with your lender, they will draft the money automatically, and modifying the agreement can be difficult. If you DIY the strategy by just overpaying your monthly bill, you have total flexibility to stop making the extra principal payments at any time." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Biweekly vs Monthly Loan Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Biweekly vs Monthly Loan Comparison</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <CompactInput id="loanAmount" label="Total Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
            <CompactInput id="interestRate" label="Interest Rate (APR)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" />
            <CompactInput id="loanTermYears" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="Years" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-l-4 rounded-lg p-5 bg-green-500/10 border-green-500 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Total Interest Saved</p>
                    <p className="text-4xl font-black text-green-600 dark:text-green-400">{formatCurrency(result.interestSaved)}</p>
                    <p className="text-sm text-muted-foreground mt-1">By switching to a biweekly schedule</p>
                  </div>
                  <div className="border-l-4 rounded-lg p-5 bg-blue-500/10 border-blue-500 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Time Shaved Off Loan</p>
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{formatMonths(result.timeSavedMonths)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Reaching debt freedom faster</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-y md:divide-y-0 divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Standard Monthly</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(result.monthlyPayment)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center bg-primary/5">
                    <p className="text-[10px] uppercase tracking-wide text-primary font-bold mb-1">Biweekly Payment</p>
                    <p className="text-sm font-black text-primary">{formatCurrency(result.biweeklyPayment)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Standard Total Interest</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(result.monthlyTotalInterest)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center bg-primary/5">
                    <p className="text-[10px] uppercase tracking-wide text-primary font-bold mb-1">Biweekly Total Interest</p>
                    <p className="text-sm font-black text-primary">{formatCurrency(result.biweeklyTotalInterest)}</p>
                  </div>
                </div>

                {mounted && (
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4">Interest & Time Comparison</p>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(val) => val > 100 ? `$${(val / 1000).toFixed(0)}k` : val} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            formatter={(value: number, name: string, props: any) => {
                              if (props.payload.name === "Total Interest Paid") return formatCurrency(value);
                              return `${value} Years`;
                            }}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="Monthly" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Biweekly" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Biweekly Payment Plan?</h2>
            <p>Most standard loans — including mortgages, auto loans, and personal loans — are built around a monthly amortization schedule: one payment per month, twelve payments per year. A true biweekly payment plan changes that rhythm. Instead of paying once a month, you take your standard monthly payment, split it exactly in half, and submit that half-payment every two weeks. Because there are 52 weeks in a calendar year, a biweekly schedule produces exactly 26 half-payments annually.</p>

            <h2 className="text-2xl font-bold mb-3">Where the Savings Come From</h2>
            <p>The arithmetic is straightforward. Twenty-six half-payments equal 13 full monthly payments per year — one more than the 12 you would make on a standard monthly schedule. That single extra payment is applied entirely to your principal balance, which immediately reduces the amount of interest accruing the following period. Over the lifespan of a standard 30-year mortgage, this one additional payment per year can shave four to five years off the term and save tens of thousands of dollars in total interest paid.</p>

            <h2 className="text-2xl font-bold mb-3">Why You Should Not Pay for a Biweekly Program</h2>
            <p>Many mortgage lenders and third-party financial services companies offer to manage a biweekly payment plan for you, advertising the exact savings our calculator projects. They often charge an enrollment fee of up to $400 and a per-transaction fee for every payment processed. Do not pay for this service. You can replicate the identical mathematical result at no cost. The simplest approach is to divide your standard monthly payment by 12 and add that amount as extra principal with each bill. After twelve months you will have made one extra full payment. Alternatively, you can save the equivalent of one full payment over the course of the year and make a single lump-sum principal payment in December.</p>

            <h2 className="text-2xl font-bold mb-3">Is a Biweekly Strategy Right for You?</h2>
            <p>A biweekly payment plan works especially well for individuals who receive their paychecks every two weeks, since it naturally aligns cash inflows with loan outflows. It enforces savings discipline and builds home equity faster with no extra out-of-pocket cost beyond the one additional annual payment. However, if your mortgage interest rate is historically low — say, under 4% — you may generate a better return by investing that extra payment in a diversified index fund rather than prepaying the loan. Use the comparison above to calculate exactly how much interest you stand to save, then weigh that guaranteed return against your other financial opportunities before deciding.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/biweekly-vs-monthly-loan-comparison" />
          <PopularCalculators exclude="/calculator/biweekly-vs-monthly-loan-comparison" />
        </div>
      </div>
    </>
  );
}
