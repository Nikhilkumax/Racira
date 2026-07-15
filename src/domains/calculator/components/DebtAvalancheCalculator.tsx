"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, CreditCard, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  const [lumpSum, setLumpSum] = useState("0");
  const [showAdv, setShowAdv] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);

  import("react").then(React => {
    React.useEffect(() => { setMounted(true); }, []);
  });

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
    
    let initialLumpSum = parseFloat(lumpSum) || 0;
    if (initialLumpSum > 0) {
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].balance > 0) {
          const applied = Math.min(initialLumpSum, sorted[i].balance);
          sorted[i] = { ...sorted[i], balance: sorted[i].balance - applied };
          initialLumpSum -= applied;
          if (initialLumpSum <= 0) break;
        }
      }
    }

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
    setLumpSum("0");
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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Avalanche Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
              
              {/* Advanced Options */}
              <div className="mt-4 mb-2">
                <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none mb-1">
                  Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
                </button>
                {showAdv && (
                  <div className="mt-2 p-4 rounded-xl bg-secondary/20 border border-border animate-fade-in-up">
                    <InputField id="lumpsum" label="One-Time Lump Sum ($)" value={lumpSum} onChange={setLumpSum} tooltip="A one-time payment applied immediately to your highest-interest debt." />
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-2">
                <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
                <button onClick={() => { reset(); setShowAdv(false); }} className="w-10 shrink-0 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
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

                {mounted && (
                  <div className="card-calculator !p-5 border border-border bg-card mb-6 flex flex-col justify-center items-center">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cost Breakdown</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={[
                          { name: "Principal", value: debts.reduce((s,d)=>s+parseFloat(d.balance),0), color: "hsl(var(--primary))" },
                          { name: "Interest", value: results.totalInterest, color: "hsl(var(--destructive))" },
                        ]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={2}>
                          {[
                            { name: "Principal", value: debts.reduce((s,d)=>s+parseFloat(d.balance),0), color: "hsl(var(--primary))" },
                            { name: "Interest", value: results.totalInterest, color: "hsl(var(--destructive))" },
                          ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <ResultDisplay items={[
                  { label: "Estimated Total Interest", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Balance", value: 0, textValue: "$" + debts.reduce((s,d)=>s+parseFloat(d.balance),0).toLocaleString() },
                  { label: "Monthly Attack Amount", value: 0, textValue: "$" + (debts.reduce((s,d)=>s+parseFloat(d.minPayment),0) + parseFloat(extraPayment)).toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
              <div>
                <h2 className="text-2xl font-bold mb-3">The Mathematically Optimal Debt Strategy</h2>
                <p className="text-muted-foreground leading-relaxed">The Debt Avalanche method is the most efficient debt payoff strategy from a pure mathematics perspective. By specifically targeting the debt with the highest interest rate first (regardless of the balance size), you systematically minimize the total amount of interest that accumulates across all your accounts. This ensures that the maximum possible amount of your payments goes directly toward reducing principal.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">How the Avalanche Saves You Money</h2>
                <p className="text-muted-foreground leading-relaxed">High-interest debt is extraordinarily expensive. A 24% APR credit card costs you approximately 2% of its balance in new interest charges every single month. By aggressively eliminating that most expensive debt first, you stop the financial bleeding as quickly as possible. Once the highest-interest debt is gone, you "avalanche" its payment amount into the debt with the next highest rate, creating a powerful compounding effect of debt reduction.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Combining Avalanche and Snowball Strategies</h2>
                <p className="text-muted-foreground leading-relaxed">While the Avalanche method is mathematically superior, personal finance is deeply psychological. Some individuals successfully use a hybrid approach to maximize both motivation and savings. They might initially use the Debt Snowball method to quickly eliminate one or two small nuisance debts (providing a necessary psychological boost), and then switch to the Debt Avalanche for the remaining larger balances where the interest savings become highly significant over time.</p>
              </div>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-avalanche" />
          <PopularCalculators exclude="/calculator/debt-avalanche-calculator" />
        </div>
      </div>
    </>
  );
};

export default DebtAvalancheCalculator;

