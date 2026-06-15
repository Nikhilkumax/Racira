"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface LoanOption {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  fees: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

interface ComparisonResults {
  loanA: LoanOption;
  loanB: LoanOption;
  savingsMonthly: number;
  savingsTotal: number;
  betterOption: "A" | "B" | "Equal";
  chartData: any[];
  breakdownRows: any[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-[13px] font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateComparison = (inputs: any): ComparisonResults => {
  const calcOption = (amtStr: string, rateStr: string, termStr: string, feeStr: string): LoanOption => {
    const amt = parseFloat(amtStr) || 0;
    const rate = parseFloat(rateStr) || 0;
    const term = (parseFloat(termStr) || 0) * 12; // Assuming inputs in years
    const fees = parseFloat(feeStr) || 0;
    
    let pmt = 0;
    let totalInt = 0;
    let totalCost = 0;
    
    if (amt > 0 && term > 0) {
      const r = rate / 100 / 12;
      pmt = r > 0 ? amt * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1) : amt / term;
      totalCost = (pmt * term) + fees;
      totalInt = totalCost - amt - fees;
    }
    
    return {
      loanAmount: amt,
      interestRate: rate,
      termMonths: term,
      fees,
      monthlyPayment: pmt,
      totalInterest: totalInt,
      totalCost
    };
  };

  const loanA = calcOption(inputs.amountA, inputs.rateA, inputs.termA, inputs.feeA);
  const loanB = calcOption(inputs.amountB, inputs.rateB, inputs.termB, inputs.feeB);

  const savingsMonthly = Math.abs(loanA.monthlyPayment - loanB.monthlyPayment);
  const savingsTotal = Math.abs(loanA.totalCost - loanB.totalCost);
  
  let betterOption: "A" | "B" | "Equal" = "Equal";
  if (loanA.totalCost < loanB.totalCost && loanA.totalCost > 0) betterOption = "A";
  else if (loanB.totalCost < loanA.totalCost && loanB.totalCost > 0) betterOption = "B";

  const chartData = [
    {
      name: "Loan A",
      Principal: loanA.loanAmount,
      Interest: loanA.totalInterest,
      Fees: loanA.fees,
    },
    {
      name: "Loan B",
      Principal: loanB.loanAmount,
      Interest: loanB.totalInterest,
      Fees: loanB.fees,
    }
  ];

  const breakdownRows = [
    { label: "Loan Amount", valA: loanA.loanAmount, valB: loanB.loanAmount, isCurrency: true },
    { label: "Interest Rate", valA: loanA.interestRate, valB: loanB.interestRate, isCurrency: false, suffix: "%" },
    { label: "Term (Years)", valA: loanA.termMonths / 12, valB: loanB.termMonths / 12, isCurrency: false },
    { label: "Upfront Fees", valA: loanA.fees, valB: loanB.fees, isCurrency: true },
    { label: "Monthly Payment", valA: loanA.monthlyPayment, valB: loanB.monthlyPayment, isCurrency: true, highlight: true },
    { label: "Total Interest Paid", valA: loanA.totalInterest, valB: loanB.totalInterest, isCurrency: true },
    { label: "Total Cost of Loan", valA: loanA.totalCost, valB: loanB.totalCost, isCurrency: true, isBold: true }
  ];

  return {
    loanA,
    loanB,
    savingsMonthly,
    savingsTotal,
    betterOption,
    chartData,
    breakdownRows
  };
};

const DEFAULTS = {
  amountA: "300000",
  rateA: "6.5",
  termA: "30",
  feeA: "3000",
  
  amountB: "300000",
  rateB: "5.75",
  termB: "15",
  feeB: "4500"
};

export default function LoanComparisonCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateComparison(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateComparison(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateComparison(DEFAULTS));
  };

  const colors = {
    Principal: "hsl(var(--primary))",
    Interest: "#f59e0b",
    Fees: "#ef4444"
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Comparison Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Comparison Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            
            <div className="p-3 border border-border rounded-lg bg-secondary/10 relative">
              <div className="absolute -top-3 left-3 bg-card px-2 text-xs font-bold text-primary uppercase tracking-wider">Loan Option A</div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <CompactInput id="amountA" label="Loan Amount" value={inputs.amountA} onChange={(v: string) => handleChange("amountA", v)} prefix="$" />
                <CompactInput id="rateA" label="Interest Rate" value={inputs.rateA} onChange={(v: string) => handleChange("rateA", v)} suffix="%" />
                <CompactInput id="termA" label="Loan Term" value={inputs.termA} onChange={(v: string) => handleChange("termA", v)} suffix="yrs" />
                <CompactInput id="feeA" label="Closing Fees" value={inputs.feeA} onChange={(v: string) => handleChange("feeA", v)} prefix="$" />
              </div>
            </div>

            <div className="p-3 border border-border rounded-lg bg-secondary/10 relative mt-2">
              <div className="absolute -top-3 left-3 bg-card px-2 text-xs font-bold text-[#8b5cf6] uppercase tracking-wider">Loan Option B</div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <CompactInput id="amountB" label="Loan Amount" value={inputs.amountB} onChange={(v: string) => handleChange("amountB", v)} prefix="$" />
                <CompactInput id="rateB" label="Interest Rate" value={inputs.rateB} onChange={(v: string) => handleChange("rateB", v)} suffix="%" />
                <CompactInput id="termB" label="Loan Term" value={inputs.termB} onChange={(v: string) => handleChange("termB", v)} suffix="yrs" />
                <CompactInput id="feeB" label="Closing Fees" value={inputs.feeB} onChange={(v: string) => handleChange("feeB", v)} prefix="$" />
              </div>
            </div>
            
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Compare Loans
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
                
                <div className={`border-l-4 rounded-lg p-5 \${results.betterOption === 'A' ? 'bg-primary/10 border-primary' : results.betterOption === 'B' ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]' : 'bg-muted border-muted-foreground'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">The Better Financial Option Is</div>
                  <div className={`text-4xl font-bold \${results.betterOption === 'A' ? 'text-primary' : results.betterOption === 'B' ? 'text-[#8b5cf6]' : 'text-foreground'}`}>
                    {results.betterOption === "Equal" ? "Both are Equal" : `Loan Option \${results.betterOption}`}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {results.betterOption !== "Equal" 
                      ? `Choosing Option \${results.betterOption} saves you $\${results.savingsTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} over the life of the loan.` 
                      : "Both loans have the exact same total cost."}
                  </div>
                </div>

                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: "bold" }} />
                      <YAxis tickFormatter={(val) => `$\${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(val: number) => `$\${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} cursor={{fill: 'transparent'}} />
                      <Legend />
                      <Bar dataKey="Principal" stackId="a" fill={colors.Principal} maxBarSize={80} />
                      <Bar dataKey="Interest" stackId="a" fill={colors.Interest} maxBarSize={80} />
                      <Bar dataKey="Fees" stackId="a" fill={colors.Fees} radius={[4, 4, 0, 0]} maxBarSize={80} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Side-by-Side Comparison</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Category</th>
                          <th className="py-2 font-semibold text-primary">Loan Option A</th>
                          <th className="py-2 font-semibold text-[#8b5cf6]">Loan Option B</th>
                          <th className="py-2 font-semibold">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => {
                          const diff = Math.abs(row.valA - row.valB);
                          return (
                            <tr key={idx} className={`border-b border-border/50 hover:bg-muted/50 transition-colors \${row.isBold ? 'font-bold bg-muted/20' : ''} \${row.highlight ? 'bg-secondary/30' : ''}`}>
                              <td className="text-left py-2.5 font-medium">{row.label}</td>
                              <td className="py-2.5">
                                {row.isCurrency ? "$" : ""}{row.valA.toLocaleString(undefined, { maximumFractionDigits: 2 })}{row.suffix || ""}
                              </td>
                              <td className="py-2.5">
                                {row.isCurrency ? "$" : ""}{row.valB.toLocaleString(undefined, { maximumFractionDigits: 2 })}{row.suffix || ""}
                              </td>
                              <td className="py-2.5 text-muted-foreground">
                                {diff > 0 ? (row.isCurrency ? `$\${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `\${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}\${row.suffix || ""}`) : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mx-auto mt-12 prose prose-slate dark:prose-invert">
          <h2>What Is a Loan Comparison Calculator?</h2>
          <p>A loan comparison calculator allows you to input the terms of two different loan offers and compare them side-by-side. It reveals which loan is mathematically the better deal by calculating the total cost of each loan over its entire lifespan.</p>
          
          <h2>How It Works</h2>
          <p>The calculator uses standard amortization formulas to determine the monthly payment and total interest for both Loan A and Loan B. It then adds any upfront closing or origination fees to calculate the true "Total Cost of Loan." The loan with the lower total cost is declared the winner.</p>

          <h2>Understanding Your Results</h2>
          <p>While one loan may have a lower interest rate, it might require higher upfront fees. Alternatively, one loan might have a lower monthly payment because it's stretched over 30 years instead of 15, but it will cost significantly more in total interest. The side-by-side breakdown helps you weigh these trade-offs.</p>
          
          <h2>Key Factors</h2>
          <p>The most important factors when comparing loans are the <strong>interest rate</strong>, the <strong>loan term</strong> (length of the loan), and the <strong>fees/points</strong>. A shorter loan term always saves you money on interest, but requires a higher monthly payment.</p>
          
          <h2>Practical Examples</h2>
          <p>Imagine choosing between a 30-year mortgage at 6.5% with $3,000 in fees, and a 15-year mortgage at 5.75% with $4,500 in fees. The 15-year mortgage has a monthly payment about $600 higher, but it saves you over $200,000 in total interest compared to the 30-year loan.</p>
          
          <h2>Tips & Best Practices</h2>
          <p>Always compare the APR (Annual Percentage Rate) if you are comparing loans with the exact same term length. However, if the terms are different (e.g., a 15-year vs a 30-year), comparing the Total Cost over the life of the loan using this calculator is the most accurate way to find the cheapest option.</p>
          
          <h2>Benefits</h2>
          <p>Using a loan comparison tool prevents you from falling for "too good to be true" low interest rates that are secretly packed with exorbitant closing costs. It empowers you to make financial decisions based on hard math.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/loan-comparison-calculator" faqs={[
          { question: "How do I know which loan is better?", answer: "The mathematically 'better' loan is the one with the lowest total cost (Principal + Interest + Fees). However, you must also ensure you can comfortably afford the monthly payment of that loan." },
          { question: "Why does the lower rate loan cost more overall sometimes?", answer: "If the lower-rate loan has a much longer repayment term (e.g., 30 years vs 15 years), the interest has much more time to compound. You pay a lower rate, but you pay it for twice as long, resulting in higher total costs." },
          { question: "Should I pay points to get a lower rate?", answer: "It depends on how long you plan to keep the loan. If you plan to stay in the home or keep the loan for 7-10+ years, paying points upfront for a lower rate usually saves money. If you plan to move in 3 years, taking the higher rate with no fees is better." },
          { question: "What if the monthly payments are vastly different?", answer: "If Loan A has a much higher monthly payment that strains your budget, it might not be the 'better' option for you, even if it saves money on total interest. Cash flow matters just as much as total cost." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
