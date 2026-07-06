"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Receipt, Calculator, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TaxInputs {
  grossIncome: number;
  withheld: number;
  filingStatus: string;
  dependents: number;
  preTaxDeductions: number;
  itemizedDeductions: number;
  otherCredits: number;
}

interface TaxResults {
  taxableIncome: number;
  taxLiability: number;
  totalCredits: number;
  netTax: number;
  refundAmount: number;
  isRefund: boolean;
  effectiveRate: number;
  marginalRate: number;
  standardDeduction: number;
  deductionUsed: number;
  isItemized: boolean;
  chartData: { category: string; amount: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateTaxes = (inputs: TaxInputs): TaxResults => {
  const { grossIncome, withheld, filingStatus, dependents, preTaxDeductions, itemizedDeductions, otherCredits } = inputs;
  
  // 2024 Standard Deductions
  let standardDeduction = 14600; // Single
  if (filingStatus === "married") standardDeduction = 29200;
  if (filingStatus === "head") standardDeduction = 21900;
  
  const deductionUsed = Math.max(standardDeduction, itemizedDeductions);
  const isItemized = itemizedDeductions > standardDeduction;

  const adjustedGrossIncome = Math.max(0, grossIncome - preTaxDeductions);
  const taxableIncome = Math.max(0, adjustedGrossIncome - deductionUsed);

  // 2024 Brackets
  const singleBrackets = [
    { limit: 11600, rate: 0.10 }, { limit: 47150, rate: 0.12 }, { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 }, { limit: 243725, rate: 0.32 }, { limit: 609350, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const marriedBrackets = [
    { limit: 23200, rate: 0.10 }, { limit: 94300, rate: 0.12 }, { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 }, { limit: 487450, rate: 0.32 }, { limit: 731200, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const headBrackets = [
    { limit: 16550, rate: 0.10 }, { limit: 63100, rate: 0.12 }, { limit: 100500, rate: 0.22 },
    { limit: 191950, rate: 0.24 }, { limit: 243700, rate: 0.32 }, { limit: 609350, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];

  const brackets = filingStatus === "married" ? marriedBrackets : filingStatus === "head" ? headBrackets : singleBrackets;
  
  let taxLiability = 0;
  let remainingTaxable = taxableIncome;
  let prevLimit = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (remainingTaxable > 0) {
      marginalRate = bracket.rate * 100;
      const taxableInBracket = Math.min(remainingTaxable, bracket.limit - prevLimit);
      taxLiability += taxableInBracket * bracket.rate;
      remainingTaxable -= taxableInBracket;
    }
    prevLimit = bracket.limit;
    if (remainingTaxable <= 0) break;
  }

  // Credits (Simplified Child Tax Credit: $2,000 per dependent + Other)
  const childCredit = dependents * 2000;
  const totalCredits = childCredit + otherCredits;
  
  // Tax credits can reduce tax liability to zero (non-refundable for simplicity here)
  let netTax = Math.max(0, taxLiability - totalCredits);
  
  // Refund or Owe
  const refundAmount = withheld - netTax;
  const isRefund = refundAmount >= 0;

  const effectiveRate = grossIncome > 0 ? (netTax / grossIncome) * 100 : 0;

  const chartData = [
    { category: "Non-Taxable", amount: grossIncome - taxableIncome, color: "#10b981" }, // Green
    { category: "Taxable", amount: taxableIncome, color: "hsl(var(--primary))" }, // Blue
  ].filter(d => d.amount > 0);

  const summaryStats = [
    { label: "Effective Tax Rate", value: `${effectiveRate.toFixed(1)}%` },
    { label: "Marginal Tax Bracket", value: `${marginalRate.toFixed(0)}%` },
    { label: "Deduction Type", value: isItemized ? "Itemized" : "Standard" },
    { label: "Taxable Income", value: `$${taxableIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Gross Income", amount: `$${grossIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Pre-Tax Deductions", amount: `-$${preTaxDeductions.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: isItemized ? "Itemized Deductions" : "Standard Deduction", amount: `-$${deductionUsed.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: "Taxable Income", amount: `$${taxableIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
    { label: "Estimated Tax Liability", amount: `$${taxLiability.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Tax Credits", amount: `-$${totalCredits.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: "Net Tax Due", amount: `$${netTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
  ];

  return {
    taxableIncome, taxLiability, totalCredits, netTax, refundAmount: Math.abs(refundAmount), isRefund,
    effectiveRate, marginalRate, standardDeduction, deductionUsed, isItemized, chartData, summaryStats, breakdown
  };
};

const DEFAULTS = { grossIncome: "75000", withheld: "10000", filingStatus: "single", dependents: "0", preTaxDeductions: "0", itemizedDeductions: "0", otherCredits: "0" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function TaxRefundCalculator() {
  const [grossIncome, setGrossIncome] = useState(DEFAULTS.grossIncome);
  const [withheld, setWithheld] = useState(DEFAULTS.withheld);
  const [filingStatus, setFilingStatus] = useState(DEFAULTS.filingStatus);
  const [dependents, setDependents] = useState(DEFAULTS.dependents);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preTaxDeductions, setPreTaxDeductions] = useState(DEFAULTS.preTaxDeductions);
  const [itemizedDeductions, setItemizedDeductions] = useState(DEFAULTS.itemizedDeductions);
  const [otherCredits, setOtherCredits] = useState(DEFAULTS.otherCredits);

  const [results, setResults] = useState<TaxResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateTaxes({
      grossIncome: parseFloat(grossIncome) || 0,
      withheld: parseFloat(withheld) || 0,
      filingStatus,
      dependents: parseInt(dependents) || 0,
      preTaxDeductions: parseFloat(preTaxDeductions) || 0,
      itemizedDeductions: parseFloat(itemizedDeductions) || 0,
      otherCredits: parseFloat(otherCredits) || 0
    }));
  };

  const handleReset = () => {
    setGrossIncome(DEFAULTS.grossIncome); setWithheld(DEFAULTS.withheld); setFilingStatus(DEFAULTS.filingStatus); setDependents(DEFAULTS.dependents);
    setPreTaxDeductions(DEFAULTS.preTaxDeductions); setItemizedDeductions(DEFAULTS.itemizedDeductions); setOtherCredits(DEFAULTS.otherCredits);
    setShowAdvanced(false);
    setResults(calculateTaxes({ grossIncome: 75000, withheld: 10000, filingStatus: "single", dependents: 0, preTaxDeductions: 0, itemizedDeductions: 0, otherCredits: 0 }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Tax Estimate 2024</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.category}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Tax Refund Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tax Refund Estimator (2024)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Income & Withholding</h2>
            </div>
            
            <CompactInput id="gross" label="Annual Gross Income" value={grossIncome} onChange={setGrossIncome} prefix="$" />
            <CompactInput id="withheld" label="Federal Tax Withheld" value={withheld} onChange={setWithheld} prefix="$" />

            <hr className="border-border my-2" />
            
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Filing & Family</h2>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Filing Status</label>
              <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="head">Head of Household</option>
              </select>
            </div>
            <CompactInput id="dep" label="Number of Dependents (Kids < 17)" value={dependents} onChange={setDependents} suffix="kids" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="pretax" label="Pre-Tax Deductions (401k, HSA, etc)" value={preTaxDeductions} onChange={setPreTaxDeductions} prefix="$" />
                  <CompactInput id="itemized" label="Itemized Deductions (Overrides Standard)" value={itemizedDeductions} onChange={setItemizedDeductions} prefix="$" />
                  <CompactInput id="credits" label="Other Tax Credits" value={otherCredits} onChange={setOtherCredits} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.isRefund ? "bg-emerald-500/10 border-emerald-500" : "bg-red-500/10 border-red-500"}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    {results.isRefund ? "Estimated Tax Refund" : "Estimated Amount Owed"}
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.isRefund ? "text-emerald-600" : "text-red-600"}`}>
                    ${results.refundAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {results.isRefund 
                      ? "You overpaid your taxes throughout the year and are owed a refund."
                      : "You underpaid your taxes throughout the year and must write a check to the IRS."}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Tax Summary</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Income Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Estimate Your Tax Refund</h2>
              <p className="text-muted-foreground leading-relaxed">
                Understanding how your tax refund is calculated can help you manage your finances better and avoid surprises in April. A tax refund is not "free money" from the government; it is simply the return of money that you overpaid throughout the year. This calculator provides a highly accurate estimate of your 2024 federal tax situation by applying the official IRS standard deductions and tax brackets to your gross income.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">The Basic Tax Formula</h2>
              <p className="text-muted-foreground leading-relaxed">
                The IRS uses a specific sequence to determine your final tax bill. First, it takes your <strong>Gross Income</strong> and subtracts pre-tax deductions (like a 401(k) or HSA). Then, it subtracts the <strong>Standard Deduction</strong> ($14,600 for Single, $29,200 for Married Filing Jointly in 2024) to find your <strong>Taxable Income</strong>. Your taxable income is then pushed through the progressive tax brackets to determine your total tax liability. Finally, tax credits are subtracted, and the remaining net tax is compared to what you already had withheld from your paychecks.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">Credits vs. Deductions</h2>
              <p className="text-muted-foreground leading-relaxed">
                It's critical to know the difference between these two tax-lowering tools. <strong>Deductions</strong> lower the amount of income you are taxed on. For example, a $1,000 deduction saves you $220 if you are in the 22% tax bracket. <strong>Credits</strong>, however, lower your tax bill dollar-for-dollar. A $1,000 credit (such as the Child Tax Credit) saves you exactly $1,000, regardless of your tax bracket, making credits vastly more powerful than deductions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Why Large Refunds Aren't Always Good</h2>
              <p className="text-muted-foreground leading-relaxed">
                While a big check in the mail feels good, a large refund means you gave the government an interest-free loan all year. If you received a $3,000 refund, that is $250 a month that could have been in your paycheck to pay down debt, invest in your retirement account, or place in a High-Yield Savings Account. If you consistently receive massive refunds (or owe large amounts), you should submit a new Form W-4 to your employer to properly adjust your withholding.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "What is the standard deduction for 2024?", answer: "For the 2024 tax year, the standard deduction is $14,600 for single filers, $29,200 for married couples filing jointly, and $21,900 for heads of household. This amount is subtracted from your gross income to determine your taxable income." },
            { question: "How does the Child Tax Credit affect my refund?", answer: "The Child Tax Credit provides up to $2,000 per qualifying child under age 17. Because it is a 'credit,' it reduces your tax liability dollar-for-dollar. If the credit reduces your tax to zero, you may be eligible for a partial refund of the remaining credit (the Additional Child Tax Credit)." },
            { question: "Why did I owe money instead of getting a refund?", answer: "You owe money if your total tax liability for the year is greater than the amount of tax withheld from your paychecks. This often happens if you have multiple jobs, significant investment income, or if you didn't adjust your W-4 properly after a life change (like a marriage, new baby, or raise)." },
            { question: "How long does it take to get a tax refund?", answer: "Most taxpayers receive their refund within 21 days of filing electronically with direct deposit. Paper returns can take 6 to 12 weeks to process. If you claim the Earned Income Tax Credit (EITC) or Additional Child Tax Credit, the IRS cannot issue your refund before mid-February by law." }
          ]} pageUrl="https://racira.com/calculator/tax-refund-calculator" />
          <PopularCalculators exclude="/calculator/tax-refund-calculator" />
        </div>
      </div>
    </>
  );
}
