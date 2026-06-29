"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, HardHat } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface ConstructionLoanInputs {
  landCost: number;
  buildCost: number;
  downPaymentAmt: number;
  constructionInterestRate: number;
  constructionPeriodMonths: number;
  permanentMortgageRate: number;
  permanentTermYears: number;
  averageDrawnPercentage: number;
  isConstructionToPermanent: boolean;
}

interface ConstructionLoanResults {
  totalProjectCost: number;
  totalLoanAmountRequested: number;
  monthlyConstructionInterest: number;
  totalConstructionInterestPaid: number;
  permanentMonthlyPayment: number;
  totalPermanentInterestPaid: number;
  totalInterestOverall: number;
  totalCostOfProject: number;
  payoffDate: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateConstructionLoan = (inputs: ConstructionLoanInputs): ConstructionLoanResults => {
  const {
    landCost,
    buildCost,
    downPaymentAmt,
    constructionInterestRate,
    constructionPeriodMonths,
    permanentMortgageRate,
    permanentTermYears,
    averageDrawnPercentage,
    isConstructionToPermanent
  } = inputs;

  const totalProjectCost = landCost + buildCost;
  const totalLoanAmountRequested = Math.max(0, totalProjectCost - downPaymentAmt);

  // Construction Phase (Interest Only on Drawn Balance)
  const constrMonthlyRate = constructionInterestRate / 100 / 12;
  
  // To simulate draws over time, we use an average drawn percentage. 
  // If it's a linear draw schedule over 12 months, the average drawn balance is roughly 50%.
  const avgDrawnBalance = totalLoanAmountRequested * (averageDrawnPercentage / 100);
  
  const monthlyConstructionInterest = avgDrawnBalance * constrMonthlyRate;
  const totalConstructionInterestPaid = monthlyConstructionInterest * constructionPeriodMonths;

  let permanentMonthlyPayment = 0;
  let totalPermanentInterestPaid = 0;
  const yearlyRows: AmortRow[] = [];

  // Permanent Phase
  if (isConstructionToPermanent && totalLoanAmountRequested > 0) {
    const permMonthlyRate = permanentMortgageRate / 100 / 12;
    const numberOfPayments = permanentTermYears * 12;

    if (permMonthlyRate > 0) {
      permanentMonthlyPayment = (totalLoanAmountRequested * permMonthlyRate * Math.pow(1 + permMonthlyRate, numberOfPayments)) / (Math.pow(1 + permMonthlyRate, numberOfPayments) - 1);
    } else {
      permanentMonthlyPayment = totalLoanAmountRequested / numberOfPayments;
    }

    let balance = totalLoanAmountRequested;
    let totalPaid = 0;
    const monthlyRows: AmortRow[] = [];

    for (let m = 1; m <= numberOfPayments && balance > 0.01; m++) {
      const interest = balance * permMonthlyRate;
      let principal = permanentMonthlyPayment - interest;
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

    totalPermanentInterestPaid = Math.max(0, totalPaid - totalLoanAmountRequested);

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
  }

  const totalInterestOverall = totalConstructionInterestPaid + totalPermanentInterestPaid;
  const totalCostOfProject = totalProjectCost + totalInterestOverall;

  const currentDate = new Date();
  const totalMonthsUntilPayoff = constructionPeriodMonths + (isConstructionToPermanent ? (permanentTermYears * 12) : 0);
  const payoffYear = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + totalMonthsUntilPayoff) / 12);
  const payoffMonthIndex = (currentDate.getMonth() + totalMonthsUntilPayoff) % 12;
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payoffDate = `${monthsStr[payoffMonthIndex]} ${payoffYear}`;

  const chartData = [
    { name: "Original Loan Amount", value: totalLoanAmountRequested, color: "hsl(var(--primary))" },
    { name: "Construction Interest", value: totalConstructionInterestPaid, color: "#ef4444" },
  ];
  if (isConstructionToPermanent && totalPermanentInterestPaid > 0) {
    chartData.push({ name: "Permanent Interest", value: totalPermanentInterestPaid, color: "#f59e0b" });
  }

  const summaryStats = [
    { label: "Total Project Cost", value: `$${totalProjectCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Loan Amount", value: `$${totalLoanAmountRequested.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Construction Phase Interest", value: `$${totalConstructionInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: isConstructionToPermanent ? "Permanent Phase Interest" : "Balloon Payment Due", value: isConstructionToPermanent ? `$${totalPermanentInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `$${totalLoanAmountRequested.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Total Cost of Project", value: `$${totalCostOfProject.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Land Cost", amount: `$${landCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Build Cost", amount: `$${buildCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Down Payment", amount: `-$${downPaymentAmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Total Loan Requested", amount: `$${totalLoanAmountRequested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Construction Interest", amount: `$${totalConstructionInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
  ];

  if (isConstructionToPermanent) {
    breakdown.push({ label: "Permanent Mortgage Interest", amount: `$${totalPermanentInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" });
  }

  breakdown.push({ label: "Total Out of Pocket Cost", colorClass: "text-foreground font-bold", amount: `$${totalCostOfProject.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` });

  return {
    totalProjectCost,
    totalLoanAmountRequested,
    monthlyConstructionInterest,
    totalConstructionInterestPaid,
    permanentMonthlyPayment,
    totalPermanentInterestPaid,
    totalInterestOverall,
    totalCostOfProject,
    payoffDate,
    chartData: chartData.filter(d => d.value > 0),
    summaryStats,
    breakdown,
    yearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  landCost: "100000",
  buildCost: "350000",
  downPaymentAmt: "90000",
  constructionInterestRate: "7.5",
  constructionPeriodMonths: "12",
  permanentMortgageRate: "6.5",
  permanentTermYears: "30",
  averageDrawnPercentage: "50",
  isConstructionToPermanent: true
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

export default function ConstructionLoanCalculator() {
  // 4. Component State
  const [landCost, setLandCost] = useState(DEFAULTS.landCost);
  const [buildCost, setBuildCost] = useState(DEFAULTS.buildCost);
  const [downPaymentAmt, setDownPaymentAmt] = useState(DEFAULTS.downPaymentAmt);
  const [constructionInterestRate, setConstructionInterestRate] = useState(DEFAULTS.constructionInterestRate);
  const [constructionPeriodMonths, setConstructionPeriodMonths] = useState(DEFAULTS.constructionPeriodMonths);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [permanentMortgageRate, setPermanentMortgageRate] = useState(DEFAULTS.permanentMortgageRate);
  const [permanentTermYears, setPermanentTermYears] = useState(DEFAULTS.permanentTermYears);
  const [averageDrawnPercentage, setAverageDrawnPercentage] = useState(DEFAULTS.averageDrawnPercentage);
  const [isConstructionToPermanent, setIsConstructionToPermanent] = useState(DEFAULTS.isConstructionToPermanent);

  const [results, setResults] = useState<ConstructionLoanResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: ConstructionLoanInputs = {
      landCost: parseFloat(landCost) || 0,
      buildCost: parseFloat(buildCost) || 0,
      downPaymentAmt: parseFloat(downPaymentAmt) || 0,
      constructionInterestRate: parseFloat(constructionInterestRate) || 0,
      constructionPeriodMonths: parseFloat(constructionPeriodMonths) || 0,
      permanentMortgageRate: parseFloat(permanentMortgageRate) || 0,
      permanentTermYears: parseFloat(permanentTermYears) || 0,
      averageDrawnPercentage: parseFloat(averageDrawnPercentage) || 0,
      isConstructionToPermanent
    };
    setResults(calculateConstructionLoan(inputs));
  };

  const handleReset = () => {
    setLandCost(DEFAULTS.landCost);
    setBuildCost(DEFAULTS.buildCost);
    setDownPaymentAmt(DEFAULTS.downPaymentAmt);
    setConstructionInterestRate(DEFAULTS.constructionInterestRate);
    setConstructionPeriodMonths(DEFAULTS.constructionPeriodMonths);
    setPermanentMortgageRate(DEFAULTS.permanentMortgageRate);
    setPermanentTermYears(DEFAULTS.permanentTermYears);
    setAverageDrawnPercentage(DEFAULTS.averageDrawnPercentage);
    setIsConstructionToPermanent(DEFAULTS.isConstructionToPermanent);
    setShowAdvanced(false);
    
    setResults(calculateConstructionLoan({
      landCost: parseFloat(DEFAULTS.landCost),
      buildCost: parseFloat(DEFAULTS.buildCost),
      downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt),
      constructionInterestRate: parseFloat(DEFAULTS.constructionInterestRate),
      constructionPeriodMonths: parseFloat(DEFAULTS.constructionPeriodMonths),
      permanentMortgageRate: parseFloat(DEFAULTS.permanentMortgageRate),
      permanentTermYears: parseFloat(DEFAULTS.permanentTermYears),
      averageDrawnPercentage: parseFloat(DEFAULTS.averageDrawnPercentage),
      isConstructionToPermanent: DEFAULTS.isConstructionToPermanent
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
    w.document.write(`<html><head><title>Construction Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a construction loan?", answer: "A construction loan is a short-term, higher-interest loan that provides the funds required to build a residential property. Unlike a mortgage, where the funds are disbursed in a single lump sum, construction loans are paid out in 'draws' as different phases of the build are completed." },
    { question: "What does 'interest-only on drawn balance' mean?", answer: "During the construction phase, you do not pay down the principal balance. You only pay interest. Furthermore, you only pay interest on the money the bank has actually disbursed to the builder (the drawn balance), not the total loan amount. If your total loan is $300k, but only $100k has been drawn for the foundation, you only pay interest on $100k." },
    { question: "What is a Construction-to-Permanent (C2P) loan?", answer: "A C2P loan (also known as a 'Single-Close' loan) automatically converts the short-term construction loan into a standard 15- or 30-year mortgage once the house is finished. This saves you from having to pay closing costs twice." },
    { question: "Why is the construction interest rate higher than a mortgage rate?", answer: "Construction loans are incredibly risky for banks. If the builder goes bankrupt or you walk away from the project halfway through, the bank is left with a half-built house that is nearly impossible to sell. To compensate for this massive risk, construction rates are usually 1% to 2% higher than standard mortgage rates." },
    { question: "How much down payment do I need to build a house?", answer: "Building a house is riskier than buying an existing one. Therefore, most lenders require a minimum of 20% down. If you already own the land outright, the equity in the land can often be used as part (or all) of your down payment." },
    { question: "What happens if construction takes longer than expected?", answer: "If you exceed your construction period (often 12 months), the bank may grant an extension, but they will charge you extension fees. If you have a Construction-to-Permanent loan, the conversion to a permanent mortgage will be delayed, meaning you keep paying the higher construction interest rate longer." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Construction Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Construction Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="land" label="Land Cost" value={landCost} onChange={setLandCost} prefix="$" />
              <CompactInput id="build" label="Build Cost" value={buildCost} onChange={setBuildCost} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="down" label="Down Payment" value={downPaymentAmt} onChange={setDownPaymentAmt} prefix="$" />
              <CompactInput id="crate" label="Construction Rate" value={constructionInterestRate} onChange={setConstructionInterestRate} suffix="%" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="flex items-center gap-2 col-span-2 mb-2">
                    <CompactInput id="cperiod" label="Construction Period" value={constructionPeriodMonths} onChange={setConstructionPeriodMonths} suffix="mo" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2 mb-2">
                    <input
                      type="checkbox"
                      id="c2p"
                      checked={isConstructionToPermanent}
                      onChange={(e) => setIsConstructionToPermanent(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="c2p" className="text-sm font-medium text-foreground cursor-pointer">Construction-To-Permanent (Single Close)</label>
                  </div>
                  
                  {isConstructionToPermanent && (
                    <>
                      <CompactInput id="prate" label="Permanent Mortgage Rate" value={permanentMortgageRate} onChange={setPermanentMortgageRate} suffix="%" />
                      <CompactInput id="pterm" label="Permanent Loan Term" value={permanentTermYears} onChange={setPermanentTermYears} suffix="years" />
                    </>
                  )}
                  <CompactInput id="avg-drawn" label="Avg Drawn Balance" value={averageDrawnPercentage} onChange={setAverageDrawnPercentage} suffix="%" />
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    {isConstructionToPermanent ? "Permanent Monthly Mortgage Payment" : "Est. Monthly Construction Interest"}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">
                    ${isConstructionToPermanent ? results.permanentMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : results.monthlyConstructionInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">
                    {isConstructionToPermanent 
                      ? `After ${constructionPeriodMonths} months of construction (Est. $${results.monthlyConstructionInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo interest only)`
                      : `Average interest-only payment assuming ${averageDrawnPercentage}% drawn balance.`}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Loan</div>
                    <div className="text-lg font-bold">${results.totalLoanAmountRequested.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterestOverall.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Project Cost</div>
                    <div className="text-lg font-bold text-blue-600">${results.totalProjectCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
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
                  <h3 className="text-base font-bold mb-4">Project Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {results.summaryStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 sm:[&:nth-last-child(1)]:border-0 sm:[&:nth-last-child(2)]:border-0">
                        <span className="text-muted-foreground">{stat.label}:</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isConstructionToPermanent && (
                  <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold">Permanent Amortization (Years)</h3>
                    </div>
                    <AmortizationTable rows={results.yearlyRows} yearly={true} />
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Construction Loan Calculator</h2>
            <p>Building your dream home from the ground up is an exciting endeavor, but the financing mechanics are vastly different and more complex than buying an existing house. Instead of a standard mortgage, you need a highly specialized financial product: a construction loan. Our <strong>Construction Loan Calculator</strong> is designed to demystify this complex two-phase financing structure, allowing you to accurately estimate your interest-only payments during the build phase and your amortized mortgage payments once you move in.</p>
            <p>Because construction loans involve releasing funds in stages (called "draws"), standard mortgage calculators are entirely useless for projecting your costs. Using a standard calculator will trick you into severely overestimating your monthly payments during the first year of construction. This calculator correctly separates the timeline into the Construction Phase and the Permanent Phase, giving you the precise mathematical foresight required to confidently manage your budget while your house is being built.</p>

            <h2 className="text-2xl font-bold mb-3">How Construction Loans Actually Work</h2>
            <p>A construction loan is essentially a short-term line of credit provided by a bank to pay your general contractor. The core differentiator of a construction loan is that the bank does not hand you (or the builder) a $400,000 check on day one.</p>
            <p>Instead, the bank establishes a "draw schedule." When the foundation is poured, the builder requests a $40,000 draw. When the framing is finished, they request a $60,000 draw, and so on. The bank usually sends an inspector to verify the work before releasing each tranche of funds. Because of this staged release, your loan balance grows slowly over the 9 to 12 months it takes to build the house.</p>

            <h2 className="text-2xl font-bold mb-3">Phase 1: The Construction Phase (Interest-Only)</h2>
            <p>During the actual building of the house, your loan is in the Construction Phase. The rules here are unique:</p>
              <p><strong>Interest-Only Payments:</strong> You do not pay down any of the principal loan amount during this phase. You only pay the interest generated by the loan.</p>
              <p><strong>Payments on Drawn Balance Only:</strong> You only pay interest on the money the bank has actually disbursed to the builder. In month one, if the builder has only drawn $50,000, your interest payment is calculated solely on that $50,000—even if your total approved loan is $400,000.</p>
            <p>Because the drawn balance starts at zero and slowly grows to 100% by the time the house is finished, your monthly payment will be tiny in month one, and will reach its maximum right before the house is completed. To simplify this for budgeting, our calculator uses an "Average Drawn Balance" (defaulting to 50%) to estimate what your average monthly interest payment will be across the entire construction period.</p>

            <h2 className="text-2xl font-bold mb-3">Phase 2: The Permanent Phase (Amortization)</h2>
            <p>Once the house is 100% complete and the local government issues a Certificate of Occupancy, the short-term construction loan must be paid off. How this happens depends on the type of loan you secured:</p>
            <p><strong>Construction-To-Permanent (C2P):</strong> This is the most popular option (often called a "Single Close" loan). The bank automatically converts your short-term construction loan into a standard 15-year or 30-year fixed-rate mortgage. You only pay closing costs once. The day it converts, you begin making standard amortizing payments (Principal + Interest).</p>
            <p><strong>Construction-Only:</strong> If you select this option, the loan does not convert. It acts as a balloon loan. The day the house is finished, you owe the bank the entire principal amount in cash. Borrowers usually execute a completely separate mortgage transaction (a "Two-Time Close") to pay off the construction loan. This is riskier and requires paying closing costs twice, but it allows you to shop around for the best permanent mortgage rate after the house is built.</p>

            <h2 className="text-2xl font-bold mb-3">Analyzing Your Calculator Results</h2>
            <p>Our calculator provides a dual-phase analysis. Here is how to interpret the most critical data points:</p>
            <p><strong>Est. Monthly Construction Interest:</strong> This is a crucial number for your cash flow. While the house is being built, you are likely paying rent somewhere else (or paying your current mortgage). This number shows you the additional cash you must have on hand every month to cover the interest-only payments to the builder's bank.</p>
            <p><strong>Permanent Monthly Mortgage Payment:</strong> This is your long-term reality. Once you move into the house, the interest-only vacation is over. You must now begin paying down the massive principal balance over the next 30 years.</p>
            <p><strong>Total Interest Overall:</strong> This metric combines the interest bled during the construction phase with the massive compound interest generated during the 30-year permanent phase. It is not uncommon for a $400,000 build to generate $500,000 in total interest.</p>

            <h2 className="text-2xl font-bold mb-3">Critical Variables and Risks</h2>
            <p>Building a house carries significantly more financial risk than buying an existing one. Lenders mitigate this risk by adjusting the variables:</p>
            <p><strong>Higher Interest Rates:</strong> Construction loan rates are almost always 1% to 2% higher than standard mortgage rates. If the builder goes bankrupt halfway through, the bank is left with a half-built house that is nearly impossible to sell. You pay a premium for the bank taking on that massive execution risk.</p>
            <p><strong>Higher Down Payments:</strong> While you can buy an existing home with 3% to 5% down, construction loans almost universally require a minimum of 20% down. The bank wants to ensure you have significant "skin in the game" before they start writing checks to contractors. If you own the plot of land outright, the equity in that land can often serve as your 20% down payment.</p>
            <p><strong>Cost Overruns:</strong> The most dangerous variable in home building is the cost overrun. Lumber gets expensive, you upgrade the countertops, or the foundation requires extra excavation. If you exhaust your loan amount, the bank will not arbitrarily increase your limit. You will have to pay for the overruns out of your own pocket in cash.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples of Construction Financing</h2>
            <p><strong>Example 1: The C2P Advantage.</strong> You buy a $100,000 lot and contract a $300,000 build. You put down $80,000 (20%). Your loan is $320,000. During the 12-month build phase at a 7.5% rate, you pay roughly $12,000 in interest-only payments. Once the house is done, the loan automatically converts to a 30-year mortgage at 6.5%. Your permanent monthly payment becomes $2,022. You only paid closing costs once, securing a smooth transition.</p>
            <p><strong>Example 2: The Timeline Trap.</strong> You secure a 12-month construction loan. Due to supply chain issues and bad weather, the build takes 18 months. Because you exceeded the 12-month term, the bank charges you extension fees. Furthermore, you are trapped paying the higher 7.5% construction interest rate for an extra 6 months before the loan can convert to the lower permanent rate, costing you thousands of dollars in unexpected interest.</p>

            <h2 className="text-2xl font-bold mb-3">Tips and Best Practices</h2>
            <p><strong>Include a 10-20% Contingency Reserve:</strong> Never sign a construction loan where the approved loan amount exactly matches the builder's estimate. Building a house always costs more than expected. Demand a 10% to 20% contingency reserve built into the loan to handle inevitable cost overruns without bankrupting your personal savings.</p>
            <p><strong>Lock Your Permanent Rate Early:</strong> If you are doing a Construction-to-Permanent loan, ask your lender if you can lock in your permanent mortgage rate before construction begins. If interest rates skyrocket during the 12 months it takes to build your house, an unlocked rate could destroy your long-term affordability.</p>
            <p><strong>Vet Your Builder Relentlessly:</strong> The bank will vet the builder, but you must do it too. If the builder walks off the job, the bank stops issuing draws, but you still owe the interest on the money already disbursed. Your financial security is directly tied to the competence and financial stability of your general contractor.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>Financing a custom home build is a complex, multi-stage process that demands rigorous financial planning. A construction loan provides the necessary liquidity, but the interest-only draws and variable conversion rates can easily overwhelm an unprepared borrower.</p>
            <p>By utilizing this Construction Loan Calculator, you can map out your exact cash flow requirements from the day the foundation is poured to the day you make your final mortgage payment 30 years later. Understanding the mathematics of the draw schedule and the permanent conversion ensures that you can focus on building your dream home, rather than stressing over the financing.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/construction-loan-calculator" />
          <PopularCalculators exclude="/calculator/construction-loan-calculator" />
        </div>
      </div>
    </>
  );
}
