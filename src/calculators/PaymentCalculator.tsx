"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calculator } from "lucide-react";

const PaymentCalculator = () => {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("10");
  const [term, setTerm] = useState("24");
  const [frequency, setFrequency] = useState("12"); // Payments per year

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(amount);
    const annualRate = parseFloat(rate) / 100;
    const freq = parseFloat(frequency);
    const r = annualRate / freq;
    const n = parseFloat(term); // Total number of payments

    if (p <= 0 || r < 0 || n <= 0) return;

    const installment = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    const totalPayback = installment * n;
    const totalInterest = totalPayback - p;

    setResults({
      installment,
      totalInterest,
      totalPayback,
      annualCost: installment * freq
    });
  };

  const reset = () => {
    setShowResults(false);
    setAmount("10000"); setRate("10"); setTerm("24"); setFrequency("12");
    setResults(null);
  };

  const faqs = [
    { question: "How is a loan payment calculated?", answer: "Most loans use an 'amortization' formula where each payment covers the interest for that period plus a portion of the principal balance. As the balance decreases, the interest portion shrinks and the principal portion grows." },
    { question: "Does bi-weekly payment save money?", answer: "Yes. Because there are 52 weeks in a year, paying bi-weekly results in 26 half-payments, which equals 13 full monthly payments per year. This extra payment annually can shorten a 30-year mortgage by 4-5 years." },
    { question: "What is the 'Effective Interest Rate'?", answer: "If a loan has fees or if interest is compounded differently than your payment frequency, the effective rate (or APR) will be higher than the stated nominal interest rate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Payment Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">General Payment Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">A versatile tool to calculate recurring payments for any type of installment loan.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={amount} onChange={setAmount} />
                <InputField id="rate" label="Annual Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Total Payments (Number)" value={term} onChange={setTerm} tooltip="e.g. 36 for a 3-year monthly loan." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Payment Frequency</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-calc">
                    <option value="52">Weekly</option>
                    <option value="26">Bi-Weekly</option>
                    <option value="12">Monthly</option>
                    <option value="4">Quarterly</option>
                    <option value="1">Annually</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5" /> Calculate Payment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Calculation Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Recurring Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.installment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Cost of Loan", value: 0, textValue: "$" + results.totalPayback.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Annual Payment Cost", value: 0, textValue: "$" + results.annualCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Interest as % of Principal", value: 0, textValue: ((results.totalInterest / parseFloat(amount)) * 100).toFixed(1) + "%" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>The Mechanics of Loan Payments</h2>
              <p>Whether it's a small personal loan or a large commercial note, most debt follows the same mathematical principles. Understanding these mechanics helps you make better financial decisions.</p>
              <h3>Frequency Matters</h3>
              <p>While monthly payments are the standard, choosing a more frequent schedule (like bi-weekly) can reduce the total interest you pay. This is because interest is typically calculated on your remaining balance; by paying more frequently, you reduce that balance slightly faster every month.</p>
              <h3>Term Length vs. Monthly Cost</h3>
              <p>There is a direct trade-off between how much you pay every month and how much you pay in total interest. A shorter term (e.g., 2 years instead of 5) will have a higher monthly payment but will save you a significant amount in interest charges. Always aim for the shortest term you can comfortably afford.</p>
              <h3>Fixed vs. Variable Rates</h3>
              <p>A <strong>Fixed Rate</strong> means your payment will never change, providing security and ease of budgeting. A <strong>Variable Rate</strong> might start lower but can increase if market rates go up, potentially making your loan much more expensive over time.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payment" />
            <PopularCalculators exclude="/calculator/payment-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default PaymentCalculator;

