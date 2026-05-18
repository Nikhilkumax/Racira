"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const BurnRateCalculator = () => {
  const [startingCash, setStartingCash] = useState("500000");
  const [monthlyRevenue, setMonthlyRevenue] = useState("20000");
  const [monthlyPayroll, setMonthlyPayroll] = useState("45000");
  const [monthlyRent, setMonthlyRent] = useState("5000");
  const [monthlySoftware, setMonthlySoftware] = useState("2000");
  const [monthlyMarketing, setMonthlyMarketing] = useState("10000");
  const [monthlyOther, setMonthlyOther] = useState("3000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cash = parseFloat(startingCash) || 0;
    const rev = parseFloat(monthlyRevenue) || 0;
    const expenses = (parseFloat(monthlyPayroll) || 0) + 
                     (parseFloat(monthlyRent) || 0) + 
                     (parseFloat(monthlySoftware) || 0) + 
                     (parseFloat(monthlyMarketing) || 0) + 
                     (parseFloat(monthlyOther) || 0);
    
    const grossBurn = expenses;
    const netBurn = expenses - rev;
    const runway = netBurn > 0 ? cash / netBurn : Infinity;

    setResults({
      grossBurn,
      netBurn,
      runway,
      isProfitable: netBurn <= 0
    });
  };

  const reset = () => {
    setShowResults(false);
    setStartingCash("500000");
    setMonthlyRevenue("20000");
    setMonthlyPayroll("45000");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between Gross Burn and Net Burn?", answer: "Gross Burn is the total amount of cash spent on expenses each month, regardless of revenue. Net Burn is the total cash lost each month (Gross Burn minus Revenue). Net Burn is what determines your runway." },
    { question: "How much runway should a startup have?", answer: "Most VCs recommend having 18 to 24 months of runway after a funding round. This gives the company enough time to reach its next milestones and spend 6 months fundraising before cash runs out." },
    { question: "What is 'Default Alive'?", answer: "A startup is 'Default Alive' if its current growth rate and expenses will lead it to profitability before it runs out of cash. If it needs to raise more money just to survive, it is 'Default Dead'." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Burn Rate" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Startup Burn Rate Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your monthly cash burn and runway to understand how much time your business has before needing additional funding or reaching profitability.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Cash & Revenue</h3>
                  <InputField id="startingCash" label="Starting Cash Balance" value={startingCash} onChange={setStartingCash} prefix="$" />
                  <InputField id="monthlyRev" label="Monthly Revenue" value={monthlyRevenue} onChange={setMonthlyRevenue} prefix="$" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Monthly Expenses</h3>
                  <InputField id="payroll" label="Payroll & Benefits" value={monthlyPayroll} onChange={setMonthlyPayroll} prefix="$" />
                  <InputField id="rent" label="Rent / Office" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
                  <InputField id="software" label="Software & Cloud" value={monthlySoftware} onChange={setMonthlySoftware} prefix="$" />
                  <InputField id="marketing" label="Marketing / Ad Spend" value={monthlyMarketing} onChange={setMonthlyMarketing} prefix="$" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Runway</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                {results.isProfitable ? (
                  <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <h2 className="text-xl font-bold text-green-600">Company is Default Alive!</h2>
                    <p className="text-muted-foreground mt-2">Revenue exceeds expenses. Your cash balance is growing by ${Math.abs(results.netBurn).toLocaleString()} per month.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Months of Runway</h2>
                      <p className="text-5xl font-extrabold mb-2">{results.runway.toFixed(1)} Months</p>
                      <p className="text-sm text-muted-foreground">Based on a net burn of <span className="font-bold text-red-500">${Math.round(results.netBurn).toLocaleString()}</span>/mo</p>
                    </div>

                    <ResultDisplay items={[
                      { label: "Monthly Gross Burn", value: results.grossBurn },
                      { label: "Monthly Net Burn", value: results.netBurn, highlight: true },
                      { label: "Current Cash Balance", value: parseFloat(startingCash) },
                      { label: "Total Monthly Expenses", value: results.grossBurn },
                    ]} />
                  </>
                )}
              </div>
            )}

            <article className="prose-finance">
              <h2>Managing Startup Runway</h2>
              <p>Runway is the amount of time a company has before it runs out of cash, assuming income and expenses stay constant. For early-stage startups, runway is the most important metric for survival.</p>
              <h3>How to Extend Runway</h3>
              <p>Extending runway can be achieved in three ways: increasing revenue, decreasing expenses (Gross Burn), or raising more capital. Most startups focus on 'cutting the fat' in non-essential software or marketing spend before considering payroll reductions.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/burn-rate-calculator" />
            <PopularCalculators exclude="/calculator/burn-rate-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder label="Sidebar Ad" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BurnRateCalculator;

