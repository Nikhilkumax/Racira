"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AmortizationInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  extraMonthlyPayment: number;
}

interface AmortizationResults {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthsToPayoff: number;
  interestSaved: number;
  monthsSaved: number;
  
  chartData: { month: number; principal: number; interest: number; balance: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const calculateAmortization = (inputs: AmortizationInputs): AmortizationResults => {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    extraMonthlyPayment
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  const standardMonths = loanTermYears * 12;

  let standardMonthlyPayment = 0;
  if (loanAmount > 0) {
    if (monthlyRate > 0) {
      standardMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, standardMonths)) / (Math.pow(1 + monthlyRate, standardMonths) - 1);
    } else {
      standardMonthlyPayment = loanAmount / standardMonths;
    }
  }

  const standardTotalInterest = (standardMonthlyPayment * standardMonths) - loanAmount;

  let balance = loanAmount;
  let totalInterestPaid = 0;
  let monthsToPayoff = 0;
  
  const monthlyRows: AmortRow[] = [];
  const yearlyRows: AmortRow[] = [];
  const chartData = [];

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let m = 1; m <= standardMonths && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    let principal = standardMonthlyPayment + extraMonthlyPayment - interest;
    
    if (principal > balance) {
      principal = balance;
    }
    
    balance -= principal;
    totalInterestPaid += interest;
    monthsToPayoff = m;

    monthlyRows.push({
      period: m,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance)
    });

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += (interest + principal);

    if (m % Math.max(1, Math.floor(standardMonths / 60)) === 0 || balance <= 0.01) {
      chartData.push({
        month: m,
        principal: principal,
        interest: interest,
        balance: Math.max(0, balance)
      });
    }

    if (m % 12 === 0 || balance <= 0.01) {
       yearlyRows.push({
         period: Math.ceil(m / 12),
         payment: currentYearPayment,
         principal: currentYearPrincipal,
         interest: currentYearInterest,
         balance: Math.max(0, balance)
       });
       currentYearInterest = 0;
       currentYearPrincipal = 0;
       currentYearPayment = 0;
    }
  }

  const totalPaid = loanAmount + totalInterestPaid;
  const interestSaved = Math.max(0, standardTotalInterest - totalInterestPaid);
  const monthsSaved = Math.max(0, standardMonths - monthsToPayoff);

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Rate", value: `${interestRate.toFixed(2)}%` },
    { label: "Original Term", value: `${loanTermYears} Years` },
    { label: "Actual Payoff Time", value: `${Math.floor(monthsToPayoff / 12)}y ${monthsToPayoff % 12}m` },
    { label: "Total Interest", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Principal Repayment", amount: `$${loanAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest Paid", amount: `$${totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Total Cost of Financing", amount: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    monthlyPayment: standardMonthlyPayment,
    totalInterest: totalInterestPaid,
    totalPaid,
    monthsToPayoff,
    interestSaved,
    monthsSaved,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};

const DEFAULTS = {
  loanAmount: "250000",
  interestRate: "6.5",
  loanTermYears: "30",
  extraMonthlyPayment: "0"
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1">Month {label} ({Math.floor(label/12)}y {label%12}m)</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: ${entry.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function AmortizationScheduleCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(DEFAULTS.extraMonthlyPayment);

  const [results, setResults] = useState<AmortizationResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: AmortizationInputs = {
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseFloat(loanTermYears) || 0,
      extraMonthlyPayment: parseFloat(extraMonthlyPayment) || 0
    };
    setResults(calculateAmortization(inputs));
  };

  const handleReset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setExtraMonthlyPayment(DEFAULTS.extraMonthlyPayment);
    setShowAdvanced(false);
    
    setResults(calculateAmortization({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTermYears: parseFloat(DEFAULTS.loanTermYears),
      extraMonthlyPayment: parseFloat(DEFAULTS.extraMonthlyPayment)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Amortization Schedule</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is an amortization schedule?", answer: "An amortization schedule is a complete table showing each loan payment broken down into principal and interest components, along with the remaining balance after each payment. It helps borrowers understand exactly how their debt decreases over time." },
    { question: "Why do early payments have so much interest?", answer: "Interest is calculated on the outstanding balance. At the start of a loan the balance is highest, so more of each payment goes to interest. As the principal decreases, less interest accrues and more of each payment reduces the principal." },
    { question: "How is the monthly payment calculated?", answer: "M = P × [r(1+r)^n] / [(1+r)^n – 1], where P = principal, r = monthly interest rate (annual rate / 12), and n = total number of payments (years × 12)." },
    { question: "What happens if I make extra payments?", answer: "Extra payments reduce your principal balance immediately, bypassing the interest calculation. This causes less interest to accrue each subsequent month, shortening the loan term and reducing total interest paid—often saving tens of thousands on a mortgage." },
    { question: "What is the difference between amortization and depreciation?", answer: "Amortization refers to paying off a debt through regular payments over time. Depreciation refers to the accounting reduction in value of a tangible asset over its lifespan. Both spread a cost over time but apply to completely different financial concepts." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Amortization Schedule Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amortization Schedule Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="amt" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Add Extra Payments <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="extra" label="Extra Monthly Payment" value={extraMonthlyPayment} onChange={setExtraMonthlyPayment} prefix="$" />
                  <p className="text-xs text-muted-foreground mt-1">Extra payments accelerate amortization, saving you interest.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid: Results */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Standard Monthly Payment</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-4xl font-bold text-primary tracking-tighter">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  {results.interestSaved > 0 && (
                    <div className="text-sm text-emerald-600 font-bold mt-2">
                      Extra payments save ${results.interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })} and {results.monthsSaved} months!
                    </div>
                  )}
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Loan</div>
                    <div className="text-lg font-bold">${parseFloat(loanAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Cost</div>
                    <div className="text-lg font-bold text-emerald-600">${results.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Area Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px] lg:col-span-2">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Amortization Schedule Chart</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">Visualize the shifting ratio of principal to interest throughout your loan term.</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val).toFixed(0)}`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="interest" name="Interest Paid" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="url(#colorInterest)" strokeWidth={2} />
                        <Area type="monotone" dataKey="principal" name="Principal Paid" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorPrincipal)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Schedule Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {results.summaryStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 sm:[&:nth-last-child(1)]:border-0 sm:[&:nth-last-child(2)]:border-0">
                        <span className="text-muted-foreground">{stat.label}:</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Detailed Amortization Table</h3>
                    <div className="flex rounded-md border border-input overflow-hidden h-8">
                      <button onClick={() => setViewMode("monthly")} className={`px-3 text-xs font-semibold transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    </div>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <section className="mt-12 space-y-8 text-base text-foreground">
              <div>
                <h2 className="text-2xl font-bold mb-3">Understanding the Amortization Schedule</h2>
                <p className="text-muted-foreground leading-relaxed">
                  An amortization schedule is an essential financial tool that maps out every single payment required to pay off a fixed-rate loan over a specified period. Unlike a simple calculator that only provides your monthly payment amount, an amortization schedule calculator generates a comprehensive, line-by-line table. This table explicitly breaks down how much of your payment is allocated toward interest (the lender's profit) versus the principal (the actual reduction of your debt). By generating this schedule, you can visually track your exact remaining balance at any given month or year throughout the life of the loan.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  For major financial decisions like purchasing a home or financing a vehicle, having an amortization schedule is non-negotiable. Without it, you are committing to a long-term contract without fully grasping the true cost of the capital you are borrowing. This calculator allows you to see the complete financial picture before signing any legally binding paperwork.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">How Payments Are Apportioned Over Time</h2>
                <p className="text-muted-foreground leading-relaxed">
                  One of the most surprising realities for new borrowers is discovering just how heavily front-loaded their loan payments are with interest. This is entirely by design and driven by the mathematics of the amortization formula. Because interest is calculated as a percentage of your outstanding principal balance, your interest charges are largest at the very beginning of the loan when your balance is at its highest.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  For example, during the first few years of a typical 30-year mortgage, roughly 70% to 80% of your fixed monthly payment goes directly to the bank as interest. Only the tiny remaining fraction actually builds your equity by paying down the principal. However, as the months pass and the principal slowly decreases, the subsequent interest calculations result in smaller numbers. This allows an ever-increasing portion of your fixed payment to hit the principal, creating a snowball effect in your equity growth toward the later years of the schedule.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Using the Schedule for Tax Preparation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Beyond simply tracking your payoff date, an amortization schedule is an invaluable asset for tax planning. If you hold a mortgage, the interest you pay may be tax-deductible depending on your personal filing situation. Rather than waiting for your lender to send a Form 1098 at the end of the year, you can use the yearly view of the amortization schedule to project exactly how much deductible interest you will pay for the entire fiscal year. 
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Similarly, for business owners or real estate investors financing commercial property or equipment, separating the principal from the interest is an accounting requirement. Principal payments are not tax-deductible (as they are a return of borrowed capital), while the interest portion typically is deductible as a business expense. The schedule provides the exact figures needed for accurate corporate bookkeeping and tax projections.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Modeling Debt Acceleration Strategies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The true power of this amortization schedule calculator lies in its ability to model aggressive debt payoff strategies. Because standard loan payments are structured to maximize the total interest collected by the lender over the maximum possible timeframe, simply paying the minimum required amount is often the least mathematically efficient choice for the borrower.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By utilizing the "Add Extra Payments" feature, you can instantly see how applying additional capital toward the principal rewrites your entire future. Extra payments bypass the standard interest calculation entirely and instantly reduce your outstanding balance. This immediately lowers the interest charge for every single month that follows. Our calculator will update the schedule dynamically, showing you exactly how many months (or years) you can shave off your original term, and precisely how many thousands of dollars in interest you will save.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Comparing Loan Terms and Interest Rates</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Before finalizing any financing, it is highly recommended to run multiple scenarios through the schedule to compare the long-term impact of different loan terms. For instance, comparing a 15-year term against a 30-year term for the same principal amount will yield two entirely different amortization curves. While the 15-year term demands a higher monthly payment, a review of the schedule will reveal that the principal-to-interest ratio is vastly superior from month one. 
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Likewise, you can use the schedule to quantify the true value of "buying down" your interest rate (paying discount points). By comparing the total interest paid on a 6.5% schedule versus a 6.0% schedule, you can determine exactly how many months it will take to break even on the upfront cost of the rate buydown.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Planning for Equity and Refinancing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If your loan includes Private Mortgage Insurance (PMI), the amortization schedule is critical for predicting exactly when that expensive insurance can be legally removed. PMI is generally eligible for cancellation once your principal balance drops to 80% of the home's original value. By examining the "Remaining Balance" column on the schedule, you can pinpoint the exact month and year you will cross that 80% threshold without needing a new appraisal, allowing you to proactively contact your lender and request the removal.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  If you are considering refinancing an existing loan, you must check your current position on the amortization schedule first. If you are 12 years into a 30-year loan, you have finally reached the point where a significant portion of your payment is hitting the principal. Refinancing into a brand-new 30-year loan will reset your schedule back to month one, dragging you back into the heavily front-loaded interest phase and undoing years of financial progress.
                </p>
              </div>
            </section>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amortization-schedule-calculator" />
          <PopularCalculators exclude="/calculator/amortization-schedule-calculator" />
        </div>
      </div>
    </>
  );
}
