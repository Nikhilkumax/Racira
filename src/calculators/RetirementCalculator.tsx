"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { Printer, RotateCcw } from "lucide-react";

type Module = "goal" | "withdrawal" | "savings";

const RetirementCalculator = () => {
  const [activeModule, setActiveModule] = useState<Module>("goal");

  // Goal module
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [lifeExpectancy, setLifeExpectancy] = useState("85");
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [monthlyContrib, setMonthlyContrib] = useState("1000");
  const [expectedReturn, setExpectedReturn] = useState("8");
  const [inflationRate, setInflationRate] = useState("3");
  const [desiredIncome, setDesiredIncome] = useState("60000");
  const [otherIncome, setOtherIncome] = useState("20000");

  // Withdrawal module
  const [wSavings, setWSavings] = useState("1000000");
  const [wMonthlyWithdraw, setWMonthlyWithdraw] = useState("5000");
  const [wReturn, setWReturn] = useState("5");
  const [wInflation, setWInflation] = useState("3");

  // Savings module
  const [sTarget, setSTarget] = useState("1000000");
  const [sYears, setSYears] = useState("30");
  const [sCurrent, setSCurrent] = useState("10000");
  const [sReturn, setSReturn] = useState("8");
  const [showResults, setShowResults] = useState(false);

  const [goalResult, setGoalResult] = useState<{ corpus: number; projected: number; shortfall: number; yearlyNeeded: number } | null>(null);
  const [withdrawResult, setWithdrawResult] = useState<{ yearsLast: number } | null>(null);
  const [savingsResult, setSavingsResult] = useState<{ monthlyNeeded: number } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const calculateGoal = () => {
    const age = parseFloat(currentAge) || 0;
    const retAge = parseFloat(retirementAge) || 0;
    const life = parseFloat(lifeExpectancy) || 0;
    const savings = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlyContrib) || 0;
    const ret = (parseFloat(expectedReturn) || 0) / 100;
    const inf = (parseFloat(inflationRate) || 0) / 100;
    const income = parseFloat(desiredIncome) || 0;
    const other = parseFloat(otherIncome) || 0;

    const yearsToRetirement = retAge - age;
    const retirementYears = life - retAge;
    if (yearsToRetirement <= 0 || retirementYears <= 0) return;

    // Inflation-adjusted annual need at retirement
    const adjIncome = (income - other) * Math.pow(1 + inf, yearsToRetirement);
    // Corpus needed (present value of annuity at retirement)
    const realReturn = (1 + ret) / (1 + inf) - 1;
    const corpus = realReturn > 0 ? adjIncome * (1 - Math.pow(1 + realReturn, -retirementYears)) / realReturn : adjIncome * retirementYears;

    // Projected savings
    const monthlyRate = ret / 12;
    const months = yearsToRetirement * 12;
    let projected = savings * Math.pow(1 + monthlyRate, months);
    projected += monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

    setGoalResult({
      corpus,
      projected,
      shortfall: Math.max(0, corpus - projected),
      yearlyNeeded: corpus > projected ? (corpus - projected) * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1) * 12 : 0,
    });
  };

  const calculateWithdrawal = () => {
    const savings = parseFloat(wSavings) || 0;
    const monthly = parseFloat(wMonthlyWithdraw) || 0;
    const ret = (parseFloat(wReturn) || 0) / 100 / 12;
    const inf = (parseFloat(wInflation) || 0) / 100 / 12;

    if (savings <= 0 || monthly <= 0) return;

    let balance = savings;
    let month = 0;
    let withdraw = monthly;
    while (balance > 0 && month < 1200) {
      month++;
      balance = balance * (1 + ret) - withdraw;
      withdraw *= (1 + inf);
    }

    setWithdrawResult({ yearsLast: month / 12 });
  };

  const calculateSavings = () => {
    const target = parseFloat(sTarget) || 0;
    const years = parseFloat(sYears) || 0;
    const current = parseFloat(sCurrent) || 0;
    const ret = (parseFloat(sReturn) || 0) / 100 / 12;
    const months = years * 12;

    if (target <= 0 || months <= 0) return;

    const fvCurrent = current * Math.pow(1 + ret, months);
    const remaining = target - fvCurrent;
    const monthlyNeeded = remaining > 0 ? remaining * ret / (Math.pow(1 + ret, months) - 1) : 0;

    setSavingsResult({ monthlyNeeded });
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Retirement Plan – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How much do I need to retire?", answer: "A common rule of thumb is 25 times your annual expenses (the 4% rule). However, the exact amount depends on your desired lifestyle, healthcare costs, inflation, and expected investment returns. Our calculator provides a personalized estimate." },
    { question: "What is the 4% rule?", answer: "The 4% rule suggests you can withdraw 4% of your retirement portfolio annually (adjusted for inflation) with a high probability of not running out of money over 30 years. It's based on historical market returns and is a useful starting point for planning." },
    { question: "How does inflation affect retirement planning?", answer: "Inflation increases the cost of living over time. A 3% inflation rate means prices roughly double every 24 years. Our calculator adjusts your desired retirement income for inflation to show you how much you'll actually need in future dollars." },
    { question: "When should I start saving for retirement?", answer: "The earlier the better. Starting at age 25 vs 35 with the same monthly contribution can result in nearly double the retirement savings due to compound interest. Even small contributions early on make a significant difference." },
    { question: "What return rate should I assume?", answer: "A balanced portfolio historically returns 6-8% annually. Conservative estimates use 5-6%, while aggressive portfolios might use 8-10%. For long-term planning, 7% is a commonly used moderate estimate." },
    { question: "How do the three modules work?", answer: "The Retirement Goal module estimates how much you need to save. The Withdrawal module shows how long your savings will last in retirement. The Savings Planner calculates how much you need to save monthly to reach your target." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Retirement Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Retirement Planning Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Plan your retirement with three powerful modules: estimate your required corpus, model withdrawals, and calculate monthly savings needed.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold mb-4">Retirement Goal Estimator</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                  <InputField id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} />
                  <InputField id="ret-age" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} />
                  <InputField id="life" label="Life Expectancy" value={lifeExpectancy} onChange={setLifeExpectancy} />
                  <InputField id="savings" label="Current Savings" value={currentSavings} onChange={setCurrentSavings} prefix="$" />
                  <InputField id="monthly" label="Monthly Contribution" value={monthlyContrib} onChange={setMonthlyContrib} prefix="$" />
                  <InputField id="return" label="Expected Return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" />
                  <InputField id="inflation" label="Inflation Rate" value={inflationRate} onChange={setInflationRate} suffix="%" />
                  <InputField id="income" label="Desired Annual Income" value={desiredIncome} onChange={setDesiredIncome} prefix="$" tooltip="Annual income needed in today's dollars." />
                  <InputField id="other" label="Other Retirement Income" value={otherIncome} onChange={setOtherIncome} prefix="$" tooltip="Social Security, pension, or other income sources." />
                </div>
                <div className="flex gap-3">
                  <button onClick={calculateGoal} className="btn-calculate flex-1">Calculate</button>
                  <button onClick={() => setGoalResult(null)} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>

                {goalResult && (
                  <div className="mt-6" ref={printRef}>
                    <ResultDisplay items={[
                      { label: "Required Corpus", value: goalResult.corpus, highlight: true },
                      { label: "Projected Savings", value: goalResult.projected, highlight: true },
                      { label: "Shortfall", value: goalResult.shortfall },
                      ...(goalResult.yearlyNeeded > 0 ? [{ label: "Extra Yearly Needed", value: goalResult.yearlyNeeded }] : []),
                    ]} />
                    <div className="mt-4 flex justify-center">
                      <PieChart segments={[
                        { label: "Projected", value: Math.min(goalResult.projected, goalResult.corpus), color: "hsl(211, 100%, 50%)" },
                        ...(goalResult.shortfall > 0 ? [{ label: "Shortfall", value: goalResult.shortfall, color: "hsl(0, 84%, 60%)" }] : []),
                      ]} size={160} />
                    </div>
                  </div>
                )}
          </div>

          <div className="flex flex-col gap-3">
            {withdrawResult && (
              <>
                <ResultDisplay items={[
                      { label: "Money Will Last", value: 0, textValue: `${withdrawResult.yearsLast.toFixed(1)} years`, highlight: true },
                    ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is a Retirement Calculator?</h2>
              <p>A retirement calculator is a financial planning tool that helps you estimate how much money you need to save for a comfortable retirement. Our comprehensive calculator includes three modules to address different aspects of retirement planning: estimating your required retirement corpus, modeling how long your savings will last during retirement, and calculating the monthly savings needed to reach your target.</p>

              <h2>Understanding Retirement Planning</h2>
              <p>Effective retirement planning requires balancing several variables: your current savings, future contributions, expected investment returns, inflation, desired retirement lifestyle, and expected lifespan. Our calculator incorporates all these factors to give you a realistic picture of your retirement readiness.</p>

              <h2>The Three Modules Explained</h2>
              <h3>Module 1: Retirement Goal Estimator</h3>
              <p>This module calculates how much you need to save (your "retirement corpus") based on your desired retirement income, expected lifespan, and inflation. It then projects your current savings and contributions forward to show whether you're on track or face a shortfall.</p>

              <h3>Module 2: Withdrawal Calculator</h3>
              <p>Once you have retirement savings, this module shows how long your money will last based on your monthly withdrawal rate, investment returns during retirement, and inflation. This helps you plan sustainable withdrawal strategies.</p>

              <h3>Module 3: Savings Planner</h3>
              <p>If you have a specific retirement savings target, this module calculates exactly how much you need to save each month to reach it, accounting for your current savings and expected returns.</p>

              <h2>Key Retirement Planning Principles</h2>
              <ul>
                <li><strong>Start early:</strong> Time is the most powerful factor in retirement savings due to compound interest.</li>
                <li><strong>Account for inflation:</strong> Prices will be significantly higher when you retire. Plan in today's dollars but calculate in future dollars.</li>
                <li><strong>Diversify investments:</strong> A mix of stocks, bonds, and other assets helps manage risk over your saving and retirement periods.</li>
                <li><strong>Plan for healthcare:</strong> Medical expenses typically increase in retirement. Factor these into your desired income.</li>
                <li><strong>Consider multiple income sources:</strong> Social Security, pensions, and part-time work can supplement your savings.</li>
              </ul>

              <h2>The 4% Rule and Safe Withdrawal Rates</h2>
              <p>The 4% rule suggests withdrawing 4% of your portfolio in the first year of retirement, then adjusting for inflation each subsequent year. Historical analysis shows this approach has a high success rate over 30-year retirement periods. However, some financial planners now recommend 3-3.5% for added safety given current market conditions.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. Actual results depend on market conditions, tax situations, and personal circumstances. This is not financial advice. Consult a qualified financial advisor for personalized retirement planning.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retirement-calculator" />
          <PopularCalculators exclude="/retirement-calculator" />
        </div>
      </div>
    </>
  );
};

export default RetirementCalculator;


