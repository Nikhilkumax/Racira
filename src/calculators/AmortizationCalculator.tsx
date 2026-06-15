"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, CalendarDays } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
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

// 2. Pure Calculation Function
const calculateAmortization = (inputs: AmortizationInputs): AmortizationResults => {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    extraMonthlyPayment
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  const standardMonths = loanTermYears * 12;

  // Calculate standard required payment
  let standardMonthlyPayment = 0;
  if (loanAmount > 0) {
    if (monthlyRate > 0) {
      standardMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, standardMonths)) / (Math.pow(1 + monthlyRate, standardMonths) - 1);
    } else {
      standardMonthlyPayment = loanAmount / standardMonths;
    }
  }

  const standardTotalInterest = (standardMonthlyPayment * standardMonths) - loanAmount;

  // Simulate schedule with extra payments
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

    // Capture chart data (every 12 months or at payoff) to keep chart performant
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

// 3. DEFAULTS Object
const DEFAULTS = {
  loanAmount: "300000",
  interestRate: "6.5",
  loanTermYears: "30",
  extraMonthlyPayment: "0"
};

// Custom Chart Tooltip
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

// Input Component
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

export default function AmortizationCalculator() {
  // 4. Component State
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
    { question: "What exactly is an amortization schedule?", answer: "An amortization schedule is a complete, line-by-line table showing every single payment you will make over the life of a loan. It breaks down exactly how much of each payment is eaten by interest and how much actually reduces your principal debt." },
    { question: "Why is so much of my payment going to interest?", answer: "Amortized loans are 'front-loaded' with interest. Because interest is calculated based on your remaining principal balance, your interest charge is highest in month 1 when your balance is largest. As you slowly pay down the principal over years, the interest charge shrinks, allowing more of your payment to hit the principal." },
    { question: "How can I see the crossover point?", answer: "Look at the Area Chart above. The crossover point is the exact month where the green curve (Principal Paid) overtakes the orange curve (Interest Paid). From that month onward, the majority of your monthly payment is finally building your wealth instead of the bank's." },
    { question: "What happens if I make extra payments?", answer: "Extra payments bypass the interest calculation entirely and go 100% toward the principal balance. By shrinking the principal faster, you force the bank to calculate next month's interest on a smaller number, triggering a compounding snowball effect that saves you massive amounts of money." },
    { question: "Does this work for auto loans too?", answer: "Yes. Almost all fixed-rate debt (mortgages, auto loans, personal loans, student loans) uses this exact same mathematical amortization formula. Simply input your car loan details to see its schedule." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Amortization Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amortization Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
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
                  <CompactInput id="extra" label="Extra Monthly Payment (To Principal)" value={extraMonthlyPayment} onChange={setExtraMonthlyPayment} prefix="$" />
                  <p className="text-xs text-muted-foreground mt-1">Extra payments accelerate amortization, saving you interest.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <CalendarDays className="h-4 w-4" /> Generate Schedule
              </button>
              <button type="button" onClick={handleReset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Standard Monthly Payment</div>
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Principal vs Interest Payment Composition</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">Shows how much of your monthly payment goes to the bank vs your equity.</p>
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
                  <h3 className="text-base font-bold mb-4">Loan Summary</h3>
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
                    <h3 className="text-base font-bold">Amortization Schedule</h3>
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

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Understanding the Amortization Calculator</h2>
            <p>Amortization is the financial engine that drives almost all consumer and commercial debt. It is the mathematical process of spreading out a loan into a series of fixed payments over a set period of time. While your monthly payment to the bank remains identical every single month, the invisible breakdown of that payment changes drastically over the life of the loan. Our <strong>Amortization Calculator</strong> is designed to pull back the curtain on this process, providing you with a complete, line-by-line schedule of exactly where your money is going.</p>
            <p>Without understanding amortization, borrowers focus entirely on the "Monthly Payment" and ignore the "Total Interest" cost. By visualizing the crossover point—the exact month where you finally begin paying more toward your principal than to the bank's interest—you can make vastly superior financial decisions regarding debt consolidation, refinancing, and early payoff strategies.</p>

            <h2>The Principal-Interest Shift (Front-Loaded Interest)</h2>
            <p>The most important concept to grasp is that amortized loans are heavily front-loaded with interest. Why? Because the bank calculates your monthly interest charge based on your <em>remaining principal balance</em>. </p>
            <p>In month one, your principal balance is at its absolute highest. Therefore, the interest charge is at its absolute highest. If you take out a $300,000 mortgage at 6.5%, your fixed monthly payment is $1,896. In month one, $1,625 of that payment goes directly to the bank as interest. Only $271 goes toward paying down your $300,000 debt. It is a highly discouraging realization.</p>
            <p>However, because you paid off that tiny $271, your balance in month two is now $299,729. The bank calculates interest on this slightly smaller number, resulting in an interest charge of $1,623. Now, $273 goes to principal. This fractional shift continues every single month for 30 years. By year 28, the situation has flipped entirely: almost the entire $1,896 payment is attacking the principal, and the interest charge is negligible.</p>

            <h2>Visualizing the Crossover Point</h2>
            <p>The Area Chart provided in our calculator is critical for understanding your loan's timeline. Look for the "Crossover Point." This is the intersection where the green curve (Principal) crosses above the orange curve (Interest).</p>
            <p>Before the crossover point, the bank is making more money off the transaction than you are building in equity. On a standard 30-year mortgage at 6.5%, this crossover point doesn't occur until year 19. For the first 18 years of the loan, you are primarily enriching the lender. By visually understanding how long it takes to reach this crossover point, you can better strategize when to sell a property or when to refinance.</p>

            <h2>The Massive Power of Extra Payments</h2>
            <p>Because the amortization schedule front-loads interest so heavily, it creates a massive mathematical vulnerability that the borrower can exploit: Extra Principal Payments.</p>
            <p>If your mandatory payment is $1,896 (with $1,625 going to interest), and you send the bank an extra $200 with instructions to apply it to the principal, that $200 skips the interest calculation entirely. It hits the core debt with 100% efficiency. This forces the bank to calculate next month's interest on a permanently smaller balance. </p>
            <p>Using our "Add Extra Payments" toggle, you can model this. Adding just $200 a month to a 30-year mortgage can shave off 5 to 7 years of payments and save you over $80,000 in interest. You are essentially dismantling the bank's front-loaded interest structure brick by brick.</p>

            <h2>How to Read an Amortization Schedule</h2>
            <p>The detailed table at the bottom of the calculator is your financial roadmap. Here is how to use it:</p>
            <p><strong>1. Checking Payoff Balances:</strong> If you plan to sell your house or car in 4 years, switch the table to "Yearly Summary" and look at the "Remaining Balance" at the end of Year 4. This is exactly what you will still owe the bank. If that number is higher than the expected resale value of the asset, you will be "underwater" and owe cash at closing.</p>
            <p><strong>2. Tax Deductions:</strong> If you are financing a commercial property or a primary residence where interest is tax-deductible, the "Interest Paid" column shows you exactly how much of a deduction you can claim for the IRS in any given year.</p>

            <h2>Amortization in Auto Loans vs. Mortgages</h2>
            <p>The mathematical formula for amortization is universal, but the term length drastically changes the experience.</p>
            <p><strong>Auto Loans (Short Term):</strong> A 5-year auto loan amortizes very quickly. Because the term is short, the crossover point is reached much faster (usually within the first 18 months). The total interest paid is relatively small compared to the principal.</p>
            <p><strong>Mortgages (Long Term):</strong> A 30-year mortgage amortizes agonizingly slowly. Because the term is stretched over three decades to keep the monthly payment low, the interest has time to compound massively. It is very common on a 30-year mortgage to pay more in total interest than the original purchase price of the house.</p>

            <h2>Negative Amortization (The Danger Zone)</h2>
            <p>It is vital to mention "Negative Amortization." This occurs in predatory loan structures (like Option ARMs or some income-based student loans) where the required monthly payment is <em>less</em> than the interest generated that month.</p>
            <p>If your loan generates $1,000 in interest, but the bank allows you to only pay $500, the unpaid $500 doesn't vanish. It is added to your principal balance. The next month, you owe interest on a larger balance. Your debt grows exponentially every month despite you making payments. Our calculator strictly models standard, positive amortization, ensuring your debt reaches zero by the end of the term.</p>

            <h2>Tips and Best Practices</h2>
            <p><strong>Shorter Terms Equal Less Interest:</strong> If you can afford the higher monthly payment, always opt for a 15-year mortgage over a 30-year, or a 4-year auto loan over a 7-year. You will reach the principal-interest crossover point years earlier and save tens of thousands in interest.</p>
            <p><strong>Refinance Strategically:</strong> If you are 10 years into a 30-year mortgage, you have finally paid off the most expensive interest years. If you refinance into a new 30-year mortgage to get a slightly lower rate, you are resetting the amortization clock back to month one, subjecting yourself to front-loaded interest all over again. If you refinance late in a loan, always refinance into a shorter term (like a 15-year) to maintain your amortization momentum.</p>

            <h2>Conclusion</h2>
            <p>An amortization schedule is not just a spreadsheet; it is the absolute truth of your debt. Lenders use marketing to focus your attention on affordable monthly payments, but the amortization table reveals the true cost of renting their money.</p>
            <p>By leveraging this Amortization Calculator, you shift the power dynamic. You can visualize exactly when your payments begin building your wealth rather than the bank's, you can accurately project your equity for future sales, and you can model aggressive early-payoff strategies to achieve financial freedom years ahead of schedule.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amortization-calculator" />
          <PopularCalculators exclude="/calculator/amortization-calculator" />
        </div>
      </div>
    </>
  );
}
