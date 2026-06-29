"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, GraduationCap } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface EducationLoanInputs {
  tuitionFees: number;
  livingExpenses: number;
  otherExpenses: number;
  scholarshipsOrGrants: number;
  personalSavings: number;
  interestRate: number;
  repaymentTermYears: number;
  gracePeriodMonths: number;
  payInterestDuringGrace: boolean;
}

interface EducationLoanResults {
  totalLoanAmountRequested: number;
  interestAccruedDuringGrace: number;
  principalAtRepaymentStart: number;
  monthlyPayment: number;
  totalInterestPaidDuringRepayment: number;
  totalInterestPaidOverall: number;
  totalCostOfLoan: number;
  payoffDate: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateEducationLoan = (inputs: EducationLoanInputs): EducationLoanResults => {
  const {
    tuitionFees,
    livingExpenses,
    otherExpenses,
    scholarshipsOrGrants,
    personalSavings,
    interestRate,
    repaymentTermYears,
    gracePeriodMonths,
    payInterestDuringGrace
  } = inputs;

  const totalEducationCost = tuitionFees + livingExpenses + otherExpenses;
  const totalFinancialAid = scholarshipsOrGrants + personalSavings;
  
  const totalLoanAmountRequested = Math.max(0, totalEducationCost - totalFinancialAid);

  const annualRate = interestRate / 100;
  const monthlyRate = annualRate / 12;
  
  // Calculate Interest during Grace Period (Simple Interest typically)
  const interestAccruedDuringGrace = totalLoanAmountRequested * monthlyRate * gracePeriodMonths;

  let principalAtRepaymentStart = totalLoanAmountRequested;
  let upfrontInterestPaid = 0;

  if (payInterestDuringGrace) {
    // Borrower pays interest monthly during school; principal doesn't grow
    upfrontInterestPaid = interestAccruedDuringGrace;
  } else {
    // Interest is capitalized (added to principal)
    principalAtRepaymentStart += interestAccruedDuringGrace;
  }

  const numberOfRepaymentMonths = repaymentTermYears * 12;

  let monthlyPayment = 0;
  if (principalAtRepaymentStart > 0) {
    if (monthlyRate > 0) {
      monthlyPayment = (principalAtRepaymentStart * monthlyRate * Math.pow(1 + monthlyRate, numberOfRepaymentMonths)) / (Math.pow(1 + monthlyRate, numberOfRepaymentMonths) - 1);
    } else {
      monthlyPayment = principalAtRepaymentStart / numberOfRepaymentMonths;
    }
  }

  let balance = principalAtRepaymentStart;
  const monthlyRows: AmortRow[] = [];
  let totalRepaymentPaid = 0;

  // We only track the actual amortization during the repayment period
  for (let m = 1; m <= numberOfRepaymentMonths && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance -= principal;
    totalRepaymentPaid += interest + principal;
    monthlyRows.push({
      period: m,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance)
    });
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
    const slice = monthlyRows.slice(y * 12, (y + 1) * 12);
    if (!slice.length) break;
    yearlyRows.push({
      period: y + 1,
      payment: slice.reduce((s, r) => s + r.payment, 0),
      principal: slice.reduce((s, r) => s + r.principal, 0),
      interest: slice.reduce((s, r) => s + r.interest, 0),
      balance: slice[slice.length - 1].balance,
    });
  }

  const totalInterestPaidDuringRepayment = Math.max(0, totalRepaymentPaid - principalAtRepaymentStart);
  const totalInterestPaidOverall = totalInterestPaidDuringRepayment + upfrontInterestPaid + (payInterestDuringGrace ? 0 : interestAccruedDuringGrace);
  
  // Total cost of the loan (Original Loan + All Interest)
  const totalCostOfLoan = totalLoanAmountRequested + totalInterestPaidOverall;

  const currentDate = new Date();
  const totalMonthsUntilPayoff = gracePeriodMonths + numberOfRepaymentMonths;
  const payoffYear = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + totalMonthsUntilPayoff) / 12);
  const payoffMonthIndex = (currentDate.getMonth() + totalMonthsUntilPayoff) % 12;
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payoffDate = `${monthsStr[payoffMonthIndex]} ${payoffYear}`;

  const chartData = [
    { name: "Original Loan Amount", value: totalLoanAmountRequested, color: "hsl(var(--primary))" },
    { name: "Grace Period Interest", value: interestAccruedDuringGrace, color: "#ef4444" },
    { name: "Repayment Interest", value: totalInterestPaidDuringRepayment, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Original Loan Amount", value: `$${totalLoanAmountRequested.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Principal at Repayment Start", value: `$${principalAtRepaymentStart.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Grace Period Interest", value: `$${interestAccruedDuringGrace.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Repayment Interest", value: `$${totalInterestPaidDuringRepayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Total Cost of Loan", value: `$${totalCostOfLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Total Education Cost", amount: `$${totalEducationCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Scholarships & Savings", amount: `-$${totalFinancialAid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Original Loan Requested", amount: `$${totalLoanAmountRequested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Total Interest Paid", amount: `$${totalInterestPaidOverall.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Total Cost of Loan", amount: `$${totalCostOfLoan.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    totalLoanAmountRequested,
    interestAccruedDuringGrace,
    principalAtRepaymentStart,
    monthlyPayment,
    totalInterestPaidDuringRepayment,
    totalInterestPaidOverall,
    totalCostOfLoan,
    payoffDate,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  tuitionFees: "40000",
  livingExpenses: "15000",
  otherExpenses: "2000",
  scholarshipsOrGrants: "5000",
  personalSavings: "2000",
  interestRate: "6.5",
  repaymentTermYears: "10",
  gracePeriodMonths: "48", // 4 years of college
  payInterestDuringGrace: false
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

export default function EducationLoanCalculator() {
  // 4. Component State
  const [tuitionFees, setTuitionFees] = useState(DEFAULTS.tuitionFees);
  const [livingExpenses, setLivingExpenses] = useState(DEFAULTS.livingExpenses);
  const [scholarshipsOrGrants, setScholarshipsOrGrants] = useState(DEFAULTS.scholarshipsOrGrants);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [repaymentTermYears, setRepaymentTermYears] = useState(DEFAULTS.repaymentTermYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [otherExpenses, setOtherExpenses] = useState(DEFAULTS.otherExpenses);
  const [personalSavings, setPersonalSavings] = useState(DEFAULTS.personalSavings);
  const [gracePeriodMonths, setGracePeriodMonths] = useState(DEFAULTS.gracePeriodMonths);
  const [payInterestDuringGrace, setPayInterestDuringGrace] = useState(DEFAULTS.payInterestDuringGrace);

  const [results, setResults] = useState<EducationLoanResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: EducationLoanInputs = {
      tuitionFees: parseFloat(tuitionFees) || 0,
      livingExpenses: parseFloat(livingExpenses) || 0,
      otherExpenses: parseFloat(otherExpenses) || 0,
      scholarshipsOrGrants: parseFloat(scholarshipsOrGrants) || 0,
      personalSavings: parseFloat(personalSavings) || 0,
      interestRate: parseFloat(interestRate) || 0,
      repaymentTermYears: parseFloat(repaymentTermYears) || 0,
      gracePeriodMonths: parseFloat(gracePeriodMonths) || 0,
      payInterestDuringGrace
    };
    setResults(calculateEducationLoan(inputs));
  };

  const handleReset = () => {
    setTuitionFees(DEFAULTS.tuitionFees);
    setLivingExpenses(DEFAULTS.livingExpenses);
    setScholarshipsOrGrants(DEFAULTS.scholarshipsOrGrants);
    setInterestRate(DEFAULTS.interestRate);
    setRepaymentTermYears(DEFAULTS.repaymentTermYears);
    setOtherExpenses(DEFAULTS.otherExpenses);
    setPersonalSavings(DEFAULTS.personalSavings);
    setGracePeriodMonths(DEFAULTS.gracePeriodMonths);
    setPayInterestDuringGrace(DEFAULTS.payInterestDuringGrace);
    setShowAdvanced(false);
    
    setResults(calculateEducationLoan({
      tuitionFees: parseFloat(DEFAULTS.tuitionFees),
      livingExpenses: parseFloat(DEFAULTS.livingExpenses),
      otherExpenses: parseFloat(DEFAULTS.otherExpenses),
      scholarshipsOrGrants: parseFloat(DEFAULTS.scholarshipsOrGrants),
      personalSavings: parseFloat(DEFAULTS.personalSavings),
      interestRate: parseFloat(DEFAULTS.interestRate),
      repaymentTermYears: parseFloat(DEFAULTS.repaymentTermYears),
      gracePeriodMonths: parseFloat(DEFAULTS.gracePeriodMonths),
      payInterestDuringGrace: DEFAULTS.payInterestDuringGrace
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
    w.document.write(`<html><head><title>Education Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a grace period (or moratorium)?", answer: "A grace period is a set amount of time after you graduate, leave school, or drop below half-time enrollment before you must begin making full principal and interest payments on your student loans. It is typically 6 months for federal loans and varies for private loans." },
    { question: "What does 'Capitalized Interest' mean?", answer: "Capitalized interest is unpaid interest that is added to your original student loan balance. During your grace period, your loan continues to accrue interest. If you do not pay this interest while in school, it is 'capitalized' at graduation, meaning your new, larger principal balance will generate even more interest during repayment." },
    { question: "Should I pay interest while I am in school?", answer: "Yes, if you can afford it. Paying the interest as it accrues during your grace period prevents it from being capitalized. This keeps your principal balance lower and saves you thousands of dollars in compound interest over your repayment term." },
    { question: "What is a standard student loan repayment term?", answer: "The standard federal student loan repayment term is 10 years (120 months). However, depending on the loan amount and the type of loan, terms can be extended to 15, 20, or even 25 years through various repayment or consolidation plans." },
    { question: "How are living expenses factored into an education loan?", answer: "Many education loans allow you to borrow up to the 'Cost of Attendance' (COA) determined by the school. COA includes tuition, fees, books, supplies, room and board, transportation, and personal expenses. Be careful—borrowing money for lifestyle expenses heavily inflates your debt." },
    { question: "Is the interest on my student loan tax-deductible?", answer: "In the United States, you may be able to deduct up to $2,500 of interest paid on a qualified student loan during the year, depending on your Modified Adjusted Gross Income (MAGI). Check current IRS guidelines or consult a tax professional for details." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Education Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Education Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="tuition" label="Tuition Fees" value={tuitionFees} onChange={setTuitionFees} prefix="$" />
              <CompactInput id="living" label="Living Expenses" value={livingExpenses} onChange={setLivingExpenses} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="term" label="Repayment Term" value={repaymentTermYears} onChange={setRepaymentTermYears} suffix="years" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="grants" label="Scholarships/Grants" value={scholarshipsOrGrants} onChange={setScholarshipsOrGrants} prefix="$" />
                  <CompactInput id="other-exp" label="Other Expenses" value={otherExpenses} onChange={setOtherExpenses} prefix="$" />
                  <CompactInput id="savings" label="Personal Savings" value={personalSavings} onChange={setPersonalSavings} prefix="$" />
                  <CompactInput id="grace" label="Grace Period" value={gracePeriodMonths} onChange={setGracePeriodMonths} suffix="mo" />
                  
                  <div className="flex items-center gap-2 col-span-2 mt-2">
                    <input
                      type="checkbox"
                      id="pay-interest"
                      checked={payInterestDuringGrace}
                      onChange={(e) => setPayInterestDuringGrace(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="pay-interest" className="text-sm font-medium text-foreground cursor-pointer">I will pay interest during the grace period</label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment (Post-Grace)</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">For {repaymentTermYears} years after a {gracePeriodMonths}-month grace period</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Original Loan</div>
                    <div className="text-lg font-bold">${results.totalLoanAmountRequested.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterestPaidOverall.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cost of Loan</div>
                    <div className="text-lg font-bold text-blue-600">${results.totalCostOfLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Financial Breakdown</h3>
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Loan Composition</h3>
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
                  <h3 className="text-base font-bold mb-4">Repayment Summary</h3>
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
                    <h3 className="text-base font-bold">Repayment Amortization</h3>
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Education Loan Calculator</h2>
            <p>Investing in higher education is often the most significant financial decision a young adult will make. While a degree can dramatically increase your lifelong earning potential, the debt required to obtain it can cripple your finances for decades if not managed correctly. An <strong>Education Loan Calculator</strong> (often referred to as a Student Loan Calculator) is a critical planning tool that helps prospective students and their parents project the true, long-term cost of borrowing money for college or graduate school.</p>
            <p>Unlike standard auto loans or mortgages, education loans have unique structural features—such as extended grace periods and capitalized interest—that make them deceptively expensive. By utilizing this comprehensive calculator, you can strip away the complexity, clearly visualize the impact of compound interest during your college years, and accurately estimate the monthly payment you will face upon graduation.</p>

            <h2 className="text-2xl font-bold mb-3">How Education Loan Amortization Works</h2>
            <p>An education loan is ultimately a fixed-rate, amortizing installment loan, governed by the standard financial formula:</p>
            <p><strong>M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1 ]</strong></p>
            <p>However, the crucial difference between a student loan and a car loan is the <em>timing</em> of the repayment and the calculation of the principal (<em>P</em>). With a car loan, you borrow $30,000 and immediately begin making payments the next month. With a student loan, you might borrow $50,000 over four years, but you are not required to make any payments while you are in school.</p>
            <p>This delay is known as the "Grace Period" or "Moratorium." While you are not making payments, the bank is still charging you interest. For Unsubsidized Federal Loans and all Private Student Loans, this interest accrues every single day you are in school.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Capitalized Interest</h2>
            <p>The most dangerous element of student debt is "Capitalization." When you graduate and your grace period ends, all the interest that accumulated over your four years of college is added to your original loan balance. This new, larger number becomes your starting principal for repayment.</p>
            <p>For example, if you borrow $40,000 at a 6.5% interest rate and defer payments for 4 years (48 months), the loan will accrue $10,400 in interest. Upon graduation, your new loan balance isn't $40,000; it is $50,400. You will now be forced to pay interest on that $10,400 of interest for the next 10 years. Our calculator specifically breaks out "Grace Period Interest" to highlight exactly how much this deferment is costing you.</p>

            <h2 className="text-2xl font-bold mb-3">Analyzing Your Calculator Results</h2>
            <p>Our Education Loan Calculator provides a detailed financial breakdown of your educational investment. Here is how to interpret the results:</p>
            <p><strong>Estimated Monthly Payment (Post-Grace):</strong> This is the exact amount of cash you must pull from your post-graduation salary every month. A common rule of thumb is that your total student loan payment should not exceed 8% to 10% of your gross monthly income.</p>
            <p><strong>Principal at Repayment Start:</strong> This number is often a shock. It takes your original requested loan amount and adds any capitalized interest from your time in school. This is the actual mountain of debt you must climb upon graduation.</p>
            <p><strong>Cost Distribution Chart:</strong> This visual pie chart illustrates the ratio of your original loan to the interest generated. If the "Grace Period Interest" slice is uncomfortably large, you should strongly consider paying the interest while in school.</p>

            <h2 className="text-2xl font-bold mb-3">Critical Variables in Student Borrowing</h2>
            <p>Understanding how different variables manipulate your loan is the key to minimizing your educational debt.</p>
            <p><strong>The Cost of Attendance (COA):</strong> Lenders allow you to borrow up to the school's official COA, which includes tuition, room and board, books, and "personal expenses." Borrowing money to pay for lifestyle expenses (like eating out or spring break trips) using a student loan is financially devastating. Every dollar borrowed for lifestyle costs will double over the life of the loan due to interest.</p>
            <p><strong>The Interest Rate:</strong> Federal student loan rates are set annually by Congress and are fixed for the life of the loan. Private loan rates are based on your (or your cosigner's) credit score and can be fixed or variable. Even a 1% reduction in your interest rate can save you thousands of dollars over a 10-year term.</p>
            <p><strong>Repayment Term Length:</strong> The standard federal repayment plan is 10 years (120 payments). Lenders often offer extended repayment plans of 15, 20, or 25 years to lower the monthly payment. While extending the term makes the monthly cash flow easier, it drastically increases the total interest you pay over your lifetime.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Strategy: Paying Interest in School</h2>
            <p>Our calculator includes a critical toggle: "I will pay interest during the grace period."</p>
            <p>Checking this box simulates you (or your parents) making small, interest-only payments every month while you are in college. By doing this, you prevent the interest from capitalizing. While it requires cash flow during college, it is mathematically the smartest move you can make. It keeps your principal balance frozen at your original borrowed amount, significantly lowering your monthly payment upon graduation and saving you massive amounts of compound interest.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples of Student Financing</h2>
            <p><strong>Example 1: The Cost of Capitalization.</strong> You take out $50,000 in unsubsidized loans for a 4-year degree at 7% APR. You choose to defer all payments. During those 4 years (48 months), you accrue $14,000 in interest. Your starting balance at graduation is $64,000. Over a standard 10-year repayment, your monthly payment is $743, and your total repayment cost is $89,170. That $50,000 degree ultimately cost you nearly $90,000.</p>
            <p><strong>Example 2: Paying Interest While in School.</strong> Using the exact same scenario above, you get a part-time job and pay the $291/month interest charge while in school. Upon graduation, your balance remains exactly $50,000. Your new monthly payment is only $580 (saving you $163 a month), and your total overall cost (including the in-school interest payments) drops to $83,600. You save $5,500 simply by not letting the interest capitalize.</p>

            <h2 className="text-2xl font-bold mb-3">Tips and Best Practices for Borrowing</h2>
            <p><strong>Max Out Free Money First:</strong> Before taking out a single dollar in loans, exhaust all federal grants, state grants, university scholarships, and private scholarships. This is free money that never has to be repaid. Utilize the FAFSA immediately when it opens.</p>
            <p><strong>Exhaust Federal Loans Before Private Loans:</strong> Federal loans offer massive protections that private loans do not, including income-driven repayment plans, generous deferment/forbearance options, and potential loan forgiveness programs (like PSLF). Only use private student loans as an absolute last resort to bridge a minor funding gap.</p>
            <p><strong>Calculate ROI Before Selecting a Major:</strong> Your total student debt should not exceed your realistically anticipated first-year starting salary. If you anticipate making $45,000 as a teacher, taking on $100,000 in private student loans is mathematical suicide. Ensure the Return on Investment (ROI) of your specific degree justifies the debt required to obtain it.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion and Financial Security</h2>
            <p>An education is a powerful asset, but excessive student loan debt is an anchor that can delay buying a home, starting a family, or saving for retirement. By utilizing this Education Loan Calculator, you transition from a passive student blindly accepting financial aid award letters, to an informed consumer.</p>
            <p>Running multiple scenarios—such as working part-time to pay down interest, choosing a less expensive state school, or committing to an aggressive 5-year repayment plan instead of the standard 10-year plan—empowers you to secure your education while fiercely protecting your financial future.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/education-loan-calculator" />
          <PopularCalculators exclude="/calculator/education-loan-calculator" />
        </div>
      </div>
    </>
  );
}
