"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function HighYieldSavingsCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [apy, setApy] = useState("5.0");
  const [monthlyDeposit, setMonthlyDeposit] = useState("500");
  const [years, setYears] = useState("3");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ finalBalance: 0, totalDeposited: 0, totalInterest: 0, effectiveAPY: 0 });

  const handleCalculate = () => {
    const p = parseFloat(principal) || 0;
    const apyRate = (parseFloat(apy) || 0) / 100;
    const monthly = parseFloat(monthlyDeposit) || 0;
    const yrs = parseFloat(years) || 0;
    const n = yrs * 12;
    const r = apyRate / 12;

    const futureValuePrincipal = p * Math.pow(1 + r, n);
    const futureValueMonthly = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
    const finalBalance = futureValuePrincipal + futureValueMonthly;
    const totalDeposited = p + monthly * n;
    const totalInterest = finalBalance - totalDeposited;

    setResults({ finalBalance, totalDeposited, totalInterest, effectiveAPY: apyRate * 100 });
    setShowResults(true);
  };

  const reset = () => { setPrincipal("10000"); setApy("5.0"); setMonthlyDeposit("500"); setYears("3"); setShowResults(false); };

  const faqs = [
    { question: "What is a high-yield savings account?", answer: "A high-yield savings account (HYSA) is a type of savings account that earns significantly higher interest rates than traditional bank savings accounts. They are primarily offered by online banks with lower overhead costs." },
    { question: "What APY can I expect from a HYSA?", answer: "In 2024-2025, many HYSAs offered APYs of 4-5%, compared to the national average of ~0.5% for traditional savings accounts. Rates fluctuate with the Federal Reserve's interest rate decisions." },
    { question: "Is my money safe in a HYSA?", answer: "Yes. HYSA accounts at FDIC-insured banks are protected up to $250,000 per depositor, per institution. NCUA provides equivalent protection at credit unions." },
    { question: "What is the difference between APY and APR?", answer: "APY (Annual Percentage Yield) accounts for compound interest, making it higher than APR (Annual Percentage Rate) for the same nominal rate. When comparing savings accounts, always compare APYs." },
    { question: "How often is interest compounded in a HYSA?", answer: "Most HYSAs compound interest daily and credit it to your account monthly. Daily compounding generates slightly more interest than monthly compounding at the same APY." },
    { question: "Are there any withdrawal limits?", answer: "Historically, Regulation D limited savings account withdrawals to 6 per month. While the Fed suspended this rule in 2020, many banks still enforce similar limits to maintain account classification." },
    { question: "How does a HYSA compare to a money market account or CD?", answer: "HYSAs offer high liquidity with competitive yields. Money market accounts may offer slightly higher rates with check-writing features. CDs offer higher rates for locking money for a fixed term (1, 2, or 5 years)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "High-Yield Savings Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">High-Yield Savings Account Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="principal" label="Initial Deposit ($)" value={principal} onChange={setPrincipal} prefix="$" tooltip="The amount you deposit when opening the account." />
                <InputField id="apy" label="Annual Percentage Yield (APY)" value={apy} onChange={setApy} suffix="%" tooltip="The actual annual return including compound interest." />
                <InputField id="monthly-deposit" label="Monthly Deposit ($)" value={monthlyDeposit} onChange={setMonthlyDeposit} prefix="$" tooltip="Additional amount deposited to the account each month." />
                <InputField id="years" label="Time Period (Years)" value={years} onChange={setYears} tooltip="Number of years to project the account growth." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Savings Growth</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-4">Savings Projection</h2>
                <ResultDisplay items={[
                  { label: "Final Account Balance", value: results.finalBalance, highlight: true },
                  { label: "Total Amount Deposited", value: results.totalDeposited },
                  { label: "Total Interest Earned", value: results.totalInterest, highlight: true },
                  { label: "Annual Yield (APY)", value: 0, textValue: `${results.effectiveAPY.toFixed(2)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Why Choose a High-Yield Savings Account?</h2>
              <p>High-yield savings accounts have become increasingly popular as interest rates rose significantly from 2022 to 2024. Traditional brick-and-mortar banks often offer savings account rates near 0.01-0.10% APY — essentially nothing. By contrast, online-only banks and fintech platforms regularly offer 4-5% APY, resulting in dramatically better returns on your cash reserves without any additional risk.</p>
              <h2>The Power of Compound Interest in Savings</h2>
              <p>Even at the same nominal interest rate, the frequency of compounding matters. Daily compounding earns more than monthly compounding, which earns more than annual compounding. Most HYSAs compound interest daily and credit it monthly, maximizing your earnings. Over years, this compounding effect is substantial — a $10,000 deposit earning 5% APY for 10 years grows to over $16,400 without a single additional deposit.</p>
              <h2>HYSA vs. Traditional Savings: The Real Cost</h2>
              <p>Consider $50,000 sitting in a traditional savings account at 0.10% APY vs. a HYSA at 5% APY. After one year, the traditional account earns just $50 in interest. The HYSA earns $2,500. That's an additional $2,450 per year — essentially free money — simply by moving your emergency fund or cash reserves to a higher-yielding account.</p>
              <h2>Best Uses for High-Yield Savings Accounts</h2>
              <ul>
                <li><strong>Emergency Fund:</strong> The ideal place for 3-6 months of living expenses — accessible, safe, and earning a meaningful return.</li>
                <li><strong>Short-Term Goals:</strong> Saving for a car, vacation, home down payment, or other goal within 1-3 years.</li>
                <li><strong>Tax Payments:</strong> Self-employed individuals can park quarterly estimated tax payments in a HYSA.</li>
                <li><strong>Wedding Fund:</strong> Accumulating for a large upcoming expense without stock market risk.</li>
              </ul>
              <h2>Comparing HYSAs to Other Savings Vehicles</h2>
              <p>At 5% APY, a HYSA competes favorably with money market mutual funds and short-term CDs. The key advantages of a HYSA over CDs are full liquidity (no early withdrawal penalty), no fixed term, and the ability to continue depositing. The advantage of a CD is often a guaranteed fixed rate for its term, protecting against rate decreases if the Fed cuts interest rates.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/high-yield-savings-calculator" />
          <PopularCalculators exclude="/calculator/high-yield-savings-calculator" />
        </div>
      </div>
    </>
  );
}
