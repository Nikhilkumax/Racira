"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const HelocCalculator = () => {
  const [limit, setLimit] = useState("50000");
  const [balance, setBalance] = useState("20000");
  const [rate, setRate] = useState("9.5");
  const [drawPeriod, setDrawPeriod] = useState("10");
  const [repaymentTerm, setRepaymentTerm] = useState("15");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const b = parseFloat(balance);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(repaymentTerm) * 12;

    if (b <= 0 || r < 0 || n <= 0) return;

    // During Draw Period (Interest only)
    const drawPayment = b * r;

    // During Repayment (Principal + Interest)
    const repaymentPayment = r > 0 
      ? (b * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : b / n;

    setResults({
      drawPayment,
      repaymentPayment,
      totalInterest: (repaymentPayment * n) - b
    });
  };

  const reset = () => {
    setShowResults(false);
    setLimit("50000"); setBalance("20000"); setRate("9.5");
    setDrawPeriod("10"); setRepaymentTerm("15");
    setResults(null);
  };

  const faqs = [
    { question: "What is a HELOC?", answer: "A Home Equity Line of Credit (HELOC) is a flexible loan that allows you to borrow against your home's equity as needed, up to a certain limit. It works similarly to a credit card but uses your home as collateral." },
    { question: "What is the 'Draw Period'?", answer: "The draw period is the initial phase (usually 5-10 years) during which you can borrow money and typically only need to make interest payments." },
    { question: "What happens during the 'Repayment Period'?", answer: "Once the draw period ends, you can no longer borrow money and must begin paying back both the principal and interest. This often results in a significantly higher monthly payment." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "HELOC Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">HELOC Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate your monthly payments during both the draw and repayment periods of a Home Equity Line of Credit.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="limit" label="Total Credit Limit ($)" value={limit} onChange={setLimit} />
                <InputField id="balance" label="Current Balance Drawn ($)" value={balance} onChange={setBalance} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="draw" label="Draw Period (Years)" value={drawPeriod} onChange={setDrawPeriod} />
                <InputField id="repayment" label="Repayment Term (Years)" value={repaymentTerm} onChange={setRepaymentTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Home className="h-5 w-5" /> Calculate Payments
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Payment Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Interest-Only (Draw)</p>
                    <p className="text-5xl font-black text-foreground">${results.drawPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">P&I (Repayment)</p>
                    <p className="text-3xl font-black text-foreground">${results.repaymentPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest in Repayment", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Credit Available", value: 0, textValue: "$" + (parseFloat(limit) - parseFloat(balance)).toLocaleString() },
                  { label: "Rate Type", value: 0, textValue: "Variable (Typical)" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Flexibility with a HELOC</h2>
              <p>A Home Equity Line of Credit (HELOC) is one of the most flexible ways to tap into your home's equity. Unlike a loan, you don't receive the money all at once; instead, you have a line of credit that you can draw from as needed.</p>
              <h3>The Two Phases of a HELOC</h3>
              <p>A HELOC is split into two distinct periods:</p>
              <ul>
                <li><strong>Draw Period:</strong> Typically the first 10 years. You can borrow money, pay it back, and borrow again. During this phase, most lenders only require you to pay the interest on the amount you've borrowed.</li>
                <li><strong>Repayment Period:</strong> Once the draw period ends (usually another 15-20 years), you can no longer borrow money. Your monthly payment will increase to include both the remaining principal balance and interest.</li>
              </ul>
              <h3>Variable Interest Rates</h3>
              <p>Most HELOCs have variable interest rates tied to a benchmark like the Prime Rate. This means your monthly interest-only payment can change as market interest rates rise or fall. Some lenders offer 'fixed-rate lock' options for specific portions of your balance.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heloc" />
            <PopularCalculators exclude="/calculator/heloc-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default HelocCalculator;

