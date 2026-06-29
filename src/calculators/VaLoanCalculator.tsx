"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Shield } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface VaLoanInputs {
  homePrice: number;
  downPaymentAmt: number;
  interestRate: number;
  loanTermYears: number;
  fundingFeePercentage: number;
  financeFundingFee: boolean;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaMonthly: number;
}

interface VaLoanResults {
  baseLoanAmount: number;
  fundingFeeAmount: number;
  totalLoanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalCostOfLoan: number;
  payoffDate: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateVaLoan = (inputs: VaLoanInputs): VaLoanResults => {
  const {
    homePrice,
    downPaymentAmt,
    interestRate,
    loanTermYears,
    fundingFeePercentage,
    financeFundingFee,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaMonthly
  } = inputs;

  const baseLoanAmount = Math.max(0, homePrice - downPaymentAmt);
  const fundingFeeAmount = baseLoanAmount * (fundingFeePercentage / 100);

  // Total loan amount depends on whether the fee is financed or paid in cash at closing
  const totalLoanAmount = financeFundingFee ? baseLoanAmount + fundingFeeAmount : baseLoanAmount;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPrincipalAndInterest = 0;
  if (totalLoanAmount > 0) {
    if (monthlyRate > 0) {
      monthlyPrincipalAndInterest = (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPrincipalAndInterest = totalLoanAmount / numberOfPayments;
    }
  }

  const monthlyPropertyTax = propertyTaxAnnual / 12;
  const monthlyHomeInsurance = homeInsuranceAnnual / 12;
  const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + hoaMonthly;

  let balance = totalLoanAmount;
  const monthlyRows: AmortRow[] = [];
  let totalPaid = 0;

  for (let m = 1; m <= numberOfPayments && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPrincipalAndInterest - interest;
    if (principal > balance) principal = balance;
    balance -= principal;
    totalPaid += interest + principal;
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

  const totalInterestPaid = Math.max(0, totalPaid - totalLoanAmount);
  const totalCostOfLoan = totalLoanAmount + totalInterestPaid + (financeFundingFee ? 0 : fundingFeeAmount);

  const currentDate = new Date();
  const payoffYear = currentDate.getFullYear() + loanTermYears;
  const payoffMonthIndex = currentDate.getMonth();
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payoffDate = `${monthsStr[payoffMonthIndex]} ${payoffYear}`;

  const chartData = [
    { name: "Principal & Interest", value: monthlyPrincipalAndInterest, color: "hsl(var(--primary))" },
    { name: "Property Tax", value: monthlyPropertyTax, color: "#10b981" },
    { name: "Home Insurance", value: monthlyHomeInsurance, color: "#f59e0b" },
    { name: "HOA Fees", value: hoaMonthly, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Base Loan Amount", value: `$${baseLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "VA Funding Fee", value: `$${fundingFeeAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Loan Financed", value: `$${totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Total Cost of Loan", value: `$${totalCostOfLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Principal & Interest", amount: `$${monthlyPrincipalAndInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Property Tax", amount: `$${monthlyPropertyTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Home Insurance", amount: `$${monthlyHomeInsurance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "HOA Fees", amount: `$${hoaMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-purple-500" },
    { label: "PMI / MIP", amount: `$0.00`, colorClass: "text-muted-foreground" },
    { label: "Total Monthly Payment", amount: `$${totalMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    baseLoanAmount,
    fundingFeeAmount,
    totalLoanAmount,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    totalMonthlyPayment,
    totalInterestPaid,
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
  homePrice: "350000",
  downPaymentAmt: "0",
  interestRate: "6.25",
  loanTermYears: "30",
  fundingFeePercentage: "2.15",
  financeFundingFee: true,
  propertyTaxAnnual: "3500",
  homeInsuranceAnnual: "1200",
  hoaMonthly: "0"
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

export default function VaLoanCalculator() {
  // 4. Component State
  const [homePrice, setHomePrice] = useState(DEFAULTS.homePrice);
  const [downPaymentAmt, setDownPaymentAmt] = useState(DEFAULTS.downPaymentAmt);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fundingFeePercentage, setFundingFeePercentage] = useState(DEFAULTS.fundingFeePercentage);
  const [financeFundingFee, setFinanceFundingFee] = useState(DEFAULTS.financeFundingFee);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState(DEFAULTS.propertyTaxAnnual);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState(DEFAULTS.homeInsuranceAnnual);
  const [hoaMonthly, setHoaMonthly] = useState(DEFAULTS.hoaMonthly);

  const [results, setResults] = useState<VaLoanResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: VaLoanInputs = {
      homePrice: parseFloat(homePrice) || 0,
      downPaymentAmt: parseFloat(downPaymentAmt) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseFloat(loanTermYears) || 0,
      fundingFeePercentage: parseFloat(fundingFeePercentage) || 0,
      financeFundingFee,
      propertyTaxAnnual: parseFloat(propertyTaxAnnual) || 0,
      homeInsuranceAnnual: parseFloat(homeInsuranceAnnual) || 0,
      hoaMonthly: parseFloat(hoaMonthly) || 0
    };
    setResults(calculateVaLoan(inputs));
  };

  const handleReset = () => {
    setHomePrice(DEFAULTS.homePrice);
    setDownPaymentAmt(DEFAULTS.downPaymentAmt);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setFundingFeePercentage(DEFAULTS.fundingFeePercentage);
    setFinanceFundingFee(DEFAULTS.financeFundingFee);
    setPropertyTaxAnnual(DEFAULTS.propertyTaxAnnual);
    setHomeInsuranceAnnual(DEFAULTS.homeInsuranceAnnual);
    setHoaMonthly(DEFAULTS.hoaMonthly);
    setShowAdvanced(false);
    
    setResults(calculateVaLoan({
      homePrice: parseFloat(DEFAULTS.homePrice),
      downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTermYears: parseFloat(DEFAULTS.loanTermYears),
      fundingFeePercentage: parseFloat(DEFAULTS.fundingFeePercentage),
      financeFundingFee: DEFAULTS.financeFundingFee,
      propertyTaxAnnual: parseFloat(DEFAULTS.propertyTaxAnnual),
      homeInsuranceAnnual: parseFloat(DEFAULTS.homeInsuranceAnnual),
      hoaMonthly: parseFloat(DEFAULTS.hoaMonthly)
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
    w.document.write(`<html><head><title>VA Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Who is eligible for a VA Loan?", answer: "VA loans are exclusively available to active-duty service members, veterans, and eligible surviving spouses. To prove eligibility to a lender, you must obtain a Certificate of Eligibility (COE) from the Department of Veterans Affairs." },
    { question: "Do VA loans require a down payment?", answer: "No. The most powerful benefit of a VA loan is that it allows eligible borrowers to finance 100% of the home's purchase price. You can buy a home with $0 down. However, you can still choose to make a down payment to lower your monthly payments and reduce your VA Funding Fee." },
    { question: "What is the VA Funding Fee?", answer: "Because the VA does not require monthly mortgage insurance, they charge a one-time upfront 'Funding Fee' to sustain the loan program. For first-time users with zero down, the fee is typically 2.15% of the loan amount. For subsequent uses with zero down, it is 3.3%. This fee is entirely waived for veterans receiving VA compensation for a service-connected disability." },
    { question: "Do I have to pay the Funding Fee in cash at closing?", answer: "No. The vast majority of borrowers choose to finance the Funding Fee by rolling it into the loan. If you buy a $300,000 home with $0 down and a 2.15% fee ($6,450), your starting loan balance will simply be $306,450. Our calculator allows you to model both scenarios." },
    { question: "Do VA loans have Private Mortgage Insurance (PMI)?", answer: "No. VA loans never require PMI, regardless of your down payment amount. This is a massive financial advantage over FHA loans or Conventional loans, which require expensive monthly insurance premiums if you put less than 20% down." },
    { question: "Are VA loan interest rates lower than conventional rates?", answer: "Typically, yes. Because a portion of the loan is backed (guaranteed) by the federal government, lenders face less risk. This allows them to offer interest rates that are often 0.25% to 0.5% lower than standard conventional mortgage rates." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "VA Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VA Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
              <CompactInput id="down" label="Down Payment" value={downPaymentAmt} onChange={setDownPaymentAmt} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="fee-select" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                  VA Funding Fee
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <select
                    id="fee-select"
                    value={fundingFeePercentage}
                    onChange={(e) => setFundingFeePercentage(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer"
                  >
                    <option value="2.15">2.15% (First Use, 0% Down)</option>
                    <option value="3.30">3.30% (Subsequent, 0% Down)</option>
                    <option value="1.50">1.50% (5%+ Down)</option>
                    <option value="1.25">1.25% (10%+ Down)</option>
                    <option value="0.00">0.00% (Exempt / Disabled)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Taxes, Insurance & Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="Annual Property Tax" value={propertyTaxAnnual} onChange={setPropertyTaxAnnual} prefix="$" />
                  <CompactInput id="ins" label="Annual Insurance" value={homeInsuranceAnnual} onChange={setHomeInsuranceAnnual} prefix="$" />
                  <CompactInput id="hoa" label="Monthly HOA" value={hoaMonthly} onChange={setHoaMonthly} prefix="$" />
                  
                  <div className="flex items-center gap-2 col-span-2 mt-2">
                    <input
                      type="checkbox"
                      id="finance-fee"
                      checked={financeFundingFee}
                      onChange={(e) => setFinanceFundingFee(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="finance-fee" className="text-sm font-medium text-foreground cursor-pointer">Finance the VA Funding Fee (roll into loan)</label>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.totalMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">Includes taxes, insurance, and $0 PMI.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Loan</div>
                    <div className="text-lg font-bold">${results.totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Payoff Date</div>
                    <div className="text-lg font-bold text-emerald-600">{results.payoffDate}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Payment Breakdown</h3>
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Cost Distribution</h3>
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
                  <h3 className="text-base font-bold mb-4">VA Loan Summary</h3>
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the VA Loan Calculator</h2>
            <p>The Department of Veterans Affairs (VA) loan program is widely considered to be the single most powerful mortgage product available in the United States. Designed specifically to help active-duty service members, veterans, and eligible surviving spouses achieve the dream of homeownership, VA loans offer incredible financial leverage that simply does not exist in the conventional civilian market. Our <strong>VA Loan Calculator</strong> is specifically engineered to handle the unique quirks of VA financing, allowing you to accurately model your zero-down payment scenarios, calculate your VA Funding Fee, and visualize your true monthly housing costs.</p>
            <p>Standard mortgage calculators are inherently flawed when dealing with VA loans because they cannot process the capitalization of the Funding Fee, nor do they default to the absence of Private Mortgage Insurance (PMI). By using this specialized calculator, you bypass those errors, ensuring that the numbers you see on the screen precisely reflect the numbers you will see on your final Closing Disclosure at the title company.</p>

            <h2>The Unmatched Power of Zero Down Payment</h2>
            <p>In the conventional mortgage market, buying a home requires cash. A traditional buyer must bring anywhere from 3% to 20% of the home's purchase price in cash to the closing table. For a $400,000 home, a 20% down payment is $80,000—a massive barrier to entry for many young families.</p>
            <p>The crown jewel of the VA loan program is the <strong>0% Down Payment Guarantee</strong>. The federal government backs a portion of the loan, mitigating the lender's risk and allowing them to finance 100% of the home's purchase price. This means you can keep your savings safely in your bank account for emergencies, renovations, or investments. While you can choose to make a down payment to lower your monthly payment and your Funding Fee, it is rarely mathematically required.</p>

            <h2>The Absence of Private Mortgage Insurance (PMI)</h2>
            <p>If a civilian buyer purchases a home with less than 20% down, the bank forces them to pay for Private Mortgage Insurance (PMI). This is an insurance policy that protects the bank (not the borrower) in the event of a default. PMI can easily add $150 to $300 to a conventional monthly mortgage payment.</p>
            <p>VA loans <strong>never require PMI</strong>. Because the Department of Veterans Affairs guarantees the loan, the bank is already protected. This lack of PMI is a massive structural advantage. It means that even if a civilian and a veteran both buy the exact same $300,000 house with 0% down, the veteran's monthly payment will be hundreds of dollars cheaper simply because the PMI line item is completely erased.</p>

            <h2>Understanding the VA Funding Fee</h2>
            <p>While there is no monthly PMI, the VA loan program is not entirely free of administrative costs. To keep the program running for future generations of service members without relying heavily on taxpayer subsidies, the VA charges a one-time upfront cost known as the <strong>VA Funding Fee</strong>.</p>
            <p>This fee is calculated as a percentage of your total loan amount. The percentage varies based on three factors: your down payment amount, whether this is your first time using your VA loan benefit, and your military status. For a first-time user putting $0 down, the fee is typically 2.15%. If you are using the VA loan for a second or third time with $0 down, the fee jumps to 3.3%.</p>
            <p><em>Crucial Exemption:</em> If you are a veteran receiving VA compensation for a service-connected disability, you are entirely exempt from the VA Funding Fee. You pay 0%. You can select the "0.00% (Exempt)" option in our calculator to model this.</p>

            <h2>Financing the Funding Fee vs. Paying Cash</h2>
            <p>A $400,000 loan with a 2.15% Funding Fee generates a bill of $8,600. Most borrowers do not want to write an $8,600 check at closing. The VA anticipates this and allows you to <strong>finance the fee</strong> by rolling it directly into the loan amount.</p>
            <p>If you choose to finance the fee (which is the default setting on our calculator), your starting loan balance becomes $408,600. The bank simply pays the $8,600 to the VA on your behalf, and you pay the bank back slowly over the next 30 years with interest. While this increases your monthly payment slightly and results in you paying interest on the fee itself, it preserves your upfront cash liquidity.</p>

            <h2>Analyzing Your Calculator Results</h2>
            <p>Our VA Loan Calculator breaks down your financial obligation into highly actionable data points. Here is how to interpret your results:</p>
            <p><strong>Total Monthly Payment:</strong> This is the exact amount of cash that will leave your bank account every month. It is known in the industry as PITI+HOA (Principal, Interest, Taxes, Insurance, and HOA dues). It is critical that this number fits comfortably within your civilian or military housing allowance (BAH) and overall budget.</p>
            <p><strong>Total Loan Financed:</strong> Notice that if you put $0 down and chose to finance the Funding Fee, this number is actually higher than the purchase price of the home. This means you are starting your homeownership journey with slight negative equity. Because of this, it is vital that you plan to stay in the home for at least a few years to allow market appreciation and principal paydown to build real equity before attempting to sell.</p>

            <h2>Practical Examples of VA Financing</h2>
            <p><strong>Example 1: The First-Time Buyer.</strong> An active-duty service member buys a $350,000 home near base. They use their VA benefit for the first time with $0 down. The 2.15% Funding Fee is $7,525. They roll it into the loan, making the starting balance $357,525. At a 6.25% interest rate for 30 years, their principal and interest payment is $2,201. Because there is zero PMI, they move into a $350,000 house with virtually zero cash out of pocket.</p>
            <p><strong>Example 2: Leveraging a Disability Rating.</strong> A veteran with a 30% service-connected disability rating buys a $400,000 forever home. Because of their disability rating, the VA Funding Fee is waived entirely (0%). They put $0 down. Their loan balance is exactly $400,000. They avoided $8,600 in upfront fees and save roughly $200 a month by not having PMI, making this the most efficient mortgage transaction mathematically possible.</p>

            <h2>Tips and Best Practices for VA Borrowers</h2>
            <p><strong>Obtain Your COE Immediately:</strong> The Certificate of Eligibility is the golden ticket. Before you even look at houses or talk to a lender, go to the eBenefits portal or contact your lender to secure your COE. Without it, you cannot get a VA loan.</p>
            <p><strong>Shop Multiple Lenders:</strong> The VA guarantees the loan, but they do not set the interest rate. Private banks and mortgage companies do. Interest rates and origination fees can vary wildly from one bank to another. Always get Loan Estimates from at least three different lenders on the same day to ensure you are getting the most competitive rate.</p>
            <p><strong>Beware of the "VA Loan Specialist" Trap:</strong> Some lenders aggressively market themselves as "military friendly" or "VA specialists," but then charge exorbitant origination fees or offer higher-than-average interest rates. Do not assume a lender is offering you a good deal just because their marketing uses camouflage and flags. Let the mathematics dictate your choice.</p>

            <h2>Conclusion</h2>
            <p>The VA loan is a profound, earned benefit that provides unparalleled leverage in the real estate market. By eliminating the down payment barrier and erasing the penalty of mortgage insurance, it allows those who have served to build generational wealth through property ownership far faster than their civilian counterparts.</p>
            <p>By rigorously utilizing this VA Loan Calculator, you can map out your exact financial trajectory. Whether you are buying a starter home near your first duty station or settling into your forever home after retirement, understanding the mechanics of your VA loan ensures that your financial future is as secure as the nation you defended.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/va-loan-calculator" />
          <PopularCalculators exclude="/calculator/va-loan-calculator" />
        </div>
      </div>
    </>
  );
}
