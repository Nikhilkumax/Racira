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

const DebtSnowballCalculator = () => {
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
    // Snowball: sort by balance ascending
    let sorted = debts
      .map(d => ({
        name: d.name,
        balance: parseFloat(d.balance),
        rate: parseFloat(d.rate) / 100 / 12,
        minPayment: parseFloat(d.minPayment),
      }))
      .filter(d => d.balance > 0)
      .sort((a, b) => a.balance - b.balance);

    let month = 0;
    let totalInterest = 0;
    let availableExtra = extra;

    while (sorted.some(d => d.balance > 0) && month < 600) {
      month++;
      // Apply interest
      sorted = sorted.map(d => ({ ...d, balance: d.balance + d.balance * d.rate }));
      // Apply minimums
      sorted = sorted.map(d => {
        const payment = Math.min(d.minPayment, d.balance);
        totalInterest += d.balance * d.rate / (1 + d.rate); // approximate
        return { ...d, balance: Math.max(0, d.balance - payment) };
      });
      // Apply extra to smallest balance
      let extraLeft = availableExtra;
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].balance > 0) {
          const applied = Math.min(extraLeft, sorted[i].balance);
          sorted[i] = { ...sorted[i], balance: sorted[i].balance - applied };
          extraLeft -= applied;
          break;
        }
      }
    }

    setResults({ months: month, years: (month / 12).toFixed(1), totalInterest });
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
    { question: "What is the Debt Snowball method?", answer: "The Snowball method, popularized by Dave Ramsey, has you pay off debts smallest balance first. When one is cleared, you 'roll' that payment to the next smallest, creating a snowball effect." },
    { question: "Does the Snowball or Avalanche method save more money?", answer: "The Avalanche method (highest interest first) saves more in total interest. However, the Snowball method provides quicker psychological wins by eliminating accounts faster, which many find more motivating." },
    { question: "How does 'rolling' payments work?", answer: "Once you pay off a debt, you take that freed-up minimum payment and add it to your payment for the next debt. Over time, your attack amount grows larger and larger — like a snowball rolling downhill." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Debt Snowball Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Snowball Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Your Debts</h3>
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
                <h2 className="text-2xl font-bold mb-3">Snowball Plan Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Debt-Free In</p>
                    <p className="text-5xl font-black text-foreground">{results.years} yrs</p>
                    <p className="text-sm text-muted-foreground mt-1">({results.months} months)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Order of Payoff</p>
                    <p className="text-lg font-bold text-foreground">{debts.sort((a,b)=>parseFloat(a.balance)-parseFloat(b.balance)).map(d=>d.name).join(" → ")}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Debts", value: 0, textValue: debts.length + " accounts" },
                  { label: "Total Balance", value: 0, textValue: "$" + debts.reduce((s,d)=>s+parseFloat(d.balance),0).toLocaleString() },
                  { label: "Monthly Attack Amount", value: 0, textValue: "$" + (debts.reduce((s,d)=>s+parseFloat(d.minPayment),0) + parseFloat(extraPayment)).toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>How the Debt Snowball Works</h2>
              <p>The Snowball method is a psychologically powerful debt payoff strategy. By targeting the smallest debt first, you get a quick win that builds momentum and confidence for tackling larger debts.</p>
              <h3>The Rolling Effect</h3>
              <p>Once debt #1 is paid off, you take its minimum payment and add it to your payment for debt #2. This creates a growing "snowball" of payments. By the time you hit your largest debt, you're throwing a massive payment at it every month.</p>
              <h3>Snowball vs. Avalanche</h3>
              <p>Mathematically, the Avalanche method (targeting the highest interest rate first) saves more money. But studies show that the Snowball method leads to higher completion rates because the psychological benefit of eliminating accounts quickly keeps people engaged and motivated.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-snowball" />
          <PopularCalculators exclude="/calculator/debt-snowball-calculator" />
        </div>
      </div>
    </>
  );
};

export default DebtSnowballCalculator;

