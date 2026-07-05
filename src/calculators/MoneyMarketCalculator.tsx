"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function MoneyMarketCalculator() {
  const [principal, setPrincipal] = useState("25000");
  const [apy, setApy] = useState("4.5");
  const [months, setMonths] = useState("12");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ interestEarned: 0, finalBalance: 0, monthlyInterest: 0 });

  const handleCalculate = () => {
    const p = parseFloat(principal) || 0;
    const apyRate = (parseFloat(apy) || 0) / 100;
    const mo = parseFloat(months) || 0;
    const r = apyRate / 12;
    const finalBalance = p * Math.pow(1 + r, mo);
    const interestEarned = finalBalance - p;
    const monthlyInterest = interestEarned / mo;
    setResults({ interestEarned, finalBalance, monthlyInterest });
    setShowResults(true);
  };

  const reset = () => { setPrincipal("25000"); setApy("4.5"); setMonths("12"); setShowResults(false); };

  const faqs = [
    { question: "What is a money market account?", answer: "A money market account (MMA) is a type of savings account offered by banks and credit unions that typically pays higher interest rates than standard savings accounts and often includes check-writing and debit card privileges." },
    { question: "How is a money market account different from a money market fund?", answer: "A money market account is an FDIC-insured bank deposit product. A money market mutual fund is an investment product that is NOT FDIC-insured, though it aims to maintain a stable $1 net asset value." },
    { question: "What are typical MMA interest rates?", answer: "MMA rates vary significantly between institutions. High-yield MMAs at online banks often offer 4-5% APY while traditional banks may offer as little as 0.01%. Always compare rates before opening an account." },
    { question: "Is there a minimum balance requirement?", answer: "Many money market accounts require minimum balances ranging from $1,000 to $25,000 or more to earn the advertised APY. Falling below the minimum may trigger a lower rate or monthly fee." },
    { question: "Are money market accounts FDIC insured?", answer: "Yes. Money market accounts at FDIC-member banks are insured up to $250,000 per depositor, per bank. NCUA provides the same coverage at federal credit unions." },
    { question: "Can I write checks from a money market account?", answer: "Many MMAs include limited check-writing privileges, unlike standard savings accounts. However, most still have transaction limits (typically 6 per month) imposed by the institution." },
    { question: "Should I use a money market account or a high-yield savings account?", answer: "Both are excellent for liquid cash reserves. MMAs may offer check-writing and debit card access. HYSAs often have fewer fees and sometimes higher rates. Compare the specific APY, minimum balance, and fee structure of each offer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Money Market Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Money Market Account Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="principal" label="Initial Deposit ($)" value={principal} onChange={setPrincipal} prefix="$" tooltip="Amount deposited into the money market account." />
                <InputField id="apy" label="Annual Percentage Yield (APY)" value={apy} onChange={setApy} suffix="%" tooltip="Current APY offered by the money market account." />
                <InputField id="months" label="Term (Months)" value={months} onChange={setMonths} tooltip="Number of months to project interest earnings." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Money Market Results</h2>
                <ResultDisplay items={[
                  { label: "Final Account Balance", value: results.finalBalance, highlight: true },
                  { label: "Total Interest Earned", value: results.interestEarned, highlight: true },
                  { label: "Average Monthly Interest", value: results.monthlyInterest },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Money Market Accounts</h2>
              <p>Money market accounts (MMAs) occupy a unique position in the financial product landscape, combining features of both checking and savings accounts while typically offering higher interest rates than either. They are particularly well-suited for individuals who want their emergency fund or short-term savings to earn a competitive yield while maintaining easy access to their money through checks or debit card transactions.</p>
              <h2 className="text-2xl font-bold mb-3">How Money Market Account Interest Works</h2>
              <p>Most MMAs compound interest daily and credit it to your account monthly, similar to high-yield savings accounts. The interest is calculated based on your daily balance, meaning any deposits immediately begin earning interest and any withdrawals immediately stop earning on that amount. This daily compounding means your account earns fractionally more than if interest were calculated only monthly.</p>
              <h2 className="text-2xl font-bold mb-3">Tiered Interest Rate Structures</h2>
              <p>Many money market accounts use tiered interest rates where larger balances earn higher APYs. For example, a bank might offer 3.0% on balances under $10,000, 4.0% on balances from $10,000-$50,000, and 4.5% on balances above $50,000. When shopping for an MMA, pay attention to which tier applies to your expected balance and whether the higher rate applies to the entire balance or only the portion above the threshold.</p>
              <h2 className="text-2xl font-bold mb-3">MMA vs. CD: When Each Makes Sense</h2>
              <p>MMAs offer liquidity — you can withdraw anytime without penalty. CDs (Certificates of Deposit) lock up your money for a fixed term but may offer higher rates as compensation for the illiquidity. If you know you won't need the money for 12-24 months and want a guaranteed rate, a CD may be preferable. If you want flexibility and still need the money accessible, an MMA is the better choice, especially in a falling rate environment where you can keep earning the current high rate until you need the funds.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/money-market-calculator" />
          <PopularCalculators exclude="/calculator/money-market-calculator" />
        </div>
      </div>
    </>
  );
}
