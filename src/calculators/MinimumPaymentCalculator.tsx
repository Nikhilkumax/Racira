"use client";
import { RotateCcw, Calendar, TrendingUp, Clock, CreditCard, AlertTriangle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const MinimumPaymentCalculator = () => {
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("18.9");
  const [minPaymentPercent, setMinPaymentPercent] = useState("2.5");
  const [minPaymentFixed, setMinPaymentFixed] = useState("25");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const startBal = parseFloat(balance) || 0;
    const rate = (parseFloat(apr) || 0) / 100 / 12;
    const minPct = (parseFloat(minPaymentPercent) || 0) / 100;
    const minFix = parseFloat(minPaymentFixed) || 0;

    if (startBal <= 0 || rate < 0) return;

    let currentBal = startBal;
    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;
    const monthlyData: any[] = [];

    // Safety break at 100 years
    while (currentBal > 0 && months < 1200) {
      const interest = currentBal * rate;
      const minPay = Math.max(minFix, currentBal * minPct + interest);
      const payment = Math.min(currentBal + interest, minPay);

      totalInterest += interest;
      totalPaid += payment;
      currentBal = currentBal + interest - payment;
      months++;

      if (months % 12 === 0 || currentBal <= 0) {
        monthlyData.push({
           month: months,
           balance: currentBal,
           totalPaid
        });
      }

      // Detect if payment is less than interest
      if (months > 1 && interest >= minPay && currentBal > 0) {
        setResults({ infinite: true });
        return;
      }
    }

    setResults({
      months,
      totalInterest,
      totalPaid,
      years: months / 12,
      infinite: false,
      monthlyData
    });
  };

  const reset = () => {
    setBalance("5000");
    setApr("18.9");
    setMinPaymentPercent("2.5");
    setMinPaymentFixed("25");
  };

  const faqs = [
    {
      question: "What is a minimum credit card payment?",
      answer: "A minimum payment is the lowest amount you are required to pay each month to keep your account in good standing. It is usually calculated as a percentage of your total balance (typically 1% to 3%) plus any interest and fees charged during that billing cycle."
    },
    {
      question: "Why does it take so long to pay off a balance with minimum payments?",
      answer: "Because minimum payments are designed to cover the interest first and only a very small portion of the principal balance. As your balance decreases, your minimum payment also decreases, meaning you are always paying off only a tiny fraction of what you owe."
    },
    {
      question: "What is the Credit Card Accountability Responsibility and Disclosure (CARD) Act?",
      answer: "Passed in 2009, this law requires credit card companies to include a 'Minimum Payment Warning' on your monthly statement, showing exactly how long it would take to pay off your balance and how much interest you would pay if you only made the minimum payments."
    },
    {
      question: "How much faster can I pay off my debt by paying more than the minimum?",
      answer: "Even small increases can have a massive impact. Adding just $50 or $100 to your minimum payment each month can often cut your payoff time by years and save you thousands of dollars in interest charges."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Minimum Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Minimum Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <CreditCard className="h-5 w-5 text-primary" /> Credit Card Info
                  </h2>
                  <InputField id="balance" label="Current Balance" value={balance} onChange={setBalance} prefix="$" />
                  <InputField id="apr" label="Interest Rate (APR %)" value={apr} onChange={setApr} suffix="%" step="0.1" />
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Calendar className="h-5 w-5 text-primary" /> Payment Formula
                  </h2>
                  <InputField id="min-pct" label="Minimum Payment %" value={minPaymentPercent} onChange={setMinPaymentPercent} suffix="%" step="0.1" tooltip="Usually between 1.5% and 3.0% of your balance." />
                  <InputField id="min-fix" label="Minimum Fixed Amount" value={minPaymentFixed} onChange={setMinPaymentFixed} prefix="$" tooltip="The absolute lowest amount the bank will accept (e.g., $25)." />
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
                {results.infinite ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-8 rounded-2xl text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-2xl font-black mb-2">Negative Amortization!</p>
                    <p className="font-medium">Your minimum payment is not enough to cover the monthly interest. Your balance will grow forever unless you increase your payments.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="card-calculator bg-red-500/5 border-red-500/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Time to Pay Off</p>
                        <p className="text-5xl font-black text-foreground">{Math.floor(results.years)}y {Math.round(results.months % 12)}m</p>
                        <p className="text-xs text-red-500 mt-2 font-bold uppercase tracking-widest">({results.months} months)</p>
                      </div>
                      <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Interest Cost</p>
                        <p className="text-5xl font-black text-foreground">${Math.round(results.totalInterest).toLocaleString()}</p>
                        <p className="text-xs text-primary mt-2 font-bold uppercase tracking-widest">({Math.round((results.totalInterest / parseFloat(balance)) * 100)}% of Balance)</p>
                      </div>
                    </div>

                    <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                      <h2 className="text-2xl font-bold mb-3">
                        <TrendingUp className="h-5 w-5 text-primary" /> Cost Summary
                      </h2>
                      <ResultDisplay items={[
                        { label: "Total Amount Paid", value: results.totalPaid },
                        { label: "Original Balance", value: parseFloat(balance) },
                        { label: "First Minimum Payment", value: Math.max(parseFloat(minPaymentFixed), (parseFloat(balance) * (parseFloat(minPaymentPercent) / 100)) + (parseFloat(balance) * (parseFloat(apr) / 1200))) },
                      ]} />
                    </div>

                    <div className="card-calculator">
                       <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Payoff Progression</h3>
                       <div className="space-y-3">
                          {results.monthlyData.map((data: any, i: number) => (
                             <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Year {data.month / 12}</span>
                                <div className="flex items-center gap-4 flex-1 gap-3 items-center">
                                   <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-24 hidden sm:block">
                                      <div className="h-full bg-red-500" style={{ width: `${(data.balance / parseFloat(balance)) * 100}%` }}></div>
                                   </div>
                                   <span className="font-mono w-24 text-right">${Math.round(data.balance).toLocaleString()}</span>
                                </div>
                             </div>
                          ))}
                       </div>
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
              <h2>The Danger of Minimum Payments</h2>
              <p>Minimum payments are one of the most effective ways for credit card companies to maximize their profits. While they allow you to avoid late fees and keep your account active, they are mathematically structured to keep you in debt for as long as possible—often decades.</p>

              <h3>How Lenders Calculate the Minimum</h3>
              <p>Most banks use a formula that is the greater of two numbers: a fixed dollar amount (like $25 or $35) or a small percentage of your outstanding balance (usually 1% to 2%) plus any interest and fees. As your balance goes down, the percentage-based payment also goes down, meaning you are always paying off less and less of the actual debt.</p>

              <h3>Why the 'Interest Trap' Happens</h3>
              <p>In the early months of paying off a large balance, your minimum payment might be $150, but $100 of that could be going straight to interest. This leaves only $50 to reduce the principal. If you continue to use the card for new purchases, your balance might actually increase even if you make your minimum payments on time.</p>

              <h3>The CARD Act Warning</h3>
              <p>Since 2009, credit card issuers have been required to show you a 'Minimum Payment Warning' on your monthly statement. This table shows you two scenarios: how long it will take to pay off the balance making only minimum payments, and how much you would need to pay each month to be debt-free in exactly three years. Most people are shocked to see that paying just a little bit more each month can save them thousands of dollars and years of time.</p>

              <h2>Strategies to Escape the Minimum Payment Cycle</h2>
              <p>If you find yourself only making minimum payments, here are three ways to break the cycle:</p>
              <ol>
                <li><strong>The 'Fixed Payment' Strategy:</strong> Instead of letting your payment drop as your balance drops, keep paying the same amount you paid in month one. This effectively turns your credit card into an amortizing loan.</li>
                <li><strong>Debt Consolidation:</strong> If your credit score is still decent, you might qualify for a personal loan with a much lower interest rate than your credit card. This simplifies your payments and ensures a definitive end date for the debt.</li>
                <li><strong>Balance Transfer:</strong> Moving your debt to a 0% APR card for 12-18 months can give you the breathing room needed to pay down the principal without the anchor of high interest charges.</li>
              </ol>

              <h3>A Rule of Thumb</h3>
              <p>Financial experts generally suggest that if your credit card debt exceeds 50% of your annual income and you can only afford minimum payments, you may need to seek professional help from a non-profit credit counseling agency to explore debt management plans.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/minimum-payment-calculator" />
          <PopularCalculators exclude="/calculator/minimum-payment-calculator" />
        </div>
      </div>
    </>
  );
};

export default MinimumPaymentCalculator;

