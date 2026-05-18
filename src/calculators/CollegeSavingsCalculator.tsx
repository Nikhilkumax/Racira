"use client";
import { RotateCcw, TrendingUp, GraduationCap, PiggyBank } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const CollegeSavingsCalculator = () => {
  const [currentSavings, setCurrentSavings] = useState("5000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [yearsToCollege, setYearsToCollege] = useState("10");
  const [expectedTuition, setExpectedTuition] = useState("100000");
  const [annualReturn, setAnnualReturn] = useState("6");
  const [inflationRate, setInflationRate] = useState("3");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(currentSavings) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const years = parseFloat(yearsToCollege) || 0;
    const target = parseFloat(expectedTuition) || 0;
    const r = (parseFloat(annualReturn) || 0) / 100 / 12;
    const inf = (parseFloat(inflationRate) || 0) / 100;

    const months = years * 12;

    // Future Value of current savings
    const fvCurrent = p * Math.pow(1 + r, months);

    // Future Value of monthly contributions
    let fvContributions = 0;
    if (r > 0) {
      fvContributions = pmt * ((Math.pow(1 + r, months) - 1) / r);
    } else {
      fvContributions = pmt * months;
    }

    const totalSavingsAtCollege = fvCurrent + fvContributions;
    
    // Future cost of college (inflation adjusted)
    const futureCost = target * Math.pow(1 + inf, years);
    
    const gap = futureCost - totalSavingsAtCollege;

    setResults({
      totalSavingsAtCollege,
      futureCost,
      gap: gap > 0 ? gap : 0,
      percentCovered: (totalSavingsAtCollege / futureCost) * 100
    });
  };

  const reset = () => {
    setCurrentSavings("5000"); setMonthlyContribution("500"); setYearsToCollege("10"); setExpectedTuition("100000"); setAnnualReturn("6"); setInflationRate("3");
  };

  const faqs = [
    { question: "What is a 529 plan?", answer: "A 529 plan is a tax-advantaged savings plan designed to encourage saving for future education costs. Earnings grow tax-free and withdrawals are tax-free when used for qualified education expenses." },
    { question: "How much should I save for college?", answer: "A common rule of thumb is the 'one-third rule': aim to save one-third of the expected cost, fund one-third from current income when the student is in school, and borrow the final one-third." },
    { question: "How does inflation affect college costs?", answer: "College tuition historically rises faster than general inflation. While the average inflation rate might be 2-3%, college tuition often increases at 4-6% per year." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "College Savings Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">College Savings Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Project your future education fund and see if you're on track to cover expected tuition costs.</p>

            <div className="card-calculator mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <PiggyBank className="h-5 w-5 text-primary" /> Current Plan
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Initial Savings</label>
                      <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} className="input-calc" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Monthly Saving</label>
                      <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="input-calc border-primary/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Years to College</label>
                      <input type="number" value={yearsToCollege} onChange={(e) => setYearsToCollege(e.target.value)} className="input-calc" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Return Rate (%)</label>
                      <input type="number" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} className="input-calc" step="0.1" />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-primary" /> Target Costs
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Today's Total Cost (4 Years)</label>
                    <input type="number" value={expectedTuition} onChange={(e) => setExpectedTuition(e.target.value)} className="input-calc" />
                    <p className="text-[10px] text-muted-foreground mt-1">Include tuition, room, and board.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Tuition Inflation (%)</label>
                    <input type="number" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} className="input-calc" />
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" /> Reset 
                    </button>
                  </div>
                </section>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button
                  onClick={reset}
                  className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Projected Savings</p>
                    <p className="text-4xl font-black text-foreground">${Math.round(results.totalSavingsAtCollege).toLocaleString()}</p>
                  </div>
                  <div className="card-calculator bg-amber-500/5 border-amber-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Estimated Future Cost</p>
                    <p className="text-4xl font-black text-foreground">${Math.round(results.futureCost).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Progress Analysis
                  </h2>
                  <div className="mb-8">
                     <div className="flex justify-between text-xs font-bold uppercase mb-2">
                        <span>Funding Status</span>
                        <span>{results.percentCovered.toFixed(0)}% Covered</span>
                     </div>
                     <div className="w-full h-4 bg-secondary rounded-full overflow-hidden border border-border">
                        <div className={`h-full transition-all duration-1000 ${results.percentCovered >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, results.percentCovered)}%` }} />
                     </div>
                  </div>

                  <ResultDisplay items={[
                    { label: "Remaining Gap", value: 0, textValue: results.gap > 0 ? `$${Math.round(results.gap).toLocaleString()}` : "Target Reached! 🎉" },
                    { label: "Suggested Extra Savings", value: 0, textValue: results.gap > 0 ? `$${Math.round(results.gap / (parseFloat(yearsToCollege) * 12)).toLocaleString()} / month` : "$0" },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />
            <article className="prose-finance">
              <h2>The Challenge of Rising Tuition</h2>
              <p>Planning for a child's education is one of the most significant financial goals for any parent. With college costs historically rising at roughly double the rate of standard inflation, starting early is the most powerful advantage you can have.</p>
              
              <h3>Compound Interest is Your Best Friend</h3>
              <p>When you start saving for college while a child is an infant, you have 18 years for your investments to grow. Because of compound interest, a small monthly contribution started at birth can be worth significantly more than a large monthly contribution started when the child enters high school.</p>

              <h3>Inflation Matters</h3>
              <p>It's not enough to save for today's tuition prices. You must account for tuition inflation. If a university costs $100,000 today, and tuition rises at 4% annually, that same university will cost over $200,000 in 18 years.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/college-savings" />
            <PopularCalculators exclude="/calculator/college-savings-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default CollegeSavingsCalculator;

