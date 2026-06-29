"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CreditCard } from "lucide-react";

interface Debt {
  name: string;
  balance: string;
  rate: string;
  minPayment: string;
}

const DebtAvalancheCalculator = () => {
  const [debts, setDebts] = useState<Debt[]>([
    { name: "Credit Card A", balance: "3000", rate: "24", minPayment: "60" },
    { name: "Credit Card B", balance: "5500", rate: "19", minPayment: "110" },
    { name: "Personal Loan", balance: "8000", rate: "12", minPayment: "180" },
  ]);
  const [extraPayment, setExtraPayment] = useState("200");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const updateDebt = (i: number, field: keyof Debt, val: string) => {
    setDebts(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const handleCalculate = () => {
    setShowResults(true);
    const extra = parseFloat(extraPayment);
    // Avalanche: sort by rate descending
    let sorted = debts
      .map(d => ({
        name: d.name,
        balance: parseFloat(d.balance),
        rate: parseFloat(d.rate) / 100 / 12,
        minPayment: parseFloat(d.minPayment),
        origRate: parseFloat(d.rate),
      }))
      .filter(d => d.balance > 0)
      .sort((a, b) => b.origRate - a.origRate);

    let month = 0;
    let totalInterest = 0;

    while (sorted.some(d => d.balance > 0) && month < 600) {
      month++;
      // Apply interest then minimums
      sorted = sorted.map(d => {
        const interest = d.balance * d.rate;
        totalInterest += interest;
        const newBal = d.balance + interest;
        const payment = Math.min(d.minPayment, newBal);
        return { ...d, balance: Math.max(0, newBal - payment) };
      });
      // Apply extra to highest rate with remaining balance
      let extraLeft = extra;
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].balance > 0) {
          const applied = Math.min(extraLeft, sorted[i].balance);
          sorted[i] = { ...sorted[i], balance: sorted[i].balance - applied };
          extraLeft -= applied;
          break;
        }
      }
    }

    const payoffOrder = debts
      .map(d => ({ name: d.name, rate: parseFloat(d.rate) }))
      .sort((a, b) => b.rate - a.rate)
      .map(d => d.name);

    setResults({ months: month, years: (month / 12).toFixed(1), totalInterest, payoffOrder });
  };

  const reset = () => {
    setShowResults(false);
    setDebts([
      { name: "Credit Card A", balance: "3000", rate: "24", minPayment: "60" },
      { name: "Credit Card B", balance: "5500", rate: "19", minPayment: "110" },
      { name: "Personal Loan", balance: "8000", rate: "12", minPayment: "180" },
    ]);
    setExtraPayment("200");
    setResults(null);
  };

  const faqs = [
    { question: "What is the Debt Avalanche method?", answer: "The Avalanche method prioritizes paying off the debt with the highest interest rate first. Mathematically, this is the most efficient approach and saves the most money in total interest." },
    { question: "Why is the Avalanche better mathematically?", answer: "High-interest debt costs you more every single month. By eliminating it first, you reduce the total interest accruing across all your debts as quickly as possible." },
    { question: "When should I choose Snowball over Avalanche?", answer: "Choose the Snowball if you need quick psychological wins to stay motivated. If the highest-interest debt also has a very large balance, it can take a long time to pay off, which can feel discouraging." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Debt Avalanche Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Avalanche Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Your Debts (Sorted High-to-Low APR)</h3>
              <div className="space-y-4 mb-6">
                {debts.map((d, i) => (
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-secondary/5 border border-border">
                    <input className="input-calc col-span-2 sm:col-span-1" placeholder="Debt Name" value={d.name} onChange={e => updateDebt(i, "name", e.target.value)} />
                    <InputField id={`bal-${i}`} label="Balance ($)" value={d.balance} onChange={v => updateDebt(i, "balance", v)} />
                    <InputField id={`rate-${i}`} label="APR (%)" value={d.rate} onChange={v => updateDebt(i, "rate", v)} />
                    <InputField id={`min-${i}`} label="Min Payment ($)" value={d.minPayment} onChange={v => updateDebt(i, "minPayment", v)} />
                  </div>
                ))}
              </div>
              <InputField id="extra" label="Extra Monthly Payment ($)" value={extraPayment} onChange={setExtraPayment} />
              <div className="flex gap-3 mt-4">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Avalanche Plan Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Debt-Free In</p>
                    <p className="text-5xl font-black text-foreground">{results.years} yrs</p>
                    <p className="text-sm text-muted-foreground mt-1">({results.months} months)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Payoff Order</p>
                    <p className="text-lg font-bold text-foreground">{results.payoffOrder.join(" → ")}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Estimated Total Interest", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Balance", value: 0, textValue: "$" + debts.reduce((s,d)=>s+parseFloat(d.balance),0).toLocaleString() },
                  { label: "Monthly Attack Amount", value: 0, textValue: "$" + (debts.reduce((s,d)=>s+parseFloat(d.minPayment),0) + parseFloat(extraPayment)).toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Mathematically Optimal Debt Strategy</h2>
              <p>The Avalanche method is the most efficient debt payoff strategy from a pure mathematics perspective. By targeting the highest interest rate first, you minimize the total amount of interest that accumulates across all your debts.</p>
              <h3>How It Saves You Money</h3>
              <p>Interest charges are your enemy. A 24% APR credit card costs you 2% of its balance every single month. By eliminating that debt first, you stop that bleeding as quickly as possible, freeing up resources to tackle the next highest rate.</p>
              <h3>Combining Strategies</h3>
              <p>Some people use a hybrid approach. They might use the Snowball method to quickly eliminate one or two small debts (for a psychological boost), then switch to the Avalanche for the remaining, larger balances where the interest savings are most significant.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-avalanche" />
          <PopularCalculators exclude="/calculator/debt-avalanche-calculator" />
        </div>
      </div>
    </>
  );
};

export default DebtAvalancheCalculator;

