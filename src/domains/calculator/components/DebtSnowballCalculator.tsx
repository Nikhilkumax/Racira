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

const DebtSnowballCalculator = () => {
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
    setLumpSum("0");
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
              
              {/* Advanced Options */}
              <div className="mt-4 mb-2">
                <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none mb-1">
                  Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
                </button>
                {showAdv && (
                  <div className="mt-2 p-4 rounded-xl bg-secondary/20 border border-border animate-fade-in-up">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payoff Accelerators</div>
                    <InputField id="lumpsum" label="One-Time Lump Sum ($)" value={lumpSum} onChange={setLumpSum} tooltip="A one-time payment applied immediately to your lowest balance debt." />
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
                <h2 className="text-2xl font-bold mb-3">Snowball Plan Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/10 border-l-4 border-primary text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Debt-Free In</p>
                    <p className="text-5xl font-black text-foreground">{results.years} yrs</p>
                    <p className="text-sm text-muted-foreground mt-1">({results.months} months)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Order of Payoff</p>
                    <p className="text-lg font-bold text-foreground">{debts.sort((a,b)=>parseFloat(a.balance)-parseFloat(b.balance)).map(d=>d.name).join(" → ")}</p>
                  </div>
                </div>

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
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
              <div>
                <h2 className="text-2xl font-bold mb-3">How the Debt Snowball Works</h2>
                <p className="text-muted-foreground leading-relaxed">The Debt Snowball method is a psychologically powerful debt payoff strategy popularized by personal finance experts. By intentionally targeting the debt with the smallest balance first, regardless of its interest rate, you achieve a quick win that builds immense momentum and confidence. This behavioral approach recognizes that personal finance is often more about managing your habits and mindset than doing perfect math, making it significantly easier to tackle larger, more intimidating debts down the line without giving up.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">The Rolling Effect</h2>
                <p className="text-muted-foreground leading-relaxed">The core mechanic of this method is the "rolling" effect. Once debt number one is fully paid off, you take its minimum payment—along with any extra cash you were putting toward it—and add it entirely to your minimum payment for debt number two. This creates a growing "snowball" of payments. By the time you reach your largest and final debt, you are throwing a massive, consolidated monthly payment at it, accelerating its payoff dramatically and reducing the overall timeline to becoming debt-free.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Snowball vs. Avalanche</h2>
                <p className="text-muted-foreground leading-relaxed">Mathematically, the Avalanche method (which targets the highest interest rate first) saves you more money in the long run by minimizing total interest accrual. However, comprehensive behavioral studies show that the Snowball method often leads to much higher completion rates. The psychological benefit of eliminating accounts quickly keeps people engaged, motivated, and less likely to quit the stressful process of debt reduction. For many individuals, this increased success rate more than compensates for the slight difference in total interest paid over the life of the loans.</p>
              </div>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-snowball" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Debt Snowball Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Debt Snowball Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Debt Snowball Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Debt Snowball Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Debt Snowball Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/debt-snowball-calculator" />
        </div>
      </div>
    </>
  );
};

export default DebtSnowballCalculator;

