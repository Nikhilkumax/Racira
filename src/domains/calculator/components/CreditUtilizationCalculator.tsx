"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Calculator, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CreditUtilizationCalculator = () => {
  const [cards, setCards] = useState([
    { name: "Card 1", balance: "1200", limit: "5000" },
    { name: "Card 2", balance: "800", limit: "3000" },
    { name: "Card 3", balance: "0", limit: "10000" },
  ]);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const [targetUtil, setTargetUtil] = useState("10");
  const [mounted, setMounted] = useState(false);

  import("react").then(React => {
    React.useEffect(() => { setMounted(true); }, []);
  });

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

    const target = parseFloat(targetUtil);
    let rating = "Excellent";
    let advice = "Your utilization is ideal. Keep it below 10% for the best impact on your credit score.";
    if (overallUtilization > 30) { rating = "Poor"; advice = "Utilization above 30% significantly hurts your credit score. Pay down balances or request a credit limit increase."; }
    else if (overallUtilization > target) { rating = "Fair"; advice = `You're in the moderate range. Aim to bring this below your target of ${target}% for maximum credit score benefit.`; }

    setResults({ totalBalance, totalLimit, overallUtilization, cardDetails, rating, advice, target });
  };

  const reset = () => {
    setShowResults(false);
    setCards([
      { name: "Card 1", balance: "1200", limit: "5000" },
      { name: "Card 2", balance: "800", limit: "3000" },
      { name: "Card 3", balance: "0", limit: "10000" },
    ]);
    setTargetUtil("10");
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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Utilization Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
                <button type="button" onClick={() => setCards(prev => [...prev, { name: `Card ${prev.length + 1}`, balance: "0", limit: "1000" }])} className="text-sm font-semibold text-primary underline focus:outline-none">+ Add Another Card</button>
              </div>
              
              {/* Advanced Options */}
              <div className="mb-4">
                <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none mb-1">
                  Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
                </button>
                {showAdv && (
                  <div className="mt-2 p-4 rounded-xl bg-secondary/20 border border-border animate-fade-in-up">
                    <InputField id="target" label="Target Utilization (%)" value={targetUtil} onChange={setTargetUtil} tooltip="The maximum utilization percentage you want to aim for. Experts recommend 10% or below." />
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
                <button onClick={() => { reset(); setShowAdv(false); }} className="w-10 shrink-0 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Utilization Report</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className={`p-6 rounded-2xl text-center border ${results.overallUtilization > 30 ? "bg-red-500/10 border-red-500/20" : results.overallUtilization > 10 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Overall Utilization</p>
                    <p className="text-5xl font-black text-foreground">{results.overallUtilization.toFixed(1)}%</p>
                    <p className={`text-sm font-bold mt-1 ${results.overallUtilization > 30 ? "text-red-600" : results.overallUtilization > 10 ? "text-yellow-600" : "text-green-600"}`}>{results.rating}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-border flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">{results.advice}</p>
                    {results.overallUtilization > results.target && (
                      <p className="mt-4 text-sm font-semibold text-foreground">
                        Pay off at least <span className="text-primary">${(results.totalBalance - (results.totalLimit * results.target / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> to reach your target.
                      </p>
                    )}
                  </div>
                </div>

                {mounted && (
                  <div className="card-calculator !p-5 border border-border bg-card mb-6 flex flex-col justify-center items-center">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Credit Limit Usage</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={[
                          { name: "Used Credit", value: results.totalBalance, color: "hsl(var(--destructive))" },
                          { name: "Available Credit", value: Math.max(0, results.totalLimit - results.totalBalance), color: "hsl(var(--primary))" },
                        ]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={2}>
                          {[
                            { name: "Used Credit", value: results.totalBalance, color: "hsl(var(--destructive))" },
                            { name: "Available Credit", value: Math.max(0, results.totalLimit - results.totalBalance), color: "hsl(var(--primary))" },
                          ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <h3 className="font-semibold mb-3">Per-Card Utilization</h3>
                <div className="space-y-3">
                  {results.cardDetails.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/5">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className={`font-bold text-sm px-2 py-1 rounded-full ${c.util > 30 ? "bg-red-500/10 text-red-600 border border-red-500/20" : c.util > 10 ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" : "bg-green-500/10 text-green-600 border border-green-500/20"}`}>{c.util.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
              <div>
                <h2 className="text-2xl font-bold mb-3">Why Credit Utilization Matters</h2>
                <p className="text-muted-foreground leading-relaxed">Credit utilization is the second most important factor in your FICO credit score, accounting for approximately 30% of the total calculation. It measures how much of your available revolving credit you are currently using. Understanding and actively managing this percentage can lead to significant and rapid improvements in your creditworthiness and borrowing power.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">The 30% Rule vs. The 10% Target</h2>
                <p className="text-muted-foreground leading-relaxed">The widely-cited financial rule of thumb is to keep your overall credit utilization below 30% across all your cards. However, empirical research shows that consumers with the highest credit scores (over 800) typically maintain a utilization rate well below 10%. The ideal target is to keep your balances as low as possible while still demonstrating that you use your cards responsibly.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Two Powerful Ways to Reduce Utilization</h2>
                <p className="text-muted-foreground leading-relaxed">You can lower your credit utilization ratio in two ways: by paying down your existing balances or by increasing your total available credit limit. Requesting a credit limit increase on an existing card (often done online without a hard credit pull) can instantly improve your utilization ratio, provided you do not use the newly available credit to increase your spending.</p>
              </div>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-utilization" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Credit Utilization Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Credit Utilization Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Credit Utilization Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Credit Utilization Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Credit Utilization Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/credit-utilization-calculator" />
        </div>
      </div>
    </>
  );
};

export default CreditUtilizationCalculator;

