"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, CalendarDays } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { calculateAmortization, type AmortizationInputs, type AmortizationResults } from "./amortizationLogic";

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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amortization Calculator</h1>

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
                  <CompactInput id="extra" label="Extra Monthly Payment (To Principal)" value={extraMonthlyPayment} onChange={setExtraMonthlyPayment} prefix="$" />
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <div className="mt-12 space-y-8 text-base text-foreground">
              <div>
                <h2 className="text-2xl font-bold mb-3">What Is an Amortization Calculator?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Amortization is the financial engine that drives almost all consumer and commercial debt. It is the mathematical process of spreading out a loan into a series of fixed payments over a set period of time. While your monthly payment to the bank remains identical every single month, the invisible breakdown of that payment changes drastically over the life of the loan. Our amortization calculator is designed to pull back the curtain on this process, providing you with a complete, line-by-line schedule of exactly where your money is going.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  When you take out a standard fixed-rate loan—whether it's a 30-year mortgage, a 5-year auto loan, or a 10-year personal loan—the lender uses an amortization formula to guarantee they receive their required profit (the interest) while slowly retiring your principal debt. This structured repayment plan protects the lender while offering you the predictability of a fixed monthly budget. However, without a visual tool like our calculator, borrowers are essentially flying blind, unaware of just how heavily weighted their initial payments are toward lender profit.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-3">The Mechanics of Loan Repayment</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The most important concept to grasp is that amortized loans are heavily front-loaded with interest. The bank calculates your monthly interest charge based strictly on your remaining principal balance at that specific moment in time. In month one, your principal balance is at its absolute highest point, which means the interest charge generated for that month is also at its peak.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Because your total monthly payment is fixed, the large interest charge consumes the vast majority of your payment, leaving only a tiny fraction to actually reduce your principal debt. However, as you make payments and gradually (albeit slowly) reduce the principal, the interest charge for the next month naturally shrinks. This allows a slightly larger portion of your fixed payment to hit the principal. Over years, this creates a compounding effect where your equity growth accelerates.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  The monthly payment uses the standard amortization formula: <br/>
                  <strong>M = P × [r(1+r)^n] / [(1+r)^n – 1]</strong><br/>
                  Where <em>M</em> is your monthly payment, <em>P</em> is the principal loan amount, <em>r</em> is your monthly interest rate (your annual rate divided by 12), and <em>n</em> is the total number of payments (years multiplied by 12).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Visualizing the Crossover Point</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Without understanding amortization, borrowers focus entirely on the monthly payment and ignore the total interest cost. Our calculator displays a detailed schedule breaking down exactly how much of each payment goes toward interest versus principal. The area chart above provides a critical visual representation of this shift over time.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  The most crucial milestone in any loan's life is the "crossover point." This is the exact month where the green curve (Principal Paid) overtakes the orange curve (Interest Paid). From that month onward, the majority of your monthly payment is finally building your wealth instead of simply renting the bank's money. On a standard 30-year mortgage at average interest rates, this crossover point often doesn't occur until year 15 or 16. By aggressively managing your debt, you can force this crossover point to happen years earlier.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Key Factors Influencing Your Loan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Several key inputs drive the mathematics of your amortization schedule:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                  <li><strong>The Loan Amount (Principal):</strong> This determines the starting balance on which all interest is calculated. A larger principal mathematically requires a larger interest payment right out of the gate.</li>
                  <li><strong>The Interest Rate:</strong> This dictates the fundamental cost of borrowing. Even a microscopic 0.5% difference in the rate can drastically alter the total interest paid over a 30-year timeframe, often swinging the total cost by tens of thousands of dollars.</li>
                  <li><strong>The Loan Term:</strong> This sets the schedule for repayment. A shorter loan term (like 15 years) results in significantly higher monthly payments but drastically less total interest. A longer term (like 30 years) lowers the monthly payment to make the loan "affordable," but allows interest to compound against you over a massive period of time, enriching the bank.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">The Power of Extra Principal Payments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Because the amortization schedule front-loads interest so heavily, it creates a massive mathematical vulnerability that the educated borrower can exploit. Our advanced options let you model this vulnerability by adding extra monthly payments. 
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Unlike your standard payment, extra payments bypass the interest calculation entirely. They act as a direct strike against your principal balance. By shrinking the principal faster than the bank planned, you force the lender to calculate next month's interest on a permanently smaller number. This triggers a cascading snowball effect. Every extra dollar you pay today effectively "kills" all the future interest that dollar would have generated over the remaining decades of the loan.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">A Practical Mathematical Example</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Consider a $300,000 home loan at a 6.5% interest rate mapped over 30 years. The mandatory fixed monthly payment is approximately $1,896. In the very first month, a staggering $1,625 goes directly to the bank as pure interest profit, while only $271 goes toward actually paying off your home. 
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  If you use the advanced options to send the bank an extra $200 every single month—specifying that it must be applied strictly to the principal—you skip the interest calculation on that $200. This small, consistent addition can shave more than six years off a 30-year mortgage and save you upwards of $85,000 in pure interest payments. You are effectively buying back years of your life and reclaiming wealth that would have otherwise gone to a financial institution.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Strategic Tips & Best Practices</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The detailed table generated by our calculator serves as your personal financial roadmap. Here are several ways to leverage it effectively:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                  <li><strong>Planning a Sale:</strong> If you plan to sell a house or trade in a car in five years, check the "Remaining Balance" column at month 60. This tells you exactly what you will still owe the bank, allowing you to accurately project your net proceeds from the sale.</li>
                  <li><strong>Choosing Terms:</strong> Always compare the amortization schedules of different loan terms side-by-side. If you can afford the higher monthly payment, always opt for a shorter term. A 15-year mortgage forces the principal-interest crossover point to happen almost immediately compared to a 30-year loan.</li>
                  <li><strong>Refinancing Risks:</strong> If you are 10 years into a 30-year loan and decide to refinance, be incredibly careful about resetting your term back to 30 years. Doing so resets your amortization schedule back to month one, where the payments are heavily front-loaded with interest again. If you refinance late in a loan, always try to refinance into a shorter term (like 15 or 20 years) to maintain your forward momentum.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Reclaiming Your Financial Power</h2>
                <p className="text-muted-foreground leading-relaxed">
                  An amortization schedule is not just a dry spreadsheet; it is the absolute mathematical truth of your debt. Lenders spend billions on marketing to focus your attention entirely on the "affordable monthly payment," actively distracting you from the true cost of renting their money. 
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By leveraging this amortization calculator, you shift the power dynamic back in your favor. You gain the ability to visualize exactly when your hard-earned money begins building your own wealth rather than the bank's bottom line. You can accurately project your equity, avoid being trapped "underwater" on auto loans, and model aggressive, early-payoff strategies to achieve financial freedom years—or even decades—ahead of schedule.
                </p>
              </div>
            </div>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amortization-calculator" />
          <PopularCalculators exclude="/calculator/amortization-calculator" />
        </div>
      </div>
    </>
  );
}
