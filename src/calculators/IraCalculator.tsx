"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const IraCalculator = () => {
  const [currentBalance, setCurrentBalance] = useState("10000");
  const [annualContribution, setAnnualContribution] = useState("6500");
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [expectedReturn, setExpectedReturn] = useState("8");
  const [taxRateRetirement, setTaxRateRetirement] = useState("20");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const PV = parseFloat(currentBalance) || 0;
    const PMT = (parseFloat(annualContribution) || 0) / 12;
    const r = (parseFloat(expectedReturn) || 0) / 100 / 12;
    const age = parseInt(currentAge) || 30;
    const retAge = parseInt(retirementAge) || 65;
    const n = (retAge - age) * 12;

    if (n <= 0) {
      setResults({ error: "Retirement age must be greater than current age." });
      return;
    }

    // FV = PV*(1+r)^n + PMT * [((1+r)^n - 1) / r]
    const growthOfPV = PV * Math.pow(1 + r, n);
    const growthOfPMT = PMT * (Math.pow(1 + r, n) - 1) / r;
    const totalFV = growthOfPV + growthOfPMT;
    
    const totalContributions = PV + (PMT * n);
    const totalEarnings = totalFV - totalContributions;
    
    // Simple Tax adjustment for Traditional IRA comparison
    const taxImpact = totalFV * ((parseFloat(taxRateRetirement) || 0) / 100);
    const afterTaxValue = totalFV - taxImpact;

    setResults({
      totalFV,
      afterTaxValue,
      totalContributions,
      totalEarnings,
      taxImpact
    });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentAge("30");
    setRetirementAge("65");
    setAnnualContribution("6500");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between a Traditional and Roth IRA?", answer: "The main difference is when you pay taxes. With a Traditional IRA, your contributions are often tax-deductible now, but you pay taxes when you withdraw. With a Roth IRA, you pay taxes on the money now, but your withdrawals in retirement are completely tax-free." },
    { question: "How much can I contribute to an IRA annually?", answer: "For 2023, the limit is $6,500 ($7,500 if age 50+). For 2024, the limit increased to $7,000 ($8,000 if age 50+). These limits apply to the combined total across all your IRAs." },
    { question: "Can I have both a 401(k) and an IRA?", answer: "Yes! You can contribute to both an employer-sponsored plan like a 401(k) and an individual plan like an IRA, though your ability to deduct Traditional IRA contributions may be limited by your income if you have a 401(k) at work." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "IRA Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">IRA Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate the future value of your Individual Retirement Account (IRA) and compare Traditional vs. Roth outcomes.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="currentBalance" label="Current IRA Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" />
                <InputField id="annualContribution" label="Annual Contribution" value={annualContribution} onChange={setAnnualContribution} prefix="$" />
                <InputField id="currentAge" label="Current Age" value={currentAge} onChange={setCurrentAge} />
                <InputField id="retirementAge" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} />
                <InputField id="expectedReturn" label="Expected Return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" />
                <InputField id="taxRate" label="Tax Rate in Retirement" value={taxRateRetirement} onChange={setTaxRateRetirement} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Project Growth</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && !results.error && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Estimated Value at Age {retirementAge}</h2>
                  <p className="text-5xl font-extrabold mb-2">${Math.round(results.totalFV).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">After-tax value (Traditional): <span className="font-bold text-foreground">${Math.round(results.afterTaxValue).toLocaleString()}</span></p>
                </div>

                <ResultDisplay items={[
                  { label: "Total Contributions", value: results.totalContributions },
                  { label: "Total Investment Earnings", value: results.totalEarnings, highlight: true },
                  { label: "Tax Liability (Traditional)", value: results.taxImpact },
                  { label: "Final Roth Value", value: results.totalFV, highlight: true },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance">
              <h2>Building Wealth with an IRA</h2>
              <p>An Individual Retirement Account (IRA) is one of the most powerful tools for building long-term wealth. Unlike a standard brokerage account, an IRA provides significant tax advantages that allow your investments to grow much faster over several decades.</p>
              <h3>The Power of Tax-Free Growth</h3>
              <p>In a Roth IRA, you never pay taxes on the growth of your investments. If you contribute $6,000 a year for 30 years and it grows to $500,000, you can withdraw every penny of that half-million dollars tax-free. In a taxable account, you would owe tens of thousands in capital gains taxes.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ira-calculator" />
          <PopularCalculators exclude="/calculator/ira-calculator" />
        </div>
      </div>
    </>
  );
};

export default IraCalculator;

