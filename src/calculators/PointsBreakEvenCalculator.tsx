"use client";
import { RotateCcw, Target, DollarSign, TrendingDown } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const PointsBreakEvenCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [points, setPoints] = useState("1");
  const [originalRate, setOriginalRate] = useState("7.0");
  const [newRate, setNewRate] = useState("6.75");
  const [loanTerm, setLoanTerm] = useState("30");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const principal = parseFloat(loanAmount) || 0;
    const pts = parseFloat(points) || 0;
    const rateOrig = (parseFloat(originalRate) || 0) / 100 / 12;
    const rateNew = (parseFloat(newRate) || 0) / 100 / 12;
    const termMonths = (parseFloat(loanTerm) || 0) * 12;

    if (principal <= 0 || termMonths <= 0 || rateOrig <= 0 || rateNew <= 0) return;

    const paymentOrig = (principal * rateOrig * Math.pow(1 + rateOrig, termMonths)) / (Math.pow(1 + rateOrig, termMonths) - 1);
    const paymentNew = (principal * rateNew * Math.pow(1 + rateNew, termMonths)) / (Math.pow(1 + rateNew, termMonths) - 1);

    const monthlySavings = paymentOrig - paymentNew;
    const costOfPoints = principal * (pts / 100);

    if (monthlySavings <= 0) {
      setResults({ error: "The new interest rate must be lower than the original rate to calculate a break-even point." });
      return;
    }

    const breakEvenMonths = costOfPoints / monthlySavings;
    const totalSavingsOverTerm = (monthlySavings * termMonths) - costOfPoints;

    setResults({
      paymentOrig,
      paymentNew,
      monthlySavings,
      costOfPoints,
      breakEvenMonths,
      totalSavingsOverTerm,
      error: null
    });
  };

  const reset = () => {
    setLoanAmount("300000");
    setPoints("1");
    setOriginalRate("7.0");
    setNewRate("6.75");
    setLoanTerm("30");
  };

  const faqs = [
    {
      question: "What are mortgage points?",
      answer: "Mortgage points, also known as discount points, are upfront fees paid to the lender at closing in exchange for a lower interest rate on your loan. One point typically costs 1% of the total loan amount and usually lowers the interest rate by 0.25%."
    },
    {
      question: "How do I calculate the break-even point for points?",
      answer: "To find the break-even point, divide the upfront cost of the points by the monthly savings you get from the lower interest rate. The result is the number of months you need to stay in the home to recoup the initial investment."
    },
    {
      question: "Is it worth buying mortgage points?",
      answer: "It depends on how long you plan to keep the mortgage. If you plan to stay in the home longer than the break-even period, buying points will save you money over the life of the loan. If you plan to sell or refinance sooner, you're better off keeping the cash."
    },
    {
      question: "Can points be negotiated?",
      answer: "Yes, mortgage points and the associated interest rate reductions are often negotiable. You should compare offers from different lenders to see who provides the best value for each point purchased."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Mortgage Points Break-Even Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Points Break-Even Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <DollarSign className="h-5 w-5 text-primary" /> Loan Details
                  </h2>
                  <InputField id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
                  <InputField id="points" label="Number of Points" value={points} onChange={setPoints} suffix="pts" step="0.1" tooltip="1 point = 1% of loan amount. Usually reduces rate by 0.25%." />
                  <InputField id="term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} suffix="yrs" />
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <TrendingDown className="h-5 w-5 text-primary" /> Rate Comparison
                  </h2>
                  <InputField id="orig-rate" label="Original Rate (%)" value={originalRate} onChange={setOriginalRate} suffix="%" step="0.1" tooltip="The interest rate without paying points." />
                  <InputField id="new-rate" label="New Rate (with Points)" value={newRate} onChange={setNewRate} suffix="%" step="0.1" tooltip="The lower interest rate after paying the points." />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                {results.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-6 rounded-2xl text-center font-bold">
                    {results.error}
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Break-Even Point</p>
                        <p className="text-5xl font-black text-foreground">{Math.floor(results.breakEvenMonths / 12)}y {Math.round(results.breakEvenMonths % 12)}m</p>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">({Math.round(results.breakEvenMonths)} months)</p>
                      </div>
                      <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Savings Over Term</p>
                        <p className="text-5xl font-black text-foreground">${Math.round(results.totalSavingsOverTerm).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                      <h2 className="text-2xl font-bold mb-3">
                        <Target className="h-5 w-5 text-primary" /> Savings Breakdown
                      </h2>
                      <ResultDisplay items={[
                        { label: "Upfront Cost of Points", value: results.costOfPoints },
                        { label: "Monthly Payment Savings", value: results.monthlySavings },
                        { label: "Original Monthly Payment", value: results.paymentOrig },
                        { label: "New Monthly Payment", value: results.paymentNew },
                      ]} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Are Mortgage Discount Points?</h2>
              <p>Mortgage discount points are essentially prepaid interest. By paying a lump sum at the closing of your home loan, you "buy down" the interest rate for the entire life of the mortgage. This is often referred to as "buying down the rate."</p>

              <h3>The Cost and the Benefit</h3>
              <p>In most cases, one mortgage point costs exactly 1% of the total loan amount. For a $300,000 mortgage, one point would cost $3,000. In return, the lender will typically reduce your interest rate by 0.25% (25 basis points). The goal is to trade an upfront cash payment for long-term savings on your monthly mortgage bill.</p>

              <h3>Calculating the Break-Even Point</h3>
              <p>The break-even point is the most important metric when deciding whether to buy points. It tells you exactly how many months you must keep the loan to make the upfront investment worth it. The formula is simple:</p>
              <div className="p-4 bg-secondary/50 rounded-xl font-mono text-center my-4 border border-border">
                Break-Even Months = Upfront Cost ÷ Monthly Savings
              </div>

              <h3>When Should You Buy Points?</h3>
              <p>Buying points makes financial sense if you answer 'yes' to the following questions:</p>
              <ul>
                <li><strong>Are you keeping the home for a long time?</strong> If the break-even is 4 years and you plan to stay for 10, points are a great deal.</li>
                <li><strong>Do you have extra cash at closing?</strong> Don't buy points if it leaves you with no emergency savings.</li>
                <li><strong>Are rates currently low?</strong> Buying points on an already low rate can lock in historically cheap financing.</li>
              </ul>

              <h3>When Should You Skip Points?</h3>
              <p>Conversely, you should probably avoid buying points if:</p>
              <ul>
                <li><strong>You plan to sell or refinance soon:</strong> If you'll likely sell in 3 years but the break-even is 5 years, you'll lose money.</li>
                <li><strong>You need the cash for renovations:</strong> Upfront equity or home improvements might provide a better return than a slightly lower interest rate.</li>
                <li><strong>The reduction is too small:</strong> If a point only lowers your rate by 0.125% instead of 0.25%, the break-even point will be much further out.</li>
              </ul>

              <h3>Tax Considerations</h3>
              <p>Mortgage discount points are generally tax-deductible as home mortgage interest, provided you meet certain IRS requirements. This tax benefit can actually shorten your "effective" break-even period by reducing your overall tax liability for the year you buy the home.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/points-break-even-calculator" />
          <PopularCalculators exclude="/calculator/points-break-even-calculator" />
        </div>
      </div>
    </>
  );
};

export default PointsBreakEvenCalculator;

