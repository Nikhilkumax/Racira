"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calculator, PieChart } from "lucide-react";

const CreditUtilizationCalculator = () => {
  const [cards, setCards] = useState([
    { name: "Card 1", balance: "1200", limit: "5000" },
    { name: "Card 2", balance: "800", limit: "3000" },
    { name: "Card 3", balance: "0", limit: "10000" },
  ]);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const updateCard = (i: number, field: string, val: string) => {
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const handleCalculate = () => {
    setShowResults(true);
    const totalBalance = cards.reduce((s, c) => s + parseFloat(c.balance || "0"), 0);
    const totalLimit = cards.reduce((s, c) => s + parseFloat(c.limit || "0"), 0);
    const overallUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

    const cardDetails = cards.map(c => ({
      name: c.name,
      util: parseFloat(c.limit) > 0 ? (parseFloat(c.balance) / parseFloat(c.limit)) * 100 : 0,
    }));

    let rating = "Excellent";
    let advice = "Your utilization is ideal. Keep it below 10% for the best impact on your credit score.";
    if (overallUtilization > 30) { rating = "Poor"; advice = "Utilization above 30% significantly hurts your credit score. Pay down balances or request a credit limit increase."; }
    else if (overallUtilization > 10) { rating = "Fair"; advice = "You're in the moderate range. Aim to bring this below 10% for maximum credit score benefit."; }

    setResults({ totalBalance, totalLimit, overallUtilization, cardDetails, rating, advice });
  };

  const reset = () => {
    setShowResults(false);
    setCards([
      { name: "Card 1", balance: "1200", limit: "5000" },
      { name: "Card 2", balance: "800", limit: "3000" },
      { name: "Card 3", balance: "0", limit: "10000" },
    ]);
    setResults(null);
  };

  const faqs = [
    { question: "What is credit utilization?", answer: "Credit utilization is the percentage of your total available revolving credit that you are currently using. It is calculated by dividing your total balances by your total credit limits." },
    { question: "What credit utilization is ideal?", answer: "Most financial experts recommend keeping utilization below 30%, and ideally below 10%, for the best impact on your credit score. Utilization is the second-most important factor in your FICO score, accounting for 30%." },
    { question: "How quickly does utilization affect my credit score?", answer: "Credit utilization changes can affect your score within 30 days, as soon as your card issuer reports your new balance to the credit bureaus. It is one of the fastest factors you can change." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Credit Utilization Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Utilization Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Your Credit Cards</h3>
              <div className="space-y-4 mb-6">
                {cards.map((c, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-secondary/5 border border-border">
                    <input className="input-calc" placeholder="Card Name" value={c.name} onChange={e => updateCard(i, "name", e.target.value)} />
                    <InputField id={`bal-${i}`} label="Balance ($)" value={c.balance} onChange={v => updateCard(i, "balance", v)} />
                    <InputField id={`lim-${i}`} label="Credit Limit ($)" value={c.limit} onChange={v => updateCard(i, "limit", v)} />
                  </div>
                ))}
                <button onClick={() => setCards(prev => [...prev, { name: `Card ${prev.length + 1}`, balance: "0", limit: "1000" }])} className="text-sm text-primary underline">+ Add Card</button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <PieChart className="h-5 w-5" /> Calculate Utilization
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Utilization Report</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className={`p-6 rounded-2xl text-center border ${results.overallUtilization > 30 ? "bg-red-500/10 border-red-500/20" : results.overallUtilization > 10 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Overall Utilization</p>
                    <p className="text-5xl font-black text-foreground">{results.overallUtilization.toFixed(1)}%</p>
                    <p className={`text-sm font-bold mt-1 ${results.overallUtilization > 30 ? "text-red-600" : results.overallUtilization > 10 ? "text-yellow-600" : "text-green-600"}`}>{results.rating}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-border flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground">{results.advice}</p>
                  </div>
                </div>
                <h3 className="font-semibold mb-3">Per-Card Utilization</h3>
                <div className="space-y-3">
                  {results.cardDetails.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/5">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className={`font-bold text-sm px-2 py-1 rounded-full ${c.util > 30 ? "bg-red-500/20 text-red-600" : c.util > 10 ? "bg-yellow-500/20 text-yellow-600" : "bg-green-500/20 text-green-600"}`}>{c.util.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Why Credit Utilization Matters</h2>
              <p>Credit utilization is the second most important factor in your FICO credit score, accounting for approximately 30% of the total. Understanding and managing it can lead to significant improvements in your creditworthiness.</p>
              <h3>The 30% Rule</h3>
              <p>The widely-cited rule is to keep utilization below 30%. However, research shows that those with the highest credit scores typically have utilization below 10%. The ideal target is as low as possible while still using your cards regularly.</p>
              <h3>Two Ways to Reduce Utilization</h3>
              <p>You can lower your utilization by paying down your balances OR by increasing your total credit limit. Requesting a higher limit on an existing card (without a hard pull) can instantly improve your utilization ratio.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-utilization" />
          <PopularCalculators exclude="/calculator/credit-utilization-calculator" />
        </div>
      </div>
    </>
  );
};

export default CreditUtilizationCalculator;

