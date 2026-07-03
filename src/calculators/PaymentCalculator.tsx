"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface PaymentInputs {
  loanAmount: number;
  annualInterestRate: number;
  loanTermYears: number;
  paymentFrequency: number; // Payments per year (12, 26, 52, etc)
}

interface PaymentResults {
  recurringPayment: number;
  totalInterestPaid: number;
  totalPayback: number;
  totalNumberOfPayments: number;
  annualPaymentCost: number;
  effectiveAPR: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  scheduleRows: AmortRow[]; // Renamed from monthlyRows as it could be weekly
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculatePayment = (inputs: PaymentInputs): PaymentResults => {
  const {
    loanAmount,
    annualInterestRate,
    loanTermYears,
    paymentFrequency
  } = inputs;

  const ratePerPeriod = (annualInterestRate / 100) / paymentFrequency;
  const totalNumberOfPayments = loanTermYears * paymentFrequency;

  let recurringPayment = 0;
  if (loanAmount > 0) {
    if (ratePerPeriod > 0) {
      recurringPayment = (loanAmount * ratePerPeriod * Math.pow(1 + ratePerPeriod, totalNumberOfPayments)) / (Math.pow(1 + ratePerPeriod, totalNumberOfPayments) - 1);
    } else {
      recurringPayment = loanAmount / totalNumberOfPayments;
    }
  }

  const totalPayback = recurringPayment * totalNumberOfPayments;
  const totalInterestPaid = Math.max(0, totalPayback - loanAmount);
  const annualPaymentCost = recurringPayment * paymentFrequency;
  
  // Effective Annual Rate (APY / EAR) formula: (1 + r/n)^n - 1
  const effectiveAPR = (Math.pow(1 + ratePerPeriod, paymentFrequency) - 1) * 100;

  // Generate Schedule
  let balance = loanAmount;
  const scheduleRows: AmortRow[] = [];
  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;
  const yearlyRows: AmortRow[] = [];

  for (let p = 1; p <= totalNumberOfPayments && balance > 0.01; p++) {
    const interest = balance * ratePerPeriod;
    let principal = recurringPayment - interest;
    
    if (principal > balance) {
      principal = balance;
    }
    
    balance -= principal;
    
    scheduleRows.push({
      period: p,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance)
    });

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += (interest + principal);

    if (p % paymentFrequency === 0 || p === totalNumberOfPayments) {
       yearlyRows.push({
         period: Math.ceil(p / paymentFrequency),
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

  const chartData = [
    { name: "Principal Debt", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterestPaid, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  let freqLabel = "Monthly";
  if (paymentFrequency === 52) freqLabel = "Weekly";
  if (paymentFrequency === 26) freqLabel = "Bi-Weekly";
  if (paymentFrequency === 4) freqLabel = "Quarterly";
  if (paymentFrequency === 1) freqLabel = "Annually";

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Nominal Interest Rate", value: `${annualInterestRate.toFixed(2)}%` },
    { label: "Effective Annual Rate (EAR)", value: `${effectiveAPR.toFixed(2)}%` },
    { label: "Payment Frequency", value: freqLabel },
    { label: "Total Number of Payments", value: `${totalNumberOfPayments}` },
    { label: "Annual Cash Flow Required", value: `$${annualPaymentCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr` }
  ];

  const breakdown = [
    { label: "Original Principal", amount: `$${loanAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest Paid", amount: `$${totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Total Cost of Financing", amount: `$${totalPayback.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    recurringPayment,
    totalInterestPaid,
    totalPayback,
    totalNumberOfPayments,
    annualPaymentCost,
    effectiveAPR,
    chartData,
    summaryStats,
    breakdown,
    scheduleRows,
    yearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  loanAmount: "10000",
  annualInterestRate: "10",
  loanTermYears: "3",
  paymentFrequency: "12"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="font-extrabold text-sm" style={{ color: payload[0].payload.color }}>
          ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
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

export default function PaymentCalculator() {
  // 4. Component State
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [annualInterestRate, setAnnualInterestRate] = useState(DEFAULTS.annualInterestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [paymentFrequency, setPaymentFrequency] = useState(DEFAULTS.paymentFrequency);

  const [results, setResults] = useState<PaymentResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "detailed">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: PaymentInputs = {
      loanAmount: parseFloat(loanAmount) || 0,
      annualInterestRate: parseFloat(annualInterestRate) || 0,
      loanTermYears: parseFloat(loanTermYears) || 0,
      paymentFrequency: parseInt(paymentFrequency) || 12
    };
    setResults(calculatePayment(inputs));
  };

  const handleReset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setAnnualInterestRate(DEFAULTS.annualInterestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setPaymentFrequency(DEFAULTS.paymentFrequency);
    
    setResults(calculatePayment({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      annualInterestRate: parseFloat(DEFAULTS.annualInterestRate),
      loanTermYears: parseFloat(DEFAULTS.loanTermYears),
      paymentFrequency: parseInt(DEFAULTS.paymentFrequency)
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
    w.document.write(`<html><head><title>Payment Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const getFreqLabel = (freq: string) => {
    if (freq === "52") return "Weekly";
    if (freq === "26") return "Bi-Weekly";
    if (freq === "12") return "Monthly";
    if (freq === "4") return "Quarterly";
    if (freq === "1") return "Annual";
    return "Recurring";
  };

  const faqs = [
    { question: "How does the Payment Calculator work?", answer: "This tool uses the standard amortization formula (M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]) to determine exactly how much cash is required each period to pay down both the principal and the accumulated interest to zero by the end of the term." },
    { question: "Why does payment frequency matter?", answer: "Interest compounds. By paying more frequently (e.g., weekly instead of monthly), you are giving the bank slightly less principal to charge interest on for the remainder of that month. Over long terms, high-frequency payments can save you a noticeable amount of interest." },
    { question: "What is the Effective Annual Rate (EAR)?", answer: "The nominal rate (e.g., 10%) is what lenders advertise. But if interest compounds monthly or daily, you are actually paying slightly more than 10% over the course of the year. The EAR (or APY) calculates the true, mathematical interest rate taking compounding frequency into account." },
    { question: "Can I use this for auto loans and mortgages?", answer: "Yes, this is a universal financial calculator. As long as the loan uses standard simple interest amortization (which 99% of auto loans, personal loans, and fixed-rate mortgages do), these calculations will be perfectly accurate." },
    { question: "Why is the total cost so much higher than my loan amount?", answer: "Because of interest. When you borrow money, you are renting it. The interest is the 'rent' you pay the bank. If you borrow $10,000 for 5 years at 10%, you are renting that money for a long time, resulting in thousands of dollars in rent (interest) on top of returning the original $10,000." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">General Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="amt" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Annual Interest Rate" value={annualInterestRate} onChange={setAnnualInterestRate} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
              <div className="flex flex-col">
                <label htmlFor="freq-select" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                  Payment Frequency
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <select
                    id="freq-select"
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer"
                  >
                    <option value="52">Weekly (52/yr)</option>
                    <option value="26">Bi-Weekly (26/yr)</option>
                    <option value="12">Monthly (12/yr)</option>
                    <option value="4">Quarterly (4/yr)</option>
                    <option value="1">Annually (1/yr)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{getFreqLabel(paymentFrequency)} Payment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.recurringPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">To be paid {results.totalNumberOfPayments} times.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Loan</div>
                    <div className="text-lg font-bold">${parseFloat(loanAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Cost</div>
                    <div className="text-lg font-bold text-emerald-600">${results.totalPayback.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Cost Distribution</h3>
                    <table className="w-full text-base">
                      <tbody>
                        {results.breakdown.map((row, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${row.isTotal ? "font-bold border-t-2 border-border" : ""}`}>
                            <td className="py-2.5">
                              <span className="flex items-center gap-2">
                                {!row.isTotal && <span className={`w-2.5 h-2.5 rounded-full bg-current ${row.colorClass}`} />}
                                {row.label}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">{row.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Principal vs Interest</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={85}
                          paddingAngle={2} dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                      {results.chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Financial Details</h3>
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
                      <button onClick={() => setViewMode("detailed")} className={`px-3 text-xs font-semibold transition-colors ${viewMode === "detailed" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>By Payment</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly Summary</button>
                    </div>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.scheduleRows} yearly={viewMode === "yearly"} />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Universal Payment Calculator</h2>
            <p>At its core, almost all modern debt functions on the exact same mathematical formula. Whether you are financing a $5,000 used car, taking out a $50,000 personal loan to consolidate credit cards, or signing a $500,000 commercial note for a business expansion, the bank calculates your required payment using a standard amortization schedule. Our <strong>General Payment Calculator</strong> is a universal financial tool designed to strip away marketing jargon and reveal the raw mathematics of any fixed-rate loan.</p>
            <p>By inputting just three variables—your loan amount, your interest rate, and your desired term length—you can instantly determine your exact recurring payment. More importantly, this calculator exposes the "Total Interest" metric, showing you exactly how much profit the lender is extracting from you over the life of the loan. Understanding this number is the foundation of financial literacy and responsible borrowing.</p>

            <h2>The Amortization Formula Explained</h2>
            <p>When you borrow money, you are essentially "renting" the bank's cash. The interest rate is the rent you pay. To ensure the bank gets its rent (interest) and its cash back (principal), they use an amortization formula. It looks complex mathematically: <code>M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]</code>, but the concept is simple.</p>
            <p>The formula generates a single, fixed payment amount. However, what happens behind the scenes changes every month. In your first few payments, the majority of your cash goes toward paying the interest generated by your massive initial balance. Only a tiny sliver goes toward reducing the principal debt. As the months pass and the principal slowly shrinks, the interest charge shrinks with it. By your final payments, almost 100% of your cash is going toward principal. This "front-loaded interest" system guarantees the bank makes its profit early in the loan.</p>

            <h2>The Power of Payment Frequency</h2>
            <p>Most borrowers assume they must pay their loans monthly. However, manipulating the frequency of your payments is a powerful tactic for saving money. Our calculator allows you to model Weekly, Bi-Weekly, Monthly, Quarterly, and Annual payment frequencies.</p>
            <p><strong>The Bi-Weekly Strategy:</strong> If you take a standard monthly payment and cut it exactly in half, but pay it every two weeks, a mathematical quirk occurs. There are 52 weeks in a year, which equals 26 bi-weekly payments. 26 half-payments mathematically equals 13 full monthly payments. By paying bi-weekly, you are silently making one extra full payment every year. Because this extra payment attacks the principal directly, it drastically reduces your compounding interest and shortens the overall length of your loan.</p>

            <h2>Analyzing Your Calculator Results</h2>
            <p>To use this calculator effectively, you must understand how to interpret the results beyond just the monthly payment. Here is what you should focus on:</p>
            <p><strong>Total Cost of Financing:</strong> Never look solely at the recurring payment. A car dealership will often say, "We can get you into this car for only $400 a month!" They do this by stretching the loan out to 84 months (7 years). While the $400 payment looks affordable, our calculator will show you that the "Total Cost of Financing" is massive, often resulting in you paying $10,000 in interest on a $30,000 car. You must negotiate based on the total cost, not the monthly payment.</p>
            <p><strong>Effective Annual Rate (EAR / APY):</strong> If you borrow money at a nominal 10% interest rate, but the bank compounds that interest daily or weekly, the actual percentage of interest you pay over the year is higher than 10%. The EAR metric reveals the true, mathematical interest rate taking compounding frequency into account, giving you a more accurate picture of the loan's cost.</p>

            <h2>Term Length vs. Total Interest (The Trade-Off)</h2>
            <p>The length of your loan (the Term) is the most powerful lever you control when managing debt. It dictates a direct, inverse relationship between your monthly cash flow and your long-term wealth.</p>
            <p><strong>Short Term (e.g., 3 Years):</strong> If you finance $20,000 over 3 years, your monthly payment will be high. It will strain your monthly budget. However, because you are paying the debt off so quickly, the bank has very little time to charge you interest. Your Total Interest cost will be exceptionally low.</p>
            <p><strong>Long Term (e.g., 7 Years):</strong> If you finance that same $20,000 over 7 years, your monthly payment will drop significantly. It will feel very affordable. However, the bank is now charging you rent on that money for 84 straight months. Your Total Interest cost will skyrocket. The golden rule of borrowing is to choose the shortest term that you can comfortably afford without risking your emergency fund.</p>

            <h2>When to Borrow and When to Pay Cash</h2>
            <p>This calculator is frequently used to make the "Finance vs. Cash" decision. If you have $20,000 in the bank, should you pay cash for a vehicle, or finance it and keep your cash?</p>
            <p>The answer lies in "Opportunity Cost." If the auto loan rate is 8%, the calculator shows you will pay thousands in interest. You should pay cash. There is no risk-free investment that yields a guaranteed 8% return after taxes. However, if the dealership is offering a promotional 1.9% financing rate, you should take the loan. You can keep your $20,000, put it in a high-yield savings account or index fund earning 5% to 8%, and mathematically "beat the bank" on the spread between the two rates.</p>

            <h2>Practical Examples of Loan Structures</h2>
            <p><strong>Example 1: The Personal Loan Consolidation.</strong> You have $15,000 in credit card debt spread across three cards, all charging 22% interest. Your minimum payments are keeping you trapped. You use this calculator to model a $15,000 personal loan at a fixed 11% for 3 years. The calculator shows a fixed payment of $491/mo. While high, the chart proves you will be 100% debt-free in exactly 36 months, saving thousands in credit card interest.</p>
            <p><strong>Example 2: The Equipment Finance.</strong> Your small business needs a $40,000 piece of machinery. You can finance it at 9% over 5 years. The calculator shows a monthly payment of $830. You run the numbers on your business and realize the machinery will generate $2,000 a month in new profit. The $830 payment is easily absorbed, making the loan a smart, revenue-generating financial decision.</p>

            <h2>Tips and Best Practices for Borrowers</h2>
            <p><strong>Beware of Pre-Computed Interest:</strong> Most loans use "Simple Interest Amortization" (which this calculator models). This means if you pay the loan off early, you don't have to pay the remaining interest. However, some predatory personal loans use "Pre-Computed Interest." In this scheme, the total interest is calculated on day one and permanently attached to the principal. Even if you pay it off in two months, you owe the full 5 years of interest. Always verify your loan is "Simple Interest."</p>
            <p><strong>Always Check the Amortization Schedule:</strong> Use the "Detailed" toggle on our amortization table. Look at payment number 12, or payment number 24. This shows you exactly what your "Payoff Balance" will be at those dates. If you plan to sell the asset (like a car) in two years, checking the schedule ensures you won't owe more on the loan than the asset is worth when you go to sell it.</p>

            <h2>Conclusion</h2>
            <p>Debt is neither inherently good nor inherently evil; it is simply a mathematical tool. When used recklessly without understanding the long-term interest costs, it can destroy wealth. When used strategically to acquire cash-flowing assets or consolidate high-interest liabilities, it can accelerate financial independence.</p>
            <p>By relying on this General Payment Calculator, you remove emotion and marketing from your financial decisions. By modeling your payment frequencies, shortening your terms, and visualizing the true cost of interest, you ensure that every contract you sign serves your long-term wealth rather than the lender's profit margins.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payment-calculator" />
          <PopularCalculators exclude="/calculator/payment-calculator" />
        </div>
      </div>
    </>
  );
}
