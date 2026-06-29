"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function CertificateOfDepositCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [apy, setApy] = useState("5.25");
  const [term, setTerm] = useState("12");
  const [compounding, setCompounding] = useState("12");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ maturityValue: 0, interestEarned: 0, effectiveAPY: 0 });

  const handleCalculate = () => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(apy) || 0) / 100;
    const months = parseFloat(term) || 0;
    const n = parseFloat(compounding) || 12;
    const years = months / 12;
    const maturityValue = p * Math.pow(1 + r / n, n * years);
    const interestEarned = maturityValue - p;
    const effectiveAPY = (Math.pow(1 + r / n, n) - 1) * 100;
    setResults({ maturityValue, interestEarned, effectiveAPY });
    setShowResults(true);
  };

  const reset = () => { setPrincipal("10000"); setApy("5.25"); setTerm("12"); setCompounding("12"); setShowResults(false); };

  const faqs = [
    { question: "What is a Certificate of Deposit (CD)?", answer: "A CD is a savings product offered by banks and credit unions that pays a fixed interest rate for a specified term (from 1 month to 5+ years). You commit to leaving the money deposited for the full term in exchange for a guaranteed return." },
    { question: "What happens if I withdraw early from a CD?", answer: "Early withdrawal from a CD triggers an early withdrawal penalty, typically 60-180 days of interest depending on the term. Some CDs (no-penalty CDs) allow early withdrawal without penalty but usually offer lower rates." },
    { question: "Are CDs FDIC-insured?", answer: "Yes. CDs at FDIC-member banks are insured up to $250,000 per depositor, per bank. They are one of the safest investments available." },
    { question: "What is a CD ladder?", answer: "A CD ladder is a strategy of splitting your investment across multiple CDs with different maturity dates (e.g., 3-month, 6-month, 1-year, 2-year). As each matures, you reinvest for the longest term, maintaining liquidity while capturing higher long-term rates." },
    { question: "What is the difference between APY and APR for CDs?", answer: "APR (Annual Percentage Rate) is the stated interest rate without compounding. APY (Annual Percentage Yield) includes the effect of compounding, making it slightly higher. CDs are typically quoted in APY." },
    { question: "When should I choose a CD over a high-yield savings account?", answer: "Choose a CD when you want to lock in a guaranteed rate for a specific period, especially if you believe rates will fall. If you need liquidity or rates may rise, a high-yield savings account offers more flexibility." },
    { question: "Can I add money to a CD after opening it?", answer: "Standard CDs don't allow additional deposits after the initial funding. Add-on CDs (offered by some institutions) allow additional deposits during the term, often at a slightly lower rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CD Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Certificate of Deposit (CD) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="principal" label="Deposit Amount ($)" value={principal} onChange={setPrincipal} prefix="$" tooltip="Initial amount deposited into the CD." />
                <InputField id="apy" label="Annual Percentage Yield (APY)" value={apy} onChange={setApy} suffix="%" tooltip="The APY offered by the CD — check the institution's current rates." />
                <InputField id="term" label="CD Term (Months)" value={term} onChange={setTerm} tooltip="Duration of the CD. Common terms: 3, 6, 12, 18, 24, 36, 60 months." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Compounding Frequency</label>
                  <select value={compounding} onChange={e => setCompounding(e.target.value)} className="input-calc">
                    <option value="365">Daily</option>
                    <option value="12">Monthly</option>
                    <option value="4">Quarterly</option>
                    <option value="2">Semi-Annually</option>
                    <option value="1">Annually</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">CD Maturity Results</h2>
                <ResultDisplay items={[
                  { label: "Maturity Value", value: results.maturityValue, highlight: true },
                  { label: "Total Interest Earned", value: results.interestEarned, highlight: true },
                  { label: "Effective APY", value: 0, textValue: `${results.effectiveAPY.toFixed(4)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding Certificates of Deposit</h2>
              <p>A Certificate of Deposit (CD) is a time deposit savings product that offers a guaranteed fixed interest rate in exchange for committing your money for a specified period. CDs have been a cornerstone of conservative investing for decades, offering FDIC-insured safety with returns that typically exceed those of standard savings accounts. In the elevated interest rate environment of 2023-2025, CDs have become especially attractive, with many institutions offering 5%+ APY on 1-year terms.</p>
              <h2>The CD Ladder Strategy</h2>
              <p>Rather than putting all your savings into a single CD, many savvy investors use a "CD ladder." This involves splitting your investment across multiple CDs with staggered maturity dates. For example, investing $20,000 as four $5,000 CDs maturing in 6 months, 1 year, 18 months, and 2 years. As each CD matures, you reinvest the proceeds into a new 2-year CD, maintaining a portion of funds available every 6 months while still capturing higher long-term rates.</p>
              <h2>How CD Interest Is Compounded</h2>
              <p>The compounding frequency significantly impacts your actual earnings. Daily compounding generates more interest than monthly, quarterly, or annual compounding at the same stated rate. The relationship is captured by the effective APY formula: <strong>Effective APY = (1 + r/n)^n - 1</strong>, where r is the annual rate and n is compounding periods per year. When comparing CDs, always compare effective APYs rather than nominal rates.</p>
              <h2>Early Withdrawal Penalties</h2>
              <p>The guaranteed rate on a CD comes at the cost of liquidity. Most CDs impose substantial early withdrawal penalties, commonly expressed as months of interest. A typical 1-year CD might penalize 3-6 months of interest for early withdrawal. For a 5-year CD, the penalty might be 12-18 months of interest. In rare cases, if you withdraw very early and the penalty exceeds your earned interest, you could actually lose a portion of your principal.</p>
              <h2>No-Penalty CDs: The Best of Both Worlds?</h2>
              <p>Some banks offer "no-penalty" or "liquid" CDs that allow you to withdraw your funds without penalty after a brief lock-up period (typically 7 days). These instruments offer the guaranteed rate advantage of traditional CDs with the flexibility closer to a savings account. However, they typically offer lower APYs than standard CDs of the same term. They're worth considering when you want a guaranteed rate but aren't certain you can commit for the full term.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/certificate-of-deposit-calculator" />
          <PopularCalculators exclude="/calculator/certificate-of-deposit-calculator" />
        </div>
      </div>
    </>
  );
}
