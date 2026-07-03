"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RecastResults {
  oldMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  totalInterestOld: number;
  totalInterestNew: number;
  interestSaved: number;
  totalCostOld: number;
  totalCostNew: number;
  netSavings: number;
  chartData: any[];
  breakdownRows: any[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateRecast = (inputs: any): RecastResults => {
  const balance = parseFloat(inputs.currentBalance) || 0;
  const rate = (parseFloat(inputs.interestRate) || 0) / 100 / 12;
  const months = parseFloat(inputs.remainingTerm) || 0;
  const lumpSum = parseFloat(inputs.lumpSum) || 0;
  const fee = parseFloat(inputs.recastFee) || 0;

  if (balance <= 0 || months <= 0 || rate <= 0) {
    return {
      oldMonthlyPayment: 0, newMonthlyPayment: 0, monthlySavings: 0,
      totalInterestOld: 0, totalInterestNew: 0, interestSaved: 0,
      totalCostOld: 0, totalCostNew: 0, netSavings: 0,
      chartData: [], breakdownRows: []
    };
  }

  // Calculate Old
  const oldMonthlyPayment = balance * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  const totalCostOld = oldMonthlyPayment * months;
  const totalInterestOld = totalCostOld - balance;

  // Calculate New
  const newBalance = balance - lumpSum;
  let newMonthlyPayment = 0;
  let totalCostNew = 0;
  let totalInterestNew = 0;

  if (newBalance > 0) {
    newMonthlyPayment = newBalance * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    totalCostNew = (newMonthlyPayment * months) + lumpSum + fee;
    totalInterestNew = (newMonthlyPayment * months) - newBalance;
  }

  const monthlySavings = Math.max(0, oldMonthlyPayment - newMonthlyPayment);
  const interestSaved = Math.max(0, totalInterestOld - totalInterestNew);
  const netSavings = Math.max(0, totalCostOld - totalCostNew);

  const chartData = [
    { name: "Before Recast", "Monthly Payment": parseFloat(oldMonthlyPayment.toFixed(2)) },
    { name: "After Recast", "Monthly Payment": parseFloat(newMonthlyPayment.toFixed(2)) }
  ];

  const breakdownRows = [
    { label: "Loan Balance", old: balance, new: newBalance },
    { label: "Monthly Payment", old: oldMonthlyPayment, new: newMonthlyPayment },
    { label: "Total Interest", old: totalInterestOld, new: totalInterestNew },
    { label: "Total Cost (inc. Principal)", old: totalCostOld, new: totalCostNew }
  ];

  return {
    oldMonthlyPayment,
    newMonthlyPayment,
    monthlySavings,
    totalInterestOld,
    totalInterestNew,
    interestSaved,
    totalCostOld,
    totalCostNew,
    netSavings,
    chartData,
    breakdownRows
  };
};

const DEFAULTS = {
  currentBalance: "250000",
  interestRate: "6.5",
  remainingTerm: "240",
  lumpSum: "50000",
  recastFee: "250"
};

export default function MortgageRecastCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RecastResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateRecast(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateRecast(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateRecast(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Recast Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Recast Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="currentBalance" label="Current Balance" value={inputs.currentBalance} onChange={(v: string) => handleChange("currentBalance", v)} prefix="$" />
              <CompactInput id="lumpSum" label="Lump Sum Payment" value={inputs.lumpSum} onChange={(v: string) => handleChange("lumpSum", v)} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="interestRate" label="Interest Rate" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
              <CompactInput id="remainingTerm" label="Remaining Term" value={inputs.remainingTerm} onChange={(v: string) => handleChange("remainingTerm", v)} suffix="months" />
            </div>
            
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
              Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <CompactInput id="recastFee" label="Recast Fee" value={inputs.recastFee} onChange={(v: string) => handleChange("recastFee", v)} prefix="$" />
              </div>
            )}
            
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="flex justify-end">
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">New Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary">${results.newMonthlyPayment.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">You save ${results.monthlySavings.toLocaleString("en-US", { maximumFractionDigits: 2 })} per month</div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Old Payment</div>
                    <div className="text-sm font-bold">${results.oldMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Interest Saved</div>
                    <div className="text-sm font-bold text-green-600">${results.interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Net Savings</div>
                    <div className="text-sm font-bold text-primary">${results.netSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `$\${val}`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(val: number) => `$\${val.toFixed(2)}`} cursor={{fill: 'transparent'}} />
                      <Bar dataKey="Monthly Payment" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Before & After Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Category</th>
                          <th className="py-2 font-semibold">Before Recast</th>
                          <th className="py-2 font-semibold">After Recast</th>
                          <th className="py-2 font-semibold">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => (
                          <tr key={idx} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                            <td className="text-left py-2.5 font-medium">{row.label}</td>
                            <td className="py-2.5">${row.old.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="py-2.5">${row.new.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="py-2.5 font-medium text-green-600">
                              {row.old > row.new ? "-" : "+"}${Math.abs(row.old - row.new).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5 mt-4">
                  <h3 className="text-base font-semibold mb-3">Recast Summary</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Lump Sum Paid</span>
                      <span className="font-medium">${parseFloat(inputs.lumpSum).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Recast Fee</span>
                      <span className="font-medium">${parseFloat(inputs.recastFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">New Balance</span>
                      <span className="font-medium">${(parseFloat(inputs.currentBalance) - parseFloat(inputs.lumpSum)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Remaining Term</span>
                      <span className="font-medium">{inputs.remainingTerm} months</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mt-12 prose prose-slate dark:prose-invert">
          <h2>What Is a Mortgage Recast?</h2>
          <p>A mortgage recast (or re-amortization) occurs when you make a large lump-sum payment toward your mortgage principal, and your lender recalculates your monthly payments based on the new, lower balance. The interest rate and the remaining loan term stay exactly the same.</p>
          
          <h2>How It Works</h2>
          <p>The standard amortization formula is used again: <strong>M = P[r(1+r)^n] / [(1+r)^n - 1]</strong>. The new principal (P) is the old balance minus your lump-sum payment. The interest rate (r) and number of remaining payments (n) do not change.</p>

          <h2>Understanding Your Results</h2>
          <p>This calculator shows your new, lower monthly payment and compares your total interest costs before and after the recast. The net savings figure subtracts your lump-sum payment and any recast fees from the total amount you would have paid without recasting.</p>
          
          <h2>Key Factors</h2>
          <p>The biggest factor is the size of the lump-sum payment. Lenders usually require a minimum lump sum (such as $5,000 or $10,000) to qualify for a recast. Additionally, most lenders charge a small administrative fee, typically between $250 and $500.</p>
          
          <h2>Advanced Features</h2>
          <p>Our Advanced Options allow you to input the recast fee charged by your specific lender. This ensures that the net savings calculation is 100% accurate, taking all your out-of-pocket expenses into account.</p>
          
          <h2>Practical Examples</h2>
          <p>Suppose you inherited $50,000 and want to lower your monthly expenses. If you owe $250,000 at 6.5% with 20 years left, recasting lowers your monthly payment from $1,863 to $1,491, giving you an extra $372 per month in cash flow.</p>
          
          <h2>Tips & Best Practices</h2>
          <p>Not all mortgages qualify for recasting. FHA and VA loans typically cannot be recast. Always ask your servicer if they allow recasting and what their specific requirements are before making a large lump-sum payment.</p>
          
          <h2>Benefits</h2>
          <p>Recasting is an excellent alternative to refinancing if you already have a low interest rate. You avoid the high closing costs associated with a refinance, keep your low rate, and still benefit from a lower monthly payment.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/mortgage-recast-calculator" faqs={[
          { question: "What is the difference between recasting and refinancing?", answer: "Refinancing replaces your old loan with a new one, usually to get a lower interest rate, but it involves high closing costs. Recasting keeps your existing loan and rate but recalculates the payment based on a lower balance, with a very small fee." },
          { question: "Does recasting shorten my loan term?", answer: "No. A recast keeps your original payoff date. If you want to pay off the loan faster, you should simply make extra principal payments without recasting." },
          { question: "Are there minimum requirements to recast?", answer: "Yes, most lenders require a minimum lump sum, often $5,000 or $10,000. Your loan must also be in good standing." },
          { question: "Can any mortgage be recast?", answer: "No. Conventional loans usually can be, but government-backed loans like FHA, VA, and USDA loans typically do not allow recasting." },
          { question: "Should I recast or invest the lump sum?", answer: "This depends on your interest rate. If your mortgage rate is very low (e.g., 3%), you might earn more by investing the lump sum in the stock market. If your rate is high, recasting provides a guaranteed, risk-free return." },
          { question: "Will my credit be checked for a recast?", answer: "No. Since you are not applying for a new loan, there is no credit check, appraisal, or income verification required." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
