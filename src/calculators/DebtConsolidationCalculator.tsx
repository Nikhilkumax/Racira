"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CreditCard } from "lucide-react";

interface Debt { name: string; balance: string; rate: string; minPayment: string; }

const DebtConsolidationCalculator = () => {
  const [debts, setDebts] = useState<Debt[]>([
    { name: "Credit Card A", balance: "4000", rate: "22", minPayment: "80" },
    { name: "Credit Card B", balance: "6000", rate: "19", minPayment: "120" },
    { name: "Personal Loan", balance: "5000", rate: "14", minPayment: "115" },
  ]);
  const [consolidationRate, setConsolidationRate] = useState("9");
  const [consolidationTerm, setConsolidationTerm] = useState("48");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const updateDebt = (i: number, field: keyof Debt, val: string) => {
    setDebts(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const handleCalculate = () => {
    setShowResults(true);
    const totalBalance = debts.reduce((s, d) => s + parseFloat(d.balance), 0);
    const totalMinPayment = debts.reduce((s, d) => s + parseFloat(d.minPayment), 0);
    const r = parseFloat(consolidationRate) / 100 / 12;
    const n = parseFloat(consolidationTerm);

    const consolidatedPayment = r > 0
      ? (totalBalance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : totalBalance / n;

    const consolidatedTotalInterest = (consolidatedPayment * n) - totalBalance;
    const currentTotalInterest = debts.reduce((sum, d) => {
      const r2 = parseFloat(d.rate) / 100 / 12;
      const n2 = Math.log(parseFloat(d.minPayment) / (parseFloat(d.minPayment) - parseFloat(d.balance) * r2)) / Math.log(1 + r2);
      return sum + (parseFloat(d.minPayment) * n2) - parseFloat(d.balance);
    }, 0);

    setResults({
      totalBalance,
      consolidatedPayment,
      consolidatedTotalInterest,
      currentTotalInterest,
      monthlySavings: totalMinPayment - consolidatedPayment,
      interestSavings: currentTotalInterest - consolidatedTotalInterest,
    });
  };

  const reset = () => {
    setShowResults(false);
    setDebts([
      { name: "Credit Card A", balance: "4000", rate: "22", minPayment: "80" },
      { name: "Credit Card B", balance: "6000", rate: "19", minPayment: "120" },
      { name: "Personal Loan", balance: "5000", rate: "14", minPayment: "115" },
    ]);
    setConsolidationRate("9");
    setConsolidationTerm("48");
    setResults(null);
  };

  const faqs = [
    { question: "What is debt consolidation?", answer: "Debt consolidation is the process of combining multiple debts into a single loan with one monthly payment, ideally at a lower interest rate." },
    { question: "What types of loans can be consolidated?", answer: "Credit cards, personal loans, medical bills, and other unsecured debts can typically be consolidated. Federal student loans have their own consolidation programs." },
    { question: "Does debt consolidation hurt my credit score?", answer: "Applying for a new loan causes a temporary dip in your credit score (hard inquiry). However, if consolidation reduces your credit utilization and you make consistent payments, it can help your score long-term." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Debt Consolidation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Consolidation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Current Debts</h3>
              <div className="space-y-4 mb-6">
                {debts.map((d, i) => (
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-secondary/5 border border-border">
                    <input className="input-calc col-span-2 sm:col-span-1" placeholder="Debt Name" value={d.name} onChange={e => updateDebt(i, "name", e.target.value)} />
                    <InputField id={`bal-${i}`} label="Balance ($)" value={d.balance} onChange={v => updateDebt(i, "balance", v)} />
                    <InputField id={`rate-${i}`} label="APR (%)" value={d.rate} onChange={v => updateDebt(i, "rate", v)} />
                    <InputField id={`min-${i}`} label="Current Payment ($)" value={d.minPayment} onChange={v => updateDebt(i, "minPayment", v)} />
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <InputField id="crate" label="Consolidation Loan Rate (%)" value={consolidationRate} onChange={setConsolidationRate} />
                <InputField id="cterm" label="Consolidation Term (Months)" value={consolidationTerm} onChange={setConsolidationTerm} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" /> Analyze Consolidation
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Consolidation Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">New Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.consolidatedPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Interest Savings</p>
                    <p className="text-3xl font-black text-foreground">${Math.max(0, results.interestSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Debt Consolidated", value: 0, textValue: "$" + results.totalBalance.toLocaleString() },
                  { label: "Monthly Savings", value: 0, textValue: "$" + results.monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Interest (New Loan)", value: 0, textValue: "$" + results.consolidatedTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>When Does Consolidation Make Sense?</h2>
              <p>Debt consolidation is beneficial when you can secure a consolidation loan at a meaningfully lower interest rate than your current debts. It simplifies your finances into a single monthly payment and can reduce total interest costs significantly.</p>
              <h3>Watch Out for Longer Terms</h3>
              <p>A lower monthly payment can be misleading. If your consolidation loan has a very long term, you might pay more interest in total even at a lower rate. Always compare the total cost of the loan, not just the monthly payment.</p>
              <h3>The Discipline Problem</h3>
              <p>The biggest risk of consolidation is re-accumulating the debts you just paid off. If you consolidate your credit cards and then start using them again, you'll end up with even more total debt. Consolidation works best alongside a committed behavioral change.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-consolidation" />
          <PopularCalculators exclude="/calculator/debt-consolidation-calculator" />
        </div>
      </div>
    </>
  );
};

export default DebtConsolidationCalculator;

