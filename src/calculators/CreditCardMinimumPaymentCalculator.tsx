"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CreditCard } from "lucide-react";

const CreditCardMinimumPaymentCalculator = () => {
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("22.99");
  const [minPct, setMinPct] = useState("2");
  const [minFloor, setMinFloor] = useState("25");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const b = parseFloat(balance);
    const r = parseFloat(apr) / 100 / 12;
    const pct = parseFloat(minPct) / 100;
    const floor = parseFloat(minFloor);

    if (b <= 0 || r < 0) return;

    let bal = b;
    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;

    while (bal > 0.01 && months < 1200) {
      const interest = bal * r;
      totalInterest += interest;
      bal += interest;
      const payment = Math.max(bal * pct, floor, interest + 1); // Must cover at least interest + $1
      const actualPayment = Math.min(payment, bal);
      totalPaid += actualPayment;
      bal -= actualPayment;
      months++;
    }

    setResults({
      months,
      years: (months / 12).toFixed(1),
      totalInterest,
      totalPaid,
    });
  };

  const reset = () => {
    setShowResults(false);
    setBalance("5000"); setApr("22.99"); setMinPct("2"); setMinFloor("25");
    setResults(null);
  };

  const faqs = [
    { question: "Why does it take so long to pay off credit card debt with minimums?", answer: "Because the minimum payment is calculated as a percentage of your balance, it shrinks every month as your balance decreases. This means progress slows dramatically over time, and most of each payment goes toward interest, not principal." },
    { question: "What is the typical minimum payment percentage?", answer: "Most credit cards set the minimum at 1-3% of the outstanding balance or $25-35 (whichever is greater). Some use a flat dollar amount plus all accrued interest and fees." },
    { question: "How can I pay off my credit card faster?", answer: "Pay more than the minimum. Even paying double the minimum can cut your payoff time in half. Also consider the avalanche method (highest interest first) for the most mathematical savings." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Minimum Payment Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Minimum Payment Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Discover how many years it will take — and how much you'll pay — by making only minimum payments.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="balance" label="Credit Card Balance ($)" value={balance} onChange={setBalance} />
                <InputField id="apr" label="Annual APR (%)" value={apr} onChange={setApr} />
                <InputField id="minpct" label="Min Payment Rate (%)" value={minPct} onChange={setMinPct} tooltip="Usually 1-3% of balance." />
                <InputField id="floor" label="Minimum Floor ($)" value={minFloor} onChange={setMinFloor} tooltip="Minimum dollar amount, usually $25." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" /> Calculate
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Minimum Payment Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">Time to Pay Off</p>
                    <p className="text-5xl font-black text-foreground">{results.years} yrs</p>
                    <p className="text-sm text-muted-foreground mt-1">({results.months} months)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest Paid</p>
                    <p className="text-3xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Original Balance", value: 0, textValue: "$" + parseFloat(balance).toLocaleString() },
                  { label: "Total Amount Paid", value: 0, textValue: "$" + results.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Interest vs Principal", value: 0, textValue: ((results.totalInterest / results.totalPaid) * 100).toFixed(0) + "% interest" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Minimum Payment Trap</h2>
              <p>Credit card issuers design minimum payments to keep you in debt as long as possible. A $5,000 balance at 22.99% APR can take over 20 years to pay off with minimums alone, costing you thousands more than you borrowed.</p>
              <h3>How Minimums Are Calculated</h3>
              <p>Most card issuers use whichever is greater: a percentage of the balance (1-3%) or a fixed floor amount ($25-$35). As your balance drops, so does your minimum — which is exactly what traps you in a long-term cycle.</p>
              <h3>Break the Cycle</h3>
              <p>The single most powerful step is to fix your payment. Instead of paying whatever the minimum is each month, pick a fixed number (say, $200) and stick to it. This alone can reduce a 20-year payoff to under 3 years.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-card-minimum-payment" />
          <PopularCalculators exclude="/calculator/credit-card-minimum-payment-calculator" />
        </div>
      </div>
    </>
  );
};

export default CreditCardMinimumPaymentCalculator;

