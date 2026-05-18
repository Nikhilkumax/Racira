"use client";
import { RotateCcw, Calendar, TrendingUp, HardHat, Plus, Trash2 } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const ConstructionLoanDrawCalculator = () => {
  const [totalLoanAmount, setTotalLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState("7.5");
  const [constructionPeriod, setConstructionPeriod] = useState("12");
  const [draws, setDraws] = useState([
    { month: 0, amount: 50000, label: "Land/Permits" },
    { month: 2, amount: 100000, label: "Foundation" },
    { month: 5, amount: 150000, label: "Framing" },
    { month: 8, amount: 100000, label: "Exterior/Roof" },
    { month: 11, amount: 100000, label: "Interior/Finish" },
  ]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const totalLimit = parseFloat(totalLoanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const months = parseInt(constructionPeriod) || 0;

    const monthlyInterest: number[] = [];
    let currentDisbursedBalance = 0;
    let totalInterestPaid = 0;

    for (let m = 0; m < months; m++) {
      // Add draws for this month
      const currentMonthDraws = draws.filter(d => d.month === m);
      currentMonthDraws.forEach(d => {
        currentDisbursedBalance += d.amount;
      });

      // Interest is charged on the balance during the month
      const interest = currentDisbursedBalance * rate;
      monthlyInterest.push(interest);
      totalInterestPaid += interest;
    }

    setResults({
      totalInterestPaid,
      averageMonthlyInterest: totalInterestPaid / months,
      finalDisbursedBalance: currentDisbursedBalance,
      disbursementPercentage: (currentDisbursedBalance / totalLimit) * 100,
      monthlyInterest
    });
  };

  const addDraw = () => {
    setDraws([...draws, { month: 0, amount: 0, label: "New Draw" }]);
  };

  const removeDraw = (index: number) => {
    setDraws(draws.filter((_, i) => i !== index));
  };

  const updateDraw = (index: number, field: string, value: string) => {
    const newDraws = [...draws];
    if (field === "amount") (newDraws[index] as any).amount = parseFloat(value) || 0;
    else if (field === "month") (newDraws[index] as any).month = parseInt(value) || 0;
    else (newDraws[index] as any).label = value;
    setDraws(newDraws);
  };

  const reset = () => {
    setTotalLoanAmount("500000");
    setInterestRate("7.5");
    setConstructionPeriod("12");
    setDraws([
      { month: 0, amount: 50000, label: "Land/Permits" },
      { month: 2, amount: 100000, label: "Foundation" },
      { month: 5, amount: 150000, label: "Framing" },
      { month: 8, amount: 100000, label: "Exterior/Roof" },
      { month: 11, amount: 100000, label: "Interior/Finish" },
    ]);
  };

  const faqs = [
    {
      question: "How does interest work on a construction loan?",
      answer: "Unlike a standard mortgage, you don't pay interest on the full loan amount from day one. Instead, you only pay interest on the funds that have been 'drawn' (disbursed) to pay for work as it is completed. This makes the payments lower at the start of the project and higher as you get closer to completion."
    },
    {
      question: "What is a 'draw schedule'?",
      answer: "A draw schedule is a plan that outlines when funds will be released by the lender. These releases are typically tied to specific construction milestones, such as completing the foundation, framing, or roofing. An inspector usually verifies the work before each draw is released."
    },
    {
      question: "What happens when construction is finished?",
      answer: "Most construction loans are 'construction-to-permanent' loans. Once the project is complete and a Certificate of Occupancy is issued, the interest-only construction loan is converted into a standard amortizing mortgage."
    },
    {
      question: "Do I need a down payment for a construction loan?",
      answer: "Yes, construction loans typically require a down payment of 20-25% of the total cost (land + construction). Often, the equity you already have in the land can count toward this requirement."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction Loan Draw Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Construction Loan Draw Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Track your draw schedule and calculate the interest-only payments throughout your building project.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8 mb-10">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <HardHat className="h-5 w-5 text-primary" /> Loan Basics
                  </h2>
                  <InputField id="total-loan" label="Total Loan Limit" value={totalLoanAmount} onChange={setTotalLoanAmount} prefix="$" tooltip="The maximum amount the bank will lend for the project." />
                  <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" />
                  <InputField id="period" label="Construction Period" value={constructionPeriod} onChange={setConstructionPeriod} suffix="mo" tooltip="The total number of months construction will take." />
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> Draw Schedule
                    </h2>
                    <button onClick={addDraw} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      <Plus className="h-3 w-3" /> Add Draw
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {draws.map((draw, i) => (
                      <div key={i} className="flex gap-2 items-end bg-secondary/30 p-3 rounded-lg border border-border">
                        <div className="w-16">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Month</label>
                          <input type="number" value={draw.month} onChange={(e) => updateDraw(i, "month", e.target.value)} className="w-full bg-transparent border-b border-border text-sm focus:border-primary outline-none" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                          <input type="text" value={draw.label} onChange={(e) => updateDraw(i, "label", e.target.value)} className="w-full bg-transparent border-b border-border text-sm focus:border-primary outline-none" />
                        </div>
                        <div className="w-24">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Amount</label>
                          <input type="number" value={draw.amount} onChange={(e) => updateDraw(i, "amount", e.target.value)} className="w-full bg-transparent border-b border-border text-sm focus:border-primary outline-none" />
                        </div>
                        <button onClick={() => removeDraw(i)} className="text-muted-foreground hover:text-red-500 transition-colors pb-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Loan</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Interest During Build</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.totalInterestPaid).toLocaleString()}</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Avg. Monthly Interest</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.averageMonthlyInterest).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Loan Status
                  </h2>
                  <ResultDisplay items={[
                    { label: "Total Disbursed Balance", value: results.finalDisbursedBalance },
                    { label: "Percentage of Loan Used", value: 0, textValue: `${results.disbursementPercentage.toFixed(1)}%` },
                    { label: "Remaining Funds Available", value: parseFloat(totalLoanAmount) - results.finalDisbursedBalance },
                    { label: "Highest Monthly Interest", value: Math.max(...results.monthlyInterest, 0) },
                  ]} />
                </div>

                <div className="card-calculator">
                  <h3 className="font-bold mb-4">Monthly Interest Projection</h3>
                  <div className="space-y-2">
                    {results.monthlyInterest.map((interest: number, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-secondary/30 rounded-md transition-colors">
                        <span className="text-muted-foreground font-medium">Month {i + 1}</span>
                        <div className="flex items-center gap-4">
                           <div className="h-2 bg-primary/20 rounded-full overflow-hidden w-32 hidden sm:block">
                              <div className="h-full bg-primary" style={{ width: `${(interest / Math.max(...results.monthlyInterest, 1)) * 100}%` }}></div>
                           </div>
                           <span className="font-bold w-20 text-right">${Math.round(interest).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />

            <article className="prose-finance">
              <h2>How Construction Loans Work</h2>
              <p>Building a home is different from buying one. Because the asset (the house) doesn't exist yet, lenders provide funds in stages rather than all at once. This is done through a 'draw' process, where money is released only after specific milestones are reached and verified by an inspector.</p>

              <h3>The Interest-Only Advantage</h3>
              <p>One of the main benefits of a construction loan is that you only pay interest on the money you've actually used. If you have a $500,000 loan but have only drawn $100,000 for the foundation, your monthly payment will be based only on that $100,000. This keeps your costs manageable while you are still paying for your current housing.</p>

              <h3>Common Draw Milestones</h3>
              <p>While every lender is different, a typical draw schedule follows these steps:</p>
              <ul>
                <li><strong>Draw 1:</strong> Site preparation, permits, and foundation.</li>
                <li><strong>Draw 2:</strong> Framing, windows, and exterior doors.</li>
                <li><strong>Draw 3:</strong> Plumbing, electrical, and HVAC 'rough-in'.</li>
                <li><strong>Draw 4:</strong> Drywall and interior finishes.</li>
                <li><strong>Draw 5:</strong> Final completion and landscaping.</li>
              </ul>

              <h3>Managing Your Budget</h3>
              <p>It is critical to stay within your draw schedule. If a stage costs more than anticipated, you may have to pay the difference out of pocket before the lender will release the next draw. Always include a 10-15% 'contingency fund' in your construction budget to cover price increases in materials or labor.</p>

              <h3>Conversion to Permanent Financing</h3>
              <p>Once construction is finished and the local building department issues a 'Certificate of Occupancy', the construction loan period ends. In a 'one-close' loan, the balance automatically converts to a 15 or 30-year fixed-rate mortgage. In a 'two-close' scenario, you would have to apply for a brand new mortgage to pay off the construction loan.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/construction-loan-draw-calculator" />
            <PopularCalculators exclude="/calculator/construction-loan-draw-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ConstructionLoanDrawCalculator;

