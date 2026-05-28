"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Target } from "lucide-react";

const FireCalculator = () => {
  const [annualExpenses, setAnnualExpenses] = useState("60000");
  const [currentSavings, setCurrentSavings] = useState("100000");
  const [annualSavings, setAnnualSavings] = useState("30000");
  const [returnRate, setReturnRate] = useState("7");
  const [withdrawalRate, setWithdrawalRate] = useState("4");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const expenses = parseFloat(annualExpenses);
    const savings = parseFloat(currentSavings);
    const annSavings = parseFloat(annualSavings);
    const r = parseFloat(returnRate) / 100;
    const wr = parseFloat(withdrawalRate) / 100;

    const fireNumber = expenses / wr;
    const needed = fireNumber - savings;

    // Years to reach FIRE using FV formula
    let years = 0;
    let portfolio = savings;
    while (portfolio < fireNumber && years < 100) {
      portfolio = portfolio * (1 + r) + annSavings;
      years++;
    }

    const savingsRate = (annSavings / (annSavings + expenses)) * 100;

    setResults({ fireNumber, years, savingsRate, portfolio: Math.min(portfolio, fireNumber * 2) });
  };

  const reset = () => {
    setShowResults(false);
    setAnnualExpenses("60000"); setCurrentSavings("100000");
    setAnnualSavings("30000"); setReturnRate("7"); setWithdrawalRate("4");
    setResults(null);
  };

  const faqs = [
    { question: "What is FIRE?", answer: "FIRE stands for Financial Independence, Retire Early. The movement is built around saving and investing aggressively — often 50-75% of income — to build a portfolio large enough to fund living expenses indefinitely." },
    { question: "What is the 4% rule?", answer: "The 4% rule, based on the Trinity Study, suggests that a portfolio diversified between stocks and bonds can sustain a 4% annual withdrawal rate (adjusted for inflation) for at least 30 years." },
    { question: "What are different types of FIRE?", answer: "LeanFIRE targets minimal spending (under $40k/yr); regular FIRE targets $60-80k/yr; FatFIRE targets $100k+/yr; BaristaFIRE involves partial retirement with part-time income." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "FIRE Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FIRE Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your Financial Independence number and how many years until you can Retire Early.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="exp" label="Annual Expenses ($)" value={annualExpenses} onChange={setAnnualExpenses} />
                <InputField id="sav" label="Current Savings ($)" value={currentSavings} onChange={setCurrentSavings} />
                <InputField id="annsav" label="Annual Savings ($)" value={annualSavings} onChange={setAnnualSavings} />
                <InputField id="ret" label="Expected Return (%)" value={returnRate} onChange={setReturnRate} />
                <InputField id="wr" label="Safe Withdrawal Rate (%)" value={withdrawalRate} onChange={setWithdrawalRate} tooltip="4% is the classic rule." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Target className="h-5 w-5" /> Calculate FIRE</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Your FIRE Plan</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Your FIRE Number</p>
                    <p className="text-5xl font-black text-foreground">${(results.fireNumber / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Years to FIRE</p>
                    <p className="text-3xl font-black text-foreground">{results.years} years</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Your Savings Rate", value: 0, textValue: results.savingsRate.toFixed(1) + "%" },
                  { label: "Annual Withdrawal at FIRE", value: 0, textValue: "$" + parseFloat(annualExpenses).toLocaleString() },
                  { label: "FIRE Year (est.)", value: 0, textValue: (new Date().getFullYear() + results.years).toString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Math of Financial Independence</h2>
              <p>The path to FIRE is straightforward mathematically: save a large portion of your income, invest it wisely, and eventually your portfolio will grow large enough to fund your lifestyle indefinitely.</p>
              <h3>Savings Rate is Everything</h3>
              <p>The single most powerful lever in FIRE math is your savings rate. Someone saving 10% may work for 40+ years. Someone saving 50% can retire in ~17 years. Someone saving 75% can reach FIRE in under 10 years.</p>
              <h3>The 4% Rule Foundation</h3>
              <p>The 4% rule comes from the Trinity Study (1998), which found that a 50/50 stock/bond portfolio survived 30-year retirement periods 95% of the time with a 4% initial withdrawal rate. Early retirees often use 3-3.5% for greater safety over 40-50 year horizons.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fire" />
          <PopularCalculators exclude="/calculator/fire-calculator" />
        </div>
      </div>
    </>
  );
};
export default FireCalculator;

