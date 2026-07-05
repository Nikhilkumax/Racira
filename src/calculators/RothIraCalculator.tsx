"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, PiggyBank } from "lucide-react";

const RothIraCalculator = () => {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [annualContribution, setAnnualContribution] = useState("6000");
  const [currentBalance, setCurrentBalance] = useState("10000");
  const [annualReturn, setAnnualReturn] = useState("7");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const age = parseFloat(currentAge);
    const retAge = parseFloat(retirementAge);
    const contribution = parseFloat(annualContribution);
    const balance = parseFloat(currentBalance);
    const r = parseFloat(annualReturn) / 100;
    const years = retAge - age;

    if (years <= 0 || contribution < 0 || balance < 0) return;

    // Future value of current balance
    const fvCurrentBalance = balance * Math.pow(1 + r, years);

    // Future value of annual contributions (end of year)
    const fvContributions = contribution * ((Math.pow(1 + r, years) - 1) / r);

    const totalFV = fvCurrentBalance + fvContributions;
    const totalContributed = balance + (contribution * years);
    const taxFreGrowth = totalFV - totalContributed;

    // Safe withdrawal at 4% rule
    const annualWithdrawal = totalFV * 0.04;
    const monthlyWithdrawal = annualWithdrawal / 12;

    setResults({ totalFV, totalContributed, taxFreGrowth, annualWithdrawal, monthlyWithdrawal, years });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentAge("30"); setRetirementAge("65"); setAnnualContribution("6000");
    setCurrentBalance("10000"); setAnnualReturn("7");
    setResults(null);
  };

  const faqs = [
    { question: "What is the 2024 Roth IRA contribution limit?", answer: "For 2024, the Roth IRA contribution limit is $7,000 per year ($8,000 if you're 50 or older). Income limits apply — single filers earning above $161,000 and married filers above $240,000 cannot contribute directly." },
    { question: "What is the biggest advantage of a Roth IRA?", answer: "Tax-free growth and withdrawals. Unlike a Traditional IRA, contributions to a Roth IRA are made with after-tax dollars, meaning all earnings and qualified withdrawals in retirement are completely tax-free." },
    { question: "When can I withdraw from my Roth IRA?", answer: "Qualified withdrawals (tax and penalty-free) can be made after age 59½, as long as the account has been open for at least 5 years. You can always withdraw your original contributions (not earnings) at any time, tax and penalty-free." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Roth IRA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Roth IRA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} />
                <InputField id="retage" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} />
                <InputField id="contrib" label="Annual Contribution ($)" value={annualContribution} onChange={setAnnualContribution} tooltip="2024 limit: $7,000 ($8,000 if 50+)." />
                <InputField id="balance" label="Current Balance ($)" value={currentBalance} onChange={setCurrentBalance} />
                <InputField id="return" label="Expected Annual Return (%)" value={annualReturn} onChange={setAnnualReturn} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Roth IRA Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Balance at Retirement</p>
                    <p className="text-5xl font-black text-foreground">${(results.totalFV / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground mt-1">100% Tax-Free</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Monthly Withdrawal (4%)</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyWithdrawal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Years to Grow", value: 0, textValue: results.years + " years" },
                  { label: "Total Contributed", value: 0, textValue: "$" + results.totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Tax-Free Growth", value: 0, textValue: "$" + results.taxFreGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Why a Roth IRA is Powerful</h2>
              <p>The Roth IRA is often considered one of the best retirement savings vehicles available. Its core advantage — tax-free growth — becomes increasingly powerful over a long investment horizon.</p>
              <h3>The Tax-Free Advantage</h3>
              <p>Imagine accumulating $1,000,000 in a Roth IRA. Every dollar of that, plus all future gains, can be withdrawn completely tax-free. In a Traditional IRA or 401(k), that same $1M would be subject to ordinary income taxes upon withdrawal, potentially losing 20-30% to taxes.</p>
              <h3>No Required Minimum Distributions (RMDs)</h3>
              <p>Unlike Traditional IRAs, Roth IRAs have no Required Minimum Distributions (RMDs) during your lifetime. This means you can let the money grow for as long as you choose, making it an excellent tool for leaving a tax-free inheritance to your heirs.</p>
              <h3>The Back-Door Roth</h3>
              <p>If your income exceeds the Roth IRA limits, high earners can use a "backdoor Roth" strategy: making a non-deductible Traditional IRA contribution and then immediately converting it to a Roth. Consult a tax professional before attempting this strategy.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roth-ira" />
          <PopularCalculators exclude="/calculator/roth-ira-calculator" />
        </div>
      </div>
    </>
  );
};

export default RothIraCalculator;

