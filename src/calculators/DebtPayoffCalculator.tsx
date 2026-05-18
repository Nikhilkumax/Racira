"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CreditCard } from "lucide-react";

const DebtPayoffCalculator = () => {
  const [balance, setBalance] = useState("15000");
  const [rate, setRate] = useState("18");
  const [payment, setPayment] = useState("500");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(balance);
    const r = parseFloat(rate) / 100 / 12;
    const pmt = parseFloat(payment);

    if (p <= 0 || r < 0 || pmt <= 0) return;

    // Check if payment covers interest
    const monthlyInterest = p * r;
    if (pmt <= monthlyInterest) {
      setResults({ impossible: true, monthlyInterest });
      return;
    }

    const months = Math.log(pmt / (pmt - p * r)) / Math.log(1 + r);
    const totalPaid = pmt * Math.ceil(months);
    const totalInterest = totalPaid - p;

    // Also calculate: what payment to be debt-free in 1 year, 2 years, 3 years?
    const payFor1yr = r > 0 ? (p * r * Math.pow(1 + r, 12)) / (Math.pow(1 + r, 12) - 1) : p / 12;
    const payFor2yr = r > 0 ? (p * r * Math.pow(1 + r, 24)) / (Math.pow(1 + r, 24) - 1) : p / 24;
    const payFor3yr = r > 0 ? (p * r * Math.pow(1 + r, 36)) / (Math.pow(1 + r, 36) - 1) : p / 36;

    setResults({
      months: Math.ceil(months),
      years: (months / 12).toFixed(1),
      totalInterest,
      totalPaid,
      payFor1yr,
      payFor2yr,
      payFor3yr,
      impossible: false
    });
  };

  const reset = () => {
    setShowResults(false);
    setBalance("15000"); setRate("18"); setPayment("500");
    setResults(null);
  };

  const faqs = [
    { question: "How do I calculate my debt payoff date?", answer: "You need your balance, interest rate, and monthly payment. The formula uses logarithms to find the number of months until the balance reaches zero. Our calculator does this instantly." },
    { question: "What if my payment doesn't cover the interest?", answer: "If your payment is less than or equal to the monthly interest charge, your debt will never be paid off — it will grow every month. You must pay more than the monthly interest to make progress." },
    { question: "How much should I increase my payment to pay off faster?", answer: "Use the target date sections in this calculator to find the exact payment needed to be debt-free in 1, 2, or 3 years." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Debt Payoff Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Debt Payoff Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Find your exact debt-free date and discover what payments you need to clear debt in 1, 2, or 3 years.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="balance" label="Current Balance ($)" value={balance} onChange={setBalance} />
                <InputField id="rate" label="Interest Rate (APR %)" value={rate} onChange={setRate} />
                <InputField id="payment" label="Monthly Payment ($)" value={payment} onChange={setPayment} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" /> Calculate Payoff
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {results && !results.impossible && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Payoff Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Debt-Free In</p>
                    <p className="text-5xl font-black text-foreground">{results.years} yrs</p>
                    <p className="text-sm text-muted-foreground mt-1">({results.months} months)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <h3 className="font-semibold mb-3 text-foreground">Pay by Target Date</h3>
                <ResultDisplay items={[
                  { label: "Payment to Clear in 1 Year", value: 0, textValue: "$" + results.payFor1yr.toLocaleString(undefined, { maximumFractionDigits: 0 }) + "/mo" },
                  { label: "Payment to Clear in 2 Years", value: 0, textValue: "$" + results.payFor2yr.toLocaleString(undefined, { maximumFractionDigits: 0 }) + "/mo" },
                  { label: "Payment to Clear in 3 Years", value: 0, textValue: "$" + results.payFor3yr.toLocaleString(undefined, { maximumFractionDigits: 0 }) + "/mo" },
                ]} />
              </div>
            )}

            {results?.impossible && (
              <div className="card-calculator mb-8 p-6 border-red-500/30 bg-red-500/5">
                <p className="text-red-600 font-bold text-lg">⚠️ Payment Too Low</p>
                <p className="text-muted-foreground mt-2">Your monthly interest charge is <strong>${results.monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>. Your payment must exceed this amount to make progress. Increase your payment to at least ${Math.ceil(results.monthlyInterest + 1)} to start paying off this debt.</p>
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Your Roadmap to Debt Freedom</h2>
              <p>Understanding exactly when your debt will be paid off is the first step to taking control. Many people are surprised to find that their current payment schedule has them in debt for far longer than they imagined.</p>
              <h3>The Minimum Payment Danger</h3>
              <p>Credit card issuers are required to show you on your statement how long it will take to pay off if you only make minimum payments. This number can be shocking — often 10 to 20+ years for a seemingly manageable balance.</p>
              <h3>Set a Date, Not Just a Payment</h3>
              <p>Instead of thinking "I'll pay as much as I can," commit to a specific payoff date. Work backwards to find the required monthly payment. This reverse-engineering approach is far more effective for creating a debt-free plan you'll stick to.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-payoff" />
            <PopularCalculators exclude="/calculator/debt-payoff-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default DebtPayoffCalculator;

