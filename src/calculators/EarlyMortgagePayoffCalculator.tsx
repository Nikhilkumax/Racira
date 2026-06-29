"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Home, Calendar, DollarSign, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. Interfaces
interface PayoffInputs {
  principal: number;
  interestRate: number;
  remainingYears: number;
  remainingMonths: number;
  extraMonthly: number;
  extraYearly: number;
  oneTimePayment: number;
}

interface ScheduleRow {
  month: number;
  year: number;
  standardBalance: number;
  earlyBalance: number;
  standardInterestPaid: number;
  earlyInterestPaid: number;
}

interface PayoffResult {
  standardMonthlyPayment: number;
  standardTotalInterest: number;
  standardTotalMonths: number;
  earlyTotalInterest: number;
  earlyTotalMonths: number;
  interestSaved: number;
  monthsSaved: number;
  schedule: ScheduleRow[];
  chartData: { year: number; Standard: number; Early: number }[];
}

const DEFAULTS = {
  principal: "250000",
  interestRate: "6.5",
  remainingYears: "25",
  remainingMonths: "0",
  extraMonthly: "200",
  extraYearly: "0",
  oneTimePayment: "5000",
};

// 2. Core Logic
const calculatePayoff = (inputs: PayoffInputs): PayoffResult => {
  const { principal, interestRate, remainingYears, remainingMonths, extraMonthly, extraYearly, oneTimePayment } = inputs;
  
  const totalMonths = remainingYears * 12 + remainingMonths;
  const monthlyRate = interestRate / 100 / 12;

  // Standard Payment Calculation
  let standardPayment = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    standardPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (totalMonths > 0) {
    standardPayment = principal / totalMonths;
  }

  const schedule: ScheduleRow[] = [];
  const chartData: { year: number; Standard: number; Early: number }[] = [];

  let standardBal = principal;
  let earlyBal = principal - oneTimePayment;
  if (earlyBal < 0) earlyBal = 0;

  let standardTotalInt = 0;
  let earlyTotalInt = 0;
  let earlyMonthsCount = 0;
  
  // Track yearly data for charts
  let yearStandardBal = standardBal;
  let yearEarlyBal = earlyBal;

  chartData.push({ year: 0, Standard: Math.round(standardBal), Early: Math.round(earlyBal) });

  for (let m = 1; m <= totalMonths; m++) {
    // Standard Path
    let stdInt = 0;
    if (standardBal > 0) {
      stdInt = standardBal * monthlyRate;
      standardTotalInt += stdInt;
      let stdPrincipalPayment = standardPayment - stdInt;
      if (stdPrincipalPayment > standardBal) stdPrincipalPayment = standardBal;
      standardBal -= stdPrincipalPayment;
    }

    // Early Path
    let earlyInt = 0;
    if (earlyBal > 0) {
      earlyMonthsCount++;
      earlyInt = earlyBal * monthlyRate;
      earlyTotalInt += earlyInt;
      
      let currentPayment = standardPayment + extraMonthly;
      if (m % 12 === 0) {
        currentPayment += extraYearly;
      }
      
      let earlyPrincipalPayment = currentPayment - earlyInt;
      if (earlyPrincipalPayment > earlyBal) earlyPrincipalPayment = earlyBal;
      earlyBal -= earlyPrincipalPayment;
    }

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      standardBalance: standardBal < 0 ? 0 : standardBal,
      earlyBalance: earlyBal < 0 ? 0 : earlyBal,
      standardInterestPaid: stdInt,
      earlyInterestPaid: earlyInt,
    });

    if (m % 12 === 0 || m === totalMonths) {
      chartData.push({
        year: Math.ceil(m / 12),
        Standard: Math.round(standardBal < 0 ? 0 : standardBal),
        Early: Math.round(earlyBal < 0 ? 0 : earlyBal)
      });
    }
  }

  return {
    standardMonthlyPayment: standardPayment,
    standardTotalInterest: standardTotalInt,
    standardTotalMonths: totalMonths,
    earlyTotalInterest: earlyTotalInt,
    earlyTotalMonths: earlyMonthsCount,
    interestSaved: standardTotalInt - earlyTotalInt,
    monthsSaved: totalMonths - earlyMonthsCount,
    schedule,
    chartData
  };
};

// 3. Components
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

export default function EarlyMortgagePayoffCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [remainingYears, setRemainingYears] = useState(DEFAULTS.remainingYears);
  const [remainingMonths, setRemainingMonths] = useState(DEFAULTS.remainingMonths);
  const [extraMonthly, setExtraMonthly] = useState(DEFAULTS.extraMonthly);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [extraYearly, setExtraYearly] = useState(DEFAULTS.extraYearly);
  const [oneTimePayment, setOneTimePayment] = useState(DEFAULTS.oneTimePayment);

  const [result, setResult] = useState<PayoffResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setResult(calculatePayoff({
      principal: parseFloat(principal) || 0,
      interestRate: parseFloat(interestRate) || 0,
      remainingYears: parseInt(remainingYears) || 0,
      remainingMonths: parseInt(remainingMonths) || 0,
      extraMonthly: parseFloat(extraMonthly) || 0,
      extraYearly: parseFloat(extraYearly) || 0,
      oneTimePayment: parseFloat(oneTimePayment) || 0,
    }));
  };

  const reset = () => {
    setPrincipal(DEFAULTS.principal);
    setInterestRate(DEFAULTS.interestRate);
    setRemainingYears(DEFAULTS.remainingYears);
    setRemainingMonths(DEFAULTS.remainingMonths);
    setExtraMonthly(DEFAULTS.extraMonthly);
    setExtraYearly(DEFAULTS.extraYearly);
    setOneTimePayment(DEFAULTS.oneTimePayment);
    setShowAdvanced(false);
    setResult(calculatePayoff({
      principal: parseFloat(DEFAULTS.principal),
      interestRate: parseFloat(DEFAULTS.interestRate),
      remainingYears: parseInt(DEFAULTS.remainingYears),
      remainingMonths: parseInt(DEFAULTS.remainingMonths),
      extraMonthly: parseFloat(DEFAULTS.extraMonthly),
      extraYearly: parseFloat(DEFAULTS.extraYearly),
      oneTimePayment: parseFloat(DEFAULTS.oneTimePayment),
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatMonths = (months: number) => {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y > 0 && m > 0) return `${y} yr ${m} mo`;
    if (y > 0) return `${y} years`;
    return `${m} months`;
  };

  const faqs = [
    { question: "Is paying off my mortgage early a good idea?", answer: "It depends on your financial goals. Paying off your mortgage early guarantees a risk-free return equal to your interest rate and frees up monthly cash flow. However, if your mortgage rate is very low (e.g., 3%), you might earn a higher return by investing those extra payments in the stock market instead." },
    { question: "How does making one extra payment a year help?", answer: "Making one extra full mortgage payment per year (often done by switching to bi-weekly payments) applied directly to your principal can shave 4 to 5 years off a 30-year mortgage and save you tens of thousands of dollars in interest." },
    { question: "Will I be penalized for paying off my mortgage early?", answer: "Most modern mortgages do not have prepayment penalties, but some do. Check your loan documents or contact your lender to confirm. If a penalty exists, it usually applies only if you pay off the entire loan within the first 3-5 years." },
    { question: "Does extra money go to principal or interest?", answer: "You must explicitly tell your lender to apply extra payments to the 'Principal Balance'. Otherwise, some lenders may hold the extra money in an escrow account or apply it as an early prepayment for the next month's standard payment, which does not save you interest." },
    { question: "Should I pay off my mortgage or invest?", answer: "This is the classic 'debt vs. investing' debate. Compare your mortgage interest rate to your expected investment return. If your mortgage rate is 7% and you expect stocks to return 8%, the margin is thin, and the guaranteed 7% tax-free 'return' of paying off the house is very attractive. If your mortgage is 3%, investing is mathematically superior." },
    { question: "Does paying off my mortgage early lower my monthly payment?", answer: "No. Unless you specifically 'recast' your mortgage, your required monthly payment will remain exactly the same. Paying extra simply reduces the total number of payments you have to make at the end of the loan." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Early Mortgage Payoff Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Early Mortgage Payoff Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <CompactInput id="principal" label="Remaining Loan Balance" value={principal} onChange={setPrincipal} prefix="$" />
            <CompactInput id="interestRate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="remainingYears" label="Remaining Term (Yrs)" value={remainingYears} onChange={setRemainingYears} />
              <CompactInput id="remainingMonths" label="Months" value={remainingMonths} onChange={setRemainingMonths} />
            </div>

            <div className="pt-2 border-t border-border mt-1">
              <h3 className="text-sm font-bold text-primary mb-3">Accelerate Payoff</h3>
              <CompactInput id="extraMonthly" label="Extra Monthly Payment" value={extraMonthly} onChange={setExtraMonthly} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                More Extra Payment Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="extraYearly" label="Extra Yearly Payment" value={extraYearly} onChange={setExtraYearly} prefix="$" />
                  <CompactInput id="oneTimePayment" label="One-Time Lump Sum Today" value={oneTimePayment} onChange={setOneTimePayment} prefix="$" />
                </div>
              )}
            </div>

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
                  <div className="border-l-4 rounded-lg p-5 bg-green-500/10 border-green-500">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Total Interest Saved</p>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400">{formatCurrency(result.interestSaved)}</p>
                  </div>
                  <div className="border-l-4 rounded-lg p-5 bg-blue-500/10 border-blue-500">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Time Saved</p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatMonths(result.monthsSaved)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-y md:divide-y-0 divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Standard Interest</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(result.standardTotalInterest)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">New Total Interest</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(result.earlyTotalInterest)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Standard Payoff</p>
                    <p className="text-sm font-bold text-foreground">{formatMonths(result.standardTotalMonths)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center bg-primary/5">
                    <p className="text-[10px] uppercase tracking-wide text-primary font-bold mb-1">New Payoff</p>
                    <p className="text-sm font-black text-primary">{formatMonths(result.earlyTotalMonths)}</p>
                  </div>
                </div>

                {mounted && (
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4">Loan Balance Over Time</p>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEarly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => `Year ${label}`}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Area type="monotone" dataKey="Standard" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorStd)" />
                          <Area type="monotone" dataKey="Early" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEarly)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Why Consider Paying Off Your Mortgage Early?</h2>
            <p>For many homeowners, the mortgage is their largest single debt. A standard 30-year mortgage front-loads the interest, meaning that for the first decade, the vast majority of your monthly payment goes toward the bank's profit rather than building your equity. By utilizing an early mortgage payoff calculator, you can visualize exactly how small additional payments applied directly to your principal can drastically alter the amortization schedule, saving you tens or even hundreds of thousands of dollars in interest over the life of the loan.</p>
            <p>Beyond the pure mathematical savings, paying off a home provides immense psychological benefits. Owning your property free and clear reduces your monthly overhead, provides security against economic downturns, and significantly accelerates your path to financial independence and early retirement.</p>

            <h2>How Additional Principal Payments Work</h2>
            <p>When you make your standard monthly mortgage payment, the bank splits the money into three main buckets: interest based on the current outstanding balance, principal to reduce the balance, and escrow for taxes and insurance. Because interest is calculated on the outstanding principal balance, reducing that balance faster than scheduled creates a compounding effect. If you pay an extra $100 toward the principal today, you won't be charged interest on that $100 next month, or the month after that, for the remainder of the 30-year term. This effectively means that every extra dollar paid toward principal provides a guaranteed, risk-free return equal to your mortgage interest rate.</p>

            <h2>Strategies for Early Payoff</h2>
            <p>The most straightforward approach is simply adding a fixed dollar amount to your regular monthly payment and specifying to the lender that the overage must be applied to the principal balance. Bi-weekly payments are another highly effective method. Instead of paying once a month, you pay half your mortgage every two weeks. Because there are 52 weeks in a year, this results in 26 half-payments — the equivalent of 13 full payments per year. That single extra yearly payment can shave 4 to 5 years off a 30-year loan. You can also apply annual work bonuses, tax refunds, or inheritance windfalls directly to the principal. If you make a massive lump sum payment, you can additionally ask your lender to recast the loan, which keeps the original payoff date but recalculates and lowers your mandatory monthly payment based on the newly reduced principal balance.</p>

            <h2>The Opportunity Cost: Investing vs. Paying Off</h2>
            <p>While being debt-free is a worthy goal, it is crucial to understand the opportunity cost of early mortgage payoff. The math is relatively simple: compare the after-tax interest rate of your mortgage to the expected after-tax return of your investments. If you secured a mortgage during a historically low-rate environment at 3%, paying it off early provides a 3% return on your money. Historical stock market returns average around 7% to 10% annually over long periods, meaning you would build more net worth by making minimum payments and investing the extra cash.</p>
            <p>However, if your mortgage rate is high — at 7% or 8% — the stock market's premium over your rate is much narrower, and the market carries risk. In a high-rate environment, locking in a guaranteed 7% return by eliminating the debt is a highly attractive and mathematically sound strategy.</p>

            <h2>Prepayment Penalties</h2>
            <p>Before aggressively paying down your mortgage, check your loan documents for a prepayment penalty clause. While these are increasingly rare in modern conforming residential mortgages, some subprime loans, commercial loans, or specific portfolio loans still include them. A prepayment penalty is a fee the bank charges if you pay off the loan significantly ahead of schedule, usually within the first three to five years of origination. If your loan has such a penalty, it may negate the financial benefits of early payoff during that window, so always confirm the terms with your lender before beginning any accelerated payment strategy.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/early-mortgage-payoff-calculator" />
          <PopularCalculators exclude="/calculator/early-mortgage-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
