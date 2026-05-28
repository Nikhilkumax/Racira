"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw } from "lucide-react";

const BudgetCalculator = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("5000");
  const [housing, setHousing] = useState("1500");
  const [utilities, setUtilities] = useState("200");
  const [groceries, setGroceries] = useState("400");
  const [transportation, setTransportation] = useState("300");
  const [entertainment, setEntertainment] = useState("200");
  const [shopping, setShopping] = useState("150");
  const [savings, setSavings] = useState("500");
  const [debt, setDebt] = useState("300");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(monthlyIncome) || 0;
    const needs = (parseFloat(housing) || 0) + (parseFloat(utilities) || 0) + (parseFloat(groceries) || 0) + (parseFloat(transportation) || 0);
    const wants = (parseFloat(entertainment) || 0) + (parseFloat(shopping) || 0);
    const financial = (parseFloat(savings) || 0) + (parseFloat(debt) || 0);
    
    const totalExpenses = needs + wants + financial;
    const remaining = income - totalExpenses;

    setResults({
      needs,
      wants,
      financial,
      totalExpenses,
      remaining,
      needsPct: (needs / income) * 100,
      wantsPct: (wants / income) * 100,
      financialPct: (financial / income) * 100,
    });
  };

  const reset = () => {
    setShowResults(false);
    setMonthlyIncome("5000");
    setHousing("1500");
    setResults(null);
  };

  const faqs = [
    { question: "What is the 50/30/20 budget rule?", answer: "The 50/30/20 rule is a popular budgeting method where 50% of your after-tax income goes to Needs (housing, food, utilities), 30% to Wants (dining out, entertainment), and 20% to Savings and Debt repayment." },
    { question: "Is budgeting necessary if I have high income?", answer: "Yes! High earners can still fall into 'lifestyle creep' where expenses rise to match income. Budgeting ensures that your money is working toward your long-term goals like retirement or house purchase rather than just disappearing on impulse buys." },
    { question: "How often should I review my budget?", answer: "A monthly review is ideal. This allows you to adjust for variable expenses (like higher heating bills in winter) and ensures you are staying on track with your annual goals." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Budget Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Budget Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Take control of your finances by tracking your income and expenses. See how your spending aligns with the 50/30/20 rule.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Income & Needs</h3>
                  <InputField id="monthlyIncome" label="Monthly Net Income" value={monthlyIncome} onChange={setMonthlyIncome} prefix="$" />
                  <InputField id="housing" label="Rent / Mortgage" value={housing} onChange={setHousing} prefix="$" />
                  <InputField id="utilities" label="Utilities & Phone" value={utilities} onChange={setUtilities} prefix="$" />
                  <InputField id="groceries" label="Groceries" value={groceries} onChange={setGroceries} prefix="$" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Wants & Savings</h3>
                  <InputField id="entertainment" label="Entertainment" value={entertainment} onChange={setEntertainment} prefix="$" />
                  <InputField id="shopping" label="Shopping" value={shopping} onChange={setShopping} prefix="$" />
                  <InputField id="savings" label="Savings / Investing" value={savings} onChange={setSavings} prefix="$" />
                  <InputField id="debt" label="Debt Repayment" value={debt} onChange={setDebt} prefix="$" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Generate Budget</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator flex items-center justify-center">
                  <PieChart segments={[
                    { label: "Needs", value: results.needs, color: "#6366f1" },
                    { label: "Wants", value: results.wants, color: "#f59e0b" },
                    { label: "Savings/Debt", value: results.financial, color: "#22c55e" },
                    { label: "Remaining", value: Math.max(0, results.remaining), color: "#94a3b8" }
                  ]} />
                </div>
                <div className="card-calculator">
                  <h3 className="font-bold mb-4">Budget Breakdown</h3>
                  <ResultDisplay items={[
                    { label: "Needs (Target 50%)", value: results.needs, textValue: `${results.needsPct.toFixed(1)}%` },
                    { label: "Wants (Target 30%)", value: results.wants, textValue: `${results.wantsPct.toFixed(1)}%` },
                    { label: "Financial (Target 20%)", value: results.financial, textValue: `${results.financialPct.toFixed(1)}%` },
                    { label: "Left Over", value: results.remaining, highlight: results.remaining >= 0 },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance">
              <h2>Mastering Your Monthly Budget</h2>
              <p>Budgeting is the most fundamental skill in personal finance. It's not about restricting your spending, but rather about ensuring that your spending aligns with your values and long-term goals.</p>
              <h3>The 50/30/20 Framework</h3>
              <p>This simple framework helps you balance your current needs with your future security. By aiming to keep your fixed costs (Needs) under 50% of your income, you leave enough "breathing room" to enjoy your life (Wants) and build wealth (Savings).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/budget-calculator" />
          <PopularCalculators exclude="/calculator/budget-calculator" />
        </div>
      </div>
    </>
  );
};

export default BudgetCalculator;

