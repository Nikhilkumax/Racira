"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function ApyCalculator() {
  const [nominalRate, setNominalRate] = useState("5");
  const [compounding, setCompounding] = useState("12");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ apy: 0, dailyRate: 0, monthlyRate: 0, effectiveDailyRate: 0 });

  const handleCalculate = () => {
    const r = (parseFloat(nominalRate) || 0) / 100;
    const n = parseFloat(compounding) || 12;
    const apy = (Math.pow(1 + r / n, n) - 1) * 100;
    const dailyRate = (r / 365) * 100;
    const monthlyRate = (r / 12) * 100;
    const effectiveDailyRate = (Math.pow(1 + r / n, n / 365) - 1) * 100;
    setResults({ apy, dailyRate, monthlyRate, effectiveDailyRate });
    setShowResults(true);
  };

  const reset = () => { setNominalRate("5"); setCompounding("12"); setShowResults(false); };

  const faqs = [
    { question: "What is APY?", answer: "Annual Percentage Yield (APY) is the effective annual rate of return taking into account the effect of compounding interest. It is always higher than the nominal APR for the same annual rate." },
    { question: "What is the difference between APY and APR?", answer: "APR (Annual Percentage Rate) is the nominal annual rate without compounding. APY includes compounding and shows the true annual yield. For savings, APY is more relevant. For loans, APR is more commonly used." },
    { question: "How does compounding frequency affect APY?", answer: "More frequent compounding (daily vs. monthly vs. annually) increases APY for the same nominal rate. Daily compounding yields slightly more than monthly compounding, which yields more than annual compounding." },
    { question: "Why do banks advertise APY instead of APR?", answer: "For savings accounts, APY is always higher than the nominal rate, making the account appear more attractive. When comparing savings products, always compare APYs since they account for compounding differences." },
    { question: "What is continuous compounding?", answer: "Continuous compounding is the mathematical limit of compounding frequency (infinite times per year). The effective APY approaches e^r - 1, where e is Euler's number (~2.71828). In practice, daily compounding is virtually equivalent." },
    { question: "How do I convert APY to monthly rate?", answer: "To find the equivalent monthly rate from an APY: Monthly Rate = (1 + APY)^(1/12) - 1. This is more accurate than simply dividing APY by 12 because it properly accounts for compounding." },
    { question: "Does APY include fees?", answer: "No. APY only reflects interest earnings, not fees. Always check the fee schedule of a savings account or CD. Monthly maintenance fees can easily negate earned interest, especially on smaller balances." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "APY Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">APY Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Convert an annual interest rate (APR) to Annual Percentage Yield (APY) for any compounding frequency — daily, monthly, quarterly, or annually.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="nominal-rate" label="Nominal Annual Rate (APR, %)" value={nominalRate} onChange={setNominalRate} suffix="%" tooltip="The stated annual interest rate before compounding." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Compounding Frequency</label>
                  <select value={compounding} onChange={e => setCompounding(e.target.value)} className="input-calc">
                    <option value="365">Daily (365x/year)</option>
                    <option value="52">Weekly (52x/year)</option>
                    <option value="26">Bi-Weekly (26x/year)</option>
                    <option value="12">Monthly (12x/year)</option>
                    <option value="6">Bi-Monthly (6x/year)</option>
                    <option value="4">Quarterly (4x/year)</option>
                    <option value="2">Semi-Annually (2x/year)</option>
                    <option value="1">Annually (1x/year)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate APY</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-4">APY Conversion Results</h2>
                <ResultDisplay items={[
                  { label: "Effective APY", value: 0, textValue: `${results.apy.toFixed(6)}%`, highlight: true },
                  { label: "Nominal Monthly Rate", value: 0, textValue: `${results.monthlyRate.toFixed(4)}%` },
                  { label: "Nominal Daily Rate", value: 0, textValue: `${results.dailyRate.toFixed(6)}%` },
                  { label: "Effective Daily Rate", value: 0, textValue: `${results.effectiveDailyRate.toFixed(6)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>APY vs. APR: Understanding the Critical Difference</h2>
              <p>Annual Percentage Yield (APY) and Annual Percentage Rate (APR) are two closely related but distinctly different measures of interest that appear across virtually every financial product — from savings accounts and CDs to mortgages and credit cards. Understanding the difference is essential for making accurate comparisons between financial products and avoiding costly mistakes.</p>
              <h2>The APY Formula</h2>
              <p>APY is calculated using the formula: <strong>APY = (1 + r/n)^n - 1</strong>, where r is the nominal annual interest rate (APR) and n is the number of compounding periods per year. For example, a 5% APR compounded monthly yields an APY of (1 + 0.05/12)^12 - 1 = 5.1162%. The difference may seem small, but on large balances or over long periods, it becomes significant.</p>
              <h2>Why Compounding Frequency Matters</h2>
              <p>The more frequently interest is compounded, the higher the effective APY for the same nominal rate. Daily compounding yields the highest APY, followed by monthly, quarterly, semi-annual, and annual compounding. The mathematical limit is continuous compounding, where APY = e^r - 1. For practical purposes, daily and continuous compounding are nearly identical — the difference between them is negligible.</p>
              <h2>When to Use APY vs. APR</h2>
              <p>For <strong>savings and investment products</strong> (savings accounts, CDs, money market accounts), always compare APYs since they account for compounding differences between institutions. For <strong>borrowing products</strong> (mortgages, auto loans, credit cards), APR is more standardized and regulated, required to include fees, making it the appropriate comparison metric. Note that credit card APR is quoted as a daily periodic rate × 365 without compounding, so the effective rate if you carry a balance is actually higher than the stated APR.</p>
              <h2>Practical Implications for Savers</h2>
              <p>When comparing savings accounts, a bank offering 5.00% APR with daily compounding has an effective APY of 5.1267%. A bank offering 5.00% APY with monthly compounding has an APR of 4.8889%. The difference in actual returns is the APY figure, not the APR. Many consumers are confused by this distinction, which is why U.S. regulations (the Truth in Savings Act) require financial institutions to prominently disclose APY for deposit products.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apy-calculator" />
          <PopularCalculators exclude="/calculator/apy-calculator" />
        </div>
      </div>
    </>
  );
}
