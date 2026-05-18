"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const SavingsGoalCalculator = () => {
  const [targetAmount, setTargetAmount] = useState("50000");
  const [initialSavings, setInitialSavings] = useState("5000");
  const [timeHorizon, setTimeHorizon] = useState("5");
  const [expectedReturn, setExpectedReturn] = useState("7");
  const [compounding, setCompounding] = useState("12");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const FV = parseFloat(targetAmount) || 0;
    const PV = parseFloat(initialSavings) || 0;
    const r = (parseFloat(expectedReturn) || 0) / 100;
    const n = parseFloat(compounding) || 12;
    const t = parseFloat(timeHorizon) || 5;

    // Formula for required monthly payment (PMT)
    // FV = PV*(1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
    // PMT = (FV - PV*(1 + r/n)^(n*t)) / [((1 + r/n)^(n*t) - 1) / (r/n)]
    
    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    
    const growthOfPV = PV * Math.pow(1 + ratePerPeriod, totalPeriods);
    const denominator = (Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod;
    
    const requiredPMT = (FV - growthOfPV) / denominator;
    
    const totalInvested = PV + (requiredPMT * totalPeriods);
    const totalInterest = FV - totalInvested;

    setResults({
      monthlyContribution: Math.max(0, requiredPMT),
      totalInvested,
      totalInterest,
      alreadyMet: growthOfPV >= FV
    });
  };

  const reset = () => {
    setShowResults(false);
    setTargetAmount("50000");
    setTimeHorizon("5");
    setResults(null);
  };

  const faqs = [
    { question: "How much should I save each month?", answer: "Your monthly savings should be aligned with your specific goals (house down payment, wedding, vacation) and your timeline. A common rule is to save at least 20% of your income, but if you have a short-term goal, you may need to save more." },
    { question: "How does compounding interest help my savings goal?", answer: "Compounding interest means you earn interest on your interest. Over long periods, this growth can account for a significant portion of your final goal, meaning you actually have to contribute less out of your own pocket." },
    { question: "What return rate should I expect?", answer: "For short-term goals (under 3 years), use a conservative rate like 3-4% from a savings account. For long-term goals (5+ years), you might use 7-10% based on historical stock market returns, but remember that market investments carry risk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Savings Goal" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Savings Goal Calculator</h1>
            <p className="text-muted-foreground mb-8">Find out exactly how much you need to save each month to reach your financial milestones within your desired timeframe.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="targetAmount" label="Savings Goal Amount" value={targetAmount} onChange={setTargetAmount} prefix="$" />
                <InputField id="initialSavings" label="Current Savings" value={initialSavings} onChange={setInitialSavings} prefix="$" />
                <InputField id="timeHorizon" label="Time to Reach Goal" value={timeHorizon} onChange={setTimeHorizon} suffix="Years" />
                <InputField id="expectedReturn" label="Expected Annual Return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Contribution</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                {results.alreadyMet ? (
                  <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <h2 className="text-xl font-bold text-green-600">Goal Already Met!</h2>
                    <p className="text-muted-foreground mt-2">Based on your current savings and expected return, you will reach your goal without further contributions.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Required Monthly Saving</h2>
                      <p className="text-5xl font-extrabold mb-2">${Math.round(results.monthlyContribution).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">To reach ${parseFloat(targetAmount).toLocaleString()} in {timeHorizon} years</p>
                    </div>

                    <ResultDisplay items={[
                      { label: "Total Monthly Contribution", value: results.monthlyContribution, highlight: true },
                      { label: "Total You'll Invest", value: results.totalInvested },
                      { label: "Growth from Interest", value: results.totalInterest, highlight: true },
                      { label: "Target Amount", value: parseFloat(targetAmount) },
                    ]} />
                  </>
                )}
              </div>
            )}

            <article className="prose-finance">
              <h2>Planning Your Financial Future</h2>
              <p>Reaching a major savings goal requires more than just willpower; it requires a mathematical plan. Whether you're saving for a home down payment, a child's education, or a dream wedding, knowing the exact monthly number makes the goal manageable and less overwhelming.</p>
              <h3>The Importance of Starting Early</h3>
              <p>The "time value of money" is your best friend when saving. Because of compounding interest, the earlier you start saving for a goal, the less you have to contribute each month. Waiting even one or two years can significantly increase the monthly burden required to hit your target.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/savings-goal-calculator" />
            <PopularCalculators exclude="/calculator/savings-goal-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder label="Sidebar Ad" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default SavingsGoalCalculator;

