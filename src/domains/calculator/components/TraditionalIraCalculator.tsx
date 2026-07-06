"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, PiggyBank } from "lucide-react";

const TraditionalIraCalculator = () => {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [annualContribution, setAnnualContribution] = useState("7000");
  const [currentBalance, setCurrentBalance] = useState("5000");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [taxRate, setTaxRate] = useState("22");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const age = parseFloat(currentAge);
    const retAge = parseFloat(retirementAge);
    const contribution = parseFloat(annualContribution);
    const balance = parseFloat(currentBalance);
    const r = parseFloat(annualReturn) / 100;
    const tax = parseFloat(taxRate) / 100;
    const years = retAge - age;

    if (years <= 0) return;

    const fvCurrentBalance = balance * Math.pow(1 + r, years);
    const fvContributions = contribution * ((Math.pow(1 + r, years) - 1) / r);
    const totalFV = fvCurrentBalance + fvContributions;

    // After-tax value
    const afterTaxValue = totalFV * (1 - tax);
    const annualWithdrawal = afterTaxValue * 0.04;

    // Tax savings during contribution years (approximate)
    const annualTaxSavings = contribution * tax;

    setResults({ totalFV, afterTaxValue, annualWithdrawal, annualTaxSavings, years });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentAge("30"); setRetirementAge("65"); setAnnualContribution("7000");
    setCurrentBalance("5000"); setAnnualReturn("7"); setTaxRate("22");
    setResults(null);
  };

  const faqs = [
    { question: "What is the main benefit of a Traditional IRA?", answer: "Contributions may be tax-deductible in the year they are made (subject to income limits if you have a workplace plan), reducing your current taxable income. The account then grows tax-deferred until withdrawal." },
    { question: "Are Traditional IRA withdrawals taxed?", answer: "Yes. All withdrawals in retirement are taxed as ordinary income. This means your tax burden depends on your tax rate in retirement, which may be higher or lower than your current rate." },
    { question: "What are RMDs?", answer: "Required Minimum Distributions (RMDs) are mandatory annual withdrawals from Traditional IRAs that must begin at age 73 (as of 2023). Failing to take RMDs results in a steep 25% penalty on the amount not withdrawn." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Traditional IRA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Traditional IRA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} />
                <InputField id="retage" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} />
                <InputField id="contrib" label="Annual Contribution ($)" value={annualContribution} onChange={setAnnualContribution} />
                <InputField id="balance" label="Current Balance ($)" value={currentBalance} onChange={setCurrentBalance} />
                <InputField id="return" label="Expected Return (%)" value={annualReturn} onChange={setAnnualReturn} />
                <InputField id="tax" label="Estimated Retirement Tax Rate (%)" value={taxRate} onChange={setTaxRate} />
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
                <h2 className="text-2xl font-bold mb-3">Traditional IRA Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Pre-Tax Balance</p>
                    <p className="text-5xl font-black text-foreground">${(results.totalFV / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">After-Tax Value</p>
                    <p className="text-3xl font-black text-foreground">${(results.afterTaxValue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Annual Withdrawal (4% Rule)", value: 0, textValue: "$" + results.annualWithdrawal.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Est. Annual Tax Savings (Now)", value: 0, textValue: "$" + results.annualTaxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 }) + "/yr" },
                  { label: "Years to Grow", value: 0, textValue: results.years + " years" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Tax-Deferred Growth Explained</h2>
              <p>The Traditional IRA is built around a "pay taxes later" philosophy. By deferring taxes until retirement, your entire contribution — including the portion that would have gone to taxes — grows and compounds for decades.</p>
              <h3>Traditional vs. Roth IRA</h3>
              <p>The core trade-off is between current and future taxes. If you expect to be in a lower tax bracket in retirement, the Traditional IRA is often better. If you expect a higher tax rate in retirement (or simply want tax-free income), the Roth IRA is typically superior.</p>
              <h3>Deductibility Rules</h3>
              <p>If you (or your spouse) have a workplace retirement plan (like a 401k), your Traditional IRA deduction may be limited or eliminated based on your income. For 2024, single filers with a workplace plan see reduced deductibility starting at $77,000 MAGI.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/traditional-ira" />
          <PopularCalculators exclude="/calculator/traditional-ira-calculator" />
        </div>
      </div>
    </>
  );
};

export default TraditionalIraCalculator;

