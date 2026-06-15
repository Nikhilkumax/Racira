"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface OriginationResults {
  loanAmount: number;
  originationFeeAmt: number;
  netLoanAmount: number;
  totalCashToClose: number;
  monthlyPaymentImpact: number;
  totalInterestImpact: number;
  chartData: any[];
  breakdownRows: any[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {type === "select" ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium cursor-pointer" {...props}>
          {props.children}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateOrigination = (inputs: any): OriginationResults => {
  const hp = parseFloat(inputs.homePrice) || 0;
  const dpPct = parseFloat(inputs.downPaymentPct) || 0;
  const dpAmt = hp * (dpPct / 100);
  const loanAmount = hp - dpAmt;
  
  const feePct = parseFloat(inputs.originationFeePct) || 0;
  const originationFeeAmt = loanAmount * (feePct / 100);
  
  const otherCosts = parseFloat(inputs.otherClosingCosts) || 0;
  const feeTreatment = inputs.feeTreatment; // "upfront" | "rolled"

  const rate = (parseFloat(inputs.interestRate) || 0) / 100 / 12;
  const months = (parseFloat(inputs.loanTerm) || 30) * 12;

  let netLoanAmount = loanAmount;
  let totalCashToClose = dpAmt + otherCosts;
  
  if (feeTreatment === "upfront") {
    totalCashToClose += originationFeeAmt;
  } else if (feeTreatment === "rolled") {
    netLoanAmount += originationFeeAmt;
  } else if (feeTreatment === "deducted") {
    netLoanAmount -= originationFeeAmt; // Rare for mortgages, common for personal loans
  }

  // Calculate monthly payment impacts if it's rolled in
  let monthlyPaymentImpact = 0;
  let totalInterestImpact = 0;
  
  if (feeTreatment === "rolled" && rate > 0) {
    const basePmt = loanAmount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const newPmt = netLoanAmount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    monthlyPaymentImpact = newPmt - basePmt;
    totalInterestImpact = (newPmt * months - netLoanAmount) - (basePmt * months - loanAmount);
  }

  const chartData = [
    { name: "Down Payment", value: dpAmt, color: "hsl(var(--primary))" },
    { name: "Origination Fee", value: originationFeeAmt, color: "#f59e0b" },
    { name: "Other Costs", value: otherCosts, color: "#10b981" }
  ].filter(d => d.value > 0);

  const breakdownRows = [
    { label: "Home Price", value: hp },
    { label: "Down Payment", value: -dpAmt },
    { label: "Base Loan Amount", value: loanAmount },
    { label: "Origination Fee", value: feeTreatment === "rolled" ? originationFeeAmt : 0 },
    { label: "Final Loan Amount", value: netLoanAmount, isBold: true }
  ];

  return {
    loanAmount,
    originationFeeAmt,
    netLoanAmount,
    totalCashToClose,
    monthlyPaymentImpact,
    totalInterestImpact,
    chartData,
    breakdownRows
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground -translate-y-14 transform">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const DEFAULTS = {
  homePrice: "400000",
  downPaymentPct: "20",
  originationFeePct: "1.0",
  feeTreatment: "upfront",
  otherClosingCosts: "3500",
  interestRate: "6.5",
  loanTerm: "30"
};

export default function LoanOriginationFeeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<OriginationResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateOrigination(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateOrigination(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateOrigination(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Origination Fee Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Origination Fee Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="homePrice" label="Home Price" value={inputs.homePrice} onChange={(v: string) => handleChange("homePrice", v)} prefix="$" />
              <CompactInput id="downPaymentPct" label="Down Payment" value={inputs.downPaymentPct} onChange={(v: string) => handleChange("downPaymentPct", v)} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="originationFeePct" label="Origination Fee" value={inputs.originationFeePct} onChange={(v: string) => handleChange("originationFeePct", v)} suffix="%" />
              <CompactInput id="feeTreatment" label="Fee Treatment" value={inputs.feeTreatment} onChange={(v: string) => handleChange("feeTreatment", v)} type="select">
                <option value="upfront">Pay Upfront in Cash</option>
                <option value="rolled">Roll into Loan Amount</option>
                <option value="deducted">Deduct from Loan Amount</option>
              </CompactInput>
            </div>
            
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
              Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <CompactInput id="otherClosingCosts" label="Other Closing Costs" value={inputs.otherClosingCosts} onChange={(v: string) => handleChange("otherClosingCosts", v)} prefix="$" />
                <div className="col-span-2 text-xs text-muted-foreground mb-1">Used to calculate financing impact (if rolled into loan):</div>
                <CompactInput id="interestRate" label="Interest Rate" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
                <CompactInput id="loanTerm" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="years" />
              </div>
            )}
            
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Origination Fee Amount</div>
                  <div className="text-4xl font-bold text-primary">${results.originationFeeAmt.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">Based on {inputs.originationFeePct}% of $${results.loanAmount.toLocaleString()} loan</div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Net Loan Amount</div>
                    <div className="text-sm font-bold">${results.netLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Cash to Close</div>
                    <div className="text-sm font-bold text-green-600">${results.totalCashToClose.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={results.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {results.chartData.map((entry, index) => (
                          <Cell key={`cell-\${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Loan Amount Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Item</th>
                          <th className="py-2 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => (
                          <tr key={idx} className={`border-b border-border/50 hover:bg-muted/50 transition-colors \${row.isBold ? 'font-bold bg-muted/20' : ''}`}>
                            <td className="text-left py-2.5">{row.label}</td>
                            <td className={`py-2.5 \${row.value < 0 ? 'text-destructive' : ''}`}>
                              {row.value < 0 ? "-" : ""}${Math.abs(row.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {inputs.feeTreatment === "rolled" && (
                  <div className="bg-muted/30 rounded-lg p-5 mt-4">
                    <h3 className="text-base font-semibold mb-3">Cost of Financing the Fee</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                      <div className="flex justify-between border-b border-border/50 pb-1 col-span-2">
                        <span className="text-muted-foreground">Added to Monthly Payment</span>
                        <span className="font-bold text-destructive">+${results.monthlyPaymentImpact.toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-1 col-span-2">
                        <span className="text-muted-foreground">Extra Interest Paid Over Loan Term</span>
                        <span className="font-bold text-destructive">+${results.totalInterestImpact.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mx-auto mt-12 prose prose-slate dark:prose-invert">
          <h2>What Is a Loan Origination Fee?</h2>
          <p>A loan origination fee is an upfront charge levied by a lender to process a new loan application. It serves as compensation for putting the loan in place. Origination fees are quoted as a percentage of the total loan amount and generally range between 0.5% and 1% for mortgages, and up to 8% for personal loans.</p>
          
          <h2>How It Works</h2>
          <p>The math is simple: <strong>Origination Fee = Loan Amount × Fee Percentage</strong>. However, what matters most is how this fee is treated at closing. It can either be paid entirely out-of-pocket as cash at closing, rolled into the total loan amount (increasing your monthly payments), or deducted directly from your loan proceeds (common in personal loans).</p>

          <h2>Understanding Your Results</h2>
          <p>This calculator determines the exact dollar amount of the origination fee. The pie chart visualizes your total cash needed to close, helping you see what portion of your upfront costs is strictly for the origination fee versus your down payment or other closing costs.</p>
          
          <h2>Key Factors</h2>
          <p>The "Fee Treatment" option dramatically changes the financial outcome. If you pay upfront, it costs you cash today but saves you money long-term. If you roll it into the loan, you preserve cash today but will pay interest on that fee for the next 15 to 30 years.</p>
          
          <h2>Advanced Features</h2>
          <p>Using the advanced options, if you choose to "Roll into Loan Amount", the calculator will compute exactly how much extra interest you will pay over the life of the loan just for financing that origination fee.</p>
          
          <h2>Practical Examples</h2>
          <p>For a $320,000 loan with a 1% origination fee, you owe $3,200. If you roll that $3,200 into a 30-year mortgage at 6.5%, your monthly payment increases by about $20, and you will pay an additional $4,085 in interest over 30 years—making the true cost of that fee over $7,200.</p>
          
          <h2>Tips & Best Practices</h2>
          <p>Origination fees are highly negotiable. Always ask your lender to waive or reduce the fee. You can also compare "no-fee" loans, though be aware they often come with slightly higher interest rates to compensate the lender.</p>
          
          <h2>Benefits</h2>
          <p>By calculating the origination fee upfront, you can properly budget your cash-to-close and make an educated decision on whether it makes sense to pay the fee out-of-pocket or finance it.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/loan-origination-fee-calculator" faqs={[
          { question: "Are loan origination fees tax deductible?", answer: "Yes, mortgage origination fees (often referred to as 'points') are generally tax-deductible if you itemize deductions. However, origination fees on personal or auto loans are not deductible." },
          { question: "How much is a typical origination fee?", answer: "For mortgages, it typically ranges from 0.5% to 1% of the loan amount. For personal loans, it can be much higher, ranging from 1% to 8% depending on your credit score." },
          { question: "Is the origination fee included in the APR?", answer: "Yes. The Annual Percentage Rate (APR) reflects the true cost of borrowing, which includes the interest rate plus the origination fee and other prepaid finance charges." },
          { question: "Can I negotiate the origination fee?", answer: "Absolutely. When you receive a Loan Estimate, you can take it to competing lenders and ask them to beat the origination fee. Many lenders will reduce it to win your business." },
          { question: "What does it mean when a fee is 'deducted from loan proceeds'?", answer: "This is common with personal loans. If you are approved for a $10,000 loan with a 5% ($500) origination fee, the lender deposits $9,500 into your bank account, but you must still repay the full $10,000 plus interest." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
