"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, TrendingUp, Calculator } from "lucide-react";

interface RefinanceResults {
  currentMonthly: number;
  newMonthly: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  interestSavings: number;
  currentRows: AmortRow[];
  newRows: AmortRow[];
}

const RefinanceCalculator = () => {
  // Current Loan
  const [currentBalance, setCurrentBalance] = useState("300000");
  const [currentRate, setCurrentRate] = useState("6.5");
  const [remainingYears, setRemainingYears] = useState("25");

  // New Loan
  const [newRate, setNewRate] = useState("5.5");
  const [newTerm, setNewTerm] = useState("30");
  const [closingCosts, setClosingCosts] = useState("5000");
  const [includeCosts, setIncludeCosts] = useState(false);

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [points, setPoints] = useState("0");
  const [otherCosts, setOtherCosts] = useState("0");

  const [results, setResults] = useState<RefinanceResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { handleCalculate(); }, []);

  const handleCalculate = () => {
    const P_current = parseFloat(currentBalance) || 0;
    const r_current = (parseFloat(currentRate) || 0) / 100 / 12;
    const n_current = (parseFloat(remainingYears) || 0) * 12;

    const costs = (parseFloat(closingCosts) || 0) + (parseFloat(otherCosts) || 0);
    const P_new = includeCosts ? P_current + costs : P_current;
    const r_new = (parseFloat(newRate) || 0) / 100 / 12;
    const n_new = (parseFloat(newTerm) || 0) * 12;

    if (P_current <= 0 || r_current < 0 || n_current <= 0 || r_new < 0 || n_new <= 0) return;

    // Current P&I
    const M_current = r_current > 0 
      ? P_current * (r_current * Math.pow(1 + r_current, n_current)) / (Math.pow(1 + r_current, n_current) - 1)
      : P_current / n_current;

    // New P&I
    const M_new = r_new > 0
      ? P_new * (r_new * Math.pow(1 + r_new, n_new)) / (Math.pow(1 + r_new, n_new) - 1)
      : P_new / n_new;

    const monthlySavings = M_current - M_new;
    const breakEven = monthlySavings > 0 ? costs / monthlySavings : -1;

    const currentTotalInterest = (M_current * n_current) - P_current;
    const newTotalInterest = (M_new * n_new) - P_new;
    const interestSavings = currentTotalInterest - newTotalInterest;
    
    // Total savings over the life of the new loan vs continuing current loan
    // This is tricky because terms differ. Usually we compare over the SHORTER of the two terms?
    // Or just total costs.
    const totalSavings = (M_current * n_current) - (M_new * n_new + (includeCosts ? 0 : costs));

    setResults({
      currentMonthly: M_current,
      newMonthly: M_new,
      monthlySavings,
      totalSavings,
      breakEvenMonths: breakEven,
      currentTotalInterest,
      newTotalInterest,
      interestSavings,
      currentRows: [], // Placeholder for now
      newRows: [],
    });
  };

  const reset = () => {
    setCurrentBalance("300000"); setCurrentRate("6.5"); setRemainingYears("25");
    setNewRate("5.5"); setNewTerm("30"); setClosingCosts("5000");
    setIncludeCosts(false); setShowAdvanced(false); setPoints("0"); setOtherCosts("0");
    setResults(null);
    setTimeout(() => handleCalculate(), 0);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Refinance Analysis – Racira</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a mortgage refinance calculator?", answer: "A refinance calculator helps you compare your existing mortgage with a potential new mortgage to see if switching saves you money. It calculates monthly payment differences, total interest savings, and how long it takes to recover closing costs (the break-even point)." },
    { question: "How do I know if refinancing is worth it?", answer: "Generally, refinancing is worth it if you plan to stay in your home long enough to reach the break-even point — the time when your monthly savings equal the closing costs of the new loan. Lowering your interest rate by 0.75% to 1% is often a good benchmark." },
    { question: "What are typical closing costs for refinancing?", answer: "Refinancing closing costs typically range from 2% to 5% of the loan amount. These include appraisal fees, title insurance, application fees, and credit report fees. Some lenders offer 'no-closing-cost' refinances, but usually charge a higher interest rate in exchange." },
    { question: "Can I include closing costs in the new loan?", answer: "Yes, this is called 'rolling in' the closing costs. While it reduces your upfront out-of-pocket expense, it increases your total loan balance, which means you'll pay interest on those costs over the life of the loan." },
    { question: "What is the break-even point?", answer: "The break-even point is the number of months it takes for your monthly payment savings to cover the total cost of the refinance. For example, if your closing costs are $4,000 and you save $200 per month, your break-even point is 20 months." },
    { question: "Does refinancing restart my 30-year term?", answer: "Typically, yes. If you refinance into a new 30-year mortgage, you start from year one. While this lowers your monthly payment, it may increase the total interest paid over time because you are extending the debt. Many homeowners choose a shorter term (like 15 or 20 years) to avoid this." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Refinance Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Refinance Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Compare your current mortgage with a new loan to see how much you can save and find your break-even point.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-8">
                {/* Current Loan Section */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    Current Loan Details
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <InputField id="curr-balance" label="Current Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" />
                    <InputField id="curr-rate" label="Interest Rate" value={currentRate} onChange={setCurrentRate} suffix="%" />
                    <InputField id="curr-years" label="Remaining Term" value={remainingYears} onChange={setRemainingYears} suffix="Years" />
                  </div>
                </div>

                {/* New Loan Section */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    New Loan Details
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <InputField id="new-rate" label="New Interest Rate" value={newRate} onChange={setNewRate} suffix="%" />
                    <InputField id="new-term" label="New Loan Term" value={newTerm} onChange={setNewTerm} suffix="Years" />
                    <InputField id="costs" label="Closing Costs" value={closingCosts} onChange={setClosingCosts} prefix="$" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="include-costs" 
                      checked={includeCosts} 
                      onChange={(e) => setIncludeCosts(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="include-costs" className="text-sm font-medium text-foreground cursor-pointer">
                      Roll closing costs into the new loan balance
                    </label>
                  </div>
                </div>

                {/* Advanced Section */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Advanced Options
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </button>

                {showAdvanced && (<>

                  <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/30 border border-border animate-in fade-in slide-in-from-top-2">
                    <InputField id="points" label="Points" value={points} onChange={setPoints} prefix="$" />
                    <InputField id="other" label="Other Fees" value={otherCosts} onChange={setOtherCosts} prefix="$" />
                  </div>
                
</>)}

                <div className="flex gap-3 pt-4">
                  <button onClick={handleCalculate} className="btn-calculate flex-1">Compare Loans</button><button onClick={reset} className="rounded-xl border border-border px-5 py-4 text-muted-foreground hover:bg-secondary transition-all active:scale-95" aria-label="Reset">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (<>

              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4" ref={printRef}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Refinance Analysis</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Printer className="h-4 w-4" /> Print Report
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                      <p className="text-sm text-muted-foreground mb-1">Monthly Savings</p>
                      <p className={`text-3xl font-black ${results.monthlySavings > 0 ? "text-green-500" : "text-red-500"}`}>
                        {results.monthlySavings > 0 ? "+" : ""}${Math.abs(results.monthlySavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-sm text-muted-foreground mb-1">Interest Savings</p>
                      <p className={`text-2xl font-bold ${results.interestSavings > 0 ? "text-green-500" : "text-red-500"}`}>
                        ${Math.abs(results.interestSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center p-6 rounded-xl border border-dashed border-border text-center">
                    <p className="text-sm text-muted-foreground mb-2">Break-Even Period</p>
                    {results.breakEvenMonths > 0 ? (
                      <>
                        <p className="text-4xl font-black text-primary mb-1">
                          {Math.ceil(results.breakEvenMonths)} <span className="text-lg font-normal text-muted-foreground">Months</span>
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          ({(results.breakEvenMonths / 12).toFixed(1)} Years)
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-red-500">No Break-Even (Costs exceed savings)</p>
                    )}
                  </div>
                </div>

                <ResultDisplay items={[
                  { label: "Current Monthly P&I", value: results.currentMonthly },
                  { label: "New Monthly P&I", value: results.newMonthly },
                  { label: "Current Total Interest", value: results.currentTotalInterest },
                  { label: "New Total Interest", value: results.newTotalInterest },
                  { label: "Total Lifetime Savings", value: results.totalSavings, highlight: true },
                ]} />

                <div className="mt-10 pt-10 border-t border-border">
                  <h3 className="text-xl font-bold mb-6 text-center">Cost vs Savings Comparison</h3>
                  <div className="flex justify-center">
                    <PieChart
                      segments={[
                        { label: "Closing Costs", value: (parseFloat(closingCosts) || 0) + (parseFloat(otherCosts) || 0), color: "hsl(var(--primary))" },
                        { label: "Total Savings", value: Math.max(0, results.totalSavings), color: "hsl(var(--accent))" },
                      ]}
                      size={200}
                    />
                  </div>
                </div>
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – Refinance Content" />
          <article className="prose-finance max-w-none">
              <h2>Mastering the Mortgage Refinance Process</h2>
              <p>Refinancing a mortgage involves replacing your current home loan with a new one, typically to secure a lower interest rate, change the loan term, or tap into home equity. While the prospect of lower monthly payments is enticing, refinancing is a significant financial transaction with substantial upfront costs. Understanding the math behind the transition is crucial for ensuring that the move actually improves your long-term financial health.</p>
              
              <h2>When Should You Refinance?</h2>
              <p>The "rule of thumb" often suggests refinancing when interest rates drop by at least 1%. However, modern financial planning requires a more nuanced approach. You should consider refinancing if:</p>
              <ul>
                <li><strong>Interest rates have fallen:</strong> Even a 0.5% drop can save thousands on a large loan balance.</li>
                <li><strong>Your credit score has improved:</strong> If you bought your home with a lower credit score, you might now qualify for "prime" rates.</li>
                <li><strong>You want to change your loan term:</strong> Switching from a 30-year to a 15-year mortgage can slash your total interest costs, while switching to a longer term can provide immediate monthly budget relief.</li>
                <li><strong>You want to switch from an ARM to a Fixed-rate:</strong> If you have an Adjustable-Rate Mortgage, refinancing to a fixed rate provides protection against future rate hikes.</li>
              </ul>

              <h2>Calculating Your Break-Even Point</h2>
              <p>The break-even point is arguably the most critical metric in a refinance analysis. It represents the moment when the cumulative monthly savings from your new, lower payment finally equal the total closing costs paid to get the loan. If you plan to sell the home or pay off the mortgage before reaching this point, refinancing will likely result in a net loss.</p>
              <p>For example, if your refinance costs $6,000 and saves you $150 per month, your break-even point is 40 months (3.3 years). If you intend to stay in the home for 10 years, you'll enjoy over 6 years of pure savings. If you might move in 2 years, you'll lose $2,400 by refinancing.</p>

              <h2>The Impact of Loan Terms</h2>
              <p>One common pitfall in refinancing is "restarting the clock." If you are 5 years into a 30-year mortgage and refinance into a new 30-year loan, you are extending your total debt repayment period to 35 years. While this results in the lowest possible monthly payment, it often increases the total amount of interest paid over time, even with a lower rate.</p>
              <p>To avoid this, many savvy homeowners refinance into a term that matches their remaining years (e.g., a 20-year or 25-year mortgage) or continue making their old, higher payment amount toward the new loan's principal to accelerate the payoff.</p>

              <h2>Hidden Costs of Refinancing</h2>
              <p>It's important to remember that a refinance is essentially a new mortgage application. You will encounter many of the same fees you paid when you first bought the home:</p>
              <ol>
                <li><strong>Application & Credit Report Fees:</strong> Usually a few hundred dollars.</li>
                <li><strong>Appraisal Fee:</strong> The lender needs to verify the current market value of your home ($400 - $800).</li>
                <li><strong>Title Search & Insurance:</strong> Ensures there are no liens against the property.</li>
                <li><strong>Loan Origination Fees:</strong> Often 1% of the loan amount.</li>
                <li><strong>Recording Fees:</strong> Charged by the local government to update the property records.</li>
              </ol>

              <h2>Cash-Out Refinancing vs. Rate-and-Term</h2>
              <p>This calculator focuses on "Rate-and-Term" refinancing, where the goal is to improve the loan's characteristics. In a "Cash-Out" refinance, you take out a loan larger than your current balance and keep the difference in cash. This is often used for high-interest debt consolidation or major home improvements. While it can be a powerful tool, it also increases your debt and reduces your home equity, so it should be approached with caution.</p>

              <h2>Strategy: The "No-Cost" Refinance</h2>
              <p>Some lenders offer "no-cost" or "zero-closing-cost" refinances. In these cases, the lender either rolls the costs into the loan balance or charges a slightly higher interest rate to cover the fees. While this eliminates the need for upfront cash, it's not truly "free." You are simply paying for the refinance over time through interest. Use our calculator to compare a higher-rate "no-cost" option against a lower-rate option where you pay fees upfront to see which is better for your timeline.</p>

              <h2>Optimizing Your Refinance</h2>
              <p>To get the best possible deal, shop at least three different lenders, including your current bank, a credit union, and an online mortgage broker. Don't just compare the interest rate; compare the <strong>APR (Annual Percentage Rate)</strong>, which includes the impact of fees. Finally, ensure your credit report is accurate and your debt-to-income ratio is as low as possible before applying to secure the most favorable tiers.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/refinance-calculator" />
          <PopularCalculators exclude="/calculator/refinance-calculator" />
        </div>
      </div>
    </>
  );
};

export default RefinanceCalculator;


